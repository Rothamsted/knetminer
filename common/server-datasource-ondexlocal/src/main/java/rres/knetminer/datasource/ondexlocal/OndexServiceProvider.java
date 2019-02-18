package rres.knetminer.datasource.ondexlocal;

import java.awt.Font;
import java.beans.XMLEncoder;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.SortedMap;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.GZIPOutputStream;

import net.sourceforge.ondex.core.Attribute;
import org.apache.commons.io.FileUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.lucene.analysis.Analyzer;
//import org.apache.lucene.analysis.WhitespaceAnalyzer;
import org.apache.lucene.analysis.core.WhitespaceAnalyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
//import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryparser.classic.ParseException;
//import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Query;

import net.sourceforge.ondex.InvalidPluginArgumentException;
import net.sourceforge.ondex.ONDEXPluginArguments;
import net.sourceforge.ondex.algorithm.graphquery.GraphTraverser;
import net.sourceforge.ondex.algorithm.graphquery.StateMachine;
import net.sourceforge.ondex.algorithm.graphquery.flatfile.StateMachineFlatFileParser2;
import net.sourceforge.ondex.algorithm.graphquery.nodepath.EvidencePathNode;
import net.sourceforge.ondex.args.FileArgumentDefinition;
import net.sourceforge.ondex.config.ONDEXGraphRegistry;
import net.sourceforge.ondex.core.AttributeName;
import net.sourceforge.ondex.core.ConceptAccession;
import net.sourceforge.ondex.core.ConceptClass;
import net.sourceforge.ondex.core.ConceptName;
import net.sourceforge.ondex.core.EvidenceType;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXGraphMetaData;
import net.sourceforge.ondex.core.ONDEXRelation;
import net.sourceforge.ondex.core.RelationType;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.core.searchable.LuceneConcept;
import net.sourceforge.ondex.core.searchable.LuceneEnv;
import net.sourceforge.ondex.core.searchable.ScoredHits;
import net.sourceforge.ondex.exception.type.PluginConfigurationException;
//import net.sourceforge.ondex.export.oxl.Export;
import net.sourceforge.ondex.export.cyjsJson.Export;
import net.sourceforge.ondex.filter.unconnected.ArgumentNames;
import net.sourceforge.ondex.filter.unconnected.Filter;
import net.sourceforge.ondex.parser.oxl.Parser;
import net.sourceforge.ondex.tools.ondex.ONDEXGraphCloner;
import rres.knetminer.datasource.api.QTL;
import rres.knetminer.datasource.ondexlocal.FisherExact;

/**
 * Parent class to all ondex service provider classes implementing organism
 * specific searches.
 *
 * @author taubertj, pakk, singha
 */
public class OndexServiceProvider {
    protected final Logger log = LogManager.getLogger(getClass());

    /**
     * ChromosomeID mapping for different datasets
     */
    // BidiMap<Integer, String> chromBidiMap = new DualHashBidiMap<Integer,
    // String>();

    /**
     * GraphTraverser will be initiated with a state machine
     */
    GraphTraverser gt;

    /**
     * Ondex knowledge base as memory graph
     */
    ONDEXGraph graph;

    /**
     * Query-independent Ondex motifs as a hash map
     */
    static HashMap<Integer, Set<Integer>> mapGene2Concepts;
    static HashMap<Integer, Set<Integer>> mapConcept2Genes;

    /**
     * HashMap of geneID -> endNodeID_pathLength
     */
    static HashMap<String, Integer> mapGene2PathLength;

    /**
     * Query-dependent mapping between genes and concepts that contain query terms
     */
    HashMap<Integer, Set<Integer>> mapGene2HitConcept;

    /**
     * Gene to QTL mapping
     */
    HashMap<Integer, Set<Integer>> mapGene2QTL;

    /**
     * Temp: map query genes to a score
     */

    HashMap<ONDEXConcept, Double> scoredCandidates;

    /**
     * number of genes in genome
     */
    int numGenesInGenome;

    /**
     * index the graph
     */
    LuceneEnv lenv;

    /**
     * TaxID of organism for which the knowledgebase was created
     */
    List<String> taxID;

    /**
     * true if a reference genome is provided
     */
    boolean referenceGenome;

    boolean export_visible_network;


    /**
     * Loads configuration for chromosomes and initialises map
     */
    OndexServiceProvider() {

    }

    /**
     * Load OXL data file into memory Build Lucene index for the Ondex graph Create
     * a state machine for semantic motif search
     *
     * @throws ArrayIndexOutOfBoundsException
     * @throws PluginConfigurationException
     */
    public void createGraph(String dataPath, String graphFileName, String smFileName)
            throws ArrayIndexOutOfBoundsException, PluginConfigurationException {

        log.info("Loading graph from " + graphFileName);

        // new in-memory graph
        graph = new MemoryONDEXGraph("OndexKB");

        loadOndexKBGraph(graphFileName);
        indexOndexGraph(graphFileName, dataPath);

        log.info("Loading semantic motifs from " + smFileName);
        StateMachine sm = loadSemanticMotifs(smFileName);

        // create a crawler using our semantic motifs
        gt = new GraphTraverser(sm);

        populateHashMaps(graphFileName, dataPath);

        // determine number of genes in given species (taxid)
        AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");
        ConceptClass ccGene = graph.getMetaData().getConceptClass("Gene");
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
     * mapConcept2Genes & mapGene2Concepts. author singha
     */
    private void displayGraphStats(String fileUrl) {
        // Update the Network Stats file that holds the latest Stats
        // information.
        String fileName = Paths.get(fileUrl, "latestNetwork_Stats.tab").toString();

        int minValues, maxValues = 0, avgValues, all_values_count = 0;

        // Also, create a timetamped Stats file to retain historic Stats
        // information.
        long timestamp = System.currentTimeMillis();
        String newFileName = Paths.get(fileUrl, timestamp + "_Network_Stats.tab").toString();
        try {
            int totalGenes = numGenesInGenome;
            int totalConcepts = graph.getConcepts().size();
            int totalRelations = graph.getRelations().size();
            int geneEvidenceConcepts = mapConcept2Genes.size();
            minValues = geneEvidenceConcepts > 0
                    ? mapGene2Concepts.get(mapGene2Concepts.keySet().toArray()[0]).size()
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
                int number_of_values = value.size(); // size of the values

                if (number_of_values < minValues) {
                    minValues = number_of_values;
                }
                if (number_of_values > maxValues) {
                    maxValues = number_of_values;
                }
                // Retain the sum of sizes of all the key-value pairs in the
                // HashMap.
                all_values_count = all_values_count + number_of_values;
            }

            // Total no. of keys in the HashMap.
            int all_keys = mapGene2Concepts.keySet().size();
            // Calculate average size of gene-evidence networks in the HashMap.
            avgValues = all_keys > 0 ? all_values_count / all_keys : 0;

            /*
             * log.info("Graph Stats:");
             * log.info("1) Total number of genes: "+ totalGenes);
             * log.info("2) Total concepts: "+ totalConcepts);
             * log.info("3) Total Relations: "+ totalRelations);
             * log.info("4) Concept2Gene #mappings: "+ geneEvidenceConcepts);
             * log.info("5) Min., Max., Average size of gene-evidence networks: "
             * + minValues +", "+ maxValues +", "+ avgValues);
             */

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

            // Display table breakdown of all conceptClasses in network
            sb.append("<conceptClasses>\n");
            Set<ConceptClass> conceptClasses = graph.getMetaData().getConceptClasses(); // get all concept classes
            Set<ConceptClass> sorted_conceptClasses = new TreeSet<ConceptClass>(conceptClasses); // sorted
            for (ConceptClass con_class : sorted_conceptClasses) {
                if (graph.getConceptsOfConceptClass(con_class).size() > 0) {
                    String conID = con_class.getId();
                    int con_count = graph.getConceptsOfConceptClass(con_class).size();
                    if (conID.equalsIgnoreCase("Path")) {
                        conID = "Pathway";
                    } else if (conID.equalsIgnoreCase("Comp")) {
                        conID = "Compound";
                    } else if (conID.equalsIgnoreCase("Trait")) {
                        conID = "Trait (GWAS)";
                    } else if (conID.equalsIgnoreCase("Gene")) {
                        con_count = numGenesInGenome;
                    }
					// exclude "Thing" CC
                    if(!conID.equalsIgnoreCase("Thing")) {
					   sb.append("<cc_count>").append(conID).append("=").append(con_count).append("</cc_count>\n");
					  }
                }
            }
            sb.append("</conceptClasses>\n");
            sb.append("</stats>");

            // Update the file storing the latest Stats data.
            BufferedWriter out = new BufferedWriter(new FileWriter(fileName));
            out.write(sb.toString()); // write contents.
            out.close();

            // Also, create the timestamped Stats file.
            BufferedWriter out2 = new BufferedWriter(new FileWriter(newFileName));
            out2.write(sb.toString()); // write contents.
            out2.close();

            /*
             * generate gene2evidence .tab file with contents of the mapGenes2Concepts
             * HashMap & evidence2gene .tab file with contents of the mapConcepts2Genes
             * HashMap
             */
            //   generateGeneEvidenceStats(fileUrl); // DISABLED

        } catch (IOException e) {
            log.error("Failed to count stats for graph", e);
        }
    }

    /**
     * Loads OndexKB Graph (OXL data file into memory)
     */
    private void loadOndexKBGraph(String filename) {
        try {
            log.debug("Start Loading OndexKB Graph..." + filename);
            Parser oxl = new Parser();
            ONDEXPluginArguments pa = new ONDEXPluginArguments(oxl.getArgumentDefinitions());
            pa.setOption(FileArgumentDefinition.INPUT_FILE, filename);
            oxl.setArguments(pa);
            oxl.setONDEXGraph(graph);

            oxl.start();
            log.debug("OndexKB Graph Loaded Into Memory");
        } catch (Exception e) {
            log.error("Failed to load graph", e);
        }
    }

    /**
     * Indexes Ondex Graph
     */
    private void indexOndexGraph(String graphFileName, String dataPath) {
        try {
            // index the Ondex graph
            File graphFile = new File(graphFileName);
            File indexFile = Paths.get(dataPath, "index").toFile();
            if (indexFile.exists() && (indexFile.lastModified() < graphFile.lastModified())) {
                log.info("Graph file updated since index last built, deleting old index");
                FileUtils.deleteDirectory(indexFile);
            }
            log.debug("Building Lucene Index: " + indexFile.getAbsolutePath());
            if (!indexFile.exists())
                lenv = new LuceneEnv(indexFile.getAbsolutePath(), true);
            else
                lenv = new LuceneEnv(indexFile.getAbsolutePath(), false);
            lenv.setONDEXGraph(graph);
            log.debug("Lucene Index created");
        } catch (Exception e) {
            log.error("Faild to load graph index", e);
        }
    }

    /**
     * Creates a state machine for semantic motif search
     */
    private StateMachine loadSemanticMotifs(String smFile) {

        StateMachineFlatFileParser2 smp = null;
        try {
            // load semantic motifs from file
            URL motifsUrl = Thread.currentThread().getContextClassLoader().getResource(smFile);

            smp = new StateMachineFlatFileParser2();
            smp.parseReader(new BufferedReader(new InputStreamReader(motifsUrl.openStream())), graph);

            log.debug("Completed State Machine");
        } catch (Exception e) {
            log.error("Failed to compile state machine", e);
        }

        return smp.getStateMachine();
    }

