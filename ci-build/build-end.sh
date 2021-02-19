echo -e "\n\n\tTriggering RRes deployment\n"

job=`echo 'Knetminer - Deploy from DockerHub' | sed s/' '/'%20'/g`
curl --user "$KNET_JENKINS_USER:$KNET_JENKINS_TOKEN" -X POST -o - --fail \
     "https://knetminer.org/build/job/$job/buildWithParameters"
