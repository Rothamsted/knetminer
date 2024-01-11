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
 * Common class for Neo4j initialisation components.
 *
 * @author brandizi
 * <dl><dt>Date:</dt><dd>2 Oct 2023</dd></dl>
 *
 */
public abstract class NeoInitComponent
{
	protected Driver driver;
	
	private Logger log = LogManager.getLogger ();
	
	public void setDatabase ( Driver driver )
	{
		Validate.notNull ( "Can't setup a null driver for a %s", getClass ().getSimpleName () );
		log.info ( "Setting Neo4j connection from driver parameter" );
		this.driver = driver;
	}
	
	public void setDatabase ( String neoUrl, String neoUser, String neoPassword )
	{
		log.info (
			"{}, setting Neo4j connection {} from explicit parameters", 
			this.getClass ().getSimpleName (),
			neoUrl
		);
		
		this.setDatabase ( GraphDatabase.driver (
			neoUrl, AuthTokens.basic ( neoUser, neoPassword )
		));
	}
	
	/**
	 * Takes Neo4j coordinates from the same config files that were used to initialise the 
	 * {@link KnetMinerInitializer}.
	 */
	public void setDatabase ( KnetMinerInitializer kinitializer )
	{
		log.info ( "{} setting Neo4j connection from config params", this.getClass ().getSimpleName () );
		
		var traverser = kinitializer.getGraphTraverser ();
		Validate.notNull ( traverser, "No semantic motif traverser is configured, can't get DB coordinates" );

		if ( !(traverser instanceof CypherGraphTraverser ) )
			ExceptionUtils.throwEx ( 
				IllegalArgumentException.class, 
				"The configured traverser isn't a CypherGraphTraverser, can't get DB coordinates" 
		);
		
		var cyTraverser = (CypherGraphTraverser) traverser;
		var driver = cyTraverser.getNeo4jDriver ();
		Validate.notNull ( driver, "No Neo4j driver configured in the traverser's configuration" );
		
		this.setDatabase ( driver );		
	}
	
	/**
	 * Wrapper that checks is neoUrl is 'config://' and when that's the case, it uses
	 * the {@link #setDatabase(KnetMinerInitializer) config-based initialisation}, else
	 * it uses {@link #setDatabase(String, String, String) explicit coordinates}.
	 *  
	 */
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
}
