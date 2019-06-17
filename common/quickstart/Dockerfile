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
    basemap_file=https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/basemap.xml  \
    sample_query_file=https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/sampleQuery.xml  \
    background_image_file=https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/background.jpg  \
    release_notes_file=https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/release_notes.html  \
    tax_id=3702  \
    species_name="Arabidopsis thaliana" \
    species_link_name=arabidopsis \
    keywords="arabidopsis, thaliana, knetminer, quickstart, demonstration" \
    description="Arabidopsis Knetminer" \
    reference_genome=true \
    git_branch=20181001_rhlastweek

# DO NOT TOUCH BELOW THIS LINE

EXPOSE 8080
ENV ds=/root/knetminer/common/quickstart/datasource/src/main \
    cl=/root/knetminer/common/quickstart/client/src/main/webapp/html \
    common=/root/knetminer/common
WORKDIR /root

RUN set -x \
 && apk add --no-cache maven nodejs-npm git libxml2-utils \
 && npm config set unsafe-perm true \
 && npm install bower gulp -g \
 && echo '{"allow_root":true}' > /root/.bowerrc \
 && git clone --single-branch -b ${git_branch} https://github.com/Rothamsted/knetminer.git \
 && cd knetminer \
 && mkdir -p ${cl}/data ${cl}/image \
 && wget -O /root/data.oxl ${oxl_file} \
 && wget -O ${ds}/resources/SemanticMotifs.txt ${semantic_motifs_file} \
 && wget -O ${cl}/data/basemap.xml ${basemap_file} \
 && wget -O ${cl}/data/sampleQuery.xml ${sample_query_file} \
 && wget -O ${cl}/image/background.jpg ${background_image_file} \
 && wget -O ${cl}/release_notes.html ${release_notes_file} \
 && mv ${ds}/resources/config.xml.template ${ds}/resources/config.xml \
 && mv ${ds}/java/rres/knetminer/datasource/provider/Quickstart.java.template ${ds}/java/rres/knetminer/datasource/provider/Quickstart.java \
 && mv ${cl}/release.html.template ${cl}/release.html \
 && mv ${cl}/index.jsp.template ${cl}/index.jsp \
 && mv ${cl}/javascript/utils-config.js.template ${cl}/javascript/utils-config.js \
 && chromosomes=$(echo "cat //genome/chromosome/@number" | xmllint --shell ${cl}/data/basemap.xml | sed -n 's/[^\"]*\"\([^\"]*\)\"[^\"]*/\1/gp' | sed -e :a -e '$!N; s/\n/,/; ta';) \
 && sed -e "s/!!REFGENOME!!/${reference_genome}/g" -i'' ${cl}/javascript/utils-config.js \
 && sed -e "s/!!SPECIES!!/${species_name}/g" -i'' ${cl}/javascript/utils-config.js \
 && sed -e "s/!!LINKNAME!!/${species_link_name}/g" -i'' ${cl}/javascript/utils-config.js \
 && sed -e "s/!!SPECIES!!/${species_name}/g" -i'' ${cl}/release.html \
 && sed -e "/!!RELEASE!!/{r ${cl}/release_notes.html" -e "d}" -i'' ${cl}/release.html \
 && sed -e "s/!!SPECIES!!/${species_name}/g" -i'' ${cl}/index.jsp \
 && sed -e "s/!!CHROMOSOMES!!/${chromosomes}/g" -i'' ${cl}/index.jsp \
 && sed -e "s/!!METAKEYWORDS!!/${keywords}/g" -i'' ${cl}/index.jsp \
 && sed -e "s/!!METADESC!!/${description}/g" -i'' ${cl}/index.jsp \
 && sed -e "s/!!REFGENOME!!/${reference_genome}/g" -i'' ${ds}/resources/config.xml \
 && sed -e "s/!!TAXID!!/${tax_id}/g" -i'' ${ds}/resources/config.xml \
 && sed -e "s/!!LINKNAME!!/${species_link_name}/g" -i'' ${ds}/java/rres/knetminer/datasource/provider/Quickstart.java \
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
