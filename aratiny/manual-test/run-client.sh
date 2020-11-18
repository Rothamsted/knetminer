cd "$(dirname $0)"
mydir="$(pwd)"

echo -e "\n\n\t------ Launching the Knetminer Test Client via Maven -------\n"
echo -e "\tShould be at http://localhost:8080 once you see it stops for listening. Stop with Ctrl-C\n"

cd ../aratiny-client
mvn clean jetty:run-war $MAVEN_ARGS # jetty:run is not enough, there are some Mavev placeholders that aren't resolved by it

echo -e "\n\nService should have gone down now, but don't forget the server.\n"
