MATCH path = (gene_1:Gene)
  - [has_observ_pheno_1_6:has_observ_pheno] - (phenotype_6:Phenotype)
WHERE gene_1.iri IN $startGeneIris
RETURN path