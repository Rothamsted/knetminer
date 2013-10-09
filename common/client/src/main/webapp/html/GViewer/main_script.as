//#include "./drawMethods/drawWedge.as"

import com.macromedia.javascript.JavaScriptSerializer;
import com.macromedia.javascript.JavaScriptProxy;
var proxy:JavaScriptProxy = new JavaScriptProxy(_root.lcId, this);

errorMessageText = "";

_root.createEmptyMovieClip("link_layer", this.getNextHighestDepth());

// Set the title of the GViewer window
// Will accept titleBarText value passed in via FlashVars
// or will set to generic title otherwise.
var _titleBarText = "Flash GViewer";
if(titleBarText != null) {
	_titleBarText = titleBarText;
}
title_text.text = _titleBarText;


// Set the target for the hyperlinks coming out of the GViewer
// By default they go to a new page, alternatively this can be
// set in the flashvars to open in another page, frame or iframe.
var _featureLinkTarget = "_blank";
if(featureLinkTarget != null) {
	_featureLinkTarget = featureLinkTarget;
}


// quickie function to set the text at the bottom of the movie window
// for messages passed back to the user.
function setTextMessage (value:String) {
	featureInfo.text = value;
}


// browserURL = "http://genome.ucsc.edu/cgi-bin/hgTracks?org=Rat&position=Chr";

/**
* Display parameters passed from the HTML tags
*
*/
/*
// QTL Band color
if (featureBandColor == null) {
	featureBandColor = 0x0000FF;
}

if (featurePointColor == null) {
	featurePointColor = 0xFF00FF;
}
*/

if(chromosomeRows == null) {
	chromosomeRows = 2;
}


//bandDisplayColor = 0x00FFFF;

/**
* Setup the 'About Flash GViewer' MovieClip and preference UI
*/
var prefs:MovieClip = _root.attachMovie("preferencePane_mc","prefs",10000);
prefs._x = 10;
prefs._y = 10;
prefs._visible = Boolean(false);

// UI listeners
var prefsListener:Object = new Object();
prefsListener.click = function(evt:Object) {
	trace("Clicked checkbox");
	if(evt.target.getValue()) {
		_root.zoomStyle = "rotate"
	}
	else {
		_root.zoomStyle = "normal";
	}
}
this.prefs.zoomHorizontal_cb.addEventListener("click", prefsListener);
trace("Label = " + this.prefs.zoomHorizontal_cb.label);

_root.zoomStyle = "normal";		// Default to show zoom view with vertical chromosome
_root._labelFeaturesOnGenomeView = 0;	// Default to hiding feature labels on Genome View.
_root._labelFeaturesOnZoomView = 1; // Default to show label features on zoom view.

/**
* Display the 'About Flash GViewer' MovieClip when the button is clicked
*/

info_button.onRelease = function(evt:Object) {
	prefs.swapDepths(_root.getNextHighestDepth());
	prefs._alpha = 100;
	prefs._visible = !prefs._visible;
	prefs._y = (Stage.height/2)-(prefs._height/2);
	prefs._x = (Stage.width/2)-(prefs._width/2);
	
}

// Relocate info_button to bottom left corner
// place it 3 px in from the left side
info_button._x = 3;
// place 3px up from the bottom of the stage
//info_button._y = (Stage.height - (info_button._height+2));

//////////////
// relocate LOADING message to center of the stage
//////////////
loadingText._y = (Stage.height/2)-(loadingText._height/2);
loadingText._x = (Stage.width/2)-(loadingText._width/2);

//////////////
// relocate the featureInfo text box to center and bottom of page
//////////////
// check its not larger than the stage, if so, shrink to stage width
if( (featureInfo._width + (2 *(info_button._width +3)) ) > Stage.width) {
	featureInfo._width = Stage.width - 2*(info_button._width +3);
}
// reposition in the center
//featureInfo._x = (Stage.width/2)-(featureInfo._width/2);
// place 3px up from the bottom of the stage
//featureInfo._y = (Stage.height - (featureInfo._height+3));

