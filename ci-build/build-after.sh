echo -e "\n\n\t Cleaning local Maven for Docker\n"
sudo mvn $MAVEN_ARGS clean # The build inside docker created files we don't own

echo -e "\n\n\tBuilding Docker image\n"
docker build -t knetminer/knetminer:$docker_tag -f docker/Dockerfile .


if [[ "$GIT_BRANCH" != 'master' ]]; then
	echo -e "\n\n\tThis isn't a Docker-deployed branch, Not pushing to DockerHub\n"
	return
fi


# The bare image is usually rebuilt manually, here we've only to tag it when releasing
#
if [[ ! `$IS_RELEASE` ]]; then
	echo -e "\n\n\tTagging and pushing new Docker images with ${NEW_RELEASE_VER}\n"
	# We need it for the tag
	docker pull knetminer/knetminer-bare
	docker_release_tag="$NEW_RELEASE_VER"	
else
	echo -e "\n\n\tPushing new Docker images\n"
fi


docker login -u "$DOCKER_USER" -p "$DOCKER_PASSWORD"

for postfix in bare ''
do
	[[ -z "$postfix" ]] || postfix="-$postfix"

  # See above
  if [[ "$postfix" != '-bare' ]]; then
  	echo -e "\nPushing Docker$postfix:$docker_tag"
		docker push knetminer/knetminer$postfix:$docker_tag
	fi

  $IS_RELEASE || continue 

  # When we're releasing, we further tag the same images with the release tag and
  # push them too. This should only happen for the master branch

	echo -e "\nTagging Docker$postfix with $docker_release_tag"
	tag_str=":$docker_release_tag"
	docker tag knetminer/knetminer$postfix knetminer/knetminer$postfix$tag_str
	 
	echo -e "\nPushing Docker$postfix$tag_str"
	docker push knetminer/knetminer$postfix$tag_str
	
	echo 
done


echo -e "\n\n\tTriggering RRes deployment\n"

job='Knetminer - Deploy from DockerHub'
curl --user "$KNET_JENKINS_USER:$KNET_JENKINS_TOKEN" -X POST -o - --fail \
     "https://knetminer.org/build/job/$job/buildWithParameters" 

# git push is managed by the main build.sh script	
