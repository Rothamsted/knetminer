FROM andreptb/tomcat:7-jdk8

# DO NOT TOUCH ABOVE THIS LINE
 
# INSTRUCTIONS
# 1. Configure the OXL file and other settings in the ENV statement below
# 2a. For AWS deployment, send the modified Dockerfile in a zip to ElasticBeanStalk and run it there
# 2b. Or, for local deployment in Docker, continue from step 3
# 3. Build with "docker image build -t knetminer ." 
# 4. Run the resulting image with "docker run -it --rm knetminer"

ENV oxl_file=https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/default.oxl  \
    semantic_motifs_file=https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/SemanticMotifs.txt  \
    tax_id=3702  \
    reference_genome=true \
    git_branch=20181001_autodeploy

# DO NOT TOUCH BELOW THIS LINE

RUN apk add --no-cache maven nodejs-npm git \
 && npm install bower gulp -g \
 && echo '{"allow_root":true}' > /root/.bowerrc

WORKDIR /root
RUN git clone https://github.com/Rothamsted/knetminer.git

WORKDIR /root/knetminer
ENV ds_confdir=/root/knetminer/common/quickstart/datasource/src/main/resources \
    cl_confdir=/root/knetminer/common/quickstart/client/src/main/webapp/html/javascript
RUN git checkout ${git_branch} \
 && wget -O /root/data.oxl ${oxl_file} \
 && wget -O ${ds_confdir}/SemanticMotifs.txt ${semantic_motifs_file} \
 && mv ${ds_confdir}/config.xml.template ${ds_confdir}/config.xml \
 && mv ${cl_confdir}/utils-config.js.template ${cl_confdir}/utils-config.js \
 && sed -e "s/!!REFGENOME!!/${reference_genome}/g" -i'' ${cl_confdir}/utils-config.js \
 && sed -e "s/!!REFGENOME!!/${reference_genome}/g" -i'' ${ds_confdir}/config.xml \
 && sed -e "s/!!TAXID!!/${tax_id}/g" -i'' ${ds_confdir}/config.xml \
 && mvn clean install \
 && mv /root/knetminer/common/quickstart/client/target/client.war $CATALINA_HOME/webapps \
 && mv /root/knetminer/common/quickstart/ws/target/ws.war $CATALINA_HOME/webapps 

WORKDIR /root
RUN rm -rf /root/knetminer /root/.m2
