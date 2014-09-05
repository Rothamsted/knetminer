#!/usr/bin/expect

####################  Description  #################
# 
# This script renames the current OXL network to a 
# backupfile and copies the new file into place.
# it also deletes the index, mapGene2Concepts and 
# mapConcept2Genes files before restarting the 
# qtlnetminer server.
# 
# to call this script the following arguments are required in order:
# Server Name 
# root password for server
# Oxl file name
# Path to directory containing new OXL file
#
# e.g. copyNetworkToServer.sh serverName secretPassword organismNetwork.oxl qtlnetminer/xnets/organismName
#
####################################################

####################  Settings  ####################

# Path to qtlnetminer directory on server
set ServerPath "/home/usern/qtlnetminer/"

####################################################


# Get arguments 

# Server Name
set ServerName [lindex $argv 0]

# root password for server
set Passwd [lindex $argv 1]

# Name of both oxl file
# Filename on server must match filename on client
set OxlFileName [lindex $argv 2]

# Path to directory containing new OXL file 
set SourcePath [lindex $argv 3]




# automatically generated backup filename adds e.g. _backup-2014-09-02.oxl to file name

set Date [exec date +%Y-%m-%d]

set FileWithoutEXT [exec echo $OxlFileName | sed "s/.oxl//"]

set BackupOxlFileName ${FileWithoutEXT}_backup-${Date}.oxl

set ReportFileName ${FileWithoutEXT}_Report.xml

set BackupReportFileName ${FileWithoutEXT}_Report_backup-${Date}.xml


##################  stop QTLNetMiner and backup current OXL file  ###########
#
# ssh into server, 
# cd to ServerPath, 
# stop current qtlnetminer server
# rename current network file with "backup" and the current date
# remove index dir, mapGene2Concepts and mapConcepts2Genes
# print Bye!
spawn ssh -oStrictHostKeyChecking=no root@$ServerName "
	cd $ServerPath;
	./shutdown.sh;
	mv $OxlFileName $BackupOxlFileName;
	mv $ReportFileName $BackupReportFileName;
	rm -rf index mapConcept2Genes mapGene2Concepts;
	echo 'Bye!'"

# input password when requested
expect "password: "
send  "$Passwd\r"



##################  copy new Network to server  ####################
#
# When Bye! is recieved all previous commands must have finished
# copy via SCP the new OXL file to the server qtlnetminer folder
expect "Bye!"
spawn scp $SourcePath/$OxlFileName $SourcePath/$ReportFileName root@$ServerName:$ServerPath


# input password when requested
expect	"password: "
send  "$Passwd\r"




#################  Restart QTLNetMiner  ###########################
#
# When 100% is seen, downlaod has completed
# ssh into server agin
# cd to ServerPath
# change permissions of new oxl file (it currently has execute permissions)
# restart qtlnetminer server
# print Bye!
expect "100%"
spawn ssh root@$ServerName "
	cd $ServerPath;
	chmod 644 $OxlFileName;
	chmod 644 $ReportFileName;
	./startup.sh;
	echo 'Bye!'"

# input password when requested
expect "password: "
send  "$Passwd\r"



# When Bye! is recieved all previous commands must have finished
# now close
expect "Bye!"
close
