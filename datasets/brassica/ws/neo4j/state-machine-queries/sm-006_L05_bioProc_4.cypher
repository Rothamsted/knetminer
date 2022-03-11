MATCH path = (gene_1:Gene)
  - [rel_1_9:genetic|homoeolog|physical|regulates] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [participates_in_9_4:participates_in] - (bioProc_4:BioProc)
WHERE gene_1.iri IN $startGeneIris
RETURN path