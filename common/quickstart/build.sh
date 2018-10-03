#!/bin/bash

### Make note of CWD and mode

QSDIR=$PWD
KNETMINERDIR=$QSDIR/../..

### Detect Linux type
which rpm
if [ $? -eq 0 ]; then
  LINUX="redhat"
else
  LINUX="debian"  # assumption!
fi

### Configuration

DEFAULT="docker"
read -e -p "Mode? [DOCKER|aws] " MODE
MODE=${MODE:-${DEFAULT}}
MODE=$(echo "$MODE" | tr '[:upper:]' '[:lower:]')  

DEFAULT=$HOME/default.oxl
read -e -p "Location of OXL file? [$DEFAULT] " OXLFILE
OXLFILE=${OXLFILE:-${DEFAULT}}

DEFAULT=$HOME/SemanticMotifs.txt
read -e -p "Location of SemanticMotifs.txt? [$DEFAULT] " SEMANTICFILE
SEMANTICFILE=${SEMANTICFILE:-${DEFAULT}}

DEFAULT="y"
read -e -p "Data includes reference genome? [Y/n] " REFGENOME
REFGENOME=${REFGENOME:-${DEFAULT}}
REFGENOME=$(echo "$REFGENOME" | tr '[:upper:]' '[:lower:]')  
if [[ "$REFGENOME" == "y" ]]; then
  REFGENOME="true"
else
  REFGENOME="false"
fi

read -e -p "Species tax ID? " TAXID

if [[ "$MODE" == "docker" ]]; then
  DEFAULT="n"
  DEFAULTTXT="[y/N]"
else
  DEFAULT="y"
  DEFAULTTXT="[Y/n]"
fi
read -e -p "Install OS dependencies (requires sudo permission)? $DEFAULTTXT " INSTALLDEPS
INSTALLDEPS=${INSTALLDEPS:-${DEFAULT}}
INSTALLDEPS=$(echo "$INSTALLDEPS" | tr '[:upper:]' '[:lower:]')  

### Copy SemanticMotifs.txt into place

cp $SEMANTICFILE $QSDIR/datasource/src/main/resources/SemanticMotifs.txt

### (AWS only) if OXL location is URL, download it, update OXL location param
if [[ "$MODE" == "aws" ]]; then
  DATAPATH=$HOME/knetminer-data
  regex='(https?|ftp|file)://.*'
  if [[ "$OXLFILE" =~ $regex ]]; then
    NEWOXLFILE=$DATAPATH/data.oxl
    wget -O $NEWOXLFILE $OXLFILE 
    OXLFILEPATH=$NEWOXLFILE
  else 
    OXLFILEPATH=$OXLFILE
  fi
fi

### (Docker only) Make temp dir and copy OXL into it, cd into it, update OXL location param
if [[ "$MODE" == "docker" ]]; then
  DATAPATH=/root
  TEMPDIR=`mktemp -d`
  trap "{ cd $HOME ; rm -rf $TEMPDIR; exit 255; }" SIGINT
  NEWOXLFILE=$TEMPDIR/data.oxl
  cp $OXLFILE $NEWOXLFILE
  OXLFILE=$NEWOXLFILE
  OXLFILEPATH=$DATAPATH/data.oxl
  cp $QSDIR/Dockerfile.template $TEMPDIR/Dockerfile
  sed -e "s/!!OXLFILE!!/data.oxl/g" -i '' $TEMPDIR/Dockerfile
  sed -e "s/!!OXLFILEPATH!!/\/root\/data.oxl/g" -i '' $TEMPDIR/Dockerfile
fi

### Apply configuration changes

cd $QSDIR
for FILENAME in datasource/src/main/resources/config.xml client/src/main/webapp/html/javascript/utils-config.js; do
  cp $FILENAME.template $FILENAME
  for VARNAME in DATAPATH OXLFILEPATH REFGENOME TAXID; do
    VARESC="${!VARNAME//\//\\/}"
    sed -e "s/!!$VARNAME!!/$VARESC/g" -i '' $FILENAME
  done
done

### Run dependency installation 
if [[ "$INSTALLDEPS" == "y" ]]; then
  if [[ "$LINUX" == "redhat" ]]; then
    sudo yum -y update
    sudo yum install -y java-1.8.0-openjdk-devel
    cd $HOME
    wget http://www-us.apache.org/dist/maven/maven-3/3.5.4/binaries/apache-maven-3.5.4-bin.tar.gz
    tar zxf apache-maven-3.5.4-bin.tar.gz
    export M2_HOME=$HOME/apache-maven-3.5.4
    export PATH=${M2_HOME}/bin:${PATH}
    curl --silent --location https://rpm.nodesource.com/setup_10.x | sudo bash -
  else
    sudo add-apt-repository ppa:openjdk-r/ppa
    sudo apt-get update -y
    sudo apt-get install openjdk-8-jdk -y
    sudo apt-get install npm maven -y
  fi
  npm install bower -g
fi

### Maven install from top-level

cd $KNETMINERDIR
mvn clean install

### (Docker only) Run Docker image build from TEMPDIR context, label, tag, and display Docker run command

if [[ "$MODE" == 'docker' ]]; then
  cd $TEMPDIR
  cp $QSDIR/*/target/*.war .
  docker image build -t knetminer .
  IMAGEID=`docker images -q knetminer`
  rm -rf $TEMPDIR

  echo "Docker build complete"
  echo "Run the docker image using: docker run -p 8080:8080 -it --rm $IMAGEID"
  echo "Once running, access KnetMiner at: http://localhost:8080/client/"
  exit 0
fi

### (AWS only from this point)

### Download and unpack Tomcat

cd $HOME
wget http://mirrors.ukfast.co.uk/sites/ftp.apache.org/tomcat/tomcat-7/v7.0.91/bin/apache-tomcat-7.0.91.tar.gz
tar zxf apache-tomcat-7.0.91.tar.gz

### Set up Tomcat startup script

sudo echo > /etc/init.d/tomcat << EOF
#!/bin/bash
### BEGIN INIT INFO
# Provides: tomcat7
# Required-Start: $network
# Required-Stop: $network
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6
# Short-Description: Start/Stop Tomcat server
### END INIT INFO
PATH=/sbin:/bin:/usr/sbin:/usr/bin
start() {
sh $HOME/apache-tomcat-7.0.91/bin/startup.sh
}
stop() {
sh $HOME/apache-tomcat-7.0.91/bin/shutdown.sh
}
case \$1 in
start|stop) \$1;;
restart) stop; start;;
*) echo "Run as \$0 "; exit 1;;
esac
EOF
sudo chmod 755 /etc/init.d/tomcat
sudo update-rc.d tomcat defaults

### Copy WARs into Tomcat

cp $QSDIR/*/target/*.war $HOME/apache-tomcat-7.0.91/webapps

### Start Tomcat

sudo /etc/init.d/tomcat start

### Inform user of acces URL

AWSURL=`curl -s http://169.254.169.254/latest/meta-data/public-hostname`
echo "AWS build complete"
echo "Access KnetMiner at: http://$AWSURL:8080/client/"
exit 0
