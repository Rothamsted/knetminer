MATCH path = (gene_1:Gene)
  - [rel_1_9:homoeolog|regulates] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [has_function_9_3_d:has_function] -> (molFunc_3:MolFunc)
WHERE gene_1.iri IN $startGeneIris
RETURN path