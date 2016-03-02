#! /usr/bin/env bash

set +x

echo "--------------------------------------------------------------------------------"
echo "updating apt-get packages"
echo "--------------------------------------------------------------------------------"
sudo apt-get update > ~/apt-get-update.log

sudo apt-get -y install default-jdk
sudo apt-get -y install unzip wget
sudo apt-get -y install maven

wget http://mirror.vorboss.net/apache/tomcat/tomcat-8/v8.0.32/bin/apache-tomcat-8.0.32.tar.gz

tar xvzf apache-tomcat-8.0.32.tar.gz

sudo mv apache-tomcat-8.0.32 /opt/tomcat

echo 'export JAVA_HOME=/usr/lib/jvm/default-java/' >> ~/.bashrc
echo 'export CATALINA_HOME=/opt/tomcat' >> ~/.bashrc

. ~/.bashrc

sudo cp /vagrant/tomcat-users.xml $CATALINA_HOME/conf/tomcat-users.xml
mkdir ~/test_data
sudo cp /vagrant/server.xml $CATALINA_HOME/conf/server.xml
