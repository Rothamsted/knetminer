MATCH path = (gene_1:Gene)
  - [enc_1_6:enc] - (protein_6:Protein)
  - [ortho_6_6:ortho*0..1] - (protein_6b:Protein)
  - [has_domain_6_13:has_domain] - (protDomain_13:ProtDomain)
WHERE gene_1.iri IN $startGeneIris
RETURN path