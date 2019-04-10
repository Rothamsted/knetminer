MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10:enc] -> (protein_10:Protein)
  - [rel_10_10:h_s_s|ortho*0..1] -> (protein_10:Protein)
  - [xref_10_7:xref*1..3] -> (protein_7:Protein)
RETURN path