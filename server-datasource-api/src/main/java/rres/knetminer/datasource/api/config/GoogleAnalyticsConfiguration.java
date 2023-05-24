package rres.knetminer.datasource.api.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>24 May 2023</dd></dl>
 *
 */
@JsonAutoDetect ( getterVisibility = Visibility.NONE, fieldVisibility = Visibility.NONE )
public class GoogleAnalyticsConfiguration
{
	@JsonProperty	
	private String measurementId;
	
	@JsonProperty
	private String apiSecret;
	
	@JsonProperty
	private String clientId;
	
	private GoogleAnalyticsConfiguration () {}

	public String getMeasurementId ()
	{
		return measurementId;
	}

	public String getApiSecret ()
	{
		return apiSecret;
	}
	
	public String getClientId ()
	{
		return clientId;
	}
	
}
