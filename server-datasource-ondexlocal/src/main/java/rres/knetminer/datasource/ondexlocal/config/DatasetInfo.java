package rres.knetminer.datasource.ondexlocal.config;

import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

/**
 * Various information about the dataset that Knetminer is serving.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>14 Jul 2022</dd></dl>
 *
 */
@JsonAutoDetect ( getterVisibility = Visibility.PUBLIC_ONLY )
public interface DatasetInfo
{
	/**
	 * This is the old data source name
	 */
	String getId ();

	String getTitle ();

	String getDescription ();

	String getKeywords ();

	String getVersion ();

	String getCreationDate ();

	String getOrganization ();

	String getProvider ();

	List<SpecieInfo> getSpecies ();
}