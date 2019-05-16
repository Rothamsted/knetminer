set arabidopsis # This is $1 now. Leave this blank to have a settings base to be invoked with the dataset you want
export KNET_HOST_DATA_DIR=/tmp/data
export KNET_IS_NEO4J='true'
export KNET_NEO4J_URL='bolt://192.168.1.100:17690'
export KNET_NEO4J_USER='neo4j'
export KNET_NEO4J_PWD='test'
export KNET_HOST_CODEBASE_DIR=/Users/brandizi/Documents/Work/RRes/ondex_git

export JAVA_TOOL_OPTIONS="-XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -XX:MaxRAMFraction=1"
export KNET_DOCKER_OPTS="--memory 12G --env JAVA_TOOL_OPTIONS -p 8080:8080 -it"

cd "$(dirname $0)"
./docker-run.sh "$1"
