MATCH path = (gene_1:Gene{ iri: $startIri })
  - [homoeolog_1_9:homoeolog] - (gene_9:Gene)
  - [rel_9_9:genetic|physical*0..1] - (gene_9b:Gene)
  - [has_variation_9_20_d:has_variation] -> (sNP_20:SNP)
  - [leads_to_20_26_d:leads_to] -> (sNPEffect_26:SNPEffect)
RETURN path