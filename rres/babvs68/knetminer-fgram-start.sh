set -e
mydir=`dirname "$0"`
mydir=`realpath "$mydir"`

echo -e "\n\n\tRestarting https://knetminer.com/Fusarium_graminearum/\n"

. "$mydir/../_utils.sh"

cd "$HOME/software/knetminer/docker"

container_id=fgknet5.0-mem20g-5.0RC 
dataset_dir="$HOME/data/fgknet5.0"
clean_flag="$1"

prepare_docker "$container_id" "$dataset_dir" "$clean_flag"

export DOCKER_OPTS="-it --restart unless-stopped"
./docker-run.sh --dataset-id fungi/fgraminearum --dataset-dir "$dataset_dir" --image-version 5.0RC \
  --container-name "$container_id" --host-port 8081 --container-memory 20G --detach

