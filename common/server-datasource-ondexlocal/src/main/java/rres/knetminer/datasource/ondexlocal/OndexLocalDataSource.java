package rres.knetminer.datasource.ondexlocal;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.apache.lucene.queryparser.classic.ParseException;
import org.json.JSONException;
import org.json.JSONObject;

import net.sourceforge.ondex.InvalidPluginArgumentException;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import rres.knetminer.datasource.api.CountGraphEntities;
import rres.knetminer.datasource.api.CountHitsResponse;
import rres.knetminer.datasource.api.CountLociResponse;
import rres.knetminer.datasource.api.EvidencePathResponse;
import rres.knetminer.datasource.api.GenomeResponse;
import rres.knetminer.datasource.api.GraphSummaryResponse;
import rres.knetminer.datasource.api.KeywordResponse;
import rres.knetminer.datasource.api.KnetSpaceHost;
import rres.knetminer.datasource.api.KnetminerDataSource;
import rres.knetminer.datasource.api.KnetminerRequest;
import rres.knetminer.datasource.api.LatestNetworkStatsResponse;
import rres.knetminer.datasource.api.NetworkResponse;
import rres.knetminer.datasource.api.QtlResponse;
import rres.knetminer.datasource.api.SynonymsResponse;
import rres.knetminer.datasource.ondexlocal.service.DataService;
import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;
import rres.knetminer.datasource.ondexlocal.service.SemanticMotifsSearchResult;
import uk.ac.ebi.utils.collections.OptionsMap;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;

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
 * 
 */
public abstract class OndexLocalDataSource extends KnetminerDataSource 
{	
	/**
	 * When it's initialised without parameters, it gets everything from the XML config file. This is fetched by 
	 * {@link ConfigFileHarvester}, which seeks it in {@code WEB-INF/web.xml} (see the aratiny WAR module).
	 * 
	 */
	public OndexLocalDataSource () {
		init ();
	}
	
	public OndexLocalDataSource(String dsName, String configXmlPath, String semanticMotifsPath) {
		init ( dsName, configXmlPath, semanticMotifsPath );
	}

	
	private void init () {
		init ( null, null, null );
	}

	private void init ( String dsName, String configXmlPath, String semanticMotifsPath )
	{
		// TODO: we're transitioning to the arrangement where the config is only read
		// via config file harverster and this method parameters are ignored
		if ( dsName != null || configXmlPath != null || semanticMotifsPath != null )
			throw new UnsupportedOperationException ( 
				"Parameterised version of " + this.getClass ().getSimpleName () +
				"'s constructor is no longer supported and will be removed. All params must come from the config file like data_source.xml" 
		);
		
		configXmlPath = ConfigFileHarvester.getConfigFilePath ();
		if ( configXmlPath == null ) throw new IllegalStateException ( 
			"OndexLocalDataSource() can only be called if you set " + ConfigFileHarvester.CONFIG_FILE_PATH_PROP 
			+ ", either as a Java property, a <context-param> in web.xml, or" 
			+ " a Param in a Tomcat context file (https://serverfault.com/a/126430)" 
		);
		
		var ondexServiceProvider = OndexServiceProvider.getInstance ();
		ondexServiceProvider.initGraph ( configXmlPath );

		var odxData = ondexServiceProvider.getDataService ();
		dsName = odxData.getDataSourceName ();
		if ( dsName == null ) throw new IllegalArgumentException ( 
			this.getClass ().getSimpleName () + " requires a DataSourceName, either from its extensions or the config file" 
		);
		this.setDataSourceNames ( new String[] {dsName} );
		log.info ( "Setting up data source is '{}'", dsName );
	}
	
	public CountHitsResponse countHits(String dsName, KnetminerRequest request) throws IllegalArgumentException 
	{
		var ondexServiceProvider = OndexServiceProvider.getInstance ();
		Hits hits = new Hits(request.getKeyword(), ondexServiceProvider, null);
		CountHitsResponse response = new CountHitsResponse();
		response.setLuceneCount(hits.getLuceneConcepts().size()); // number of Lucene documents
		response.setLuceneLinkedCount(hits.getLuceneDocumentsLinked()); // number of Lucene documents related to genes
		response.setGeneCount(hits.getNumConnectedGenes()); // count unique genes linked to Lucene documents
		return response;
	}

