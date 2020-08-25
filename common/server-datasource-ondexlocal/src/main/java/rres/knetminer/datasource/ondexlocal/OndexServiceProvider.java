package rres.knetminer.datasource.ondexlocal;

import static java.util.stream.Collectors.toMap;

import java.awt.Color;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.file.Paths;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.GZIPOutputStream;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.core.WhitespaceAnalyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Query;

import net.sourceforge.ondex.InvalidPluginArgumentException;
import net.sourceforge.ondex.ONDEXPluginArguments;
import net.sourceforge.ondex.algorithm.graphquery.AbstractGraphTraverser;
import net.sourceforge.ondex.algorithm.graphquery.nodepath.EvidencePathNode;
import net.sourceforge.ondex.args.FileArgumentDefinition;
import net.sourceforge.ondex.config.ONDEXGraphRegistry;
import net.sourceforge.ondex.core.Attribute;
import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptAccession;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.EntityFactory;
import net.sourceforge.ondex.core.EvidenceType;
import net.sourceforge.ondex.core.MetaDataFactory;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXGraphMetaData;
import net.sourceforge.ondex.core.ONDEXRelation;
import net.sourceforge.ondex.core.RelationType;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.core.searchable.LuceneConcept;
import net.sourceforge.ondex.core.searchable.LuceneEnv;
import net.sourceforge.ondex.core.searchable.ScoredHits;
import net.sourceforge.ondex.core.util.ONDEXGraphUtils;
import net.sourceforge.ondex.exception.type.PluginConfigurationException;
import net.sourceforge.ondex.export.cyjsJson.Export;
import net.sourceforge.ondex.filter.unconnected.ArgumentNames;
import net.sourceforge.ondex.filter.unconnected.Filter;
import net.sourceforge.ondex.logging.ONDEXLogger;
import net.sourceforge.ondex.parser.oxl.Parser;
import net.sourceforge.ondex.tools.ondex.ONDEXGraphCloner;
import rres.knetminer.datasource.api.QTL;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.io.IOUtils;
import uk.ac.ebi.utils.runcontrol.PercentProgressLogger;

import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValue;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttrValueAsString;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getOrCreateAttributeName;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getOrCreateConceptClass;
import static net.sourceforge.ondex.core.util.ONDEXGraphUtils.getAttributeName;


import static java.lang.Math.sqrt;
import static java.lang.Math.pow;


/**
 * Parent class to all ondex service provider classes implementing organism
 * specific searches.
 *
 * @author taubertj, pakk, singha
 */
public class OndexServiceProvider {

    private final Logger log = LogManager.getLogger(getClass());

    /**
     * ChromosomeID mapping for different datasets
     */
    // BidiMap<Integer, String> chromBidiMap = new DualHashBidiMap<Integer,
    // String>();
    /**
     * GraphTraverser will be initiated with a state machine
     */
    private AbstractGraphTraverser graphTraverser;

    /**
     * Ondex knowledge base as memory graph
     */
    private ONDEXGraph graph;

    /**
     * Query-independent Ondex motifs as a hash map
     */
    private static HashMap<Integer, Set<Integer>> mapGene2Concepts;
    private static HashMap<Integer, Set<Integer>> mapConcept2Genes;

    /**
     * HashMap of geneID -> endNodeID_pathLength
     */
    private static HashMap<String, Integer> mapGene2PathLength;

    /**
     * Query-dependent mapping between genes and concepts that contain query
     * terms
     */
    private HashMap<Integer, Set<Integer>> mapGene2HitConcept;

    /**
     * Helper from Gene to QTL mapping
     */
    private HashMap<Integer, Set<Integer>> mapGene2QTL;

    /**
     * number of genes in genome
     */
    private int numGenesInGenome;

    /**
     * index the graph
     */
    private LuceneEnv luceneMgr;

    /**
     * TaxID of organism for which the knowledgebase was created
     */
    private List<String> taxID;
    
    /**
     * Version of KnetMiner being used
     **/
    private int version;
    
    /**
     * The organisation source name
     */
    private String sourceOrganization;
    
    /**
    * defaultExportedPublicationCount value
    */
    public static final String OPT_DEFAULT_NUMBER_PUBS = "defaultExportedPublicationCount";
    
    /** 
     * The Date of graph creation
     */
    private final Date creationDate = new Date();
    
    /**
     * The providers name
     */
    private String provider;
    
    /** 
     * Species Name provided via maven-settings
     */
    private String speciesName;
	
	/*
    * Host url provided by mav args (otherwise default is assigned) for knetspace
    */
    private String knetspaceHost;

    
    /**
     * true if a reference genome is provided
     */
    private boolean referenceGenome;

    private boolean export_visible_network;

    private Map<String, Object> options = new HashMap<>();
	
	    /**
     * Node and relationship number for given gene
     */
    
    private String nodeCount;
    
    private String relationshipCount;

    /**
     * Loads configuration for chromosomes and initialises map
     */
    public OndexServiceProvider() {

    }

    /**
     * Load OXL data file into memory Build Lucene index for the Ondex graph
     * Create a state machine for semantic motif search
     *
     * @throws ArrayIndexOutOfBoundsException
     * @throws PluginConfigurationException
     */
    public void createGraph(String dataPath, String graphFileName, String smFileName)
    {
        log.info("Loading graph from " + graphFileName);
        
        // new in-memory graph
        graph = new MemoryONDEXGraph("OndexKB");

        loadOndexKBGraph(graphFileName);
        indexOndexGraph(graphFileName, dataPath);

        if (graphTraverser == null) {
            graphTraverser = AbstractGraphTraverser.getInstance(this.getOptions());
        }

        // These might be needed by one implementation or the other. Those that don't use one of these properties 
        // can just ignore them.
        graphTraverser.setOption("StateMachineFilePath", smFileName);
        graphTraverser.setOption("ONDEXGraph", graph);

        populateHashMaps(graphFileName, dataPath);

        // determine number of genes in given species (taxid)
        ONDEXGraphMetaData gmeta = graph.getMetaData();
        AttributeName attTAXID = gmeta.getAttributeName("TAXID");
        ConceptClass ccGene = gmeta.getConceptClass("Gene");
        Set<ONDEXConcept> seed = graph.getConceptsOfConceptClass(ccGene);

        for (ONDEXConcept gene : seed) {
            if (gene.getAttribute(attTAXID) != null
                    && taxID.contains(gene.getAttribute(attTAXID).getValue().toString())) {
                numGenesInGenome++;
            }
        }

        // Write Stats about the created Ondex graph & its mappings to a file.
        log.info("Saving graph stats to " + dataPath);
        displayGraphStats(dataPath);

        log.info("Done loading " + graphFileName + ". Waiting for queries...");
    }

    /*
     * Generate Stats about the created Ondex graph and its mappings:
     * mapConcept2Genes & mapGene2Concepts. Author Singhatt
     * Updating to also give Concept2Gene per concept
     */
    private void displayGraphStats(String fileUrl) {
        // Update the Network Stats file that holds the latest Stats information.
        String fileName = Paths.get(fileUrl, "latestNetwork_Stats.tab").toString();
        int minValues, maxValues = 0, avgValues, allValuesCount = 0;


        // Also, create a timetamped Stats file to retain historic Stats
        // information.
        long timestamp = System.currentTimeMillis();
        String newFileName = Paths.get(fileUrl, timestamp + "_Network_Stats.tab").toString();
        try 
        {
            int totalGenes = numGenesInGenome;
            int totalConcepts = graph.getConcepts().size();
            int totalRelations = graph.getRelations().size();
            int geneEvidenceConcepts = mapConcept2Genes.size();
            minValues = geneEvidenceConcepts > 0
                    ? mapGene2Concepts.get(mapGene2Concepts.keySet().iterator ().next ()).size()
                    : 0; // initial value
            /*
             * Get the min., max. & average size (no. of values per key) for the
             * gene-evidence network (in the mapGene2Concepts HashMap.
             */
            Set<Map.Entry<Integer, Set<Integer>>> set = mapGene2Concepts.entrySet(); // dataMap.entrySet();
            Iterator<Map.Entry<Integer, Set<Integer>>> iterator = set.iterator();
            while (iterator.hasNext()) {
                Map.Entry<Integer, Set<Integer>> mEntry = iterator.next();
                Set<Integer> value = mEntry.getValue(); // Value HashSet<Integer>).
                
                int valuesNo = value.size(); // size of the values
                
                if (valuesNo < minValues) minValues = valuesNo;
                if (valuesNo > maxValues) maxValues = valuesNo;

                // Retain the sum of sizes of all the key-value pairs in the
                // HashMap.
                allValuesCount += valuesNo;
            }

            // Total no. of keys in the HashMap.
            int genesCount = mapGene2Concepts.keySet().size();
            // Calculate average size of gene-evidence networks in the HashMap.
            avgValues = genesCount > 0 ? allValuesCount / genesCount : 0;

            // Write the Stats to a .tab file.
            StringBuffer sb = new StringBuffer();
            // sb.append("<?xml version=\"1.0\" standalone=\"yes\"?>\n");
            sb.append("<stats>\n");
            sb.append("<totalGenes>").append(totalGenes).append("</totalGenes>\n");
            sb.append("<totalConcepts>").append(totalConcepts).append("</totalConcepts>\n");
            sb.append("<totalRelations>").append(totalRelations).append("</totalRelations>\n");
            sb.append("<geneEvidenceConcepts>").append(geneEvidenceConcepts).append("</geneEvidenceConcepts>\n");
            sb.append("<evidenceNetworkSizes>\n");
            sb.append("<minSize>").append(minValues).append("</minSize>\n");
            sb.append("<maxSize>").append(maxValues).append("</maxSize>\n");
            sb.append("<avgSize>").append(avgValues).append("</avgSize>\n");
            sb.append("</evidenceNetworkSizes>\n");

            Set<ConceptClass> conceptClasses = graph.getMetaData().getConceptClasses(); // get all concept classes
            Set<ConceptClass> sortedConceptClasses = new TreeSet<>(conceptClasses); // sorted

            // Display table breakdown of all conceptClasses in network
            sb.append("<conceptClasses>\n");
            for (ConceptClass conClass : sortedConceptClasses) {
                if (graph.getConceptsOfConceptClass(conClass).size() > 0) {
                    String conID = conClass.getId(); // Get concept ID
                    int conCount = graph.getConceptsOfConceptClass(conClass).size(); // Get count of concept
                    conID = conID.equalsIgnoreCase("Path") ? "Pathway" : conID;
                    conID = conID.equalsIgnoreCase("Comp") ? "Compound" : conID;
                    if (!conID.equalsIgnoreCase("Thing") && !conID.equalsIgnoreCase("TestCC")) { // exclude "Thing" CC
                        sb.append("<cc_count>").append(conID).append("=").append(conCount).append("</cc_count>\n");
                    }
                }
            }
            sb.append("</conceptClasses>\n");
            sb.append("<ccgeneEviCount>\n"); // Obtain concept count from concept2gene

            Map<String, Long> C2GcountMap = mapConcept2Genes.entrySet()
                    .stream()
                    .collect(Collectors.groupingBy(
                             v -> graph.getConcept(v.getKey())
                                                   .getOfType()
                                                   .getId(),
                                                   Collectors.counting()));

            // Ensure that the missing ID's are added to the Map, if they weren't in the mapConcept2Genes map.
            sortedConceptClasses.stream().forEach(conceptClass -> {
                if (graph.getConceptsOfConceptClass(conceptClass).size() > 0) {
                    String conceptID = conceptClass.getId(); 
                    if (!C2GcountMap.keySet().contains(conceptID)
                            && !conceptID.equalsIgnoreCase("Thing")
                            && !conceptID.equalsIgnoreCase("TestCC")) {
                        C2GcountMap.put(conceptID, Long.valueOf(0));
                    }
                }
            });

            TreeMap<String, Long> sortedC2GcountMap = new TreeMap<>(C2GcountMap); 

            sortedC2GcountMap.entrySet().stream().forEach(pair -> {
                for (ConceptClass concept_class : sortedConceptClasses) {
                    if (graph.getConceptsOfConceptClass(concept_class).size() > 0) {
                        String conID = concept_class.getId();  
                        if (pair.getKey().equals(conID)) {
                            conID = conID.equalsIgnoreCase("Path") ? "Pathway" : conID;
                            conID = conID.equalsIgnoreCase("Comp") ? "Compound" : conID;
                            sb.append("<ccEvi>").append(conID).append("=>").append(Math.toIntExact(pair.getValue())).append("</ccEvi>\n");
                        }
                    }
                    }
            });

            sb.append("</ccgeneEviCount>\n");
            sb.append("<connectivity>\n");  // Relationships per concept
            for (ConceptClass conceptClass : sortedConceptClasses) {
                if (graph.getConceptsOfConceptClass(conceptClass).size() > 0) {
                    String conID = conceptClass.getId();                    
                    int relationCount = graph.getRelationsOfConceptClass(conceptClass).size(); 
                    int conCount = graph.getConceptsOfConceptClass(conceptClass).size(); 
                    conID = conID.equalsIgnoreCase("Path") ? "Pathway" : conID;
                    conID = conID.equalsIgnoreCase("Comp") ? "Compound" : conID;
                    if (!conID.equalsIgnoreCase("Thing") && !conID.equalsIgnoreCase("TestCC")) {
                        float connectivity = ((float) relationCount / (float) conCount);
                        sb.append("<hubiness>").append(conID).append("->").append(String.format("%2.02f", connectivity)).append("</hubiness>\n");
                    }
                }
            }
            sb.append("</connectivity>\n");
            sb.append("</stats>");

            // Update the file storing the latest Stats data.
            try ( var out = new BufferedWriter(new FileWriter(fileName)) ) {
            	out.write(sb.toString()); // write contents.
            }

            // Also, create the timestamped Stats file.
            try ( var out = new BufferedWriter(new FileWriter(newFileName)) ) {
            	out.write(sb.toString()); // write contents.
            }

            /*
             * generate gene2evidence .tab file with contents of the mapGenes2Concepts
             * HashMap & evidence2gene .tab file with contents of the mapConcepts2Genes
             * HashMap
             */
            //   generateGeneEvidenceStats(fileUrl); // DISABLED
        } catch (IOException ex) {
          log.error("Error while writing stats for the Knetminer graph: " + ex.getMessage (), ex);
        }
    }

