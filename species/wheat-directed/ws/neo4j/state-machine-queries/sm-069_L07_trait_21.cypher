MATCH path = (gene_1:Gene{ iri: $startIri })
  - [homoeolog_1_9:homoeolog] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [enc_9_10_d:enc] -> (protein_10:Protein)
  - [xref_10_10_2:xref*0..2] - (protein_10b:Protein)
  - [cooc_wi_10_21:cooc_wi] - (trait_21:Trait)
RETURN path