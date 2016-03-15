var GENEMAP = GENEMAP || {};

// reads the gene and qtl annotations from the .xml file
GENEMAP.AnnotationXMLReader = function () {

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
      type: elt.getElementsByTagName('type')[0].childNodes[0].nodeValue,
      color: elt.getElementsByTagName('color')[0].childNodes[0].nodeValue,
      label: elt.getElementsByTagName('label')[0].childNodes[0].nodeValue,
      link: elt.getElementsByTagName('link')[0].childNodes[0].nodeValue,
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
      console.log('reading annotation file: ' + path);
      return d3.promise.xml(path).then(_readAnnotations);
    },
  };
};
