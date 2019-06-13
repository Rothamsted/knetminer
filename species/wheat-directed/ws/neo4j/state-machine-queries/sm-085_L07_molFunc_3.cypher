MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [h_s_s_10_10:h_s_s*0..] - (protein_10b:Protein)
  - [cat_c_10_12_d:cat_c] -> (eC_12:EC)
  - [equ_12_3:equ] - (molFunc_3:MolFunc)
RETURN path