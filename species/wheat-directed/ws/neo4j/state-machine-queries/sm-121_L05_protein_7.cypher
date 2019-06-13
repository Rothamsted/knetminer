MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [xref_10_10_3:xref*0..3] - (protein_10b:Protein)
  - [ortho_10_7:ortho] - (protein_7:Protein)
RETURN path