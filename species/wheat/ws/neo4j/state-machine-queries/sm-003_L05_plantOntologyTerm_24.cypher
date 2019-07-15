MATCH path = (gene_1:Gene{ iri: $startIri })
  - [part_of_1_23:part_of] - (coExpCluster_23:CoExpCluster)
  - [enriched_for_23_24:enriched_for] - (plantOntologyTerm_24:PlantOntologyTerm)
RETURN path