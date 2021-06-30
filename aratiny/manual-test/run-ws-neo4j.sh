cd "$(dirname $0)"

export MAVEN_ARGS="$MAVEN_ARGS -Dknetminer.backend.cypherDebugger.enabled=true"
#export MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.version=4.3.1"
./run-ws.sh neo4j
