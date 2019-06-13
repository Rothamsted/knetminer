MATCH path = (gene_1:Gene{ iri: $startIri })
  - [homoeolog_1_9:homoeolog] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [enc_9_10_d:enc] -> (protein_10:Protein)
  - [h_s_s_10_10:h_s_s*0..] - (protein_10b:Protein)
  - [participates_in_10_4_d:participates_in] -> (bioProc_4:BioProc)
RETURN path