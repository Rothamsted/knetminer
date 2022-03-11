MATCH path = (gene_1:Gene)
  - [enc_1_6:enc] - (protein_6:Protein)
  - [ortho_6_6:ortho*0..1] - (protein_6b:Protein)
  - [enc_6_9:enc] - (gene_9:Gene)
  - [pub_in_9_2:pub_in] - (publication_2:Publication)
WHERE gene_1.iri IN $startGeneIris
RETURN path