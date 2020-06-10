#!/bin/bash

# This is invoked by Travis, as per .travis.yml
#

set -e -x # Fail fast upon the first error

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


# Manage releasing too
if [[ "$goal" == 'deploy' ]] \
	 && [[ ! -z "${NEW_RELEASE_VER}" ]] \
	 && [[ ! -z "${NEW_SNAPSHOT_VER}"]]
then 
  echo -e "\n\n\tRELEASSING ${NEW_RELEASE_VER}, new snapshot will be: ${NEW_SNAPSHOT_VER}\n" 
  is_release='true'
	: ${GIT_RELEASE_TAG:=$NEW_RELEASE_VER}
	: ${DOCKER_RELEASE_TAG:=$NEW_RELEASE_VER}
fi
  
if [[ ! -z "$is_release" ]]; then
  mvn versions:set -DnewVersion="${NEW_RELEASE_VER}" -DallowSnapshots=true
  # Commit immediately, even if it fails, we will have a chance to give up
  mvn versions:commit
fi

echo -e "\n\n\t Building Maven goal: $goal"
# You need --quiet, Travis doesn't like too big logs.
mvn --quiet --settings settings.xml $goal

echo -e "\n\n\tBuilding Docker-base"
docker build -t knetminer/knetminer-base -f common/quickstart/Dockerfile-base .

echo -e "\n\n\tBuilding Docker"
docker build -t knetminer/knetminer -f common/quickstart/Dockerfile .


if [[ "${TRAVIS_PULL_REQUEST}" != "false" ]]; then
	echo -e "\n\n\tWe're building a pull request, Not pushing to DockerHub\n"
	exit
fi

if [[ "${TRAVIS_BRANCH}" != 'master' ]]; then
	echo -e "\n\n\tThis isn't the master branch, Not pushing to DockerHub\n"
	exit
fi
	
if [[ ! -z "$is_release" ]]; then
	echo -e "\n\n\tTagging and pushing new Docker images with ${NEW_RELEASE_VER}\n"
	# We need it for the tag
	docker pull knetminer/knetminer-bare
else
	echo -e "\n\n\tPushing new Docker images\n"
fi

docker login -u "$DOCKER_USER" -p "$DOCKER_PWD"

for postfix in bare base ''
do
	[[ -z "postfix" ]] || postfix="-$postfix"
	
	if [[ ! -z "$is_release" ]]; then
		echo "Tagging Docker$postfix"
		docker tag knetminer/knetminer-$postfix knetminer/knetminer$postfix:${DOCKER_RELEASE_TAG}
	fi

	echo "Pushing Docker$postfix"
	docker push knetminer/knetminer$postifix:${DOCKER_RELEASE_TAG}
	
	echo 
done

if [[ ! -z "$is_release" ]]; then
	echo -e "\n\n\tPushing ${GIT_RELEASE_TAG} to github\n"
	
	ci_skip_tag=' [ci skip]'
	msg="Releasing ${GIT_RELEASE_TAG}.${ci_skip_tag}"
	
	git commit -m "$msg"
	git tag --force --annotate "${GIT_RELEASE_TAG}" -m "$msg"
	
	echo -e "\n\n\tSwitching codebase version to ${NEW_SNAPSHOT_VER}\n"
	mvn versions:set -DnewVersion="${NEW_SNAPSHOT_VER}" -DallowSnapshots=true
	mvn versions:commit
	
	git commit -m "Switching version to ${NEW_SNAPSHOT_VER}.${ci_skip_tag}"
	
	git push --force --tags origin HEAD:"$TRAVIS_BRANCH"
fi

echo -e "\n\n\tThe End."
