var GENEMAP = GENEMAP || {};

GENEMAP.MapLayout = function(userConfig) {
  if (!(this instanceof arguments.callee)) {
    return new arguments.callee(userConfig);
  }

  var defaultConfig = {
    width: 900,
    height: 600,
    chromosomeWidth: 50,
    chromosomePerRow: 5,
    longestChromosomeHeight: 200,
    annotationWidth: 100,
    margin: {top: 25, left: 25, bottom: 25, right: 25},
    spacing: {horizontal: 30, vertical: 30},
  };

  var config = _.merge({}, defaultConfig, userConfig);



  return {

    generateLayout: function(numberOfChromosomes) {
      var layout = {
        chromosomes: []
      };

      var minColWidth = config.spacing.horizontal + config.chromosomeWidth + config.annotationWidth;
      var minRowHeight = config.spacing.vertical + config.longestChromosomeHeight;

      var rows = Math.ceil(numberOfChromosomes / config.chromosomePerRow);

      var colWidth = Math.ceil((config.width - config.margin.left - config.margin.right) / config.chromosomePerRow);
      var rowHeight = Math.ceil((config.height - config.margin.top - config.margin.bottom) / rows);

      if (colWidth < minColWidth) {
        colWidth = minColWidth;
      }

      if (rowHeight < minRowHeight) {
        rowHeight = minRowHeight;
      }

      for(var i =0; i < numberOfChromosomes; i++){
        var col = i % config.chromosomePerRow;
        var row = Math.floor(i / config.chromosomePerRow);

        layout.chromosomes.push( {
          y: (row * rowHeight) + config.margin.left,
          x: (col * colWidth) + config.margin.top
        });
      }

      return layout;
    },

    width: function(value) {
      if (!arguments.length) return config.width;
      config.width = value;
      return this;
    },

    height: function(value) {
      if (!arguments.length) return config.height;
      config.height = value;
      return this;
    },

    chromosomeWidth: function(value) {
      if (!arguments.length) return config.chromosomeWidth;
      config.chromosomeWidth = value;
      return this;
    },

    annotationWidth: function(value) {
      if (!arguments.length) return config.annotationWidth;
      config.annotationWidth = value;
      return this;
    },

    margin: function(value) {
      if (!arguments.length) return config.margin;
      config.margin = _.merge(config.margin, value);
      return this;
    },

    spacing: function(value) {
      if (!arguments.length) return config.spacing;
      config.spacing = value;
      return this;
    }

  };
};
