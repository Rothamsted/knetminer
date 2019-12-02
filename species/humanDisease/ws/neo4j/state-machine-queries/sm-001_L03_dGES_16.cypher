MATCH path = (gene_1:Gene)
  - [differentially_expressed_1_16:differentially_expressed] - (dGES_16:DGES)
WHERE gene_1.iri IN $startGeneIris
RETURN path