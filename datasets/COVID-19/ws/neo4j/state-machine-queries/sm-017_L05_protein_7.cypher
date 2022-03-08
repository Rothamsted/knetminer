MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10:xref*0..1] - (protein_10b:Protein)
  - [rel_10_7_2:it_wi|ortho*1..2] - (protein_7:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path