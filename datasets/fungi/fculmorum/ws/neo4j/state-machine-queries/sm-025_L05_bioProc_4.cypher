MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_d_2:genetic|it_wi|physical*0..2] -> (protein_10b:Protein)
  - [participates_in_10_4:participates_in] - (bioProc_4:BioProc)
WHERE gene_1.iri IN $startGeneIris
RETURN path