#!/bin/sh

# An helper to build the Knetminer docker image(s).
#

set -e

do_bare='false'

if [ "$1" == '--help' ]; then
	cat <<EOT
	
	
	Syntax: $(basename $0) [--bare] [<docker tag>]

  Builds the Knetminer Docker image, including rebuilding the .war applications and default dataset
  files with the right settings. 
  
  --bare if given, rebuilds the bare image too
  <docker tag> the tag to attach to the image, default is 'latest' 
  
	See https://github.com/Rothamsted/knetminer/wiki/8.-Docker for details.

EOT
	exit 1
elif [ "$1" == '--bare' ]; then
	do_bare='true'
	shift
fi


docker_tag=${1-latest} 


echo -e "\n\n\tBuilding the Knetminer Docker Image with tag '$docker_tag'\n" 

cd "`dirname "$0"`"
cd ..

# Custom Maven arguments can be provided by the invoker (export MAVEN_ARGS='...') or the Docker image file
# This is usually useful for custom Docker-independent builds, see local-env-ex     
export MAVEN_ARGS=${MAVEN_ARGS:-'-Pdocker --no-transfer-progress --batch-mode'} 

echo -e "\n\  Re-building with the right Maven settings\n" 
mvn clean install $MAVEN_ARGS -DskipTests -DskipITs

# Partial and quicker builds, which we use during development, when we know what we're doing
mvn install -pl "!client-base" $MAVEN_ARGS -DskipTests -DskipITs
#mvn install $MAVEN_ARGS -DskipTests -DskipITs

if `$do_bare`; then
	echo -e "\n\  Creating Bare image\n" 
	docker build -t knetminer/knetminer-bare:$docker_tag -f docker/Dockerfile-bare .
fi

echo -e "\n\  Creating image\n" 
docker build -t knetminer/knetminer:$docker_tag -f docker/Dockerfile .

echo -e "\n\  The End\n" 
