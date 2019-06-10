MATCH path = (gene_1:Gene{ iri: $startIri })
  - [regulates_1_8_d:regulates] -> (gene_8:Gene)
RETURN path