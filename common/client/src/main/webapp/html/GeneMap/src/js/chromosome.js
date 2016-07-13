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
      rx: config.layout.height * 0.01,
      ry: config.layout.height * 0.01,
    };

    chromosomeGroup.select('.mask_rect').attr(chromosomeShape);
    chromosomeGroup.select('rect.background').attr(chromosomeShape);
    chromosomeGroup.select('rect.outline').attr(chromosomeShape);

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

  var drawGeneLines = function( bandsContainer, chromosome){

    var y = buildYScale();
    var bands = bandsContainer.selectAll('rect.band').data(chromosome.annotations.allGenes);
    bands.enter().append('rect').attr('class', 'band geneline');

    bands.attr({
      width: config.layout.width,
      y: function (d) { if(y(d.end - d.start) > 1){ return y(d.midpoint);} else{ return y(d.midpoint) - 0.5; } } ,
      height: function (d) { return Math.max(1, y(d.end - d.start)); },
      fill: function (d) { return d.color; },
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

  my.bands = function (value) {
    if (!arguments.length) {
      return config.bands;
    }

    config.bands = value;
    return my;
  };

  return my;
};
