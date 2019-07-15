MATCH path = (gene_1:Gene{ iri: $startIri })
  - [gi_1_9_2:gi*1..2] - (gene_9:Gene)
  - [participates_in_9_4:participates_in] - (bioProc_4:BioProc)
RETURN path