trace("Loading initial XML data");
trace("Stage width: "+Stage.width+", Height: "+Stage.height);
cytoIdeo_dc.URL = "./data/rat_ideo.xml";
//human_ideo.xml or mouse_ideo.xml or rat_ideo.xml
// species can be set via FlashVars tag in the HTML page to allow cusomization.

//	baseMapURL points to the file/resource that has the XML data
//	including chromosome size, number, and the banding patterns
//	can be passed in via the HTML param tags
if(baseMapURL != null) {
	cytoIdeo_dc.URL = baseMapURL;
}
else {
	// baseMapURL = "./data/human_v36-1_cytoBand.xml";
	 baseMapURL = "./data/rat_v3-4_cytoBand.xml";
	cytoIdeo_dc.URL = baseMapURL;
	// trace("No baseMapURL parameter supplied");
	featureInfo.text += "!! No baseMapURL parameter supplied";
}


//
// Kludge to cope with genomes which dont have the first chromosome
// as their longest chromosome. Pass the longest chromosome length in
// in as a FlashVars param to ensure correct scaling.
//
//
_longestChromosomeLength = null; //20916337;

if(longestChromosomeLength != null) {
	_longestChromosomeLength = longestChromosomeLength;
}
	

cytoIdeo_dc.trigger();

var chrClipArray:Array = new Array();
var chromosomeList:Array = new Array();
var animatedPacking:Boolean = true; // do we animate the packing of features, probably going to overlap chromosomes
var chromosomeNameToIndex = new Array(); // links the name (X, Y, 1, II) to the index value in the baseMap file

//////
// dimChrAlpha - dim the chromosomes with no annotation. Set to 100% for no dimming
///////
var dimChrAlpha:Number = 40; // default alpha value for chromosomes with no annotation , not dimmed

if(dimmedChromosomeAlpha != null) {
	if(dimmedChromosomeAlpha < 0) {
		dimmedChromosomeAlpha = 0;
	}
	if(dimmedChromosomeAlpha >100) {
		dimmedChromosomeAlpha = 100;
	}
	dimChrAlpha = dimmedChromosomeAlpha;
}

//////
// tickScale
///////
var tickSpacing:Number;
if(tickSpaceDistance != null) {
	tickSpacing = tickSpaceDistance; // tickSpaceDistance passed in from FlashVars
}
else {
	tickSpacing = 50000000; // tick marks every 50Mb
}


/**
* annotationURL - the URL of the file or script that will return the annotation XML
* to be displayed on the Flash GViewer
*/
// annotationURL = "data/rat_annotation.xml";
/* annotationURL = "data/trans_fat.xml";*/
// annotationURL = "data/human_contig.xml";
// annotationURL = "data/trans_all.xml";

if(annotationURL != null) {
	annotation_dc.URL = annotationURL;
}
/*
else {
	featureInfo.text = "no annotationURL supplied via FlashVars";
}
*/

/**
* load the annotations from the annotationURL
*/


function loadAnnotations() {
	
	 // annotationXML ='<?xml version="1.0" standalone="yes"?><genome><feature><chromosome>2</chromosome><start>201120535</start><end>201124179</end><type>gene</type><label>Adora3</label><color>0xFFFF00<link>http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=2051</link></feature></genome>';
	
	if (annotationXML != null) {
		trace("Load annotations from file: " + annotationXML);
		parseAnnotationXML(annotationXML);
	}
	else {
		if(annotationURL != null) {
			trace("load annotations triggered: " + annotation_dc.URL );
			annotation_dc.trigger();
		}
		else {
			featureInfo.text = "!! No annotation source provided via FlashVars";
		}
	}
}

