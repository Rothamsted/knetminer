MATCH path = (gene_1:Gene{ iri: $startIri })
  - [h_s_s_1_6:h_s_s] - (protein_6:Protein)
  - [participates_in_6_4:participates_in] - (bioProc_4:BioProc)
RETURN path