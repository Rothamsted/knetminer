#!/bin/bash

IMAGE_NAME="knetminer-wheat-dev"

SPECIES_DIR=`pwd | rev | cut -d '/' -f1 | rev`
cd ..
cp .dockerignore-template .dockerignore
cat .gitignore >> .dockerignore
ls -1 | grep -v $SPECIES_DIR | grep -v pom.xml | grep -v common >> .dockerignore

docker image build \
    	--build-arg tax_id=4565  \
    	--build-arg species_name="Triticum aestivum" \
    	--build-arg species_link_name=wheat \
    	--build-arg keywords="wheat, t.aestivum, knetminer, quickstart, demo" \
    	--build-arg description="Knetminer Wheat" \
    	--build-arg reference_genome=true \
  --build-arg species_dir="$SPECIES_DIR" \
  --build-arg knetminer_port=8080 \
  --squash -t $IMAGE_NAME \
  -f common/quickstart/Dockerfile-dev .

if [ $? -eq 0 ]; then
	rm .dockerignore
	cd $SPECIES_DIR
	echo "You can run this Docker using: docker run -p8080:8080 -it --rm $IMAGE_NAME"
	echo "Then access it at http://localhost:8080/client/"
	echo "Note: port 8080 is the Tomcat default; replace with the knetminer_port defined in this file"
fi
