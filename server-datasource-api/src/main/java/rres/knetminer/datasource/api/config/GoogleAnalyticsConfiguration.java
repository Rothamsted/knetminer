package rres.knetminer.datasource.api.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

/**
 * TODO: comment me!
 *
 * TODO: tests
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
	
	/**
	 * This is an ID of the client that sends tracking info. Typically, i's is 
	 * a UUID, but it's arbitrary. If not set, the {@link DatasetInfo#getId() dataset ID} is
	 * used.
	 */
	public String getClientId ()
	{
		return clientId;
	}

	/**
	 * Used by {@link KnetminerConfiguration#load(String)}, to set the dataset ID as default. 
	 */
	void setClientId ( String clientId )
	{
		this.clientId = clientId;
	}
	
}
