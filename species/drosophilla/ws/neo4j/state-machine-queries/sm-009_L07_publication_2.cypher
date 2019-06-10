MATCH path = (gene_1:Gene{ iri: $startIri })
  - [gi_1_9_2:gi*1..2] - (gene_9:Gene)
  - [h_s_s_9_6:h_s_s] - (protein_6:Protein)
  - [pub_in_6_2:pub_in] - (publication_2:Publication)
RETURN path