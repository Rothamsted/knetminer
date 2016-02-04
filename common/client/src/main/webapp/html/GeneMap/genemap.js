var GENEMAP = GENEMAP || {};

GENEMAP.GeneMap = function(userConfig) {
    var defaultConfig = {
      width: "100%",
      height: "100%",
      layout: {
        margin: { top: 0.05, right: 0.05, bottom: 0.05, left: 0.05}
      },
      contentBorder: false
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
        var minx = -layout.drawing.width * d3.event.scale + bbox.width/2 + layout.drawing.margin.right * d3.event.scale ;// + (bbox.width + layout.drawing.margin.left + layout.drawing.margin.right)/2) ;
        var maxx = bbox.width/2 - (layout.drawing.margin.left * d3.event.scale);
        translate[0] = _.clamp(translate[0], minx, maxx);

        var miny = -layout.drawing.height * d3.event.scale + bbox.height/2 + layout.drawing.margin.bottom * d3.event.scale ;
        var maxy = bbox.height/2 - (layout.drawing.margin.top * d3.event.scale);
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
      });
    };

    // draws an outline around the content of the drawing area (inside the margins)
    var drawContentOutline = function() {
      container.select(".drawing_margin").attr({
        x: layout.drawing.margin.left,
        y: layout.drawing.margin.top,
        width: layout.drawing.width - layout.drawing.margin.left - layout.drawing.margin.right ,
        height: layout.drawing.height- layout.drawing.margin.top - layout.drawing.margin.bottom,
        'vector-effect': 'non-scaling-stroke'
      }).style({
        fill:'none',
        "stroke": "#000",
        "stroke-width": 0.5
      });
    };

    var constructSkeletonChart = function(mapContainer) {
      mapContainer
        .append("svg")
        .append("g").classed("zoom_window", true)
        .append("rect").classed('drawing_outline', true);

      if (config.contentBorder) {
        mapContainer.select(".zoom_window").append("rect").classed('drawing_margin', true);
      }

      // basic zooming functionality
      zoom = d3.behavior.zoom().scaleExtent([1, 10]);
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
        var layoutGenerator = GENEMAP.AutoLayout(config.layout)
          .width(bbox.width)
          .height(bbox.height);

        layout = layoutGenerator.generateLayout(d.chromosomes.length);

        drawDocumentOutline();

        if (config.contentBorder) {
          drawContentOutline();
        }

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
        var chromosomeScale = d3.scale.linear().range([0, layout.chromosome.height]).domain([0, longest]);

        var chromosomeDrawer = GENEMAP.Chromosome({ labelHeight: layout.chromosome.labelHeight })
          .width(layout.chromosome.width)
          .height(layout.chromosome.height)
          .yScale(chromosomeScale);

        chromosomeContainers.call(chromosomeDrawer);

        chromosomeContainers.exit().remove();
      });
    }

    my.resetZoom = function() {
      zoom.translate([0,0]);
      zoom.scale(1);
      container.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
    };

    my.width = function(value) {
      if (!arguments.length) return config.width;
      config.width = value;
      return my;
    };

    my.height = function(value) {
      if (!arguments.length) return config.height;
      config.height = value;
      return my;
    };

    my.layout = function(value) {
      if (!arguments.length) return config.layout;
      config.layout = _.merge(config.layout, value);;
      return my;
    };

    return my;
};
