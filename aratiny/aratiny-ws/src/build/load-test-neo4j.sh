#!/usr/bin/env bash
# Simple wrapper to load Neo4j from the test dump.
# Used by the project's POM
#
set -e

cd `dirname "$0"`
mydir=`pwd`

cd ../..
data_target_dir="`pwd`/target/dependency/"

printf "\n\n  Loading the test database into the test Neo4j server\n\n"

cd target/neo4j.server/neo4j-community-*
bin/neo4j-admin database load --from-stdin --overwrite-destination=true neo4j <"$data_target_dir/poaceae-sample-neo4j.dump"

printf "\n\n Done.\n\n"
