MATCH path = (gene_1:Gene{ iri: $startIri })
  - [cooc_wi_1_16:cooc_wi] - (trait_16:Trait)
RETURN path