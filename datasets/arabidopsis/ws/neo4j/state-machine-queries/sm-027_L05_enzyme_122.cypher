MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_d_2:genetic|physical*0..2] -> (protein_10b:Protein)
  - [is_a_10_122:is_a] - (enzyme_122:Enzyme)
WHERE gene_1.iri IN $startGeneIris
RETURN path