MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [ortho_10_10:ortho*0..1] - (protein_10b:Protein)
  - [is_a_10_199:is_a] - (enzyme_199:Enzyme)
WHERE gene_1.iri IN $startGeneIris
RETURN path