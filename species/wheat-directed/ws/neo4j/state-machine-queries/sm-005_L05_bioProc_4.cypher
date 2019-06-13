MATCH path = (gene_1:Gene{ iri: $startIri })
  - [regulates_1_9_d:regulates] -> (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [participates_in_9_4_d:participates_in] -> (bioProc_4:BioProc)
RETURN path