MATCH path = (gene_1:Gene{ iri: $startIri })
  - [inv_in_1_188_d:inv_in] -> (reaction_188:Reaction)
RETURN path