#!/bin/sh -e
nohup /usr/java/latest/bin/java -Xmx24G -jar qtlnetminer-server.jar WillowKNET.oxl >> stdout.log 2>> stderr.log &
