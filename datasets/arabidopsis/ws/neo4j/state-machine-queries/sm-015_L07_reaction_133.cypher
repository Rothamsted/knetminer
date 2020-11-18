MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10:h_s_s|ortho|xref*0..1] - (protein_10b:Protein)
  - [is_a_10_12:is_a] - (enzyme_12:Enzyme)
  - [ca_by_12_133:ca_by] - (reaction_133:Reaction)
WHERE gene_1.iri IN $startGeneIris
RETURN path