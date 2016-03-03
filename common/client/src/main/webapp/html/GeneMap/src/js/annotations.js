var GENEMAP = GENEMAP || {};

GENEMAP.Annotations = function (userConfig) {
  var defaultConfig = {
    border: false,
    labelHeight: 8,
    labelRectangles: false,
    onAnnotationSelectFunction: $.noop(),
  };

  var config = _.merge({}, defaultConfig, userConfig);

  // adds the gene annotations to the annotations group within it, uses the data
  // bound to the annotationsGroup to generate the annotation elements
  var setupGeneAnnotations = function (annotationsGroup, y) {

    var chromosome = annotationsGroup.data()[0];

    var nodes = chromosome.annotations.genes.map(function (data) {
      return new labella.Node(y(data.midpoint),  chromosome.annotationMarkerSize, data);
    });

    var force = new labella.Force({
      nodeSpacing: 3,
      algorithm: 'overlap',
      lineSpacing: 2,
      maxPos: y(chromosome.longestChromosome),
      minPos: 0,
      density: 0.85,

    }).nodes(nodes).compute();

    var renderer = new labella.Renderer({
      direction: 'right',
      layerGap:  chromosome.annotationWidth / 6.0,
      nodeHeight: chromosome.annotationWidth / 6.0,
    });

    renderer.layout(force.nodes());

    // Enter + Update elements
    var geneAnnotations = annotationsGroup.selectAll('g.gene_annotation').data(force.nodes());

    var geneAnnotationsEnterGroup = geneAnnotations.enter().append('g').classed('gene_annotation', true);

    geneAnnotationsEnterGroup.append('line').classed('midpoint-line', true);
    geneAnnotationsEnterGroup.append('path').classed('link', true);

    if (config.labelRectangles) {
      geneAnnotationsEnterGroup.append('rect').classed('labella', true);
    }

    geneAnnotationsEnterGroup.append('polygon').classed('infobox', true);
    geneAnnotationsEnterGroup.append('text');
    geneAnnotationsEnterGroup.append('use').attr({
      'xlink:href': '#pin',
      width:10,
      height: 10,
    });

    geneAnnotations.select('line.midpoint-line').attr({
      x1: -chromosome.width / 2,
      y1: function (d) { return y(d.data.midpoint); },
      y2: function (d) { return y(d.data.midpoint); },
      x2: 0,
    });


    // $(geneAnnotations[0]).hammer().off('press').on('press', function () {
    //   // $(this).children().popover('show');
    //   console.log('press' + this);
    // });
    //
    // $(geneAnnotations[0]).hammer().off('tap').on('tap', function () {
    //   var group = d3.select(this);
    //   group.classed('selected', !group.classed('selected'));
    //   console.log('click: ' + this);
    // });

    $(geneAnnotations[0]).off('mousedown').on('mousedown', function (e) {
      console.log('annotation mousedown ' + e);
      return false;
    });

    $(geneAnnotations[0]).off('click').on('click', function (e) {
      console.log('annotation click ' + e);
      var group = d3.select(this);
      group.classed('selected', !group.classed('selected'));
      config.onAnnotationSelectFunction();
      return false;
    });

    $(geneAnnotations[0]).off('contextmenu').on('contextmenu', function (e) {


      $('.infobox').not($(this).children()).popover('hide');
      $(this).children().popover('toggle');
      console.log('contextmenu ' + e);
      e.preventDefault();
      return false;
    });

    // geneAnnotations.on('click', function (evt) {
    //   var group = d3.select(this);
    //   group.classed('selected', !group.classed('selected'));
    //   console.log('click: ' + evt);
    // });
    //
    // geneAnnotations.on('mouseover', function (evt) {
    //   console.log('moseover: ' + evt);
    // });
    //
    // geneAnnotations.on('mouseout', function (evt) {
    //   console.log('mouseout: ' + evt);
    // });

    // generate a little triange based on the data
    var pointsFn = function (d) {

      var points = [];

      // var midpoint = d.data.start + (d.data.end - d.data.start) / 2;
      var a = chromosome.annotationMarkerSize;

      var h = Math.sqrt(Math.pow(a, 2) - Math.pow((a / 2), 2));
      h = h * 1.5;
      points.push([d.x, d.y]);
      /* points.push([d.x, d.y - d.dy/2]); // tip of the arrow */
      points.push([d.x + h, d.y - a / 2]);
      points.push([d.x + h, d.y + a / 2]);

      // start at the top right and move down to the bottom left
      // points.push([hozPosition, y(midpoint) - a/2]);
      // points.push([hozPosition, y(midpoint) + a/2]);
      //
      // // add the final point at 1/2 height to make an equelateral triangle
      // var h = Math.sqrt( Math.pow(a, 2) - Math.pow((a/2), 2));
      // h = h * 1.5;
      // points.push([hozPosition - h, y(midpoint)])
      return points.join(' ');
    };

    geneAnnotations.select('polygon').attr({
      points: pointsFn,
    }).style({
      fill: function (d) {
        return d.data.color;
      },
    });

    geneAnnotations.select('path.link')
      .attr('d', function (d) { return renderer.generatePath(d); });

    // draw the labella labels as rectangles, useful for debugging
    if (config.labelRectangles) {
      geneAnnotations.select('rect.labella').attr({
          fill: 'green',
          stroke: 'none',
          x: function (d) { return d.x; },
          y: function (d) {
            return d.y - d.dy / 2;
          },
          width: function (d) { return d.dx; },
          height: function (d) { return d.dy; },
        });
    }

    geneAnnotations.select('text').attr({
      x: function (d) { return d.x + chromosome.annotationMarkerSize + chromosome.annotationLabelHeight; },
      y: function (d) { return d.y + (0.4 * chromosome.annotationLabelHeight); },
    }).style({
      'font-size': chromosome.annotationLabelHeight + 'px',
      visibility: chromosome.showAnnotationLabels ? 'visible' : 'hidden',
    }).text(function (d) {
      return d.data.label;
    });

    geneAnnotations.select('use').attr({
      x: function (d) { return d.x; },
      y: function (d) { return d.y; },
    });

    geneAnnotations.exit().remove();
  };

  var setupQTLAnnotations = function (annotationsGroup, y) {

    var chromosome = annotationsGroup.data()[0];
    var hozPosition = chromosome.annotationWidth * 0.5;

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
      x1: -chromosome.width / 2,
      y1: function (d) { return y(d.start);},
      y2: function (d) { return y(d.start);},
      x2: hozPosition,
    });

    qtlAnnotations.selectAll('line.bottom-line').attr({
      x1: -chromosome.width / 2,
      y1: function (d) { return y(d.end);},
      y2: function (d) { return y(d.end);},
      x2: hozPosition,
    });

    qtlAnnotations.selectAll('rect.qtl-selector').attr({
      x: hozPosition - 10,
      y: function (d) { return y(d.start); },
      width: 10,
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

    group.select('rect.border')
      .attr({
        x:0,
        y:0,
        width: chromosome.annotationWidth,
        height: y(chromosome.length),
      });
  };

  var buildYScale = function (d) {
    return d3.scale.linear().range([0, d.height]).domain([0, d.longestChromosome]);
  };

  // An SVG representation of a chromosome with banding data. This won't create an SVG
  // element, it expects that to already have been created.
  function my(selection) {
    selection.each(function (d) {

      var groups = d3.select(this).selectAll('.annotation-group').data([d]);

      groups.enter().append('g').attr('class', 'annotation-group');

      groups.each(function (d) {
        var y = buildYScale(d);

        var group = d3.select(this).attr({
          id: function (d) { return 'annotation_' + d.number; },
          transform: function (d) {
            return 'translate(' + d.width + ',' + d.labelHeight + ')';
          },
        });

        setupQTLAnnotations(group, y);

        setupGeneAnnotations(group, y);

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
