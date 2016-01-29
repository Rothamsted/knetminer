var GENEMAP = GENEMAP || {};

GENEMAP.Chromosome = function(config) {
    var default_values = {
      width: 40,
      height: 400, // only used if no scale is provided
      yScale: null
    };

    // apply defaults to the config
    config = config || {};
    for (var opt in default_values) {
      if (default_values.hasOwnProperty(opt) && !config.hasOwnProperty(opt)){
          config[opt] = default_values[opt];
      }
    }

    /// returns the color property of the data formatted as an HTML color (#ffffff)
    var getColor = function(d) {
      // transform 0xffffff into #ffffff
      // if any letters are missing i.e. #ffff append 0s at the start => #00ffff
      return "#" +
              "0".repeat(8 - d.color.length) +
              d.color.substring(2, d.color.length);
    };

    // An SVG representation of a chromosome with banding data. This won't create an SVG
    // element, it expects that to already have been created.
    function my(selection) {
      selection.each(function(d, i){

        var y = d3.scale.linear().range([0, config.height]).domain([0, +d.length]);
        var height = config.height;

        if (config.yScale !== null){
          y = config.yScale;
          height = y(d.length);
        };

        var chromosomeGroup = d3.select(this).selectAll("g.chromosome").data([d]);

        // create the basic structure
        var enterGroup = chromosomeGroup.enter()
          .append("g").attr({
            class: "chromosome",
            id: "chromosome_" + d.number
          });

        enterGroup.append("defs")
          .append("mask").attr({
              id: "chromosome_mask_" + d.number, x: 0, y: 0
          })
          .append("rect").attr({
            class: "mask_rect", x:0, y:0
          });

        enterGroup.append("g").classed("bands_container", true);
        enterGroup.append("rect").classed("outline", true);

        // Enter + Update elements
        chromosomeGroup.select("#chromosome_mask_" + d.number).attr({
          width: config.width,
          height: height,
        });

        chromosomeGroup.select(".mask_rect").attr({
          width: config.width,
          height: height,
          x: 0,
          y: 0,
          rx: 20,
          ry: 20
        }).style({
          stroke: "none",
          fill: "#fff"
        });

        chromosomeGroup.select("rect.outline")
          .attr({
            width: config.width,
            height: height,
            rx: 20,
            ry: 20
          })
          .style({ fill: "none", "stroke-width": "0.5", stroke: "#000"});

        // setup the chromosome bands
        var bands = chromosomeGroup.select(".bands_container").selectAll("rect.band").data(d.bands);
        bands.enter().append("rect").attr("class", "band");

        bands.attr({
          width: config.width,
          y: function(d) { return y(d.start)},
          height: function(d) { return y(d.end - d.start); },
          x: 0,
          fill: getColor,
          stroke: "none"
        });

        chromosomeGroup.select(".bands_container").style({
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
