MATCH path =  
	(g:Gene{ iri: $startIri }) - [enc:enc] -> (p:Protein)
  - [hss:h_s_s] -> (p1:Protein)
	- [pubref:pub_in] -> (pub:Publication)
RETURN path
ORDER BY hss.E_VALUE, hss.PERCENTALIGNMENT DESC
