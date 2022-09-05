package rres.knetminer.datasource.ondexlocal.service;

import java.io.File;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.algorithm.graphquery.AbstractGraphTraverser;
import net.sourceforge.ondex.algorithm.graphquery.nodepath.EvidencePathNode;
import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXGraphMetaData;
import rres.knetminer.datasource.ondexlocal.service.utils.GeneHelper;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.io.SerializationUtils;
import uk.ac.ebi.utils.runcontrol.PercentProgressLogger;

/**
 * The semantic motif data sub-service for {@link OndexServiceProvider}.
 * 
 * Deals with basic semantic motif-related functionality, such as graph traversing and storage of its
 * results.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>25 Jan 2021</dd></dl>
 *
 */
@Component
public class SemanticMotifDataService
{

	public static final String OPT_SEED_GENES_FILE = "seedGenesFile";

	private AbstractGraphTraverser graphTraverser;

	private Map<Integer, Set<Integer>> genes2Concepts;
	private Map<Integer, Set<Integer>> concepts2Genes;
	private Map<Pair<Integer, Integer>, Integer> genes2PathLengths;
	private Map<Integer, Set<Integer>> genes2QTLs;

	
	private final Logger log = LogManager.getLogger ( getClass() );
	
	@Autowired
	private DataService dataService;
	
	
	private SemanticMotifDataService () {}

	/**
	 * Maps gene concept IDs to ID of related concepts, as computed by the semantic motif traverser. 
	 */
	public Map<Integer, Set<Integer>> getGenes2Concepts ()
	{
		return genes2Concepts;
	}
	
	
	/**
	 * Maps gene concept IDs to ID of related concepts, as computed by the semantic motif traverser. 
	 */
	public Map<Integer, Set<Integer>> getConcepts2Genes ()
	{
		return concepts2Genes;
	}

	/**
	 * Maps pairs of ONDEX gene ID + concept ID to the corresponding length of the semantic motif that links the 
	 * gene to the concept.
	 */
	Map<Pair<Integer, Integer>, Integer> getGenes2PathLengths ()
	{
		return genes2PathLengths;
	}

	Map<Integer, Set<Integer>> getGenes2QTLs ()
	{
		return genes2QTLs;
	}

	/**
	 * WARNING: this is exposed mainly for diagnostics purposes (eg, CypherDebugger checks the completion 
	 * progress). You shouldn't let higher-level code (ie, dealing with abstractions like "genes" or "semantic 
	 * motifs" to mess up with this class. If you need the traverser, consider first adding methods to this class
	 * or writing a subclass of it, or some other component that stays in this same package.   
	 * 
	 */
	public AbstractGraphTraverser getGraphTraverser ()
	{
		return graphTraverser;
	}
	
	private void initGraphTraverser ()
	{
		if ( graphTraverser != null ) return;

		// The traverser will get all of our config opts, its initial configuration
		// is possibly overridden/extended
		graphTraverser = AbstractGraphTraverser.getInstance (
			dataService.getConfiguration ().getGraphTraverserOptions ()
		);

		graphTraverser.setOption ( "ONDEXGraph", dataService.getGraph () );
	}
	
