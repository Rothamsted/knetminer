cd "$(dirname $0)"
mydir="$(pwd)"

cd "$mydir"

knet_cfg_dir=${1:-target/docker-deploy/knetminer-config}
knet_version=$(mvn help:evaluate -q -DforceStdout -Dexpression='project.version')

cd ws
mvn clean install

cd ..
./deploy-docker-env.sh $knet_version "$knet_cfg_dir"
