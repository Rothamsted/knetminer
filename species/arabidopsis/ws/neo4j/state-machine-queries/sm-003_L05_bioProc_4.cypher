MATCH path = (gene_1:Gene{ iri: $startIri })
  - [rel_1_9:genetic|physical] - (gene_9:Gene)
  - [participates_in_9_4:participates_in] - (bioProc_4:BioProc)
RETURN path