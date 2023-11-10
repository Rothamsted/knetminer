cd "$(dirname $0)"

#export MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.version=4.3.1"

# As the main script, run me with -nc to avoid data re-initialisation
./run-ws.sh neo4j $*
