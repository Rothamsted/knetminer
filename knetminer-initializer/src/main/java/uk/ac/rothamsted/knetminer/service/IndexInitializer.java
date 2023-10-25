package uk.ac.rothamsted.knetminer.service;



import org.apache.commons.lang3.Validate;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class IndexInitializer extends NeoInitComponent {

    private Logger log = LogManager.getLogger();

    public IndexInitializer (){
    }
    public IndexInitializer (Driver driver){
        this.driver = driver;
    }

    public void createConceptsIndex ( Set<String> propertyBaseNames ) {
        Validate.notNull(propertyBaseNames, "Property base names have gotten to be not null.");
        Set<String> allDBProps = findAllConceptProperties();
        Set<String> indexedProps = expandBaseProperties(propertyBaseNames, allDBProps);
        var cyIndexer = createIndexingCypher(indexedProps);
        //Result result;
        try (Session session = driver.session()) {
            /*result = */session.run(cyIndexer);
        }
        //return result.next().get(0).asInt();
    }

    private Set<String> findAllConceptProperties ()
    {
        Set<String> set = new HashSet<>();
        String cypherQuery =
                """
                MATCH (c:Concept)
                UNWIND KEYS(c) AS propName
                RETURN DISTINCT propName
                """;
        try (Session session = driver.session()) {
            Result result = session.run(cypherQuery);
            result.forEachRemaining(record -> set.add(record.get("propName").asString()));
            log.info("All concept properties: {}", set);
            return set;
        }

    }

    private Set<String> expandBaseProperties ( Set<String> propertyBaseNames, Set<String> allDBProps )
    {
        log.info("Property base names: {}", propertyBaseNames);
        log.info("All concept properties: {}", allDBProps);
        Set<String> expandedProps = allDBProps.parallelStream()
                .filter ( pname -> {
                    pname = pname.replaceAll ( "_[0-9]+$", "" );
                    return propertyBaseNames.contains ( pname );
                })
                .collect ( Collectors.toSet () );
        log.info("Expanded properties: {}", expandedProps);
        return expandedProps;
    }

    public String createIndexingCypher ( Set<String> indexedProps )
    {
        Validate.notEmpty ( indexedProps, "Indexed properties have gotten to be not null." );
        log.info("Indexed properties: {}", indexedProps);
        StringBuilder builder = new StringBuilder();
        for (String index : indexedProps){
            builder.append(index).append(", a.");
        }
        builder.delete(builder.length()-4, builder.length());

        String cypherQuery = "CREATE FULLTEXT INDEX concept_index FOR (a:Concept) ON EACH [a." +
                builder.toString() +
                "]";
        log.info("Cypher query: {}", cypherQuery);
        return cypherQuery;
    }
}
