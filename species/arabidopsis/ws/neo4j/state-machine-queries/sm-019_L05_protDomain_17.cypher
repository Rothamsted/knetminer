MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10:h_s_s|ortho|xref*0..1] - (protein_10b:Protein)
  - [has_domain_10_17:has_domain] - (protDomain_17:ProtDomain)
WHERE gene_1.iri IN $startGeneIris
RETURN path