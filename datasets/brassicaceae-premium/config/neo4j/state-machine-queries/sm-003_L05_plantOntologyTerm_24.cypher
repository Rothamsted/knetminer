MATCH path = (gene_1:Gene)
  - [part_of_1_23:part_of] - (coExpCluster_23:CoExpCluster)
  - [enriched_for_23_24:enriched_for] - (plantOntologyTerm_24:PlantOntologyTerm)
WHERE gene_1.iri IN $startGeneIris
RETURN path