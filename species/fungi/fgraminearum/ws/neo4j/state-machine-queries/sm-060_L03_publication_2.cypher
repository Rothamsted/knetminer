MATCH path = (gene_1:Gene{ iri: $startIri })
  - [rel_1_2:occ_in|pub_in] - (publication_2:Publication)
RETURN path