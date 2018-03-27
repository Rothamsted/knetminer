#!/bin/sh -e
umask 022
nohup java -Xmx28G -jar qtlnetminer-server.jar Wheat_v1.0_noGenie.oxl >> stdout.log 2>> stderr.log &
