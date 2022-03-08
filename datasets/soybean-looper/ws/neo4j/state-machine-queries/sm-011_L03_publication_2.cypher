MATCH path = (gene_1:Gene)
  - [pub_in_1_2:pub_in] - (publication_2:Publication)
WHERE gene_1.iri IN $startGeneIris
RETURN path