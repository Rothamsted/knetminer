# Script used to run RRes instances.
# Invocation examples:
# ./docker-run-rres-test.sh arabidopsis # arabidopsis
# arabidopsis Tomcat on 8090 (host port) Neo4j traverser, bolt port on 7687 (server is babvs65)
# ./docker-run-rres-test.sh arabidopsis 8090 7687 
# wheat, Tomcat on 9091, Neo4j on 7688, 20GB of RAM handed to the container
# ./docker-run-rres-test.sh wheat 8091 7688 20
#
specie=$1 # Call me with the specie id/directory in species/, eg, 'arabidopsis'
http_port=$2 # The host port to map to the 8080/Tomcat in the container
bolt_port=$3 # The Neo4j bolt port, if not defined, runs the traditional version, not Neo4j
memory=${4:-12} # The memory to give to the container, in GB, 12 is the default.

host_data_root_dir="/var/lib/docker/knetminer-datasets/$specie"
export KNET_HOST_DATA_DIR="$host_data_root_dir/data"
export KNET_HOST_CONFIG_DIR="$host_data_root_dir/config"
[ "$bolt_port" == '' ] || export KNET_IS_NEO4J='neo4j'
#DEBUG export KNET_NEO4J_URL='bolt://192.168.1.100:17690'
export KNET_NEO4J_URL="bolt://babvs65.rothamsted.ac.uk:$bolt_port"
export KNET_NEO4J_USER='rouser'
export KNET_NEO4J_PWD='rouser'
#DEBUG, to get code from your sandbox: export KNET_HOST_CODEBASE_DIR=/Users/brandizi/Documents/Work/RRes/ondex_git

# Use tall the memory you find
export JAVA_TOOL_OPTIONS="-XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -XX:MaxRAMFraction=1"

# Profiling (requires -p 5005:5005 passed to Docker) 
#export JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -Dcom.sun.management.jmxremote.ssl=false
#                    -Dcom.sun.management.jmxremote.authenticate=false
#                    -Dcom.sun.management.jmxremote.port=9098
#                    -Dcom.sun.management.jmxremote.rmi.port=9099
#                    -Djava.rmi.server.hostname=localhost
#                    -Dcom.sun.management.jmxremote.local.only=false"

export KNET_DOCKER_OPTS="--memory ${memory}G --env JAVA_TOOL_OPTIONS -p $http_port:8080 --name $specie"
#export KNET_DOCKER_OPTS="$KNET_DOCKER_OPTS -it"
export KNET_DOCKER_OPTS="$KNET_DOCKER_OPTS --detach"

# Profiling (See above)
#export KNET_DOCKER_OPTS="$KNET_DOCKER_OPTS -p 9098:9098 -p 9099:9099"

cd "$(dirname $0)"
./docker-run.sh "$specie"

