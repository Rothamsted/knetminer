MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10:h_s_s|ortho*0..1] - (protein_10b:Protein)
  - [cat_c_10_12:cat_c] - (eC_12:EC)
  - [equ_12_3:equ] - (molFunc_3:MolFunc)
RETURN path