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
    gapPercentage: 1 / 15,
    chromosomeWidth: 20,
    annotationMarkerSize: 5,
    annotationLabelSize: 5,
    showAnnotationLabels: true,
    drawing: null,
    scale:1,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var buildYScale = function () {
    return d3.scale.linear().range([0, config.layout.height]).domain([0, config.longestChromosome]);
  };

  var setupQTLAnnotations = function (annotationsGroup, chromosome) {

    var y = buildYScale();
    var xEnd = config.layout.width + config.chromosomeWidth / 2;
    var bandWidth =  config.layout.width * config.bandWidthPercentage / Math.pow(config.scale, 0.6);
    var gap = config.layout.width * config.gapPercentage * Math.max(1, (2 - 0.5 * Math.pow( 5 - config.scale,2) ));

    var xStart = function (d) {
      return config.layout.width - d.position * (gap + bandWidth);
    };

    //--BOXES-----------------------------
    //Here we handle the actual rectangles but not the labels

    // Enter + Update elements
    var qtlAnnotations = annotationsGroup.selectAll('g.qtl-annotation').data(chromosome.layout.qtlNodes, function(d){
      return d.id});

    // setup the new annotations
    var qtlAnnotationsEnterGroup = qtlAnnotations.enter()
      .append('g').classed('qtl-annotation infobox', true);

    qtlAnnotationsEnterGroup.append('line').classed('top-line', true);
    qtlAnnotationsEnterGroup.append('line').classed('bottom-line', true);
    qtlAnnotationsEnterGroup.append('rect').classed('qtl-selector infobox', true);
    qtlAnnotationsEnterGroup.append('text').classed('test', true);

    //Apply attributes to all elements

    qtlAnnotations.attr('id', function (d) {
      return 'feature_' + d.id;
    });

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
      width: bandWidth,
      height: function (d) { return y(d.end) - y(d.start); },
    }).style({
      fill: function (d) { return d.color; },
    });

    qtlAnnotations.exit().remove();


    //--COUNTS--------------------
    //The little circles with the number of QTLs in a cluster

    var textYPos = function (d) {
      return y(d.midpoint);
    };

    var labelVisibility = function (d) {
      if (d.displayLabel === 'show') {
        return 'visible';
      } else if (d.displayLabel === 'hide') {
        return 'hidden';
      }
      return config.showAnnotationLabels ? 'visible' : 'hidden';
    };


    var qtlCountParentGroup = qtlAnnotationsEnterGroup
      .append('g').classed('qtl-count-group', true);

    var qtlCountAnnotations = qtlAnnotations.select('g.qtl-count-group')
      .selectAll('g.qtllist').data( function(d){
        //Only need to display count if we have a qtllist
        //If it's just a single qtl then don't connect any data
        var data =   (d.type == 'qtllist' ? [d] : []);
        return data;
      }, function (d){ return 'label_' + d.id });

    var qtlCountParentEnterGroup = qtlCountAnnotations.enter();
    var qtlCountGroup = qtlCountParentEnterGroup
      .append('g').classed( 'qtllist', true);
    qtlCountGroup.append('circle').classed('qtl-count', true);
    qtlCountGroup.append('text').classed('qtl-count', true);

    //Apply transform to group containing text and circular background
    //Then we can easily center text and circle
    qtlAnnotations.select( 'g.qtl-count-group').attr({
      transform: function(d){
        if (d){
          return "translate(" + (xStart(d) + 0.5*bandWidth) + "," + textYPos(d) + ")"
        } else {
          return "translate(0,0)"
        }
      }});

    qtlAnnotations.select( 'circle.qtl-count')
      .attr({
        cx: 0,
        cy: 0,
        r: 0.6*config.annotationLabelSize + 'px' ,
      }).style({
        visibility: labelVisibility,
        fill: function (d) { return d.color; },
      })
      .attr( {'id' : function(d){ return d.id} })
    ;

    qtlAnnotations.select('text.qtl-count').attr({
      x: 0,
      y: 0,
      dy: "0.3em",
      "text-anchor": "middle"
    }).style({
        'fill': "white",
        'font-size': config.annotationLabelSize + 'px',
        visibility: labelVisibility,
      })
      .text(function (d) {
        return d.count;
      });


    qtlCountAnnotations.exit().remove();

    //--LABELS--------------------
    //The labels shown vertically along the qtl

    var xLabel = function (d) {
      return config.layout.width - (d.labelPosition ) * (gap + bandWidth);
    };

     qtlAnnotationsEnterGroup.append('g').classed('qtl-label-group', true);

    var qtlLabelAnnotations = qtlAnnotations
      .select('g.qtl-label-group').selectAll('g.qtl').data( function(d){
      //Only join the data if displayLabel is true
      var data =   (d.displayLabel ? [d] : []);
      return data;
    }, function (d){ return 'label_' + d.id });

    var qtlLabelAnnotationsEnterGroup = qtlLabelAnnotations.enter();
    var qtlLabelGroup = qtlLabelAnnotationsEnterGroup
      .append('g').classed( 'qtl', true);

    qtlLabelGroup
      .append('text')
      .classed('qtl-label', true);

    qtlLabelAnnotations
      .exit().remove();

    qtlAnnotations.select( 'g.qtl-label-group').attr({
      transform: function(d){
        if (d.displayLabel){
          return "translate(" + (xLabel(d) + 0.5*bandWidth) + "," + textYPos(d) + ")"
        } else {
          return "translate(0,0)"
        }
      }});

    qtlAnnotations.select('text.qtl-label')
      .attr({
        x: 0,
        y: 0,
        dy: "0.3em",
        "text-anchor": "middle"
      })
      .style({
        'font-size': config.annotationLabelSize + 'px',
      })
      .attr( {
        'transform' : 'rotate(270)',
        visibility: labelVisibility,
      })
      .text(function (d) {
        return d.label;
      });

    //POPOVER HANDLING

    qtlAnnotations
      .on('contextmenu', function(d){
        log.trace('Gene Annotation Context Menu');


        var popover = d3.select( '#clusterPopover');
        popover.attr( 'class', 'popover');

        //POPOVER TITLE
        var popoverTitle = popover.select('.popover-title');

        //Clear existing content
        popoverTitle.selectAll('*')
          .remove();

        popoverTitle
          .text("");

        popoverTitle
          .text( 'Chromosome ' + d.chromosome + ': '
            + d.start + '-' + d.end);

        //Repaint the div so that the popover
        // code gets the correct dimensions
        $.fn.redraw = function(){
          return $(this).each(function(){
            var redraw = this.offsetHeight;
          });
        };

        //POPOVER CONTENT
        popoverContent = popover.select('.popover-content');

        //Clear existing content
        popoverContent .selectAll('*')
          .remove();

        popoverContent.text("");

        var popoverContent = d3.select('.popover-content')
          .selectAll('p').data(
            //Either bind a single qtl or a list of qtls
            (d.type == 'qtllist' ? d.qtlList :[d] )
          );

        var popoverContentEnter = popoverContent.enter();

        popoverContentEnter
          .append('p')
          .classed( 'popover-annotation', true)

        var label = popoverContent
          .append('div')
          .attr( {'class' : 'checkbox'})
          .append('label');

        //Labels in the popover can be clicked to toggle selection
        label
          .append('input')
          .attr({
            'type' : 'checkbox',
            'value' : '',
          })
          .property(
            'checked', function(d){
              return d.selected })
          .on(
            'click', function(d){
            d.selected = !d.selected;
            popoverContent.classed(
              'selected', function(d){return d.selected});
          })
        ;

        label
          .append('a')
          .attr(
            {"href": function(d){
              return d.link;},"target": "_blank"
            })
          .text(function(d){return d.label;} );

        popoverContent
          .classed( 'selected', function(d){
            return d.selected});


        //Apply the boostrap popover function

        $clusterPopover = $('#clusterPopover');

        $clusterPopover
          .modalPopover( {
          target: $(this),
          $parent: $(this).find('rect'),
          'modal-position': 'body',
          placement: "left",
          boundingSize: config.drawing,
        });

        $clusterPopover
          .modalPopover('show');

        $clusterPopover
          .on('mousedown mousewheel', function(event){
          log.info('popover click');
          event.stopPropagation();
        });
      });

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

      qtlAnnotationGroup.enter()
        .append('g').attr('class', 'qtl-annotations');

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

  my.scale = function (value) {
    if (!arguments.length) {
      return config.scale;
    }

    config.scale = value;
    return my;
  };

  return my;
};
