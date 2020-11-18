package rres.knetminer.datasource.ondexlocal.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.stereotype.Component;

import rres.knetminer.datasource.ondexlocal.ConfigFileHarvester;
import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;


/**
 * 
 * The Ondex-based service provider for Knetminer.
 * 
 * This class is rather central in the current Knetminer architecture. It realises most of the data-related functions
 * that are needed to serve the Knetminer web application, such as loading an Ondex file, indexing it, performing
 * Lucene-based searches rendering and exporting results.
 * 
 * <b>=====> WARNING <======</b>: this used to be an horrible mess of over 3k lines, DO NOT let it to happen again!
 * As you can see below, the class is mostly a wrapper of different sub-services, where functionality is split according
 * to types of functions. The wiring between all the components is done via Spring, with a 
 * {@link #springContext specific Spring context}, which is initialised here and populated via package scanning and
 * class annotations (no config file).  
 *
 * TODO: refactoring, continue with UI-related stuff and other small functions about UI or KG.
 * 
 * @author Marco Brandizi (refactored heavily in 2020)
 * @author taubertj, pakk, singha
 */
@Component
public class OndexServiceProvider 
{
	@Autowired
	private DataService dataService;

	@Autowired
	private SearchService searchService;
	
	@Autowired
	private SemanticMotifService semanticMotifService;
	
	
	@Autowired
	private UIService uiService;
	
	@Autowired
	private ExportService exportService;
	
	
	private static AbstractApplicationContext springContext;
	
	private final Logger log = LogManager.getLogger ( getClass() );
	
	/**
	 * It's a singleton, use {@link #getInstance()}.
	 */
  private OndexServiceProvider () {}
  
	
	public DataService getDataService () {
		return dataService;
	}
	
	public SearchService getSearchService ()
	{
		return searchService;
	}

	public SemanticMotifService getSemanticMotifService ()
	{
		return semanticMotifService;
	}
	
	public UIService getUIService ()
	{
		return uiService;
	}

	public ExportService getExportService ()
	{
		return exportService;
	}

	
	public static OndexServiceProvider getInstance () 
	{
		initSpring ();
		return springContext.getBean ( OndexServiceProvider.class );
	}
  
  private static void initSpring ()
	{
		// Double-check lazy init (https://www.geeksforgeeks.org/java-singleton-design-pattern-practices-examples/)
		if ( springContext != null ) return;
		
		synchronized ( OndexServiceProvider.class )
		{
			if ( springContext != null ) return;
			
			springContext = new AnnotationConfigApplicationContext ( "rres.knetminer.datasource.ondexlocal.service" );
			springContext.registerShutdownHook ();
			
			getInstance ().log.info ( "Spring context for {} initialised", OndexServiceProvider.class.getSimpleName () );
		}		
	}	

  /**
   * Coordinates the initialisation of several sub-services.
   * 
   * This is called before anything can be used. The config file comes from 
   * initialisation mechanisms like {@link ConfigFileHarvester}, see {@link OndexLocalDataSource#init()}.
   * 
   * @param configXmlPath
   */
	public void initGraph ( String configXmlPath )
	{
		this.dataService.loadOptions ( configXmlPath );
		dataService.initGraph ();
		
		this.searchService.indexOndexGraph ();
		this.semanticMotifService.initSemanticMotifData ();
		
		this.exportService.exportGraphStats ();
	} 
}
