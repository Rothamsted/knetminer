package uk.ac.rothamsted.knetminer.backend;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UncheckedIOException;
import java.io.Writer;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;
import java.util.zip.GZIPOutputStream;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.simple.JSONObject;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.algorithm.graphquery.AbstractGraphTraverser;
import net.sourceforge.ondex.algorithm.graphquery.nodepath.EvidencePathNode;
import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXGraphMetaData;
import net.sourceforge.ondex.core.searchable.LuceneEnv;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;
import net.sourceforge.ondex.logging.ONDEXLogger;
import rres.knetminer.datasource.api.config.DatasetInfo;
import rres.knetminer.datasource.api.config.KnetminerConfiguration;
import rres.knetminer.datasource.api.config.ServerDatasetInfo;
import uk.ac.ebi.utils.collections.OptionsMap;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UnexpectedValueException;
import uk.ac.ebi.utils.io.SerializationUtils;
import uk.ac.ebi.utils.opt.io.IOUtils;
import uk.ac.ebi.utils.runcontrol.PercentProgressLogger;

/**
 * 
 * The core functionality.
 * 
 * This realises the core functions of creating the Lucene Index for an OXL, running a 
 * {@link AbstractGraphTraverser graph traverser} and saving the corresponding output.
 * 
 * As described in the POM, these are off-line data initialisations that benefit KnetMiner. 
 *
 * TODO: probably some methods require thread safety (get {@link #getGraph()}.
 * 
 * @author brandizi
 * @author jojicunnunni
 * 
 * <dl><dt>Date:</dt><dd>13 Feb 2022</dd></dl>
 *
 */
@Component
public class KnetMinerInitializer
{
	/**
	 * Where {@link #exportGraphStats()} saves its output (in {@link KnetminerConfiguration#getDataDirPath()}).
	 */
	public static final String GRAPH_STATS_FILE_NAME = "knowledge-network-stats.json"; 
	
	private ONDEXGraph graph;
	
	private KnetminerConfiguration config;
	
	private String dataDirPath;
	private String oxlFilePath;
	
	
	private LuceneEnv luceneMgr;
	
	private AbstractGraphTraverser graphTraverser;
	
	private Set<ONDEXConcept> seedGenes;
	
	private Map<Integer, Set<Integer>> genes2Concepts;
	private Map<Integer, Set<Integer>> concepts2Genes;
	private Map<Pair<Integer, Integer>, Integer> genes2PathLengths;
	
	private int genomeGenesCount = -1;

	
	private Logger log = LogManager.getLogger ( this.getClass () );

		
	/**
	 * Does all the initialisation work, by calling initXXX() methods.
	 * 
	 * @param overridingConfig if not null, sets up the Knetminer configuration to work with with this 
	 * object and proceeds with the initialisation. If it's null, it gets the configuration from 
	 * {@link #loadKnetminerConfiguration()}, that is, uses {@link #getConfigYmlPath() the configuration path}.
	 * 
	 */
	public void initKnetMinerData ( boolean doReset )
	{	
		this.initGenesCount ();
		this.initLuceneData ( doReset );
		this.initSemanticMotifData ( doReset );
		this.exportGraphStats ();
	}
	
