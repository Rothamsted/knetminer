MATCH path = (gene_1:Gene)
  - [rel_1_9:genetic|physical] - (gene_9:Gene)
  - [cooc_wi_9_16:cooc_wi] - (trait_16:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path