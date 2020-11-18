# Helper for the AWS specific host, to run a datasets/dataset instance of the Knetminer Docker container with AWS logging.
#
# See https://github.com/Rothamsted/knetminer/wiki/8.-Docker for details. See https://github.com/Rothamsted/knetminer/wiki/3.-Deploying-KnetMiner-with-Docker#deploying-with-aws-analytics-enabled for additional help.

# Set the default directory
cd "$(dirname "$0")"
# Get the initial arguments & make sure it's the aws flag - More flags can be added here
aws_flag="$1"; 
aws_dir="$2"; shift;

if [ "$aws_flag" != "--aws" ]; then 
	echo -e "\nIncorrect flag given, you must give the --aws flag first!\n\nExiting script\n"
	exit 1
fi

[ "$DOCKER_OPTS" == "" ] && DOCKER_OPTS="-it" # These are useful defaults

# Make sure the directory and files exist!
if [ -d "$aws_dir" ]; then
	if [ -f "$aws_dir/.aws/credentials" ] && [ -f "$aws_dir/analytics-s3-sync.sh" ]; then
		DOCKER_OPTS="$DOCKER_OPTS -v $aws_dir/.aws/credentials:/root/.aws/credentials:ro" 
		# Added as a check so we know whether to run crond or not - it'll check to see this volume exists
		DOCKER_OPTS="$DOCKER_OPTS -v $aws_dir/.aws/credentials:/root/knetminer-build/knetminer/docker/.aws/credentials:ro" 
		DOCKER_OPTS="$DOCKER_OPTS -v $aws_dir/analytics-s3-sync.sh:/root/knetminer-build/knetminer/docker/analytics-s3-sync.sh" 
	else
		echo -e "\n\nCan't find the correct file(s) in the directory ("$aws_dir") given.\n" 
		echo -e "Please check that you have the "$aws_dir"/.aws/credentials and "$aws_dir"/analytics-s3-sync.sh files present in this directory\n\nExiting script\n"; 
		exit 1;
	fi
else
	echo -e "\n\nIncorrect file directory ("$aws_dir") given, please check your AWS file directory\n\nExiting script\n"; 
	exit 1;
fi

export DOCKER_OPTS

# Change the array index when adding additional arguments in future
./docker-run.sh  "${@:2}"
