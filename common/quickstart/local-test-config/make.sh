# This is an example of how to use the *-helper.sh scripts to build the general webapp into 
# a tomcat installation, to build a dataset-specific app into given config/data directories, and
# eventually have something that can be run by our Docker container, passing the created directory
# as a volume. 
#

# Set these as you need
knet_deploy_dir=/tmp
knet_cfg_dir=$knet_deploy_dir/knetminer-config
knet_data_dir=$knet_deploy_dir/knetminer-data
export CATALINA_HOME=/tmp/tomcat

mkdir --parents "$knet_cfg_dir"
mkdir --parents "$knet_data_dir"

#cp ./maven-settings.xml "$knet_cfg_dir"
wget 'https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/default.oxl' \
		 -O "$knet_data_dir/knowledge-network.oxl"

export MAVEN_OPTS="-Dknetminer.configDir=/tmp/$knet_cfg_dir -Dknetminer.dataDir=/tmp/$knet_data_dir"

cat <<EOT

	
	Now you can do things like:

cd ..
./docker-build-helper.sh "$knet_cfg_dir" "$tomcat_home"


	And, after the above:

./docker-runtime-helper.sh "$knet_cfg_dir" ''

EOT

