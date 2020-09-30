package rres.knetminer.datasource.ondexlocal.service;

import static java.util.stream.Collectors.toMap;
import static rres.knetminer.datasource.ondexlocal.service.utils.SearchUtils.getExcludingSearchExp;
import static rres.knetminer.datasource.ondexlocal.service.utils.SearchUtils.getLuceneFieldName;
import static rres.knetminer.datasource.ondexlocal.service.utils.SearchUtils.mergeHits;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.searchable.LuceneEnv;
import net.sourceforge.ondex.core.searchable.ScoredHits;
import net.sourceforge.ondex.logging.ONDEXLogger;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;

/**
 * The search service subcomponent of {@link OndexServiceProvider}.
 * 
 * Roughly. this realises the more complex search functions, those requiring not only the 
 * {@link DataService#getGraph() knowledge base}, but other support data too, such as the Lucene index. 
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>21 Sep 2020</dd></dl>
 *
 */
@Component
public class SearchService
{
	/**
	 * Used to set the max no. of publications that a search should return by default. 
	 */
  public static final String OPT_DEFAULT_NUMBER_PUBS = "defaultExportedPublicationCount";
	
  
	// TODO: must become private when the refactoring is over
  LuceneEnv luceneMgr;
  
	@Autowired
	private DataService dataService;
	
	@Autowired
	private SemanticMotifService semanticMotifService;
  
  private final Logger log = LogManager.getLogger(getClass());

	
	private SearchService () {}

