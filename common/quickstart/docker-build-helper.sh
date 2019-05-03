#!/bin/sh
cd "$(dirname $0)"
mydir="$(pwd)"

knet_cfg_dir=${1:-/root/knetminer-config}
knet_tomcat_home=${2:-$CATALINA_HOME}

cd ws
mvn clean package
cp -f target/ws.war "$knet_tomcat_home/webapps"


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
