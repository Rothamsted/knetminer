var GENEMAP = GENEMAP || {};

GENEMAP.GeneMap = function (userConfig) {
  var defaultConfig = {
    width: '100%',
    height: '100%',
    layout: {
      margin: { top: 0.05, right: 0.05, bottom: 0.05, left: 0.05 },
      numberPerRow: 5,
    },
    contentBorder: true,

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

  var constructSkeletonChart = function (mapContainer, data) {
    var svg = mapContainer.append('svg').classed('mapview', true);

    // svg.node().appendChild(data);
    _.map(_.toArray(data), function (elt) { svg.node().appendChild(elt); });

    var filter = svg.append('defs').append('filter').attr('id', 'shine1');
    filter.append('feGaussianBlur').attr({
      stdDeviation: 2,
      in: 'SourceGraphic',
      result: 'blur1',
    });

    filter.append('feSpecularLighting').attr({
      result:'spec1',
      in:'blur1',
      surfaceScale:5,
      specularConstant:1,
      specularExponent:20,
      'lighting-color':'#FFFFFF',
    }).append('fePointLight').attr({ x: -10000, y:-10000, z:10000 });

    filter.append('feComposite').attr({
      in:'spec1',
      in2:'SourceAlpha',
      operator:'in',
      result:'spec_light',
    });

    filter.append('feComposite').attr({
      in:'SourceGraphic',
      in2:'spec_light',
      operator:'out',
      result:'spec_light_fill',
    });

    svg.append('g').classed('zoom_window', true)
      .append('rect').classed('drawing_outline', true);

    if (config.contentBorder) {
      mapContainer.select('.zoom_window').append('rect').classed('drawing_margin', true);
    }

    svg.append('use').attr({
      x: 10,
      y: 10,
      'xlink:href': '#network',
      width: 40,
      height: 40,
    }).on('click', function () {
      console.log('network view clicked');

      var selectedLabels = _.map($('.gene_annotation.selected'), function (elt) {
        return elt.__data__.data.label;
      });

      var url = 'OndexServlet?mode=network&keyword=volume';
      $.ajax({
        url: url,
        method: 'POST',
        data: {
          list: selectedLabels.join('\n'),
        },
      }).done(function (response, status) {
        console.log('done with status ' + status + ' response:' + response);

      }).fail(function (jqXHR, status, error) {
        console.log('fail with status ' + status + ' and error ' + error);
      });

      console.log('selected labels: ' + selectedLabels);
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

    // basic zooming functionality
    zoom = d3.behavior.zoom().scaleExtent([1, 10]);
    zoom.on('zoom', onZoom);
    mapContainer.select('svg').call(zoom);
  };

  var onMouseDown = function () {
    console.log('mouse down');
    svg.classed('dragging', true);
  };

  var onMouseUp = function () {
    console.log('mouse up');
    svg.classed('dragging', false);
  };

  var drawMap = function (data) {

    if (!d3.select(target).select('svg').node()) {
      constructSkeletonChart(d3.select(target), data);
    }

    svg = d3.select(target).select('svg');

    svg.attr({
      width: config.width,
      height: config.height,
      // viewBox: '0 0 100 100',
      // preserveAspectRatio: 'xMinYMin slice',
    })
    .on('mousedown', onMouseDown)
    .on('mouseup', onMouseUp);

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

    container = svg.select('.zoom_window');

    drawDocumentOutline();

    if (config.contentBorder) {
      drawContentOutline();
    }

    // draw the chromosome cell for each of the chromosome objects on the genome
    var cellDrawer = GENEMAP.ChromosomeCell();
    container.call(cellDrawer);

    // attach the infobox events
    var infoBox = GENEMAP.InfoBox();
    if (target) {
      infoBox.target(target);
    }

    infoBox.attach();

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

      d3.promise.xml('/out/symbol/svg/sprite.symbol.svg', 'image/svg+xml').then(function (xml) {
        var importedNode = document.importNode(xml.documentElement, true);
        console.log(importedNode);
        drawMap(importedNode.getElementsByTagName('symbol'));
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
      d3.select(target).datum(data).call(my);
    });
  };

  my.redraw = function (target) {
    d3.select(target).call(my);
  };

  return my;
};
