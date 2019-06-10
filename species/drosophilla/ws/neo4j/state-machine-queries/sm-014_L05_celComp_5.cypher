MATCH path = (gene_1:Gene{ iri: $startIri })
  - [h_s_s_1_6:h_s_s] - (protein_6:Protein)
  - [located_in_6_5:located_in] - (celComp_5:CelComp)
RETURN path