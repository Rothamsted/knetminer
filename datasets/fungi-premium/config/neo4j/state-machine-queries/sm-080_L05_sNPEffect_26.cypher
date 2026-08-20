MATCH path = (gene_1:Gene)
  - [rel_1_20:has_mutant|has_variation] - (sNP_20:SNP)
  - [leads_to_20_26:leads_to] - (sNPEffect_26:SNPEffect)
WHERE gene_1.iri IN $startGeneIris
RETURN path