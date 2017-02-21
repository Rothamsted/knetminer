#!/bin/sh -e
nohup /usr/java/latest/bin/java -Xmx24G -jar qtlnetminer-server.jar ArabidopsisKNET_201702.oxl >> stdout.log 2>> stderr.log &
