package rres.knetminer.datasource.provider;

import rres.knetminer.datasource.ondexlocal.OndexLocalDataSource;

/**
 * A simple wrapper for {@link OndexLocalDataSource}, which initialised with default
 * settings, so that, they are taken from {@code WEB-INF/web.xml}. 
 *
 * @author brandizi
 *
 */
public class ConfigurableOndexDataSource extends OndexLocalDataSource {

	public ConfigurableOndexDataSource() {
	}
}
