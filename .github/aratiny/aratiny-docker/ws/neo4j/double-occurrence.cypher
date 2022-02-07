MATCH path = (g1:Gene) 
  - [cooc1:cooc_wi] -> (to1:TO) 
  - [cooc2:cooc_wi] -> (g2:Gene)
WHERE g1.iri IN $startGeneIris AND g1 <> g2
RETURN path
