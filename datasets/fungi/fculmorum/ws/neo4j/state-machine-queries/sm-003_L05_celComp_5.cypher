MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_2:h_s_s|ortho|xref*0..2] - (protein_10b:Protein)
  - [located_in_10_5:located_in] - (celComp_5:CelComp)
WHERE gene_1.iri IN $startGeneIris
RETURN path