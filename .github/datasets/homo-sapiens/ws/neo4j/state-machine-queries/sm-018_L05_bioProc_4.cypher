MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [it_wi_10_10_d:it_wi*0..1] -> (protein_10b:Protein)
  - [participates_in_10_4:participates_in] - (bioProc_4:BioProc)
WHERE gene_1.iri IN $startGeneIris
RETURN path