MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10:enc] -> (protein_10:Protein)
  - [xref_10_10:xref*0..3] -> (protein_10:Protein)
  - [enc_10_9:enc] -> (gene_9:Gene)
  - [rel_9_9:genetic|physical*0..2] -> (gene_9:Gene)
  - [participates_in_9_4:participates_in] -> (bioProc_4:BioProc)
RETURN path