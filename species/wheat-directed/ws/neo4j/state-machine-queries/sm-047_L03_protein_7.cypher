MATCH path = (gene_1:Gene)
  - [enc_1_7_d:enc] -> (protein_7:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path