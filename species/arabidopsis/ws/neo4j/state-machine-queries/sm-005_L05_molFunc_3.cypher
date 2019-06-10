MATCH path = (gene_1:Gene{ iri: $startIri })
  - [rel_1_9:genetic|physical] - (gene_9:Gene)
  - [has_function_9_3:has_function] - (molFunc_3:MolFunc)
RETURN path