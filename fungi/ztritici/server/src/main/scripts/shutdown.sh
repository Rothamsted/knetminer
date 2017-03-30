#!/bin/sh -e
kill `ps -ef | grep qtlnetminer-server-zt.jar | grep -v grep | awk '{ print $2 }'`
#kill `ps -ef | grep qtlnetminer-server.jar | grep -v grep | awk '{ print $2 }'`
