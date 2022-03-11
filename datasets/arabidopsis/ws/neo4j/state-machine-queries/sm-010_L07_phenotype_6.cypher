MATCH path = (gene_1:Gene)
  - [rel_1_9:genetic|physical] - (gene_9:Gene)
  - [has_variation_9_15:has_variation] - (sNP_15:SNP)
  - [associated_with_15_6:associated_with] - (phenotype_6:Phenotype)
WHERE gene_1.iri IN $startGeneIris
RETURN path