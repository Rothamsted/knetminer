var GENEMAP = GENEMAP || {};

GENEMAP.ChromosomeLabel = function (userConfig) {
  var defaultConfig = {
    border: false,
    layout: {
      width: 100,
      height: 20,
      x: 0,
      y: 0,
    },
    labelSize: 10,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  function my(selection) {
    selection.each(function (d) {
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
        'font-size': config.labelSize + 'px',
      }).text(d.number);

      if (config.border) {
        labelGroup.select('rect').attr({
          width: config.layout.width,
          height: config.layout.height,
        });
      }

      // remove any missing elements
      labelGroup.exit().remove();
    });
  }

  my.layout = function (value) {
    if (!arguments.length) {
      return config.layout;
    }

    config.layout = value;
    return my;
  };

  return my;
};
