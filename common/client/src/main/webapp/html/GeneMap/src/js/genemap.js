var GENEMAP = GENEMAP || {};

GENEMAP.GeneMap = function (userConfig) {
  var defaultConfig = {
    width: '800',
    height: '500',
    svgDefsFile: './assets/sprite-defs.svg',
    layout: {
      margin: { top: 0.05, right: 0.05, bottom: 0.05, left: 0.05 },
      numberPerRow: 10,
    },
    contentBorder: false,

    // the extra area outside of the content that the user can pan overflow
    // as a proportion of the content. The content doesn't include the margins.
    extraPanArea: 0.25,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var target; // the target for the containing HTML element
  var genome; // the layout to be used;
  var svg; // the top SVG element
  var zoom; // the zoom behaviour
  var container; // the g container that performs the zooming

  var onZoom;

  // returns the size of the SVG element, if the size is defined as a %
  // will attempt to get the actual size in px by interrogating the bounding box
  // this can cause issues if the element is currently hidden.
  var getSvgSize = function () {
    var size = { width: config.width, height: config.height };

    if (size.width.toString().indexOf('%') >= 0 || size.height.toString().indexOf('%') >= 0) {
      var bbox = d3.select(target).select('svg').node().getBoundingClientRect();

      if (size.width.toString().indexOf('%') >= 0) {
        size.width = bbox.width;
      }

      if (size.height.toString().indexOf('%') >= 0) {
        size.height = bbox.height;
      }
    }

    return size;
  };

  // Sets the attributes on the .drawing_outline rectangle for the outline
  var drawDocumentOutline = function () {
    container.select('.drawing_outline').attr({
      width: genome.drawing.width,
      height: genome.drawing.height,
    });
  };

  // draws an outline around the content of the drawing area (inside the margins)
  var drawContentOutline = function () {
    container.select('.drawing_margin').attr({
      x: genome.drawing.margin.left,
      y: genome.drawing.margin.top,
      width: genome.drawing.width - genome.drawing.margin.left - genome.drawing.margin.right,
      height: genome.drawing.height - genome.drawing.margin.top - genome.drawing.margin.bottom,
    });
  };

  var onAnnotationSelectionChanged = function () {
    var anyGenesSelected = $('g.gene-annotation.selected').length > 0;

    svg.select('use.network-btn').classed('enabled', anyGenesSelected);
    svg.select('use.network-btn').classed('disabled', !anyGenesSelected);
  };

  var constructSkeletonChart = function (mapContainer) {
    var svg = mapContainer.append('svg').attr({
      width: config.width,
      height: config.height,
      class: 'mapview',
    });

    svg.append('g').classed('zoom_window', true)
      .append('rect').classed('drawing_outline', true);

    if (config.contentBorder) {
      mapContainer.select('.zoom_window').append('rect').classed('drawing_margin', true);
    }

    svg.append('use').attr({
      'xlink:href': '#network',
      width: 50,
      height: 50,
      class: 'icon network-btn disabled',
      y: 10,
      x: getSvgSize().width - 60,
    });

    // basic zooming functionality
    zoom = d3.behavior.zoom().scaleExtent([1, 10]);
    zoom.on('zoom', onZoom);
    mapContainer.select('svg').call(zoom);

    svg.select('use').on('click', function () {
      console.log('network view clicked');

      if ($(this).hasClass('disabled')) {
        return;
      }

      var selectedLabels = _.map($('.gene-annotation.selected'), function (elt) {
        return elt.__data__.data.label;
      });

      var url = 'OndexServlet?mode=network&keyword=volume';

      console.log('selected labels: ' + selectedLabels);

      generateCyJSNetwork(url, { list: selectedLabels.join('\n') });

      return false;
    }).on('mousedown', function (e) {
      console.log('network mousedown ' + e);
      d3.event.stopPropagation();
      return false;
    }).on('mouseup', function (e) {
      console.log('network mouseup ' + e);
      d3.event.stopPropagation();
      return false;
    });

    return svg;
  };

  var onMouseDown = function () {
    console.log('mouse down');
    svg.classed('dragging', true);
  };

  var onMouseUp = function () {
    console.log('mouse up');
    svg.classed('dragging', false);
  };

  var onContext = function () {
    console.log('context click');
    d3.event.preventDefault();
  };

  var drawMap = function (data) {

    if (!d3.select(target).select('svg').node()) {
      svg = constructSkeletonChart(d3.select(target), data);
    } else {
      svg = d3.select(target).select('svg');

      svg.attr({
        width: config.width,
        height: config.height,
      });
    }

    svg.on('mousedown', onMouseDown)
      .on('mouseup', onMouseUp)
      .on('contextmenu', onContext);

    console.log('width : ' + getSvgSize().width + ' height: ' + getSvgSize().height);

    // update the layout object with the new settings
    var layoutDecorator = GENEMAP.AutoLayoutDecorator(config.layout)
      .width(getSvgSize().width)
      .height(getSvgSize().height)
      .scale(zoom.scale());

    genome = layoutDecorator.decorateGenome(genome);
    svg.datum(genome);

    container = svg.select('.zoom_window');

    drawDocumentOutline();

    if (config.contentBorder) {
      drawContentOutline();
    }

    var infoBox = GENEMAP.InfoBox();
    if (target) {
      infoBox.target(target);
    }

    infoBox.attach();

    // draw the chromosome cell for each of the chromosome objects on the genome
    var cellDrawer = GENEMAP.ChromosomeCell()
      .onAnnotationSelectFunction(onAnnotationSelectionChanged)
      .infoBoxManager(infoBox);

    container.call(cellDrawer);
  };

  onZoom = function () {
    var translate = d3.event.translate;

    if (genome) {
      var bbox = svg.node().getBoundingClientRect();

      // padding the size of the drawing with by a factor of config.extraPanArea * the bbox.
      // Setting this value to 0.5 will allow you to center on any point of the drawing at every zoom level.
      // Margins aren't taken into account when calcuating the pannable padding.
      var minx = -genome.drawing.width * d3.event.scale + bbox.width * (1 - config.extraPanArea) +
                  genome.drawing.margin.right * d3.event.scale;

      var maxx = bbox.width * config.extraPanArea - (genome.drawing.margin.left * d3.event.scale);
      translate[0] = _.clamp(translate[0], minx, maxx);

      var miny = -genome.drawing.height * d3.event.scale + bbox.height * (1 - config.extraPanArea) +
                  genome.drawing.margin.bottom * d3.event.scale;

      var maxy = bbox.height * config.extraPanArea - (genome.drawing.margin.top * d3.event.scale);
      translate[1] = _.clamp(translate[1], miny, maxy);
    }

    zoom.translate(translate);

    // re-draw the map
    drawMap();

    container.attr('transform', 'translate(' + zoom.translate() + ')scale(' + d3.event.scale + ')');
  };

  // An SVG representation of a chromosome with banding data. This won't create an SVG
  // element, it expects that to already have been created.
  function my(selection) {
    selection.each(function (d) {
      var _this = this;

      genome = d;
      target = _this;

      d3.promise.xml(config.svgDefsFile, 'image/svg+xml').then(function (xml) {

        // create a <div> element and load the defs SVG into it
        var div = document.createElement('div');
        div.innerHTML = new XMLSerializer().serializeToString(xml.documentElement);
        document.body.insertBefore(div, document.body.childNodes[0]);

        // draw the map SVG
        drawMap();
      });
    });
  }

  my.resetZoom = function () {
    zoom.translate([0, 0]);
    zoom.scale(1);
    container.attr('transform', 'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')');
  };

  my.width = function (value) {
    if (!arguments.length) {
      return config.width;
    }

    config.width = value;
    return my;
  };

  my.height = function (value) {
    if (!arguments.length) {
      return config.height;
    }

    config.height = value;
    return my;
  };

  my.layout = function (value) {
    if (!arguments.length) {
      return config.layout;
    }

    config.layout = _.merge(config.layout, value);
    return my;
  };

  my.draw = function (target, basemapPath, annotationPath) {
    var reader = GENEMAP.XmlDataReader();
    target = target;
    reader.readXMLData(basemapPath, annotationPath).then(function (data) {
      console.log('drawing genome to target');
      d3.select(target).datum(data).call(my);
    });
  };

  my.redraw = function (target) {
    d3.select(target).call(my);
  };

  return my;
};
