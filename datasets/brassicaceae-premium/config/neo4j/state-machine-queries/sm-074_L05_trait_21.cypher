MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10_3:xref*0..3] - (protein_10b:Protein)
  - [cooc_wi_10_21:cooc_wi] - (trait_21:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path