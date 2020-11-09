package rres.knetminer.datasource.ondexlocal.service;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttributeName;

import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.file.Paths;
import java.text.DecimalFormat;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.GZIPOutputStream;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.lucene.queryparser.classic.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptAccession;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXGraphMetaData;
import rres.knetminer.datasource.ondexlocal.Hits;
import rres.knetminer.datasource.ondexlocal.service.utils.FisherExact;
import rres.knetminer.datasource.ondexlocal.service.utils.GeneHelper;
import rres.knetminer.datasource.ondexlocal.service.utils.KGUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.PublicationUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.QTL;
import rres.knetminer.datasource.ondexlocal.service.utils.UIUtils;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.io.IOUtils;

/**
 * The export sub-service for {@link ExportService}.
 * 
 * Contains functions to export the data that OSP manages. Please, do not let this class grow too much.
 * Things like new export formats should go in their independent component and possibly have delegating
 * wrappers here.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>21 Sep 2020</dd></dl>
 *
 */
@Component
public class ExportService
{
	@Autowired
	private DataService dataService;

	@Autowired
	private SearchService searchService;
	
	@Autowired
	private SemanticMotifService semanticMotifService;
	

	private static final Logger log = LogManager.getLogger ( ExportService.class );

	private ExportService () {}
	
