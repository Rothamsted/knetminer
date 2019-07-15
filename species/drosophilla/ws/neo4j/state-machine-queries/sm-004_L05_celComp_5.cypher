MATCH path = (gene_1:Gene{ iri: $startIri })
  - [gi_1_9_2:gi*1..2] - (gene_9:Gene)
  - [located_in_9_5:located_in] - (celComp_5:CelComp)
RETURN path