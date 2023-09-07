package com.knetminer.datasource;

import com.knetminer.datasource.entities.ConceptEntity;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.Driver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.neo4j.core.Neo4jTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class GenomeEntityControllerAdvancedTest
{
    @Autowired
    private Driver driver;

    @Autowired
    private Neo4jTemplate neo4jTemplate;

    @Autowired
    private Neo4jOperationService neo4jOperationService;

    @Autowired
    private GenomeEntityController controller;

    private static final Logger log = LogManager.getLogger(GenomeEntityControllerAdvancedTest.class);

    @Test
    public void testDatabaseUpload(){
        List<ConceptEntity> nodes = neo4jTemplate.findAll("MATCH (n) RETURN n", ConceptEntity.class);
        log.info("Node count: {}.", nodes.size());
        assertThat(nodes.size()).isEqualTo(2000).as("Test of whether node count is 2000.");
    }

    @Test
    public void testSearchEvidences() {

        List<GenomeEntityController.GeneSearchResultEvidenceWithId> result = controller.searchEvidences("acid");

        assertThat(result).isNotNull().as("Test of whether resultset is not null.");
        assertThat(result).hasSize(18).as("Test of whether resultset has size 18.");

        GenomeEntityController.GeneSearchResultEvidenceWithId baseRecord =
                new GenomeEntityController.GeneSearchResultEvidenceWithId(
                        "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                "http://biocyc.org/biopax/biopax-level2#protein15374",
                new GenomeEntityController.GeneSearchResultEvidence("Concept",
                        "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                "http://biocyc.org/biopax/biopax-level2#protein15374",
                        "salicylic acid / benzoic acid glucosyltransferase;" +
                                "salicylic acid / benzoic acid glucosyltransferase;" +
                                "salicylic acid / benzoic acid glucosyltransferaseAtSGT1;" +
                                "UDP-glucose:salicylate glucosyltransferase / UDP-glucose:benzoate glucosyltransferase;" +
                                "UDP-glucose:salicylic acid glucosyltransferase / UDP-glucose:benzoic acid glucosyltransferase",
                        5.637286186218262));
        assertThat(result.get(0).id()).isEqualTo(baseRecord.id())
                .as("Test of whether ID of resultset item & base item are equal.");

        assertThat(result.get(0).geneSearchResultEvidence().type()).isEqualTo(baseRecord.geneSearchResultEvidence().type())
                .as("Test of whether type of resultset item & base item are equal.");

        assertThat(result.get(0).geneSearchResultEvidence().name()).isEqualTo(baseRecord.geneSearchResultEvidence().name())
                .as("Test of whether name of resultset item & base item are equal.");

        assertThat(result.get(0).geneSearchResultEvidence().score()).isEqualTo(baseRecord.geneSearchResultEvidence().score())
                .as("Test of whether score of resultset item & base item are equal.");
    }

    @Test
    public void testSearchEvidencesByEntireNodes() {

        List<GenomeEntityController.GeneSearchResultEvidenceWithId> result = controller.searchEvidences("acid");

        assertThat(result).isNotNull().as("Test of whether resultset is not null.");
        assertThat(result).hasSize(18).as("Test of whether resultset has size 18.");

        GenomeEntityController.GeneSearchResultEvidenceWithId baseRecord =
                new GenomeEntityController.GeneSearchResultEvidenceWithId(
                        "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                "http://biocyc.org/biopax/biopax-level2#protein15374",
                        new GenomeEntityController.GeneSearchResultEvidence("Concept",
                                "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                        "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                        "http://biocyc.org/biopax/biopax-level2#protein15374",
                                "salicylic acid / benzoic acid glucosyltransferase;" +
                                        "salicylic acid / benzoic acid glucosyltransferase;" +
                                        "salicylic acid / benzoic acid glucosyltransferaseAtSGT1;" +
                                        "UDP-glucose:salicylate glucosyltransferase / UDP-glucose:benzoate glucosyltransferase;" +
                                        "UDP-glucose:salicylic acid glucosyltransferase / UDP-glucose:benzoic acid glucosyltransferase",
                                5.637286186218262));

        assertThat(result.get(0)).isEqualTo(baseRecord)
                .as("Test of whether the resultset item & base item are equal.");
    }

    @Test
    public void testSearchEvidencesByEntireNodesWithAsteriskInInputParameter() {

        List<GenomeEntityController.GeneSearchResultEvidenceWithId> result = controller.searchEvidences("acid*");

        assertThat(result).isNotNull().as("Test of whether resultset is not null.");

        assertThat(result).hasSize(3).as("Test of whether resultset has size 3.");

        List<String> nodeDescriptions = List.of(
"""
UGT74F2 is a glucosyltransferase that acts on |FRAME: BENZOATE benzoate| and |FRAME: CPD-110 salicylate| |CITS: [17085977][11641410]|. It also appears to act on |FRAME: ANTHRANILATE anthranilate| |CITS: [12475971]| and |FRAME: P-AMINO-BENZOATE 4-aminobenzoate| |CITS: [18385129]|.

A closely related enzyme in Arabidopsis, UGT74F1 seems to possess many over-lapping activities, but, it appears to be expressed at a lower level, and does have some biochemical differences. For instance, while UGT74F2 can catalyze the formation of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| <i>in vitro</i>, UGT74F1 only appears to promote the formation of  |FRAME: CPD-12628 SAG| |CITS: [18248508]|.

Transcript levels for UGT74F2 are increased in seedlings exposed to |FRAME: CPD-110 salicylate| and |FRAME: Abscisic-Acid abscisic acid|, but decreased in responde to gibberellic acid  |CITS: [12475971]|.

To date, the subcellular localization and precise biological function of UGT74F2 remain unknown, but, given its ability to act upon several different substrates, it may be involved in multiple biochemical pathways <i>in planta</i>.  There is <i>in vivo</i> evidence for its participation in salicylic acid modification based on the reduction of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| observed in a <i>ugt74f2</i> mutant |CITS: [18248508]|.


""",
"""
        UGT74F2 is a glucosyltransferase that acts on |FRAME: BENZOATE benzoate| and |FRAME: CPD-110 salicylate| |CITS: [17085977][11641410]|. It also appears to act on |FRAME: ANTHRANILATE anthranilate| |CITS: [12475971]| and |FRAME: P-AMINO-BENZOATE 4-aminobenzoate| |CITS: [18385129]|.

        A closely related enzyme in Arabidopsis, UGT74F1 seems to possess many over-lapping activities, but, it appears to be expressed at a lower level, and does have some biochemical differences. For instance, while UGT74F2 can catalyze the formation of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| <i>in vitro</i>, UGT74F1 only appears to promote the formation of  |FRAME: CPD-12628 SAG| |CITS: [18248508]|.

        Transcript levels for UGT74F2 are increased in seedlings exposed to |FRAME: CPD-110 salicylate| and |FRAME: Abscisic-Acid abscisic acid|, but decreased in responde to gibberellic acid  |CITS: [12475971]|.

        To date, the subcellular localization and precise biological function of UGT74F2 remain unknown, but, given its ability to act upon several different substrates, it may be involved in multiple biochemical pathways <i>in planta</i>.  There is <i>in vivo</i> evidence for its participation in salicylic acid modification based on the reduction of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| observed in a <i>ugt74f2</i> mutant |CITS: [18248508]|.


""",
"""
UGT74F2 is a glucosyltransferase that acts on |FRAME: BENZOATE benzoate| and |FRAME: CPD-110 salicylate| |CITS: [17085977][11641410]|. It also appears to act on |FRAME: ANTHRANILATE anthranilate| |CITS: [12475971]| and |FRAME: P-AMINO-BENZOATE 4-aminobenzoate| |CITS: [18385129]|.

A closely related enzyme in Arabidopsis, UGT74F1 seems to possess many over-lapping activities, but, it appears to be expressed at a lower level, and does have some biochemical differences. For instance, while UGT74F2 can catalyze the formation of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| <i>in vitro</i>, UGT74F1 only appears to promote the formation of  |FRAME: CPD-12628 SAG| |CITS: [18248508]|.

Transcript levels for UGT74F2 are increased in seedlings exposed to |FRAME: CPD-110 salicylate| and |FRAME: Abscisic-Acid abscisic acid|, but decreased in responde to gibberellic acid  |CITS: [12475971]|.

To date, the subcellular localization and precise biological function of UGT74F2 remain unknown, but, given its ability to act upon several different substrates, it may be involved in multiple biochemical pathways <i>in planta</i>.  There is <i>in vivo</i> evidence for its participation in salicylic acid modification based on the reduction of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| observed in a <i>ugt74f2</i> mutant |CITS: [18248508]|.


""");

        GenomeEntityController.GeneSearchResultEvidenceWithId baseRecord =
                new GenomeEntityController.GeneSearchResultEvidenceWithId(
                        "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                "http://biocyc.org/biopax/biopax-level2#protein15374",
                        new GenomeEntityController.GeneSearchResultEvidence("Concept",
                                "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                        "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                        "http://biocyc.org/biopax/biopax-level2#protein15374",
                                "salicylic acid / benzoic acid glucosyltransferase;" +
                                        "salicylic acid / benzoic acid glucosyltransferase;" +
                                        "salicylic acid / benzoic acid glucosyltransferaseAtSGT1;" +
                                        "UDP-glucose:salicylate glucosyltransferase / UDP-glucose:benzoate glucosyltransferase;" +
                                        "UDP-glucose:salicylic acid glucosyltransferase / UDP-glucose:benzoic acid glucosyltransferase",
                                3.0));

        assertThat(result.get(0)).isEqualTo(baseRecord)
                .as("Test of whether the resultset item & base item are equal.");
    }

    @Test
    public void testSearchEvidencesByEntireNodesWithOperatorInInputParameter() {

        List<GenomeEntityController.GeneSearchResultEvidenceWithId> result = controller.searchEvidences("acid OR flower");

        assertThat(result).isNotNull().as("Test of whether resultset is not null.");
        assertThat(result).hasSize(18).as("Test of whether resultset has size 18.");

        String nodeDescriptions = """
                UGT74F2 is a glucosyltransferase that acts on |FRAME: BENZOATE benzoate| and |FRAME: CPD-110 salicylate| |CITS: [17085977][11641410]|. It also appears to act on |FRAME: ANTHRANILATE anthranilate| |CITS: [12475971]| and |FRAME: P-AMINO-BENZOATE 4-aminobenzoate| |CITS: [18385129]|.
                                
                A closely related enzyme in Arabidopsis, UGT74F1 seems to possess many over-lapping activities, but, it appears to be expressed at a lower level, and does have some biochemical differences. For instance, while UGT74F2 can catalyze the formation of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| <i>in vitro</i>, UGT74F1 only appears to promote the formation of  |FRAME: CPD-12628 SAG| |CITS: [18248508]|.
                                
                Transcript levels for UGT74F2 are increased in seedlings exposed to |FRAME: CPD-110 salicylate| and |FRAME: Abscisic-Acid abscisic acid|, but decreased in responde to gibberellic acid  |CITS: [12475971]|.
                                
                To date, the subcellular localization and precise biological function of UGT74F2 remain unknown, but, given its ability to act upon several different substrates, it may be involved in multiple biochemical pathways <i>in planta</i>.  There is <i>in vivo</i> evidence for its participation in salicylic acid modification based on the reduction of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| observed in a <i>ugt74f2</i> mutant |CITS: [18248508]|.
                                
                                
                """;
        GenomeEntityController.GeneSearchResultEvidenceWithId baseRecord =
                new GenomeEntityController.GeneSearchResultEvidenceWithId(
                        "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                "http://biocyc.org/biopax/biopax-level2#protein15374",
                        new GenomeEntityController.GeneSearchResultEvidence("Concept",
                                "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                        "http://biocyc.org/biopax/biopax-level2#protein15374;" +
                                        "http://biocyc.org/biopax/biopax-level2#protein15374",
                                "salicylic acid / benzoic acid glucosyltransferase;" +
                                        "salicylic acid / benzoic acid glucosyltransferase;" +
                                        "salicylic acid / benzoic acid glucosyltransferaseAtSGT1;" +
                                        "UDP-glucose:salicylate glucosyltransferase / UDP-glucose:benzoate glucosyltransferase;" +
                                        "UDP-glucose:salicylic acid glucosyltransferase / UDP-glucose:benzoic acid glucosyltransferase",
                                5.637286186218262));

        assertThat(result.get(0)).isEqualTo(baseRecord)
                .as("Test of whether the resultset item & base item are equal.");
    }
}
