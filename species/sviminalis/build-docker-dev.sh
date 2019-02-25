#!/bin/bash

#image name
IMAGE_NAME="knetminer-sviminalis-dev"

# current $SPECIES_DIR.
SPECIES_DIR=`pwd | rev | cut -d '/' -f1 | rev`

#copy .dockerignore-template and .gitignore settings.
cd ../..
cp .dockerignore-template .dockerignore
cat .gitignore >> .dockerignore

# add all species/ sub-folders to .dockerignore except KnetMiner/pom.xml, common/ and species/$SPECIES_DIR.
cd species/
ls -1 | grep -v $SPECIES_DIR | sed 's/^/species\//' | grep -v pom.xml | grep -v common >> .dockerignore
cd ..

#pass docker image build parameters
docker image build \
    	--build-arg tax_id=40686  \
    	--build-arg species_name="Salix viminalis" \
    	--build-arg species_link_name=willowknet \
    	--build-arg keywords="sviminalis, s.viminalis, knetminer, quickstart, demo" \
    	--build-arg description="Sviminalis Knetminer" \
    	--build-arg reference_genome=true \
  --build-arg species_dir="species/$SPECIES_DIR" \
  --build-arg oxl_file="WillowKNET.oxl" \
  --build-arg knetminer_port=8080 \
  --squash -t $IMAGE_NAME \
  -f common/quickstart/Dockerfile-dev .

#when done, remove .dockerignore and notify with instructions.
if [ $? -eq 0 ]; then
	rm .dockerignore
	cd species/$SPECIES_DIR
	echo "You can run this Docker using: docker run -p8080:8080 -it --rm $IMAGE_NAME"
	echo "Then access it at http://localhost:8080/client/"
	echo "Note: port 8080 is the Tomcat default; replace with the knetminer_port defined in this file"
fi
