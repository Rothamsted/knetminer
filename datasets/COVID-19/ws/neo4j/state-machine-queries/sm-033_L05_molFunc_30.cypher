MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_2:it_wi|ortho*0..2] - (protein_10b:Protein)
  - [has_function_10_30:has_function] - (molFunc_30:MolFunc)
WHERE gene_1.iri IN $startGeneIris
RETURN path