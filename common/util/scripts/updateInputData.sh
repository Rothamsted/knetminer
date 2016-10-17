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
# Some download links break and need to be adjusted if the database release changes
# BioGrid version: 3.4.141
# Ensembl Release: 32
# AraCyc version: 14
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
UNIPROTKB_DIR="references/UniProt"

#Yeast Directory
YEAST_DIR="references/yeast"

#Arabidopsis Directory
ARABIDOPSIS_DIR="organisms/Arabidopsis"

#Pubmed Directory
PUBMED_DIR=$ARABIDOPSIS_DIR/pubmed/

#Homology Directory
HOMOLOGY_DIR="homology"

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


echo -e $TXT_COL"Creating timestamped directories to receive downloads"$TXT_COL_RST


######## Create datestamped folder to receive downloads ########


# if a folder with todays date already exists delete it and every thing in it.

#Ontologies
[ -d "$ONTO_DIR/$DATE" ] && rm -r "$ONTO_DIR/$DATE"

#UNIPROT
[ -d "$UNIPROTKB_DIR/$DATE" ] && rm -r "$UNIPROTKB_DIR/$DATE"

#YEAST
[ -d "$YEAST_DIR/$DATE" ] && rm -r "$YEAST_DIR/$DATE"

#Arabidopsis
[ -d "$ARABIDOPSIS_DIR/$DATE" ] && rm -r "$ARABIDOPSIS_DIR/$DATE"

#Homology
[ -d "$HOMOLOGY_DIR/$DATE" ] && rm -r "$HOMOLOGY_DIR/$DATE"

#Pubmed
[ -d "$PUBMED_DIR/$DATE" ] && rm -r "$PUBMED_DIR/$DATE"


# Create new folders with todays date
echo "Create ontology directory"
mkdir $ONTO_DIR/$DATE

echo "Create UniProt directory"
mkdir $UNIPROTKB_DIR/$DATE

echo "Create Yeast"
mkdir $YEAST_DIR/$DATE

echo "Create Arabidopsis"
mkdir $ARABIDOPSIS_DIR/$DATE

echo "Create PubMed"
mkdir $PUBMED_DIR/$DATE

echo "Create Homology"
mkdir $HOMOLOGY_DIR/$DATE


########  Update GFF3 and FASTA  ########

curl ftp://ftp.ensemblgenomes.org/pub/current/plants/gff3/arabidopsis_thaliana/Arabidopsis_thaliana.TAIR10.32.gff3.gz -o "$ARABIDOPSIS_DIR/$DATE/Arabidopsis_thaliana.TAIR10.32.gff3.gz"
gunzip -c $ARABIDOPSIS_DIR/$DATE/Arabidopsis_thaliana.TAIR10.32.gff3.gz > $ARABIDOPSIS_DIR/$DATE/genes.gff3

curl ftp://ftp.ensemblgenomes.org/pub/current/plants/fasta/arabidopsis_thaliana/pep/Arabidopsis_thaliana.TAIR10.pep.all.fa.gz -o "$ARABIDOPSIS_DIR/$DATE/Arabidopsis_thaliana.TAIR10.pep.all.fa.gz"
gunzip -c $ARABIDOPSIS_DIR/$DATE/Arabidopsis_thaliana.TAIR10.pep.all.fa.gz > $ARABIDOPSIS_DIR/$DATE/pep.all.fa


######## Update Gene-SNP-Phenotype #######

## TODO: User BioMart Perl API  ##



########  Update Ontologies and Annotations  ########

echo -e $TXT_COL"Downloading go-basic.obo"$TXT_COL_RST
curl "ftp://ftp.geneontology.org/pub/go/ontology/go-basic.obo" -o "$ONTO_DIR/$DATE/go-basic.obo"
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
wget --no-check-certificate http://purl.obolibrary.org/obo/to/subsets/to-basic.obo -O "$ONTO_DIR/$DATE/to-basic.obo"
echo


########  Update Pathway and Interaction data  ########

echo -e $TXT_COL"Downloading Gene_association.tair.gz"$TXT_COL_RST
curl "http://www.geneontology.org/gene-associations/gene_association.tair.gz" -o "$ARABIDOPSIS_DIR/$DATE/gene_association.tair.gz"
echo -e $TXT_COL"Download AraCyc"$TXT_COL_RST
curl "ftp://ftp.plantcyc.org/tmp/private/plantcyc/aracyc.tar.gz" -o "$ARABIDOPSIS_DIR/$DATE/aracyc.tar.gz"
tar -O -zxvf $ARABIDOPSIS_DIR/$DATE/aracyc.tar.gz aracyc/14.0/data/biopax-level2.owl > $ARABIDOPSIS_DIR/$DATE/biopax-level2.owl
echo
echo -e $TXT_COL"Downloading BioGrid data"$TXT_COL_RST
curl "http://thebiogrid.org/downloads/archives/Release%20Archive/BIOGRID-3.4.141/BIOGRID-ORGANISM-3.4.141.tab2.zip" \
	-o "$ARABIDOPSIS_DIR/$DATE/biogrid.tab2.zip"
