MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_d_2:genetic|physical*0..2] -> (protein_10b:Protein)
  - [xref_10_7_2:xref*1..2] - (protein_7:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path