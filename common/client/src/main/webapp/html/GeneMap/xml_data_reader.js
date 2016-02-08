var GENEMAP = GENEMAP || {};

// reads from the basemap and (optinally) annotation XML files
GENEMAP.XmlDataReader = function() {

  if (!(this instanceof arguments.callee)) {
    return new arguments.callee();
  }


  var _joinData = function(data) {
    var genome = data[0];
    var annotations = data[1];

    genome.chromosomes.forEach(function(chromosome) {
      chromosome.annotations = annotations.features.filter(function(e) { return e.chromosome === chromosome.number});
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
