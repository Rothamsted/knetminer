MATCH path = (gene_1:Gene{ iri: $startIri })
  - [has_observ_pheno_1_13:has_observ_pheno] - (phenotype_13:Phenotype)
RETURN path