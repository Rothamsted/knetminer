package rres.knetminer.datasource.server;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import rres.knetminer.datasource.ondexlocal.service.OndexServiceProvider;
import uk.ac.rothamsted.knetminer.backend.cypher.genesearch.CyQueriesReader;
import uk.ac.rothamsted.knetminer.backend.cypher.genesearch.CypherGraphTraverser;

/**
 * A small API to debug new Cypher queries with the {@link CypherGraphTraverser}.
 * 
 * <p>This allows for re-running the Knetminer gene traversal and recompute the in-memory,
 * associations between genes and other entities with a new set of Cypher queries (ie, semantic motifs).</p>
 * 
 * <p>This is a test utility meant to be used in <b>test instances</b>, never in production. Indeed, all the 
 * API calls (ie, the corresponding methods below) are disabled by default and they can be enabled by means 
 * of a config property. see {@link #checkEnabled()}. Furthermore, You must be running Knetminer in Neo4j mode, else
 * all the API methods below will raise an exception.</p>
 *
 * <p>TODO: all these mappings that depend on the data-source should be checked for a real DS, at the moment
 * we have services for which any DS is accepted, which doesn't make much sense. DS is needed everywhere in 
 * our APIs, @see KnetminerDataSource#getDataSourceNames() for details.</p> 
 *
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>10 Dec 2019</dd></dl>
 *
 */
@RestController ()
@RequestMapping( "/{ds}/cydebug" )
@CrossOrigin
public class CypherDebuggerService
{
	/**
	 * Used by {@link CypherDebuggerService#checkEnabled()}, to make Spring sending a proper status code
	 * and message back to the client. 
	 */
	@ResponseStatus( value = HttpStatus.FORBIDDEN, reason = ForbiddenException.REASON )
	@SuppressWarnings ( "serial" )
	public static class ForbiddenException extends IllegalStateException
	{
		public static final String REASON = 
			"Unauthorized. Knetminer must be built with " + ENABLED_PROPERTY + " for this to work";
		
		public ForbiddenException () {
			super ( REASON );
		}
	}
	
	/**
	 * @see #checkEnabled
	 */
	public static final String ENABLED_PROPERTY = "knetminer.backend.cypherDebugger.enabled";

	/**
	 * Used to launch the new traversal ops in parallel.
	 */
	private static final ExecutorService traverserExecService = Executors.newSingleThreadExecutor ();
	
	/**
	 * Used to manage asynchronous traversal running.
	 */
	private Future<String> traverserStatsResult = null;
	
	private Logger log = LogManager.getLogger ( this.getClass () );
	
	public CypherDebuggerService ()
	{
	}


	/**
	 * Start a new traversal, after some checks that there isn't none ongoing or being cancelled. 
	 */
	@RequestMapping ( path = "/traverse", method = { RequestMethod.GET, RequestMethod.POST } )
	public synchronized String newTraverser ( @RequestParam( required = true ) String queries ) throws InterruptedException
	{
		this.checkEnabled ();
		
		if ( this.traverserStatsResult != null )
		{
			// Don't re-invoke until it's completed or an initiated interruption is finalised.
			//
			if ( !traverserStatsResult.isDone () )
			{
				if ( this.getTraverser ().isInterrupted () )
					throw new IllegalStateException ( "Waiting to close a cancelled traversal, try again later" );
				else
					throw new IllegalStateException ( "Already invoked, try /traverser-report" );
			}
		}
		
		// You can issue a new traversal if it's the first time, or after termination/interruption
		List<String> queriesList = CyQueriesReader.readQueriesFromString ( queries );
		this.traverserStatsResult = traverserExecService.submit ( () -> submitTraversal ( queriesList ) );
		Thread.sleep ( 500 ); // Give it some time to initialise the progress logger
		return "Started. Check progress at /traverser-report";
	}
	
		
	@RequestMapping (
		path = "/traverser/report", 
		produces = "text/plain; charset=utf-8",
		method = { RequestMethod.GET, RequestMethod.POST }
	)
	public synchronized String traverserReport () throws InterruptedException, ExecutionException
	{
		this.checkEnabled ();
		
		if ( this.traverserStatsResult == null )
			return "Wasn't invoked. Use /traverse";
		if ( this.getTraverser ().isInterrupted () )
			return "Was cancelled. " + 
				(traverserStatsResult.isDone () 
					? "Invoke /traverse again"
					: "Abort operation still pending, invoke /traverse again in a while");
		
		if ( !traverserStatsResult.isDone () )
		{
			// Still in progress, return completion percentage
			double progress = this.getTraverser ().getPercentProgress ();
			return String.format ( "Pending. %.0f%% done. Please, call me again later", progress );
		}
		
		return traverserStatsResult.get ();
	}
	
