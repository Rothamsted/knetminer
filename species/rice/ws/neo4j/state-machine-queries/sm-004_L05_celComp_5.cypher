MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10:equivalent|h_s_s|ortho*0..1] - (protein_10b:Protein)
  - [located_in_10_5:located_in] - (celComp_5:CelComp)
RETURN path