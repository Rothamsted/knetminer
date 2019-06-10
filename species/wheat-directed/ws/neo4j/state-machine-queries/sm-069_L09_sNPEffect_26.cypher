MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10_d:enc] -> (protein_10:Protein)
  - [xref_10_10_d_3:xref*0..3] -> (protein_10b:Protein)
  - [enc_10_9_d:enc] -> (gene_9:Gene)
  - [rel_9_9_d_2:genetic|physical*0..2] -> (gene_9b:Gene)
  - [has_variation_9_20_d:has_variation] -> (sNP_20:SNP)
  - [leads_to_20_26_d:leads_to] -> (sNPEffect_26:SNPEffect)
RETURN path