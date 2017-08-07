package rres.ondex.server;

import java.awt.Font;
import java.beans.XMLEncoder;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.net.URL;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.TreeSet;

import javax.xml.bind.JAXBException;
import javax.xml.stream.XMLStreamException;

import net.sourceforge.ondex.InvalidPluginArgumentException;
import net.sourceforge.ondex.ONDEXPluginArguments;
import net.sourceforge.ondex.algorithm.graphquery.GraphTraverser;
import net.sourceforge.ondex.algorithm.graphquery.StateMachine;
import net.sourceforge.ondex.algorithm.graphquery.exceptions.InvalidFileException;
import net.sourceforge.ondex.algorithm.graphquery.exceptions.StateMachineInvalidException;
import net.sourceforge.ondex.algorithm.graphquery.flatfile.StateMachineFlatFileParser2;
import net.sourceforge.ondex.algorithm.graphquery.nodepath.EvidencePathNode;
import net.sourceforge.ondex.args.FileArgumentDefinition;
import net.sourceforge.ondex.config.ONDEXGraphRegistry;
import net.sourceforge.ondex.core.Attribute;
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
import net.sourceforge.ondex.exception.type.WrongArgumentException;
import net.sourceforge.ondex.export.oxl.Export;
import net.sourceforge.ondex.filter.unconnected.ArgumentNames;
import net.sourceforge.ondex.filter.unconnected.Filter;
import net.sourceforge.ondex.parser.oxl.Parser;
import net.sourceforge.ondex.tools.ondex.ONDEXGraphCloner;

import org.apache.commons.collections15.BidiMap;
import org.apache.commons.collections15.bidimap.DualHashBidiMap;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.WhitespaceAnalyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.BooleanClause.Occur;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.util.Version;

/**
 * Parent class to all ondex service provider classes implementing organism
 * specific searches.
 * 
 * @author taubertj, pakk
 * 
 */
public class OndexServiceProvider {

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
	 * Query-dependent mapping between genes and concepts that contain query
	 * terms
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

	public void loadConfig() {
		Properties chromConfig = new Properties();

		System.out.println("KnetMiner configured for taxonomy id: " + taxID);

		// // load chromosomes configuration from file
		// URL configUrl = Thread.currentThread().getContextClassLoader()
		// .getResource("chromosomes.xml");
		// try {
		// chromConfig.loadFromXML(configUrl.openStream());
		// } catch (IOException e) {
		// e.printStackTrace();
		// }
		//
		// // add to bi-directional map
		// for (String key : chromConfig.stringPropertyNames()) {
		// chromBidiMap.put(Integer.valueOf(key), chromConfig.getProperty(key));
		// }

	}

	/**
	 * Load OXL data file into memory Build Lucene index for the Ondex graph
	 * Create a state machine for semantic motif search
	 * 
	 * @throws ArrayIndexOutOfBoundsException
	 * @throws PluginConfigurationException
	 */
	public void createGraph(String fileName) throws ArrayIndexOutOfBoundsException, PluginConfigurationException {

		System.out.println("Loading graph...");

		// new in-memory graph
		graph = new MemoryONDEXGraph("OndexKB");

		loadOndexKBGraph(fileName);
		indexOndexGraph();

		StateMachine sm = loadSemanticMotifs();

		// create a crawler using our semantic motifs
		gt = new GraphTraverser(sm);

		populateHashMaps();

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

		System.out.println("Done. Waiting for queries...");

		// Write Stats about the created Ondex graph & its mappings to a file.
		displayGraphStats(MultiThreadServer.props.getProperty("DataPath"));
	}

