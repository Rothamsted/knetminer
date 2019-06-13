MATCH path = (gene_1:Gene{ iri: $startIri })
  - [regulates_1_9_d:regulates] -> (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [enc_9_10_d:enc] -> (protein_10:Protein)
  - [xref_10_10_2:xref*0..2] - (protein_10b:Protein)
  - [is_a_10_17_d:is_a] -> (enzyme_17:Enzyme)
  - [ca_by_17_188_d:ca_by] -> (reaction_188:Reaction)
RETURN path