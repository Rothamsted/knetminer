cd "$(dirname $0)"
mydir="$(pwd)"

knet_version="$1"
knet_cfg_dir=${2:-/root/knetminer-config}

knet_web_dir="$knet_cfg_dir/web"
mkdir --parents "$knet_web_dir"

mvn dependency:copy \
	-Dartifact="uk.ac.rothamsted.knetminer:quickstart-ws:$knet_version:war" \
	-DoutputDirectory="$knet_web_dir"

cd "$knet_web_dir"
mv quickstart-ws-*.war ws.war
cd "$mydir"
  