# We build on an image that already has the right environment.
# This makes it independent on the CI system that is being used.
# 
# Built files are still landed locally thanks to --volume. This allows for CI-based caching
# and to makes binaries available for the next steps like runtime images building.
#

echo -e "\n\n\t$MAVEN_GOAL via Docker bare image\n"

docker run -i --rm \
  --volume `pwd`:/root/knetminer-build/knetminer \
  --volume ~/.m2:/root/.m2 \
  --workdir /root/knetminer-build/knetminer \
  --env JAVA_TOOL_OPTIONS \
  --env KNET_REPO_USER \
  --env KNET_REPO_PASSWORD \
  knetminer/knetminer-bare:$docker_tag \
  /bin/bash -c "mvn $MAVEN_GOAL --settings ci-build/maven-settings.xml --update-snapshots $MAVEN_ARGS"

