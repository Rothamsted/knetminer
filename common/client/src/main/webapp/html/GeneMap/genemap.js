var GENEMAP = GENEMAP || {};

GENEMAP.GeneMap = function(userConfig) {
    var defaultConfig = {
      width: "100%",
      height: "100%",
      longestChromosomeHeight: 500,
      chromosomePerRow: 6,
      chromosomeWidth: 24,
      annotationWidth: 200,
      labelHeight: 20,
      margin: {top: 20, left: 20, bottom: 20, right: 20},
      spacing: {horizontal: 20, vertical: 20},
    };

    var config = _.merge({}, defaultConfig, userConfig);

    // An SVG representation of a chromosome with banding data. This won't create an SVG
    // element, it expects that to already have been created.
    function my(selection) {
      selection.each(function(d, i){

        // var y = d3.scale.linear().range([0, config.height]).domain([0, +d.length]);
        svg = d3.select(this).selectAll("svg").data([d]);

        var svgEnter = svg.enter().append("svg").append("g").classed("zoom_window", true).append("rect").classed('drawing_outline', true);

        svg.attr("width", config.width)
           .attr("height", config.height)
           .attr("style", "background-color:none");

        var container = svg.select(".zoom_window");

        // setup the containers for each of the chromosomes
        var bbox = svg.node().getBoundingClientRect();

        // update the layout object with the new settings
        var layoutConfig = _.pick(config, ['margin', 'spacing', 'longestChromosomeHeight', 'chromosomeWidth', 'annotationWidth', 'chromosomePerRow', 'labelHeight']);
        var layoutGenerator = GENEMAP.MapLayout(layoutConfig)
          .width(bbox.width)
          .height(bbox.height);

        var layout = layoutGenerator.generateLayout(d.chromosomes.length);

        container.select(".drawing_outline").attr({
          width: layout.drawing.width,
          height: layout.drawing.height
        }).style({
          fill:'#fafafa',
          "stroke": "#ccc",
          "stroke-width": 0.5
        })

        // basic zooming functionality
        var zoom = d3.behavior.zoom().scaleExtent([1, 8]);
        var onZoom = function() {
          var translate = d3.event.translate;

          // padding the size of the drawing with 1/2 the bbox so you can
          // center on any point of the drawing.
          var minx = -layout.drawing.width * d3.event.scale + bbox.width/2;
          var maxx = bbox.width/2;
          translate[0] = _.clamp(translate[0], minx, maxx);

          var miny = -layout.drawing.height * d3.event.scale + bbox.height/2 ;
          var maxy = bbox.height/2;
          translate[1] = _.clamp(translate[1], miny, maxy);

          zoom.translate(translate);
          container.attr("transform", "translate(" + zoom.translate() + ")scale(" + d3.event.scale + ")");
        }
        zoom.on("zoom", onZoom);

        svg.call(zoom)

        var chromosomeContainers = container.selectAll("g.container").data(d.chromosomes)

        chromosomeContainers.enter().append("g").classed("container", true);

        chromosomeContainers.attr({
          transform: function(d, i){
            var xPos = layout.chromosomes[i].x;
            var yPos = layout.chromosomes[i].y;
            return "translate(" + xPos + ","+ yPos +")";
          }
        });

        // draw the chromosomes
        var longest = Math.max.apply(null, d.chromosomes.map(function(c){ return c.length; }));
        var chromosomeScale = d3.scale.linear().range([0, config.longestChromosomeHeight]).domain([0, longest]);

        var chromosomeDrawer = GENEMAP.Chromosome({ labelHeight: config.labelHeight })
          .width(config.chromosomeWidth)
          .yScale(chromosomeScale);

        chromosomeContainers.call(chromosomeDrawer);

        chromosomeContainers.exit().remove();
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
