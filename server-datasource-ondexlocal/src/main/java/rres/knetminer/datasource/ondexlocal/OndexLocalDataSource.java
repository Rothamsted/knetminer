package rres.knetminer.datasource.ondexlocal;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.mutable.MutableObject;
import org.apache.lucene.queryparser.classic.ParseException;
import org.springframework.stereotype.Component;

import com.google.common.base.Functions;

import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import rres.knetminer.datasource.api.CountHitsResponse;
import rres.knetminer.datasource.api.CountLociResponse;
import rres.knetminer.datasource.api.GenomeRequest;
import rres.knetminer.datasource.api.GenomeResponse;
import rres.knetminer.datasource.api.JsonLikeNetworkResponse;
import rres.knetminer.datasource.api.KeywordResponse;
import rres.knetminer.datasource.api.KnetminerDataSource;
import rres.knetminer.datasource.api.KnetminerRequest;
import rres.knetminer.datasource.api.NetworkRequest;
import rres.knetminer.datasource.api.NetworkResponse;
import rres.knetminer.datasource.api.PlainJSONNetworkResponse;
import rres.knetminer.datasource.api.QtlResponse;
import rres.knetminer.datasource.api.SynonymsResponse;
import rres.knetminer.datasource.api.config.GoogleAnalyticsConfiguration;
import rres.knetminer.datasource.api.datamodel.EvidenceTableEntry;
import rres.knetminer.datasource.api.datamodel.GeneTableEntry;
import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;
import rres.knetminer.datasource.ondexlocal.service.SemanticMotifsSearchResult;
import rres.knetminer.datasource.ondexlocal.service.utils.ExportUtils;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.opt.net.ConfigBootstrapWebListener;
import uk.ac.rothamsted.knetminer.backend.graph.utils.GeneHelper;
import uk.ac.rothamsted.knetminer.backend.graph.utils.QTL;

/**
 * A KnetminerDataSource that knows how to load ONDEX indexes into memory and query them. Specific 
 * instances of this abstract class simply call the constructor with appropriate values for dsName 
 * (the name of the source, i.e. the 'X' in the /X/Y URl pattern), and the path to the config XML and
 * semantic motifs files in the resources package (which this abstract class lacks).
 * 
 * TODO: Although these responses are all JSON, some of the fields include embedded XML, Javascript,
 * tab-delimited or other formats within them as strings. In future these should be converted to
 * pure JSON.
 * 
 * @author holland
 * @author Marco Brandizi Replaced the parameterised constructor + introduced the config harvester, several improvements
 * 
 * Note that the @Component annotation is necessary since Spring 5, it's not recognised as a bean otherwise and 
 * despite extending a @Component interface.
 * 
 */
@Component
public class OndexLocalDataSource extends KnetminerDataSource 
{
		
	public static final String CONFIG_FILE_PATH_PROP = "knetminer.api.configFilePath"; 
	
	/**
	 * it's initialised without parameters, then it gets everything from the XML config file. This is fetched by 
	 * {@link ConfigFileHarvester}, which seeks it in {@code WEB-INF/web.xml} (see the aratiny WAR module).
	 * 
	 */
	public OndexLocalDataSource () {
		init ();
	}

	private void init ()
	{
		var configYmlPath = ConfigBootstrapWebListener.getBootstrapParameters ().getString ( CONFIG_FILE_PATH_PROP );
		if ( configYmlPath == null ) throw new IllegalStateException ( 
			"OndexLocalDataSource() can only be called if you set " + CONFIG_FILE_PATH_PROP 
			+ ", either as a Java property, a <context-param> in web.xml, or" 
			+ " a Param in a Tomcat context file (https://serverfault.com/a/126430)" 
		);
		
		var ondexServiceProvider = OndexServiceProvider.getInstance ();
		var dataService = ondexServiceProvider.getDataService ();

		// this pre-loads some properties in advance, so that we have what we need (ie, data source name) to be able 
		// to start answering the API URLs
		// This is also quick enough to be done synchronously.
		dataService.loadConfiguration ( configYmlPath );
		var config = dataService.getConfiguration ();
		var dsetInfo = config.getServerDatasetInfo ();
		var dsName = dsetInfo.getId ();
		if ( dsName == null ) throw new IllegalArgumentException ( 
			this.getClass ().getSimpleName () + " requires a data set ID in the configuration file" 
		);
		// As said elsewhere, nowadays we have only one dataset per server.
		this.setDataSourceNames ( new String[] { dsName } );
		log.info ( "Setting data source '{}'", dsName );
		
		// Now we load the data asynchronously, so that the JDK and the web container aren't stuck on it.
		// The ondexServiceProvider.getInstance() will return a NotReadyException exception until this isn't finished, 
		// that will be forwarded back to the client by any call requiring the OSP.
		ExecutorService asyncRunner = Executors.newSingleThreadExecutor ();
		asyncRunner.submit ( () -> ondexServiceProvider.initData () );
	
		log.info ( "Asynchronous Ondex initialisation started" );
	}
		
