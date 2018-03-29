var GENEMAP = GENEMAP || {};

GENEMAP.vectorEffectSupport = true;

GENEMAP.Listener = function(val){
  var value = val;
  var listeners = []

  var my = function(val){
    if (!arguments.length) {
      return value;
    }

    value = val
    listeners.forEach(function(listener){
      listener(value) ;
    })
  };

  my.addListener = function(listener){
    listeners.push(listener);
    return my;
  };

  my.removeListener = function(listener){
    _.pull( listeners, listener);
    return my;
  };


  return my;
};

GENEMAP.GeneMap = function (userConfig) {
  var defaultConfig = {
    width: '800',
    height: '500',
    svgDefsFile: './assets/sprite-defs.svg',
    layout: {
      margin: { top: 0.05, right: 0.05, bottom: 0.05, left: 0.05 },
      numberPerRow: /*6*/7,
      maxAnnotationLayers: 3,
    },
    pngScale: 2,
    contentBorder: false,
    initialMaxGenes: 200,
    nGenesToDisplay: 200,
    maxSnpPValue: 1e-5,
    annotationLabelSize: 13,

    // the extra area outside of the content that the user can pan overflow
    // as a proportion of the content. The content doesn't include the margins.
    extraPanArea: 0.4,
  };

  //--------------------------------------------------
  //VARIABLES
  //--------------------------------------------------

  var config = _.merge({}, defaultConfig, userConfig);

  var target; // the target for the containing HTML element
  var svg; // the top SVG element
  var container; // the g container that performs the zooming

  var logSpan;
  var legendSpan;

  var zoom; // the zoom behaviour
  var onZoom;
  var lastZoomScale;

  var genome; // the layout to be used;
  var fullGenome; // the layout to be used;
  var singleGenomeView; //bool

  var menuManager; //holds a GENEMAP.MenuBar
  var autoLabels; //bool
  var manualLabels; //bool

  var showAllQTLs; //bool
  var showSelectedQTLs; //bool

  var expanded = false;
  var originalLayout = {};


  //--------------------------------------------------
  //SVG and ZOOM FUNCTIONS
  //--------------------------------------------------


  var updateDimensions = function() {
    if (expanded){
      var height = $(target).height();
      config.height = height  - 80; //Allow space for menu bar
      config.width =  '100%';
    }
  }

  var toggleFullScreen = function() {

    var d3target = d3.select(target);

    if ( !expanded){

      originalLayout.height = config.height;
      originalLayout.width = config.width;
      d3.select(target).classed('fullscreen', true);
      expanded = true;
    }
    else {
      config.height = originalLayout.height;
      config.width = originalLayout.width;
      d3.select(target).classed('fullscreen', false);
      expanded = false;
    }

    updateDimensions();

    closeAllPopovers();
    resetMapZoom();
    drawMap();
  };

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
    if ( zoom.scale() == 1 && _.isEqual(zoom.translate(), [0,0])){
      //No need to do anything
      return;
    }

    zoom.translate([0, 0]);
    zoom.scale(1);
    container.attr('transform', 'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')');
    menuManager.setFitButtonEnabled(hasMapMoved());

    // need to redraw the map so that label fonts/visibility is recalculated
    computeGeneLayout();
    drawMap();
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
    var drawing = genome.drawing;
    var margin = genome.margin;
    container.select('.drawing_margin').attr({
      x: margin.left,
      y: margin.top,
      width: drawing.width - margin.left - margin.right,
      height: drawing.height - margin.top - margin.bottom,
    });
  };

  var exportAllToPng = function () {
    //Export the whole img at the current zoom level
    log.info( "Exporting whole canvas to png, scale is " + zoom.scale() );

    //Un-transform the svg for saving
    container.attr('transform',
      'translate(0,0)scale(1)');

    //Save as png
    saveSvgAsPng( container[0][0], "genemap.png", {
      scale: zoom.scale() * config.pngScale,
    });

    //Re-transform the svg to how it was before
    container.attr('transform',
      'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')');
  }

  var exportViewToPng = function () {
    //Export the current view
    log.info( "Exporting view to png, scale is " + zoom.scale() );

    //Save as png
    saveSvgAsPng( svg[0][0], "genemap.png", {
      scale: config.pngScale
    });
  }

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

    // re-draw the map if scale has changed
    if( zoom.scale() != lastZoomScale){
      log.trace( "New zoom");
      computeGeneLayout();
      drawMap();
    }
    lastZoomScale = zoom.scale();

    menuManager.setFitButtonEnabled(hasMapMoved());
    container.attr('transform', 'translate(' + zoom.translate() + ')scale(' + d3.event.scale + ')');

    logSpan.text( 'translate: [ ' + zoom.translate()[0].toFixed(1) + ',' + zoom.translate()[1].toFixed(1)
      +  ']  zoom:'  + zoom.scale().toFixed(2) );
  };

  //--------------------------------------------------
  //EVENT HANDLERS
  //--------------------------------------------------

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

  // close all open popovers
  var closeAllPopovers = function (event) {
    $('#clusterPopover').modalPopover('hide');

    $('.genemap-advanced-menu').modalPopover('hide');
  }
  //Intercept mouse events

  var attachClickHandler  = function () {

    var closeFunction = function(event){
      //Exceptions - don't close the popopver we are trying to interact with
      if (event.target.tagName.toLowerCase() === 'a') {
        return;
      }

      if ($(event.target).closest('.genemap-advanced-menu').length > 0){
        return;
      }
      //all other cases
      closeAllPopovers(event);
    }

    var events = 'mousedown mousewheel DOMMouseScroll touchstart '


    $(target).off(events)
      .on(events, closeFunction);


    $('body').on('click', function(e){
      if ($(e.target).closest(target).length < 1){
        if ( expanded == true) {
          toggleFullScreen();
        }
      }
    });
  }

  //--------------------------------------------------
  //SELECTION AND LABELLING FUNCTIONS
  //--------------------------------------------------

  //Retrieves a gene object from Chromosome Id and Gene Id
  //Used when the object can't be bound to the DOM element
  //so information has to be preserved as string constants
  var retrieveGene = function( chromosomeNumber, geneId){
    var chromosome = genome.chromosomes.find( function(chromosome){
      return chromosome.number == chromosomeNumber;
    });

    var gene = chromosome.annotations.genes.find( function(gene){
      return gene.id == geneId;
    });

    return gene;
  }

  // sets the 'showLabel' property on each of the gene annotations, should be either
  // 'show', 'hide' or 'auto'. If 'auto' is selected the 'showLabel' property is remove
  // instead the layout configuration will be used to determine if the text is shown
  var setGeneLabelState = function (value) {

    if (value == "auto") {
      autoLabels = true;
      manualLabels = true;
      genome.chromosomes.forEach(function (chromosome) {
        chromosome.annotations.genes.forEach(function (gene) {
          if (gene.selected == true) { gene.visible = true; }
        })
      });
    }
    else if ( value == "show"){
      autoLabels = false;
      manualLabels = true;
    }
    else if ( value == "hide"){
      autoLabels = false;
      manualLabels = false;
    }

    genome.chromosomes.forEach(function (chromosome) {
      chromosome.annotations.genes.forEach(function (geneAnnotation) {
        if (value === 'auto') {
          delete geneAnnotation.showLabel;
        } else {
          geneAnnotation.showLabel = value;
        }
      });
    });

    computeGeneLayout();
    drawMap();
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


  // called when a gene annotation is selected or deselected, decides if the
  // network button should be enabled or not
  var onAnnotationSelectionChanged = function () {
    //find out if any of the genes in any of the chromosomes are currently selected

    var anyGenesSelected = genome.chromosomes.some( function(chromosome) {
      return chromosome.annotations.genes.some( function(gene){
        return gene.selected;});
    } );

    computeGeneLayout();
    drawMap();

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

    resetMapZoom();
    computeGeneLayout();
    drawMap();

  };

  // click handler for the network view button
  var openNetworkView = function () {

    //extract labels for all selected genes on all chromosomes
    var selectedLabels = _.flatMap(genome.chromosomes.map( function(chromosome){
      return chromosome.annotations.genes.filter( function(gene){
        return gene.selected
      }).map( function(gene){
        // Use list='' from url (link) instead of gene label.
        var geneURI= gene.link;
        var geneLink= geneURI.substring(geneURI.indexOf("list="), geneURI.length).split("=")[1];
        return /*gene.label*/geneLink; }) ; }
    ) );

    var url = 'OndexServlet?mode=network&keyword='+$('#keywords').val();
    //console.log("GeneMap: Launch Network for url: "+ url);
    //console.log("selectedLabels: "+ selectedLabels);

    log.info('selected labels: ' + selectedLabels);
    generateCyJSNetwork(url, { list: selectedLabels.join('\n') });
  };

  // toggle the global label visibility, from 'auto', to 'show' and to 'hide'
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

  var resetLabels = function() {
    log.info( 'Reset Labels');
    genome.chromosomes.forEach(function (chromosome) {
      chromosome.annotations.allGenes.forEach(function (gene) {
        gene.selected = false
        gene.visible = false;
        gene.hidden = false;
      });
    });
    computeGeneLayout();
    drawMap();
  }


  var onSetNumberPerRow = function( numberPerRow) {
    log.trace('Number per row:', numberPerRow );
    config.layout.numberPerRow = numberPerRow;
    resetClusters();
    computeGeneLayout();
    drawMap();
  }

  var onToggleQTLDisplay = function(state){
    log.info('onToggleQTLDisplay');
    if ( state == 'all' ){
      showAllQTLs = true;
      showSelectedQTLs = true;
    }
    else if ( state == 'selected'){
      showAllQTLs = false;
      showSelectedQTLs = 'true';
    }
    else{
      showAllQTLs = false;
      showSelectedQTLs = false;
    }
    resetQtls();
    computeGeneLayout();
    drawMap();
  }

  //--------------------------------------------------
  //LAYOUT FUNCTIONS
  //--------------------------------------------------

  var decorateGenomeLayout = function() {
    // update the layout object with the new settings
    var layoutDecorator = GENEMAP.AutoLayoutDecorator(config.layout)
      .width(getSvgSize().width)
      .height(getSvgSize().height)
      .scale(zoom.scale());

    // set the layout on the genome and set it as the data source
    genome = layoutDecorator.decorateGenome(genome);
  }

  var resetClusters = function() {
    genome.chromosomes.forEach(function (chromosome) {
      chromosome.layout = chromosome.layout || {};
      chromosome.layout.annotationDisplayClusters = null;
      chromosome.layout.geneBandDisplayClusters = null;
    });
  };

  var resetQtls = function() {
    genome.chromosomes.forEach(function (chromosome) {
      chromosome.layout = chromosome.layout || {};
      chromosome.layout.qtlDisplayClusters = null;
    });
  };

  var computeGeneLayout = function() {
    decorateGenomeLayout();
    var doCluster = genome.chromosomes.length > 1;

    var geneAnnotationLayout = GENEMAP.GeneAnnotationLayout( {
        longestChromosome: genome.cellLayout.longestChromosome,
        layout: genome.cellLayout.geneAnnotationPosition,
        annotationMarkerSize: genome.cellLayout.annotations.marker.size,
        annotationLabelSize: genome.cellLayout.annotations.label.size,
        scale: zoom.scale(),
        autoLabels: autoLabels,
        manualLabels: manualLabels,
        nGenesToDisplay: config.nGenesToDisplay,
        displayedFontSize: config.annotationLabelSize,
      }
    );

    var geneBandLayout = GENEMAP.GeneBandsLayout( {
        longestChromosome: genome.cellLayout.longestChromosome,
        layout: genome.cellLayout.geneAnnotationPosition,
        nClusters: 50,
        scale: zoom.scale(),
        nGenesToDisplay: config.nGenesToDisplay
      }
    );

    var qtlAnnotationLayout = GENEMAP.QTLAnnotationLayout({
      longestChromosome: genome.cellLayout.longestChromosome,
      layout: genome.cellLayout.qtlAnnotationPosition,
      scale: zoom.scale(),
      showAllQTLs: showAllQTLs,
      showSelectedQTLs: showSelectedQTLs,
      showAutoQTLLabels: showAllQTLs,
      showSelectedQTLLabels: showSelectedQTLs,
      annotationLabelSize: genome.cellLayout.annotations.label.size,
    });

    genome.chromosomes.forEach( function(chromosome){
      chromosome.layout = chromosome.layout || {};

      if( ! chromosome.layout.annotationDisplayClusters ) {
        geneAnnotationLayout.computeChromosomeClusters(chromosome);
      }
      geneAnnotationLayout.layoutChromosome(chromosome);

      if( ! chromosome.layout.geneBandDisplayClusters ) {
        geneBandLayout.computeChromosomeClusters(chromosome);
      }
      geneBandLayout.layoutChromosome(chromosome);

      if( ! chromosome.layout.qtlDisplayClusters ) {
        qtlAnnotationLayout.computeChromosomeClusters(chromosome);
      }
      qtlAnnotationLayout.layoutChromosome(chromosome);
    });

    geneAnnotationLayout.computeNormalisedGeneScores(genome.chromosomes);
  }

  var updateLegend = function(keyTarget, genome){
    var traitSet = new Set();
    var traitColors = [];
    genome.chromosomes.forEach( function(chromosome) {
      chromosome.annotations.snps.forEach( function(snp) {

        if( ! traitSet.has(snp.trait)){
          if (snp.trait != null){
          traitColors.push( {trait: snp.trait, color: snp.color});
          }
        }

        traitSet.add( snp.trait );

      });
    });

    if( traitColors.length > 0){

      keyTarget.text('SNP legend: ');
    }
    else {
      keyTarget.text('');
    }

    var keyGroup = keyTarget.selectAll('span').data( traitColors);

    var keyGroupSpan = keyGroup.enter()
      .append('span')
      .classed( 'key-item', true);

    keyGroupSpan
      .append('span')
      .style( 'background-color', function(d){return d.color})
      .classed('colorbox', true)
      .append('svg');

    keyGroupSpan.append('span')
      .text( function(d){return d.trait});

    keyGroup.exit().remove();
  };

  // builds the basic chart components, should only be called once
  var constructSkeletonChart = function (mapContainer) {

    var svg = mapContainer.append('svg').attr({
      width: config.width,
      height: config.height,
      class: 'mapview',
    });

    logSpan = mapContainer.append('div').append('span')
      .attr( {
        'class' :'logger',
        'id' : 'logbar'
      });

    legendSpan = mapContainer.append('div')
      .attr( {
        'class' :'key',
        'id' : 'keybar'
      });


    GENEMAP.vectorEffectSupport = 'vectorEffect' in svg[0][0].style;

    //Click handles
    attachClickHandler();

    svg.on('mousedown', onMouseDown)
      .on('mouseup', onMouseUp)
      .on('contextmenu', onContext);

    svg.append('g').classed('zoom_window', true)
      .append('rect').classed('drawing_outline', true);

    if (config.contentBorder) {
      mapContainer.select('.zoom_window').append('rect').classed('drawing_margin', true);
    }

    // basic zooming functionality
    lastZoomScale = 1;
    zoom = d3.behavior.zoom().scaleExtent([1, 50]);
    zoom.on('zoom', onZoom);
    mapContainer.select('svg').call(zoom);

    //Popover element to be the source for modal popovers
    var popoverDiv = mapContainer.append( 'div')
      .attr({ 'id' : 'clusterPopover', class: 'popover' });

    popoverDiv.append('div')
      .attr( {'class' : 'arrow'})

    popoverDiv.append('h3')
      .attr( {'class' : 'popover-title'}).text('Cluster');

    popoverDiv.append( 'div')
      .attr( { 'class' : 'popover-content'});

    return svg;

  };

  // draw the genemap into the target element.
  var drawMap = function () {

    //Create svg if necessary
    if (!d3.select(target).select('svg').node()) {
      svg = constructSkeletonChart(d3.select(target));
    } else {
      svg = d3.select(target).select('svg');

      svg.attr({
        width: config.width,
        height: config.height,
      });
    }

    logSpan.text( 'translate: [ ' + zoom.translate()[0].toFixed(1) + ',' + zoom.translate()[1].toFixed(1)
      +  ']  zoom:'  + zoom.scale().toFixed(2) );

    //Update layout parameters
    decorateGenomeLayout();

    //Compute gene layout if necessary
    var layoutExists = genome.chromosomes.every(function (chromosome) {
      return chromosome.layout; } ) ;
    if (!layoutExists){ computeGeneLayout(); }

    svg.datum(genome);
    container = svg.select('.zoom_window');

    // draw the outlines
    drawDocumentOutline();

    if (config.contentBorder) {
      drawContentOutline();
    }

    // draw the chromosome cell for each of the chromosome objects on the genome
    var cellDrawer = GENEMAP.ChromosomeCell()
      .onAnnotationSelectFunction(onAnnotationSelectionChanged)
      .onLabelSelectFunction(onToggleLabelSelect)
      .maxAnnotationLayers( config.layout.maxAnnotationLayers)
      .maxSnpPValue( config.maxSnpPValue)
      .svg(svg);

    container.call(cellDrawer);

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
          .onLabelBtnClick(setGeneLabelState)
          .onQtlBtnClick(onToggleQTLDisplay)
          .onNetworkBtnClick(openNetworkView)
          .onResetBtnClick(resetLabels)
          .onSetNumberPerRowClick(onSetNumberPerRow)
          .initialMaxGenes(config.nGenesToDisplay)
          .initialNPerRow(config.layout.numberPerRow)
          .onExportBtnClick(exportViewToPng)
          .onExportAllBtnClick(exportAllToPng)
          .onExpandBtnClick(toggleFullScreen)
          .maxSnpPValueProperty(my.maxSnpPValue)
          .nGenesToDisplayProperty(my.nGenesToDisplay)
          .annotationLabelSizeProperty(my.annotationLabelSize)
        ;
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

  my.draw = function (outerTargetId, basemapPath, annotationPath) {
    var reader = GENEMAP.XmlDataReader();
    var outerTarget = d3.select(outerTargetId).selectAll('div').data(['genemap-target']);

    outerTarget.enter()
      .append('div').attr( 'id', function(d){ return d;});

    target = d3.select(outerTargetId).select('#genemap-target')[0][0];

    reader.readXMLData(basemapPath, annotationPath).then(function (data) {
      log.info('drawing genome to target');
      d3.select(target).datum(data).call(my);
      my.nGenesToDisplay(config.initialMaxGenes);
      resetMapZoom();
      updateLegend(legendSpan, genome)
    });
  };

  my.redraw = function (outerTarget) {
    target = d3.select(outerTarget).select('#genemap-target')[0][0];
    updateDimensions();
    d3.select(target).call(my);
    closeAllPopovers();
  };

  my.setGeneLabels = function (value) {
    if (target) {
      setGeneLabelState(value);
    }
  };

  //PROPERTIES---------
  //Use these as public methods to set config values e.g.:
  //my.maxSnpPValue(0.5);
  //Attach listeners to be notified whenever the value changes e.g:
  //my.maxSnpPValue.AddListener(function(pvalue){log.info(pvalue)});

  my.maxSnpPValue = GENEMAP.Listener(config.maxSnpPValue)
    .addListener( function(val){
      var num = Number(val);
      log.info( 'Setting max PValue for SNPs to', val, '(', num, ')');
      if ( isNaN(num)){
        log.info( "Can't parse max PValue")
        my.maxSnpPValue(config.maxSnpPValue);
      }
      config.maxSnpPValue = Number(val);
      computeGeneLayout();
      drawMap();
    })
  ;

  my.nGenesToDisplay = GENEMAP.Listener(config.nGenesToDisplay)
    .addListener( function( nGenes) {
      log.info( 'Setting nGenes to ', nGenes);
      var oldValue = config.nGenesToDisplay;
      config.nGenesToDisplay = nGenes;
      if (nGenes !=  oldValue) {
        resetClusters();
        computeGeneLayout();
        drawMap();
      }
    } );

  my.annotationLabelSize = GENEMAP.Listener(config.annotationLabelSize)
    .addListener( function(labelSize) {
      log.info( 'Setting annotation label size to', labelSize);
      config.annotationLabelSize = labelSize;
      resetClusters();
      computeGeneLayout();
      drawMap();
    })

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

  my.loggingOn = function() {
    logSpan.style('display', 'initial');
  }

  my.loggingOff = function() {
    logSpan.style('display', 'none');
  }

  return my;
};
