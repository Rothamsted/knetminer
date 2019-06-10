MATCH path = (gene_1:Gene{ iri: $startIri })
  - [homoeolog_1_8:homoeolog] - (gene_8:Gene)
RETURN path