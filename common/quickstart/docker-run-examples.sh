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

