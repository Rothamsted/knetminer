MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [rel_10_10_d:h_s_s|ortho*0..1] -> (protein_10b:Protein)
  - [enc_10_8_d:enc] -> (gene_8:Gene)
RETURN path