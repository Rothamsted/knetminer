package rres.knetminer.datasource.ondexlocal.config;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>10 Jun 2022</dd></dl>
 *
 */
public class KnetminerConfigurationTest
{
	@Test
	public void testLoading ()
	{
		var cfg = KnetminerConfiguration.load ( "target/test-classes/config-test.yml" );
		assertEquals ( "dataDirPath is wrong!", "path/to/data-dir", cfg.getDataDirPath () );
	}
}
