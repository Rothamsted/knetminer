# Used in RRes resources, to CI-deploy test containers
# from DockerHub, after they've beeen updated.
#

set -e # Stop upon the first problem

dataset_dir=/opt/data/knetminer-datasets/wheat-ci
host_port=9100

cd "$(dirname $0)"
my_dir=$(pwd)

cd ../common/quickstart

echo -e "\n\n\tPreparing the environment\n"

wall -n <<EOT
*** WARNING: Continuous Integration Scripts are going to update Docker images automatically ***

In few minutes, existing unused images will be DELETED. The container named wheat-ci will be restarted.
EOT 

echo -e "--- Stopping, cleaning and updating Docker\n"
docker stop wheat-ci || true
docker rm wheat-ci || true
yes | docker system prune --all
docker pull knetminer/knetminer

echo -e "--- Cleaning Knetminer dataset directory\n"
./cleanup-volume.sh --all "$dataset_dir"

echo -e "\n\n\t(Re)launching Docker\n"
./docker-run.sh \
  --dataset-id wheat --container-name wheat-ci \
  --dataset-dir "$dataset_dir" --host-port $host_port --container-memory 24G \
  --detach

# TODO: as a minimum, check it's up via wget, later run scripts that check sensible results are returned
echo -e "\n\n\The End\n"
