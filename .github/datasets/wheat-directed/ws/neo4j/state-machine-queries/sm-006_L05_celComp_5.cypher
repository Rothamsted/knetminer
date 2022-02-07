MATCH path = (gene_1:Gene)
  - [rel_1_9:homoeolog|regulates] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [located_in_9_5_d:located_in] -> (celComp_5:CelComp)
WHERE gene_1.iri IN $startGeneIris
RETURN path