MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10:h_s_s|ortho*0..1] - (protein_10b:Protein)
  - [enc_10_9:enc] - (gene_9:Gene)
  - [it_wi_9_9_2:it_wi*0..2] - (gene_9b:Gene)
  - [it_wi_9_8_2:it_wi*1..2] - (gene_8:Gene)
WHERE gene_1.iri IN $startGeneIris
RETURN path