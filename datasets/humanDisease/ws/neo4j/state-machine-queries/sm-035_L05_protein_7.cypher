MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10:xref*0..] - (protein_10b:Protein)
  - [it_wi_10_7_d:it_wi] -> (protein_7:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path