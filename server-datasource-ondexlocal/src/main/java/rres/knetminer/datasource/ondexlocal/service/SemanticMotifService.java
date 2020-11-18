package rres.knetminer.datasource.ondexlocal.service;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getOrCreateAttributeName;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getOrCreateConceptClass;

import java.io.File;
import java.nio.file.Paths;
import java.util.Collections;
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
import net.sourceforge.ondex.config.ONDEXGraphRegistry;
import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.EntityFactory;
import net.sourceforge.ondex.core.EvidenceType;
import net.sourceforge.ondex.core.MetaDataFactory;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXGraphMetaData;
import net.sourceforge.ondex.core.ONDEXRelation;
import net.sourceforge.ondex.core.RelationType;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.tools.ondex.ONDEXGraphCloner;
import rres.knetminer.datasource.ondexlocal.service.utils.GeneHelper;
import rres.knetminer.datasource.ondexlocal.service.utils.PublicationUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.SearchUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.UIUtils;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.io.SerializationUtils;
import uk.ac.ebi.utils.runcontrol.PercentProgressLogger;

/**
 * The semantic motif sub-service for {@link OndexServiceProvider}.
 * 
 * Deals with semantic motif functions, including graph traversing, searching over
 * semantic motifs, modifying a graph based on semantic motif evidence.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>21 Sep 2020</dd></dl>
 *
 */
@Component
public class SemanticMotifService
{
	public static final String OPT_SEED_GENES_FILE = "seedGenesFile";
	
  private AbstractGraphTraverser graphTraverser;
	
  private Map<Integer, Set<Integer>> genes2Concepts;
  private Map<Integer, Set<Integer>> concepts2Genes;
  private Map<Pair<Integer, Integer>, Integer> genes2PathLengths;
  private Map<Integer, Set<Integer>> genes2QTLs;
  
	@Autowired
	private DataService dataService;
	
	private SemanticMotifService () {}
	
	private final Logger log = LogManager.getLogger ( getClass() );


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
		log.info ( "Setting semantic motif data" );
		
		initGraphTraverser ();		
		
		var graphFileName = dataService.getOxlPath ();
		var dataPath = dataService.getDataPath ();
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
			PercentProgressLogger progressLogger = new PercentProgressLogger ( 
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
		
		// Moving forward with putting motif data in place.
		//
		postProcessInitializedSemanticMotifData ( seedGenes );
	}
	
	private void postProcessInitializedSemanticMotifData ( Set<ONDEXConcept> seedGenes )
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