  /*
   * Generate stats about the created Ondex graph and its mappings:
   * mapConcept2Genes & mapGene2Concepts. Author Singhatt
   * Updating to also give Concept2Gene per concept
   *
   * TODO - KHP: Change this to return JSON, break it down into smaller components 
   * and add API endpoint for this. To be aligned with KnetSpace resource pages.
   */
	void exportGraphStats ()
	{
		ONDEXGraph graph = this.dataService.getGraph ();
		var exportDirPath = dataService.getDataPath ();
		
		log.info ( "Saving graph stats to '{}'", exportDirPath );

		
		// Update the Network Stats file that holds the latest Stats information.
		String fileName = Paths.get ( exportDirPath, "latestNetwork_Stats.tab" ).toString ();
		
		// Also, create a timetamped Stats file to retain historic Stats
		// information.
		long timestamp = System.currentTimeMillis ();
		String newFileName = Paths.get ( exportDirPath, timestamp + "_Network_Stats.tab" ).toString ();

		int totalGenes = dataService.getGenomeGenesCount ();
		int totalConcepts = graph.getConcepts ().size ();
		int totalRelations = graph.getRelations ().size ();
		
		var concepts2Genes = semanticMotifService.getConcepts2Genes ();
		int geneEvidenceConcepts = concepts2Genes.size ();

		int [] minValues = new int[] { geneEvidenceConcepts > 0 ? Integer.MAX_VALUE : 0 },
				maxValues = new int [] { 0 }, 
				allValuesCount = new int [] { 0 }; 

		// Min/Max/avg per each gene-related concept group
		var genes2Concepts = semanticMotifService.getGenes2Concepts ();
		
		genes2Concepts
		.entrySet ()
		.stream ()
		.map ( Map.Entry::getValue )
		.map ( Collection::size )
		.forEach ( thisSetSize ->
		{
			if ( thisSetSize < minValues [ 0 ] ) minValues [ 0 ] = thisSetSize;
			if ( thisSetSize > maxValues [ 0 ] ) maxValues [ 0 ] = thisSetSize;
			allValuesCount [ 0 ] += thisSetSize;					
		});

		// Total no. of keys in the HashMap.
		int genesCount = genes2Concepts.keySet ().size ();
		// Calculate average size of gene-evidence networks in the HashMap.
		int avgValues = genesCount > 0 ? allValuesCount [ 0 ] / genesCount : 0;

		// Write the Stats to a .tab file.
		StringBuffer sb = new StringBuffer ();
		// sb.append("<?xml version=\"1.0\" standalone=\"yes\"?>\n");
		sb.append ( "<stats>\n" );
		sb.append ( "<totalGenes>" ).append ( totalGenes ).append ( "</totalGenes>\n" );
		sb.append ( "<totalConcepts>" ).append ( totalConcepts ).append ( "</totalConcepts>\n" );
		sb.append ( "<totalRelations>" ).append ( totalRelations ).append ( "</totalRelations>\n" );
		sb.append ( "<geneEvidenceConcepts>" ).append ( geneEvidenceConcepts ).append ( "</geneEvidenceConcepts>\n" );
		sb.append ( "<evidenceNetworkSizes>\n" );
		sb.append ( "<minSize>" ).append ( minValues [ 0 ] ).append ( "</minSize>\n" );
		sb.append ( "<maxSize>" ).append ( maxValues [ 0 ] ).append ( "</maxSize>\n" );
		sb.append ( "<avgSize>" ).append ( avgValues ).append ( "</avgSize>\n" );
		sb.append ( "</evidenceNetworkSizes>\n" );

		Set<ConceptClass> conceptClasses = graph.getMetaData ().getConceptClasses (); // get all concept classes
		Set<ConceptClass> sortedConceptClasses = new TreeSet<> ( conceptClasses ); // sorted

		// Display table breakdown of all conceptClasses in network
		sb.append ( "<conceptClasses>\n" );
		for ( ConceptClass conClass : sortedConceptClasses )
		{
			String conID = conClass.getId ();
			if ( conID.equalsIgnoreCase ( "Thing" ) ) continue; 
			if ( conID.equalsIgnoreCase ( "TestCC" ) ) continue;

			int conCount = graph.getConceptsOfConceptClass ( conClass ).size ();
			if ( conCount == 0 ) continue;
			
			if ( conID.equalsIgnoreCase ( "Path" ) ) conID = "Pathway";
			else if ( conID.equalsIgnoreCase ( "Comp" ) ) conID = "Compound";
			
			sb.append ( "<cc_count>" ).append ( conID ).append ( "=" ).append ( conCount ).append ( "</cc_count>\n" );
		}
		sb.append ( "</conceptClasses>\n" );
		sb.append ( "<ccgeneEviCount>\n" ); // Obtain concept count from concept2gene

		final Map<String, Long> concept2GenesCounts = concepts2Genes.entrySet ()
		.stream ()
		.collect ( Collectors.groupingBy ( 
			v -> graph.getConcept ( v.getKey () ).getOfType ().getId (), 
			Collectors.counting ()  
		));

		// Ensure that the missing ID's are added to the Map, if they weren't in the mapConcept2Genes map.
		sortedConceptClasses.stream ()
		.forEach ( conceptClass -> 
		{
			if ( graph.getConceptsOfConceptClass ( conceptClass ).size () == 0 ) return;
			String conceptID = conceptClass.getId ();
			if ( concept2GenesCounts.containsKey ( conceptID ) ) return;
			if ( conceptID.equalsIgnoreCase ( "Thing" ) ) return;
			if ( conceptID.equalsIgnoreCase ( "TestCC" ) ) return;
			concept2GenesCounts.put ( conceptID, Long.valueOf ( 0 ) );
		});
		
		// Prints concept -> gene counts
		concept2GenesCounts.entrySet ()
		.stream ()
		.sorted ( Map.Entry.comparingByKey () )
		.forEach ( pair ->
		{
			for ( ConceptClass conceptClass : sortedConceptClasses )
			{
				if ( graph.getConceptsOfConceptClass ( conceptClass ).size () == 0 ) continue;
				
				String conID = conceptClass.getId ();
				if ( !pair.getKey ().equals ( conID ) ) continue;

				if ( conID.equalsIgnoreCase ( "Path" ) ) conID = "Pathway";
				else if ( conID.equalsIgnoreCase ( "Comp" ) ) conID = "Compound";
				sb.append ( "<ccEvi>" ).append ( conID ).append ( "=>" ).append ( Math.toIntExact ( pair.getValue () ) )
					.append ( "</ccEvi>\n" );
			}
		});

		sb.append ( "</ccgeneEviCount>\n" );
		sb.append ( "<connectivity>\n" ); // Relationships per concept
		
		// Print connectivity for each CC
		for ( ConceptClass conceptClass : sortedConceptClasses )
		{
			if ( graph.getConceptsOfConceptClass ( conceptClass ).size () == 0 ) continue;
			String conID = conceptClass.getId ();
			if ( conID.equalsIgnoreCase ( "Thing" ) ) continue;
			if ( conID.equalsIgnoreCase ( "TestCC" ) ) continue;
			
			int relationCount = graph.getRelationsOfConceptClass ( conceptClass ).size ();
			int conCount = graph.getConceptsOfConceptClass ( conceptClass ).size ();
			
			if ( conID.equalsIgnoreCase ( "Path" ) ) conID = "Pathway";
			else if ( conID.equalsIgnoreCase ( "Comp" ) ) conID = "Compound";

			float connectivity = ( (float) relationCount / (float) conCount );
			sb.append ( "<hubiness>" ).append ( conID ).append ( "->" )
				.append ( String.format ( "%2.02f", connectivity ) ).append ( "</hubiness>\n" );
		}
		sb.append ( "</connectivity>\n" );
		sb.append ( "</stats>" );
		
		try
		{
			IOUtils.writeFile ( fileName, sb.toString () );
			
			// Also, create the timestamped Stats file.
			IOUtils.writeFile ( newFileName, sb.toString () );

			// TODO: remove?
			// generateGeneEvidenceStats(exportPathDirUrl);
		}
		catch ( IOException ex )
		{
			log.error ( "Error while writing stats for the Knetminer graph: " + ex.getMessage (), ex );
		}
	}
	
	
  /*
   * Not in use right now. Might still be useful in future, so, keeping it. Needs
   * cleaning/rewriting. 
   *  
   * generate gene2evidence .tab file with contents of the mapGenes2Concepts
   * HashMap & evidence2gene .tab file with contents of the mapConcepts2Genes
   * author singha
   */
	private void generateGeneEvidenceStats ()
	{
		var exportDirPath = dataService.getDataPath ();

		try
		{
			String g2c_fileName = Paths.get ( exportDirPath, "gene2evidences.tab.gz" ).toString (); // gene2evidences.tab
			String c2g_fileName = Paths.get ( exportDirPath, "evidence2genes.tab.gz" ).toString (); // evidence2genes.tab
			String g2pl_fileName = Paths.get ( exportDirPath, "gene2PathLength.tab.gz" ).toString (); // gene2PathLength.tab

			log.debug ( "Print mapGene2Concepts Stats in a new .tab file: " + g2c_fileName );
			// Generate mapGene2Concepts HashMap contents in a new .tab file
			// BufferedWriter out1= new BufferedWriter(new FileWriter(g2c_fileName));
			BufferedWriter out1 = new BufferedWriter (
					new OutputStreamWriter ( new GZIPOutputStream ( new FileOutputStream ( g2c_fileName ) ) ) );
			// GZIPOutputStream gzip= new GZIPOutputStream(new FileOutputStream(new
			// File(g2c_fileName))); // gzip the file.
			// BufferedWriter out1= new BufferedWriter(new OutputStreamWriter(gzip,
			// "UTF-8"));
			
			out1.write ( "Gene_ONDEXID" + "\t" + "Total_Evidences" + "\t" + "EvidenceIDs" + "\n" );
			for ( Map.Entry<Integer, Set<Integer>> mEntry : semanticMotifService.getGenes2Concepts ().entrySet () )
			{ // for each <K,V> entry
				int geneID = mEntry.getKey ();
				Set<Integer> conIDs = mEntry.getValue (); // Set<Integer> value
				String txt = geneID + "\t" + conIDs.size () + "\t";
				Iterator<Integer> itr = conIDs.iterator ();
				while ( itr.hasNext () )
				{
					txt = txt + itr.next ().toString () + ",";
				}
				txt = txt.substring ( 0, txt.length () - 1 ) + "\n"; // omit last comma character
				out1.write ( txt ); // write contents.
			}
			out1.close ();

			log.debug ( "Print mapConcept2Genes Stats in a new .tab file: " + c2g_fileName );
			// Generate mapConcept2Genes HashMap contents in a new .tab file
			// BufferedWriter out2= new BufferedWriter(new FileWriter(c2g_fileName));
			BufferedWriter out2 = new BufferedWriter (
					new OutputStreamWriter ( new GZIPOutputStream ( new FileOutputStream ( c2g_fileName ) ) ) );
			out2.write ( "Evidence_ONDEXID" + "\t" + "Total_Genes" + "\t" + "GeneIDs" + "\n" );
			for ( Map.Entry<Integer, Set<Integer>> mapEntry : semanticMotifService.getConcepts2Genes ().entrySet () )
			{ // for each <K,V> entry
				int eviID = (Integer) mapEntry.getKey ();
				Set<Integer> geneIDs = mapEntry.getValue (); // Set<Integer> value
				String evi_txt = eviID + "\t" + geneIDs.size () + "\t";
				Iterator<Integer> iter = geneIDs.iterator ();
				while ( iter.hasNext () )
				{
					evi_txt = evi_txt + iter.next ().toString () + ",";
				}
				evi_txt = evi_txt.substring ( 0, evi_txt.length () - 1 ) + "\n"; // omit last comma character
				out2.write ( evi_txt ); // write contents.
			}
			out2.close ();

			// Generate gene2PathLength .tab file
			log.debug ( "Print mapGene2PathLength Stats in a new .tab file: " + g2pl_fileName );
			BufferedWriter out3 = new BufferedWriter (
					new OutputStreamWriter ( new GZIPOutputStream ( new FileOutputStream ( g2pl_fileName ) ) ) );
			out3.write ( "Gene_ONDEXID//EndNode_ONDEXID" + "\t" + "PathLength" + "\n" );
			for ( Map.Entry<Pair<Integer, Integer>, Integer> plEntry : semanticMotifService.getGenes2PathLengths ().entrySet () )
			{
				var idPair = plEntry.getKey ();
				String key = idPair.getLeft () + "//" + idPair.getRight ();
				int pl = plEntry.getValue ();
				String pl_txt = key + "\t" + pl + "\n";
				// log.info("mapGene2PathLength: "+ pl_txt);
				out3.write ( pl_txt ); // write contents.
			}
			out3.close ();
		}
		catch ( Exception ex )
		{
			log.error ( "Error while writing stats: " + ex.getMessage (), ex );
		}
	}

	
	
