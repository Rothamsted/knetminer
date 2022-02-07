var GENEMAP = GENEMAP || {};

GENEMAP.ChromosomeCell = function (userConfig) {
  var defaultConfig = {
    border: false,
    onAnnotationSelectFunction: $.noop(),
    onExpandClusterFunction: $.noop(),
    onLabelSelectFunction: $.noop(),
    maxAnnotationLayers: 3,
    maxSnpPValue: 1.0,
    svg: null,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  // An SVG representation of a chromosome with banding data. This is expecting the passed selection to be within an
  // SVG element and to have a list of chromosome JSON objects as its data.


  function my(selection) {
    selection.each(function (d) {
      var layout = d.cellLayout;

      // build up the selection of chromosome objects
      var cells = d3.select(this).selectAll('.chromosome-cell').data(d.chromosomes);


      // setup a basic element structure for any new chromosomes
      var enterGroup = cells.enter().append('g').attr('class', 'chromosome-cell');

      if (config.border) {
        enterGroup.append('rect').classed('border', true);
      }

      // update each of the cells
      cells.attr({
        transform: function (d) {
          return 'translate(' + d.cell.x + ',' + d.cell.y + ')';
        },
      });

      if (config.border) {
        cells.select('rect').attr({
          x:0,
          y:0,
          width: function (d) { return d.cell.width; },
          height: function (d) { return d.cell.height; },
        });
      }

      // draw the annotations
      // should be drawn before the chormosomes as some of the lines need to be
      // underneath the chormosome drawings.

      //If there's only one chromosome we have space for more clusters
      var nChromosomes = d.chromosomes.length;
      var doClustering = nChromosomes > 1;

      var geneDrawer = GENEMAP.GeneAnnotations()
        .onAnnotationSelectFunction(config.onAnnotationSelectFunction)
        .onExpandClusterFunction(config.onExpandClusterFunction)
        .layout(layout.geneAnnotationPosition)
        .longestChromosome(layout.longestChromosome)
        .chromosomeWidth(layout.chromosomePosition.width)
        .annotationLabelSize(layout.annotations.label.size)
        .annotationMarkerSize(layout.annotations.marker.size)
        .drawing(config.svg)
        .scale( layout.scale)
        ;

      cells.call(geneDrawer);


      // draw the chromosomes in the cells
      var chromosomeDrawer = GENEMAP.Chromosome()
        .layout(layout.chromosomePosition)
        .longestChromosome(layout.longestChromosome)
        .onAnnotationSelectFunction(config.onAnnotationSelectFunction)
        .scale( layout.scale)
        .bands("genes")
        .drawing(config.svg);


      cells.call(chromosomeDrawer);

      // draw the labels for the chromosomes
      var chromosomeLabelDrawer = GENEMAP.ChromosomeLabel()
        .layout(layout.labelPosition)
        .sizeLayout(layout.sizeLabelPosition)
        .onLabelSelectFunction(config.onLabelSelectFunction)
        .longestChromosome(layout.longestChromosome)
        .scale( layout.scale)
        ;


      cells.call(chromosomeLabelDrawer);

      var qtlDrawer = GENEMAP.QtlAnnotations()
        .onAnnotationSelectFunction(config.onAnnotationSelectFunction)
        .layout(layout.qtlAnnotationPosition)
        .longestChromosome(layout.longestChromosome)
        .chromosomeWidth(layout.chromosomePosition.width)
        .annotationLabelSize(layout.annotations.label.size)
        .annotationMarkerSize(layout.annotations.marker.size)
        .showAnnotationLabels(layout.annotations.label.show)
        .maxSnpPValue( config.maxSnpPValue)
        .drawing(config.svg)
        .scale( layout.scale);

      cells.call(qtlDrawer);

      // remove any missing elements
      cells.exit().remove();
    });
  }

  my.onAnnotationSelectFunction = function (value) {
    if (!arguments.length) {
      return config.onAnnotationSelectFunction;
    }

    config.onAnnotationSelectFunction = value;
    return my;
  };

  my.onExpandClusterFunction = function (value) {
    if (!arguments.length) {
      return config.onExpandClusterFunction;
    }

    config.onExpandClusterFunction = value;
    return my;
  };

  my.onLabelSelectFunction = function (value) {
    if (!arguments.length) {
      return config.onLabelSelectFunction;
    }

    config.onLabelSelectFunction = value;
    return my;
  };

  my.infoBoxManager = function (value) {
    if (!arguments.length) {
      return config.infoBoxManager;
    }

    config.infoBoxManager = value;
    return my;
  };

  my.maxAnnotationLayers = function (value) {
    if (!arguments.length) {
      return config.maxAnnotationLayers;
    }

    config.maxAnnotationLayers = value;
    return my;
  };

  my.maxSnpPValue = function (value) {
    if (!arguments.length) {
      return config.maxSnpPValue;
    }

    config.maxSnpPValue = value;
    return my;
  };

  my.svg = function (value) {
    if (!arguments.length) {
      return config.svg;
    }

    config.svg = value;
    return my;
  };

  return my;
};
