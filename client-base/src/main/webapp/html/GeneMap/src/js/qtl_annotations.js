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
    maxSnpPValue: 1.0,
    drawing: null,
    scale:1,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var buildYScale = function () {
    return d3.scale.linear().range([0, config.layout.height]).domain([0, config.longestChromosome]);
  };

  var leftRoundedRect = function (start, end, x, width, radius ){
    if ( (end - start) < width){
      return "M" + x  + "," + start
        + "h" + -width
        + "v" + (end - start)
        + "h" + width
        +  "z";
    }
    else {
      return "M" + x + "," + start
        + "h" + (radius - width)
        + "a" + radius + " " + radius + " 0 0 0" + -radius + " " + radius
        + "v" + (end - start - 2 * radius)
        + "a" + radius + "," + radius + " 0 0 0" + radius + "," + radius
        + "h" + (width - radius)
        + "z";
    }
  };

  var setupSNPAnnotations = function (annotationsGroup, chromosome, snps, traits) {
    //--SNPS------------------------------

   //Generate an index for each trait
    var traitPos = {};
    traits.map( function(trait, index){
      traitPos[trait] = index;
    });

    var y = buildYScale();

    var snpsAnnotations = annotationsGroup.selectAll('rect.snp-annotation').data(snps, function(d){
      return d.id});

    var snpThickness =  4;
    var snpX = function(d) { return config.layout.width - 0.2 * config.layout.chromosomeWidth * (1 + traitPos[d.trait])};
    var snpY = function(d){ return y(d.midpoint) - 0.5 *  Math.max(snpThickness / config.scale, y(10));}
    var snpHeight = Math.max( snpThickness / config.scale, y(10));
    var snpWidth = 0.2 * config.layout.chromosomeWidth;

    snpsAnnotations
      .attr({
        x: snpX,
        y: snpY,
        width: snpWidth,
        height: snpHeight,
      });

    function rgb( r, g, b){
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    snpsAnnotations.enter()
      .append( 'rect')
      .attr( {
        fill: function(d){ return d.color; },
        opacity: function(d){return  d.importance},
        class: 'snp-annotation',
        x: snpX,
        y: snpY,
        width: snpWidth,
        height: snpHeight,
      });

    snpsAnnotations.exit().remove();

    //POPOVER HANDLING

    snpsAnnotations
      .on('contextmenu', function(d){
        log.trace('SNP Context Menu');

        var popover = d3.select( '#clusterPopover');
        popover.attr( 'class', 'popover');

        //CLEAR ALL
        var popoverTitle = popover.select('.popover-title');
        popoverTitle.selectAll('*').remove();
        popoverTitle.text("");

        var popoverContentElement = popover.select('.popover-content');
        popoverContentElement.selectAll('*').remove();
        popoverContentElement.text("");

        //POPOVER TITLE
        popoverTitle
          .append('span')
          .text( 'SNP: ')

        popoverTitle
          .append('a')
          .attr('href', d.link)
          .text(d.label)
        ;

        //POPOVER CONTENT

        var popoverContent = popoverContentElement
          .selectAll('p').data([
            ['Chromsome ' + chromosome.number , d.midpoint],
            ['p-value', Number(d.pvalue).toExponential()],
            ['Trait', d.trait],
          ]);

        var popoverContentEnter = popoverContent.enter();

        popoverContentEnter
          .append('p')
          .classed( 'popover-annotation', true)
          .text(function(d){
            return d[0]  + ': ' + d[1]
          });

        //Apply the boostrap popover function
        $clusterPopover = $('#clusterPopover');

        $clusterPopover
          .modalPopover( {
            target: $(this),
            $parent: $(this),
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
  }

  var setupQTLAnnotations = function (annotationsGroup, chromosome, nSnpsTraits) {

    var tranSpeed = 500;
    var y = buildYScale();
    var xEnd = config.layout.width;

    var bandWidth = 0.3 * config.layout.chromosomeWidth ;
    var gap = 0.4 * config.layout.chromosomeWidth ;

    var labelsToDisplay = chromosome.layout.qtlNodes.some( function(node){
        return node.displayLabel;
    });

    if (labelsToDisplay) {
      gap = gap * 1.5 ;
    }

    var snpsOffset = nSnpsTraits * 0.2 * config.layout.chromosomeWidth;

    var xLabel = function (d) {
      return config.layout.width - (d.labelPosition ) * (gap + bandWidth) - snpsOffset;
    };

    var xStart = function (d) {
      return config.layout.width - d.position * (gap + bandWidth) - snpsOffset;
    };



    //--BOXES-----------------------------
    //Here we handle the actual rectangles but not the labels

    // Enter + Update elements
    var qtlAnnotations = annotationsGroup.selectAll('g.qtl-annotation').data(chromosome.layout.qtlNodes, function(d){
      return d.id});

    // setup the new annotations
    var qtlAnnotationsEnterGroup = qtlAnnotations.enter()
      .append('g').classed('qtl-annotation infobox', true);

    qtlAnnotationsEnterGroup.append('rect').classed('qtl-hoverbox', true);
    var qtlSelector = qtlAnnotationsEnterGroup.append('rect').classed('qtl-selector infobox', true);

    var oldNodes = {};
    var newNodes = {};

    qtlAnnotations.exit().select('rect').each(function (d) {
      oldNodes[d.index] = _.pick(this, ['x', 'y', 'width', 'height']);
      oldNodes[d.index].midpoint = d.midpoint;
      oldNodes[d.index].position = d.position;
    });

    qtlSelector.each(function (d) {
      newNodes[d.index] = _.pick(this, ['x', 'y', 'width', 'height']);
      newNodes[d.index].midpoint = d.midpoint;
      newNodes[d.index].position = d.position;
    });

    var chooser = function(dict, index, key, fallThrough){
      if (_.has(dict, index)){
        return dict[index][key].animVal.value;
      }
      else{
        return fallThrough;
      }
    }

    qtlSelector.attr({
      x: function (d) {
        return chooser( oldNodes, d.parentIndex, 'x', xStart(d))
      },
      y: function (d) {
        return chooser( oldNodes, d.parentIndex, 'y', y(d.start))
      },
      width: bandWidth,

      height: function (d) {
        return chooser( oldNodes, d.parentIndex, 'height', y(d.end) - y(d.start))
        }
    });

    //Apply attributes to all elements

    qtlAnnotations.attr('id', function (d) {
      return 'feature_' + d.id;
    });

    qtlAnnotations.select('rect.qtl-hoverbox').attr({
      x: function(d) { return xStart(d)},
      y: function (d) { return y(d.start);},
      width: function(d) { return  d.position * (gap + bandWidth) + config.chromosomeWidth + snpsOffset; },
      height: function(d){ return y(d.end) -y (d.start)} ,
      fill: function(d){ return d.color; },
      visibility: function(d){return d.hover ? 'visible' : 'hidden' },
    })

    //qtlAnnotations.select('path.qtl-selector')
    //  .attr({
    //    d: function(d){ return leftRoundedRect(
    //      y(d.start),
    //      y(d.end),
    //      xStart(d)+bandWidth,
    //      bandWidth,
    //      0 //for rounded edges, use: 0.4 * bandWidth,
    //    ) },
    //    fill: function (d) { return d.color; },
    //  } )

    qtlAnnotations.select('rect.qtl-selector').transition().duration(tranSpeed)
      .attr({
        x: xStart,
        y: function (d) { return y(d.start); },
        width: bandWidth,
        height: function (d) { return y(d.end) - y(d.start); }
      });


    qtlAnnotations.select('rect.qtl-selector')
      .style({
        fill: function (d) { return d.color; },
      }) ;


    debugQtlLableBoxes = false;

    if( debugQtlLableBoxes) { //Rectanges to check size of labels
      qtlAnnotations.select('rect.test')
        .attr({
            x: function (d) {
              return d.displayLabel ? xLabel(d) : 0
            },
            y: function (d) {
              return d.displayLabel
                ? y(d.midpoint) - 0.6 * d.screenLabel.length * config.annotationLabelSize / 2
                : 0
            },
            width: function (d) {
              return bandWidth
            },
            height: function (d) {
              return d.displayLabel
                ? 0.6 * d.screenLabel.length * config.annotationLabelSize
                : 0
            },
            fill: function (d) {
              return 'pink'
            }
          }
        );
    }

    qtlAnnotations.exit().select('rect')
      .transition().duration(tranSpeed)
      .attr({
      x: function (d) {
        return chooser( newNodes, d.parentIndex, 'x', xStart(d))
      },
      y: function (d) {
        return chooser( newNodes, d.parentIndex, 'y', y(d.start))
      },

      width: bandWidth,

      height: function (d) {
        return chooser( newNodes, d.parentIndex, 'height', y(d.end) - y(d.start))
      }
    })
      .remove()
    ;

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
      //return config.showAnnotationLabels ? 'visible' : 'hidden';
      return true;
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

    qtlCountParentGroup
      .each( function(d){
        if (_.has(newNodes, d.index)){

          if (_.has(oldNodes, d.parentIndex)){

            oldNode = oldNodes[d.parentIndex];

            var oldXStart = config.layout.width - oldNode.position * (gap+bandWidth);
            var oldTextYPos = y(oldNode.midpoint);

            d3.select(this).attr({
              transform:
                "translate(" + (oldXStart + 0.5*bandWidth) + "," + oldTextYPos + ")"
            });
          }
          else {
            d3.select(this).attr({
              transform: function(d) {
                if (d) {
                  return "translate(" + (xStart(d) + 0.5 * bandWidth) + "," + textYPos(d) + ")"
                } else {
                  return "translate(0,0)"
                }
              }
            });
          }
        }
      });

    //Apply transform to group containing text and circular background
    //Then we can easily center text and circle
    qtlAnnotations.select( 'g.qtl-count-group')
      .transition().duration(tranSpeed)
      .attr({
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
        r: bandWidth + 'px' ,
      }).style({
        visibility: 'visible',
        fill: function (d) { return d.color; },
      })
      .attr( {'id' : function(d){ return d.id} })
    ;

    var circleFontSize = Math.min( Math.max( 10 / config.scale,bandWidth ), 14 / config.scale )

    qtlAnnotations.select('text.qtl-count').attr({
      x: 0,
      y: 0,
      dy: "0.3em",
      "text-anchor": "middle"
    }).style({
        'fill': "white",
        'font-size': circleFontSize + 'px',
        'visibility': (circleFontSize < 2 * bandWidth) ? 'visible' : 'hidden',
      })
      .text(function (d) {
        return d.count;
      });


    qtlCountAnnotations.exit().remove();

    //--LABELS--------------------
    //The labels shown vertically along the qtl

     qtlAnnotationsEnterGroup.append('g').classed('qtl-label-group', true);

    var qtlLabelAnnotations = qtlAnnotations
      .select('g.qtl-label-group').selectAll('g.qtl').data( function(d){
      //Only join the data if displayLabel is true
      var data =   (d.displayLabel ? [d] : []);
      return data
    }, function (d){ return 'label_' + d.id });

    qtlLabelAnnotations
      .exit().remove();

    qtlLabelAnnotations
      .transition().duration(tranSpeed)
      .attr({
        transform: function(d){
          return "translate(" + (xLabel(d) + 0.5*bandWidth) + "," + textYPos(d) + ")";
        }});

    var qtlLabelAnnotationsEnterGroup = qtlLabelAnnotations.enter();

    var qtlLabelGroup = qtlLabelAnnotationsEnterGroup
      .append('g').classed( 'qtl', true)
      .attr({
        transform: function(d){
          return "translate(" + (xLabel(d) + 0.5*bandWidth) + "," + textYPos(d) + ")";
        }});

    qtlLabelGroup
      .append('text')
      .classed('qtl-label', true);

    qtlAnnotations.select('text.qtl-label')
      .attr({
        x: 0,
        y: 0,
        dy: "0.3em",
        "text-anchor": "middle"
      })
      .style({
        'font-size':  function(d){ return d.fontSize + 'px';}
      })
      .attr( {
        'transform' : 'rotate(270)',
        visibility: labelVisibility,
      })
      .text(function (d) {
        return d.screenLabel;
      });


    //MOUSEOVER HANDLING

    var attachMouseOver = function(selection){
      selection
        .on('mouseenter', function(d) {
          d.hover = true;
          setupQTLAnnotations(annotationsGroup, chromosome, nSnpsTraits);
        })
        .on('mouseout', function(d) {
          d.hover = false;
          setupQTLAnnotations(annotationsGroup, chromosome, nSnpsTraits);
        })
        .on('click', function(d){
          d.hover = !d.hover;
          setupQTLAnnotations(annotationsGroup, chromosome, nSnpsTraits);
        });
    };

    attachMouseOver( qtlAnnotations.select('rect.qtl-selector'));
    attachMouseOver( qtlAnnotations.select('circle.qtl-count'));
    attachMouseOver( qtlAnnotations.select('text.qtl-count'));

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

        var popoverContent = popover.select('.popover-content')
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
              config.onAnnotationSelectFunction();
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

  var getSnpsTraits = function (snps){
    // Get list of unique traits
    var traitSet  = new Set();
    snps.map( function(snp){
      traitSet.add(snp.trait);
    });

    var traits = Array.from(traitSet).sort();
    return traits;
  }


  // An SVG representation of a chromosome with banding data. This won't create an SVG
  // element, it expects that to already have been created.
  function my(selection) {
    selection.each(function (d) {

      //Do some processing of the SNPs to work out how much space we need
      var snps = d.annotations.snps.filter( function(d){
        return !( d.pvalue > config.maxSnpPValue);
      });

      var snpsTraits = getSnpsTraits(snps);

      //QTLs
      var qtlAnnotationGroup = d3.select(this).selectAll('.qtl-annotations').data([d]);

      qtlAnnotationGroup.enter()
        .append('g').attr('class', 'qtl-annotations');

      qtlAnnotationGroup.attr({
        transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
      });

      setupQTLAnnotations(qtlAnnotationGroup, d, snpsTraits.length);

      if (config.border) {
        drawBorder(qtlAnnotationGroup);
      }

      //SNPs
      qtlAnnotationGroup.exit().remove();

      var snpAnnotationGroup = d3.select(this).selectAll('.snp-annotations').data([d]);

      snpAnnotationGroup.enter()
        .append('g').attr('class', 'snp-annotations');

      snpAnnotationGroup.attr({
        transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
      });

      setupSNPAnnotations(snpAnnotationGroup, d, snps, snpsTraits);

      snpAnnotationGroup.exit().remove();
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

  my.maxSnpPValue = function (value) {
    if (!arguments.length) {
      return config.maxSnpPValue;
    }

    config.maxSnpPValue = value;
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
