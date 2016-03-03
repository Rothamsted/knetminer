var GENEMAP = GENEMAP || {};

GENEMAP.AutoLayoutDecorator = function (userConfig) {
  if (!(this instanceof arguments.callee)) {
    return new arguments.callee(userConfig);
  }

  var defaultConfig = {
    width: 900,
    height: 600,
    scale: 1,
    translate: [0, 0],
    numberPerRow: 10,
    chromosomeWidth: 0.06,
    longestChromosomeHeight: 1,
    maxCrhomosomeWidthToLengthRatio: 0.1,
    annotationLabelHeight: 0.02,
    annotationLabelThreshold:12,
    annotationLableMaxSize: 14,
    annotationMarkerSize: 0.03,
    annotationMarkerMinSize: 6,
    annotationMarkerMaxSize: 24,
    annotationWidth: 0.4,
    minLabelHeightPx: 8,
    margin: { top: 0.1, left: 0.1, bottom: 0.1, right: 0.1 },
    cellMargin: { top: 0.05, left: 0.05, bottom: 0.05, right: 0.05 },
    labelHeight: 0.05,
    chromosomeAspectRatio: 0.04,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  return {

    decorateGenome: function (inputGenome) {

      var genome = _.cloneDeep(inputGenome);

      var sizeLessMargin = {
        width: config.width * (1 - config.margin.left - config.margin.right),
        height: config.height * (1 - config.margin.top - config.margin.bottom),
      };

      var cols = Math.min(config.numberPerRow, genome.chromosomes.length);
      var rows = Math.ceil(genome.chromosomes.length / cols);

      var cellDimensions = {
        width: sizeLessMargin.width / cols,
        height: sizeLessMargin.height / rows,
      };

      // calculate the margin widths:
      var cellMargins = {
        top: cellDimensions.height * config.cellMargin.top,
        bottom: cellDimensions.height * config.cellMargin.bottom,
        left: cellDimensions.width * config.cellMargin.left,
        right: cellDimensions.width * config.cellMargin.right,
      };

      // calculate the chromosome label height
      var labelHeight = config.labelHeight * cellDimensions.height;

      // calculate the chromosome heightRatio
      var chromosomeHeight = cellDimensions.height - labelHeight - cellMargins.top - cellMargins.bottom;

      // calculate the chromosome width
      var chromosomeWidth = chromosomeHeight * config.chromosomeAspectRatio;

      // calculate the total annotations widthRatio
      var totalAnnotations = cellDimensions.width - chromosomeWidth - cellMargins.left - cellMargins.right;

      // spit this between the two regions
      var annotationWidth = totalAnnotations / 2;

      var longest = Math.max.apply(null, genome.chromosomes.map(function (c) { return c.length; }));

      var cellLayout = {
        chromosomePosition: {
          height: chromosomeHeight,
          width: chromosomeWidth,
          x: cellMargins.left + annotationWidth,
          y: cellMargins.top + labelHeight,
        },
        labelPosition: {
          height: labelHeight,
          width: cellDimensions.width - cellMargins.left - cellMargins.right,
          x: cellMargins.left,
          y: cellMargins.right,
        },
        qtlAnnotationPosition: {
          height: chromosomeHeight,
          width: annotationWidth,
          x: cellMargins.left,
          y: cellMargins.top + labelHeight,
        },
        geneAnnotationPosition: {
          height: chromosomeHeight,
          width: annotationWidth,
          x: cellMargins.left + annotationWidth + chromosomeWidth,
          y: cellMargins.top + labelHeight,
        },
        longestChromosome: longest,
        showAnnotationLabels: true,
        annotationLabelHeight: 10,
        annotationMarkerSize: 10,
      };

      // decorate the genome with the layout information
      genome.drawing = _.pick(config, ['width', 'height']);
      genome.drawing.margin = {
        top: config.margin.top * genome.drawing.height,
        left: config.margin.left * genome.drawing.width,
        bottom: config.margin.bottom * genome.drawing.height,
        right: config.margin.right * genome.drawing.width,
      };

      genome.chromosomes.forEach(function (chromosome, i) {
        var col = i % config.numberPerRow;
        var row = Math.floor(i / config.numberPerRow);

        chromosome.cell =  {
          y: (row * cellDimensions.height) + (config.margin.top * config.height),
          x: (col * cellDimensions.width) + (config.margin.left * config.width),
          width: cellDimensions.width,
          height: cellDimensions.height,
        };
      });

      genome.cellLayout = cellLayout;

      return genome;
    },

    width: function (value) {
      if (!arguments.length) {
        return config.width;
      }

      config.width = value;
      return this;
    },

    height: function (value) {
      if (!arguments.length) {
        return config.height;
      }

      config.height = value;
      return this;
    },

    scale: function (value) {
      if (!arguments.length) {
        return config.scale;
      }

      config.scale = value;
      return this;
    },

    translate: function (value) {
      if (!arguments.length) {
        return config.translate;
      }

      config.translate = value;
      return this;
    },

    chromosomeWidth: function (value) {
      if (!arguments.length) {
        return config.chromosomeWidth;
      }

      config.chromosomeWidth = value;
      return this;
    },

    annotationWidth: function (value) {
      if (!arguments.length) {
        return config.annotationWidth;
      }

      config.annotationWidth = value;
      return this;
    },

    margin: function (value) {
      if (!arguments.length) {
        return config.margin;
      }

      config.margin = _.merge(config.margin, value);
      return this;
    },

    spacing: function (value) {
      if (!arguments.length) {
        return config.spacing;
      }

      config.spacing = _.merge(config.spacing, value);
      return this;
    },
  };
};