	public void initKnetMinerData ()
	{
		initKnetMinerData ( false );
	}

	
	/**
	 * Initialises {@link #getGenomeGenesCount()}
	 */
	private void initGenesCount ()
	{
		ConceptClass ccGene = ONDEXGraphUtils.getConceptClass ( graph, "Gene" );
		Set<ONDEXConcept> seed = graph.getConceptsOfConceptClass ( ccGene );

		var dsetInfo = this.getKnetminerConfiguration ().getServerDatasetInfo ();
		
		this.genomeGenesCount = (int) seed.parallelStream ()
		// TODO: use GeneHelper, after re-arranging Maven structure and putting it into core utils
		.map ( gene -> ONDEXGraphUtils.getAttrValueAsString ( graph, gene, "TAXID", false ) )
		.filter ( dsetInfo::containsTaxId )
		.count ();
	}	
	
	
	/**
	 * Defaults to false.
	 */
	public void initLuceneData ()
	{
		initLuceneData ( false );
	}

	
	/**
	 * Indexes the {@link #getGraph() graph} using {@link LuceneEnv}.
	 * Requires {@link #loadOptions()} to be invoked before this.
	 * 
	 * @param doReset, when true, forces the recreation of the index files, even if they exist. Else, re-index
	 * only if the index directory doesn't exist yet. 
	 * 
	 */
	public void initLuceneData ( boolean doReset )
	{
		try 
		{
			String dataDirPath = this.getDataDirPath ();
			if( dataDirPath == null ) throw new UnexpectedValueException ( "dataDirPath is null" );
	
			File indexFile = Paths.get ( dataDirPath, "index" ).toFile();

      // We don't have the OXL file path here, so, let's give up with checking its date. 
      // we can do that in the data building pipeline
      //
      if ( indexFile.exists() )
      {
    	  if ( !doReset ) {
    		log.info ( "Skipping Ondex/Lucene indexing and reusing existing index files" );
    		return;
    	  }
        log.info("Graph file updated since index last built, deleting old index");
        FileUtils.deleteDirectory ( indexFile );
      }
  
      log.info ( "Building Lucene Index: " + indexFile.getAbsolutePath() );
      this.luceneMgr = new LuceneEnv ( indexFile.getAbsolutePath(), !indexFile.exists() );
      luceneMgr.addONDEXListener( new ONDEXLogger() ); // sends Ondex messages to the logger.
      luceneMgr.setONDEXGraph ( graph );
      luceneMgr.setReadOnlyMode ( true );
		
		  log.info ( "Ondex graph indexed" );
    } 
    catch (Exception e)
    {
      log.error ( "Error while loading/creating graph index: " + e.getMessage (), e );
      ExceptionUtils.throwEx (
      	RuntimeException.class, e, "Error while loading/creating graph index: %s", e.getMessage ()
      ); 
    }
	}
	
	
	/**
	 * Gets the genes to start the {@link #createTraverserData() traverser from}.
	 * 
	 * This comes from either one of the two sources:
	 *  
	 * - the 'seedGenesFile' {@link #getOptions() option}, if this is defined
	 * - else the 'SpeciesTaxId' {@link #getOptions() option} 
	 *
	 */
	
	public Set<ONDEXConcept> getSeedGenes ()
	{
		if ( this.seedGenes != null ) return seedGenes;
		
		String seedGenesPath = StringUtils.trimToNull ( getKnetminerConfiguration ().getSeedGenesFilePath () );
		if ( seedGenesPath == null )
		{
			log.info ( 
				"Initialising seed genes from TAXID list: {}", this.config.getServerDatasetInfo ().getTaxIds ()
			);
			return this.seedGenes = fetchSeedGenesFromTaxIds ();
		}
		
		log.info ( "Initialising seed genes from file: '{}' ", seedGenesPath );
		return this.seedGenes = AbstractGraphTraverser.ids2Genes ( this.graph, seedGenesPath );
	}
	
	private Set<ONDEXConcept> fetchSeedGenesFromTaxIds ()
	{
		ONDEXGraphMetaData meta = graph.getMetaData ();
		ConceptClass ccGene = meta.getConceptClass ( "Gene" );
		AttributeName attTaxId = meta.getAttributeName ( "TAXID" );

		Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass ( ccGene );
		
		Set<String> taxIds = this.config.getServerDatasetInfo ().getTaxIds ();
		
		return genes
			.parallelStream ()
			.filter ( gene -> gene.getAttribute ( attTaxId ) != null )
			.filter ( gene -> taxIds.contains ( gene.getAttribute ( attTaxId ).getValue ().toString () ) )
			.collect ( Collectors.toSet () );
	}	
	

	/**
	 * Defaults to false
	 */
	public void initSemanticMotifData ()
	{
		initSemanticMotifData ( false );
	}