unzip $ARABIDOPSIS_DIR/$DATE/biogrid.tab2.zip BIOGRID-ORGANISM-Arabidopsis_thaliana_Columbia-3.4.141.tab2.txt -d $ARABIDOPSIS_DIR/$DATE
unzip $ARABIDOPSIS_DIR/$DATE/biogrid.tab2.zip BIOGRID-ORGANISM-Saccharomyces_cerevisiae_S288c-3.4.141.tab2.txt -d $YEAST_DIR/$DATE
echo


########  Update UniProtKB data  ########
echo
echo -e $TXT_COL"Downloading UniProt Plants.xml.gz"$TXT_COL_RST
curl "http://www.uniprot.org/uniprot/?query=taxonomy%3A33090+NOT+taxonomy%3A3702+AND+reviewed%3Ayes&compress=yes&format=xml" \
	-o "$UNIPROTKB_DIR/$DATE/Plants.xml.gz"
echo

echo -e $TXT_COL"Downloading UniProt Plants.fasta"$TXT_COL_RST
curl "http://www.uniprot.org/uniprot/?query=taxonomy%3A33090+NOT+taxonomy%3A3702+AND+reviewed%3Ayes&compress=no&format=fasta" \
	-o "$UNIPROTKB_DIR/$DATE/Plants.fasta"
echo
echo -e $TXT_COL"Downloading Uniprot Yeast.xml.gz"$TXT_COL_RST
curl "http://www.uniprot.org/uniprot/?query=proteome:UP000002311&compress=yes&format=xml" \
	-o "$YEAST_DIR/$DATE/Yeast.xml.gz"
echo

echo -e $TXT_COL"Download UniProt Arabidopsis"$TXT_COL_RST
curl "http://www.uniprot.org/uniprot/?query=proteome:UP000006548&compress=yes&format=xml" \
	-o "$ARABIDOPSIS_DIR/$DATE/Uniprot-Arabidopsis.xml.gz"
echo



########  Copy the downloaded files into their final destination for ONDEX  ########

# delete previous files if they exists
[ -f $ONTO_DIR/go-basic.obo ] && rm $ONTO_DIR/go-basic.obo
[ -f $ONTO_DIR/interpro2go.txt ] && rm $ONTO_DIR/interpro2go.txt
[ -f $ONTO_DIR/pfam2go.txt ] && rm $ONTO_DIR/pfam2go.txt
[ -f $ONTO_DIR/ec2go.txt ] && rm $ONTO_DIR/ec2go.txt
[ -f $ONTO_DIR/to-basic.obo ] && rm $ONTO_DIR/to-basic.obo
[ -f $UNIPROTKB_DIR/Plants.xml.gz ] && rm $UNIPROTKB_DIR/Plants.xml.gz
[ -f $UNIPROTKB_DIR/Plants.fasta ] && rm $UNIPROTKB_DIR/Plants.fasta
[ -f $ARABIDOPSIS_DIR/Gene-Protein/genes.gff3 ] && rm $ARABIDOPSIS_DIR/Gene-Protein/genes.gff3
[ -f $ARABIDOPSIS_DIR/Gene-Protein/pep.all.fa ] && rm $ARABIDOPSIS_DIR/Gene-Protein/pep.all.fa
[ -f $ARABIDOPSIS_DIR/Gene-GO/gene_association.tair.gz ] && rm $ARABIDOPSIS_DIR/Gene-GO/gene_association.tair.gz
[ -f $ARABIDOPSIS_DIR/uniprot/Uniprot-Arabidopsis.xml.gz ] && rm $ARABIDOPSIS_DIR/uniprot/Uniprot-Arabidopsis.xml.gz
[ -f $ARABIDOPSIS_DIR/aracyc/biopax-level2.owl ] && rm $ARABIDOPSIS_DIR/aracyc/biopax-level2.owl
[ -f $ARABIDOPSIS_DIR/biogrid/BIOGRID-ORGANISM-Arabidopsis_thaliana_Columbia-3.4.141.tab2.txt ] && rm $ARABIDOPSIS_DIR/biogrid/BIOGRID-ORGANISM-Arabidopsis_thaliana_Columbia-3.4.141.tab2.txt
[ -f $YEAST_DIR/BIOGRID-ORGANISM-Saccharomyces_cerevisiae_S288c-3.4.141.tab2.txt ] && rm $YEAST_DIR/BIOGRID-ORGANISM-Saccharomyces_cerevisiae_S288c-3.4.141.tab2.txt
[ -f $YEAST_DIR/Yeast.xml.gz ] && rm $YEAST_DIR/Yeast.xml.gz
[ -f $HOMOLOGY_DIR/Decypher/Arabidopsis_UniProtPlants_Decypher-SW ] && rm $HOMOLOGY_DIR/Decypher/Arabidopsis_UniProtPlants_Decypher-SW


