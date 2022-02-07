MATCH path = (gene_1:Gene)
  - [has_variation_1_15:has_variation] - (sNP_15:SNP)
  - [associated_with_15_166:associated_with] - (trait_166:Trait)
  - [pub_in_166_2:pub_in] - (publication_2:Publication)
WHERE gene_1.iri IN $startGeneIris
RETURN path