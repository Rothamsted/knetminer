MATCH path = (gene_1:Gene)
  - [occ_in_1_2_d:occ_in] -> (publication_2:Publication)
WHERE gene_1.iri IN $startGeneIris
RETURN path