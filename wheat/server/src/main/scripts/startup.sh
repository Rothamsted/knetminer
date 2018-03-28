#!/bin/sh -e
umask 022
nohup java -Xmx30G -jar qtlnetminer-server.jar WheatKNET_v1.0.oxl >> stdout.log 2>> stderr.log &
