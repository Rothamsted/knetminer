MATCH path = (gene_1:Gene)
  - [rel_1_9:genetic|homoeolog|physical|regulates] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [has_variation_9_20:has_variation] - (sNP_20:SNP)
  - [leads_to_20_26:leads_to] - (sNPEffect_26:SNPEffect)
WHERE gene_1.iri IN $startGeneIris
RETURN path