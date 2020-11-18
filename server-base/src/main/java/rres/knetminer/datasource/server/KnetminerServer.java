package rres.knetminer.datasource.server;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.TreeMap;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.message.ObjectMessage;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

import rres.knetminer.datasource.api.KnetminerDataSource;
import rres.knetminer.datasource.api.KnetminerRequest;
import rres.knetminer.datasource.api.KnetminerResponse;

/**
 * KnetminerServer is a fully working server, except that it lacks any data
 * sources. To make a server with data sources, just add one or more JARs to the
 * classpath which include classes that implement KnetminerDataSourceProvider
 * (and are in package rres.knetminer.datasource). They are detected and loaded
 * via autowiring. See the sister server-example project for how this is done.
 * 
 * @author holland
 */
@Controller
@RequestMapping("/")
public class KnetminerServer {
	protected final Logger log = LogManager.getLogger(getClass());
	
	@Autowired
	private List<KnetminerDataSource> dataSources;

	private Map<String, KnetminerDataSource> dataSourceCache;

	private String gaTrackingId;

	// Special logging to achieve web analytics info.
	private static final Logger logAnalytics = LogManager.getLogger("analytics-log");


	/**
	 * Autowiring will populate the basic dataSources list with all instances of
	 * KnetminerDataSourceProvider. This method is used, upon first access, to take
	 * that list and turn it into a map of URL paths to data sources, using the
	 * getName() function of each data source to build an equivalent URL. For
	 * instance a data source with getName()='hello' will receive all requests
	 * matching '/hello/**'.
	 */
	@PostConstruct
	public void _buildDataSourceCache() {		
		this.dataSourceCache = new HashMap<String, KnetminerDataSource>();
		for (KnetminerDataSource dataSource : this.dataSources) {
			for (String ds : dataSource.getDataSourceNames()) {
				this.dataSourceCache.put(ds, dataSource);
				log.info("Mapped /" + ds + " to " + dataSource.getClass().getName());
			}
		}
	}

	/**
	 * Loads Google Analytics properties from src/main/resources/ga.properties . It expects
	 * to find GOOGLE_ANALYTICS_ENABLED = True or False. If True, it also expects to find
	 * GOOGLE_ANALYTICS_TRACKING_ID with a valid Google Analytics tracking ID.
	 */
	@PostConstruct
	public void _loadGATrackingId() {
		ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
		InputStream input = classLoader.getResourceAsStream("ga.properties");
		Properties props = new Properties();
		try {
			props.load(input);
		} catch (IOException ex) {
			log.warn("Failed to load Google Analytics properties file", ex);
			return;
		}
		if (Boolean.parseBoolean(props.getProperty("GOOGLE_ANALYTICS_ENABLED", "False"))) {
			this.gaTrackingId = props.getProperty("GOOGLE_ANALYTICS_TRACKING_ID", null);
			if (this.gaTrackingId == null)
				log.warn("Google Analytics properties file enabled analytics but did not provide tracking ID");
			else
				log.info("Google Analytics enabled");
		} else
			log.info("Google Analytics disabled");
	}

	private void _googlePageView(String ds, String mode, HttpServletRequest rawRequest)
	{
		String ipAddress = rawRequest.getHeader("X-FORWARDED-FOR");
		log.debug("IP TRACING 1, IP for X-FORWARDED-FOR: {}", ipAddress);
		if (ipAddress == null) {
			ipAddress = rawRequest.getRemoteAddr();
			log.debug("IP TRACING 2, getRemoteAddr(): {}", ipAddress);
		}else{
			log.debug("IP TRACING 3, IP to be split: {}", ipAddress);
			if(ipAddress.indexOf(',')!= -1){
				ipAddress = ipAddress.split(",")[0];
			}
			log.debug("IP TRACING 4, splitted IP: {}", ipAddress);
		}
		log.debug("IP TRACING 5 post-processed IP: {}", ipAddress);

		String[] IP_HEADER_CANDIDATES = {
				"X-Forwarded-For",
				"Proxy-Client-IP",
				"WL-Proxy-Client-IP",
				"HTTP_X_FORWARDED_FOR",
				"HTTP_X_FORWARDED",
				"HTTP_X_CLUSTER_CLIENT_IP",
				"HTTP_CLIENT_IP",
				"HTTP_FORWARDED_FOR",
				"HTTP_FORWARDED",
				"HTTP_VIA",
				"REMOTE_ADDR" };

		for (String header : IP_HEADER_CANDIDATES) {
			String ip = rawRequest.getHeader(header);
			if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
				log.debug("IP TRACING, req headers, {}:{}", header, ip);
			}
		}

