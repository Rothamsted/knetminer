MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [it_wi_10_10_d:it_wi*0..1] -> (protein_10b:Protein)
  - [has_domain_10_18:has_domain] - (protDomain_18:ProtDomain)
WHERE gene_1.iri IN $startGeneIris
RETURN path