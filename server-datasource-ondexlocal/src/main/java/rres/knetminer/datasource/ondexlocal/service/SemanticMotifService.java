package rres.knetminer.datasource.ondexlocal.service;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getOrCreateAttributeName;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getOrCreateConceptClass;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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
import rres.knetminer.datasource.ondexlocal.service.utils.PublicationUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.SearchUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.UIUtils;

/**
 * The semantic motif sub-service for {@link OndexServiceProvider}.
 * 
 * Deals with semantic motif functionality like searching, finding graph of gene-related entitites and
 * formatting the results for the UI.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>21 Sep 2020</dd></dl>
 *
 */
@Component
public class SemanticMotifService
{	 
	@Autowired
	private DataService dataService;
	
	@Autowired
	private SemanticMotifDataService semanticMotifDataService;
	
	@Autowired
	private SearchService searchService;
	
	private final Logger log = LogManager.getLogger ( getClass() );

	
	private SemanticMotifService () {}

	
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
		var concepts2Genes = semanticMotifDataService.getConcepts2Genes ();

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
			semanticMotifDataService.getGraphTraverser ().traverseGraph ( graph, relatedONDEXConcepts, null );

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
   * Generates a subgraph for a set of genes and graph queries. The subgraph is annotated by setting node,ege visibility 
   * and size attributes. Annotation is based on either paths to keyword concepts (if provided) or a set of rules based 
   * on paths to Trait/Phenotype concepts.
   *
   * @param seedGenes List of selected genes
   * @param searchString
   * @return subGraph
   */
	@SuppressWarnings ( { "rawtypes", "unchecked" } )
	public ONDEXGraph findSemanticMotifs ( Set<ONDEXConcept> seedGenes, String searchString )
	{
		log.info ( "findSemanticMotifs(), keyword: {}", searchString );
		
		searchString = StringUtils.trimToEmpty ( searchString );

		// TODO: maybe we have to intercept LuceneParseException
		// This is empty when both the search string and the seedGenes are empty, 
		// if the seedGenes only are provided, it searches over them using the gene/concept associations from the 
		// whole semantic motifs
		Map<ONDEXConcept, Float> luceneResults = searchService.searchGeneRelatedConcepts ( searchString, seedGenes, false );

		var graph = dataService.getGraph ();
		var config = dataService.getConfiguration ();
		
		// the results give us a map of every starting concept to every valid path
		Map<ONDEXConcept, List<EvidencePathNode>> results = semanticMotifDataService
			.getGraphTraverser ()
			.traverseGraph ( graph, seedGenes, null );

		Set<ONDEXConcept> keywordConcepts = new HashSet<> ();
		Set<EvidencePathNode> pathSet = new HashSet<> ();

		// added to overcome double quotes issue
		// if changing this, need to change genepage.jsp and evidencepage.jsp
		searchString = searchString.replace ( "###", "\"" );

		Set<String> keywords = searchString.isEmpty () 
			? Collections.emptySet ()
			: SearchUtils.getSearchWords ( searchString );
				
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
				if ( searchString.isEmpty() )
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
		if ( keywordConcepts.isEmpty () && ! searchString.isEmpty () )
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
				config.getDefaultExportedPublicationCount ()
			);

			// publications that we want to remove
			allPubIds.removeAll ( newPubIds );

			// Keep most recent publications that contain keyword and remove rest from subGraph
			allPubIds.forEach ( subGraph::deleteConcept );
		}

		ONDEXGraphRegistry.graphs.remove ( subGraph.getSID () );

		log.debug ( "Number of seed genes: " + seedGenes.size () );
		log.debug ( "Number of removed publications " + allPubIds.size () );

		return subGraph;
	}	

  /**
   * Annotate first and last concept and relations of a given path 
   * Adds annotations on a new graph, and not on the original graph
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
		var genes2QTLs = semanticMotifDataService.getGenes2QTLs ();
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
}
