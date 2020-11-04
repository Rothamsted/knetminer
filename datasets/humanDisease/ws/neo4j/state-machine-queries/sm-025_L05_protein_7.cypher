MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [it_wi_10_10_d:it_wi*0..1] -> (protein_10b:Protein)
  - [xref_10_7:xref] - (protein_7:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path