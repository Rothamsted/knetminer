MATCH path = (gene_1:Gene)
  - [has_variation_1_20:has_variation] - (sNP_20:SNP)
  - [associated_with_20_211:associated_with] - (trait_211:Trait)
  - [is_part_of_211_21:is_part_of] - (trait_21:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path