package rres.knetminer.datasource.server;

import static uk.ac.ebi.utils.exceptions.ExceptionUtils.getSignificantMessage;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.concurrent.CompletableFuture;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.message.ObjectMessage;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.HttpClientErrorException;

import rres.knetminer.datasource.api.GenomeRequest;
import rres.knetminer.datasource.api.KnetminerDataSource;
import rres.knetminer.datasource.api.KnetminerRequest;
import rres.knetminer.datasource.api.KnetminerResponse;
import rres.knetminer.datasource.api.NetworkRequest;
import rres.knetminer.datasource.api.config.GoogleAnalyticsConfiguration;
import rres.knetminer.datasource.server.utils.googleanalytics4.Event;
import rres.knetminer.datasource.server.utils.googleanalytics4.GoogleAnalyticsHelper;
import rres.knetminer.datasource.server.utils.googleanalytics4.GoogleAnalyticsUtils;
import rres.knetminer.datasource.server.utils.googleanalytics4.NumberParam;
import rres.knetminer.datasource.server.utils.googleanalytics4.StringParam;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.opt.net.ServletUtils;
import uk.ac.ebi.utils.opt.springweb.exceptions.ResponseStatusException2;

/**
 * KnetminerServer is a fully working server, except that it lacks any data
 * sources. To make a server with data sources, just add one or more JARs to the
 * classpath which include classes that implement KnetminerDataSourceProvider
 * (and are in package rres.knetminer.datasource). They are detected and loaded
 * via autowiring. See the sister server-example project for how this is done. 
 * 
 * @author holland
 * @author Marco Brandizi (
 * 	2021, removed custom exception management and linked it to {@link KnetminerExceptionHandler}
 *  2022, various code factorisation and renaming
 * ) 
 */
@Controller
@RequestMapping("/")
public class KnetminerServer
{	
	@Autowired
	private List<KnetminerDataSource> dataSources;

	private Map<String, KnetminerDataSource> dataSourceCache = new HashMap<> ();
	
	private GoogleAnalyticsHelper analyticsHelper;

	private final Logger log = LogManager.getLogger ( getClass() );
	
	// Special logging to achieve web analytics info.
	private final Logger logAnalytics = LogManager.getLogger ( "analytics-log" );


	/**
	 * Autowiring will populate the basic dataSources list with all instances of
	 * KnetminerDataSourceProvider. This method is used, upon first access, to take
	 * that list and turn it into a map of URL paths to data sources, using the
	 * getName() function of each data source to build an equivalent URL. For
	 * instance a data source with getName()='hello' will receive all requests
	 * matching '/hello/**'.
	 */
	@PostConstruct
	private void buildDataSourceCache() 
	{
		if ( this.dataSources == null || this.dataSources.size () == 0 ) throw new IllegalArgumentException (
			"No KnetminerDataSource defined, probably a packaging error"	
		);

		if ( dataSources.size () > 1 ) throw new UnsupportedOperationException (
			"More than one KnetminerDataSource defined, this is no longer supported"	
		);
				
		// So, we're sure there is only this one
		KnetminerDataSource dataSource = dataSources.get ( 0 );
		// TODO: reduce this too to 1 element only
		for (String ds : dataSource.getDataSourceNames()) {
			this.dataSourceCache.put(ds, dataSource);
			log.info("Mapped /" + ds + " to " + dataSource.getClass().getName());
		}
	}

	@PostConstruct
	private void initializeAnalytics ()
	{
		var gaCfg = this.dataSources.get ( 0 ).getGoogleAnalyticsApiConfig ();
		if ( gaCfg == null ) {
			log.info ( "Google Analytics configuration is null, no GA tracking will occur" );
			return;
		}
		
		this.analyticsHelper = new GoogleAnalyticsHelper ( 
			gaCfg.getApiSecret (), gaCfg.getMeasurementId (), gaCfg.getClientId () 
		);
	}

	

	/**
	 * Overwrite the normal request routing in order to manage the {@link GenomeRequest specific request}
	 * for this call.
	 */
	@CrossOrigin
	@PostMapping (
		// the DS has become optional, see #753. The same apply to all the URL mapping
		path = { "/{ds}/genome", "/genome" }, produces = MediaType.APPLICATION_JSON_VALUE
	) 
	public @ResponseBody ResponseEntity<KnetminerResponse> genome ( 
		@PathVariable( required = false ) String ds, @RequestBody GenomeRequest request, HttpServletRequest rawRequest 
	) 
	{
		if ( log.isDebugEnabled () ) log.debug ( "/genome POST, request: {}", request );
		return this.handle ( ds, "genome", request, rawRequest );
	}
	
