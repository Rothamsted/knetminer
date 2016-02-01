var GENEMAP = GENEMAP || {};

GENEMAP.GeneMap = function(config) {
    var default_values = {
      width: "100%",
      height: "100%",
      maxChromosomeHeight: 500,
      chromosomePerRow: 6,
    };


    // apply defaults to the config
    config = config || {};
    for (var opt in default_values) {
      if (default_values.hasOwnProperty(opt) && !config.hasOwnProperty(opt)){
          config[opt] = default_values[opt];
      }
    }


    // An SVG representation of a chromosome with banding data. This won't create an SVG
    // element, it expects that to already have been created.
    function my(selection) {
      selection.each(function(d, i){

        // var y = d3.scale.linear().range([0, config.height]).domain([0, +d.length]);
        svg = d3.select(this).selectAll("svg").data([d]);

        var svgEnter = svg.enter().append("svg").append("g").classed("zoom_window", true);

        svg.attr("width", config.width)
           .attr("height", config.height)
           .attr("style", "background-color:none");

        var container = svg.select(".zoom_window");

         // basic zooming functionality
         var zoom = function() {
           container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
         }

        svg.call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))

        // setup the containers for each of the chromosomes
        var bbox = svg.node().getBoundingClientRect();
        var widthForEach = (bbox.width - 20) / d.chromosomes.length


        var chromosomeContainers = container.selectAll("g.container").data(d.chromosomes)

        chromosomeContainers.enter().append("g").classed("container", true);

        chromosomeContainers.attr({
          transform: function(d, i){
            return "translate(" + ((i * widthForEach) + 10) + ",10)";
          }
        });

        // draw the chromosomes
        var longest = Math.max.apply(null, d.chromosomes.map(function(c){ return c.length; }));
        var chromosomeScale = d3.scale.linear().range([0, config.maxChromosomeHeight]).domain([0, longest]);

        var chromosomeDrawer = GENEMAP.Chromosome()
          .yScale(chromosomeScale);

        chromosomeContainers.call(chromosomeDrawer);

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

    my.maxChromosomeHeight = function(value) {
      if (!arguments.length) return config.maxChromosomeHeight;
      config.maxChromosomeHeight = value;
      return my;
    }

    return my;
};
