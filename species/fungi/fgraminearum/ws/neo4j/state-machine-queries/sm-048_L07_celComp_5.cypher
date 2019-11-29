MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_d_2:genetic|physical*0..2] -> (protein_10b:Protein)
  - [enc_10_9:enc] - (gene_9:Gene)
  - [located_in_9_5:located_in] - (celComp_5:CelComp)
WHERE gene_1.iri IN $startGeneIris
RETURN path