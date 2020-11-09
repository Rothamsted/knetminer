MATCH path = (gene_1:Gene)
  - [pub_in_1_6:pub_in] - (publication_6:Publication)
WHERE gene_1.iri IN $startGeneIris
RETURN path