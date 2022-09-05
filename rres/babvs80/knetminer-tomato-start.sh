get -e
mydir=`dirname "$0"`
mydir=`realpath "$mydir"`

echo "\n\n\tRestarting https://knetminer.com/tomato_limagrain/\n"

. "$mydir/../_utils.sh"

cd "$HOME/software/knetminer/docker"

container_id=tomato-mem48g-latest 
dataset_dir="$HOME/data/sol_tomato:"
clean_flag="$1"

prepare_docker "$container_id" "$dataset_dir" "$clean_flag"

export DOCKER_OPTS="-it --restart unless-stopped"
g/docker-run.sh --dataset-id tomato --dataset-dir "$dataset_dir" --image-version latest \
  --container-name "$container_id" --host-port 8080 --container-memory 48G --detach
