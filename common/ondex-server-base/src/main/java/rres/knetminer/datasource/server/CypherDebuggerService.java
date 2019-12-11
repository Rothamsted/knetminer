package rres.knetminer.datasource.server;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.File;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.List;
import java.util.concurrent.ExecutorService;

import javax.annotation.PostConstruct;

import org.apache.commons.io.input.Tailer;
import org.apache.commons.io.input.TailerListener;
import org.apache.commons.io.input.TailerListenerAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import rres.knetminer.datasource.api.KnetminerDataSource;
import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;
import uk.ac.ebi.utils.exceptions.TooFewValuesException;
import uk.ac.ebi.utils.exceptions.TooManyValuesException;
import uk.ac.ebi.utils.exceptions.UnexpectedValueException;
import uk.ac.ebi.utils.threading.HackedBlockingQueue;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>10 Dec 2019</dd></dl>
 *
 */
@Controller
@RequestMapping("/cydebug")
// TODO? @ResponseBody, see also @RestController
public class CypherDebuggerService
{
	
	@Autowired
	private List<KnetminerDataSource> dataSources;

	private OndexLocalDataSource dataSource;

	
	public CypherDebuggerService ()
	{
	}

	
	@PostConstruct
	private void init ()
	{
		if ( this.dataSources == null ) throw new NullPointerException (
			"Cypher Debugger didn't get auto-wired with dataSources" 
		);
		if ( this.dataSources.isEmpty () ) throw new TooFewValuesException (
			"Cypher Debugger got an empty dataSources field" 
		);
		if ( this.dataSources.size () > 1 ) throw new TooManyValuesException (
			"Cypher Debugger doesn't support multiple dataSources, which is deprecated anyway"
		);
		
		KnetminerDataSource ds = this.dataSources.get ( 0 );
		
		if ( ! ( ds instanceof OndexLocalDataSource ) ) new UnexpectedValueException (
			"Cypher Debugger can only worl with instances of " + OndexLocalDataSource.class.getSimpleName ()
		);
		
		this.dataSource = (OndexLocalDataSource) ds;
	}
	
	
	@RequestMapping ( path = "/traverse", method = { RequestMethod.GET, RequestMethod.POST } )
	public String newTraverser ( @RequestParam( required = true ) String queries )
	{
		/*
		 * - TODO: new traversal must be run into an executor
		 * - this must return asynchronously
		 * - traverserReport must return a report, when ready (flag in the async task)
		 * - PerformanceTracker must return a report string
		 */
		return null;
	}
	
	
	@GetMapping ( "/traverser-report" )
	public String traverserReport ()
	{
		// TODO: return string report from performance tracker, or KO, if the executor isn't
		// ready.
		return null;
	}
	
	private final static ExecutorService EXECUTOR = HackedBlockingQueue.createExecutor ();
	
	@GetMapping ( path = "/log" )
	public ResponseBodyEmitter streamTraverserLog ()
	{
		final ResponseBodyEmitter emitter = new ResponseBodyEmitter ( -1L );
		
		final TailerListener tailerListener = new TailerListenerAdapter ()
		{
	    @Override
	    public void handle(final String line) 
	    {
	    	try {
					emitter.send ( line + "\n", MediaType.TEXT_PLAIN );
				}
				catch ( IOException ex ) {
					emitter.completeWithError ( ex );
				}
	    }
		};
		
		final String fooFile = "/tmp/test.log";
		
		final Tailer tailer = new Tailer ( 
			new File ( fooFile ), UTF_8, tailerListener, 1000l, false, false, (int) 100E3 
		);

		EXECUTOR.execute ( tailer );
		return emitter;
	} // streamWarLog1
}