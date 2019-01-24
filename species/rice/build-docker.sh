#!/bin/bash

IMAGE_NAME="knetminer-rice"

cp ../common/quickstart/Dockerfile-local .

docker image build \
    	--build-arg tax_id=39947  \
    	--build-arg species_name="Oryza sativa Japonica" \
    	--build-arg species_link_name=rice \
    	--build-arg keywords="rice, o.sativa, knetminer, quickstart, demo" \
    	--build-arg description="Rice Knetminer" \
    	--build-arg reference_genome=true \
  --build-arg git_branch=`git branch | grep \* | cut -d ' ' -f2` \
  --build-arg oxl_file_name="RiceKNET.oxl" \
  --build-arg knetminer_port=8081 \
  --squash -t $IMAGE_NAME \
  -f Dockerfile-local .

if [ $? -eq 0 ]; then
	rm Dockerfile-local
	echo "You can run this Docker using: docker run -p8080:8080 -it --rm $IMAGE_NAME"
	echo "Then access it at http://localhost:8080/client/"
	echo "Note: port 8080 is the Tomcat default; replace with the knetminer_port defined in this file"
fi
