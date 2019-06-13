MATCH path = (gene_1:Gene{ iri: $startIri })
  - [homoeolog_1_9:homoeolog] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [enc_9_10_d:enc] -> (protein_10:Protein)
  - [h_s_s_10_10:h_s_s*0..] - (protein_10b:Protein)
  - [has_domain_10_11_d:has_domain] -> (protDomain_11:ProtDomain)
  - [has_function_11_3_d:has_function] -> (molFunc_3:MolFunc)
RETURN path