		if (this.gaTrackingId!=null) {
			String pageName = ds+"/"+mode;
			GoogleAnalytics ga = new GoogleAnalyticsBuilder().withTrackingId(this.gaTrackingId).build();
			ga.pageView().documentTitle(pageName).documentPath("/" + pageName)
					.userIp(ipAddress).send();
		}
	}

	/**
	 * A /genepage shortcut which generates a redirect to a prepopulated KnetMaps
	 * template with the /network query built for the user already. See WEB-INF/views
	 * to find the HTML template that this query will return.
	 * @param ds
	 * @param keyword
	 * @param list
	 * @param rawRequest
	 * @param model
	 * @return
	 */
	@CrossOrigin
	@GetMapping("/{ds}/genepage")
	public String genepage(@PathVariable String ds, @RequestParam(required = false) String keyword,
			@RequestParam(required = true) List<String> list, HttpServletRequest rawRequest, Model model) {

		KnetminerDataSource dataSource = this.getConfiguredDatasource(ds, rawRequest);
		if (dataSource == null) {
			throw new HttpClientErrorException(HttpStatus.NOT_FOUND);
		}
		this._googlePageView(ds, "genepage", rawRequest);
		model.addAttribute("list", new JSONArray(list).toString());
		if (keyword != null && !"".equals(keyword)) {
			model.addAttribute("keyword", keyword);
		}

		return "genepage";
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
	public String evidencepage(@PathVariable String ds, @RequestParam(required = true) String keyword,
						       @RequestParam(required = false) List<String> list, HttpServletRequest rawRequest, Model model) {
		KnetminerDataSource dataSource = this.getConfiguredDatasource(ds, rawRequest);
		if (dataSource == null) {
			throw new HttpClientErrorException(HttpStatus.NOT_FOUND);
		}
		this._googlePageView(ds, "evidencepage", rawRequest);

		if (!list.isEmpty()) {
			model.addAttribute("list", new JSONArray(list).toString());
		}
		model.addAttribute("keyword", keyword);
		return "evidencepage";
	}

	/**
	 * Pick up all GET requests sent to any URL matching /X/Y. X is taken to be the
	 * name of the data source to look up by its getName() function (see above for
	 * the mapping function buildDataSourceCache(). Y is the 'mode' of the request.
	 * Spring magic automatically converts the response into JSON. We convert the
	 * GET parameters into a KnetminerRequest object for handling by the _handle()
	 * method.
	 * 
	 * @param ds
	 * @param mode
	 * @param qtl
	 * @param keyword
	 * @param list TODO: what is this?!
	 * @param listMode
	 * @param rawRequest
	 * @return
	 */
	@CrossOrigin
	@GetMapping("/{ds}/{mode}")
	public @ResponseBody ResponseEntity<KnetminerResponse> handle(@PathVariable String ds, @PathVariable String mode,
			@RequestParam(required = false) List<String> qtl,
			@RequestParam(required = false, defaultValue = "") String keyword,
			@RequestParam(required = false) List<String> list,
			@RequestParam(required = false, defaultValue = "") String listMode, HttpServletRequest rawRequest) {
		if (qtl == null) {
			qtl = Collections.emptyList();
		}
		if (list == null) {
			list = Collections.emptyList();
		}

		// TODO: We need VERY MUCH to stop polluting code this way! 
		// This MUST go to some utilty and there there MUST BE only some invocation that clearly recalls the semantics 
		// of these operations, eg, KnetminerServerUtils.logAnalytics ( logger, rawRequest, mode, list )
		// This is filed under #462
		//
		Map<String, String> map = new TreeMap<>();

		map.put("host",rawRequest.getServerName());
		map.put("port",Integer.toString(rawRequest.getServerPort()));

		map.put("mode", mode);
		if(keyword != null) {
			map.put("keywords", keyword);
		}
		if(!list.isEmpty()) {
			map.put("list", new JSONArray(list).toString());
		}

		map.put("qtl", new JSONArray(qtl).toString());

		map.put("datasource", ds);
		if (mode.equals("genome") || mode.equals("genepage") || mode.equals("network")) {
			ObjectMessage msg = new ObjectMessage(map);
			logAnalytics.log(Level.getLevel("ANALYTICS"),msg);
		}
		KnetminerRequest request = new KnetminerRequest();
		request.setKeyword(keyword);
		request.setListMode(listMode);
		request.setList(list);
		request.setQtl(qtl);
		return this._handle(ds, mode, request, rawRequest);
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
			@RequestBody KnetminerRequest request, HttpServletRequest rawRequest) {
		// TODO WRONG! Duplicating code like this is way too poor and 
		// it needs to be factorised in a separated utility anyway!
		//
		Map<String, String> map = new TreeMap<>();

		map.put("host",rawRequest.getServerName());
		map.put("port",Integer.toString(rawRequest.getServerPort()));

		map.put("mode", mode);
		String keyword = request.getKeyword();
		List<String> list = request.getList();
		List<String> qtl = request.getQtl();
		if(keyword != null) {
			map.put("keywords", keyword);
		}
		if(!list.isEmpty()) {
			map.put("list", new JSONArray(list).toString());
		}

		map.put("qtl", new JSONArray(qtl).toString());

		map.put("datasource", ds);
		if (mode.equals("genome") || mode.equals("genepage") || mode.equals("network")) {
			ObjectMessage msg = new ObjectMessage(map);
			logAnalytics.log(Level.getLevel("ANALYTICS"),msg);
		}
		
		return this._handle(ds, mode, request, rawRequest);
	}

	private KnetminerDataSource getConfiguredDatasource(String ds, HttpServletRequest rawRequest) {
		KnetminerDataSource dataSource = this.dataSourceCache.get(ds);
		if (dataSource == null) {
			log.info("Invalid data source requested: /" + ds);
			return null;
		}
		String incomingUrlPath = rawRequest.getRequestURL().toString().split("\\?")[0];
		dataSource.setApiUrl(incomingUrlPath.substring(0, incomingUrlPath.lastIndexOf('/')));
		return dataSource;
	}

	/**
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
	private ResponseEntity<KnetminerResponse> _handle(String ds, String mode, KnetminerRequest request,
			HttpServletRequest rawRequest) {
		KnetminerDataSource dataSource = this.getConfiguredDatasource(ds, rawRequest);
		if (dataSource == null) {
			return new ResponseEntity<KnetminerResponse>(HttpStatus.NOT_FOUND);
		}

		try {
			if (log.isDebugEnabled()) {
				String paramsStr = "Keyword:" + request.getKeyword() + " , List:"
						+ Arrays.toString(request.getList().toArray()) + " , ListMode:" + request.getListMode()
						+ " , QTL:" + Arrays.toString(request.getQtl().toArray());
				log.debug("Calling " + mode + " with " + paramsStr);
			}
			KnetminerResponse response;
			Method method = dataSource.getClass().getMethod(mode, String.class, KnetminerRequest.class);
			this._googlePageView(ds, mode, rawRequest);
			response = (KnetminerResponse) method.invoke(dataSource, ds, request);
			return new ResponseEntity<KnetminerResponse>(response, HttpStatus.OK);
		} catch (NoSuchMethodException e) {
			log.info("Invalid mode requested: " + mode, e);
			return new ResponseEntity<KnetminerResponse>(HttpStatus.NOT_FOUND);
		} catch (IllegalArgumentException e) {
			log.info("Invalid parameters passed to " + mode, e);
			return new ResponseEntity<KnetminerResponse>(HttpStatus.BAD_REQUEST);
		} catch (Error e) {
			log.error("Error while running " + mode, e);
			return new ResponseEntity<KnetminerResponse>(HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (Exception e) {
			log.error("Exception while running " + mode, e);
			return new ResponseEntity<KnetminerResponse>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
