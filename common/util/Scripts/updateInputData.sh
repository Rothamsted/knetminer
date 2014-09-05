#!/bin/bash

########################  Update QTLNetMiner Source Data  ###########################################
#
# This script updates some of the source data files for the qtlnetminer databases.
#
# It will create a new folder with the current date in each directory with files to be updated, and
# the updated files downloaded to these folders, finally each of the files is then copied into place
# overwriting the previous file.
#
# Most of the downloads simply user cURL to download the files however the pubmed data requires a
# more complex procedure to do so as an unattended script.
#
#
#
#      #################  Pubmed Update Procedure  ##################
#
# To update pubmed data automatically, the ncbi e-utils must be used.
# The procedure is as follows:
#    Use esearch service to perform search for required terms and specifiy the database to search
#        (in the is case pubmed) and we must enable use history, this will return a search.xml file,
#        from which we must extract the value of 'webenv', 'queryKey' and 'count' for this we
#        are using xmllint.
#
#    Use the efetch service to download the records, there is a limit of 10,000 records at a time
#        using efetch, but by using retstart to specify the number of the first record in the download
#        and retmax to control the number of records to download, several request can be made
#        and each time retstart is incremented by retmax. This will give us several files 
#        each containing a contiguous 10,000 records.
#
#    The set of downloaded files must now be concatenated into a single file, but in order to maintain
#        the structure of the xml, the closing </pubmedArticleSet> tag must be removed from the
#        end of every file except the last one, and everything from the beginning of the file upto
#        and including the opening <pubmedArticleSet> tag must be removed from the start of every
#        file except the first. This is all done using sed, an alternative would be to extract the,
#        required nodes from the files using an xml parser.
# 
#    For more details see:
#	 http://www.ncbi.nlm.nih.gov/books/NBK25498/#chapter3.Application_3_Retrieving_large
#    and
#        http://www.ncbi.nlm.nih.gov/books/NBK25499/#chapter4.EFetch
#
#######################################################################################################


#################  update settings  #####################

#Ontologies Directory
ONTO_DIR="ontologies"

#UniProtKB Directory
UNIPROTKB_DIR="references/Plants"

#Pubmed Directory
PUBMED_DIR="pubmed"

#pubmed Query
QUERY="arabidopsis+thaliana"



##########  Colours used for text by echo  ###############

# This provides contrast between script output and that of other commands e.g. cURL

#yellow
TXT_COL="\e[33m"

#red
TXT_COL2="\e[31m"

# we must reset color after each echo to white otherwise the output of all
# following commands will also be coloured e.g. cURL

#white
TXT_COL_RST="\e[0m"

###########################################################

##if ctrl-c detected, exit
ctrl_c(){
        exit $?
}
trap ctrl_c SIGINT

#Get todays date for folder naming
DATE=$(date +%Y%m%d)


echo -e $TXT_COL"Creating timestamped directories to recieve downloads"$TXT_COL_RST


######## Create datestamped folder to recieve downloads ########


# if a folder with todays date already exists delete it and every thing in it.

#Ontologies
[ -d "$ONTO_DIR/$DATE" ] && rm -r "$ONTO_DIR/$DATE"

#UNIPROT
[ -d "$UNIPROTKB_DIR/$DATE" ] && rm -r "$UNIPROTKB_DIR/$DATE"

#Pubmed
[ -d "$PUBMED_DIR/$DATE" ] && rm -r "$PUBMED_DIR/$DATE"


# Create new folders with todays date
mkdir $ONTO_DIR/$DATE
mkdir $UNIPROTKB_DIR/$DATE
mkdir $PUBMED_DIR/$DATE






########  Update files in Ontologies Folder  ########

echo -e $TXT_COL"Downloading Gene_Ontology.1_2.obo"$TXT_COL_RST
curl "ftp://ftp.geneontology.org/pub/go/ontology/obo_format_1_2/gene_ontology.1_2.obo" -o "$ONTO_DIR/$DATE/gene_ontology.1_2.obo"
echo
echo -e $TXT_COL"Downloading interpro2go.txt"$TXT_COL_RST
curl "http://www.geneontology.org/external2go/interpro2go" -o "$ONTO_DIR/$DATE/interpro2go.txt"
echo
echo -e $TXT_COL"Downloading pfam2go.txt"$TXT_COL_RST
curl "http://www.geneontology.org/external2go/pfam2go" -o "$ONTO_DIR/$DATE/pfam2go.txt"
echo
echo -e $TXT_COL"Downloading ec2go.txt"$TXT_COL_RST
curl "http://www.geneontology.org/external2go/ec2go" -o "$ONTO_DIR/$DATE/ec2go.txt"
echo
echo -e $TXT_COL"Downloading trait.obo"$TXT_COL_RST
curl "http://palea.cgrb.oregonstate.edu/viewsvn/Poc/trunk/ontology/collaborators_ontology/gramene/traits/trait.obo" -o "$ONTO_DIR/$DATE/to.obo"
echo
echo -e $TXT_COL"Downloading Gene_association.tair.gz"$TXT_COL_RST
curl "http://www.geneontology.org/gene-associations/gene_association.tair.gz" -o "$ONTO_DIR/$DATE/gene_association.tair.gz"



########  Update Uniprot Knowledgebase data  ########
echo
echo -e $TXT_COL"Downloading Plants.xml.gz"$TXT_COL_RST
curl "http://www.uniprot.org/uniprot/?query=taxonomy%3A33090+NOT+taxonomy%3A3702+AND+reviewed%3Ayes&compress=yes&format=xml" \
	-o "$UNIPROTKB_DIR/$DATE/Plants.xml.gz"
