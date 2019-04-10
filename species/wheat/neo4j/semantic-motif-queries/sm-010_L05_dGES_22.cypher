MATCH path = (gene_1:Gene{ iri: $startIri })
  - [rel_1_9:homoeolog|regulates] -> (gene_9:Gene)
  - [rel_9_9:genetic|physical*0..3] -> (gene_9:Gene)
  - [differentially_expressed_9_22:differentially_expressed] -> (dGES_22:DGES)
RETURN path