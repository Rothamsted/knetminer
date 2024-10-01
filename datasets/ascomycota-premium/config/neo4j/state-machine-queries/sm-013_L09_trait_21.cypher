MATCH path = (gene_1:Gene)
  - [rel_1_9:genetic|homoeolog|physical|regulates] - (gene_9:Gene)
  - [rel_9_9_3:genetic|physical*0..3] - (gene_9b:Gene)
  - [has_variation_9_20:has_variation] - (sNP_20:SNP)
  - [associated_with_20_133:associated_with] - (phenotype_133:Phenotype)
  - [part_of_133_21:part_of] - (trait_21:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path