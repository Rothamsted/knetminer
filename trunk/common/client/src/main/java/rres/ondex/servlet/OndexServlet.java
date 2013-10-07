package rres.ondex.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.URL;
import java.net.URLDecoder;
import java.util.Date;
import java.util.Properties;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;


/**
 * Servlet implementation class OndexServlet
 * 
 * Receiving requests from /html/prototype.html
 * 
 * In doGet method, this servlet handles three different requests: 1. Single
 * query { Function: query for one region on one of the chromosomes; Query
 * String: starts with "position="; Addition: an Ondex filtering algorithm can
 * be added at the end of the string for different ways of displaying the
 * network in Ondex applet; } 2. Keyword: regular expression is accept; query
 * string starts with "keyword=" { Function: search for the concepts in PoplarKB
 * which contain the keyword; Query String: starts with "keyword="; Addition:
 * regular expression is accepted; } 3. Advanced query (multi-query) { Function:
 * query for multiple regions on multiple chromosomes; Query String: starts with
 * "chrRow=" or "algorithm"; }
 * 
 * Other methods: 1. CommunicateWithPoplarServer: to deliver the HTTP request
 * from GViewer to the the java socket server program by socket communication 2.
 * parseMultiQueryString: to parse advance search query string to a format for
 * java socket server programme use later
 * 
 * A better practice(?): 1. Dispatch different requests to different servlets
 * (SingleQueryServlet, KeywordServlet, AdvancedQueryServlet); 2. Create a new
 * class as java socket client with CommunicateWithPoplarServer function; 3.
 * Keep servlet's function simple - passing messages, leave the query string
 * parsing work to java socket server; 4. Use some design patters; 5. Move
 * everything to web services
 * 
 * @author huf, zorc
 */
public class OndexServlet extends HttpServlet {

	/**
	 * Contains servlet configuration properties
	 */
	private Properties props = new Properties();
	private static final long serialVersionUID = 1L;
	static Logger logger = Logger.getLogger(OndexServlet.class);			
	
