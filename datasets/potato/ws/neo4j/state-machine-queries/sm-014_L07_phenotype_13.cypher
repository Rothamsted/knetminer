MATCH path = (gene_1:Gene)
  - [rel_1_9:genetic|homoeolog|physical|regulates] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [has_variation_9_20:has_variation] - (sNP_20:SNP)
  - [associated_with_20_13:associated_with] - (phenotype_13:Phenotype)
WHERE gene_1.iri IN $startGeneIris
RETURN path