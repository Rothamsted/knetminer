MATCH path = (gene_1:Gene)
  - [part_of_1_23_d:part_of] -> (coExpCluster_23:CoExpCluster)
  - [part_of_23_25_d:part_of] -> (coExpStudy_25:CoExpStudy)
WHERE gene_1.iri IN $startGeneIris
RETURN path