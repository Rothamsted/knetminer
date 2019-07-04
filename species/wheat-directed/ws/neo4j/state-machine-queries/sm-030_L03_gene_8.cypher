MATCH path = (gene_1:Gene{ iri: $startIri })
  - [rel_1_8:homoeolog|regulates] - (gene_8:Gene)
RETURN path