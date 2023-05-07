set -e
cd "$(dirname $0)"
mydir="$(pwd)"

echo -e "\n\n\t------ Launching the Knetminer Test Client via Maven -------\n"
echo -e "\tShould be at http://localhost:8080 once you see it stops for listening. Stop with Ctrl-C\n"

cd ../aratiny-client
mvn clean jetty:run $MAVEN_ARGS 

echo -e "\n\nService should have gone down now, but don't forget the server.\n"
