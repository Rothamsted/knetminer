#!/bin/sh -e
nohup java -Xmx12G -jar qtlnetminer-server.jar Poplar_v3_KB2014.oxl >> stdout.log 2>> stderr.log &
