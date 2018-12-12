#!/bin/bash

IMAGE_NAME="knetminer-arabidopsis"

cp ../common/quickstart/Dockerfile-local .

docker image build \
    	--build-arg tax_id=3702  \
    	--build-arg species_name="Arabidopsis thaliana" \
    	--build-arg species_link_name=arabidopsis \
    	--build-arg keywords="arabidopsis, thaliana, knetminer, quickstart, demonstration" \
    	--build-arg description="Arabidopsis Knetminer" \
    	--build-arg reference_genome=true \
  --build-arg git_branch=`git branch | grep \* | cut -d ' ' -f2` \
  --build-arg knetminer_port=8081 \
  --squash -t $IMAGE_NAME \
  -f Dockerfile-local .

if [ $? -eq 0 ]; then
	rm Dockerfile-local
	echo "You can run this Docker using: docker run -p8080:8080 -it --rm $IMAGE_NAME"
	echo "Then access it at http://localhost:8080/client/"
	echo "Note: port 8080 is the Tomcat default; replace with the knetminer_port defined in this file"
fi
