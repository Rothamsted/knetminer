#!/bin/sh -e
nohup /usr/java/latest/bin/java -Xmx12G -jar qtlnetminer-server.jar SolKNET_201705.oxl >> stdout.log 2>> stderr.log &
