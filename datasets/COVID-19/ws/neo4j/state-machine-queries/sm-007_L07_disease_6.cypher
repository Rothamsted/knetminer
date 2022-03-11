MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10:xref*0..1] - (protein_10b:Protein)
  - [cooc_wi_10_12:cooc_wi] - (drug_12:Drug)
  - [cooc_wi_12_6:cooc_wi] - (disease_6:Disease)
WHERE gene_1.iri IN $startGeneIris
RETURN path