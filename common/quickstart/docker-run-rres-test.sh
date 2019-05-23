specie=$1 # Call me with the specie id/directory in species/, eg, 'arabidopsis'
http_port=$2 # The host port to map to the 8080/Tomcat in the container
bolt_port=$3 # The Neo4j bolt port, if not defined, runs the traditional version, not Neo4j

export KNET_HOST_DATA_DIR=/root/knetminer-test/data/$specie/data
export KNET_HOST_CONFIG_DIR=/root/knetminer-test/data/$specie/config
[ "$bolt_port" == '' ] || export KNET_IS_NEO4J='neo4j'
#DEBUG export KNET_NEO4J_URL='bolt://192.168.1.100:17690'
export KNET_NEO4J_URL="bolt://babvs65.rothamsted.ac.uk:$bolt_port"
export KNET_NEO4J_USER='rouser'
export KNET_NEO4J_PWD='rouser'
#DEBUG, to get code from your sandbox: export KNET_HOST_CODEBASE_DIR=/Users/brandizi/Documents/Work/RRes/ondex_git

export JAVA_TOOL_OPTIONS="-XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -XX:MaxRAMFraction=1"
export KNET_DOCKER_OPTS="--memory 12G --env JAVA_TOOL_OPTIONS -p $http_port:8080 --name $specie"
#export KNET_DOCKER_OPTS="$KNET_DOCKER_OPTS -it"
export KNET_DOCKER_OPTS="$KNET_DOCKER_OPTS --detach"

cd "$(dirname $0)"
./docker-run.sh "$specie"
