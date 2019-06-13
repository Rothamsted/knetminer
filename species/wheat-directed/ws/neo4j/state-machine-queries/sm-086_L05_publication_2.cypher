MATCH path = (gene_1:Gene{ iri: $startIri })
  - [homoeolog_1_9:homoeolog] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [pub_in_9_2_d:pub_in] -> (publication_2:Publication)
RETURN path