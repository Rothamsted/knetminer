MATCH path = (gene_1:Gene{ iri: $startIri })
  - [part_of_1_23:part_of] - (coExpCluster_23:CoExpCluster)
  - [part_of_23_25:part_of] - (coExpStudy_25:CoExpStudy)
RETURN path