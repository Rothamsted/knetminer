package rres.ondex.server;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

import org.apache.lucene.queryParser.ParseException;
//import org.apache.lucene.queryparser.classic.ParseException;

import net.sourceforge.ondex.core.ONDEXConcept;

/**
 * 
 * @author zorc, pakk, singha
 *
 */
public class Hits {	
	
	OndexServiceProvider ondexProvider;
	HashMap<ONDEXConcept, Float> luceneConcepts;	//concept and Lucene score
	int luceneDocumentsLinked;
	int numConnectedGenes;
	ArrayList<ONDEXConcept> sortedCandidates;
	Set<ONDEXConcept> usersGenes;
	Set<ONDEXConcept> usersGenesRelated;
	String keyword = "";
	
	
	public Hits(String keyword, OndexServiceProvider ondexProvider) {
		this.ondexProvider = ondexProvider;
		this.keyword = keyword;
		try {
			this.luceneConcepts = ondexProvider.searchLucene(keyword);
			//remove from constructor if it slows down search noticeably
			countLinkedGenes();
		} 
		catch (IOException e) {			
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public void countLinkedGenes(){
		int linkedDocs = 0;
		Set<Integer> uniqGenes = new HashSet<Integer>();
		for(ONDEXConcept lc : luceneConcepts.keySet()){
			Integer luceneOndexId = lc.getId();
			//Checks if the document is related to a gene
			if(!OndexServiceProvider.mapConcept2Genes.containsKey(luceneOndexId)){
				continue;
			}
			linkedDocs++;
			uniqGenes.addAll(OndexServiceProvider.mapConcept2Genes.get(luceneOndexId));	
		}
		
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
	public void setLuceneConcepts(HashMap<ONDEXConcept, Float> luceneConcepts){
		this.luceneConcepts = luceneConcepts;
	}
	public ArrayList<ONDEXConcept> getSortedCandidates(){
		try {
			this.sortedCandidates = ondexProvider.getScoredGenes(luceneConcepts);
		} 
		catch (IOException e) {			
			e.printStackTrace();
		}
		return this.sortedCandidates;
	}
	
	public void setSortedCandidates(ArrayList<ONDEXConcept> sortedCandidates){		
		this.sortedCandidates = sortedCandidates;				
	}	
	public void setUsersGenes(Set<ONDEXConcept> usersGenes){	
		this.usersGenes = usersGenes;
		this.usersGenesRelated = usersGenes;
		
		//this should work but it removes not related genes from usersGenes		
//		Set<ONDEXConcept> temp = usersGenes;
//		temp.retainAll(sortedCandidates);
//		this.usersGenesRelated = temp;
//		System.out.println("Number of user provided genes linked to query: "+usersGenesRelated.size());
//		
		//old version
//		if(usersGenes != null && usersGenes.size() > 0){	
//			this.usersGenesRelated = ondexProvider.searchList(usersGenes, keyword);
//			
//			//this.sortedCandidates.removeAll(this.usersGenesRelated);
//			System.out.println("we found related: "+usersGenesRelated.size());
//		}
	}	
	public Set<ONDEXConcept> getUsersGenes(){	
		return this.usersGenes;
	}
	public Set<ONDEXConcept> getUsersRelatedGenes(){
		return this.usersGenesRelated;
	}
	public Set<ONDEXConcept> getUsesrUnrelatedGenes(){	
		if(usersGenes != null && usersGenes.size() > 0){
			Set<ONDEXConcept> tmp = this.usersGenes;
			tmp.removeAll(usersGenesRelated);
			return tmp;
		}
		else return null;
	}
}
