MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_2:it_wi|ortho*0..2] - (protein_10b:Protein)
  - [rel_10_20:cs_by|pd_by] - (reaction_20:Reaction)
  - [rel_20_222:cs_by|pd_by] - (comp_222:Comp)
WHERE gene_1.iri IN $startGeneIris
RETURN path