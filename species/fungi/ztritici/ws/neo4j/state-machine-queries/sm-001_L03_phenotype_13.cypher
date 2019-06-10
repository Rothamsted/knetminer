MATCH path = (gene_1:Gene{ iri: $startIri })
  - [rel_1_13:cooc_wi|has_observ_pheno] - (phenotype_13:Phenotype)
RETURN path