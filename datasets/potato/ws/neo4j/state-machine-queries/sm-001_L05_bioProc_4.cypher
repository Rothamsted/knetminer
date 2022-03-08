MATCH path = (gene_1:Gene)
  - [part_of_1_23:part_of] - (coExpCluster_23:CoExpCluster)
  - [enriched_for_23_4:enriched_for] - (bioProc_4:BioProc)
WHERE gene_1.iri IN $startGeneIris
RETURN path