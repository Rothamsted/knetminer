MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10:h_s_s|ortho*0..1] - (protein_10b:Protein)
  - [has_function_10_23:has_function] - (kO_23:KO)
WHERE gene_1.iri IN $startGeneIris
RETURN path