MATCH path = (gene_1:Gene{ iri: $startIri })
  - [located_in_1_5:located_in] - (celComp_5:CelComp)
RETURN path