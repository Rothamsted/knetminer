#!/bin/sh -e
umask 022
nohup /usr/java/latest/bin/java -Xmx12G -jar qtlnetminer-server.jar Barley_WGSMorex_Mips_KB2013.oxl >> stdout.log 2>> stderr.log &
