MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10_3:xref*0..3] - (protein_10b:Protein)
  - [xref_10_7_3:xref*1..3] - (protein_7:Protein)
WHERE gene_1.iri IN $startGeneIris
RETURN path