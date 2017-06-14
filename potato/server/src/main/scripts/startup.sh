#!/bin/sh -e
umask 022
nohup /usr/java/latest/bin/java -Xmx12G -jar qtlnetminer-server.jar PotatoKNET_201705.oxl >> stdout.log 2>> stderr.log &
