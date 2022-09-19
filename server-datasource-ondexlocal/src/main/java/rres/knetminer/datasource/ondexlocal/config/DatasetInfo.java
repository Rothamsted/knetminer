package rres.knetminer.datasource.ondexlocal.config;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

/**
 * Various information about the dataset that Knetminer is serving.
 * 
 * This and {@link SpecieInfo} are split into interface plus Server implementation, which extend
 * the respective interface with further properties, to be used on the server side only.
 * 
 * The API clients are given the interface (ie, the shorter list of properties), by the methods
 * like {@link ServerDatasetInfo#asDatasetInfo()}.
 * 
 * These classes usually have not public setter, since they're populated from 
 * {@link KnetminerConfiguration config files}.
 * 
 * @author brandizi
 * <dl><dt>Date:</dt><dd>14 Jul 2022</dd></dl>
 *
 */
@JsonAutoDetect ( getterVisibility = Visibility.PUBLIC_ONLY )
public interface DatasetInfo
{
	/**
	 * A dataset identifier, which is used for technical constructs such as the API URLs.
	 * This is the old data source name
	 */
	String getId ();

	String getTitle ();

	String getDescription ();

	String getKeywords ();

	/**
	 * This is the dataset version, not the Knetminer version.
	 */
	String getVersion ();

	String getCreationDate ();

	String getOrganization ();

	List<SpecieInfo> getSpecies ();
		
}