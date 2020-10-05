MATCH path = (gene_1:Gene)
  - [rel_1_20_d:has_mutant|has_variation] -> (sNP_20:SNP)
  - [associated_with_20_21_d:associated_with] -> (trait_21:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path