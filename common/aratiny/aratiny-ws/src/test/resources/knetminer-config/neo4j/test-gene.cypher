MATCH path = (g1:Gene{ iri: $startIri }) - [testRel:has_test_relation] -> (c:TestCC)
RETURN path
