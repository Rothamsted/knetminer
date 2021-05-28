package rres.knetminer.datasource.ondexlocal.service;

import static java.util.stream.Collectors.toMap;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValue;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getConceptName;
import static rres.knetminer.datasource.ondexlocal.service.utils.SearchUtils.getExcludingSearchExp;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXRelation;
import net.sourceforge.ondex.core.searchable.LuceneConcept;
import net.sourceforge.ondex.core.searchable.LuceneEnv;
import net.sourceforge.ondex.core.searchable.ONDEXLuceneFields;
import net.sourceforge.ondex.core.searchable.ScoredHits;
import net.sourceforge.ondex.logging.ONDEXLogger;
import rres.knetminer.datasource.ondexlocal.service.utils.KGUtils;
import rres.knetminer.datasource.ondexlocal.service.utils.QTL;
import rres.knetminer.datasource.ondexlocal.service.utils.SearchUtils;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;

/**
 * The search service subcomponent of {@link OndexServiceProvider}.
 * 
 * Roughly, this realises the more complex search functions, those requiring not only the 
 * {@link DataService#getGraph() knowledge base}, but other support data too, such as the Lucene index.
 * 
 * Roughly, we name methods as searchXXX when we involve indexes or complex infrastructure (eg,
 * databases, API, etc), we tend to give other names (eg, fetchXXX(), getXXX()) to the rest.
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
  
  private LuceneEnv luceneMgr;
  
	@Autowired
	private DataService dataService;
	
	@Autowired
	private SemanticMotifDataService semanticMotifDataService;
  
  private final Logger log = LogManager.getLogger(getClass());

	
	private SearchService () {}

  void indexOndexGraph ()
  {
  	log.info ( "Indexing the Ondex graph" );
  	
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

      log.info ( "Ondex graph indexed");
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
		var genes2Concepts = semanticMotifDataService.getGenes2Concepts ();
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

		// added to overcome double quotes issue
		// if changing this, need to change genepage.jsp and evidencepage.jsp
		keywords = keywords.replace ( "###", "\"" );
		log.debug ( "Keyword is:" + keywords );

		// creates the NOT list (list of all the forbidden documents)
		String notQuery = getExcludingSearchExp ( keywords );
		String crossTypesNotQuery = "";
		ScoredHits<ONDEXConcept> notList = null;

		// number of top concepts retrieved for each Lucene field
		//TODO: The top 2000 restriction should be configurable in settings and documented
		int maxConcepts = 2000;

		if ( !"".equals ( notQuery ) )
		{
			crossTypesNotQuery = "ConceptAttribute_AbstractHeader:(" + notQuery + ") OR ConceptAttribute_Abstract:("
				+ notQuery + ") OR Annotation:(" + notQuery + ") OR ConceptName:(" + notQuery + ") OR ConceptID:("
				+ notQuery + ")";
			notList = this.searchTopConceptsByName ( crossTypesNotQuery, maxConcepts );
		}


		// search concept attributes
		for ( AttributeName att : atts )
			searchConceptByIdxField ( 
				keywords, ONDEXLuceneFields.CONATTRIBUTE_FIELD, att.getId (), maxConcepts, hit2score, notList
			);				

		// Search concept accessions
		for ( String dsAc : dsAcc )
			searchConceptByIdxField ( keywords, ONDEXLuceneFields.CONACC_FIELD, dsAc, maxConcepts, hit2score, notList );				

		// Search concept names
		searchConceptByIdxField ( keywords, ONDEXLuceneFields.CONNAME_FIELD, maxConcepts, hit2score, notList );				
		
		// search concept description
		searchConceptByIdxField ( keywords, ONDEXLuceneFields.DESC_FIELD, maxConcepts, hit2score, notList );
		
		// search concept annotation
		searchConceptByIdxField ( keywords, ONDEXLuceneFields.ANNO_FIELD, maxConcepts, hit2score, notList );
		
		log.info ( "searchLucene(), keywords: \"{}\", returning {} total hits", keywords, hit2score.size () );
		return hit2score;
	}
  

  private void searchConceptByIdxField ( 
  	String keywords, String idxFieldName, int resultLimit, 
  	Map<ONDEXConcept, Float> allResults, ScoredHits<ONDEXConcept> notHits ) throws ParseException
  {
  	searchConceptByIdxField ( keywords, idxFieldName, null, resultLimit, allResults, notHits );
  }
	
  /**
   * Was luceneConceptSearchHelper()
   */
  private void searchConceptByIdxField ( 
  	String keywords, String idxFieldName, String idxFieldSubName, int resultLimit, 
  	Map<ONDEXConcept, Float> allResults, ScoredHits<ONDEXConcept> notHits ) throws ParseException
  {
		ScoredHits<ONDEXConcept> thisHits = this.luceneMgr.searchTopConceptsByIdxField ( 
			keywords, idxFieldName, idxFieldSubName, resultLimit 
		);
		mergeHits ( allResults, thisHits, notHits );
  }
	
  /**
   * Wrapper of {@link LuceneEnv#searchTopConceptsByIdxField(String, String, String, int)}.
   */
	public ScoredHits<ONDEXConcept> searchTopConceptsByName ( String keywords, int sizeLimit )
	{
		return this.luceneMgr.searchTopConceptsByIdxField ( keywords, ONDEXLuceneFields.CONNAME_FIELD, sizeLimit );
	}

	/** 
	 * A convenience wrapper of {@link LuceneEnv#searchByTypeAndAccession(String, String, boolean)}.  
	 */
	public Set<ONDEXConcept> searchConceptByTypeAndAccession ( 
		String conceptClassId, String accessionTerm, boolean isCaseSensitive 
	)
	{
		return luceneMgr.searchByTypeAndAccession ( conceptClassId, accessionTerm, isCaseSensitive );
	}

	/**
	 * Defaults to true
	 */
	public Set<ONDEXConcept> searchConceptByTypeAndAccession ( String conceptClassId, String accessionTerm )
	{
		return this.searchConceptByTypeAndAccession ( conceptClassId, accessionTerm, true );
	}

	
	/** 
	 * A convenience wrapper of {@link LuceneEnv#searchByTypeAndName(String, String, boolean)}.  
	 */
	public Set<ONDEXConcept> searchConceptByTypeAndName ( 
		String conceptClassId, String nameTerm, boolean isCaseSensitive 
	)
	{
		return luceneMgr.searchByTypeAndName ( conceptClassId, nameTerm, isCaseSensitive );
	}

	/**
	 * Defaults to true
	 */
	public Set<ONDEXConcept> searchConceptByTypeAndName ( String conceptClassId, String nameTerm )
	{
		return this.searchConceptByTypeAndName ( conceptClassId, nameTerm, true );
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
		
		var concepts2Genes = semanticMotifDataService.getConcepts2Genes ();
		var genes2PathLengths = semanticMotifDataService.getGenes2PathLengths ();
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
	
	
  /**
   * Find all QTLs and SNPs that are linked to Trait concepts that contain a keyword
   * Assumes that KG is modelled as Trait->QTL and Trait->SNP with PVALUE on relations
   * 
   * Was named findQTLForTrait.
   * 
   * TODO: probably it should go somewhere else like QTLUtils, after having separated 
   * the too tight dependencies on Lucene.
   */	
  public Set<QTL> searchQTLsForTrait ( String keyword ) throws ParseException
  {
    // be careful with the choice of analyzer: ConceptClasses are not
    // indexed in lowercase letters which let the StandardAnalyzer crash
		//
    Query cC = luceneMgr.getIdxFieldQuery ( "Trait", ONDEXLuceneFields.CC_FIELD );
    Query cN = luceneMgr.getIdxFieldQuery ( keyword, ONDEXLuceneFields.CONNAME_FIELD );

    BooleanQuery finalQuery = new BooleanQuery.Builder()
    	.add ( cC, BooleanClause.Occur.MUST )
      .add ( cN, BooleanClause.Occur.MUST )
      .build();
    
    log.info( "QTL search query: {}", finalQuery.toString() );

    ScoredHits<ONDEXConcept> hits = this.luceneMgr.searchTopConcepts ( finalQuery, 100 );
    
    var graph = dataService.getGraph ();
		var gmeta = graph.getMetaData();
    ConceptClass ccQTL = gmeta.getConceptClass("QTL");
    ConceptClass ccSNP = gmeta.getConceptClass("SNP");
    
    Set<QTL> results = new HashSet<>();
    
    for ( ONDEXConcept hitConcept : hits.getOndexHits() ) 
    {
        if (hitConcept instanceof LuceneConcept) hitConcept = ((LuceneConcept) hitConcept).getParent();
        Set<ONDEXRelation> rels = graph.getRelationsOfConcept(hitConcept);
        
        for (ONDEXRelation r : rels) 
        {
        	// TODO better variable names: con, fromType and toType
        	var conQTL = r.getFromConcept();
        	var conQTLType = conQTL.getOfType ();
        	var toType = r.getToConcept ().getOfType ();
        	
          // skip if not QTL or SNP concept
          if ( !( conQTLType.equals(ccQTL) || toType.equals(ccQTL)
               		|| conQTLType.equals(ccSNP) || toType.equals(ccSNP) ) )
          	continue;
            
          // QTL-->Trait or SNP-->Trait
          String chrName = getAttrValueAsString ( graph, conQTL, "Chromosome", false );
          if ( chrName == null ) continue;

          Integer start = (Integer) getAttrValue ( graph, conQTL, "BEGIN", false );
          if ( start == null ) continue;

          Integer end = (Integer) getAttrValue ( graph, conQTL, "END", false );
          if ( end == null ) continue;
          
          String type = conQTLType.getId();
          String label = getConceptName ( conQTL );
          String trait = getConceptName ( hitConcept );
                    
          float pValue = Optional.ofNullable ( (Float) getAttrValue ( graph, r, "PVALUE", false ) )
          	.orElse ( 1.0f );

          String taxId = Optional.ofNullable ( getAttrValueAsString ( graph, conQTL, "TAXID", false ) )
            	.orElse ( "" );
          
          results.add ( new QTL ( chrName, type, start, end, label, "", pValue, trait, taxId ) );
        } // for concept relations
    } // for getOndexHits
    return results;    	
  }

  /**
   * A convenient wrapper of {@link KGUtils#filterGenesByAccessionKeywords} 
   */
	public Set<ONDEXConcept> filterGenesByAccessionKeywords ( List<String> accessions )
	{
		return KGUtils.filterGenesByAccessionKeywords ( this.dataService, this, accessions );
	}

	
	/**
	 * A convenient wrapper for {@link SearchUtils#getMapEvidences2Genes(SemanticMotifService, Map)}
	 */
	public Map<Integer, Set<Integer>> getMapEvidences2Genes ( Map<ONDEXConcept, Float> luceneConcepts )
	{
		return SearchUtils.getMapEvidences2Genes ( this.semanticMotifDataService, luceneConcepts );
	}
	
	/**
	 * A convenient wrapper of {@link KGUtils#fetchQTLs(ONDEXGraph, List, List)}
	 * @param qtlsStr
	 * @return
	 */
	public Set<ONDEXConcept> fetchQTLs ( List<String> qtlsStr )
	{
		return KGUtils.fetchQTLs ( dataService.getGraph (), dataService.getTaxIds (), qtlsStr );
	}
	
  /**
   * Searches the knowledge base for QTL concepts that match any of the user
   * input terms.
   * 
   */
  public Set<QTL> searchQTLs ( String keyword ) throws ParseException
  {
  	var graph = this.dataService.getGraph ();
		var gmeta = graph.getMetaData();
    ConceptClass ccTrait = gmeta.getConceptClass("Trait");
    ConceptClass ccQTL = gmeta.getConceptClass("QTL");
    ConceptClass ccSNP = gmeta.getConceptClass("SNP");

    // no Trait-QTL relations found
    if (ccTrait == null && (ccQTL == null || ccSNP == null)) return new HashSet<>();

    // no keyword provided
    if ( keyword == null || keyword.equals ( "" ) ) return new HashSet<>();

    log.debug ( "Looking for QTLs..." );
    
    // If there is not traits but there is QTLs then we return all the QTLs
    if (ccTrait == null) return KGUtils.getQTLs ( graph );
    return this.searchQTLsForTrait ( keyword );
  }		
}
