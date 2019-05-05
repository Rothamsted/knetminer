#!/bin/sh
cd "$(dirname $0)"
mydir="$(pwd)"

knet_cfg_dir=${1:-/root/knetminer-config}
knet_instance_dir=${2:-common/aratiny/aratiny-docker}
knet_tomcat_home=${3-$CATALINA_HOME} # explicit null means don't run the server

knet_web_dir="$knet_cfg_dir/web"
mkdir --parents "$knet_web_dir"


# Now let's create the right config files and copy them on the config dir/volume
#
cd ../aratiny
# We need a copy where we can replace the knetminer test config with the one we need
#
rm -Rf /tmp/aratiny-ws
cp -Rf aratiny-ws /tmp
cd /tmp/aratiny-ws
# We don't need at all the test queries
rm -Rf test/resources/knetminer-config/*.cypher
cp -Rf "$knet_instance_dir/ws/"* test/resources/knetminer-config
mvn -Pdocker --settings "$knet_instance_dir/maven-settings.xml" clean test-compile
# End eventually, deploy the instantiated config files
cp -Rf target/test-classes/knetminer-config/* "$knet_cfg_dir"


# Build the client for this dataset. We use the aratiny client as a blue print, overriding it with 
# dataset-specific files, taken from the configuration, which depends on the dataset volume you mounted.
#
cd "$mydir"
mkdir --parents "$knet_web_dir/client-src"
client_src_dir="$knet_web_dir/client-src"
client_html_dir="$client_src_dir/src/main/webapp/html"
cp -Rf ../aratiny/aratiny-client/* "$client_src_dir"
cp "$knet_cfg_dir/client/*.xml" "$client_html_dir/data"
cp "$knet_cfg_dir/client/*.{jpg,png}" "$client_html_dir/image"
cd "$client_src_dir"
mvn -Pdocker --settings "$knet_cfg_dir/maven-settings.xml" -DskipTests -DskipITs clean package
cp target/knetminer-aratiny.war "$knet_web_dir/client.war" # Tomcat has already a link to this 


# And now run the server!
# $knet_tomcat_home explicitly set to '' allows for using this script out of Docker, to just build a
# client runtime
if [ "$knet_tomcat_home" == '' ]; then
	echo -e "\n\n\tEmpty tomcat home parameter, exiting after build\n"
	exit
fi
cd "$knet_tomcat_home/bin" 
./catalina.sh run
