package rres.knetminer.datasource.ondexlocal;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * An implementation of {@link ServletContextListener}, which allows to get a config file for
 * ConfigurableOndexDataSource from a we context parameter.
 * 
 * See {@code WEB-INF/web.xml} in the {@code aratiny-ws} module for an example of how this is setup.
 *
 */
public class ConfigFileHarvester implements ServletContextListener
{
	public static final String CONFIG_FILE_PATH_PROP = "knetminer.dataSource.configFilePath"; 
	private static String configFilePath = null;
	
	private static Logger clog = LogManager.getLogger ( ConfigFileHarvester.class );
	
	@Override
	public synchronized void contextInitialized ( ServletContextEvent sce )
	{
		if ( configFilePath != null ) throw new UnsupportedOperationException (
		  CONFIG_FILE_PATH_PROP + " can be set only once, for a Knetminer server managing just one data source"
		);
		configFilePath = System.getProperty ( 
			CONFIG_FILE_PATH_PROP,
			sce.getServletContext ().getInitParameter ( CONFIG_FILE_PATH_PROP )
		);
		
		clog.info ( "----- {} configured from the web context to: '{}' -----", CONFIG_FILE_PATH_PROP, configFilePath );
	}

	@Override
	public void contextDestroyed ( ServletContextEvent sce ) {}

	public static synchronized String getConfigFilePath ()
	{
		return configFilePath;
	}
}