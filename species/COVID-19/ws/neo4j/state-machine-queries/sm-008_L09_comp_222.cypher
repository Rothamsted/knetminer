MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [ortho_10_10:ortho*0..1] - (protein_10b:Protein)
  - [is_a_10_19:is_a] - (enzyme_19:Enzyme)
  - [ca_by_19_20:ca_by] - (reaction_20:Reaction)
  - [rel_20_222:cs_by|pd_by] - (comp_222:Comp)
WHERE gene_1.iri IN $startGeneIris
RETURN path