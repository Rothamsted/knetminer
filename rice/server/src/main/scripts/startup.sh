#!/bin/sh -e
umask 022
nohup /usr/java/latest/bin/java -Xmx4G -jar qtlnetminer-server.jar RiceKNET_201707.oxl >> stdout.log 2>> stderr.log &
