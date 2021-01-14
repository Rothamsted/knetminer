export JAVA_TOOL_OPTIONS="-Xms1G -Xmx4G" 
# Let's make it less verbose
export JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -Dorg.slf4j.simpleLogger.defaultLogLevel=INFO"

# This is both the knetminer-bare image version that is used for the current builds, and the 
# knetminer image that is currently build.
# If you're releasing, another tag will be added to these images using NEW_RELEASE_VER  
docker_tag='latest'

# This might be useful when developing on a branch. Here, the images knetminer-base:j11 and knetminer:j11
# will be used/rebuilt
# [[ "$GIT_BRANCH" == '202006_jdk11' ]] && docker_tag='j11' || docker_tag='latest'
