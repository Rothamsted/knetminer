var GENEMAP = GENEMAP || {};

GENEMAP.Chromosome = function(userConfig) {
    var defaultConfig = {
      border: false
    };

    var config = _.merge({}, defaultConfig, userConfig);


    var buildYScale = function(d) {
      return d3.scale.linear().range([0, d.height]).domain([0, d.longestChromosome]);
    }

    // An SVG representation of a chromosome with banding data. This won't create an SVG
    // element, it expects that to already have been created.
    function my(selection) {

      // add the chromosome group objects
      var enterGroup = selection.enter().append("g").attr({
          'class': "chromosome",
          id: function(d) { return "chromosome_" + d.number},
          transform: function(d){
            return "translate(" + d.x + ","+ d.y +")";
          }
      });

      enterGroup.append("defs");
      enterGroup.append("text");
      enterGroup.append("g").classed("bands_container", true);
      enterGroup.append("rect").classed("outline", true);

      if (config.border){
        enterGroup.append("rect").classed("border", true);
      }

      selection.each(function(d, i){

        var y, height;
        var y = buildYScale(d);
        var height = y(d.length);
        var chromosome = d3.select(this);

        // Enter + Update elements
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
          rx: d.height * 0.05,
          ry: d.height * 0.05
        });

        chromosome.select("rect.outline")
          .attr({
            width: d.width,
            height: height,
            y: d.labelHeight,
            rx: d.height * 0.05,
            ry: d.height * 0.05
          });

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
