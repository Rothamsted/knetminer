MATCH path = (gene_1:Gene)
  - [inv_in_1_6:inv_in] - (disease_6:Disease)
WHERE gene_1.iri IN $startGeneIris
RETURN path