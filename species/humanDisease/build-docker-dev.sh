#!/bin/bash

IMAGE_NAME="knetminer-arabidopsis-dev"

SPECIES_DIR=`pwd | rev | cut -d '/' -f1 | rev`
cd ..
cp .dockerignore-template .dockerignore
cat .gitignore >> .dockerignore
ls -1 | grep -v species/$SPECIES_DIR | grep -v pom.xml | grep -v common >> .dockerignore

docker image build \
    	--build-arg tax_id=9606  \
    	--build-arg species_name="Neurodegenerative Diseases" \
    	--build-arg species_link_name=humanDisease \
    	--build-arg keywords="human, humanDisease, knetminer, quickstart, demo" \
    	--build-arg description="HumanDisease Knetminer" \
    	--build-arg reference_genome=true \
  --build-arg species_dir="species/$SPECIES_DIR" \
  --build-arg oxl_file_name="NeuroDiseaseKnet.oxl" \
  --build-arg knetminer_port=8080 \
  --squash -t $IMAGE_NAME \
  -f common/quickstart/Dockerfile-dev .

if [ $? -eq 0 ]; then
	rm .dockerignore
	cd species/$SPECIES_DIR
	echo "You can run this Docker using: docker run -p8080:8080 -it --rm $IMAGE_NAME"
	echo "Then access it at http://localhost:8080/client/"
	echo "Note: port 8080 is the Tomcat default; replace with the knetminer_port defined in this file"
fi
