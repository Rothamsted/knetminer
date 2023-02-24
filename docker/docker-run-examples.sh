echo -e "\n\n\tDON'T RUN this file, it contains examples that you can copy-paste\n"
exit 1

# Runs Knetminer using /opt/data/arabidopsis as dataset location in the host. Under this, takes the configuration
# from config/ and the data from data/knwoledge-network.oxl.
# Saves support data (eg, Lucene index) into data/.
#
# You must create a configuration under config/. You can use dataset-init.sh for that.
#
# Moreover:
# 
# - maps the 8090 port on the host to the container Tomcat, so the instance wil be available at
# http://localhost:8090/client (or http://<host-address>:8090/client).
# 
# - gives the 'arabidopsis' name to the Docker container. You'll be able to do things like stopping it with
# 'docker stop arabidopsis' 
#
# Gives 12G of RAM to the container.
# 
./docker-run.sh \
  --dataset-dir /opt/data/arabidopsis \ 
  --host-port 8090 \
  --container-name 'arabidopsis' \
  --container-memory 12G

# The same as above, but using an alternative config, which enables the Neo4j mode and connects
# Knetminer to a Neo4j server.
#
./docker-run.sh \
  --dataset-dir /opt/data/arabidopsis \
  --host-port 8090 \
  --container-name 'arabidopsis' \
  --container-memory 12G \
  --config-file config/config-neo4j.yml


# Options to setup JMX and use jvisualvm. this makes jvisualvm accessible on 9010 (RMI on 9011), you can start jvisualvm from the
# host and connect these ports (or you can use tricks like SSH tunnelling). Clearly, every new container needs its own ports.
#
export JAVA_TOOL_OPTIONS="-Dcom.sun.management.jmxremote.ssl=false
	-Dcom.sun.management.jmxremote.authenticate=false
 	-Dcom.sun.management.jmxremote.port=9010
 	-Dcom.sun.management.jmxremote.rmi.port=9011
 	-Djava.rmi.server.hostname=localhost
 	-Dcom.sun.management.jmxremote.local.only=false"
# and these can be used for debugging
export JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -Xdebug -Xnoagent
	-Djava.compiler=NONE
  -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
# If you set the JAVA_TOOL_OPTIONS var, you DO NEED some memory option too, in order to avoid
# limited defaults
export JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -XX:MaxRAMPercentage=90.0 -XX:+UseContainerSupport -XX:-UseCompressedOops"
export DOCKER_OPTS="-it -p 9010:9010 -p 9011:9011 -p 5005:5005"
./docker-run.sh ...