
# Installation Guide

### First time install
- Install Node.js (https://nodejs.org/en/download/)
- Install Git (https://git-scm.com/)
- Install bower: `npm install -g bower`
- Install gulp: `npm install -g gulp`


### Building the compressed and minified files

The required files 'genemap.js', 'genemap-lib.js', 'genemap-lib.css' and 'genemap.css' as well as the images are found in the 'dist' directory, which isnt currently checked into version control. They will need to be recompiled before they can be used, to do this you can use the following steps. Once after checkout go to the `GeneMap` directory and run:

    npm install
    bower install

To install the dependencies then you can run:

    gulp optimise

To re-build the files in the `dist` folder.

More information about npm, bower and gulp can be found in the maintenance guide.

## General Installation Notes

This is a guide to using the GeneMap component, not necessarily within the QTLNetMiner application.

### Required files

Currently there are quire a few depenancies in the form of CSS and Javascript files. Combined and minified versions of these files should be in the `GeneMap` directory, if they aren't they can be re-built following the instructions in the 'Building the compressed and minified files' section.


The required files are (relative to the root of the 'GeneMap' folder:

  * `./dist/js/genemap-lib.js`
  * `./dist/js/genemap.js`
  * `./dist/css/genemap.css`

The JavaScript and CSS files need to be included on the page:

    <script src="./dist/js/genemap-lib.js"></script>
    <script src="./dist/js/genemap.js"></script>

    <link rel="stylesheet" href="./dis/styles/genemap.css">



Note that the CSS uses a '.bootstrap' class to namespace all the bootstrap CSS code so it won't affect any elements on the page without that class.

### Generating the chart

The chart will need to be drawn within an easily identifiable containing element, such as a`<div>` that has the `bootstrap` class added. Something like:

	<div id="#map" class="bootstrap"></div>

By default the chart will size to fit the containing element.

The chart will then need to be drawn by creating a GeneMap object and calling the .draw() method:

	var chart = GENEMAP.GeneMap();
	chart.draw("#map", basemapPath, annotationsPath);

The `basemapPath` and `annotationsPath` variable need to include a path to the basemap and annotations XML files that you want to draw on the chart. The annotationPath is optional and doesn't have to be supplied.

### Redraw on window re-size

The chart object has a redraw method that re-draws the chart without re-loading the data. This is useful as it takes into account any updates to the containing elements size (if it is a % rather than a fixed size). Just call  this whenever the resize event occurrs with something like:

	var resize = function() {
	  chart.redraw("#map");
	};

  d3.select(window).on('resize', resize);

### Changing the rendering options

There are a limited number of rendering options available on the chart object, these aren't fully tested but a few key functions are:

	chart.resetZoom(); // resets the zoom level on the chart
	chart.layout().numberPerRow = 10; // sets the number of chromosomes per row to 10

### Troubleshooting tips

 - D3 doesn't seem to be very good about raising errors when it can't read an XML file, if you are having problems check the XML files being read are valid (no extra & characters for example). This should be easy enough to do by trying to open the XML file in a browser.
 - Check the head contains the `<meta charset="UTF-8">` tag as d3 uses UTF8.

## To test Genomap.js:
After running, ```npm install```, ```bower install``` and ```gulp optimise``` in /GeneMap directory, run ```gulp serve-dev``` and navigate to <http://localhost:8080/index.html> to run the demo page.
