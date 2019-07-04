MATCH path = (gene_1:Gene{ iri: $startIri })
  - [h_s_s_1_6:h_s_s] - (protein_6:Protein)
  - [has_function_6_3:has_function] - (molFunc_3:MolFunc)
RETURN path