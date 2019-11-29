MATCH path = (gene_1:Gene)
  - [has_variation_1_15:has_variation] - (sNP_15:SNP)
  - [associated_with_15_166:associated_with] - (trait_166:Trait)
  - [is_part_of_166_16:is_part_of] - (trait_16:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path