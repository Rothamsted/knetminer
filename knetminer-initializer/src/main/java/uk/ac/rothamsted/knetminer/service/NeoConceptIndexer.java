package uk.ac.rothamsted.knetminer.service;

import static java.lang.String.format;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.Reader;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import uk.ac.ebi.utils.exceptions.ExceptionUtils;
import uk.ac.ebi.utils.exceptions.UncheckedFileNotFoundException;
import uk.ac.ebi.utils.objects.XValidate;

/**
 * A Neo4j initialiser component to create a full-text index that supports
 * keyword-based concept searches.
 *
 * @author Vitaly Vyurkov
 * @author Marco Brandizi
 * <dl><dt>Date:</dt><dd>22 Nov 2023</dd></dl>
 *
 */
public class NeoConceptIndexer extends NeoInitComponent
{
	/**
	 * The concept full-text index name in Neo4j
	 */
	public static final String CY_INDEX_NAME = "conceptFullTextIndex";
	
	/**
	 * The config file field pointing to the file that list the properties to be indexed.
	 */
	public static final String INDEX_KEYS_PROP = "cypherConceptIndexProps";

	private Logger log = LogManager.getLogger ();

	/**
	 * Creates a full-text concept index named like {@link #CY_INDEX_NAME}, using this set of
	 * base property (field) names associated to 'Concept' nodes. 
	 * 
	 * Each property name is a base name, in the sense that some property names
	 * in the Ondex-based DB are the same base name with postfixes, eg, if you have 'Abstract' as 
	 * a base name, the method will look for Abstract, Abstract_01, Abstract_02, etc, and will 
	 * include all of them in the index. This names are created by the Ondex merge plug-in and we
	 * have to live with them until we replace Ondex.
	 * 
	 */
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
	
	public void createConceptsIndex ( String... propertyBaseNames )
	{
		createConceptsIndex ( Set.of ( propertyBaseNames ) );
	}
	
	/**
	 * Takes the property base names to index from the configuration associated to the
	 * initialiser, looking for the field {@link #INDEX_KEYS_PROP}. 
	 */
	public void createConceptsIndex ( KnetMinerInitializer knetMinerInitializer )
	{
		String indexInitPropPath = knetMinerInitializer.getKnetminerConfiguration ()
			.getCustomOptions ()
			.getString ( INDEX_KEYS_PROP );

		if ( indexInitPropPath == null ) return;

		this.createConceptsIndex ( Path.of ( indexInitPropPath ) );
	}

	/**
	 * Wrapper of {@link #createConceptsIndex(Reader)}.
	 */
	public void createConceptsIndex ( Path path )
	{
		try
		{
			log.info ( "Retrieving concept index properties from: {}", path.toAbsolutePath () );
			Reader reader = new FileReader ( path.toFile () );
			createConceptsIndex ( reader );
		}
		catch ( FileNotFoundException ex )
		{
			throw ExceptionUtils.buildEx (
				UncheckedFileNotFoundException.class, ex,
				"Cypher Concept indexer, property base name file \"%s\" not found: $cause",
				path.toAbsolutePath ()
			);
		}
	}

	/**
	 * Wrapper of {@link #createConceptsIndex(BufferedReader)} that introduces a buffered reader.
	 */
	public void createConceptsIndex ( Reader reader )
	{
		createConceptsIndex ( new BufferedReader ( reader ) );
	}

	/**
	 * Takes the index property base names from a reader like a file. This has one base name per 
	 * line, blank lines or lines starting with '#' (i.e., comments) are ignored.
	 */
	public void createConceptsIndex ( BufferedReader reader )
	{
		Set<String> propertiesSet = reader.lines ()
			.filter ( p -> p != null )
			.filter ( p -> !StringUtils.isWhitespace ( p ) )
			.filter ( p -> !p.startsWith ( "#" ) ) // Supports comments
			.collect( Collectors.toSet() );

		createConceptsIndex ( propertiesSet );
	}

	/**
	 * Finds all the properties in the DB for nodes of type Concept.
	 */
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

	/**
	 * Expands the base property names to all properties in the DB that match.
	 * 
	 * This is necessary due to an Ondex limit, such that, we might have eg, for a base name like
	 * 'Abstract', the actual properties 'Abstract_01', 'Abstract_02', ... which happens when the
	 * Ondex Merge plug-in merge equivalent concepts having the same 'Abstract' property.
	 * 
	 */
	private Set<String> expandBaseProperties ( Set<String> propertyBaseNames, Set<String> allDBProps )
	{
		log.info ( "Expanding to {} DB properties from {} base names", allDBProps.size (), propertyBaseNames.size () );
		log.trace ( "DB properties to filter: {}", allDBProps );

		Set<String> expandedProps = allDBProps.parallelStream ()
		.filter ( pname -> {
			pname = pname.replaceAll ( "_[0-9]+$", "" );
			return propertyBaseNames.contains ( pname );
		})
		.collect ( Collectors.toSet () );

		log.info ( "Returning {} DB properties after base property filtering", expandedProps.size () );
		log.trace ( "DB properties after base property filtering: {}", expandedProps );

		return expandedProps;
	}

	/**
	 * Generates the Cypher command to create the index.
	 */
	private String createIndexingCypher ( Set<String> indexedProps )
	{
		XValidate.notEmpty ( indexedProps, "Can't create index without properties" );

		String cyProps = indexedProps.stream ()
		.map ( pname -> "c." + pname )
		.collect ( Collectors.joining ( ", " ) );

		String cypherQuery = String.format ( 
			"CREATE FULLTEXT INDEX %s FOR (c:Concept) ON EACH [ %s ]",
			CY_INDEX_NAME, cyProps
		); 

		return cypherQuery;
	}

	/**
	 * Actually creates the index, using {@link #createIndexingCypher(Set)}.
	 */
	private void createIndex ( String indexingCypher )
	{
		try ( Session session = driver.session () ) 
		{
			log.info ( "Deleting old concept full text index" );
			session.run ( format ( "DROP INDEX %s IF EXISTS", CY_INDEX_NAME ) );
			
			log.info ( "Creating full text index for concepts" );
			session.run ( indexingCypher );
		}
		log.info ( "Full text index for concepts created" );
	}
}
