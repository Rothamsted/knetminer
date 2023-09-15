set -e
cd "$(dirname $0)"
mydir="$(pwd)"

# Syntax: [ <profile>[,<profile>]* [-nc|--no-clean] ]

profiles="$1"
no_clean="$2"

export MAVEN_OPTS="$MAVEN_OPTS -Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=5005,server=y,suspend=n"
# Suppresses pesky warnings from Jetty. BE CAREFUL. They might be significant
export MAVEN_OPTS="$MAVEN_OPTS -Dorg.slf4j.simpleLogger.log.org.eclipse.jetty.annotations.AnnotationParser=ERROR"

echo -e "\n\n\t------ Launching the Knetminer Test Server via Maven -------\n"
cd ../aratiny-ws

# Launches integration tests in 'console mode': a special test will make the build to stop after server launches,
# waiting for the user to press Enter and continue the build until shutdown.
#
[ "$profiles" == "" ] || profiles="$profiles,"
profiles="${profiles}console"

( [[ "$no_clean" == "-nc" ]] || [[ "$no_clean" == "--no-clean" ]] ) && mvn_clean='' || mvn_clean='clean'

mvn $MAVEN_ARGS -P"$profiles" $mvn_clean verify

echo -e "\n\nService should have gone down now, but don't forget the client.\n"
