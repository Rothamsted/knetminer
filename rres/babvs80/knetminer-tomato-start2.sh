export DOCKER_OPTS="-it --restart unless-stopped"
RELDIR=${HOME}/data/sol_tomato
SWDIR=${HOME}/software/knetminer
LAUNCH=${SWDIR}/rres/babvs80/knetminer-tomato-start2.sh
pushd ${RELDIR}
$HOME/software/knetminer/docker/docker-run.sh --dataset-dir ${RELDIR}  --image-version latest --host-port 8080 --container-name 'sol-tomato-48G' --container-memory 48G --detach

