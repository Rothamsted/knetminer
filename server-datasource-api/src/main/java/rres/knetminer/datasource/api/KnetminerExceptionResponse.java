package rres.knetminer.datasource.api;

import java.io.PrintWriter;
import java.io.StringWriter;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

/**
 * This is used to return an error/exception via HTTP. The fields in this response are defined according to the
 * <a href = "https://www.baeldung.com/rest-api-error-handling-best-practices">RFC-7807</a> specification, with the
 * addition of {@link #getStatusReasonPhrase()}.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>6 Feb 2021</dd></dl>
 *
 */
public class KnetminerExceptionResponse extends KnetminerResponse
{
	private String type, title, detail, path, statusReasonPhrase;
	private int status;
	
	public KnetminerExceptionResponse ( Throwable ex, HttpServletRequest request, HttpStatusCode httpStatus )
	{
		this.init ( ex, request.getRequestURL ().toString (), httpStatus );
	}

	public KnetminerExceptionResponse ( Throwable ex, HttpServletRequest request )
	{
		this ( ex, request, HttpStatus.INTERNAL_SERVER_ERROR );
	}

	public KnetminerExceptionResponse ( Throwable ex, ServletWebRequest request, HttpStatusCode httpStatus )
	{
		this ( ex, request.getRequest (), httpStatus );
	}

	public KnetminerExceptionResponse ( Throwable ex, ServletWebRequest request )
	{
		this ( ex, request, HttpStatus.INTERNAL_SERVER_ERROR );
	}
	
	public KnetminerExceptionResponse ( Throwable ex, WebRequest request, HttpStatusCode httpStatus )
	{
		if ( request instanceof ServletWebRequest ) 
			init ( ex, ((ServletWebRequest) request).getRequest (), httpStatus );
		else
			init ( ex, request.getContextPath (), httpStatus );
	}

	public KnetminerExceptionResponse ( Throwable ex, WebRequest request )
	{
		this ( ex, request, HttpStatus.INTERNAL_SERVER_ERROR );
	}
	
	
	private void init ( Throwable ex, HttpServletRequest request, HttpStatusCode httpStatus )
	{
		init ( ex, request.getRequestURL ().toString (), httpStatus );
	}
	
	private void init ( Throwable ex, String requestURI, HttpStatusCode httpStatus )
	{
		StringWriter sw = new StringWriter ();
		ex.printStackTrace ( new PrintWriter ( sw ) );
				
  	type = ex.getClass ().getName ();
  	title = ex.getMessage ();
  	status = httpStatus.value ();
  	statusReasonPhrase = httpStatus instanceof HttpStatus 
  		? ((HttpStatus) httpStatus).getReasonPhrase () : "";
  	detail = sw.toString ();
  	path = requestURI;
	}	
	
	
	
	/**
	 * We set it with the FQN of the exception that generated the response.
	 */
	public String getType ()
	{
		return type;
	}

	/**
	 * We set it to {@link Throwable#getMessage() the message} of the exception that generated the response.
	 */
	public String getTitle ()
	{
		return title;
	}

	/**
	 * We report the {@link Throwable#printStackTrace() stack trace} of the exception that generated this response.
	 */
	public String getDetail ()
	{
		return detail;
	}

	/**
	 * We set it to the {@link HttpServletRequest#getRequestURL() URL} of the request that landed into this response.
	 */
	public String getPath ()
	{
		return path;
	}

	/**
	 * The constructor uses a {@link HttpStatus} parameter for this.
	 */
	public int getStatus ()
	{
		return status;
	}

	/**
	 * The constructor uses a {@link HttpStatus} parameter for this.
	 */
	public String getStatusReasonPhrase ()
	{
		return statusReasonPhrase;
	}
}
