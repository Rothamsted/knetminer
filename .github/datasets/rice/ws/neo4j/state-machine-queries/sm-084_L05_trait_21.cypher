MATCH path = (gene_1:Gene)
  - [rel_1_20:has_mutant|has_variation] - (sNP_20:SNP)
  - [associated_with_20_21:associated_with] - (trait_21:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path