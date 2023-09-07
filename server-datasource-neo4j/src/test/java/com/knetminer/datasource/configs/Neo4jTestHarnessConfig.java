package com.knetminer.datasource.configs;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.configuration.*;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.harness.Neo4j;
import org.neo4j.harness.Neo4jBuilders;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.data.neo4j.core.Neo4jTemplate;

import java.io.*;
import java.nio.file.Paths;
import java.time.Instant;


@Configuration
public class Neo4jTestHarnessConfig {

    private static final Logger log = LogManager.getLogger(Neo4jTestHarnessConfig.class);

    @Bean
    public Driver driver () throws IOException {
        Instant startTime = Instant.now();
        log.info ( "Test DB started building at: {}", startTime);
        Neo4j embeddedDatabaseServer = Neo4jBuilders.newInProcessBuilder()
                .withDisabledServer()
                .withConfig ( 
                	GraphDatabaseSettings.data_directory, 
                	Paths.get ( "target/test-classes/test-db" ).toAbsolutePath ()
                )
                .build();
        Instant endTime = Instant.now();
        log.info ( "Test DB is ready at: {}", endTime);
        long interval = endTime.toEpochMilli() - startTime.toEpochMilli();
        log.info ( "DB building time: {} milliseconds", interval);
        return GraphDatabase.driver(embeddedDatabaseServer.boltURI());
    }

    @Bean
    public Neo4jTemplate neo4jTemplate(Driver driver){
        return new Neo4jTemplate(Neo4jClient.with(driver).build());
    }
}
