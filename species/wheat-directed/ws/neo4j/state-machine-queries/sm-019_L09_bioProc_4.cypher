MATCH path = (gene_1:Gene{ iri: $startIri })
  - [regulates_1_9_d:regulates] -> (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [enc_9_10_d:enc] -> (protein_10:Protein)
  - [xref_10_10_2:xref*0..2] - (protein_10b:Protein)
  - [has_domain_10_11_d:has_domain] -> (protDomain_11:ProtDomain)
  - [participates_in_11_4_d:participates_in] -> (bioProc_4:BioProc)
RETURN path