MATCH path = (gene_1:Gene{ iri: $startIri })
  - [part_of_1_19_d:part_of] -> (path_19:Path)
RETURN path