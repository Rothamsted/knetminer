MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [ortho_10_10:ortho*0..1] - (protein_10b:Protein)
  - [enc_10_17:enc] - (gene_17:Gene)
  - [differentially_expressed_17_16:differentially_expressed] - (dGES_16:DGES)
WHERE gene_1.iri IN $startGeneIris
RETURN path