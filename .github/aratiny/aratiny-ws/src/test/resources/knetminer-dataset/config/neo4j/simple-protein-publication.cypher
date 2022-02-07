MATCH path =  
	(g:Gene) - [enc:enc] -> (p:Protein)
  - [hss:h_s_s] -> (p1:Protein)
	- [pubref:pub_in] -> (pub:Publication)
WHERE g.iri IN $startGeneIris
RETURN path
