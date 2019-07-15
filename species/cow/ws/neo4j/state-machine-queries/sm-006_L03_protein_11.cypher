MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_11:enc] - (protein_11:Protein)
RETURN path