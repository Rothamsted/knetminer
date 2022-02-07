MATCH path = (gene_1:Gene)
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [rel_10_10:h_s_s|ortho|xref*0..1] - (protein_10b:Protein)
  - [cat_c_10_12_d:cat_c] -> (eC_12:EC)
  - [equ_12_3:equ] - (molFunc_3:MolFunc)
WHERE gene_1.iri IN $startGeneIris
RETURN path