# 
# Helper for the host, to run a specie/dataset instance of the Knetminer Docker container. 
# 
# Environment variables influencing this scripts:
#
# $1 = directory name under $KNET_DATASET_DIR (eg, arabidopsis, wheat).
#
# All the env vars can be setup via export XXX=<value> before invoking this script. None is (formally) mandatory, 
# defaults are used if you leave them empty.
#
# KNET_HOST_CONFIG_DIR # host directory where to place instantiated configuration files (default is /root/knetminer-config in the container) 
# KNET_HOST_DATASET_DIR # host directory where to place instantiated configuration files (default is /root/knetminer-config in the container) 
# host directory where your specie/ instance definitions are (maven-settings.xml, client/, ws/ files). This is where $1
# is looked up (so, arabidopsis/, or wheat/, rice/, etc). By default, this script uses the species/ directory on the 
# container, which, in turn, comes from our GitHub codebase repository. WARNING: we DO NOT recommend to use both this
# and KNET_HOST_CODEBASE_DIR.
# KNET_HOST_PORT # the HTTP port to be used to reach knetminer from the host, eg, 9090 => knetminer will be on 
# http://localhost:8090/client. Default is 8080
# 
# KNET_HOST_CODEBASE_DIR # dev option, client/configuration will be updated with code from this dir on the host
#
# MAVEN_ARGS # custom options to invoke Maven builds (used to build the front-end (client) WAR and instantiated a 
# configuration from Maven settings). WARNING: if you set this to non-null, YOU MUST also set proper profiles. 
# Docker needs MAVEN_ARGS="... -Pdocker" as a minimum. It might need -Pdocker,neo4j or other profiles.
#
# Example of how to set custom embeddable layout (GeneStack option)
# export MAVEN_ARGS="-Dknetminer.ui.embeddableLayout=true -Pdocker"
#
# KNET_HOST_DATA_DIR # host directory where to put knowledge-network.oxl and to be used as data directory
# KNET_IS_NEO4J # any non-null will run the container in Neo4j mode, against a Neo4j server
# KNET_NEO4J_URL # Neo4j bolt:// URL pointing to the DB server you want to use (ignored if KNET_IS_NEO4J not set) 
# KNET_NEO4J_USER # Neo4j login user (defult is neo4j)
# KNET_NEO4J_PWD #  default is test
#
# KNET_DOCKER_OPTS # custom options to be passed to 'docker run' (in addition to the ones implied by other variables above
#  

dataset_id="$1"

[ "$KNET_HOST_PORT" == "" ] && KNET_HOST_PORT="8080"

[ "$KNET_DOCKER_OPTS" == "" ] && KNET_DOCKER_OPTS="-it"
KNET_DOCKER_OPTS="$KNET_DOCKER_OPTS -p $KNET_HOST_PORT:8080 --name $dataset_id"
[ "$KNET_HOST_DATA_DIR" == "" ] || KNET_DOCKER_OPTS="$KNET_DOCKER_OPTS --volume $KNET_HOST_DATA_DIR:/root/knetminer-data"
[ "$KNET_HOST_CONFIG_DIR" == "" ] || KNET_DOCKER_OPTS="$KNET_DOCKER_OPTS --volume $KNET_HOST_CONFIG_DIR:/root/knetminer-config"
[ "$KNET_HOST_CODEBASE_DIR" == "" ] || KNET_DOCKER_OPTS="$KNET_DOCKER_OPTS --volume $KNET_HOST_CODEBASE_DIR:/root/knetminer-build/knetminer"
[ "$KNET_HOST_DATASET_DIR" == "" ] || KNET_DOCKER_OPTS="$KNET_DOCKER_OPTS --volume $KNET_HOST_DATASET_DIR:/root/knetminer-build/knetminer/species"

[ "$MAVEN_ARGS" == "" ] && MAVEN_ARGS="-Pdocker" 

if [ "$KNET_IS_NEO4J" != "" ]; then 
	MAVEN_ARGS="$MAVEN_ARGS -Pneo4j"
	# As you see all the Maven properties used in the POMs (and, from there in other files) can be overridden from
	# the maven command line. So, this is a way to customise things like local installations, and doing so while
	# keeping maven-settings.xml independent on the local environment (depending only on the dataset).
	# 
	[ "$KNET_NEO4J_URL" == "" ] || MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.boltUrl=$KNET_NEO4J_URL"
	[ "$KNET_NEO4J_USER" == "" ] || MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.user=$KNET_NEO4J_USER"
	[ "$KNET_NEO4J_PWD" == "" ] || MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.password=$KNET_NEO4J_PWD"
fi

[ "$MAVEN_ARGS" == "" ] || KNET_DOCKER_OPTS="$KNET_DOCKER_OPTS --env MAVEN_ARGS"
export MAVEN_ARGS

set -ex
docker run $KNET_DOCKER_OPTS knetminer/knetminer "species/$dataset_id"
