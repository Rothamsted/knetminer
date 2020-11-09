MATCH path = (gene_1:Gene)
  - [part_of_1_19_d:part_of] -> (path_19:Path)
WHERE gene_1.iri IN $startGeneIris
RETURN path