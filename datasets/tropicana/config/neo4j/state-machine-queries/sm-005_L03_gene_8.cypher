MATCH path = (gene_1:Gene)
  - [rel_1_8:genetic|homoeolog|physical|regulates] - (gene_8:Gene)
WHERE gene_1.iri IN $startGeneIris
RETURN path