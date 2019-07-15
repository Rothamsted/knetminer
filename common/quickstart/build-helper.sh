#!/bin/sh
#
# === The Dockerfile build helper ===
# 
# This is used in Dockerfile to build the main Knetminer image.
# It builds a reference server application (aratiny-ws), which works with data and configuration read from
# fixed directoried on the container file system. Later, the corresponding container can be run by mapping 
# those directories to host locations, via Docker volumes (see docker-run.sh).
# 
# This script is designed to build a fully-functional Knetminer distribution either on a Docker container or
# any other host, independently on Docker. In the latter case, you need to pre-install requirements manually
# and to pass the correct parameters to this script (see local-env-ex for details about this case).
#
set -ex
cd "$(dirname $0)"
mydir="$(pwd)"

# --- Command line parameters
#
# Where Knetminer applications takes dataset/specie specific configuration.
knet_cfg_dir=${1:-/root/knetminer-config} 
# Where the Tomcat server is installed.
knet_tomcat_home=${2:-$CATALINA_HOME} 
# If set, the 'tomcat' user in the Tomcat Manager application will be enabled with this password.  
knet_tomcat_pwd="$3" 

# --- Environment
#
# Custom Maven arguments can be provided by the invoker (export MAVEN_ARGS='...') or the Docker image file
# This is usually useful for custom Docker-independent builds, see local-env-ex     
export MAVEN_ARGS=${MAVEN_ARGS:-'-Pdocker'} 


# ---- Parameters/environment setup ends here
#

knet_web_dir="$knet_cfg_dir/web" # web-specific config

echo -e "\n\n\tBuilding Knetminer\n"
mkdir --parents "$knet_web_dir"

# Move from the location of this script to the root of the Knetminer codebase 
cd ../.. 

# ---- Regular full build of the server web reference application (aratiny-ws.war) ----
mvn clean install $MAVEN_ARGS -DskipTests -DskipITs
cd common/aratiny/aratiny-ws
# --- Alternatively, you can enable fast build during debugging
# mvn dependency:resolve
# cd common/aratiny/aratiny-ws
# mvn clean install $MAVEN_ARGS -DskipTests -DskipITs
# ---

# Put it under Tomcat
cp -f target/aratiny-ws.war "$knet_tomcat_home/webapps/ws.war"

# The client's war stays in the configuration directory, linked under Tomcat. This will typically be a dataset/specie 
# specific host volume. This way, the docker runtime script (runtime-helper.sh) can decide if the client has to be 
# rebuilt (eg, based on dates, or user parameters).
#
ln -s -f "$knet_web_dir/client.war" "$knet_tomcat_home/webapps/client.war"


# If the user has given $3 ($knet_tomcat_pwd), changes the default tomcat-users.xml by enabling the 
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
