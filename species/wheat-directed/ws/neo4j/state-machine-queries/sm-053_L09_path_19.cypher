MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [h_s_s_10_10:h_s_s*0..] - (protein_10b:Protein)
  - [is_a_10_17_d:is_a] -> (enzyme_17:Enzyme)
  - [ca_by_17_18_d:ca_by] -> (reaction_18:Reaction)
  - [part_of_18_19_d:part_of] -> (path_19:Path)
RETURN path