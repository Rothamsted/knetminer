MATCH path = (gene_1:Gene{ iri: $startIri })
  - [rel_1_9:genetic|physical] - (gene_9:Gene)
  - [located_in_9_5:located_in] - (celComp_5:CelComp)
RETURN path