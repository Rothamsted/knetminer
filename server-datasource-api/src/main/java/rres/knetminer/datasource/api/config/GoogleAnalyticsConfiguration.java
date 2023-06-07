package rres.knetminer.datasource.api.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

/**
 * Configuration data for Google Analytics 4.
 * 
 * What they call measurement protocol requires the credentials listed in this class.
 * Of course, this is used to allow for defining such data in a Knetminer config file.
 * 
 * @see KnetminerConfiguration
 * @see GoogleAnalyticsHelper (in server-base)
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

	/**
	 * GA4 allows for setting multiple measurement properties, which can be used either with their
	 * Javascript library (to issue the so-called gtags), or on a server-side code (eg, an API), 
	 * with the so-called measurement protocol.
	 * 
	 * Details on the Knetminer wiki (TODO) and on Google documentation. 
	 */
	public String getMeasurementId ()
	{
		return measurementId;
	}

	/**
	 * When used with the measurement protocol, GA also needs that you create an API secret.
	 * 
	 * @see #getMeasurementId()
	 */
	public String getApiSecret ()
	{
		return apiSecret;
	}
	
	/**
	 * This is an ID of the client that sends tracking info. Typically, i's is 
	 * a UUID, but it's arbitrary. If not set, the {@link DatasetInfo#getId() dataset ID} is
	 * used.
	 * 
	 * @see #getMeasurementId()
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
