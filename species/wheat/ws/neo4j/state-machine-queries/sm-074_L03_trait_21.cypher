MATCH path = (gene_1:Gene{ iri: $startIri })
  - [cooc_wi_1_21:cooc_wi] - (trait_21:Trait)
RETURN path