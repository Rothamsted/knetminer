MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10:xref*0..1] - (protein_10b:Protein)
  - [located_in_10_40:located_in] - (celComp_40:CelComp)
WHERE gene_1.iri IN $startGeneIris
RETURN path