	public SynonymsResponse synonyms(String dsName, KnetminerRequest request) throws IllegalArgumentException 
	{
		try 
		{
			var ondexServiceProvider = OndexServiceProvider.getInstance ();
			SynonymsResponse response = new SynonymsResponse();
			response.setSynonyms(ondexServiceProvider.writeSynonymTable(request.getKeyword()));
			return response;
		} 
		catch (ParseException e) 
		{
			IllegalArgumentException wex = ExceptionUtils.buildEx ( 
				IllegalArgumentException.class, 
				e,
				"Error while counting synonyms for \"%s\": %s", 
				Optional.ofNullable ( request ).map ( KnetminerRequest::getKeyword ).orElse ( "<null response>" ),
				e.getMessage ()
			);
			log.error ( wex );
			throw wex;
		}
	}

	public CountLociResponse countLoci(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		String[] loci = request.getKeyword().split("-");
		String chr = loci[0];
		int start = 0, end = 0;
		if (loci.length > 1) {
			start = Integer.parseInt(loci[1]);
		}
		if (loci.length > 2) {
			end = Integer.parseInt(loci[2]);
		}
		log.info("Counting loci "+chr+":"+start+":"+end);
		CountLociResponse response = new CountLociResponse();
		response.setGeneCount(OndexServiceProvider.getInstance ().getLociGeneCount(chr, start, end));
		return response;
	}

	public GenomeResponse genome(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		GenomeResponse response = new GenomeResponse();
		this._keyword(response, request);
		return response;
	}

	public QtlResponse qtl(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		QtlResponse response = new QtlResponse();
		this._keyword(response, request);
		return response;
	}

	private <T extends KeywordResponse> T _keyword(T response, KnetminerRequest request) throws IllegalArgumentException 
	{
		// Find genes from the user's gene list
		Set<ONDEXConcept> userGenes = new HashSet<ONDEXConcept>();
		var ondexServiceProvider = OndexServiceProvider.getInstance ();
		if (request.getList() != null && request.getList().size() > 0) {
			userGenes.addAll(ondexServiceProvider.searchGenesByAccessionKeywords(request.getList()));
			log.info("Number of user provided genes: " + userGenes.size());
		}
		// Also search Regions - only if no genes provided
		if (userGenes.isEmpty() && !request.getQtl().isEmpty()) {
			userGenes.addAll(ondexServiceProvider.fetchQTLs(request.getQtl()));
		}
		if (userGenes.isEmpty()) {
			userGenes = null;
		}

		// Genome search
		log.info("Search mode: " + response.getClass().getName());
		List<ONDEXConcept> genes = new ArrayList<>();
		Hits qtlnetminerResults = new Hits(request.getKeyword(), ondexServiceProvider, userGenes);
		Map<ONDEXConcept, Double> geneMap = new HashMap<>();
		if (response.getClass().equals(GenomeResponse.class) || response.getClass().equals(QtlResponse.class)) {
			log.info("Genome or QTL response...");

			geneMap = qtlnetminerResults.getSortedCandidates(); // find qtl and add to qtl list!
			genes.addAll(geneMap.keySet());
			log.info("Number of genes: " + genes.size());

			if (userGenes != null) {
				/* use this (Set<ONDEXConcept> userGenes) in place of the genes ArrayList<ONDEXConcept> genes. */
				//   genes= new ArrayList<ONDEXConcept> (userGenes);
                            
                           /* filter scored results (ArrayList<ONDEXConcept> genes) to only retain sorted genes (by KnetScore) 
                             from user gene list (Set<ONDEXConcept> userGenes) */
				Iterator<ONDEXConcept> itr = genes.iterator();
				while (itr.hasNext()) {
					ONDEXConcept gene = itr.next();
					if (!userGenes.contains(gene)) {
						itr.remove();
					}
				}
                          
                           /* also, add any missing genes from user list (Set<ONDEXConcept> userGenes) that weren't already in the scored results 
                           (ArrayList<ONDEXConcept> genes) due to no evidences */
				for (ONDEXConcept userGene : userGenes) {
					if (!genes.contains(userGene)) {
						genes.add(userGene);
                                                geneMap.put(userGene, 0.0); // Ensure the gene is placed into the HashMap
					}
				}
				log.info("Using user gene list... genes: " + genes.size());
			}
			if (response.getClass().equals(QtlResponse.class)) {
				log.info("QTL response...");
				// filter QTL's as well
				Set<ONDEXConcept> genesQTL = ondexServiceProvider.fetchQTLs(request.getQtl());
				genes.retainAll(genesQTL);
				
				log.info("Genes after QTL filter: " + genes.size());
			}
		}

		if (genes.size() > 0) {
			String xmlGViewer = "";
			if (ondexServiceProvider.getDataService ().isReferenceGenome () ) {
				// Generate Annotation file.
				xmlGViewer = ondexServiceProvider.writeAnnotationXML(this.getApiUrl(), genes, userGenes, request.getQtl(),
						request.getKeyword(), 1000, qtlnetminerResults, request.getListMode(),geneMap);
				log.debug("1.) Genomaps annotation ");
			} else {
				log.debug("1.) No reference genome for Genomaps annotation ");
			}

			// Gene table file
			// TODO: no idea why geneMap is recalculated here insted of a more proper place, anyway, let's 
			// adapt to it
			SemanticMotifsSearchResult newSearchResult = new SemanticMotifsSearchResult (
				qtlnetminerResults.getGeneId2RelatedConceptIds (), geneMap
			);
			String geneTable = ondexServiceProvider.writeGeneTable ( 
				genes, userGenes, request.getQtl(), request.getListMode(), newSearchResult
			);                        
                                
			log.debug("2.) Gene table ");

			// Evidence table file
			String evidenceTable = ondexServiceProvider.writeEvidenceTable(request.getKeyword(), qtlnetminerResults.getLuceneConcepts(),
					userGenes, request.getQtl());
			log.debug("3.) Evidence table ");
			
			int docSize = ondexServiceProvider.getMapEvidences2Genes(qtlnetminerResults.getLuceneConcepts())
					.size();

			// Total documents
			int totalDocSize = qtlnetminerResults.getLuceneConcepts().size();

			// We have annotation and table file
			response.setGViewer(xmlGViewer);
			response.setGeneTable(geneTable);
			response.setEvidenceTable(evidenceTable);
			response.setGeneCount(genes.size());
			response.setDocSize(docSize);
			response.setTotalDocSize(totalDocSize);
		}
		return response;
	}

