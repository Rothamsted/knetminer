#!/bin/sh -e
umask 022
nohup /usr/java/latest/bin/java -Xmx6G -jar qtlnetminer-server.jar CowKB.oxl >> stdout.log 2>> stderr.log &