	/**
	 * This table contains all possible candidate genes for given query
	 * TODO: too big! Split into separated functions.
	 *
	 * Was named writeGeneTable
	 */
	public String exportGeneTable ( 
		List<ONDEXConcept> candidates, Set<ONDEXConcept> userGenes, List<String> qtlsStr, 
		String listMode,  SemanticMotifsSearchResult searchResult 
	)
	{
		log.info ( "Exporting gene table..." );
		
		List<QTL> qtls =  QTL.fromStringList ( qtlsStr );
		Set<Integer> userGeneIds = new HashSet<> ();
	  var graph = dataService.getGraph ();
		var genes2QTLs = semanticMotifService.getGenes2QTLs ();
		var options = dataService.getOptions ();
	
		if ( userGenes != null )
		{
			userGeneIds = userGenes.stream ()
				.map ( ONDEXConcept::getId )
				.collect ( Collectors.toSet () );
		} 
		else
			log.info ( "No user gene list defined." );
	
		if ( qtls.isEmpty () ) log.info ( "No QTL regions defined." );
		
		var mapGene2HitConcept = searchResult.getGeneId2RelatedConceptIds ();
		
		// TODO: but could it be null?!
		var scoredCandidates = Optional.ofNullable ( searchResult.getRelatedConcept2Score () )
			.orElse ( Collections.emptyMap () );			
		
		// Removed ccSNP from Geneview table (12/09/2017)
		// AttributeName attSnpCons = md.getAttributeName("Transcript_Consequence");
		// ConceptClass ccSNP = md.getConceptClass("SNP");
	
		StringBuffer out = new StringBuffer ();
		// out.append("ONDEX-ID\tACCESSION\tGENE
		// NAME\tCHRO\tSTART\tTAXID\tSCORE\tUSER\tQTL\tEVIDENCE\tEVIDENCES_LINKED\tEVIDENCES_IDs\n");
		out.append ( "ONDEX-ID\tACCESSION\tGENE NAME\tCHRO\tSTART\tTAXID\tSCORE\tUSER\tQTL\tEVIDENCE\n" );
		for ( ONDEXConcept gene : candidates )
		{
			int id = gene.getId ();
	
			var geneHelper = new GeneHelper ( graph, gene );
			Double score = scoredCandidates.getOrDefault ( gene, 0d );
	
			// use shortest preferred concept name
			String geneName = KGUtils.getShortestPreferedName ( gene.getConceptNames () );
	
			boolean isInList = userGenes != null && userGeneIds.contains ( gene.getId () );
	
			List<String> infoQTL = new LinkedList<> ();
			for ( Integer cid : genes2QTLs.getOrDefault ( gene.getId (), Collections.emptySet () ) )
			{
				ONDEXConcept qtl = graph.getConcept ( cid );
	
				/*
				 * TODO: a TEMPORARY fix for a bug wr're seeing, we MUST apply a similar massage to ALL cases like this,
				 * and hence we MUST move this code to some utility.
				 */
				if ( qtl == null )
				{
					log.error ( "writeTable(): no gene found for id: ", cid );
					continue;
				}
				String acc = Optional.ofNullable ( qtl.getConceptName () )
					.map ( ConceptName::getName )
					.map ( StringEscapeUtils::escapeCsv )
					.orElseGet ( () -> {
						log.error ( "writeTable(): gene name not found for id: {}", cid );
						return "";
					});
	
				String traitDesc = Optional.of ( getAttrValueAsString ( graph, gene, "Trait", false ) )
					.orElse ( acc );
	
				// TODO: traitDesc twice?! Looks wrong.
				infoQTL.add ( traitDesc + "//" + traitDesc ); 
			} // for genes2QTLs
	
	
			qtls.stream ()
			.filter ( loci -> !loci.getChromosome ().isEmpty () )
			.filter ( loci -> geneHelper.getBeginBP ( true ) >= loci.getStart () )
			.filter ( loci -> geneHelper.getEndBP ( true ) <= loci.getEnd () )
			.map ( loci -> loci.getLabel () + "//" + loci.getTrait () )
			.forEach ( infoQTL::add );
	
			String infoQTLStr = infoQTL.stream ().collect ( Collectors.joining ( "||" ) );
			
			// get lucene hits per gene
			Set<Integer> luceneHits = mapGene2HitConcept.getOrDefault ( id, Collections.emptySet () );
	
			// organise by concept class
			Map<String, String> cc2name = new HashMap<> ();
	
			Set<Integer> evidencesIDs = new HashSet<> ();
			for ( int hitID : luceneHits )
			{
				ONDEXConcept c = graph.getConcept ( hitID );
				evidencesIDs.add ( c.getId () ); // retain all evidences' ID's
				String ccId = c.getOfType ().getId ();
	
				// skip publications as handled differently (see below)
				if ( ccId.equals ( "Publication" ) ) continue;
	
				String name = KGUtils.getMolBioDefaultLabel ( c );
				cc2name.merge ( ccId, name, (thisId, oldName) -> oldName + "//" + name );
			}
	
			// special case for publications to sort and filter most recent publications
			Set<ONDEXConcept> allPubs = luceneHits.stream ()
				.map ( graph::getConcept )
				.filter ( c -> "Publication".equals ( c.getOfType ().getId () ) )
				.collect ( Collectors.toSet () );
			
			
			AttributeName attYear = getAttributeName ( graph, "YEAR" );
			List<Integer> newPubs = PublicationUtils.newPubsByNumber ( 
				allPubs, 
				attYear, 
				options.getInt ( SearchService.OPT_DEFAULT_NUMBER_PUBS, -1 ) 
			);
	
			// add most recent publications here
			if ( !newPubs.isEmpty () )
			{
				String pubString = "Publication__" + allPubs.size () + "__";
				pubString += newPubs.stream ()
					.map ( graph::getConcept )
				  .map ( KGUtils::getMolBioDefaultLabel )
				  .map ( name -> name.contains ( "PMID:" ) ? name : "PMID:" + name )
				  .collect ( Collectors.joining ( "//" ) );
				cc2name.put ( "Publication", pubString );
			}
	
			// create output string for evidences column in GeneView table
			String evidenceStr = cc2name.entrySet ()
			.stream ()
			.map ( e -> 
				"Publication".equals ( e.getKey () )  
					? e.getValue ()
					: e.getKey () + "__" + e.getValue ().split ( "//" ).length + "__" + e.getValue ()
			)
			.collect ( Collectors.joining ( "||" ) );
							
			if ( luceneHits.isEmpty () && listMode.equals ( "GLrestrict" ) ) continue;
			
			if ( ! ( !evidenceStr.isEmpty () || qtls.isEmpty () ) ) continue;
			
			out.append (
				id + "\t" + geneHelper.getBestAccession () + "\t" + geneName + "\t" + geneHelper.getChromosome () + "\t" 
				+ geneHelper.getBeginBP ( true ) + "\t" + geneHelper.getTaxID () + "\t" 
				+ new DecimalFormat ( "0.00" ).format ( score ) + "\t" + (isInList ? "yes" : "no" ) + "\t" + infoQTLStr + "\t" 
				+ evidenceStr + "\n" 
			);
	
		} // for candidates
		log.info ( "Gene table generated..." );
		return out.toString ();
	
	} // exportGeneTable()
	
	
  /**
   * Renders Genomap XML.
   * 
   * @param apiUrl the URL of the invocation that generated current results, used to be included in the result
   * @param genes list of genes to be displayed (all genes for search result)
   * @param userGenes gene list from user
   * @param userQtlStr user QTLs
   * @param keyword user-specified keyword
   * 
   * Was named writeAnnotationXML
   */
	public String exportGenomapXML ( String apiUrl, List<ONDEXConcept> genes, Set<ONDEXConcept> userGenes,
		List<String> userQtlStr, String keyword, int maxGenes, Hits hits, String listMode,
		Map<ONDEXConcept, Double> scoredCandidates )
	{
		log.info ( "Genomaps: generating XML..." );

		List<QTL> userQtl = QTL.fromStringList ( userQtlStr );  

		// TODO: can we remove this?
		// If user provided a gene list, use that instead of the all Genes (04/07/2018, singha)
		/*
		 * if(userGenes != null) { // use this (Set<ONDEXConcept> userGenes) in place of the genes
		 * ArrayList<ONDEXConcept> genes. genes= new ArrayList<ONDEXConcept> (userGenes);
		 * log.info("Genomaps: Using user-provided gene list... genes: "+ genes.size()); }
		 */
		// added user gene list restriction above (04/07/2018, singha)

    var graph = dataService.getGraph ();
		ONDEXGraphMetaData gmeta = graph.getMetaData ();

		ConceptClass ccQTL = gmeta.getConceptClass ( "QTL" );
		
		Set<QTL> qtlDB = new HashSet<> ();
		if ( ccQTL != null && ! ( keyword == null || "".equals ( keyword ) ) )
		{
			// qtlDB = graph.getConceptsOfConceptClass(ccQTL);
			try {
				qtlDB = searchService.searchQTLs ( keyword );
			}
			catch ( ParseException e )
			{
				// TODO: is it fine to continue without any exception!?
				log.error ( "Failed to find QTLs", e );
			}
		}

		StringBuffer sb = new StringBuffer ();
		sb.append ( "<?xml version=\"1.0\" standalone=\"yes\"?>\n" );
		sb.append ( "<genome>\n" );
		int id = 0;

		// genes are grouped in three portions based on size
		int size = Math.min ( genes.size (), maxGenes );

		log.info ( "visualize genes: " + genes.size () );
		for ( ONDEXConcept c : genes )
		{
			var geneHelper = new GeneHelper ( graph, c );
			
			// only genes that are on chromosomes (not scaffolds)
			// can be displayed in Map View
			String chr = geneHelper.getChromosome ();
			if ( chr == null || "U".equals ( chr ) )
				continue;
			
			int beg = geneHelper.getBeginBP ( true );
			int end = geneHelper.getEndBP ( true );


			String name = c.getPID ();
			// TODO: What does this mean?! Getting a random accession?! Why
			// not using the methods for the shortest name/accession?
			for ( ConceptAccession acc : c.getConceptAccessions () )
				name = acc.getAccession ();

			String label = KGUtils.getMolBioDefaultLabel ( c );
			String query = null;
			try
			{
				query = "keyword=" + URLEncoder.encode ( keyword, "UTF-8" ) + "&amp;list="
						+ URLEncoder.encode ( name, "UTF-8" );
			}
			catch ( UnsupportedEncodingException e )
			{
				log.error ( "Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)", e );
				throw ExceptionUtils.buildEx ( RuntimeException.class, e,
						"Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)" );
			}
			String uri = apiUrl + "/network?" + query; // KnetMaps (network) query
			// log.info("Genomaps: add KnetMaps (network) query: "+ uri);

			// Genes
			sb.append ( "<feature id=\"" + id + "\">\n" );
			sb.append ( "<chromosome>" + chr + "</chromosome>\n" );
			sb.append ( "<start>" + beg + "</start>\n" );
			sb.append ( "<end>" + end + "</end>\n" );
			sb.append ( "<type>gene</type>\n" );
			
			if ( id <= size / 3 )
				sb.append ( "<color>0x00FF00</color>\n" ); // Green
			else if ( id > size / 3 && id <= 2 * size / 3 )
				sb.append ( "<color>0xFFA500</color>\n" ); // Orange
			else
				sb.append ( "<color>0xFF0000</color>\n" ); // Red
			
			sb.append ( "<label>" + label + "</label>\n" );
			sb.append ( "<link>" + uri + "</link>\n" );
			
			// Add 'score' tag as well.
			Double score = 0.0;
			if ( scoredCandidates != null && scoredCandidates.get ( c ) != null )
				score = scoredCandidates.get ( c ); // fetch score
			
			sb.append ( "<score>" + score + "</score>\n" ); // score
			sb.append ( "</feature>\n" );

			if ( id++ > maxGenes )
				break;
		}

		log.info ( "Display user QTLs... QTLs provided: " + userQtl.size () );
		for ( QTL region : userQtl )
		{
			String chr = region.getChromosome ();
			int start = region.getStart ();
			int end = region.getEnd ();
			
			String label = Optional.ofNullable ( region.getLabel () )
				.filter ( lbl -> !lbl.isEmpty () )
				.orElse ( "QTL" );

			String query = null;
			try
			{
				query = "keyword=" + URLEncoder.encode ( keyword, "UTF-8" ) + "&amp;qtl=" + URLEncoder.encode ( chr, "UTF-8" )
						+ ":" + start + ":" + end;
			}
			catch ( UnsupportedEncodingException e )
			{
				log.error ( "Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)", e );
				throw ExceptionUtils.buildEx ( RuntimeException.class, e,
						"Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)" );
			}
			String uri = apiUrl + "/network?" + query;

			sb.append ( "<feature>\n" );
			sb.append ( "<chromosome>" + chr + "</chromosome>\n" );
			sb.append ( "<start>" + start + "</start>\n" );
			sb.append ( "<end>" + end + "</end>\n" );
			sb.append ( "<type>qtl</type>\n" );
			sb.append ( "<color>0xFF0000</color>\n" ); // Orange
			sb.append ( "<label>" + label + "</label>\n" );
			sb.append ( "<link>" + uri + "</link>\n" );
			sb.append ( "</feature>\n" );
		}

		// TODO: createHilightColorMap() generates colours randomly by default, why doing the same differently, here?!
		// TODO: possibly, move this to a constant

		List<String> colorHex = List.of ( "0xFFB300", "0x803E75", "0xFF6800", "0xA6BDD7", "0xC10020", "0xCEA262", "0x817066",
				"0x0000FF", "0x00FF00", "0x00FFFF", "0xFF0000", "0xFF00FF", "0xFFFF00", "0xDBDB00", "0x00A854", "0xC20061",
				"0xFF7E3D", "0x008F8F", "0xFF00AA", "0xFFFFAA", "0xD4A8FF", "0xA8D4FF", "0xFFAAAA", "0xAA0000", "0xAA00FF",
				"0xAA00AA", "0xAAFF00", "0xAAFFFF", "0xAAFFAA", "0xAAAA00", "0xAAAAFF", "0xAAAAAA", "0x000055", "0x00FF55",
				"0x00AA55", "0x005500", "0x0055FF" );
		// 0xFFB300, # Vivid Yellow
		// 0x803E75, # Strong Purple
		// 0xFF6800, # Vivid Orange
		// 0xA6BDD7, # Very Light Blue
		// 0xC10020, # Vivid Red
		// 0xCEA262, # Grayish Yellow
		// 0x817066, # Medium Gray
		
		Set<String> traits = qtlDB.stream ()
		.map ( QTL::getTrait )
		.collect ( Collectors.toSet () );
		
		Map<String, String> trait2color = UIUtils.createHilightColorMap ( traits, colorHex );

		final var taxIds = this.dataService.getTaxIds ();
		log.info ( "Display QTLs and SNPs... QTLs found: " + qtlDB.size () );
		log.info ( "TaxID(s): {}", taxIds );
		
		for ( QTL loci : qtlDB )
		{
			String type = loci.getType ().trim ();
			String chrQTL = loci.getChromosome ();
			Integer startQTL = loci.getStart ();
			Integer endQTL = loci.getEnd ();
			String label = loci.getLabel ().replaceAll ( "\"", "" );
			String trait = loci.getTrait ();

			Float pvalue = loci.getpValue ();
			String color = trait2color.get ( trait );

			// TODO get p-value of SNP-Trait relations
			if ( type.equals ( "QTL" ) )
			{
				sb.append ( "<feature>\n" );
				sb.append ( "<chromosome>" + chrQTL + "</chromosome>\n" );
				sb.append ( "<start>" + startQTL + "</start>\n" );
				sb.append ( "<end>" + endQTL + "</end>\n" );
				sb.append ( "<type>qtl</type>\n" );
				sb.append ( "<color>" + color + "</color>\n" );
				sb.append ( "<trait>" + trait + "</trait>\n" );
				sb.append ( "<link>http://archive.gramene.org/db/qtl/qtl_display?qtl_accession_id=" + label + "</link>\n" );
				sb.append ( "<label>" + label + "</label>\n" );
				sb.append ( "</feature>\n" );
				// log.info("add QTL: trait, label: "+ trait +", "+ label);
			} 
			else if ( type.equals ( "SNP" ) )
			{
				/* add check if species TaxID (list from client/utils-config.js) contains this SNP's TaxID. */
				if ( this.dataService.containsTaxId ( loci.getTaxID () ) )
				{
					sb.append ( "<feature>\n" );
					sb.append ( "<chromosome>" + chrQTL + "</chromosome>\n" );
					sb.append ( "<start>" + startQTL + "</start>\n" );
					sb.append ( "<end>" + endQTL + "</end>\n" );
					sb.append ( "<type>snp</type>\n" );
					sb.append ( "<color>" + color + "</color>\n" );
					sb.append ( "<trait>" + trait + "</trait>\n" );
					sb.append ( "<pvalue>" + pvalue + "</pvalue>\n" );
					sb.append (
							"<link>http://plants.ensembl.org/arabidopsis_thaliana/Variation/Summary?v=" + label + "</link>\n" );
					sb.append ( "<label>" + label + "</label>\n" );
					sb.append ( "</feature>\n" );
				}
			}

		} // for loci

		sb.append ( "</genome>\n" );
		return sb.toString ();
	} // exportGenomapXML()
	
	
  /**
   * Export the evidence Table for the evidence view file
   *
   */
	public String exportEvidenceTable ( 
		String keywords, Map<ONDEXConcept, Float> luceneConcepts, Set<ONDEXConcept> userGenes, List<String> qtlsStr 
	)
	{
    var graph = dataService.getGraph ();
		
		StringBuffer out = new StringBuffer ();
		out.append ( "TYPE\tNAME\tSCORE\tP-VALUE\tGENES\tUSER GENES\tQTLS\tONDEXID\n" );
		
		if ( userGenes == null || userGenes.isEmpty () ) return out.toString ();
		
		var genes2Concepts = semanticMotifService.getGenes2Concepts ();			
		int allGenesSize = genes2Concepts.keySet ().size ();
		int userGenesSize = userGenes.size ();

		log.info ( "generate Evidence table..." );
		List<QTL> qtls = QTL.fromStringList ( qtlsStr );					

		DecimalFormat sfmt = new DecimalFormat ( "0.00" );
		DecimalFormat pfmt = new DecimalFormat ( "0.00000" );

		for ( ONDEXConcept lc : luceneConcepts.keySet () )
		{
			// Creates type,name,score and numberOfGenes
			String type = lc.getOfType ().getId ();
			String name = KGUtils.getMolBioDefaultLabel ( lc );
			// All publications will have the format PMID:15487445
			// if (type == "Publication" && !name.contains("PMID:"))
			// name = "PMID:" + name;
			// Do not print publications or proteins or enzymes in evidence view
			if ( Stream.of ( "Publication", "Protein", "Enzyme" ).anyMatch ( t -> t.equals ( type ) ) ) 
				continue;
			
			var concepts2Genes = semanticMotifService.getConcepts2Genes ();
			var genes2QTLs = semanticMotifService.getGenes2QTLs ();

			Float score = luceneConcepts.get ( lc );
			Integer ondexId = lc.getId ();
			if ( !concepts2Genes.containsKey ( lc.getId () ) ) continue;
			Set<Integer> listOfGenes = concepts2Genes.get ( lc.getId () );
			Integer numberOfGenes = listOfGenes.size ();
			Set<String> userGenesStrings = new HashSet<> ();
			Integer numberOfQTL = 0;

			for ( int log : listOfGenes )
			{
				ONDEXConcept gene = graph.getConcept ( log );
				var geneHelper = new GeneHelper ( graph, gene );
				
				if ( ( userGenes != null ) && ( gene != null ) && ( userGenes.contains ( gene ) ) )
				{
					// numberOfUserGenes++;
					// retain gene Accession/Name (18/07/18)
					userGenesStrings.add ( geneHelper.getBestAccession () );
					
					// TODO: This was commented at some point and it's still unclear if needed.
					// Keeping for further verifications
					// String geneName = getShortestPreferedName(gene.getConceptNames()); geneAcc= geneName;
				}

				if ( genes2QTLs.containsKey ( log ) ) numberOfQTL++;

				String chr = geneHelper.getChromosome ();
				int beg = geneHelper.getBeginBP ( true );
									
				for ( QTL loci : qtls )
				{
					String qtlChrom = loci.getChromosome ();
					Integer qtlStart = loci.getStart ();
					Integer qtlEnd = loci.getEnd ();

					if ( qtlChrom.equals ( chr ) && beg >= qtlStart && beg <= qtlEnd ) numberOfQTL++;
				}

			} // for log

			if ( userGenesStrings.isEmpty () ) continue;
			
			double pvalue = 0.0;

			// quick adjustment to the score to make it a P-value from F-test instead
			int matchedInGeneList = userGenesStrings.size ();
			int notMatchedInGeneList = userGenesSize - matchedInGeneList;
			int matchedNotInGeneList = numberOfGenes - matchedInGeneList;
			int notMatchedNotInGeneList = allGenesSize - matchedNotInGeneList - matchedInGeneList - notMatchedInGeneList;

			FisherExact fisherExact = new FisherExact ( allGenesSize );
			pvalue = fisherExact.getP ( 
				matchedInGeneList, matchedNotInGeneList, notMatchedInGeneList, notMatchedNotInGeneList
			);
			
			var userGenesStr = userGenesStrings.stream ().collect ( Collectors.joining ( "," ) ); 
			out.append ( 
				type + "\t" + name + "\t" + sfmt.format ( score ) + "\t" + pfmt.format ( pvalue ) + "\t"
				+ numberOfGenes + "\t" + userGenesStr + "\t" + numberOfQTL + "\t" + ondexId + "\n" 
			);
		} // for luceneConcepts()
		
		return out.toString ();
		
	} // writeEvidenceTable()	
}
