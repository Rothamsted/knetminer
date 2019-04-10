MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10:enc] -> (protein_10:Protein)
  - [rel_10_10:it_wi|ortho*0..1] -> (protein_10:Protein)
  - [rel_10_7:it_wi|ortho] -> (protein_7:Protein)
RETURN path