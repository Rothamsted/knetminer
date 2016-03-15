#!/bin/sh -e
nohup java -Xmx12G -jar qtlnetminer-server.jar DrosophillaKB_v1.oxl >> stdout.log 2>> stderr.log &
