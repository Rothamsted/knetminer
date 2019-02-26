#!/bin/bash

IMAGE_NAME="knetminer-fusarium-v3.0"

cp ../../../common/quickstart/Dockerfile-local .

docker image build \
    	--build-arg tax_id=5518  \
    	--build-arg species_name="Fusarium graminearum" \
    	--build-arg species_link_name=gramiknet \
    	--build-arg keywords="fusarium, f.graminearum, knetminer, quickstart, demo" \
    	--build-arg description="Fusarium Knetminer" \
    	--build-arg reference_genome=true \
  --build-arg oxl_file="FungiKNET.oxl" \
  --build-arg knetminer_port=8081 \
  --squash -t $IMAGE_NAME \
  -f Dockerfile-local .

if [ $? -eq 0 ]; then
	#rm Dockerfile-local
	echo "You can run this Docker using: docker run -p8080:8080 -it --rm $IMAGE_NAME"
	echo "Then access it at http://localhost:8080/client/"
	echo "Note: port 8080 is the Tomcat default; replace with the knetminer_port defined in this file"
fi