	@Override
	public CountHitsResponse countHits(String dsName, KnetminerRequest request) throws IllegalArgumentException 
	{
		var ondexServiceProvider = OndexServiceProvider.getInstance ();
		SemanticMotifSearchMgr hits = new SemanticMotifSearchMgr ( 
			request.getKeyword(), ondexServiceProvider, null, request.getTaxId()
		);
		CountHitsResponse response = new CountHitsResponse();
		response.setLuceneCount ( hits.getScoredConcepts().size() ); // number of Lucene documents
		response.setLuceneLinkedCount ( hits.getScoredConceptsCount() ); // number of Lucene documents related to genes
		response.setGeneCount ( hits.getLinkedGenesCount() ); // count unique genes linked to Lucene documents
		return response;
	}

	@Override
	public SynonymsResponse synonyms(String dsName, KnetminerRequest request) throws IllegalArgumentException 
	{
		try 
		{
			var ondexServiceProvider = OndexServiceProvider.getInstance ();
			SynonymsResponse response = new SynonymsResponse();
			response.setSynonyms(ondexServiceProvider.getUIService ().renderSynonymTable(request.getKeyword()));
			return response;
		} 
		catch (ParseException e) 
		{
			throw ExceptionUtils.buildEx ( 
				IllegalArgumentException.class, 
				e,
				"Error while counting synonyms for \"%s\": %s", 
				Optional.ofNullable ( request ).map ( KnetminerRequest::getKeyword ).orElse ( "<null response>" ),
				e.getMessage ()
			);
		}
	}

	/**
	 * We now support both the {@link region search box format QTL#fromString(String)} and the original
	 * {@link QTL#countLoci2regionStr(String) countLoci() format}. (TODO: this needs testing).
	 * 
	 */
	@Override
	public CountLociResponse countLoci(String dsName, KnetminerRequest request) throws IllegalArgumentException
	{
		String lociStr = request.getKeyword();
		if ( !lociStr.contains ( ":" ) ) lociStr = QTL.countLoci2regionStr ( lociStr );
		
		QTL chrRegion = QTL.fromString ( lociStr );
			
		log.info("Counting loci on region: {}", chrRegion );
		CountLociResponse response = new CountLociResponse();
		response.setGeneCount (
			OndexServiceProvider.getInstance ()
				.getSearchService () 
				.getLociGeneCount ( chrRegion.getChromosome (), chrRegion.getStart (), chrRegion.getEnd (), request.getTaxId () )
		);
		return response;
	}

	@Override	
	public GenomeResponse genome(String dsName, GenomeRequest request) throws IllegalArgumentException
	{
		GenomeResponse response = new GenomeResponse();
		this.handleMainSearch (response, request );
		return response;
	}

	@Override
	public QtlResponse qtl(String dsName, GenomeRequest request) throws IllegalArgumentException
	{
		QtlResponse response = new QtlResponse();
		this.handleMainSearch(response, request);
		return response;
	}

