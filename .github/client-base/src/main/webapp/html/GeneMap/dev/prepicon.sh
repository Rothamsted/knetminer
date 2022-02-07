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
sed -e 's/fill="#[0-9A-F]\+"/fill="#444444"/g' -e 's/fill:#[0-9]\+/fill:#444444/g' < $inputfile > tmp && mv tmp $inputfile

hoversvg=$folder/${filestem}_hover.svg
echo "Creating hover version at $hoversvg"
sed -e 's/fill="#[0-9A-F]\+"/fill="#21a2ef"/g' -e 's/fill:#[0-9]\+/fill:#21a2ef/g' $inputfile > $hoversvg

dissvg=$folder/${filestem}_disabled.svg
echo "Creating disabled version at $dissvg"
sed -e 's/fill="#[0-9A-F]\+"/fill="#cccccc"/g' -e 's/fill:#[0-9]\+/fill:#cccccc/g' < $inputfile > $dissvg

origout=$dest/${filestem}.png
echo "Orig out: $origout"
"/cygdrive/c/Program Files/Inkscape/inkscape.exe" --export-png=$origout --export-width=36 --export-height=36  --export-background-opacity 0 $inputfile

hoverout=$dest/${filestem}_hover.png
echo "Hover out: $hoverout"
"/cygdrive/c/Program Files/Inkscape/inkscape.exe" --export-png=$hoverout --export-width=36 --export-height=36 --export-background-opacity 0  $hoversvg

disout=$dest/${filestem}_disabled.png
echo "Hover out: $disout"
"/cygdrive/c/Program Files/Inkscape/inkscape.exe" --export-png=$disout --export-width=36 --export-height=36  --export-background-opacity 0 $dissvg