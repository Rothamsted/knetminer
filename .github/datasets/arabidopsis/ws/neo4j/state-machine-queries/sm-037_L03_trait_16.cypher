MATCH path = (gene_1:Gene)
  - [cooc_wi_1_16:cooc_wi] - (trait_16:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path