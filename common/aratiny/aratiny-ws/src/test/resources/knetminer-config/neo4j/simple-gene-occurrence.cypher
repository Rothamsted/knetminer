MATCH path = 
  (g:Gene{ iri: $startIri }) - [occ:cooc_wi] -> (to:TO)
  - [occ1:cooc_wi] -> (g1:Gene)
  - [part:participates_in] -> (proc:BioProc)
RETURN path
ORDER BY occ.MAX_TFIDF DESC