	/**
	 * Used to be named _keyword()
	 * 
	 * As you can see above, it handles the /genome and /qtl API calls.
	 * 
	 * TODO: As in 2023, in practice the API call /qtl is exactly the same as /genome, with the 
	 * addition of the qtl paramter (and this method is considering it or not, based on T), so
	 * the whole thing (API signature, implementation and use) should be cleaned into removing
	 * /qtl and managing everything from /genome, with this method (simplified).
	 * 
	 */
	private <T extends KeywordResponse> T handleMainSearch ( T response, GenomeRequest request )
		throws IllegalArgumentException 
	{
		// Find genes from the user's gene list
		Set<ONDEXConcept> userGenes = new HashSet<> ();
		var ondexServiceProvider = OndexServiceProvider.getInstance ();
		var searchService = ondexServiceProvider.getSearchService ();
		var exportService = ondexServiceProvider.getExportService ();
		var graph = ondexServiceProvider.getDataService ().getGraph ();
		var taxId = StringUtils.trimToEmpty ( request.getTaxId () );
		
		List<String> userGenesList = request.getList ();		
		if ( userGenesList != null && !userGenesList.isEmpty () )
		{
			userGenes.addAll ( searchService.filterGenesByAccessionKeywords ( userGenesList, taxId ) );
			log.info ( "Number of user provided genes: " + userGenes.size () );
		}

		// Also search Regions - only if no genes provided
		if ( userGenes.isEmpty() && !request.getQtl().isEmpty() )
			userGenes.addAll ( searchService.fetchQTLs ( request.getQtl(), taxId ) );

		// Genome search
		log.info ( "Keyword search for the {} request", response.getClass ().getName () );

		SemanticMotifSearchMgr smSearchMgr = new SemanticMotifSearchMgr (
			request.getKeyword (), ondexServiceProvider, userGenes, taxId
		);


		// Please note, this deal with the cases of /genome (response == GenomeResponse) and /qtl
		// If you add additional calls, try to apply the S-of-SOLID and deal with them separately.

		log.info ( "Keyword search done" );

		Map<ONDEXConcept, Double> candidateGenesMap = smSearchMgr.getSortedGeneCandidates ();
		Set<ONDEXConcept> candidateGenes = candidateGenesMap.keySet ();
		Stream<ONDEXConcept> genesStream = candidateGenes.parallelStream ();

		if ( !userGenes.isEmpty () )
		{
			log.info ( "Filtering {} user genes from {} candidate gene(s)", userGenes.size (), candidateGenes.size () );
			genesStream = userGenes.parallelStream ();

		}

		if ( response instanceof QtlResponse )
		{
			log.info ( "Filtering QTLs for /qtl" );

			// TODO: this is very inefficient, the right way to do it would be passing it the genes and
			// search if they match the QTL regions
			//
			Set<ONDEXConcept> genesQTL = searchService.fetchQTLs ( request.getQtl (), taxId );
			log.info ( "Keeping {} QTL(s)", genesQTL.size () );

			genesStream = genesStream.filter ( genesQTL::contains );
		}

		// TODO: messed up, genesStream is a selection of keys in candidateGenesMap, so we just need to remove
		// the filtered keys
		//
		final var candidatesProxy = new MutableObject<> ( candidateGenesMap ); // lambdas doesn't want non-finals
		Map<ONDEXConcept, Double> genesMap = genesStream.collect (
			Collectors.toConcurrentMap ( Functions.identity (),
			gene -> candidatesProxy.getValue ().getOrDefault ( gene, 0d ) )
		);
		candidatesProxy.setValue ( candidateGenesMap = null ); // Free-up memory
		
		List<ONDEXConcept> genes;
		var genesStrm = genesMap.keySet ().parallelStream ();
		if ( !taxId.isEmpty () )
			genesStrm = genesStrm.filter ( gene -> taxId.equals ( new GeneHelper ( graph, gene ).getTaxID() ) );
		
				
		// Genes are expected in order
		genes = genesStrm
			.sorted ( Comparator.comparingDouble ( genesMap::get ).reversed () )
			.collect ( Collectors.toList () );
				
		if ( response instanceof QtlResponse )
			log.info ( "{} gene(s) after QTL filter", genes.size () );

		if ( genes.size () == 0 )
			return response;

		
		// We have genes, let's use them to build actual output
		//
		log.info ( "Search almost done, assembling the result" );
		
		// Chromosome view
		//
		String xmlGViewer = "";
		// TODO: remove, we are now supporting multiple species and we assume there is always at least one
		// specie
		
		// if ( ondexServiceProvider.getDataService ().isReferenceGenome () )
		{
			// Generate Annotation file.
			log.debug ( "1.) API, doing chrome annotation" );
			xmlGViewer = exportService.exportGenomapXML (
				this.getApiUrl (), genes, userGenes, request.getQtl (), request.getKeyword (), 1000, genesMap
			);
			log.debug ( "Chrome annotation done" );
		}
		/* TODO: remove, as per comment above
		else
			log.debug ( "1.) API, no reference genome for Genomaps annotation, skipping " );
		*/

		// Gene table
		//

		log.debug ( "2.) API, doing gene table view" );

		var newSearchResult = new SemanticMotifsSearchResult ( smSearchMgr.getGeneId2RelatedConceptIds (), genesMap );
		List<GeneTableEntry> geneTable = exportService.exportGeneTable ( 
			genes, userGenes, request.getQtl (), request.getListMode (), newSearchResult 
		);

		log.debug ( "Gene table done" );

		// Evidence table
		//

		log.debug ( "3) API, doing evidence table" );
		List<EvidenceTableEntry> evidenceTable = exportService.exportEvidenceTable (
			request.getKeyword (), smSearchMgr.getScoredConcepts (), userGenes, request.getQtl (),
			request.isSortedEvidenceTable ()
		);
		log.debug ( "Evidence table done" );

		int docSize = searchService.getMapEvidences2Genes ( smSearchMgr.getScoredConcepts () ).size ();

		// Total documents
		int totalDocSize = smSearchMgr.getScoredConcepts ().size ();

		// We have annotation and table file
		response.setGViewer ( xmlGViewer );
		response.setGeneTable ( geneTable );
		response.setEvidenceTable ( evidenceTable );
		response.setGeneCount ( genes.size () );
		response.setDocSize ( docSize );
		response.setTotalDocSize ( totalDocSize );

		return response;
	}

