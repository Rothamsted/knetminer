package rres.knetminer.datasource.ondexlocal.service.utils;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValue;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
	 * Returns the best name for certain molecular biology entities, like Gene, Protein, falls back to a default
	 * label in the other cases. 
	 * 
	 */
	public static String getMolBioDefaultLabel ( ONDEXConcept c )
	{
		String type = c.getOfType ().getId ();
		String bestAcc = StringUtils.trimToEmpty ( getBestAccession ( c.getConceptAccessions (), false ) );
		String bestName = StringUtils.trimToEmpty ( getShortestPreferedName ( c.getConceptNames () ) );
	
		String result = "";
		
		if ( "Gene".equals ( type ) || "Protein".equals ( type ) )
		{
			if ( bestAcc.isEmpty () ) result = bestName;
			else result = bestAcc.length () < bestName.length () ? bestAcc : bestName;
		}
		else
			result = !bestName.isEmpty () ? bestName : bestAcc;
	
		return StringUtils.abbreviate ( result, 30 );
	}

	
	/**
	 * Finds the best accession in a set. It mainly applies the criteria of shortest and lexicographically
	 * first value, making exceptions for a few special cases.
	 * 
	 * If the input is null or empty, returns ""
	 * If includeAmbiguous is false, considers only accessions with {@link ConceptAccession#isAmbiguous()} not
	 * set (might return "" if none available), else ignores ambiguity and considers all the input.
	 *  
	 */
	public static String getBestAccession ( Set<ConceptAccession> accs, boolean includeAmbiguous )
	{
		if ( accs == null || accs.size () == 0 ) return "";
				
		var accsStrm = accs.parallelStream ();
		if ( !includeAmbiguous ) accsStrm = accsStrm.filter ( acc -> !acc.isAmbiguous () );
		
		// This is to privilege maize genes of type EB (#593)
		Comparator<String> accCmp = (acc1, acc2) ->	
		{
			final var zmebRe = "^ZM.+EB[0-9].*";
			final var zmdRe = "^ZM.+D[0-9].*"; 
			if ( acc1.matches ( zmebRe ) && acc2.matches ( zmdRe  ) ) return -1;
			if ( acc2.matches ( zmebRe ) && acc1.matches ( zmdRe ) ) return 1;
			return 0;
		};

		// In all the other cases, first compare the lengths and then the string values.
		accCmp = accCmp.thenComparingInt ( String::length )
			.thenComparing ( Comparator.naturalOrder () );
		
		return accsStrm.map ( ConceptAccession::getAccession )
    .map ( String::trim )
		.sorted ( accCmp )
		.findFirst ()
		.orElse ( "" );
	}

	/**
	 * Defaults to all the accessions. 
	 */
	public static String getBestAccession ( Set<ConceptAccession> accs )
	{
		return getBestAccession ( accs, true );
	}

	/**
	 * Just a wrapper, concept must be non-null
	 */
	public static String getBestAccession ( ONDEXConcept concept )
	{
		return getBestAccession ( concept.getConceptAccessions () );
	}
	

	/**
	 * Returns the shortest preferred Name from a set of concept Names or ""
	 * [Gene|Protein][Phenotype][The rest]
	 *
	 * @param cns Set<ConceptName>
	 * @return String name
	 */
	public static String getShortestPreferedName ( Set<ConceptName> cns ) 
	{
		return cns.stream ()
	  .filter ( ConceptName::isPreferred )
		.map ( ConceptName::getName )
		.map ( String::trim )
		.sorted ( 
			Comparator.comparing ( String::length )
				.thenComparing ( Comparator.naturalOrder () ) 
		)
		.findFirst ()
		.orElse ( "" );
	}
}
