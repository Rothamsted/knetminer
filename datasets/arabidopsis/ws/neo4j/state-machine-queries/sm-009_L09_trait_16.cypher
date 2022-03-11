MATCH path = (gene_1:Gene)
  - [rel_1_9:genetic|physical] - (gene_9:Gene)
  - [has_variation_9_15:has_variation] - (sNP_15:SNP)
  - [associated_with_15_66:associated_with] - (phenotype_66:Phenotype)
  - [part_of_66_16:part_of] - (trait_16:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path