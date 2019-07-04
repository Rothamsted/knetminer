MATCH path = (gene_1:Gene{ iri: $startIri })
  - [differentially_expressed_1_16:differentially_expressed] - (dGES_16:DGES)
RETURN path