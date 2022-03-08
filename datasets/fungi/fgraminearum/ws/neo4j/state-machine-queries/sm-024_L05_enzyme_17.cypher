MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10_2:xref*0..2] - (protein_10b:Protein)
  - [is_a_10_17:is_a] - (enzyme_17:Enzyme)
WHERE gene_1.iri IN $startGeneIris
RETURN path