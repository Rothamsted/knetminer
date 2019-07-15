MATCH path = (gene_1:Gene{ iri: $startIri })
  - [differentially_expressed_1_22:differentially_expressed] - (dGES_22:DGES)
RETURN path