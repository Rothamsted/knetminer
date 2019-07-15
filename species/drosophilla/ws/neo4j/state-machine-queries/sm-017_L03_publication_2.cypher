MATCH path = (gene_1:Gene{ iri: $startIri })
  - [pub_in_1_2:pub_in] - (publication_2:Publication)
RETURN path