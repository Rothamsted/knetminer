MATCH path = (gene_1:Gene)
  - [ortho_1_9:ortho] - (gene_9:Gene)
  - [participates_in_9_4:participates_in] - (bioProc_4:BioProc)
WHERE gene_1.iri IN $startGeneIris
RETURN path