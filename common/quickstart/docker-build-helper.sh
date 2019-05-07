#!/bin/sh
set -ex
cd "$(dirname $0)"
mydir="$(pwd)"

export MAVEN_ARGS=${MAVEN_ARGS:-'-Pdocker'}

knet_cfg_dir=${1:-/root/knetminer-config}
knet_tomcat_home=${2:-$CATALINA_HOME} 
knet_tomcat_pwd="$3"

knet_web_dir="$knet_cfg_dir/web"


echo -e "\n\n\tUpdating base environment\n"
mkdir --parents "$knet_web_dir"
cd ../..
mvn dependency:resolve


# Build the ws (API) and put it under Tomcat
echo -e "\n\n\tBuilding the ws app\n"
cd common/aratiny/aratiny-ws
mvn clean install $MAVEN_ARGS -DskipTests -DskipITs
cp -f target/aratiny-ws.war "$knet_tomcat_home/webapps/ws.war"


# The client's war stays in the volume, linked under Tomcat. This way the docker runtime script can decide
# if it has to be rebuilt
#
ln -s -f "$knet_web_dir/client.war" "$knet_tomcat_home/webapps/client.war"


# Useful during dev
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
