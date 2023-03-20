# We build on an image that already has the right environment.
# This makes it independent on the CI system that is being used.
# 
# Built files are still landed locally thanks to --volume. This allows for CI-based caching
# and to makes binaries available for the next steps like runtime images building.
#

echo -e "\n\n\tGoal '$MAVEN_GOAL' via Docker bare image\n"

docker pull "ghcr.io/rothamsted/knetminer-bare:$docker_tag_bare"

docker run --rm \
  --volume `pwd`:/root/knetminer-build/knetminer \
  --volume ~/.m2:/root/.m2 \
  --workdir /root/knetminer-build/knetminer \
  --env JAVA_TOOL_OPTIONS \
  --env KNET_REPO_USER \
  --env KNET_REPO_PASSWORD \
  "ghcr.io/rothamsted/knetminer-bare:$docker_tag_bare" \
  "mvn $MAVEN_GOAL --settings ci-build/maven-settings.xml --update-snapshots --no-transfer-progress $MAVEN_ARGS"

# For some reason, we get files that the GHA runner can't access anymore
echo -e "\n  Maven build finished, fixing new files permissions\n"
sudo chown -R "$USER" `pwd` ~/.m2
sudo chmod -R ug=rwX,o-rwxs `pwd` ~/.m2
