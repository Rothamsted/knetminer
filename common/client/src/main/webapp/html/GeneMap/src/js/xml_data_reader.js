var GENEMAP = GENEMAP || {};

// reads from the basemap and (optinally) annotation XML files
GENEMAP.XmlDataReader = function () {

  /// returns the color property of the data formatted as an HTML color (#ffffff)
  var getColor = function (d) {
    // transform 0xffffff into #ffffff
    // if any letters are missing i.e. #ffff append 0s at the start => #00ffff
    var zeros = new Array(8 - d.length + 1).join('0');
    return '#' + zeros + d.substring(2, d.length);
  };

  var _processBasemapData = function (genome) {
    genome.chromosomes.forEach(function (chromosome) {

      // include empty lists incase there is no annotation data
      chromosome.annotations = {
        genes: [],
        qtls: [],
      };

      chromosome.bands.forEach(function (band) {
        band.color = getColor(band.color);
      });
    });

    return genome;
  };

  var _processJoinedData = function (data) {
    var genome = _processBasemapData(data[0]);
    var annotations = data[1];

    annotations.features.forEach(function (annotation) {
      annotation.color = getColor(annotation.color);
    });

    var geneClusterer = GENEMAP.GeneClusterer();

    genome.chromosomes.forEach(function (chromosome) {
      var chromosomeAnnotations = annotations.features.filter(
        function (e) { return e.chromosome === chromosome.number; });

      var genes = chromosomeAnnotations.filter(
        function (e) { return e.type.toLowerCase() === 'gene'; });

      var qtls = chromosomeAnnotations.filter(
        function (e) { return e.type.toLowerCase() === 'qtl'; });

      var combiner = GENEMAP.QTLAnnotationCombiner();
      qtls = combiner.combineSimilarQTLAnnotations(qtls);

      //Run clustering algorithm so we can use the clusters later when drawing
     geneClusters = geneClusterer.createClustersFromGenes(genes);

      chromosome.annotations = {
        genes: genes,
        geneClusters: geneClusters,
        geneDisplayClusters: geneClusters.slice(), //a copy for future modification
        qtls: qtls,
      };
    });

    return genome;
  };

  return {

    readXMLData: function (basemapPath, annotationPath) {

      var basemapReader = GENEMAP.BasemapXmlReader();
      var basemapPromise = basemapReader.readBasemapXML(basemapPath);

      if (annotationPath) {
        var annotationReader = GENEMAP.AnnotationXMLReader();
        var annotationPromise = annotationReader.readAnnotationXML(annotationPath);

        var promise = Promise.all([basemapPromise, annotationPromise]).then(_processJoinedData, function (error) {

          console.log('error while reading XML files: ' + error);

          // try and process the basemap file
          return basemapPromise.then(_processBasemapData);
        });

        return promise;
      }

      return basemapPromise.then(_processBasemapData);
    },
  };
};
