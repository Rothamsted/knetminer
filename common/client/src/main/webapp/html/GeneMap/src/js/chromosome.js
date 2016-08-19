var GENEMAP = GENEMAP || {};

GENEMAP.Chromosome = function (userConfig) {
  var defaultConfig = {
    border: false,
    longestChromosome: 100,
    bands: "basemap",
    layout: {
      width: 10,
      height: 100,
      x: 0,
      y: 0,
    },
    scale : 1,
    onAnnotationSelectFunction: $.noop(),
    drawing: null,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var buildYScale = function () {
    return d3.scale.linear().range([0, config.layout.height]).domain([0, config.longestChromosome]);
  };

  // function to update a single chromosome element given the enter + update selection
  // and data. This assumes the basic element structure is in place.
  var updateChromosome = function (chromosome) {
    var y = buildYScale();
    var height = y(chromosome.length);
    var chromosomeGroup = d3.select(this);

    chromosomeGroup.attr({
      id: 'chromosome_' + chromosome.number,
      transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
    });

    chromosomeGroup.select('defs').html('')
      .append('mask').attr({
        id: 'chromosome_mask_' + chromosome.number,
      })
      .append('rect').attr({
        class: 'mask_rect',
      });

    chromosomeGroup.select('#chromosome_mask_' + chromosome.number).attr({
      width: config.layout.width,
      height: height,
    });

    var chromosomeShape = {
      width: config.layout.width,
      height: height,
      rx: Math.min(config.layout.width * 0.25, config.layout.height* 0.01),
      ry: Math.min(config.layout.width * 0.25, config.layout.height* 0.01),
    };

    chromosomeGroup.select('.mask_rect').attr(chromosomeShape);
    chromosomeGroup.select('rect.background').attr(chromosomeShape);
    chromosomeGroup.select('rect.outline').attr(chromosomeShape);

    var selection = [];

    var updateSelection = function(){

      var gSelect = chromosomeGroup.selectAll('rect.selection').data(selection);

      gSelect.enter()
        .append('rect')
        .attr( 'class', 'selection')
        .style( {
          'fill' : 'gray',
          'opacity' : 0.2,
        });

      gSelect
        .attr( {
          'x': 0,
          'y': function(d){ return Math.min(d.start, d.end)},
          'width': config.layout.width,
          'height': function(d){ return Math.abs(d.end - d.start)},
        });

      gSelect.exit()
        .remove();
    }


    var drag = d3.behavior.drag()
      .on( 'dragstart', function(event){
        //log.info(y.invert( d3.event.y))
        var pos = d3.mouse(this);
        selection.push({
          'start' : pos[1],
          'end' : pos[1]
        });
        updateSelection();
        d3.event.sourceEvent.stopPropagation();
      })
      .on( 'drag', function(event){
        selection[0].end = d3.event.y;
        updateSelection();
        d3.event.sourceEvent.stopPropagation();
        d3.event.sourceEvent.preventDefault();
      })
      .on( 'dragend', function(event){
        d3.event.sourceEvent.stopPropagation();
        var geneStart = y.invert(selection[0].start);
        var geneEnd = y.invert(selection[0].end);
        if( geneStart > geneEnd){
          var temp = geneStart;
          geneStart = geneEnd;
          geneEnd = temp;
        }

        var nodesToUpdate = chromosome.layout.geneBandNodes.filter( function(node){
          return (node.data.midpoint > geneStart && node.data.midpoint < geneEnd )
        }
        );

        nodesToUpdate.forEach( function(node){
          if (node.data.type == "gene") {
            node.data.visible  = true;
          }
          else if ( node.data.type == "geneslist"){
            node.data.genesList.forEach( function(gene) {
              gene.visible = true;
            });
            }
        } );

        config.onAnnotationSelectFunction();

        selection = [];
        updateSelection();

      });

    chromosomeGroup.select('rect.background')
      .call(drag);

    if (config.border) {
      chromosomeGroup.select('rect.border')
        .attr({
          width: config.layout.width,
          height: config.layout.height,
        });
    }

    // setup the chromosome bands
    var bandsContainer = chromosomeGroup.select('.bands_container');

    var drawBands;
    if (config.bands == "basemap"){
      drawBands = drawBasemapBands;
    }
    else if (config.bands == "genes"){
      drawBands = drawGeneLines;
    }

    drawBands( bandsContainer, chromosome);

    chromosomeGroup.select('.bands_container').style({
      mask: 'url(#chromosome_mask_' + chromosome.number + ')',
    });
  };

  var drawBasemapBands = function( bandsContainer, chromosome){

    var y = buildYScale();
    var bands = bandsContainer.selectAll('rect.band').data(chromosome.bands);
    bands.enter().append('rect').attr('class', 'band');

    bands.attr({
      width: config.layout.width,
      y: function (d) { return y(d.start); },
      height: function (d) { return y(d.end - d.start); },
      fill: function (d) { return d.color; },
    });

    bands.exit().remove();
  }

  var generateGeneLineAttr = function (y, gene){
    var rawHeight = gene.end - gene.start;
    var rawDY = y(rawHeight);

    var result;

    if (rawDY * config.scale > 2 )  {
      result =  {y: y(gene.start), height: rawDY};
    }
    else {
      height = Math.min( 2 / config.scale, 2)
      result =  { y: y(gene.midpoint) - height / 2,  height: height};
    }

    result.fill = gene.color;
    result.width = config.layout.width;
    result['fill-opacity'] = 0.8;
    result['stroke-dasharray'] = [
      0, config.layout.width, result.height, config.layout.width + result.height];
    result['stroke-width'] = config.layout.width / 5;

    return result;
  }

  var drawGeneLines = function( bandsContainer, chromosome){

    var y = buildYScale();
    var bands = bandsContainer.selectAll('rect.band').data(chromosome.layout.geneBandNodes);
    bands.enter().append('rect').attr({
      'id': function(d){ return d.data.id},
      'class': 'band geneline infobox'
    });

    bands.each( function(band) {
      attribs = generateGeneLineAttr(y, band);
      d3.select(this).attr( attribs );
    } );

    bands.classed( "selected", function(d){
     return d.data.selected
    }
    );

    bands.on('click', function (d) {
      //If user clicks on a gene, toggle gene selection
      if (d.data.type == "gene") {
        log.info('gene annotation click');

        if (d.data.displayed && !d.data.visible && !d.data.hidden) {
          //this gene was annotated automatically - hide it
          d.data.visible = false;
          d.data.hidden = true;
        }
        else {
          //toggle visibility
          d.data.visible = !d.data.visible;
        }

        config.onAnnotationSelectFunction();
      }

      //If user clicks on a cluster of genes, expand that cluster
      if (d.data.type == "geneslist") {
        log.info('geneslist annotation click');

        clusterCurrentlyHidden = d.data.genesList.some( function(gene){
          return !(gene.displayed) } );

        d.data.genesList.forEach( function(gene){
          gene.visible = clusterCurrentlyHidden;
          gene.hidden = !clusterCurrentlyHidden;
        });

        config.onAnnotationSelectFunction();
      }
    });

    bands.exit().remove();
  }

  // An SVG representation of a chromosome with banding data. This is expecting the passed selection to be within an
  // SVG element and to have a list of chromosome JSON objects as its data.
  function my(selection) {
    selection.each(function (d) {
      // build up the selection of chromosome objects
      var chromosomes = d3.select(this).selectAll('.chromosome').data([d]);

      // setup a basic element structure for any new chromosomes
      var enterGroup = chromosomes.enter().append('g').attr('class', 'chromosome');
      enterGroup.append('defs');
      enterGroup.append('rect').classed('background', true);
      enterGroup.append('g').classed('bands_container', true);
      enterGroup.append('rect').classed('outline', true);

      if (config.border) {
        enterGroup.append('rect').classed('border', true);
      }

      // update each of the chromosomes
      chromosomes.each(updateChromosome);

      // remove any missing elements
      chromosomes.exit().remove();
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

  my.bands = function (value) {
    if (!arguments.length) {
      return config.bands;
    }

    config.bands = value;
    return my;
  };

  my.scale = function (value) {
    if (!arguments.length) {
      return config.scale;
    }

    config.scale = value;
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
