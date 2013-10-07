package rres.ondex.server;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;

import org.apache.lucene.queryParser.ParseException;

import net.sourceforge.ondex.core.ONDEXConcept;

public class Hits {	
	
	OndexServiceProvider ondexProvider;
	HashMap<ONDEXConcept, Float> luceneConcepts;	//concept and Lucene score
	ArrayList<ONDEXConcept> sortedCandidates;
	Set<ONDEXConcept> usersGenes;
	Set<ONDEXConcept> usersGenesRelated;
	String keyword = "";
	
	public Hits(String keyword, OndexServiceProvider ondexProvider) {
		this.ondexProvider = ondexProvider;
		this.keyword = keyword;
		try {
			this.luceneConcepts = ondexProvider.searchLucene(keyword);			
		} 
		catch (IOException e) {			
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
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
		if(usersGenes != null && usersGenes.size() > 0){	
			this.usersGenesRelated = ondexProvider.searchList(usersGenes, keyword);	
			//this.sortedCandidates.removeAll(this.usersGenesRelated);
			System.out.println("we found related: "+usersGenesRelated.size());
		}
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
