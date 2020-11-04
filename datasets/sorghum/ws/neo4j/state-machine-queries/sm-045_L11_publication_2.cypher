MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [xref_10_10_2:xref*0..2] - (protein_10b:Protein)
  - [enc_10_9:enc] - (gene_9:Gene)
  - [rel_9_9_2:genetic|physical*0..2] - (gene_9b:Gene)
  - [has_variation_9_20:has_variation] - (sNP_20:SNP)
  - [associated_with_20_211:associated_with] - (trait_211:Trait)
  - [pub_in_211_2:pub_in] - (publication_2:Publication)
WHERE gene_1.iri IN $startGeneIris
RETURN path