var annotationListener:Object = new Object();
function parseAnnotationXML(xml:String) {
	var annotationXML:XML = new XML();
	annotationXML.ignoreWhite = true;
	annotationXML.parseXML(xml);
	var rootNode = annotationXML.firstChild;
	var itemNode = rootNode.firstChild;
	trace("Parsing inline XML:"+rootNode.nodeName);
	var dataArray:Array = new Array();
	while (itemNode.firstChild != null) {
		//trace("parsing "+itemNode.nodeName);
		var dataNode = itemNode.firstChild;
		var featureData:Array = new Array();
		while (dataNode.firstChild.nodeValue != null) {
			trace("parsing "+dataNode.nodeName);
			featureData[dataNode.nodeName] = dataNode.firstChild.nodeValue;
			dataNode = dataNode.nextSibling;
		}
		dataArray.push({chromosome:featureData['chromosome'], start:featureData['start'], end:featureData['end'], type:featureData['type'], label:featureData['label'], link:featureData['link'], color:featureData['color']});
		itemNode = itemNode.nextSibling;
	}
	annotation_ds.items = dataArray;
	annotationListener.result(annotation_ds);
}

/**
*	redraw all the chromosomes, used when changing the display parameters
*	for labels, etc.
*
*/

function refreshAllChromosomes():Void {
	
	trace("Refreshing chromosomes: Labels= " + _root._labelFeaturesOnGenomeView + ", inrows= " + _root.inRows);
	for(var c = 0; c < chromosomeList.length; c++) {
		
			/*if(chromosomeList[c].isZoomed) {
				// need to check to see if the chromosome orientation has changed from when
				// we originally rendered the chromosome
				
				// global zoom style has been set to rotate but this one isnt rotated, redraw
				if(_root.zoomStyle == "rotated" && chromosomeList[c].isRotated != "yes") {
					//chromosomeList[c].isHomePosition = !chromosomeList[c].isHomePosition; // kludge to avoid unzooming
					chromosomeList[c].zoomIt();
				}
				// global zoom style has been set to normal but this one is rotated, redraw
				else if(_root.zoomStyle != "rotated" && chromosomeList[c].isRotated == "yes") {
					//chromosomeList[c].isHomePosition = !chromosomeList[c].isHomePosition; // kludge to avoid unzooming
					chromosomeList[c].zoomIt();
				}
			}
			else {
				*/
				chromosomeList[c].drawFeatures(_root._labelFeaturesOnGenomeView,Boolean(true));
			//}
	}

}

function checkFeatureLinks():Void {
	
	// foreach chromosome
	for(var c = 0; c < chromosomeList.length; c++) {
		// foreach link to/form chromosome
		for (var f = 0; f< chromosomeList[c].outLinkList.length; f++) {
				var linkObject:Object = chromosomeList[c].outLinkList[f];
				// if this object is selected, redraw the link lines
				if(linkObject.localFeature.hiliteStayOn == true) {
					chromosomeList[c].drawLinkLine(linkObject.localFeature, linkObject.remoteFeature, linkObject.color,"dash");
				}
		}
		
		for (var f = 0; f< chromosomeList[c].inLinkList.length; f++) {
				var linkObject:Object = chromosomeList[c].inLinkList[f];
				// if this object is selected, redraw the link lines
				if(linkObject.localFeature.hiliteStayOn == true) {
					 chromosomeList[c].drawLinkLine(linkObject.localFeature, linkObject.remoteFeature, linkObject.color,"solid");
				}
		}
	}
	
	
}


/**
* Flash - Javascript bridge function to turn on the highlight of a particular feature
*
* Currently searches for any (and all) features which have a label_internal value
* matching the featureName passed in from Javascript. It turns the hilite of each
* feature on. This loop is not perhaps the best way, an event listener model would
* be better if a custom event could be triggered.
*
*/

function setHighlight(featureName:String) {
	var foundFeature:Boolean = false;
	for(var c = 0; c < chromosomeList.length; c++) {
		for (var f = 0; f <chromosomeList[c].featureList.length; f++) {
			if(chromosomeList[c].featureList[f].label_internal == featureName) {
				chromosomeList[c].featureList[f].hiliteStayOn = true;
				chromosomeList[c].featureList[f].drawFeature(true);
				foundFeature = true;
			}
		}
	}
	
	// pass message back to the user if nothing found.
	if(!foundFeature) {
		setTextMessage("Cant find feature called " + featureName);
	}
}


/*
*
*
*
*/

