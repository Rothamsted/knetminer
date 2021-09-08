package rres.knetminer.datasource.ondexlocal.service.utils;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValue;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.ToIntFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptAccession;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.searchable.LuceneConcept;
import net.sourceforge.ondex.core.searchable.LuceneQueryBuilder;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;
import rres.knetminer.datasource.ondexlocal.service.DataService;
import rres.knetminer.datasource.ondexlocal.service.SearchService;
import rres.knetminer.datasource.ondexlocal.service.SemanticMotifService;

/**
 * 
 * Miscellanea utilities to manipulate the OXL graph coming from the {@link DataService}.
 * 
 * <b>Please, note the criteria to include things in here:</b> it should contain functions that
 * do simple access to the graph, without requiring complex tasks like index-based searches (use the 
 * {@link SearchService search service} for that), or being about more core functionality like loading data and 
 * preparing support structures like semantic motifs (use {@link SemanticMotifService} for that). In general, 
 * don't mess up with these components, think carefully where to add things and adopt best practices like
 * favouring re-usability.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>6 Oct 2020</dd></dl>
 *
 */
public class KGUtils
{
	private final static Logger log = LogManager.getLogger ( KGUtils.class );
	
	private KGUtils (){}
	
  /**
   * Filters for ONDEXConcepts with the given accessions in the OndexGraph. Assumes a keyword-oriented syntax
   * for the accessions, eg, characters like brackets are removed.
   * 
   * This makes use of {@link LuceneQueryBuilder#searchByTypeAndAccession(String, String, boolean)}
   * and {@link LuceneQueryBuilder#searchByTypeAndName(String, String, boolean)}, which means each accession can 
   * have Lucene operator ('*', '?', '-')
   *
   * Was named searchGenesByAccessionKeywords
   */
	public static Set<ONDEXConcept> filterGenesByAccessionKeywords (
		DataService dataService, SearchService searchService, List<String> accessions
	)
	{
		if ( accessions.size () == 0 ) return new HashSet<>();
				
		var graph = dataService.getGraph ();
		
		// TODO: probably it's not needed anymore
		Set<String> normAccs = accessions.stream ()
		.map ( acc -> 
			acc.replaceAll ( "^[\"()]+", "" ) // remove initial \" \( or \)
			.replaceAll ( "[\"()]+$", "" ) // remove the same characters as ending chars
			.toUpperCase () 
		).collect ( Collectors.toSet () );			
				
		AttributeName attTAXID = ONDEXGraphUtils.getAttributeName ( graph, "TAXID" ); 
		
		Stream<Set<ONDEXConcept>> accStrm = normAccs.stream ()
		.map ( acc -> searchService.searchConceptByTypeAndAccession ( "Gene", acc, false ) );

		Stream<Set<ONDEXConcept>> nameStrm = normAccs.stream ()
		.map ( acc -> searchService.searchConceptByTypeAndName ( "Gene", acc, false ) );
		
		
		Set<ONDEXConcept> result = Stream.concat ( accStrm, nameStrm )
		.flatMap ( Set::parallelStream )
		.filter ( gene -> {
      String thisTaxId = getAttrValueAsString ( gene, attTAXID, false );
      return dataService.containsTaxId ( thisTaxId );
		})
		// Components like the semantic motif traverser need the original internal IDs.
		.map ( gene -> gene instanceof LuceneConcept ? ((LuceneConcept) gene).getParent () : gene )
		.collect ( Collectors.toSet () );
		
		return result;
	}
	
	
  /**
   * Searches for genes within genomic regions (QTLs), using the special format in the parameter.
   *
   */
	public static Set<ONDEXConcept> fetchQTLs ( ONDEXGraph graph, List<String> taxIds, List<String> qtlsStr )
	{
		log.info ( "searching QTL against: {}", qtlsStr );
		Set<ONDEXConcept> concepts = new HashSet<> ();

		// convert List<String> qtlStr to List<QTL> qtls
		List<QTL> qtls = QTL.fromStringList ( qtlsStr );

		for ( QTL qtl : qtls )
		{
			try
			{
				String chrQTL = qtl.getChromosome ();
				int startQTL = qtl.getStart ();
				int endQTL = qtl.getEnd ();
				log.info ( "user QTL (chr, start, end): " + chrQTL + " , " + startQTL + " , " + endQTL );
				// swap start with stop if start larger than stop
				if ( startQTL > endQTL )
				{
					int tmp = startQTL;
					startQTL = endQTL;
					endQTL = tmp;
				}

				var gmeta = graph.getMetaData ();
				ConceptClass ccGene = gmeta.getConceptClass ( "Gene" );

				Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass ( ccGene );

				log.info ( "searchQTL, found {} matching gene(s)", genes.size () );

				for ( ONDEXConcept gene : genes )
				{
					GeneHelper geneHelper = new GeneHelper ( graph, gene );

					String geneChr = geneHelper.getChromosome ();
					if ( geneChr == null ) continue;
					if ( !chrQTL.equals ( geneChr )) continue;

					int geneStart = geneHelper.getBeginBP ( true );
					if ( geneStart == 0 ) continue;

					int geneEnd = geneHelper.getEndBP ( true );
					if ( geneEnd == 0 ) continue;

					if ( ! ( geneStart >= startQTL && geneEnd <= endQTL ) ) continue;
					
					if ( !containsTaxId ( taxIds, geneHelper.getTaxID () ) ) continue;

					concepts.add ( gene );
				}
			}
			catch ( Exception e )
			{
				// TODO: the user doesn't get any of this!
				log.error ( "Not valid qtl: " + e.getMessage (), e );
			}
		}
		return concepts;
	}