	/**
	 * 
	 * Initialization, specific to qtlnetminerServlet (settings from config.xml).
	 * 
     * @see HttpServlet#init(ServletConfig)
     */
	public void init(ServletConfig config) throws ServletException {
		
		// Store the ServletConfig object and log the initialization
		super.init(config);
		
		URL configUrl = Thread.currentThread().getContextClassLoader().getResource("config.xml");
		try {
			props.loadFromXML(configUrl.openStream());
			logger.info("Ondex Servlet was initialized, it is ready to handle client requests...");
		} 
		catch (IOException e) {
			logger.info("Servlet initialization failed");
			e.printStackTrace();
		}
	}	 
    
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		Date now = new Date();
		logger.info("doPost request from "+request.getRemoteAddr()+" at "+now);
		response.setCharacterEncoding("utf-8");
		processRequest(request, response);
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		Date now = new Date();
		logger.info("doGet request from "+request.getRemoteAddr()+" at "+now);	
		response.setCharacterEncoding("utf-8");
		processRequest(request, response);								
	}
	
	/**
	 * Processes a request 
	 * 
	 * Parameters "keyword" and "mode" in http request are required to communicate with a server.
	 * 
	 * @param HttpServletRequest request
	 * @param HttpServletResponse response
	 */
	protected void processRequest(HttpServletRequest request, HttpServletResponse response)  
            throws ServletException, IOException { 
		try{
			
			// Parameters "keyword" and "mode" are required
			boolean validRequest = false;
			String keyword = request.getParameter("keyword");
			String mode = request.getParameter("mode");
			if(keyword != null && keyword.length() > 1 && keyword.length() < 350){
				if(mode != null && (mode.equals("genome") || mode.equals("qtl") || mode.equals("network") || mode.equals("counthits") || mode.equals("synonyms"))){
					validRequest = true;
					communicateWithServer(request, response);
				}
			}	
			if(!validRequest){
				logger.info("Invalid or missing parameter in http request.");
			}
		}
		catch(Exception e){
			logger.info("There was an error processing the request.");
			e.printStackTrace();
		}				
	}
	
	/**
	 * A method to deliver the HTTP request from GViewer to the the java server
	 * program by socket communication
	 * 
	 * @param HttpServletRequest request
	 * @param HttpServletResponse response
	 * @return String line
	 * @throws IOException
	 */
	protected String communicateWithServer(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		
		String query;
		String list;	
		Socket socket;		
		PrintWriter out;
		BufferedReader in;		
		String resp = "";
		
		// Query from http request
		query = request.getQueryString();		// url
		list = request.getParameter("list");	// POST parameter		
		
		logger.info("Query String "+query);
		if(list != null && list.length()>2) {	
			query = query+"&list="+list;
		}
				
		if(query != null) {
			try {
				// Decode the query string in case it is encoded by the browser
				query = URLDecoder.decode(query, "ASCII");

				// Open socket and send message
				socket = new Socket(props.getProperty("ServerHost"), Integer.parseInt(props.getProperty("ServerPort")));				
				out = new PrintWriter(socket.getOutputStream(), true);	
				out.println(query+"\nBye.");
				out.flush();
				
				// Receive request over socket
	            in = null;
	            try {
	                in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
	                String fromServer = in.readLine();	
	                resp = "";
		            while(!fromServer.equals("Bye.")) {          	
		            	resp = resp+fromServer;	
		            	fromServer = in.readLine();	
		            }
		            logger.info("Received "+resp);	// resp is response from server
		            
		            String APPLET_URL = props.getProperty("AppletUrl");
		            

		            
		            //  Write a Java Applet page if oxl was created!
//		            if (resp.endsWith(".oxl")) {
		    			// FileCreated:result__imestamp.oxl
//		    			String fileName = resp.split(":")[1];
//
//		    			// parse in template file and replace with correct filename
//		    			URL templateUrl = Thread.currentThread().getContextClassLoader()
//		    					.getResource(props.getProperty("TemplateFile"));
//		    			StringBuffer buf = new StringBuffer();
//		    			BufferedReader reader = new BufferedReader(new InputStreamReader(
//		    					templateUrl.openStream()));
//		    			while (reader.ready()) {
//		    				String line = reader.readLine();
//		    				// replace filename here
//		    				if (line.indexOf("_FILENAME_") > 0) {
//		    					line = line.replaceAll("_FILENAME_",
//		    							props.getProperty("DataUrl") + fileName);
//		    				}
//		    				if (line.indexOf("_APPLET_") > 0) {
//		    					line = line.replaceAll("_APPLET_",
//		    							props.getProperty("AppletUrl"));
//		    				}
//		    				// add to buffer with line break, looks nicer
//		    				buf.append(line + "\n");
//		    			}
//		    			reader.close();
//		    			
//			            String appletCode = 
//			            		"<p class=margin_left>The Ondex knowledge network has been generated and is displayed in the Ondex Web applet." + 
//			            		"Alternatively it can be <a href="+fileName+">downloaded</a> and opened in the <a href=http://www.ondex.org>Ondex desktop application</a>.</p>" +
//			            		"<applet CODE=net.sourceforge.ondex.ovtk2lite.Main ARCHIVE="+APPLET_URL+"ovtk2lite-0.5.0-SNAPSHOT.jar WIDTH=760 HEIGHT=600></xmp>" +
//					            "<PARAM NAME=CODE VALUE=net.sourceforge.ondex.ovtk2lite.Main>" +
//					            "<PARAM NAME=ARCHIVE VALUE="+APPLET_URL+"ovtk2lite-0.5.0-SNAPSHOT.jar>" +
//					            "<param name=type value=application/x-java-applet;version=1.6>" +
//					            "<param name=scriptable value=false>" +
//					            "<PARAM NAME=ondex.dir VALUE="+APPLET_URL+"data>" +
//					            "<PARAM NAME=ovtk.dir VALUE="+APPLET_URL+"config>" +
//					            "<PARAM NAME=password VALUE=ovtk>" +
//					            "<PARAM NAME=username VALUE=ovtk>" +
//					            "<PARAM NAME=loadappearance VALUE=true>" +
//					            "<PARAM NAME=antialiased VALUE=true>" +
//					            "<PARAM NAME=nodes.labels VALUE=true>" +
//					            "<PARAM NAME=edges.lables VALUE=true>" +
//					            "<PARAM NAME=filename VALUE="+props.getProperty("DataUrl") + fileName +">" +
//					            "Your browser is completely ignoring the &lt;APPLET&gt; tag!" +
//					            "</applet>"+
//					            "<br>" +
//					            "<div id=legend_container>" +
//					            "<img src=html/image/evidence_legend.png>" +
//					            "</div>";	
//
//		    			// send complete html page to client
//		    			response.setContentType("text/html");
//		    			out = response.getWriter();
//		    			out.write(appletCode);
//		    			out.close();
//		    		}		            
//		            in.close();
//		            out.close();
	            } 
	            catch (IOException e) {
	            	logger.info("Receiving request over socket failed.");
	            	e.printStackTrace();
	            	resp = "An error occurred.";
	            	return resp;
	            }	            
			}	
			catch(Exception e){
				logger.info(e.getMessage());	
				logger.info(e.getStackTrace());
				e.printStackTrace();
				resp = "An error occurred.";
				return resp;
			}
		}
		if(resp.length() == 0){
			resp =  "An error occurred.";
		}
		logger.info("To return "+resp);
		PrintWriter responseWriter = response.getWriter();
		
		responseWriter.println(resp);
		return resp;
	}
	
	/**
     * @see HttpServlet#getServletInfo()
     */
    public String getServletInfo() {
        return "qtlnetminerServlet";
    }
}