    /**
     * Export the Ondex graph to file system as a .oxl file and also in JSON format
     * using the new JSON Exporter plugin in Ondex.
     *
     * @param ONDEXGraph graph
     * @throws InvalidPluginArgumentException
     */
    public String exportGraph(ONDEXGraph og) throws InvalidPluginArgumentException {
        // Unconnected filter
        Filter uFilter = new Filter();
        ONDEXPluginArguments uFA = new ONDEXPluginArguments(uFilter.getArgumentDefinitions());
        uFA.addOption(ArgumentNames.REMOVE_TAG_ARG, true);

        // TODO
        uFA.addOption(ArgumentNames.CONCEPTCLASS_RESTRICTION_ARG, "Publication");
        uFA.addOption(ArgumentNames.CONCEPTCLASS_RESTRICTION_ARG, "Chromosome");

        uFilter.setArguments(uFA);
        uFilter.setONDEXGraph(og);
        uFilter.start();

        ONDEXGraph graph2 = new MemoryONDEXGraph("FilteredGraphUnconnected");
        uFilter.copyResultsToNewGraph(graph2);

        // // Attribute Value Filter
        // net.sourceforge.ondex.filter.attributevalue.Filter visFilter = new
        // net.sourceforge.ondex.filter.attributevalue.Filter();
        // ONDEXPluginArguments visFA = new
        // ONDEXPluginArguments(visFilter.getArgumentDefinitions());
        // visFA.addOption(net.sourceforge.ondex.filter.attributevalue.ArgumentNames.ATTRNAME_ARG,
        // "size");
        // //Not sure if "true" needs to be string or boolean
        // visFA.addOption(net.sourceforge.ondex.filter.attributevalue.ArgumentNames.VALUE_ARG,
        // "0");
        // visFA.addOption(net.sourceforge.ondex.filter.attributevalue.ArgumentNames.OPERATOR_ARG,
        // ">");
        // visFA.addOption(net.sourceforge.ondex.filter.attributevalue.ArgumentNames.INCLUDING_ARG,
        // true);
        // visFA.addOption(net.sourceforge.ondex.filter.attributevalue.ArgumentNames.IGNORE_ARG,
        // true);
        //
        // visFilter.setArguments(visFA);
        // visFilter.setONDEXGraph(graph2);
        // try {
        // visFilter.start();
        // } catch (WrongArgumentException e1) {
        // // TODO Auto-generated catch block
        // e1.printStackTrace();
        // }
        //
        // ONDEXGraph graph3 = new MemoryONDEXGraph("FilteredGraph");
        // visFilter.copyResultsToNewGraph(graph3);

        // oxl export
        // disabled (25/10/17)
        /*
         * Export export = new Export(); export.setLegacyMode(true);
         * ONDEXPluginArguments ea = new
         * ONDEXPluginArguments(export.getArgumentDefinitions());
         * ea.setOption(FileArgumentDefinition.EXPORT_FILE, exportPath);
         * ea.addOption("GZip", true); export.setArguments(ea);
         * export.setONDEXGraph(graph2); try { export.start(); } catch (IOException e) {
         * e.printStackTrace(); System.out.println(e.getMessage()); } catch
         * (XMLStreamException e) { e.printStackTrace();
         * System.out.println(e.getMessage()); } catch (JAXBException e) {
         * e.printStackTrace(); System.out.println(e.getMessage()); }
         *
         * // Check if .oxl file exists while (!fileIsCreated) { fileIsCreated =
         * checkFileExist(exportPath); } System.out.println("OXL file created:" +
         * exportPath);
         */

        // Export the graph as JSON too, using the Ondex JSON Exporter plugin.
        Export jsonExport = new Export();
        // JSON output file.
        // String jsonExportPath = exportPath.substring(0, exportPath.length() - 4) +
        // ".json";
        byte[] encoded = new byte[0];
        try {
            File exportPath = File.createTempFile("knetminer", "graph");
            exportPath.deleteOnExit(); // Just in case we don't get round to deleting it ourselves
            ONDEXPluginArguments epa = new ONDEXPluginArguments(jsonExport.getArgumentDefinitions());
            epa.setOption(FileArgumentDefinition.EXPORT_FILE, exportPath.getAbsolutePath());

            log.debug("JSON Export file: " + epa.getOptions().get(FileArgumentDefinition.EXPORT_FILE));

            jsonExport.setArguments(epa);
            jsonExport.setONDEXGraph(graph2);
            log.debug("Export JSON data: Total concepts= " + graph2.getConcepts().size() + " , Relations= "
                    + graph2.getRelations().size());
            // Export the contents of the 'graph' object as multiple JSON
            // objects to an output file.
            jsonExport.start();
            log.debug("Network JSON file created:" + /* jsonExportPath */exportPath.getAbsolutePath());
            encoded = Files.readAllBytes(exportPath.toPath());
            exportPath.delete();
        } catch (IOException ex) {
            log.error("Failed to export graph", ex);
        }
        return new String(encoded, Charset.defaultCharset());
    }

    // JavaScript Document

