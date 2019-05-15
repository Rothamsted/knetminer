# This is an example of how to use the *-helper.sh scripts to build the general webapp into 
# a tomcat installation, to build a dataset-specific app into given config/data directories, and
# eventually have something that can be run by our Docker container, passing the created directory
# as a volume. 
#
cd "$(dirname $0)"
mydir="$(pwd)"

cd ../../aratiny/aratiny-docker
settings_dir="$(pwd)"
cd "$mydir"


# Set these as you need
knet_deploy_dir=/tmp
knet_cfg_dir=$knet_deploy_dir/knetminer-config
knet_data_dir=$knet_deploy_dir/knetminer-data
export CATALINA_HOME=/tmp/tomcat
export MAVEN_ARGS="-Pdocker,local-env-ex --settings \"$settings_dir/maven-settings.xml\""


mkdir --parents "$knet_cfg_dir"
mkdir --parents "$knet_data_dir"

wget 'https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/default.oxl' \
		 -O "$knet_data_dir/knowledge-network.oxl"

cat <<EOT

	
	Now you can do things like:

cd ..
./build-helper.sh "$knet_cfg_dir" '' 'tomcat'


	And, after the above:

./runtime-helper.sh "$knet_cfg_dir" '' ''

EOT

