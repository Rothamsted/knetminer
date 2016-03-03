var GENEMAP = GENEMAP || {};

GENEMAP.QtlAnnotations = function (userConfig) {
  var defaultConfig = {
    border: true,
    labelHeight: 8,
    labelRectangles: false,
    onAnnotationSelectFunction: $.noop(),
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var setupQTLAnnotations = function (annotationsGroup, y) {

    var chromosome = annotationsGroup.data()[0];
    var leftEdge = chromosome.chromosomePosition.x + chromosome.chromosomePosition.width / 2;
    var hozPosition = leftEdge - chromosome.annotationWidth * 0.5;

    // Enter + Update elements
    var qtlAnnotations = annotationsGroup.selectAll('g.qtl_annotation').data(chromosome.annotations.qtls);

    // setup the new annotations
    var qtlAnnotationsEnterGroup = qtlAnnotations.enter().append('g').classed('qtl_annotation', true);
    qtlAnnotationsEnterGroup.append('line').classed('top-line', true);
    qtlAnnotationsEnterGroup.append('line').classed('bottom-line', true);
    qtlAnnotationsEnterGroup.append('rect').classed('qtl-selector infobox', true);
    qtlAnnotationsEnterGroup.append('text');

    // update
    qtlAnnotations.selectAll('line.top-line').attr({
      x1: leftEdge,
      y1: function (d) { return y(d.start);},
      y2: function (d) { return y(d.start);},
      x2: hozPosition,
    });

    qtlAnnotations.selectAll('line.bottom-line').attr({
      x1: leftEdge,
      y1: function (d) { return y(d.end);},
      y2: function (d) { return y(d.end);},
      x2: hozPosition,
    });

    qtlAnnotations.selectAll('rect.qtl-selector').attr({
      x: hozPosition,
      y: function (d) { return y(d.start); },
      width: 5,
      height: function (d) { return y(d.end) - y(d.start); },
    }).style({
      fill: function (d) { return d.color; },
    });

    qtlAnnotations.selectAll('text').attr({
      x: hozPosition,
      y: function (d) { return y(d.start) + chromosome.annotationLabelHeight; },
    })
    .style({
      'font-size': chromosome.annotationLabelHeight + 'px',
      visibility: chromosome.showAnnotationLabels ? 'visible' : 'hidden',
    })
    .text(function (d) {
      return d.label;
    });

    qtlAnnotations.exit().remove();
  };

  // draw a border around the annotation target element
  var drawBorder = function (group, chromosome, y) {

    // create the border element if it doesn't exist
    if (group.select('rect.border').empty()) {
      group.append('rect').classed('border', true);
    }

    var width = chromosome.annotationWidth / 2;
    var indent = chromosome.chromosomePosition.x - width;

    group.select('rect.border')
      .attr({
        x:indent,
        y:0,
        width: width,
        height: chromosome.chromosomePosition.maxHeight,
      });
  };

  var buildYScale = function (d) {
    return d3.scale.linear().range([0, d.chromosomePosition.maxHeight]).domain([0, d.longestChromosome]);
  };

  // An SVG representation of a chromosome with banding data. This won't create an SVG
  // element, it expects that to already have been created.
  function my(selection) {
    selection.each(function (d) {

      var groups = d3.select(this).selectAll('.qtl-annotation-group').data([d]);

      groups.enter().append('g').attr('class', 'qtl-annotation-group');

      groups.each(function (d) {
        var y = buildYScale(d);

        var group = d3.select(this).attr({
          id: function (d) { return 'annotation_' + d.number; },
          transform: function (d) {
            return 'translate(0,' + d.labelHeight + ')';
          },
        });

        setupQTLAnnotations(group, y);

        if (config.border) {
          drawBorder(group, d, y);
        }
      });

      groups.exit().remove();
    });
  }

  my.width = function (value) {
    if (!arguments.length) {
      return config.width;
    }

    config.width = value;
    return my;
  };

  my.height = function (value) {
    if (!arguments.length) {
      return config.height;
    }

    config.height = value;
    return my;
  };

  my.yScale = function (value) {
    if (!arguments.length) {
      return config.yScale;
    }

    config.yScale = value;
    return my;
  };

  my.onAnnotationSelectFunction = function (value) {
    if (!arguments.length) {
      return config.onAnnotationSelectFunction;
    }

    config.onAnnotationSelectFunction = value;
    return my;
  };

  return my;
};
