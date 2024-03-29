MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_d_2:genetic|it_wi|physical*0..2] -> (protein_10b:Protein)
  - [enc_10_9:enc] - (gene_9:Gene)
  - [has_function_9_3:has_function] - (molFunc_3:MolFunc)
WHERE gene_1.iri IN $startGeneIris
RETURN path