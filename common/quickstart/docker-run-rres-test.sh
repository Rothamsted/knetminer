specie=$1 # Call me with the specie id/directory in species/, eg, 'arabidopsis'
is_neo4j=$2 # Call me with any value, eg 'neo4j'
export KNET_HOST_DATA_DIR=/root/knetminer-test/data/$specie/data
export KNET_HOST_CONFIG_DIR=/root/knetminer-test/data/$specie/config
export KNET_IS_NEO4J="$2"
export KNET_NEO4J_URL='bolt://192.168.1.100:17690'
export KNET_NEO4J_URL='bolt://babvs65.rothamsted.ac.uk:7687'
export KNET_NEO4J_USER='rouser'
export KNET_NEO4J_PWD='rouser'
#export KNET_HOST_CODEBASE_DIR=/Users/brandizi/Documents/Work/RRes/ondex_git

export JAVA_TOOL_OPTIONS="-XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -XX:MaxRAMFraction=1"
export KNET_DOCKER_OPTS="--memory 12G --env JAVA_TOOL_OPTIONS -p 8090:8080 -it"
export KNET_DOCKER_OPTS="--memory 12G --env JAVA_TOOL_OPTIONS -p 8090:8080 --detach"

cd "$(dirname $0)"
./docker-run.sh "$1"
