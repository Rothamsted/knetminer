var GENEMAP = GENEMAP || {};

// reads from the basemap and (optinally) annotation XML files
GENEMAP.XmlDataReader = function() {

  if (!(this instanceof arguments.callee)) {
    return new arguments.callee();
  }

  /// returns the color property of the data formatted as an HTML color (#ffffff)
  var getColor = function(d) {
    // transform 0xffffff into #ffffff
    // if any letters are missing i.e. #ffff append 0s at the start => #00ffff
    return "#" +
            "0".repeat(8 - d.length) +
            d.substring(2, d.length);
  };

  var _joinData = function(data) {
    var genome = data[0];
    var annotations = data[1];

    annotations.features.forEach(function(annotation){
      annotations.color = getColor(annotation.color);
    });

    genome.chromosomes.forEach(function(chromosome) {
      var chromosomeAnnotations = annotations.features.filter(function(e) { return e.chromosome === chromosome.number});

      var genes = chromosomeAnnotations.filter(function(e){ return e.type === 'gene'; })
      var qtls = chromosomeAnnotations.filter(function(e){ return e.type === 'QTL'; })

      chromosome.annotations = {
        genes: genes,
        qtls: qtls
      }

      chromosome.bands.forEach(function(band) {
          band.color = getColor(band.color);
      });

    });

    return genome;
  };

  return {

    readXMLData: function(basemapPath, annotationPath) {

      var basemapReader = GENEMAP.BasemapXmlReader();
      var basemapPromise = basemapReader.readBasemapXML(basemapPath);

      if (annotationPath) {
        var annotationReader = GENEMAP.AnnotationXMLReader();
        var annotationPromise = annotationReader.readAnnotationXML(annotationPath);

        var promise = Promise.all([basemapPromise, annotationPromise]).then(_joinData);

        return promise;
      }

      return basemapPromise;
    }
  }
}
