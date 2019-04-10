MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10:enc] -> (protein_10:Protein)
  - [rel_10_10:genetic|physical*0..2] -> (protein_10:Protein)
  - [has_domain_10_17:has_domain] -> (protDomain_17:ProtDomain)
RETURN path