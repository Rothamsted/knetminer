MATCH path = (gene_1:Gene{ iri: $startIri })
  - [has_function_1_3:has_function] - (molFunc_3:MolFunc)
RETURN path