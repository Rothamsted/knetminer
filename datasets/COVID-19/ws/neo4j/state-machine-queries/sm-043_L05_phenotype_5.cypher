MATCH path = (gene_1:Gene)
  - [occ_in_1_3:occ_in] - (publication_3:Publication)
  - [occ_in_3_5:occ_in] - (phenotype_5:Phenotype)
WHERE gene_1.iri IN $startGeneIris
RETURN path