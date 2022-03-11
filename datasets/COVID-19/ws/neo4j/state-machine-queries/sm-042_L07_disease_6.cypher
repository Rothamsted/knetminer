MATCH path = (gene_1:Gene)
  - [occ_in_1_3:occ_in] - (publication_3:Publication)
  - [occ_in_3_12:occ_in] - (drug_12:Drug)
  - [cooc_wi_12_6:cooc_wi] - (disease_6:Disease)
WHERE gene_1.iri IN $startGeneIris
RETURN path