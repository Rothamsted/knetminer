#!/bin/sh -e
umask 022
nohup /usr/java/latest/bin/java -Xmx7G -jar qtlnetminer-server-zt.jar FungiKNET.oxl >> stdout.log 2>> stderr.log &
