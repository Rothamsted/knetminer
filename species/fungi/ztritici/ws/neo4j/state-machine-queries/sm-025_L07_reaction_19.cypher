MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10_2:xref*0..2] - (protein_10b:Protein)
  - [is_a_10_16:is_a] - (enzyme_16:Enzyme)
  - [ca_by_16_19:ca_by] - (reaction_19:Reaction)
WHERE gene_1.iri IN $startGeneIris
RETURN path