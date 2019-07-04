MATCH path = (gene_1:Gene{ iri: $startIri })
  - [part_of_1_23:part_of] - (coExpCluster_23:CoExpCluster)
  - [enriched_for_23_4:enriched_for] - (bioProc_4:BioProc)
RETURN path