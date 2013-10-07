#!/bin/sh -e
nohup /usr/java/latest/bin/java -Xmx12G -jar qtlnetminer-server.jar PoplarKB2012_DoonanRef.oxl >> stdout.log 2>> stderr.log &
