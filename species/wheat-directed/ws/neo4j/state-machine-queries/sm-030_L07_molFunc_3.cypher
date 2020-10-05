MATCH path = (gene_1:Gene)
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [rel_10_10:h_s_s|ortho|xref*0..1] - (protein_10b:Protein)
  - [enc_10_9_d:enc] -> (gene_9:Gene)
  - [rel_9_9_2:genetic|physical*0..2] - (gene_9b:Gene)
  - [has_function_9_3_d:has_function] -> (molFunc_3:MolFunc)
WHERE gene_1.iri IN $startGeneIris
RETURN path