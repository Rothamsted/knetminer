package com.knetminer.datasource;

import static org.assertj.core.api.Assertions.assertThat;

import com.knetminer.datasource.entities.ConceptEntity;
import org.apache.commons.lang3.mutable.MutableObject;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.neo4j.core.Neo4jTemplate;
import uk.ac.ebi.utils.time.XStopWatch;

import java.util.List;

@SpringBootTest
public class Neo4jOperationServiceAdvancedTest {

    @Autowired
    private Neo4jTemplate neo4jTemplate;

    @Autowired
    private Neo4jOperationService neo4jOperationService;

    private static final Logger log = LogManager.getLogger();

    @Test
    public void testSearchEvidences() {

        String nodeDescriptions = """
          UGT74F2 is a glucosyltransferase that acts on |FRAME: BENZOATE benzoate| and |FRAME: CPD-110 salicylate| |CITS: [17085977][11641410]|. It also appears to act on |FRAME: ANTHRANILATE anthranilate| |CITS: [12475971]| and |FRAME: P-AMINO-BENZOATE 4-aminobenzoate| |CITS: [18385129]|.
                          
          A closely related enzyme in Arabidopsis, UGT74F1 seems to possess many over-lapping activities, but, it appears to be expressed at a lower level, and does have some biochemical differences. For instance, while UGT74F2 can catalyze the formation of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| <i>in vitro</i>, UGT74F1 only appears to promote the formation of  |FRAME: CPD-12628 SAG| |CITS: [18248508]|.
                          
          Transcript levels for UGT74F2 are increased in seedlings exposed to |FRAME: CPD-110 salicylate| and |FRAME: Abscisic-Acid abscisic acid|, but decreased in responde to gibberellic acid  |CITS: [12475971]|.
                          
          To date, the subcellular localization and precise biological function of UGT74F2 remain unknown, but, given its ability to act upon several different substrates, it may be involved in multiple biochemical pathways <i>in planta</i>.  There is <i>in vivo</i> evidence for its participation in salicylic acid modification based on the reduction of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| observed in a <i>ugt74f2</i> mutant |CITS: [18248508]|.
        """;
        ConceptEntity expectedConceptEntity = new ConceptEntity();
        expectedConceptEntity.setIdentifier(List.of("http://biocyc.org/biopax/biopax-level2#protein15374"));
        expectedConceptEntity.setAltName(List.of("AtSGT1"));
        expectedConceptEntity.setPrefName(List.of("salicylic acid / benzoic acid glucosyltransferase"));
        expectedConceptEntity.setDescription(List.of(nodeDescriptions));
        expectedConceptEntity.setAbstractHeader(null);
        expectedConceptEntity.setAuthors(null);
        expectedConceptEntity.setAbstractText(null);
        expectedConceptEntity.setScore(5.637286186218262);

        // Needed in lambdas, result.addAll() is long enough to distort the timing.
        final MutableObject<List<ConceptEntity>> resultProxy = new MutableObject<> ();

        long searchTime = XStopWatch.profile ( () -> {
        	resultProxy.setValue ( neo4jOperationService.searchEvidences ( "acid" ) );
        });
        log.info ( "Time for full text searchConcept(): {} ms", searchTime );
        
        var result = resultProxy.getValue ();
        
        assertThat(result).isNotNull().as("text search found a result");
        assertThat(result).hasSize(18).as("text search size matches");
        
        
        
        assertThat(result.get(0).getIdentifier().get(0))
        	.isEqualTo(expectedConceptEntity.getIdentifier().get(0))
          .as("Test ID matches");

        assertThat(result.get(0).getPrefName().get(0))
        	.isEqualTo(expectedConceptEntity.getPrefName().get(0))
        	.as("Test prefName matches");

        assertThat(result.get(0).getAltName().get(0))
        	.isEqualTo(expectedConceptEntity.getAltName().get(0))
        	.as("Test altName matches");


        assertThat(result.get(0).getScore())
        	.isEqualTo(expectedConceptEntity.getScore())
        	.as("Test score matches");

        assertThat(result.get(0).getAuthors())
        	.isEqualTo(expectedConceptEntity.getAuthors())
        	.as("Test authors list matches");

        assertThat(result.get(0).getScore())
        	.isEqualTo(expectedConceptEntity.getScore())
        	.as("test title matches");

        assertThat(result.get(0).getAbstractText())
        	.isEqualTo(expectedConceptEntity.getAbstractText())
        	.as("Test abstract matches");
    }

