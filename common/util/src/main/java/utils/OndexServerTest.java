package utils;

import java.net.URLDecoder;
import java.net.Socket;
import java.io.*;

/**
 * @author meisterJaeger
 * @date 19-06-2014
 * 
 */

public class OndexServerTest 
{
	
	// class variables
	private String host="";
	private int port=0;
	
	//constructor
	public OndexServerTest(String ho, int po)
	{
		this.host=ho;
		this.port=po;
	}
	
	// returns the host
	public String getHost()
	{
		return this.host;
	}
	
	// returns the port
	public int getPort()
	{
		return this.port;
	}
	
	
	// perform a query and print response
	public void performQuery(String query) 
	{
		if(query!=null)
		{		
			PrintWriter out=null;	
			
			try 
			{	
				System.out.println("**** Performing query for '" + query + "' at " + host + ":" + port+" ****");
				
				query = URLDecoder.decode(query, "ASCII"); 
				Socket socket = new Socket(this.host, this.port);

				InputStreamReader isr = new InputStreamReader(socket.getInputStream());
				BufferedReader in = new BufferedReader(isr);
			
				out = new PrintWriter(socket.getOutputStream(), true);
				
				out.println(query+"\nBye.");
				out.flush();
		
				String line = in.readLine();
				String resp="";
				
				System.out.println("\noutput:\n");
				
				while(!line.equals("Bye.")) 
				{
					try
					{	
						resp = resp+line;   
						line = in.readLine();	
					}
						
					catch (Exception e) 
					{
						System.out.println(e.getMessage());
						out.println("Bye.");
					}
				}

				socket.close();	
				
				if(resp.equals(""))
				{
					System.out.println("An error occured: No response!\n");						
				}
				
				else
				{
					System.out.println(resp+"\n\n");
				}
				
			}
								
			catch (Exception e) 
			{
				System.out.println(e.getMessage());
				
				if(out!=null)
				{
					out.println("Bye.");
				}
			}				
		}
		
		else
		{
			System.out.println("Query is missing!");
		}
	}
	
	// perform some queries and print there response
	public void performQueries(String[] queries) 
	{
		if(queries.length>=1)
		{	
			for(String query:queries)
			{
				this.performQuery(query);
			}	
		}
		
		else
		{
			System.out.println("Queries are missing!");
		}
	}
			
	// main class for testing
	public static void main(String[] args) 
	{		
		if (args.length < 3) 
		{
			System.out.println("Arguments have to be: "
								+ "Host, Port, Query!");
			System.exit(0);
		}
			
		String host = args[0]; // "babvs43";
		int port = Integer.parseInt(args[1]); // 8080;
		String query = args[2]; // "keyword=drought&mode=counthits";
				
		OndexServerTest test = new OndexServerTest(host,port);
				
		test.performQuery(query);		
	}	
}

/* 
 * test queries:
 * 
 * keyword=drought&mode=counthits
 * output: 842|464|6662
 * 
 * mode=countloci&keyword=2H-27-56
 * output: 922
 * 
 * mode=network&list=MLOC_44823.1&keyword=drought
 * output: FileCreated:result_1403174425975.oxl
 * 
 * mode=evidencepath&keyword=252494
 * output: FileCreated:1403175015682evidencePath.oxl
 * 
 * mode=synonyms&keyword=drought
 * output: File created:1403175536990SynonymTable.tab
 * 
 * keyword=lignin%20content&mode=qtl&listMode=GLrestrict&qtl1=1H:27:300000000:QTL1&qtl2=2H:27:300000000:QTL2
 * output: FileCreated:1403176061900GViewer.xml:1403176061900GeneTable.tab:1403176061900EvidenceTabl.tab:2149:808:1488
 * 
 */

