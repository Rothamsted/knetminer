var GENEMAP = GENEMAP || {};

GENEMAP.ChromosomeCell = function (userConfig) {
  var defaultConfig = {
    border: true,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  // An SVG representation of a chromosome with banding data. This is expecting the passed selection to be within an
  // SVG element and to have a list of chromosome JSON objects as its data.
  function my(selection) {
    selection.each(function (d) {
      // build up the selection of chromosome objects
      var cells = d3.select(this).selectAll('.chromosome-cell').data(d.chromosomes);

      // setup a basic element structure for any new chromosomes
      var enterGroup = cells.enter().append('g').attr('class', 'chromosome-cell');

      if (config.border) {
        enterGroup.append('rect').classed('border', true);
      }

      // update each of the cells
      cells.attr({
        transform: function (d) {
          return 'translate(' + d.cell.x + ',' + d.cell.y + ')';
        },
      });

      if (config.border) {
        cells.select('rect').attr({
          x:0,
          y:0,
          width: function (d) { return d.cell.width; },
          height: function (d) { return d.cell.height; },
        });
      }

      // draw the annotations
      // should be drawn before the chormosomes as some of the lines need to be
      // underneath the chormosome drawings.
      var annotationDrawer = GENEMAP.Annotations();
      cells.call(annotationDrawer);

      // draw the chromosomes in the cells
      var chromosomeDrawer = GENEMAP.Chromosome();
      cells.call(chromosomeDrawer);

      // remove any missing elements
      cells.exit().remove();
    });
  }

  return my;
};
