var GENEMAP = GENEMAP || {};

GENEMAP.AutoLayoutDecorator = function(userConfig) {
  if (!(this instanceof arguments.callee)) {
    return new arguments.callee(userConfig);
  }

  var defaultConfig = {
    width: 900,
    height: 600,
    numberPerRow: 10,
    chromosomeWidth: 0.05,
    longestChromosomeHeight: 1,
    maxCrhomosomeWidthToLengthRatio: 0.1,
    labelHeight: 0.05,
    showAnnotationLabels: true,
    annotationWidth: 0.2,
    minLabelHeightPx: 8,
    margin: {top: 0.1, left: 0.1, bottom: 0.1, right: 0.1},
    spacing: {horizontal: 0.05, vertical: 0.05},
  };

  var config = _.merge({}, defaultConfig, userConfig);

  return {

    decorateGenome: function(inputGenome) {

      genome = _.cloneDeep(inputGenome)

      // a cell contains the chromosome (with label), annotation area and the padding to the right & bottom
      var cell = {
        width: config.spacing.horizontal + config.chromosomeWidth + config.annotationWidth,
        height: config.spacing.vertical + config.longestChromosomeHeight + config.labelHeight
      };

      var sizeLessMargin = {
        width: config.width * (1 - config.margin.left - config.margin.right),
        height: config.height * (1 - config.margin.top - config.margin.bottom)
      };

      var rows = Math.ceil(genome.chromosomes.length / config.numberPerRow);

      var cellWidth = sizeLessMargin.width / config.numberPerRow;
      var cellHeight = sizeLessMargin.height / rows;

      var widthRatio = cellWidth / (config.chromosomeWidth + config.annotationWidth + config.spacing.horizontal);
      var heightRatio = cellHeight / (config.longestChromosomeHeight + config.labelHeight + config.spacing.vertical);

      var longest = Math.max.apply(null, genome.chromosomes.map(function(c){ return c.length; }));

      var chromosomeLayout = {
        height: heightRatio * config.longestChromosomeHeight,
        labelHeight: heightRatio * config.labelHeight,
        width: widthRatio * config.chromosomeWidth,
        annotationWidth: widthRatio * config.annotationWidth,
        longestChromosome: longest,
        showAnnotationLabels: config.showAnnotationLabels
      }

      if (chromosomeLayout.labelHeight < config.minLabelHeightPx){
        // if the label doesn't reach the minimum height increase it to the minimum
        // and take the extra height from the chromosome height
        var extraHeight = config.minLabelHeightPx - chromosomeLayout.labelHeight;
        chromosomeLayout.height = chromosomeLayout.height - extraHeight;
        chromosomeLayout.labelHeight = config.minLabelHeightPx;
      }

      if (chromosomeLayout.width / chromosomeLayout.height > config.maxCrhomosomeWidthToLengthRatio){
        var newWdith = chromosomeLayout.height * config.maxCrhomosomeWidthToLengthRatio;
        var lostWidth = chromosomeLayout.width - newWdith;
        chromosomeLayout.annotationWidth = chromosomeLayout.annotationWidth + lostWidth;
        chromosomeLayout.width = newWdith;
      }

      genome.drawing = _.pick(config, ['width', 'height']);
      genome.drawing.margin = {
        top: config.margin.top * genome.drawing.height,
        left: config.margin.left * genome.drawing.width,
        bottom: config.margin.bottom * genome.drawing.height,
        right: config.margin.right * genome.drawing.width,
      }

      genome.chromosomes.forEach(function(chromosome, i) {
        var col = i % config.numberPerRow;
        var row = Math.floor(i / config.numberPerRow);

        chromosome.y = (row * cellHeight) + (config.margin.top * config.height);
        chromosome.x = (col * cellWidth) + (config.margin.left * config.width);

        chromosome = _.merge(chromosome, chromosomeLayout);
      });

      genome.choromosomeLayout = chromosomeLayout;

      return genome;
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
