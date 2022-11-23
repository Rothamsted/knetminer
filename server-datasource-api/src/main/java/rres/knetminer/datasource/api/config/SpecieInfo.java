package rres.knetminer.datasource.api.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

/**
 * Descriptor about the species in a {@link DatasetInfo dataset}.
 * 
 * @see DatasetInfo for details on how these interfaces and classes are arranged.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>14 Jul 2022</dd></dl>
 *
 */
@JsonAutoDetect ( getterVisibility = Visibility.PUBLIC_ONLY )
public interface SpecieInfo
{
	/**
	 * The NCBI taxonomy ID
	 */
	String getTaxId ();

	String getCommonName ();

	/**
	 * The latin name
	 */
	String getScientificName ();
}