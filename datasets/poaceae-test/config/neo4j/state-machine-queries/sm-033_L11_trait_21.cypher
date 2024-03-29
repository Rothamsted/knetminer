MATCH path = (gene_1:Gene)
  - [enc_1_10:enc] - (protein_10:Protein)
  - [rel_10_10:equivalent|h_s_s|ortho*0..1] - (protein_10b:Protein)
  - [enc_10_9:enc] - (gene_9:Gene)
  - [rel_9_9_2:genetic|physical*0..2] - (gene_9b:Gene)
  - [has_variation_9_20:has_variation] - (sNP_20:SNP)
  - [associated_with_20_133:associated_with] - (phenotype_133:Phenotype)
  - [part_of_133_21:part_of] - (trait_21:Trait)
WHERE gene_1.iri IN $startGeneIris
RETURN path