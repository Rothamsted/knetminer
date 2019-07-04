MATCH path = (gene_1:Gene{ iri: $startIri })
  - [has_variation_1_20:has_variation] - (sNP_20:SNP)
  - [associated_with_20_21:associated_with] - (trait_21:Trait)
RETURN path