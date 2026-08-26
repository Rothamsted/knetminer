MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10_3:xref*0..3] - (protein_10b:Protein)
  - [located_in_10_5:located_in] - (celComp_5:CelComp)
WHERE gene_1.iri IN $startGeneIris
RETURN path