#!/bin/sh
#
# === The Dockerfile runtime helper ===
#
# This is used by the Knetminer container as ENTRYPOINT. It takes Knetminer client files from a fixed container
# directory and uses them to run a dataset/specie specific container instance (all datasets leverage the same built
# image). The configuration directory can dynamically be linked to an host location by mapping it as a Docker volume
# (see docker-run.sh).   
# 
# This script is designed to run a fully-functional Knetminer container or any to start Knetminer from any other host, 
# independently on Docker. In the latter case, you need to pre-install requirements manually
# and to pass the correct parameters to this script (see local-env-ex for details about this case). The best way to 
# prepare an environment to run this script is builder-helper.sh (which can be used either to build a Docker container 
# or any other environment).
#
set -ex
cd "$(dirname $0)"
mydir="$(pwd)"

# --- Command line parameters
# Where Knetminer applications places dataset/specie specific configuration.
# This can be mapped to some host location (via Docker volumes), so that you can see the configuration that
# this script (ie, the Knetminer container) creates (as explained for the next parameter).
# The Docker container invokes this script with $1 = "", so the confi dir will be the default set here.
knet_cfg_dir=${1:-/root/knetminer-config}
# This contains dataset-specific configuration files, which are used at runtime to build a particular instance.
# Usually it points to one of our directories under <knetminer-codebase>/species. All those directories 
# are expected to have the same structure (see the documentation for details).
# Using the files in this location, this scripts creates a final dataset-specific configuration (for both the Knteminer
# server and client applications) into $knet_cfg_dir
knet_instance_dir=${2:-common/aratiny/aratiny-docker}
# Where the Tomcat server is installed.
# Passing '' explicitly '' means don't run the server, just build everything (might be useful to run this script
# in your environment, out of Docker).
knet_tomcat_home=${3-$CATALINA_HOME} 

# --- Environment
#
# Custom Maven arguments can be provided by the invoker (export MAVEN_ARGS='...') or the Docker image file
# This is usually useful for custom Docker-independent builds, see local-env-ex
export MAVEN_ARGS=${MAVEN_ARGS:-'-Pdocker'}

# ---- Parameters/environment setup ends here
#

echo -e "\n\n\tUpdating base environment\n"
knet_web_dir="$knet_cfg_dir/web"
mkdir --parents "$knet_web_dir"
# Install just the ancestor POMs, in case they changed wrt the (image) defaults. 
for dir in '../..' common aratiny
do
	cd $dir
	mvn $MAVEN_ARGS -N install
done

# --- Have a copy of maven settings on the config dir, where they can undergo some instantiation
# 
cd "$mydir/../.." # from the location of this script to the codebase root
cp "$knet_instance_dir/maven-settings.xml" "$knet_cfg_dir"

# This is a parameter passed to index.jsp, it comes from attributes in basemap.xml
chromosomes_list=$(xmllint --xpath '//genome/chromosome/@number' "$knet_instance_dir/client/basemap.xml" | sed -E s/'number="([^"]*)"'/'\1'/g)
chromosomes_list=$(echo $chromosomes_list | sed s/'^ '// | sed s/' '/','/g)

# So, now instantiate the right Maven property, if the corresponding placeholder is defined
sed s/'%%knetminer\.chromosomeList%%'/"$chromosomes_list"/ -i "$knet_cfg_dir/maven-settings.xml"


# --- Now let's create the right server config files and copy them on the config dir/volume
#
echo -e "\n\n\tBuilding the server-side config\n"
# We need a copy where we can replace the knetminer test config with the one we need
# We're in the knetminer codebase root now
rm -Rf /tmp/aratiny-ws
cp -Rf common/aratiny/aratiny-ws /tmp
# We don't need the test queries used for aratiny, let's remove them from the build location
rm -Rf /tmp/aratiny-ws/src/test/resources/knetminer-config/neo4j/*.cypher
# And then copy the dataset-specific config to the build place (in /tmp) 
cp -Rf "$knet_instance_dir/ws/"* /tmp/aratiny-ws/src/test/resources/knetminer-config
# Eventually, go to the build place and do mvn test-compile. This creates interpolated config files (ie, 
# all the placeholders are instantiated with the values in maven settings or in ancestor POMS).  
cd /tmp/aratiny-ws
# Also, note that this command DOESN'T rebuild the server app, it just preparse some files into target/
mvn $MAVEN_ARGS --settings "$knet_cfg_dir/maven-settings.xml" clean test-compile
# End eventually, deploy the instantiated config files
cp -Rf target/test-classes/knetminer-config/* "$knet_cfg_dir"


# ----- Build the client for this dataset. 
# We use the aratiny client as a blueprint, overriding it with dataset-specific files, taken from the configuration, 
# which is defined in $knet_instance_dir.
#
echo -e "\n\n\tBuilding the client app\n"
# Final, dataset-specific sources are placed in the config directory, so you're able to see the from the host
# (again, if there are mapped via Docker volumes).
mkdir --parents "$knet_web_dir/client-src"
client_src_dir="$knet_web_dir/client-src"
client_html_dir="$client_src_dir/src/main/webapp/html"
cd "$mydir/../.." # We're back on the knetminer codebase's root
# Common client files
cp -Rf common/aratiny/aratiny-client/* "$client_src_dir"
# Additions and overrides from the dataset instance-specific dir
cp "$knet_instance_dir/client/"*.xml "$client_html_dir/data"
for ext in jpg png gif svg tif
do
	# Ignore 'source file doesn't exist'
	cp "$knet_instance_dir/client/"*.$ext "$client_html_dir/image" || :
done

# The Maven ${knetminer.releaseNotesHtml} placeholder can either be set by Maven settings, or replaced directly by a 
# file. The latter takes priority.
# TODO: this approach replaces the placeholder in one file only. Should we replace it in maven settings too?
#
[ -e "$knet_instance_dir/client/release_notes.html" ] && \
  sed -e "/\${knetminer.releaseNotesHtml}/{r $knet_instance_dir/client/release_notes.html" -e 'd}' \
      "$client_html_dir/release.html" -i'' "$client_html_dir/release.html"

# OK, all client files instantiated, now let's build the client from the build dir
cd "$client_src_dir"
mvn $MAVEN_ARGS --settings "$knet_cfg_dir/maven-settings.xml" -DskipTests -DskipITs clean package
cp target/knetminer-aratiny.war "$knet_web_dir/client.war" # Tomcat has already a link to this

# --- And eventually run the server, which will point to the correct server .war, client .war and server config.
# $knet_tomcat_home can explicitly be set to '' by scripts running out of Docker. This will tell us that you just want
# to build the runtime, but not launch Tomcat.
# 
if [ "$knet_tomcat_home" == '' ]; then
	echo -e "\n\n\tEmpty tomcat home parameter, exiting after build\n"
	exit
fi
echo -e "\n\n\tRunning the Tomcat server\n"
cd "$knet_tomcat_home/bin" 
./catalina.sh run
echo -e "\n\n\tTomcat Server Stopped, container script has finished\n"
