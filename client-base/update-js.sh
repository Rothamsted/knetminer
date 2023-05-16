# Updates the Javascript (and alike) dependencies needed by Knetminer.
#
# This is to be executed manually when required, ie, when third-party Javascript dependencies are
# updated. 
#
# You can run this against a single package only, see below.
#
# TODO: this approach isn't ideal, since it would be better to download these dependencies at every build.
# For the moment, we choose the more practical solution, which avoids Windows incompatibilities like 
# Bash scripts (or worse, having to write portable scripts).
#

set -e

TRNSF="/bin/cp -R -P -p -v" 

wdir=`pwd`
cd `dirname "$0"`

mkdir -p target/tmp

# Does all the work for a single package.
#
# See below for the parameters
#
function deploy_npm ()
{
	if [[ "$#" -lt 2 ]]; then
		echo -e "\n deploy_npm() needs the target and the package name at least\n"
		exit 1
	fi
	
	# The NPM/git URL for the NPM package
  npm_url="$1"
  
  # The package name (without version)
  npm_name="$2"

	# The name to use locally (optional)
  local_name="${3:-$npm_name}"

  # The path inside the .tgz where the distro files are. The default is the most common place, but
  # some vary.
  dist_dir="${4:-package/dist}" 
  
  echo -e "\n Downloading $npm_name\n"
  cd target/tmp
  rm -Rf "$npm_name"
  mkdir "$npm_name"
  rm -Rf "$npm_name"*.tgz
  
  # TODO: it's the only practical and versatile way I know
  npm pack "$npm_url"

  echo -e "\n Extracting $npm_name\n"
	tar xv --gzip -f "$npm_name"*.tgz --directory "$npm_name" "$dist_dir"
	
	mvn_dest="src/main/generated/webapp/html/lib/$local_name"
	
  echo -e "\n Deploying on \"$mvn_dest\"\n"
	cd ../.. # at pom.xml level
	rm -Rf "$mvn_dest"
  $TRNSF "target/tmp/$npm_name/$dist_dir" "$mvn_dest"
  
  echo -e "\n\n $npm_name deployed\n" 	
}

if [[ "$#" > 1 ]]; then
  # If the CLI has parameters, run it for a single package, as specified by the user.
  # The parameters are the same as deploy_npm()
  #
  deploy_npm $1 $2 $3 $4
else
	# TODO: this branch DOES NOT work completely at the moment, we still need to merge changes from
	# knetmaps-plus
	deploy_npm "https://github.com/Rothamsted/knetmaps.js#2.2.1-RC.1" knetmaps 
	deploy_npm "https://github.com/Rothamsted/genomaps.js.git#v2.0.0-RC.1" genomaps
	
	# TODO: it is expected that this will be dragged in by knetmaps.js, see knetmaps-plus
	deploy_npm "jquery-ui-dist@1.12.1" 'jquery-ui-dist' 'jquery-ui' 'package'
	
	deploy_npm "jbox@1.0.6" jbox
	
	deploy_npm "tablesorter@2.31.3" tablesorter jquery-tablesorter 
fi

cd "$wdir"
echo -e "\n\n All done\n"
