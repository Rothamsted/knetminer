package uk.ac.rothamsted.knetminer.service;

import static java.lang.String.format;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Session;


/**
 * Various fixes for Gene's chromosome properties.
 * 
 * - Turns coordinate properties BEGIN/END to numbers (rdf2neo produces strings
 * only)
 * - creates indexes related to chromosome region search.
 *
 * @author Marco Brandizi
 * <dl><dt>Date:</dt><dd>6 Mar 2024</dd></dl>
 *
 */
public class NeoChromosomeFix extends NeoInitComponent
{	
	private Logger log = LogManager.getLogger ();
	
	public void processChromosomes ()
	{
		log.info ( "Fixing gene chromosome properties" );

		try ( Session session = driver.session () ) 
		{
			log.debug ( "Turning begin/end properties into numbers" );
			session.run ( """
				MATCH (g:Gene)
				WHERE 
				  g.BEGIN IS NOT NULL AND g.BEGIN IS::String
				  OR g.END IS NOT NULL AND g.END IS::String
				WITH g CALL {
				  WITH g
				  SET g.BEGIN = toInteger( g.BEGIN ), g.END = toInteger ( g.END )
				}
				IN TRANSACTIONS OF 10000 ROWS
			""");
			
			session.executeWriteWithoutResult ( tx ->
			{
				// index name postfix, index property
				@SuppressWarnings ( "unchecked" )
				Pair<String,String> idxProps [] = new Pair[] {
					Pair.of ( "Chr", "Chromosome" ),
					Pair.of ( "Begin", "BEGIN" ),
					Pair.of ( "End", "END" ),
					Pair.of ( "TAXID", "TAXID" )
				};
				
				log.debug ( "Deleting old chromosome-related indexes" );
				for ( Pair<String, String> idxProp: idxProps )
					tx.run ( format ( "DROP INDEX gene%s IF EXISTS", idxProp.getLeft () ) );
				
				log.debug ( "Indexing chromosome-related properties" );
				for ( Pair<String, String> idxProp: idxProps )
					tx.run ( format ( 
						// TAXID index might already exist
						"CREATE INDEX gene%s IF NOT EXISTS FOR (g:Gene) ON (g.%s)", 
						idxProp.getLeft (), idxProp.getRight () 
				));
			});
		}
		
		log.info ( "Chromosome properties processed" );
	}
}
