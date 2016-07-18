var GENEMAP = GENEMAP || {};


GENEMAP.GeneAnnotations = function (userConfig) {
  var defaultConfig = {
    border: false,
    labelRectangles: false,
    onAnnotationSelectFunction: $.noop(),
    onExpandClusterFunction: $.noop(),
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
    infoBoxManager: GENEMAP.InfoBox(),
    nClusters: 6,
    doClustering: true,
    maxAnnotationLayers: 3,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var buildYScale = function () {
    return d3.scale.linear().range([0, config.layout.height]).domain([0, config.longestChromosome]);
  };

  // adds the gene annotations to the annotations group within it, uses the data
  // bound to the annotationsGroup to generate the annotation elements
  var setupGeneAnnotations = function (annotationGroup, chromosome) {
    log.trace('setupGeneAnnotations');

   var y = buildYScale();

    //Data join
    // Use a key function so that the correct mapping between graphical objects
    // and data points is maintained even when clustering changes
    var geneAnnotations = annotationGroup.selectAll('g.gene-annotation').data(
      chromosome.layout.nodes, function(d){return d.data.id});

    //Update only
    geneAnnotations.select('path.link').transition().delay(1000)
      .attr({ d: function (d) { return d.data.path ;} })
    ;

    geneAnnotations.select('text').transition().delay(1000)
      .attr({
        x: function (d) { return d.x + 0.1 * config.annotationLabelSize; },
        y: function (d) { return d.y + 0.4 * config.annotationLabelSize; }
      });

    // Enter only
    var geneAnnotationsEnterGroup = geneAnnotations.enter()
      .append('g').classed('gene-annotation', true);

    geneAnnotationsEnterGroup.append('line').classed('midpoint-line', true);
    geneAnnotationsEnterGroup.append('path').classed('link', true);

    if (config.labelRectangles) {
      geneAnnotationsEnterGroup.append('rect').classed('labella', true);
    }

    geneAnnotationsEnterGroup.append('text')
    .attr({ d: function (d) { return d.data.path ;} })

    //Enter and update
    geneAnnotations.attr('id', function (d) {
      return 'feature_' + d.data.id;
    });

    geneAnnotations.classed('selected', function(d){ return d.data.selected; });

    geneAnnotations.select('line.midpoint-line').attr({
      x1: -(config.chromosomeWidth * 0.5),
      y1: function (d) { return y(d.data.midpoint); },
      y2: function (d) { return y(d.data.midpoint); },
      x2: 0,
    });

    geneAnnotations.on('click', function (d) {
      //If user clicks on a gene, toggle gene selection
      if (d.data.type == "gene") {
        log.info('gene annotation click');
        d.data.selected = !d.data.selected;
        config.onAnnotationSelectFunction();
      }

      //If user clicks on a cluster of genes, expand that cluster
      if (d.data.type == "geneslist") {
        log.info('geneslist annotation click');
        config.onExpandClusterFunction(chromosome, d.data);
      }
    });

    geneAnnotations.select('path.link')
      .style( "stroke" , function (d){
        if (d.data.visible || d.data.selected )
        {return d.data.color;}
        else {return "gray"; } })
      .attr({
        d: function (d) { return d.data.path ;},
      })
    ;

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

    geneAnnotations.select('text')
      .attr({
      x: function (d) { return d.x + 0.1 * config.annotationLabelSize; },
      y: function (d) { return d.y + 0.4 * config.annotationLabelSize; },
    }).style({
      'stroke': function(d){ return (d.data.selected ? d.color : 'none' ) },
      'font-size': function(d){ return (d.data.selected ? 0.2 : 0 ) + d.data.fontSize + 'px'},
      'font-weight' : function(d){ return d.data.selected ? 'bold' : 'normal'},
      'background-color' : function(d){ return d.data.selected ? 'white' : 'none'},
    })
      .attr( { fill: function (d) { return (d.data.visible || d.data.selected) ? d.data.color : "gray"; } })
      .text(function (d) {
      if (d.data.type == "gene") {
        return d.data.label;
      }
      else if (d.data.type == "geneslist"){
        return "(" + d.data.genesList.length + ")";
      }
    });

    geneAnnotations.select('text')
      .on('contextmenu', function(d){
        log.info(d);
        popoverTitle = d3.select('#clusterPopover').select('.popover-title');
        popoverTitle.selectAll('*').remove();
        popoverTitle.text("");

        popoverTitle
          .append('a')
          .attr( {'href' : d.data.link } )
          .text(d.data.label);


        $('#clusterPopover').modalPopover( {
          target: $(this),
          parent: $(this),
          'modal-position': 'relative',
          placement: "right",
        });
        $('#clusterPopover').modalPopover('show');

        popoverContent = d3.select('#clusterPopover').select('.popover-content');
        popoverContent.selectAll('*').remove();
        popoverContent.text("");
        popoverContent.append('p').text( 'Chromosome ' + d.data.chromosome +  ': ' + d.data.start + '-' + d.data.end);
      });

    var exitGroup = geneAnnotations.exit()
    //avoid any orphaned popovers
    exitGroup.each( function(d){
      $('.infobox', this).popover('hide') ;
    } );
    exitGroup.remove();
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

      var annotationGroup = d3.select(this).selectAll('.gene-annotations').data([d]);

      annotationGroup.enter().append('g').attr('class', 'gene-annotations');

      annotationGroup.attr({
        transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
        id: function (d) { return 'annotation_' + d.number; },
      });

      setupGeneAnnotations(annotationGroup, d);

      if (config.border) {
        drawBorder(annotationGroup);
      }

      annotationGroup.exit().remove();
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

  my.annotationLabelSize = function (value) {
    if (!arguments.length) {
      return config.annotationLabelSize;
    }

    config.annotationLabelSize = value;
    return my;  };

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

  my.nClusters = function(value) {
    if (!arguments.length) {
      return config.nClusters;
    }

    config.nClusters = value;
    return my;
  }

  my.doClustering = function(value) {
    if (!arguments.length) {
      return config.doClustering;
    }

    config.doClustering = value;
    return my;
  }

  my.maxAnnotationLayers= function(value) {
    if (!arguments.length) {
      return config.maxAnnotationLayers;
    }

    config.maxAnnotationLayers= value;
    return my;
  }

  return my;
};
