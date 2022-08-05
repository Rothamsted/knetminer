#!/usr/bin/env bash
#

set -e

if [[ "$1" == '--help' ]] || [[ "$1" == '-h' ]] || [[ "$#" -lt 1 ]]; then
	cat <<EOT
	
	
  Syntax: $(basename $0) [--help|-h] [--force] <target-dir> [<dataset-id>]

Initialises a dataset directory for a Knetminer instance, to be used with
docker-run.sh --dataset_dir (see the documentation).

WARNING: this requires that this script is downloaded with a full clone of the knetminer repository
(or a copy from a release).

Parameters:

* target-dir: the dataset dir, must not exist, unless you use --force  
* --force: overrides any existing default file (WARNING!). Can be useful to update defaults from
  the latest github version.
* dataset-id: the name of a dataset directory in <knetminer-repo>/datasets. This is used to 
  add dataset-specific files to the target you're initialising, which can be useful if your
  dataset is similar one of those we already manage (see documentation).

EOT
	exit 1
fi


force_flag='false'
if [[ "$1" == "--force" ]]; then
	force_flag='true'
	shift
fi

dataset_dir="$1"
dataset_id="$2"

wdir=`pwd`
cd "`dirname "$0"`"
mydir=`pwd`
cd ..
knetdir=`pwd`
cd "$wdir"

echo -e "\n\n\tWorking on \"$dataset_dir\", with dataset ID:'$dataset_id'\n"

if [[ -e "$dataset_dir" ]]; then
	if ! `$force_flag`; then
		echo -e "\n  Refusing to override existing target \"$dataset_dir\", use --force to override it\n"
		exit 1
	fi
	echo -e "\n  Updating exisint targed dir\n"
else
	echo -e "\n  Creating target dir \"$dataset_dir\"\n"
	mkdir "$dataset_dir"
fi


echo -e "\n  Copying config defaults\n"
cp -Rf "$knetdir/aratiny/aratiny-ws/src/test/resources/knetminer-dataset/config" "$dataset_dir"

# Remove files that are used for tests only
for f in data-source.xml.old
do 
	rm -Rf "$dataset_dir/$f"
done

if [[ ! -z "$dataset_id" ]]; then
	echo -e "\n  Adding specific config files from $dataset_id\n"
	cp -Rf "$knetdir/datasets/$dataset_id/config" "$dataset_dir"
fi

echo -e "\n  Creating default directories\n"
mkdir -p "$dataset_dir/data"

[[ -e "$dataset_dir/data/knowledge-network.oxl" ]] || \
  echo -e "\n  Remember you need the data file \"$dataset_dir/data/knowledge-network.oxl\"\n"

echo -e "\n  All done!\n"