	/**
	 * Gets all the concepts in the graph of type QTL and map them to a collection of 
	 * {@link QTL} helpers.
	 * 
	 */
  public static Set<QTL> getQTLs ( ONDEXGraph graph )
  {
    log.info ( "No Traits found: all QTLS will be shown..." );

    Set<QTL> results = new HashSet<> ();
    
    var gmeta = graph.getMetaData ();
    ConceptClass ccQTL = gmeta.getConceptClass ( "QTL" );
    
    // results = graph.getConceptsOfConceptClass(ccQTL);
    for (ONDEXConcept qtl : graph.getConceptsOfConceptClass(ccQTL))
    {
      String label = ONDEXGraphUtils.getConceptName ( qtl );
      String type = qtl.getOfType().getId();

      String chrName = getAttrValue ( graph, qtl, "Chromosome" );
      int start = (Integer) getAttrValue ( graph, qtl, "BEGIN" );
      int end = (Integer) getAttrValue ( graph, qtl, "END" );
      
      String trait = Optional.ofNullable ( getAttrValueAsString ( graph, qtl, "Trait", false ) )
      	.orElse ( "" );
      
      String taxId = Optional.ofNullable ( getAttrValueAsString ( graph, qtl, "TAXID", false ) )
      	.orElse ( "" );
      
      results.add ( new QTL ( chrName, type, start, end, label, "", 1.0f, trait, taxId ) );
    }
    return results;    	
  }	
  
	
	/** 
	 * A simple facility that checks if taxId is in the reference.
	 * Before comparing, it checks that taxId isn't null and return false if it is.
	 * 
	 * Such check is necessary when {@link DataService#getTaxIds()} is used, because that
	 * method returns a collection that doesn't access nulls. So, this method here is a facility
	 * to work with that.
	 */
  public static boolean containsTaxId ( List<String> reftaxIds, String taxId )
  {
  	if ( taxId == null ) return false;
  	return reftaxIds.contains ( taxId );
  }

	/**
	 * 
	 * Returns the best label for a concept, considering several criteria, including the concept type (eg,
	 * if it's a gene or not). 
	 * 
	 * TODO: Move these labelling methods into Ondex.
	 * 
	 */
	public static String getBestConceptLabel ( ONDEXConcept c )
	{
		String typeId = c.getOfType ().getId ();
		
		String result = getBestName ( c.getConceptNames (), false ); // preferred name
		
		if ( result.isEmpty () ) result = getBestName ( c ); // all names
		
		if ( result.isEmpty () )
		{
			// non-ambiguous accession, discriminate by type
			result = ArrayUtils.contains ( new String [] { "Gene", "Protein" }, typeId )
				? getBestGeneAccession ( c.getConceptAccessions (), false )
				: getBestAccession ( c.getConceptAccessions (), false, null );
		}
			
		if ( result.isEmpty () )
		{
			// all accessions, discriminate by type
			result = ArrayUtils.contains ( new String [] { "Gene", "Protein" }, typeId )
				? getBestGeneAccession ( c )
				: getBestAccession ( c );
		}

		if ( result.isEmpty () ) result = StringUtils.trimToEmpty ( c.getPID () );

		return StringUtils.abbreviate ( result, 30 );
	}

	
	/**
	 * This is a low-level implementation of {@link #getBestAccession(Set, boolean)}, probably you don't
	 * want to use it, use the public versions instead.
	 * 
	 * Finds the best accession in a set. It mainly applies the criteria of shortest and lexicographically
	 * first value, making exceptions for a few special cases.
	 * 
	 * If the input is null or empty, returns ""
	 * 
	 * @param includeAmbiguous, if false, considers only accessions with {@link ConceptAccession#isAmbiguous()} not
	 * set (might return "" if none available), else ignores ambiguity and considers all the input.
	 * 
	 * @param priorityCriteria, if non-null, it gives priority to the accessions that have the lowest values for 
	 * this function. This is a low-level feature, use the other more abstract labelling criteria if you're in 
	 * doubt about it.
	 *  
	 */
	private static String getBestAccession (
		Set<ConceptAccession> accs, boolean includeAmbiguous, ToIntFunction<ConceptAccession> priorityCriteria 
	)
	{
		if ( accs == null || accs.size () == 0 ) return "";
				
		var accsStrm = accs.parallelStream ();
		if ( !includeAmbiguous ) accsStrm = accsStrm.filter ( acc -> !acc.isAmbiguous () );

		// Our own comparisons
		Comparator<String> accStrCmp = (acc1, acc2) -> specialAccessionCompare ( acc1, acc2 );
		
		// In all the other cases, first compare the lengths and then the string values.
		accStrCmp = accStrCmp.thenComparingInt ( String::length )
			.thenComparing ( Comparator.naturalOrder () );
		
		// Then, prefix it with the priority criteria and string trimming
		Comparator<ConceptAccession> accCmp = Comparator.comparing ( 
			(ConceptAccession acc) -> acc.getAccession ().trim(), accStrCmp
		);
		if ( priorityCriteria != null ) 
			accCmp = Comparator.comparingInt ( priorityCriteria ).thenComparing ( accCmp );
		
		return accsStrm
		.sorted ( accCmp )
		.findFirst ()
		// Unfortunately, we have to do a final re-map, in order to be able to apply whole-ConceptAccession
		// comparisons
		.map ( ConceptAccession::getAccession )
		.map ( String::trim )
		.orElse ( "" );
	}
		
