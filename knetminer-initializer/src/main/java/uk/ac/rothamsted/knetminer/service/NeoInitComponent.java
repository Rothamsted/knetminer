package uk.ac.rothamsted.knetminer.service;

import org.apache.commons.lang3.Validate;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.rothamsted.knetminer.backend.cypher.genesearch.CypherGraphTraverser;

/**
 * TODO: comment me!
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>2 Oct 2023</dd></dl>
 *
 */
public abstract class NeoInitComponent
{
	protected Driver driver;
	
	public void setDatabase ( Driver driver )
	{
		Validate.notNull ( "Can't setup a null driver for a %s", getClass ().getSimpleName () );
		this.driver = driver;
	}
	
	public void setDatabase ( String neoUrl, String neoUser, String neoPassword )
	{
		this.setDatabase ( GraphDatabase.driver (
			neoUrl, AuthTokens.basic ( neoUser, neoPassword )
		));
	}
	

	public void setDatabase ( 
		String neoUrl, String neoUser, String neoPassword, KnetMinerInitializer kinitializer 
	)
	{
		if ( !"config://".equals ( neoUrl ) )
		{
			setDatabase ( neoUrl, neoUser, neoPassword );
			return;
		}
		
		// Else, deal with the special meaning of config://
		this.setDatabase ( kinitializer );
	}
	
	public void setDatabase ( KnetMinerInitializer kinitializer )
	{
		final String msgPrefx = "--neo-url config://";

		var traverser = kinitializer.getGraphTraverser ();
		Validate.notNull ( traverser, "%s is used, but no graph traverse is configured", msgPrefx );

		if ( !(traverser instanceof CypherGraphTraverser ) )
			ExceptionUtils.throwEx ( 
				IllegalArgumentException.class, 
				"%s is used, but the configured graph traverser isn't CypherGraphTraverser", msgPrefx 
		);
		
		var cyTraverser = (CypherGraphTraverser) traverser;
		var driver = cyTraverser.getNeo4jDriver ();
		Validate.notNull ( driver, "%s is used, but the configuration doesn't define a Neo4j driver" );
		
		this.setDatabase ( driver );		
	}
}
