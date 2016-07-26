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
    bandWidthPercentage: 1 / 8,
    gapPercentage: 1 / 10,
    chromosomeWidth: 20,
    annotationMarkerSize: 5,
    annotationLabelSize: 5,
    showAnnotationLabels: true,
    drawing: null,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var buildYScale = function () {
    return d3.scale.linear().range([0, config.layout.height]).domain([0, config.longestChromosome]);
  };

  var setupQTLAnnotations = function (annotationsGroup, chromosome) {

    var y = buildYScale();
    var xEnd = config.layout.width + config.chromosomeWidth / 2;
    var badnWidth = config.layout.width * config.bandWidthPercentage;
    var gap = config.layout.width * config.gapPercentage;

    var xStart = function (d) {
      return config.layout.width - d.position * (gap + badnWidth);
    };

    var positioner = GENEMAP.QtlPositioner();

    var qtlData = positioner.sortQTLAnnotations(chromosome.annotations.qtls);

    // Enter + Update elements
    var qtlAnnotations = annotationsGroup.selectAll('g.qtl-annotation').data(qtlData);

    // setup the new annotations
    var qtlAnnotationsEnterGroup = qtlAnnotations.enter().append('g').classed('qtl-annotation infobox', true);
    qtlAnnotationsEnterGroup.append('line').classed('top-line', true);
    qtlAnnotationsEnterGroup.append('line').classed('bottom-line', true);
    qtlAnnotationsEnterGroup.append('rect').classed('qtl-selector infobox', true);
    qtlAnnotationsEnterGroup.append('text').classed('qtl-label', true);
    qtlAnnotationsEnterGroup.append('text').classed('test', true);

    qtlAnnotations.attr('id', function (d) {
      return 'feature_' + d.id;
    });

    // update
    qtlAnnotations.select('line.top-line').attr({
      x1: xStart,
      y1: function (d) { return y(d.start);},
      y2: function (d) { return y(d.start);},
      x2: xEnd,
    });

    qtlAnnotations.select('line.bottom-line').attr({
      x1: xStart,
      y1: function (d) { return y(d.end);},
      y2: function (d) { return y(d.end);},
      x2: xEnd,
    });

    qtlAnnotations.select('rect.qtl-selector').attr({
      x: xStart,
      y: function (d) { return y(d.start); },
      width: badnWidth,
      height: function (d) { return y(d.end) - y(d.start); },
    }).style({
      fill: function (d) {
        return d.colors[0];
      },
    });

    var textYPos = function (d) {
      return y(d.midpoint);
    };

    qtlAnnotations.select('text.qtl-label').attr({
      x: xStart,
      y: textYPos,//config.annotationLabelSize,
      // transform: function (d) {
      //   return 'translate(' + xStart(d) + ',' + textYPos(d) + ')rotate(270)';
      // },
    })
    .style({
      'font-size': config.annotationLabelSize + 'px',
      visibility: function (d) {
        if (d.showLabel === 'show') {
          return 'visible';
        } else if (d.showLabel === 'hide') {
          return 'hidden';
        }

        return config.showAnnotationLabels ? 'visible' : 'hidden';
      },
    })
    .text(function (d) {
      return '(' + d.labels.length + ')';
    });

    qtlAnnotations
      .on('contextmenu', function(d){
        log.trace('Gene Annotation Context Menu');
        log.trace(d);

        d3.select('#clusterPopover').attr( 'class' , 'popover');

        popoverTitle = d3.select('#clusterPopover').select('.popover-title');
        popoverTitle.selectAll('*').remove();
        popoverTitle.text("");

        popoverTitle
          .text( 'Chromosome ' + d.chromosome + ': '
          + d.start + '-' + d.end);


        $('#clusterPopover').modalPopover( {
          target: $(this),
          parent: $(this),
          'modal-position': 'relative',
          placement: "left",
          boundingSize: config.drawing,
        });
        $('#clusterPopover').modalPopover('show');

        popoverContent = d3.select('#clusterPopover').select('.popover-content');
        popoverContent.selectAll('*').remove();
        popoverContent.text("");

        d3.select('.popover-content')
          .selectAll('p').data(_.zip(d.links, d.labels) )
          .enter()
          .append('p')
          .append('a')
          .attr( {"href": function(d){return d[0];},"target": "_blank"})
          .text(function(d){return d[1];} );


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

  my.drawing = function (value) {
    if (!arguments.length) {
      return config.drawing;
    }

    config.drawing = value;
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

  my.annotationLabelSize = function (value) {
    if (!arguments.length) {
      return config.annotationLabelSize;
    }

    config.annotationLabelSize = value;
    return my;
  };

  my.annotationMarkerSize = function (value) {
    if (!arguments.length) {
      return config.annotationMarkerSize;
    }

    config.annotationMarkerSize = value;
    return my;
  };

  my.showAnnotationLabels = function (value) {
    if (!arguments.length) {
      return config.showAnnotationLabels;
    }

    config.showAnnotationLabels = value;
    return my;
  };

  my.infoBoxManager = function (value) {
    if (!arguments.length) {
      return config.infoBoxManager;
    }

    config.infoBoxManager = value;
    return my;
  };

  return my;
};
