package rres.ondex.server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.lucene.queryParser.ParseException;

import net.sourceforge.ondex.InvalidPluginArgumentException;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;

/**
 * @author huf
 * @date 10-03-2010
 * 
 */
public class ClientWorker implements Runnable {

	static String[] SEARCH_MODES={"genome","qtl","list","network","countdocuments"};
	
	/**
	 * network socket to listen on
	 */
	private Socket clientSocket;

	/**
	 * Ondex interface provider
	 */
	private OndexServiceProvider ondexProvider;

	/**
	 * Set network socket and Ondex interface provider
	 * 
	 * @param socket
	 * @param provider
	 */
	public ClientWorker(Socket socket, OndexServiceProvider provider) {
		this.clientSocket = socket;
		this.ondexProvider = provider;
	}

	@Override
	public void run() {
	
		PrintWriter out = null;
		BufferedReader in = null;
		String request;
		
		try {
			out = new PrintWriter(clientSocket.getOutputStream(), true);
			in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));			
		
			// Request
			String fromClient = in.readLine();
			System.out.println("FromClient: "+fromClient);
			request = "";
			while(!fromClient.equals("Bye.")) { 		
				try{					
					request = request+fromClient+"\n";													
					fromClient = in.readLine();
				}
				catch (Exception e) {
					 System.out.println(e.getMessage());
					 out.println("Bye.");
				}
			}
			// Response
			 System.out.println("Calling to processRequest()");
			out.println(processRequest(request));
			out.println("Bye.");			
		}
		catch (IOException e) {
			System.out.println(e.getMessage());
			out.println("Bye.");
		}
	}
	
	protected String processRequest(String query) throws UnsupportedEncodingException {
		
		System.out.println("Processing request...");
		
		String keyword = "";
		String mode = "";
		String listMode = "";
		List<QTL> qtls = new ArrayList<QTL>();
		List<String> qtlString = new ArrayList<String>();
		List<String> list = new ArrayList<String>();
		
		// Split query
		for(String param : query.split("&")) {
            String pair[] = param.split("=");
            String key = URLDecoder.decode(pair[0], "UTF-8");
            
            String value = "";
            if (pair.length > 1) {
                value = URLDecoder.decode(pair[1], "UTF-8");
            }
            if(key.toLowerCase().startsWith("qtl")){
            	qtlString.add(value.trim());
            }
            else if(key.toLowerCase().equals("keyword")){
            	keyword = value.trim().replace("\n", "");
            	keyword = URLDecoder.decode(keyword, "UTF-8");
            	System.out.println("Keyword decoded: "+keyword);
            }
            else if(key.toLowerCase().equals("mode")){
            	mode = value.trim().replace("\n", "");
            }
        	else if(key.toLowerCase().equals("list")){
        		Collections.addAll(list, value.split("\n"));
            }
        	else if(key.toLowerCase().equals("listmode")){
        		listMode = value.trim();
            }
        }

		boolean validQTL = false;
		// QTLs
		for(String region : qtlString){
			String[] r =  region.split(":"); 
			String chrName;
			int chrIndex;
			long start, end;
			String label = "";
			try {			
				if(r.length == 3 || r.length == 4){	
					chrName = r[0];
					start = Long.parseLong(r[1]);
					end = Long.parseLong(r[2]);
					if(r.length == 4){
						label = r[3];
					}
					if(start < end) {
						validQTL = true;
						chrIndex = ondexProvider.chromBidiMap.inverseBidiMap().get(chrName);
						QTL qtl = new QTL(chrIndex, chrName, Long.toString(start), Long.toString(end), label, "significant");
						qtls.add(qtl);
					}
				}
				if(!validQTL){
					System.out.println(region+" not valid qtl region");	
				}
			} 		
			catch(Exception e){  
				System.out.println("Exception: "+region+" not valid qtl region. "+e.getCause());	
			}
		}		

		// Call Ondex provider
		if(keyword != null && keyword.length()>2) {
			if(mode.equals("network")) {		// applet
				try {
					return callApplet(keyword, qtls, list);
				} catch (InvalidPluginArgumentException e) {
					e.printStackTrace();
				}
				return "OndexWeb";
			}
			else if(mode.equals("counthits")) {
				try {
					Integer matchCount = ondexProvider.searchLucene(keyword).size(); //number of matching documents
					Hits qtlnetminerResults = new Hits(keyword, ondexProvider);
					Integer numberOfGenes = qtlnetminerResults.getSortedCandidates().size();
					Integer matchGenesCount = ondexProvider.getMapEvidences2Genes(qtlnetminerResults.getLuceneConcepts()).size(); //number of matching documents related to genes
					System.out.println("Number of matches: "+matchCount.toString());
					return (matchCount.toString()+"|"+matchGenesCount.toString()+"|"+numberOfGenes);
				} catch (IOException e) {
					e.printStackTrace();
				} catch (ParseException e) {
					e.printStackTrace();
				}
				return "MatchCounter";

			}else if(mode.equals("synonyms")){				
				// Synonym table file
				long timestamp = System.currentTimeMillis();
				String fileSynonymTable = timestamp+"SynonymTable.tab";
				try {
					ondexProvider.writeSynonymTable(keyword, MultiThreadServer.props.getProperty("AnnotationPath") + fileSynonymTable);
					System.out.println("Synonym table created");
					return "File created:"+fileSynonymTable;
				} catch (ParseException e) {
					System.out.println("Synonym table could not be created");
					e.printStackTrace();
				}		
				return "SynonymTable";
			}
			else{
				return callOndexProvider(keyword, mode, listMode, qtls, list);
			}					
		}
		else{
			System.out.println("Not valid request.");
			return "Not valid request.";			
		}				
	}		
	
	protected String callApplet(String keyword, List<QTL> qtls, List<String> list) throws UnsupportedEncodingException, InvalidPluginArgumentException {
		String request = "";
		Set<ONDEXConcept> genes = new HashSet<ONDEXConcept>();				
		
		// File name
		long timestamp = System.currentTimeMillis();
		String fileName = "result_"+timestamp+".oxl";
		String exportPath = MultiThreadServer.props.getProperty("GraphPath");			
		
		System.out.println("Call applet! Search genes "+list.size());
		
		// Search Genes
		if(!list.isEmpty()){
			Set<ONDEXConcept> genesFromList = ondexProvider.searchGenes(list);
			genes.addAll(genesFromList);	
		}	
		
		// Search Regions
		if(!qtls.isEmpty()){
			Set<ONDEXConcept> genesWithinQTLs = ondexProvider.searchQTLs(qtls);			
			genes.addAll(genesWithinQTLs);
		}
		
		// Find Semantic Motifs		
		ONDEXGraph subGraph = ondexProvider.findSemanticMotifs(genes, keyword);
	
		// Export graph
		try {
			boolean fileIsCreated = false;					
			fileIsCreated = ondexProvider.exportGraph(subGraph, exportPath+fileName);				
			if(fileIsCreated) {
				request = "FileCreated:"+fileName;
			}					
			else {
				System.out.println("NoFile");
			}	
		} catch (NumberFormatException e) {
			e.printStackTrace();
		} 
		
		return request;
	}
	
	protected String callOndexProvider(String keyword, String mode, String listMode, List<QTL> qtl, List<String> list) {

		// Setup file names
		long timestamp = System.currentTimeMillis();
		String fileGViewer = timestamp+"GViewer.xml";
		String fileGeneTable = timestamp+"GeneTable.tab";
		String fileEvidenceTable = timestamp+"EvidenceTabl.tab";		
		
		String request = "";	
		ArrayList<ONDEXConcept> genes = new ArrayList<ONDEXConcept>();
		
		
		// Find genes from the user's list
		Set<ONDEXConcept> userGenes = null;		
		if(list != null && list.size() > 0) {
			userGenes = ondexProvider.searchGenes(list);
		}
		
		//find qtl in knowledgebase that match keywords
		List<QTL> qtlDB = ondexProvider.findQTL(keyword);
		
		//some logic to limit QTL size if too many are found
		if(qtlDB.size() > 40){
			System.out.println("Too many QTL found, remove not significant ones...");
			for(QTL q : qtlDB){
				if(!q.getSignificance().equalsIgnoreCase("significant")){
					qtlDB.remove(q);
				}
			}
		}
		
		//add QTL from knowledgebase to QTL list from user 
		qtl.addAll(qtlDB);
		System.out.println("Total number of QTL to display: "+qtl.size());
		
		
		try {
			// Genome search
			if(Arrays.asList(SEARCH_MODES).contains(mode)){												
				System.out.println("Search mode: "+mode);	
				Hits qtlnetminerResults = new Hits(keyword, ondexProvider);
				if(mode.equals("genome")){									
					genes = qtlnetminerResults.getSortedCandidates();
					// find qtl and add to qtl list!					
					System.out.println("Number of genes "+genes.size());
				}
				else if(mode.equals("qtl")){				
					genes = qtlnetminerResults.getSortedCandidates();
					System.out.println("Number of genes "+genes.size());
					genes = ondexProvider.filterQTLs(genes, qtl);
					System.out.println("Genes after QTL filter: "+genes.size());
				}
				if(list.size() > 0){
					Set<ONDEXConcept> userList = ondexProvider.searchGenes(list);
					if(mode.equals("qtl") && listMode.equals("GLrestrict")){
						ArrayList<ONDEXConcept> userListArray = new ArrayList<ONDEXConcept>(userList);
						userListArray = ondexProvider.filterQTLs(userListArray, qtl);
						userList = new HashSet<ONDEXConcept>(userListArray);
					}
					System.out.println("userlist 1 "+userList.size());
					qtlnetminerResults.setUsersGenes(userList);
				}
				
				if(genes.size() == 0){
					System.out.println("NoFile: no genes found");
					request = "NoFile:noGenesFound";
				}
				else {
					// Gviewer Annotation File
					boolean xmlIsCreated = ondexProvider.writeAnnotationXML(
							genes, userGenes, qtl, MultiThreadServer.props.getProperty("AnnotationPath")
							+ fileGViewer, keyword, 100, qtlnetminerResults, listMode);
					System.out.println("1.) Gviewer annotation ");
					
					// Gene table file
					boolean txtIsCreated = ondexProvider.writeTableOut(
							genes, userGenes, qtl,
							MultiThreadServer.props.getProperty("AnnotationPath")
							+ fileGeneTable);
					System.out.println("2.) Gene table ");
					
					// Evidence table file
					boolean eviTableIsCreated = ondexProvider.writeEvidenceTable(qtlnetminerResults.getLuceneConcepts(), 
							userGenes, qtl, MultiThreadServer.props.getProperty("AnnotationPath") + fileEvidenceTable);
					System.out.println("3.) Evidence table ");
										
					
					//Document count (only related with genes)
					int docSize = ondexProvider.getMapEvidences2Genes(qtlnetminerResults.getLuceneConcepts()).size();
					
					//Total documents
					int totalDocSize = qtlnetminerResults.getLuceneConcepts().size();
					
					// We have annotation and table file				
					if (xmlIsCreated && txtIsCreated && eviTableIsCreated) {
						request = "FileCreated:"+fileGViewer+":"+fileGeneTable+":"+fileEvidenceTable+":"+genes.size()+":"+docSize+":"+totalDocSize;
						System.out.println("request is "+request);
					}
				}											
			}
		} 
		catch (Exception e) {	
			System.out.println("exception "+e.getMessage());
			e.printStackTrace();
		}	
		System.out.println("request is "+request);
		return request;
	}
}
