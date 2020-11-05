# The image for the Knetminer application (WS/API + Client/Front-end).
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

# See the documentation for details on what the dataset dir is
ENV knet_build_dir=/root/knetminer-build


# ---- Here we go
# 

# If this is run in dev mode, we need 'docker build -f .' from the codebase root directory, since
# climbing up the host paths is forbidden
#
WORKDIR $knet_build_dir
COPY . knetminer
WORKDIR knetminer/docker

# Note that this issues 'mvn install' from your local copy of the knetminer codebase, WITHOUT clean.
# The idea is that it leverages Docker-base and adds up updates from your host copy. 
# If you need to rebuild from clean code, just clean your host copy before building the Docker image.
# (TODO: document this)
# 
RUN touch /etc/crontab /etc/cron*/* \
  && cp -r .aws ~/ \
  && ./build-helper.sh '' "$TOMCAT_PASSWORD"

ENTRYPOINT ["./runtime-helper.sh"] 
CMD ["aratiny"] # The id of the default dataset
