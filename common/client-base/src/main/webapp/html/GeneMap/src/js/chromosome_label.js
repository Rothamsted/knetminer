var GENEMAP = GENEMAP || {};

// draws the chromosome labels on the map in the correct position
GENEMAP.ChromosomeLabel = function (userConfig) {
  var defaultConfig = {
    border: false,
    layout: {
      width: 100,
      height: 20,
      x: 0,
      y: 0,
    },
    sizeLayout: {
      width: 100,
      height: 20,
      x: 0,
      y: 0,
    },
    scale: 1.0,
    onLabelSelectFunction: function(d){ alert( 'Click' + d.number)},
    labelSize: 10,
    longestChromosome: 100,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var formatSize = function(size){
    if (size < 1000 ){
      return size ;
    }
    else if (size < 1000000){
      return (size/1000).toFixed(1) + 'Kb';
    }
    else {
      return (size/1000000).toFixed(1) + 'Mb';
    }
  }

  function my(selection) {
    selection.each(function (d) {

      //CHROMOSOME NUMBER
      // build up the selection of chromosome objects
      var labelGroup = d3.select(this).selectAll('.chromosome-label').data([d]);

      // setup a basic element structure for any new chromosomes
      var enterGroup = labelGroup.enter().append('g').attr('class', 'chromosome-label');
      enterGroup.append('text');

      if (config.border) {
        enterGroup.append('rect').classed('border', true);
      }

      labelGroup.attr({
        transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
      });

      labelGroup.select('text').attr({
        x: config.layout.width * 0.5,
        y: config.layout.height * 0.5,
      }).style({
        'font-size': Math.max( 14/ config.scale, config.layout.chromosomeWidth * 1.2) + 'px',
      }).text(d.number)
          .on('click', config.onLabelSelectFunction )
      ;

      if (config.border) {
        labelGroup.select('rect').attr({
          width: config.layout.width,
          height: config.layout.height,
        });
      }

      // remove any missing elements
      labelGroup.exit().remove();

      //CHROMOSOME SIZE
      // build up the selection of chromosome objects
      var sizeLabelGroup = d3.select(this).selectAll('.chromosome-size-label').data([d]);

      // setup a basic element structure for any new chromosomes
      var enterGroup = sizeLabelGroup.enter().append('g').attr('class', 'chromosome-size-label');
      enterGroup.append('text');


      var yPosition = config.sizeLayout.y + ( config.sizeLayout.cellHeight  * d.length / config.longestChromosome );

      var fontSize = 1.2 * config.labelSize / Math.min( 5, config.scale) + 'px';

      sizeLabelGroup.attr({
        transform: 'translate(' + config.sizeLayout.x + ',' + yPosition + ')',
      });

      sizeLabelGroup.select('text').attr({
        x: config.sizeLayout.width * 0.5,
        //y:   4 / Math.max(config.scale, 2 ) *config.sizeLayout.height,
        y: 0 ,
        dy: '1em' ,
      }).style({
        'font-size':  fontSize,
      }).text( formatSize(d.length))
      ;

      // remove any missing elements
      sizeLabelGroup.exit().remove();
    });

  }

  my.longestChromosome = function (value) {
    if (!arguments.length) {
      return config.longestChromosome;
    }

    config.longestChromosome = value;
    return my;
  };

  my.layout = function (value) {
    if (!arguments.length) {
      return config.layout;
    }

    config.layout = value;
    return my;
  };

  my.sizeLayout = function (value) {
    if (!arguments.length) {
      return config.sizeLayout;
    }

    config.sizeLayout = value;
    return my;
  };

  my.scale = function (value) {
    if (!arguments.length) {
      return config.scale;
    }

    config.scale = value;
    return my;
  };

  my.onLabelSelectFunction = function (value) {
    if (!arguments.length) {
      return config.onLabelSelectFunction;
    }

    config.onLabelSelectFunction = value;
    return my;
  };

  return my;
};