	public NetworkResponse network(String dsName, KnetminerRequest request) throws IllegalArgumentException 
	{
		Set<ONDEXConcept> genes = new HashSet<>();
		log.info( "network(), searching {} gene(s)",  request.getList().size() );

		var ondexServiceProvider = OndexServiceProvider.getInstance ();
		// Search Genes
		if (!request.getList().isEmpty()) {
			genes.addAll(ondexServiceProvider.searchGenesByAccessionKeywords(request.getList()));
		}

		// Search Regions
		if (!request.getQtl().isEmpty()) {
			genes.addAll(ondexServiceProvider.fetchQTLs(request.getQtl()));
		}

		// Find Semantic Motifs
		ONDEXGraph subGraph = ondexServiceProvider.getSemanticMotifService ().findSemanticMotifs(genes, request.getKeyword());

		// Export graph
		NetworkResponse response = new NetworkResponse();
		try {
			response.setGraph(ondexServiceProvider.exportGraph2Json(subGraph).getLeft());
		} catch (InvalidPluginArgumentException e) {
			log.error("Failed to export graph", e);
			throw new Error(e);
		}
		return response;
	}

	public EvidencePathResponse evidencePath(String dsName, KnetminerRequest request) throws IllegalArgumentException
	{
		int evidenceOndexID = Integer.parseInt(request.getKeyword());
		Set<ONDEXConcept> genes = new HashSet<>();
		var ondexServiceProvider = OndexServiceProvider.getInstance ();

		// Search Genes
		if (!request.getList().isEmpty()) {
			genes.addAll(ondexServiceProvider.searchGenesByAccessionKeywords(request.getList()));
		}

		ONDEXGraph subGraph = ondexServiceProvider.getSemanticMotifService ().findEvidencePaths(evidenceOndexID, genes);

		// Export graph
		EvidencePathResponse response = new EvidencePathResponse();
		try {
			response.setGraph(ondexServiceProvider.exportGraph2Json(subGraph).getLeft ());
		} catch (InvalidPluginArgumentException e) {
			log.error("Failed to export graph", e);
			throw new Error(e);
		}
		return response;
	}
	
