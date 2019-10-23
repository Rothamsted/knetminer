#!/bin/sh
cd /usr/local/tomcat/logs/
aws s3 sync . s3://knetminer-logs-test/logs --exclude='*' --include='*analytics*'
