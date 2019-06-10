MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [rel_10_10_d:h_s_s|ortho*0..1] -> (protein_10b:Protein)
  - [enc_10_9_d:enc] -> (gene_9:Gene)
  - [rel_9_9_d_2:genetic|physical*0..2] -> (gene_9b:Gene)
  - [cooc_wi_9_21_d:cooc_wi] -> (trait_21:Trait)
RETURN path