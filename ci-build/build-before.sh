export JAVA_TOOL_OPTIONS="-Xms1G -Xmx4G" 

# Let's make it less verbose
export JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -Dorg.slf4j.simpleLogger.defaultLogLevel=INFO"
export JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -Dorg.slf4j.simpleLogger.log.org.eclipse.jetty.annotations.AnnotationParser=ERROR"

# Copes with timeouts from our Nexus
export JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -Dsun.net.client.defaultConnectTimeout=300000 -Dsun.net.client.defaultReadTimeout=300000"

# This is both the knetminer-bare image version that is used for the current builds, and the 
# knetminer image that is currently build.
# If you're releasing, another tag will be added to these images using NEW_RELEASE_VER  
docker_tag='latest'

# This might be useful when developing on a branch. Here, the images knetminer-base:j11 and knetminer:j11
# will be used/rebuilt
# [[ "$GIT_BRANCH" == '202006_jdk11' ]] && docker_tag='j11'
[[ "$GIT_BRANCH" == '5.6-dev' ]] && docker_tag='5.6-dev'


# You can play with a different bare image too, we usually don't
docker_tag_bare="$docker_tag"
