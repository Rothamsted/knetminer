package uk.ac.rothamsted.knetminer.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Session;


/**
 * Fixes prefNames. The Ondex RDF exporter creates some prefName properties
 * with multiple values (due to pipeline errors). This component retain one
 * of such values (randomly) and pushes all the others to altName, so that
 * prefName eventually has one value only.
 *
 * @author Marco Brandizi
 * <dl><dt>Date:</dt><dd>6 Mar 2024</dd></dl>
 *
 */
public class NeoPrefNamesFix extends NeoInitComponent
{	
	private Logger log = LogManager.getLogger ();
	
	public void fixNames ()
	{
		log.info ( "Fixing concept prefName property" );

		try ( Session session = driver.session () ) 
		{
			session.run ( """
				MATCH (c:Concept)
				WHERE c.prefName IS NOT NULL AND c.prefName IS::LIST<String>
				WITH c.prefName[0] AS newPrefName, c.prefName[1..] + c.altName AS otherNames, c
				// remove duplicates
				UNWIND otherNames AS otherName
				WITH newPrefName, COLLECT ( DISTINCT otherName ) AS newAltNames, c
				CALL {
				  WITH newPrefName, newAltNames, c
				  SET c.prefName = newPrefName, c.altName = newAltNames
				}
				IN TRANSACTIONS OF 10000 ROWS
			 """);
		}
		
		log.info ( "Names processed" );
	}
}
