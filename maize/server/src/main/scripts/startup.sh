#!/bin/sh -e
nohup java -Xmx24G -jar qtlnetminer-server.jar MaizeKNET_201705.oxl >> stdout.log 2>> stderr.log &
