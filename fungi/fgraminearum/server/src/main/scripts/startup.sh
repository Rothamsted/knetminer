#!/bin/sh -e
nohup /usr/java/latest/bin/java -Xmx15G -jar qtlnetminer-server-fg.jar FungiKNET.oxl >> stdout.log 2>> stderr.log &
