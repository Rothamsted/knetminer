package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

/**
 * A simple wrapper for {@link OndexLocalDataSource}, which can be initialised with empty
 * settings, to signal the super-class that it should take concrete values from {@code WEB-INF/web.xml}. 
 *
 * @author brandizi
 *
 */
public class ConfigurableOndexDataSource extends OndexLocalDataSource {

	public ConfigurableOndexDataSource() {
	}
}
