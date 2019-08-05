

## Parse the CLI options
# 

# after some defaults
dataset_id=''
dataset_dir=''
host_port=8080
image_version='latest'

while [[ $# -gt 0 ]]
do
	opt_name="$1"
  case $opt_name in
  	# WARNING: these '--:' special markers are used by --help to generate explanations about the available
  	# options.
  	#--: The dataset directory in the host (see the documentation for details).
  	--dataset-dir)
  		dataset_dir="$2"; shift 2;;
  	#--: If non-null, the dataset settings are taken from the Knetminer codebase in the container, 
  	#--: under species/$dataset-id (see the documentation for details).
  	--dataset-id)
  		dataset_id="$2"; shift 2;;
  	#--: The host port to which the container HTTP port is mapped.
  	--host-port)
  		host_port="$2"; shift 2;;
  	#--: Enable Neo4j mode (see the documentation for details).
  	--with-neo4j)
  		is_neo4j=true; shift;;
  	#--: Neo4j URL (eg, bolt://someserver:7687).
  	--neo4j-url)
  		neo4j_url="$2"; shift 2;;
  	#--: Neo4j user.
  	--neo4j-user)
  		neo4j_user="$2"; shift 2;;
  	#--: Neo4j password.
  	--neo4j-pwd)
  		neo4j_pwd="$2"; shift 2;;
  	#--: Passed to Docker, as --name, useful to manage running containers. 
  	--container-name)
  	  container_name="$2"; shift 2;;
  	#--: Passed to Docker as --memory (eg, container_memory 12G).
  	--container-memory)
  	  container_memory="$2"; shift 2;;
  	#--: Identifies the Docker image version you want to use (eg, --image-version test, 
  	#--: will pick knetminer/knetminer:test). Default is 'latest' (which corresponds to '').
  	--image-version)
  		image_version="$2"; shift 2;;
  	--help)
  		echo -e "\n"
  		egrep '(#\-\-:|\-\-.+\))' "$0" | sed s/'#\-\-:/#/g' | sed -E s/'(^\s+\-\-.+)\)'/'\1'/g
  		echo -e "\n\tFor details see https://github.com/Rothamsted/knetminer/wiki/8.-Docker\n"
  		exit 1;;
  	*)
  		shift;;
	esac
done
  		

# 
# Helper for the host, to run a specie/dataset instance of the Knetminer Docker container. 
# 
# TODO: Rewrite all the comments!

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

## Build up the docker command
#
[ "$DOCKER_OPTS" == "" ] && DOCKER_OPTS="-it"
DOCKER_OPTS="$DOCKER_OPTS -p $host_port:8080"
[ "$container_name" == "" ] || DOCKER_OPTS="$DOCKER_OPTS --name $container_name"
[ "$container_memory" == "" ] || DOCKER_OPTS="$DOCKER_OPTS --memory $container_memory"

if [ "$dataset_dir" == '' ]; then
	[ "$dataset_id" == '' ] && dataset_id='aratiny'
else
	DOCKER_OPTS="$DOCKER_OPTS --volume $dataset_dir:/root/knetminer-dataset"
fi
	
[ "$MAVEN_ARGS" == "" ] && MAVEN_ARGS="-Pdocker" 

if [ "$is_neo4j" != "" ]; then 
	MAVEN_ARGS="$MAVEN_ARGS -Pneo4j"
	# As you see all the Maven properties used in the POMs (and, from there in other files) can be overridden from
	# the maven command line. So, this is a way to customise things like local installations, and doing so while
	# keeping maven-settings.xml independent on the local environment (depending only on the dataset).
	# 
	[ "$neo4j_url" == "" ] || MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.boltUrl=$neo4j_url"
	[ "$neo4j_user" == "" ] || MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.user=$neo4j_user"
	[ "$neo4j_pwd" == "" ] || MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.password=$neo4j_pwd"
fi

[ "$MAVEN_ARGS" == "" ] || DOCKER_OPTS="$DOCKER_OPTS --env MAVEN_ARGS"
export MAVEN_ARGS

[ "$JAVA_TOOL_OPTIONS" == "" ] && JAVA_TOOL_OPTIONS="-XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -XX:MaxRAMFraction=1"

DOCKER_OPTS="$DOCKER_OPTS --env JAVA_TOOL_OPTIONS"

echo -e "\n"
echo "MAVEN_ARGS:" $MAVEN_ARGS
echo "JAVA_TOOL_OPTIONS:" $JAVA_TOOL_OPTIONS
set -ex
docker run $DOCKER_OPTS knetminer/knetminer:$image_version "$dataset_id"
