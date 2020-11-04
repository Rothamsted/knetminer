MATCH path = (gene_1:Gene)
  - [rel_1_9:genetic|homoeolog|physical|regulates] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [differentially_expressed_9_22:differentially_expressed] - (dGES_22:DGES)
WHERE gene_1.iri IN $startGeneIris
RETURN path