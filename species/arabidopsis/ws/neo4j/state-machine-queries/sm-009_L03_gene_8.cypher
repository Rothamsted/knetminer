MATCH path = (gene_1:Gene{ iri: $startIri })
  - [rel_1_8:genetic|physical] - (gene_8:Gene)
RETURN path