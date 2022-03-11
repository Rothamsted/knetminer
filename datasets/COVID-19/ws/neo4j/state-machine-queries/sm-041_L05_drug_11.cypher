MATCH path = (gene_1:Gene)
  - [occ_in_1_3:occ_in] - (publication_3:Publication)
  - [occ_in_3_11:occ_in] - (drug_11:Drug)
WHERE gene_1.iri IN $startGeneIris
RETURN path