	public LatestNetworkStatsResponse latestNetworkStats(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		LatestNetworkStatsResponse response = new LatestNetworkStatsResponse();
		try {
			var opts = OndexServiceProvider.getInstance ().getDataService ().getOptions ();
			byte[] encoded = Files.readAllBytes(Paths.get(opts.getString("DataPath"), "latestNetwork_Stats.tab"));
			response.stats = new String(encoded, Charset.defaultCharset());
		} catch (IOException ex) {
	    	log.error(ex);
	    	throw new Error(ex); 
	    }
		return response;
	}
        
    public GraphSummaryResponse dataSource(String dsName, KnetminerRequest request) throws IllegalArgumentException 
    {
        GraphSummaryResponse response = new GraphSummaryResponse();
        
        try {
        		var ondexServiceProvider = OndexServiceProvider.getInstance ();
        		var odxData = ondexServiceProvider.getDataService ();
        		
            // Parse the data into a JSON format & set the graphSummary as is.
        		// This data is obtained from the maven-settings.xml
            JSONObject summaryJSON = new JSONObject();
            summaryJSON.put("dbVersion", odxData.getDatasetVersion () );
            summaryJSON.put("sourceOrganization", odxData.getDatasetOrganization ());
            odxData.getTaxIds ().forEach((taxID) -> {
               summaryJSON.put("speciesTaxid", taxID);
            });
            summaryJSON.put("speciesName", odxData.getSpecies());

            // TODO: initially, this was set with ondexServiceProvider.getCreationDate()
            // which corresponded to the server's starting time.
            // TODO: after discussion, we require this to come from the OXL's last-modified date
            // (and later, from inside the OXL, together with graph metadata
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm");  
            var timestampStr = formatter.format ( new Date() );
            summaryJSON.put("dbDateCreated", timestampStr);

            summaryJSON.put("provider", odxData.getDatasetProvider () );
            String jsonString = summaryJSON.toString();
            // Removing the pesky double quotes
            jsonString = jsonString.substring(1, jsonString.length() - 1);
            log.info("response.dataSource= " + jsonString); // test
            response.dataSource = jsonString;
            
        } catch (JSONException ex) {
            log.error(ex);
            throw new Error(ex);
        }
        
        return response;
        
    }
		
		public CountGraphEntities geneCount(String dsName, KnetminerRequest request) throws IllegalArgumentException 
		{
				log.info("geneCount() Search genes " + request.getList().size());
        Set<ONDEXConcept> genes = new HashSet<>();

    		var ondexServiceProvider = OndexServiceProvider.getInstance ();

        // Search Genes
        if (!request.getList().isEmpty()) {
            genes.addAll(ondexServiceProvider.searchGenesByAccessionKeywords(request.getList()));
        }

        // Search Regions
        if (!request.getQtl().isEmpty()) {
            genes.addAll(ondexServiceProvider.fetchQTLs(request.getQtl()));
        }

        // Find Semantic Motifs
        ONDEXGraph subGraph = 
        	ondexServiceProvider.getSemanticMotifService ().findSemanticMotifs(genes, request.getKeyword());
        
        CountGraphEntities response = new CountGraphEntities();
        try {
            // Set the graph
            var jsonGraph = ondexServiceProvider.exportGraph2Json(subGraph).getRight ();
            log.info("Set graph, now getting the number of nodes...");
            response.setNodeCount( Integer.toString ( jsonGraph.getConcepts ().size () ) );
            response.setRelationshipCount( Integer.toString ( jsonGraph.getRelations ().size () ) );
        } catch (InvalidPluginArgumentException e) {
            log.error("Failed to export graph", e);
            throw new Error(e);
        }
        return response;
    }
	
    public KnetSpaceHost ksHost(String dsName, KnetminerRequest request) throws IllegalArgumentException {
        KnetSpaceHost response = new KnetSpaceHost();
        response.setKsHostUrl(OndexServiceProvider.getInstance ().getDataService ().getKnetSpaceHost ());
      return response;
    }
}
