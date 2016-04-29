#!/bin/sh -e
nohup java -Xmx12G -jar qtlnetminer-server.jar khp.oxl >> stdout.log 2>> stderr.log &
