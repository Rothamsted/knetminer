package com.knetminer.datasource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;

@EnableNeo4jRepositories
@SpringBootApplication
public class ServerDatasourceNeo4jApp {

	public static void main(String[] args) {
		SpringApplication.run(ServerDatasourceNeo4jApp.class, args);
	}

}
