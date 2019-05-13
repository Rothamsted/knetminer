docker run \
  --env "MAVEN_ARGS=-Pdocker,neo4j -Dneo4j.server.boltUrl=bolt://192.168.1.114:17690" 
  --volume '/tmp/data:/root/knetminer-data' \
  --volume "/Users/brandizi/Documents/Work/RRes/ondex_git:/root/knetminer-build" \
  -p 8080:8080 -it knetminer/knetminer
  
--neo4j 1/0
--data-dir
--build-dir
--neo4j-url
--neo4j-user
--neo4j-pwd
--client-prefix
[ client-id ]