    /**
     * Creates a new keyword for finding the NOT list
     *
     * @param keyword original keyword
     * @return new keyword for searching the NOT list
     */
    private String createsNotList(String keyword) {
        String result = "";
        if (keyword == null) {
            keyword = "";
        }

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
     * @param sHits     map that holds search results
     */
    private void mergeHits(HashMap<ONDEXConcept, Float> hit2score, ScoredHits<ONDEXConcept> sHits,
                           ScoredHits<ONDEXConcept> NOTHits) {
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
    public HashMap<ONDEXConcept, Float> searchLucene(String keywords, Collection<ONDEXConcept> geneList, boolean includePublications) throws IOException, ParseException {

        Set<AttributeName> atts = graph.getMetaData().getAttributeNames();
        String[] datasources = {"PFAM", "IPRO", "UNIPROTKB", "EMBL", "KEGG", "EC", "GO", "TO", "NLM", "TAIR",
                "ENSEMBLGENE", "PHYTOZOME", "IWGSC", "IBSC", "PGSC", "ENSEMBL"};
        // sources identified in KNETviewer
        /*
         * String[] new_datasources= { "AC", "DOI", "CHEBI", "CHEMBL", "CHEMBLASSAY",
         * "CHEMBLTARGET", "EC", "EMBL", "ENSEMBL", "GENB", "GENOSCOPE", "GO", "INTACT",
         * "IPRO", "KEGG", "MC", "NC_GE", "NC_NM", "NC_NP", "NLM", "OMIM", "PDB",
         * "PFAM", "PlnTFDB", "Poplar-JGI", "PoplarCyc", "PRINTS", "PRODOM", "PROSITE",
         * "PUBCHEM", "PubMed", "REAC", "SCOP", "SOYCYC", "TAIR", "TX", "UNIPROTKB"};
         */
        Set<String> dsAcc = new HashSet<String>(Arrays.asList(datasources));

        HashMap<ONDEXConcept, Float> hit2score = new HashMap<ONDEXConcept, Float>();

        if ("".equals(keywords) || keywords == null) {
            log.info("No keyword, skipping Lucene stage, using mapGene2Concept instead");
            if (geneList != null) {
                for (ONDEXConcept gene : geneList) {
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

        // Analyzer analyzer = new StandardAnalyzer(Version.LUCENE_36);
        Analyzer analyzer = new StandardAnalyzer();

        String keyword = keywords;

        // creates the NOT list (list of all the forbidden documents)
        String NOTQuery = createsNotList(keyword);
        String crossTypesNotQuery = "";
        ScoredHits<ONDEXConcept> NOTList = null;
        if (NOTQuery != "") {
            crossTypesNotQuery = "ConceptAttribute_AbstractHeader:(" + NOTQuery + ") OR ConceptAttribute_Abstract:("
                    + NOTQuery + ") OR Annotation:(" + NOTQuery + ") OR ConceptName:(" + NOTQuery + ") OR ConceptID:("
                    + NOTQuery + ")";
            String fieldNameNQ = getFieldName("ConceptName", null);
            // QueryParser parserNQ = new QueryParser(Version.LUCENE_36, fieldNameNQ,
            // analyzer);
            QueryParser parserNQ = new QueryParser(fieldNameNQ, analyzer);
            Query qNQ = parserNQ.parse(crossTypesNotQuery);
            NOTList = lenv.searchTopConcepts(qNQ, 2000);
        }

        // number of top concepts retrieved for each Lucene field
        /*
         * increased for now from 500 to 1500, until Lucene code is ported from Ondex to
         * QTLNetMiner, when we'll make changes to the QueryParser code instead.
         */
        int max_concepts = 2000/* 500 */;

        // search concept attributes
        for (AttributeName att : atts) {
            // Query qAtt =
            // LuceneQueryBuilder.searchConceptByConceptAttributeExact(att,
            // keyword);
            // ScoredHits<ONDEXConcept> sHits = lenv.searchTopConcepts(qAtt,
            // 100);
            // mergeHits(hit2score, sHits);

            String fieldName = getFieldName("ConceptAttribute", att.getId());
            // QueryParser parser = new QueryParser(Version.LUCENE_36, fieldName, analyzer);
            QueryParser parser = new QueryParser(fieldName, analyzer);
            Query qAtt = parser.parse(keyword);
            ScoredHits<ONDEXConcept> sHits = lenv.searchTopConcepts(qAtt, max_concepts);
            mergeHits(hit2score, sHits, NOTList);

        }
        for (String dsAc : dsAcc) {
            // search concept accessions
            // Query qAccessions =
            // LuceneQueryBuilder.searchConceptByConceptAccessionExact(keyword,
            // false, dsAcc);
            String fieldName = getFieldName("ConceptAccessions", dsAc);
            // QueryParser parser = new QueryParser(Version.LUCENE_36, fieldName, analyzer);
            QueryParser parser = new QueryParser(fieldName, analyzer);
            Query qAccessions = parser.parse(keyword);
            ScoredHits<ONDEXConcept> sHitsAcc = lenv.searchTopConcepts(qAccessions, max_concepts);
            mergeHits(hit2score, sHitsAcc, NOTList);
        }

        // search concept names
        // Query qNames =
        // LuceneQueryBuilder.searchConceptByConceptNameExact(keyword);
        String fieldNameCN = getFieldName("ConceptName", null);
        // QueryParser parserCN = new QueryParser(Version.LUCENE_36, fieldNameCN,
        // analyzer);
        QueryParser parserCN = new QueryParser(fieldNameCN, analyzer);
        Query qNames = parserCN.parse(keyword);
        ScoredHits<ONDEXConcept> sHitsNames = lenv.searchTopConcepts(qNames, max_concepts);
        mergeHits(hit2score, sHitsNames, NOTList);

        // search concept description
        // Query qDesc =
        // LuceneQueryBuilder.searchConceptByDescriptionExact(keyword);
        String fieldNameD = getFieldName("Description", null);
        // QueryParser parserD = new QueryParser(Version.LUCENE_36, fieldNameD,
        // analyzer);
        QueryParser parserD = new QueryParser(fieldNameD, analyzer);
        Query qDesc = parserD.parse(keyword);
        ScoredHits<ONDEXConcept> sHitsDesc = lenv.searchTopConcepts(qDesc, max_concepts);
        mergeHits(hit2score, sHitsDesc, NOTList);

        // search concept annotation
        // Query qAnno =
        // LuceneQueryBuilder.searchConceptByAnnotationExact(keyword);
        String fieldNameCA = getFieldName("Annotation", null);
        // QueryParser parserCA = new QueryParser(Version.LUCENE_36, fieldNameCA,
        // analyzer);
        QueryParser parserCA = new QueryParser(fieldNameCA, analyzer);
        Query qAnno = parserCA.parse(keyword);
        ScoredHits<ONDEXConcept> sHitsAnno = lenv.searchTopConcepts(qAnno, max_concepts);
        mergeHits(hit2score, sHitsAnno, NOTList);

        log.info("Query: " + qAnno.toString(fieldNameCA));
        log.info("Annotation hits: " + sHitsAnno.getOndexHits().size());

        return hit2score;
    }

    public ArrayList<ONDEXConcept> getScoredGenes(Map<ONDEXConcept, Float> hit2score) throws IOException {
        return new ArrayList<ONDEXConcept>(this.getScoredGenesMap(hit2score).keySet());
    }

    public SortedMap<ONDEXConcept, Double> getScoredGenesMap(Map<ONDEXConcept, Float> hit2score) throws IOException {
        scoredCandidates = new HashMap<ONDEXConcept, Double>();
        ValueComparator<ONDEXConcept> comparator = new ValueComparator<ONDEXConcept>(scoredCandidates);
        TreeMap<ONDEXConcept, Double> sortedCandidates = new TreeMap<ONDEXConcept, Double>(comparator);

        log.info("total hits from lucene: " + hit2score.keySet().size());

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
            double weighted_evidence_sum = 0;

            // iterate over each evidence concept and compute a weight that is composed of
            // three components
            for (int cId : mapGene2HitConcept.get(geneId)) {

                // relevance of search term to concept
                float luceneScore = hit2score.get(graph.getConcept(cId));

                // specificity of evidence to gene
                double igf = Math.log10((double) numGenesInGenome / mapConcept2Genes.get(cId).size());

                // inverse distance from gene to evidence
                Integer path_length = mapGene2PathLength.get(geneId + "//" + cId);
		    if(path_length==null){
		    	log.info("WARNING: Path length is null for: "+geneId + "//" + cId);
		    }
                double distance = path_length==null ? 0 : (1 / path_length);

                // take the mean of all three components 
                double evidence_weight =  (igf + luceneScore + distance) / 3;

                // sum of all evidence weights
                weighted_evidence_sum += evidence_weight;
            }


            	// normalisation method 1: size of the gene knoweldge graph
            	// double normFactor = 1 / (double) mapGene2Concepts.get(geneId).size();
		
		// normalistion method 2: size of matching evidence concepts only (mean score)
		//double normFactor = 1 / Math.max((double) mapGene2HitConcept.get(geneId).size(), 3.0);

           	
		// No normalisation for now as it's too experimental. 
		// This meeans better studied genes will appear top of the list
            double knetScore = /*normFactor * */ weighted_evidence_sum;

            scoredCandidates.put(graph.getConcept(geneId), knetScore);
        }

        sortedCandidates.putAll(scoredCandidates);

        return sortedCandidates;
    }

    // /**
    // * From the given set concepts (genes) here we return those associated
    // with the keyword.
    // *
    // * @param List<String> list
    // * @param String keyword
    // *
    // * @return ArrayList<ONDEXConcept> genes
    // */
    // public Set<ONDEXConcept> searchList(Set<ONDEXConcept> list, String
    // keyword){
    // Set<ONDEXConcept> relatedGenes = new HashSet<ONDEXConcept>();
    //
    // for(ONDEXConcept concept : list){
    // if(mapGene2Concepts.containsKey(concept.getId())){
    // Set<Integer> accessions = mapGene2Concepts.get(concept.getId());
    // for(Integer acc : accessions){
    // ONDEXConcept linkedConcept = graph.getConcept(acc);
    // if (OndexSearch.find(linkedConcept, keyword, false)) {
    // relatedGenes.add(concept);
    // break;
    // }
    // }
    // }
    // }
    //
    //
    // System.out.println("related genes size: "+relatedGenes.size());
    // return relatedGenes;
    // }

    /**
     * Did you mean function for spelling correction
     *
     * @param String keyword
     * @return list of spell corrected words
     */
    public List<String> didyoumean(String keyword) throws ParseException {
        List<String> alternatives = new ArrayList<String>();

        return alternatives;
    }

    /**
     * Searches for genes within genomic regions (QTLs)
     *
     * @param List<String> qtlsStr
     * @return Set<ONDEXConcept> concepts
     */
    public Set<ONDEXConcept> searchQTLs(List<String> qtlsStr) {
        log.info("qtlsStr: " + qtlsStr); // qtl string
        Set<ONDEXConcept> concepts = new HashSet<ONDEXConcept>();

        // convert List<String> qtlStr to List<QTL> qtls
        List<QTL> qtls = new ArrayList<QTL>();
        for (String qtlStr : qtlsStr) {
            qtls.add(QTL.fromString(qtlStr));
        }

        String chrQTL;
        int startQTL, endQTL;
        for (QTL qtl : qtls) {
            try {
                chrQTL = qtl.getChromosome();
                startQTL = qtl.getStart();
                endQTL = qtl.getEnd();
                log.info("user QTL (chr, start, end): " + chrQTL + " , " + startQTL + " , " + endQTL);
                // swap start with stop if start larger than stop
                if (startQTL > endQTL) {
                    int tmp = startQTL;
                    startQTL = endQTL;
                    endQTL = tmp;
                }
                ConceptClass ccGene = graph.getMetaData().getConceptClass("Gene");
                AttributeName attBegin = graph.getMetaData().getAttributeName("BEGIN");
                AttributeName attCM = graph.getMetaData().getAttributeName("cM");
                AttributeName attChromosome = graph.getMetaData().getAttributeName("Chromosome");
                // AttributeName attLoc = graph.getMetaData().getAttributeName("Location");
                AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");
                Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass(ccGene);
                log.info("genes matched from entire network: " + genes.size());

                for (ONDEXConcept c : genes) {
                    String chrGene = null;
                    int startGene = 0;
                    if (c.getAttribute(attTAXID) == null
                            || !taxID.contains(c.getAttribute(attTAXID).getValue().toString())) {
                        continue;
                    }
                    if (c.getAttribute(attChromosome) != null) {
                        chrGene = c.getAttribute(attChromosome).getValue().toString();
                    }
                    // TEMPORARY FIX, to be disabled for new .oxl species networks that have string
                    // 'Chromosome' (instead of the older integer Chromosome) & don't have a string
                    // 'Location' attribute.
                    /*
                     * if(c.getAttribute(attLoc) != null) { // if String Location exists, use that
                     * instead of integer Chromosome as client-side may use String Location in
                     * basemap. chrGene= c.getAttribute(attLoc).getValue().toString(); }
                     */

					/*if (attCM != null) {
						if (c.getAttribute(attCM) != null) {
							startGene = (Double) c.getAttribute(attCM).getValue();
						}
					} else*/
                    if (c.getAttribute(attBegin) != null) {
                        startGene = /*(double)*/ ((Integer) c.getAttribute(attBegin).getValue());
                    }
                    if (chrGene != null && startGene != 0) {
                        //log.info("Gene (chr, start) found: "+ chrGene +","+ startGene);
                        if (chrQTL.equals(chrGene)) {
                            if ((startGene >= startQTL) && (startGene <= endQTL)) {
                                concepts.add(c);
                            }
                        }

                    }
                }
            } catch (Exception e) {
                log.error("Not valid qtl", e);
            }
        }
        return concepts;
    }

    /**
     * Searches the knowledge base for QTL concepts that match any of the user input
     * terms
     *
     * @param keyword
     * @return list of QTL objects
     */
    public Set<QTL> findQTL(String keyword) throws ParseException {

        ConceptClass ccTrait = graph.getMetaData().getConceptClass("Trait");
        ConceptClass ccQTL = graph.getMetaData().getConceptClass("QTL");
        ConceptClass ccSNP = graph.getMetaData().getConceptClass("SNP");

        // no Trait-QTL relations found
        if (ccTrait == null && (ccQTL == null || ccSNP == null)) {
            return new HashSet<QTL>();
        }

        AttributeName attBegin = graph.getMetaData().getAttributeName("BEGIN");
        AttributeName attEnd = graph.getMetaData().getAttributeName("END");
        AttributeName attPvalue = graph.getMetaData().getAttributeName("PVALUE");
        AttributeName attChromosome = graph.getMetaData().getAttributeName("Chromosome");
        AttributeName attTrait = graph.getMetaData().getAttributeName("Trait");
        AttributeName attTaxID = graph.getMetaData().getAttributeName("TAXID");

        Set<QTL> results = new HashSet<QTL>();

        log.debug("Looking for QTLs...");
        // If there is not traits but there is QTLs then we return all the QTLs
        if (ccTrait == null) {
            log.info("No Traits found: all QTLS will be shown...");
            // results = graph.getConceptsOfConceptClass(ccQTL);
            for (ONDEXConcept q : graph.getConceptsOfConceptClass(ccQTL)) {
                String type = q.getOfType().getId();
                String chrName = q.getAttribute(attChromosome).getValue().toString();
                Integer start = (Integer) q.getAttribute(attBegin).getValue();
                Integer end = (Integer) q.getAttribute(attEnd).getValue();
                String label = q.getConceptName().getName();
                String trait = "";
                if (attTrait != null && q.getAttribute(attTrait) != null) {
                    trait = q.getAttribute(attTrait).getValue().toString();
                }
                String tax_id = "";
                if (attTaxID != null && q.getAttribute(attTaxID) != null) {
                    tax_id = q.getAttribute(attTaxID).getValue().toString();
                    // log.info("findQTL(): ccTrait=null; concept Type: "+ type +",
                    // chrName: "+ chrName +", tax_id= "+ tax_id);
                }
                results.add(new QTL(chrName, type, start, end, label, "", 1.0f, trait, tax_id));
            }
        } else {
            // be careful with the choice of analyzer: ConceptClasses are not
            // indexed in lowercase letters which let the StandardAnalyzer crash
            // Analyzer analyzerSt = new StandardAnalyzer(Version.LUCENE_36);
            Analyzer analyzerSt = new StandardAnalyzer();
            // Analyzer analyzerWS = new WhitespaceAnalyzer(Version.LUCENE_36);
            Analyzer analyzerWS = new WhitespaceAnalyzer();

            String fieldCC = getFieldName("ConceptClass", null);
            // QueryParser parserCC = new QueryParser(Version.LUCENE_36, fieldCC,
            // analyzerWS);
            QueryParser parserCC = new QueryParser(fieldCC, analyzerWS);
            Query cC = parserCC.parse("Trait");

            String fieldCN = getFieldName("ConceptName", null);
            // QueryParser parserCN = new QueryParser(Version.LUCENE_36, fieldCN,
            // analyzerSt);
            QueryParser parserCN = new QueryParser(fieldCN, analyzerSt);
            Query cN = parserCN.parse(keyword);

            /*
             * BooleanQuery finalQuery = new BooleanQuery(); finalQuery.add(cC, Occur.MUST);
             * finalQuery.add(cN, Occur.MUST);
             */
            BooleanQuery finalQuery = new BooleanQuery.Builder().add(cC, BooleanClause.Occur.MUST)
                    .add(cN, BooleanClause.Occur.MUST).build();
            log.info("QTL search query: " + finalQuery.toString());

            ScoredHits<ONDEXConcept> hits = lenv.searchTopConcepts(finalQuery, 100);

            for (ONDEXConcept c : hits.getOndexHits()) {
                if (c instanceof LuceneConcept) {
                    c = ((LuceneConcept) c).getParent();
                }
                Set<ONDEXRelation> rels = graph.getRelationsOfConcept(c);
                for (ONDEXRelation r : rels) {
                    // get QTL concept
                    if (r.getFromConcept().getOfType().equals(ccQTL) || r.getToConcept().getOfType().equals(ccQTL)
                            || r.getFromConcept().getOfType().equals(ccSNP)
                            || r.getToConcept().getOfType().equals(ccSNP)) {
                        // QTL-->Trait or SNP-->Trait
                        // log.info("QTL-->Trait or SNP-->Trait");
                        ONDEXConcept conQTL = r.getFromConcept();
                        // results.add(conQTL);
                        if (conQTL.getAttribute(attChromosome) != null && conQTL.getAttribute(attBegin) != null
                                && conQTL.getAttribute(attEnd) != null) {
                            String type = conQTL.getOfType().getId();
                            String chrName = conQTL.getAttribute(attChromosome).getValue().toString();
                            Integer start = (Integer) conQTL.getAttribute(attBegin).getValue();
                            Integer end = (Integer) conQTL.getAttribute(attEnd).getValue();
                            String label = conQTL.getConceptName().getName();
                            Float pValue = 1.0f;
                            if (attPvalue != null && r.getAttribute(attPvalue) != null) {
                                pValue = (Float) r.getAttribute(attPvalue).getValue();
                            }
                            String trait = c.getConceptName().getName();
                            String tax_id = "";
                            // log.info("findQTL(): conQTL.getAttribute(attTaxID): "+
                            // conQTL.getAttribute(attTaxID) +", value= "+
                            // conQTL.getAttribute(attTaxID).getValue().toString());
                            if (attTaxID != null && conQTL.getAttribute(attTaxID) != null) {
                                tax_id = conQTL.getAttribute(attTaxID).getValue().toString();
                                // log.info("findQTL(): conQTL Type: "+ type +", chrName: "+ chrName
                                // +", tax_id= "+ tax_id);
                            }
                            results.add(new QTL(chrName, type, start, end, label, "", pValue, trait, tax_id));
                        }
                    }
                }
            }
        }
        return results;
    }

    /**
     * Semantic Motif Search for list of genes
     *
     * @param accessions
     * @param regex      trait-related
     * @return OndexGraph containing the gene network
     */
    public ONDEXGraph getGenes(Integer[] ids, String regex) {
        log.debug("get genes function " + ids.length);
        AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");

        Set<ONDEXConcept> seed = new HashSet<ONDEXConcept>();

        for (int id : ids) {
            ONDEXConcept c = graph.getConcept(id);
            if (c.getAttribute(attTAXID) != null && taxID.contains(c.getAttribute(attTAXID).getValue().toString())) {
                seed.add(c);
            }
        }
        log.debug("Now we will call findSemanticMotifs!");
        ONDEXGraph subGraph = findSemanticMotifs(seed, regex);
        return subGraph;
    }

    /**
     * Searches for ONDEXConcepts with the given accessions in the OndexGraph.
     *
     * @param List<String> accessions
     * @return Set<ONDEXConcept>
     */
    public Set<ONDEXConcept> searchGenes(List<String> accessions) {

        if (accessions.size() > 0) {
            AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");
            ConceptClass ccGene = graph.getMetaData().getConceptClass("Gene");
            Set<ONDEXConcept> seed = graph.getConceptsOfConceptClass(ccGene);
            Set<ONDEXConcept> hits = new HashSet<ONDEXConcept>();

            // create one regex string for efficient search
            String query = "";
            for (String acc : accessions) {
                query += acc + "|";
            }
            query = query.substring(0, query.length() - 1);
            for (ONDEXConcept gene : seed) {
                if (gene.getAttribute(attTAXID) != null
                        && taxID.contains(gene.getAttribute(attTAXID).getValue().toString())) {

                    // search gene accessions, names, attributes
                    if (OndexSearch.find(gene, query)) {
                        hits.add(gene);
                    }
                }
            }
            return hits;
        } else {
            return null;
        }
    }

    /**
     * Searches genes related to an evidence, finds semantic motifs and shows the
     * path between them
     *
     * @param evidenceOndexId
     * @return subGraph
     */
    public ONDEXGraph evidencePath(Integer evidenceOndexId, Set<ONDEXConcept> genes) {
        log.info("Method evidencePath - evidenceOndexId: " + evidenceOndexId.toString());
        // Searches genes related to the evidenceID. If user genes provided, only include those.
        Set<ONDEXConcept> relatedONDEXConcepts = new HashSet<ONDEXConcept>();
        for (Integer rg : mapConcept2Genes.get(evidenceOndexId)) {
            ONDEXConcept gene = graph.getConcept(rg);
            if (genes==null || genes.isEmpty() || genes.contains(gene)) {
                relatedONDEXConcepts.add(gene);
            }
        }

        // the results give us a map of every starting concept to every valid
        // path
        Map<ONDEXConcept, List<EvidencePathNode>> results = gt.traverseGraph(graph, relatedONDEXConcepts, null);

        // create new graph to return
        ONDEXGraph subGraph = new MemoryONDEXGraph("evidencePathGraph");
        ONDEXGraphCloner graphCloner = new ONDEXGraphCloner(graph, subGraph);
        ONDEXGraphRegistry.graphs.put(subGraph.getSID(), subGraph);
        // Highlights the right path and hides the path that doesn't leads to
        // the evidence
        for (List<EvidencePathNode> paths : results.values()) {
            for (EvidencePathNode path : paths) {
                // search last concept of semantic motif for keyword
                int indexLastCon = path.getConceptsInPositionOrder().size() - 1;
                ONDEXConcept lastCon = (ONDEXConcept) path.getConceptsInPositionOrder().get(indexLastCon);
                if (lastCon.getId() == evidenceOndexId) {
                    highlightPath(path, graphCloner);
                } else {
                    //hidePath(path,graphCloner);
                }
            }
        }
        ONDEXGraphRegistry.graphs.remove(subGraph.getSID());

        return subGraph;
    }

    /**
     * Tests if there is a match of this query within the search string
     *
     * @param p      the pattern (if null then literal match .contains is used)
     * @param query  the query to match
     * @param target the target to match to
     * @return is there a match
     */
    private boolean isMatching(Pattern p, String target) {
        return p.matcher(target).find(0);
    }

    /**
     * Converts a keyword into a list of words
     *
     * @param keyword
     * @return null or the list of words
     */
    private Set<String> parseKeywordIntoSetOfWords(String keyword) {
        Set<String> result = new HashSet<String>();
        String key = keyword.replace("(", " ");
        key = key.replace(")", " ");
        key = key.replace("AND", " ");
        key = key.replace("OR", " ");
        key = key.replace("NOT", " ");
        key = key.replaceAll("\\s+", " ").trim();
        String builtK = "";
        for (String k : key.split(" ")) {
            if (k.startsWith("\"")) {
                if (k.endsWith("\"")) {
                    result.add(k.substring(1, k.length() - 2));
                } else {
                    builtK = k.substring(1);
                }
            } else if (k.endsWith("\"")) {
                builtK += " " + k.substring(0, k.length() - 1);
                result.add(builtK);
                builtK = "";
            } else {
                if (builtK != "") {
                    builtK += " " + k;
                } else {
                    result.add(k);
                }
            }
//				System.out.println("subkeyworkd: "+k);
        }
        if (builtK != "") {
            result.add(builtK);
        }
        log.info("keys: " + result);
        return result;
    }

    /**
     * Searches different fields of a concept for a query or pattern
     * and highlights them
     *
     * @param concept
     * @param p
     * @param search
     * @return true if one of the concept fields contains the query
     */
    private boolean highlight(ONDEXConcept concept, Map<String, String> keywordColourMap) {
//			System.out.println("Original keyword: "+regex);
        boolean found = false;

        // Order the keywords by length to prevent interference by shorter matches that are substrings of longer ones.
        String[] orderedKeywords = keywordColourMap.keySet().toArray(new String[0]);
        Arrays.sort(orderedKeywords, new Comparator<String>() {
            public int compare(String o1, String o2) {
                if (o1.length() == o2.length()) {
                    return o1.compareTo(o2); // Same length? Compare alphabetically
                } else {
                    return o1.length() - o2.length(); // Otherwise put the shorter one first
                }
            }
        });

        // First pass: wrap matches in ____. Prevents substring interference
        String marker = "____";
        for (String key : orderedKeywords) {
            Pattern p = Pattern.compile(key, Pattern.CASE_INSENSITIVE);
            String highlighter = marker + key + marker;

            //Searchs in annotations
            String anno = concept.getAnnotation();
            if (this.isMatching(p, anno)) {
                found = true;
                // search and replace all matching expressions
                String newAnno = p.matcher(anno).replaceAll(highlighter);
                concept.setAnnotation(newAnno);
            }

            //Searchs in descriptions
            String desc = concept.getDescription();
            if (this.isMatching(p, desc)) {
                found = true;
                // search and replace all matching expressions
                String newDesc = p.matcher(desc).replaceAll(highlighter);
                concept.setDescription(newDesc);
            }

            // search in concept names
            HashMap<String, Boolean> namesToCreate = new HashMap<String, Boolean>();
            for (ConceptName cno : concept.getConceptNames()) {
                String cn = cno.getName();
                if (this.isMatching(p, cn)) {
                    found = true;
                    //Saves the conceptNames we want to update
                    namesToCreate.put(cn, cno.isPreferred());
                }
            }
            //For each conceptName of the update list deletes and creates a new conceptName
            for (String ntc : namesToCreate.keySet()) {
                if (!ntc.contains("</span>")) {
                    String newName = p.matcher(ntc).replaceAll(highlighter);
                    boolean isPref = namesToCreate.get(ntc);
                    concept.deleteConceptName(ntc);
                    concept.createConceptName(newName, isPref);
                }
            }

            // search in concept attributes
            for (Attribute attribute : concept.getAttributes()) {
                if (!(attribute.getOfType().getId().equals("AA")) ||
                        !(attribute.getOfType().getId().equals("NA")) ||
                        !(attribute.getOfType().getId().startsWith("AA_")) ||
                        !(attribute.getOfType().getId().startsWith("NA_"))) {
                    String value = attribute.getValue().toString();
                    if (this.isMatching(p, value)) {
                        found = true;
                        // search and replace all matching expressions
                        Matcher m = p.matcher(value);
                        String newAttStr = m.replaceAll(highlighter);
                        attribute.setValue(newAttStr);
                    }

                }
            }
        }

        // Second pass: perform substitution
        for (String key : orderedKeywords) {
            Pattern p = Pattern.compile(marker + key + marker, Pattern.CASE_INSENSITIVE);
            String highlighter = "<span style=\"background-color:" + keywordColourMap.get(key) + "\"><b>" + key + "</b></span>";

            //Searchs in annotations
            String anno = concept.getAnnotation();
            if (this.isMatching(p, anno)) {
                // search and replace all matching expressions
                String newAnno = p.matcher(anno).replaceAll(highlighter);
                concept.setAnnotation(newAnno);
            }

            //Searchs in descriptions
            String desc = concept.getDescription();
            if (this.isMatching(p, desc)) {
                // search and replace all matching expressions
                String newDesc = p.matcher(desc).replaceAll(highlighter);
                concept.setDescription(newDesc);
            }

            // search in concept names
            HashMap<String, Boolean> namesToCreate = new HashMap<String, Boolean>();
            for (ConceptName cno : concept.getConceptNames()) {
                String cn = cno.getName();
                if (this.isMatching(p, cn)) {
                    //Saves the conceptNames we want to update
                    namesToCreate.put(cn, cno.isPreferred());
                }
            }
            //For each conceptName of the update list deletes and creates a new conceptName
            for (String ntc : namesToCreate.keySet()) {
                if (!ntc.contains("</span>")) {
                    String newName = p.matcher(ntc).replaceAll(highlighter);
                    boolean isPref = namesToCreate.get(ntc);
                    concept.deleteConceptName(ntc);
                    concept.createConceptName(newName, isPref);
                }
            }

            // search in concept attributes
            for (Attribute attribute : concept.getAttributes()) {
                if (!(attribute.getOfType().getId().equals("AA")) ||
                        !(attribute.getOfType().getId().equals("NA")) ||
                        !(attribute.getOfType().getId().startsWith("AA_")) ||
                        !(attribute.getOfType().getId().startsWith("NA_"))) {
                    String value = attribute.getValue().toString();
                    if (this.isMatching(p, value)) {
                        // search and replace all matching expressions
                        Matcher m = p.matcher(value);
                        String newAttStr = m.replaceAll(highlighter);
                        attribute.setValue(newAttStr);
                    }

                }
            }
        }

        return found;
    }

    /**
     * Searches with Lucene for documents, finds semantic motifs and by crossing
     * this data makes concepts visible, changes the size and highlight the hits
     *
     * @param seed    List of selected genes
     * @param keyword
     * @return subGraph
     */
    public ONDEXGraph findSemanticMotifs(Set<ONDEXConcept> seed, String keyword) {
        log.debug("Method findSemanticMotifs - keyword: " + keyword);
        // Searches with Lucene: luceneResults
        HashMap<ONDEXConcept, Float> luceneResults = null;
        try {
            luceneResults = searchLucene(keyword, seed, false);
        } catch (Exception e) {
            log.error("Lucene search failed", e);
        }
        
        // the results give us a map of every starting concept to every valid path
        Map<ONDEXConcept, List<EvidencePathNode>> results = gt.traverseGraph(graph, seed, null);

        Set<ONDEXConcept> keywordConcepts = new HashSet<ONDEXConcept>();
        Set<ONDEXConcept> candidateGenes = new HashSet<ONDEXConcept>();

        log.info("Keyword is: " + keyword);
        Set<String> keywords = "".equals(keyword) ? Collections.EMPTY_SET : this.parseKeywordIntoSetOfWords(keyword);
        Map<String, String> keywordColourMap = new HashMap<String, String>();
        Random random = new Random();
        for (String key : keywords) {
            int colourCode = random.nextInt(0x666666 + 1) + 0x999999;  // lighter colours only
            // format it as hexadecimal string (with hashtag and leading zeros)
            keywordColourMap.put(key, String.format("#%06x", colourCode));
        }

        // create new graph to return
        ONDEXGraph subGraph = new MemoryONDEXGraph("SemanticMotifGraph");
        ONDEXGraphCloner graphCloner = new ONDEXGraphCloner(graph, subGraph);

        ONDEXGraphRegistry.graphs.put(subGraph.getSID(), subGraph);

        int numVisiblePublication = 0;

        for (List<EvidencePathNode> paths : results.values()) {
            for (EvidencePathNode path : paths) {

                // add all semantic motifs to the new graph
                Set<ONDEXConcept> concepts = path.getAllConcepts();
                Set<ONDEXRelation> relations = path.getAllRelations();
                for (ONDEXConcept c : concepts) {
                    graphCloner.cloneConcept(c);
                }
                for (ONDEXRelation r : relations) {
                    graphCloner.cloneRelation(r);
                }

                // search last concept of semantic motif for keyword
                int indexLastCon = path.getConceptsInPositionOrder().size() - 1;
                ONDEXConcept gene = (ONDEXConcept) path.getStartingEntity();

                ONDEXConcept keywordCon = (ONDEXConcept) path.getConceptsInPositionOrder().get(indexLastCon);

                if (luceneResults.containsKey(keywordCon)) {

                    ONDEXConcept cloneCon = graphCloner.cloneConcept(keywordCon);

                    // highlight the keyword in any concept attribute values
                    if (!keywordConcepts.contains(cloneCon)) {
                        this.highlight(cloneCon, keywordColourMap);
                        keywordConcepts.add(cloneCon);

                        if (keywordCon.getOfType().getId().equalsIgnoreCase("Publication")) {
                            numVisiblePublication++;
                        }
                    }

                    // Hides the whole path from gene to publication if more than X publications
                    // exist in the subgraph
                    // the visible network is otherwise too large
                    // TODO: Instead of choosing X arbitrary publications, show the most specific or
                    // latest publications
                    if (keywordCon.getOfType().getId().equalsIgnoreCase("Publication") && numVisiblePublication > 20) {
                        continue;
                    }

                    // annotate the semantic motif in the new Ondex graph
                    highlightPath(path, graphCloner);
                }

                ONDEXConcept cloneCon = graphCloner.cloneConcept(gene);
                candidateGenes.add(cloneCon);

            }
        }

        if (keywordConcepts.isEmpty()) {
            Set<ONDEXConcept> cons = subGraph.getConcepts();
            Set<ONDEXRelation> rels = subGraph.getRelations();

            ONDEXGraphMetaData md = subGraph.getMetaData();
            AttributeName attFlagged = md.getAttributeName("flagged");
            AttributeName attVisible = md.getAttributeName("visible");
            AttributeName attSize = md.getAttributeName("size");

            if (attSize == null)
                attSize = md.getFactory().createAttributeName("size", Integer.class);
            if (attVisible == null)
                attVisible = md.getFactory().createAttributeName("visible", Boolean.class);
            if (attFlagged == null)
                attFlagged = md.getFactory().createAttributeName("flagged", Boolean.class);

            for (ONDEXConcept gene : candidateGenes) {
                gene.createAttribute(attFlagged, true, false);
                gene.createAttribute(attVisible, true, false);
                gene.createAttribute(attSize, new Integer(70), false);
            }

            for (ONDEXConcept c : cons) {

                if (c.getOfType().getId().equalsIgnoreCase("Publication")
                        || c.getOfType().getId().equalsIgnoreCase("CelComp")) {
                    c.createAttribute(attVisible, false, false);
                } else if (c.getOfType().getId().equalsIgnoreCase("BioProc")) {
                    c.createAttribute(attSize, new Integer(60), false);
                    c.createAttribute(attVisible, true, false);
                } else {
                    if (c.getAttribute(attSize) == null && c.getAttribute(attVisible) == null) {
                        c.createAttribute(attSize, new Integer(30), false);
                        c.createAttribute(attVisible, true, false);
                    }
                }
            }

            for (ONDEXRelation r : rels) {
                r.createAttribute(attVisible, true, false);
                r.createAttribute(attSize, new Integer(3), false);
            }

        }

        ONDEXGraphRegistry.graphs.remove(subGraph.getSID());

        log.debug("Number of seed genes: " + seed.size());
        // System.out.println("Keyword(s) were found in " +
        // keywordConcepts.size()
        // + " concepts.");
        log.debug("Number of candidate genes " + candidateGenes.size());

        if (export_visible_network) {

            ONDEXGraphMetaData md = subGraph.getMetaData();
            AttributeName attSize = md.getAttributeName("size");
            Set<ONDEXConcept> itc = subGraph.getConceptsOfAttributeName(attSize);
            Set<ONDEXRelation> itr = subGraph.getRelationsOfAttributeName(attSize);

            ONDEXGraph filteredGraph = new MemoryONDEXGraph("FilteredSubGraph");
            ONDEXGraphCloner graphCloner2 = new ONDEXGraphCloner(subGraph, filteredGraph);

            ONDEXGraphRegistry.graphs.put(filteredGraph.getSID(), filteredGraph);

            for (ONDEXConcept c : itc) {
                graphCloner2.cloneConcept(c);
            }
            for (ONDEXRelation r : itr) {
                graphCloner2.cloneRelation(r);
            }

            ONDEXGraphRegistry.graphs.remove(filteredGraph.getSID());

            subGraph = filteredGraph;

        }

        return subGraph;

    }

    /**
     * Annotate first and last concept and relations of a given path Do annotations
     * on a new graph and not on the original graph
     *
     * @param path        Contains concepts and relations of a semantic motif
     * @param graphCloner cloner for the new graph
     */
    public void highlightPath(EvidencePathNode path, ONDEXGraphCloner graphCloner) {

        Font fontHighlight = new Font("sansserif", Font.BOLD, 20);
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        XMLEncoder encoder = new XMLEncoder(bos);
        encoder.writeObject(fontHighlight);
        encoder.close();

        ONDEXGraphMetaData md = graphCloner.getNewGraph().getMetaData();

        AttributeName attSize = md.getAttributeName("size");
        if (attSize == null)
            attSize = md.getFactory().createAttributeName("size", Integer.class);

        AttributeName attVisible = md.getAttributeName("visible");
        if (attVisible == null)
            attVisible = md.getFactory().createAttributeName("visible", Boolean.class);

        AttributeName attFlagged = md.getAttributeName("flagged");
        if (attFlagged == null)
            attFlagged = md.getFactory().createAttributeName("flagged", Boolean.class);

        RelationType rt = md.getFactory().createRelationType("is_p");
        EvidenceType et = md.getFactory().createEvidenceType("QTLNetMiner");

        // search last concept of semantic motif for keyword
        int indexLastCon = path.getConceptsInPositionOrder().size() - 1;

        ONDEXConcept gene = null;
        ONDEXConcept con = null;

        if (((ONDEXConcept) path.getStartingEntity()).getOfType().getId().equals("Gene")) {
            // first element is gene and last element the keyword concept
            gene = (ONDEXConcept) path.getStartingEntity();
            con = (ONDEXConcept) path.getConceptsInPositionOrder().get(indexLastCon);
        }

        // else {
        // // last element must be the gene
        // con = (ONDEXConcept) path.getStartingEntity();
        // gene = (ONDEXConcept)
        // path.getConceptsInPositionOrder().get(indexLastCon);
        // }

        // annotate concept that contains keyword
        ONDEXConcept c = graphCloner.cloneConcept(con);
        if (c.getAttribute(attSize) == null) {
            // initial size
            c.createAttribute(attSize, new Integer(70), false);
            c.createAttribute(attVisible, true, false);
        } else {
            // keyword part of another path to same gene or different gene

        }

        // annotate gene concept
        ONDEXConcept g = graphCloner.cloneConcept(gene);
        if (g.getAttribute(attSize) == null) {

            // initial size
            g.createAttribute(attSize, new Integer(70), false);
            g.createAttribute(attVisible, true, false);
            g.createAttribute(attFlagged, true, false);
        } else {
            // Integer size = (Integer) g.getAttribute(attSize).getValue();
            // size++;
            // g.getAttribute(attSize).setValue(size);
        }

        // add gene-QTL-Trait relations to the network
        if (mapGene2QTL.containsKey(gene.getId())) {
            Set<Integer> qtlSet = mapGene2QTL.get(gene.getId());
            for (Integer qtlId : qtlSet) {
                ONDEXConcept qtl = graphCloner.cloneConcept(graph.getConcept(qtlId));
                if (graphCloner.getNewGraph().getRelation(g, qtl, rt) == null) {
                    ONDEXRelation r = graphCloner.getNewGraph().getFactory().createRelation(g, qtl, rt, et);
                    r.createAttribute(attSize, new Integer(2), false);
                    r.createAttribute(attVisible, true, false);
                }
                if (qtl.getAttribute(attSize) == null) {
                    qtl.createAttribute(attSize, new Integer(70), false);
                    qtl.createAttribute(attVisible, true, false);
                }
                Set<ONDEXRelation> relSet = graph.getRelationsOfConcept(graph.getConcept(qtlId));
                for (ONDEXRelation r : relSet) {
                    if (r.getOfType().getId().equals("control")) {
                        ONDEXRelation rel = graphCloner.cloneRelation(r);
                        if (rel.getAttribute(attSize) == null) {
                            rel.createAttribute(attSize, new Integer(2), false);
                            rel.createAttribute(attVisible, true, false);
                        }
                        ONDEXConcept tC = r.getToConcept();
                        ONDEXConcept traitCon = graphCloner.cloneConcept(tC);
                        if (traitCon.getAttribute(attSize) == null) {
                            traitCon.createAttribute(attSize, new Integer(70), false);
                            traitCon.createAttribute(attVisible, true, false);
                        }
                    }

                }
            }
        }

        // annotate path connecting gene to keyword concept
        Set<ONDEXRelation> rels = path.getAllRelations();
        for (ONDEXRelation rel : rels) {
            ONDEXRelation r = graphCloner.cloneRelation(rel);
            if (r.getAttribute(attSize) == null) {
                // initial size
                r.createAttribute(attSize, new Integer(5), false);
                r.createAttribute(attVisible, true, false);
            } else {
                // increase size for more supporting evidence
                // Integer size = (Integer) r.getAttribute(attSize).getValue();
                // size++;
                // r.getAttribute(attSize).setValue(size);
            }
        }

        // set concepts in path to visible
        Set<ONDEXConcept> cons = path.getAllConcepts();
        for (ONDEXConcept pconcept : cons) {
            ONDEXConcept concept = graphCloner.cloneConcept(pconcept);
            if (concept.getAttribute(attSize) == null) {
                concept.createAttribute(attSize, new Integer(30), false);
                concept.createAttribute(attVisible, true, false);
            } else {
                // contains already visual information
                // (e.g. gene, keyword or part of other paths)
            }
        }
    }

    /**
     * hides the path between a gene and a concept
     *
     * @param path        Contains concepts and relations of a semantic motif
     * @param graphCloner cloner for the new graph
     */
    public void hidePath(EvidencePathNode path, ONDEXGraphCloner graphCloner) {
        ONDEXGraphMetaData md = graphCloner.getNewGraph().getMetaData();
        AttributeName attVisible = md.getAttributeName("visible");
        if (attVisible == null)
            attVisible = md.getFactory().createAttributeName("visible", Boolean.class);

        // hide every concept except by the last one
        int indexLastCon = path.getConceptsInPositionOrder().size() - 1;
        ONDEXConcept lastCon = (ONDEXConcept) path.getConceptsInPositionOrder().get(indexLastCon);
        Set<ONDEXConcept> cons = path.getAllConcepts();
        for (ONDEXConcept pconcept : cons) {
            if (pconcept.getId() == lastCon.getId()) {
                ONDEXConcept concept = graphCloner.cloneConcept(pconcept);
                concept.createAttribute(attVisible, false, false);
            }
        }
    }

    /**
     * Write Genomaps XML file
     *
     * @param api_url    ws url for API
     * @param genes      list of genes to be displayed (all genes for search result)
     * @param userGenes  gene list from user
     * @param userQtlStr user QTLs
     * @param keyword    user-specified keyword
     * @param maxGenes
     * @param hits       search Hits
     * @param listMode
     * @return
     */
    public String writeAnnotationXML(String api_url, ArrayList<ONDEXConcept> genes, Set<ONDEXConcept> userGenes, List<String> userQtlStr,
                                     String keyword, int maxGenes, Hits hits, String listMode) {
        List<QTL> userQtl = new ArrayList<QTL>();
        for (String qtlStr : userQtlStr) {
            userQtl.add(QTL.fromString(qtlStr));
        }

        log.info("Genomaps: generate XML...");
        // If user provided a gene list, use that instead of the all Genes (04/07/2018, singha)
                /*if(userGenes != null) {
                   // use this (Set<ONDEXConcept> userGenes) in place of the genes ArrayList<ONDEXConcept> genes.
                   genes= new ArrayList<ONDEXConcept> (userGenes);
                   log.info("Genomaps: Using user-provided gene list... genes: "+ genes.size());
                  }*/
        // added user gene list restriction above (04/07/2018, singha)

        ONDEXGraphMetaData md = graph.getMetaData();
        AttributeName attChr = md.getAttributeName("Chromosome");
        // AttributeName attLoc = md.getAttributeName("Location"); // for String
        // chromomes (e.g, in Wheat)
        AttributeName attBeg = md.getAttributeName("BEGIN");
        AttributeName attEnd = md.getAttributeName("END");
        AttributeName attCM = md.getAttributeName("cM");
        ConceptClass ccQTL = md.getConceptClass("QTL");
        Set<QTL> qtlDB = new HashSet<QTL>();
        if (ccQTL != null) {
            // qtlDB = graph.getConceptsOfConceptClass(ccQTL);
            try {
                qtlDB = findQTL(keyword);
            } catch (ParseException e) {
                log.error("Failed to find QTLs", e);
            }
        }

        StringBuffer sb = new StringBuffer();
        sb.append("<?xml version=\"1.0\" standalone=\"yes\"?>\n");
        sb.append("<genome>\n");
        int id = 0;

        // genes are grouped in three portions based on size
        int size = genes.size();
        if (genes.size() > maxGenes)
            size = maxGenes;

        log.info("visualize genes: " + genes.size());
        for (ONDEXConcept c : genes) {

            // only genes that are on chromosomes (not scaffolds)
            // can be displayed in Map View
            if (c.getAttribute(attChr) == null || c.getAttribute(attChr).getValue().toString().equals("U"))
                continue;

            String chr = c.getAttribute(attChr).getValue().toString();
            // TEMPORARY FIX, to be disabled for new .oxl species networks that have string
            // 'Chromosome' (instead of the older integer Chromosome) & don't have a string
            // 'Location' attribute.
            /*
             * To handle String chromosome names (e.eg, in Wheat where client-side Gene View
             * uses location '1A', etc. instead of chrosome '1', etc.
             */
            /*
             * if(c.getAttribute(attLoc).getValue().toString() != null) { chr=
             * c.getAttribute(attLoc).getValue().toString(); }
             */

            int end = 0;
            c.getAttribute(attEnd).getValue();

            int beg = 0;
            double begCM = -1.00;
            int begBP = 0;

            if (attCM != null && c.getAttribute(attCM) != null) {
                begCM = (Double) c.getAttribute(attCM).getValue();
            }

            if (attBeg != null && c.getAttribute(attBeg) != null) {
                begBP = (Integer) c.getAttribute(attBeg).getValue();
            }

            if (attEnd != null && c.getAttribute(attEnd) != null) {
                end = (Integer) c.getAttribute(attEnd).getValue();
            }

            // TODO this can be a parameter CM/BP in future
            if (attCM != null) {

                // ignore genes that don't have cM attributes and mode is CM
                if (begCM == -1.00) {
                    continue;
                }
                beg = (int) (begCM * 1000000);
                end = (int) (begCM * 1000000);
            } else {
                beg = begBP;
            }

            String name = c.getPID();

            for (ConceptAccession acc : c.getConceptAccessions()) {
                // if (acc.getElementOf().getId().equalsIgnoreCase("TAIR")
                // && accValue.startsWith("AT")
                // && (accValue.indexOf(".") == -1)) {
                name = acc.getAccession();
                // }
            }

            String label = getDefaultNameForGroupOfConcepts(c);
            //log.info("id, chr, start, end, label, type: "+ id +", "+ chr +", "+ beg +", "+ end +", "+ label + ", gene");

            // String query = "mode=network&keyword=" + keyword+"&list="+name;
            // Replace '&' with '&amp;' to make it comptaible with the new
            // d3.js-based Map View.
            String query;
            try {
                query = "keyword=" + URLEncoder.encode(keyword, "UTF-8") + "&amp;list=" + URLEncoder.encode(name, "UTF-8");
            } catch (UnsupportedEncodingException e) {
                log.error(e);
                throw new Error(e);
            }
            String uri = api_url + "/network?" + query; // KnetMaps (network) query
            //log.info("Genomaps: add KnetMaps (network) query: "+ uri);

            // Genes
            sb.append("<feature id=\"" + id + "\">\n");
            sb.append("<chromosome>" + chr + "</chromosome>\n");
            sb.append("<start>" + beg + "</start>\n");
            sb.append("<end>" + end + "</end>\n");
            sb.append("<type>gene</type>\n");
            if (id <= size / 3) {
                sb.append("<color>0x00FF00</color>\n"); // Green
            } else if (id > size / 3 && id <= 2 * size / 3) {
                sb.append("<color>0xFFA500</color>\n"); // Orange
            } else {
                sb.append("<color>0xFF0000</color>\n"); // Red
            }
            sb.append("<label>" + label + "</label>\n");
            sb.append("<link>" + uri + "</link>\n");
            // Add 'score' tag as well.
            Double score = 0.0;
            if (scoredCandidates != null) {
                if (scoredCandidates.get(c) != null) {
                    score = scoredCandidates.get(c); // fetch score
                }
            }
            sb.append("<score>" + score + "</score>\n"); // score
            //log.info("score: "+ score);
            sb.append("</feature>\n");

            if (id++ > maxGenes)
                break;

        }

        // if (usersRelatedGenes != null && usersRelatedGenes.size() > 0) {
        // for (ONDEXConcept u : usersRelatedGenes) {
        // // only genes that are on chromosomes (not scaffolds)
        // // can be displayed in GViewer
        // if (u.getAttribute(attChr) == null)
        // continue;
        //
        // String name = u.getPID();
        //
        // for (ConceptAccession acc : u.getConceptAccessions()) {
        // String accValue = acc.getAccession();
        // //if (acc.getElementOf().getId().equalsIgnoreCase("TAIR")
        // // && accValue.startsWith("AT")
        // // && (accValue.indexOf(".") == -1)) {
        // name = acc.getAccession();
        // //}
        // }
        //
        // String chr = u.getAttribute(attChr).getValue().toString();
        // String chrLatin = chromBidiMap.get(Integer.valueOf(chr));
        // String beg = u.getAttribute(attBeg).getValue().toString();
        // String end = u.getAttribute(attEnd).getValue().toString();
        //
        // String query = "mode=network&keyword=" + keyword+"&list="+name;
        // String uri = "OndexServlet?" + query;
        //
        // // Genes
        // sb.append("<feature id=\"" + id + "\">\n");
        // sb.append("<chromosome>" + chrLatin + "</chromosome>\n");
        // sb.append("<start>" + beg + "</start>\n");
        // sb.append("<end>" + end + "</end>\n");
        // sb.append("<type>gene</type>\n");
        // sb.append("<color>0x0000ff</color>\n"); // COLOR
        // sb.append("<label>" + name + "</label>\n");
        // sb.append("<link>" + uri + "</link>\n");
        // sb.append("</feature>\n");
        // }
        // }
        //
        // if (!listMode.equals("GLrestrict") && usersUnrelatedGenes != null &&
        // usersUnrelatedGenes.size() > 0) {
        // for (ONDEXConcept u : usersUnrelatedGenes) {
        // // only genes that are on chromosomes (not scaffolds)
        // // can be displayed in GViewer
        // if (u.getAttribute(attChr) == null)
        // continue;
        //
        // String name = u.getPID();
        //
        // for (ConceptAccession acc : u.getConceptAccessions()) {
        // String accValue = acc.getAccession();
        // if (acc.getElementOf().getId().equalsIgnoreCase("TAIR")
        // && accValue.startsWith("AT")
        // && (accValue.indexOf(".") == -1)) {
        // name = acc.getAccession();
        // }
        // }
        //
        // String chr = u.getAttribute(attChr).getValue().toString();
        // String chrLatin = chromBidiMap.get(Integer.valueOf(chr));
        // String beg = u.getAttribute(attBeg).getValue().toString();
        // String end = u.getAttribute(attEnd).getValue().toString();
        //
        // String query = "mode=network&keyword=" + keyword+"&list="+name;
        // String uri = "OndexServlet?" + query;
        //
        // // Genes
        // sb.append("<feature id=\"" + id + "\">\n");
        // sb.append("<chromosome>" + chrLatin + "</chromosome>\n");
        // sb.append("<start>" + beg + "</start>\n");
        // sb.append("<end>" + end + "</end>\n");
        // sb.append("<type>gene</type>\n");
        // sb.append("<color>0xFFFFFF</color>\n"); // white
        // sb.append("<label>" + name + "</label>\n");
        // sb.append("<link>" + uri + "</link>\n");
        // sb.append("</feature>\n");
        // }
        // }

        // display user QTLs
        log.info("Display user QTLs... QTLs provided: " + userQtl.size());
        for (QTL region : userQtl) {
            String chr = region.getChromosome();
            int start = region.getStart();
            int end = region.getEnd();

            // TODO check of MODE is CM/BP
            if (attCM != null) {
                start = start * 1000000;
                end = end * 1000000;
            }
            String label = region.getLabel();

            if (label.length() == 0) {
                label = "QTL";
            }
            // String query = "mode=network&keyword=" +
            // keyword+"&qtl1="+chrLatin+":"+start+":"+end;
            // Replace '&' with '&amp;' to make it comptaible with the new
            // d3.js-based Map View.
            String query;
            try {
                query = "keyword=" + URLEncoder.encode(keyword, "UTF-8") + "&amp;qtl=" + URLEncoder.encode(chr, "UTF-8") + ":" + start + ":" + end;
            } catch (UnsupportedEncodingException e) {
                log.error(e);
                throw new Error(e);
            }
            String uri = api_url + "/network?" + query;

            sb.append("<feature>\n");
            sb.append("<chromosome>" + chr + "</chromosome>\n");
            sb.append("<start>" + start + "</start>\n");
            sb.append("<end>" + end + "</end>\n");
            sb.append("<type>qtl</type>\n");
            sb.append("<color>0xFF0000</color>\n"); // Orange
            sb.append("<label>" + label + "</label>\n");
            sb.append("<link>" + uri + "</link>\n");
            sb.append("</feature>\n");
            //log.info("add QTL: chr, start, end, label, type, uri: "+ chr +", "+ start +", "+ end +", "+ label + ", QTL, "+ uri);
        }
        // //find qtl in knowledgebase that match keywords
        // List<QTL> qtlDB = findQTL(keyword);
        //
        // some logic to limit QTL size if too many are found
        // System.out.println(qtlDB.size() + " QTLs are found.");
        // if(qtlDB.size() > 150){
        // System.out.println("Too many QTL found, remove not significant
        // ones...");
        // List<QTL> toRemove= new ArrayList<QTL>();
        // for(QTL q : qtlDB){
        // if(!q.getSignificance().equalsIgnoreCase("significant")){
        // toRemove.add(q);
        // }
        // }
        // qtlDB.removeAll(toRemove);
        // System.out.println(qtlDB.size() + " QTLs are significant.");
        // }

        String[] colorHex = {"0xFFB300", "0x803E75", "0xFF6800", "0xA6BDD7", "0xC10020", "0xCEA262", "0x817066",
                "0x0000FF", "0x00FF00", "0x00FFFF", "0xFF0000", "0xFF00FF", "0xFFFF00", "0xDBDB00", "0x00A854",
                "0xC20061", "0xFF7E3D", "0x008F8F", "0xFF00AA", "0xFFFFAA", "0xD4A8FF", "0xA8D4FF", "0xFFAAAA",
                "0xAA0000", "0xAA00FF", "0xAA00AA", "0xAAFF00", "0xAAFFFF", "0xAAFFAA", "0xAAAA00", "0xAAAAFF",
                "0xAAAAAA", "0x000055", "0x00FF55", "0x00AA55", "0x005500", "0x0055FF"};
        // 0xFFB300, # Vivid Yellow
        // 0x803E75, # Strong Purple
        // 0xFF6800, # Vivid Orange
        // 0xA6BDD7, # Very Light Blue
        // 0xC10020, # Vivid Red
        // 0xCEA262, # Grayish Yellow
        // 0x817066, # Medium Gray
        HashMap<String, String> trait2color = new HashMap<String, String>();
        int index = 0;

        log.info("Display QTLs and SNPs... QTLs found: " + qtlDB.size());
        log.info("TaxID(s): " + taxID);
        for (QTL loci : qtlDB) {

            String type = loci.getType().trim();
            String chrQTL = loci.getChromosome();
            Integer startQTL = loci.getStart();
            Integer endQTL = loci.getEnd();
            String label = loci.getLabel().replaceAll("\"", "");
            String trait = loci.getTrait();
            //    log.info("type= "+ type +", chrQTL: "+ chrQTL +", label: "+ label +" & loci.TaxID= "+ loci.getTaxID());

            if (!trait2color.containsKey(trait)) {
                trait2color.put(trait, colorHex[index]);
                index = index + 1;
                if (index == colorHex.length) {
                    index = 0;
                }
            }
            Float pvalue = loci.getpValue();
            String color = trait2color.get(trait);

            // TODO check of MODE is CM/BP
            if (attCM != null) {
                startQTL = startQTL * 1000000;
                endQTL = endQTL * 1000000;
            }

            // TODO get p-value of SNP-Trait relations
            if (type.equals("QTL")) {
                sb.append("<feature>\n");
                sb.append("<chromosome>" + chrQTL + "</chromosome>\n");
                sb.append("<start>" + startQTL + "</start>\n");
                sb.append("<end>" + endQTL + "</end>\n");
                sb.append("<type>qtl</type>\n");
                sb.append("<color>" + color + "</color>\n");
                sb.append("<trait>" + trait + "</trait>\n");
                sb.append("<link>http://archive.gramene.org/db/qtl/qtl_display?qtl_accession_id=" + label + "</link>\n");
                sb.append("<label>" + label + "</label>\n");
                sb.append("</feature>\n");
                //    log.info("add QTL: trait, label: "+ trait +", "+ label);
            } else if (type.equals("SNP")) {
                /* add check if species TaxID (list from client/utils-config.js) contains this SNP's TaxID. */
                if (taxID.contains(loci.getTaxID())) {
                    sb.append("<feature>\n");
                    sb.append("<chromosome>" + chrQTL + "</chromosome>\n");
                    sb.append("<start>" + startQTL + "</start>\n");
                    sb.append("<end>" + endQTL + "</end>\n");
                    sb.append("<type>snp</type>\n");
                    sb.append("<color>" + color + "</color>\n");
                    sb.append("<trait>" + trait + "</trait>\n");
                    sb.append("<pvalue>" + pvalue + "</pvalue>\n");
                    sb.append("<link>http://plants.ensembl.org/arabidopsis_thaliana/Variation/Summary?v=" + label
                            + "</link>\n");
                    sb.append("<label>" + label + "</label>\n");
                    sb.append("</feature>\n");
                    //    log.info("TaxID= "+ loci.getTaxID() +", add SNP: chr, trait, label, p-value: "+ chr +", "+ trait +", "+ label +", "+ pvalue);
                }
            }

        }

        sb.append("</genome>\n");
        //log.info("Genomaps generated...");
        return sb.toString();
    }

    // temporary...
    public void writeResultsFile(String filename, String sb_string) {
        try {
            BufferedWriter out = new BufferedWriter(new FileWriter(filename));
            out.write(sb_string);
            out.close();
        } catch (Exception ex) {
            log.debug(ex.getMessage());
        }
    }

    /**
     * This table contains all possible candidate genes for given query
     *
     * @param candidates
     * @param qtl
     * @param filename
     * @param listMode
     * @return
     */
    public String writeGeneTable(ArrayList<ONDEXConcept> candidates, Set<ONDEXConcept> userGenes, List<String> qtlsStr,
                                 String listMode) {
        List<QTL> qtls = new ArrayList<QTL>();
        for (String qtlStr : qtlsStr) {
            qtls.add(QTL.fromString(qtlStr));
        }

        log.info("generate Gene table...");
        Set<Integer> userGeneIds = new HashSet<Integer>();
		/*if (userGenes != null) {
			Set<Integer> candidateGeneIds = new HashSet<Integer>();

			// is conversion into integer sets needed because comparing the
			// ONDEXConcept objects is not working???
			for (ONDEXConcept c : candidates) {
				candidateGeneIds.add(c.getId());
			}

			for (ONDEXConcept c : userGenes) {
				userGeneIds.add(c.getId());
				if (!candidateGeneIds.contains(c.getId())) {
                                    log.info("add user gene: "+ c.getId() +" to candidates...");
					candidates.add(c);
				}
			}
		} else {
			log.info("No user gene list defined.");
		}*/
        if (userGenes != null) {
            for (ONDEXConcept c : userGenes) {
                userGeneIds.add(c.getId());
            }
        } else {
            log.info("No user gene list defined.");
        }

        if (qtls.isEmpty()) {
            log.info("No QTL regions defined.");
        }

        ONDEXGraphMetaData md = graph.getMetaData();
        AttributeName attChromosome = md.getAttributeName("Chromosome");
        AttributeName attTrait = md.getAttributeName("Trait");
        AttributeName attBegin = md.getAttributeName("BEGIN");
        AttributeName attCM = md.getAttributeName("cM");
        AttributeName attTAXID = md.getAttributeName("TAXID");
        // Removed ccSNP from Geneview table (12/09/2017)
        // AttributeName attSnpCons = md.getAttributeName("Transcript_Consequence");
        // ConceptClass ccSNP = md.getConceptClass("SNP");

        StringBuffer out = new StringBuffer();
        out.append(
                "ONDEX-ID\tACCESSION\tGENE NAME\tCHRO\tSTART\tTAXID\tSCORE\tUSER\tQTL\tEVIDENCE\tEVIDENCES_LINKED\tEVIDENCES_IDs\n");
        for (ONDEXConcept gene : candidates) {
            int id = gene.getId();
            String geneAcc = "";
            for (ConceptAccession acc : gene.getConceptAccessions()) {
                String accValue = acc.getAccession();
                geneAcc = accValue;
                if (acc.getElementOf().getId().equalsIgnoreCase("TAIR") && accValue.startsWith("AT")
                        && (accValue.indexOf(".") == -1)) {
                    geneAcc = accValue;
                    break;
                } else if (acc.getElementOf().getId().equalsIgnoreCase("PHYTOZOME")) {
                    geneAcc = accValue;
                    break;
                }
            }
            String chr = null;
            String loc = "";
            String beg = "NA";
            double begCM = 0.00;
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

            DecimalFormat fmt = new DecimalFormat("0.00");

            if (attCM != null)
                beg = fmt.format(begCM);
            else
                beg = Integer.toString(begBP);

            Double score = 0.0;
            if (scoredCandidates != null) {
                if (scoredCandidates.get(gene) != null) {
                    score = scoredCandidates.get(gene);
                }
            }

            // use shortest preferred concept name
            String geneName = getShortestPreferedName(gene.getConceptNames());

            String isInList = "no";
            if (userGenes != null && userGeneIds.contains(gene.getId())) {
                isInList = "yes";
            }

            String infoQTL = "";
            if (mapGene2QTL.containsKey(gene.getId())) {
                for (Integer cid : mapGene2QTL.get(gene.getId())) {
                    ONDEXConcept qtl = graph.getConcept(cid);

                    String acc = qtl.getConceptName().getName().replaceAll("\"", "");

                    String traitDesc = null;
                    if (attTrait != null && qtl.getAttribute(attTrait) != null)
                        traitDesc = qtl.getAttribute(attTrait).getValue().toString();
                    else
                        traitDesc = acc;

                    if (infoQTL == "")
                        infoQTL += traitDesc + "//" + traitDesc;
                    else
                        infoQTL += "||" + traitDesc + "//" + traitDesc;

                }

            }

            // if(!qtls.isEmpty()){
            // for(QTL loci : qtls) {
            // try{
            // Integer qtlChrom =
            // chromBidiMap.inverseBidiMap().get(loci.getChrName());
            // Long qtlStart = Long.parseLong(loci.getStart());
            // Long qtlEnd = Long.parseLong(loci.getEnd());
            //
            // if (cm != null) {
            // if(qtlChrom == chr && cm >= qtlStart && cm <= qtlEnd){
            // numQTL++;
            // }
            // }
            // else {
            // if(qtlChrom == chr && beg >= qtlStart && beg <= qtlEnd){
            // numQTL++;
            // }
            // }
            //
            // }
            // catch(Exception e){
            // System.out.println("An error occurred in method:
            // writeTableOut.");
            // System.out.println(e.getMessage());
            //
            // }
            // }
            // }
            //
            // String infoQTL = "";
            //
            if (!qtls.isEmpty()) {
                for (QTL loci : qtls) {
                    String qtlChrom = loci.getChromosome();
                    Integer qtlStart = loci.getStart();
                    Integer qtlEnd = loci.getEnd();

                    // FIXME re-factor chromosome string
                    if (qtlChrom.equals(loc) && begCM >= qtlStart && begCM <= qtlEnd) {
                        if (infoQTL == "")
                            infoQTL += loci.getLabel() + "//" + loci.getTrait();
                        else
                            infoQTL += "||" + loci.getLabel() + "//" + loci.getTrait();
                    }
                }
            }

            // get lucene hits per gene
            Set<Integer> luceneHits = mapGene2HitConcept.get(id);

            // organise by concept class
            HashMap<String, String> cc2name = new HashMap<String, String>();

            if (luceneHits == null) {
                luceneHits = new HashSet<Integer>();
            }

            Set<Integer> evidencesIDs = new HashSet<Integer>();
            for (int hitID : luceneHits) {
                ONDEXConcept c = graph.getConcept(hitID);
                evidencesIDs.add(c.getId()); // retain all evidences' ID's
                String ccId = c.getOfType().getId();
                String name = getDefaultNameForGroupOfConcepts(c);
                // All publications will have the format PMID:15487445
                if (ccId == "Publication" && !name.contains("PMID:"))
                    name = "PMID:" + name;

                if (!cc2name.containsKey(ccId)) {
                    cc2name.put(ccId, ccId + "//" + name);
                } else {
                    String act_name = cc2name.get(ccId);
                    act_name = act_name + "//" + name;
                    cc2name.put(ccId, act_name);
                }
            }
            int evidences_linked = luceneHits.size(); // no. of evidences linked per gene

            // Removed ccSNP from Geneview table (12/09/2017)
            /*
             * if (ccSNP != null) { Set<ONDEXRelation> rels =
             * graph.getRelationsOfConcept(gene); for (ONDEXRelation rel : rels) { if
             * (rel.getOfType().getId().equals("has_variation")) { ONDEXConcept snpConcept =
             * rel.getToConcept(); String ccId = "SNP"; String name =
             * getDefaultNameForGroupOfConcepts(snpConcept); if (attSnpCons != null &&
             * snpConcept.getAttribute(attSnpCons) != null) name =
             * snpConcept.getAttribute(attSnpCons).getValue().toString(); if
             * (!cc2name.containsKey(ccId)) { cc2name.put(ccId, ccId + "//" + name); } else
             * { String act_name = cc2name.get(ccId); act_name = act_name + "//" + name;
             * cc2name.put(ccId, act_name); } } }
             *
             * }
             */

            // create output string for evidences column in GeneView table
            String evidence = "";
            for (String ccId : cc2name.keySet()) {
                evidence += cc2name.get(ccId) + "||";
            }

            String geneTaxID = gene.getAttribute(attTAXID).getValue().toString();

            if (!evidence.equals(""))
                evidence = evidence.substring(0, evidence.length() - 2);

            if (luceneHits.isEmpty() && listMode.equals("GLrestrict")) {
                continue;
            }

            String all_evidences = "";
            for (int ev_id : evidencesIDs) {
                // comma-separated ID's for all evidences for a geneID
                all_evidences = all_evidences + String.valueOf(ev_id) + ",";
            }
            if (!all_evidences.equals("")) {
                all_evidences = all_evidences.substring(0, all_evidences.length() - 1);
                // log.info("GeneTable.tab: evidenceIDs: "+ all_evidences);
            }
            /*
             * out.write(id + "\t" + geneAcc + "\t" + geneName + "\t" + chr + "\t" + beg +
             * "\t" + geneTaxID + "\t" + fmt.format(score) + "\t" + isInList + "\t" +
             * infoQTL + "\t" + evidence + "\n");
             */
            if (!"".equals(evidence) || qtls.isEmpty()) {
                if (userGenes != null) {
                    // if GeneList was provided by the user, display only those genes.
                    if (isInList.equals("yes")) {
                        out.append(id + "\t" + geneAcc + "\t" + geneName + "\t" + chr + "\t" + beg + "\t" + geneTaxID + "\t"
                                + fmt.format(score) + "\t" + isInList + "\t" + infoQTL + "\t" + evidence + "\t"
                                + evidences_linked + "\t" + all_evidences + "\n");
                    }
                } else { // default
                    out.append(id + "\t" + geneAcc + "\t" + geneName + "\t" + chr + "\t" + beg + "\t" + geneTaxID + "\t"
                            + fmt.format(score) + "\t" + isInList + "\t" + infoQTL + "\t" + evidence + "\t"
                            + evidences_linked + "\t" + all_evidences + "\n");
                }
            }
        }
        //log.info("Gene table generated...");
        return out.toString();
    }

    /**
     * Write Evidence Table for Evidence View file
     *
     * @param luceneConcepts
     * @param userGenes
     * @param qtl
     * @param filename
     * @return boolean
     */

    public String writeEvidenceTable(String keywords, HashMap<ONDEXConcept, Float> luceneConcepts, Set<ONDEXConcept> userGenes,
                                     List<String> qtlsStr) {

        ONDEXGraphMetaData md = graph.getMetaData();
        AttributeName attChr = md.getAttributeName("Chromosome");
        AttributeName attBeg = md.getAttributeName("BEGIN");
        AttributeName attCM = md.getAttributeName("cM");
        int allGenesSize = mapGene2Concepts.keySet().size();
        int userGenesSize = userGenes == null ? 0 : userGenes.size();
        FisherExact fisherExact = userGenesSize > 0 ? new FisherExact(allGenesSize) : null;

        log.info("generate Evidence table...");
        List<QTL> qtls = new ArrayList<QTL>();
        for (String qtlStr : qtlsStr) {
            qtls.add(QTL.fromString(qtlStr));
        }

        StringBuffer out = new StringBuffer();
        // writes the header of the table
        out.append("TYPE\tNAME\tSCORE\tP-VALUE\tGENES\tUSER GENES\tQTLS\tONDEXID\n");

        DecimalFormat sfmt = new DecimalFormat("0.00");
        DecimalFormat pfmt = new DecimalFormat("0.00000");

        for (ONDEXConcept lc : luceneConcepts.keySet()) {
            // Creates type,name,score and numberOfGenes
            String type = lc.getOfType().getId();
            String name = getDefaultNameForGroupOfConcepts(lc);
            // All publications will have the format PMID:15487445
            //if (type == "Publication" && !name.contains("PMID:"))
            //    name = "PMID:" + name;
            // Do not print publications or proteins in evidence view
            if (type == "Publication" || type == "Protein") {
                continue;
            }
            Float score = luceneConcepts.get(lc);
            Integer ondexId = lc.getId();
            if (!mapConcept2Genes.containsKey(lc.getId())) {
                continue;
            }
            Set<Integer> listOfGenes = mapConcept2Genes.get(lc.getId());
            Integer numberOfGenes = listOfGenes.size();
            // Creates numberOfUserGenes and numberOfQTL
            //Integer numberOfUserGenes = 0;
            String user_genes = "";
            Integer numberOfQTL = 0;

            for (int log : listOfGenes) {

                ONDEXConcept gene = graph.getConcept(log);
                if ((userGenes != null) && (gene != null) && (userGenes.contains(gene))) {
                    // numberOfUserGenes++;
                    // retain gene Accession/Name (18/07/18)
                    String geneAcc = "";
                    for (ConceptAccession acc : gene.getConceptAccessions()) {
                        String accValue = acc.getAccession();
                        geneAcc = accValue;
                        if (acc.getElementOf().getId().equalsIgnoreCase("TAIR") && accValue.startsWith("AT")
                                && (accValue.indexOf(".") == -1)) {
                            geneAcc = accValue;
                            break;
                        } else if (acc.getElementOf().getId().equalsIgnoreCase("PHYTOZOME")) {
                            geneAcc = accValue;
                            break;
                        }
                    }
                    // use shortest preferred concept name
                                  /*  String geneName = getShortestPreferedName(gene.getConceptNames());
                                    geneAcc= geneName; */
                    user_genes = user_genes + geneAcc + ",";
                }

                if (mapGene2QTL.containsKey(log)) {
                    numberOfQTL++;

                    // for(Integer cid : mapGene2QTL.get(log)){
                    // ONDEXConcept qtl = graph.getConcept(cid);
                    // String traitDesc =
                    // qtl.getAttribute(attTrait).getValue().toString();
                    //
                    // if (infoQTL == "")
                    // infoQTL += traitDesc + "//" + traitDesc;
                    // else
                    // infoQTL += "||" + traitDesc + "//" + traitDesc;
                    // }
                }

                String chr = null;
                double beg = 0.0;

                if (gene.getAttribute(attChr) != null) {
                    chr = gene.getAttribute(attChr).getValue().toString();
                }

                if (gene.getAttribute(attBeg) != null) {
                    beg = (Integer) gene.getAttribute(attBeg).getValue();
                }

                if (attCM != null) {
                    if (gene.getAttribute(attCM) != null) {
                        beg = (Double) gene.getAttribute(attCM).getValue();
                    }
                } else if (gene.getAttribute(attBeg) != null) {
                    beg = (Integer) gene.getAttribute(attBeg).getValue();
                }

                if (!qtls.isEmpty()) {
                    for (QTL loci : qtls) {
                        String qtlChrom = loci.getChromosome();
                        Integer qtlStart = loci.getStart();
                        Integer qtlEnd = loci.getEnd();

                        if (qtlChrom.equals(chr) && beg >= qtlStart && beg <= qtlEnd) {

                            numberOfQTL++;
                            // if (infoQTL == "")
                            // infoQTL += loci.getLabel() + "//" +
                            // loci.getTrait();
                            // else
                            // infoQTL += "||" + loci.getLabel() + "//" +
                            // loci.getTrait();
                        }
                    }
                }

                // int chr = 0, beg = 0, end = 0;
                // Double cm = 0.00;
                // if (graph.getConcept(log).getAttribute(attChr) != null) {
                // chr = (Integer)
                // graph.getConcept(log).getAttribute(attChr).getValue();
                // }
                // else if (graph.getConcept(log).getAttribute(attScaf) !=
                // null) {
                // chr = (Integer)
                // graph.getConcept(log).getAttribute(attScaf).getValue();
                // }
                // if (graph.getConcept(log).getAttribute(attBeg) != null) {
                // beg = (Integer)
                // graph.getConcept(log).getAttribute(attBeg).getValue();
                // }
                // if (graph.getConcept(log).getAttribute(attEnd) != null) {
                // end = (Integer)
                // graph.getConcept(log).getAttribute(attEnd).getValue();
                // }
                // if (attCM != null) {
                // if (graph.getConcept(log).getAttribute(attCM) != null) {
                // cm = (Double)
                // graph.getConcept(log).getAttribute(attCM).getValue();
                // }
                // }
                // if(!qtls.isEmpty()){
                // for(QTL loci : qtls) {
                // try{
                // Integer qtlChrom =
                // chromBidiMap.inverseBidiMap().get(loci.getChrName());
                // Long qtlStart = Long.parseLong(loci.getStart());
                // Long qtlEnd = Long.parseLong(loci.getEnd());
                //
                // if (cm != null) {
                // if((qtlChrom == chr) && (cm >= qtlStart) && (cm <=
                // qtlEnd)){
                // if (!evidenceQTL.contains(loci)) {
                // numberOfQTL++;
                // evidenceQTL.add(loci);
                // if (infoQTL == "")
                // infoQTL += loci.getLabel() + "//" + loci.getTrait();
                // else
                // infoQTL += "||" + loci.getLabel() + "//" +
                // loci.getTrait();
                // }
                // }
                // }
                // else {
                // if((qtlChrom == chr) && (beg >= qtlStart) && (end <=
                // qtlEnd)){
                // if (!evidenceQTL.contains(loci)) {
                // numberOfQTL++;
                // evidenceQTL.add(loci);
                // if (infoQTL == "")
                // infoQTL += loci.getLabel() + "//" + loci.getTrait();
                // else
                // infoQTL += "||" + loci.getLabel() + "//" +
                // loci.getTrait();
                // }
                // }
                // }
                // }
                // catch(Exception e){
                // System.out.println("An error occurred in method:
                // writeEvidenceOut.");
                // System.out.println(e.getMessage());
                // }
                // }
                // }
            }

            // omit last comma from user_genes String
            if (user_genes.contains(",")) {
                user_genes = user_genes.substring(0, user_genes.length() - 1);
            }

            double pvalue = 0.0;

            if (userGenesSize > 0) {
                // quick adjustment to the score to make it a P-value from F-test instead
                int matched_inGeneList = "".equals(user_genes) ? 0 : user_genes.split(",").length;
                int notMatched_inGeneList = userGenesSize - matched_inGeneList;
                int matched_notInGeneList = numberOfGenes - matched_inGeneList;
                int notMatched_notInGeneList = allGenesSize - matched_notInGeneList - matched_inGeneList - notMatched_inGeneList;
                pvalue = fisherExact.getP(
                        matched_inGeneList,
                        matched_notInGeneList,
                        notMatched_inGeneList,
                        notMatched_notInGeneList);
            }
            // writes the row - unless user genes provided and none match this row
            if (userGenes!=null && !userGenes.isEmpty() && "".equals(user_genes)) {
                continue;
            }
            out.append(type + "\t" + name + "\t" + sfmt.format(score) + "\t" + pfmt.format(pvalue) + "\t" + numberOfGenes + "\t" + /*numberOfUserGenes*/ user_genes
                    + "\t" + numberOfQTL + "\t" + ondexId + "\n");
        }
        //log.info("Evidence table generated...");
        return out.toString();
    }

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

    public String writeSynonymTable(String keyword) throws ParseException {
        StringBuffer out = new StringBuffer();
        int topX = 25;
        // to store top 25 values for each concept type instead of just 25
        // values per keyword.
        int existingCount = 0;
        /* Set<String> */
        Set<String> keys = this.parseKeywordIntoSetOfWords(keyword);
        // Convert the LinkedHashSet to a String[] array.
        String[] synonymKeys = keys.toArray(new String[keys.size()]);
        // for (String key : keys) {
        for (int k = synonymKeys.length - 1; k >= 0; k--) {
            String key = synonymKeys[k];
            if (key.contains(" ") && !key.startsWith("\"")) {
                key = "\"" + key + "\"";
            }
            log.info("Checking synonyms for " + key);
            // Analyzer analyzer = new StandardAnalyzer(Version.LUCENE_36);
            Analyzer analyzer = new StandardAnalyzer();
            Map<Integer, Float> synonymsList = new HashMap<Integer, Float>();
            FloatValueComparator<Integer> comparator = new FloatValueComparator<Integer>(synonymsList);
            TreeMap<Integer, Float> sortedSynonymsList = new TreeMap<Integer, Float>(comparator);
            // log.info("writeSynonymTable: Keyword: "+ key);
            // a HashMap to store the count for the number of values written
            // to the Synonym Table (for each Concept Type).
            Map<String, Integer> entryCounts_byType = new HashMap<String, Integer>();

            // search concept names
            String fieldNameCN = getFieldName("ConceptName", null);
            // QueryParser parserCN = new QueryParser(Version.LUCENE_36, fieldNameCN,
            // analyzer);
            QueryParser parserCN = new QueryParser(fieldNameCN, analyzer);
            Query qNames = parserCN.parse(key);
            ScoredHits<ONDEXConcept> hitSynonyms = lenv.searchTopConcepts(qNames, 500/* 100 */);
            /*
             * number of top concepts searched for each Lucene field, increased for now from
             * 100 to 500, until Lucene code is ported from Ondex to QTLNetMiner, when we'll
             * make changes to the QueryParser code instead.
             */

            for (ONDEXConcept c : hitSynonyms.getOndexHits()) {
                if (c instanceof LuceneConcept) {
                    c = ((LuceneConcept) c).getParent();
                }
                if (!synonymsList.containsKey(c.getId())) {
                    synonymsList.put(c.getId(), hitSynonyms.getScoreOnEntity(c));
                } else {
                    float scoreA = hitSynonyms.getScoreOnEntity(c);
                    float scoreB = synonymsList.get(c.getId());
                    if (scoreA > scoreB) {
                        synonymsList.put(c.getId(), scoreA);
                    }
                }
            }

            if (synonymsList != null) {

                // Only start a KEY tag if it will have contents. Otherwise skip it.
                out.append("<" + key + ">\n");

                // Creates a sorted list of synonyms
                sortedSynonymsList.putAll(synonymsList);

                // writes the topX values in table
                for (Integer entry : sortedSynonymsList.keySet()) {
                    ONDEXConcept eoc = graph.getConcept(entry);
                    Float score = synonymsList.get(entry);
                    String type = eoc.getOfType().getId().toString();
                    Integer id = eoc.getId();
                    Set<ConceptName> cNames = eoc.getConceptNames();

                    // write top 25 suggestions for every entry (concept
                    // class) in the list.
                    if (entryCounts_byType.containsKey(type)) {
                        // get existing count
                        existingCount = entryCounts_byType.get(type);
                    } else {
                        existingCount = 0;
                    }

                    for (ConceptName cName : cNames) {
                        // if(topAux < topX){
                        if (existingCount < topX) {
                            // if(type == "Gene" || type == "BioProc" ||
                            // type == "MolFunc" || type == "CelComp"){
                            // Exclude Publications from the Synonym Table
                            // for the Query Suggestor
                            if (!(type.equals("Publication") || type.equals("Thing"))) {
                                if (cName.isPreferred()) {
                                    String name = cName.getName().toString();

                                    // error going around for publication
                                    // suggestions
                                    if (name.contains("\n"))
                                        name = name.replace("\n", "");
                                    // error going around for qtl
                                    // suggestions
                                    if (name.contains("\""))
                                        name = name.replaceAll("\"", "");
                                    out.append(name + "\t" + type + "\t" + score.toString() + "\t" + id + "\n");
                                    existingCount++;
                                    // store the count per concept Type for
                                    // every entry added to the Query
                                    // Suggestor (synonym) table.
                                    entryCounts_byType.put(type, existingCount);
                                    // System.out.println("\t *Query
                                    // Suggestor table: new entry: synonym
                                    // name: "+ name +" , Type: "+ type + "
                                    // , entries_of_this_type= "+
                                    // existingCount);
                                }
                            }
                        }

                    }
                }

                out.append("</" + key + ">\n");
            }
        }
        return out.toString();
    }

    public HashMap<Integer, Set<Integer>> getMapEvidences2Genes(HashMap<ONDEXConcept, Float> luceneConcepts) {
        HashMap<Integer, Set<Integer>> mapEvidences2Genes = new HashMap<Integer, Set<Integer>>();
        for (ONDEXConcept lc : luceneConcepts.keySet()) {
            Integer luceneOndexId = lc.getId();
            // Checks if the document is related to a gene
            if (!mapConcept2Genes.containsKey(luceneOndexId)) {
                continue;
            }
            // Creates de set of Concepts ids
            Set<Integer> listOfGenes = mapConcept2Genes.get(luceneOndexId);
            mapEvidences2Genes.put(luceneOndexId, listOfGenes);
        }
        return mapEvidences2Genes;
    }

    /**
     * Returns the shortest preferred Name from a set of concept Names or ""
     * [Gene|Protein][Phenotype][The rest]
     *
     * @param cns Set<ConceptName>
     * @return String name
     */
    private String getShortestPreferedName(Set<ConceptName> cns) {
        String result = "";
        int length = 100000;
        for (ConceptName cn : cns) {
            if ((cn.isPreferred()) && (cn.getName().trim().length() < length)) {
                result = cn.getName().trim();
                length = cn.getName().trim().length();
            }
        }
        return result;
    }

    /**
     * Returns the shortest not ambiguous accession or ""
     *
     * @param accs Set<ConceptAccession>
     * @return String name
     */
    private String getShortestNotAmbiguousAccession(Set<ConceptAccession> accs) {
        String result = "";
        int length = 100000;
        for (ConceptAccession acc : accs) {
            if (!(acc.isAmbiguous()) && (acc.getAccession().trim().length() < length)) {
                result = acc.getAccession().trim();
                length = acc.getAccession().trim().length();
            }
        }
        return result;
    }

    /**
     * Returns the best name for each group of concept classes
     * [Gene|Protein][Phenotype][The rest]
     *
     * @param c ONDEXConcept
     * @return normalised name
     */
    private String getDefaultNameForGroupOfConcepts(ONDEXConcept c) {

        // this is the preferred concept name
        String ct = c.getOfType().getId();
        String cn = "";
        Set<ConceptName> cns = c.getConceptNames();
        Set<ConceptAccession> accs = c.getConceptAccessions();
        if ((ct == "Gene") || (ct == "Protein")) {
            /*
             * if(getShortestNotAmbiguousAccession(accs) != ""){ cn =
             * getShortestNotAmbiguousAccession(accs); } else { cn =
             * getShortestPreferedName(cns); }
             */
            // Get shortest, non-ambiguous concept accession.
            String shortest_acc = getShortestNotAmbiguousAccession(accs);
            // Get shortest, preferred concept name.
            String shortest_coname = getShortestPreferedName(cns);
            int shortest_coname_length = 100000, shortest_acc_length = 100000;
            if (!shortest_acc.equals(" ")) {
                shortest_acc_length = shortest_acc.length();
            }
            if (!shortest_coname.equals(" ")) {
                shortest_coname_length = shortest_coname.length();
            }
            // Compare the sizes of both the values
            if (shortest_acc_length < shortest_coname_length) {
                cn = shortest_acc; // use shortest, non-ambiguous concept
                // accession.
            } else {
                cn = shortest_coname; // use shortest, preferred concept name.
            }
        }
        // } else if (ct == "Phenotype") {
        // AttributeName att = graph.getMetaData().getAttributeName("Phenotype");
        // cn = c.getAttribute(att).getValue().toString().trim();
        //
        // }
        // else if (ct == "Trait") {
        // AttributeName att = graph.getMetaData().getAttributeName("Study");
        // cn = c.getAttribute(att).getValue().toString().trim();
        // }
        else {
            if (getShortestPreferedName(cns) != "") {
                cn = getShortestPreferedName(cns);
            } else {
                cn = getShortestNotAmbiguousAccession(accs);
            }
        }
        if (cn.length() > 30)
            cn = cn.substring(0, 29) + "...";
        return cn;
    }

    /**
     * Does sort a given map according to the values
     *
     * @param map
     * @return
     */
    public <K, V extends Comparable<? super V>> SortedSet<Map.Entry<K, V>> entriesSortedByValues(Map<K, V> map) {
        SortedSet<Map.Entry<K, V>> sortedEntries = new TreeSet<Map.Entry<K, V>>(new Comparator<Map.Entry<K, V>>() {
            @Override
            public int compare(Map.Entry<K, V> e1, Map.Entry<K, V> e2) {
                int res = e2.getValue().compareTo(e1.getValue());
                // Special fix to preserve items with equal values
                return res != 0 ? res : 1;
            }
        });
        sortedEntries.addAll(map.entrySet());
        return sortedEntries;
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

    public void setReferenceGenome(boolean value) {
        this.referenceGenome = value;
    }

    public boolean getReferenceGenome() {
        return this.referenceGenome;
    }

    /**
     * Returns number of organism (taxID) genes at a given loci
     *
     * @param chr   chromosome name as used in GViewer
     * @param start start position
     * @param end   end position
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

                String geneTaxID = gene.getAttribute(attTAXID).getValue().toString();
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

    public String getFieldName(String name, String value) {

        if (value == null) {
            return name;
        } else {
            return name + "_" + value;
        }
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

        Set<ONDEXConcept> qtls = new HashSet<ONDEXConcept>();
        if (ccQTL != null)
            qtls = graph.getConceptsOfConceptClass(ccQTL);

        Set<ONDEXConcept> seed = graph.getConceptsOfConceptClass(ccGene);
        Set<ONDEXConcept> genes = new HashSet<ONDEXConcept>();
        for (ONDEXConcept gene : seed) {
            if (gene.getAttribute(attTAXID) != null
                    && taxID.contains(gene.getAttribute(attTAXID).getValue().toString())) {
                genes.add(gene);
            }
        }

        if (file1.exists() && (file1.lastModified() < graphFile.lastModified())) {
            log.info("Graph file updated since hashmaps last built, deleting old hashmaps");
            file1.delete();
            file2.delete();
            file3.delete();
        }

        if (!file1.exists()) {

            // the results give us a map of every starting concept to every
            // valid path
            Map<ONDEXConcept, List<EvidencePathNode>> results = gt.traverseGraph(graph, genes, null);

            mapConcept2Genes = new HashMap<Integer, Set<Integer>>();
            mapGene2Concepts = new HashMap<Integer, Set<Integer>>();
            mapGene2PathLength = new HashMap<String, Integer>();
            log.info("Also, generate geneID//endNodeID & pathLength in HashMap mapGene2PathLength...");
            for (List<EvidencePathNode> paths : results.values()) {
                for (EvidencePathNode path : paths) {

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
                    }else{
			    if(pathLength < mapGene2PathLength.get(gpl_key)){
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
                    
			if (!mapConcept2Genes.containsKey(lastConID)) {
			    Set<Integer> setGenes = new HashSet<Integer>();
			    setGenes.add(gene.getId());
			    mapConcept2Genes.put(lastConID, setGenes);
			} else {
			    mapConcept2Genes.get(lastConID).add(gene.getId());
			}
                    
                }
            }
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
                log.error("Failed to write files", e);
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
                log.error("Failed to read files", e);
            }
        }

        if (mapGene2Concepts == null) {
            log.warn("mapGene2Concepts is null");
            mapGene2Concepts = new HashMap<Integer, Set<Integer>>();
        } else
            log.info("Populated Gene2Concept with #mappings: " + mapGene2Concepts.size());

        if (mapConcept2Genes == null) {
            log.warn("mapConcept2Genes is null");
            mapConcept2Genes = new HashMap<Integer, Set<Integer>>();
        } else
            log.info("Populated Concept2Gene with #mappings: " + mapConcept2Genes.size());

        if (mapGene2PathLength == null) {
            log.warn("Gene2PathLength is null");
            mapGene2PathLength = new HashMap<String, Integer>();
        } else
            log.info("Populated Gene2PathLength with #mappings: " + mapGene2PathLength.size());

        log.info("Create Gene2QTL map now...");

        mapGene2QTL = new HashMap<Integer, Set<Integer>>();

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

            if (attCM != null)
                beg = begCM;
            else
                beg = begBP;

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
        }

        log.info("Populated Gene2QTL with #mappings: " + mapGene2QTL.size());
    }

    public ArrayList<ONDEXConcept> filterQTLs(ArrayList<ONDEXConcept> genes, List<String> qtls) {
        Set<ONDEXConcept> genesQTL = searchQTLs(qtls);
        genes.retainAll(genesQTL);
        return genes;
    }

    /*
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
            log.error("Faile to generate stats", ex);
        }
    }

}

class ValueComparator<T> implements Comparator<T> {

    Map<T, Double> base;

    public ValueComparator(Map<T, Double> base) {
        this.base = base;
    }

    public int compare(Object a, Object b) {

        if (base.get(a) < base.get(b)) {
            return 1;
        } else if (base.get(a) == base.get(b)) {
            return 0;
        } else {
            return -1;
        }
    }
}

class FloatValueComparator<T> implements Comparator<T> {

    Map<T, Float> base;

    public FloatValueComparator(Map<T, Float> base) {
        this.base = base;
    }

    public int compare(Object a, Object b) {
        if (base.get(a) < base.get(b)) {
            return 1;
        } else if (base.get(a) == base.get(b)) {
            return 0;
        } else {
            return -1;
        }
    }
}
