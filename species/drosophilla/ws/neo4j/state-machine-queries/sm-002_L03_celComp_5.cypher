MATCH path = (gene_1:Gene)
  - [located_in_1_5:located_in] - (celComp_5:CelComp)
WHERE gene_1.iri IN $startGeneIris
RETURN path