function findFeature(featureName:String):Feature {
	var foundFeature:Boolean = false;
	var start:Number = 0;
	var finish:Number = 0;
	var theFeature:Feature;
	for(var c = 0; c < chromosomeList.length; c++) {
		for (var f = 0; f <chromosomeList[c].featureList.length; f++) {
			if(chromosomeList[c].featureList[f].label_internal == featureName) {
				//start = chromosomeList[c].featureList[f].start;
				//finish = chromosomeList[c].featureList[f].end;
				theFeature = chromosomeList[c].featureList[f];
				foundFeature = true;
			}
		}
	}
	
	// pass message back to the user if nothing found.
	if(!foundFeature) {
		setTextMessage("Cant find feature called " + featureName);
	}
	
	return theFeature;
}

/**
* Flash - Javascript bridge function to turn off the highlight of a particular feature
*
*/

function unsetHighlight(featureName:String) {
	var foundFeature:Boolean = false;
	for(var c = 0; c < chromosomeList.length; c++) {
		for (var f = 0; f <chromosomeList[c].featureList.length; f++) {
			if(chromosomeList[c].featureList[f].label_internal == featureName) {
				// Turn off the hilite by setting stayOn to false and then rechecking
				chromosomeList[c].featureList[f].hiliteStayOn = false;
				chromosomeList[c].featureList[f].checkHilites();
				chromosomeList[c].featureList[f].drawFeature(false);
				foundFeature = true;
			}
		}
	}
	// pass message back to the user if nothing found.
	if(!foundFeature) {
		setTextMessage("Cant find feature called " + featureName);
	}
}




// Hide all but one chromosome (for zooming)
function hideAllChromosomesButOne(clipName:String):Void {
	for(var c = 0; c < chromosomeList.length; c++) {
		if(chromosomeList[c]._name != clipName) {
			chromosomeList[c]._visible = Boolean(false);
		}
	}
}

// Make all chromosomes appear
function showAllChromosomes():Void {
	for(var c = 0; c < chromosomeList.length; c++) {
		chromosomeList[c]._visible = Boolean(true);
	}
}

