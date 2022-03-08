MATCH path = (gene_1:Gene)
  - [enc_1_6:enc] - (protein_6:Protein)
  - [ortho_6_6:ortho*0..1] - (protein_6b:Protein)
  - [enc_6_9:enc] - (gene_9:Gene)
  - [located_in_9_5:located_in] - (celComp_5:CelComp)
WHERE gene_1.iri IN $startGeneIris
RETURN path