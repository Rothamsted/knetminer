MATCH path = (gene_1:Gene)
  - [inv_in_1_188:inv_in] - (reaction_188:Reaction)
WHERE gene_1.iri IN $startGeneIris
RETURN path