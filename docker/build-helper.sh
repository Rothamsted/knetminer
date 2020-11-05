#!/bin/sh
#
# === The Dockerfile build helper ===
# 
# This is used in Dockerfile to build the main Knetminer image.
# It builds a reference server application (aratiny-ws), which works with data and configuration read from
# fixed directories on the container file system. Later, the corresponding container can be run by mapping 
# those directories to host locations, via Docker volumes (see docker-run.sh).
# 
# This script is designed to build a fully-functional Knetminer distribution either on a Docker container or
# any other host, independently on Docker. In the latter case, you need to pre-install requirements manually
# and to pass the correct parameters to this script (see local-env-ex/ for details about this case).
#
# NOTE: this script builds knetminer by issuing "mvn install", WITHOUT install, that's up to you, if you need it. 
#
if [ "$1" == '--help' ]; then
	cat <<EOT
	
	
	Syntax: $(basename $0) [--help] [tomcat-home-dir] [new-tomcat-manager-password]

	Builds the Knetminer .war applications.
	See my source and https://github.com/Rothamsted/knetminer/wiki/8.-Docker for details.

EOT
	exit 1
fi

set -ex
cd "$(dirname $0)"
mydir="$(pwd)"

# --- Command line parameters
#
# Where the Tomcat server is installed.
knet_tomcat_home=${1:-$CATALINA_HOME} 
# If set, the 'tomcat' user in the Tomcat Manager application will be enabled with this password.  
knet_tomcat_pwd="$2" 

# --- Environment
#
# Custom Maven arguments can be provided by the invoker (export MAVEN_ARGS='...') or the Docker image file
# This is usually useful for custom Docker-independent builds, see local-env-ex     
export MAVEN_ARGS=${MAVEN_ARGS:-'-Pdocker'} 


# ---- Parameters/environment setup ends here
#

echo -e "\n\n\tBuilding Knetminer\n"

# Move from the location of this script to the root of the Knetminer codebase 
cd ..

# ---- Regular full build of the server web reference application (aratiny-ws.war) ----
mvn install $MAVEN_ARGS -DskipTests -DskipITs
cd aratiny/aratiny-ws
# --- Alternatively, you can enable fast build during debugging
# mvn dependency:resolve
# cd aratiny/aratiny-ws
# mvn install $MAVEN_ARGS -DskipTests -DskipITs
# ---

# Put it under Tomcat
cp -f target/aratiny-ws.war "$knet_tomcat_home/webapps/ws.war"

# And also put the test OXL in place
mkdir --parents /root/knetminer-dataset/data
cp -f target/dependency/ara-tiny.oxl /root/knetminer-dataset/data/knowledge-network.oxl


# The client is rebuilt by the container, cause its files need to be instantiated with the dataset-specific settings. 


# If the user has given ($knet_tomcat_pwd), changes the default tomcat-users.xml by enabling the 
# 'tomcat' user with the given password. This Might be Useful during dev, to inspect the web server status
# 
if [ "$knet_tomcat_pwd" != '' ] && [ ! -e ./tomcat-users.xml.knetminer-bkp ]; then
  echo -e "\n\n\tEnabling Tomcat Management app\n"
  cd $knet_tomcat_home/conf
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
