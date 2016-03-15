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
        var qtl = value[0];
        qtl.count = value.length;

        qtl.labels = value.map(function (q) { return q.label; });
        qtl.links = value.map(function (q) { return q.link; });
        qtl.colors = value.map(function (q) { return q.color; });

        delete qtl.label;
        delete qtl.link;
        delete qtl.color;

        result.push(qtl);
      });

      return result;
    },
  };
};
