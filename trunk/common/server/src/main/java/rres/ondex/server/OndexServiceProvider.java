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
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
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
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;
import net.sourceforge.ondex.core.ONDEXGraphMetaData;
import net.sourceforge.ondex.core.ONDEXRelation;
import net.sourceforge.ondex.core.base.ConceptAccessionImpl;
import net.sourceforge.ondex.core.memory.MemoryONDEXGraph;
import net.sourceforge.ondex.core.searchable.LuceneConcept;
import net.sourceforge.ondex.core.searchable.LuceneEnv;
import net.sourceforge.ondex.core.searchable.LuceneQueryBuilder;
import net.sourceforge.ondex.core.searchable.ScoredHits;
import net.sourceforge.ondex.exception.type.PluginConfigurationException;
import net.sourceforge.ondex.export.oxl.Export;
import net.sourceforge.ondex.filter.unconnected.ArgumentNames;
import net.sourceforge.ondex.filter.unconnected.Filter;
import net.sourceforge.ondex.parser.oxl.Parser;
import net.sourceforge.ondex.tools.ondex.ONDEXGraphCloner;

import org.apache.commons.collections15.BidiMap;
import org.apache.commons.collections15.bidimap.DualHashBidiMap;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
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
	BidiMap<Integer, String> chromBidiMap = new DualHashBidiMap<Integer, String>();

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
	HashMap<Integer, Set<Integer>> mapGene2Concepts;
	HashMap<Integer, Set<Integer>> mapConcept2Genes;
	
	/**
	 * Query-dependent mapping between genes and concepts that contain query terms
	 */
	HashMap<Integer, Set<Integer>> mapGene2HitConcept;
	
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
	String taxID;

	/**
	 * Loads configuration for chromosomes and initialises map
	 */
	OndexServiceProvider() {

	}

	public void loadConfig() {
		Properties chromConfig = new Properties();

		System.out.println("QTLNetMiner configured for taxonomy id: " + taxID);

		// load chromosomes configuration from file
		URL configUrl = Thread.currentThread().getContextClassLoader()
				.getResource("chromosomes.xml");
		try {
			chromConfig.loadFromXML(configUrl.openStream());
		} catch (IOException e) {
			e.printStackTrace();
		}

		// add to bi-directional map
		for (String key : chromConfig.stringPropertyNames()) {
			chromBidiMap.put(Integer.valueOf(key), chromConfig.getProperty(key));
		}

	}

	/**
	 * Load OXL data file into memory Build Lucene index for the Ondex graph
	 * Create a state machine for semantic motif search
	 * 
	 * @throws ArrayIndexOutOfBoundsException
	 * @throws PluginConfigurationException
	 */
	public void createGraph(String fileName)
			throws ArrayIndexOutOfBoundsException, PluginConfigurationException {

		System.out.println("Loading graph...");

		// new in-memory graph
		graph = new MemoryONDEXGraph("OndexKB");

		loadOndexKBGraph(fileName);
		indexOndexGraph();
		
		StateMachine sm = loadSemanticMotifs();
		
		// create a crawler using our semantic motifs
		gt = new GraphTraverser(sm);
		
		populateHashMaps();
		
		//determine number of genes in given species (taxid)
		AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");
		ConceptClass ccGene = graph.getMetaData().getConceptClass("Gene");
		Set<ONDEXConcept> seed = graph.getConceptsOfConceptClass(ccGene);
		
		for (ONDEXConcept gene : seed) {		
			if (gene.getAttribute(attTAXID) != null
					&& gene.getAttribute(attTAXID).getValue().toString()
							.equals(taxID)) {
				numGenesInGenome++;
			}
		}
		

		System.out.println("Done. Waiting for queries...");
	}

	/**
	 * Loads OndexKB Graph (OXL data file into memory)
	 */
	private void loadOndexKBGraph(String fileName) {
		try {
			System.out.println("Start Loading OndexKB Graph..."+fileName);
			Parser oxl = new Parser();
			ONDEXPluginArguments pa = new ONDEXPluginArguments(
					oxl.getArgumentDefinitions());
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
		AttributeName attChromosome = graph.getMetaData().getAttributeName(
				"Chromosome");
		AttributeName attScaffold = graph.getMetaData().getAttributeName(
				"Scaffold");
		AttributeName attBegin = graph.getMetaData().getAttributeName("BEGIN");
		AttributeName attEnd = graph.getMetaData().getAttributeName("END");
		AttributeName attTaxID = graph.getMetaData().getAttributeName("TAXID");

		for (ONDEXConcept concept : graph.getConceptsOfConceptClass(ccGene)) {
			Attribute attT = concept.getAttribute(attTaxID);
			Attribute attC = concept.getAttribute(attChromosome);
			Attribute attS = concept.getAttribute(attScaffold);
			Attribute attB = concept.getAttribute(attBegin);
			Attribute attE = concept.getAttribute(attEnd);

			if ((attC == null && attS == null) || (attB == null)
					|| (attE == null)) {
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
			System.out.println("Building Lucene Index: "
					+ file.getAbsolutePath());
			if(!file.exists())
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
			URL motifsUrl = Thread.currentThread().getContextClassLoader()
					.getResource("SemanticMotifs.txt");
			


			smp = new StateMachineFlatFileParser2();
			try {
				if(file.exists()){
					System.out.println("Building State Machine from: "
							+ file.getAbsolutePath());
					
					smp.parseReader(new BufferedReader(new FileReader(file)), graph);
					
				}else{
					System.out.println("Building State Machine from: "
							+ motifsUrl.getFile());
					
					smp.parseReader(new BufferedReader(new InputStreamReader(
						motifsUrl.openStream())), graph);
					
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
	 * Export the Ondex graph to file system
	 * 
	 * @param ONDEXGraph
	 *            graph
	 * @throws InvalidPluginArgumentException
	 */
	public boolean exportGraph(ONDEXGraph og, String exportPath)
			throws InvalidPluginArgumentException {

		boolean fileIsCreated = false;

		// Unconnected filter
		Filter uFilter = new Filter();
		ONDEXPluginArguments uFA = new ONDEXPluginArguments(
				uFilter.getArgumentDefinitions());
		uFA.addOption(ArgumentNames.REMOVE_TAG_ARG, true);

		uFilter.setArguments(uFA);
		uFilter.setONDEXGraph(og);
		uFilter.start();

		ONDEXGraph graph2 = new MemoryONDEXGraph("FilteredGraphUnconnected");
		uFilter.copyResultsToNewGraph(graph2);

		// oxl export
		Export export = new Export();
		export.setLegacyMode(true);
		ONDEXPluginArguments ea = new ONDEXPluginArguments(
				export.getArgumentDefinitions());
		ea.setOption(FileArgumentDefinition.EXPORT_FILE, exportPath);
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

		// Check if file exists
		while (!fileIsCreated) {
			fileIsCreated = checkFileExist(exportPath);
		}
		System.out.println("OXL file created:" + exportPath);
		return fileIsCreated;
	}
	
	// JavaScript Document

	/**
	 * Creates a new keyword for finding the NOT list
	 * 
	 * @param keyword original keyword
	 * @return new keyword for searching the NOT list
	 */
	private String createsNotList(String keyword){
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
				if(notCount > 0){
					result = result+keyN+" OR ";
				}
				notCount++;
			}
		}
		if(result != ""){
			result = result.substring(0, (result.length()-3));
		}
		return result;		
	}
	
	/**
	 * Merge two maps using the greater scores
	 * 
	 * @param hit2score map that holds all hits and scores
	 * @param sHits map that holds search results
	 */
	private void mergeHits(HashMap<ONDEXConcept,Float> hit2score, ScoredHits<ONDEXConcept> sHits, ScoredHits<ONDEXConcept> NOTHits){
		for(ONDEXConcept c : sHits.getOndexHits()){
			if(NOTHits == null || !NOTHits.getOndexHits().contains(c)){
				if (c instanceof LuceneConcept) {
					c = ((LuceneConcept) c).getParent();
				}	
				if(!hit2score.containsKey(c)){
					hit2score.put(c, sHits.getScoreOnEntity(c));
				}else{
					float scoreA = sHits.getScoreOnEntity(c);
					float scoreB = hit2score.get(c);
					if(scoreA > scoreB){
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
		String[] datasources = {"PFAM", "IPRO", "UNIPROTKB", "EMBL", "KEGG", "EC", "GO", "TO", "NLM", "TAIR", "ENSEMBLGENE"};
		Set<String> dsAcc = new HashSet<String>(Arrays.asList(datasources));
		
		HashMap<ONDEXConcept, Float> hit2score = new HashMap<ONDEXConcept, Float>();
		
		Analyzer analyzer = new StandardAnalyzer(Version.LUCENE_36);

		
		String keyword = keywords;
			
			//creates the NOT list (list of all the forbidden documents)
			String NOTQuery = createsNotList(keyword);
			String crossTypesNotQuery = "";
			ScoredHits<ONDEXConcept> NOTList = null;
			if(NOTQuery != ""){
				crossTypesNotQuery = "tConceptAttribute_AbstractHeader:("+NOTQuery+") OR ConceptAttribute_Abstract:("+NOTQuery+") OR Annotation:("+NOTQuery+") OR ConceptName:("+NOTQuery+") OR ConceptID:("+NOTQuery+")";
				String fieldNameNQ = getFieldName("ConceptName",null);
			    QueryParser parserNQ = new QueryParser(Version.LUCENE_36, fieldNameNQ , analyzer);
			    Query qNQ = parserNQ.parse(crossTypesNotQuery);
				NOTList = lenv.searchTopConcepts(qNQ, 2000);
			}
			
			
			
		
			// search concept attributes
			for (AttributeName att : atts) {
//				Query qAtt = LuceneQueryBuilder.searchConceptByConceptAttributeExact(att, keyword);
//				ScoredHits<ONDEXConcept> sHits = lenv.searchTopConcepts(qAtt, 100);
//				mergeHits(hit2score, sHits);

				String fieldName = getFieldName("ConceptAttribute", att.getId());
			    QueryParser parser = new QueryParser(Version.LUCENE_36, fieldName , analyzer);
			    Query qAtt = parser.parse(keyword);
				ScoredHits<ONDEXConcept> sHits = lenv.searchTopConcepts(qAtt, 100);
				mergeHits(hit2score, sHits, NOTList);
			    
			}
			for (String dsAc : dsAcc) {
				// search concept accessions
				//Query qAccessions = LuceneQueryBuilder.searchConceptByConceptAccessionExact(keyword, false, dsAcc);
				String fieldName = getFieldName("ConceptAccessions",dsAc);
			    QueryParser parser = new QueryParser(Version.LUCENE_36, fieldName , analyzer);
			    Query qAccessions = parser.parse(keyword);
				ScoredHits<ONDEXConcept> sHitsAcc = lenv.searchTopConcepts(qAccessions, 100);
				mergeHits(hit2score, sHitsAcc, NOTList);				
			}

			// search concept names
			//Query qNames = LuceneQueryBuilder.searchConceptByConceptNameExact(keyword);
			String fieldNameCN = getFieldName("ConceptName",null);
		    QueryParser parserCN = new QueryParser(Version.LUCENE_36, fieldNameCN , analyzer);
		    Query qNames = parserCN.parse(keyword);
			ScoredHits<ONDEXConcept> sHitsNames = lenv.searchTopConcepts(qNames, 100);
			mergeHits(hit2score, sHitsNames, NOTList);
			
			
			// search concept description
			//Query qDesc = LuceneQueryBuilder.searchConceptByDescriptionExact(keyword);
			String fieldNameD = getFieldName("Description",null);
		    QueryParser parserD = new QueryParser(Version.LUCENE_36, fieldNameD , analyzer);
		    Query qDesc = parserD.parse(keyword);
			ScoredHits<ONDEXConcept> sHitsDesc = lenv.searchTopConcepts(qDesc, 100);
			mergeHits(hit2score, sHitsDesc, NOTList);
			
			// search concept annotation			
			//Query qAnno = LuceneQueryBuilder.searchConceptByAnnotationExact(keyword);
			String fieldNameCA = getFieldName("Annotation",null);
		    QueryParser parserCA = new QueryParser(Version.LUCENE_36, fieldNameCA , analyzer);
		    Query qAnno = parserCA.parse(keyword);
			ScoredHits<ONDEXConcept> sHitsAnno = lenv.searchTopConcepts(qAnno, 100);		
			mergeHits(hit2score, sHitsAnno, NOTList);
			
			System.out.println("Query: "+qAnno.toString(fieldNameCA));
			System.out.println("Annotation hits: "+sHitsAnno.getOndexHits().size());
			
			
		return hit2score;		
	}
	
	
	public ArrayList<ONDEXConcept> getScoredGenes(HashMap<ONDEXConcept, Float> hit2score) throws IOException {
		
		ArrayList<ONDEXConcept> candidateGenes = new ArrayList<ONDEXConcept>();			
		scoredCandidates = new HashMap<ONDEXConcept, Double>(); 
		ValueComparator comparator =  new ValueComparator(scoredCandidates);
		TreeMap<ONDEXConcept, Double> sortedCandidates = new TreeMap<ONDEXConcept, Double>(comparator);
		
		System.out.println("total hits from lucene: "+hit2score.keySet().size());

		//1st step: create map of genes to concepts that contain query terms (keywords)
		mapGene2HitConcept = new HashMap<Integer, Set<Integer>>();
		for (ONDEXConcept c : hit2score.keySet()) {	
			
			//hit concept not connected via valid path to any gene
			if(!mapConcept2Genes.containsKey(c.getId())){
				continue;
			}
			Set<Integer> genes = mapConcept2Genes.get(c.getId());
			for(int geneId : genes){
				if(!mapGene2HitConcept.containsKey(geneId)){
					mapGene2HitConcept.put(geneId, new HashSet<Integer>());
				}

				mapGene2HitConcept.get(geneId).add(c.getId());
			}
		}
		
		//2nd step: calculate a score for each candidate gene
		for(int geneId : mapGene2HitConcept.keySet()){
			
			//implementing an analogous score to tf-idf used in information retrieval
			//reflects how important a term is to a gene in a collection (genome)
			
			//term document frequency
			double tdf = (double)mapGene2HitConcept.get(geneId).size()/(double)mapGene2Concepts.get(geneId).size();
			
			//inverse document frequency
			double idf = 0;
			for(int cId : mapGene2HitConcept.get(geneId)){
				//use a weight that is the initial lucene tf-idf score of hit concept
				float luceneScore = hit2score.get(graph.getConcept(cId));
				idf += Math.log10((double)numGenesInGenome/mapConcept2Genes.get(cId).size()) * luceneScore;
			}
			//take the mean of all idf scores
			idf = idf / mapGene2HitConcept.get(geneId).size();
			double score = tdf * idf;
			scoredCandidates.put(graph.getConcept(geneId), score);
		}
						
		sortedCandidates.putAll(scoredCandidates);	
		candidateGenes = new ArrayList<ONDEXConcept>(sortedCandidates.keySet());
		return candidateGenes;				
	}
	
	/**
	 * From the given set concepts (genes) here we return those associated with the keyword.
	 * 
	 * @param List<String> list
	 * @param String keyword
	 * 
	 * @return ArrayList<ONDEXConcept> genes
	 */
	public Set<ONDEXConcept> searchList(Set<ONDEXConcept> list, String keyword){
		Set<ONDEXConcept> relatedGenes = new HashSet<ONDEXConcept>();		
		if(list.size() > 0){
			Iterator<ONDEXConcept> itr = list.iterator();
			ONDEXConcept concept;
			while(itr.hasNext()){						
				concept = itr.next();			
				Set<Integer> accessions = mapGene2Concepts.get(concept.getId());				
				for(Integer acc : accessions){
					ONDEXConcept linkedConcept = graph.getConcept(acc);
					if (OndexSearch.find(linkedConcept, keyword, false)) {				
						relatedGenes.add(concept);
						break;
					}					
				}
			}
		}
		System.out.println("related genes size: "+relatedGenes.size());
		return relatedGenes;		
	}
	
	/**
	 * Searches for genes within genomic regions (QTLs)
	 * 
	 * @param List<QTL> qtls
	 * 
	 * @return Set<ONDEXConcept> concepts
	 */
	public Set<ONDEXConcept> searchQTLs(List<QTL> qtls) {
		Set<ONDEXConcept> concepts = new HashSet<ONDEXConcept>();		
					
		long chrQTL, startQTL, endQTL;
		for(QTL qtl : qtls) {
			try {
				chrQTL = qtl.getChrIndex();
				startQTL = Long.parseLong(qtl.getStart());
				endQTL = Long.parseLong(qtl.getEnd());
				// swap start with stop if start larger than stop
				if (startQTL > endQTL) {
					long tmp = startQTL;
					startQTL = endQTL;
					endQTL = tmp;
				}
				ConceptClass ccGene = graph.getMetaData().getConceptClass("Gene");
				AttributeName attBegin = graph.getMetaData().getAttributeName("BEGIN");
				AttributeName attChromosome = graph.getMetaData().getAttributeName("Chromosome");
				AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");
				Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass(ccGene);
				
				for (ONDEXConcept c : genes) {
					int  chrGene = 0, startGene = 0;
					if (c.getAttribute(attTAXID) == null ||
							!c.getAttribute(attTAXID).getValue().toString()
									.equals(taxID)) {
						continue;
					}
					if (c.getAttribute(attChromosome) != null) {
						chrGene = (Integer) c.getAttribute(attChromosome).getValue();
					}
					if (c.getAttribute(attBegin) != null) {
						startGene = (Integer) c.getAttribute(attBegin).getValue();
					}				 
					if(chrGene != 0 && startGene != 0) {
						if (chrQTL == chrGene && startGene >= startQTL && startGene <= endQTL) {
							concepts.add(c);
						}
					}								
				}
			}
			catch(Exception e){
				System.out.println("Not valid qtl"+e.getMessage());
			}
		}
		return concepts;					
	}
	
	
	/**
	 * Searches the knowledge base for QTL concepts that match any of the user input terms
	 * @param keyword
	 * @return list of QTL objects
	 */
	public List<QTL> findQTL(String keyword){
		
		ConceptClass ccTrait = graph.getMetaData().getConceptClass("Trait");
		ConceptClass ccQTL = graph.getMetaData().getConceptClass("QTL");
		
		//no Trait-QTL relations found
		if(ccTrait == null || ccQTL == null) {
			return new ArrayList<QTL>();
		}
		
		AttributeName attBegin = graph.getMetaData().getAttributeName("BEGIN");
		AttributeName attEnd = graph.getMetaData().getAttributeName("END");
		AttributeName attSignificance = graph.getMetaData().getAttributeName("Significance");
		AttributeName attChromosome = graph.getMetaData().getAttributeName("Chromosome");
		Set<ONDEXConcept> concepts = graph.getConceptsOfConceptClass(ccTrait);
		
		List<QTL> results = new ArrayList<QTL>();
		
		// Trait linked to QTL
		for(ONDEXConcept conTrait : concepts){
				//trait concept matches input terms
				if(OndexSearch.find(conTrait, keyword, false)){
					
					Set<ONDEXRelation> rels = graph.getRelationsOfConcept(conTrait);
					for(ONDEXRelation r : rels){
						//get QTL concept
						if(r.getToConcept().getOfType().equals(ccQTL)){
							//QTL-->Trait
							ONDEXConcept conQTL = r.getFromConcept();
							if(conQTL.getAttribute(attChromosome) != null){
								int chr = (Integer) conQTL.getAttribute(attChromosome).getValue();
								String chrName = chromBidiMap.get(chr);
								String start = conQTL.getAttribute(attBegin).getValue().toString();
								String end = conQTL.getAttribute(attEnd).getValue().toString();
								String label = conQTL.getConceptName().getName();
								String significance = "";
								if(conQTL.getAttribute(attSignificance) != null)
									significance = conQTL.getAttribute(attSignificance).getValue().toString();
				
								results.add(new QTL(chr, chrName, start, end, label, significance));
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
		System.out.println("get genes function "+ids.length);
		AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");

		Set<ONDEXConcept> seed = new HashSet<ONDEXConcept>();

		for (int id : ids) {
			ONDEXConcept c = graph.getConcept(id);
			if (c.getAttribute(attTAXID) != null
					&& c.getAttribute(attTAXID).getValue().toString()
							.equals(taxID)) {
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
	 * @param List<String> accessions
	 * @return Set<ONDEXConcept>
	 */
	public Set<ONDEXConcept> searchGenes(List<String> accessions) {
		
		if(accessions.size() > 0){
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
						&& gene.getAttribute(attTAXID).getValue().toString()
								.equals(taxID)) {
	
					// search gene accessions, names, attributes
					if (OndexSearch.find(gene, query, false)) {
						hits.add(gene);
					}
				}
			}
			return hits;
		}
		else {
			return null;
		}
	}

	public ONDEXGraph findSemanticMotifsOld(Set<ONDEXConcept> seed, String regex) {
		
		System.out.println("Method findSemanticMotifs: "+seed.size());
		// the results give us a map of every starting concept to every valid path
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
					if(!keywordConcepts.contains(cloneCon)){
						keywordConcepts.add(cloneCon);
						//only highlight keywords once
						OndexSearch.find(cloneCon, regex, true);
					}
					
					// annotate the semantic motif in the new Ondex graph
					highlightPath(path, graphCloner);
				}
			}
		}
		
		ONDEXGraphRegistry.graphs.remove(subGraph.getSID());

		System.out.println("Number of seed genes: " + seed.size());
		System.out.println("Keyword(s) were found in " + keywordConcepts.size()
				+ " concepts.");
		System.out.println("Number of candidate genes " + candidateGenes.size());

		return subGraph;
	}
	
	
	/**
	 * Searches with Lucene for documents, finds semantic motifs
	 * and by crossing this data makes concepts visible, changes
	 * the size and highlight the hits
	 * 
	 * @param seed
	 *            List of selected genes
	 * @param keyword
	 * @return subGraph           
	 */
	public ONDEXGraph findSemanticMotifs(Set<ONDEXConcept> seed, String keyword) {
		System.out.println("Method findSemanticMotifs - keyword: "+keyword);
		//Searches with Lucene: luceneResults
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
		
		// the results give us a map of every starting concept to every valid path
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
				
				if(luceneResults.containsKey(keywordCon)){
					// annotate the semantic motif in the new Ondex graph
					highlightPath(path, graphCloner);
				}
				
				ONDEXConcept cloneCon = graphCloner.cloneConcept(keywordCon);
				// if keyword provided, annotate the
				
				if(!keywordConcepts.contains(cloneCon)){
					if(OndexSearch.highlight(cloneCon, keyword)){
						candidateGenes.add(gene);
					}
					keywordConcepts.add(cloneCon);
				}
			}
		}
		
		ONDEXGraphRegistry.graphs.remove(subGraph.getSID());

		System.out.println("Number of seed genes: " + seed.size());
//		System.out.println("Keyword(s) were found in " + keywordConcepts.size()
//				+ " concepts.");
		System.out.println("Number of candidate genes " + candidateGenes.size());

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
	public void highlightPath(EvidencePathNode path,
			ONDEXGraphCloner graphCloner) {

		Font fontHighlight = new Font("sansserif", Font.BOLD, 20);
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		XMLEncoder encoder = new XMLEncoder(bos);
		encoder.writeObject(fontHighlight);
		encoder.close();

		ONDEXGraphMetaData md = graphCloner.getNewGraph().getMetaData();

		AttributeName attSize = md.getAttributeName("size");
		if (attSize == null)
			attSize = md.getFactory()
					.createAttributeName("size", Integer.class);

		AttributeName attVisible = md.getAttributeName("visible");
		if (attVisible == null)
			attVisible = md.getFactory().createAttributeName("visible",
					Boolean.class);

		AttributeName attFlagged = md.getAttributeName("flagged");
		if (attFlagged == null)
			attFlagged = md.getFactory().createAttributeName("flagged",
					Boolean.class);
		
		
		// search last concept of semantic motif for keyword
		int indexLastCon = path.getConceptsInPositionOrder().size() - 1;

		ONDEXConcept gene = null;
		ONDEXConcept con = null;

		if (((ONDEXConcept) path.getStartingEntity()).getOfType().getId().equals("Gene")) {
			// first element is gene and last element the keyword concept
			gene = (ONDEXConcept) path.getStartingEntity();
			con = (ONDEXConcept) path.getConceptsInPositionOrder().get(indexLastCon);
		} 
		
//		else {
//			// last element must be the gene
//			con = (ONDEXConcept) path.getStartingEntity();
//			gene = (ONDEXConcept) path.getConceptsInPositionOrder().get(indexLastCon);
//		}

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
			g.createAttribute(attSize, new Integer(30), false);
			g.createAttribute(attVisible, true, false);
			g.createAttribute(attFlagged, true, false);
		} else {
			Integer size = (Integer) g.getAttribute(attSize).getValue();
			size++;
			g.getAttribute(attSize).setValue(size);
		}

		// annotate path connecting gene to keyword concept
		Set<ONDEXRelation> rels = path.getAllRelations();
		for (ONDEXRelation rel : rels) {
			ONDEXRelation r = graphCloner.cloneRelation(rel);
			if (r.getAttribute(attSize) == null) {
				// initial size
				r.createAttribute(attSize, new Integer(3), false);
				r.createAttribute(attVisible, true, false);
			} else {
				// increase size for more supporting evidence
				Integer size = (Integer) r.getAttribute(attSize).getValue();
				size++;
				r.getAttribute(attSize).setValue(size);
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
	 * Write GViewer confirm annotation XML file
	 * 
	 * @param genes
	 *            list of genes to be displayed
	 * @param keyword
	 *            user-specified keyword
	 */
	public boolean writeAnnotationXML(ArrayList<ONDEXConcept> genes,
			Set<ONDEXConcept> userGenes, List<QTL> qtls, String filename,
			String keyword, int maxGenes, Hits hits, String listMode) {
		if (genes.size() == 0) {
			System.out.println("No genes to display.");
			return false;
		}
		Set<ONDEXConcept> usersRelatedGenes = hits.getUsersRelatedGenes();
		Set<ONDEXConcept> usersUnrelatedGenes = hits.getUsesrUnrelatedGenes();
		ONDEXGraphMetaData md = graph.getMetaData();
		AttributeName attChr = md.getAttributeName("Chromosome");
		AttributeName attBeg = md.getAttributeName("BEGIN");
		AttributeName attEnd = md.getAttributeName("END");
		StringBuffer sb = new StringBuffer();
		sb.append("<?xml version=\"1.0\" standalone=\"yes\"?>\n");
		sb.append("<genome>\n");
		int id = 0;

		// genes are grouped in three portions based on size
		int size = genes.size();
		if (genes.size() > maxGenes)
			size = maxGenes;

		for (ONDEXConcept c : genes) {
			id++;

			// only genes that are on chromosomes (not scaffolds)
			// can be displayed in GViewer
			if (c.getAttribute(attChr) == null)
				continue;

			String name = c.getPID();

			for (ConceptAccession acc : c.getConceptAccessions()) {
				String accValue = acc.getAccession();
				//if (acc.getElementOf().getId().equalsIgnoreCase("TAIR")
				//		&& accValue.startsWith("AT")
				//		&& (accValue.indexOf(".") == -1)) {
					name = acc.getAccession();
				//}
			}

			String chr = c.getAttribute(attChr).getValue().toString();
			String chrLatin = chromBidiMap.get(Integer.valueOf(chr));
			String beg = c.getAttribute(attBeg).getValue().toString();
			String end = c.getAttribute(attEnd).getValue().toString();

			if (id > maxGenes)
				break;

			String query = "mode=network&keyword=" + keyword+"&list="+name;
			String uri = "OndexServlet?" + query;

			// Genes
			sb.append("<feature id=\"" + id + "\">\n");
			sb.append("<chromosome>" + chrLatin + "</chromosome>\n");
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
			sb.append("<label>" + name + "</label>\n");
			sb.append("<link>" + uri + "</link>\n");
			sb.append("</feature>\n");
		}

		if (usersRelatedGenes != null && usersRelatedGenes.size() > 0) {
			for (ONDEXConcept u : usersRelatedGenes) {
				// only genes that are on chromosomes (not scaffolds)
				// can be displayed in GViewer
				if (u.getAttribute(attChr) == null)
					continue;

				String name = u.getPID();

				for (ConceptAccession acc : u.getConceptAccessions()) {
					String accValue = acc.getAccession();
					//if (acc.getElementOf().getId().equalsIgnoreCase("TAIR")
					//		&& accValue.startsWith("AT")
					//		&& (accValue.indexOf(".") == -1)) {
						name = acc.getAccession();
					//}
				}

				String chr = u.getAttribute(attChr).getValue().toString();
				String chrLatin = chromBidiMap.get(Integer.valueOf(chr));
				String beg = u.getAttribute(attBeg).getValue().toString();
				String end = u.getAttribute(attEnd).getValue().toString();

				String query = "mode=network&keyword=" + keyword+"&list="+name;
				String uri = "OndexServlet?" + query;

				// Genes
				sb.append("<feature id=\"" + id + "\">\n");
				sb.append("<chromosome>" + chrLatin + "</chromosome>\n");
				sb.append("<start>" + beg + "</start>\n");
				sb.append("<end>" + end + "</end>\n");
				sb.append("<type>gene</type>\n");
				sb.append("<color>0x0000ff</color>\n"); // COLOR
				sb.append("<label>" + name + "</label>\n");
				sb.append("<link>" + uri + "</link>\n");
				sb.append("</feature>\n");
			}
		}
		
		if (!listMode.equals("GLrestrict") && usersUnrelatedGenes != null && usersUnrelatedGenes.size() > 0) {
			for (ONDEXConcept u : usersUnrelatedGenes) {
				// only genes that are on chromosomes (not scaffolds)
				// can be displayed in GViewer
				if (u.getAttribute(attChr) == null)
					continue;

				String name = u.getPID();

				for (ConceptAccession acc : u.getConceptAccessions()) {
					String accValue = acc.getAccession();
					if (acc.getElementOf().getId().equalsIgnoreCase("TAIR")
							&& accValue.startsWith("AT")
							&& (accValue.indexOf(".") == -1)) {
						name = acc.getAccession();
					}
				}

				String chr = u.getAttribute(attChr).getValue().toString();
				String chrLatin = chromBidiMap.get(Integer.valueOf(chr));
				String beg = u.getAttribute(attBeg).getValue().toString();
				String end = u.getAttribute(attEnd).getValue().toString();

				String query = "mode=network&keyword=" + keyword+"&list="+name;
				String uri = "OndexServlet?" + query;

				// Genes
				sb.append("<feature id=\"" + id + "\">\n");
				sb.append("<chromosome>" + chrLatin + "</chromosome>\n");
				sb.append("<start>" + beg + "</start>\n");
				sb.append("<end>" + end + "</end>\n");
				sb.append("<type>gene</type>\n");
				sb.append("<color>0xFFFFFF</color>\n"); // white
				sb.append("<label>" + name + "</label>\n");
				sb.append("<link>" + uri + "</link>\n");
				sb.append("</feature>\n");
			}
		}
		// QTLs
		for (QTL region : qtls) {
			int chr = region.getChrIndex();
			String start = region.getStart();
			String end = region.getEnd();
			String label = region.getLabel();
			String chrLatin = chromBidiMap.get(Integer.valueOf(chr));
			
			if(label.length() == 0){
				label = "QTL";
			}
			String query = "mode=network&keyword=" + keyword+"&qtl1="+chrLatin+":"+start+":"+end;
			String uri = "OndexServlet?" + query;
			
			sb.append("<feature>\n");
			sb.append("<chromosome>" + chrLatin + "</chromosome>\n");
			sb.append("<start>" + start + "</start>\n");
			sb.append("<end>" + end + "</end>\n");
			sb.append("<type>qtl</type>\n");
			sb.append("<color>0xFFA500</color>\n"); // Orange			
			sb.append("<label>" + label + "</label>\n");
			sb.append("<link>" + uri + "</link>\n");
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
	 * @return
	 */
	public boolean writeTableOut(ArrayList<ONDEXConcept> candidates,
			Set<ONDEXConcept> userGenes, List<QTL> qtls, String filename) {
		if (candidates.size() == 0) {
			System.out.println("No candidate path to display.");
			return false;
		}
		
		if(userGenes == null){
			System.out.println("No user gene list defined.");
		}
		
		if(qtls.isEmpty()){
			System.out.println("No QTL regions defined.");
		}
		
		ONDEXGraphMetaData md = graph.getMetaData();
		AttributeName attChr = md.getAttributeName("Chromosome");
		AttributeName attScaf = md.getAttributeName("Scaffold");
		AttributeName attBeg = md.getAttributeName("BEGIN");
		AttributeName attEnd = md.getAttributeName("END");
		AttributeName attTAXID = md.getAttributeName("TAXID");
		AttributeName attSize = md.getAttributeName("size");

		try {
			BufferedWriter out = new BufferedWriter(new FileWriter(filename));
			out.write("ONDEX-ID\tACCESSION\tGENE NAME\tCHRO\tSTART\tEND\tSCORE\tUSER\tQTL\tEVIDENCE\n");
			int i = 0;
			for (ONDEXConcept gene : candidates) {	
				i++;
				int id = gene.getId();
				String geneAcc = "";
				for (ConceptAccession acc : gene.getConceptAccessions()) {
					String accValue = acc.getAccession();
					geneAcc = accValue;
					if (acc.getElementOf().getId().equalsIgnoreCase("TAIR")
							&& accValue.startsWith("AT")
							&& (accValue.indexOf(".") == -1)) {
						geneAcc = accValue;
						break;
					}
					else if (acc.getElementOf().getId().equalsIgnoreCase("PHYTOZOME")){
						geneAcc = accValue;
						break;
					}
				}
				int chr = 0, beg = 0, end = 0;
				if (gene.getAttribute(attChr) != null) {
					chr = (Integer) gene.getAttribute(attChr).getValue();
				}			
				else if (gene.getAttribute(attScaf) != null) {
					chr = (Integer) gene.getAttribute(attScaf).getValue();
				} 
				if (gene.getAttribute(attBeg) != null) {
					beg = (Integer) gene.getAttribute(attBeg).getValue();
				}
				if (gene.getAttribute(attEnd) != null) {
					end = (Integer) gene.getAttribute(attEnd).getValue();
				}
				Double score = 0.0;
				if(scoredCandidates != null){
					if(scoredCandidates.get(gene) != null){
						score = scoredCandidates.get(gene);
					}
				}
				DecimalFormat fmt = new DecimalFormat("0.000");  				
				
				String geneName = getDefaultNameForConcept(gene);

				String isInList = "no";
				if(userGenes != null){
					for(ONDEXConcept c : userGenes){
						//equal on PID not equal on object because from different graphs						
						if(c.getId()==gene.getId()){						
							isInList = "yes";
						}
					}
				}
				int numQTL = 0;
				
				if(!qtls.isEmpty()){
					for(QTL loci : qtls) {
						try{
							Integer qtlChrom = chromBidiMap.inverseBidiMap().get(loci.getChrName());
							Long qtlStart = Long.parseLong(loci.getStart());
							Long qtlEnd = Long.parseLong(loci.getEnd());
							
							if(qtlChrom == chr && beg >= qtlStart && beg <= qtlEnd ){
								numQTL++;
							}
						}
						catch(Exception e){
							System.out.println("An error occurred in method: writeTableOut.");
							System.out.println(e.getMessage());
							
						}
					}
				}
				
				//get lucene hits per gene
				Set<Integer> luceneHits = mapGene2HitConcept.get(id);
				
				//organise by concept class
				HashMap<String, String> cc2name = new HashMap<String, String>(); 
				
				for(int hitID : luceneHits){
					ONDEXConcept c = graph.getConcept(hitID);
					String ccId = c.getOfType().getId();
					String name = getDefaultNameForGroupOfConcepts(c);

					if(!cc2name.containsKey(ccId)){
						cc2name.put(ccId, ccId+"//"+name);
					}else{
						String act_name = cc2name.get(ccId);
						act_name = act_name+"//"+name;
						cc2name.put(ccId, act_name);
					}
				}
				
				//create output string
				String evidence = "";
				for(String ccId : cc2name.keySet()){
					evidence += cc2name.get(ccId)+"||";
				}
				evidence = evidence.substring(0, evidence.length() - 2);
				
				out.write(id + "\t" + geneAcc + "\t" + geneName + "\t" + chr + "\t"
						+ beg + "\t" + end + "\t" + fmt.format(score) + "\t" +isInList + "\t" + numQTL + "\t" + evidence + "\n");
				
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
	
	public boolean writeEvidenceTable(HashMap<ONDEXConcept, Float> luceneConcepts, Set<ONDEXConcept> userGenes, List<QTL> qtls, String fileName){
		
		try {
			BufferedWriter out = new BufferedWriter(new FileWriter(fileName));
			//writes the header of the table
			out.write("TYPE\tNAME\tSCORE\tGENES\tUSER GENES\tQTLS\tONDEXID\n");
			for(ONDEXConcept lc : luceneConcepts.keySet()){
				//Creates type,name,score and numberOfGenes
				String type = lc.getOfType().getId();
				String name = getDefaultNameForGroupOfConcepts(lc);
				Float score = luceneConcepts.get(lc);
				Integer ondexId = lc.getId();
				if(!mapConcept2Genes.containsKey(lc.getId())){
					continue;
				}
				Set<Integer> listOfGenes = mapConcept2Genes.get(lc.getId());
				Integer numberOfGenes = listOfGenes.size();
				//Creates numberOfUserGenes and numberOfQTL
				Integer numberOfUserGenes = 0;	
				Integer numberOfQTL = 0;
				Set<ONDEXConcept> genesWithinQTL = searchQTLs(qtls);
				for (int log : listOfGenes) {
					
					if((userGenes != null)&&(graph.getConcept(log) != null)&&(userGenes.contains(graph.getConcept(log)))){
						numberOfUserGenes++;
					}
					if((genesWithinQTL != null)&&(graph.getConcept(log) != null)&&(genesWithinQTL.contains(graph.getConcept(log)))){
						numberOfQTL++;
					}
				}
				//writes the row
				out.write(type+"\t"+name+"\t"+score+"\t"+numberOfGenes+"\t"+numberOfUserGenes+"\t"+numberOfQTL+"\t"+ondexId+"\n");
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
	public static Set<String> parseKeywordIntoSetOfTerms(String keyword) {
		Set<String> result = new HashSet<String>();
		String key = keyword.replace("(", "");
		key = key.replace(")", "");
		
		key = key.replace("NOT", "___");
		key = key.replace(" AND ", "___");
		key = key.replace(" OR ", "___");
		
		//System.out.println(key);
		
		//key = key.replaceAll("\\s+", " ");
		
		for (String k : key.split("___")) {
			result.add(k.trim());
			//System.out.println("subkeyworkd for synonym table: "+k.trim());
		}	
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
	
public boolean writeSynonymTable(String keyword, String fileName) throws ParseException{
		int topX = 25;
		Set<String> keys = parseKeywordIntoSetOfTerms(keyword);
		
		try {
			BufferedWriter out = new BufferedWriter(new FileWriter(fileName));
			for (String key : keys) {
				Analyzer analyzer = new StandardAnalyzer(Version.LUCENE_36);
				Map<Integer, Float> synonymsList = new HashMap<Integer, Float>(); 
				FloatValueComparator comparator =  new FloatValueComparator(synonymsList);
				TreeMap<Integer, Float> sortedSynonymsList = new TreeMap<Integer, Float>(comparator);
				
				out.write("<"+key+">\n");
				// search concept names
				String fieldNameCN = getFieldName("ConceptName",null);
			    QueryParser parserCN = new QueryParser(Version.LUCENE_36, fieldNameCN , analyzer);
			    Query qNames = parserCN.parse(key);
				ScoredHits<ONDEXConcept> hitSynonyms = lenv.searchTopConcepts(qNames, 100);
				
				
				for(ONDEXConcept c : hitSynonyms.getOndexHits()){
					if (c instanceof LuceneConcept) {
						c = ((LuceneConcept) c).getParent();
					}	
					if(!synonymsList.containsKey(c.getId()) && !synonymsList.containsValue(key)){	
						synonymsList.put(c.getId(), hitSynonyms.getScoreOnEntity(c));
					}else{
						float scoreA = hitSynonyms.getScoreOnEntity(c);
						float scoreB = synonymsList.get(c.getId());
						if(scoreA > scoreB){
							synonymsList.put(c.getId(), scoreA);
						}
					}
				}

				if(synonymsList != null){
					//Creates de sorted list of synonyms
					sortedSynonymsList.putAll(synonymsList);
					
					//wirtes te topX values en the table
					int topAux = 0;
					for (Integer entry : sortedSynonymsList.keySet()) {
						ONDEXConcept eoc = graph.getConcept(entry);
						Float score = synonymsList.get(entry);
						String type = eoc.getOfType().getId().toString();
						Integer id = eoc.getId();
						Set<ConceptName> cNames = eoc.getConceptNames();
						for (ConceptName cName : cNames) {
							if(topAux < topX){
								//if(type == "Gene" || type == "BioProc" || type == "MolFunc" || type == "CelComp"){
									if(cName.isPreferred()){
										String name = cName.getName().toString();
										out.write(name+"\t"+type+"\t"+score.toString()+"\t"+id+"\n");
										topAux++;
									}
								//}
							}
							
						}
					}
				}
				
				out.write("</"+key+">\n");
				}
			out.close();
			return true;			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}
	

	public HashMap<Integer, Set<Integer>> getMapEvidences2Genes(HashMap<ONDEXConcept, Float> luceneConcepts){
		HashMap<Integer, Set<Integer>> mapEvidences2Genes = new HashMap<Integer, Set<Integer>>();
		for(ONDEXConcept lc : luceneConcepts.keySet()){
			Integer luceneOndexId = lc.getId();
			//Checks if the document is related to a gene
			if(!mapConcept2Genes.containsKey(luceneOndexId)){
				continue;
			}
			//Creates de set of Concepts ids
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
			smp.parseReader(new BufferedReader(new InputStreamReader(stream)),
					graph);
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
	 * @param cns
	 *            Set<ConceptName>
	 * @return String name
	 */
	private String getShortestPreferedName(Set<ConceptName> cns) {
		String result = "";
		int length = 100000;
		for(ConceptName cn : cns){
			if((cn.isPreferred())&&(cn.getName().trim().length() < length)){
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
		for(ConceptAccession acc : accs){
			if(!(acc.isAmbiguous())&&(acc.getAccession().trim().length() < length)){
				result = acc.getAccession().trim();
				length = acc.getAccession().trim().length();
			}
		}
		return result;
	}
	
	/**
	 * Returns the best name for each group of concept classes
	 * [Gene|Protein][Phenotype][The rest]
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
		if((ct == "Gene")||(ct == "Protein")){
			if(getShortestNotAmbiguousAccession(accs) != ""){
				cn = getShortestNotAmbiguousAccession(accs);
			} else {
				cn = getShortestPreferedName(cns);
			}			
		}else if(ct == "Phenotype"){
			AttributeName att = graph.getMetaData().getAttributeName("Phenotype");
			cn = c.getAttribute(att).getValue().toString().trim();
		}else{
			if(getShortestPreferedName(cns) != ""){
				cn = getShortestPreferedName(cns);
			} else {
				cn = getShortestNotAmbiguousAccession(accs);
			}			
		}
		if(cn.length() > 30)
			cn = cn.substring(0,29)+"...";
		return cn;
	}

	/**
	 * Does sort a given map according to the values
	 * 
	 * @param map
	 * @return
	 */
	public <K, V extends Comparable<? super V>> SortedSet<Map.Entry<K, V>> entriesSortedByValues(
			Map<K, V> map) {
		SortedSet<Map.Entry<K, V>> sortedEntries = new TreeSet<Map.Entry<K, V>>(
				new Comparator<Map.Entry<K, V>>() {
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

	public void setTaxId(String id) {
		this.taxID = id;
	}
	
	public String getTaxId() {
		return this.taxID;
	}
	
	/**
	 * Returns number of organism (taxID) genes at a given loci
	 * 
	 * @param chr chromosome name as used in GViewer
	 * @param start start position
	 * @param end end position
	 * 
	 * @return 0 if no genes found, otherwise number of genes at specified loci
	 */
	public int getGeneCount(String chr, int start, int end){
		
		AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");
		AttributeName attChr = graph.getMetaData().getAttributeName("Chromosome");
		AttributeName attBeg = graph.getMetaData().getAttributeName("BEGIN");
		ConceptClass ccGene = graph.getMetaData().getConceptClass("Gene");
		Set<ONDEXConcept> genes = graph.getConceptsOfConceptClass(ccGene);
		
		int geneCount = 0;
		
		for (ONDEXConcept gene : genes) {	
			if (gene.getAttribute(attTAXID) != null
					&& gene.getAttribute(attChr) != null
					&& gene.getAttribute(attBeg) != null) {
				
				String geneTaxID = gene.getAttribute(attTAXID).getValue().toString();
				Integer geneChr = (Integer) gene.getAttribute(attChr).getValue();
				Integer geneBeg = (Integer) gene.getAttribute(attBeg).getValue();
				
				//check if taxid, chromosome and start meet criteria
				if(geneTaxID.equals(taxID) && geneChr == chromBidiMap.inverseBidiMap().get(chr) && geneBeg >= start && geneBeg <= end){
					geneCount++;
				}
				
			}
		}	
		
		return geneCount;
	}
	
	public String getFieldName(String name, String value){
		
		if(value == null){ 
			return name;
		}else{
			return name + "_" + value;
		}
	}
	
	
	/**
	 * 
	 * This method populates a HashMap with concepts from KB as keys 
	 * and list of genes presented in their motifs
	 * 
	 */
	public void populateHashMaps() {
		System.out.println("Populate HashMaps");
		File file1 = new File("mapConcept2Genes");
		File file2 = new File("mapGene2Concepts");
		if(!file1.exists() || !file2.exists()){
		
			AttributeName attTAXID = graph.getMetaData().getAttributeName("TAXID");
			ConceptClass ccGene = graph.getMetaData().getConceptClass("Gene");
			Set<ONDEXConcept> seed = graph.getConceptsOfConceptClass(ccGene);
			Set<ONDEXConcept> genes = new HashSet<ONDEXConcept>();
			for (ONDEXConcept gene : seed) {		
				if (gene.getAttribute(attTAXID) != null
						&& gene.getAttribute(attTAXID).getValue().toString()
								.equals(taxID)) {
					genes.add(gene);
				}				
			}
			// the results give us a map of every starting concept to every valid path
			Map<ONDEXConcept, List<EvidencePathNode>> results = gt.traverseGraph(graph, genes, null);
			
			mapConcept2Genes = new HashMap<Integer, Set<Integer>>();
			mapGene2Concepts = new HashMap<Integer, Set<Integer>>();
			for (List<EvidencePathNode> paths : results.values()) {
				for (EvidencePathNode path : paths) {
	
					// search last concept of semantic motif for keyword
					ONDEXConcept gene = (ONDEXConcept) path.getStartingEntity();
					
					// add all semantic motifs to the new graph
					Set<ONDEXConcept> concepts = path.getAllConcepts();
					
					//GENE 2 CONCEPT														
					if(!mapGene2Concepts.containsKey(gene.getId())){
						Set<Integer> setConcepts = new HashSet<Integer>();
						for (ONDEXConcept c : concepts){
							setConcepts.add(c.getId());
						}
						mapGene2Concepts.put(gene.getId(), setConcepts);
					}
					else {
						Set<Integer> setConcepts = new HashSet<Integer>();
						for (ONDEXConcept c : concepts){
							setConcepts.add(c.getId());
						}
						mapGene2Concepts.get(gene.getId()).addAll(setConcepts);					
					}

					// CONCEPT 2 GENE
					concepts.remove(gene);					
					for(ONDEXConcept c : concepts) {
						if(!mapConcept2Genes.containsKey(c.getId())){
							Set<Integer> setGenes = new HashSet<Integer>();														
							setGenes.add(gene.getId());							
							mapConcept2Genes.put(c.getId(), setGenes);							
						}
						else {					
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
		}
		else{	
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
		System.out.println("HashMap Populated");
	}

	public  ArrayList<ONDEXConcept> filterQTLs(ArrayList<ONDEXConcept> genes, List<QTL> qtls) {
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

		if((Double)base.get(a) < (Double)base.get(b)) {
			return 1;
		} 
		else if((Double)base.get(a) == (Double)base.get(b)) {
			return 0;
		} 
		else {
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
		if(base == null){
			System.out.println("base is null");
		}
		if(a == null){
			System.out.println("A null found");
		}
		if((Float)base.get(a) == null){
			System.out.println("A content null found");
		}
		if(b == null){
			System.out.println("B null found");
		}
		if((Float)base.get(b) == null){
			System.out.println("B content null found");
		}
		if((Float)base.get(a) < (Float)base.get(b)) {
			return 1;
		} 
		else if((Float)base.get(a) == (Float)base.get(b)) {
			return 0;
		} 
		else {
			return -1;
		}
	}
}

