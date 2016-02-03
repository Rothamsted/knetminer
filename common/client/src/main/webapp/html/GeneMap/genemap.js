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

    var layout; // the layout to be used;
    var svg; // the top SVG element
    var zoom; // the zoom behaviour
    var container; // the g container that performs the zooming

    var onZoom = function() {
      var translate = d3.event.translate;

      if (layout) {
        var bbox = svg.node().getBoundingClientRect();

        // padding the size of the drawing with 1/2 the bbox so you can
        // center on any point of the drawing. Also taking margins into
        // account to further center the view.
        var minx = -layout.drawing.width * d3.event.scale + (bbox.width + config.margin.right)/2;
        var maxx = bbox.width/2 - config.margin.left;
        translate[0] = _.clamp(translate[0], minx, maxx);

        var miny = -layout.drawing.height * d3.event.scale + (bbox.height + config.margin.bottom)/2 ;
        var maxy = bbox.height/2 - config.margin.top;
        translate[1] = _.clamp(translate[1], miny, maxy);
      }

      zoom.translate(translate);
      container.attr("transform", "translate(" + zoom.translate() + ")scale(" + d3.event.scale + ")");
    };

    // Sets the attributes on the .drawing_outline rectangle for the outline
    var drawDocumentOutline = function() {

      container.select(".drawing_outline").attr({
        width: layout.drawing.width,
        height: layout.drawing.height,
        'vector-effect': 'non-scaling-stroke'
      }).style({
        fill:'#fafafa',
        "stroke": "#ccc",
        "stroke-width": 0.5
      })
    }

    var constructSkeletonChart = function(mapContainer) {
      mapContainer
        .append("svg")
        .append("g").classed("zoom_window", true)
        .append("rect").classed('drawing_outline', true);

      // basic zooming functionality
      zoom = d3.behavior.zoom().scaleExtent([0.01, 8]);
      zoom.on("zoom", onZoom);
      mapContainer.select('svg').call(zoom);
    }

    // An SVG representation of a chromosome with banding data. This won't create an SVG
    // element, it expects that to already have been created.
    function my(selection) {
      selection.each(function(d, i){

        if (!d3.select(this).select('svg').node()){
          constructSkeletonChart(d3.select(this));
        }

        svg = d3.select(this).select("svg").datum(d);

        svg.attr("width", config.width)
           .attr("height", config.height)
           .attr("style", "background-color:none");

        container = svg.select(".zoom_window");

        // setup the containers for each of the chromosomes
        var bbox = svg.node().getBoundingClientRect();

        // update the layout object with the new settings
        var layoutConfig = _.pick(config, ['margin', 'spacing', 'longestChromosomeHeight', 'chromosomeWidth', 'annotationWidth', 'chromosomePerRow', 'labelHeight']);
        var layoutGenerator = GENEMAP.MapLayout(layoutConfig)
          .width(bbox.width)
          .height(bbox.height);

        layout = layoutGenerator.generateLayout(d.chromosomes.length);

        drawDocumentOutline();

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
