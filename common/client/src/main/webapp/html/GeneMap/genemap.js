var GENEMAP = GENEMAP || {};

GENEMAP.GeneMap = function(userConfig) {
    var defaultConfig = {
      width: "100%",
      height: "100%",
      layout: {
        margin: { top: 0.05, right: 0.05, bottom: 0.05, left: 0.05},
        numberPerRow: 5
      },
      contentBorder: false
    };

    var config = _.merge({}, defaultConfig, userConfig);

    var target; // the target for the containing HTML element
    var genome; // the layout to be used;
    var svg; // the top SVG element
    var zoom; // the zoom behaviour
    var container; // the g container that performs the zooming

    var onZoom = function() {
      var translate = d3.event.translate;

      if (genome) {
        var bbox = svg.node().getBoundingClientRect();


        // padding the size of the drawing with 1/2 the bbox so you can
        // center on any point of the drawing. Also taking margins into
        // account to further center the view.
        var minx = -genome.drawing.width * d3.event.scale + bbox.width/2 + genome.drawing.margin.right * d3.event.scale ;
        var maxx = bbox.width/2 - (genome.drawing.margin.left * d3.event.scale);
        translate[0] = _.clamp(translate[0], minx, maxx);

        var miny = -genome.drawing.height * d3.event.scale + bbox.height/2 + genome.drawing.margin.bottom * d3.event.scale ;
        var maxy = bbox.height/2 - (genome.drawing.margin.top * d3.event.scale);
        translate[1] = _.clamp(translate[1], miny, maxy);
      }

      zoom.translate(translate);

      // re-draw the map
      drawMap();

      container.attr("transform", "translate(" + zoom.translate() + ")scale(" + d3.event.scale + ")");
    };

    // Sets the attributes on the .drawing_outline rectangle for the outline
    var drawDocumentOutline = function() {
      container.select(".drawing_outline").attr({
        width: genome.drawing.width,
        height: genome.drawing.height
      });
    };

    // draws an outline around the content of the drawing area (inside the margins)
    var drawContentOutline = function() {
      container.select(".drawing_margin").attr({
        x: genome.drawing.margin.left,
        y: genome.drawing.margin.top,
        width: genome.drawing.width - genome.drawing.margin.left - genome.drawing.margin.right ,
        height: genome.drawing.height- genome.drawing.margin.top - genome.drawing.margin.bottom,
      });
    };

    var constructSkeletonChart = function(mapContainer) {
      var svg = mapContainer.append("svg");

      var filter = svg.append("defs").append("filter").attr("id", "shine1");
      filter.append("feGaussianBlur").attr({
        stdDeviation: 2,
        in: "SourceGraphic",
        result: "blur1"
      });

      filter.append("feSpecularLighting").attr({
        result:"spec1",
        in:"blur1",
        surfaceScale:5,
        specularConstant:1,
        specularExponent:20,
        'lighting-color':"#FFFFFF"
      }).append("fePointLight").attr({x: -10000, y:-10000, z:10000});

      filter.append("feComposite").attr({
        in:"spec1",
        in2:"SourceAlpha",
        operator:"in",
        result:"spec_light"
      });

      filter.append("feComposite").attr({
        in:"SourceGraphic",
        in2:"spec_light",
        operator:"out",
        result:"spec_light_fill"
      });

      svg.append("g").classed("zoom_window", true)
        .append("rect").classed('drawing_outline', true);

      if (config.contentBorder) {
        mapContainer.select(".zoom_window").append("rect").classed('drawing_margin', true);
      }

      // basic zooming functionality
      zoom = d3.behavior.zoom().scaleExtent([1, 10]);
      zoom.on("zoom", onZoom);
      mapContainer.select('svg').call(zoom);
    };

    var drawMap = function() {

      if (!d3.select(target).select('svg').node()){
        constructSkeletonChart(d3.select(target));
      }

      svg = d3.select(target).select("svg");

      svg.attr("width", config.width)
         .attr("height", config.height);


      container = svg.select(".zoom_window");

      // setup the containers for each of the chromosomes
      var bbox = svg.node().getBoundingClientRect();

      // update the layout object with the new settings
      var layoutDecorator = GENEMAP.AutoLayoutDecorator(config.layout)
        .width(bbox.width)
        .height(bbox.height)
        .scale(zoom.scale())
        .translate(zoom.translate());

      genome = layoutDecorator.decorateGenome(genome);
      svg.datum(genome);

      drawDocumentOutline();

      if (config.contentBorder) {
        drawContentOutline();
      }

      var infoBox = GENEMAP.InfoBox();
      if (target){
        infoBox.target(target);
      }
      infoBox.attach();

      // setup the annotations container and draw the annotations
      // should be drawn before the chormosomes as some of the lines need to be
      // underneath the chormosome drawings.
      var annotationDrawer = GENEMAP.Annotations();

      var annotationContainer = container.selectAll("g.annotation-container").data([genome.chromosomes]);
      annotationContainer.enter().append("g").attr("class", "annotation-container");
      annotationContainer.call(annotationDrawer);

      // setup the cotnainer and draw the chromosomes
      var chromosomeDrawer = GENEMAP.Chromosome();

      var chromosomeContainer = container.selectAll("g.chromosome-container").data([genome.chromosomes]);
      chromosomeContainer.enter().append("g").attr("class", "chromosome-container");
      chromosomeContainer.call(chromosomeDrawer);

    };

    // An SVG representation of a chromosome with banding data. This won't create an SVG
    // element, it expects that to already have been created.
    function my(selection) {
      selection.each(function(d, i){
        genome = d;
        target = this;
        drawMap();
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
      config.layout = _.merge(config.layout, value);
      return my;
    };

    my.draw = function(target, basemapPath, annotationPath) {
      var reader = GENEMAP.XmlDataReader();
      target = target;
      reader.readXMLData(basemapPath, annotationPath).then(function(data) {
        d3.select(target).datum(data).call(my);
      });
    };

    my.redraw = function(target) {
      d3.select(target).call(my);
    };

    return my;
};
