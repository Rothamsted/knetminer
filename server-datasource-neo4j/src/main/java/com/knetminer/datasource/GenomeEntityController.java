package com.knetminer.datasource;

import com.knetminer.datasource.entities.ConceptEntity;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/genome")
public class GenomeEntityController {

    private final Neo4jOperationService neo4jOperationService;

    public GenomeEntityController(Neo4jOperationService neo4jOperationService) {
        this.neo4jOperationService = neo4jOperationService;
    }

    private static final Logger log = LogManager.getLogger(GenomeEntityController.class);
    record GeneSearchResultEvidence(String type, String id, String name, double score) {};
    record GeneSearchResultEvidenceWithId (String id, GeneSearchResultEvidence geneSearchResultEvidence ) {};

    @GetMapping("/search-by-keywords")
    public List<GeneSearchResultEvidenceWithId> searchEvidences (@RequestParam String input) {
        List<ConceptEntity> list = neo4jOperationService.searchEvidences(input);
        return list.stream()
                .map(entity -> new GeneSearchResultEvidenceWithId(String.join(";", entity.getIdentifier()),
                        new GeneSearchResultEvidence("Concept",
                                String.join(";", entity.getIdentifier()),
                        String.join(";", entity.getPrefName()) + ";" +
                                String.join(";", entity.getAltName()),
                        entity.getScore())))
                .collect(Collectors.toList());
    }

    /*
    @GetMapping("/search-by-keywords")
    public List<GeneSearchResultEvidence> searchEvidences (@RequestParam String input) {
        List<ConceptEntity> list = neo4jOperationService.searchEvidences(input);
        return list.stream()
                .map(entity -> new GeneSearchResultEvidence("Concept", entity.getIdentifier().get(0),
                        entity.getPrefName().get(0), entity.getScore()))
                .collect(Collectors.toList());
    }
*/
}