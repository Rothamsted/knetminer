#!/bin/sh -e
umask 022
nohup /usr/java/latest/bin/java -Xmx8G -jar qtlnetminer-server.jar RiceKNET.oxl >> stdout.log 2>> stderr.log &
