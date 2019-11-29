MATCH path = (gene_1:Gene)
  - [rel_1_9:genetic|homoeolog|physical|regulates] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [rel_9_8_3:genetic|physical*1..3] - (gene_8:Gene)
WHERE gene_1.iri IN $startGeneIris
RETURN path