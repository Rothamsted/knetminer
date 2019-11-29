MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10_2:xref*0..2] - (protein_10b:Protein)
  - [rel_10_13:cooc_wi|has_observ_pheno] - (phenotype_13:Phenotype)
WHERE gene_1.iri IN $startGeneIris
RETURN path