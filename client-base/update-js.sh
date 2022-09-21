# Updates the Javascript dependencies needed by Knetminer
# This is to be executed manually, when required, ie, third party Javascript dependencies are
# updated. 
# 
# TODO: this approach isn't ideal, since it would be better to download these dependencies at every build.
# For the moment, we choose the more practical solution, which avoids Windows incompatibilities like 
# Bash scripts (or worse, having to write portable scripts).
#

set -e

TRNSF="/bin/cp -R -P -p -v" 

mydir=`pwd`
cd `dirname "$0"`
wdir=`pwd`

mkdir -p target/tmp

function deploy_npm
{
	[[ "$#" -ge 2 ]] && { echo -e "\n deploy_npm needs the target and the package name at least\n"; exit 1 }
  npm_target="$1"
  npm_name="$2"
  local_name="${3:-$npm_name}"
  
  echo -e "\n Downloading $npm_name\n"
  cd target/tmp
  mkdir -p "npm_name"
  # TODO: it's the only practical and versatile way I know
  npm pack "$npm_url"

  echo -e "\n Extracting $npm_name\n"
	tar xv --gzip -f "$npm_name"*.tgz --directory "$npm_name" package/dist
	
	mvn_dest="src/generated/$local_name"
  echo -e "\n Deploying on \"mvn_dest\"\n"
	cd .. # at pom.xml level
	rm -Rf "$mvn_dest"
  $TRNSF package/dist "$mvn_dest"
  
  echo -e "\n\n $npm_name deployed\n" 
}

# TODO: move to the master branch when possible
deploy_npm "https://github.com/Rothamsted/knetmaps.js#202204_upgrades" knetmaps
deploy_npm "https://github.com/Rothamsted/genomaps.js.git#202204_upgrades" genomaps
