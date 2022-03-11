MATCH path = (gene_1:Gene)
  - [rel_1_9:genetic|physical] - (gene_9:Gene)
  - [has_variation_9_15:has_variation] - (sNP_15:SNP)
  - [associated_with_15_66:associated_with] - (phenotype_66:Phenotype)
  - [pub_in_66_2:pub_in] - (publication_2:Publication)
WHERE gene_1.iri IN $startGeneIris
RETURN path