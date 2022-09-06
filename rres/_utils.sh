# Does some common cleanup, invoke it with
# prepare <container-name> <container-dir> "$1"
function prepare_docker
{
  container_id="$1"
  dataset_dir="$2"
  clean_flag="$3"

  echo -e "\n  Stopping and deleting existing container"
  echo -e "  Please ignore errors about non-existing container (expected eg, at the first time)\n"
  docker stop "$container_id" || true
  docker rm "$container_id" || true

  if [[ "$clean_flag" == "--clean" ]]; then
    
    ./dataset-cleanup.sh "$dataset_dir"
    
    echo -e "\n  Cleaning old stuff in Docker" 
    docker system prune --all --force
  fi
}