# Copy new files into place for Ondex
cp $ONTO_DIR/$DATE/go-basic.obo $ONTO_DIR/go-basic.obo
cp $ONTO_DIR/$DATE/interpro2go.txt $ONTO_DIR/interpro2go.txt
cp $ONTO_DIR/$DATE/pfam2go.txt $ONTO_DIR/pfam2go.txt
cp $ONTO_DIR/$DATE/ec2go.txt $ONTO_DIR/ec2go.txt
cp $ONTO_DIR/$DATE/to-basic.obo $ONTO_DIR/to-basic.obo
cp $UNIPROTKB_DIR/$DATE/Plants.xml.gz $UNIPROTKB_DIR/Plants.xml.gz
cp $UNIPROTKB_DIR/$DATE/Plants.fasta $UNIPROTKB_DIR/Plants.fasta
cp $ARABIDOPSIS_DIR/$DATE/genes.gff3 $ARABIDOPSIS_DIR/Gene-Protein/genes.gff3
cp $ARABIDOPSIS_DIR/$DATE/pep.all.fa $ARABIDOPSIS_DIR/Gene-Protein/pep.all.fa
cp $ARABIDOPSIS_DIR/$DATE/gene_association.tair.gz $ARABIDOPSIS_DIR/Gene-GO/gene_association.tair.gz
cp $ARABIDOPSIS_DIR/$DATE/Uniprot-Arabidopsis.xml.gz $ARABIDOPSIS_DIR/uniprot/Uniprot-Arabidopsis.xml.gz
cp $ARABIDOPSIS_DIR/$DATE/biopax-level2.owl $ARABIDOPSIS_DIR/aracyc/biopax-level2.owl
cp $ARABIDOPSIS_DIR/$DATE/BIOGRID-ORGANISM-Arabidopsis_thaliana_Columbia-3.4.141.tab2.txt $ARABIDOPSIS_DIR/biogrid/BIOGRID-ORGANISM-Arabidopsis_thaliana_Columbia-3.4.141.tab2.txt
cp $YEAST_DIR/$DATE/Yeast.xml.gz $YEAST_DIR/Yeast.xml.gz
cp $YEAST_DIR/$DATE/BIOGRID-ORGANISM-Saccharomyces_cerevisiae_S288c-3.4.141.tab2.txt $YEAST_DIR/BIOGRID-ORGANISM-Saccharomyces_cerevisiae_S288c-3.4.141.tab2.txt

##### Update BLAST databases and run Decypher-SW against UniProt ###########
perl -i -pne 's/sp\|(.*)\|.*? /$1 /g' $UNIPROTKB_DIR/Plants.fasta
/home/old_pear_apps/decypher_g1/bin/dc_run -parameters  /home/old_pear_apps/decypher_g1/parameter_files/format_aa_into_aa -database UniProt-Plants-$DATE -query $UNIPROTKB_DIR/Plants.fasta
# /home/old_pear_apps/decypher_g1/bin/dc_run -parameters /home/data/qtlnetminer/ondex-mini/qtlnetminer/homology/Decypher/DecypherConfig_Plants -query /home/data/qtlnetminer/ondex-mini/qtlnetminer/organisms/Brassica/Gene-Protein/Brassica_oleracea.v2.1.26.pep.all.fa -database UniProt-Plants-$DATE -max_scores 10 -max_alignments 10 > /home/data/qtlnetminer/ondex-mini/qtlnetminer/homology/Decypher/Boleracea_UniProtPlants_Decypher-SW.tab
/home/old_pear_apps/decypher_g1/bin/dc_run -parameters $HOMOLOGY_DIR/Decypher/DecypherConfig_Plants -query $ARABIDOPSIS_DIR/Gene-Protein/pep.all.fa -database UniProt-Plants-$DATE -max_scores 10 -max_alignments 10 > $HOMOLOGY_DIR/$DATE/Arabidopsis_UniProtPlants_Decypher-SW.tab

# Update this network needs Ondex GUI
cp $HOMOLOGY_DIR/$DATE/Arabidopsis_UniProtPlants_Decypher-SW.tab $HOMOLOGY_DIR/Decypher/Arabidopsis_UniProtPlants_Decypher-SW.tab

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

	# remove first three lines including the opening <xml> <dtd> and <pubmedArticleSet> tag and append to output file.
        sed '1, 3d' $PUBMED_DIR/$DATE/pubmed_temp.xml >> $PUBMED_DIR/$DATE/pubmed_result_arabidopsis.xml

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
