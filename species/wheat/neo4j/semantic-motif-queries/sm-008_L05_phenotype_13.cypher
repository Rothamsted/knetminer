MATCH path = (gene_1:Gene{ iri: $startIri })
  - [rel_1_9:homoeolog|regulates] -> (gene_9:Gene)
  - [rel_9_9:genetic|physical*0..3] -> (gene_9:Gene)
  - [has_observ_pheno_9_13:has_observ_pheno] -> (phenotype_13:Phenotype)
RETURN path