MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [xref_10_10:xref*0..1] - (protein_10b:Protein)
  - [cat_c_10_15_d:cat_c] -> (eC_15:EC)
RETURN path