package rres.ondex.server;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.URL;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import javax.xml.bind.JAXBException;
import javax.xml.stream.XMLStreamException;

import net.sourceforge.ondex.exception.type.PluginConfigurationException;

/**
 * Starts a multi threaded server to accept socket connections
 * 
 * @author huf, pakk, taubertj
 * 
 */
public class MultiThreadServer {

	/**
	 * Contains server configuration properties
	 */
	static Properties props = new Properties();

	/**
	 * Main method for starting server class
	 * 
	 * @param args
	 * @throws PluginConfigurationException
	 * @throws IOException
	 * @throws XMLStreamException
	 * @throws JAXBException
	 * @throws ClassNotFoundException
	 * @throws IllegalAccessException
	 * @throws InstantiationException
	 * @throws ArrayIndexOutOfBoundsException
	 */
	public static void main(String[] args) throws PluginConfigurationException,
			IOException, XMLStreamException, JAXBException,
			ArrayIndexOutOfBoundsException, InstantiationException,
			IllegalAccessException, ClassNotFoundException {

		// check arguments
		if (args.length != 1) {
			System.out.println("Usage: java -jar qtlnetminer-server.jar path_to_oxl");
			System.exit(1);
		}

		// load server configuration from file
		URL configUrl = Thread.currentThread().getContextClassLoader().getResource("config.xml");
		try {
			props.loadFromXML(configUrl.openStream());
		} 
		catch (IOException e) {
			e.printStackTrace();
		}

		// initialise new server
		MultiThreadServer aServer = new MultiThreadServer();
		aServer.restart(args[0]);
	}

	/**
	 * current server socket, need to be closed at exit
	 */
	private ServerSocket serverSocket = null;

	@Override
	protected void finalize() {
		// Objects created in run method are finalised when program terminates
		// and thread exits
		try {
			serverSocket.close();
		} catch (IOException e) {
			System.out.println("Could not close socket");
			System.exit(-1);
		}
	}

	/**
	 * Setup service provider for a given file name
	 * 
	 * @param fileName
	 * @throws ArrayIndexOutOfBoundsException
	 * @throws PluginConfigurationException
	 * @throws ClassNotFoundException
	 * @throws IllegalAccessException
	 * @throws InstantiationException
	 */
	private void restart(String fileName)
			throws ArrayIndexOutOfBoundsException,
			PluginConfigurationException, InstantiationException,
			IllegalAccessException, ClassNotFoundException {
		
		
		// Initiate OndexKB
		OndexServiceProvider ondexServiceProvider = (OndexServiceProvider) Class
				.forName(props.getProperty("ServiceProvider")).newInstance();
		String reference_genome = props.getProperty("reference_genome");
		boolean referenceGenome = true;
		if(reference_genome.equals("false"))
			referenceGenome = false;
		String taxID = props.getProperty("SpeciesTaxId");
		List<String> taxIDs = Arrays.asList(taxID.split(","));
		
		String export_visible_network = props.getProperty("export_visible_network");
		
		ondexServiceProvider.setReferenceGenome(referenceGenome);
		ondexServiceProvider.setTaxId(taxIDs);
		ondexServiceProvider.setExportVisible(Boolean.parseBoolean(export_visible_network));
		ondexServiceProvider.loadConfig();
		ondexServiceProvider.createGraph(fileName);		

		// Open server port here
		try {
			// 8189
			serverSocket = new ServerSocket(Integer.parseInt(props.getProperty("ServerPort"))); 
		} 
		catch (IOException e) {
			System.out.println("Could not listen on port "+ props.getProperty("ServerPort"));
			e.printStackTrace();
			System.exit(-1);
		}
		
		DateFormat formatter = new SimpleDateFormat("mm:ss.SSS");	
		// motif index
		/*
		ondexServiceProvider.motifSubgraph();		
		*/
		// always accept client requests
		while (true) {
			ClientWorker worker;
			try {
				// this client worker will wait until a client sends a request
				worker = new ClientWorker(serverSocket.accept(), ondexServiceProvider);
				Thread t = new Thread(worker);
				t.start();

				// output logging time of requests to console
				// TODO: log via log4j
				formatter = new SimpleDateFormat("dd:hh:mm:ss");
				Date now = new Date();
				System.out.println(">>New request at "+now);
			} catch (IOException e) {
				System.out.println(e.getStackTrace());
				System.out.println("Accept failed: "+ props.getProperty("ServerPort"));
				System.exit(-1);
			}
		}
	}
}
