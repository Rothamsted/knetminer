MATCH path = (gene_1:Gene{ iri: $startIri })
  - [participates_in_1_4:participates_in] - (bioProc_4:BioProc)
RETURN path