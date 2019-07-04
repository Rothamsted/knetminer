FROM knetminer/knetminer-base

# If set, tomcat-users.xml is populated with the user 'tomcat' and this password
# Can be useful for basic debugging.
#
ARG tomcat_password=''

EXPOSE 8080

# working dirs are: 
# - configuration and .war files go to /root/knetminer-config
# 
# - data go to /root/knetminer-data
#   - These are mounted as a dataset-specific volume, if you don't map any volume to these dir, the container
#   we'll use the VM directories, which contains the defaults we copy there from this Dockerfile
# 
# - code is got from /root/knetminer-build. This is populated with the knetminer codebase when this image is built,
# copying files from $(dirname <this-file>/../..) and then, at image runtime, it can be replaced by means of local volume
# mapping (see docker-run.sh), so that the client and the configuration can be rebuilt dynamically at runtime. This is
# useful for development. 
# 
# This kind of building is managed by runtime-helper.sh, which, is the entry point for this Docker image. This script
# rebuilds a dataset/specie specific configuration, plus a dataset-specific client .WAR, using settings and sources in
# /root/knetminer-build (eg, /root/knetminer-build/species/arabidopsis). Then it runs the server/client .war files within
# the Tomcat server in the container. So, the image is dataset-independent, while the container depends on the dataset
# directory (usually under <codebase>/species) that is passed to the container.
#
ENV knet_build_dir=/root/knetminer-build \
		knet_data_dir=/root/knetminer-data

# This is the default dataset used to populate the aratiny example.
ENV sample_oxl_url=https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/default.oxl

# ---- Here we go
# 

WORKDIR $knet_data_dir
ADD $sample_oxl_url $knet_data_dir/knowledge-network.oxl

WORKDIR $knet_build_dir

# If this is run in dev mode, we need 'docker build -f .' from the knetminer root directory, since
# climbing up the host paths is forbidden
COPY . knetminer

WORKDIR knetminer/common/quickstart
RUN ./build-helper.sh '' '' "$tomcat_password"

ENTRYPOINT ["./runtime-helper.sh", ""] 

