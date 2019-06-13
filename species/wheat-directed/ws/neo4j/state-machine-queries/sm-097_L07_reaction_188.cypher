MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [ortho_10_10:ortho*0..1] - (protein_10b:Protein)
  - [is_a_10_17_d:is_a] -> (enzyme_17:Enzyme)
  - [ca_by_17_188_d:ca_by] -> (reaction_188:Reaction)
RETURN path