	/**
	 * Uses special comparison/priority between accession strings.
	 * 
	 * It assumes, trimmed accessions. This is always included in the {@link #getBestAccession(Set, boolean, ToIntFunction)}
	 * comparisons.
	 */
	private static int specialAccessionCompare ( String acc1, String acc2 )
	{
		// This is to privilege maize genes of type EB (#593)
		final var zmebRe = "^ZM.+EB[0-9].*";
		final var zmdRe = "^ZM.+D[0-9].*"; 
		if ( acc1.matches ( zmebRe ) && acc2.matches ( zmdRe  ) ) return -1;
		if ( acc2.matches ( zmebRe ) && acc1.matches ( zmdRe ) ) return 1;
		return 0;
	}
	
	/**
	 * This is used for the gene accession field in certain views, it gives priority to ENSEMBL and other
	 * sources.   
	 */
	private static int getKnownSourcesAccessionPriority ( ConceptAccession acc )
	{
		String accStr = acc.getAccession ();
		String accSrcId = acc.getElementOf ().getId ();
		if ( accSrcId.startsWith ( "ENSEMBL" ) ) return -1;
		if ( "PHYTOZOME".equals ( accSrcId ) ) return -1;
		if ( "TAIR".equals ( accSrcId ) && accStr.startsWith ( "AT" ) && accStr.indexOf ( "." ) == -1 ) return -1;
		return 0;
	}

	/**
	 *  Yields the best accession in the set.
	 *  
	 *  You should use this for generic concepts and end-user visualisations of accessions. 
	 *  For generic labelling, which is also based on names, use {@link #getBestConceptLabel(ONDEXConcept)}.
	 */
	public static String getBestAccession ( Set<ConceptAccession> accs )
	{
		return getBestAccession ( accs, true, null );
	}

	/**
	 * Just a wrapper, concept must be non-null
	 */
	public static String getBestAccession ( ONDEXConcept concept )
	{
		return getBestAccession ( concept.getConceptAccessions () );
	}
	
	/**
	 * Best accession selector for genes.
	 * 
	 * This uses {@link #getKnownSourcesAccessionPriority(ConceptAccession)}, which is used in certain views
	 * for the accession field.
	 */
	public static String getBestGeneAccession ( ONDEXConcept geneConcept )
	{
		return getBestGeneAccession ( geneConcept.getConceptAccessions (), true );
	}

	private static String getBestGeneAccession ( Set<ConceptAccession> geneAccs, boolean includeAmbiguous )
	{
		return getBestAccession ( 
			geneAccs, includeAmbiguous, KGUtils::getKnownSourcesAccessionPriority
		);
	}
	
	
	/**
	 * Selects the best name for a set, giving priority to the shortest first and then 
	 * to the canonical string order.
	 * 
	 * @param includeAltNames if not set, consider the {@link ConceptName#isPreferred() preferred name} only. This is 
	 * supposed to be unique, but data are often dirty, hence we don't trust that and we still prioritise 
	 * possible multiple preferred names.
	 * 
	 * This method version is for internal use in this class, typically, you don't want to ignore non-preferred ones, 
	 * so use {@link #getBestName(Set)} instead, which is public.
	 * 
	 */
	private static String getBestName ( Set<ConceptName> cns, boolean includeAltNames ) 
	{
		var cnsStrm = cns.parallelStream ();
		if ( !includeAltNames ) cnsStrm = cnsStrm.filter ( ConceptName::isPreferred );
		
		return cnsStrm
		.map ( ConceptName::getName )
		.map ( String::trim )
		.sorted ( 
			Comparator.comparing ( String::length )
			.thenComparing ( Comparator.naturalOrder () ) 
		)
		.findFirst ()
		.orElse ( "" );
	}
	
	/**
	 * Defaults to including all names.
	 */
	public static String getBestName ( Set<ConceptName> cns ) 
	{
		return getBestName ( cns, true );
	}

	/**
	 * Just a wrapper, the concept is assumed to be non-null.
	 */
	public static String getBestName ( ONDEXConcept concept )
	{
		return getBestName ( concept.getConceptNames () );
	}

}
