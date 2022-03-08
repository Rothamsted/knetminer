MATCH path = (gene_1:Gene)
  - [rel_1_20:has_mutant|has_variation] - (sNP_20:SNP)
  - [associated_with_20_133:associated_with] - (phenotype_133:Phenotype)
  - [part_of_133_21:part_of] - (trait_21:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path