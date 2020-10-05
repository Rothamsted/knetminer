package rres.knetminer.datasource.ondexlocal;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.Set;

import org.apache.lucene.queryparser.classic.ParseException;
import org.json.JSONException;
import org.json.JSONObject;

import net.sourceforge.ondex.InvalidPluginArgumentException;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import org.json.JSONException;
import org.json.JSONObject;
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
public abstract class OndexLocalDataSource extends KnetminerDataSource {

	private OndexServiceProvider ondexServiceProvider;
	
	private Properties props = new Properties();
	
	
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

	@SuppressWarnings ( { "rawtypes", "unchecked" } )
	private void init ( String dsName, String configXmlPath, String semanticMotifsPath )
	{
		// Config.xml location can be specified in different ways, see the constructors
		if ( configXmlPath == null )
		{
			configXmlPath = ConfigFileHarvester.getConfigFilePath ();
			if ( configXmlPath == null ) throw new IllegalStateException ( 
				"OndexLocalDataSource() can only be called if you set " + ConfigFileHarvester.CONFIG_FILE_PATH_PROP 
				+ ", either as a Java property, a <context-param> in web.xml, or" 
				+ " a Param in a Tomcat context file (https://serverfault.com/a/126430)" 
			);
		}
		
		try 
		{
			URL configUrl = configXmlPath.startsWith ( "file://" )
				? new URL ( configXmlPath )
				: Thread.currentThread().getContextClassLoader().getResource ( configXmlPath );
			
			this.props.loadFromXML(configUrl.openStream());
		}
		catch (IOException e) {
			throw new UncheckedIOException ( "Error while loading config file <" + configXmlPath + ">", e);
		}

		if ( dsName == null ) dsName = this.props.getProperty ( "DataSourceName", null );
		if ( dsName == null ) throw new IllegalArgumentException ( 
			this.getClass ().getSimpleName () + " requires a DataSourceName, either from its extensions or the config file" 
		);
		this.setDataSourceNames(new String[] {dsName});
		
		if ( semanticMotifsPath == null )
			// We need it here, to support legacy method interfaces. It is later put back into properties
			semanticMotifsPath = this.props.getProperty ( "StateMachineFilePath", null );
		
		this.ondexServiceProvider = new OndexServiceProvider();

		// All the properties from config.xml are forwarded to the 
		// service provider, so that further configuration can be bootstrapped from
		// base properties.
		this.ondexServiceProvider.setOptions ( (Map) this.props );

		this.ondexServiceProvider.setReferenceGenome(Boolean.parseBoolean(this.getProperty("reference_genome")));
		log.info("Datasource "+dsName+" reference genome: "+this.ondexServiceProvider.getReferenceGenome());
		this.ondexServiceProvider.setTaxId(Arrays.asList(this.getProperty("SpeciesTaxId").split(",")));
		log.info("Datasource "+dsName+" tax ID: "+Arrays.toString(this.ondexServiceProvider.getTaxId().toArray()));
		this.ondexServiceProvider.setExportVisible(Boolean.parseBoolean(this.getProperty("export_visible_network")));
		log.info("Datasource "+dsName+" export visible: "+this.ondexServiceProvider.getExportVisible());
		this.ondexServiceProvider.setVersion(Integer.parseInt(this.getProperty("version")));
		log.info("Datasource " + dsName + " species version: " + this.ondexServiceProvider.getVersion());
		this.ondexServiceProvider.setSource(this.getProperty("sourceOrganization"));
		log.info("Datasource " + dsName + " organisation source: " + this.ondexServiceProvider.getSource());
		this.ondexServiceProvider.setProvider(this.getProperty("provider"));
		log.info("Datasource " + dsName + " provider source: " + this.ondexServiceProvider.getProvider());
		this.ondexServiceProvider.setSpecies(this.getProperty("specieName"));
		log.info("Datasource " + dsName + " species name: " + this.ondexServiceProvider.getSpecies());
		this.ondexServiceProvider.setKnetspaceHost(this.getProperty("knetSpaceHost"));
		//log.info("Datasource " + dsName + " KnetSpace host: " + this.ondexServiceProvider.getKnetspaceHost());
                
                

		this.ondexServiceProvider.createGraph (
			this.getProperty("DataPath"), this.getProperty("DataFile"), semanticMotifsPath
		);
	}
	
	public String getProperty(String key) {
		return this.props.getProperty(key);
	}

	/** 
	 * This is made available for debugging or tweaks like the ones in {@code CypherDebuggerService}.
	 */
	public OndexServiceProvider getOndexServiceProvider () {
		return ondexServiceProvider;
	}

