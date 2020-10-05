echo -e "\n\n\tDON'T RUN this file, it contains examples that you can copy-paste\n"
exit 1

# Runs the predefined settings in <codebase>/specie/arabidopsis, takes knwoledge-network.oxl from the 
# host location /root/knetminer-test/knetminer-datasets/arabidopsis/data, saves generated config and 
# actual settings into /root/knetminer-test/knetminer-datasets.
#
# Maps the 8090 port on the host to the container Tomcat, so the instance wil be available at
# http://localhost:8090/client (or http://<host-address>:8090/client).
# 
# Gives the 'arabidopsis' name to the Docker container. You'll be able to do things like stopping it with
# 'docker stop arabidopsis' 
#
# Gives 12G of RAM to the container.
# 
./docker-run.sh \
  --dataset-id arabidopsis \
  --dataset-dir /root/knetminer-test/knetminer-datasets/arabidopsis \ 
  --host-port 8090 \
  --container-name 'arabidopsis' \
  --container-memory 12G

# The same as above, but in Neo4j mode and connected to our Neo4j server
./docker-run.sh \
  --dataset-id arabidopsis \
  --dataset-dir /root/knetminer-test/knetminer-datasets/arabidopsis \
  --host-port 8090 \
  --container-name 'arabidopsis' \
  --container-memory 12G \
  --with-neo4j --neo4j-url bolt://babvs65.rothamsted.ac.uk:7687 --neo4j-user rouser --neo4j-pwd rouser


# Runs the wheat dataset, taking settings from the host directory (no --dataset-id)
./docker-run.sh \
  --dataset-dir /root/knetminer-test/knetminer-datasets/wheat \ 
  --host-port 8091 \
  --container-name 'wheat' \
  --container-memory 20G


# RRes-specific test
./docker-run.sh \
  --dataset-id wheat-directed \
  --dataset-dir /opt/data/knetminer-datasets/wheat-directed \
  --host-port 9090 \
  --container-name 'wheat-directed' \
  --container-memory 20G \
  --with-neo4j --neo4j-url bolt://babvs65.rothamsted.ac.uk:7688 --neo4j-user rouser --neo4j-pwd rouser \
  --detach

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