	/**
	 * @see #genome(String, GenomeRequest, HttpServletRequest)
	 */
	@CrossOrigin
	@GetMapping ( path = { "/{ds}/genome", "/genome" }, produces = MediaType.APPLICATION_JSON_VALUE  ) 
	public @ResponseBody ResponseEntity<KnetminerResponse> genome (
		@PathVariable(required = false) String ds,
		@RequestParam(required = false, defaultValue = "") String keyword,
		@RequestParam(required = false) List<String> list,
		@RequestParam(required = false, defaultValue = "") String listMode,
		@RequestParam(required = false) List<String> qtl,
		@RequestParam(required = false, defaultValue = "") String taxId,
		@RequestParam(required = false, defaultValue = "false" ) boolean isSortedEvidenceTable,
		HttpServletRequest rawRequest
	)
	{
		return this.handleGenomeOrQtl ( 
			ds, keyword, list, listMode, qtl, taxId, isSortedEvidenceTable, rawRequest, "genome"
		);
	}	
	
	
	/**
	 * Wrapper similar to {@link #genome(String, GenomeRequest, HttpServletRequest)}
	 */
	@CrossOrigin
	@PostMapping ( path = { "/{ds}/qtl", "/qtl" }, produces = MediaType.APPLICATION_JSON_VALUE ) 
	public @ResponseBody ResponseEntity<KnetminerResponse> qtl ( 
		@PathVariable( required = false ) String ds, @RequestBody GenomeRequest request, HttpServletRequest rawRequest 
	) 
	{
		return this.handle ( ds, "qtl", request, rawRequest );
	}
	
	/**
	 * @see #qtl(String, GenomeRequest, HttpServletRequest)
	 */
	@CrossOrigin
	@GetMapping ( path = { "/{ds}/qtl", "/qtl" }, produces = MediaType.APPLICATION_JSON_VALUE  ) 
	public @ResponseBody ResponseEntity<KnetminerResponse> qtl (
		@PathVariable( required = false ) String ds,
		@RequestParam(required = false, defaultValue = "") String keyword,
		@RequestParam(required = false) List<String> list,
		@RequestParam(required = false, defaultValue = "") String listMode,
		@RequestParam(required = false) List<String> qtl,
		@RequestParam(required = false, defaultValue = "") String taxId,
		@RequestParam(required = false, defaultValue = "false" ) boolean isSortedEvidenceTable,
		HttpServletRequest rawRequest
	)
	{
		return this.handleGenomeOrQtl ( 
			ds, keyword, list, listMode, qtl, taxId, isSortedEvidenceTable, rawRequest, "qtl"
		);
	}
	
	
	/**
	 * Wrappers for {@link #handleGenomeOrQtl(String, GenomeRequest, HttpServletRequest, String)}
	 */
	private ResponseEntity<KnetminerResponse> handleGenomeOrQtl (
		String ds,
		String keyword,
		List<String> list,
		String listMode,
		List<String> qtl,
		String taxId,
		boolean isSortedEvidenceTable,
		HttpServletRequest rawRequest,
		String method
	)
	{
		// TODO: isn't this done downstream?
		if (qtl == null) qtl = Collections.emptyList();
		if (list == null) list = Collections.emptyList();

		var request = new GenomeRequest ();
		request.setKeyword(keyword);
		request.setListMode(listMode);
		request.setList(list);
		request.setQtl(qtl);
		request.setTaxId(taxId);
		request.setSortedEvidenceTable ( isSortedEvidenceTable );

		return this.handle ( ds, method, request, rawRequest );
	}
	
	
	