    /**
     * Loads OndexKB Graph (OXL data file into memory)
     */
    private void loadOndexKBGraph(String filename)
    {
        try {
            log.debug("Start Loading OndexKB Graph..." + filename);
            Parser.loadOXL(filename, graph);
            log.debug("OndexKB Graph Loaded Into Memory");

            // remove any pre-existing, visible, size and flagged attributes from concepts and relations
            removeOldAttributesFromKBGraph();
        } 
        catch (Exception e) 
        {
            log.error("Failed to load graph", e);
            ExceptionUtils.throwEx (
            	RuntimeException.class, e, "Error while loading Knetminer graph: %s", e.getMessage ()
            ); 
        }
    }

    /**
     * remove any pre-existing, visible, size and flagged attributes from
     * concepts and relations 29-07-2019
     */
    private void removeOldAttributesFromKBGraph() 
    {
    	try
    	{
	      log.debug ( "Remove old 'visible' attributes from all concepts and relations..." );
	      
	      Stream.of ( "visible", "size", "flagged" )
	      .forEach ( attrId -> ONDEXGraphUtils.removeConceptAttribute ( graph, attrId ) );
	
	      Stream.of ( "visible", "size" )
	      .forEach ( attrId -> ONDEXGraphUtils.removeRelationAttribute ( graph, attrId ) );
    	}
    	catch (Exception ex)
    	{
        log.warn("Failed to remove pre-existing attributes from graph: {}", ex.getMessage());
        log.trace("Failed to remove pre-existing attributes from graph, details: ", ex );
      }
    }