annotationListener.result = function(evt:Object) {
	trace("Annotation data loaded, entries: "+annotation_ds.getLength());
	
	/*
	links_ds.first();
	while(links_ds.hasNext()) {
		trace("Link: start=" + links_ds.currentItem.startID);
	}
	*/
	
	annotation_ds.first();
	

	while (annotation_ds.hasNext()) {
		
		
		if(annotation_ds.currentItem.type == "eqtl") {
			
			 //Need to get start and stop from other features
				var start_Feature = Feature(findFeature(annotation_ds.currentItem.start));
				var end_Feature = Feature(findFeature(annotation_ds.currentItem.end));
			
				if( (end_Feature == undefined) || (start_Feature == undefined)) {
					annotation_ds.next();
					continue;
				}
				
				// trace ("End feature: " + end_Feature.label_internal);
				
				// convert local coords to global
				var start_point:Object = {x:start_Feature._width/2, y:start_Feature._height/2};
				var end_point:Object = {x:end_Feature._width/2, y:end_Feature._height/2};
				start_Feature.localToGlobal(start_point);
				end_Feature.localToGlobal(end_point);
				if( isNaN(start_point.x) ) {
					annotation_ds.next();
					continue;
				}
				
				// trace ("Start feature: " + start_Feature.label_internal);
				// trace ("start global: " + start_point.x + " y: " + start_point.y);
				// trace (">>>>>>>>>>>>>>> end global: " + end_point.x + " y: " + end_point.y);
				// trace ("start chromosome:" + start_Feature.chromosome);
				
				var start_chr_mc:MovieClip = MovieClip(chromosomeList[ chromosomeNameToIndex[start_Feature.chromosome] ]);
				var end_chr_mc:MovieClip = MovieClip(chromosomeList[ chromosomeNameToIndex[end_Feature.chromosome] ]);
				
				// trace ("start chromosome obj chr: " + start_chr_mc.chromosome);
				
				var outObject:Object = {localFeature:start_Feature, remoteFeature:end_Feature, color:annotation_ds.currentItem.color};
				var inObject:Object = {localFeature:end_Feature, remoteFeature:start_Feature, color:annotation_ds.currentItem.color};
				
				start_chr_mc.addOutLink(outObject);
				end_chr_mc.addInLink(inObject);
				// trace("----------------outlink length: " + start_chr_mc.outLinkList.length);
				/*
				_root.lineStyle(0, 0xdddddd, 100);
				_root.moveTo(start_point.x, start_point.y);
				// _root.curveTo(end_point.x,start_point.y,end_point.x, end_point.y);
				_root.lineTo(end_point.x, end_point.y);
				// skip to the next real feature
				// annotation_ds.next();
				*/
		}
		else {
		
			var parent_mc:MovieClip = MovieClip(chromosomeList[ chromosomeNameToIndex[annotation_ds.currentItem.chromosome] ]);
			parent_mc._alpha = 100; // only turn up chromosomes with annotations.
			parent_mc.number_txt.textColor = 0x000000;
			
			var feature:Feature = Feature.createFeature(parent_mc, parent_mc.getNextHighestDepth(), parent_mc.chrWidth+5, annotation_ds.currentItem.start/parent_mc.scaleFactor, annotation_ds.currentItem.chromosome, annotation_ds.currentItem.start, annotation_ds.currentItem.end, annotation_ds.currentItem.type, annotation_ds.currentItem.label, annotation_ds.currentItem.link, annotation_ds.currentItem.color);
			parent_mc.addFeature(feature);
			trace("Found: "+feature.label+" on chromosome "+feature.chromosome);
			//feature.drawFeature();
			// chromosomeList[feature.chromosome-1].addFeature(feature);
			//trace("check for chromosome: "+chromosomeList[feature.chromosome-1]._name);
			//trace("check for chromosome: "+parent_mc._name);
			//trace("Features for " + parent_mc._name + " = " + parent_mc.featureList.length);
			//chromosomeList[feature.chromosome-1].drawFeature(feature);
			
		}
		annotation_ds.next();
	}
	
	
	// render all the various annotation features at once.
	refreshAllChromosomes();
	/*
		for(var c = 0; c < chromosomeList.length; c++) {
			chromosomeList[c].drawFeatures(_root.labelFeaturesOnGenomeView,true);
		}
	*/
};