	/**
	 * @see #network(String, NetworkRequest, HttpServletRequest)
	 */
	@CrossOrigin
	@GetMapping ( path = { "/{ds}/network", "/network" }, produces = MediaType.APPLICATION_JSON_VALUE  ) 
	public @ResponseBody ResponseEntity<KnetminerResponse> network (
		@PathVariable( required = false ) String ds,
		@RequestParam(required = false, defaultValue = "") String keyword,
		@RequestParam(required = false) List<String> list,
		@RequestParam(required = false, defaultValue = "") String listMode,
		@RequestParam(required = false) List<String> qtl,
		@RequestParam(required = false, defaultValue = "") String taxId,
		@RequestParam(required = false, defaultValue = "false" ) boolean isExportPlainJSON,
		HttpServletRequest rawRequest
	)
	{
		// TODO: isn't this done downstream?
		if (qtl == null) qtl = Collections.emptyList();
		if (list == null) list = Collections.emptyList();

		// TODO: we need better management of this ugly stuff. Like plain parameters only, a request object isn't
		// actually needed
		//
		var request = new NetworkRequest ();
		request.setKeyword(keyword);
		request.setListMode(listMode);
		request.setList(list);
		request.setQtl(qtl);
		request.setTaxId(taxId);
		request.setExportPlainJSON ( isExportPlainJSON );
		
		return this.network ( ds, request, rawRequest );
	}
	
	
	/**
	 * As for the case of {@link #genome(String, GenomeRequest, HttpServletRequest)}, 
	 * manages the {@link NetworkRequest specific request} for this call.
	 */
	@CrossOrigin
	@PostMapping ( path = { "/{ds}/network", "/network" }, produces = MediaType.APPLICATION_JSON_VALUE ) 
	public @ResponseBody ResponseEntity<KnetminerResponse> network ( 
		@PathVariable( required = false ) String ds, @RequestBody NetworkRequest request, HttpServletRequest rawRequest 
	) 
	{
		return this.handle ( ds, "network", request, rawRequest );
	}
	

	/**
	 * Pick up all GET requests sent to any URL matching /X/Y. X is taken to be the
	 * name of the data source to look up by its getName() function (see above for
	 * the mapping function buildDataSourceCache(). Y is the 'mode' of the request.
	 * Spring magic automatically converts the response into JSON. We convert the
	 * GET parameters into a KnetminerRequest object for handling by the 
	 * {@link #handleRaw(String, String, KnetminerRequest, HttpServletRequest)}() 
	 * method.
	 * 
	 * @param ds
	 * @param mode
	 * @param qtl
	 * @param keyword
	 * @param list The user-provided gene list
	 * @param listMode TODO: this is not used anywhere
	 * @param rawRequest
	 * @return
	 */
	@CrossOrigin
	@GetMapping( { "/{ds}/{mode}", "/{mode}" } )
	public @ResponseBody ResponseEntity<KnetminerResponse> handle (
			@PathVariable( required = false ) String ds,
			@PathVariable String mode,
			@RequestParam(required = false) List<String> qtl,
			@RequestParam(required = false, defaultValue = "") String keyword,
			@RequestParam(required = false) List<String> list,
			@RequestParam(required = false, defaultValue = "") String listMode,
			@RequestParam(required = false, defaultValue = "") String taxId,
			HttpServletRequest rawRequest
	)
	{
		// TODO: isn't this done downstream?
		if (qtl == null) qtl = Collections.emptyList();
		if (list == null) list = Collections.emptyList();

		KnetminerRequest request = new KnetminerRequest();
		request.setKeyword(keyword);
		request.setListMode(listMode);
		request.setList(list);
		request.setQtl(qtl);
		request.setTaxId(taxId);
		
		return this.handleRaw ( ds, mode, request, rawRequest );
	}

	/**
	 * Pick up all POST requests sent to any URL matching /X/Y. X is taken to be the
	 * name of the data source to look up by its getName() function (see above for
	 * the mapping function buildDataSourceCache(). Y is the 'mode' of the request.
	 * Spring magic automatically converts the response into JSON. Spring magic also
	 * automatically converts the inbound POST JSON body into a KnetminerRequest
	 * object for handling by the _handle() method.
	 * 
	 * @param ds
	 * @param mode
	 * @param request
	 * @param rawRequest
	 * @return
	 */
	@CrossOrigin
	@PostMapping( { "/{ds}/{mode}", "/{mode}" } )
	public @ResponseBody ResponseEntity<KnetminerResponse> handle (
		@PathVariable( required = false ) String ds,
		@PathVariable String mode,
		@RequestBody KnetminerRequest request, HttpServletRequest rawRequest
	)
	{
		return this.handleRaw ( ds, mode, request, rawRequest );
	}