	public CountHitsResponse countHits(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		Hits hits = new Hits(request.getKeyword(), this.ondexServiceProvider, null);
		CountHitsResponse response = new CountHitsResponse();
		response.setLuceneCount(hits.getLuceneConcepts().size()); // number of Lucene documents
		response.setLuceneLinkedCount(hits.getLuceneDocumentsLinked()); // number of Lucene documents related to genes
		response.setGeneCount(hits.getNumConnectedGenes()); // count unique genes linked to Lucene documents
		return response;
	}

	public SynonymsResponse synonyms(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		try {
			SynonymsResponse response = new SynonymsResponse();
			response.setSynonyms(this.ondexServiceProvider.writeSynonymTable(request.getKeyword()));
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
		response.setGeneCount(this.ondexServiceProvider.getGeneCount(chr, start, end));
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

	private <T extends KeywordResponse> T _keyword(T response, KnetminerRequest request)
			throws IllegalArgumentException {
		// Find genes from the user's gene list
		Set<ONDEXConcept> userGenes = new HashSet<ONDEXConcept>();
		if (request.getList() != null && request.getList().size() > 0) {
			userGenes.addAll(this.ondexServiceProvider.searchGenes(request.getList()));
			log.info("Number of user provided genes: " + userGenes.size());
		}
		// Also search Regions - only if no genes provided
		if (userGenes.isEmpty() && !request.getQtl().isEmpty()) {
			userGenes.addAll(this.ondexServiceProvider.searchQTLs(request.getQtl()));
		}
		if (userGenes.isEmpty()) {
			userGenes = null;
		}

		// Genome search
		log.info("Search mode: " + response.getClass().getName());
		ArrayList<ONDEXConcept> genes = new ArrayList<ONDEXConcept>();
		Hits qtlnetminerResults = new Hits(request.getKeyword(), this.ondexServiceProvider, userGenes);
		Map<ONDEXConcept, Double> geneMap = new HashMap<ONDEXConcept, Double>();
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
				genes = this.ondexServiceProvider.filterQTLs(genes, request.getQtl());
				log.info("Genes after QTL filter: " + genes.size());
			}
		}

		if (genes.size() > 0) {
			String xmlGViewer = "";
			if (this.ondexServiceProvider.getReferenceGenome() == true) { // Generate Annotation file.
				xmlGViewer = this.ondexServiceProvider.writeAnnotationXML(this.getApiUrl(), genes, userGenes, request.getQtl(),
						request.getKeyword(), 1000, qtlnetminerResults, request.getListMode(),geneMap);
                                // temporary...
                        /*        String genomaps_filename= Paths.get(this.getProperty("DataPath"), System.currentTimeMillis()+"_genomaps.xml").toString();
                                this.ondexServiceProvider.writeResultsFile(genomaps_filename, xmlGViewer);
                                */
                                
				log.debug("1.) Genomaps annotation ");
			} else {
				log.debug("1.) No reference genome for Genomaps annotation ");
			}

			// Gene table file
			String geneTable = this.ondexServiceProvider.writeGeneTable(genes, userGenes, request.getQtl(),
					request.getListMode(),geneMap);                        // temporary...
                    /*    String gv_filename= Paths.get(this.getProperty("DataPath"), System.currentTimeMillis()+"_GeneTable.tab").toString();
                        this.ondexServiceProvider.writeResultsFile(gv_filename, geneTable); */
                                
			log.debug("2.) Gene table ");

			// Evidence table file
			String evidenceTable = this.ondexServiceProvider.writeEvidenceTable(request.getKeyword(), qtlnetminerResults.getLuceneConcepts(),
					userGenes, request.getQtl());
                        // temporary...
                    /*    String ev_filename= Paths.get(this.getProperty("DataPath"), System.currentTimeMillis()+"_EvidenceTable.tab").toString();
                        this.ondexServiceProvider.writeResultsFile(ev_filename, evidenceTable); */

			log.debug("3.) Evidence table ");

			// Document count (only related with genes)
			int docSize = this.ondexServiceProvider.getMapEvidences2Genes(qtlnetminerResults.getLuceneConcepts())
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

	public NetworkResponse network(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		Set<ONDEXConcept> genes = new HashSet<>();

		log.info("Call applet! Search genes " + request.getList().size());

		// Search Genes
		if (!request.getList().isEmpty()) {
			genes.addAll(this.ondexServiceProvider.searchGenes(request.getList()));
		}

		// Search Regions
		if (!request.getQtl().isEmpty()) {
			genes.addAll(this.ondexServiceProvider.searchQTLs(request.getQtl()));
		}

		// Find Semantic Motifs
		ONDEXGraph subGraph = this.ondexServiceProvider.findSemanticMotifs(genes, request.getKeyword());

		// Export graph
		NetworkResponse response = new NetworkResponse();
		try {
			response.setGraph(this.ondexServiceProvider.exportGraph(subGraph));
		} catch (InvalidPluginArgumentException e) {
			log.error("Failed to export graph", e);
			throw new Error(e);
		}
		return response;
	}

	public EvidencePathResponse evidencePath(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		int evidenceOndexID = Integer.parseInt(request.getKeyword());
		Set<ONDEXConcept> genes = new HashSet<ONDEXConcept>();

		// Search Genes
		if (!request.getList().isEmpty()) {
			genes.addAll(this.ondexServiceProvider.searchGenes(request.getList()));
		}

		ONDEXGraph subGraph = this.ondexServiceProvider.evidencePath(evidenceOndexID, genes);

		// Export graph
		EvidencePathResponse response = new EvidencePathResponse();
		try {
			response.setGraph(this.ondexServiceProvider.exportGraph(subGraph));
		} catch (InvalidPluginArgumentException e) {
			log.error("Failed to export graph", e);
			throw new Error(e);
		}
		return response;
	}
	
	public LatestNetworkStatsResponse latestNetworkStats(String dsName, KnetminerRequest request) throws IllegalArgumentException {
		LatestNetworkStatsResponse response = new LatestNetworkStatsResponse();
		try {
			byte[] encoded = Files.readAllBytes(Paths.get(this.getProperty("DataPath"), "latestNetwork_Stats.tab"));
			response.stats = new String(encoded, Charset.defaultCharset());
		} catch (IOException ex) {
	    	log.error(ex);
	    	throw new Error(ex); 
	    }
		return response;
	}
        
        public GraphSummaryResponse dataSource(String dsName, KnetminerRequest request) throws IllegalArgumentException {
            GraphSummaryResponse response = new GraphSummaryResponse();
            
            try {
                // Parse the data into a JSON format & set the graphSummary as is - this data is obtained from the maven-settings.xml
                JSONObject summaryJSON = new JSONObject();
                summaryJSON.put("dbVersion", this.ondexServiceProvider.getVersion());
                summaryJSON.put("sourceOrganization", this.ondexServiceProvider.getSource());
                this.ondexServiceProvider.getTaxId().forEach((taxID) -> {
                    summaryJSON.put("speciesTaxid", taxID);
                });
                summaryJSON.put("speciesName", this.ondexServiceProvider.getSpecies());
                summaryJSON.put("dbDateCreated", this.ondexServiceProvider.getCreationDate());
                summaryJSON.put("provider", this.ondexServiceProvider.getProvider());
                String jsonString = summaryJSON.toString();
                // Removing the pesky double qoutations
                jsonString = jsonString.substring(1, jsonString.length() - 1);
                log.info("response.dataSource= " + jsonString); // test
                response.dataSource = jsonString;
                
            } catch (JSONException ex) {
                log.error(ex);
                throw new Error(ex);
            }
            
            return response;
            
        }
		
		public CountGraphEntities geneCount(String dsName, KnetminerRequest request) throws IllegalArgumentException {
        Set<ONDEXConcept> genes = new HashSet<>();

        log.info("Call applet! Search genes " + request.getList().size());

        // Search Genes
        if (!request.getList().isEmpty()) {
            genes.addAll(this.ondexServiceProvider.searchGenes(request.getList()));
        }

        // Search Regions
        if (!request.getQtl().isEmpty()) {
            genes.addAll(this.ondexServiceProvider.searchQTLs(request.getQtl()));
        }

        // Find Semantic Motifs
        ONDEXGraph subGraph = this.ondexServiceProvider.findSemanticMotifs(genes, request.getKeyword());
        
        CountGraphEntities response = new CountGraphEntities();
        try {
            // Set the graph
            ondexServiceProvider.exportGraph(subGraph);
            log.info("Set graph, now getting the number of nodes...");
            response.setNodeCount(ondexServiceProvider.getNodeCount());
            response.setRelationshipCount(ondexServiceProvider.getRelationshipCount());
        } catch (InvalidPluginArgumentException e) {
            log.error("Failed to export graph", e);
            throw new Error(e);
        }
        return response;
    }
	
    public KnetSpaceHost ksHost(String dsName, KnetminerRequest request) throws IllegalArgumentException {
        KnetSpaceHost response = new KnetSpaceHost();
        response.setKsHostUrl(this.ondexServiceProvider.getKnetspaceHost());
      return response;
    }
}
