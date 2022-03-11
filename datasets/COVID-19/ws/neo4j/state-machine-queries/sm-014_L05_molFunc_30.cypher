MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10:xref*0..1] - (protein_10b:Protein)
  - [has_function_10_30:has_function] - (molFunc_30:MolFunc)
WHERE gene_1.iri IN $startGeneIris
RETURN path