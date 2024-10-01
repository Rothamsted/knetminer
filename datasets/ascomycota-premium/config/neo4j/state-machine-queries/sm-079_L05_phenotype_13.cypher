MATCH path = (gene_1:Gene)
  - [rel_1_20:has_mutant|has_variation] - (sNP_20:SNP)
  - [associated_with_20_13:associated_with] - (phenotype_13:Phenotype)
WHERE gene_1.iri IN $startGeneIris
RETURN path