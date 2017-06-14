#!/bin/sh -e
umask 022
nohup /usr/java/latest/bin/java -Xmx24G -jar qtlnetminer-server.jar ArabidopsisKNET_201705.oxl >> stdout.log 2>> stderr.log &
