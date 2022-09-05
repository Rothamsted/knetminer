set -e
mydir=`dirname "$0"`
mydir=`realpath "$mydir"`

echo "\n\n\tRestarting https://knetminer.com/Zymoseptoria_tritici\n"

. "$mydir/../_utils.sh"

cd "$HOME/software/knetminer/docker"

container_id=ztknet5.0-mem20g-5.0RC 
dataset_dir="$HOME/data/ztknet5.0"
clean_flag="$1"

prepare_docker "$container_id" "$dataset_dir" "$clean_flag"

export DOCKER_OPTS="-it --restart unless-stopped"
./docker-run.sh --dataset-id fungi/ztritici --dataset-dir "$dataset_dir" --image-version 5.0RC \
  --container-name "$container_id" --host-port 8082 --container-memory 20G --detach
