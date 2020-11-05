#!/bin/sh
#
# === The Dockerfile runtime helper ===
#
# This is used by the Knetminer container as ENTRYPOINT. It takes Knetminer client files from a fixed container
# directory and uses them to run a dataset/specie specific container instance (all datasets leverage the same built
# image). The configuration directory can dynamically be linked to an host location by mapping it as a Docker volume
# (see https://github.com/Rothamsted/knetminer/wiki/8.-Docker).   
# 
# This script is also designed to prepare a fully-functional Knetminer environment in a Tomcat container and start 
# Knetminer from any host, independently on Docker. In the latter case, you need to pre-install requirements manually
# and to pass the correct parameters (see local-env-ex/ for details about this case). The best way to 
# prepare an environment to run this script is builder-helper.sh (which, similarly, can be used either to build a Docker
# container or any other environment).
#
set -e
cd "$(dirname $0)"
mydir="$(pwd)"

# --- Command line parameters

if [ "$1" == '--help' ]; then
	cat <<EOT
	
	
	Syntax: $(basename $0) [--deploy-only|--help] [dataset-id] [dataset-dir] [tomcat-home-dir]

	Runs a Knetminer instance against a dataset, either from the Knetminer Docker container or from your own location.
	See my source and https://github.com/Rothamsted/knetminer/wiki/8.-Docker for details.

EOT
	exit 1
elif [ "$1" == '--deploy-only' ]; then
	is_deploy_only=true
	shift
fi

set -x

echo -e "\n\n\tInitial environment:"
env

# The dataset ID, ie, the settings directory to be found in the codebase, under species/
# If this is omitted, the settings are looked up on the dataset dir.
knet_dataset_id="$1" # In Docker (ie, CMD+ENTRYPOINT), this is aratiny by default

# The dataset directory, where config, data and possibly settings are taken for the dataset that the current
# Knetminer instance is based on. The default is the dataset path in the Docker container, which can be mapped
# to the user's location on the host via Docker volume mappings. 
knet_dataset_dir=${2:-/root/knetminer-dataset}

# Where the Tomcat server is installed.
# Passing '' explicitly '' means don't run the server, just build everything (might be useful to run this script
# in your environment, out of Docker).
knet_tomcat_home=${3-$CATALINA_HOME} 


# --- Environment
#
# Custom Maven arguments can be provided by the invoker (export MAVEN_ARGS='...') or the Docker image file
# This is usually useful for custom Docker-independent builds, see local-env-ex/ 
export MAVEN_ARGS=${MAVEN_ARGS:-'-Pdocker'}

# Default Java options to tell the JVM to use (almost) all the available memory
# TODO: Future versions shouldn't need UseCompressedOops (https://stackoverflow.com/a/58121363/529286)
#
export JAVA_TOOL_OPTIONS=${JAVA_TOOL_OPTIONS:-'-XX:MaxRAMPercentage=90.0 -XX:+UseContainerSupport -XX:-UseCompressedOops'}


# ---- Parameters/environment setup ends here
#


echo -e "\n\n\tUpdating the build environment\n"

for dir in settings config client-src # data/ is expected to be already there
do
	mkdir --parents "$knet_dataset_dir/$dir"
done

cd "$mydir/.."
knet_codebase_dir="$(pwd)"

