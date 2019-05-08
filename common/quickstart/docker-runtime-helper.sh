#!/bin/sh
set -ex
cd "$(dirname $0)"
mydir="$(pwd)"

export MAVEN_ARGS=${MAVEN_ARGS:-'-Pdocker'}

knet_cfg_dir=${1:-/root/knetminer-config}
knet_instance_dir=${2:-common/aratiny/aratiny-docker}
knet_tomcat_home=${3-$CATALINA_HOME} # explicit null means don't run the server

echo -e "\n\n\tUpdating base environment\n"
knet_web_dir="$knet_cfg_dir/web"
mkdir --parents "$knet_web_dir"
for dir in '../..' common aratiny
do
	cd $dir
	mvn $MAVEN_ARGS -N install
done

# Now let's create the right config files and copy them on the config dir/volume
#
echo -e "\n\n\tBuilding the server-side config\n"
# We need a copy where we can replace the knetminer test config with the one we need#
rm -Rf /tmp/aratiny-ws
cp -Rf aratiny-ws /tmp
# We don't need at the test queries
rm -Rf test/resources/knetminer-config/*.cypher
cd "$mydir/../.."
cp -Rf "$knet_instance_dir/ws/"* /tmp/aratiny-ws/src/test/resources/knetminer-config
# Have a copy of maven settings on the config dir too, as a reference and to ease following operations
cp "$knet_instance_dir/maven-settings.xml" "$knet_cfg_dir"
cd /tmp/aratiny-ws
mvn $MAVEN_ARGS --settings "$knet_cfg_dir/maven-settings.xml" clean test-compile
# End eventually, deploy the instantiated config files
cp -Rf target/test-classes/knetminer-config/* "$knet_cfg_dir"


# Build the client for this dataset. We use the aratiny client as a blue print, overriding it with 
# dataset-specific files, taken from the configuration, which depends on the dataset volume you mounted.
#
echo -e "\n\n\tBuilding the client app\n"
mkdir --parents "$knet_web_dir/client-src"
client_src_dir="$knet_web_dir/client-src"
client_html_dir="$client_src_dir/src/main/webapp/html"
cd "$mydir/../.."
cp -Rf common/aratiny/aratiny-client/* "$client_src_dir"
cp "$knet_instance_dir/client/"*.xml "$client_html_dir/data"
for ext in jpg png gif svg tif
do
	# Ignore 'source file doesn't exist'
	cp "$knet_instance_dir/client/"*.$ext "$client_html_dir/image" || :
done

# The Maven placeholder can either be set by settings, or replaced directly by a file, le latter taking
# priority.
# TODO: this approach replaces the placeholder in one file only. Should we replace it in maven settings?
#
[ -e "$knet_instance_dir/client/release_notes.html" ] && \
  sed -e "/\${knetminer.releaseNotesHtml}/{r $knet_instance_dir/client/release_notes.html" -e 'd}' \
      "$client_html_dir/release.html" -i'' "$client_html_dir/release.html"

cd "$client_src_dir"
mvn $MAVEN_ARGS --settings "$knet_cfg_dir/maven-settings.xml" -DskipTests -DskipITs clean package
cp target/knetminer-aratiny.war "$knet_web_dir/client.war" # Tomcat has already a link to this


# And now run the server!
# $knet_tomcat_home explicitly set to '' allows for using this script out of Docker, to just build a
# client runtime
if [ "$knet_tomcat_home" == '' ]; then
	echo -e "\n\n\tEmpty tomcat home parameter, exiting after build\n"
	exit
fi
echo -e "\n\n\tRunning che server\n"
cd "$knet_tomcat_home/bin" 
./catalina.sh run
echo -e "\n\n\tServer Stopped\n"

