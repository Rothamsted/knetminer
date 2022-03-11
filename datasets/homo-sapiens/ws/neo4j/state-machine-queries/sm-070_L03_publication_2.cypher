MATCH path = (gene_1:Gene)
  - [rel_1_2:occ_in|pub_in] - (publication_2:Publication)
WHERE gene_1.iri IN $startGeneIris
RETURN path