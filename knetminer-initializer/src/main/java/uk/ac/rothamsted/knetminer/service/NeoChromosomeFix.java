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
			// TODO: There are multiple concepts needing this (Gene, SNP), so let's hope
			// this heuristic is fine.
			session.run ( """
				MATCH (c:Concept)
				WHERE
				  c.BEGIN IS NOT NULL AND c.BEGIN IS::String AND toInteger ( c.BEGIN ) IS NOT NULL
				  OR c.END IS NOT NULL AND c.END IS::String AND toInteger ( c.END ) IS NOT NULL
				WITH c CALL {
				  WITH c
				  SET c.BEGIN = toInteger( c.BEGIN ), c.END = toInteger ( c.END )
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
