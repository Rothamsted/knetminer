#!/bin/sh -e
nohup java -Xmx24G -jar qtlnetminer-server.jar WheatNet_2014.oxl >> stdout.log 2>> stderr.log &
