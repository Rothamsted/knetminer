#!/bin/sh -e
nohup java -Xmx12G -jar qtlnetminer-server.jar B_oleracea_TO1000_v1.oxl >> stdout.log 2>> stderr.log &
