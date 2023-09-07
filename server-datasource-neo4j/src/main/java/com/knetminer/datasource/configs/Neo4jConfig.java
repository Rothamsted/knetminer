package com.knetminer.datasource.configs;

import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(Neo4jDriverProperties.class)
public class Neo4jConfig {

    @Bean
    public Driver neo4jDriver(Neo4jDriverProperties properties) {
        return GraphDatabase.driver(properties.getUri(), properties.getAuthentication().asAuthToken());
    }
}
