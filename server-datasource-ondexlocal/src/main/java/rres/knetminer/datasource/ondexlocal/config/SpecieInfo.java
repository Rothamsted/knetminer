package rres.knetminer.datasource.ondexlocal.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

/**
 * Descriptor about the species in a {@link DatasetInfo dataset}.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>14 Jul 2022</dd></dl>
 *
 */
@JsonAutoDetect ( getterVisibility = Visibility.PUBLIC_ONLY )
public interface SpecieInfo
{
	String getTaxId ();

	String getCommonName ();

	String getScientificName ();
}