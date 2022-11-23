#!/usr/bin/env bash
set -e

if [ "$JAVA_TOOL_OPTIONS" == "" ]; then
  # So, let's set default JVM options here, unless you already have them from the outside
  # Note that this variable is part of standard Java (https://goo.gl/rrmXEX), so we don't need
  # to pass it to the java command below and possible further JVM invocations get it automatically too
  export JAVA_TOOL_OPTIONS="-Xmx2G -Dfile.encoding=UTF-8"
fi

# Enable the debugger, this is sometimes needed by developers
#JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -Xdebug -Xnoagent -Djava.compiler=NONE
#									 -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=5005"

# JMX connection to be used via SSH (map both ports) and with client tools like jvisualvm
#JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS  -Dcom.sun.management.jmxremote.ssl=false
#                    -Dcom.sun.management.jmxremote.authenticate=false
#                    -Dcom.sun.management.jmxremote.port=9010
#                    -Dcom.sun.management.jmxremote.rmi.port=9011
#                    -Djava.rmi.server.hostname=localhost
#                    -Dcom.sun.management.jmxremote.local.only=false"


# You shouldn't need to change the rest
#
###

cd `dirname "$0"`
mydir=`pwd`
cd "$workdir"

# Additional .jar files or other CLASSPATH directories can be set with this.
# (see http://kevinboone.net/classpath.html for details)  
export CLASSPATH="$CLASSPATH:$mydir:$mydir/lib/*"

# See here for an explanation about ${1+"$@"} :
# http://stackoverflow.com/questions/743454/space-in-java-command-line-arguments 

java uk.ac.rothamsted.knetminer.backend.KnetMinerInitializerCLI ${1+"$@"}

ex_code=$?

# We assume stdout is for actual output, that might be pipelined to some other command, the rest (including logging)
# goes to stderr.
# 
echo Java Finished. Quitting the Shell Too. >&2
echo >&2
exit $ex_code
