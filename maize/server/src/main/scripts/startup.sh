#!/bin/sh -e
nohup java -Xmx24G -jar qtlnetminer-server.jar MaizeKNET.oxl >> stdout.log 2>> stderr.log &
