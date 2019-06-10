MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10:equivalent|h_s_s|ortho*0..1] - (protein_10b:Protein)
  - [has_domain_10_11:has_domain] - (protDomain_11:ProtDomain)
  - [participates_in_11_4:participates_in] - (bioProc_4:BioProc)
RETURN path