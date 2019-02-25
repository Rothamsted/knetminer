#!/bin/bash

IMAGE_NAME="knetminer-zymoseptoria-v3.0"

cp ../../../common/quickstart/Dockerfile-local .

docker image build \
    	--build-arg tax_id=336722  \
    	--build-arg species_name="Zymoseptoria tritici" \
    	--build-arg species_link_name=zymoknet \
    	--build-arg keywords="zymoseptoria, z.tritici, knetminer, quickstart, demo" \
    	--build-arg description="Zymoseptoria Knetminer" \
    	--build-arg reference_genome=true \
  --build-arg oxl_file="FungiKNET.oxl" \
  --build-arg knetminer_port=8082 \
  --squash -t $IMAGE_NAME \
  -f Dockerfile-local .

if [ $? -eq 0 ]; then
	#rm Dockerfile-local
	echo "You can run this Docker using: docker run -p8080:8080 -it --rm $IMAGE_NAME"
	echo "Then access it at http://localhost:8080/client/"
	echo "Note: port 8080 is the Tomcat default; replace with the knetminer_port defined in this file"
fi
