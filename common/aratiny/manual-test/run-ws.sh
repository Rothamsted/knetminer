cd "$(dirname $0)"
mydir="$(pwd)"

profiles="$1"

echo -e "\n\n\t------ Launching the Knetminer Test Server via Maven -------\n"
cd ../aratiny-ws

# Launches integration tests in 'console mode': a special test will make the build to stop after server launches,
# waiting for the user to press Enter and continue the build until shutdown.
#
[ "$profiles" == "" ] || profiles="$profiles,"
profiles="${profiles}console"
mvn -P"$profiles" $MAVEN_ARGS clean verify

echo -e "\n\nService should have gone down now, but don't forget the client.\n"
