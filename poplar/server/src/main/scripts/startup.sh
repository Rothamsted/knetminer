#!/bin/sh -e
umask 022
nohup java -Xmx12G -jar qtlnetminer-server.jar PoplarKNET_201705.oxl >> stdout.log 2>> stderr.log &
