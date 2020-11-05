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


# Manage releasing too
if [[ "$goal" == 'deploy' ]] \
	 && [[ ! -z "${NEW_RELEASE_VER}" ]] \
	 && [[ ! -z "${NEW_SNAPSHOT_VER}" ]]
then 
  echo -e "\n\n\tRELEASING $NEW_RELEASE_VER, new snapshot will be: $NEW_SNAPSHOT_VER\n" 
  is_release='true'
	: ${GIT_RELEASE_TAG:=$NEW_RELEASE_VER}
	: ${DOCKER_RELEASE_TAG:=$NEW_RELEASE_VER}
fi
  
if [[ ! -z "$is_release" ]]; then
  mvn versions:set -DnewVersion="$NEW_RELEASE_VER" -DallowSnapshots=true
  # Commit immediately, even if it fails, we will have a chance to give up
  mvn versions:commit
fi

echo -e "\n\n\t Building Maven goal: $goal"
# You need --quiet, Travis doesn't like too big logs.
mvn --quiet --settings maven-settings.xml --update-snapshots $goal

echo -e "\n\n\t Cleaning local Maven for Docker"
mvn --quiet clean

# Might be useful when developing on a branch.
# [[ "$TRAVIS_BRANCH" == '202006_jdk11' ]] && docker_tag='j11' || docker_tag='latest'
docker_tag='latest'

# TODO: remove
#echo -e "\n\n\tBuilding Docker-base"
#docker build -t knetminer/knetminer-base:$docker_tag -f docker/Dockerfile-base .

echo -e "\n\n\tBuilding Docker"
docker build -t knetminer/knetminer:$docker_tag -f docker/Dockerfile .


if [[ "${TRAVIS_PULL_REQUEST}" != "false" ]]; then
	echo -e "\n\n\tWe're building a pull request, Not pushing to DockerHub\n"
	exit
fi

if [[ "$TRAVIS_BRANCH" != "master" ]]; then
	echo -e "\n\n\tThis isn't a Docker-deployed branch, Not pushing to DockerHub\n"
	exit
fi


# The bare image is usually rebuilt manually, here we've only to tag it when releasing
#
if [[ ! -z "$is_release" ]]; then
	echo -e "\n\n\tTagging and pushing new Docker images with ${NEW_RELEASE_VER}\n"
	# We need it for the tag
	docker pull knetminer/knetminer-bare
else
	echo -e "\n\n\tPushing new Docker images\n"
fi

docker login -u "$DOCKER_USER" -p "$DOCKER_PWD"

# TODO: remove
#for postfix in bare base ''
for postfix in bare ''
do
	[[ -z "$postfix" ]] || postfix="-$postfix"

  # See above
  [[ "$postfix" == '-bare' ]] && [[ -z "$is_release" ]] && continue

  echo "Pushing Docker$postfix"
	docker push knetminer/knetminer$postfix:$docker_tag

  [[ -z "$is_release" ]] && continue 

  # When we're releasing, we further tag the same images with the release tag and
  # push them too. This should only happen for the master branch

	echo "Tagging Docker$postfix with $DOCKER_RELEASE_TAG"
	docker_tag_str=":$DOCKER_RELEASE_TAG"
	docker tag knetminer/knetminer$postfix knetminer/knetminer$postfix$docker_tag_str
	 
	echo "Pushing Docker$postfix$docker_tag_str"
	docker push knetminer/knetminer$postfix$docker_tag_str
	
	echo 
done

if [[ ! -z "$is_release" ]]; then
	echo -e "\n\n\tPushing ${GIT_RELEASE_TAG} to github\n"
	
	ci_skip_tag=' [ci skip]'
	msg="Releasing ${GIT_RELEASE_TAG}.${ci_skip_tag}"
	
	git commit -a -m "$msg"
	git tag --force --annotate "${GIT_RELEASE_TAG}" -m "$msg"
	
	echo -e "\n\n\tSwitching codebase version to ${NEW_SNAPSHOT_VER}\n"
	mvn versions:set -DnewVersion="${NEW_SNAPSHOT_VER}" -DallowSnapshots=true
	mvn versions:commit
	
	git commit -a -m "Switching version to ${NEW_SNAPSHOT_VER}.${ci_skip_tag}"
	
	# Will replace regular URL with this. Vars come from Travis settings.
	git config --global "url.https://$GIT_USER:$GIT_PASSWORD@github.com.insteadof" "https://github.com"	
	git push --force --tags origin HEAD:"$TRAVIS_BRANCH"
fi

echo -e "\n\n\tThe End."
