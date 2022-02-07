MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10_2:xref*0..2] - (protein_10b:Protein)
  - [cooc_wi_10_16:cooc_wi] - (tO_16:TO)
WHERE gene_1.iri IN $startGeneIris
RETURN path