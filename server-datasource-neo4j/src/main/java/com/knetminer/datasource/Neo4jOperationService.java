package com.knetminer.datasource;

import com.knetminer.datasource.entities.ConceptEntity;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.data.neo4j.core.Neo4jTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class Neo4jOperationService {
    private final Neo4jTemplate neo4jTemplate;

    private static final Logger log = LogManager.getLogger(Neo4jOperationService.class);

    public Neo4jOperationService(Neo4jTemplate neo4jTemplate) {
        this.neo4jTemplate = neo4jTemplate;
    }

    public List<ConceptEntity> searchEvidences (String input) {
        String query = "CALL db.index.fulltext.queryNodes(\"concept_index\", $input) " +
                "YIELD node, score WITH node, score UNWIND CASE WHEN node.identifier IS NULL THEN [] " +
                "ELSE node.identifier END AS id UNWIND CASE WHEN node.altName IS NULL THEN [] " +
                "ELSE node.altName END AS an UNWIND CASE WHEN node.prefName IS NULL THEN [] " +
                "ELSE node.prefName END AS pn UNWIND CASE WHEN node.description IS NULL THEN [] " +
                "ELSE node.description END AS descr WITH DISTINCT id, an, pn, descr, node, score " +
                "RETURN collect(id) AS identifier, collect(an) AS altName, collect(pn) AS prefName, " +
                "collect(descr) AS description, node.AbstractHeader AS abstractHeader, node.AUTHORS AS authors, " +
                "node.Abstract AS abstractText, score";
        log.info("Input parameter of CQL query: {}.", input);
        Map<String, Object> params = Map.of("input", input);
        return neo4jTemplate.findAll(query, params, ConceptEntity.class);
    }
}
