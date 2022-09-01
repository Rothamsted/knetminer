package rres.knetminer.datasource.server;

import static uk.ac.ebi.utils.exceptions.ExceptionUtils.getSignificantMessage;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.message.ObjectMessage;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.HttpClientErrorException;

import com.brsanthu.googleanalytics.GoogleAnalytics;
import com.brsanthu.googleanalytics.GoogleAnalyticsBuilder;
import com.brsanthu.googleanalytics.request.DefaultRequest;
import com.brsanthu.googleanalytics.request.GoogleAnalyticsResponse;

import rres.knetminer.datasource.api.KnetminerDataSource;
import rres.knetminer.datasource.api.KnetminerRequest;
import rres.knetminer.datasource.api.KnetminerResponse;
import rres.knetminer.datasource.api.NetworkRequest;
import uk.ac.ebi.utils.exceptions.ExceptionUtils;
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

	private Map<String, KnetminerDataSource> dataSourceCache;

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
		
		this.dataSourceCache = new HashMap<>();
		for (KnetminerDataSource dataSource : dataSources) {
			for (String ds : dataSource.getDataSourceNames()) {
				this.dataSourceCache.put(ds, dataSource);
				log.info("Mapped /" + ds + " to " + dataSource.getClass().getName());
			}
		}
	}

	/**
	 * Initialises Google Analytics, via {@link KnetminerDataSource#getGoogleAnalyticsIdApi()}
	 */
	private String getGoogleAnalyticsTrackingId () 
	{
		return this.dataSources.get ( 0 ).getGoogleAnalyticsIdApi ();
	}


	/**
	 * Forward a request to a JSP page, using Spring MVC.
	 * 
	 * See below for details.
	 */
	private String mvcPageForward ( 
		String ds, String keyword, List<String> list, HttpServletRequest rawRequest, Model model, String pageId )
	{
		this.getConfiguredDatasource(ds, rawRequest); // just validates ds
		this.googleTrackPageView ( ds, pageId , keyword, list, null, rawRequest );
		
		if ( list != null && !list.isEmpty () )
			model.addAttribute("list", new JSONArray(list).toString());
		
		if (keyword != null && !"".equals ( keyword ) )
			model.addAttribute("keyword", keyword);

		return pageId;
	}
	
	
	/**
	 * A /genepage shortcut which generates a redirect to a prepopulated KnetMaps
	 * template with the /network query built for the user already. See WEB-INF/views
	 * to find the HTML template that this query will return.
	 * 
	 */
	@CrossOrigin
	@GetMapping("/{ds}/genepage")
	public String genepage (
		@PathVariable String ds, @RequestParam(required = false) String keyword,
		@RequestParam(required = true) List<String> list, HttpServletRequest rawRequest, Model model )
	{
		return this.mvcPageForward ( ds, keyword, list, rawRequest, model, "genepage" );
	}

	/**
	 * A /evidencepage shortcut which generates a redirect to a prepopulated KnetMaps
	 * template with the /evidencePath query built for the user already. See WEB-INF/views
	 * to find the HTML template that this query will return.
	 * @param ds
	 * @param keyword
	 * @param list
	 * @param rawRequest
	 * @param model
	 * @return
	 */
	@CrossOrigin
	@GetMapping("/{ds}/evidencepage")
	public String evidencepage (
		@PathVariable String ds, @RequestParam(required = true) String keyword,
		@RequestParam(required = false) List<String> list, HttpServletRequest rawRequest, Model model )
	{
		return this.mvcPageForward ( ds, keyword, list, rawRequest, model, "evidencepage" );
	}

	/**
	 * @see #network(String, NetworkRequest, HttpServletRequest)
	 */
	@CrossOrigin
	@GetMapping ( path = "/{ds}/network", produces = MediaType.APPLICATION_JSON_VALUE  ) 
	public @ResponseBody ResponseEntity<KnetminerResponse> network (
		@PathVariable String ds,
		@RequestParam(required = false, defaultValue = "") String keyword,
		@RequestParam(required = false) List<String> list,
		@RequestParam(required = false, defaultValue = "") String listMode,
		@RequestParam(required = false) List<String> qtl,
		@RequestParam(required = false, defaultValue = "") String taxId,
		@RequestParam(required = false, defaultValue = "false" ) boolean exportPlainJSON,
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
		request.setExportPlainJSON ( exportPlainJSON );
		
		return this.network ( ds, request, rawRequest );
	}
	
	
	/**
	 * Overwrite the normal request routing in order to manage the {@link NetworkRequest specific request}
	 * for this call.
	 */
	@CrossOrigin
	@PostMapping ( path = "/{ds}/network", produces = MediaType.APPLICATION_JSON_VALUE ) 
	public @ResponseBody ResponseEntity<KnetminerResponse> network ( 
		@PathVariable String ds, @RequestBody NetworkRequest request, HttpServletRequest rawRequest 
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
	@GetMapping("/{ds}/{mode}")
	public @ResponseBody ResponseEntity<KnetminerResponse> handle (
			@PathVariable String ds,
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
	@PostMapping("/{ds}/{mode}")
	public @ResponseBody ResponseEntity<KnetminerResponse> handle(@PathVariable String ds, @PathVariable String mode,
			@RequestBody KnetminerRequest request, HttpServletRequest rawRequest)
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
			String paramsStr = "Keyword:" + request.getKeyword () + " , List:"
				+ Arrays.toString ( request.getList ().toArray () ) + " , ListMode:" + request.getListMode () + " , QTL:"
				+ Arrays.toString ( request.getQtl ().toArray () );
			log.debug ( "Calling " + mode + " with " + paramsStr );
		}
		this.googleTrackPageView ( ds, mode, request, rawRequest );

		try
		{
			// TODO: as explained in their Javadoc, these are bridge methods, they should go away at some point
			if ( "getGoogleAnalyticsIdApi".equals ( mode ) )
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
		KnetminerDataSource dataSource = this.dataSourceCache.get ( ds );
		if (dataSource == null) throw new HttpClientErrorException ( 
			HttpStatus.BAD_REQUEST,  
			"data source name isn't set, probably a Knetminer configuration error" 
		);

		String incomingUrlPath = rawRequest.getRequestURL ().toString ().split ( "\\?" )[ 0 ];
		dataSource.setApiUrl ( incomingUrlPath.substring ( 0, incomingUrlPath.lastIndexOf ( '/' ) ) );
		return dataSource;
	}	
	
	/**
	 * TODO: do we need listMode?
	 * 
	 */
	private void googleTrackPageView (
		String ds, String mode, KnetminerRequest request, HttpServletRequest rawRequest
	)
	{
		this.googleTrackPageView ( ds, mode, request.getKeyword (), request.getList (), request.getQtl (), rawRequest );
	}

	
	private void googleTrackPageView (
		String ds, String mode, String keyword, List<String> userGenes, List<String> userChrRegions, HttpServletRequest rawRequest
	)
	{
		// TODO: googleLogApiRequest() considers certain API calls only, while this tracks all
		
		String gaId = getGoogleAnalyticsTrackingId ();
		
		if ( gaId == null ) {
			log.info ( "Google Analytics, no ID set, not tracking" );
			return;
		}

		String ipAddress = rawRequest.getHeader ( "X-FORWARDED-FOR" );
		
		if ( ipAddress == null )
		{
			ipAddress = rawRequest.getRemoteAddr ();
			log.debug ( "Preparing Google Analytics, using getRemoteAddr(): {}", ipAddress );
		} 
		else
		{
			log.debug ( "Preparing Google Analytics, splitting X-FORWARDED-FOR: {}", ipAddress );
			if ( ipAddress.indexOf ( ',' ) != -1 ) ipAddress = ipAddress.split ( "," )[ 0 ];
			
			log.debug ( "Preparing Google Analytics, using splitted IP: {}", ipAddress );
		}

		// TODO: what's the point?! Just logging?! MB: I've put it under log.isDebug
		if ( log.isDebugEnabled () )
		{
			String[] IP_HEADER_CANDIDATES = { 
				"X-Forwarded-For", "Proxy-Client-IP", "WL-Proxy-Client-IP",
				"HTTP_X_FORWARDED_FOR", "HTTP_X_FORWARDED", "HTTP_X_CLUSTER_CLIENT_IP",
				"HTTP_CLIENT_IP", "HTTP_FORWARDED_FOR",
				"HTTP_FORWARDED", "HTTP_VIA", "REMOTE_ADDR"
			};

			for ( String header : IP_HEADER_CANDIDATES )
			{
				String ip = rawRequest.getHeader ( header );
				if ( ip != null && ip.length () != 0 && !"unknown".equalsIgnoreCase ( ip ) )
					log.debug ( "Preparing Google Analytics, considering request header, {}: {}", header, ip );
			}
		}
		
		// GA wants the actual client URL?
		String clientHost = Optional.ofNullable ( rawRequest.getHeader ( "X-Forwarded-Host" ) )
			.orElse ( rawRequest.getRemoteHost () );
				
		String pageName = ds + "/" + mode;
		
		// This is like USER_AGENT in jdk.internal.net.http.HttpRequestImpl, which isn't accessible
		var userAgent = "Java-http-client/" + System.getProperty ( "java.version" );
		// DEBUG userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36";
		
		GoogleAnalytics ga = new GoogleAnalyticsBuilder ()
      .withDefaultRequest ( 
      	new DefaultRequest ()
      		.trackingId ( gaId )	
      		.userIp( ipAddress )
      		.documentHostName ( clientHost )
      		.documentTitle ( pageName )
      		.documentPath ( "/" + pageName )
      		.protocolVersion ( "2" )
      		.userAgent ( userAgent )
      )
			.build ();
				
		GoogleAnalyticsResponse gaResponse = ga.pageView ().send ();
		
		int gaRespCode = gaResponse.getStatusCode ();
		if ( gaRespCode >= 400 )
			log.error ( 
				"Google Analytics, request for ID {} failed, HTTP status: {}, ip: {}, client: {}",
				gaId, gaRespCode, ipAddress, clientHost 
			);
		else
			log.info ( 
				"Google Analytics invoked successfully with ID {}, ip: {}, client: {}", gaId, ipAddress, clientHost
		);
		
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
		
		// TODO: I don't see any need for a new level, nor for a separated log file 
		// logAnalytics.log ( Level.getLevel ( "ANALYTICS" ), msg );
		logAnalytics.info ( msg );
	}
	
}
