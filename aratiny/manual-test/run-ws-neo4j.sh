cd "$(dirname $0)"

export MAVEN_ARGS="$MAVEN_ARGS -Dknetminer.backend.cypherDebugger.enabled=true"
./run-ws.sh neo4j
