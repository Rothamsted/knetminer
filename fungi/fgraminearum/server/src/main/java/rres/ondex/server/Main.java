package rres.ondex.server;

import java.io.IOException;

import javax.xml.bind.JAXBException;
import javax.xml.stream.XMLStreamException;

import net.sourceforge.ondex.exception.type.PluginConfigurationException;

/**
 * Main class to propagate jar start-up call
 * 
 * @author taubertj
 *
 */
public class Main extends OndexServiceProvider {

	public static void main(String[] args) throws PluginConfigurationException,
			IOException, XMLStreamException, JAXBException,
			ArrayIndexOutOfBoundsException, InstantiationException,
			IllegalAccessException, ClassNotFoundException {
		MultiThreadServer.main(args);
	}
}
