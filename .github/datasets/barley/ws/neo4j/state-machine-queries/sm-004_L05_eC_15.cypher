MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10:equivalent|h_s_s|ortho*0..1] - (protein_10b:Protein)
  - [cat_c_10_15:cat_c] - (eC_15:EC)
WHERE gene_1.iri IN $startGeneIris
RETURN path