# This is invoked by Travis, as per .travis.yml
#
#

set -e # Fail fast upon the first error

[[ "${TRAVIS_PULL_REQUEST}" == "false" ]] && goal='install' || goal='deploy'

# You need --quiet, Travis doesn't like too big logs.
mvn --quiet $goal --settings settings.xml

echo -e "\n\n\tDocker-base"
docker build --no-cache -t knetminer/knetminer-base -f common/quickstart/Dockerfile-base .

echo -e "\n\n\tDocker"
docker build --no-cache -t knetminer/knetminer -f common/quickstart/Dockerfile .

if [[  "${TRAVIS_PULL_REQUEST}" == "true" ]]; then
	echo -e "\n\n\tWe're building a pull request, Not pushing to DockerHub\n"
	exit
fi

echo -e "\n\n\tPushing Docker-base"
docker login -u "$DOCKER_USER" -p "$DOCKER_PWD"
docker push knetminer/knetminer-base 
echo -e "\n\n\tPushing Docker"
docker push knetminer/knetminer
