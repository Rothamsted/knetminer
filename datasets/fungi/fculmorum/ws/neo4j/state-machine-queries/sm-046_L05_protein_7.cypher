MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_d_2:genetic|it_wi|physical*0..2] -> (protein_10b:Protein)
  - [cat_c_10_7:cat_c] - (protein_7:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path