export DOCKER_OPTS="-it --restart unless-stopped"
RELDIR=${HOME}/data/ascomycota
SWDIR=${HOME}/software/knetminer
pushd ${RELDIR}
$HOME/software/knetminer/docker/docker-run.sh --dataset-dir ${RELDIR}  --image-version latest --host-port 8086 --container-name 'ascomycota-40G' --container-memory 40G --detach

