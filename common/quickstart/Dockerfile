FROM knetminer/knetminer-base

EXPOSE 8080

ENV sample_oxl_url=https://s3.eu-west-2.amazonaws.com/nfventures-testing.knetminer/default.oxl

# working dirs are: 
# - configuration and .war files go to /root/knetminer-config
# 
# - data go to /root/knetminer-data
#   - These are mounted as a dataset-specific volume, if you don't map any volume to these dir, the container
#   we'll use the VM directories, which contains the defaults we copy there from this Dockerfile
# 
# - builds, either made at image build stage, or at docker runtime (ie, the clients), are made into /root/knetminer-build.
#   Base files are copied/cloned into this
#   and then files from /knetminer-config/build/ are used to override such defaults. Again, these files
#   are either a sample client (taken from the VM's directory), or dataset-specific client files (taken from
#   the mounted volume).
#
# - common config goes to    

ENV knet_build_dir=/root/knetminer-build \
		knet_data_dir=/root/knetminer-data

# TODO: remove ENV knet_cfg_dir=/root/knetminer-config
# TODO: remove ENV knet_web_dir="$knet_cfg_dir/web"

# ---- Here we go
# 

WORKDIR $knet_data_dir
ADD $sample_oxl_url $knet_data_dir/knowledge-network.oxl

WORKDIR $knet_build_dir

# If this is run in dev mode, we need 'docker build -f .' from the knetminer root directory, since
# climbing up the host paths is forbidden 
COPY . knetminer

WORKDIR knetminer/common/quickstart

RUN ./docker-build-helper.sh

CMD [ "./docker-runtime-helper.sh" ]
