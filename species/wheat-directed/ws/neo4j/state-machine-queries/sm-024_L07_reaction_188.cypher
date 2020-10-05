MATCH path = (gene_1:Gene)
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [rel_10_10:h_s_s|ortho|xref*0..1] - (protein_10b:Protein)
  - [is_a_10_17_d:is_a] -> (enzyme_17:Enzyme)
  - [ca_by_17_188_d:ca_by] -> (reaction_188:Reaction)
WHERE gene_1.iri IN $startGeneIris
RETURN path