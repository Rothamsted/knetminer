#!/bin/sh -e
nohup /usr/java/latest/bin/java -Xmx14G -jar qtlnetminer-server.jar SolKNET.oxl >> stdout.log 2>> stderr.log &
