MATCH path = (gene_1:Gene{ iri: $startIri })
  - [enc_1_10:enc] -> (protein_10:Protein)
  - [xref_10_10:xref*0..2] -> (protein_10:Protein)
  - [has_domain_10_11:has_domain] -> (protDomain_11:ProtDomain)
  - [located_in_11_5:located_in] -> (celComp_5:CelComp)
RETURN path