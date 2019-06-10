MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10_3:xref*0..3] - (protein_10b:Protein)
  - [is_a_10_17:is_a] - (enzyme_17:Enzyme)
  - [ca_by_17_188:ca_by] - (reaction_188:Reaction)
RETURN path