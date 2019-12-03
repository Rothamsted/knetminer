MATCH path = (gene_1:Gene)
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [rel_10_10:h_s_s|ortho|xref*0..1] - (protein_10b:Protein)
  - [rel_10_7:h_s_s|ortho|xref] - (protein_7:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path