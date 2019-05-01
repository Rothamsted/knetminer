cd "$(dirname $0)"
mydir="$(pwd)"

knet_cfg_dir=${1:-/root/knetminer-config}
knet_tomcat_home=${2:-$CATALINA_HOME}

knet_web_dir="$knet_cfg_dir/web"
mkdir --parents "$knet_web_dir"

# Build the client for this dataset
# TODO

# Now let's put in place the common config file
cd ../aratiny/aratiny-ws
mvn -Pdocker --settings "$knet_cfg_dir/maven-settings.xml" clean test-compile
cp -Rf target/test-classes/knetminer-config/* "$knet_cfg_dir"

# TODO: parameterise this, to make it able to work out of docker too and also optional 
cd "$knet_tomcat_home/bin" 
./catalina.sh run
