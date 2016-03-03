var GENEMAP = GENEMAP || {};

GENEMAP.QtlAnnotations = function (userConfig) {
  var defaultConfig = {
    border: false,
    onAnnotationSelectFunction: $.noop(),
    longestChromosome: 100,
    layout: {
      width: 10,
      height: 100,
      x: 0,
      y: 0,
    },
    chromosomeWidth: 20,
    annotationMarkerSize: 5,
    annotationLabelSize: 5,
    showAnnotationLabels: true,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var buildYScale = function () {
    return d3.scale.linear().range([0, config.layout.height]).domain([0, config.longestChromosome]);
  };

  var setupQTLAnnotations = function (annotationsGroup, chromosome) {

    var y = buildYScale();
    var xStart = config.layout.width * 0.2;
    var xEnd = config.layout.width + config.chromosomeWidth / 2;

    // Enter + Update elements
    var qtlAnnotations = annotationsGroup.selectAll('g.qtl-annotation').data(chromosome.annotations.qtls);

    // setup the new annotations
    var qtlAnnotationsEnterGroup = qtlAnnotations.enter().append('g').classed('qtl-annotation', true);
    qtlAnnotationsEnterGroup.append('line').classed('top-line', true);
    qtlAnnotationsEnterGroup.append('line').classed('bottom-line', true);
    qtlAnnotationsEnterGroup.append('rect').classed('qtl-selector infobox', true);
    qtlAnnotationsEnterGroup.append('text');

    // update
    qtlAnnotations.selectAll('line.top-line').attr({
      x1: xStart,
      y1: function (d) { return y(d.start);},
      y2: function (d) { return y(d.start);},
      x2: xEnd,
    });

    qtlAnnotations.selectAll('line.bottom-line').attr({
      x1: xStart,
      y1: function (d) { return y(d.end);},
      y2: function (d) { return y(d.end);},
      x2: xEnd,
    });

    qtlAnnotations.selectAll('rect.qtl-selector').attr({
      x: xStart,
      y: function (d) { return y(d.start); },
      width: 5,
      height: function (d) { return y(d.end) - y(d.start); },
    }).style({
      fill: function (d) { return d.color; },
    });

    qtlAnnotations.selectAll('text').attr({
      x: xStart,
      y: function (d) { return y(d.start) + config.annotationLabelSize; },
    })
    .style({
      'font-size': config.annotationLabelSize + 'px',
      visibility: config.showAnnotationLabels ? 'visible' : 'hidden',
    })
    .text(function (d) {
      return d.label;
    });

    qtlAnnotations.exit().remove();
  };

  // draw a border around the annotation target element
  var drawBorder = function (group) {

    // create the border element if it doesn't exist
    if (group.select('rect.border').empty()) {
      group.append('rect').classed('border', true);
    }

    group.select('rect.border')
      .attr({
        width: config.layout.width,
        height: config.layout.height,
      });
  };

  // An SVG representation of a chromosome with banding data. This won't create an SVG
  // element, it expects that to already have been created.
  function my(selection) {
    selection.each(function (d) {

      var qtlAnnotationGroup = d3.select(this).selectAll('.qtl-annotations').data([d]);

      qtlAnnotationGroup.enter().append('g').attr('class', 'qtl-annotations');

      qtlAnnotationGroup.attr({
        transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
        id: function (d) { return 'annotation_' + d.number; },
      });

      setupQTLAnnotations(qtlAnnotationGroup, d);

      if (config.border) {
        drawBorder(qtlAnnotationGroup);
      }

      qtlAnnotationGroup.exit().remove();
    });
  }

  my.onAnnotationSelectFunction = function (value) {
    if (!arguments.length) {
      return config.onAnnotationSelectFunction;
    }

    config.onAnnotationSelectFunction = value;
    return my;
  };

  my.layout = function (value) {
    if (!arguments.length) {
      return config.layout;
    }

    config.layout = value;
    return my;
  };

  my.longestChromosome = function (value) {
    if (!arguments.length) {
      return config.longestChromosome;
    }

    config.longestChromosome = value;
    return my;
  };

  my.chromosomeWidth = function (value) {
    if (!arguments.length) {
      return config.chromosomeWidth;
    }

    config.chromosomeWidth = value;
    return my;
  };

  return my;
};