	@Override
	public NetworkResponse network(String dsName, NetworkRequest request) throws IllegalArgumentException 
	{
		Set<ONDEXConcept> genes = new HashSet<> ();
		log.info ( "network(), searching {} gene(s)", request.getList ().size () );

		var ondexServiceProvider = OndexServiceProvider.getInstance ();
		var searchService = ondexServiceProvider.getSearchService ();

		// TODO: this is the same gene filtering we have in handleMain(), should be factorised
		//

		// Search Genes
		if ( !request.getList ().isEmpty () )
			genes.addAll ( searchService.filterGenesByAccessionKeywords ( request.getList () , request.getTaxId () ) );

		// Search Regions
		if ( !request.getQtl ().isEmpty () )
			genes.addAll ( searchService.fetchQTLs ( request.getQtl (), request.getTaxId () ) );

		// Find Semantic Motifs
		ONDEXGraph subGraph = ondexServiceProvider.getSemanticMotifService ()
			.findSemanticMotifs ( genes, request.getKeyword () );

		// Export graph
		String jsExport = ExportUtils.exportGraph2Json ( subGraph, request.isExportPlainJSON () ).getLeft ();
		
		NetworkResponse response = request.isExportPlainJSON ()
			// This is pure JSON, The response constructor builds a payload of Map<String, Object>, by
			// parsing the pure-JSON string coming from the exporter, Spring auto-converts such map back 
			// to JSON. I don't know any other clean way to prevents Spring from quoting this JSON string
			// and I cannot easily change the NetworkResponse structure, which forces us to have the
			// top-level "graph" field 
			//	
			? new PlainJSONNetworkResponse ( jsExport )
			// This is the original format, which contains Javascript declarations in the top-level "graph"
			// field, and then those declarations are in turn about JSON objects
			//
		  : new JsonLikeNetworkResponse ( jsExport );

		return response;
	}

	
	@Override
	public GoogleAnalyticsConfiguration getGoogleAnalyticsApiConfig ()
	{
		return OndexServiceProvider.getInstance ()
			.getDataService ()
			.getConfiguration ()
			.getGoogleAnalyticsApiConfig ();
	}
		
}
