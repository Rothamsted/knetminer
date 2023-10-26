package uk.ac.rothamsted.knetminer.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.ebi.utils.objects.XValidate;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class IndexInitializer extends NeoInitComponent
{

	private Logger log = LogManager.getLogger ();

	public void createConceptsIndex ( Set<String> propertyBaseNames )
	{
		XValidate.notEmpty ( propertyBaseNames, "Property base names for concept full text index is null/empty" );
		
		log.info ( "Creating Neo4j full text index for concept searching" );
		
		Set<String> allDBProps = findAllConceptProperties ();
		Set<String> indexedProps = expandBaseProperties ( propertyBaseNames, allDBProps );
		
		if ( indexedProps.isEmpty () ) {
			log.warn ( "No property to index found, returning without creating any index" );
			return;
		}
		
		var cyIndexer = createIndexingCypher ( indexedProps );
		createIndex ( cyIndexer );
		
		log.info ( "Concept full text indexing, all done" );
	}

	private Set<String> findAllConceptProperties ()
	{
		log.info ( "Fetching all DB concept properties" );

		Set<String> allProps = new HashSet<> ();
		String cypherQuery = 
		"""
			MATCH (c:Concept)
			UNWIND KEYS(c) AS propName
			RETURN DISTINCT propName
		""";
		try ( Session session = driver.session () )
		{
			Result result = session.run ( cypherQuery );
			result.forEachRemaining ( record -> allProps.add ( record.get ( "propName" ).asString () ) );
		}

		log.info ( "Found {} concept properties in the DB", allProps.size () );
		return allProps;
	}

	private Set<String> expandBaseProperties ( Set<String> propertyBaseNames, Set<String> allDBProps )
	{
		log.info ( "Filtering {} DB properties from {} base names", allDBProps.size (), propertyBaseNames.size () );
		log.debug ( "DB properties to filter are: {}", allDBProps );
		
		Set<String> expandedProps = allDBProps.parallelStream ()
		.filter ( pname -> {
			pname = pname.replaceAll ( "_[0-9]+$", "" );
			return propertyBaseNames.contains ( pname );
		})
		.collect ( Collectors.toSet () );
		
		log.info ( "Retaining {} DB properties after base property filtering", expandedProps.size () );
		log.debug ( "DB properties after filtering are: {}", expandedProps );

		return expandedProps;
	}

	public String createIndexingCypher ( Set<String> indexedProps )
	{
		XValidate.notEmpty ( indexedProps, "Can't create index without properties" );

		String cyProps = indexedProps.stream ()
		.map ( pname -> "a." + pname )
		.collect ( Collectors.joining ( ", " ) );

		/* TODO: remove, we're not at a programming tutorial, use modern constructs like streams, 
		 * joiners and functional programming
		 * 
		StringBuilder builder = new StringBuilder ();
		for ( String index : indexedProps )
		{
			builder.append ( index ).append ( ", a." );
		}
		   This is particularly poor, even when you do it with a loop, the clean form is:
		 * sep = ""
		 * for each e:
		 *   str += sep + "a." + e
		 *   sep = ", "
		 *   
		 * without any ugly trail removing (which is unreadable, breaks when the input is empty, requires
		 * that the loop body and the trail removal are kept aligned)
		 *  
		builder.delete ( builder.length () - 4, builder.length () );
		*/

		String cypherQuery = "CREATE FULLTEXT INDEX concept_index FOR (a:Concept) ON EACH [ " + cyProps  + " ]";
		return cypherQuery;
	}
	
	private void createIndex ( String indexingCypher )
	{
		log.info ( "Creating full text index for concepts" );
		try ( Session session = driver.session () ) {
			session.run ( indexingCypher );
		}	
		log.info ( "Full text index for concepts created" );
	}
}