	/**
	 * Defaults to false.
	 * 
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
   * TODO: was populateSemanticMotifData().
   */
	@SuppressWarnings ( "rawtypes" )
	public void initSemanticMotifData ( boolean doReset )
	{
		log.info ( "Initializing semantic motif data" );
		
		initGraphTraverser ();		
		
		var config = dataService.getConfiguration ();
		var graphFileName = config.getOxlFilePath ();
		var dataPath = config.getDataDirPath ();
		var graph = dataService.getGraph ();
		
		File graphFile = new File ( graphFileName );
		File fileConcept2Genes = Paths.get ( dataPath, "concepts2Genes" ).toFile ();
		File fileGene2Concepts = Paths.get ( dataPath, "genes2Concepts" ).toFile ();
		File fileGene2PathLength = Paths.get ( dataPath, "genes2PathLengths" ).toFile ();
		log.info ( "Generate HashMap files: concepts2Genes & genes2Concepts..." );

		var seedGenes = this.loadSeedGenes ();

		if ( doReset || fileConcept2Genes.exists () && ( fileConcept2Genes.lastModified () < graphFile.lastModified () ) )
		{
			log.info ( "(Re)creating semantic motif files, due to {}", doReset ? "reset flag invocation" : "outdated files" );
			fileConcept2Genes.delete ();
			fileGene2Concepts.delete ();
			fileGene2PathLength.delete ();
		}

		if ( !fileConcept2Genes.exists () )
		{
			log.info ( "Creating semantic motif data" );
			// We're going to need a lot of memory, so delete this in advance
			// (CyDebugger might trigger this multiple times)
			//
			concepts2Genes = new HashMap<> ();
			genes2Concepts = new HashMap<> ();
			genes2PathLengths = new HashMap<> ();

			// the results give us a map of every starting concept to every
			// valid path.
			Map<ONDEXConcept, List<EvidencePathNode>> traverserPaths = graphTraverser.traverseGraph ( graph, seedGenes, null );

			// Performance stats reporting about the Cypher-based traverser is disabled after the initial
			// traversal. This option has no effect when the SM-based traverser is used.
			graphTraverser.setOption ( "performanceReportFrequency", -1 );

			log.info ( "Also, generate geneID//endNodeID & pathLength in HashMap genes2PathLengths..." );
			var progressLogger = new PercentProgressLogger ( 
				"{}% of paths stored", traverserPaths.values ().size () 
			);
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

					int lastConID = con.getId (); // endNode ID.
					int geneId = gene.getId ();
					var gplKey = Pair.of ( geneId, lastConID );
					genes2PathLengths.merge ( gplKey, pathLength, Math::min );

					genes2Concepts.computeIfAbsent ( geneId, thisGeneId -> new HashSet<> () )
					.add ( lastConID );
					
					concepts2Genes.computeIfAbsent ( lastConID, thisGeneId -> new HashSet<> () )
					.add ( geneId );

					// ALWAYS return this to clean up memory (see above)
					return true;
				} ); // paths.removeIf ()
				progressLogger.updateWithIncrement ();
			} // for traverserPaths.values()

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
				log.error ( "Failed while reading internal map files: " + e.getMessage (), e );
				ExceptionUtils.throwEx ( 
					RuntimeException.class, e, "Failed while reading internal map files: %s", e.getMessage ()
				);
			}
		}
		
		log.info ( "Semantic motif data initialization ended, post-processing" );

		// Moving forward with putting motif data in place.
		//
		postInit ( seedGenes );
	}
	
	private void postInit ( Set<ONDEXConcept> seedGenes )
	{
		var graph = dataService.getGraph ();
		
		ConceptClass ccQTL = graph.getMetaData ().getConceptClass ( "QTL" );
		Set<ONDEXConcept> qtls = ccQTL == null ? new HashSet<> () : graph.getConceptsOfConceptClass ( ccQTL );
		
		BiConsumer<String, Map<?,?>> nullChecker = (name, coll) -> 
		{
			if ( coll == null || coll.isEmpty () ) log.warn ( "{} is null", name );
			else log.info ( "{} populated with {} elements", name, coll.size () );
		};
		
		nullChecker.accept ( "genes2Concepts", genes2Concepts );
		nullChecker.accept ( "concepts2Genes", concepts2Genes );
		nullChecker.accept ( "genes2PathLengths", genes2PathLengths );

		
		log.info ( "Creating Gene2QTL map" );

		genes2QTLs = new HashMap<> ();
		PercentProgressLogger progressLogger = new PercentProgressLogger ( "{}% of genes processed", seedGenes.size () );
		
		for ( ONDEXConcept gene : seedGenes )
		{
			GeneHelper geneHelper = new GeneHelper ( graph, gene );
			String geneChromosome = geneHelper.getChromosome ();
			if ( geneChromosome == null ) continue;
			
			int gbegin = geneHelper.getBeginBP ( true );
			int gend = geneHelper.getEndBP ( true );

			for ( ONDEXConcept qtl: qtls )
			{
				GeneHelper qtlHelper = new GeneHelper ( graph, qtl );
				if ( ! ( gbegin >= qtlHelper.getBeginBP ( true ) ) ) continue;
				if ( ! ( gend <= qtlHelper.getEndBP ( true ) ) ) continue;
				
				genes2QTLs.computeIfAbsent ( gene.getId (), thisQtlId -> new HashSet<> () )
				.add ( qtl.getId () );
			}
			progressLogger.updateWithIncrement ();
		}

		log.info ( "Populated Gene2QTL with {} mapping(s)", genes2QTLs.size () );		
		log.info ( "End of semantic motif initialization post-processing" );		
	}	
	
	/**
	 * Gets the genes to seed the {@link AbstractGraphTraverser semantic motif traverser}.
	 * 
	 * If the {@link SemanticMotifDataService#OPT_SEED_GENES_FILE} is set in opts, gets such list from
	 * {@link AbstractGraphTraverser#ids2Genes(ONDEXGraph, java.io.File) the corresponding file}, else
	 * it gets all the genes in graph that have their TAXID attribute within the taxIds list, as per 
	 * {@link #getSeedGenesFromTaxIds(ONDEXGraph, List)}.
	 * 
	 */
	private Set<ONDEXConcept> loadSeedGenes ()
	{
		String seedGenesPath = StringUtils.trimToNull ( dataService.getConfiguration ().getSeedGenesFilePath () );
		if ( seedGenesPath == null ) {
			log.info ( "Initialising seed genes from TAXID list" );
			return fetchSeedGenesFromTaxIds ();
		}
		
		log.info ( "Initialising seed genes from file: '{}' ", seedGenesPath );
		return AbstractGraphTraverser.ids2Genes ( dataService.getGraph (), seedGenesPath );
	}

	private Set<ONDEXConcept> fetchSeedGenesFromTaxIds ()
	{
		Set<String> myTaxIds = dataService.getConfiguration ()
			.getServerDatasetInfo ()
			.getTaxIds ();
		
		var graph = dataService.getGraph ();
		ONDEXGraphMetaData meta = graph.getMetaData ();
		ConceptClass ccGene = meta.getConceptClass ( "Gene" );
		AttributeName attTaxId = meta.getAttributeName ( "TAXID" );
		Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass ( ccGene );
		
		return genes.parallelStream ()
			.filter ( gene -> gene.getAttribute ( attTaxId ) != null )
			.filter ( gene -> myTaxIds.contains ( gene.getAttribute ( attTaxId ).getValue ().toString () ) )
			.collect ( Collectors.toSet () );
	}		

}