annotation_dc.addEventListener("result", annotationListener);
var cytoFileListener:Object = new Object();
cytoFileListener.result = function(evt:Object) {
	trace("CytoBand data loaded, entries: "+cytoIdeo_chr_ds.getLength());
	//trace("Half = "+int(cytoIdeo_chr_ds.getLength()/2));
	// gotoAndStop(2); // move off the loading scene
	loadingText._visible = false;
	cytoIdeo_chr_ds.first();
	cytoIdeo_chr_ds.addSort("chrNum", ["index"]);
	var i:Number = 1;
	var scaleFactor:Number = 10000000;
	init = new Object();
	
	// distribute the chromosomes over the appropriate number of rows
	// as defined by chromosomeRows, passed in from the HTML tags, default is 1
	var chrsPerRow:Number = Math.ceil((cytoIdeo_chr_ds.getLength())/chromosomeRows);; // default to all on one row
	trace("There will be " + chrsPerRow + " chromosomes on each row");
	
	init.chrSpacing = (Stage.width/chrsPerRow)*.65;
	init.chrWidth = (Stage.width/chrsPerRow)*.3;
	init.qtlWidth = 10;
	init._x = 10;
	init._y = (Stage.width/chrsPerRow)*.5;
	init.qtlPosition = "offset";
	init.isZoomed = "no";	// are we zoomed in or not, affects the chromosome redraw
	init.isRotated = "no";  // are we rotated in the zoom view or not?

	
	var xLoc = 10;
	var yLoc = (Stage.width/chrsPerRow)*.1;
	
	// var chromosomeLayer_mc = _root.attachMovie(_root,"chromosomeLayer_mc",_root.getNextHighestDepth());
	
	while (cytoIdeo_chr_ds.hasNext()) {
		var chromosome:String = cytoIdeo_chr_ds.currentItem.number;
		var chrLength:Number = cytoIdeo_chr_ds.currentItem.length;
	
		chromosomeNameToIndex[cytoIdeo_chr_ds.currentItem.number] = (cytoIdeo_chr_ds.currentItem.index-1);
		
		trace("Chromosome: "+chromosome+", length: "+chrLength);
		trace("Chromosome: "+chromosome+", index: "+chromosomeNameToIndex[chromosome]);
		var new_mc:Chromosome = Chromosome.createChromosome(_root, _root.getNextHighestDepth(), 10, (Stage.width/chrsPerRow)*.5, chromosome, "test", chrLength, chrsPerRow);
				
		new_mc._alpha = dimChrAlpha; // turn it down until annotations are loaded for this chromosome.
	
		
		// prefs.redraw_all.addEventListener("press",new_mc);
		
		
		var currentRow:Number = Math.ceil(i/chrsPerRow);

		//trace("Current row: " + currentRow);
		
		// Arrange the chromosomes over the appropriate number of rows
		// if this is onto a new row, increase the init._y value appropriately.
		//if(i % (chrsPerRow+1) == 0) {
			init._y = 35+ ( (Stage.height/chromosomeRows) * (currentRow-1));
		//}
		
		trace("Formula: 10+(  (i-(currentRow * chrsPerRow))  *  (new_mc.chrSpacing+new_mc.chrWidth))");
		
		trace("i: " + i);
		trace("Current row: " + currentRow);
		trace("chrsPerRoww: " + chrsPerRow);
		trace("i % chrsPerRow+1: " + i % chrsPerRow+1);
		trace("new_mc.chrSpacing: " + new_mc.chrSpacing);
		trace("new_mc.chrWidth: " + new_mc.chrWidth);
		
		var mod_i = (i+chrsPerRow) % chrsPerRow;
		if(mod_i == 0) {
			mod_i = chrsPerRow;
		}
		
		
		// init._x = (Stage.width/chrsPerRow+1)+( mod_i  *  (new_mc.chrSpacing+new_mc.chrWidth));
		init._x = 10+ ( mod_i  *  (new_mc.chrSpacing+new_mc.chrWidth));

		
		new_mc.homeX = init._x - (new_mc.chrSpacing+new_mc.chrWidth);
		new_mc.homeY = init._y;
		
		new_mc._x = new_mc.homeX;
		new_mc._y = new_mc.homeY;
		
		
		trace (new_mc._name+ "Set home x: " + new_mc.homeX + " and Y: " + new_mc.homeY);
		
		//Frivolous rotation and drag and drop feature
		// new_mc._rotation = 45;
		chromosomeList.push(new_mc);
		//trace("i="+i+"Chr "+chromosome+": x="+new_mc._x+", y="+new_mc._y);
		// Read the data
		var textFmt:TextFormat = new TextFormat();
		textFmt.font = "Arial";
		textFmt.size = new_mc.chrWidth; //Stage.height/10;
		textFmt.color = 0x000000;
		
		//rather messy kludge to align chromosome numbers with chromosomes
		// the TextFormat.getTextExtent() method has many issues which is why we're not
		// using it here to dynamically position the labels correctly. Using it to
		// get the metrics object causes there to be no display at all...
		if (textFmt.size<8) {
			textFmt.size = 8; // dont let the text get too small
		}
		if (textFmt.size > 15) {
			textFmt.size = 15; // dont let the text get too large
		}
		
		
		new_mc.number_txt.setNewTextFormat(textFmt);
		new_mc.number_txt.autoSize=true;
		new_mc.number_txt.text = chromosome.toString();
		
		new_mc.number_txt._x = ( (init.chrWidth/2) - (new_mc.number_txt._width/2 ) ) ; // -(metrics.textFieldWidth/2);
		new_mc.number_txt._y += (15-textFmt.size)-2; // Bring the text lower down the page
		/*
		new_mc.chr_length = chrLength;
		new_mc.isHomePosition = false;
		*/
		
		//trace("Created: "+new_mc._name+"Chr "+new_mc.number_txt.text+", width "+new_mc.chrWidth);
		//Global scaling based on the first chromosome, this assumes its the longest...
		if (i == 1) {
			
			// the longest chromosome length isnt set explicity via flashVars, assume #1 is the longest
			if(!_longestChromosomeLength) {
				scaleFactor = chrLength/(Stage.height*(0.80/chromosomeRows));
				
				_longestChromosomeLength = new_mc.chr_length;
			}
			else {
				scaleFactor = _longestChromosomeLength/(Stage.height*(0.80/chromosomeRows));
			}
			
			trace("ScaleFactor: "+scaleFactor);
		}
		new_mc.scaleFactor = scaleFactor;
		/* create rounded rectangle mask */
		new_mc.drawChromosome();
		i++
		
		cytoIdeo_chr_ds.next();
	}
	//trace("Loading annotations");
	loadAnnotations();
}