  /**
   * Populates internal data about semantic motif paths, either using the configured {@link AbstractGraphTraverser}
   * or loading previously saved data from files.
   * 
   * This is made public for the purpose of re-running a traverser with different options (eg, the CypherDebugger
   * sets new queries and then re-runs).
   * 
   * If doReset is true it always regenerate the data, without considering existing computed
   * files. This is used by components like CypherDebugger.
   * 
   * This can be called independently of {@link #initKnetMinerData()}, to trigger a new traversal, however,
   * that requires proper initialisation already in place, ie, {@link #loadOptions()}.
   * 
   */
	@SuppressWarnings ( "rawtypes" )
	public void initSemanticMotifData ( boolean doReset )
	{
		log.info ( "Initializing semantic motif data" );
		
		var dataPath = this.getDataDirPath ();
		
		File fileConcept2Genes = Paths.get ( dataPath, "concepts2Genes.ser" ).toFile ();
		File fileGene2Concepts = Paths.get ( dataPath, "genes2Concepts.ser" ).toFile ();
		File fileGene2PathLength = Paths.get ( dataPath, "genes2PathLengths.ser" ).toFile ();

		File graphFile = new File ( this.getOxlFilePath () );
		
		if ( doReset || 
			fileConcept2Genes.exists () && graphFile.exists () 
			&& fileConcept2Genes.lastModified () < graphFile.lastModified () 
		)
		{
			log.info ( "(Re)creating semantic motif files, as per doReset flag" );
			fileConcept2Genes.delete ();
			fileGene2Concepts.delete ();
			fileGene2PathLength.delete ();
		}

		if ( !fileConcept2Genes.exists () )
		{
			log.info ( "Creating semantic motif data" );
			var seedGenes = this.getSeedGenes ();
			
			// We're going to need a lot of memory, so delete this in advance
			// (CyDebugger might trigger this multiple times)
			//
			this.concepts2Genes = new HashMap<> ();
			this.genes2Concepts = new HashMap<> ();
			this.genes2PathLengths = new HashMap<> ();

			// the results give us a map of every starting concept to every
			// valid path.
			var graphTraverser = this.getGraphTraverser ();
			Map<ONDEXConcept, List<EvidencePathNode>> traverserPaths = graphTraverser.traverseGraph ( graph, seedGenes, null );

			// Performance stats reporting about the Cypher-based traverser is disabled after the initial
			// traversal. This option has no effect when the SM-based traverser is used.
			graphTraverser.setOption ( "performanceReportFrequency", -1 );

			log.info ( "Generating semantic motif summary tables" );
			var progressLogger = new PercentProgressLogger ( "{}% of paths stored", traverserPaths.values ().size () );
			
			for ( List<EvidencePathNode> paths : traverserPaths.values () )
			{
				// We dispose them after use, cause this is big and causing memory overflow issues
				paths.removeIf ( path -> {

					// search last concept of semantic motif for keyword
					ONDEXConcept gene = (ONDEXConcept) path.getStartingEntity ();

					// add all semantic motifs to the new graph
					// Set<ONDEXConcept> concepts = path.getAllConcepts();
					// Extract pathLength and endNode ID.
					int pathLength = ( path.getLength () - 1 ) / 2; // get Path Length
					ONDEXConcept con = (ONDEXConcept) path.getConceptsInPositionOrder ()
						.get ( path.getConceptsInPositionOrder ().size () - 1 );

					int lastConID = con.getId ();
					int geneId = gene.getId ();
					var gene2ConceptKey = Pair.of ( geneId, lastConID );
					
					genes2PathLengths.merge ( gene2ConceptKey, pathLength, Math::min );

					genes2Concepts.computeIfAbsent ( geneId, thisGeneId -> new HashSet<> () )
					.add ( lastConID );
					
					concepts2Genes.computeIfAbsent ( lastConID, thisGeneId -> new HashSet<> () )
					.add ( geneId );

					// ALWAYS return this to clean up memory (see above)
					return true;
				}); // paths.removeIf ()
				progressLogger.updateWithIncrement ();
			} // for traverserPaths.values()

			log.info ( "Dumping semantic motif summary tables on files, at \"{}\"", dataPath );
			try
			{
				 SerializationUtils.serialize ( fileConcept2Genes, concepts2Genes );
				 SerializationUtils.serialize ( fileGene2Concepts, genes2Concepts );
				 SerializationUtils.serialize ( fileGene2PathLength, genes2PathLengths );
			}
			catch ( Exception ex )
			{
				log.error ( "Failed while creating internal map files: " + ex.getMessage (), ex );
				ExceptionUtils.throwEx ( 
					RuntimeException.class, ex, "Failed while creating internal map files: %s", ex.getMessage () 
				);
			}
		} 
		else
		{
			// Files exist and are up-to-date, try to read them
			//
			log.info ( "Loading semantic motif data from existing support files" );
			
			try
			{
				 concepts2Genes = SerializationUtils.deserialize ( fileConcept2Genes );
				 genes2Concepts = SerializationUtils.deserialize ( fileGene2Concepts );
				 genes2PathLengths = SerializationUtils.deserialize ( fileGene2PathLength );
			}
			catch ( Exception e )
			{
				ExceptionUtils.throwEx ( 
					RuntimeException.class, e, "Failed while reading internal map files: %s", e.getMessage ()
				);
			}
		}
		
		BiConsumer<String, Map<?,?>> nullChecker = (name, coll) -> 
		{
			if ( coll == null || coll.isEmpty () ) log.warn ( "{} is null/empty", name );
			else log.info ( "{} populated with {} elements", name, coll.size () );
		};
		
		nullChecker.accept ( "genes2Concepts", genes2Concepts );
		nullChecker.accept ( "concepts2Genes", concepts2Genes );
		nullChecker.accept ( "genes2PathLengths", genes2PathLengths );
		
		log.info ( "Semantic motif data initialization ended." );
		
		// this remains in KnetMiner for the moment. Pushing it down to this component will require:
		// 1) That GeneHelper is also moved to some utility class (which Knetminer module? To be decided)
		// 2) that this is also saved on disk: Map<Integer, Set<Integer>> genes2QTLs
		// postInit ( seedGenes );
	}
	 
	
  /**
   * Computes and saves (into {@link #GRAPH_STATS_FILE_NAME}) various statistics about the current 
   * dataset (the OXL) and the semantic motifs computed from it. 
   *
   */
	@SuppressWarnings ( "unchecked" )
	public void exportGraphStats ()
	{
		ONDEXGraph graph = this.getGraph ();
		var dataPath = this.getKnetminerConfiguration ().getDataDirPath ();
		var exportFilePath = dataPath + '/' + GRAPH_STATS_FILE_NAME;
		
		log.info ( "Saving graph stats to '{}'", exportFilePath );

		int totalGenes = this.getGenomeGenesCount ();
		int totalConcepts = graph.getConcepts ().size ();
		int totalRelations = graph.getRelations ().size ();
		
		var concepts2Genes = this.getConcepts2Genes ();
		int totalEvidenceConcepts = concepts2Genes.size ();

		int [] minConceptsPerGene = new int[] { totalEvidenceConcepts > 0 ? Integer.MAX_VALUE : 0 },
			maxConceptsPerGene = new int [] { 0 },
			// Don't confuse this with total no. of concepts (same concepts can be linked multiple times)
			totalLinkedConcepts = new int [] { 0 }; 

		// Min/Max/avg per each gene-related concept group
		var genes2Concepts = this.getGenes2Concepts ();
		
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
			ExceptionUtils.throwEx ( 
				UncheckedIOException.class, ex, "Error while writing stats for the Knetminer graph: $cause" 
			);
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
	 * The graph to work with. This has to be loaded separately, via 
	 * {@code net.sourceforge.ondex.parser.oxl.Parser}. See {@code KnetMinerInitializer}.
	 * 
	 */
	public ONDEXGraph getGraph ()
	{
		return graph;
	}


	public void setGraph ( ONDEXGraph graph )
	{
		this.graph = graph;
	}


	/**
	 * The Knetminer configuration used to manage the initialisation process.
	 * 
	 * @see {@link #initKnetMinerData(KnetminerConfiguration)}. This can be either passed at initialisation time, or
	 * loaded from {@link #getConfigYmlPath()}.
	 * 
	 */
	public KnetminerConfiguration getKnetminerConfiguration ()
	{
		return config;
	}
	
	public void setKnetminerConfiguration ( KnetminerConfiguration config )
	{
		this.config = config;
	}

	public void setKnetminerConfiguration ( String configYmlPath )
	{
		this.setKnetminerConfiguration ( KnetminerConfiguration.load ( configYmlPath ) );
	}
	
	
	
	public String getDataDirPath ()
	{
		return dataDirPath == null ? this.getKnetminerConfiguration ().getDataDirPath () : dataDirPath;
	}



	public void setDatDirPath ( String dataDirPath )
	{
		this.dataDirPath = dataDirPath;
	}



	public String getOxlFilePath ()
	{
		return oxlFilePath == null ? this.getKnetminerConfiguration ().getOxlFilePath () : oxlFilePath;
	}



	public void setOxlFilePath ( String oxlFilePath )
	{
		this.oxlFilePath = oxlFilePath;
	}



	/**
	 * Uses {@link #getGraphTraverserFQN()} to initialise the graph traverser.
	 * This is used by {@link #initSemanticMotifData(boolean)}.
	 * 
	 */
	public AbstractGraphTraverser getGraphTraverser ()
	{
		if ( this.graphTraverser != null ) return graphTraverser;
		
		OptionsMap traverserOpts = this.config.getGraphTraverserOptions ();
		return graphTraverser =  AbstractGraphTraverser.getInstance ( traverserOpts );
	}

	public LuceneEnv getLuceneMgr ()
	{
		return luceneMgr;
	}

	public Map<Integer, Set<Integer>> getGenes2Concepts ()
	{
		return genes2Concepts;
	}

	public Map<Integer, Set<Integer>> getConcepts2Genes ()
	{
		return concepts2Genes;
	}

	public Map<Pair<Integer, Integer>, Integer> getGenes2PathLengths ()
	{
		return genes2PathLengths;
	}
	
	/**
	 * The number of genes in the graph that belong to the 
	 * {@link ServerDatasetInfo#containsTaxId(String) configured TAX IDs}.
	 * 
	 */
	public int getGenomeGenesCount ()
	{
		return genomeGenesCount;
	}
	
}
