MATCH path = (gene_1:Gene{ iri: $startIri })
  - [h_s_s_1_6:h_s_s] - (protein_6:Protein)
  - [pub_in_6_2:pub_in] - (publication_2:Publication)
RETURN path