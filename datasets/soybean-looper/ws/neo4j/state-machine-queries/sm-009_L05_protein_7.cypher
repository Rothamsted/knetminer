MATCH path = (gene_1:Gene)
  - [enc_1_6:enc] - (protein_6:Protein)
  - [ortho_6_6:ortho*0..1] - (protein_6b:Protein)
  - [ortho_6_7:ortho] - (protein_7:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path