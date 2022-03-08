MATCH path = (gene_1:Gene)
  - [cooc_wi_1_21:cooc_wi] - (trait_21:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path