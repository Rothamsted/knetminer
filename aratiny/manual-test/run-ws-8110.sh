# Just the same, but in another set of ports, used in certain servers to deal with 
# already existing services.
#
set -e
cd "`dirname $0`"
mydir="`pwd`"

export MAVEN_ARGS="-Dknetminer.api.httpPort=8110 -Djetty.http.stopPort=8111"
./run-ws.sh
