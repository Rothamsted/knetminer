MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_7:enc] - (protein_7:Protein)
RETURN path