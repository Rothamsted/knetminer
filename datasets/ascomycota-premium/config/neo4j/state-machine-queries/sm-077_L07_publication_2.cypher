MATCH path = (gene_1:Gene)
  - [rel_1_20:has_mutant|has_variation] - (sNP_20:SNP)
  - [associated_with_20_133:associated_with] - (phenotype_133:Phenotype)
  - [pub_in_133_2:pub_in] - (publication_2:Publication)
WHERE gene_1.iri IN $startGeneIris
RETURN path