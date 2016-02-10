
# Installation Guide

### Required files

Currently there are quire a few depenancies in the form of CSS and Javascript files. In the final version this number will hopefully be reduced to a single minified file of each type.

The required javascritp files are (relative to the root of the 'GeneMap' folder:

    <script src="./js/jquery-1.12.0.js"></script>
    <script src="./js/bootstrap/bootstrap.min.js"></script>
    <script src="./d3/d3.min.js"></script>
    <script src="./js/lodash/lodash.min.js"></script>
    <script src="./js/d3.promise/d3.promise.min.js"></script>
    <script src="./chromosome.js"></script>
    <script src="./annotations.js"></script>
    <script src="./basemap_xml_reader.js"></script>
    <script src="./annotation_xml_reader.js"></script>
    <script src="./xml_data_reader.js"></script>
    <script src="./map_layout.js"></script>
    <script src="./auto_layout.js"></script>
    <script src="./infobox.js"></script>
    <script src="./genemap.js"></script>


The required CSS file are (relative to the root of the GeneMap folder):

	<link rel="stylesheet" href="../css/custom_bootstrap.css">
	<link rel="stylesheet" href="./css/annotations.css" />
	<link rel="stylesheet" href="./css/chromosome.css" />
	<link rel="stylesheet" href="./css/mapview.css" />
	<link rel="stylesheet" href="./css/infobox.css" />

Note that the custom_bootstrap.css uses a '.bootstrap' class to namespace all the bootstrap code so it won't affect any elements on the page without that class.

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