	/**
	 * Low-level request handler.
	 * 
	 * We use reflection to take the 'mode' (the Y part of the /X/Y request path)
	 * and look up an equivalent method on the requested data source, then we call
	 * it with the request parameters passed in.
	 * 
	 * @param ds
	 * @param mode
	 * @param request
	 * @param rawRequest
	 * @return
	 */
	private ResponseEntity<KnetminerResponse> handleRaw (
		String ds, String mode, KnetminerRequest request, HttpServletRequest rawRequest ) 
	{
		if ( mode == null || mode.isEmpty () || mode.isBlank () )
			throw new IllegalArgumentException ( "Knetminer API invoked with null/empty method name" );

		KnetminerDataSource dataSource = this.getConfiguredDatasource ( ds, rawRequest );

		if ( log.isDebugEnabled () )
		{
			log.debug ( "Calling /" + mode + " with " + request );
		}

		try
		{
			// TODO: as explained in their Javadoc, these are bridge methods, they should go away at some point
			if ( "getGoogleAnalyticsApiConfig".equals ( mode ) )
				ExceptionUtils.throwEx ( 
					IllegalArgumentException.class, 
					"The method %s isn't a valid data source API call, use the equivalent /dataset-info//google-analytics-id instead",
					mode
			);
			
			// WARNING: this relies on the fact that a signature exists that takes a parameter of EXACTLY the same class as
			// request.getClass (), if you have an API method that accepts a super-class instead, this kind of reflection
			// won't be enough to pick it.
			//
			Method method = dataSource.getClass ().getMethod ( mode, String.class, request.getClass () );
			
			try {
				KnetminerResponse response = (KnetminerResponse) method.invoke ( dataSource, ds, request );
				return new ResponseEntity<> ( response, HttpStatus.OK );
			}
			catch ( InvocationTargetException ex )
			{
				// This was caused by a underlying more significant exception, best is to try to catch and re-throw it.
				throw ExceptionUtils.getSignificantException ( ex );
			}
		}
		catch ( NoSuchMethodException | IllegalAccessException | SecurityException ex )
		{
			throw new ResponseStatusException2 ( HttpStatus.BAD_REQUEST,
				"Bad API call '" + mode + "': " + getSignificantMessage ( ex ), ex );
		}
		catch ( IllegalArgumentException ex )
		{
			throw new ResponseStatusException2 ( HttpStatus.BAD_REQUEST,
				"Bad parameters passed to the API call '" + mode + "': " + getSignificantMessage ( ex ), ex );
		}
		catch ( RuntimeException ex )
		{
			// Let's re-throw the same exception, with a wrapping message
			throw ExceptionUtils.buildEx ( ex.getClass (), ex,
				"Application error while running the API call '%s': %s", mode,
				getSignificantMessage ( ex )
			);
		}
		catch ( Exception ex )
		{
			throw new RuntimeException (
				"Application error while running the API call '" + mode + "': " + getSignificantMessage ( ex ), ex );
		}
		catch ( Throwable ex )
		{
			throw new Error (
				"System error while running the API call '" + mode + "': " + getSignificantMessage ( ex ), ex );
		}
		finally {
			// TODO: should we track when failed?
			this.googleTrackPageView ( ds, mode, request, rawRequest );
		}
	}
	
	
	/**
	 * Gets the data source coming from the request, enriches it with data taken from the raw request and 
	 * return the result. 
	 * 
	 * @throws HttpClientErrorException with {@link HttpStatus#BAD_REQUEST} if the ds isn't found in 
	 * 	{@link #dataSources}. A explained above, the current KnetMiner has one value only in this list.
	 * 
	 */
	private KnetminerDataSource getConfiguredDatasource ( String ds, HttpServletRequest rawRequest )
	{
		if ( this.dataSourceCache == null || dataSourceCache.isEmpty () )
			throw new HttpClientErrorException ( 
			HttpStatus.BAD_REQUEST,  
			"Data source name isn't set, probably a Knetminer configuration error" 
		);

		// The default/omission
		if ( ds == null || "default".equals ( ds ) || "_".equals ( ds ) )
			ds = this.dataSourceCache.keySet ().iterator ().next (); 
		
		// When it's specified, let's keep checking
		KnetminerDataSource dataSource = this.dataSourceCache.get ( ds );
		if (dataSource == null) throw new HttpClientErrorException ( 
			HttpStatus.BAD_REQUEST,  
			String.format ( "Invalid data source '%s', you can omit it", ds ) 
		);

		String incomingUrlPath = rawRequest.getRequestURL ().toString ().split ( "\\?" )[ 0 ];
		dataSource.setApiUrl ( incomingUrlPath.substring ( 0, incomingUrlPath.lastIndexOf ( '/' ) ) );
		return dataSource;
	}	
	
