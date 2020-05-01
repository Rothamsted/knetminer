#!/bin/bash

# This is invoked by Travis, as per .travis.yml
#

set -e # Fail fast upon the first error

if [[ "$TRAVIS_EVENT_TYPE" == "cron" ]]; then
	
	# Travis's cron doesn't consider if there have been changes or not, so we rely on 
	# git commits to check that. This isn't perfect (eg, last build could have failed due to network problems,
	# not necessarily the code itself), but good enough in most cases. 
	# TODO: see if the date of the last successful build can be get from the Travis API.
	#
	nchanges=$(git log --since '24 hours ago' --format=oneline | wc -l)
	if [[ $(($nchanges)) == 0  ]]; then
		cat <<EOT


	This is a cron-triggered build and the code didn't change since the latest build, so we're not rebuilding.
	This is based on github logs (--since '24 hours ago'). Please, launch a new build manually if I didn't get it right.
	
EOT
	exit
	fi
fi


[[ "${TRAVIS_PULL_REQUEST}" == "false" ]] && goal='deploy' || goal='install'

# You need --quiet, Travis doesn't like too big logs.
echo -e "\n\n\t MAVEN GOAL: $goal"
mvn --quiet --settings settings.xml $goal

echo -e "\n\n\tDocker-base"
docker build -t knetminer/knetminer-base -f common/quickstart/Dockerfile-base .

echo -e "\n\n\tDocker"
docker build -t knetminer/knetminer -f common/quickstart/Dockerfile .


if [[ "${TRAVIS_PULL_REQUEST}" != "false" ]]; then
	echo -e "\n\n\tWe're building a pull request, Not pushing to DockerHub\n"
	exit
fi

if [[ "${TRAVIS_BRANCH}" != 'master' ]]; then
	echo -e "\n\n\tThis isn't the master branch, Not pushing to DockerHub\n"
	exit
fi
	

echo -e "\n\n\tPushing Docker-base"
docker login -u "$DOCKER_USER" -p "$DOCKER_PWD"
docker push knetminer/knetminer-base 

echo -e "\n\n\tPushing Docker"
docker push knetminer/knetminer
