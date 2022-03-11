MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_d_2:genetic|physical*0..2] -> (protein_10b:Protein)
  - [has_domain_10_14:has_domain] - (protDomain_14:ProtDomain)
WHERE gene_1.iri IN $startGeneIris
RETURN path