MATCH path = (gene_1:Gene)
  - [ortho_1_9:ortho] - (gene_9:Gene)
  - [located_in_9_5:located_in] - (celComp_5:CelComp)
WHERE gene_1.iri IN $startGeneIris
RETURN path