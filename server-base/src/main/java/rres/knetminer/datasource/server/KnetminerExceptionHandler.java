package rres.knetminer.datasource.server;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import rres.knetminer.datasource.api.KnetminerExceptionResponse;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>6 Feb 2021</dd></dl>
 *
 */
@ControllerAdvice
public class KnetminerExceptionHandler extends ResponseEntityExceptionHandler
{
	private final Logger log = LogManager.getLogger ( this.getClass () );
	
	/**
	 * body is ignored, since we always return {@link KnetminerExceptionResponse}
	 * TODO: possibly, we want to add body to {@code KnetminerExceptionResponse}.
	 * 
	 */
	@Override
	protected final ResponseEntity<Object> handleExceptionInternal ( Exception ex, Object body, HttpHeaders headers,
			HttpStatus status, WebRequest request )
	{
		KnetminerExceptionResponse response = new KnetminerExceptionResponse (
			ex,
			request instanceof ServletWebRequest ? (ServletWebRequest) request : request,
			status
		);
		log.error ( "Returning exception from web request processing, HTTP status: %s" + status.toString (), ex );
		return super.handleExceptionInternal ( ex, response, headers, status, request );
	}

	
	/**
	 * TODO: do we need to forward the request's headers? 
	 */
	@ExceptionHandler
	@SuppressWarnings ( "unchecked" )
	protected ResponseEntity<KnetminerExceptionResponse> handleGenericException ( Exception ex, WebRequest request )
	{
		return (ResponseEntity<KnetminerExceptionResponse>) (ResponseEntity<?>) 
			this.handleExceptionInternal ( ex, null, new HttpHeaders (), HttpStatus.INTERNAL_SERVER_ERROR, request );
	}
}