    /**
     * Indexes Ondex Graph
     */
    private void indexOndexGraph(String graphFileName, String dataPath)
    {
        try 
        {
            // index the Ondex graph
            File graphFile = new File(graphFileName);
            File indexFile = Paths.get ( dataPath, "index" ).toFile();
            if (indexFile.exists() && (indexFile.lastModified() < graphFile.lastModified())) {
                log.info("Graph file updated since index last built, deleting old index");
                FileUtils.deleteDirectory(indexFile);
            }
            log.info("Building Lucene Index: " + indexFile.getAbsolutePath());
            luceneMgr = new LuceneEnv(indexFile.getAbsolutePath(), !indexFile.exists());
            luceneMgr.addONDEXListener( new ONDEXLogger() ); // sends Ondex messages to the logger.
            luceneMgr.setONDEXGraph(graph);
            luceneMgr.setReadOnlyMode ( true );
            log.info("Lucene Index created");
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
     * Export the Ondex graph to file system as a .oxl file and also in JSON
     * format using the JSON Exporter plugin in Ondex.
     *
     * @param ONDEXGraph graph
     * @throws InvalidPluginArgumentException
     */
    public String exportGraph(ONDEXGraph og) throws InvalidPluginArgumentException
    {
        // Unconnected filter
        Filter uFilter = new Filter();
        ONDEXPluginArguments uFA = new ONDEXPluginArguments(uFilter.getArgumentDefinitions());
        uFA.addOption(ArgumentNames.REMOVE_TAG_ARG, true);

        List<String> ccRestrictionList = Arrays.asList("Publication", "Phenotype", "Protein",
                "Drug", "Chromosome", "Path", "Comp", "Reaction", "Enzyme", "ProtDomain", "SNP",
                "Disease", "BioProc", "Trait");
        ccRestrictionList.stream().forEach(cc -> 
        {
          try {
          	uFA.addOption(ArgumentNames.CONCEPTCLASS_RESTRICTION_ARG, cc);
          } 
          catch (InvalidPluginArgumentException ex) {
          	// TODO: End user doesn't get this!
          	log.error ( "Failed to restrict concept class " + cc + ": " + ex, ex );
          }
        });
        log.info ( "Filtering concept classes " + ccRestrictionList );

        uFilter.setArguments(uFA);
        uFilter.setONDEXGraph(og);
        uFilter.start();

        ONDEXGraph graph2 = new MemoryONDEXGraph ( "FilteredGraphUnconnected" );
        uFilter.copyResultsToNewGraph ( graph2 );

        // Export the graph as JSON too, using the Ondex JSON Exporter plugin.
        Export jsonExport = new Export();
        File exportFile = null;
        try {
            exportFile = File.createTempFile ( "knetminer", "graph");
            exportFile.deleteOnExit(); // Just in case we don't get round to deleting it ourselves
            String exportPath = exportFile.getAbsolutePath (); 
            
            ONDEXPluginArguments epa = new ONDEXPluginArguments(jsonExport.getArgumentDefinitions());
            epa.setOption(FileArgumentDefinition.EXPORT_FILE, exportPath);

            log.debug("JSON Export file: " + epa.getOptions().get(FileArgumentDefinition.EXPORT_FILE));

            jsonExport.setArguments(epa);
            jsonExport.setONDEXGraph(graph2);
            log.debug("Export JSON data: Total concepts= " + graph2.getConcepts().size() + " , Relations= "
                    + graph2.getRelations().size());
            // Set the Node and rel counts
            nodeCount = Integer.toString(graph2.getConcepts().size());
            relationshipCount = Integer.toString(graph2.getRelations().size());
            // Export the contents of the 'graph' object as multiple JSON
            // objects to an output file.
            jsonExport.start();
            
            log.debug ( "Network JSON file created:" + exportPath );
            
            // TODO: not UTF-8?
            return IOUtils.readFile ( exportPath, Charset.defaultCharset() );
        } 
        catch (IOException ex)
        {
        	// TODO: client side doesn't know anything about this, likely wrong
          log.error ( "Failed to export graph", ex );
          return "";
        }
        finally {
        	if ( exportFile != null ) exportFile.delete ();
        }
    }
    
    // JavaScript Document
    /**
     * Creates a new keyword for finding the NOT list
     *
     * @param keyword original keyword
     * @return new keyword for searching the NOT list
     */
    private String createsNotList(String keyword)
    {
        String result = "";
        if (keyword == null) keyword = "";

        keyword = keyword.replace("(", "");
        keyword = keyword.replace(")", "");

        keyword = keyword.replaceAll("OR", "__");
        keyword = keyword.replaceAll("AND", "__");

        String[] keySplitedOrAnd = keyword.split("__");
        for (String keyOA : keySplitedOrAnd) {
            String[] keySplitedNOT = keyOA.split("NOT");
            int notCount = 0;
            for (String keyN : keySplitedNOT) {
                if (notCount > 0) {
                    result = result + keyN + " OR ";
                }
                notCount++;
            }
        }
        if (result != "") {
            result = result.substring(0, (result.length() - 3));
        }
        return result;
    }

    /**
     * Merge two maps using the greater scores
     *
     * @param hit2score map that holds all hits and scores
     * @param sHits map that holds search results
     */
    private void mergeHits(HashMap<ONDEXConcept, Float> hit2score, ScoredHits<ONDEXConcept> sHits,
            ScoredHits<ONDEXConcept> NOTHits)
    {
        for (ONDEXConcept c : sHits.getOndexHits()) {
            if (NOTHits == null || !NOTHits.getOndexHits().contains(c)) {
                if (c instanceof LuceneConcept) {
                    c = ((LuceneConcept) c).getParent();
                }
                if (!hit2score.containsKey(c)) {
                    hit2score.put(c, sHits.getScoreOnEntity(c));
                } else {
                    float scoreA = sHits.getScoreOnEntity(c);
                    float scoreB = hit2score.get(c);
                    if (scoreA > scoreB) {
                        hit2score.put(c, scoreA);
                    }
                }
            }
        }
    }

    /**
     * Search for concepts in OndexKB which contain the keyword and find genes
     * connected to them.
     *
     * @param keyword user-specified keyword
     * @return set of genes related to the keyword
     * @throws IOException
     * @throws ParseException
     */
    public HashMap<ONDEXConcept, Float> searchLucene(String keywords, Collection<ONDEXConcept> geneList, boolean includePublications)
    	throws IOException, ParseException
    {
        Set<AttributeName> atts = graph.getMetaData().getAttributeNames();
        String[] datasources = {"PFAM", "IPRO", "UNIPROTKB", "EMBL", "KEGG", "EC", "GO", "TO", "NLM", "TAIR",
            "ENSEMBLGENE", "PHYTOZOME", "IWGSC", "IBSC", "PGSC", "ENSEMBL"};
        // sources identified in KNETviewer
        /*
         * String[] new_datasources= { "AC", "DOI", "CHEBI", "CHEMBL", "CHEMBLASSAY",
         * "CHEMBLTARGET", "EC", "EMBL", "ENSEMBL", "GENB", "GENOSCOPE", "GO", "INTACT",
         * "IPRO", "KEGG", "MC", "NC_GE", "NC_NM", "NC_NP", "NLM", "OMIM", "PDB",
         * "PFAM", "PlnTFDB", "Poplar-JGI", "PoplarCyc", "PRINTS", "PRODOM", "PROSITE",
         * "PUBCHEM", "PubMed", "REAC", "SCOP", "SOYCYC", "TAIR", "TX", "UNIPROTKB", "UNIPROTKB-COV",
         * "ENSEMBL-HUMAN"};
         */
        Set<String> dsAcc = new HashSet<>(Arrays.asList(datasources));

        HashMap<ONDEXConcept, Float> hit2score = new HashMap<>();

        if ("".equals(keywords) || keywords == null) {
            log.info("No keyword, skipping Lucene stage, using mapGene2Concept instead");
            if (geneList != null) {
                for (ONDEXConcept gene : geneList) {
                    if (gene == null) continue;
                    if (mapGene2Concepts.get(gene.getId()) == null) continue;
                    for (int conceptId : mapGene2Concepts.get(gene.getId())) {
                        ONDEXConcept concept = graph.getConcept(conceptId);
                        if (includePublications || !concept.getOfType().getId().equalsIgnoreCase("Publication")) {
                            hit2score.put(concept, 1.0f);
                        }
                    }
                }
            }
            return hit2score;
        }

        // TODO: Actually, we should use LuceneEnv.DEFAULTANALYZER, which 
        // consider different field types. See https://stackoverflow.com/questions/62119328
        Analyzer analyzer = new StandardAnalyzer();

        String keyword = keywords;

        //added to overcome double quotes issue
        //if changing this, need to change genepage.jsp and evidencepage.jsp
        keyword = keyword.replace("###", "\"");
        log.debug("Keyword is:" + keyword);

        // creates the NOT list (list of all the forbidden documents)
        String NOTQuery = createsNotList(keyword);
        String crossTypesNotQuery = "";
        ScoredHits<ONDEXConcept> NOTList = null;
        if (!"".equals ( NOTQuery )) {
            crossTypesNotQuery = "ConceptAttribute_AbstractHeader:(" + NOTQuery + ") OR ConceptAttribute_Abstract:("
                    + NOTQuery + ") OR Annotation:(" + NOTQuery + ") OR ConceptName:(" + NOTQuery + ") OR ConceptID:("
                    + NOTQuery + ")";
            String fieldNameNQ = getFieldName("ConceptName", null);
            QueryParser parserNQ = new QueryParser(fieldNameNQ, analyzer);
            Query qNQ = parserNQ.parse(crossTypesNotQuery);
            NOTList = luceneMgr.searchTopConcepts(qNQ, 2000);
        }

        // number of top concepts retrieved for each Lucene field
        /*
         * increased for now from 500 to 1500, until Lucene code is ported from Ondex to
         * QTLNetMiner, when we'll make changes to the QueryParser code instead.
         */
        int max_concepts = 2000;

        // search concept attributes
        for (AttributeName att : atts)
        {
            String fieldName = getFieldName("ConceptAttribute", att.getId());
            QueryParser parser = new QueryParser(fieldName, analyzer);
            Query qAtt = parser.parse(keyword);
            ScoredHits<ONDEXConcept> sHits = luceneMgr.searchTopConcepts(qAtt, max_concepts);
            mergeHits(hit2score, sHits, NOTList);
        }
        
        // Search concept accessions
        for (String dsAc : dsAcc)
        {
            String fieldName = getFieldName ( "ConceptAccession", dsAc );
            QueryParser parser = new QueryParser ( fieldName, analyzer );
            Query qAccessions = parser.parse(keyword);
            ScoredHits<ONDEXConcept> sHitsAcc = luceneMgr.searchTopConcepts ( qAccessions, max_concepts );
            mergeHits ( hit2score, sHitsAcc, NOTList );
        }

        // Search concept names
        String fieldNameCN = getFieldName ( "ConceptName", null );
        QueryParser parserCN = new QueryParser(fieldNameCN, analyzer);
        Query qNames = parserCN.parse(keyword);
        ScoredHits<ONDEXConcept> sHitsNames = luceneMgr.searchTopConcepts(qNames, max_concepts);
        mergeHits(hit2score, sHitsNames, NOTList);

        // search concept description
        // Query qDesc =
        // LuceneQueryBuilder.searchConceptByDescriptionExact(keyword);
        String fieldNameD = getFieldName("Description", null);
        QueryParser parserD = new QueryParser(fieldNameD, analyzer);
        Query qDesc = parserD.parse(keyword);
        ScoredHits<ONDEXConcept> sHitsDesc = luceneMgr.searchTopConcepts(qDesc, max_concepts);
        mergeHits(hit2score, sHitsDesc, NOTList);

        // search concept annotation
        // Query qAnno =
        // LuceneQueryBuilder.searchConceptByAnnotationExact(keyword);
        String fieldNameCA = getFieldName("Annotation", null);
        QueryParser parserCA = new QueryParser(fieldNameCA, analyzer);
        Query qAnno = parserCA.parse(keyword);
        ScoredHits<ONDEXConcept> sHitsAnno = luceneMgr.searchTopConcepts(qAnno, max_concepts);
        mergeHits(hit2score, sHitsAnno, NOTList);

        log.info("searchLucene(), query for annotation: " + qAnno.toString(fieldNameCA));
        log.info("Resulting Annotation hits: " + sHitsAnno.getOndexHits().size());

        return hit2score;
    }

    public Map<ONDEXConcept, Double> getScoredGenesMap(Map<ONDEXConcept, Float> hit2score) throws IOException 
    {
        Map<ONDEXConcept, Double> scoredCandidates = new HashMap<>();
        Map<ONDEXConcept, Double> sortedCandidates = new HashMap<>(); // Sort via stream instead
    
        log.info ( "Total hits from lucene: " + hit2score.keySet().size() );

        // TODO: the only thing to be synched here is mapGene2HitConcept, and only
        // if this is needed, see https://github.com/Rothamsted/knetminer/issues/517
        synchronized (this) 
        {
            // 1st step: create map of genes to concepts that contain query terms
            mapGene2HitConcept = new HashMap<Integer, Set<Integer>>();
            for (ONDEXConcept c : hit2score.keySet()) {

                // hit concept not connected via valid path to any gene
                if (!mapConcept2Genes.containsKey(c.getId())) {
                    continue;
                }
                Set<Integer> genes = mapConcept2Genes.get(c.getId());
                for (int geneId : genes) {
                    if (!mapGene2HitConcept.containsKey(geneId)) {
                        mapGene2HitConcept.put(geneId, new HashSet<Integer>());
                    }

                    mapGene2HitConcept.get(geneId).add(c.getId());
                }
            }

            // 2nd step: calculate a score for each candidate gene
            for (int geneId : mapGene2HitConcept.keySet()) {

                // weighted sum of all evidence concepts
                double weightedEvidenceSum = 0;

                // iterate over each evidence concept and compute a weight that is composed of
                // three components
                for (int cId : mapGene2HitConcept.get(geneId))
                {
                    // relevance of search term to concept
                    float luceneScore = hit2score.get(graph.getConcept(cId));

                    // specificity of evidence to gene
                    double igf = Math.log10((double) numGenesInGenome / mapConcept2Genes.get(cId).size());

                    // inverse distance from gene to evidence
                    Integer pathLen = mapGene2PathLength.get(geneId + "//" + cId);
                    if (pathLen == null)
                    	log.info("WARNING: Path length is null for: " + geneId + "//" + cId);
                    double distance = pathLen == null ? 0 : (1d / pathLen);

                    // take the mean of all three components
                    double evidenceWeight = (igf + luceneScore + distance) / 3;

                    // sum of all evidence weights
                    weightedEvidenceSum += evidenceWeight;
                }

                // normalisation method 1: size of the gene knoweldge graph
                // double normFactor = 1 / (double) mapGene2Concepts.get(geneId).size();
                // normalistion method 2: size of matching evidence concepts only (mean score)
                //double normFactor = 1 / Math.max((double) mapGene2HitConcept.get(geneId).size(), 3.0);
                // No normalisation for now as it's too experimental.
                // This meeans better studied genes will appear top of the list
                double knetScore = /*normFactor * */ weightedEvidenceSum;

                scoredCandidates.put(graph.getConcept(geneId), knetScore);
            }
            // Sort by best scores
            sortedCandidates = scoredCandidates
	            .entrySet()
	            .stream()
	            .sorted(Collections.reverseOrder(Map.Entry.comparingByValue()))
	            .collect(
	              toMap(
	              	Map.Entry::getKey,
	              	Map.Entry::getValue,
	              	(e1, e2) -> e2, LinkedHashMap::new
	              )
	            );
        }//end of synchronised block
        return sortedCandidates;
    }

    /**
     * Did you mean function for spelling correction
     *
     * @param String keyword
     * @return list of spell corrected words
     */
    public List<String> didyoumean(String keyword) throws ParseException 
    {
    		// TODO: WHAT?!?
        List<String> alternatives = new ArrayList<String>();
        return alternatives;
    }

    /**
     * Searches for genes within genomic regions (QTLs)
     *
     * @param List<String> qtlsStr
     * @return Set<ONDEXConcept> concepts
     */
    public Set<ONDEXConcept> searchQTLs(List<String> qtlsStr)
    {
        log.info("qtlsStr: " + qtlsStr); // qtl string
        Set<ONDEXConcept> concepts = new HashSet<>();

        // convert List<String> qtlStr to List<QTL> qtls
        List<QTL> qtls = QTL.fromStringList ( qtlsStr );

        for (QTL qtl : qtls)
        {
            try {
            		String chrQTL = qtl.getChromosome();
                int startQTL = qtl.getStart();
                int endQTL = qtl.getEnd();
                log.info("user QTL (chr, start, end): " + chrQTL + " , " + startQTL + " , " + endQTL);
                // swap start with stop if start larger than stop
                if (startQTL > endQTL) {
                    int tmp = startQTL;
                    startQTL = endQTL;
                    endQTL = tmp;
                }
                
                var gmeta = graph.getMetaData ();
                ConceptClass ccGene = gmeta.getConceptClass("Gene");
                
                Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass(ccGene);
                log.info ( "searchQTL, found {} matching gene(s)", genes.size() );
                
                for (ONDEXConcept c : genes)
                {
                    if ( !taxID.contains ( getAttrValueAsString ( graph, c, "TAXID", false ) ) )
                    	continue;
                    	    
                    String chrGene = getAttrValueAsString ( graph, c, "Chromosome", false );
                    int startGene = Optional.ofNullable ( (Integer) getAttrValue ( graph, c, "BEGIN" ) ).orElse ( 0 );
                    		
                    if (! ( chrGene != null && startGene != 0 ) ) continue;
                    if ( !chrQTL.equals(chrGene) ) continue;
                    if (! ( startGene >= startQTL && startGene <= endQTL ) ) continue;
                    
                    concepts.add(c);
                }
            } 
            catch (Exception e)
            {
            	// TODO: the user doesn't get any of this!
              log.error("Not valid qtl: " + e.getMessage (), e);
            }
        }
        return concepts;
    }

    /**
     * Searches the knowledge base for QTL concepts that match any of the user
     * input terms.
     *
     * TODO: made private, cause it seems being used by {@link #writeAnnotationXML(String, ArrayList, Set, List, String, int, Hits, String, Map)}
     * only. If it needs to become public, it will also need try/finally and {@link LuceneEnv#closeAll()}
     * 
     */
    private Set<QTL> findQTL(String keyword) throws ParseException
    {
    		var gmeta = graph.getMetaData();
        ConceptClass ccTrait = gmeta.getConceptClass("Trait");
        ConceptClass ccQTL = gmeta.getConceptClass("QTL");
        ConceptClass ccSNP = gmeta.getConceptClass("SNP");

        // no Trait-QTL relations found
        if (ccTrait == null && (ccQTL == null || ccSNP == null)) return new HashSet<>();

        // no keyword provided
        if (keyword == null || keyword.equals ( "" ) ) return new HashSet<>();

        log.debug ( "Looking for QTLs..." );
        
        // If there is not traits but there is QTLs then we return all the QTLs
        if (ccTrait == null) return findQTLAllTraits ();
        return findQTLForTrait ( keyword );
    }

    
    private Set<QTL> findQTLAllTraits ()
    {
      log.info ( "No Traits found: all QTLS will be shown..." );

      Set<QTL> results = new HashSet<>();
      
      var gmeta = graph.getMetaData ();
      ConceptClass ccQTL = gmeta.getConceptClass("QTL");
      
      // results = graph.getConceptsOfConceptClass(ccQTL);
      for (ONDEXConcept q : graph.getConceptsOfConceptClass(ccQTL))
      {
          String type = q.getOfType().getId();
          String chrName = getAttrValue ( graph, q, "Chromosome" );
          int start = (Integer) getAttrValue ( graph, q, "BEGIN" );
          int end = (Integer) getAttrValue ( graph, q, "END" );
          String trait = getAttrValueAsString ( graph, q, "Trait", false );
          
          String taxId = Optional.ofNullable ( getAttrValueAsString ( graph, q, "TAXID", false ) )
          	.orElse ( "" );
          
          String label = q.getConceptName().getName();
          
          results.add ( new QTL ( chrName, type, start, end, label, "", 1.0f, trait, taxId ) );
      }
      return results;    	
    }

    
    private Set<QTL> findQTLForTrait ( String keyword ) throws ParseException
    {
  		// TODO: actually LuceneEnv.DEFAULTANALYZER should be used for all fields
  	  // This chooses the appropriate analyzer depending on the field.
  	
      // be careful with the choice of analyzer: ConceptClasses are not
      // indexed in lowercase letters which let the StandardAnalyzer crash
  		//
      Analyzer analyzerSt = new StandardAnalyzer();
      Analyzer analyzerWS = new WhitespaceAnalyzer();

      String fieldCC = getFieldName ( "ConceptClass", null );
      QueryParser parserCC = new QueryParser ( fieldCC, analyzerWS );
      Query cC = parserCC.parse("Trait");

      String fieldCN = getFieldName("ConceptName", null);
      QueryParser parserCN = new QueryParser(fieldCN, analyzerSt);
      Query cN = parserCN.parse(keyword);

      BooleanQuery finalQuery = new BooleanQuery.Builder()
      	.add ( cC, BooleanClause.Occur.MUST )
        .add ( cN, BooleanClause.Occur.MUST )
        .build();
      
      log.info( "QTL search query: {}", finalQuery.toString() );

      ScoredHits<ONDEXConcept> hits = luceneMgr.searchTopConcepts ( finalQuery, 100 );
      
  		var gmeta = graph.getMetaData();
      ConceptClass ccQTL = gmeta.getConceptClass("QTL");
      ConceptClass ccSNP = gmeta.getConceptClass("SNP");
      
      Set<QTL> results = new HashSet<>();
      
      for ( ONDEXConcept c : hits.getOndexHits() ) 
      {
          if (c instanceof LuceneConcept) c = ((LuceneConcept) c).getParent();
          Set<ONDEXRelation> rels = graph.getRelationsOfConcept(c);
          
          for (ONDEXRelation r : rels) 
          {
          	var conQTL = r.getFromConcept();
          	var conQTLType = conQTL.getOfType ();
          	var toType = r.getToConcept ().getOfType ();
          	
            // get QTL concept
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
            String label = conQTL.getConceptName().getName();
            String trait = c.getConceptName().getName();
            
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
     * Semantic Motif Search for list of genes
     *
     * @param accessions
     * @param regex trait-related
     * @return OndexGraph containing the gene network
     */
    public ONDEXGraph findSemanticMotifs ( Integer[] ids, String regex )
    {
        log.debug("get genes function " + ids.length);
        Set<ONDEXConcept> seed = new HashSet<>();

        for (int id : ids) 
        {
            ONDEXConcept c = graph.getConcept(id);
            String taxId = getAttrValueAsString ( graph, c, "TAXID", false );
            if ( taxId == null ) continue;
            seed.add ( c );
        }
        log.debug("Now we will call findSemanticMotifs(seed)!");
        ONDEXGraph subGraph = findSemanticMotifs(seed, regex);
        return subGraph;
    }

    /**
     * Searches for ONDEXConcepts with the given accessions in the OndexGraph. Assumes a keyword-oriented syntax
     * for the accessions, eg, characters like brackets are removed.
     *
     * @param List<String> accessions
     * @return Set<ONDEXConcept>
     */
		public Set<ONDEXConcept> searchGenesByAccessionKeywords ( List<String> accessions )
		{
			if ( accessions.size () == 0 ) return null;
			
			AttributeName attTAXID = ONDEXGraphUtils.getAttributeName ( graph, "TAXID" ); 
			ConceptClass ccGene = graph.getMetaData ().getConceptClass ( "Gene" );
			Set<ONDEXConcept> seed = graph.getConceptsOfConceptClass ( ccGene );
			Set<ONDEXConcept> hits = new HashSet<> ();

			for ( ONDEXConcept gene : seed )
			{
        String thisTaxId = getAttrValueAsString ( gene, attTAXID, false );
        if ( !taxID.contains ( thisTaxId ) ) continue;
				
				accessions.stream ()
				.map ( acc -> 
					acc.replaceAll ( "^[\"()]+", "" )
					.replaceAll ( "[\"()]+$", "" )
					.toUpperCase () 
				)
				.map ( acc -> 
				{
					// User may use accession ID's instead
					gene.getConceptNames ()
						.stream ()
						.filter ( cname -> cname.getName ().toUpperCase ().equals ( acc ) )
						.forEachOrdered ( _item -> hits.add ( gene ) );
					return acc;
				})
				.forEachOrdered ( acc ->
					// User may use accession ID's instead
					gene.getConceptAccessions ()
					.stream ()
					.filter ( ca -> ca.getAccession ().toUpperCase ().equals ( acc ) )
					.forEachOrdered ( _item -> hits.add ( gene ) )
				);
			}
			return hits;
		}

    /**
     * Searches genes related to an evidence, fetches the corresponding semantic motifs and merges
     * the paths between them into the resulting graph.
     *
     */
		@SuppressWarnings ( "rawtypes" )
		public ONDEXGraph evidencePath ( Integer evidenceOndexId, Set<ONDEXConcept> genes )
		{
			log.info ( "Method evidencePath - evidenceOndexId: {}", evidenceOndexId );
			
			// Searches genes related to the evidenceID. If user genes provided, only include those.
			Set<ONDEXConcept> relatedONDEXConcepts = new HashSet<> ();
			for ( Integer rg : mapConcept2Genes.get ( evidenceOndexId ) )
			{
				ONDEXConcept gene = graph.getConcept ( rg );
				if ( genes == null || genes.isEmpty () || genes.contains ( gene ) )
					relatedONDEXConcepts.add ( gene );
			}

			// the results give us a map of every starting concept to every valid
			// path
			Map<ONDEXConcept, List<EvidencePathNode>> evidencePaths = 
				graphTraverser.traverseGraph ( graph, relatedONDEXConcepts, null );

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
					// else hidePath(path,graphCloner);
				}
			}
			ONDEXGraphRegistry.graphs.remove ( subGraph.getSID () );

			return subGraph;
		}


		
    /**
     * Converts a keyword into a list of words
     *
     * @param keyword
     * @return null or the list of words
     */
		private Set<String> parseKeywordIntoSetOfWords ( String keyword )
		{
			Set<String> result = new HashSet<> ();
			String key = keyword.replace ( "(", " " );
			key = key.replace ( ")", " " );
			key = key.replace ( "AND", " " );
			key = key.replace ( "OR", " " );
			key = key.replace ( "NOT", " " );
			key = key.replaceAll ( "\\s+", " " ).trim ();
			String builtK = "";
			for ( String k : key.split ( " " ) )
			{
				if ( k.startsWith ( "\"" ) )
				{
					if ( k.endsWith ( "\"" ) )
						// result.add(k.substring(0, k.length() - 1));
						result.add ( k.replace ( "\"", "" ) );
					else
						builtK = k.substring ( 1 );
				} 
				else if ( k.endsWith ( "\"" ) )
				{
					builtK += " " + k.substring ( 0, k.length () - 1 );
					result.add ( builtK );
					builtK = "";
				} 
				else
				{
					if ( builtK != "" )
						builtK += " " + k;
					else
						result.add ( k );
				}
		  }
			if ( !"".equals ( builtK ) ) result.add ( builtK );
			log.info ( "keys: " + result );
			return result;
		}



    /**
     * Searches with Lucene for documents, finds semantic motifs and by crossing
     * this data makes concepts visible, changes the size and highlight the hits
     *
     * @param seed List of selected genes
     * @param keyword
     * @return subGraph
     */
		public ONDEXGraph findSemanticMotifs ( Set<ONDEXConcept> seed, String keyword )
		{
			log.debug ( "Method findSemanticMotifs - keyword: {}", keyword );
			// Searches with Lucene: luceneResults
			Map<ONDEXConcept, Float> luceneResults = null;
			try
			{
				luceneResults = searchLucene ( keyword, seed, false );
			}
			catch ( Exception e )
			{
				// TODO: does it make sense to continue?!
				log.error ( "Lucene search failed", e );
				luceneResults = Collections.emptyMap ();
			}

			// the results give us a map of every starting concept to every valid path
			Map<ONDEXConcept, List<EvidencePathNode>> results = graphTraverser.traverseGraph ( graph, seed, null );

			Set<ONDEXConcept> keywordConcepts = new HashSet<> ();
			Set<EvidencePathNode> pathSet = new HashSet<> ();

			// added to overcome double quotes issue
			// if changing this, need to change genepage.jsp and evidencepage.jsp
			keyword = keyword.replace ( "###", "\"" );

			Set<String> keywords = "".equals ( keyword ) 
				? Collections.emptySet ()
				: this.parseKeywordIntoSetOfWords ( keyword );
					
			Map<String, String> keywordColourMap = createHilightColorMap ( keywords );
					
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
					if ( keyword == null || keyword.equals ( "" ) )
					{
						highlightPath ( path, graphCloner, true );
						continue;
					}

					// keyword-mode and end concept contains keyword, set path to visible
					if ( !luceneResults.containsKey ( endNode ) ) {
						pathSet.add ( path );
						continue;
					}
					
					// keyword-mode -> do text and path highlighting
					ONDEXConcept cloneCon = graphCloner.cloneConcept ( endNode );

					// highlight keyword in any concept attribute
					if ( keywordConcepts.contains ( cloneCon ) ) continue;
					
					this.highlightSearchKeywords ( cloneCon, keywordColourMap );
					keywordConcepts.add ( cloneCon );

					if ( !endNode.getOfType ().getId ().equalsIgnoreCase ( "Publication" ) ) continue;
					
					pubKeywordSet.add ( cloneCon );

					// set only paths from gene to evidence nodes to visible
					highlightPath ( path, graphCloner, false );
					
				} // for path
			} // for paths

			// special case when none of nodes contains keyword (no-keyword-match)
			// set path to visible if end-node is Trait or Phenotype
			if ( keywordConcepts.isEmpty () && ! ( keyword == null || keyword.equals ( "" ) ) )
				for ( EvidencePathNode path : pathSet )
					highlightPath ( path, graphCloner, true );

			ConceptClass ccPub = subGraph.getMetaData ().getConceptClass ( "Publication" );
			Set<Integer> allPubIds = new HashSet<Integer> ();

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
					Integer.parseInt ( (String) getOptions ().get ( OPT_DEFAULT_NUMBER_PUBS ) )
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
		 * Creates a mapping between keywords and random HTML colour codes, used by the search highlighting functions.
		 * if colors is null, uses {@link #createHighlightColors(int)}.
		 * If colours are not enough for the set of parameter keywords, they're reused cyclically.
		 */
		private Map<String, String> createHilightColorMap ( Set<String> keywords, List<String> colors )
		{
			if ( colors == null ) colors = createHighlightColors ( keywords.size () );
			Map<String, String> keywordColorMap = new HashMap<> ();
			
			int colIdx = 0;
			for ( String key: keywords )
				keywordColorMap.put ( key, colors.get ( colIdx++ % colors.size () ) );
			
			return keywordColorMap;
		}

		/**
		 * Defaults to null.
		 */
		private Map<String, String> createHilightColorMap ( Set<String> keywords )
		{
			return createHilightColorMap ( keywords, null );
		}

		/**
		 * Can be used with {@link #createHilightColorMap(Set, List)}. Indeed, this is 
		 * what it's used when no color list is sent to it. It genereates a list of the size
		 * sent and made of random different colors with visibility characteristics.
		 * 
		 */
		private List<String> createHighlightColors ( int size )
		{
			Random random = new Random ();
			Set<Integer> colors = new HashSet<> (); // Compare each colour to ensure we never have duplicates
			int colorCode = -1;

			for ( int i = 0; i < size; i++ ) 
			{
				// Ensure colour luminance is >40 (git issue #466),
				// no colours are repeated and are never yellow
				//
				while ( true )
				{
					colorCode = random.nextInt ( 0x666666 + 1 ) + 0x999999; // lighter colours only
					if ( colors.contains ( colorCode ) ) continue;
										
					String colorHex = "#" + Integer.toHexString ( colorCode );
					
					Color colorVal = Color.decode ( colorHex );
					if ( Color.YELLOW.equals ( colorVal ) ) continue;
					
					int colorBrightness = (int) sqrt ( 
						pow ( colorVal.getRed (), 2 ) * .241
						+ pow ( colorVal.getGreen (), 2 ) * .691 
						+ pow ( colorVal.getBlue (), 2 ) * .068 
					);
					
					if ( colorBrightness <= 40 ) continue;
					
					break;
				}
				colors.add ( colorCode ); // Add to colour ArrayList to track colours
			}
			
			return colors.stream ()
			.map ( colCode -> String.format ( "#%06x", colCode ) )
			.collect ( Collectors.toList () );
		}
		
		
		
    /**
     * Helper for {@link #highlightSearchKeywords(ONDEXConcept, Map)}. If the pattern matches the path, it  
     * {@link Matcher#replaceAll(String) replaces} the matching bits of the target with the new
     * highligher string and passes the result to the consumer (for operations like assignments)
     * 
     * Please note:
     * 
     * - target is assumed to be a Lucene token, "xxx*" or "xxx?" are translated into "\S*" or "\S?", in order to 
     * match the RE semantics.
     * - highlighter is a string for {@link Matcher#replaceAll(String)}, which should use "$1" to match a proper
     * bracket expression in target
     * - the matching is usually case-insensitive, but that depends on how you defined the pattern. 
     */
    private boolean highlightFragment ( Pattern pattern, String target, String highlighter, Consumer<String> consumer )
    {
    	Matcher matcher = pattern.matcher ( target );
    	if ( !matcher.find ( 0 ) ) return false;
    	var highlightedStr = matcher.replaceAll ( highlighter );
    	if ( consumer != null ) consumer.accept ( highlightedStr );
    	return true;
    }
    
    /**
     * Helper for {@link #highlightSearchKeywords(ONDEXConcept, Map)}, manages the hightlighting of a single
     * search keyword.
     * 
     */
    private boolean highlightSearchKeyword ( ONDEXConcept concept, String keyword, String highlighter )
    {
			boolean found = false;

			String keywordRe = '(' + keyword + ')';
			// TODO: the end user is supposed to be writing Lucene expressions, 
			// so we fix them this way. But using Lucene for highlighting should be simpler.
			keywordRe = keywordRe.replaceAll ( "\\*", "\\S*" )
				.replaceAll ( "\\?", "\\S?" );
			
			Pattern kwpattern = Pattern.compile ( keywordRe, Pattern.CASE_INSENSITIVE );

			found |= this.highlightFragment ( kwpattern, concept.getAnnotation (), highlighter, concept::setAnnotation );
			found |= this.highlightFragment ( kwpattern, concept.getDescription (), highlighter, concept::setDescription );
			
			// old name -> is preferred, new name
			HashMap<String, Pair<Boolean, String>> namesToCreate = new HashMap<> ();
			for ( ConceptName cname : concept.getConceptNames () )
			{
				String cnameStr = cname.getName ();
				// TODO: initially cnameStr.contains ( "</span>" ) was skipped too, probably to be removed
				if ( cnameStr == null ) continue;
					
				found |= this.highlightFragment ( 
					kwpattern, cnameStr, highlighter, 
					newName -> namesToCreate.put ( cnameStr, Pair.of ( cname.isPreferred (), newName ) ) 
				);
			}
			
			// And now do the replacements for real
			namesToCreate.forEach ( ( oldName, newPair ) -> {
				concept.deleteConceptName ( oldName );
				concept.createConceptName ( newPair.getRight (), newPair.getLeft () );
			});
			

			// search in concept attributes
			for ( Attribute attribute : concept.getAttributes () )
			{
				String attrId = attribute.getOfType ().getId ();
				
				if ( attrId.equals ( "AA" ) || attrId.equals ( "NA" ) 
						 || attrId.startsWith ( "AA_" ) || attrId.startsWith ( "NA_" ) )
					continue;
				
				String value = attribute.getValue ().toString ();
				found |= this.highlightFragment ( kwpattern, value, highlighter, attribute::setValue );
			}
			
			return found;
    }
    
    
    /**
     * Searches different fields of a concept for a query or pattern and
     * highlights them.
     * 
     * TODO: this is ugly, Lucene should already have methdods to do the same.
     *
     * @return true if one of the concept fields contains the query
     */
		private boolean highlightSearchKeywords ( ONDEXConcept concept, Map<String, String> keywordColourMap )
		{
			// Order the keywords by length to prevent interference by shorter matches that are substrings of longer ones.
			String[] orderedKeywords = keywordColourMap.keySet ().toArray ( new String[ 0 ] );
			
			Comparator<String> strLenComp = (a, b) -> a.length () == b.length () 
				? a.compareTo ( b ) 
				: Integer.compare ( a.length(), b.length() );

			Arrays.sort ( orderedKeywords, strLenComp );
			boolean found = false;

			for ( String key : orderedKeywords )
			{
				var highlighter = "<span style=\"background-color:" + keywordColourMap.get ( key ) + "\">"
						+ "<b>$1</b></span>";				
				found |= highlightSearchKeyword ( concept, key, highlighter );
			}

			return found;
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
		@SuppressWarnings ( "rawtypes" )
		public void highlightPath ( EvidencePathNode path, ONDEXGraphCloner graphCloner, boolean doFilter )
		{
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
			if ( !mapGene2QTL.containsKey ( geneNode.getId () ) ) return;
			
			RelationType rt = gcloneMetaFact.createRelationType ( "is_p" );
			EvidenceType et = gcloneMetaFact.createEvidenceType ( "KnetMiner" );

			Set<Integer> qtlSet = mapGene2QTL.get ( geneNode.getId () );
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
     */
		public void hidePath ( EvidencePathNode path, ONDEXGraphCloner graphCloner )
		{
			ONDEXGraph gclone = graphCloner.getNewGraph ();
			ONDEXGraphMetaData gmeta = gclone.getMetaData ();

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

		
    /**
     * Write Genomaps XML file (to a string).
     * TODO: how is it that a URI has to be used to invoke functions that sit around here, in the same .WAR?!
     *
     * @param apiUrl ws url for API
     * @param genes list of genes to be displayed (all genes for search result)
     * @param userGenes gene list from user
     * @param userQtlStr user QTLs
     * @param keyword user-specified keyword
     * @param maxGenes
     * @param hits search Hits
     * @param listMode
     * @return
     */
		public String writeAnnotationXML ( String apiUrl, ArrayList<ONDEXConcept> genes, Set<ONDEXConcept> userGenes,
			List<String> userQtlStr, String keyword, int maxGenes, Hits hits, String listMode,
			Map<ONDEXConcept, Double> scoredCandidates )
		{
			log.info ( "Genomaps: generating XML..." );

			List<QTL> userQtl = QTL.fromStringList ( userQtlStr );  

			// TODO: can we remove this?
			// If user provided a gene list, use that instead of the all Genes (04/07/2018, singha)
			/*
			 * if(userGenes != null) { // use this (Set<ONDEXConcept> userGenes) in place of the genes
			 * ArrayList<ONDEXConcept> genes. genes= new ArrayList<ONDEXConcept> (userGenes);
			 * log.info("Genomaps: Using user-provided gene list... genes: "+ genes.size()); }
			 */
			// added user gene list restriction above (04/07/2018, singha)

			ONDEXGraphMetaData gmeta = graph.getMetaData ();
			AttributeName attCM = gmeta.getAttributeName ( "cM" );
			ConceptClass ccQTL = gmeta.getConceptClass ( "QTL" );
			
			Set<QTL> qtlDB = new HashSet<> ();
			if ( ccQTL != null && ! ( keyword == null || "".equals ( keyword ) ) )
			{
				// qtlDB = graph.getConceptsOfConceptClass(ccQTL);
				try
				{
					qtlDB = findQTL ( keyword );
				}
				catch ( ParseException e )
				{
					// TODO: is it fine to continue without any exception!?
					log.error ( "Failed to find QTLs", e );
				}
			}

			StringBuffer sb = new StringBuffer ();
			sb.append ( "<?xml version=\"1.0\" standalone=\"yes\"?>\n" );
			sb.append ( "<genome>\n" );
			int id = 0;

			// genes are grouped in three portions based on size
			int size = Math.min ( genes.size (), maxGenes );

			log.info ( "visualize genes: " + genes.size () );
			for ( ONDEXConcept c : genes )
			{
				var geneHelper = new GeneHelper ( graph, c );
				
				// only genes that are on chromosomes (not scaffolds)
				// can be displayed in Map View
				String chr = geneHelper.getChromosome ();
				if ( chr == null || "U".equals ( chr ) )
					continue;
				
				// TODO: this can be a parameter CM/BP in future
				//

				int beg = (int) Math.round ( geneHelper.computeBegin ( true, true ) );

				// TODO: initially, this was set to begin when cM is present, but doesn't make sense
				int end = (int) Math.round ( geneHelper.computeEnd ( true, true ) );


				String name = c.getPID ();
				// TODO: What the hell does this mean?!
				for ( ConceptAccession acc : c.getConceptAccessions () )
					name = acc.getAccession ();

				String label = getMolBioDefaultLabel ( c );
				String query = null;
				try
				{
					query = "keyword=" + URLEncoder.encode ( keyword, "UTF-8" ) + "&amp;list="
							+ URLEncoder.encode ( name, "UTF-8" );
				}
				catch ( UnsupportedEncodingException e )
				{
					log.error ( "Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)", e );
					throw ExceptionUtils.buildEx ( RuntimeException.class, e,
							"Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)" );
				}
				String uri = apiUrl + "/network?" + query; // KnetMaps (network) query
				// log.info("Genomaps: add KnetMaps (network) query: "+ uri);

				// Genes
				sb.append ( "<feature id=\"" + id + "\">\n" );
				sb.append ( "<chromosome>" + chr + "</chromosome>\n" );
				sb.append ( "<start>" + beg + "</start>\n" );
				sb.append ( "<end>" + end + "</end>\n" );
				sb.append ( "<type>gene</type>\n" );
				
				if ( id <= size / 3 )
					sb.append ( "<color>0x00FF00</color>\n" ); // Green
				else if ( id > size / 3 && id <= 2 * size / 3 )
					sb.append ( "<color>0xFFA500</color>\n" ); // Orange
				else
					sb.append ( "<color>0xFF0000</color>\n" ); // Red
				
				sb.append ( "<label>" + label + "</label>\n" );
				sb.append ( "<link>" + uri + "</link>\n" );
				
				// Add 'score' tag as well.
				Double score = 0.0;
				if ( scoredCandidates != null && scoredCandidates.get ( c ) != null )
					score = scoredCandidates.get ( c ); // fetch score
				
				sb.append ( "<score>" + score + "</score>\n" ); // score
				sb.append ( "</feature>\n" );

				if ( id++ > maxGenes )
					break;
			}

			log.info ( "Display user QTLs... QTLs provided: " + userQtl.size () );
			for ( QTL region : userQtl )
			{
				String chr = region.getChromosome ();
				int start = region.getStart ();
				int end = region.getEnd ();

				// TODO check of MODE is CM/BP
				if ( attCM != null )
				{
					start = start * 1000000;
					end = end * 1000000;
				}
				String label = Optional.ofNullable ( region.getLabel () )
					.filter ( lbl -> !lbl.isEmpty () )
					.orElse ( "QTL" );

				String query = null;
				try
				{
					query = "keyword=" + URLEncoder.encode ( keyword, "UTF-8" ) + "&amp;qtl=" + URLEncoder.encode ( chr, "UTF-8" )
							+ ":" + start + ":" + end;
				}
				catch ( UnsupportedEncodingException e )
				{
					log.error ( "Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)", e );
					throw ExceptionUtils.buildEx ( RuntimeException.class, e,
							"Internal error while exporting geno-maps, encoding UTF-8 unsupported(?!)" );
				}
				String uri = apiUrl + "/network?" + query;

				sb.append ( "<feature>\n" );
				sb.append ( "<chromosome>" + chr + "</chromosome>\n" );
				sb.append ( "<start>" + start + "</start>\n" );
				sb.append ( "<end>" + end + "</end>\n" );
				sb.append ( "<type>qtl</type>\n" );
				sb.append ( "<color>0xFF0000</color>\n" ); // Orange
				sb.append ( "<label>" + label + "</label>\n" );
				sb.append ( "<link>" + uri + "</link>\n" );
				sb.append ( "</feature>\n" );
			}

			// TODO: move this to a constant
			// TODO: createHilightColorMap() generates colours randomly by default, should we have different methdods?!

			List<String> colorHex = List.of ( "0xFFB300", "0x803E75", "0xFF6800", "0xA6BDD7", "0xC10020", "0xCEA262", "0x817066",
					"0x0000FF", "0x00FF00", "0x00FFFF", "0xFF0000", "0xFF00FF", "0xFFFF00", "0xDBDB00", "0x00A854", "0xC20061",
					"0xFF7E3D", "0x008F8F", "0xFF00AA", "0xFFFFAA", "0xD4A8FF", "0xA8D4FF", "0xFFAAAA", "0xAA0000", "0xAA00FF",
					"0xAA00AA", "0xAAFF00", "0xAAFFFF", "0xAAFFAA", "0xAAAA00", "0xAAAAFF", "0xAAAAAA", "0x000055", "0x00FF55",
					"0x00AA55", "0x005500", "0x0055FF" );
			// 0xFFB300, # Vivid Yellow
			// 0x803E75, # Strong Purple
			// 0xFF6800, # Vivid Orange
			// 0xA6BDD7, # Very Light Blue
			// 0xC10020, # Vivid Red
			// 0xCEA262, # Grayish Yellow
			// 0x817066, # Medium Gray
			
			Set<String> traits = qtlDB.stream ()
			.map ( QTL::getTrait )
			.collect ( Collectors.toSet () );
			
			Map<String, String> trait2color = createHilightColorMap ( traits );

			log.info ( "Display QTLs and SNPs... QTLs found: " + qtlDB.size () );
			log.info ( "TaxID(s): " + taxID );
			for ( QTL loci : qtlDB )
			{
				String type = loci.getType ().trim ();
				String chrQTL = loci.getChromosome ();
				Integer startQTL = loci.getStart ();
				Integer endQTL = loci.getEnd ();
				String label = loci.getLabel ().replaceAll ( "\"", "" );
				String trait = loci.getTrait ();

				Float pvalue = loci.getpValue ();
				String color = trait2color.get ( trait );

				// TODO check of MODE is CM/BP
				if ( attCM != null )
				{
					startQTL = startQTL * 1000000;
					endQTL = endQTL * 1000000;
				}

				// TODO get p-value of SNP-Trait relations
				if ( type.equals ( "QTL" ) )
				{
					sb.append ( "<feature>\n" );
					sb.append ( "<chromosome>" + chrQTL + "</chromosome>\n" );
					sb.append ( "<start>" + startQTL + "</start>\n" );
					sb.append ( "<end>" + endQTL + "</end>\n" );
					sb.append ( "<type>qtl</type>\n" );
					sb.append ( "<color>" + color + "</color>\n" );
					sb.append ( "<trait>" + trait + "</trait>\n" );
					sb.append ( "<link>http://archive.gramene.org/db/qtl/qtl_display?qtl_accession_id=" + label + "</link>\n" );
					sb.append ( "<label>" + label + "</label>\n" );
					sb.append ( "</feature>\n" );
					// log.info("add QTL: trait, label: "+ trait +", "+ label);
				} 
				else if ( type.equals ( "SNP" ) )
				{
					/* add check if species TaxID (list from client/utils-config.js) contains this SNP's TaxID. */
					if ( taxID.contains ( loci.getTaxID () ) )
					{
						sb.append ( "<feature>\n" );
						sb.append ( "<chromosome>" + chrQTL + "</chromosome>\n" );
						sb.append ( "<start>" + startQTL + "</start>\n" );
						sb.append ( "<end>" + endQTL + "</end>\n" );
						sb.append ( "<type>snp</type>\n" );
						sb.append ( "<color>" + color + "</color>\n" );
						sb.append ( "<trait>" + trait + "</trait>\n" );
						sb.append ( "<pvalue>" + pvalue + "</pvalue>\n" );
						sb.append (
								"<link>http://plants.ensembl.org/arabidopsis_thaliana/Variation/Summary?v=" + label + "</link>\n" );
						sb.append ( "<label>" + label + "</label>\n" );
						sb.append ( "</feature>\n" );
						// log.info("TaxID= "+ loci.getTaxID() +", add SNP: chr, trait, label, p-value: "+ chr +", "+ trait +", "+
						// label +", "+ pvalue);
					}
				}

			} // for loci

			sb.append ( "</genome>\n" );
			return sb.toString ();
		} // writeAnnotationXML()

		
    // temporary...
		// TODO: REMOVE! If you need this for debugging purpose use 
		// org.apache.commons.io.IOUtils.copy DON'T REINVENT THE DAMN WHEEL!
    // public void writeResultsFile(String filename, String sb_string) {
		
    /**
     * This table contains all possible candidate genes for given query
     * TODO: too big! Split into separated functions.
     *
     * @param candidates
     * @param qtl
     * @param filename
     * @param listMode
     * @return
     */
		public String writeGeneTable ( ArrayList<ONDEXConcept> candidates, Set<ONDEXConcept> userGenes,
			List<String> qtlsStr, String listMode, Map<ONDEXConcept, Double> scoredCandidates )
		{
			log.info ( "generate Gene table..." );
			List<QTL> qtls =  QTL.fromStringList ( qtlsStr );
			Set<Integer> userGeneIds = new HashSet<> ();

			if ( userGenes != null )
			{
				userGeneIds = userGenes.stream ()
					.map ( ONDEXConcept::getId )
					.collect ( Collectors.toSet () );
			} 
			else
				log.info ( "No user gene list defined." );

			if ( qtls.isEmpty () )
				log.info ( "No QTL regions defined." );

			
			ONDEXGraphMetaData gmeta = graph.getMetaData ();
			
			// Removed ccSNP from Geneview table (12/09/2017)
			// AttributeName attSnpCons = md.getAttributeName("Transcript_Consequence");
			// ConceptClass ccSNP = md.getConceptClass("SNP");

			StringBuffer out = new StringBuffer ();
			// out.append("ONDEX-ID\tACCESSION\tGENE
			// NAME\tCHRO\tSTART\tTAXID\tSCORE\tUSER\tQTL\tEVIDENCE\tEVIDENCES_LINKED\tEVIDENCES_IDs\n");
			out.append ( "ONDEX-ID\tACCESSION\tGENE NAME\tCHRO\tSTART\tTAXID\tSCORE\tUSER\tQTL\tEVIDENCE\n" );
			for ( ONDEXConcept gene : candidates )
			{
				int id = gene.getId ();

				var geneHelper = new GeneHelper ( graph, gene );
												
				Double score = scoredCandidates != null && scoredCandidates.get ( gene ) != null
					? score = scoredCandidates.get ( gene )
					: 0d;

				// use shortest preferred concept name
				String geneName = getShortestPreferedName ( gene.getConceptNames () );

				String isInList = userGenes != null && userGeneIds.contains ( gene.getId () )
					? "yes" : "no";

				String infoQTL = "";
				if ( mapGene2QTL.containsKey ( gene.getId () ) )
				{
					for ( Integer cid : mapGene2QTL.get ( gene.getId () ) )
					{
						ONDEXConcept qtl = graph.getConcept ( cid );

						/*
						 * TODO: a TEMPORARY fix for a bug wr're seeing, we MUST apply a similar massage to ALL cases like this,
						 * and hence we MUST move this code to some utility.
						 */
						if ( qtl == null )
						{
							log.error ( "writeTable(): no gene found for id: ", cid );
							continue;
						}
						String acc = Optional.ofNullable ( qtl.getConceptName () )
							.map ( ConceptName::getName )
							.map ( StringEscapeUtils::escapeCsv )
							.orElseGet ( () -> {
								log.error ( "writeTable(): gene name not found for id: {}", cid );
								return "";
							});

						String traitDesc = Optional.of ( getAttrValueAsString ( graph, gene, "Trait", false ) )
							.orElse ( acc );

						if ( !infoQTL.isEmpty () ) infoQTL += "||";
						infoQTL += traitDesc + "//" + traitDesc;
					}
				} // mapGene2QTL.containsKey ( gene.getId () )

				
				if ( !qtls.isEmpty () )
				{
					for ( QTL loci : qtls )
					{
						String qtlChrom = loci.getChromosome ();
						Integer qtlStart = loci.getStart ();
						Integer qtlEnd = loci.getEnd ();

						// FIXME re-factor chromosome string
						// TODO: this was qtlChrom.equals ( "" ), but loc was always ""!
						if ( qtlChrom.equals ( "" ) && geneHelper.getcM ( true ) >= qtlStart && geneHelper.getcM ( true ) <= qtlEnd )
						{
							if ( !infoQTL.isEmpty () ) infoQTL += "||";
							infoQTL += loci.getLabel () + "//" + loci.getTrait ();

// TODO: remove! WTH!? See the approach above!
//							if ( "".equals ( infoQTL ) )
//							{
//								infoQTL += loci.getLabel () + "//" + loci.getTrait ();
//							} else
//							{
//								infoQTL += "||" + loci.getLabel () + "//" + loci.getTrait ();
//							}
						}
					}
				} // !qtls.isEmpty ()

				Set<Integer> luceneHits = Collections.<Integer> emptySet ();
				// TODO: this is very poor and error-prone, 
				// WE MUST fix https://github.com/Rothamsted/knetminer/issues/517
				synchronized ( this )
				{
					// get lucene hits per gene
					luceneHits = mapGene2HitConcept.get ( id );
				}
				if ( luceneHits == null )
					luceneHits = new HashSet<> ();

				// organise by concept class
				Map<String, String> cc2name = new HashMap<> ();

				Set<Integer> evidencesIDs = new HashSet<> ();
				for ( int hitID : luceneHits )
				{
					ONDEXConcept c = graph.getConcept ( hitID );
					evidencesIDs.add ( c.getId () ); // retain all evidences' ID's
					String ccId = c.getOfType ().getId ();

					// skip publications as handled differently (see below)
					if ( ccId.equals ( "Publication" ) ) continue;

					String name = getMolBioDefaultLabel ( c );

					cc2name.compute ( 
						ccId, 
					  (_id, _oldName ) ->	_oldName == null ? name : _oldName + "//" + name
					);
				}

				// special case for publications to sort and filter most recent publications
				Set<ONDEXConcept> allPubs = luceneHits.stream ()
					.map ( graph::getConcept )
					.filter ( c -> "Publication".equals ( c.getOfType ().getId () ) )
					.collect ( Collectors.toSet () );
				
				
				AttributeName attYear = getAttributeName ( graph, "YEAR" );
				List<Integer> newPubs = PublicationUtils.newPubsByNumber ( 
					allPubs, 
					attYear, 
					Integer.parseInt ( (String) getOptions ().get ( OPT_DEFAULT_NUMBER_PUBS ) ) 
				);

				// add most recent publications here
				if ( !newPubs.isEmpty () )
				{
					String pubString = "Publication__" + allPubs.size () + "__";
					pubString += newPubs.stream ()
						.map ( graph::getConcept )
					  .map ( this::getMolBioDefaultLabel )
					  .map ( name -> name.contains ( "PMID:" ) ? name : "PMID:" + name )
					  .collect ( Collectors.joining ( "//" ) );
					cc2name.put ( "Publication", pubString );
				}

				// create output string for evidences column in GeneView table
				// TODO: MEH! This should be managed by keeping the structure ( type, and list of values)
				// and translating it to string only when writing.
				//
				String evidenceStr = cc2name.entrySet ()
				.stream ()
				.map ( e -> 
					"Publication".equals ( e.getKey () )  
						? e.getValue ()
						: e.getKey () + "__" + e.getValue ().split ( "//" ).length + "__" + e.getValue ()
				)
				.collect ( Collectors.joining ( "||" ) );
								
				if ( luceneHits.isEmpty () && listMode.equals ( "GLrestrict" ) ) continue;

				// TODO: was initially used in the append() below. TO BE REMOVED?!
				//String allEvidences = evidencesIDs.stream ()
				//	.map ( evId -> Integer.toString ( evId ) )
				//	.collect ( Collectors.joining ( "," ));
				
				if ( ! ( !evidenceStr.isEmpty () || qtls.isEmpty () ) ) continue;
				if ( userGenes != null && !"yes".equals ( isInList ) ) continue;
				
				var numFmt = new DecimalFormat ( "0.00" );
				
				out.append (
					id + "\t" + geneHelper.getBestAccession () + "\t" + geneName + "\t" + geneHelper.getChromosome () + "\t" 
					+ numFmt.format ( geneHelper.computeBegin ( true ) ) + "\t" + geneHelper.getTaxID () + "\t" 
					+ numFmt.format ( score ) + "\t" + isInList + "\t" + infoQTL + "\t" + evidenceStr + "\n" 
				);

			} // for candidates
			log.info ( "Gene table generated..." );
			return out.toString ();
		
		} // writeGeneTable()


		
    /**
     * Write Evidence Table for Evidence View file
     *
     * @param luceneConcepts
     * @param userGenes
     * @param qtl
     * @param filename
     * @return boolean
     */
		public String writeEvidenceTable ( 
			String keywords, HashMap<ONDEXConcept, Float> luceneConcepts, Set<ONDEXConcept> userGenes, List<String> qtlsStr 
		)
		{
			StringBuffer out = new StringBuffer ();
			out.append ( "TYPE\tNAME\tSCORE\tP-VALUE\tGENES\tUSER GENES\tQTLS\tONDEXID\n" );
			
			if ( userGenes == null || userGenes.isEmpty () ) return out.toString ();
			
			ONDEXGraphMetaData md = graph.getMetaData ();
			AttributeName attChr = md.getAttributeName ( "Chromosome" );
			AttributeName attBeg = md.getAttributeName ( "BEGIN" );
			AttributeName attCM = md.getAttributeName ( "cM" );
			int allGenesSize = mapGene2Concepts.keySet ().size ();
			int userGenesSize = userGenes.size ();
			FisherExact fisherExact = new FisherExact ( allGenesSize );

			log.info ( "generate Evidence table..." );
			List<QTL> qtls = QTL.fromStringList ( qtlsStr );					

			DecimalFormat sfmt = new DecimalFormat ( "0.00" );
			DecimalFormat pfmt = new DecimalFormat ( "0.00000" );

			for ( ONDEXConcept lc : luceneConcepts.keySet () )
			{
				// Creates type,name,score and numberOfGenes
				String type = lc.getOfType ().getId ();
				String name = getMolBioDefaultLabel ( lc );
				// All publications will have the format PMID:15487445
				// if (type == "Publication" && !name.contains("PMID:"))
				// name = "PMID:" + name;
				// Do not print publications or proteins or enzymes in evidence view
				if ( Stream.of ( "Publication", "Protein", "Enzyme" ).anyMatch ( t -> t.equals ( type ) ) ) 
					continue;
				
				Float score = luceneConcepts.get ( lc );
				Integer ondexId = lc.getId ();
				if ( !mapConcept2Genes.containsKey ( lc.getId () ) ) continue;
				Set<Integer> listOfGenes = mapConcept2Genes.get ( lc.getId () );
				Integer numberOfGenes = listOfGenes.size ();
				Set<String> userGenesStrings = new HashSet<> ();
				Integer numberOfQTL = 0;

				for ( int log : listOfGenes )
				{
					ONDEXConcept gene = graph.getConcept ( log );
					var geneHelper = new GeneHelper ( graph, gene );
					
					if ( ( userGenes != null ) && ( gene != null ) && ( userGenes.contains ( gene ) ) )
					{
						// numberOfUserGenes++;
						// retain gene Accession/Name (18/07/18)
						userGenesStrings.add ( geneHelper.getBestAccession () );
						
						// TODO: can we remove it?!
						// use shortest preferred concept name
						/*  
						 * String geneName = getShortestPreferedName(gene.getConceptNames()); geneAcc= geneName;
						 */
					}

					if ( mapGene2QTL.containsKey ( log ) )
						numberOfQTL++;

					// TODO: we don't need attChr (and similar types) as objects, the string ID is enough
					// TODO: what does this mean?!
					
					String chr = geneHelper.getChromosome ();
					double beg = geneHelper.computeEnd ( true );
					
					
					// if ( !qtls.isEmpty () ) TODO: REMOVE! COME ON!!!
					for ( QTL loci : qtls )
					{
						String qtlChrom = loci.getChromosome ();
						Integer qtlStart = loci.getStart ();
						Integer qtlEnd = loci.getEnd ();

						if ( qtlChrom.equals ( chr ) && beg >= qtlStart && beg <= qtlEnd ) numberOfQTL++;
					}

				} // for log

				if ( userGenesStrings.isEmpty () ) continue;
				
				double pvalue = 0.0;

				// quick adjustment to the score to make it a P-value from F-test instead
				int matchedInGeneList = userGenesStrings.size ();
				int notMatchedInGeneList = userGenesSize - matchedInGeneList;
				int matchedNotInGeneList = numberOfGenes - matchedInGeneList;
				int notMatchedNotInGeneList = allGenesSize - matchedNotInGeneList - matchedInGeneList - notMatchedInGeneList;
				pvalue = fisherExact.getP ( 
					matchedInGeneList, matchedNotInGeneList, notMatchedInGeneList, notMatchedNotInGeneList
				);
				
				var userGenesStr = userGenesStrings.stream ().collect ( Collectors.joining ( "," ) ); 
				out.append ( 
					type + "\t" + name + "\t" + sfmt.format ( score ) + "\t" + pfmt.format ( pvalue ) + "\t"
					+ numberOfGenes + "\t" + userGenesStr + "\t" + numberOfQTL + "\t" + ondexId + "\n" 
				);
			} // for luceneConcepts()
			
			return out.toString ();
		} // writeEvidenceTable()

						
    /**
     * Write Synonym Table for Query suggestor
     *
     * @param luceneConcepts
     * @param userGenes
     * @param qtl
     * @param filename
     * @return boolean
     * @throws ParseException
     */
		public String writeSynonymTable ( String keyword ) throws ParseException
		{
			StringBuffer out = new StringBuffer ();
			// TODO: Lucene shouldn't be used directly
			Analyzer analyzer = new StandardAnalyzer ();
			
			Set<String> synonymKeys = this.parseKeywordIntoSetOfWords ( keyword );
			for ( var synonymKey: synonymKeys )
			{
				log.info ( "Checking synonyms for \"{}\"", synonymKey );
				if ( synonymKey.contains ( " " ) && !synonymKey.startsWith ( "\"" ) ) 
					synonymKey = "\"" + synonymKey + "\"";

				Map<Integer, Float> synonyms2Scores = new HashMap<> ();

				// search concept names
				String fieldNameCN = getFieldName ( "ConceptName", null );
				QueryParser parserCN = new QueryParser ( fieldNameCN, analyzer );
				Query qNames = parserCN.parse ( synonymKey );
				ScoredHits<ONDEXConcept> hitSynonyms = luceneMgr.searchTopConcepts ( qNames, 500 );

        /*
         * TODO: does this still apply?
         * 
         * number of top concepts searched for each Lucene field, increased for now from
         * 100 to 500, until Lucene code is ported from Ondex to QTLNetMiner, when we'll
         * make changes to the QueryParser code instead.
         */

				for ( ONDEXConcept c : hitSynonyms.getOndexHits () )
				{
					if ( c instanceof LuceneConcept )
						c = ( (LuceneConcept) c ).getParent ();
					
					int cid = c.getId ();
					float cscore = hitSynonyms.getScoreOnEntity ( c );
					
					synonyms2Scores.compute ( cid, (thisId, thisScore) ->
						thisId == null ? cscore : Math.max ( cscore, thisScore )	
					);

				}

				
				if ( synonyms2Scores.isEmpty () ) continue;

				// Only start a KEY tag if it will have contents. Otherwise skip it.
				out.append ( "<" + synonymKey + ">\n" );

				Stream<Map.Entry<Integer, Float>> sortedSynonyms = synonyms2Scores.entrySet ()
				.stream ()
				.sorted ( Collections.reverseOrder ( Map.Entry.comparingByValue () ) );

				Map<String, Integer> entryCountsByType = new HashMap<> ();
				final int MAX_SYNONYMS = 25; // we store this no of top synonyms per concept
						
				// writes the topX values in table
				sortedSynonyms.forEach ( entry -> 
				{
					int synonymId = entry.getKey ();
					float score = entry.getValue ();
					
					ONDEXConcept eoc = graph.getConcept ( synonymId );
					String type = eoc.getOfType ().getId ();
					// Integer id = eoc.getId (); TODO: WHAT?!

					if ( ( type.equals ( "Publication" ) || type.equals ( "Thing" ) ) ) return;
					
					// TODO: before this count was incremented in the cNames loop below, however, that way either we
					// get the same because there's one preferred name only,
					// or the count computed that way is likely wrong cause it increases with names
					//
					int synCount = entryCountsByType.compute ( type, 
						(thisType, thisCount) -> thisType == null ? 1 : ++thisCount
					); 

					if ( synCount > MAX_SYNONYMS ) return;

					
					Set<ConceptName> cNames = eoc.getConceptNames ();

					cNames.stream ()
					.filter ( ConceptName::isPreferred )
					.map ( ConceptName::getName )
					.forEach ( name ->
					{
						// error going around for publication
						// suggestions
						if ( name.contains ( "\n" ) ) name = name.replace ( "\n", "" );

						// error going around for qtl
						// suggestions
						if ( name.contains ( "\"" ) ) name = name.replaceAll ( "\"", "" );
						
						out.append ( name + "\t" + type + "\t" + Float.toString ( score ) + "\t" + synonymId + "\n" );
					});
				}); // forEach synonym

				out.append ( "</" + synonymKey + ">\n" );
					
			} // for synonymKeys
			return out.toString ();
		} //

		
		/**
		 * TODO: this is only used by {@link OndexLocalDataSource} and only to know the size of 
		 * concepts that match. So, do we need to compute the map, or do wee need the count only?
		 * 
		 * The two tasks are different, see below.
		 * 
		 */
		public Map<Integer, Set<Integer>> getMapEvidences2Genes ( HashMap<ONDEXConcept, Float> luceneConcepts )
		{
			return luceneConcepts.keySet ()
			.stream ()
			.map ( ONDEXConcept::getId )
			.filter ( mapConcept2Genes::containsKey )
			// .count () As said above, this would be enough if we need a count only
			.collect ( Collectors.toMap ( Function.identity (), mapConcept2Genes::get ) );
		}

		
    /**
     * Returns the shortest preferred Name from a set of concept Names or ""
     * [Gene|Protein][Phenotype][The rest]
     *
     * @param cns Set<ConceptName>
     * @return String name
     */
    private String getShortestPreferedName ( Set<ConceptName> cns ) 
    {
    	return cns.stream ()
      .filter ( ConceptName::isPreferred )
    	.map ( ConceptName::getName )
    	.map ( String::trim )
    	.sorted ( Comparator.comparing ( String::length ) )
    	.findFirst ()
    	.orElse ( "" );
    }

    /**
     * Returns the shortest not ambiguous accession or ""
     *
     * @param accs Set<ConceptAccession>
     * @return String name
     */
    private String getShortestNotAmbiguousAccession(Set<ConceptAccession> accs) 
    {
    	return accs.stream ()
      .filter ( acc -> !acc.isAmbiguous () )
    	.map ( ConceptAccession::getAccession )
    	.map ( String::trim )
    	.sorted ( Comparator.comparing ( String::length ) )
    	.findFirst ()
    	.orElse ( "" );
    }


    
    /**
     * Returns the best name for certain molecular biology entities, like Gene, Protein, falls back to a default
     * label in the other cases. 
     * 
     */
		private String getMolBioDefaultLabel ( ONDEXConcept c )
		{
			String type = c.getOfType ().getId ();
			String bestAcc = StringUtils.trimToEmpty ( getShortestNotAmbiguousAccession ( c.getConceptAccessions () ) );
			String bestName = StringUtils.trimToEmpty ( getShortestPreferedName ( c.getConceptNames () ) );

			String result = "";
			
			if ( type == "Gene" || type == "Protein" )
			{
				// TODO: initially this condition was on " ", but that's likely to be wrong. Must be checked
				if ( bestAcc.isEmpty () ) result = bestName;
				else result = bestAcc.length () < bestName.length () ? bestAcc : bestName;
			}
			else
				result = !bestName.isEmpty () ? bestName : bestAcc;

			return StringUtils.abbreviate ( result, 30 );
		}



    public void setTaxId(List<String> id) {
        this.taxID = id;
    }

    public void setExportVisible(boolean export_visible_network) {
        this.export_visible_network = export_visible_network;

    }

    public boolean getExportVisible() {
        return this.export_visible_network;
    }

    public List<String> getTaxId() {
        return this.taxID;
    }
    
    public void setVersion(int ver) {
        this.version = ver;
    }
    
    public int getVersion() {
        return this.version;
    }
    
    public void setSource(String src) {
        this.sourceOrganization = src;
    }
    
    public String getSource() {
        return this.sourceOrganization;
    }
    
    public void setProvider(String provider) {
        this.provider = provider;
    }
    
    public String getProvider() {
        return this.provider;
    }
    
    public void setSpecies(String speciesName) {
        this.speciesName = speciesName;
    }
    
    public String getSpecies() {
        return this.speciesName;
    }
	
		public void setNodeCount(String nodeCount) {
			this.nodeCount = nodeCount;
	  }
    
    public String getNodeCount() {
      return this.nodeCount;
    }
    
    public void setRelationshipCount(String relationshipCount) {
        this.relationshipCount = relationshipCount;
    }
    
    public String getRelationshipCount(){
        return this.relationshipCount;
    }
    public void setKnetspaceHost(String knetspaceHost) {
        this.knetspaceHost = knetspaceHost;
    }

    public String getKnetspaceHost() {
        return this.knetspaceHost;
    }

    public void setReferenceGenome(boolean value) {
        this.referenceGenome = value;
    }

    public boolean getReferenceGenome() {
        return this.referenceGenome;
    }
    
    public String getCreationDate() {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm");  
        return formatter.format(creationDate);
    }

    
// TODO: refactoring to be continued from here
// TODO: before touching geneCount(), review GeneHelper and remove the cM case
    
    /**
     * Returns number of organism (taxID) genes at a given loci
     *
     * @param chr chromosome name as used in GViewer
     * @param start start position
     * @param end end position
     * @return 0 if no genes found, otherwise number of genes at specified loci
     */
    public int getGeneCount(String chr, int start, int end) {

        AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");
        AttributeName attChr = graph.getMetaData().getAttributeName("Chromosome");
        // AttributeName attLoc = graph.getMetaData().getAttributeName("Location");
        AttributeName attBeg = graph.getMetaData().getAttributeName("BEGIN");
        AttributeName attCM = graph.getMetaData().getAttributeName("cM");
        ConceptClass ccGene = graph.getMetaData().getConceptClass("Gene");
        Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass(ccGene);

        int geneCount = 0;

        for (ONDEXConcept gene : genes) {
            if (gene.getAttribute(attTAXID) != null && gene.getAttribute(attChr) != null
                    && gene.getAttribute(attBeg) != null) {
                
                //String geneTaxID = gene.getAttribute(attTAXID).getValue().toString();
                String geneTaxID = Optional.ofNullable(gene.getAttribute(attTAXID).getValue().toString()).orElseGet(() -> " ");
                String geneChr = gene.getAttribute(attChr).getValue().toString();
                Integer geneBeg = (Integer) gene.getAttribute(attBeg).getValue();
                // TEMPORARY FIX, to be disabled for new .oxl species networks that have string
                // 'Chrosmosome' (instead of the older integer Chromosome) & don't have a string
                // 'Location' attribute.
                /*
                 * if(gene.getAttribute(attLoc) != null) { // if String Location exists, use
                 * that instead of integer Chromosome as client-side may use String Location in
                 * basemap. geneChr= gene.getAttribute(attLoc).getValue().toString(); }
                 */

                if (attCM != null) {
                    if (gene.getAttribute(attCM) != null) {
                        Double geneCM = (Double) gene.getAttribute(attCM).getValue();

                        // check if taxid, chromosome and start meet criteria
                        if (taxID.contains(geneTaxID) && geneChr.equals(chr) && geneCM >= start && geneCM <= end
                                && start < end) {
                            geneCount++;
                        }
                    }
                } else {
                    // check if taxid, chromosome and start meet criteria
                    if (taxID.contains(geneTaxID) && geneChr.equals(chr) && geneBeg >= start && geneBeg <= end
                            && start < end) {
                        geneCount++;
                    }
                }

            }
        }

        return geneCount;
    }

    /**
     * TODO: WTH?!? This is an Ondex module utility
     */
    public String getFieldName(String name, String value)
    {
    	return value == null ? name : name + "_" + value;
    }

    /**
     * This method populates a HashMap with concepts from KB as keys and list of
     * genes presented in their motifs
     */
    public void populateHashMaps(String graphFileName, String dataPath) {
        log.info("Populate HashMaps");
        File graphFile = new File(graphFileName);
        File file1 = Paths.get(dataPath, "mapConcept2Genes").toFile();
        File file2 = Paths.get(dataPath, "mapGene2Concepts").toFile();
        File file3 = Paths.get(dataPath, "mapGene2PathLength").toFile();
        log.info("Generate HashMap files: mapConcept2Genes & mapGene2Concepts...");

        AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");
        AttributeName attBegin = graph.getMetaData().getAttributeName("BEGIN");
        AttributeName attEnd = graph.getMetaData().getAttributeName("END");
        AttributeName attCM = graph.getMetaData().getAttributeName("cM");
        AttributeName attChromosome = graph.getMetaData().getAttributeName("Chromosome");

        ConceptClass ccGene = graph.getMetaData().getConceptClass("Gene");
        ConceptClass ccQTL = graph.getMetaData().getConceptClass("QTL");

        Set<ONDEXConcept> qtls = new HashSet<>();
        if (ccQTL != null) {
            qtls = graph.getConceptsOfConceptClass(ccQTL);
        }

        Set<ONDEXConcept> genes = OndexServiceProviderHelper.getSeedGenes ( graph, taxID, this.getOptions () );

        if (file1.exists() && (file1.lastModified() < graphFile.lastModified())) {
            log.info("Graph file updated since hashmaps last built, deleting old hashmaps");
            file1.delete();
            file2.delete();
            file3.delete();
        }

        if (!file1.exists()) {

	          // We're going to need a lot of memory, so delete this in advance
        		// (CyDebugger might trigger this multiple times)
        		//
        		mapConcept2Genes = new HashMap<Integer, Set<Integer>>();
	          mapGene2Concepts = new HashMap<Integer, Set<Integer>>();
	          mapGene2PathLength = new HashMap<String, Integer>();
	          
            // the results give us a map of every starting concept to every
            // valid path.
            Map<ONDEXConcept, List<EvidencePathNode>> traverserPaths = graphTraverser.traverseGraph(graph, genes, null);

            // Performance stats reporting about the Cypher-based traverser is disabled after the initial
        		// traversal. This option has no effect when the SM-based traverser is used.
            graphTraverser.setOption("performanceReportFrequency", -1);

            log.info("Also, generate geneID//endNodeID & pathLength in HashMap mapGene2PathLength...");
            PercentProgressLogger progressLogger = new PercentProgressLogger(
                    "{}% of paths stored", traverserPaths.values().size()
            );
            for (List<EvidencePathNode> paths : traverserPaths.values()) {
            		// We dispose them after use, cause this is big and causing memory overflow issues
                paths.removeIf ( path -> {

                    // search last concept of semantic motif for keyword
                    ONDEXConcept gene = (ONDEXConcept) path.getStartingEntity();

                    // add all semantic motifs to the new graph
                    // Set<ONDEXConcept> concepts = path.getAllConcepts();
                    // Extract pathLength and endNode ID.
                    int pathLength = (path.getLength() - 1) / 2; // get Path Length
                    ONDEXConcept con = (ONDEXConcept) path.getConceptsInPositionOrder()
                            .get(path.getConceptsInPositionOrder().size() - 1);
                    int lastConID = con.getId(); // endNode ID.
                    String gpl_key = gene.getId() + "//" + lastConID;

                    if (!mapGene2PathLength.containsKey(gpl_key)) {
                        // log.info(gpl_key +": "+ pathLength);
                        mapGene2PathLength.put(gpl_key, pathLength); // store in HashMap
                    } else {
                        if (pathLength < mapGene2PathLength.get(gpl_key)) {
                            // update HashMap with shorter pathLength
                            mapGene2PathLength.put(gpl_key, pathLength);
                        }
                    }

                    // GENE 2 CONCEPT
                    if (!mapGene2Concepts.containsKey(gene.getId())) {
                        Set<Integer> setConcepts = new HashSet<Integer>();
                        setConcepts.add(lastConID);
                        mapGene2Concepts.put(gene.getId(), setConcepts);
                    } else {
                        mapGene2Concepts.get(gene.getId()).add(lastConID);
                    }

                    // CONCEPT 2 GENE
                    // concepts.remove(gene);
                    mapConcept2Genes
                            .computeIfAbsent(lastConID, _id -> new HashSet<>())
                            .add(gene.getId());

                    // ALWAYS return this to clean up memory (see above)
                    return true;
                }); // paths.removeIf ()
                progressLogger.updateWithIncrement();
            } // for traverserPaths.values()
            try {
                FileOutputStream f;
                ObjectOutputStream s;

                f = new FileOutputStream(file1);
                s = new ObjectOutputStream(f);
                s.writeObject(mapConcept2Genes);
                s.close();

                f = new FileOutputStream(file2);
                s = new ObjectOutputStream(f);
                s.writeObject(mapGene2Concepts);
                s.close();

                f = new FileOutputStream(file3);
                s = new ObjectOutputStream(f);
                s.writeObject(mapGene2PathLength);
                s.close();

            } catch (Exception e) {
                log.error("Failed while creating internal map files: " + e.getMessage (), e);
                ExceptionUtils.throwEx (
                	RuntimeException.class, e, "Failed while creating internal map files: %s", e.getMessage ()
                ); 
            }
        } else {
            try {
                FileInputStream f;
                ObjectInputStream s;

                f = new FileInputStream(file1);
                s = new ObjectInputStream(f);
                mapConcept2Genes = (HashMap<Integer, Set<Integer>>) s.readObject();
                s.close();

                f = new FileInputStream(file2);
                s = new ObjectInputStream(f);
                mapGene2Concepts = (HashMap<Integer, Set<Integer>>) s.readObject();
                s.close();

                f = new FileInputStream(file3);
                s = new ObjectInputStream(f);
                mapGene2PathLength = (HashMap<String, Integer>) s.readObject();
                s.close();

            } catch (Exception e) {
              log.error("Failed while reading internal map files: " + e.getMessage (), e);
              ExceptionUtils.throwEx (
              	RuntimeException.class, e, "Failed while reading internal map files: %s", e.getMessage ()
              ); 
            }
        }

        if (mapGene2Concepts == null) {
            log.warn("mapGene2Concepts is null");
            mapGene2Concepts = new HashMap<Integer, Set<Integer>>();
        } else {
            log.info("Populated Gene2Concept with #mappings: " + mapGene2Concepts.size());
        }

        if (mapConcept2Genes == null) {
            log.warn("mapConcept2Genes is null");
            mapConcept2Genes = new HashMap<Integer, Set<Integer>>();
        } else {
            log.info("Populated Concept2Gene with #mappings: " + mapConcept2Genes.size());
        }

        if (mapGene2PathLength == null) {
            log.warn("Gene2PathLength is null");
            mapGene2PathLength = new HashMap<String, Integer>();
        } else {
            log.info("Populated Gene2PathLength with #mappings: " + mapGene2PathLength.size());
        }

        log.info("Create Gene2QTL map now...");

        mapGene2QTL = new HashMap<Integer, Set<Integer>>();

        PercentProgressLogger progressLogger = new PercentProgressLogger(
                "{}% of genes processed", genes.size()
        );

        for (ONDEXConcept gene : genes) {

            String chr = null;
            double beg = 0.0;
            double begCM = 0.0;
            int begBP = 0;

            if (gene.getAttribute(attChromosome) != null) {
                chr = gene.getAttribute(attChromosome).getValue().toString();
            }

            if (attCM != null && gene.getAttribute(attCM) != null) {
                begCM = (Double) gene.getAttribute(attCM).getValue();
            }

            if (attBegin != null && gene.getAttribute(attBegin) != null) {
                begBP = (Integer) gene.getAttribute(attBegin).getValue();
            }

            if (attCM != null) {
                beg = begCM;
            } else {
                beg = begBP;
            }

            for (ONDEXConcept q : qtls) {
                String chrQTL = q.getAttribute(attChromosome).getValue().toString();
                int startQTL = (Integer) q.getAttribute(attBegin).getValue();
                int endQTL = (Integer) q.getAttribute(attEnd).getValue();

                if (chrQTL.equals(chr) && (beg >= startQTL) && (beg <= endQTL)) {

                    if (!mapGene2QTL.containsKey(gene.getId())) {
                        Set<Integer> setQTL = new HashSet<Integer>();
                        mapGene2QTL.put(gene.getId(), setQTL);
                    }

                    mapGene2QTL.get(gene.getId()).add(q.getId());
                }

            }
            progressLogger.updateWithIncrement();
        }

        log.info("Populated Gene2QTL with #mappings: " + mapGene2QTL.size());
    }

    public ArrayList<ONDEXConcept> filterQTLs(ArrayList<ONDEXConcept> genes, List<String> qtls) {
        Set<ONDEXConcept> genesQTL = searchQTLs(qtls);
        genes.retainAll(genesQTL);
        return genes;
    }

    /*
     * // TODO: no longer in use. Can we remove it?
     *  
     * generate gene2evidence .tab file with contents of the mapGenes2Concepts
     * HashMap & evidence2gene .tab file with contents of the mapConcepts2Genes
     * author singha
     */
    private void generateGeneEvidenceStats(String fileUrl) {
        try {
            String g2c_fileName = Paths.get(fileUrl, "gene2evidences.tab.gz").toString(); // gene2evidences.tab
            String c2g_fileName = Paths.get(fileUrl, "evidence2genes.tab.gz").toString(); // evidence2genes.tab
            String g2pl_fileName = Paths.get(fileUrl, "gene2PathLength.tab.gz").toString(); // gene2PathLength.tab

            log.debug("Print mapGene2Concepts Stats in a new .tab file: " + g2c_fileName);
            // Generate mapGene2Concepts HashMap contents in a new .tab file
            // BufferedWriter out1= new BufferedWriter(new FileWriter(g2c_fileName));
            BufferedWriter out1 = new BufferedWriter(
                    new OutputStreamWriter(new GZIPOutputStream(new FileOutputStream(g2c_fileName))));
            // GZIPOutputStream gzip= new GZIPOutputStream(new FileOutputStream(new
            // File(g2c_fileName))); // gzip the file.
            // BufferedWriter out1= new BufferedWriter(new OutputStreamWriter(gzip,
            // "UTF-8"));
            out1.write("Gene_ONDEXID" + "\t" + "Total_Evidences" + "\t" + "EvidenceIDs" + "\n");
            for (Map.Entry<Integer, Set<Integer>> mEntry : mapGene2Concepts.entrySet()) { // for each <K,V> entry
                int geneID = mEntry.getKey();
                Set<Integer> conIDs = mEntry.getValue(); // Set<Integer> value
                String txt = geneID + "\t" + conIDs.size() + "\t";
                Iterator<Integer> itr = conIDs.iterator();
                while (itr.hasNext()) {
                    txt = txt + itr.next().toString() + ",";
                }
                txt = txt.substring(0, txt.length() - 1) + "\n"; // omit last comma character
                out1.write(txt); // write contents.
            }
            out1.close();

            log.debug("Print mapConcept2Genes Stats in a new .tab file: " + c2g_fileName);
            // Generate mapConcept2Genes HashMap contents in a new .tab file
            // BufferedWriter out2= new BufferedWriter(new FileWriter(c2g_fileName));
            BufferedWriter out2 = new BufferedWriter(
                    new OutputStreamWriter(new GZIPOutputStream(new FileOutputStream(c2g_fileName))));
            out2.write("Evidence_ONDEXID" + "\t" + "Total_Genes" + "\t" + "GeneIDs" + "\n");
            for (Map.Entry<Integer, Set<Integer>> mapEntry : mapConcept2Genes.entrySet()) { // for each <K,V> entry
                int eviID = (Integer) mapEntry.getKey();
                Set<Integer> geneIDs = mapEntry.getValue(); // Set<Integer> value
                String evi_txt = eviID + "\t" + geneIDs.size() + "\t";
                Iterator<Integer> iter = geneIDs.iterator();
                while (iter.hasNext()) {
                    evi_txt = evi_txt + iter.next().toString() + ",";
                }
                evi_txt = evi_txt.substring(0, evi_txt.length() - 1) + "\n"; // omit last comma character
                out2.write(evi_txt); // write contents.
            }
            out2.close();

            // Generate gene2PathLength .tab file
            log.debug("Print mapGene2PathLength Stats in a new .tab file: " + g2pl_fileName);
            BufferedWriter out3 = new BufferedWriter(
                    new OutputStreamWriter(new GZIPOutputStream(new FileOutputStream(g2pl_fileName))));
            out3.write("Gene_ONDEXID//EndNode_ONDEXID" + "\t" + "PathLength" + "\n");
            /*
             * for(String key : mapGene2PathLength.keySet()) { out3.write(key +"\t"+
             * mapGene2PathLength.get(key) +"\n"); // write contents. }
             */
            for (Map.Entry<String, Integer> plEntry : mapGene2PathLength.entrySet()) { // for each <K,V> entry
                String key = plEntry.getKey();
                int pl = plEntry.getValue();
                String pl_txt = key + "\t" + pl + "\n";
                // log.info("mapGene2PathLength: "+ pl_txt);
                out3.write(pl_txt); // write contents.
            }
            out3.close();
        } catch (Exception ex) {
            log.error("Error while writing stats: " + ex.getMessage (), ex);
        }
    }

    /**
     * We receive options set from the main config.xml file. These are further
     * passed to the specific {@link AbstractGraphTraverser} that is selected
     * via the 'GraphTraverserClass' option in the main config file (together
     * with a couple of other parameters, see
     */
    public Map<String, Object> getOptions() {
        return options;
    }

    public void setOptions(Map<String, Object> options) {
        this.options = options;
    }

		public static HashMap<Integer, Set<Integer>> getMapConcept2Genes ()
		{
			return mapConcept2Genes;
		}
  
}
