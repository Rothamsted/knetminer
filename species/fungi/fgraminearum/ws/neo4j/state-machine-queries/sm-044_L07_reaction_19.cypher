MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_d_2:genetic|physical*0..2] -> (protein_10b:Protein)
  - [is_a_10_16:is_a] - (enzyme_16:Enzyme)
  - [ca_by_16_19:ca_by] - (reaction_19:Reaction)
RETURN path