package rres.knetminer.datasource.ondexlocal.service;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttributeName;

import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.io.Writer;
import java.net.URLEncoder;
import java.nio.file.Paths;
import java.text.DecimalFormat;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Queue;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.GZIPOutputStream;

import org.apache.commons.lang3.mutable.MutableBoolean;
import org.apache.commons.lang3.mutable.MutableInt;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.text.StringEscapeUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.lucene.queryparser.classic.ParseException;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptAccession;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXGraphMetaData;
import net.sourceforge.ondex.core.searchable.LuceneConcept;
import net.sourceforge.ondex.core.util.GraphLabelsUtils;
import rres.knetminer.datasource.api.config.KnetminerConfiguration;
import rres.knetminer.datasource.ondexlocal.service.utils.FisherExact;
import rres.knetminer.datasource.ondexlocal.service.utils.GeneHelper;
import rres.knetminer.datasource.ondexlocal.service.utils.PublicationUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.QTL;
import rres.knetminer.datasource.ondexlocal.service.utils.UIUtils;
import uk.ac.ebi.utils.collections.OptionsMap;
import uk.ac.ebi.utils.exceptions.ExceptionLogger;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.opt.io.IOUtils;

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
	/**
	 * Where {@link #exportGraphStats()} saves its output (in {@link KnetminerConfiguration#getDataDirPath()}).
	 */
	public static final String GRAPH_STATS_FILE_NAME = "knowledge-network-stats.json"; 
	
	
	@Autowired
	private DataService dataService;

	@Autowired
	private SearchService searchService;
	
	@Autowired
	private SemanticMotifDataService semanticMotifDataService;
	
	private static final Logger log = LogManager.getLogger ( ExportService.class );
	
	private final ExceptionLogger exLog = ExceptionLogger.getLogger ( this.getClass () );
	
	private ExportService () {}
	
  /**
   * Computes and saves (into {@link #GRAPH_STATS_FILE_NAME}) various statistics about the current 
   * dataset (the OXL) and the semantic motifs computed from it. 
   *
   */
	@SuppressWarnings ( "unchecked" )
	void exportGraphStats ()
	{
		ONDEXGraph graph = this.dataService.getGraph ();
		var dataPath = dataService.getConfiguration ().getDataDirPath ();
		var exportFilePath = dataPath + '/' + GRAPH_STATS_FILE_NAME;
		
		log.info ( "Saving graph stats to '{}'", exportFilePath );

		int totalGenes = dataService.getGenomeGenesCount ();
		int totalConcepts = graph.getConcepts ().size ();
		int totalRelations = graph.getRelations ().size ();
		
		var concepts2Genes = semanticMotifDataService.getConcepts2Genes ();
		int totalEvidenceConcepts = concepts2Genes.size ();

		int [] minConceptsPerGene = new int[] { totalEvidenceConcepts > 0 ? Integer.MAX_VALUE : 0 },
			maxConceptsPerGene = new int [] { 0 },
			// Don't confuse this with total no. of concepts (same concepts can be linked multiple times)
			totalLinkedConcepts = new int [] { 0 }; 

		// Min/Max/avg per each gene-related concept group
		var genes2Concepts = semanticMotifDataService.getGenes2Concepts ();
		
		genes2Concepts
		.entrySet ()
		.stream ()
		.map ( Map.Entry::getValue )
		.map ( Collection::size )
		.forEach ( thisSetSize ->
		{
			if ( thisSetSize < minConceptsPerGene [ 0 ] ) minConceptsPerGene [ 0 ] = thisSetSize;
			if ( thisSetSize > maxConceptsPerGene [ 0 ] ) maxConceptsPerGene [ 0 ] = thisSetSize;
			totalLinkedConcepts [ 0 ] += thisSetSize;					
		});

		int genesCount = genes2Concepts.keySet ().size ();
		int avgConceptsPerGene = genesCount > 0 ? totalLinkedConcepts [ 0 ] / genesCount : 0;
		
		JSONObject graphSummaries = new JSONObject ();
		graphSummaries.put ( "totalGenes", totalGenes ); 
		graphSummaries.put ( "totalConcepts", totalConcepts ); 
		graphSummaries.put ( "totalRelations", totalRelations ); 
		
		JSONObject semanticMotifStats = new JSONObject ();
		semanticMotifStats.put ( "minConceptsPerGene", minConceptsPerGene [ 0 ] ); 
		semanticMotifStats.put ( "maxConceptsPerGene", maxConceptsPerGene [ 0 ] ); 
		semanticMotifStats.put ( "avgConceptsPerGene", avgConceptsPerGene );
		semanticMotifStats.put ( "totalEvidenceConcepts", totalEvidenceConcepts );
		
		// TODO: we're listing them in CC order, but very likely, this will be lost when turned
		// to JSON dictionary. Possibly, just use an HashSet.
		Set<ConceptClass> conceptClasses = new TreeSet<> ( graph.getMetaData ().getConceptClasses () ); 
		
		JSONObject graphStats = new JSONObject ();
		
		JSONObject conceptClassTotals = new JSONObject ();
		// Display table breakdown of all conceptClasses in network
		for ( ConceptClass conClass : conceptClasses )
		{
			String conID = conClass.getId ();
			if ( conID.equalsIgnoreCase ( "Thing" ) ) continue; 
			if ( conID.equalsIgnoreCase ( "TestCC" ) ) continue;

			int conCount = graph.getConceptsOfConceptClass ( conClass ).size ();
			if ( conCount == 0 ) continue;
			
			if ( conID.equalsIgnoreCase ( "Path" ) ) conID = "Pathway";
			else if ( conID.equalsIgnoreCase ( "Comp" ) ) conID = "Compound";
			conceptClassTotals.put ( conID, conCount );
		}
		graphStats.put ( "conceptClassTotals", conceptClassTotals );
		
		// Evidence concepts per each gene
		//
		final Map<String, Long> concept2GenesCounts = concepts2Genes.entrySet ()
		.stream ()
		.collect ( Collectors.groupingBy ( 
			_concepts2Genes -> graph.getConcept ( _concepts2Genes.getKey () ).getOfType ().getId (), // CC
			Collectors.counting ()  
		));

		// Ensure that the missing ID's are added to the Map, if they weren't in the mapConcept2Genes map.
		conceptClasses.stream ()
		.forEach ( conceptClass -> 
		{
			if ( graph.getConceptsOfConceptClass ( conceptClass ).size () == 0 ) return;
			String conceptID = conceptClass.getId ();
			if ( concept2GenesCounts.containsKey ( conceptID ) ) return;
			if ( conceptID.equalsIgnoreCase ( "Thing" ) ) return;
			if ( conceptID.equalsIgnoreCase ( "TestCC" ) ) return;
			concept2GenesCounts.put ( conceptID, Long.valueOf ( 0 ) );
		});
		
		// Output concept -> gene counts
		JSONObject conceptsPerGene = new JSONObject ();

		concept2GenesCounts.entrySet ()
		.stream ()
		.sorted ( Map.Entry.comparingByKey () )
		.forEach ( pair ->
		{
			for ( ConceptClass conceptClass : conceptClasses )
			{
				if ( graph.getConceptsOfConceptClass ( conceptClass ).size () == 0 ) continue;
				
				String conID = conceptClass.getId ();
				if ( !pair.getKey ().equals ( conID ) ) continue;

				if ( conID.equalsIgnoreCase ( "Path" ) ) conID = "Pathway";
				else if ( conID.equalsIgnoreCase ( "Comp" ) ) conID = "Compound";
				
				conceptsPerGene.put ( conID, Math.toIntExact ( pair.getValue () ) );
			}
		});
		graphStats.put ( "conceptsPerGene", conceptsPerGene );
			
		
		// Relations per concept
		//
		
		JSONObject avgRelationsPerConcept = new JSONObject ();
		
		// Print connectivity, ie, the average number of relations per concept, for each concept class
		for ( ConceptClass conceptClass : conceptClasses )
		{
			if ( graph.getConceptsOfConceptClass ( conceptClass ).size () == 0 ) continue;
			String conID = conceptClass.getId ();
			if ( conID.equalsIgnoreCase ( "Thing" ) ) continue;
			if ( conID.equalsIgnoreCase ( "TestCC" ) ) continue;
			
			int relationsCount = graph.getRelationsOfConceptClass ( conceptClass ).size ();
			int conceptsCount = graph.getConceptsOfConceptClass ( conceptClass ).size ();
			
			if ( conID.equalsIgnoreCase ( "Path" ) ) conID = "Pathway";
			else if ( conID.equalsIgnoreCase ( "Comp" ) ) conID = "Compound";

			double connectivity = 1d * relationsCount / conceptsCount;
			avgRelationsPerConcept.put ( conID,  connectivity );
		}
		graphStats.put ( "avgRelationsPerConcept", avgRelationsPerConcept );
		
		// Eventually...
		//
		JSONObject outJson = new JSONObject ();
		outJson.put ( "graphSummaries", graphSummaries );
		outJson.put ( "graphStats", graphStats );
		outJson.put ( "semanticMotifStats", semanticMotifStats );
		
		try
		{
			IOUtils.writeFile ( exportFilePath, outJson.toString() );
			
			// TODO: remove, it's only invoked upon data initialisation, doesn't make much sense to
			// deal with this here, if you need archiving, use the command line tool
			//
			// Also, create a copy to keep an historic track of it.
//			long timestamp = System.currentTimeMillis ();
//			String newStatsPath = Paths.get ( exportDirPath, timestamp + "_Network_Stats.tab" ).toString ();
//			IOUtils.writeFile ( newStatsPath, outJson.toString() );

			// TODO: remove?
			// generateGeneEvidenceStats(exportPathDirUrl);
		}
		catch ( IOException ex )
		{
			exLog.logEx ( "Error while writing stats for the Knetminer graph", ex );
		}
		
		log.info ( "End of graph stats export" );
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
		var exportDirPath = dataService.getConfiguration ().getDataDirPath ();

		try
		{
			String g2c_fileName = Paths.get ( exportDirPath, "gene2evidences.tab.gz" ).toString (); // gene2evidences.tab
			String c2g_fileName = Paths.get ( exportDirPath, "evidence2genes.tab.gz" ).toString (); // evidence2genes.tab
			String g2pl_fileName = Paths.get ( exportDirPath, "gene2PathLength.tab.gz" ).toString (); // gene2PathLength.tab

			log.debug ( "Print mapGene2Concepts Stats in a new .tab file: " + g2c_fileName );
			try ( 
				Writer out = 
					new BufferedWriter ( new OutputStreamWriter ( 
						new GZIPOutputStream ( new FileOutputStream ( g2c_fileName ) ) ) )
			)
			{
				out.write ( "Gene_ONDEXID" + "\t" + "Total_Evidences" + "\t" + "EvidenceIDs" + "\n" );
				for ( Map.Entry<Integer, Set<Integer>> mEntry : semanticMotifDataService.getGenes2Concepts ().entrySet () )
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
					out.write ( txt ); // write contents.
				}
			}

			log.debug ( "Print mapConcept2Genes Stats in a new .tab file: " + c2g_fileName );

			try ( 
				Writer out = new BufferedWriter (
					new OutputStreamWriter ( new GZIPOutputStream ( new FileOutputStream ( c2g_fileName ) ) ) )
			)
			{
				out.write ( "Evidence_ONDEXID" + "\t" + "Total_Genes" + "\t" + "GeneIDs" + "\n" );
				for ( Map.Entry<Integer, Set<Integer>> mapEntry : semanticMotifDataService.getConcepts2Genes ().entrySet () )
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
					out.write ( evi_txt ); // write contents.
				}
			}

			log.debug ( "Print mapGene2PathLength Stats in a new .tab file: " + g2pl_fileName );
			try ( 
				Writer out = new BufferedWriter (
					new OutputStreamWriter ( new GZIPOutputStream ( new FileOutputStream ( g2pl_fileName ) ) ) )
			)
			{
				out.write ( "Gene_ONDEXID//EndNode_ONDEXID" + "\t" + "PathLength" + "\n" );
				for ( Map.Entry<Pair<Integer, Integer>, Integer> plEntry : semanticMotifDataService.getGenes2PathLengths ().entrySet () )
				{
					var idPair = plEntry.getKey ();
					String key = idPair.getLeft () + "//" + idPair.getRight ();
					int pl = plEntry.getValue ();
					String pl_txt = key + "\t" + pl + "\n";
					// log.info("mapGene2PathLength: "+ pl_txt);
					out.write ( pl_txt ); // write contents.
				}
			}
		}
		catch ( Exception ex )
		{
			exLog.logEx ( "Error while writing stats", ex );
		}
	}

	
	
	/**
	 * This table contains all possible candidate genes for given query, that is, the KnetMiner left-most
	 * 'Gene View'.
	 * 
	 * TODO: too big! Split into separated functions.
	 *
	 * Was named writeGeneTable
	 */
	public String exportGeneTable ( 
		List<ONDEXConcept> candidateGenes, Set<ONDEXConcept> userGenes, List<String> qtlsStr, 
		String listMode,  SemanticMotifsSearchResult searchResult 
	)
	{
		log.info ( "Exporting gene table" );
		
		List<QTL> qtls =  QTL.fromStringList ( qtlsStr );
	  var graph = dataService.getGraph ();
		var genes2QTLs = semanticMotifDataService.getGenes2QTLs ();
		var config = dataService.getConfiguration ();

		if ( userGenes == null ) userGenes = Set.of ();
		var userGeneIds = userGenes.stream ()
				.map ( ONDEXConcept::getId )
				.collect ( Collectors.toSet () );

		if ( userGenes.isEmpty () ) log.info ( "No user gene list defined." );
		if ( qtls.isEmpty () ) log.info ( "No QTL regions defined." );
		
		var mapGene2HitConcept = searchResult.getGeneId2RelatedConceptIds ();
		
		// TODO: but could it be null?!
		var scoredCandidates = Optional.ofNullable ( searchResult.getGene2Score () )
			.orElse ( Collections.emptyMap () );			
		
		
		StringBuffer out = new StringBuffer ();
		out.append ( "ONDEX-ID\tACCESSION\tGENE_NAME\tCHRO\tSTART\tTAXID\tSCORE\tUSER\tQTL\tEVIDENCE\n" );
		for ( ONDEXConcept gene : candidateGenes )
		{
			int geneId = gene.getId ();
	
			var geneHelper = new GeneHelper ( graph, gene );
			Double score = scoredCandidates.getOrDefault ( gene, 0d );
	
			// Exclude accessions when possible
			String geneName = GraphLabelsUtils.getBestName ( gene, true );
	
			boolean isInList = userGeneIds.contains ( gene.getId () );
	
			List<String> infoQTL = new LinkedList<> ();
			for ( Integer qtlConceptId : genes2QTLs.getOrDefault ( gene.getId (), Collections.emptySet () ) )
			{
				ONDEXConcept qtl = graph.getConcept ( qtlConceptId );
	
				/*
				 * TODO: a TEMPORARY fix for a bug wr're seeing, we MUST apply a similar massage to ALL cases like this,
				 * and hence we MUST move this code to some utility.
				 */
				if ( qtl == null )
				{
					log.error ( "exportGeneTable(): no gene found for id: ", qtlConceptId );
					continue;
				}
				
				String acc = Optional.ofNullable ( qtl.getConceptName () )
					.map ( ConceptName::getName )
					.map ( StringEscapeUtils::escapeCsv )
					.orElseGet ( () -> {
						log.error ( "exportGeneTable(): gene name not found for id: {}", qtlConceptId );
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
			Set<Integer> luceneHits = mapGene2HitConcept.getOrDefault ( geneId, Collections.emptySet () );

			
			// group related concepts by their type and map each concept to its best label
			//
			
			Map<String, List<String>> byCCRelatedLabels = luceneHits.stream ()
			.map ( graph::getConcept )
			// We deal with these below
			.filter ( relatedConcept -> !"Publication".equals ( relatedConcept.getOfType ().getId () ) )
			.collect ( Collectors.groupingBy (
				// group by CC
				relatedConcept -> relatedConcept.getOfType ().getId (),
				// for each CC, make a list of labels
				Collectors.mapping ( GraphLabelsUtils::getBestConceptLabel, Collectors.toList () )
			)); 
				
			
			// Publications need filtering for most recent ones and then sorting
			//
			Set<ONDEXConcept> allPubs = luceneHits.stream ()
				.map ( graph::getConcept )
				.filter ( relatedConcept -> "Publication".equals ( relatedConcept.getOfType ().getId () ) )
				.collect ( Collectors.toSet () );
			
			var allPubSize = allPubs.size (); // we want this to be shown, despite the filter
			
			AttributeName attYear = getAttributeName ( graph, "YEAR" );
			List<Integer> newPubs = PublicationUtils.newPubsByNumber ( 
				allPubs, 
				attYear, 
				config.getDefaultExportedPublicationCount () 
			);
			
			// Get best labels for publications and add to the rest
			if ( !newPubs.isEmpty () )
			{
				List<String> pubLabels = newPubs.stream ()
				.map ( graph::getConcept )
			  .map ( GraphLabelsUtils::getBestConceptLabel )
			  // TODO: is this right?! What if the name IS NOT a PMID?!
			  .map ( name -> name.contains ( "PMID:" ) ? name : "PMID:" + name )
			  .collect ( Collectors.toList () );
				
				byCCRelatedLabels.put ( "Publication", pubLabels );
			}

	
			// And eventually, create output string for evidences column in GeneView table
			// 
			String evidenceStr = byCCRelatedLabels.entrySet ()
			.stream ()
			.map ( cc2Labels -> {
				// Values in the results are like: "Protein__23__label1//label2//...||Publication__12__..."
				// Here we spawn each string in a ||-delimited block
				String ccId = cc2Labels.getKey ();
				List<String> labels = cc2Labels.getValue ();
				var reportedSize = "Publication".equals ( ccId ) ? allPubSize : labels.size (); 
				return ccId + "__" + reportedSize + "__" + String.join ( "//", labels );
			})
			// And then we join all the per-CC strings 
			.collect ( Collectors.joining ( "||" ) );
							
			if ( luceneHits.isEmpty () && listMode.equals ( "GLrestrict" ) ) continue;
			
			// TODO: is this right?!
			if ( ! ( !evidenceStr.isEmpty () || qtls.isEmpty () ) ) continue;
			
			out.append (
				geneId + "\t" + GraphLabelsUtils.getBestGeneAccession ( gene ) + "\t" + geneName + "\t" + geneHelper.getChromosome () + "\t" 
				+ geneHelper.getBeginBP ( true ) + "\t" + geneHelper.getTaxID () + "\t" 
				+ new DecimalFormat ( "0.00" ).format ( score ) + "\t" + (isInList ? "yes" : "no" ) + "\t" + infoQTLStr + "\t" 
				+ evidenceStr + "\n" 
			);
	
		} // for candidates
		log.info ( "Gene table generated" );
		return out.toString ();
	
	} // exportGeneTable()
	
	
  /**
   * Renders Genomap XML, that is the KnetMiner chromosome view, in the second UI tab ('Map View').
   * 
   * @param apiUrl the URL of the invocation that generated current results, used to be included in the result
   * @param genes list of genes to be displayed (all genes for search result)
   * @param userGenes gene list from user
   * @param userQtlStr user QTLs
   * @param keyword user-specified keyword
   * 
   * Was named writeAnnotationXML
   */
	public String exportGenomapXML ( 
		String apiUrl, List<ONDEXConcept> genes, Set<ONDEXConcept> userGenes, List<String> userQtlStr,
		String keyword, int maxGenes, Map<ONDEXConcept, Double> scoredCandidates
	)
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
				exLog.logEx ( "Failed to find QTLs" , e );
			}
		}

		StringBuffer sb = new StringBuffer ();
		sb.append ( "<?xml version=\"1.0\" standalone=\"yes\"?>\n" );
		sb.append ( "<genome>\n" );
		int id = 0;

		// genes are grouped in three portions based on size
		int size = Math.min ( genes.size (), maxGenes );

		log.info ( "visualize genes: " + genes.size () );
		for ( ONDEXConcept gene : genes )
		{
			var geneHelper = new GeneHelper ( graph, gene );
			
			// only genes that are on chromosomes (not scaffolds)
			// can be displayed in Map View
			String chr = geneHelper.getChromosome ();
			if ( chr == null || "U".equals ( chr ) )
				continue;
			
			int beg = geneHelper.getBeginBP ( true );
			int end = geneHelper.getEndBP ( true );

			// TODO: shortest acc methods? This is just a bit faster and picks the first one because
			// any is fine for querying.
			String queryAcc = gene.getPID ();
			for ( ConceptAccession acc : gene.getConceptAccessions () )
				queryAcc = acc.getAccession ();

			String label = GraphLabelsUtils.getBestConceptLabel ( gene );
			String query = null;
			try
			{
				query = "keyword=" + URLEncoder.encode ( keyword, "UTF-8" ) + "&amp;list="
						+ URLEncoder.encode ( queryAcc, "UTF-8" );
			}
			catch ( UnsupportedEncodingException e )
			{
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
			if ( scoredCandidates != null && scoredCandidates.get ( gene ) != null )
				score = scoredCandidates.get ( gene ); // fetch score
			
			sb.append ( "<score>" + score + "</score>\n" ); // score
			sb.append ( "</feature>\n" );

			if ( ++id >= maxGenes ) break;
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

		final var taxIds = this.dataService
			.getConfiguration ()
			.getServerDatasetInfo ()
			.getTaxIds ();
		
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
				if ( taxIds.contains ( loci.getTaxID () ) )
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
   * Export the evidence Table for the KnetMiner 'Evidence View' tab (the third one).
   *
   */
	public String exportEvidenceTable ( 
		String keywords, Map<ONDEXConcept, Float> foundConcepts, Set<ONDEXConcept> userGenes, List<String> qtlsStr 
	)
	{
		if ( userGenes == null ) userGenes = Set.of ();
		if ( foundConcepts == null ) foundConcepts = Map.of ();
		
    var graph = dataService.getGraph ();
		
    /*
   	 * Edge cases:
   	 * keywords          user genes                   result
   	 * no match          !null, no match							empty
 		 * some match        !null, no match              total genes, 0 for user genes
 		 * some match        some match                   filter user genes = 0
 		 * null              sem motif matches            total genes, user genes
 		 *  
 		 * So, this should do:
 		 *   for a result list, if there is at least one user gene that isn't 0, filter 0s
 		 *   else, user genes are all at 0, don't filter
     */
		
    // We're going to update it in parallel, need to support it 
		Queue<OptionsMap> results = new ConcurrentLinkedQueue<> ();

		// This doesn't need concurrency management, cause it can only be toggled to true 
		var hasMatchingUserGenes = new MutableBoolean ( false );
		
		// The rest is r-o or not used in parallel
		//
		var genes2Concepts = semanticMotifDataService.getGenes2Concepts ();			
		int allGenesSize = genes2Concepts.keySet ().size ();
		int userGenesSize = userGenes.size ();

		log.info ( "Generating Evidence table" );
		
		List<QTL> qtls = QTL.fromStringList ( qtlsStr ); // it's never null					

		// final proxies needed within lambdas
		final var foundConceptsRo = foundConcepts;
		final var userGenesRo = userGenes;
		
		foundConcepts.keySet () 
		.parallelStream ()
		.forEach ( (ONDEXConcept foundConcept) -> 
		{
			double score = 1d * foundConceptsRo.get ( foundConcept );
			
			if ( foundConcept instanceof LuceneConcept )
				foundConcept = ((LuceneConcept) foundConcept).getParent ();

			// Creates type,name,score and numberOfGenes
			String foundType = foundConcept.getOfType ().getId ();
			
			// We don't want these in the evidence view 
			if ( Stream.of ( "Publication", "Protein", "Enzyme" ).anyMatch ( t -> t.equals ( foundType ) ) ) 
				return;

			String foundName = GraphLabelsUtils.getBestConceptLabel ( foundConcept );

			var concepts2Genes = semanticMotifDataService.getConcepts2Genes ();
			var genes2QTLs = semanticMotifDataService.getGenes2QTLs ();
			
			Integer ondexId = foundConcept.getId ();
			if ( !concepts2Genes.containsKey ( ondexId ) ) return;
			
			Set<Integer> startGeneIds = concepts2Genes.get ( ondexId );
			Integer startGenesSize = startGeneIds.size ();
			
			Set<String> userGeneLabels = ConcurrentHashMap.newKeySet ();
			var qtlsSize = new AtomicInteger ( 0 );

			// Consider the genes to which this concept is related
			//
			startGeneIds.parallelStream ()
			.forEach ( (Integer startGeneId) ->
			{
				ONDEXConcept startGene = graph.getConcept ( startGeneId );
				var geneHelper = new GeneHelper ( graph, startGene );
				
				if ( startGene != null && userGenesRo.contains ( startGene ) )
					userGeneLabels.add ( GraphLabelsUtils.getBestGeneAccession ( startGene ) );

				if ( genes2QTLs.containsKey ( startGeneId ) ) qtlsSize.incrementAndGet ();

				String chr = geneHelper.getChromosome ();
				int beg = geneHelper.getBeginBP ( true );
					
				
				// Count the matching QTLs
				//
				int matchingQtls = (int) qtls.parallelStream ()
				.filter ( (QTL loci) -> {
					String qtlChrom = loci.getChromosome ();
					Integer qtlStart = loci.getStart ();
					Integer qtlEnd = loci.getEnd ();
					return qtlChrom.equals ( chr ) && beg >= qtlStart && beg <= qtlEnd;
				})
				.count ();
				
				if ( matchingQtls > 0 ) qtlsSize.addAndGet ( matchingQtls );
				
			}); // for searchedGeneId

			
			// quick adjustment to the score to make it a P-value from F-test instead
			int matchedInGeneList = userGeneLabels.size ();
			int notMatchedInGeneList = userGenesSize - matchedInGeneList;
			int matchedNotInGeneList = startGenesSize - matchedInGeneList;
			int notMatchedNotInGeneList = allGenesSize - matchedNotInGeneList - matchedInGeneList - notMatchedInGeneList;

			// -1 stands for not applicable/not computed. If it's computed, 0 is a possible value, so it
			// cannot be used to convey the same meaning.
			//
			double pvalue = -1d;
			if ( matchedInGeneList > 0 )
			{
				FisherExact fisherExact = new FisherExact ( allGenesSize );
				pvalue = fisherExact.getP ( 
					matchedInGeneList, matchedNotInGeneList, notMatchedInGeneList, notMatchedNotInGeneList
				);
			}
			
			var result = OptionsMap.from ( Map.of ( 
				"type", foundType,
				"name", foundName,
				"score", score,
				"pvalue", pvalue,
				"genesSize", startGenesSize,
				"userGeneLabels", userGeneLabels,
				"qtlsSize", qtlsSize.get (),
				"ondexId", ondexId
			));			
			results.add ( result );
			
			// It doesn't need synch, cause it is only set to to true and doesn't matter if it's done more times
			if ( hasMatchingUserGenes.isFalse () && !userGeneLabels.isEmpty () ) 
				hasMatchingUserGenes.setTrue ();
			
		}); // for foundConcepts()
		
		// Final filtering of 0-size user gene rows, translation to string and counting
		//
		var tableSize = new MutableInt ( 0 );	
		String tableStr = 
		results.stream ()
		.filter ( result -> {
			// As explained above, let's keep user genes with > 0 count, if any
			if ( hasMatchingUserGenes.isFalse () ) return true;
			
			Set<String> userGeneLabels = result.getOpt ( "userGeneLabels" );
			return userGeneLabels.size () > 0;
		})
		// Yields a row
		.map ( result -> 
		{
			tableSize.increment ();
			
			Set<String> userGeneLabels = result.getOpt ( "userGeneLabels" );
			var userGenesStr = userGeneLabels.size () == 0
				? ""
				: userGeneLabels.stream ().collect ( Collectors.joining ( "," ) ); 
						
			return 
				result.getString ( "type" ) + "\t" + 
				result.getString ( "name" ) + "\t" +
				result.getDouble ( "score" ) + "\t" + 
				result.getDouble ( "pvalue" ) + "\t" + 
				result.getInt ( "genesSize" ) + "\t" + 
				userGenesStr + "\t" + 
				result.getInt ( "qtlsSize" ) + "\t" +
				result.getInt ( "ondexId" );
		})
		.collect ( Collectors.joining ( "\n" ) );
		
		// Required by the client TSV reader
		if ( !tableStr.isEmpty () ) tableStr += "\n";
		
		log.info ( "Returning {} row(s) for the evidence table", tableSize.getValue () );
		
		return "TYPE\tNAME\tSCORE\tP-VALUE\tGENES\tUSER_GENES\tQTLs\tONDEXID\n" + tableStr;
		
	} // exportEvidenceTable()	
}
