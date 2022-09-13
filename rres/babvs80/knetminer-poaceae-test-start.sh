set -e
mydir=`dirname "$0"`
mydir=`realpath "$mydir"`

echo -e "\n\n\tRestarting https://knetminer.com/TODO/\n"

. "$mydir/../_utils.sh"

cd "$HOME/software/knetminer/docker"

container_id=poaceae-test 
dataset_dir="$HOME/data/poaceae-54"
clean_flag="$1"

prepare_docker "$container_id" "$dataset_dir" "$clean_flag"

export DOCKER_OPTS="-it --restart unless-stopped"
# TODO: latest is unstable
./docker-run.sh --dataset-dir "$dataset_dir" --image-version latest \
  --container-name "$container_id" --host-port 8088 --container-memory 40G --detach

