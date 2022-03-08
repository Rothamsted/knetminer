MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_2:h_s_s|ortho|xref*0..2] - (protein_10b:Protein)
  - [rel_10_7_2:h_s_s|ortho|xref*1..2] - (protein_7:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path