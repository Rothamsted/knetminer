#!/bin/sh -e
umask 022
nohup java -Xmx28G -jar qtlnetminer-server.jar WheatKNET.oxl >> stdout.log 2>> stderr.log &
