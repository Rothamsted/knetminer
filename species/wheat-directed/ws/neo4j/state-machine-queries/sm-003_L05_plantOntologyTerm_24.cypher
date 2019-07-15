MATCH path = (gene_1:Gene{ iri: $startIri })
  - [part_of_1_23_d:part_of] -> (coExpCluster_23:CoExpCluster)
  - [enriched_for_23_24_d:enriched_for] -> (plantOntologyTerm_24:PlantOntologyTerm)
RETURN path