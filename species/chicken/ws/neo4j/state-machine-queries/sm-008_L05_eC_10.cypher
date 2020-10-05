MATCH path = (gene_1:Gene)
  - [enc_1_3:enc] - (protein_3:Protein)
  - [it_wi_3_3_2:it_wi*0..2] - (protein_3b:Protein)
  - [cat_c_3_10:cat_c] - (eC_10:EC)
WHERE gene_1.iri IN $startGeneIris
RETURN path