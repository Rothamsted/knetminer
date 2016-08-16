#!/bin/bash

#This was written for a specific dev environment YMMV
#It's designed to be run from the GeneMap directory
#It accepts 1 argument, the path to an svg file, e.g.: assets/svg/icon.svg
#It creates: assets/svg/icon_hover.svg, assets/img/icon.png, assets/img/icon_hover.png


inputfile=$1
echo "Source $inputfile"

filename=${inputfile##*/}
filestem=${filename%%.*}
folder=${inputfile%/*}
dest=$( echo $folder | sed 's/svg/img/' )


echo "Modifying original in place:"
sed -e 's/fill="#[0-9]\+"/fill="#444444"/g' < $inputfile > tmp && mv tmp $inputfile


hoversvg=$folder/${filestem}_hover.svg
echo "Creating hover version at $hoversvg"
sed -e 's/fill="#[0-9]\+"/fill="#21a2ef"/g' < $inputfile > $hoversvg

origout=$dest/${filestem}.png
echo "Orig out: $origout"
"/cygdrive/c/Program Files/Inkscape/inkscape.exe" --export-png=$origout --export-width=36 --export-height=36  $inputfile


echo "Hover out: $hoverout"
hoverout=$dest/${filestem}_hover.png
"/cygdrive/c/Program Files/Inkscape/inkscape.exe" --export-png=$hoverout --export-width=36 --export-height=36  $hoversvg
