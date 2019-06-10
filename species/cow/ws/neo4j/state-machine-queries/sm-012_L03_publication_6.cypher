MATCH path = (gene_1:Gene{ iri: $startIri })
  - [pub_in_1_6:pub_in] - (publication_6:Publication)
RETURN path