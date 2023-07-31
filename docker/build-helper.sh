#!/usr/bin/env bash
#
# A Docker-related Knetminer build helper
# 
# This is used in Dockerfile to complete the build of the main Knetminer image.

# When this script is used during Docker image build, it does simple things, like setting up 
# Tomcat configuration parameters.
#

# The script is designed to be run outside Docker build and, in that case, it also takes care of copying
# .war files ot a target Tomcat home.  
#
if [[ "$1" == '--help' ]] || [[ "$1" == '-h' ]]; then
	cat <<EOT
	
	
	Syntax: $(basename $0) [--help|-h] [tomcat-home-dir] [new-tomcat-manager-password]

Builds the Knetminer .war applications against Docker or an host-based Tomcat instance.
See my source and https://github.com/Rothamsted/knetminer/wiki/8.-Docker for details.

EOT
	exit 1
fi

set -e
cd "`dirname "$0"`"
mydir=`pwd`

# --- Command line parameters
#
# Where the Tomcat server is installed.
knet_tomcat_home=${1:-$CATALINA_HOME} 
# If set, the 'tomcat' user in the Tomcat Manager application will be enabled with this password.  
knet_tomcat_pwd="$2" 


is_container_mode=`[[ -e /root/build-helper.sh ]] && echo true || echo false`

echo -e "\n\n\tDeploying Knetminer via build-helper.sh, working "
`$is_container_mode` && echo 'inside the Docker container' || echo 'as standalone'
echo "\n" 

if `$is_container_mode`; then
	touch /etc/crontab /etc/cron*/*
fi


if ! `$is_container_mode`; then
	
	# Move from the location of this script to the root of the Knetminer codebase 
	cd ..

	echo -e "\n  Copying web service WAR to Tomcat\n"

	if [[ ! -e aratiny/aratiny-ws/target/aratiny-ws.war ]]; then
		echo -e "\n\n\tERROR: aratiny-ws.war not found, you need to build Knetminer before running this build\n"
		exit 1
	fi
	
 	cp -f aratiny/aratiny-ws/target/aratiny-ws.war "$knet_tomcat_home/webapps/ws.war"


	echo -e "\n  Copying the client WAR to Tomcat\n"

	if [[ ! -e ./aratiny/aratiny-client/target/knetminer-aratiny.war ]]; then
		echo -e "\n\n\tERROR: knetminer-aratiny.war not found, you need to build Knetminer before running this build\n"
		exit 1
	fi

 	cp -f ./aratiny/aratiny-client/target/knetminer-aratiny.war "$knet_tomcat_home/webapps/client.war"

else

	echo -e "\n  Removing cache files from default dataset dir on the container\n"
	./dataset-cleanup.sh /root/knetminer-dataset
	
	#find "$dataset_dir/data" \( -depth 1 -and -not -name 'knowledge-network.oxl' \) -exec rm -Rf \{\} \; 

fi


# ---- Deal with Tomcat Manager ---

# If the user has given ($knet_tomcat_pwd), changes the default tomcat-users.xml by enabling the 
# 'tomcat' user with the given password. This Might be Useful during dev, to inspect the web server status
# 
if [[ ! -z "$knet_tomcat_pwd" ]] && [ ! -e ./tomcat-users.xml.knetminer-bkp ]; then

  cat <<EOT
	Enabling Tomcat Management app
  
WARNING: Since Tomcat 10.11, the manager IS NOT included in the Docker image, since this and other
default apps are put into <tomcat-home>/webapps.dist. Also, you'll need to edit the manager's context.xml
to allow for connections from outside Docker.

EOT

  cd "$knet_tomcat_home/conf"
  mv -f tomcat-users.xml tomcat-users.xml.knetminer-bkp
  cat <<EOT >tomcat-users.xml
<tomcat-users xmlns="http://tomcat.apache.org/xml"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://tomcat.apache.org/xml tomcat-users.xsd"
              version="1.0">
<role rolename="tomcat"/>
	<role rolename="manager-gui"/>
  <user username="tomcat" password="$knet_tomcat_pwd" roles="tomcat,manager-gui"/>
</tomcat-users>
EOT
fi

echo -e "\n\n\tBuild finished\n"