  void indexOndexGraph ()
  {
  	var graph = dataService.getGraph ();
  	var oxlGraphPath = dataService.getOxlPath ();
  	var dataPath = dataService.getDataPath (); 
  	
    try 
    {
      // index the Ondex graph
      File graphFile = new File ( oxlGraphPath );
      File indexFile = Paths.get ( dataPath, "index" ).toFile();
      if (indexFile.exists() && (indexFile.lastModified() < graphFile.lastModified())) {
          log.info("Graph file updated since index last built, deleting old index");
          FileUtils.deleteDirectory(indexFile);
      }
      log.info("Building Lucene Index: " + indexFile.getAbsolutePath());
      luceneMgr = new LuceneEnv(indexFile.getAbsolutePath(), !indexFile.exists());
      luceneMgr.addONDEXListener( new ONDEXLogger() ); // sends Ondex messages to the logger.
      luceneMgr.setONDEXGraph ( graph );
      luceneMgr.setReadOnlyMode ( true );

      log.info ( "Lucene index created");
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
   * Search for concepts in Knowledge Graph which contain the keywords
   *
   * @param keyword user-specified keyword
   * @return concepts that match the keyword and their Lucene score
   * 
   * Was searchLucene()
   */
	public Map<ONDEXConcept, Float> searchGeneRelatedConcepts ( 
		String keywords, Collection<ONDEXConcept> geneList, boolean includePublications 
	) throws IOException, ParseException
	{
		var graph = dataService.getGraph ();
		var genes2Concepts = semanticMotifService.getGenes2Concepts ();
		Set<AttributeName> atts = graph.getMetaData ().getAttributeNames ();
		
		// TODO: We should search across all accession datasources or make this configurable in settings
		String[] datasources = { "PFAM", "IPRO", "UNIPROTKB", "EMBL", "KEGG", "EC", "GO", "TO", "NLM", "TAIR",
				"ENSEMBLGENE", "PHYTOZOME", "IWGSC", "IBSC", "PGSC", "ENSEMBL" };
		
		// sources identified in KNETviewer
		/*
		 * String[] new_datasources= { "AC", "DOI", "CHEBI", "CHEMBL", "CHEMBLASSAY", "CHEMBLTARGET", "EC", "EMBL",
		 * "ENSEMBL", "GENB", "GENOSCOPE", "GO", "INTACT", "IPRO", "KEGG", "MC", "NC_GE", "NC_NM", "NC_NP", "NLM",
		 * "OMIM", "PDB", "PFAM", "PlnTFDB", "Poplar-JGI", "PoplarCyc", "PRINTS", "PRODOM", "PROSITE", "PUBCHEM",
		 * "PubMed", "REAC", "SCOP", "SOYCYC", "TAIR", "TX", "UNIPROTKB", "UNIPROTKB-COV", "ENSEMBL-HUMAN"};
		 */
		Set<String> dsAcc = new HashSet<> ( Arrays.asList ( datasources ) );

		HashMap<ONDEXConcept, Float> hit2score = new HashMap<> ();

		keywords = StringUtils.trimToEmpty ( keywords );
		
		if ( keywords.isEmpty () && geneList != null && !geneList.isEmpty () )
		{
			log.info ( "No keyword, skipping Lucene stage, using mapGene2Concept instead" );
			for ( ONDEXConcept gene : geneList )
			{
				if ( gene == null ) continue;
				if ( genes2Concepts.get ( gene.getId () ) == null ) continue;
				for ( int conceptId : genes2Concepts.get ( gene.getId () ) )
				{
					ONDEXConcept concept = graph.getConcept ( conceptId );
					if ( includePublications || !concept.getOfType ().getId ().equalsIgnoreCase ( "Publication" ) )
						hit2score.put ( concept, 1.0f );
				}
			}

			return hit2score;
		}

		// TODO: Actually, we should use LuceneEnv.DEFAULTANALYZER, which 
		// consider different field types. See https://stackoverflow.com/questions/62119328 
		Analyzer analyzer = new StandardAnalyzer ();

		// added to overcome double quotes issue
		// if changing this, need to change genepage.jsp and evidencepage.jsp
		keywords = keywords.replace ( "###", "\"" );
		log.debug ( "Keyword is:" + keywords );

		// creates the NOT list (list of all the forbidden documents)
		String notQuery = getExcludingSearchExp ( keywords );
		String crossTypesNotQuery = "";
		ScoredHits<ONDEXConcept> notList = null;
		if ( !"".equals ( notQuery ) )
		{
			crossTypesNotQuery = "ConceptAttribute_AbstractHeader:(" + notQuery + ") OR ConceptAttribute_Abstract:("
				+ notQuery + ") OR Annotation:(" + notQuery + ") OR ConceptName:(" + notQuery + ") OR ConceptID:("
				+ notQuery + ")";
			String fieldNameNQ = getLuceneFieldName ( "ConceptName", null );
			QueryParser parserNQ = new QueryParser ( fieldNameNQ, analyzer );
			Query qNQ = parserNQ.parse ( crossTypesNotQuery );
			//TODO: The top 2000 restriction should be configurable in settings and documented
			notList = this.luceneMgr.searchTopConcepts ( qNQ, 2000 );
		}

		// number of top concepts retrieved for each Lucene field
		int maxConcepts = 2000;

		// search concept attributes
		for ( AttributeName att : atts )
			searchConceptByField ( 
				keywords, "ConceptAttribute", att.getId (), maxConcepts, hit2score, notList,
				analyzer
			);				

		// Search concept accessions
		for ( String dsAc : dsAcc )
			searchConceptByField ( 
				keywords,  "ConceptAccession", dsAc, maxConcepts, hit2score, notList,
				analyzer
			);				
			

		// Search concept names
		searchConceptByField ( 
			keywords, "ConceptName", null, maxConcepts, hit2score, notList,
			analyzer
		);				
		
		// search concept description
		searchConceptByField ( 
			keywords, "Description", null, maxConcepts, hit2score, notList,
			analyzer
		);				
		
		// search concept annotation
		searchConceptByField ( 
			keywords, "Annotation", null, maxConcepts, hit2score, notList,
			analyzer
		);				
		
		log.info ( "searchLucene(), keywords: \"{}\", returning {} total hits", keywords, hit2score.size () );
		return hit2score;
	}
  
	
  /**
   * Was luceneConceptSearchHelper()
   * TODO: This is more Lucene module stuff
   */
  private void searchConceptByField ( 
  	String keywords, String fieldName, String fieldValue, int resultLimit, 
  	Map<ONDEXConcept, Float> allResults, ScoredHits<ONDEXConcept> notHits, 
  	Analyzer analyzer ) throws ParseException
  {
		fieldName = getLuceneFieldName ( fieldName, fieldValue );
		QueryParser parser = new QueryParser ( fieldName, analyzer );
		Query qAtt = parser.parse ( keywords );
		ScoredHits<ONDEXConcept> thisHits = this.luceneMgr.searchTopConcepts ( qAtt, resultLimit );
		mergeHits ( allResults, thisHits, notHits );
  }
	
	
	/**
	 * KnetMiner Gene Rank algorithm
	 * Computes a {@link SemanticMotifsSearchResult} from the result of a gene search.
	 * Described in detail in Hassani-Pak et al. (2020)
	 * 
	 * Was getScoredGenesMap.
	 */
	public SemanticMotifsSearchResult getScoredGenes ( Map<ONDEXConcept, Float> hit2score ) 
	{
		Map<ONDEXConcept, Double> scoredCandidates = new HashMap<> ();
		var graph = dataService.getGraph ();
	
		log.info ( "Total hits from lucene: " + hit2score.keySet ().size () );
	
		// 1st step: create map of genes to concepts that contain query terms
		// In other words: Filter the global gene2concept map for concept that contain the keyword
		Map<Integer, Set<Integer>> mapGene2HitConcept = new HashMap<> ();
		
		var concepts2Genes = semanticMotifService.getConcepts2Genes ();
		var genes2PathLengths = semanticMotifService.getGenes2PathLengths ();
		var genesCount = dataService.getGenomeGenesCount ();
		
		hit2score.keySet ()
		.stream ()
		.map ( ONDEXConcept::getId )
		.filter ( concepts2Genes::containsKey )
		.forEach ( conceptId ->
		{
			for ( int geneId: concepts2Genes.get ( conceptId ) )
				mapGene2HitConcept.computeIfAbsent ( geneId, thisGeneId -> new HashSet<> () )
				.add ( conceptId );
		});
		

		// 2nd step: calculate a score for each candidate gene
		for ( int geneId : mapGene2HitConcept.keySet () )
		{
			// weighted sum of all evidence concepts
			double weightedEvidenceSum = 0;

			// iterate over each evidence concept and compute a weight that is composed of
			// three components
			for ( int cId : mapGene2HitConcept.get ( geneId ) )
			{
				// relevance of search term to concept
				float luceneScore = hit2score.get ( graph.getConcept ( cId ) );

				// specificity of evidence to gene
				double igf = Math.log10 ( (double) genesCount / concepts2Genes.get ( cId ).size () );

				// inverse distance from gene to evidence
				Integer pathLen = genes2PathLengths.get ( Pair.of ( geneId, cId ) );
				if ( pathLen == null ) 
					log.info ( "WARNING: Path length is null for: " + geneId + "//" + cId );
				
				double distance = pathLen == null ? 0 : ( 1d / pathLen );

				// take the mean of all three components
				double evidenceWeight = ( igf + luceneScore + distance ) / 3;

				// sum of all evidence weights
				weightedEvidenceSum += evidenceWeight;
			}

			// normalisation method 1: size of the gene knoweldge graph
			// double normFactor = 1 / (double) genes2Concepts.get(geneId).size();
			// normalisation method 2: size of matching evidence concepts only (mean score)
			// double normFactor = 1 / Math.max((double) mapGene2HitConcept.get(geneId).size(), 3.0);
			// No normalisation for now as it's too experimental.
			// This means better studied genes will appear top of the list
			double knetScore = /* normFactor * */ weightedEvidenceSum;

			scoredCandidates.put ( graph.getConcept ( geneId ), knetScore );
		}
		
		// Sort by best scores
		Map<ONDEXConcept, Double> sortedCandidates = scoredCandidates.entrySet ().stream ()
		.sorted ( Collections.reverseOrder ( Map.Entry.comparingByValue () ) )
		.collect ( toMap ( Map.Entry::getKey, Map.Entry::getValue, ( e1, e2 ) -> e2, LinkedHashMap::new ) );
		return new SemanticMotifsSearchResult ( mapGene2HitConcept, sortedCandidates );
	}	 
}
