var GENEMAP = GENEMAP || {};

// takes a list of qtl annotations and combines annotations with the same start and
// end points
GENEMAP.QTLAnnotationCombiner = function () {

  return {
    combineSimilarQTLAnnotations: function (qtlAnnotations) {

      var result = [];
      var hash = {};

      qtlAnnotations.forEach(function (qtl) {
        var key = qtl.start + '-' + qtl.end;

        if (!hash.hasOwnProperty(key)) {
          hash[key] = [];
        }

        hash[key].push(qtl);
      });

      _.forEach(hash, function (value, key) {

        var qtlCollection = {
          qtlList: value,
          count : value.length,
          start: value[0].start,
          midpoint: value[0].midpoint,
          end: value[0].end,
          type: "qtllist",
          id: key,
        };
        result.push(qtlCollection);
      });

      return result;
    },
  };
};