    @Test
    public void testSearchEvidencesByEntireNodes() {

        List<ConceptEntity> result = neo4jOperationService.searchEvidences("acid");

        assertThat(result).isNotNull().as("Test of whether resultset is not null.");
        assertThat(result).hasSize(18).as("Test of whether resultset has size 18.");

        String nodeDescriptions = """
                UGT74F2 is a glucosyltransferase that acts on |FRAME: BENZOATE benzoate| and |FRAME: CPD-110 salicylate| |CITS: [17085977][11641410]|. It also appears to act on |FRAME: ANTHRANILATE anthranilate| |CITS: [12475971]| and |FRAME: P-AMINO-BENZOATE 4-aminobenzoate| |CITS: [18385129]|.
                                
                A closely related enzyme in Arabidopsis, UGT74F1 seems to possess many over-lapping activities, but, it appears to be expressed at a lower level, and does have some biochemical differences. For instance, while UGT74F2 can catalyze the formation of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| <i>in vitro</i>, UGT74F1 only appears to promote the formation of  |FRAME: CPD-12628 SAG| |CITS: [18248508]|.
                                
                Transcript levels for UGT74F2 are increased in seedlings exposed to |FRAME: CPD-110 salicylate| and |FRAME: Abscisic-Acid abscisic acid|, but decreased in responde to gibberellic acid  |CITS: [12475971]|.
                                
                To date, the subcellular localization and precise biological function of UGT74F2 remain unknown, but, given its ability to act upon several different substrates, it may be involved in multiple biochemical pathways <i>in planta</i>.  There is <i>in vivo</i> evidence for its participation in salicylic acid modification based on the reduction of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| observed in a <i>ugt74f2</i> mutant |CITS: [18248508]|.
                                
                                
                """;
        ConceptEntity expectedConceptEntity = new ConceptEntity();
        expectedConceptEntity.setIdentifier(List.of("http://biocyc.org/biopax/biopax-level2#protein15374"));
        expectedConceptEntity.setAltName(List.of("AtSGT1"));
        expectedConceptEntity.setPrefName(List.of("salicylic acid / benzoic acid glucosyltransferase"));
        expectedConceptEntity.setDescription(List.of(nodeDescriptions));
        expectedConceptEntity.setAbstractHeader(null);
        expectedConceptEntity.setAuthors(null);
        expectedConceptEntity.setAbstractText(null);
        expectedConceptEntity.setScore(5.637286186218262);

        assertThat(result.get(0)).isEqualTo(expectedConceptEntity)
                .as("Test of whether the resultset node & base node are equal.");
    }

    @Test
    public void testSearchEvidencesByEntireNodesWithAsteriskInInputParameter() {

        List<ConceptEntity> result = neo4jOperationService.searchEvidences("acid*");

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

        ConceptEntity expectedConceptEntity = new ConceptEntity();
        expectedConceptEntity.setIdentifier(List.of("http://biocyc.org/biopax/biopax-level2#protein15374",
                "http://biocyc.org/biopax/biopax-level2#protein15374", "http://biocyc.org/biopax/biopax-level2#protein15374"));
        expectedConceptEntity.setAltName(List.of("AtSGT1", "UDP-glucose:salicylate glucosyltransferase / UDP-glucose:benzoate glucosyltransferase", "UDP-glucose:salicylic acid glucosyltransferase / UDP-glucose:benzoic acid glucosyltransferase"));
        expectedConceptEntity.setPrefName(List.of("salicylic acid / benzoic acid glucosyltransferase", "salicylic acid / benzoic acid glucosyltransferase, salicylic acid / benzoic acid glucosyltransferase"));
        expectedConceptEntity.setDescription(List.of(nodeDescriptions.get(0), nodeDescriptions.get(1), nodeDescriptions.get(2)));
        expectedConceptEntity.setAbstractHeader(null);
        expectedConceptEntity.setAuthors(null);
        expectedConceptEntity.setAbstractText(null);
        expectedConceptEntity.setScore(3.0);

        assertThat(result.get(0)).isEqualTo(expectedConceptEntity)
                .as("Test of whether resultset node & base node are equal.");
    }

    @Test
    public void testSearchEvidencesByEntireNodesWithOperatorInInputParameter() {

        List<ConceptEntity> result = neo4jOperationService.searchEvidences("acid OR flower");

        assertThat(result).isNotNull().as("Test of whether resultset is not null.");
        assertThat(result).hasSize(18).as("Test of whether resultset has size 18.");

        String nodeDescriptions = """
                UGT74F2 is a glucosyltransferase that acts on |FRAME: BENZOATE benzoate| and |FRAME: CPD-110 salicylate| |CITS: [17085977][11641410]|. It also appears to act on |FRAME: ANTHRANILATE anthranilate| |CITS: [12475971]| and |FRAME: P-AMINO-BENZOATE 4-aminobenzoate| |CITS: [18385129]|.
                                
                A closely related enzyme in Arabidopsis, UGT74F1 seems to possess many over-lapping activities, but, it appears to be expressed at a lower level, and does have some biochemical differences. For instance, while UGT74F2 can catalyze the formation of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| <i>in vitro</i>, UGT74F1 only appears to promote the formation of  |FRAME: CPD-12628 SAG| |CITS: [18248508]|.
                                
                Transcript levels for UGT74F2 are increased in seedlings exposed to |FRAME: CPD-110 salicylate| and |FRAME: Abscisic-Acid abscisic acid|, but decreased in responde to gibberellic acid  |CITS: [12475971]|.
                                
                To date, the subcellular localization and precise biological function of UGT74F2 remain unknown, but, given its ability to act upon several different substrates, it may be involved in multiple biochemical pathways <i>in planta</i>.  There is <i>in vivo</i> evidence for its participation in salicylic acid modification based on the reduction of |FRAME: CPD-12629 SGE| and |FRAME: CPD-12628 SAG| observed in a <i>ugt74f2</i> mutant |CITS: [18248508]|.
                                
                                
                """;
        ConceptEntity expectedConceptEntity = new ConceptEntity();
        expectedConceptEntity.setIdentifier(List.of("http://biocyc.org/biopax/biopax-level2#protein15374"));
        expectedConceptEntity.setAltName(List.of("AtSGT1"));
        expectedConceptEntity.setPrefName(List.of("salicylic acid / benzoic acid glucosyltransferase"));
        expectedConceptEntity.setDescription(List.of(nodeDescriptions));
        expectedConceptEntity.setAbstractHeader(null);
        expectedConceptEntity.setAuthors(null);
        expectedConceptEntity.setAbstractText(null);
        expectedConceptEntity.setScore(5.637286186218262);

        assertThat(result.get(0)).isEqualTo(expectedConceptEntity)
                .as("Test of whether the resultset node & base node are equal.");
    }
}
