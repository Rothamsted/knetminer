MATCH path = (gene_1:Gene)
  - [enc_1_11:enc] - (protein_11:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path