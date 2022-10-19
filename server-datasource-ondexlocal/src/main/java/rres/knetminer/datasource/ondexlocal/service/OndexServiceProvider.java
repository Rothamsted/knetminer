package rres.knetminer.datasource.ondexlocal.service;

import java.util.concurrent.atomic.AtomicBoolean;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.stereotype.Component;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;
import uk.ac.ebi.utils.exceptions.ExceptionLogger;
import uk.ac.ebi.utils.exceptions.NotReadyException;


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
	private SemanticMotifDataService semanticMotifDataService;

	
	@Autowired
	private SemanticMotifService semanticMotifService;
	
	
	@Autowired
	private UIService uiService;
	
	@Autowired
	private ExportService exportService;
	
	private AtomicBoolean isInitializingData = new AtomicBoolean ( false );
	private Exception initException = null;
	
	private static volatile AbstractApplicationContext springContext;
	
	private final Logger log = LogManager.getLogger ( getClass() );

	private final static Logger slog = LogManager.getLogger ( OndexServiceProvider.class );
	
	private final ExceptionLogger exlog = ExceptionLogger.getLogger ( "error-log" );

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
	
	public SemanticMotifDataService getSemanticMotifDataService ()
	{
		return semanticMotifDataService;
	}

	public UIService getUIService ()
	{
		return uiService;
	}

	public ExportService getExportService ()
	{
		return exportService;
	}

	/**
	 * @throws NotReadyException as explained in {@link #initData()}, if the current instance is 
	 * initialising its data, this is exception is thrown and the invoker should try again later.
	 * This is what it might happen in calls to this method in the {@link OndexLocalDataSource} 
	 * API-related methods.
	 * 
	 * @throws RuntimeException if {@link #initData()} failed with an exception (which is wrapped 
	 * by the one returned here). 
	 */
	public static OndexServiceProvider getInstance () 
	{
		initSpring ();
		
		var instance = springContext.getBean ( OndexServiceProvider.class );
		
		if ( instance.isInitializingData.get () ) 
			throw new NotReadyException ( "Ondex/Knetminer is initialising its data, please try again later" );
		
		if ( instance.initException != null ) throw new RuntimeException ( 
			"Ondex/Knetminer failed to initialise due to: " + instance.initException.getMessage (),
			instance.initException
		);
		
		return instance;
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
			
			slog.info ( "Spring context for {} initialised", OndexServiceProvider.class.getSimpleName () );
		}		
	}	

  /**
   * Coordinates the initialisation of this and several sub-services.
   * 
   * This requires that you first call {@link DataService#loadConfiguration(String)} on {@link #getDataService()}.
   * Then, this should be the next method to call before you can use anything about the Ondex service provider.
   * 
	 * This method wraps the whole initialisation into a critical block marked by {@link #isInitializingData()}.
	 * When {@link #getInstance()} is invoked asynchronously and the initialisation is still happening for the
	 * instance, then a {@link NotReadyException} is thrown.  
	 * 
	 * This is designed mainly to allow that long-running Knetminer initialisations don't block the whole JVM and
	 * hence the whole web container. The mechanism is used in the Knetminer API implementation 
	 * {@link OndexLocalDataSource}, which indeed invokes this method asynchronously and later, when API methods
	 * tries to {@link #getInstance() get an instance} of myself, a {@link NotReadyException} is raised if the 
	 * initialisation isn't finished yet.
	 * 
	 */
	public void initData ()
	{
		this.isInitializingData.getAndSet ( true );
		try
		{
			log.info ( "Starting Ondex/Knetminer data initialization" );
			
			this.initException = null;
			
			if ( this.dataService.getConfiguration () == null ) throw new IllegalStateException ( 
					"OndexServiceProvider.initData() requires that you first load a configuration"
				+ " via getDataService().loadConfiguration()" 
			);
			
			dataService.initGraph ();
			
			this.searchService.indexOndexGraph ();
			this.semanticMotifDataService.initSemanticMotifData ();
			
			this.exportService.exportGraphStats ();

			log.info ( "Ondex/Knetminer data initialization ended" );
		}
		catch ( Exception ex ) {
			exlog.logEx ( "Ondex Data initialisation failed: " + ex.getMessage () , ex );
			this.initException = ex;
		}
		finally {
			this.isInitializingData.getAndSet ( false );
		}
	}
	
	
	/**
	 * @see #initData().
	 */
	public boolean isInitializingData ()
	{
		return isInitializingData.get ();
	}
}
