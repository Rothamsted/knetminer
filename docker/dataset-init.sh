#!/usr/bin/env bash
#

set -e

if [[ "$1" == '--help' ]] || [[ "$1" == '-h' ]]; then
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

target_dir="$1"
dataset_id="$2"

cd "`dirname "$0"`"
mydir=`pwd`

cd ..

echo -e "\n\n\tWorking on \"$dataset_id\", from $dataset_id\n"

if [[ -e "$target_dir" ]]; then
	if ! `$force_flag`; then
		echo -e "\n  Refusing to override existing target \"$target_dir\", use --force to override it"
		exit 1
	fi
	echo -e "\n  Updating exisint targed dir\n"
else
	echo -e "\n  Creating target dir \"$target_dir\"\n"
	mkdir "$target_dir"
fi


echo -e "\n  Copying config defaults\n"
cp -Rf aratiny/aratiny-ws/src/test/resources/knetminer-dataset/config "$target_dir"

# Remove files that are used for tests only
for f in data-source.xml.old
do 
	rm -Rf "$target_dir/$f"
done

echo -e "\n  Adding specific config files from $dataset_id\n"
cp -Rf "datasets/$dataset_id/config" "$target_dir"

echo -e "\n  Creating default directories\n"
mkdir -p "$target_dir/data"


echo -e "\n  All done!\n"
