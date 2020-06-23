# The image for the Knetminer application (WS/API + Client/Front-end).
#

# Can be usefult to change it, when developing and/or playing with different versions.
ARG DOCKER_TAG='latest' 

# If set, tomcat-users.xml is populated with the user 'tomcat' and this password
# Can be useful for basic debugging.
#
ARG TOMCAT_PASSWORD=''


FROM knetminer/knetminer-base:${DOCKER_TAG}


EXPOSE 8080

# See the documentation for detains on what the dataset dir is
ENV knet_build_dir=/root/knetminer-build


# ---- Here we go
# 

WORKDIR $knet_build_dir


# If this is run in dev mode, we need 'docker build -f .' from the codebase root directory, since
# climbing up the host paths is forbidden
COPY . knetminer

WORKDIR knetminer/common/quickstart

# TODO: AWS requires a specific image
#
RUN apk add --update \
           python \
           python-dev \
           py-pip \
           build-base \
           && pip install awscli \
  && touch /etc/crontab /etc/cron*/* \
  && cp -r .aws ~/ \
  && ./build-helper.sh '' "$TOMCAT_PASSWORD"


ENTRYPOINT ["./runtime-helper.sh"] 
CMD ["aratiny"] # The id of the default dataset
