MATCH path = (gene_1:Gene)
  - [inv_in_1_22:inv_in] - (disease_22:Disease)
WHERE gene_1.iri IN $startGeneIris
RETURN path