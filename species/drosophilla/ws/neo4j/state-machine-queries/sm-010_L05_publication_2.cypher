MATCH path = (gene_1:Gene{ iri: $startIri })
  - [gi_1_9_2:gi*1..2] - (gene_9:Gene)
  - [pub_in_9_2:pub_in] - (publication_2:Publication)
RETURN path