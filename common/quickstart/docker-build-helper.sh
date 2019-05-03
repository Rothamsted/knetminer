#!/bin/sh
cd "$(dirname $0)"
mydir="$(pwd)"

knet_cfg_dir=${1:-/root/knetminer-config}
knet_tomcat_home=${2:-$CATALINA_HOME}

knet_web_dir="$knet_cfg_dir/web"

# Build the ws (API) and put it under Tomcat
cd ws
mvn clean install -DskipTests -DskipITs
cp -f target/ws.war "$knet_tomcat_home/webapps"

# The client's war stays in the volume, linked under Tomcat. This way the docker runtime script can decide
# if it has to be rebuilt
#
ln -s "$knet_web_dir/client.war" "$knet_tomcat_home/webapps/client.war"

# Useful during dev
# TODO: disable in production!
cd $knet_tomcat_home/conf
mv -f tomcat-users.xml tomcat-users.xml.org
cat <<EOT >tomcat-users.xml
<tomcat-users xmlns="http://tomcat.apache.org/xml"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://tomcat.apache.org/xml tomcat-users.xsd"
              version="1.0">
<role rolename="tomcat"/>
	<role rolename="manager-gui"/>
  <user username="tomcat" password="tomcat" roles="tomcat,manager-gui"/>
</tomcat-users>
EOT
