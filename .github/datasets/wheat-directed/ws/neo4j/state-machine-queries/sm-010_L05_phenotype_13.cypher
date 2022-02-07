MATCH path = (gene_1:Gene)
  - [rel_1_9:homoeolog|regulates] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [has_observ_pheno_9_13_d:has_observ_pheno] -> (phenotype_13:Phenotype)
WHERE gene_1.iri IN $startGeneIris
RETURN path