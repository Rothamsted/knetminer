#!/usr/bin/env bash
#

# Helper for the host, to run a specie/dataset instance of the Knetminer Docker container.
#
# See https://github.com/Rothamsted/knetminer/wiki/8.-Docker for details.
#

set -e

## Some defaults
#
dataset_id=''
dataset_dir=''
host_port=8080
image_version='5.6-RC'

# Our defaults tell the JVM to use a quota of the RAM passed to the container. 
# UseCompressedOops is needed due to: https://stackoverflow.com/a/58121363/529286
#
JAVA_TOOL_OPTIONS=${JAVA_TOOL_OPTIONS:-'-XX:MaxRAMPercentage=90.0 -XX:+UseContainerSupport -XX:-UseCompressedOops'}


# Parse the CLI options
# 
while [[ $# -gt 0 ]]
do
	opt_name="$1"
  case $opt_name in
  	# WARNING: these '--:' special markers are used by --help to generate explanations about the available
  	# options.
  	#--: The dataset directory in the host (see the documentation for details).
  	--dataset-dir)
  		dataset_dir="$2"; shift 2;;
  	#--: The host port to which the container HTTP port is mapped (default is 8080).
  	--host-port)
  		host_port="$2"; shift 2;;
  	#--: Passed to Docker, as --name, useful to manage running containers. 
  	--container-name)
  	  container_name="$2"; shift 2;;
  	#--: Passed to Docker as --memory (eg, --container-memory 12G).
  	--container-memory)
  	  container_memory="$2"; shift 2;;
  	#--: Passed to Docker as --memory-swap (eg, --memory-swap 16G).
  	--container-memory-swap)
  	  container_memory_swap="$2"; shift 2;;
  	#--: Docker is invoked with --detach, ie, container is run in background and this script ends immediately 
  	#--: (it's useful to use it with --container-name)
  	--detach)
  		is_container_detach=true; shift;;
  	#--: the config file, relative to --dataset-dir (default is config/config.yml)
  	--config-file)
  		config_file="$2"; shift;;
  	#--: Identifies the Docker image version you want to use (eg, --image-version test, 
  	#--: will pick ghcr.io/rothamsted/knetminer:test). Default is 'latest' for the latest version in github, or a given 
  	#--: version, depending on the release distribution you are using.
  	--image-version)
  		image_version="$2"; shift 2;;
  	#--: yields this help output and then exits with 1
  	--help|-h)
  		echo -e "\n"
  		# Report the options
  		cat <<EOT
================ The Knetminer Launcher ================ 

Runs a Knteminer instance based on Docker. 
For details see https://github.com/Rothamsted/knetminer/wiki/8.-Docker	

=== Options:
	
EOT

			egrep -i '(#\-\-:|\-\-[a-z].+\))' "$0" | sed s/'^\s*#\-\-:/#/g' | sed -E s/'^\s+(\-\-.+)\)'/'\1\n'/g

			cat <<EOT

=== Variables that affects this script:

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
[ "$container_memory_swap" == "" ] || DOCKER_OPTS="$DOCKER_OPTS --memory-swap $container_memory_swap"


# If neither --dataset-dir nor --dataset-id are specified, then you want the continer default aratiny 
if [ "$dataset_dir" == '' ]; then
	[ "$dataset_id" == '' ] && dataset_id='aratiny'
else
	DOCKER_OPTS="$DOCKER_OPTS --volume $dataset_dir:/root/knetminer-dataset"
fi
		
[[ -z "$config_file" ]] || \
  JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -Dknetminer.api.configFilePath=\"/root/knetminer-dataset/$config_file\"" 


echo -e "\n"

[[ -z "JAVA_TOOL_OPTIONS" ]] || { 
	echo -e "exporting JAVA_TOOL_OPTIONS: $JAVA_TOOL_OPTIONS"
	export JAVA_TOOL_OPTIONS
	DOCKER_OPTS="$DOCKER_OPTS --env JAVA_TOOL_OPTIONS"
}

set -x
docker run $DOCKER_OPTS ghcr.io/rothamsted/knetminer:$image_version