# --- In this case, copy the original settings from the codebase into the settings dir
if [[ "$knet_dataset_id" != '' ]]; then
	[[ "$knet_dataset_id" == 'aratiny' ]] \
		&& org_settings="$knet_codebase_dir/aratiny/aratiny-docker" \
		|| org_settings="$knet_codebase_dir/datasets/$knet_dataset_id"
	
	if [ ! -d "$org_settings" ]; then
		echo -e "\n\n\tFile $org_settings doesn't exist, check the dataset id '$knet_dataset_id' is correct\n"
		exit 1
	fi
	cp -Rf "$org_settings"/* "$knet_dataset_dir/settings"
fi

# Also we need a working copy of maven-settings.xml, cause this has to be changed by the commands below
# TODO: document this
cp "$knet_dataset_dir/settings/maven-settings.xml" "$knet_dataset_dir/config/actual-maven-settings.xml"

  
# This is a parameter passed to index.jsp, it comes from attributes in basemap.xml
chromosomes_list=$(xmllint --xpath '//genome/chromosome/@number' "$knet_dataset_dir/settings/client/basemap.xml" | sed -E s/'number="([^"]*)"'/'\1'/g)
chromosomes_list=$(echo $chromosomes_list | sed s/'^ '// | sed s/' '/','/g)

# So, now instantiate the right Maven property, if the corresponding placeholder is defined
sed s/'%%knetminer\.chromosomeList%%'/"$chromosomes_list"/ -i "$knet_dataset_dir/config/actual-maven-settings.xml"


# --- Now let's create the right server config files and copy them on the config dir/volume
#
echo -e "\n\n\tBuilding the server-side config\n"

# We need a copy where we can replace the knetminer test config with the one we need
# We're in the knetminer codebase root now
rm -Rf /tmp/aratiny-ws aratiny/aratiny-ws/target
cp -Rf aratiny/aratiny-ws /tmp

# We don't need the test queries used for aratiny, let's remove them from the build location
rm -Rf /tmp/aratiny-ws/src/test/resources/knetminer-dataset/config/neo4j/*.cypher

# And then copy the dataset-specific config to the build place (in /tmp) 
cp -Rf "$knet_dataset_dir/settings/ws/"* /tmp/aratiny-ws/src/test/resources/knetminer-dataset/config

# Eventually, go to the build place and do mvn test-compile. This creates interpolated config files (ie, 
# all the placeholders are instantiated with the values in maven settings or in ancestor POMS).  
cd /tmp/aratiny-ws

# Also, note that this command DOESN'T rebuild the server app, it just prepares some files into target/
mvn $MAVEN_ARGS --settings "$knet_dataset_dir/config/actual-maven-settings.xml" clean test-compile

# And eventually, deploy the instantiated config files
cp -Rf target/test-classes/knetminer-dataset/config/* "$knet_dataset_dir/config"



# ----- Build the client for this dataset. 
#

# We use the aratiny client as a blueprint, overriding it with dataset-specific files, taken from the configuration, 
# which is defined in $knet_instance_dir.
#
echo -e "\n\n\tBuilding the client app\n"

# Finally, dataset-specific sources are placed in the config directory, so you're able to see the from the host
client_src_dir="$knet_dataset_dir/client-src"
client_html_dir="$client_src_dir/src/main/webapp/html"

# Common client files
cd "$knet_codebase_dir"
rm -Rf aratiny/aratiny-client/target
cp -Rf aratiny/aratiny-client/* "$client_src_dir"

# Additions and overridings from the dataset instance-specific dir
cp "$knet_dataset_dir/settings/client/"*.xml "$client_html_dir/data"
for ext in jpg png gif svg tif
do
	# Ignore 'source file doesn't exist'
	cp "$knet_dataset_dir/settings/client/"*.$ext "$client_html_dir/image" || :
done

# The Maven ${knetminer.releaseNotesHtml} placeholder can either be set by Maven settings, or replaced directly by a 
# file. The latter takes priority.
# TODO: this approach replaces the placeholder in one file only. Should we replace it in maven settings too?
#
[ -e "$knet_dataset_dir/settings/client/release_notes.html" ] && \
  sed -e "/\${knetminer.releaseNotesHtml}/{r $knet_dataset_dir/settings/client/release_notes.html" -e 'd}' \
      "$client_html_dir/release.html" -i'' "$client_html_dir/release.html"

# OK, all client files instantiated, now let's build the client from the build dir
cd "$client_src_dir"
mvn $MAVEN_ARGS --settings "$knet_dataset_dir/config/actual-maven-settings.xml" -DskipTests -DskipITs clean package
# Let's copy to Tomcat
cp target/knetminer-aratiny.war "$knet_tomcat_home/webapps/client.war"

# Periodic task used for analytics under AWS
# 
if grep -q "docker" /proc/self/cgroup; then
	if [[ -f "$mydir/.aws/credentials" ]]; then 
		echo -e "\n\n\tRunning crond in Docker container\n"
		crontab $mydir/analytics-cron 
		crond
		echo -e "\ncrond started\n"
	else
		echo -e "\nNo .aws/credentials found, skipping crond startup\n"
	fi 
else
	echo -e "\nSkipping crond (running outside Docker)"
fi


# --- And eventually run the server, which will have the ws.war (from the Docker build), the new client .war and the server config.
# 

if [ "$is_deploy_only" != '' ]; then
	echo -e "\n\n\tFiles deployed at '$knet_tomcat_home/webapps/', not running Tomcat because of --deploy-only\n"
	exit
fi

echo -e "\n\n\tRunning the Tomcat server\n"
cd "$knet_tomcat_home/bin" 

./catalina.sh run
echo -e "\n\n\tTomcat Server Stopped, container script has finished\n"
