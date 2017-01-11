#!/bin/sh -e
nohup java -Xmx24G -jar qtlnetminer-server.jar WheatKNET-v2.oxl >> stdout.log 2>> stderr.log &
