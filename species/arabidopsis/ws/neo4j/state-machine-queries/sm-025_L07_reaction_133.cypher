MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_d_2:genetic|physical*0..2] -> (protein_10b:Protein)
  - [is_a_10_12:is_a] - (enzyme_12:Enzyme)
  - [ca_by_12_133:ca_by] - (reaction_133:Reaction)
WHERE gene_1.iri IN $startGeneIris
RETURN path