MATCH path = (gene_1:Gene{ iri: $startIri })
  - [rel_1_9:genetic|physical] - (gene_9:Gene)
  - [has_observ_pheno_9_6:has_observ_pheno] - (phenotype_6:Phenotype)
RETURN path