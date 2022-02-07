MATCH path = (gene_1:Gene)
  - [differentially_expressed_1_22_d:differentially_expressed] -> (dGES_22:DGES)
WHERE gene_1.iri IN $startGeneIris
RETURN path