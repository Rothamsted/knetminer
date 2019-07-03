MATCH path = (gene_1:Gene{ iri: $startIri })
  - [homoeolog_1_9:homoeolog] - (gene_9:Gene)
  - [rel_9_9:genetic|physical*0..1] - (gene_9b:Gene)
  - [has_observ_pheno_9_13_d:has_observ_pheno] -> (phenotype_13:Phenotype)
RETURN path