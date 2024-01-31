package uk.ac.rothamsted.knetminer.service;

import static java.lang.String.format;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Session;

/**
 * Creates full-text indexes on an existing Neo4j database to support the search of genes
 * by public identifiers, ie, names and accessions.
 * 
 * This is used in a number of other searches in the new KnetMiner API (eg, to process user gene lists).
 * 
 * We use Lucene indexes for this function, so that we can support advanced syntax (eg, wildcards)
 * and be performant.
 * 
 *
 * @author Marco Brandizi
 * <dl><dt>Date:</dt><dd>30 Jan 2024</dd></dl>
 *
 */
public class NeoGenePubIdIndexer extends NeoInitComponent
{
	/**
	 * The full-text index names 
	 */
	public static final String CY_NAME_INDEX_NAME = "geneNameFullTextIndex";

	public static final String CY_ACC_INDEX_NAME = "accessionFullTextIndex";
	
	private Logger log = LogManager.getLogger ();
	
	public void createIndex ()
	{
		log.info ( "Creating Neo4j full text index for gene labels" );

		try ( Session session = driver.session () ) 
		{
			session.executeWriteWithoutResult ( tx ->
			{
				log.info ( "Deleting old name/accession full text indexes" );
				tx.run ( format ( "DROP INDEX %s IF EXISTS", CY_NAME_INDEX_NAME ) );
				tx.run ( format ( "DROP INDEX %s IF EXISTS", CY_ACC_INDEX_NAME ) );
				
				log.debug ( "Indexing names" );
				tx.run ( format (
					"CREATE FULLTEXT INDEX %s FOR (g:Gene) ON EACH [ g.prefName, g.altName ]", 
					CY_NAME_INDEX_NAME
				));
	
				log.debug ( "Indexing accessions" );
				tx.run ( format (
					"CREATE FULLTEXT INDEX %s FOR (a:Accession) ON EACH [ a.identifier ]", 
					CY_ACC_INDEX_NAME
				));			
			});
		}
		
		log.info ( "Gene name/accession indexing, all done" );
	}
}
