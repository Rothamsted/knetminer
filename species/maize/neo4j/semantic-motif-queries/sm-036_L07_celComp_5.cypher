MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10:enc] -> (protein_10:Protein)
  - [rel_10_10:equivalent|h_s_s|ortho*0..1] -> (protein_10:Protein)
  - [enc_10_9:enc] -> (gene_9:Gene)
  - [rel_9_9:genetic|physical*0..2] -> (gene_9:Gene)
  - [located_in_9_5:located_in] -> (celComp_5:CelComp)
RETURN path