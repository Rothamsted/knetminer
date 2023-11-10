
#
# Runs the aratiny test instance with the single-specie test configuration 
# (in /aratiny/aratiny-ws/src/test/resources/knetminer-dataset/config/test-cfg-single-specie.yml).
#
# This can be used to test if/how the UI adapts to the case where only one specie is available for an instance
#  

cd "$(dirname $0)"

#export MAVEN_ARGS="$MAVEN_ARGS -Dneo4j.server.version=4.3.1"

# As the main script, run me with -nc to avoid data re-initialisation 
./run-ws.sh singleSpecie $*
