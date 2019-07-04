MATCH path = (gene_1:Gene{ iri: $startIri })
  - [cooc_wi_1_21_d:cooc_wi] -> (trait_21:Trait)
RETURN path