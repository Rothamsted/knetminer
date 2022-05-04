# Does some common cleanup, invoke it with
# prepare <container-name> <container-dir> "$1"
function prepare_docker
{
  container_id="$1"
  dataset_dir="$2"
  clean_flag="$3"

  docker stop "$container_id" || true
  docker rm "$container_id" || true

  if [[ "$clean_flag" == "--clean" ]]; then
    ./cleanup-volume.sh --all "$dataset_dir"
    docker system prune --all --force
  fi
}

