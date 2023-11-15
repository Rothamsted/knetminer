package uk.ac.rothamsted.knetminer.service;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.objects.XValidate;

public class IndexInitializer extends NeoInitComponent
{

	public static final String INDEX_INIT_PROP = "IndexInitProperties";

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

	public void createConceptsIndex ( KnetMinerInitializer knetMinerInitializer ) {
	String indexInitPropPath = knetMinerInitializer.getKnetminerConfiguration ()
			.getCustomOptions ()
			.getString ( INDEX_INIT_PROP );

		if ( indexInitPropPath == null ) return;

		this.createConceptsIndex ( Path.of ( indexInitPropPath ) );
	}

	public void createConceptsIndex ( Path path ) {
		try
		{
			log.info ( "Retrieving index properties from: {}", path.toAbsolutePath () );
			Reader reader = new FileReader ( path.toFile () );
			createConceptsIndex ( reader );
		}
		catch ( FileNotFoundException ex )
		{
			throw ExceptionUtils.buildEx (
					UncheckedIOException.class, ex, "Error while reading index properties from %s: $cause",
					path.toAbsolutePath ()
			);
		}
	}

	public void createConceptsIndex ( Reader reader ) {
		Set<String> propertiesSet = new BufferedReader ( reader ).lines ()
				.filter ( p -> p != null )
				.filter ( p -> !StringUtils.isWhitespace ( p ) )
				.collect( Collectors.toSet());

		createConceptsIndex ( propertiesSet );
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