echo



########  Copy the downlaoded files into their final destination for ONDEX  ########

# delete previous files if they exists
[ -f $ONTO_DIR/gene_ontology.1_2.obo ] && rm $ONTO_DIR/gene_ontology.1_2.obo
[ -f $ONTO_DIR/interpro2go.txt ] && rm $ONTO_DIR/interpro2go.txt
[ -f $ONTO_DIR/pfam2go.txt ] && rm $ONTO_DIR/pfam2go.txt
[ -f $ONTO_DIR/ec2go.txt ] && rm $ONTO_DIR/ec2go.txt
[ -f $ONTO_DIR/to.obo ] && rm $ONTO_DIR/to.obo
[ -f $ONTO_DIR/gene_association.tair.gz ] && rm $ONTO_DIR/gene_association.tair.gz
[ -f $UNIPROTKB_DIR/gene_association.tair.gz ] && rm $UNIPROTKB_DIR/Plants.xml.gz

# Copy new files into place for Ondex
cp $ONTO_DIR/$DATE/gene_ontology.1_2.obo $ONTO_DIR/gene_ontology.1_2.obo
cp $ONTO_DIR/$DATE/interpro2go.txt $ONTO_DIR/interpro2go.txt
cp $ONTO_DIR/$DATE/pfam2go.txt $ONTO_DIR/pfam2go.txt
cp $ONTO_DIR/$DATE/ec2go.txt $ONTO_DIR/ec2go.txt
cp $ONTO_DIR/$DATE/to.obo $ONTO_DIR/to.obo
cp $ONTO_DIR/$DATE/gene_association.tair.gz $ONTO_DIR/gene_association.tair.gz
cp $UNIPROTKB_DIR/$DATE/Plants.xml.gz $UNIPROTKB_DIR/Plants.xml.gz





###########  Update Pubmed Data  ############

# ncbi e-utils address
NCBIADDR="http://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
URL=$NCBIADDR"esearch.fcgi?db=pubmed&term="$QUERY"&usehistory=y"


#if it exists remove pubmed xml file
[ -f $PUBMED_DIR/pubmed_result_arabidopsis.xml ] && rm $PUBMED_DIR/pubmed_result_arabidopsis.xml

echo -e $TXT_COL"Performing Pubmed search"$TXT_COL_RST


#########  perform pubmed search  ########
curl $URL -o $PUBMED_DIR/$DATE/search.xml

#extract necessary variables from search.xml
WEBENV=$(xmllint $PUBMED_DIR/$DATE/search.xml --shell <<< "cat /eSearchResult/WebEnv/text()" | grep -v /)
QUERYKEY=$(xmllint $PUBMED_DIR/$DATE/search.xml --shell <<< "cat /eSearchResult/QueryKey/text()" | grep -v /)
COUNT=$(xmllint $PUBMED_DIR/$DATE/search.xml --shell <<< "cat /eSearchResult/Count/text()" | grep -v /)

echo
echo -e $TXT_COL"Pubmed entries found: "$TXT_COL2$COUNT$TXT_COL_RST

#dont need search.xml any longer
rm $PUBMED_DIR/$DATE/search.xml

# values used to set the number of records to download and which record number to start at.
# RETMAX can be set no higher than 10,000 records per download.
RETMAX=10000


########  Download Pubmed Records  ########

# loop until all parts have been downloaded and merged into one file
for (( RETSTART=0; RETSTART<$COUNT;  RETSTART+=$RETMAX)) do
    echo
    echo -e $TXT_COL"Downloading Pubmed_result_arabidopsis.xml part: "$TXT_COL2$(((RETSTART/RETMAX)+1))" of "$(((COUNT+RETMAX-1)/RETMAX))$TXT_COL_RST
	
    # download one part of the final file with upto 10,000 results per file to a temp file
    curl $NCBIADDR"efetch.fcgi?db=pubmed&WebEnv="$WEBENV"&query_key="$QUERYKEY"&retstart="$RETSTART"&retmax="$RETMAX"&retmode=XML" \
		-o $PUBMED_DIR/$DATE/pubmed_temp.xml

    echo
    echo -e $TXT_COL"Downloading part "$TXT_COL2$(((RETSTART/RETMAX)+1))$TXT_COL" complete appending to output file"$TXT_COL_RST

    # if this is not the first part merge with the output file 
    if [ $RETSTART -gt 0 ]; then
	# remove the closing </pubmedArticleSet> tag from output file
        sed -i '/<\/PubmedArticleSet>/d'  $PUBMED_DIR/$DATE/pubmed_result_arabidopsis.xml

	# remove all lines upto and including the opening <pubmedArticleSet> tag and appened to output file.
        sed '/<?xml version="1.0"?>/,/<PubmedArticleSet>/d' $PUBMED_DIR/$DATE/pubmed_temp.xml >> $PUBMED_DIR/$DATE/pubmed_result_arabidopsis.xml

    else
	#if this is the first part just copy to output file
        cp $PUBMED_DIR/$DATE/pubmed_temp.xml $PUBMED_DIR/$DATE/pubmed_result_arabidopsis.xml
    fi
	#increment the starting record number by the number of records downloaded so as to download the next set of records.
done

#delete tempfile
rm $PUBMED_DIR/$DATE/pubmed_temp.xml

########  Copy outputfile to final destination for use in ONDEX  ########

cp $PUBMED_DIR/$DATE/pubmed_result_arabidopsis.xml $PUBMED_DIR/pubmed_result_arabidopsis.xml
