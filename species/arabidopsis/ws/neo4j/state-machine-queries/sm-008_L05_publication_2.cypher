MATCH path = (gene_1:Gene)
  - [rel_1_9:genetic|physical] - (gene_9:Gene)
  - [pub_in_9_2:pub_in] - (publication_2:Publication)
WHERE gene_1.iri IN $startGeneIris
RETURN path