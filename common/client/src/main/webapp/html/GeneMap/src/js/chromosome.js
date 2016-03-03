var GENEMAP = GENEMAP || {};

GENEMAP.Chromosome = function (userConfig) {
  var defaultConfig = {
    border: false,
    longestChromosome: 100,
    layout: {
      width: 10,
      height: 100,
      x: 0,
      y: 0,
    },
  };

  var config = _.merge({}, defaultConfig, userConfig);

  // the position of the chromosome within the cell, extracted from the chromosome
  // data passed to the drawer
  var position = null;

  var buildYScale = function () {
    return d3.scale.linear().range([0, config.layout.height]).domain([0, config.longestChromosome]);
  };

  // function to update a single chromosome element given the enter + update selection
  // and data. This assumes the basic element structure is in place.
  var updateChromosome = function (d) {
    var y = buildYScale();
    var height = y(d.length);
    var chromosome = d3.select(this);

    chromosome.attr({
      id: 'chromosome_' + d.number,
      transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
    });

    chromosome.select('defs').html('')
      .append('mask').attr({
        id: 'chromosome_mask_' + d.number,
      })
      .append('rect').attr({
        class: 'mask_rect',
      });

    chromosome.select('#chromosome_mask_' + d.number).attr({
      width: config.layout.width,
      height: height,
    });

    var chromosomeShape = {
      width: config.layout.width,
      height: height,
      rx: config.layout.height * 0.01,
      ry: config.layout.height * 0.01,
    };

    chromosome.select('.mask_rect').attr(chromosomeShape);
    chromosome.select('rect.background').attr(chromosomeShape);
    chromosome.select('rect.outline').attr(chromosomeShape);

    if (config.border) {
      chromosome.select('rect.border')
        .attr({
          width: config.layout.width,
          height: config.layout.height,
        });
    }

    // setup the chromosome bands
    var bandsContainer = chromosome.select('.bands_container');

    var bands = bandsContainer.selectAll('rect.band').data(d.bands);
    bands.enter().append('rect').attr('class', 'band');

    bands.attr({
      width: config.layout.width,
      y: function (d) { return y(d.start); },
      height: function (d) { return y(d.end - d.start); },
      fill: function (d) { return d.color; },
    });

    bands.exit().remove();

    chromosome.select('.bands_container').style({
      mask: 'url(#chromosome_mask_' + d.number + ')',
    });
  };

  // An SVG representation of a chromosome with banding data. This is expecting the passed selection to be within an
  // SVG element and to have a list of chromosome JSON objects as its data.
  function my(selection) {
    selection.each(function (d) {
      // build up the selection of chromosome objects
      var chroosomes = d3.select(this).selectAll('.chromosome').data([d]);

      // setup a basic element structure for any new chromosomes
      var enterGroup = chroosomes.enter().append('g').attr('class', 'chromosome');
      enterGroup.append('defs');
      enterGroup.append('text');
      enterGroup.append('rect').classed('background', true);
      enterGroup.append('g').classed('bands_container', true);
      enterGroup.append('rect').classed('outline', true);

      if (config.border) {
        enterGroup.append('rect').classed('border', true);
      }

      // update each of the chromosomes
      chroosomes.each(updateChromosome);

      // remove any missing elements
      chroosomes.exit().remove();
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

  return my;
};
