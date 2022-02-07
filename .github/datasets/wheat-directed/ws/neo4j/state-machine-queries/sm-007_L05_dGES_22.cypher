MATCH path = (gene_1:Gene)
  - [rel_1_9:homoeolog|regulates] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [differentially_expressed_9_22_d:differentially_expressed] -> (dGES_22:DGES)
WHERE gene_1.iri IN $startGeneIris
RETURN path