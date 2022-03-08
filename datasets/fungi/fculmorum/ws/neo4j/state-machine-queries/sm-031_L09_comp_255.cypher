MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_d_2:genetic|it_wi|physical*0..2] -> (protein_10b:Protein)
  - [is_a_10_16:is_a] - (enzyme_16:Enzyme)
  - [ca_by_16_18:ca_by] - (reaction_18:Reaction)
  - [pd_by_18_255:pd_by] - (comp_255:Comp)
WHERE gene_1.iri IN $startGeneIris
RETURN path