package rres.knetminer.datasource.ondexlocal.service;

import static java.util.stream.Collectors.toMap;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValue;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getConceptName;
import static rres.knetminer.datasource.ondexlocal.service.utils.KGUtils.getBestConceptLabel;
import static rres.knetminer.datasource.ondexlocal.service.utils.SearchUtils.getExcludingSearchExp;
import static rres.knetminer.datasource.ondexlocal.service.utils.SearchUtils.mergeHits;

import java.io.File;
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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.ArrayUtils;
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

import com.google.common.util.concurrent.AtomicDouble;

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
	) throws ParseException
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
		
		if ( keywords.isEmpty () )
		{
			if ( geneList == null || geneList.isEmpty () )
			{
				log.info ( "All the search parameters are empty, returning empty result" );
				return hit2score;
			}
			
			log.info ( "No keyword, skipping Lucene stage, using genes2Concepts instead" );
			for ( ONDEXConcept gene : geneList )
			{
				if ( gene == null ) continue;
				if ( genes2Concepts.get ( gene.getId () ) == null ) continue;
				for ( int relatedConceptId : genes2Concepts.get ( gene.getId () ) )
				{
					ONDEXConcept relatedConcept = graph.getConcept ( relatedConceptId );
					if ( !includePublications && relatedConcept.getOfType ().getId ().equalsIgnoreCase ( "Publication" ) )
						continue;
					
					hit2score.put ( relatedConcept, 1.0f );
				}
			}

			return hit2score;
		
		} // if empty edge cases
		

		// added to overcome double quotes issue
		// if changing this, need to change genepage.jsp and evidencepage.jsp
		keywords = keywords.replace ( "###", "\"" );
		log.debug ( "Search string is: \"{}\"", keywords );

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
		
	} // searchGeneRelatedConcepts()
  

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
		var graph = dataService.getGraph ();
	
		log.info ( "Getting genes from {} Lucene hits ", hit2score.keySet ().size () );
	
		var concepts2Genes = semanticMotifDataService.getConcepts2Genes ();
		var genes2PathLengths = semanticMotifDataService.getGenes2PathLengths ();
		var genesCount = dataService.getGenomeGenesCount ();

		// 1st step: create map of genes to concepts that contain query terms
		// In other words: Filter the global gene2concept map for concepts that contain the keyword
		//
		Map<Integer, Set<Integer>> gene2HitConcepts =
			hit2score.keySet ()
			.parallelStream ()
			.map ( ONDEXConcept::getId ) // conceptId
			.filter ( concepts2Genes::containsKey ) // Has related concepts
			.flatMap ( conceptId -> 
				concepts2Genes.get ( conceptId )
				// flat into a stream of Pair(geneId, conceptId)
				.parallelStream ().map ( geneId -> Pair.of ( geneId, conceptId ) ) 
			)
			.collect ( Collectors.groupingByConcurrent ( 
				Pair::getLeft, // group the pairs by geneId
				Collectors.mapping ( 
					Pair::getRight, // Map each pair to its conceptId
					Collectors.toSet () ) // collect the conceptIds and merge them into the per-geneId groups
			));


		// 2nd step: calculate a score for each candidate gene
		//
		ConcurrentMap<ONDEXConcept, Double> scoredCandidates =  new ConcurrentHashMap<> ();

		gene2HitConcepts.keySet ().
		parallelStream ()
		.forEach ( geneId ->
		{
			// weighted sum of all evidence concepts
			var weightedEvidenceSum = new AtomicDouble ( 0d );

			// iterate over each evidence concept and compute a weight that is composed of
			// three components
			gene2HitConcepts.get ( geneId )
			.parallelStream ()
			.forEach ( conceptId -> 
			{
				// relevance of search term to concept
				float luceneScore = hit2score.get ( graph.getConcept ( conceptId ) );

				// specificity of evidence to gene
				double igf = Math.log10 ( (double) genesCount / concepts2Genes.get ( conceptId ).size () );

				// inverse distance from gene to evidence
				Integer pathLen = genes2PathLengths.get ( Pair.of ( geneId, conceptId ) );
				if ( pathLen == null ) 
					log.info ( "WARNING: Path length is null for: " + geneId + "//" + conceptId );
				
				double distance = pathLen == null ? 0 : ( 1d / pathLen );

				// take the mean of all three components
				double evidenceWeight = ( igf + luceneScore + distance ) / 3;

				// sum of all evidence weights
				weightedEvidenceSum.addAndGet ( evidenceWeight );
				
			}); // for conceptId

			// normalisation method 1: size of the gene knoweldge graph
			// double normFactor = 1 / (double) genes2Concepts.get(geneId).size();
			// normalisation method 2: size of matching evidence concepts only (mean score)
			// double normFactor = 1 / Math.max((double) mapGene2HitConcept.get(geneId).size(), 3.0);
			// No normalisation for now as it's too experimental.
			// This means better studied genes will appear top of the list
			double knetScore = /* normFactor * */ weightedEvidenceSum.get ();

			scoredCandidates.put ( graph.getConcept ( geneId ), knetScore );
			
		}); // for geneId
		
		// Sort by best scores
		Map<ONDEXConcept, Double> sortedCandidates = scoredCandidates.entrySet ()
		.stream ()
		.sorted ( Collections.reverseOrder ( Map.Entry.comparingByValue () ) )
		.collect ( toMap ( Map.Entry::getKey, Map.Entry::getValue, ( e1, e2 ) -> e2, LinkedHashMap::new ) );
		
		return new SemanticMotifsSearchResult ( gene2HitConcepts, sortedCandidates );
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
	public Set<QTL> searchQTLsForTraitOld ( String keyword ) throws ParseException
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
	 * TODO: this is the new version, which uses the new model gene->pheno->Trait, to be 
	 * tested and activated when switching to the new test dataset.
	 * 
	 * TODO: wrap the exception
	 */
  public Set<QTL> searchQTLsForTrait ( String keyword ) throws ParseException
  {
    // be careful with the choice of analyzer: ConceptClasses are not
    // indexed in lowercase letters which let the StandardAnalyzer crash
		//
    Query phenoQuery = luceneMgr.getIdxFieldQuery ( "Phenotype", ONDEXLuceneFields.CC_FIELD );
    Query nameQuery = luceneMgr.getIdxFieldQuery ( keyword, ONDEXLuceneFields.CONNAME_FIELD );

    BooleanQuery finalQuery = new BooleanQuery.Builder()
    	.add ( phenoQuery, BooleanClause.Occur.MUST )
      .add ( nameQuery, BooleanClause.Occur.MUST )
      .build();
    
    log.info( "Phenotype/SNP/QTL search query: {}", finalQuery.toString() );

    ScoredHits<ONDEXConcept> phenos = this.luceneMgr.searchTopConcepts ( finalQuery, 100 );
    var graph = dataService.getGraph ();
    Set<QTL> results = ConcurrentHashMap.newKeySet ();

    phenos.getOndexHits ()
    .parallelStream ()
    .map ( pheno ->  pheno instanceof LuceneConcept ? ((LuceneConcept) pheno).getParent() : pheno )
    .forEach ( pheno ->
    {
  		// Go back one more, and check it is Gene or SNP
  		for ( ONDEXRelation phenoRel: graph.getRelationsOfConcept ( pheno ) )
  		{
  			ONDEXConcept geneLikeEntity = phenoRel.getFromConcept ();
  			if ( pheno.equals ( geneLikeEntity ) ) {
  				geneLikeEntity = phenoRel.getToConcept ();
  				// Unlikely case of self-loops
  				if ( pheno.equals ( geneLikeEntity ) ) continue;
  			}
  			
    		String geneLikeTypeId = geneLikeEntity.getOfType ().getId ();
    		
    		// TODO: QTL used to be here in the past (2021), not sure it's still needed.
    		if ( !ArrayUtils.contains ( new String[] { "Gene", "SNP", "QTL" }, geneLikeTypeId ) ) continue;
    		
        String chrName = getAttrValueAsString ( graph, geneLikeEntity, "Chromosome", false );
        if ( chrName == null ) continue;

        Integer start = (Integer) getAttrValue ( graph, geneLikeEntity, "BEGIN", false );
        if ( start == null ) continue;

        Integer end = (Integer) getAttrValue ( graph, geneLikeEntity, "END", false );
        if ( end == null ) continue;
        
        String geneLabel =  getBestConceptLabel ( geneLikeEntity );
        String phenoLabel = getBestConceptLabel ( pheno );
                  
        float pValue = Optional.ofNullable ( (Float) getAttrValue ( graph, phenoRel, "PVALUE", false ) )
        	.orElse ( 1.0f );

        String taxId = Optional.ofNullable ( getAttrValueAsString ( graph, geneLikeEntity, "TAXID", false ) )
          .orElse ( "" );
        
        results.add ( new QTL ( chrName, geneLikeTypeId, start, end, geneLabel, "", pValue, phenoLabel, taxId ) );

  		} // for phenoRel
    }); // forEach ( pheno )

    return results;    	
    
  } // searchQTLsForTrait()

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
		
		// TODO: the new chain is Gene|SNP|QTL -  Phenotype - Trait and this isn't consideding that
		
    ConceptClass ccTrait = gmeta.getConceptClass("Trait");
    ConceptClass ccQTL = gmeta.getConceptClass("QTL");
    ConceptClass ccSNP = gmeta.getConceptClass("SNP");

    // no Trait-QTL relations found
    if (ccTrait == null && (ccQTL == null || ccSNP == null)) return new HashSet<>();

    // no keyword provided
    if ( keyword == null || keyword.equals ( "" ) ) return new HashSet<>();

    log.debug ( "Looking for QTLs..." );
    
    // There aren't traits, but maybe there are QTLs
    if (ccTrait == null) return KGUtils.getQTLs ( graph );

    // Else, lookup for trait/QTL relations
    return this.searchQTLsForTrait ( keyword );
  }		
}
