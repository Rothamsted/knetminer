# This is an example of how to use the *-helper.sh scripts to build the general webapp into 
# a tomcat installation, to build a dataset-specific app into given config/data directories, and
# eventually have something that can be run by our Docker container, passing the created directory
# as a volume. 
#

knet_deploy_dir=/tmp
knet_cfg_dir=$knet_deploy_dir/knetminer-config
knet_data_dir=$knet_deploy_dir/knetminer-data

mkdir --parents "$knet_cfg_dir"
mkdir --parents "$knet_data_dir"

cp ./maven-settings.xml "$knet_cfg_dir"

# Now you just need to run our Docker container, with: TODO

# The same dir can be picked locally, but you'll need some tweaking, see below
#  
# This will deploy our ws.war into tomcat home
# 
#   - needs a proper build environment, see the Dockerfile
#   - needs web.xml redefinition with TODO
#
# tomcat_home=/Applications/local/dev/apache-tomcat-9.0.16
# cd ..
# ./docker-build-helper.sh "$knet_cfg_dir" "$tomcat_home"
# 
# And this will run the server locally, same way it's done under Docker
# 
# ./docker-runtime-helper.sh "$knet_cfg_dir" "$tomcat_home"
