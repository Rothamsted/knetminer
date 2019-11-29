MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10_3:xref*0..3] - (protein_10b:Protein)
  - [cat_c_10_15:cat_c] - (eC_15:EC)
WHERE gene_1.iri IN $startGeneIris
RETURN path