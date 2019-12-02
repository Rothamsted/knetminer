MATCH path = (gene_1:Gene)
  - [rel_1_13:cooc_wi|has_observ_pheno] - (phenotype_13:Phenotype)
WHERE gene_1.iri IN $startGeneIris
RETURN path