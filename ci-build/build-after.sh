echo -e "\n\n\tBuilding Docker image\n"
sudo chown -R "$USER" . # The build inside Docker creates files we don't own yet

cd docker
./docker-build-image.sh --tag "$docker_tag" --tag-bare "$docker_tag_bare" --no-mvn-clean

if [[ "$GIT_BRANCH" != 'master' ]]; then
	echo -e "\n\n\tThis isn't a Docker-deployed branch, Not pushing to DockerHub\n"
	return
fi


# The bare image is usually rebuilt manually, here we've only to tag it when releasing
#
if `$IS_RELEASE`; then
	echo -e "\n\n\tTagging and pushing new Docker images with ${NEW_RELEASE_VER}\n"
	# We don't need this here, since it was already got to do the build
	# docker pull "ghcr.io/rothamsted/knetminer-bare:$docker_tag_bare"
else
	echo -e "\n\n\tPushing new Docker image(s)\n"
fi


docker login -u "$GIT_USER" -p "$GIT_PASSWORD"

echo -e "\nPushing main image with tag '$docker_tag'\n"
docker push "ghcr.io/rothamsted/knetminer:$docker_tag"

# When we're releasing, we further tag the same images with the release tag and
# push them too. This should only happen for the master branch

if `$IS_RELEASE`; then

	echo -e "\nTagging Docker main with $NEW_RELEASE_VER\n"
	docker tag "ghcr.io/rothamsted/knetminer:$docker_tag" "ghcr.io/rothamsted/knetminer:$NEW_RELEASE_VER"

	echo -e "\nTagging Docker bare with $NEW_RELEASE_VER\n"
	docker tag "ghcr.io/rothamsted/knetminer-bare:$docker_tag_bare" "ghcr.io/rothamsted/knetminer-bare:$NEW_RELEASE_VER"

	echo -e "\nPushing main:$NEW_RELEASE_VER\n"
	docker push "ghcr.io/rothamsted/knetminer:$NEW_RELEASE_VER"

	echo -e "\nPushing bare:$NEW_RELEASE_VER\n"
	docker push "ghcr.io/rothamsted/knetminer-bare:$NEW_RELEASE_VER"

fi


cd .. # back to the codebase's root

# The script that goes into this $NEW_RELEASE_VER distribution should use the corresponding version as
# a default, not 'latest'. TODO: document it in the wiki.
# 
if $IS_RELEASE; then
	echo -e "\n\n\tSetting '$NEW_RELEASE_VER' as default --image-version in docker-run.sh\n"
	sed -E --in-place "s/^image_version='latest'/image_version='$NEW_RELEASE_VER'/" docker/docker-run.sh
else
	# Else, we might need to restore the pointers to the the one we have built
	if ! egrep -q "^image_version='latest'" docker/docker-run.sh; then
	  msg = "Restoring 'latest' version for --image-version in docker-run.sh"
		echo -e "\n\n\t$msg\n"
		
		sed -E --in-place "s/^image_version=.+$/image_version='latest'/" docker/docker-run.sh
		
		git commit docker/docker-run.sh \
		    -m "$msg (ci script). [ci skip]"
		export NEEDS_PUSH=true
	fi
fi

# git push is managed by the main build.sh script	
