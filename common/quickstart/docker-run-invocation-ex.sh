# Variables influencing this scripts:
#
set arabidopsis # This is $1 now. Leave this blank to have a settings base to be invoked with the dataset you want
export KNET_HOST_DATA_DIR=/tmp/data
export KNET_IS_NEO4J='true'
#export KNET_NEO4J_URL='bolt://192.168.1.100:17690'
export KNET_NEO4J_URL='bolt://149.155.6.39:17690'
export KNET_NEO4J_USER='neo4j'
export KNET_NEO4J_PWD='test'
export KNET_HOST_CODEBASE_DIR=/Users/brandizi/Documents/Work/RRes/ondex_git

cd "$(dirname $0)"
./docker-run.sh "$1"
