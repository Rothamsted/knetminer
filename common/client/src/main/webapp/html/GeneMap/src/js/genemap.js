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
  var fullGenome; // the layout to be used;
  var singleGenomeView; //bool
  var svg; // the top SVG element
  var zoom; // the zoom behaviour
  var container; // the g container that performs the zooming

  var onZoom;

  var menuManager; //holds a GENEMAP.MenuBar

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

  // test if the map has panned or zoomed at all
  var hasMapMoved = function () {
    var moved = false;

    if (zoom) {
      moved = (zoom.translate()[0] !== 0 || zoom.translate()[1] !== 0) || moved;
      moved = (zoom.scale() !== 1) || moved;
    }

    return moved;
  };

  // reset the maps pan and zoom to the initial state
  var resetMapZoom = function () {
    zoom.translate([0, 0]);
    zoom.scale(1);
    container.attr('transform', 'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')');
    menuManager.setFitButtonEnabled(hasMapMoved());

    // need to redraw the map so that label fonts/visibility is recalculated
    drawMap();
  };

  // Sets the attributes on the .drawing_outline rectangle for the outline
  var drawDocumentOutline = function () {
    container.select('.drawing_outline').attr({
      width: genome.drawing.width,
      height: genome.drawing.height,
    });
  };

  // sets the 'showLabel' property on each of the gene annotations, should be either
  // 'show', 'hide' or 'auto'. If 'auto' is selected the 'showLabel' property is remove
  // instead the layout configuration will be used to determine if the text is shown
  var setGeneLabelState = function (value) {

    genome.chromosomes.forEach(function (chromosome) {
      chromosome.annotations.genes.forEach(function (geneAnnotation) {
        if (value === 'auto') {
          delete geneAnnotation.showLabel;
        } else {
          geneAnnotation.showLabel = value;
        }
      });
    });
  };

  // sets the map to the 'manual' label state, this hides all the labels (so selected ones can be show)
  // and sets the button to the 'manual' icon.
  var setManualLabelState = function () {
    // if all the labels aren't already hidden
    if (!d3.select(target).select('.tag-btn').classed('manual-label')) {
      setGeneLabelState('hide');
      menuManager.setTabButtonState('manual');
      drawMap();
    }
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

  // called when a gene annotation is selected or deselected, decides if the
  // network button should be enabled or not
  var onAnnotationSelectionChanged = function () {
    var anyGenesSelected = $('g.gene-annotation.selected').length > 0;

    d3.select('.network-btn').classed('disabled', !anyGenesSelected);
  };

  var onToggleLabelSelect = function ( chromosome ) {
    if (singleGenomeView) {
      genome = fullGenome;
      singleGenomeView = false
    }
    else{
      genome = { chromosomes : [chromosome] };
      singleGenomeView = true
    }
    drawMap()
  };

  // builds the basic chart components, should only be called once
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

    // basic zooming functionality
    zoom = d3.behavior.zoom().scaleExtent([1, 10]);
    zoom.on('zoom', onZoom);
    mapContainer.select('svg').call(zoom);

    return svg;
  };

  var onMouseDown = function () {
    log.trace('mouse down');
    svg.classed('dragging', true);
  };

  var onMouseUp = function () {
    log.trace('mouse up');
    svg.classed('dragging', false);
  };

  var onContext = function () {
    log.trace('context click');
    d3.event.preventDefault();
  };

  // draw the genemap into the target element.
  var drawMap = function () {

    if (!d3.select(target).select('svg').node()) {
      svg = constructSkeletonChart(d3.select(target));
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

    // update the layout object with the new settings
    var layoutDecorator = GENEMAP.AutoLayoutDecorator(config.layout)
      .width(getSvgSize().width)
      .height(getSvgSize().height)
      .scale(zoom.scale());

    // set the layout on the genome and set it as the data source
    genome = layoutDecorator.decorateGenome(genome);
    svg.datum(genome);

    container = svg.select('.zoom_window');

    // draw the outlines
    drawDocumentOutline();

    if (config.contentBorder) {
      drawContentOutline();
    }

    // setup the infobox manager
    var infoBox = GENEMAP.InfoBox()
      .setManualLabelMode(setManualLabelState);

    if (target) {
      infoBox.target(target);
    }

    infoBox.attach();

    // draw the chromosome cell for each of the chromosome objects on the genome
    var cellDrawer = GENEMAP.ChromosomeCell()
      .onAnnotationSelectFunction(onAnnotationSelectionChanged)
      .onLabelSelectFunction(onToggleLabelSelect)
      .infoBoxManager(infoBox);

    container.call(cellDrawer);
  };

  // called whenever a zoom event occurss
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

    menuManager.setFitButtonEnabled(hasMapMoved());

    container.attr('transform', 'translate(' + zoom.translate() + ')scale(' + d3.event.scale + ')');
  };

  // click handler for the network view button
  var openNetworkView = function () {

    var selectedLabels = _.map($('.gene-annotation.selected'), function (elt) {
      return elt.__data__.data.label;
    });

    var url = 'OndexServlet?mode=network&keyword=volume';

    log.info('selected labels: ' + selectedLabels);

    generateCyJSNetwork(url, { list: selectedLabels.join('\n') });
  };

  // togels the global label visibility, from 'auto', to 'show' and to 'hide'
  var toggleLableVisibility = function () {
    var oldState = menuManager.getTagButtonState();
    var newState;

    // iterate over the 3 states when the button is clicked
    if (oldState === 'auto') {
      newState = 'show';
    } else if (oldState === 'show') {
      newState = 'hide';
    } else {
      newState = 'auto';
    }

    menuManager.setTabButtonState(newState);
    setGeneLabelState(newState);

    drawMap();
  };

  // An SVG representation of a chromosome with banding data. This won't create an SVG
  // element, it expects that to already have been created.
  function my(selection) {
    selection.each(function (d) {
      var _this = this;
      target = _this;

      fullGenome = d;

      //To start with, we'll display all chromosomes, i.e. the fullGenome
      genome = fullGenome
      singleGenomeView = false

      if (!menuManager) {
        menuManager = GENEMAP.MenuBar()
          .onTagBtnClick(toggleLableVisibility)
          .onFitBtnClick(resetMapZoom)
          .onNetworkBtnClick(openNetworkView);
      }

      d3.select(target).call(menuManager);

      menuManager.setNetworkButtonEnabled(false);
      menuManager.setFitButtonEnabled(false);
      menuManager.setTabButtonState('auto');

      drawMap();
    });
  }

  my.resetZoom = resetMapZoom;

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
      log.info('drawing genome to target');
      d3.select(target).datum(data).call(my);
    });
  };

  my.redraw = function (target) {
    d3.select(target).call(my);
  };

  my.setGeneLabels = function (value) {
    if (target) {
      setGeneLabelState(value);
    }
  };

  my.setQtlLabels = function (value) {
    if (target) {
      var data = d3.select(target).datum();

      data.chromosomes.forEach(function (chromosome) {
        chromosome.annotations.qtls.forEach(function (qtlAnnotation) {
          if (value === 'auto') {
            delete qtlAnnotation.showLabel;
          } else {
            qtlAnnotation.showLabel = value;
          }
        });
      });
    }
  };

  return my;
};
