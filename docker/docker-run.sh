# Helper for the host, to run a specie/dataset instance of the Knetminer Docker container.
#
# See https://github.com/Rothamsted/knetminer/wiki/8.-Docker for details.
#

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
  	#--: under datasets/$dataset-id (see the documentation for details).
  	--dataset-id)
  		dataset_id="$2"; shift 2;;
  	#--: The host port to which the container HTTP port is mapped.
  	--host-port)
  		host_port="$2"; shift 2;;
  	#--: Passed to Docker, as --name, useful to manage running containers. 
  	--container-name)
  	  container_name="$2"; shift 2;;
  	#--: Passed to Docker as --memory (eg, --container-memory 12G).
  	--container-memory)
  	  container_memory="$2"; shift 2;;
  	#--: Docker is invoked with --detach, ie, container is run in background and this script ends immediately 
  	#--: (it's useful to use it with --container-name)
  	--detach)
  		is_container_detach=true; shift;;
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
  	#--: Identifies the Docker image version you want to use (eg, --image-version test, 
  	#--: will pick knetminer/knetminer:test). Default is 'latest' (which corresponds to '').
  	--image-version)
  		image_version="$2"; shift 2;;
  	#--: yields this help output and then exits with 1
  	--help)
  		echo -e "\n"
  		# Report the options
  		egrep -i '(#\-\-:|\-\-[a-z].+\))' "$0" | sed s/'#\-\-:/#/g' | sed -E s/'(^\s+\-\-.+)\)'/'\1'/g
  		cat <<EOT


	For details see https://github.com/Rothamsted/knetminer/wiki/8.-Docker
	
	=== Variables that affects this script ===

	MAVEN_ARGS: custom options to invoke Maven builds (used to build the front-end (client) WAR and instantiated a 
	configuration from Maven settings). WARNING: if you set your own -P profile option with this, very likely
	you'll need -Pdocker. You might need -Pneo4j too.  
	
	Example of how to set custom embeddable layout (GeneStack option)
	export MAVEN_ARGS="-Dknetminer.ui.embeddableLayout=true"

	DOCKER_OPTS: custom options to be passed to 'docker run' (in addition to the ones implied by other variables above).
	If you don't set this, the default is '-it'.
	
	JAVA_TOOL_OPTIONS: custom JVM options. The default for this tells the JVM in the container to use all the available
	RAM (see my source for details).
	
EOT
  		exit 1;;
  	--*)
			echo -e "\n\n\tERROR: Invalid option '$1', try --help\n"
  		exit 1;;
  	*)
  		shift;;
	esac
done
  		

## Build up the docker command
#
[ "$DOCKER_OPTS" == "" ] && DOCKER_OPTS="-it"
[ "$is_container_detach" == '' ] || DOCKER_OPTS="$DOCKER_OPTS --detach"
DOCKER_OPTS="$DOCKER_OPTS -p $host_port:8080"
[ "$container_name" == "" ] || DOCKER_OPTS="$DOCKER_OPTS --name $container_name"
[ "$container_memory" == "" ] || DOCKER_OPTS="$DOCKER_OPTS --memory $container_memory"

# If neither --dataset-dir nor --dataset-id are specified, then you want the continer default aratiny 
if [ "$dataset_dir" == '' ]; then
	[ "$dataset_id" == '' ] && dataset_id='aratiny'
else
	DOCKER_OPTS="$DOCKER_OPTS --volume $dataset_dir:/root/knetminer-dataset"
fi
	
# Neo4j mode
if [ "$is_neo4j" != '' ]; then
	[[ "$MAVEN_ARGS" =~ '-P' ]] || MAVEN_ARGS="$MAVEN_ARGS -Pdocker"
	MAVEN_ARGS="$MAVEN_ARGS -Pneo4j"
	# As you see, all the Maven properties used in the POMs (and, from there in other files) can be overridden from
	# the maven command line. So, this is a way to customise things like local installations, and doing so while
	# keeping maven-settings.xml independent on the local environment (depending only on the dataset).
	# 
	[ "$neo4j_url" == "" ] || MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.boltUrl=$neo4j_url"
	[ "$neo4j_user" == "" ] || MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.user=$neo4j_user"
	[ "$neo4j_pwd" == "" ] || MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.password=$neo4j_pwd"
fi

# Default MAVEN_ARGS is -Pdocker. If no '-P' is used, this profile is added automatically.
# Typically you DO WANT this.
# 
# Default JAVA_TOOL_OPTIONS is:
#
#   -XX:MaxRAMPercentage=90.0 -XX:+UseContainerSupport -XX:+UseContainerSupport -XX:-UseCompressedOops
#   
# which tells the JVM to use a quota of the RAM passed to the container. 
# UseCompressedOops is needed due to: https://stackoverflow.com/a/58121363/529286
#
echo -e "\n"
for env_var in MAVEN_ARGS JAVA_TOOL_OPTIONS
do
	[[ "${!env_var}" == '' ]] && continue;
	export $env_var
	DOCKER_OPTS="$DOCKER_OPTS --env $env_var"
	echo "export $env_var=\"${!env_var}\"" 
done

set -ex
docker run $DOCKER_OPTS knetminer/knetminer:$image_version "$dataset_id"