	/*
	 * Generate Stats about the created Ondex graph and its mappings:
	 * mapConcept2Genes & mapGene2Concepts.
	 */
	private void displayGraphStats(String fileUrl) {
		// Update the Network Stats file that holds the latest Stats
		// information.
		String fileName = fileUrl + "latestNetwork_Stats.tab";

		int minValues, maxValues = 0, avgValues, all_values_count = 0;

		// Also, create a timetamped Stats file to retain historic Stats
		// information.
		long timestamp = System.currentTimeMillis();
		String newFileName = fileUrl + timestamp + "_Network_Stats.tab";
		try {
			int totalGenes = numGenesInGenome;
			int totalConcepts = graph.getConcepts().size();
			int totalRelations = graph.getRelations().size();
			int geneEvidenceConcepts = mapConcept2Genes.size();
			minValues = mapGene2Concepts.get(mapGene2Concepts.keySet().toArray()[0]).size(); // initial
																								// value
			/*
			 * Get the min., max. & average size (no. of values per key) for the
			 * gene-evidence network (in the mapGene2Concepts HashMap.
			 */
			Set set = mapGene2Concepts.entrySet(); // dataMap.entrySet();
			Iterator iterator = set.iterator();
			while (iterator.hasNext()) {
				Map.Entry mEntry = (Map.Entry) iterator.next();
				HashSet<Integer> value = (HashSet<Integer>) mEntry.getValue(); // Value
                                																				// HashSet<Integer>).
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
			avgValues = all_values_count / all_keys;

			/*
			 * System.out.println("Graph Stats:");
			 * System.out.println("1) Total number of genes: "+ totalGenes);
			 * System.out.println("2) Total concepts: "+ totalConcepts);
			 * System.out.println("3) Total Relations: "+ totalRelations);
			 * System.out.println("4) Concept2Gene #mappings: "+
			 * geneEvidenceConcepts); 
                         * System.out.println("5) Min., Max., Average size of gene-evidence networks: "
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
                        Set<ConceptClass> conceptClasses= graph.getMetaData().getConceptClasses(); // get all concept classes
                        Set<ConceptClass> sorted_conceptClasses = new TreeSet<ConceptClass>(conceptClasses); // sorted
                        for (ConceptClass con_class : sorted_conceptClasses) {
                             if(graph.getConceptsOfConceptClass(con_class).size() >0) {
                                String conID= con_class.getId();
                                int con_count= graph.getConceptsOfConceptClass(con_class).size();
                                if(conID.equalsIgnoreCase("Path")) {
                                   conID= "Pathway";
                                  }
                                else if(conID.equalsIgnoreCase("Comp")) {
                                   conID= "Compound";
                                  }
                                else if(conID.equalsIgnoreCase("Trait")) {
                                   conID= "Trait (GWAS)";
                                  }
                                else if(conID.equalsIgnoreCase("Gene")) {
                                   con_count= numGenesInGenome;
                                  }
			        sb.append("<cc_count>").append(conID).append("=").append(con_count).append("</cc_count>\n");
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
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Loads OndexKB Graph (OXL data file into memory)
	 */
	private void loadOndexKBGraph(String fileName) {
		try {
			System.out.println("Start Loading OndexKB Graph..." + fileName);
			Parser oxl = new Parser();
			ONDEXPluginArguments pa = new ONDEXPluginArguments(oxl.getArgumentDefinitions());
			pa.setOption(FileArgumentDefinition.INPUT_FILE, fileName);
			oxl.setArguments(pa);
			oxl.setONDEXGraph(graph);

			oxl.start();
			System.out.println("OndexKB Graph Loaded Into Memory");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void validateOndexKB() {

		System.out.println("Start Validating OndexKB Graph...");
		int errors = 0;
		ConceptClass ccGene = graph.getMetaData().getConceptClass("Gene");
		AttributeName attChromosome = graph.getMetaData().getAttributeName("Chromosome");
		AttributeName attScaffold = graph.getMetaData().getAttributeName("Scaffold");
		AttributeName attBegin = graph.getMetaData().getAttributeName("BEGIN");
		AttributeName attEnd = graph.getMetaData().getAttributeName("END");
		AttributeName attTaxID = graph.getMetaData().getAttributeName("TAXID");

		for (ONDEXConcept concept : graph.getConceptsOfConceptClass(ccGene)) {
			Attribute attT = concept.getAttribute(attTaxID);
			Attribute attC = concept.getAttribute(attChromosome);
			Attribute attS = concept.getAttribute(attScaffold);
			Attribute attB = concept.getAttribute(attBegin);
			Attribute attE = concept.getAttribute(attEnd);

			if ((attC == null && attS == null) || (attB == null) || (attE == null)) {
				errors++;
			}
		}
		System.out.println("Validation completed with " + errors + " errors.");
	}

	/**
	 * Indexes Ondex Graph
	 */
	private void indexOndexGraph() {
		try {
			// index the Ondex graph
			File file = null;
			file = new File("index");
			System.out.println("Building Lucene Index: " + file.getAbsolutePath());
			if (!file.exists())
				lenv = new LuceneEnv(file.getAbsolutePath(), true);
			else
				lenv = new LuceneEnv(file.getAbsolutePath(), false);
			lenv.setONDEXGraph(graph);
			System.out.println("Lucene Index created");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * Creates a state machine for semantic motif search
	 */
	private StateMachine loadSemanticMotifs() {

		StateMachineFlatFileParser2 smp = null;
		try {

			File file = new File("SemanticMotifs.txt");

			// load semantic motifs from file
			URL motifsUrl = Thread.currentThread().getContextClassLoader().getResource("SemanticMotifs.txt");

			smp = new StateMachineFlatFileParser2();
			try {
				if (file.exists()) {
					System.out.println("Building State Machine from: " + file.getAbsolutePath());

					smp.parseReader(new BufferedReader(new FileReader(file)), graph);

				} else {
					System.out.println("Building State Machine from: " + motifsUrl.getFile());

					smp.parseReader(new BufferedReader(new InputStreamReader(motifsUrl.openStream())), graph);

				}
			} catch (InvalidFileException e) {
				e.printStackTrace();
			} catch (StateMachineInvalidException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			System.out.println("Completed State Machine");
		} catch (Exception e) {
			e.printStackTrace();
		}

		return smp.getStateMachine();
	}

	/**
	 * Export the Ondex graph to file system as a .oxl file and also in JSON
	 * format using the new JSON Exporter plugin in Ondex.
	 * 
	 * @param ONDEXGraph
	 *            graph
	 * @throws InvalidPluginArgumentException
	 */
	public boolean exportGraph(ONDEXGraph og, String exportPath) throws InvalidPluginArgumentException {

		boolean fileIsCreated = false;
		boolean jsonFileIsCreated = false;

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
		
//		// Attribute Value Filter
//		net.sourceforge.ondex.filter.attributevalue.Filter visFilter = new net.sourceforge.ondex.filter.attributevalue.Filter();
//		ONDEXPluginArguments visFA = new ONDEXPluginArguments(visFilter.getArgumentDefinitions());
//		visFA.addOption(net.sourceforge.ondex.filter.attributevalue.ArgumentNames.ATTRNAME_ARG, "size");
//		//Not sure if "true" needs to be string or boolean
//		visFA.addOption(net.sourceforge.ondex.filter.attributevalue.ArgumentNames.VALUE_ARG, "0");
//		visFA.addOption(net.sourceforge.ondex.filter.attributevalue.ArgumentNames.OPERATOR_ARG, ">");
//		visFA.addOption(net.sourceforge.ondex.filter.attributevalue.ArgumentNames.INCLUDING_ARG, true);
//		visFA.addOption(net.sourceforge.ondex.filter.attributevalue.ArgumentNames.IGNORE_ARG, true);
//
//		visFilter.setArguments(visFA);
//		visFilter.setONDEXGraph(graph2);
//		try {
//			visFilter.start();
//		} catch (WrongArgumentException e1) {
//			// TODO Auto-generated catch block
//			e1.printStackTrace();
//		}
//
//		ONDEXGraph graph3 = new MemoryONDEXGraph("FilteredGraph");
//		visFilter.copyResultsToNewGraph(graph3);
		

		// oxl export
		Export export = new Export();
		export.setLegacyMode(true);
		ONDEXPluginArguments ea = new ONDEXPluginArguments(export.getArgumentDefinitions());
		ea.setOption(FileArgumentDefinition.EXPORT_FILE, exportPath);
		ea.addOption("GZip", true);
		export.setArguments(ea);
		export.setONDEXGraph(graph2);
		try {
			export.start();
		} catch (IOException e) {
			e.printStackTrace();
			System.out.println(e.getMessage());
		} catch (XMLStreamException e) {
			e.printStackTrace();
			System.out.println(e.getMessage());
		} catch (JAXBException e) {
			e.printStackTrace();
			System.out.println(e.getMessage());
		}

		// Check if .oxl file exists
		while (!fileIsCreated) {
			fileIsCreated = checkFileExist(exportPath);
		}
		System.out.println("OXL file created:" + exportPath);

		// Export the graph as JSON too, using the Ondex JSON Exporter plugin.
		net.sourceforge.ondex.export.cyjsJson.Export jsonExport = new net.sourceforge.ondex.export.cyjsJson.Export();
		// JSON output file.
		String jsonExportPath = exportPath.substring(0, exportPath.length() - 4) + ".json";
		try {
			ONDEXPluginArguments epa = new ONDEXPluginArguments(jsonExport.getArgumentDefinitions());
			epa.setOption(FileArgumentDefinition.EXPORT_FILE, jsonExportPath);

			System.out.println("JSON Export file: " + epa.getOptions().get(FileArgumentDefinition.EXPORT_FILE));

			jsonExport.setArguments(epa);
			// jsonExport.setONDEXGraph(graph);
			jsonExport.setONDEXGraph(graph2);
			System.out.println("Export JSON data: Total concepts= " + graph2.getConcepts().size() + " , Relations= "
					+ graph2.getRelations().size());
			// Export the contents of the 'graph' object as multiple JSON
			// objects to an output file.
			jsonExport.start();
		} catch (Exception ex) {
			ex.printStackTrace();
			System.out.println(ex.getMessage());
		}

		// Check if .json file also exists
		while (!jsonFileIsCreated) {
			jsonFileIsCreated = checkFileExist(jsonExportPath);
		}
		System.out.println("JSON file created:" + jsonExportPath);

		return fileIsCreated;
	}

	// JavaScript Document

	/**
	 * Creates a new keyword for finding the NOT list
	 * 
	 * @param keyword
	 *            original keyword
	 * @return new keyword for searching the NOT list
	 */
	private String createsNotList(String keyword) {
		String result = "";

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
	 * @param hit2score
	 *            map that holds all hits and scores
	 * @param sHits
	 *            map that holds search results
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
	 * @param keyword
	 *            user-specified keyword
	 * @return set of genes related to the keyword
	 * @throws IOException
	 * @throws ParseException
	 */
	public HashMap<ONDEXConcept, Float> searchLucene(String keywords) throws IOException, ParseException {

		Set<AttributeName> atts = graph.getMetaData().getAttributeNames();
		String[] datasources = { "PFAM", "IPRO", "UNIPROTKB", "EMBL", "KEGG", "EC", "GO", "TO", "NLM", "TAIR",
				"ENSEMBLGENE", "PHYTOZOME", "IWGSC", "IBSC", "PGSC", "ENSEMBL" };
		// sources identified in KNETviewer
		/*
		 * String[] new_datasources= { "AC", "DOI", "CHEBI", "CHEMBL",
		 * "CHEMBLASSAY", "CHEMBLTARGET", "EC", "EMBL", "ENSEMBL", "GENB",
		 * "GENOSCOPE", "GO", "INTACT", "IPRO", "KEGG", "MC", "NC_GE", "NC_NM",
		 * "NC_NP", "NLM", "OMIM", "PDB", "PFAM", "PlnTFDB", "Poplar-JGI",
		 * "PoplarCyc", "PRINTS", "PRODOM", "PROSITE", "PUBCHEM", "PubMed",
		 * "REAC", "SCOP", "SOYCYC", "TAIR", "TX", "UNIPROTKB"};
		 */
		Set<String> dsAcc = new HashSet<String>(Arrays.asList(datasources));

		HashMap<ONDEXConcept, Float> hit2score = new HashMap<ONDEXConcept, Float>();

		Analyzer analyzer = new StandardAnalyzer(Version.LUCENE_36);

		String keyword = keywords;

		// creates the NOT list (list of all the forbidden documents)
		String NOTQuery = createsNotList(keyword);
		String crossTypesNotQuery = "";
		ScoredHits<ONDEXConcept> NOTList = null;
		if (NOTQuery != "") {
			crossTypesNotQuery = "tConceptAttribute_AbstractHeader:(" + NOTQuery + ") OR ConceptAttribute_Abstract:("
					+ NOTQuery + ") OR Annotation:(" + NOTQuery + ") OR ConceptName:(" + NOTQuery + ") OR ConceptID:("
					+ NOTQuery + ")";
			String fieldNameNQ = getFieldName("ConceptName", null);
			QueryParser parserNQ = new QueryParser(Version.LUCENE_36, fieldNameNQ, analyzer);
			Query qNQ = parserNQ.parse(crossTypesNotQuery);
			NOTList = lenv.searchTopConcepts(qNQ, 2000);
		}

		// number of top concepts retrieved for each Lucene field
		/*
		 * increased for now from 500 to 1500, until Lucene code is ported from
		 * Ondex to QTLNetMiner, when we'll make changes to the QueryParser code
		 * instead.
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
			QueryParser parser = new QueryParser(Version.LUCENE_36, fieldName, analyzer);
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
			QueryParser parser = new QueryParser(Version.LUCENE_36, fieldName, analyzer);
			Query qAccessions = parser.parse(keyword);
			ScoredHits<ONDEXConcept> sHitsAcc = lenv.searchTopConcepts(qAccessions, max_concepts);
			mergeHits(hit2score, sHitsAcc, NOTList);
		}

		// search concept names
		// Query qNames =
		// LuceneQueryBuilder.searchConceptByConceptNameExact(keyword);
		String fieldNameCN = getFieldName("ConceptName", null);
		QueryParser parserCN = new QueryParser(Version.LUCENE_36, fieldNameCN, analyzer);
		Query qNames = parserCN.parse(keyword);
		ScoredHits<ONDEXConcept> sHitsNames = lenv.searchTopConcepts(qNames, max_concepts);
		mergeHits(hit2score, sHitsNames, NOTList);

		// search concept description
		// Query qDesc =
		// LuceneQueryBuilder.searchConceptByDescriptionExact(keyword);
		String fieldNameD = getFieldName("Description", null);
		QueryParser parserD = new QueryParser(Version.LUCENE_36, fieldNameD, analyzer);
		Query qDesc = parserD.parse(keyword);
		ScoredHits<ONDEXConcept> sHitsDesc = lenv.searchTopConcepts(qDesc, max_concepts);
		mergeHits(hit2score, sHitsDesc, NOTList);

		// search concept annotation
		// Query qAnno =
		// LuceneQueryBuilder.searchConceptByAnnotationExact(keyword);
		String fieldNameCA = getFieldName("Annotation", null);
		QueryParser parserCA = new QueryParser(Version.LUCENE_36, fieldNameCA, analyzer);
		Query qAnno = parserCA.parse(keyword);
		ScoredHits<ONDEXConcept> sHitsAnno = lenv.searchTopConcepts(qAnno, max_concepts);
		mergeHits(hit2score, sHitsAnno, NOTList);

		System.out.println("Query: " + qAnno.toString(fieldNameCA));
		System.out.println("Annotation hits: " + sHitsAnno.getOndexHits().size());

		return hit2score;
	}

	public ArrayList<ONDEXConcept> getScoredGenes(HashMap<ONDEXConcept, Float> hit2score) throws IOException {

		ArrayList<ONDEXConcept> candidateGenes = new ArrayList<ONDEXConcept>();
		scoredCandidates = new HashMap<ONDEXConcept, Double>();
		ValueComparator comparator = new ValueComparator(scoredCandidates);
		TreeMap<ONDEXConcept, Double> sortedCandidates = new TreeMap<ONDEXConcept, Double>(comparator);

		System.out.println("total hits from lucene: " + hit2score.keySet().size());

		// 1st step: create map of genes to concepts that contain query terms
		// (keywords)
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

			// implementing an analogous score to tf-idf used in information
			// retrieval
			// reflects how important a term is to a gene in a collection
			// (genome)

			// term document frequency
			double tdf = (double) mapGene2HitConcept.get(geneId).size() / (double) mapGene2Concepts.get(geneId).size();

			// inverse document frequency
			double idf = 0;
			for (int cId : mapGene2HitConcept.get(geneId)) {
				// use a weight that is the initial lucene tf-idf score of hit
				// concept
				float luceneScore = hit2score.get(graph.getConcept(cId));
				idf += Math.log10((double) numGenesInGenome / mapConcept2Genes.get(cId).size()) * luceneScore;
			}
			// take the mean of all idf scores
			// idf = idf / mapGene2HitConcept.get(geneId).size();
			double score = tdf * idf;
			scoredCandidates.put(graph.getConcept(geneId), score);
		}

		sortedCandidates.putAll(scoredCandidates);
		candidateGenes = new ArrayList<ONDEXConcept>(sortedCandidates.keySet());

		return candidateGenes;
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
	 * @param String
	 *            keyword
	 * @return list of spell corrected words
	 */
	public List<String> didyoumean(String keyword) throws ParseException {
		List<String> alternatives = new ArrayList<String>();

		return alternatives;
	}

	/**
	 * Searches for genes within genomic regions (QTLs)
	 * 
	 * @param List<QTL>
	 *            qtls
	 * 
	 * @return Set<ONDEXConcept> concepts
	 */
	public Set<ONDEXConcept> searchQTLs(List<QTL> qtls) {
		Set<ONDEXConcept> concepts = new HashSet<ONDEXConcept>();

		String chrQTL;
		int startQTL, endQTL;
		for (QTL qtl : qtls) {
			try {
				chrQTL = qtl.getChromosome();
				startQTL = qtl.getStart();
				endQTL = qtl.getEnd();
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
			//	AttributeName attLoc = graph.getMetaData().getAttributeName("Location");
				AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");
				Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass(ccGene);

				for (ONDEXConcept c : genes) {
					String chrGene = null;
					double startGene = 0;
					if (c.getAttribute(attTAXID) == null
							|| !taxID.contains(c.getAttribute(attTAXID).getValue().toString())) {
						continue;
					}
					if (c.getAttribute(attChromosome) != null) {
						chrGene = c.getAttribute(attChromosome).getValue().toString();
					}
                        // TEMPORARY FIX, to be disabled for new .oxl species networks that have string 'Chrosmosome' (instead of the older integer Chromosome) & don't have a string 'Location' attribute.
                                    /*    if(c.getAttribute(attLoc) != null) {
                                           // if String Location exists, use that instead of integer Chromosome as client-side may use String Location in basemap.
                                           chrGene= c.getAttribute(attLoc).getValue().toString();
                                          }*/

					if (attCM != null) {
						if (c.getAttribute(attCM) != null) {
							startGene = (Double) c.getAttribute(attCM).getValue();
						}
					} else if (c.getAttribute(attBegin) != null) {
						startGene = (double) ((Integer) c.getAttribute(attBegin).getValue());
					}
					if (chrGene != null && startGene != 0) {

						if (chrQTL.equals(chrGene) && startGene >= startQTL && startGene <= endQTL) {
							concepts.add(c);
						}

					}
				}
			} catch (Exception e) {
				System.out.println("Not valid qtl" + e.getMessage());
			}
		}
		return concepts;
	}

	/**
	 * Searches the knowledge base for QTL concepts that match any of the user
	 * input terms
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
		AttributeName attSignificance = graph.getMetaData().getAttributeName("Significance");
		AttributeName attPvalue = graph.getMetaData().getAttributeName("PVALUE");
		AttributeName attChromosome = graph.getMetaData().getAttributeName("Chromosome");
		AttributeName attTrait = graph.getMetaData().getAttributeName("Trait");
		AttributeName attTaxID = graph.getMetaData().getAttributeName("TAXID");

		Set<QTL> results = new HashSet<QTL>();

		System.out.println("Looking for QTLs...");
		// If there is not traits but there is QTLs then we return all the QTLs
		if (ccTrait == null) {
			System.out.println("No Traits found: all QTLS will be shown...");
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
				String tax_id= "";
				if (attTaxID != null && q.getAttribute(attTaxID) != null) {
                                    tax_id= q.getAttribute(attTaxID).getValue().toString();
                                    //System.out.println("findQTL(): ccTrait=null; concept Type: "+ type +", chrName: "+ chrName +", tax_id= "+ tax_id);
				}
				results.add(new QTL(type, chrName, start, end, label, "", 1.0f, trait, tax_id));
			}
		} else {
			// be careful with the choice of analyzer: ConceptClasses are not
			// indexed in lowercase letters which let the StandardAnalyzer crash
			Analyzer analyzerSt = new StandardAnalyzer(Version.LUCENE_36);
			Analyzer analyzerWS = new WhitespaceAnalyzer(Version.LUCENE_36);

			String fieldCC = getFieldName("ConceptClass", null);
			QueryParser parserCC = new QueryParser(Version.LUCENE_36, fieldCC, analyzerWS);
			Query cC = parserCC.parse("Trait");

			String fieldCN = getFieldName("ConceptName", null);
			QueryParser parserCN = new QueryParser(Version.LUCENE_36, fieldCN, analyzerSt);
			Query cN = parserCN.parse(keyword);

			BooleanQuery finalQuery = new BooleanQuery();
			finalQuery.add(cC, Occur.MUST);
			finalQuery.add(cN, Occur.MUST);
			System.out.println("QTL search query: " + finalQuery.toString());

			ScoredHits<ONDEXConcept> hits = lenv.searchTopConcepts(finalQuery, 100);

			for (ONDEXConcept c : hits.getOndexHits()) {
				if (c instanceof LuceneConcept) {
					c = ((LuceneConcept) c).getParent();
				}
				Set<ONDEXRelation> rels = graph.getRelationsOfConcept(c);
				for(ONDEXRelation r : rels){
					//get QTL concept
					if(r.getFromConcept().getOfType().equals(ccQTL) || r.getToConcept().getOfType().equals(ccQTL)
							|| r.getFromConcept().getOfType().equals(ccSNP) || r.getToConcept().getOfType().equals(ccSNP)){
						//QTL-->Trait or SNP-->Trait
                                                //System.out.println("QTL-->Trait or SNP-->Trait");
						ONDEXConcept conQTL = r.getFromConcept();
						// results.add(conQTL);
						if (conQTL.getAttribute(attChromosome) != null && conQTL.getAttribute(attBegin) != null && conQTL.getAttribute(attEnd) != null) {
							String type = conQTL.getOfType().getId();
							String chrName = conQTL.getAttribute(attChromosome).getValue().toString();
							Integer start = (Integer) conQTL.getAttribute(attBegin).getValue();
							Integer end = (Integer) conQTL.getAttribute(attEnd).getValue();
							String label = conQTL.getConceptName().getName();
							String significance = "";
							if (attSignificance != null && conQTL.getAttribute(attSignificance) != null) {
								significance = conQTL.getAttribute(attSignificance).getValue().toString();
							}
							Float pValue = 1.0f;
							if (attPvalue != null && r.getAttribute(attPvalue) != null) {
								pValue = (Float) r.getAttribute(attPvalue).getValue();
							}
							String trait = c.getConceptName().getName();
                                                        String tax_id= "";
                                                        //System.out.println("findQTL(): conQTL.getAttribute(attTaxID): "+ conQTL.getAttribute(attTaxID) +", value= "+ conQTL.getAttribute(attTaxID).getValue().toString());
                                                        if (attTaxID != null && conQTL.getAttribute(attTaxID) != null) {
                                                            tax_id = conQTL.getAttribute(attTaxID).getValue().toString();
                                                            //System.out.println("findQTL(): conQTL Type: "+ type +", chrName: "+ chrName +", tax_id= "+ tax_id);
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
	 * @param regex
	 *            trait-related
	 * @return OndexGraph containing the gene network
	 */
	public ONDEXGraph getGenes(Integer[] ids, String regex) {
		System.out.println("get genes function " + ids.length);
		AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");

		Set<ONDEXConcept> seed = new HashSet<ONDEXConcept>();

		for (int id : ids) {
			ONDEXConcept c = graph.getConcept(id);
			if (c.getAttribute(attTAXID) != null && taxID.contains(c.getAttribute(attTAXID).getValue().toString())) {
				seed.add(c);
			}
		}
		System.out.println("Now we will call findSemanticMotifs!");
		ONDEXGraph subGraph = findSemanticMotifs(seed, regex);
		return subGraph;
	}

	/**
	 * Searches for ONDEXConcepts with the given accessions in the OndexGraph.
	 * 
	 * @param List<String>
	 *            accessions
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
					if (OndexSearch.find(gene, query, false)) {
						hits.add(gene);
					}
				}
			}
			return hits;
		} else {
			return null;
		}
	}

	public ONDEXGraph findSemanticMotifsOld(Set<ONDEXConcept> seed, String regex) {

		System.out.println("Method findSemanticMotifs: " + seed.size());
		// the results give us a map of every starting concept to every valid
		// path
		Map<ONDEXConcept, List<EvidencePathNode>> results = gt.traverseGraph(graph, seed, null);

		Set<ONDEXConcept> keywordConcepts = new HashSet<ONDEXConcept>();
		Set<ONDEXConcept> candidateGenes = new HashSet<ONDEXConcept>();

		if (regex != null) {
			System.out.println("Keyword is: " + regex);
		}
		// create new graph to return
		ONDEXGraph subGraph = new MemoryONDEXGraph("SemanticMotifGraph");
		ONDEXGraphCloner graphCloner = new ONDEXGraphCloner(graph, subGraph);

		ONDEXGraphRegistry.graphs.put(subGraph.getSID(), subGraph);

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

				ONDEXConcept cloneCon = graphCloner.cloneConcept(keywordCon);
				// if keyword provided, annotate the
				if (OndexSearch.find(cloneCon, regex, false)) {
					candidateGenes.add(gene);
					if (!keywordConcepts.contains(cloneCon)) {
						keywordConcepts.add(cloneCon);
						// only highlight keywords once
						OndexSearch.find(cloneCon, regex, true);
					}

					// annotate the semantic motif in the new Ondex graph
					highlightPath(path, graphCloner);
				}
			}
		}

		ONDEXGraphRegistry.graphs.remove(subGraph.getSID());

		System.out.println("Number of seed genes: " + seed.size());
		System.out.println("Keyword(s) were found in " + keywordConcepts.size() + " concepts.");
		System.out.println("Number of candidate genes " + candidateGenes.size());

		return subGraph;
	}

	/**
	 * Searches genes related to an evidence, finds semantic motifs and shows
	 * the path between them
	 * 
	 * @param evidenceOndexId
	 * @return subGraph
	 */
	public ONDEXGraph evidencePath(Integer evidenceOndexId) {
		System.out.println("Method evidencePath - evidenceOndexId: " + evidenceOndexId.toString());
		// Searches genes related to the evidenceID
		Set<Integer> relatedGenes = mapConcept2Genes.get(evidenceOndexId);
		Set<ONDEXConcept> relatedONDEXConcepts = new HashSet<ONDEXConcept>();
		for (Integer rg : relatedGenes) {
			relatedONDEXConcepts.add(graph.getConcept(rg));
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
				Set<ONDEXConcept> concepts = path.getAllConcepts();
				for (ONDEXConcept c : concepts) {
					graphCloner.cloneConcept(c);
				}
				// search last concept of semantic motif for keyword
				int indexLastCon = path.getConceptsInPositionOrder().size() - 1;
				ONDEXConcept firstCon = (ONDEXConcept) path.getStartingEntity();
				ONDEXConcept lastCon = (ONDEXConcept) path.getConceptsInPositionOrder().get(indexLastCon);
				if (lastCon.getId() == evidenceOndexId) {
					highlightPath(path, graphCloner);
				} else {
					// hidePath(path,graphCloner);
				}
			}
		}
		ONDEXGraphRegistry.graphs.remove(subGraph.getSID());

		return subGraph;
	}

	/**
	 * Searches with Lucene for documents, finds semantic motifs and by crossing
	 * this data makes concepts visible, changes the size and highlight the hits
	 * 
	 * @param seed
	 *            List of selected genes
	 * @param keyword
	 * @return subGraph
	 */
	public ONDEXGraph findSemanticMotifs(Set<ONDEXConcept> seed, String keyword) {
		System.out.println("Method findSemanticMotifs - keyword: " + keyword);
		// Searches with Lucene: luceneResults
		HashMap<ONDEXConcept, Float> luceneResults = null;
		try {
			luceneResults = searchLucene(keyword);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		// the results give us a map of every starting concept to every valid
		// path
		Map<ONDEXConcept, List<EvidencePathNode>> results = gt.traverseGraph(graph, seed, null);

		Set<ONDEXConcept> keywordConcepts = new HashSet<ONDEXConcept>();
		Set<ONDEXConcept> candidateGenes = new HashSet<ONDEXConcept>();

		if (keyword != null) {
			System.out.println("Keyword is: " + keyword);
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
						OndexSearch.highlight(cloneCon, keyword);
						keywordConcepts.add(cloneCon);
						
						if(keywordCon.getOfType().getId().equalsIgnoreCase("Publication")){
							numVisiblePublication++;
						}
					}
					
					// Hides the whole path from gene to publication if more than X publications exist in the subgraph 
					// the visible network is otherwise too large
					// TODO: Instead of choosing X arbitrary publications, show the most specific or latest publications
					if(keywordCon.getOfType().getId().equalsIgnoreCase("Publication") && numVisiblePublication > 20){
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

		System.out.println("Number of seed genes: " + seed.size());
		// System.out.println("Keyword(s) were found in " +
		// keywordConcepts.size()
		// + " concepts.");
		System.out.println("Number of candidate genes " + candidateGenes.size());
		
		if(export_visible_network){
		
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
	 * Annotate first and last concept and relations of a given path Do
	 * annotations on a new graph and not on the original graph
	 * 
	 * @param path
	 *            Contains concepts and relations of a semantic motif
	 * @param graphCloner
	 *            cloner for the new graph
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
	 * @param path
	 *            Contains concepts and relations of a semantic motif
	 * @param graphCloner
	 *            cloner for the new graph
	 */
	public void hidePath(EvidencePathNode path, ONDEXGraphCloner graphCloner) {
		ONDEXGraphMetaData md = graphCloner.getNewGraph().getMetaData();
		AttributeName attVisible = md.getAttributeName("visible");
		if (attVisible == null)
			attVisible = md.getFactory().createAttributeName("visible", Boolean.class);

		// hide every concept except by the last one
		int indexLastCon = path.getConceptsInPositionOrder().size() - 1;
		ONDEXConcept firstCon = (ONDEXConcept) path.getStartingEntity();
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
	 * Write GViewer confirm annotation XML file
	 * 
	 * @param genes
	 *            list of genes to be displayed
	 * @param keyword
	 *            user-specified keyword
	 */
	public boolean writeAnnotationXML(ArrayList<ONDEXConcept> genes, Set<ONDEXConcept> userGenes, List<QTL> userQtl,
			String filename, String keyword, int maxGenes, Hits hits, String listMode) {
		if (genes.size() == 0) {
			System.out.println("No genes to display.");
			return false;
		}
		Set<ONDEXConcept> usersRelatedGenes = hits.getUsersRelatedGenes();
		Set<ONDEXConcept> usersUnrelatedGenes = hits.getUsesrUnrelatedGenes();
		ONDEXGraphMetaData md = graph.getMetaData();
		AttributeName attChr = md.getAttributeName("Chromosome");
	//	AttributeName attLoc = md.getAttributeName("Location"); // for String chromomes (e.g, in Wheat)
		AttributeName attBeg = md.getAttributeName("BEGIN");
		AttributeName attEnd = md.getAttributeName("END");
		AttributeName attCM = md.getAttributeName("cM");
		AttributeName attSig = md.getAttributeName("Significance");
		AttributeName attTrait = md.getAttributeName("Trait");
                AttributeName attTaxID = md.getAttributeName("TAXID");
		ConceptClass ccQTL = md.getConceptClass("QTL");
		Set<QTL> qtlDB = new HashSet<QTL>();
		if (ccQTL != null) {
			// qtlDB = graph.getConceptsOfConceptClass(ccQTL);
			try {
				qtlDB = findQTL(keyword);
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
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

		for (ONDEXConcept c : genes) {

			// only genes that are on chromosomes (not scaffolds)
			// can be displayed in Map View
			if (c.getAttribute(attChr) == null || c.getAttribute(attChr).getValue().toString().equals("U"))
				continue;

			String chr= c.getAttribute(attChr).getValue().toString();
            // TEMPORARY FIX, to be disabled for new .oxl species networks that have string 'Chromosome' (instead of the older integer Chromosome) & don't have a string 'Location' attribute.
                        /* To handle String chromosome names (e.eg, in Wheat where client-side Gene View 
                         * uses location '1A', etc. instead of chrosome '1', etc. */
                    /*    if(c.getAttribute(attLoc).getValue().toString() != null) {
                           chr= c.getAttribute(attLoc).getValue().toString();
                          }*/

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
				String accValue = acc.getAccession();
				// if (acc.getElementOf().getId().equalsIgnoreCase("TAIR")
				// && accValue.startsWith("AT")
				// && (accValue.indexOf(".") == -1)) {
				name = acc.getAccession();
				// }
			}
			
			String label = getDefaultNameForGroupOfConcepts(c);

			// String query = "mode=network&keyword=" + keyword+"&list="+name;
			// Replace '&' with '&amp;' to make it comptaible with the new
			// d3.js-based Map View.
			String query = "mode=network&amp;keyword=" + keyword + "&amp;list=" + name;
			String uri = "OndexServlet?" + query;

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
			String query = "mode=network&amp;keyword=" + keyword + "&amp;qtl1=" + chr + ":" + start + ":" + end;
			String uri = "OndexServlet?" + query;

			sb.append("<feature>\n");
			sb.append("<chromosome>" + chr + "</chromosome>\n");
			sb.append("<start>" + start + "</start>\n");
			sb.append("<end>" + end + "</end>\n");
			sb.append("<type>qtl</type>\n");
			sb.append("<color>0xFF0000</color>\n"); // Orange
			sb.append("<label>" + label + "</label>\n");
			sb.append("<link>" + uri + "</link>\n");
			sb.append("</feature>\n");
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
                    "0x0000FF", "0x00FF00", "0x00FFFF", "0xFF0000", 
                "0xFF00FF", "0xFFFF00", "0xDBDB00", "0x00A854", "0xC20061", "0xFF7E3D", 
                "0x008F8F", "0xFF00AA", "0xFFFFAA", "0xD4A8FF", "0xA8D4FF", "0xFFAAAA", 
                "0xAA0000", "0xAA00FF", "0xAA00AA", "0xAAFF00", "0xAAFFFF", "0xAAFFAA",
                "0xAAAA00", "0xAAAAFF", "0xAAAAAA", "0x000055", "0x00FF55", "0x00AA55",
                "0x005500", "0x0055FF"};
//	  0xFFB300, # Vivid Yellow
//    0x803E75, # Strong Purple
//    0xFF6800, # Vivid Orange
//    0xA6BDD7, # Very Light Blue
//    0xC10020, # Vivid Red
//    0xCEA262, # Grayish Yellow
//    0x817066, # Medium Gray
		HashMap<String, String> trait2color = new HashMap<String, String>();
		int index = 0;

		for (QTL loci : qtlDB) {

			String type = loci.getType();
			String chrQTL = loci.getChromosome();
			Integer startQTL = loci.getStart();
			Integer endQTL = loci.getEnd();
			String label = loci.getLabel().replaceAll("\"", "");
			String trait = loci.getTrait();
                        //System.out.println("writeAnnotationXML() for MapView: type: "+ type +", chrQTL= "+ chrQTL +", label: "+ label +" & loci.TaxID= "+ loci.getTaxID());
                        
			if(!trait2color.containsKey(trait)){
				trait2color.put(trait, colorHex[index]);
				index= index+1;
				if(index == colorHex.length){
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
			sb.append("<feature>\n");
			sb.append("<chromosome>" + chrQTL + "</chromosome>\n");
			sb.append("<start>" + startQTL + "</start>\n");
			sb.append("<end>" + endQTL + "</end>\n");
			if (type.equals("QTL")) {
				sb.append("<type>qtl</type>\n");
				sb.append("<color>" + color + "</color>\n");
				sb.append("<trait>" + trait + "</trait>\n");
				sb.append("<link>http://archive.gramene.org/db/qtl/qtl_display?qtl_accession_id=" + label + "</link>\n");
			} else if (type.equals("SNP")) {
                            // add check if species TaxID (list from client/utils-config.js) contains this SNP's TaxID.
                            if(taxID.contains(loci.getTaxID())) {
                               //System.out.println("SNP: loci.getTaxID()= "+ loci.getTaxID());
				sb.append("<type>snp</type>\n");
				sb.append("<color>" + color + "</color>\n");
				sb.append("<trait>" + trait + "</trait>\n");
				sb.append("<pvalue>" + pvalue + "</pvalue>");
				sb.append("<link>http://plants.ensembl.org/arabidopsis_thaliana/Variation/Summary?v=" + label
						+ "</link>\n");
                               }
                            }

			sb.append("<label>" + label + "</label>\n");

			sb.append("</feature>\n");

		}

		sb.append("</genome>\n");
		try {
			BufferedWriter out = new BufferedWriter(new FileWriter(filename));
			out.write(sb.toString());
			out.close();
			return true;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return false;
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
	public boolean writeGeneTable(ArrayList<ONDEXConcept> candidates, Set<ONDEXConcept> userGenes, List<QTL> qtls,
			String filename, String listMode) {

		if (candidates.size() == 0) {
			System.out.println("No candidate path to display.");
			return false;
		}

		Set<Integer> userGeneIds = new HashSet<Integer>();
		if (userGenes != null) {

			Set<Integer> candidateGeneIds = new HashSet<Integer>();

			// is conversion into integer sets needed because comparing the
			// ONDEXConcept objects is not working???
			for (ONDEXConcept c : candidates) {
				candidateGeneIds.add(c.getId());
			}

			for (ONDEXConcept c : userGenes) {
				userGeneIds.add(c.getId());
				if (!candidateGeneIds.contains(c.getId())) {
					candidates.add(c);
				}
			}

		} else {
			System.out.println("No user gene list defined.");
		}

		if (qtls.isEmpty()) {
			System.out.println("No QTL regions defined.");
		}

		ONDEXGraphMetaData md = graph.getMetaData();
		AttributeName attChromosome = md.getAttributeName("Chromosome");
		AttributeName attTrait = md.getAttributeName("Trait");
		AttributeName attBegin = md.getAttributeName("BEGIN");
		AttributeName attCM = md.getAttributeName("cM");
		AttributeName attTAXID = md.getAttributeName("TAXID");
		AttributeName attSnpCons = md.getAttributeName("Transcript_Consequence");
		ConceptClass ccSNP = md.getConceptClass("SNP");

		try {
			BufferedWriter out = new BufferedWriter(new FileWriter(filename));
			out.write("ONDEX-ID\tACCESSION\tGENE NAME\tCHRO\tSTART\tTAXID\tSCORE\tUSER\tQTL\tEVIDENCE\n");
			int i = 0;
			for (ONDEXConcept gene : candidates) {
				i++;
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

				String geneName = getDefaultNameForConcept(gene);

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

				for (int hitID : luceneHits) {
					ONDEXConcept c = graph.getConcept(hitID);
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

				if (ccSNP != null) {
					Set<ONDEXRelation> rels = graph.getRelationsOfConcept(gene);
					for (ONDEXRelation rel : rels) {
						if (rel.getOfType().getId().equals("has_variation")) {
							ONDEXConcept snpConcept = rel.getToConcept();
							String ccId = "SNP";
							String name = getDefaultNameForGroupOfConcepts(snpConcept);
							if (attSnpCons != null && snpConcept.getAttribute(attSnpCons) != null)
								name = snpConcept.getAttribute(attSnpCons).getValue().toString();
							if (!cc2name.containsKey(ccId)) {
								cc2name.put(ccId, ccId + "//" + name);
							} else {
								String act_name = cc2name.get(ccId);
								act_name = act_name + "//" + name;
								cc2name.put(ccId, act_name);
							}
						}
					}

				}

				// create output string
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

				out.write(id + "\t" + geneAcc + "\t" + geneName + "\t" + chr + "\t" + beg + "\t" + geneTaxID + "\t"
						+ fmt.format(score) + "\t" + isInList + "\t" + infoQTL + "\t" + evidence + "\n");

			}
			out.close();
		} catch (IOException e) {
			// TODO: handle exception
			System.out.println(e.getMessage());
			return false;
		}
		return true;
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

	public boolean writeEvidenceTable(HashMap<ONDEXConcept, Float> luceneConcepts, Set<ONDEXConcept> userGenes,
			List<QTL> qtls, String fileName) {

		ONDEXGraphMetaData md = graph.getMetaData();
		AttributeName attChr = md.getAttributeName("Chromosome");
		AttributeName attTrait = md.getAttributeName("Trait");
		AttributeName attBeg = md.getAttributeName("BEGIN");
		AttributeName attEnd = md.getAttributeName("END");
		AttributeName attCM = md.getAttributeName("cM");

		try {
			BufferedWriter out = new BufferedWriter(new FileWriter(fileName));
			// writes the header of the table
			out.write("TYPE\tNAME\tSCORE\tGENES\tUSER GENES\tQTLS\tONDEXID\n");

			for (ONDEXConcept lc : luceneConcepts.keySet()) {
				// Creates type,name,score and numberOfGenes
				String type = lc.getOfType().getId();
				String name = getDefaultNameForGroupOfConcepts(lc);
				// All publications will have the format PMID:15487445
				if (type == "Publication" && !name.contains("PMID:"))
					name = "PMID:" + name;
				Float score = luceneConcepts.get(lc);
				DecimalFormat fmt = new DecimalFormat("0.00");
				Integer ondexId = lc.getId();
				if (!mapConcept2Genes.containsKey(lc.getId())) {
					continue;
				}
				Set<Integer> listOfGenes = mapConcept2Genes.get(lc.getId());
				Integer numberOfGenes = listOfGenes.size();
				// Creates numberOfUserGenes and numberOfQTL
				Integer numberOfUserGenes = 0;
				Integer numberOfQTL = 0;
				List<QTL> evidenceQTL = new ArrayList<QTL>();

				String infoQTL = "";
				for (int log : listOfGenes) {

					ONDEXConcept gene = graph.getConcept(log);
					if ((userGenes != null) && (gene != null) && (userGenes.contains(gene))) {
						numberOfUserGenes++;
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
				// writes the row
				out.write(type + "\t" + name + "\t" + fmt.format(score) + "\t" + numberOfGenes + "\t"
						+ numberOfUserGenes + "\t" + numberOfQTL + "\t" + ondexId + "\n");
			}
			out.close();
			return true;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}

	/**
	 * Converts a keyword into a list of terms (more than one word)
	 * 
	 * @param keyword
	 * @return null or the list of terms
	 */
	public static LinkedHashSet<String> parseKeywordIntoSetOfTerms(String keyword) {
		LinkedHashSet<String> result = new LinkedHashSet<String>();
		String key = keyword.replace("(", "");
		key = key.replace(")", "");

		key = key.replace("NOT", "___");
		key = key.replace(" AND ", "___");
		key = key.replace(" OR ", "___");
		// replace quotes with blank
		key = key.replace("\"", "");

		// System.out.println(key);

		// key = key.replaceAll("\\s+", " ");

		for (String k : key.split("___")) {
			result.add(k.trim());
			// System.out.println("subkeyword for synonym table: "+k.trim());
		}
		System.out.println("keys: " + result);
		return result;
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

	public boolean writeSynonymTable(String keyword, String fileName) throws ParseException {
		int topX = 25;
		// to store top 25 values for each concept type instead of just 25
		// values per keyword.
		int existingCount = 0;
		/* Set<String> */LinkedHashSet<String> keys = parseKeywordIntoSetOfTerms(keyword);
		try {
			// Convert the LinkedHashSet to a String[] array.
			String[] synonymKeys = keys.toArray(new String[keys.size()]);
			BufferedWriter out = new BufferedWriter(new FileWriter(fileName));
			// for (String key : keys) {
			for (int k = synonymKeys.length - 1; k >= 0; k--) {
				String key = synonymKeys[k];
				Analyzer analyzer = new StandardAnalyzer(Version.LUCENE_36);
				Map<Integer, Float> synonymsList = new HashMap<Integer, Float>();
				FloatValueComparator comparator = new FloatValueComparator(synonymsList);
				TreeMap<Integer, Float> sortedSynonymsList = new TreeMap<Integer, Float>(comparator);
				// System.out.println("\n writeSynonymTable: Keyword: "+ key);
				// a HashMap to store the count for the number of values written
				// to the Synonym Table (for each Concept Type).
				Map<String, Integer> entryCounts_byType = new HashMap<String, Integer>();

				out.write("<" + key + ">\n");

				// search concept names
				String fieldNameCN = getFieldName("ConceptName", null);
				QueryParser parserCN = new QueryParser(Version.LUCENE_36, fieldNameCN, analyzer);
				Query qNames = parserCN.parse(key);
				ScoredHits<ONDEXConcept> hitSynonyms = lenv.searchTopConcepts(qNames, 500/* 100 */);
				/*
				 * number of top concepts searched for each Lucene field,
				 * increased for now from 100 to 500, until Lucene code is
				 * ported from Ondex to QTLNetMiner, when we'll make changes to
				 * the QueryParser code instead.
				 */

				for (ONDEXConcept c : hitSynonyms.getOndexHits()) {
					if (c instanceof LuceneConcept) {
						c = ((LuceneConcept) c).getParent();
					}
					if (!synonymsList.containsKey(c.getId()) && !synonymsList.containsValue(key)) {
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
					// Creates a sorted list of synonyms
					sortedSynonymsList.putAll(synonymsList);

					// writes the topX values in table
					int topAux = 0;
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
										out.write(name + "\t" + type + "\t" + score.toString() + "\t" + id + "\n");
										topAux++;
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
				}

				out.write("</" + key + ">\n");
			}
			out.close();
			return true;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
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
	 * Parses the semantic motif file
	 * 
	 * @param path
	 *            to the semantic motif file
	 * @return Graph Traverser
	 */
	private GraphTraverser getGraphTraverser(String path, InputStream stream) {

		StateMachineFlatFileParser2 smp = new StateMachineFlatFileParser2();

		try {
			smp.parseReader(new BufferedReader(new InputStreamReader(stream)), graph);
		} catch (InvalidFileException e) {
			e.printStackTrace();
		} catch (StateMachineInvalidException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

		System.out.println("Semantic motifs loaded: " + path);

		return new GraphTraverser(smp.getStateMachine());
	}

	/**
	 * Create a name for concepts
	 * 
	 * @param c
	 *            ONDEXConcept
	 * @return normalised name
	 */
	private String getDefaultNameForConcept(ONDEXConcept c) {
		String name = null;

		// this is the preferred concept name
		ConceptName cn = c.getConceptName();

		// use accessions as alternatives
		Set<ConceptAccession> accs = c.getConceptAccessions();

		if (cn != null && cn.getName().trim().length() > 0)
			name = cn.getName().trim();
		else if (accs.size() > 0)
			for (ConceptAccession acc : accs) {
				if (acc.getAccession().trim().length() > 0) {
					if (acc.getElementOf().equals(c.getElementOf())) {
						// prefer native accession
						name = acc.getAccession().trim();
						break;
					}
					name = acc.getAccession().trim();
				}

			}
		else
			name = "null";

		return name;
	}

	/**
	 * Returns the shortest preferred Name from a set of concept Names or ""
	 * [Gene|Protein][Phenotype][The rest]
	 * 
	 * @param cns
	 *            Set<ConceptName>
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
	 * @param accs
	 *            Set<ConceptAccession>
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
	 * @param c
	 *            ONDEXConcept
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
//		} else if (ct == "Phenotype") {
//			AttributeName att = graph.getMetaData().getAttributeName("Phenotype");
//			cn = c.getAttribute(att).getValue().toString().trim();
//	
//		} 
//		else if (ct == "Trait") {
//			AttributeName att = graph.getMetaData().getAttributeName("Study");
//			cn = c.getAttribute(att).getValue().toString().trim();
//		} 
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

	/**
	 * Check if the file exists in the file system
	 * 
	 * @param exportPath
	 * @return boolean
	 */
	public boolean checkFileExist(String exportPath) {

		File f = new File(exportPath);

		if (f.exists())
			return true;
		else
			return false;
	}

	public void setTaxId(List<String> id) {
		this.taxID = id;
	}
	
	public void setExportVisible(boolean export_visible_network) {
		this.export_visible_network = export_visible_network;
		
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
	 * @param chr
	 *            chromosome name as used in GViewer
	 * @param start
	 *            start position
	 * @param end
	 *            end position
	 * 
	 * @return 0 if no genes found, otherwise number of genes at specified loci
	 */
	public int getGeneCount(String chr, int start, int end) {

		AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");
		AttributeName attChr = graph.getMetaData().getAttributeName("Chromosome");
	//	AttributeName attLoc = graph.getMetaData().getAttributeName("Location");
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
            // TEMPORARY FIX, to be disabled for new .oxl species networks that have string 'Chrosmosome' (instead of the older integer Chromosome) & don't have a string 'Location' attribute.
                            /*    if(gene.getAttribute(attLoc) != null) {
                                   // if String Location exists, use that instead of integer Chromosome as client-side may use String Location in basemap.
                                   geneChr= gene.getAttribute(attLoc).getValue().toString();
                                  }*/

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
	 * 
	 * This method populates a HashMap with concepts from KB as keys and list of
	 * genes presented in their motifs
	 * 
	 */
	public void populateHashMaps() {
		System.out.println("Populate HashMaps");
		File file1 = new File("mapConcept2Genes");
		File file2 = new File("mapGene2Concepts");

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

		if (!file1.exists() || !file2.exists()) {

			// the results give us a map of every starting concept to every
			// valid path
			Map<ONDEXConcept, List<EvidencePathNode>> results = gt.traverseGraph(graph, genes, null);

			mapConcept2Genes = new HashMap<Integer, Set<Integer>>();
			mapGene2Concepts = new HashMap<Integer, Set<Integer>>();
			for (List<EvidencePathNode> paths : results.values()) {
				for (EvidencePathNode path : paths) {

					// search last concept of semantic motif for keyword
					ONDEXConcept gene = (ONDEXConcept) path.getStartingEntity();

					// add all semantic motifs to the new graph
					Set<ONDEXConcept> concepts = path.getAllConcepts();

					// GENE 2 CONCEPT
					if (!mapGene2Concepts.containsKey(gene.getId())) {
						Set<Integer> setConcepts = new HashSet<Integer>();
						for (ONDEXConcept c : concepts) {
							setConcepts.add(c.getId());
						}
						mapGene2Concepts.put(gene.getId(), setConcepts);
					} else {
						Set<Integer> setConcepts = new HashSet<Integer>();
						for (ONDEXConcept c : concepts) {
							setConcepts.add(c.getId());
						}
						mapGene2Concepts.get(gene.getId()).addAll(setConcepts);
					}

					// CONCEPT 2 GENE
					concepts.remove(gene);
					for (ONDEXConcept c : concepts) {
						if (!mapConcept2Genes.containsKey(c.getId())) {
							Set<Integer> setGenes = new HashSet<Integer>();
							setGenes.add(gene.getId());
							mapConcept2Genes.put(c.getId(), setGenes);
						} else {
							mapConcept2Genes.get(c.getId()).add(gene.getId());
						}
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

			} catch (Exception e) {
				e.printStackTrace();
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

			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		System.out.println("Populated Gene2Concept with #mappings: " + mapGene2Concepts.size());
		System.out.println("Populated Concept2Gene with #mappings: " + mapConcept2Genes.size());

		System.out.println("Create Gene2QTL map now...");

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

		System.out.println("Populated Gene2QTL with #mappings: " + mapGene2QTL.size());
	}

	public ArrayList<ONDEXConcept> filterQTLs(ArrayList<ONDEXConcept> genes, List<QTL> qtls) {
		Set<ONDEXConcept> genesQTL = searchQTLs(qtls);
		genes.retainAll(genesQTL);
		return genes;
	}


}

class ValueComparator implements Comparator {

	Map base;

	public ValueComparator(Map base) {
		this.base = base;
	}

	public int compare(Object a, Object b) {

		if ((Double) base.get(a) < (Double) base.get(b)) {
			return 1;
		} else if ((Double) base.get(a) == (Double) base.get(b)) {
			return 0;
		} else {
			return -1;
		}
	}
}

class FloatValueComparator implements Comparator {

	Map base;

	public FloatValueComparator(Map base) {
		this.base = base;
	}

	public int compare(Object a, Object b) {
		if (base == null) {
			System.out.println("base is null");
		}
		if (a == null) {
			System.out.println("A null found");
		}
		if ((Float) base.get(a) == null) {
			System.out.println("A content null found");
		}
		if (b == null) {
			System.out.println("B null found");
		}
		if ((Float) base.get(b) == null) {
			System.out.println("B content null found");
		}
		if ((Float) base.get(a) < (Float) base.get(b)) {
			return 1;
		} else if ((Float) base.get(a) == (Float) base.get(b)) {
			return 0;
		} else {
			return -1;
		}
	}
}