		log.info ( "Populated Gene2QTL with #mappings: " + genes2QTLs.size () );		
	}

	
  /**
   * Searches genes related to an evidence, fetches the corresponding semantic motifs and merges
   * the paths between them into the resulting graph.
   *
   * Was evidencePath()
   */
	@SuppressWarnings ( "rawtypes" )
	public ONDEXGraph findEvidencePaths ( Integer evidenceOndexId, Set<ONDEXConcept> genes )
	{
		log.info ( "evidencePath() - evidenceOndexId: {}", evidenceOndexId );
    var graph = dataService.getGraph ();
		var concepts2Genes = this.getConcepts2Genes ();

		// Searches genes related to the evidenceID. If user genes provided, only include those.
		Set<ONDEXConcept> relatedONDEXConcepts = new HashSet<> ();
		for ( Integer rg : concepts2Genes.get ( evidenceOndexId ) )
		{
			ONDEXConcept gene = graph.getConcept ( rg );
			if ( genes == null || genes.isEmpty () || genes.contains ( gene ) )
				relatedONDEXConcepts.add ( gene );
		}

		// the results give us a map of every starting concept to every valid
		// path
		Map<ONDEXConcept, List<EvidencePathNode>> evidencePaths = 
			this.getGraphTraverser ().traverseGraph ( graph, relatedONDEXConcepts, null );

		// create new graph to return
		ONDEXGraph subGraph = new MemoryONDEXGraph ( "evidencePathGraph" );
		ONDEXGraphCloner graphCloner = new ONDEXGraphCloner ( graph, subGraph );
		// TODO: what's for?
		ONDEXGraphRegistry.graphs.put ( subGraph.getSID (), subGraph );
		// Highlights the right path and hides the path that doesn't leads to
		// the evidence
		for ( List<EvidencePathNode> evidencePath : evidencePaths.values () )
		{
			for ( EvidencePathNode pathNode : evidencePath )
			{
				// search last concept of semantic motif for keyword
				int indexLastCon = pathNode.getConceptsInPositionOrder ().size () - 1;
				ONDEXConcept lastCon = (ONDEXConcept) pathNode.getConceptsInPositionOrder ().get ( indexLastCon );
				if ( lastCon.getId () == evidenceOndexId ) highlightPath ( pathNode, graphCloner, false );
				
				// TODO: this is the only invocation of this method, to be removed?
				// else hidePath(path,graphCloner);
			}
		}
		ONDEXGraphRegistry.graphs.remove ( subGraph.getSID () );

		return subGraph;
	}
	
	
  /**
   * Generates a subgraph for a set of genes and graph queries. The subgraph is annotated by setting node,ege visibility and size attributes.
   * Annotation is based on either paths to keyword concepts (if provided) or a set of rules based on paths to Trait/Phenotype concepts.
   *
   * @param seed List of selected genes
   * @param keyword
   * @return subGraph
   */
	@SuppressWarnings ( { "rawtypes", "unchecked" } )
	public ONDEXGraph findSemanticMotifs ( Set<ONDEXConcept> seed, String keyword )
	{
		log.info ( "findSemanticMotifs(), keyword: {}", keyword );
		
		// TODO: to be removed after refactoring
		OndexServiceProvider odxService = OndexServiceProvider.getInstance ();
		
		// Searches with Lucene: luceneResults
		Map<ONDEXConcept, Float> luceneResults = null;
		try
		{
			luceneResults = odxService.getSearchService ().searchGeneRelatedConcepts ( keyword, seed, false );
		}
		catch ( Exception e )
		{
			// TODO: does it make sense to continue?!
			// KHP: Does it go here when the keyword is null?
			log.error ( "Lucene search failed", e );
			luceneResults = Collections.emptyMap ();
		}

		var graph = dataService.getGraph ();
		var options = dataService.getOptions ();
		
		// the results give us a map of every starting concept to every valid path
		Map<ONDEXConcept, List<EvidencePathNode>> results = this.getGraphTraverser ()
			.traverseGraph ( graph, seed, null );

		Set<ONDEXConcept> keywordConcepts = new HashSet<> ();
		Set<EvidencePathNode> pathSet = new HashSet<> ();

		// added to overcome double quotes issue
		// if changing this, need to change genepage.jsp and evidencepage.jsp
		keyword = keyword.replace ( "###", "\"" );

		Set<String> keywords = "".equals ( keyword ) 
			? Collections.emptySet ()
			: SearchUtils.getSearchWords ( keyword );
				
		Map<String, String> keywordColourMap = UIUtils.createHilightColorMap ( keywords );
				
		// create new graph to return
		final ONDEXGraph subGraph = new MemoryONDEXGraph ( "SemanticMotifGraph" );
		ONDEXGraphCloner graphCloner = new ONDEXGraphCloner ( graph, subGraph );

		ONDEXGraphRegistry.graphs.put ( subGraph.getSID (), subGraph );

		Set<ONDEXConcept> pubKeywordSet = new HashSet<> ();

		for ( List<EvidencePathNode> paths : results.values () )
		{
			for ( EvidencePathNode path : paths )
			{
				// add all semantic motifs to the new graph
				( (Set<ONDEXConcept>) path.getAllConcepts () )
					.forEach ( graphCloner::cloneConcept );
				
				( (Set<ONDEXRelation>) path.getAllRelations () )
					.forEach ( graphCloner::cloneRelation );

				// search last concept of semantic motif for keyword
				int indexLastCon = path.getConceptsInPositionOrder ().size () - 1;
				ONDEXConcept endNode = (ONDEXConcept) path.getConceptsInPositionOrder ().get ( indexLastCon );

				// no-keyword, set path to visible if end-node is Trait or Phenotype
				if ( keyword == null || keyword.isEmpty() )
				{
					highlightPath ( path, graphCloner, true );
					continue;
				}

				// keyword-mode and end concept contains keyword, set path to visible
				if ( !luceneResults.containsKey ( endNode ) ) {
          // collect all paths that did not qualify
					pathSet.add ( path );
					continue;
				}
				
				// keyword-mode -> do text and path highlighting
				ONDEXConcept cloneCon = graphCloner.cloneConcept ( endNode );

				// highlight keyword in any concept attribute
				if ( !keywordConcepts.contains ( cloneCon ) )
				{
					UIUtils.highlightSearchKeywords ( cloneCon, keywordColourMap );
					keywordConcepts.add ( cloneCon );

					if ( endNode.getOfType ().getId ().equalsIgnoreCase ( "Publication" ) )
						pubKeywordSet.add ( cloneCon );
				}

				// set only paths from gene to evidence nodes to visible
				highlightPath ( path, graphCloner, false );
			} // for path
		} // for paths

		// special case when none of nodes contains keyword (no-keyword-match)
		// set path to visible if end-node is Trait or Phenotype
		if ( keywordConcepts.isEmpty () && ! ( keyword == null || keyword.isEmpty () ) )
			for ( EvidencePathNode path : pathSet )
				highlightPath ( path, graphCloner, true );

		ConceptClass ccPub = subGraph.getMetaData ().getConceptClass ( "Publication" );
		Set<Integer> allPubIds = new HashSet<> ();

		// if subgraph has publications do smart filtering of most interesting papers
		if ( ccPub != null )
		{
			// get all publications in subgraph that have and don't have keyword
			Set<ONDEXConcept> allPubs = subGraph.getConceptsOfConceptClass ( ccPub );

			allPubs.stream ()
			.map ( ONDEXConcept::getId )
			.forEach ( allPubIds::add );
			
			AttributeName attYear = subGraph.getMetaData ().getAttributeName ( "YEAR" );

			// if publications with keyword exist, keep most recent papers from pub-keyword set
			// else, just keep most recent papers from total set
			Set<ONDEXConcept> selectedPubs = pubKeywordSet.isEmpty () ? allPubs : pubKeywordSet;
			List<Integer> newPubIds = PublicationUtils.newPubsByNumber ( 
				selectedPubs, attYear,
				options.getInt ( SearchService.OPT_DEFAULT_NUMBER_PUBS, -1 )
			);

			// publications that we want to remove
			allPubIds.removeAll ( newPubIds );

			// Keep most recent publications that contain keyword and remove rest from subGraph
			allPubIds.forEach ( subGraph::deleteConcept );
		}

		ONDEXGraphRegistry.graphs.remove ( subGraph.getSID () );

		log.debug ( "Number of seed genes: " + seed.size () );
		log.debug ( "Number of removed publications " + allPubIds.size () );

		return subGraph;
	}	

  /**
   * Annotate first and last concept and relations of a given path Do
   * annotations on a new graph and not on the original graph
   *
   * @param path Contains concepts and relations of a semantic motif
   * @param graphCloner cloner for the new graph
   * @param doFilter If true only a path to Trait and Phenotype nodes will be
   * made visible
   */
	@SuppressWarnings ( { "rawtypes", "unchecked" } )
	private void highlightPath ( EvidencePathNode path, ONDEXGraphCloner graphCloner, boolean doFilter )
	{
    var graph = dataService.getGraph ();
		ONDEXGraph gclone = graphCloner.getNewGraph ();
		
		ONDEXGraphMetaData gcloneMeta = gclone.getMetaData ();
		MetaDataFactory gcloneMetaFact = gcloneMeta.getFactory ();
		EntityFactory gcloneFact = gclone.getFactory ();
		AttributeName attSize = getOrCreateAttributeName ( gclone, "size", Integer.class ); 
		AttributeName attVisible = getOrCreateAttributeName ( gclone, "visible", Boolean.class ); 
		AttributeName attFlagged = getOrCreateAttributeName ( gclone, "flagged", Boolean.class ); 
		
		ConceptClass ccTrait = getOrCreateConceptClass ( gclone, "Trait" );
		ConceptClass ccPhenotype = getOrCreateConceptClass ( gclone, "Phenotype" );

		Set<ConceptClass> ccFilter = new HashSet<> ();
		ccFilter.add ( ccTrait );
		ccFilter.add ( ccPhenotype );

		// gene and evidence nodes of path in knowledge graph
		int indexLastCon = path.getConceptsInPositionOrder ().size () - 1;
		ONDEXConcept geneNode = (ONDEXConcept) path.getStartingEntity ();
		ONDEXConcept endNode = (ONDEXConcept) path.getConceptsInPositionOrder ().get ( indexLastCon );

		// get equivalent gene and evidence nodes in new sub-graph
		ONDEXConcept endNodeClone = graphCloner.cloneConcept ( endNode );
		ONDEXConcept geneNodeClone = graphCloner.cloneConcept ( geneNode );

		// all nodes and relations of given path
		Set<ONDEXConcept> cons = path.getAllConcepts ();
		Set<ONDEXRelation> rels = path.getAllRelations ();

		// seed gene should always be visible, flagged and bigger
		if ( geneNodeClone.getAttribute ( attFlagged ) == null )
		{
			geneNodeClone.createAttribute ( attFlagged, true, false );
			geneNodeClone.createAttribute ( attVisible, true, false );
			geneNodeClone.createAttribute ( attSize, 80, false );
		}

		// set all concepts to visible if filtering is turned off
		// OR filter is turned on and end node is of specific type
		if ( !doFilter || ccFilter.contains ( endNodeClone.getOfType () ) )
		{
			for ( ONDEXConcept c : cons )
			{
				ONDEXConcept concept = graphCloner.cloneConcept ( c );
				if ( concept.getAttribute ( attVisible ) != null ) continue;
				concept.createAttribute ( attSize, 50, false );
				concept.createAttribute ( attVisible, true, false );
			}

			// set all relations to visible if filtering is turned off
			// OR filter is turned on and end node is of specific type
			for ( ONDEXRelation rel : rels )
			{
				ONDEXRelation r = graphCloner.cloneRelation ( rel );
				if ( r.getAttribute ( attVisible ) == null )
				{
					// initial size
					r.createAttribute ( attSize, 5, false );
					r.createAttribute ( attVisible, true, false );
				}
			}
		} // if doFilter

		// add gene-QTL-Trait relations to the network
		var genes2QTLs = this.getGenes2QTLs ();
		if ( !genes2QTLs.containsKey ( geneNode.getId () ) ) return;
		
		RelationType rt = gcloneMetaFact.createRelationType ( "is_p" );
		EvidenceType et = gcloneMetaFact.createEvidenceType ( "KnetMiner" );

		Set<Integer> qtlSet = genes2QTLs.get ( geneNode.getId () );
		for ( Integer qtlId : qtlSet )
		{
			ONDEXConcept qtl = graphCloner.cloneConcept ( graph.getConcept ( qtlId ) );
			if ( gclone.getRelation ( geneNodeClone, qtl, rt ) == null )
			{
				ONDEXRelation r = gcloneFact.createRelation ( geneNodeClone, qtl, rt, et );
				r.createAttribute ( attSize, 2, false );
				r.createAttribute ( attVisible, true, false );
			}
			if ( qtl.getAttribute ( attSize ) == null )
			{
				qtl.createAttribute ( attSize, 70, false );
				qtl.createAttribute ( attVisible, true, false );
			}
			
			Set<ONDEXRelation> relSet = graph.getRelationsOfConcept ( graph.getConcept ( qtlId ) );
			for ( ONDEXRelation r : relSet )
			{
				if ( !r.getOfType ().getId ().equals ( "has_mapped" ) ) continue;
				
				ONDEXRelation rel = graphCloner.cloneRelation ( r );
				if ( rel.getAttribute ( attSize ) == null )
				{
					rel.createAttribute ( attSize, 2, false );
					rel.createAttribute ( attVisible, true, false );
				}

				ONDEXConcept tC = r.getToConcept ();
				ONDEXConcept traitCon = graphCloner.cloneConcept ( tC );
				if ( traitCon.getAttribute ( attSize ) != null ) continue;
				{
					traitCon.createAttribute ( attSize, 70, false );
					traitCon.createAttribute ( attVisible, true, false );
				}
			} // for relSet
		} // for qtlSet
	} // highlightPath ()

	
  /**
   * hides the path between a gene and a concept
   *
   * @param path Contains concepts and relations of a semantic motif
   * @param graphCloner cloner for the new graph
   * 
   * TODO: remove?
   */
	@SuppressWarnings ( { "rawtypes", "unchecked" } )
	private void hidePath ( EvidencePathNode path, ONDEXGraphCloner graphCloner )
	{
		ONDEXGraph gclone = graphCloner.getNewGraph ();
		AttributeName attVisible = getOrCreateAttributeName ( gclone, "visible", Boolean.class );

		// hide every concept except by the last one
		int indexLastCon = path.getConceptsInPositionOrder ().size () - 1;
		ONDEXConcept lastCon = (ONDEXConcept) path.getConceptsInPositionOrder ().get ( indexLastCon );
		Set<ONDEXConcept> cons = path.getAllConcepts ();
		cons.stream ()
		.filter ( pconcept -> pconcept.getId () == lastCon.getId () )
		.forEach ( pconcept -> {
			ONDEXConcept concept = graphCloner.cloneConcept ( pconcept );
			concept.createAttribute ( attVisible, false, false );
		});
	}
	
	
	private void initGraphTraverser ()
	{
		if ( graphTraverser != null ) return;

		// The traverser will get all of our config opts, its initial configuration
		// is possibly overridden/extended
		graphTraverser = AbstractGraphTraverser.getInstance ( dataService.getOptions () );

		graphTraverser.setOption ( "ONDEXGraph", dataService.getGraph () );
	}
	
	/**
	 * Gets the genes to seed the {@link AbstractGraphTraverser semantic motif traverser}.
	 * 
	 * If the {@link #OPT_SEED_GENES_FILE} is set in opts, gets such list from
	 * {@link AbstractGraphTraverser#ids2Genes(ONDEXGraph, java.io.File) the corresponding file}, else
	 * it gets all the genes in graph that have their TAXID attribute within the taxIds list, as per 
	 * {@link #getSeedGenesFromTaxIds(ONDEXGraph, List)}.
	 * 
	 */
	private Set<ONDEXConcept> loadSeedGenes ()
	{
		String seedGenesPath = StringUtils.trimToNull ( dataService.getOptions ().getString ( OPT_SEED_GENES_FILE ) );
		if ( seedGenesPath == null ) {
			log.info ( "Initialising seed genes from TAXID list" );
			return fetchSeedGenesFromTaxIds ();
		}
		
		log.info ( "Initialising seed genes from file: '{}' ", seedGenesPath );
		return AbstractGraphTraverser.ids2Genes ( dataService.getGraph (), seedGenesPath );
	}

	private Set<ONDEXConcept> fetchSeedGenesFromTaxIds ()
	{
		Set<String> myTaxIds = new HashSet<> ( dataService.getTaxIds () );
		var graph = dataService.getGraph ();
		ONDEXGraphMetaData meta = graph.getMetaData ();
		ConceptClass ccGene = meta.getConceptClass ( "Gene" );
		AttributeName attTaxId = meta.getAttributeName ( "TAXID" );

		Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass ( ccGene );
		return genes.parallelStream ().filter ( gene -> gene.getAttribute ( attTaxId ) != null )
			.filter ( gene -> myTaxIds.contains ( gene.getAttribute ( attTaxId ).getValue ().toString () ) )
			.collect ( Collectors.toSet () );
	}		
	
	
	

	Map<Integer, Set<Integer>> getGenes2Concepts ()
	{
		return genes2Concepts;
	}

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
}
