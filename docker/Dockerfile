# The image for the Knetminer application (WS/API + Client/Front-end).
#
# If this is run in dev mode, we need 'docker build -f .' from the codebase root directory, since
# climbing up the host paths is forbidden
#

# Sometimes, it can be usefult to change it, when developing and/or playing with different versions
# of the bare image beneat us.
ARG DOCKER_TAG='latest' 

FROM knetminer/knetminer-bare:${DOCKER_TAG}

# If set, tomcat-users.xml is populated with the user 'tomcat' and this password
# Can be useful for basic debugging.
#
ARG TOMCAT_PASSWORD=''

EXPOSE 8080

WORKDIR /root

# Copy the .war(s)
#
COPY /aratiny/aratiny-ws/target/aratiny-ws.war $CATALINA_HOME/webapps/ws.war
COPY /aratiny/aratiny-client/target/knetminer-aratiny.war $CATALINA_HOME/webapps/client.war

# Copy the default/demo dataset
# build-helper.sh removes some clutter coming with it
#
COPY /aratiny/aratiny-ws/target/test-classes/knetminer-dataset knetminer-dataset
COPY /aratiny/aratiny-ws/target/dependency/poaceae-sample.oxl ./knetminer-dataset/data/knowledge-network.oxl


# AWS stuff
COPY /docker/.aws .
COPY /docker/analytics-cron .

# Run some other setup operations
COPY /docker/build-helper.sh .
COPY /docker/runtime-helper.sh .

# Does minimal finishing touches
# 
RUN ./build-helper.sh '' "$TOMCAT_PASSWORD"

ENTRYPOINT [ "./runtime-helper.sh" ] 
