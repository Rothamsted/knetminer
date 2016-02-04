var GENEMAP = GENEMAP || {};

GENEMAP.AutoLayout = function(userConfig) {
  if (!(this instanceof arguments.callee)) {
    return new arguments.callee(userConfig);
  }

  var defaultConfig = {
    width: 900,
    height: 600,
    numberPerRow: 10,
    chromosomeWidth: 0.05,
    longestChromosomeHeight: 1,
    labelHeight: 0.05,
    annotationWidth: 0.2,
    margin: {top: 0.1, left: 0.1, bottom: 0.1, right: 0.1},
    spacing: {horizontal: 0.05, vertical: 0.05},
  };

  var config = _.merge({}, defaultConfig, userConfig);

  return {

    generateLayout: function(numberOfChromosomes) {
      var layout = {
        chromosomes: []
      };

      // a cell contains the chromosome (with label), annotation area and the padding to the right & bottom
      var cell = {
        width: config.spacing.horizontal + config.chromosomeWidth + config.annotationWidth,
        height: config.spacing.vertical + config.longestChromosomeHeight + config.labelHeight
      };

      var sizeLessMargin = {
        width: config.width * (1 - config.margin.left - config.margin.right),
        height: config.height * (1 - config.margin.top - config.margin.bottom)
      };

      var rows = Math.ceil(numberOfChromosomes / config.numberPerRow);

      var cellWidth = sizeLessMargin.width / config.numberPerRow;
      var cellHeight = sizeLessMargin.height / rows;

      var widthRatio = cellWidth / (config.chromosomeWidth + config.annotationWidth + config.spacing.horizontal);
      var heightRatio = cellHeight / (config.longestChromosomeHeight + config.labelHeight + config.spacing.vertical);

      layout.chromosome = {
        height: heightRatio * config.longestChromosomeHeight,
        labelHeight: heightRatio * config.labelHeight,
        width: widthRatio * config.chromosomeWidth,
        annotationWidth: widthRatio * config.annotationWidth
      }

      layout.drawing = _.pick(config, ['width', 'height']);
      layout.drawing.margin = {
        top: config.margin.top * layout.drawing.height,
        left: config.margin.left * layout.drawing.width,
        bottom: config.margin.bottom * layout.drawing.height,
        right: config.margin.right * layout.drawing.width,
      }

      for(var i =0; i < numberOfChromosomes; i++){
        var col = i % config.numberPerRow;
        var row = Math.floor(i / config.numberPerRow);

        layout.chromosomes.push({
          y: (row * cellHeight) + (config.margin.top * config.height),
          x: (col * cellWidth) + (config.margin.left * config.width)
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
      config.spacing = _.merge(config.spacing, value);
      return this;
    }
  };
};
