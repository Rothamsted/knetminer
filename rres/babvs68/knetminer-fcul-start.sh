set -e
mydir=`dirname "$0"`
mydir=`realpath "$mydir"`

echo "\n\n\tRestarting https://knetminer.com/Fusarium_culmorum\n"

. "$mydir/../_utils.sh"

cd "$HOME/software/knetminer/docker"

container_id=fcul_2020oxl-mem20g
dataset_dir="$HOME/data/fcul"
clean_flag="$1"

prepare_docker "$container_id" "$dataset_dir" "$clean_flag"

export DOCKER_OPTS="-it --restart unless-stopped"
./docker-run.sh --dataset-id fungi/fculmorum --dataset-dir "$dataset_dir" \
  --container-name "$container_id" --host-port 8083 --container-memory 20G --detach

