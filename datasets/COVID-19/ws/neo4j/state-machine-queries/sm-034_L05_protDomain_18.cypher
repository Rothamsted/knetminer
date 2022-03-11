MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10_2:it_wi|ortho*0..2] - (protein_10b:Protein)
  - [has_domain_10_18:has_domain] - (protDomain_18:ProtDomain)
WHERE gene_1.iri IN $startGeneIris
RETURN path