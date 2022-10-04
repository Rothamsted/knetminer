# This makes a sample standalone Knetminer, which use the same *-helper.sh scripts that are used whitin
# Docker to run Knetminer in Tomcat installation that is running directly on the host (ie, the machine
# you run this script from). This is to give an idea of the fact Knetminer is designed independent on the
# environment it runs (though Docker is the default/preferred/recommended). 
#
# WARNING: you should run me with 'source make.sh', in order to keep env vars I define. 
#

set -e
echo -e "\n\n  Creating the standalone sample app\n"


mydir=`dirname "$0"`
cd "$mydir"
mydir="`pwd`"

cd "$mydir/../.." # codebase's root
knetdir="`pwd`"

echo -e "\nCreating the configuration\n"

knet_dataset_dir=/tmp/aratiny-dataset
docker/dataset-init.sh "$knet_dataset_dir"
cp -Rf "$mydir/config" "$knet_dataset_dir"



echo -e "\nDeploying the aratiny dataset\n"

oxl_src=aratiny/aratiny-ws/target/dependency/poaceae-sample.oxl
if [[ ! -e "$oxl_src" ]]; then
  echo -e "\nSample data file \"$knetdir/$oxl_src\" not found, please build knetminer before running me\n"
	exit 1
fi

cp -Rf "$oxl_src" "$knet_dataset_dir/data/knowledge-network.oxl"


echo -e "\nDeploying Knetminer into Tomcat\n"

tomcat_home=${1-$CATALINA_HOME}
if [[ -z "$tomcat_home" ]]; then
  echo -e "\n\$1 is empty and CATALINA_HOME isn't set, please point me at your Tomcat installation\n"
	exit 1
fi

docker/build-helper.sh "$tomcat_home"

tomcat_port=8080
echo -e "\nRunning Tomcat, assuming it is on $tomcat_port (change me if not)\n"

JAVA_OPTS="-Dknetminer.api.configFilePath=\"$knet_dataset_dir/config/config.yml\""
JAVA_OPTS="$JAVA_OPTS -Dknetminer.api.url=http://localhost:$tomcat_port/ws/aratiny"
export JAVA_OPTS

docker/runtime-helper.sh "$tomcat_home"