	/**
	 * TODO: do we need listMode?
	 */
	private void googleTrackPageView (
		String ds, String mode, KnetminerRequest request, HttpServletRequest rawRequest
	)
	{
		this.googleTrackPageView (
			ds, mode, request.getTaxId (),
			request.getKeyword (), request.getList (), request.getListMode (), 
			request.getQtl (), rawRequest
		);
	}

	
	private void googleTrackPageView (
		String ds, String mode, String taxId,
		String keyword, List<String> userGenes, String userGenesMode, 
		List<String> userChrRegions, HttpServletRequest rawRequest
	)
	{
		// TODO: googleLogApiRequest() considers certain API calls only, while this tracks all
		
					
		String pageName = ds + "_" + mode;
						
		final var clientIpParam = GoogleAnalyticsUtils.getClientIPParam ( rawRequest );
		final var clientHostParam = GoogleAnalyticsUtils.getClientHostParam ( rawRequest );
		
    CompletableFuture<HttpResponse> eventFuture = this.analyticsHelper.sendEventsAsync ( 
    	new Event ( "api_" + pageName, 
    	  clientIpParam,
    	  clientHostParam,
    	  clientIpParam,
    	  new StringParam ( "keywords", keyword ),
    	  new NumberParam ( 
    	  	"genesListSize",
    	  	(double) Optional.ofNullable ( userGenes )
    	  	.map ( List::size )
    	  	.orElse ( 0 )
    	  ),
    	  new StringParam ( "genesListMode", userGenesMode ),
    	  new NumberParam ( 
    	  	"chrSize",
    	  	(double) Optional.ofNullable ( userChrRegions )
    	  	.map ( List::size )
    	  	.orElse ( 0 )
    	  ),
    	  new StringParam ( "taxId", taxId )
    ));
		
    eventFuture.thenAcceptAsync ( gaResponse -> 
		{
			StatusLine status = gaResponse.getStatusLine ();
			int statusCode = status.getStatusCode ();
			
			// These should be what GA returns when it's happy with our request
			boolean isValidReply = false;
			String rbody = "";
			if ( statusCode == 204 )
			{
				rbody = StringUtils.trimToEmpty ( ServletUtils.getResponseBody ( gaResponse ) );
				isValidReply = rbody.length () == 0;
			}
			
			if ( isValidReply )
				log.info ( 
						"Google Analytics invoked successfully for '/{}', IP: {}, client host: {}", 
						pageName, clientIpParam.getString (), clientHostParam.getString ()
				);
			else
				log.error ( 
					"Google Analytics, request to track '/{}' failed, HTTP status: {}, IP: {}, client host: {}",
					pageName, status.toString (), clientIpParam.getString (), clientHostParam.getString () 
				);
		});
		
		// TODO: should we track it when GA fails?
		this.googleLogApiRequest ( ds, mode, keyword, userGenes, userChrRegions, rawRequest );			
	}
	
	
	/**
	 * Sends Google Analytics traces to the dedicated logger {@link #logAnalytics}.
	 * 
	 * See above for details.
	 */
	private void googleLogApiRequest ( 
		String ds, String mode, String keyword, List<String> list, List<String> qtl, HttpServletRequest rawRequest 
	)
	{
		// These are the API calls that come from the outside, others are internal functions used by client together
		// with these
		//
		if ( !ArrayUtils.contains ( new String[] { "genome", "genepage", "network" }, mode ) ) return;

		Map<String, String> map = new TreeMap<> ();

		map.put ( "host", rawRequest.getServerName () );
		map.put ( "port", Integer.toString ( rawRequest.getServerPort () ) );

		map.put ( "mode", mode );
		
		if ( keyword != null && !keyword.isEmpty () ) map.put ( "keywords", keyword );

		if ( list != null && !list.isEmpty () )
			map.put ( "list", new JSONArray ( list ).toString () );

		if ( qtl != null && !qtl.isEmpty () )
			map.put ( "qtl", new JSONArray ( qtl ).toString () );

		map.put ( "datasource", ds );
		
		ObjectMessage msg = new ObjectMessage ( map );
		
		logAnalytics.info ( msg );
	}	
}