	/**
	 * Cancellation is asynchronous: this method triggers {@link CypherGraphTraverser#interrupt()} and then
	 * returns immediately. The traverser receiving the interruption command will take a while to stop 
	 * ongoing operations. #traverserReport tells if a traversal was cancelled but not completed.
	 * 
	 */
	@RequestMapping (
		path = "/traverser/cancel", 
		produces = "text/plain; charset=utf-8",
		method = { RequestMethod.GET, RequestMethod.POST }
	)
	public synchronized String traverserCancel () throws InterruptedException, ExecutionException
	{
		this.checkEnabled ();
		
		CypherGraphTraverser traverser = this.getTraverser ();
		
		if ( this.traverserStatsResult == null || traverserStatsResult.isDone () || traverser.isInterrupted () ) 
			return "OK. Wasn't active.";
		
		traverser.interrupt ();
		return "OK.";
	}	
	
	/**
	 * Used by {@link #newTraverser(String)}.
	 */
	private String submitTraversal ( List<String> semanticMotifsQueries )
	{
		OndexServiceProvider odxService = OndexServiceProvider.getInstance ();
		CypherGraphTraverser traverser = this.getTraverser ();

		// It's disabled after server init, let's re-enable
		traverser.setOption( "performanceReportFrequency", 0);
		traverser.setSemanticMotifsQueries ( semanticMotifsQueries );
    
		odxService.getSemanticMotifDataService ().initSemanticMotifData ( true );

		// The previous method disabled it again, we need it on in order to make the reporting method
		// behave
		traverser.setOption ( "performanceReportFrequency", 0 );

		try
		{
			return traverser.isInterrupted ()
				? "Traversal was cancelled" : traverser.getPerformanceStats (); 
		}
		finally {
			// Normally it's disabled.
			traverser.setOption ( "performanceReportFrequency", -1 );
		}
	}
	
	
	@RequestMapping (
		path = "/traverser/queries", 
		produces = "text/plain; charset=utf-8",
		method = { RequestMethod.GET, RequestMethod.POST }
	)
	public synchronized String traverserQueries () 
	{
		this.checkEnabled ();
		CypherGraphTraverser traverser = getTraverser ();
		
		// For the moment, the format is one query per line.
		return Optional.ofNullable ( traverser.getSemanticMotifsQueries () )
		.map ( list -> 
			list.stream ()
			.map ( query -> query.replace ( "\n", " " ) ) 
			.collect ( Collectors.joining ( "\n" ) ) 
		)
		.orElse ( "" );
	}	
	
	
	/**
	 * This will raise {@link IllegalStateException} if you're not running in Neo4j mode and the current traverser in 
	 * {@link OndexServiceProvider} isn't a {@link CypherGraphTraverser}.
	 * 
	 */
	private CypherGraphTraverser getTraverser ()
	{
		OndexServiceProvider odxService = OndexServiceProvider.getInstance ();
		var traverser = odxService.getSemanticMotifDataService ().getGraphTraverser ();
		
		if ( ! (traverser instanceof CypherGraphTraverser ) ) throw new ClassCastException ( 
			"You need the Neo4j mode to use the CypherDebugger"
		);
		
		return (CypherGraphTraverser) traverser;
	}
	
	/**
	 * Every HTTP request is wrapped by this check that {@link #ENABLED_PROPERTY} is enabled in
	 * {@code data_source.xml}.
	 *   
	 */
	private void checkEnabled ()
	{
		boolean isServiceEnabled = OndexServiceProvider.getInstance ()
			.getDataService ()
			.getOptions ()
			.getBoolean ( ENABLED_PROPERTY, false );
		
		if ( !isServiceEnabled ) throw new ForbiddenException ();
	}
}