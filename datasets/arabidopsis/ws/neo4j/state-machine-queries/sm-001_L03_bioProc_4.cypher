MATCH path = (gene_1:Gene)
  - [participates_in_1_4:participates_in] - (bioProc_4:BioProc)
WHERE gene_1.iri IN $startGeneIris
RETURN path