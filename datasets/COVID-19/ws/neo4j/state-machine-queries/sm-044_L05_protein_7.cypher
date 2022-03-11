MATCH path = (gene_1:Gene)
  - [occ_in_1_3:occ_in] - (publication_3:Publication)
  - [occ_in_3_7:occ_in] - (protein_7:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path