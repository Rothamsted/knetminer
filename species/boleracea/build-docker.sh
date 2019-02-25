#!/bin/bash

IMAGE_NAME="knetminer-boleracea-v3.0"

cp ../../common/quickstart/Dockerfile-local .

docker image build \
    	--build-arg tax_id=109376  \
    	--build-arg species_name="B. oleracea cv. TO1000" \
    	--build-arg species_link_name=boleraceaknet \
    	--build-arg keywords="boleracea, b.oleracea, knetminer, quickstart, demo" \
    	--build-arg description="Boleracea Knetminer" \
    	--build-arg reference_genome=true \
  --build-arg oxl_file="BoleraceaKNET.oxl" \
  --build-arg knetminer_port=8080 \
  --squash -t $IMAGE_NAME \
  -f Dockerfile-local .

if [ $? -eq 0 ]; then
	#rm Dockerfile-local
	echo "You can run this Docker using: docker run -p8080:8080 -it --rm $IMAGE_NAME"
	echo "Then access it at http://localhost:8080/client/"
	echo "Note: port 8080 is the Tomcat default; replace with the knetminer_port defined in this file"
fi
