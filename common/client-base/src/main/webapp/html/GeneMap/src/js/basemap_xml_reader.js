var GENEMAP = GENEMAP || {};

// reads the chromosome data from the basemap file
GENEMAP.BasemapXmlReader = function () {

  // read a chromosome band object from an XML element
  var _readBand = function (elt) {
    return {
      index: elt.getAttribute('index'),
      start: elt.getElementsByTagName('start')[0].childNodes[0].nodeValue,
      end: elt.getElementsByTagName('end')[0].childNodes[0].nodeValue,
      color: elt.getElementsByTagName('color')[0].childNodes[0].nodeValue,
    };
  };

  // read a chromosome JS object from an XML element
  var _readChromosome = function (elt) {
    var chromosome = {
      index:elt.getAttribute('index'),
      length:elt.getAttribute('length'),
      number:elt.getAttribute('number'),
      bands:[],
    };

    var bandElements = elt.getElementsByTagName('band');

    for (var j = 0; j < bandElements.length; j++) {
      var band = _readBand(bandElements[j]);
      chromosome.bands.push(band);
    }

    return chromosome;
  };

  // reads the genome data from a basemap XML document
  var _readBasemapXML = function (xml) {
    var genome = {};
    genome.chromosomes = [];

    var chromosomeElements = xml.getElementsByTagName('chromosome');
    for (var i = 0; i < chromosomeElements.length; i++) {
      var chromosome = _readChromosome(chromosomeElements[i]);
      genome.chromosomes.push(chromosome);
    }

    return genome;
  };

  return {

    readBasemapXML: function (path) {
      log.info('reading basemap file: ', path);
      return d3.promise.xml(path).then(_readBasemapXML);
    },

    readBasemapXMLFromRawXML: function (xmlStr) {
      log.info('reading basemap xml');
      return new Promise(function(resolve, reject){
    	  resolve(new DOMParser().parseFromString(xmlStr, "application/xml"));
    	}).then(_readBasemapXML);
    },
  };
};
