#!/bin/bash

IMAGE_NAME="knetminer-arabidopsis"

cp ../common/quickstart/Dockerfile-local .
docker image build \
    	--build-arg tax_id=3702  \
    	--build-arg species_name="Arabidopsis thaliana" \
    	--build-arg species_short_name=Arabidopsis \
    	--build-arg species_link_name=arabidopsis \
    	--build-arg eg_keywords="[e.g. 'disease resistance', 'xylan|cell wall']" \
    	--build-arg keywords="arabidopsis, thaliana, knetminer, quickstart, demonstration" \
    	--build-arg description="Arabidopsis Knetminer" \
    	--build-arg reference_genome=true \
  --build-arg git_branch=`git branch | grep \* | cut -d ' ' -f2` \
  --squash -t $IMAGE_NAME \
  -f Dockerfile-local .
rm Dockerfile-local

echo "You can run this Docker using: docker run -p8080:8080 -it --rm $IMAGE_NAME"
echo "Then access it at http://localhost:8080/client/"
