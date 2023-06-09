#!/usr/bin/env bash
#

# An helper to build the Knetminer docker image(s).
#

set -e

do_bare=false
docker_tag=latest
docker_tag_bare=latest
do_mvn_clean=true
# Used to be the Docker registry, but we migrated to GH Packages
image_prefix='ghcr.io/rothamsted'

while [[ $# -gt 0 ]]
do
	opt_name="$1"
  case "$opt_name" in
  	# WARNING: these '--:' special markers are used by --help to generate explanations about the available
  	# options.
  	
  	#--: Builds the bare image too
  	--bare)
  		do_bare='true'; shift;;

  	#--: The tag to use to mark the main image (default: latest)
  	--tag)
  		docker_tag="$2"; shift 2;;

  	#--: The tag to mark/use the bare image (default: same as main image)
  	--tag-bare)
  		docker_tag_bare="$2"; shift 2;;
  	
  	#--: Rebuilds on the existing Maven build, doesn't issue 'mvn clean'
  	--no-mvn-clean)
  	 	do_mvn_clean='false'; shift;;
  	
  	#--: yields this help output and then exits with 1
  	--help|-h)
  		cat <<EOT


  Syntax: $(basename $0) <options>

Builds the Knetminer Docker image(s), including rebuilding the .war applications and default dataset
files with the right settings. 
    
See https://github.com/Rothamsted/knetminer/wiki/8.-Docker for details.
	
  Options:

EOT
  		# Report the options
			egrep -i '(#\-\-:|\-\-[a-z].+\))' "$0" | sed s/'\s*#\-\-:/#/g' | sed -E s/'^\s+(\-\-.+)\)'/'\1\n'/g

			cat <<EOT
			
Environment Options:

DOCKER_OPTS:
  additional arguments that can be passed to 'docker build'

MAVEN_ARGS:
  additional argument that can be passed to 'Maven commands'

EOT
  		exit 1;;
  	--*)
			echo -e "\n\n\tERROR: Invalid option '$1', try --help\n"
  		exit 1;;
  	*)
  		shift;;
	esac
done


echo -e "\n\n\tBuilding the Knetminer Docker Image with tag '$docker_tag'\n" 

cd "`dirname "$0"`"
cd ..

# Custom Maven arguments can be provided by the invoker (export MAVEN_ARGS='...') or the Docker image file
# This is usually useful for custom Docker-independent builds, see local-env-ex     
export MAVEN_ARGS=${MAVEN_ARGS:-'-Pdocker --no-transfer-progress --batch-mode'} 

echo -e "\n  Re-building with the right Maven settings\n"
`$do_mvn_clean` && clean_goal=clean || clean_goal=''
mvn $clean_goal install $MAVEN_ARGS -DskipTests -DskipITs

if `$do_bare`; then
	echo -e "\n\  Creating Bare image\n" 
	docker build -t "$image_prefix/knetminer-bare:$docker_tag_bare" $DOCKER_OPTS -f docker/Dockerfile-bare .
fi


echo -e "\n\  Creating image\n"
docker build -t "$image_prefix/knetminer:$docker_tag" --build-arg DOCKER_BARE_TAG="$docker_tag_bare" \
  $DOCKER_OPTS -f docker/Dockerfile .

echo -e "\n\  The End\n" 
