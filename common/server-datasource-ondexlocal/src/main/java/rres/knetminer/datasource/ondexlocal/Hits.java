package rres.knetminer.datasource.ondexlocal;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.Collection;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
//import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryparser.classic.ParseException;

import net.sourceforge.ondex.core.ONDEXConcept;

/**
 * 
 * @author zorc, pakk, singha
 *
 */
public class Hits {	
    protected final Logger log = LogManager.getLogger(getClass());
	
	OndexServiceProvider ondexProvider;
	HashMap<ONDEXConcept, Float> luceneConcepts;	//concept and Lucene score
	int luceneDocumentsLinked;
	int numConnectedGenes;
	ArrayList<ONDEXConcept> sortedCandidates;
	String keyword = "";
	
	
	public Hits(String keyword, OndexServiceProvider ondexProvider, Collection<ONDEXConcept> geneList) {
		this.ondexProvider = ondexProvider;
		this.keyword = keyword;
		try {
			this.luceneConcepts = ondexProvider.searchLucene(keyword, geneList, true);
			//remove from constructor if it slows down search noticeably
			this.countLinkedGenes();
		} 
		catch (IOException e) {			
			log.error("Hits failed", e);
		} catch (ParseException e) {
			log.error("Hits failed", e);
		}
	}
	
	public void countLinkedGenes(){
		int linkedDocs = 0;
		Set<Integer> uniqGenes = new HashSet<Integer>();
		log.info("Matching Lucene concepts: "+luceneConcepts.keySet().size());
		for(ONDEXConcept lc : luceneConcepts.keySet()){
			Integer luceneOndexId = lc.getId();
			//Checks if the document is related to a gene
			if(!OndexServiceProvider.mapConcept2Genes.containsKey(luceneOndexId)){
				continue;
			}
			linkedDocs++;
			uniqGenes.addAll(OndexServiceProvider.mapConcept2Genes.get(luceneOndexId));	
		}
		
		log.info("Matching unique genes: "+uniqGenes.size());
		this.numConnectedGenes = uniqGenes.size();
		this.luceneDocumentsLinked = linkedDocs;
	}
	
	public int getLuceneDocumentsLinked() {
		return luceneDocumentsLinked;
	}

	public int getNumConnectedGenes() {
		return numConnectedGenes;
	}

	public HashMap<ONDEXConcept, Float> getLuceneConcepts(){
		return this.luceneConcepts;
	}

	public ArrayList<ONDEXConcept> getSortedCandidates(){
		try {
			this.sortedCandidates = ondexProvider.getScoredGenes(luceneConcepts);
		} 
		catch (IOException e) {			
			log.error("Candidate sorting failed", e);
		}
		return this.sortedCandidates;
	}
}
