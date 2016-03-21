#!/bin/sh -e
nohup java -Xmx12G -jar qtlnetminer-server.jar DrosophillaKB_v2.oxl >> stdout.log 2>> stderr.log &
