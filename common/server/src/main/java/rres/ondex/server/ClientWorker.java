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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

//import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryparser.classic.ParseException;

import net.sourceforge.ondex.InvalidPluginArgumentException;
import net.sourceforge.ondex.core.ONDEXConcept;
import net.sourceforge.ondex.core.ONDEXGraph;

/**
 * @author huf, singha
 * @date 10-03-2010, 10-03-2017
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
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		finally {
			if(clientSocket != null) {
				try{
					clientSocket.close();
				}
				catch(IOException e){
					System.out.println(e.getMessage());
				}
			}
		}
	}
	
	public static boolean isInteger(String s) {
		try {
			Integer.parseInt(s);
		} catch (NumberFormatException e) {
			return false;
		}
		return true;
	}
	
	protected String processRequest(String query) throws UnsupportedEncodingException, ParseException {
		
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
			Integer start, end;
			String label = "";
			try {			
				if(r.length == 3 || r.length == 4){	
					chrName = r[0];
					start = Integer.parseInt(r[1]);
					end = Integer.parseInt(r[2]);
					if(r.length == 4){
						label = r[3];
					}
					if(start < end) {
						validQTL = true;
						QTL qtl = new QTL(chrName, "QTL", start, end, label, "significant", null, label, null); //set "trait" equal to qtl (=label)
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
			else if(mode.equals("counthits")) {		//counts the hits in real-time for the search box
				
					Hits hits = new Hits(keyword, ondexProvider);
					//number of Lucene documents
					Integer luceneCount = hits.getLuceneConcepts().size();
					
					//number of Lucene documents related to genes
					Integer luceneLinkedCount = hits.getLuceneDocumentsLinked();
					
					//count unique genes linked to Lucene documents	
					Integer geneCount = hits.getNumConnectedGenes();
					
					System.out.println("Number of matches: "+luceneCount.toString());
					return (luceneCount+"|"+luceneLinkedCount+"|"+geneCount);

				

			}else if(mode.equals("countloci")) {		//counts the genes withina a loci for the Genome or QTL Search box
				String[] loci = keyword.split("-");
				String chr = loci[0];
				Integer start = 0, end = 0;
				if (isInteger(loci[1]) && isInteger(loci[2])){
					start = Integer.parseInt(loci[1]);
					end = Integer.parseInt(loci[2]);
				}
				return String.valueOf(ondexProvider.getGeneCount(chr, start, end));

			}else if(mode.equals("evidencepath")) {		//returns the path between an evidence and all connected genes
				System.out.println("Creating Evidence Path for ONDEXID: "+keyword);
				Integer evidenceOndexID = Integer.parseInt(keyword);
				ONDEXGraph subGraph = ondexProvider.evidencePath(evidenceOndexID);
				
				long timestamp = System.currentTimeMillis();
				//String fileName = timestamp+"evidencePath.oxl";
				String fileName = timestamp+"evidencePath.json"; // Evidence oxl File for Network View (KnetMaps)
				String exportPath = MultiThreadServer.props.getProperty("DataPath");	
				String request = "";
				// Export graph
				try {
					boolean fileIsCreated = false;					
					try {
						fileIsCreated = ondexProvider.exportGraph(subGraph, exportPath+fileName);
					} catch (InvalidPluginArgumentException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}				
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

			}else if(mode.equals("synonyms")){				
				// Synonym table file
				long timestamp = System.currentTimeMillis();
				String fileSynonymTable = timestamp+"SynonymTable.tab";
				try {
					ondexProvider.writeSynonymTable(keyword, MultiThreadServer.props.getProperty("DataPath") + fileSynonymTable);
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
		list.removeAll(Arrays.asList("", null));
		
		// File name
		long timestamp = System.currentTimeMillis();
		//String fileName = "result_"+timestamp+".oxl";
		String fileName = "result_"+timestamp+".json"; // File for Network View (KnetMaps)
		String exportPath = MultiThreadServer.props.getProperty("DataPath");			
		
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
	
	protected String callOndexProvider(String keyword, String mode, String listMode, List<QTL> qtl, List<String> list) throws ParseException {

		list.removeAll(Arrays.asList("", null));
		
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
			System.out.println("Number of user provided genes: "+userGenes.size());
		}
		
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
						System.out.println("Number of user provided genes within QTL: "+userList.size());
					}
					qtlnetminerResults.setUsersGenes(userList);
				}
				
				if(genes.size() == 0){
					System.out.println("NoFile: no genes found");
					request = "NoFile:noGenesFound";
				}
				else {
					// Gviewer Annotation File
					if(ondexProvider.getReferenceGenome() == true){
                                            // Generate Annotation file.
						ondexProvider.writeAnnotationXML(
								genes, userGenes, qtl, MultiThreadServer.props.getProperty("DataPath")
								+ fileGViewer, keyword, 1000/*100*/, qtlnetminerResults, listMode);
						System.out.println("1.) Gviewer annotation ");
					}else{
						System.out.println("1.) No reference genome for Gviewer annotation ");
					}
					
					// Gene table file
                                        boolean txtIsCreated = ondexProvider.writeGeneTable(
							genes, userGenes, qtl,
							MultiThreadServer.props.getProperty("DataPath")
							+ fileGeneTable, listMode);
					System.out.println("2.) Gene table ");
					
					// Evidence table file
					boolean eviTableIsCreated = ondexProvider.writeEvidenceTable(qtlnetminerResults.getLuceneConcepts(), 
							userGenes, qtl, MultiThreadServer.props.getProperty("DataPath") + fileEvidenceTable);
					System.out.println("3.) Evidence table ");
										
					
					//Document count (only related with genes)
					int docSize = ondexProvider.getMapEvidences2Genes(qtlnetminerResults.getLuceneConcepts()).size();
					
					//Total documents
					int totalDocSize = qtlnetminerResults.getLuceneConcepts().size();
					
					// We have annotation and table file				
					if (txtIsCreated && eviTableIsCreated) {
						request = "FileCreated:"+fileGViewer+":"+fileGeneTable+":"+fileEvidenceTable+":"+genes.size()+":"+docSize+":"+totalDocSize;
						System.out.println("request is "+request);
					}
				}											
			}
		} 
		catch (Exception e) {	
			System.err.println("exception "+e.getMessage());
			e.printStackTrace();
		}	
		System.out.println("request is "+request);
		return request;
	}
}
