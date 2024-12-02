set -e

printf "\n\n\n  ===== TO BE COMPLETED - DON'T USE ====\n\n"
exit 1

wget -O /tmp/download-page-utils.sh \
  https://raw.githubusercontent.com/Rothamsted/knetminer-common/master/download-page/download-page-utils.sh

. /tmp/download-page-utils.sh

wdir="$(pwd)"
cd "$(dirname "$0")"
mydir="$(pwd)"
cd "$wdir"


# Gets all the download links by chaining multiple invocations of make_doc()/Nexus-API
#
cat "$mydir/Downloads.template.md" \
| make_doc \
  maven-snapshots uk.ac.rothamsted.knetminer knetminer-initializer-cli \
  '' zip initializerSnapUrl
