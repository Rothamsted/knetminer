MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [xref_10_10:xref*0..1] - (protein_10b:Protein)
  - [pub_in_10_2_d:pub_in] -> (publication_2:Publication)
RETURN path