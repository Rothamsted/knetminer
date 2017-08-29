#!/bin/sh -e
umask 022
nohup /usr/java/latest/bin/java -Xmx24G -jar qtlnetminer-server.jar ArabidopsisKNET.oxl >> stdout.log 2>> stderr.log &
