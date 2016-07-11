

# VM Setup Guide

This is just a quick note on how I setup the virtualbox VM to run QTLNetMiner and test out the GeneMap component. More infomation on QTLNetMiner can be found [here](https://github.com/KeywanHP/QTLNetMiner/wiki).

## Setting the configuration files

Two files need to be changed, `utils-config.js` in the client component and `config.xml` in the server component.

The `C:\code\QTLNetMiner\poplar\client\src\main\webapp\html\javascript\utils-config.js` file should be changed so that the data_url value points to the correct path, for the vagrant VM this should be `http://localhost:8888/test_data/`

The `C:\code\QTLNetMiner\poplar\server\src\main\resources\config.xml` file should be changed so that the DataPath points to the correct path on the server for the data directory, for the Vagrant VM this is `home/vagrant/test_data/`.

## Building the GeneMap component

First you will need to build the files from the source, after checkout go to the `GeneMap` directory and run:

    npm install
    bower install

To install the dependencies then you can run:

    gulp optimise

This will populate the `dist` folder with the combined and minified JavaScript and CSS.

## Building the client and server components

I ran into issues running maven on Ubuntu so I ended up using it on windows. Assuming maven is istalled to `C:\apache-maven-3.3.9` and the repository is checked out to `C:\code\qtl` you can open up a terminal, navigate to the `C:\code\qtl\common` directory and run run:

    C:\apache-maven-3.3.9\bin\mvn install

This should build the common package and install it to your local repository. You can then build the packages for one of the genomes by navigating to that genomes directory in the repository and running:

    C:\apache-maven-3.3.9\bin\mvn package

For example to build the poplar components you would navigate to the `C:\code\qtl\poplar` directory.

Once done you should have a .zip of the server code in the file `C:\code\qtl\poplar\server\target\poplar-server-0.5.0-SNAPSHOT-packaged-distro.zip` and a .war file for the client `C:\code\qtl\poplar\client\target\QTLNetMinerPoplar.war`.

## Vagrant VM

To setup the vagrant VM run the provisioning defined by the vagrant file. This should:
 - Install the latest JDK
 - Install tomcat to /opt/tomcat
 - Copy the server.xml and tomcat-users.xml files to the newly installed tomcat directory. This should setup an 'admin' user (with password 'admin') for the management interface and serve the `/home/vagrant/test_data` path on the `/test_data` folder.

Once installed you can start the tomcat server with the `/opt/tomcat/bin/catalina.sh start` command.

To run the server component unzip the server code somewhere on the VM (or in the C:\code\qtl directory which is automatically mapped to the /vagrant directory on the VM). You will also need the .oxl file in the same directory, some of these can be downloaded from the https://ondex.rothamsted.ac.uk/ site, e.g.: https://ondex.rothamsted.ac.uk/QTLNetMiner/releasenotes/xnets/poplarnet/Poplar_v3_KB2014.oxl.

Then navigate to the unzipped directory and run `. startup.sh`. This process will require a lot of RAM. The process takes a while to startup but you should know it is ready when the message `Done. Waiting for queries...` appears in the `stdout.log` file.

The tomcat management site should be available on http://localhost:8888/, click on 'Manage App' and login with the admin account (pw: 'admin'). You can now browse to the client .war file and deploy the application.
