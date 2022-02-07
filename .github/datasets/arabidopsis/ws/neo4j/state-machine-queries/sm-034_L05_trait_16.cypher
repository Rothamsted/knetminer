MATCH path = (gene_1:Gene)
  - [has_variation_1_15:has_variation] - (sNP_15:SNP)
  - [associated_with_15_16:associated_with] - (trait_16:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path