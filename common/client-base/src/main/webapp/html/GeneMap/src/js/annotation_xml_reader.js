var GENEMAP = GENEMAP || {};



// reads the gene and qtl annotations from the .xml file
GENEMAP.AnnotationXMLReader = function () {

  var _getValue = function (elt, name){
    var element = elt.getElementsByTagName(name);
    if (element && element.length > 0){
      return element[0].childNodes[0].nodeValue;
    }
    else {
      return null;
    }
  }

  var _readFeature = function (elt) {
    var start = +elt.getElementsByTagName('start')[0].childNodes[0].nodeValue;
    var end = +elt.getElementsByTagName('end')[0].childNodes[0].nodeValue;
    var midpoint = (end - start) / 2 + start;

    return {
      id: elt.getAttribute('id'),
      chromosome: elt.getElementsByTagName('chromosome')[0].childNodes[0].nodeValue,
      start: start,
      end: end,
      midpoint: midpoint,
      type:  _getValue(elt, 'type'),
      color: _getValue(elt, 'color'),
      label: _getValue(elt, 'label'),
      link:  _getValue(elt, 'link'),
      score: _getValue(elt, 'score'),
      pvalue: _getValue(elt, 'pvalue'),
      trait: _getValue(elt, 'trait'),
      selected: false,
    };
  };

  var _readAnnotations = function (xml) {
    var genome = {};
    genome.features = [];

    var elements = xml.getElementsByTagName('feature');
    for (var i = 0; i < elements.length; i++) {
      genome.features.push(_readFeature(elements[i]));
    }

    return genome;
  };

  return {

    readAnnotationXML: function (path) {
      log.info('reading annotation file: ', path);
      return d3.promise.xml(path).then(_readAnnotations);
    },

    readAnnotationXMLFromRawXML: function (xmlStr) {
      log.info('reading annotation xml');
      return new Promise(function(resolve, reject){
    	  resolve(new DOMParser().parseFromString(xmlStr, "application/xml"));
    	}).then(_readAnnotations);
    },
  };
};
