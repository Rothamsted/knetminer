MATCH path = (gene_1:Gene{ iri: $startIri })
  - [has_variation_1_13:has_variation] - (sNP_13:SNP)
  - [associated_with_13_14:associated_with] - (trait_14:Trait)
RETURN path