package rres.knetminer.datasource.server;

import java.util.Optional;

import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import rres.knetminer.datasource.api.KnetminerExceptionResponse;

/**
 * Generic Exception handler for Knetminer.
 * 
 * <p><a href = "https://www.baeldung.com/exception-handling-for-rest-with-spring">Here</a> you can find a guide on how 
 * this is realised. We leave the defaults managed by 
 * {@link ResponseEntityExceptionHandler#handleException(Exception, WebRequest) our parent} untouched (so, it keeps 
 * deciding the status codes to return for them). We have our own handlers for other exceptions. For all the managed
 * exceptions (including the defaults), we return {@link KnetminerExceptionResponse our own JSON answer}, which is 
 * RFC-7807 compliant, plus an appropriate HTTP status code.</p>
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
	 * This manages a response for all the other methods that receive some exception to return. 
	 * We set the response with a {@link KnetminerExceptionResponse} and its status code with the one
	 * received here. 
	 * 
	 * @param body is ignored, since we always return {@link KnetminerExceptionResponse}, it's always null anyway.
	 * 
	 */
	@Override
	protected final ResponseEntity<Object> handleExceptionInternal ( 
		Exception ex, Object body, HttpHeaders headers, HttpStatus status, WebRequest request )
	{
		if ( status == null || status.value () < 400 )
			// We're dealing with an exception, so it cannot be less than that, override the original code
			status = HttpStatus.INTERNAL_SERVER_ERROR;
		
		KnetminerExceptionResponse response = new KnetminerExceptionResponse (
			ex,
			request instanceof ServletWebRequest ? (ServletWebRequest) request : request,
			status
		);
		log.error ( "Returning exception from web request processing, HTTP status: '" + status.toString () + "'", ex );
		return super.handleExceptionInternal ( ex, response, headers, status, request );
	}

	/**
	 * This checks if the generic exception class is annotated with {@link ResponseStatus} and uses the specified
	 * status code if present. Else, let {@link #handleExceptionInternal(Exception, Object, HttpHeaders, HttpStatus, WebRequest)}
	 * to set a generic {@link HttpStatus#INTERNAL_SERVER_ERROR}.
	 * 
	 */
	@ExceptionHandler
	@SuppressWarnings ( "unchecked" )
	public ResponseEntity<KnetminerExceptionResponse> handleGenericException 
		( Exception ex, WebRequest request, HttpServletResponse response )
	{
		HttpStatus status = Optional.ofNullable ( 
			AnnotatedElementUtils.findMergedAnnotation ( ex.getClass(), ResponseStatus.class ) 
		).map ( ResponseStatus::value )
		.orElse ( null );
		
		// status can still be null at this point, the generic method defaults to 500
		return (ResponseEntity<KnetminerExceptionResponse>) (ResponseEntity<?>) 
			this.handleExceptionInternal ( ex, null, new HttpHeaders (), status, request );
	}

	/**
	 * Takes the status code from {@link ResponseStatusException#getStatus() code}.
	 */
	@ExceptionHandler
	public ResponseEntity<KnetminerExceptionResponse> handleStatusBasedException (
		ResponseStatusException ex, WebRequest request, HttpServletResponse response
	)
	{
		return handleStatusBasedException ( ex, ex.getResponseHeaders (), ex.getStatus (), request, response );
	}

	/**
	 * Takes the status code from {@link ResponseStatusException#getStatus() code}.
	 */
	@ExceptionHandler
	public ResponseEntity<KnetminerExceptionResponse> handleStatusBasedException (
		HttpStatusCodeException ex, WebRequest request, HttpServletResponse response
	)
	{
		return handleStatusBasedException ( ex, ex.getResponseHeaders (), ex.getStatusCode (), request, response );
	}
	
	@SuppressWarnings ( "unchecked" )
	private ResponseEntity<KnetminerExceptionResponse> handleStatusBasedException (
		Exception ex, HttpHeaders headers, HttpStatus status, WebRequest request, HttpServletResponse response
	)
	{
		if ( headers != null )
			headers
			.forEach( (name, values) -> values.forEach ( value -> response.addHeader ( name, value ) ) );
		
		return (ResponseEntity<KnetminerExceptionResponse>) (ResponseEntity<?>) 
			this.handleExceptionInternal ( ex, null, new HttpHeaders (), status, request );
	}
}
