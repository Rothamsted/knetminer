MATCH path = (gene_1:Gene)
  - [has_variation_1_13:has_variation] - (sNP_13:SNP)
  - [associated_with_13_14:associated_with] - (trait_14:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path