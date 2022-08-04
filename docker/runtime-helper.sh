#!/usr/bin/env bash
#
# The Dockerfile runtime helper. 
#
# This is used by the Knetminer container as ENTRYPOINT. It does some runtime setup operations and then starts
# the Tomcat server, which contains the Knetminer .war deployed during the Docker build.
# 
# If nothing is given to the 'docker run' command, the instance will run with a small demo dataset, else the 
# latter will be overridden by a host real configuration (see docker-run.sh and 
# https://github.com/Rothamsted/knetminer/wiki/8.-Docker).   
# 
# This script is also designed to start a fully-functional Knetminer environment deployed in a Tomcat container (usually, 
# via build-helper.sh) directly from an host, without Docker in between.
#
set -e

# --- Command line parameters

if [[ "$1" == '--help' ]] || [[ "$1" == '-h' ]]; then
	cat <<EOT
	
	
	Syntax: $(basename $0) [--help|-h] [--deploy-only] [tomcat-home-dir]

	Runs a Knetminer instance against a dataset, either from the Knetminer Docker container or from your own location.
	See my source and https://github.com/Rothamsted/knetminer/wiki/8.-Docker for details.

EOT
	exit 1
fi

if [ "$1" == '--deploy-only' ]; then
	is_deploy_only=true
	shift
fi

cd "`dirname "$0"`"
mydir="`pwd`"


# Where the Tomcat server is installed.
# Passing '' explicitly '' means don't run the server, just build everything (might be useful to run this script
# in your environment, out of Docker).
knet_tomcat_home=${1-$CATALINA_HOME} 

is_container_mode=`[[ -e /root/build-helper.sh ]] && echo true || echo false`

echo -e "\n\n\tInitial environment:"
env

# --- Environment
#

# Default Java options inside the container, to tell the JVM to use (almost) all the available memory
# TODO: Future versions shouldn't need UseCompressedOops (https://stackoverflow.com/a/58121363/529286)
#
`$is_container_mode` && \
  export JAVA_TOOL_OPTIONS=${JAVA_TOOL_OPTIONS:-'-XX:MaxRAMPercentage=90.0 -XX:+UseContainerSupport -XX:-UseCompressedOops'}

# ---- Parameters/environment setup ends here
#


# Periodic task used for analytics under AWS
# 
if `$is_container_mode`; then
	if [[ -f "$mydir/.aws/credentials" ]]; then 
		echo -e "\n  Running crond in Docker container\n"
		crontab "$mydir/analytics-cron" 
		crond
		echo -e "\n  crond started\n"
	else
		echo -e "\n  No .aws/credentials found, skipping crond startup\n"
	fi 
else
	echo -e "\n  Skipping crond (running outside Docker)"
fi


# --- And eventually run the server, which will have the ws.war (from the Docker build), the new client .war and the server config.
# 

if [[ ! -z "$is_deploy_only" ]]; then
	echo -e "\n\n\tFiles deployed at '$knet_tomcat_home/webapps/', not running Tomcat because of --deploy-only\n"
	exit
fi

echo -e "\n\n\tRunning the Tomcat server\n"
cd "$knet_tomcat_home/bin" 

./catalina.sh run
echo -e "\n\n\tTomcat Server Stopped, container script has finished\n"
