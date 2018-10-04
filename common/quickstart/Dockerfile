FROM andreptb/tomcat:7-jdk8

# DO NOT TOUCH ABOVE THIS LINE
 
# INSTRUCTIONS
# 1. Configure the OXL file and other settings in the ENV statement below
# 2a. For AWS deployment, send the modified Dockerfile and accompanying Dockerrun.aws.json to ElasticBeanStalk ("eb init", "eb create" from within an empty folder containing a copy of the two files)) and run it there. It will take around 10 minutes to build the image and start it before you can access it at http://<beanstalk-load-balancer-name>/client/ (NB. Do not include :8080 in the URL)
# 2b. Or, for local deployment in Docker, continue from step 3
# 3. Build with "docker image build --squash -t knetminer ." 
# 4. Run the resulting image with "docker run -p8080:8080 -it --rm knetminer". You can access it at http://localhost:8080/client/

ENV oxl_file=https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/default.oxl  \
    semantic_motifs_file=https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/SemanticMotifs.txt  \
    tax_id=3702  \
    reference_genome=true \
    git_branch=20181001_autodeploy

# DO NOT TOUCH BELOW THIS LINE

EXPOSE 8080
ENV ds=/root/knetminer/common/quickstart/datasource/src/main/resources \
    cl=/root/knetminer/common/quickstart/client/src/main/webapp/html/javascript \
    common=/root/knetminer/common
WORKDIR /root

RUN apk add --no-cache maven nodejs-npm git \
 && npm install bower gulp -g \
 && echo '{"allow_root":true}' > /root/.bowerrc \
 && git clone https://github.com/Rothamsted/knetminer.git \
 && cd knetminer \
 && git checkout ${git_branch} \
 && wget -O /root/data.oxl ${oxl_file} \
 && wget -O ${ds}/SemanticMotifs.txt ${semantic_motifs_file} \
 && mv ${ds}/config.xml.template ${ds}/config.xml \
 && mv ${cl}/utils-config.js.template ${cl}/utils-config.js \
 && sed -e "s/!!REFGENOME!!/${reference_genome}/g" -i'' ${cl}/utils-config.js \
 && sed -e "s/!!REFGENOME!!/${reference_genome}/g" -i'' ${ds}/config.xml \
 && sed -e "s/!!TAXID!!/${tax_id}/g" -i'' ${ds}/config.xml \
 && mvn install \
 && cd ${common} \
 && mvn install \
 && cd ${common}/server-datasource-api \
 && mvn install \
 && cd ${common}/server-datasource-ondexlocal \
 && mvn install \
 && cd ${common}/server-base \
 && mvn install \
 && cd ${common}/client-base \
 && mvn install \
 && cd ${common}/quickstart \
 && mvn install \
 && mv ${common}/quickstart/client/target/client.war ${CATALINA_HOME}/webapps \
 && mv ${common}/quickstart/ws/target/ws.war ${CATALINA_HOME}/webapps \
 && rm -rf /root/.m2 /root/knetminer

CMD ["catalina.sh", "run"]
