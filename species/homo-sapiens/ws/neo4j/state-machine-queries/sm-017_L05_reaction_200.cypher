MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [ortho_10_10:ortho*0..1] - (protein_10b:Protein)
  - [rel_10_200:cs_by|pd_by] - (reaction_200:Reaction)
WHERE gene_1.iri IN $startGeneIris
RETURN path