MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [it_wi_10_10_d:it_wi*0..1] -> (protein_10b:Protein)
  - [enc_10_17:enc] - (gene_17:Gene)
  - [has_variation_17_13:has_variation] - (sNP_13:SNP)
  - [associated_with_13_14:associated_with] - (trait_14:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path