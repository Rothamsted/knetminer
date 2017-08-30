#!/bin/sh -e
umask 022
nohup /usr/java/latest/bin/java -Xmx14G -jar qtlnetminer-server-fg.jar FungiKNET.oxl >> stdout.log 2>> stderr.log &
