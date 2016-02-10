var GENEMAP = GENEMAP || {};

GENEMAP.Chromosome = function(userConfig) {
    var defaultConfig = {
      border: false
    };

    var config = _.merge({}, defaultConfig, userConfig);

    var buildYScale = function(d) {
      return d3.scale.linear().range([0, d.height]).domain([0, d.longestChromosome]);
    };

    // function to update a single chromosome element given the enter + update selection
    // and data. This assumes the basic element structure is in place.
    var updateChromosome = function(d, i) {
      var y, height;
      var y = buildYScale(d);
      var height = y(d.length);
      var chromosome = d3.select(this);

      chromosome.attr({
        id: "chromosome_" + d.number,
        transform: "translate(" + d.x + ","+ d.y +")"
      });

      chromosome.select('defs').html('')
        .append("mask").attr({
            id: "chromosome_mask_" + d.number, x: 0, y: 0
        })
        .append("rect").attr({
          class: "mask_rect", x:0, y:0
        });

      chromosome.select("text").attr({
        x: d.width / 2,
        y: d.labelHeight  * (0.85),
        'font-size': d.labelHeight ,
      }).text( function(d) {
          return d.number;
      });

      chromosome.select("#chromosome_mask_" + d.number).attr({
        width: d.width,
        height: height,
      });

      chromosome.select(".mask_rect").attr({
        width: d.width,
        height: height,
        x: 0,
        y: 0,
        rx: d.height * 0.02,
        ry: d.height * 0.02
      });

      var chromosomeShape = {
        width: d.width,
        height: height,
        y: d.labelHeight,
        rx: d.height * 0.02,
        ry: d.height * 0.02
      };

      chromosome.select("rect.background").attr(chromosomeShape);
      chromosome.select("rect.outline").attr(chromosomeShape);

      if (config.border){
        chromosome.select("rect.border")
          .attr({
            x:0,
            y:0,
            width: d.width,
            height: d.height + d.labelHeight
          });
      }

      // setup the chromosome bands
      var bandsContainer = chromosome.select(".bands_container").attr({
        transform: 'translate(0,' + d.labelHeight + ')'
      });

      var bands = bandsContainer.selectAll("rect.band").data(d.bands);
      bands.enter().append("rect").attr("class", "band");

      bands.attr({
        width: d.width,
        y: function(d) { return y(d.start)},
        height: function(d) { return y(d.end - d.start); },
        x: 0,
        fill: function(d) { return d.color; }
      });

      bands.exit().remove();

      chromosome.select(".bands_container").style({
            mask: "url(#chromosome_mask_" + d.number + ")"
      });
    };

    // An SVG representation of a chromosome with banding data. This is expecting the passed selection to be within an
    // SVG element and to have a list of chromosome JSON objects as its data.
    function my(selection) {
      selection.each(function(d, i){

        // build up the selection of chromosome objects
        var chroosomes = d3.select(this).selectAll(".chromosome").data(d);

        // setup a basic element structure for any new chromosomes
        var enterGroup = chroosomes.enter().append("g").attr('class', "chromosome");
        enterGroup.append("defs");
        enterGroup.append("text");
        enterGroup.append("rect").classed("background", true);
        enterGroup.append("g").classed("bands_container", true);
        enterGroup.append("rect").classed("outline", true);

        if (config.border){
          enterGroup.append("rect").classed("border", true);
        }

        // update each of the chromosomes
        chroosomes.each(updateChromosome);

        // remove any missing elements
        chroosomes.exit().remove();
      });
    }

    my.width = function(value) {
      if (!arguments.length) return config.width;
      config.width = value;
      return my;
    }

    my.height = function(value) {
      if (!arguments.length) return config.height;
      config.height = value;
      return my;
    }

    my.yScale = function(value) {
      if (!arguments.length) return config.yScale;
      config.yScale = value;
      return my;
    }

    return my;
};
