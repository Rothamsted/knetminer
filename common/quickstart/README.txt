The steps below are common to both Docker and AWS. For Docker, checkout the source code locally as 'knetminer'. For
AWS, fire up the KnetMiner Quickstart AMI (with ports 23 and 8080 exposed) and ssh in to it as the 'ubuntu' user, where
you will find the code already checked out in the 'knetminer' folder in your home directory.

The first thing you need to do is configure the species you want to serve with KnetMiner Quickstart:

  1. Set up your environment:
    a. On DOCKER only:
      i. Change directory to knetminer/common
      ii. Run 'mvn clean install'
    b. On AWS only:
      i. Start an EC2 server using the KnetMiner QuickStart AMI and ssh into it as the 'ubuntu' user
  2. Copy your OXL file to the correct location:  (the filename is also important, not just the location!)
    a. On DOCKER only:
      knetminer/common/quickstart.oxl
    b. On AWS only:
      /home/ubuntu/quickstart.oxl
  3. Change directory to knetminer/common/quickstart
  4. Edit the following files and make sure they are correct:
    a. datasource/src/main/resources/SemanticMotifs.txt
    b. client/src/main/webapp/html/data/basemap.xml
    c. client/src/main/webapp/html/index.jsp  (the chromosomes list should match those in basemap.xml)
  5. Run 'mvn clean package' _after_ editing the files in step 4

TO START THE KNETMINER SERVER WITH DOCKER...
    docker image build .
      (will output an <imageID>)
      (you can distribute this in the same way you would any other Docker image)
    docker run -it --rm -p 8080:8080 <imageID>  (use <imageID> from run command above)
      (then point your browser at http://localhost:8080/client/ )
      (or to access the web service directly, e.g. http://localhost:8080/ws/quickstart/genepage?keyword=dormancy&list=ABC123 )

TO START THE KNETMINER SERVER WITH AWS...
    sudo cp */target/*.war /usr/share/tomcat/webapps/
      (then point your browser at http://<EC2HOSTNAME>:8080/client/  - it might take a minute or two before this works)
      (or to access the web service directly, e.g. http://<EC2HOSTNAME>:8080/ws/quickstart/genepage?keyword=dormancy&list=ABC123 )
