MATCH path = (gene_1:Gene{ iri: $startIri })
  - [has_observ_pheno_1_6:has_observ_pheno] - (phenotype_6:Phenotype)
RETURN path