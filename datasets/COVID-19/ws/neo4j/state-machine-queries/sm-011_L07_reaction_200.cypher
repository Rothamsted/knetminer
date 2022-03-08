MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10:xref*0..1] - (protein_10b:Protein)
  - [is_a_10_19:is_a] - (enzyme_19:Enzyme)
  - [ca_by_19_200:ca_by] - (reaction_200:Reaction)
WHERE gene_1.iri IN $startGeneIris
RETURN path