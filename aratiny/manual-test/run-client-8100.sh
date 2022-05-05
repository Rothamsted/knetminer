# Just the same, but in another set of ports, used in certain servers to deal with 
# already existing services.
#
set -e
cd "`dirname $0`"
mydir="`pwd`"

export MAVEN_ARGS="-Djetty.http.port=8100 -Djetty.http.stopPort=8101 -Dknetminer.api.httpPort=8110"
./run-client.sh
