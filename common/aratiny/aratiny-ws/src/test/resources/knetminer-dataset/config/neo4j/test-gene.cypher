MATCH path = (g1:Gene) - [testRel:has_test_relation] -> (c:TestCC)
WHERE g1.iri IN $startGeneIris
RETURN path