cytoIdeo_dc.addEventListener("result", cytoFileListener);
function rect() {
	_root.clear();
	_root.lineStyle(2, 0x6688AA);
	_root.beginFill(0xAABBCC, 50);
	dx = Math.abs(h1._x-100);
	dy = Math.abs(h1._y-75);
	_root.drawRect(100-dx, 75-dy, 2*dx, 2*dy, 15);
	_root.endFill();
	updateAfterEvent();
}
function xParse(xObj) {
	// 'this' is the returned xml
	var rootNode = xObj;
	var itemNode = rootNode.firstChild;
	//
	var dataArray:Array = new Array();
	dataArray["name"] = rootNode.attributes.name; // get the band name here
	while (itemNode.firstChild.nodeValue != null) {
		dataArray[itemNode.nodeName] = itemNode.firstChild.nodeValue;
		itemNode = itemNode.nextSibling;
	}
	//xDataParsed(dataArray);
	return dataArray;
}

// Quick function to test return of data from Flash back to javascript
function getAnnotationData(format:String) {
	
	var data:String = "";
	if(format == 'html') {
		data = "<table>";
		data += "<tr><td>Name</td><td>Chromosome</td><td>Start</td><td>Stop</td><td>Type</td><td>URL</td></tr>\n";
	}
	
	if(annotation_ds.isEmpty()) {
		data = "No annotation loaded in Flash GViewer\n";
	}
	else {
		if(!annotation_ds.hasSort("label")) {
			annotation_ds.addSort("label", ["label"],DataSetIterator.Ascending);
		}
		annotation_ds.useSort("label");
		annotation_ds.first();
		while (annotation_ds.hasNext()) {
			
			if(format != 'html') {
			data += annotation_ds.currentItem.label + "\t" +  + annotation_ds.currentItem.chromosome + "\t" + annotation_ds.currentItem.start + "\t" + annotation_ds.currentItem.end + "\t" + annotation_ds.currentItem.type + "\t" + annotation_ds.currentItem.link + "\r";
			}
			else {
				data += "<tr><td>" + annotation_ds.currentItem.label + "</td><td>" +  + annotation_ds.currentItem.chromosome + "</td><td>" + annotation_ds.currentItem.start + "</td><td>" + annotation_ds.currentItem.end + "</td><td>" + annotation_ds.currentItem.type + "</td><td>" + annotation_ds.currentItem.link + "</td></tr>";
			}
		annotation_ds.next();
		}
	}
	
	if(format == 'html') {
		data += "</table>";
	}
	
	// call the javascript function displayAnnotationData in the calling webpage
	proxy.call("displayAnnotationData",data, new Object());
}


//
function xDataParsed(a:Array) {
	// iterate your array
	for (var v in a) {
		// just trace to test
		trace(v+":"+a[v]);
	}
}
function expand(clip:MovieClip) {
	clip._xscale += 2;
	clip._yscale += 2;
	if (clip._xscale>=120) {
		clip._xscale = 120;
		clip._yscale = 120;
		clearInterval(clip.interval);
	}
	clearInterval(clip.interval2);
}
function contract(clip:MovieClip) {
	clip._xscale -= 2;
	clip._yscale -= 2;
	if (clip._xscale<=100) {
		clip._xscale = 100;
		clip._yscale = 100;
		clearInterval(clip.interval2);
	}
	clearInterval(clip.interval);
}

stop();
