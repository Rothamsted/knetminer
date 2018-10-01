The steps below are common to both Docker and AWS. For Docker, checkout the source code locally as 'knetminer'. For
AWS, fire up the KnetMiner Quickstart AMI (with ports 23 and 8080 exposed) and ssh in to it as the 'ubuntu' user, where
you will find the code already checked out in the 'knetminer' folder in your home directory.

COMMON STEPS...

  1. Set up your environment:
    a. On DOCKER only:
      i. In the knetminer directory run 'mvn clean install'
    b. On AWS only:
      i. Start an EC2 server using the KnetMiner QuickStart AMI and ssh into it as the 'ubuntu' user
      ii. If you wish to switch to a different branch or update the knetminer code before deploying it:
        1. Change into the knetminer directory
        2. To switch to a different Git branch: 'git checkout <name of branch>'
        3. To get the latest version of the code: 'git pull'
        4. Run 'mvn clean install'
  2. Copy your OXL file to the correct location:  (the filename is also important, not just the location!)
    a. On DOCKER only:
      knetminer/common/quickstart.oxl
    b. On AWS only (using sudo cp):
      /root/quickstart.oxl
  3. Edit the following files and make sure they are correct:
    a. knetminer/common/quickstart/datasource/src/main/resources/SemanticMotifs.txt
    b. knetminer/common/quickstart/datasource/src/main/resources/config.xml  (in particular SpeciesTaxId)
    c. knetminer/common/quickstart/client/src/main/webapp/html/data/basemap.xml
    d. knetminer/common/quickstart/client/src/main/webapp/html/index.jsp
         (the chromosomes list should match those in basemap.xml)
  4. In the knetminer/common/quickstart directory run 'mvn clean package' _after_ editing the files in step 4

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
