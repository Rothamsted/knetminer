MATCH path = (gene_1:Gene{ iri: $startIri })
  - [gi_1_9_2:gi*1..2] - (gene_9:Gene)
  - [has_function_9_3:has_function] - (molFunc_3:MolFunc)
RETURN path