var GENEMAP = GENEMAP || {};

GENEMAP.AutoLayoutDecorator = function (userConfig) {
  if (!(this instanceof arguments.callee)) {
    return new arguments.callee(userConfig);
  }

  var defaultConfig = {
    width: 900,
    height: 600,
    numberPerRow: 7/*10*/,
    margin: { top: 0.1, left: 0.1, bottom: 0.1, right: 0.1 },
    cellMargin: { top: 0.05, left: 0.05, bottom: 0.10, right: 0.05 },
    labelHeight: 0.02,
    chromosomeAspectRatio: 0.04,
    scale: 1,
    annotations: {
      label: {
        size: 3,
        show: true,
        showThreshold: 8,
        maxSize: 14,
      },
      marker: {
        size: 6,
        show: true,
        maxSize: 20,
      },
    },
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var applyMaxSizeAndThreshold = function (value, settings) {
    var result = _.cloneDeep(value);

    if (value.show) {
      var zoomedSize = value.size * config.scale;

      if (settings.showThreshold) {
        result.show = zoomedSize >= settings.showThreshold;
      }

      if (settings.maxSize) {
        if (zoomedSize > settings.maxSize) {
          result.size = settings.maxSize / config.scale;
        }
      }
    }

    return result;
  };

  return {

    decorateGenome: function (inputGenome) {

      //var genome = _.cloneDeep(inputGenome);
      var genome =  inputGenome;

      var sizeLessMargin = {
        width: config.width * (1 - config.margin.left - config.margin.right),
        height: config.height * (1 - config.margin.top - config.margin.bottom),
      };

      var cols = Math.min(config.numberPerRow, genome.chromosomes.length);
      var rows = Math.ceil(genome.chromosomes.length / cols);
      log.trace("numberPerRow= "+ config.numberPerRow +", chromosomes.length= "+ genome.chromosomes.length);
      log.trace("Cols= "+ cols +", rows= "+ rows);

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
      var sizeLabelHeight = config.labelHeight * cellDimensions.height;

      // calculate the chromosome heightRatio
      var chromosomeHeight = cellDimensions.height - labelHeight - sizeLabelHeight - cellMargins.top - cellMargins.bottom;

      // calculate the chromosome width
      //maintain aspect ratio until the chromosome starts looking really wide, then start growing the width more slowly
      var chromosomeWidth = Math.min( 65 / config.scale, chromosomeHeight * config.chromosomeAspectRatio);

      // calculate the total annotations widthRatio
      var totalAnnotations = cellDimensions.width - chromosomeWidth - cellMargins.left - cellMargins.right;

      // spit this between the two regions
      var annotationWidth = totalAnnotations / 2;

      var longest = Math.max.apply(null, genome.chromosomes.map(function (c) { return c.length; }));

      var annotationsConfig = {
        label: _.pick(config.annotations.label, ['size', 'show']),
        marker:  _.pick(config.annotations.marker, ['size', 'show']),
      };

      annotationsConfig.label = applyMaxSizeAndThreshold(annotationsConfig.label, config.annotations.label);
      annotationsConfig.marker = applyMaxSizeAndThreshold(annotationsConfig.marker, config.annotations.marker);

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
          chromosomeWidth: chromosomeWidth,
          x: cellMargins.left,
          y: cellMargins.top,
        },
        sizeLabelPosition:{
          cellHeight:  chromosomeHeight,
          height: sizeLabelHeight,
          width: cellDimensions.width - cellMargins.left - cellMargins.right,
          x: cellMargins.left,
          y: cellMargins.top + labelHeight,
        },
        qtlAnnotationPosition: {
          height: chromosomeHeight,
          width: annotationWidth,
          chromosomeWidth: chromosomeWidth,
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
        annotations: annotationsConfig,
        scale : config.scale,
      };

      //special case where we only have 1 chromosome
      if ( genome.chromosomes.length == 1 )
      {
        cellLayout.chromosomePosition.x = cellMargins.left + 0.5 * annotationWidth;
        cellLayout.geneAnnotationPosition.x = cellMargins.left + 0.5 * annotationWidth + chromosomeWidth;
        cellLayout.qtlAnnotationPosition.width = annotationWidth * 0.5;
        cellLayout.geneAnnotationPosition.width = annotationWidth * 1.5;
        cellLayout.labelPosition.x = cellMargins.left + 0.5 * annotationWidth;
        cellLayout.labelPosition.width = chromosomeWidth;
        cellLayout.sizeLabelPosition.x = cellMargins.left + 0.5 * annotationWidth;
        cellLayout.sizeLabelPosition.width = chromosomeWidth;
      }

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

    numberPerRow: function (value) {
      if (!arguments.length) {
        return config.numberPerRow;
      }

      config.numberPerRow = value;
      return this;
    },

    margin: function (value) {
      if (!arguments.length) {
        return config.margin;
      }

      config.margin = _.merge(config.margin, value);
      return this;
    },

    labelHeight: function (value) {
      if (!arguments.length) {
        return config.labelHeight;
      }

      config.labelHeight = value;
      return this;
    },

    cellMargin: function (value) {
      if (!arguments.length) {
        return config.cellMargin;
      }

      config.cellMargin = value;
      return this;
    },

    chromosomeAspectRatio: function (value) {
      if (!arguments.length) {
        return config.chromosomeAspectRatio;
      }

      config.chromosomeAspectRatio = value;
      return this;
    },

    scale: function (value) {
      if (!arguments.length) {
        return config.scale;
      }

      config.scale = value;
      return this;
    },
  };
};
