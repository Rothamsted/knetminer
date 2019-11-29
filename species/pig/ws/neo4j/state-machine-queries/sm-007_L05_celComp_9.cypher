MATCH path = (gene_1:Gene)
  - [enc_1_3:enc] - (protein_3:Protein)
  - [it_wi_3_3_2:it_wi*0..2] - (protein_3b:Protein)
  - [located_in_3_9:located_in] - (celComp_9:CelComp)
WHERE gene_1.iri IN $startGeneIris
RETURN path