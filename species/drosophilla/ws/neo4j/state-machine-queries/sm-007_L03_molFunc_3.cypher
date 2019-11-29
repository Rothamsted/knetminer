MATCH path = (gene_1:Gene)
  - [has_function_1_3:has_function] - (molFunc_3:MolFunc)
WHERE gene_1.iri IN $startGeneIris
RETURN path