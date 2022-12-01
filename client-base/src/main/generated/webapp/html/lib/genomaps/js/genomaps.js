var GENEMAP = GENEMAP || {};



// reads the gene and qtl annotations from the .xml file
GENEMAP.AnnotationXMLReader = function () {

  var _getValue = function (elt, name){
    var element = elt.getElementsByTagName(name);
    if (element && element.length > 0){
      return element[0].childNodes[0].nodeValue;
    }
    else {
      return null;
    }
  }

  var _readFeature = function (elt) {
    var start = +elt.getElementsByTagName('start')[0].childNodes[0].nodeValue;
    var end = +elt.getElementsByTagName('end')[0].childNodes[0].nodeValue;
    var midpoint = (end - start) / 2 + start;

    return {
      id: elt.getAttribute('id'),
      chromosome: elt.getElementsByTagName('chromosome')[0].childNodes[0].nodeValue,
      start: start,
      end: end,
      midpoint: midpoint,
      type:  _getValue(elt, 'type'),
      color: _getValue(elt, 'color'),
      label: _getValue(elt, 'label'),
      link:  _getValue(elt, 'link'),
      score: _getValue(elt, 'score'),
      pvalue: _getValue(elt, 'pvalue'),
      trait: _getValue(elt, 'trait'),
      selected: false,
    };
  };

  var _readAnnotations = function (xml) {
    var genome = {};
    genome.features = [];

    var elements = xml.getElementsByTagName('feature');
    for (var i = 0; i < elements.length; i++) {
      genome.features.push(_readFeature(elements[i]));
    }

    return genome;
  };

  return {

    readAnnotationXML: function (path) {
      log.info('reading annotation file: ', path);
      return d3.promise.xml(path).then(_readAnnotations);
    },

    readAnnotationXMLFromRawXML: function (xmlStr) {
      log.info('reading annotation xml');
      return new Promise(function(resolve, reject){
    	  resolve(new DOMParser().parseFromString(xmlStr, "application/xml"));
    	}).then(_readAnnotations);
    },
  };
};

var GENEMAP = GENEMAP || {};

GENEMAP.AutoLayoutDecorator = function (userConfig) {
  if (!(this instanceof arguments.callee)) {
    return new arguments.callee(userConfig);
  }

  var defaultConfig = {
    width: 900,
    height: 600,
    numberPerRow: 7/*10*/,
    margin: { top: 0.1, left: 0.1, bottom: 0.1, right: 0.1 },
    cellMargin: { top: 0.05, left: 0.05, bottom: 0.10, right: 0.05 },
    labelHeight: 0.02,
    chromosomeAspectRatio: 0.04,
    scale: 1,
    annotations: {
      label: {
        size: 3,
        show: true,
        showThreshold: 8,
        maxSize: 14,
      },
      marker: {
        size: 6,
        show: true,
        maxSize: 20,
      },
    },
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var applyMaxSizeAndThreshold = function (value, settings) {
    var result = _.cloneDeep(value);

    if (value.show) {
      var zoomedSize = value.size * config.scale;

      if (settings.showThreshold) {
        result.show = zoomedSize >= settings.showThreshold;
      }

      if (settings.maxSize) {
        if (zoomedSize > settings.maxSize) {
          result.size = settings.maxSize / config.scale;
        }
      }
    }

    return result;
  };

  return {

    decorateGenome: function (inputGenome) {

      //var genome = _.cloneDeep(inputGenome);
      var genome =  inputGenome;

      var sizeLessMargin = {
        width: config.width * (1 - config.margin.left - config.margin.right),
        height: config.height * (1 - config.margin.top - config.margin.bottom),
      };

      var cols = Math.min(config.numberPerRow, genome.chromosomes.length);
      var rows = Math.ceil(genome.chromosomes.length / cols);
      log.trace("numberPerRow= "+ config.numberPerRow +", chromosomes.length= "+ genome.chromosomes.length);
      log.trace("Cols= "+ cols +", rows= "+ rows);

      var cellDimensions = {
        width: sizeLessMargin.width / cols,
        height: sizeLessMargin.height / rows,
      };

      // calculate the margin widths:
      var cellMargins = {
        top: cellDimensions.height * config.cellMargin.top,
        bottom: cellDimensions.height * config.cellMargin.bottom,
        left: cellDimensions.width * config.cellMargin.left,
        right: cellDimensions.width * config.cellMargin.right,
      };

      // calculate the chromosome label height
      var labelHeight = config.labelHeight * cellDimensions.height;
      var sizeLabelHeight = config.labelHeight * cellDimensions.height;

      // calculate the chromosome heightRatio
      var chromosomeHeight = cellDimensions.height - labelHeight - sizeLabelHeight - cellMargins.top - cellMargins.bottom;

      // calculate the chromosome width
      //maintain aspect ratio until the chromosome starts looking really wide, then start growing the width more slowly
      var chromosomeWidth = Math.min( 65 / config.scale, chromosomeHeight * config.chromosomeAspectRatio);

      // calculate the total annotations widthRatio
      var totalAnnotations = cellDimensions.width - chromosomeWidth - cellMargins.left - cellMargins.right;

      // spit this between the two regions
      var annotationWidth = totalAnnotations / 2;

      var longest = Math.max.apply(null, genome.chromosomes.map(function (c) { return c.length; }));

      var annotationsConfig = {
        label: _.pick(config.annotations.label, ['size', 'show']),
        marker:  _.pick(config.annotations.marker, ['size', 'show']),
      };

      annotationsConfig.label = applyMaxSizeAndThreshold(annotationsConfig.label, config.annotations.label);
      annotationsConfig.marker = applyMaxSizeAndThreshold(annotationsConfig.marker, config.annotations.marker);

      var cellLayout = {
        chromosomePosition: {
          height: chromosomeHeight,
          width: chromosomeWidth,
          x: cellMargins.left + annotationWidth,
          y: cellMargins.top + labelHeight,
        },
        labelPosition: {
          height: labelHeight,
          width: cellDimensions.width - cellMargins.left - cellMargins.right,
          chromosomeWidth: chromosomeWidth,
          x: cellMargins.left,
          y: cellMargins.top,
        },
        sizeLabelPosition:{
          cellHeight:  chromosomeHeight,
          height: sizeLabelHeight,
          width: cellDimensions.width - cellMargins.left - cellMargins.right,
          x: cellMargins.left,
          y: cellMargins.top + labelHeight,
        },
        qtlAnnotationPosition: {
          height: chromosomeHeight,
          width: annotationWidth,
          chromosomeWidth: chromosomeWidth,
          x: cellMargins.left,
          y: cellMargins.top + labelHeight,
        },
        geneAnnotationPosition: {
          height: chromosomeHeight,
          width: annotationWidth,
          x: cellMargins.left + annotationWidth + chromosomeWidth,
          y: cellMargins.top + labelHeight,
        },
        longestChromosome: longest,
        annotations: annotationsConfig,
        scale : config.scale,
      };

      //special case where we only have 1 chromosome
      if ( genome.chromosomes.length == 1 )
      {
        cellLayout.chromosomePosition.x = cellMargins.left + 0.5 * annotationWidth;
        cellLayout.geneAnnotationPosition.x = cellMargins.left + 0.5 * annotationWidth + chromosomeWidth;
        cellLayout.qtlAnnotationPosition.width = annotationWidth * 0.5;
        cellLayout.geneAnnotationPosition.width = annotationWidth * 1.5;
        cellLayout.labelPosition.x = cellMargins.left + 0.5 * annotationWidth;
        cellLayout.labelPosition.width = chromosomeWidth;
        cellLayout.sizeLabelPosition.x = cellMargins.left + 0.5 * annotationWidth;
        cellLayout.sizeLabelPosition.width = chromosomeWidth;
      }

      // decorate the genome with the layout information
      genome.drawing = _.pick(config, ['width', 'height']);
      genome.drawing.margin = {
        top: config.margin.top * genome.drawing.height,
        left: config.margin.left * genome.drawing.width,
        bottom: config.margin.bottom * genome.drawing.height,
        right: config.margin.right * genome.drawing.width,
      };

      genome.chromosomes.forEach(function (chromosome, i) {
        var col = i % config.numberPerRow;
        var row = Math.floor(i / config.numberPerRow);

        chromosome.cell =  {
          y: (row * cellDimensions.height) + (config.margin.top * config.height),
          x: (col * cellDimensions.width) + (config.margin.left * config.width),
          width: cellDimensions.width,
          height: cellDimensions.height,
        };
      });

      genome.cellLayout = cellLayout;

      return genome;
    },

    width: function (value) {
      if (!arguments.length) {
        return config.width;
      }

      config.width = value;
      return this;
    },

    height: function (value) {
      if (!arguments.length) {
        return config.height;
      }

      config.height = value;
      return this;
    },

    numberPerRow: function (value) {
      if (!arguments.length) {
        return config.numberPerRow;
      }

      config.numberPerRow = value;
      return this;
    },

    margin: function (value) {
      if (!arguments.length) {
        return config.margin;
      }

      config.margin = _.merge(config.margin, value);
      return this;
    },

    labelHeight: function (value) {
      if (!arguments.length) {
        return config.labelHeight;
      }

      config.labelHeight = value;
      return this;
    },

    cellMargin: function (value) {
      if (!arguments.length) {
        return config.cellMargin;
      }

      config.cellMargin = value;
      return this;
    },

    chromosomeAspectRatio: function (value) {
      if (!arguments.length) {
        return config.chromosomeAspectRatio;
      }

      config.chromosomeAspectRatio = value;
      return this;
    },

    scale: function (value) {
      if (!arguments.length) {
        return config.scale;
      }

      config.scale = value;
      return this;
    },
  };
};

var GENEMAP = GENEMAP || {};

// reads the chromosome data from the basemap file
GENEMAP.BasemapXmlReader = function () {

  // read a chromosome band object from an XML element
  var _readBand = function (elt) {
    return {
      index: elt.getAttribute('index'),
      start: elt.getElementsByTagName('start')[0].childNodes[0].nodeValue,
      end: elt.getElementsByTagName('end')[0].childNodes[0].nodeValue,
      color: elt.getElementsByTagName('color')[0].childNodes[0].nodeValue,
    };
  };

  // read a chromosome JS object from an XML element
  var _readChromosome = function (elt) {
    var chromosome = {
      index:elt.getAttribute('index'),
      length:elt.getAttribute('length'),
      number:elt.getAttribute('number'),
      bands:[],
    };

    var bandElements = elt.getElementsByTagName('band');

    for (var j = 0; j < bandElements.length; j++) {
      var band = _readBand(bandElements[j]);
      chromosome.bands.push(band);
    }

    return chromosome;
  };

  // reads the genome data from a basemap XML document
  var _readBasemapXML = function (xml) {
    var genome = {};
    genome.chromosomes = [];

    var chromosomeElements = xml.getElementsByTagName('chromosome');
    for (var i = 0; i < chromosomeElements.length; i++) {
      var chromosome = _readChromosome(chromosomeElements[i]);
      genome.chromosomes.push(chromosome);
    }

    return genome;
  };

  return {

    readBasemapXML: function (path) {
      log.info('reading basemap file: ', path);
      return d3.promise.xml(path).then(_readBasemapXML);
    },

    readBasemapXMLFromRawXML: function (xmlStr) {
      log.info('reading basemap xml');
      return new Promise(function(resolve, reject){
    	  resolve(new DOMParser().parseFromString(xmlStr, "application/xml"));
    	}).then(_readBasemapXML);
    },
  };
};

//Source: https://github.com/gegham-khachatryan/BootstrapModalPopover
//Forked from: https://github.com/scruffles/BootstrapModalPopover

//The MIT License (MIT)
//
//Copyright (c) 2013-2014 Bryan Young
//
//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//THE SOFTWARE.

!function ($) {

  /* MODAL POPOVER PUBLIC CLASS DEFINITION
   * =============================== */

  var ModalPopover = function (element, options) {
    this.options = options;
    this.$body = $(document.body);
    this.$navbar = $('.navbar.navbar-fixed-top');
    this.$element = $(element)
      .delegate('[data-dismiss="modal-popup"]', 'click.dismiss.modal-popup', $.proxy(this.hide, this));
    this.$dialog = this.$element.find('.modal-dialog');
    this.options.remote && this.$element.find('.popover-content').load(this.options.remote);
    this.$parent = options.$parent; // todo make sure parent is specified
  };


  /* NOTE: MODAL POPOVER EXTENDS BOOTSTRAP-MODAL.js
   ========================================== */


  ModalPopover.prototype = $.extend({}, $.fn.modal.Constructor.prototype, {

    constructor: ModalPopover,

    getDimensions:function($element) {
      var width;
      var height;

      if ("offsetWidth" in $element[0] && $element[0].offsetWidth) {
        log.trace('Using offsetWidth');
        //This works fine for html objecst
        width = $element[0].offsetWidth;
        height = $element[0].offsetHeight;
      }
      else if ("getBBox" in $element[0]) {
        log.trace('Using getBBox');
        //This works for svg text objects

        //Raw BBox doesn't take Current Transformation Matrix into account.
        var bbox = $element[0].getBBox();
        var ctm = $element[0].getScreenCTM();
        width = bbox.width * ctm.a;
        height = bbox.height * ctm.d;
      }

      var result ={ width: width, height: height};

      return  result;
    },

    show: function () {

      for( var round = 0 ; round < 2 ; round ++ ){

        //dialog is the popup box we are creating
        var $dialog = this.$element;
        $dialog.css({ top: 0, left: 0, display: 'block', 'z-index': 1050 });

        var dialogWidth = $dialog[0].offsetWidth;
        var dialogHeight = $dialog[0].offsetHeight;

        //parent is the element we are creating the popup box next to
        //We're using the updated position function from jquery-ui
        var parent = this.$parent;

        var parentPosition;
        var positionDirective = {
          my: 'left top', at: 'left top', of: parent,
          collision: 'none',
          using: function( hash, feedback){
              parentPosition = hash;
          }
        };

        $dialog
          .position(positionDirective);

        var parentDimensions = this.getDimensions( $(parent));

        parentPosition = _.merge({}, parentPosition, parentDimensions);

        var placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement;

        var boundLeftPos = null;
        var boundRightPos = null;

        if ( this.options.boundingSize ){
          var boundingLeftDirective = {
            my: 'left center', at: 'right center', of: this.options.boundingSize[0],
            collision: 'none',
            using: function( hash, feedback){
              boundLeftPos = hash;
            }
          };

          $dialog
            .position(boundingLeftDirective);

          var boundingRightDirective = {
            my: 'right center', at: 'left center', of: this.options.boundingSize[0],
            collision: 'none',
            using: function( hash, feedback){
              boundRightPos = hash;
            }
          };

          $dialog
            .position(boundingRightDirective);
        }

        var arrowMargin = 10;

        var tp;
        switch (placement) {
          case 'bottom':
            tp = { top: parentPosition.top + parentPosition.height, left: parentPosition.left + parentPosition.width / 2 - dialogWidth / 2 }
            break;
          case 'top':
            tp = { top: parentPosition.top - dialogHeight, left: parentPosition.left + parentPosition.width / 2 - dialogWidth / 2 }
            break;
          case 'left':
            var left = parentPosition.left - dialogWidth
            if ( boundRightPos){
              left = Math.max( left, boundRightPos.left) - arrowMargin;
            }
            tp = { top: parentPosition.top + parentPosition.height / 2 - dialogHeight / 2, left: left }
            break;
          case 'right':
            var left = parentPosition.left + parentPosition.width;
            if ( boundLeftPos){
              left = Math.min( left, boundLeftPos.left) + arrowMargin;
            }
            tp = { top: parentPosition.top + parentPosition.height / 2 - dialogHeight / 2, left: left }
            break;
        }


        $dialog
          .css(tp)
          .addClass(placement)
          .addClass('in');

        $dialog.toggleClass('force-redraw');

        $.fn.modal.Constructor.prototype.show.call(this, arguments); // super
      }
    },

    /** todo entire function was copied just to set the background to 'none'. need a better way */
    backdrop: function (callback) {
      var that = this
        , animate = this.$element.hasClass('fade') ? 'fade' : ''

      if (this.isShown && this.options.backdrop) {
        var doAnimate = $.support.transition && animate

        this.$backdrop = $('<div class="modal-backdrop ' + animate + '" style="background:none" />')
          .appendTo(document.body)

        if (this.options.backdrop != 'static') {
          this.$backdrop.click($.proxy(this.hide, this))
        }

        if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

        this.$backdrop.addClass('in');

        doAnimate ?
          this.$backdrop.one($.support.transition.end, callback) :
          callback()

        if (that.bodyIsOverflowing) {
          this.$navbar.css({ paddingRight: that.scrollbarWidth });
        };

      } else if (!this.isShown && this.$backdrop) {
        this.$backdrop.removeClass('in');

        $.support.transition && this.$element.hasClass('fade') ?
          this.$backdrop.one($.support.transition.end, $.proxy(this.removeBackdrop, this)) :
          this.removeBackdrop();

        this.$body.removeClass('modal-open');

        this.$navbar.css({ paddingRight: 0 });
        this.$body.css({paddingRight: 0});

      } else if (callback) {
        callback()
      }
    }

  });


  /* MODAL POPOVER PLUGIN DEFINITION
   * ======================= */

  $.fn.modalPopover = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = typeof option == 'string' ? $this.data('modal-popover') : undefined;
      var options = $.extend({}, $.fn.modalPopover.defaults, $this.data(), typeof option == 'object' && option);
      // todo need to replace 'parent' with 'target'
      options['$parent'] = ( options.$parent || (data && data.$parent) || $(options.target) );

      if (!data) $this.data('modal-popover', (data = new ModalPopover(this, options)));

      if (typeof option == 'string') data[option]()
    })
  };

  $.fn.modalPopover.Constructor = ModalPopover;

  $.fn.modalPopover.defaults = $.extend({}, $.fn.modal.defaults, {
    placement: 'right',
    modalPosition: 'body',
    keyboard: true,
    backdrop: true
  });


  $(function () {
    $('body').on('click.modal-popover.data-api', '[data-toggle="modal-popover"]', function (e) {
      var $this = $(this);
      var href = $this.attr('href');
      var $dialog = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); //strip for ie7
      var option = $dialog.data('modal-popover') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $dialog.data(), $this.data());
      option['$parent'] = $this;

      e.preventDefault();

      $dialog
        .modalPopover(option)
        .modalPopover('show')
        .one('hide', function () {
          $this.focus()
        })
    })
  })

}(window.jQuery);
var GENEMAP = GENEMAP || {};

GENEMAP.Chromosome = function (userConfig) {
  var defaultConfig = {
    border: false,
    longestChromosome: 100,
    bands: "basemap",
    layout: {
      width: 10,
      height: 100,
      x: 0,
      y: 0,
    },
    scale : 1,
    onAnnotationSelectFunction: $.noop(),
    drawing: null,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var buildYScale = function () {
    return d3.scale.linear().range([0, config.layout.height]).domain([0, config.longestChromosome]);
  };

  // function to update a single chromosome element given the enter + update selection
  // and data. This assumes the basic element structure is in place.
  var updateChromosome = function (chromosome) 
  {
	  var y = buildYScale();
	  var height = y(chromosome.length);
	  var chromosomeGroup = d3.select(this);
	
	  chromosomeGroup.attr({
	    id: 'chromosome_' + chromosome.number,
	    transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
	  });
	
		chromosomeGroup.select('defs').html('')
	  .append('mask').attr({
	    id: 'chromosome_mask_' + chromosome.number,
	  })
	  .append('rect').attr({
	    class: 'mask_rect',
	  });
	
	  chromosomeGroup.select('#chromosome_mask_' + chromosome.number).attr({
	    width: config.layout.width,
	    height: height,
	  });
	
	  var chromosomeShape = {
	    width: config.layout.width,
	    height: height,
	    rx: Math.min(config.layout.width * 0.25, config.layout.height* 0.01),
	    ry: Math.min(config.layout.width * 0.25, config.layout.height* 0.01),
	  };
	
	  chromosomeGroup.select('.mask_rect').attr(chromosomeShape);
	  chromosomeGroup.select('rect.background').attr(chromosomeShape);
	  chromosomeGroup.select('rect.outline').attr(chromosomeShape);
	
	  var selection = [];
	
	  var updateSelection = function()
	  {
	
	    var gSelect = chromosomeGroup.selectAll('rect.selection').data(selection);
	
	    gSelect.enter()
	      .append('rect')
	      .attr( 'class', 'selection')
	      .style( {
	        'fill' : 'gray',
	        'opacity' : 0.2,
	      });
	
	    gSelect.attr( {
        'x': 0,
        'y': function(d){ return Math.min(d.start, d.end)},
        'width': config.layout.width,
        'height': function(d){ return Math.abs(d.end - d.start)},
	     });
	
	    gSelect.exit()
	    .remove();
	  }

    var drag = d3.behavior.drag()
      .on( 'dragstart', function(event){
        //log.info(y.invert( d3.event.y))
        var pos = d3.mouse(this);
        selection.push({
          'start' : pos[1],
          'end' : pos[1]
        });
        updateSelection();
        d3.event.sourceEvent.stopPropagation();
      })
      .on( 'drag', function(event){
        selection[0].end = d3.event.y;
        updateSelection();
        d3.event.sourceEvent.stopPropagation();
        d3.event.sourceEvent.preventDefault();
      })
      .on( 'dragend', function(event){
        d3.event.sourceEvent.stopPropagation();
        var geneStart = y.invert(selection[0].start);
        var geneEnd = y.invert(selection[0].end);
        if( geneStart > geneEnd){
          var temp = geneStart;
          geneStart = geneEnd;
          geneEnd = temp;
        }

        var nodesToUpdate = chromosome.layout.geneBandNodes.filter( function(node){
          return (node.data.midpoint > geneStart && node.data.midpoint < geneEnd )
        }
        );

        nodesToUpdate.forEach( function(node){
          if (node.data.type == "gene") {
            node.data.visible  = true;
          }
          else if ( node.data.type == "geneslist"){
            node.data.genesList.forEach( function(gene) {
              gene.visible = true;
            });
            }
        } );

        config.onAnnotationSelectFunction();

        selection = [];
        updateSelection();

      });

    chromosomeGroup.select('rect.background')
      .call(drag);

    if (config.border) {
      chromosomeGroup.select('rect.border')
        .attr({
          width: config.layout.width,
          height: config.layout.height,
        });
    }

    // setup the chromosome bands
    var bandsContainer = chromosomeGroup.select('.bands_container');
      
    var drawBands;
        if (config.bands == "basemap"){
          drawBands = drawBasemapBands;
        }
        else if (config.bands == "genes"){
          drawBands = drawGeneLinesAndBands;
        }

    drawBands( bandsContainer, chromosome);
    chromosomeGroup.select('.bands_container').style({
      mask: 'url(#chromosome_mask_' + chromosome.number + ')',
    });
  }; // updateChromosome

  var drawBasemapBands = function( bandsContainer, chromosome){

    var y = buildYScale();
    var bands = bandsContainer.selectAll('rect.band').data(chromosome.bands);
    console.log(chromosome.bands);
    bands.enter().append('rect').attr('class', 'band');

    bands.attr({
      width: config.layout.width,
      y: function (d) { return y(d.start); },
      height: function (d) { return y(d.end - d.start); },
      fill: function (d) { return d.color; },
    });

    bands.exit().remove();
  }

  var generateGeneLineAttr = function (y, gene){
    var rawHeight = gene.end - gene.start;
    var rawDY = y(rawHeight);

    var result;

    if (rawDY * config.scale > 2 )  {
      result =  {y: y(gene.start), height: rawDY};
    }
    else {
      height = Math.min( 2 / config.scale, 2)
      result =  { y: y(gene.midpoint) - height / 2,  height: height};
    }

    result.fill = gene.color;
    result.width = config.layout.width;
    result['fill-opacity'] = 0.8;
    result['stroke-dasharray'] = [
      0, config.layout.width, result.height, config.layout.width + result.height];
    result['stroke-width'] = config.layout.width / 5;

    return result;
  }

  var drawGeneLinesAndBands = function( bandsContainer, chromosome){

    var y = buildYScale();
    var bandsRect = bandsContainer.selectAll('rect.band'); 
    var bands = bandsRect.data(chromosome.layout.geneBandNodes);
   
    bands.enter().append('rect').attr({
      'id': function(d){ return d.data.id},
      'class': 'band geneline infobox'
    });

    bands.each( function(band) {
      attribs = generateGeneLineAttr(y, band);
      d3.select(this).attr( attribs );
    } );

    bands.classed( "selected", function(d){
     return d.data.selected
    }
    );

    // adding basempsbands 
    var baseBands = bandsRect.data(chromosome.bands);
     baseBands.attr({
      width: config.layout.width,
      y: function (d) { return y(d.start); },
      height: function (d) { return y(d.end - d.start); },
      fill: function (d) { return d.color; },
    });
   

    bands.on('click', function (d) {
      //If user clicks on a gene, toggle gene selection
      if (d.data.type == "gene") {
        log.info('gene annotation click');

        if (d.data.displayed && !d.data.visible && !d.data.hidden) {
          //this gene was annotated automatically - hide it
          d.data.visible = false;
          d.data.hidden = true;
        }
        else {
          //toggle visibility
          d.data.visible = !d.data.visible;
        }

        config.onAnnotationSelectFunction();
      }

      //If user clicks on a cluster of genes, expand that cluster
      if (d.data.type == "geneslist") {
        log.info('geneslist annotation click');

        clusterCurrentlyHidden = d.data.genesList.some( function(gene){
          return !(gene.displayed) } );

        d.data.genesList.forEach( function(gene){
          gene.visible = clusterCurrentlyHidden;
          gene.hidden = !clusterCurrentlyHidden;
        });

        config.onAnnotationSelectFunction();
      }
    });

    bands.exit().remove();
  }

  // An SVG representation of a chromosome with banding data. This is expecting the passed selection to be within an
  // SVG element and to have a list of chromosome JSON objects as its data.
  function my(selection) {
    selection.each(function (d) {
      // build up the selection of chromosome objects
      var chromosomes = d3.select(this).selectAll('.chromosome').data([d]);

      // setup a basic element structure for any new chromosomes
      var enterGroup = chromosomes.enter().append('g').attr('class', 'chromosome');
      enterGroup.append('defs');
      enterGroup.append('rect').classed('background', true);
      enterGroup.append('g').classed('bands_container', true);
      enterGroup.append('rect').classed('outline', true);

      if (config.border) {
        enterGroup.append('rect').classed('border', true);
      }

      // update each of the chromosomes
      chromosomes.each(updateChromosome);

      // remove any missing elements
      chromosomes.exit().remove();
    });
  }

  my.onAnnotationSelectFunction = function (value) {
    if (!arguments.length) {
      return config.onAnnotationSelectFunction;
    }

    config.onAnnotationSelectFunction = value;
    return my;
  };

  my.layout = function (value) {
    if (!arguments.length) {
      return config.layout;
    }

    config.layout = value;
    return my;
  };

  my.drawing = function (value) {
    if (!arguments.length) {
      return config.drawing;
    }

    config.drawing = value;
    return my;
  };

  my.longestChromosome = function (value) {
    if (!arguments.length) {
      return config.longestChromosome;
    }

    config.longestChromosome = value;
    return my;
  };

  my.bands = function (value) {
   
    if (!arguments.length) {
      return config.bands;
    }

    config.bands = value;
    return my;
  };

  my.scale = function (value) {
    if (!arguments.length) {
      return config.scale;
    }

    config.scale = value;
    return my;
  };

  my.infoBoxManager = function (value) {
    if (!arguments.length) {
      return config.infoBoxManager;
    }

    config.infoBoxManager = value;
    return my;
  };

  return my;
};

var GENEMAP = GENEMAP || {};

GENEMAP.ChromosomeCell = function (userConfig) {
  var defaultConfig = {
    border: false,
    onAnnotationSelectFunction: $.noop(),
    onExpandClusterFunction: $.noop(),
    onLabelSelectFunction: $.noop(),
    maxAnnotationLayers: 3,
    maxSnpPValue: 1.0,
    svg: null,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  // An SVG representation of a chromosome with banding data. This is expecting the passed selection to be within an
  // SVG element and to have a list of chromosome JSON objects as its data.


  function my(selection) {
    selection.each(function (d) {
      var layout = d.cellLayout;

      // build up the selection of chromosome objects
      var cells = d3.select(this).selectAll('.chromosome-cell').data(d.chromosomes);


      // setup a basic element structure for any new chromosomes
      var enterGroup = cells.enter().append('g').attr('class', 'chromosome-cell');

      if (config.border) {
        enterGroup.append('rect').classed('border', true);
      }

      // update each of the cells
      cells.attr({
        transform: function (d) {
          return 'translate(' + d.cell.x + ',' + d.cell.y + ')';
        },
      });

      if (config.border) {
        cells.select('rect').attr({
          x:0,
          y:0,
          width: function (d) { return d.cell.width; },
          height: function (d) { return d.cell.height; },
        });
      }

      // draw the annotations
      // should be drawn before the chormosomes as some of the lines need to be
      // underneath the chormosome drawings.

      //If there's only one chromosome we have space for more clusters
      var nChromosomes = d.chromosomes.length;
      var doClustering = nChromosomes > 1;

      var geneDrawer = GENEMAP.GeneAnnotations()
        .onAnnotationSelectFunction(config.onAnnotationSelectFunction)
        .onExpandClusterFunction(config.onExpandClusterFunction)
        .layout(layout.geneAnnotationPosition)
        .longestChromosome(layout.longestChromosome)
        .chromosomeWidth(layout.chromosomePosition.width)
        .annotationLabelSize(layout.annotations.label.size)
        .annotationMarkerSize(layout.annotations.marker.size)
        .drawing(config.svg)
        .scale( layout.scale)
        ;

      cells.call(geneDrawer);


      // draw the chromosomes in the cells
      var chromosomeDrawer = GENEMAP.Chromosome()
        .layout(layout.chromosomePosition)
        .longestChromosome(layout.longestChromosome)
        .onAnnotationSelectFunction(config.onAnnotationSelectFunction)
        .scale( layout.scale)
        .bands("genes")
        .drawing(config.svg);


      cells.call(chromosomeDrawer);

      // draw the labels for the chromosomes
      var chromosomeLabelDrawer = GENEMAP.ChromosomeLabel()
        .layout(layout.labelPosition)
        .sizeLayout(layout.sizeLabelPosition)
        .onLabelSelectFunction(config.onLabelSelectFunction)
        .longestChromosome(layout.longestChromosome)
        .scale( layout.scale)
        ;


      cells.call(chromosomeLabelDrawer);

      var qtlDrawer = GENEMAP.QtlAnnotations()
        .onAnnotationSelectFunction(config.onAnnotationSelectFunction)
        .layout(layout.qtlAnnotationPosition)
        .longestChromosome(layout.longestChromosome)
        .chromosomeWidth(layout.chromosomePosition.width)
        .annotationLabelSize(layout.annotations.label.size)
        .annotationMarkerSize(layout.annotations.marker.size)
        .showAnnotationLabels(layout.annotations.label.show)
        .maxSnpPValue( config.maxSnpPValue)
        .drawing(config.svg)
        .scale( layout.scale);

      cells.call(qtlDrawer);

      // remove any missing elements
      cells.exit().remove();
    });
  }

  my.onAnnotationSelectFunction = function (value) {
    if (!arguments.length) {
      return config.onAnnotationSelectFunction;
    }

    config.onAnnotationSelectFunction = value;
    return my;
  };

  my.onExpandClusterFunction = function (value) {
    if (!arguments.length) {
      return config.onExpandClusterFunction;
    }

    config.onExpandClusterFunction = value;
    return my;
  };

  my.onLabelSelectFunction = function (value) {
    if (!arguments.length) {
      return config.onLabelSelectFunction;
    }

    config.onLabelSelectFunction = value;
    return my;
  };

  my.infoBoxManager = function (value) {
    if (!arguments.length) {
      return config.infoBoxManager;
    }

    config.infoBoxManager = value;
    return my;
  };

  my.maxAnnotationLayers = function (value) {
    if (!arguments.length) {
      return config.maxAnnotationLayers;
    }

    config.maxAnnotationLayers = value;
    return my;
  };

  my.maxSnpPValue = function (value) {
    if (!arguments.length) {
      return config.maxSnpPValue;
    }

    config.maxSnpPValue = value;
    return my;
  };

  my.svg = function (value) {
    if (!arguments.length) {
      return config.svg;
    }

    config.svg = value;
    return my;
  };

  return my;
};

var GENEMAP = GENEMAP || {};

// draws the chromosome labels on the map in the correct position
GENEMAP.ChromosomeLabel = function (userConfig) {
  var defaultConfig = {
    border: false,
    layout: {
      width: 100,
      height: 20,
      x: 0,
      y: 0,
    },
    sizeLayout: {
      width: 100,
      height: 20,
      x: 0,
      y: 0,
    },
    scale: 1.0,
    onLabelSelectFunction: function(d){ alert( 'Click' + d.number)},
    labelSize: 10,
    longestChromosome: 100,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var formatSize = function(size){
    if (size < 1000 ){
      return size ;
    }
    else if (size < 1000000){
      return (size/1000).toFixed(1) + 'Kb';
    }
    else {
      return (size/1000000).toFixed(1) + 'Mb';
    }
  }

  function my(selection) {
    selection.each(function (d) {

      //CHROMOSOME NUMBER
      // build up the selection of chromosome objects
      var labelGroup = d3.select(this).selectAll('.chromosome-label').data([d]);

      // setup a basic element structure for any new chromosomes
      var enterGroup = labelGroup.enter().append('g').attr('class', 'chromosome-label');
      enterGroup.append('text');

      if (config.border) {
        enterGroup.append('rect').classed('border', true);
      }

      labelGroup.attr({
        transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
      });

      labelGroup.select('text').attr({
        x: config.layout.width * 0.5,
        y: config.layout.height * 0.5,
      }).style({
        'font-size': Math.max( 14/ config.scale, config.layout.chromosomeWidth * 1.2) + 'px',
      }).text(d.number)
          .on('click', config.onLabelSelectFunction )
      ;

      if (config.border) {
        labelGroup.select('rect').attr({
          width: config.layout.width,
          height: config.layout.height,
        });
      }

      // remove any missing elements
      labelGroup.exit().remove();

      //CHROMOSOME SIZE
      // build up the selection of chromosome objects
      var sizeLabelGroup = d3.select(this).selectAll('.chromosome-size-label').data([d]);

      // setup a basic element structure for any new chromosomes
      var enterGroup = sizeLabelGroup.enter().append('g').attr('class', 'chromosome-size-label');
      enterGroup.append('text');


      var yPosition = config.sizeLayout.y + ( config.sizeLayout.cellHeight  * d.length / config.longestChromosome );

      var fontSize = 1.2 * config.labelSize / Math.min( 5, config.scale) + 'px';

      sizeLabelGroup.attr({
        transform: 'translate(' + config.sizeLayout.x + ',' + yPosition + ')',
      });

      sizeLabelGroup.select('text').attr({
        x: config.sizeLayout.width * 0.5,
        //y:   4 / Math.max(config.scale, 2 ) *config.sizeLayout.height,
        y: 0 ,
        dy: '1em' ,
      }).style({
        'font-size':  fontSize,
      }).text( formatSize(d.length))
      ;

      // remove any missing elements
      sizeLabelGroup.exit().remove();
    });

  }

  my.longestChromosome = function (value) {
    if (!arguments.length) {
      return config.longestChromosome;
    }

    config.longestChromosome = value;
    return my;
  };

  my.layout = function (value) {
    if (!arguments.length) {
      return config.layout;
    }

    config.layout = value;
    return my;
  };

  my.sizeLayout = function (value) {
    if (!arguments.length) {
      return config.sizeLayout;
    }

    config.sizeLayout = value;
    return my;
  };

  my.scale = function (value) {
    if (!arguments.length) {
      return config.scale;
    }

    config.scale = value;
    return my;
  };

  my.onLabelSelectFunction = function (value) {
    if (!arguments.length) {
      return config.onLabelSelectFunction;
    }

    config.onLabelSelectFunction = value;
    return my;
  };

  return my;
};

var GENEMAP = GENEMAP || {};

//Produce layout for gene annotations
//GENEMAP.GeneClusterer is used to cluster genes if necessary
//Labella is used to generate layout of nodes

GENEMAP.GeneAnnotationLayout = function (userConfig) {

  var defaultConfig = {
    longestChromosome: 100,
    layout: {
      width: 10, //not used
      height: 100,
      x: 0, //not used
      y: 0, //not used
    },
    autoLabels : true,
    manualLabels : true,
    annotationMarkerSize: 5,
    annotationLabelSize: 5,
    doCluster : true,
    nClusters: 6,
    nGenesToDisplay: 1000,
    maxAnnotationLayers: 3,
    displayedFontSize: 13,
    scale: 1,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var buildYScale = function () {
    return d3.scale.linear()
      .range([0, config.layout.height])
      .domain([0, config.longestChromosome]);
  };

  var shouldRecluster = function(nodes) {
    if (!config.doCluster) { return false;}
    var layers = nodes.map(function (d) {  return d.getLayerIndex(); } );
    var maxLayer = Math.max.apply(null, layers);
    return ( maxLayer > config.maxAnnotationLayers );
  }

  var calculatePossibleRows = function(scale, availableWidth, labelLength, minDisplayedFontSize ){

    var fontCoordRatio = 4.0;

    //Try 2 rows:
    var spaceForLabel = availableWidth / 3;
    var setFontSize =spaceForLabel / labelLength * fontCoordRatio;
    var possible = setFontSize * scale  > minDisplayedFontSize;

    if (possible){
      return 2;
    }

    //Otherwise, try 1 row

    var layerGap = availableWidth * ( 0.1 + 0.1 / scale )
    spaceForLabel = availableWidth -layerGap;
    setFontSize = spaceForLabel / labelLength * fontCoordRatio;
    possible = setFontSize * scale  > minDisplayedFontSize;

    if ( possible){
      return 1;
    }
    return 0;
  }

  var compute1RowLayout = function(scale, availableWidth, labelLength,
                                   maxDisplayedFontSize, availableHeight){
    var fontCoordRatio = 3.5;

    par = {};

    par.scale = scale;
    par.availableHeight = availableHeight;
    par.lineSpacing =  1;

    par.layerGap = availableWidth * ( 0.1 + 0.1 / scale )
    par.spaceForLabel = availableWidth - par.layerGap;

    par.setFontSize = Math.min(
      par.spaceForLabel / labelLength * fontCoordRatio ,
      maxDisplayedFontSize / config.scale
    ) ;

    //par.nodeSpacing =  Math.max( 2, par.setFontSize );
    par.nodeSpacing =   par.setFontSize ;

    par.nLabels = 0.4  * availableHeight / (par.nodeSpacing + par.lineSpacing);
    par.density = 1.0;

    return par;
  };

  var compute2RowLayout  = function(scale, availableWidth, labelLength,
                                    maxDisplayedFontSize, availableHeight){
    var fontCoordRatio = 3.5;

    var par = {};

    par.scale = scale;
    par.availableHeight = availableHeight;
    par.lineSpacing =  1;

    par.setFontSize = Math.min(
      availableWidth / 3 / labelLength * fontCoordRatio,
      maxDisplayedFontSize / config.scale  ) ;

    //par.nodeSpacing = Math.max(2, par.setFontSize);
    par.nodeSpacing =   par.setFontSize ;
    par.spaceForLabel = 1.3 * labelLength * par.setFontSize / fontCoordRatio;
    par.layerGap = Math.min(5*par.setFontSize, availableWidth / 3);
    par.density = 0.9;
    par.nLabels =  0.6 * availableHeight / (par.nodeSpacing + par.lineSpacing);

    return par;
  };

  var generateNodes = function(force, y, par, nodeSource){

    nodeSource.forEach( function(gene){
      gene.displayed = true
      gene.fontSize = par.setFontSize;
    });

    var nodes = nodeSource.map(function (d) {
      return new labella.Node(y(d.midpoint), par.setFontSize, d);
    } );

    try {
      force.nodes(nodes).compute();
    } catch (e){
      if ( e instanceof RangeError){
        return null;
      }
      throw e;
    }
    return nodes;
  }


//Use labella to generate layout nodes for each gene
//or cluster of genes
  var generateChromosomeLayout = function(chromosome){

    allGenes = chromosome.annotations.allGenes.filter( function(gene){
      return (gene.globalIndex < config.nGenesToDisplay);
    });

    //How much space do we have?
    var availableWidth = config.layout.width;

    //For short chromosomes, allow labels to use up to 20% past the end of the chromosome
    var availableHeight = config.layout.height * ( Math.min(
        1,
        0.2 + chromosome.length / config.longestChromosome
      ) ) ;

    //The longest label determines when we can start displaying them without overlaps
    var labelLength = allGenes.reduce( function(cur, gene){
      return Math.max(cur, gene.label.length)
    }, 0);

    var minDisplayedFontSize = 1.1 * config.displayedFontSize;
    var maxDisplayedFontSize = 0.9 * config.displayedFontSize;

    //How many rows of labels do we show?
    var nrows = calculatePossibleRows(config.scale, availableWidth, labelLength, minDisplayedFontSize);

    var par;
    if ( nrows ==2 ){
      par = compute2RowLayout(config.scale, availableWidth,labelLength,maxDisplayedFontSize, availableHeight);
    }
    else if ( nrows == 1) {
      par = compute1RowLayout(config.scale, availableWidth,labelLength,maxDisplayedFontSize, availableHeight);
    }
    else if ( nrows == 0 ){
      par = compute1RowLayout(config.scale, availableWidth,labelLength,maxDisplayedFontSize, availableHeight);
      par.nLabels = 0;
    }

    var y = buildYScale();

    forceConfig = {
      nodeSpacing: par.nodeSpacing,
      lineSpacing: par.lineSpacing,
      algorithm: 'overlap',
      minPos: 0,
      maxPos: par.availableHeight,
      density: par.density,
    };

    var force = new labella.Force( forceConfig );

    //Decide which labels to display

    //Start with no labels displayed
    allGenes.forEach( function(gene){ gene.displayed = false}) ;

    //Include all genes set to visible
    var nodeSet = config.manualLabels
      ? new Set(allGenes.filter( function(gene){ return gene.visible}))
      : new Set();

    //Automatically show some additional labels
    if ( config.autoLabels){
      allGenes.slice(0, par.nLabels)
        .filter( function(gene){return !gene.hidden;})
        .forEach( function(gene){ nodeSet.add(gene)});
    }

    var nodeSource = Array.from(nodeSet);
    var nodes = generateNodes(force, y, par, nodeSource);

    //If the layout algorithm fails (stack limit exceeded),
    //try again using the 'simple' algorithm.
    if ( !nodes){
      force.options( { algorithm: 'simple'});
      nodes = generateNodes( force, y, par, nodeSource);
    }

    //How many layers did we end up with?
    var maxLayer;
    if ( nodes){
    var layers = nodes.map(function (d) {  return d.getLayerIndex(); } );
    maxLayer =  Math.max.apply(null, layers);
    }


    //If the algorithm sill fails or there are too many layers,
    //we need to reduce the number of nodes by clustering
    if (!nodes || maxLayer > 3  ) {
      log.trace( 'Too many lables to display - clustering instead')

      var geneClusterer = GENEMAP.GeneClusterer()
        .nClusters(Math.max(par.nLabels,1));

      try {
        var clusterSource = geneClusterer.createClustersFromGenes(nodeSource);
      }
      catch(e){
        log.info(nodeSource);
        clusterSource = [];
      }
      nodes = generateNodes(force, y, par, clusterSource)
    }

    //Compute paths
    renderConfig  = {
      direction: 'right',
      layerGap: par.layerGap,
      nodeHeight: par.spaceForLabel,
    };

    var renderer = new labella.Renderer(renderConfig);
    renderer.layout(nodes);

    nodes.forEach( function(node){
      node.data.path = renderer.generatePath(node);
    });

    if ( false &&  chromosome.number == "2B") {
      log.info( nodes );
    }

    return nodes;
  }

//Produce list of clusters (which could be single genes)
//for a given chromosome
  var generateChromosomeClusters = function(chromosome){
    var geneClusterer = GENEMAP.GeneClusterer();
    //Run clustering algorithm so we can use the clusters later when drawing
    var genes = chromosome.annotations.genes;
    var geneClusters = geneClusterer.createClustersFromGenes(genes);
    return geneClusters;
  }

  my = {};

  my.layoutChromosome = function(chromosome){
    chromosome.layout.annotationNodes = (
    generateChromosomeLayout(chromosome) || chromosome.layout.annotationNodes);
  }

  my.computeChromosomeClusters = function(chromosome){
    chromosome.layout.annotationClusters = generateChromosomeClusters(chromosome);
    chromosome.layout.annotationDisplayClusters = chromosome.layout.annotationClusters.slice();
  };

  my.expandAllChromosomeClusters = function(chromosome) {
    chromosome.layout.annotationDisplayClusters = chromosome.annotations.genes;
  };

  my.collapseAllChromosomeClusters = function(chromosome) {
    chromosome.layout.annotationDisplayClusters = chromosome.layout.annotationClusters.slice();
  };

  my.expandAChromosomeCluster= function( chromosome, cluster) {
    chromosome.layout.annotationDisplayClusters = chromosome.layout.annotationClusters.slice();

    //add each gene as it's own cluster
    cluster.genesList.forEach( function(gene){
      chromosome.layout.annotationDisplayClusters.push(gene) ;
    } );

    //delete the original cluster
    var clusterIndex = chromosome.layout.annotationDisplayClusters.indexOf(cluster);
    chromosome.layout.annotationDisplayClusters.splice(clusterIndex, 1);
  };

  my.computeNormalisedGeneScores = function ( chromosomes ){

    var allVisible = chromosomes.reduce( function( total, cur){
      return total.concat(cur.annotations.genes.filter( function(gene){
        return gene.displayed;
      }));
    },[]);

    var allScored = allVisible.every( function(gene){
      return gene.score;
    })

    if ( allScored ){

      var maxScore = allVisible.reduce( function(max, cur){
        return Math.max(max , cur.score);
      }, 0);

      var minScore = allVisible.reduce( function(min, cur){
        return Math.min(min , cur.score);
      }, 0);

      allVisible.forEach( function(gene){
          gene.normedScore = 0.5 * (gene.score - minScore) / (maxScore - minScore)  + 0.5;
        }
      );
    }
    else{
      allVisible.forEach( function(gene){
        gene.normedScore = null;
      });
    }
  }

  return my;
}

var GENEMAP = GENEMAP || {};


GENEMAP.GeneAnnotationPopup = function (userConfig) {

  var defaultConfig = {
    onAnnotationSelectFunction : $.noop(),
    drawing : null,
    popoverId: ''
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var statusMap = {
    'show' : function(gene){
      gene.visible = true;
    },
    'hide' : function(gene) {
      gene.visible = false;
      gene.hidden = true;
    },
    'auto' : function(gene){
      gene.visible = false;
      gene.hidden = false;
    }
  };

  var updateRow = function( row, gene){
    row.select('span.genelabel')
      .text(function(gene){
        return gene.label;
      })
      .style( 'font-weight', function(gene){
        return gene.selected ? 'bold' : 'normal'} )

      .style( 'opacity', function(gene){
        return (gene.visible || gene.selected )
          ? 1
          : ( gene.normedScore
          ? gene.normedScore
          : gene.importance); })

      .style( 'color', function (d) {
        return (gene.visible || gene.selected) ? gene.color : null; })
    ;

    var footer = row.select('div.btn-group');

    footerLinks = footer.selectAll('a')
      .data(['show', 'hide', 'auto']);

    footerLinks.classed('disabled',
      function(l){
        return  false
          || ( (l == 'show') && ( gene.visible) )
          || ( (l == 'hide') && ( gene.hidden && !gene.visible) )
          || ( (l == 'auto') && (!gene.hidden && !gene.visible) ) ;
      });
  }

  var genesListContent = function(popoverTitle, popoverContent, node) {
    var genesList = node.data.genesList;

    var genesGroup = popoverContent
      .selectAll('p')
      .data(genesList);

    popoverTitle
      .append('span')
      .text('Cluster');

    links = popoverTitle
      .append('div.btn-group')
      .selectAll('a')
      .data(['show', 'hide', 'auto'])

    links.enter()
      .append('a')
      .attr( 'href', '#')
      .text( function(l){ return l;})
      .classed( 'btn btn-small', true)
      .on( 'click', function(l){
        var statusFunction = statusMap[l];
        genesList.forEach( statusFunction);

        genesGroup
          .each( function(gene){
            var row = d3.select(this);
            updateRow(row, gene );
          });

        d3.event.preventDefault();
        config.onAnnotationSelectFunction();
      });

    var genesEnterGroup = genesGroup.enter()
    var newRow = genesEnterGroup.append('p');
    newRow.append('span').classed('genelabel', true)
    newRow.append('div').classed('btn-group', true)
    ;

    genesGroup
      .each(function(gene) {
        var row = d3.select(this);
        var footer = row.select('div.btn-group');

        footerLinks = footer.selectAll('a')
          .data(['show', 'hide', 'auto']);

        footerLinks.enter()
          .append('a')
          .attr( 'href', '#')
          .text(function(l){
            return l; } )
          .classed('btn btn-small', true)
          .on('click', function(l){
            var statusFunction = statusMap[l];
            statusFunction(gene);
            config.onAnnotationSelectFunction();
            d3.event.preventDefault();
            updateRow(row, gene);
          });
      });

    genesGroup
      .each(function(gene){
        var row = d3.select(this);
        updateRow(row, gene );
      });
  }

  var geneContent = function(popoverTitle, popoverContent, node){

    var gene = node.data;

    //POPOVER TITLE
    popoverTitle
      .append('a')
      .attr( {'href' : gene.link } )
      .text(gene.label);

    //POPOVER CONTENT

    //populate
    popoverContent.append('p')
      .text( 'Chromosome ' + gene.chromosome +  ': ' + gene.start + '-' + gene.end);

    if(gene.score){
      popoverContent.append('p')
        .text( 'Score: ' + parseFloat(gene.score).toFixed(3) );
    }

    popoverContent.append('hr');

    var footer = popoverContent
      .append('p')
      .style( 'float', 'right')
      ;

    var updateFooter = function(){

      footerLinks = footer.selectAll('a')
        .data(['show', 'hide', 'auto']);

      footerLinks.enter()
        .append('a')
        .attr( 'href', '#')
        .text(function(l){
          return l; } )
        .classed('btn btn-small', true)
        .on('click', function(l){
          var statusFunction = statusMap[l];
          statusFunction(gene);
          config.onAnnotationSelectFunction();
          d3.event.preventDefault();
          updateFooter();
        });

      footerLinks.classed('disabled',
        function(l){
          return  false
            || ( (l == 'show') && ( gene.visible) )
            || ( (l == 'hide') && ( gene.hidden && !gene.visible) )
            || ( (l == 'auto') && (!gene.hidden && !gene.visible) ) ;
        });
    }

    updateFooter();
  }

  var my = {}

  my.geneAnnotationsPopoverFunction = function(d){

    var isCluster = d.data.type == 'geneslist';

    log.trace('Gene Annotation Context Menu');
    d3.select(config.popoverId).attr( 'class' , 'popover');

    popoverTitle = d3.select(config.popoverId)
      .select('.popover-title');

    popoverContent = d3.select(config.popoverId)
      .select('.popover-content');

    //clear
    popoverTitle.selectAll('*').remove();
    popoverTitle.text("");

    popoverContent.selectAll('*').remove();
    popoverContent.text("");

    //POPOVER TITLE
    //populate
    if ( isCluster) {
      genesListContent(popoverTitle, popoverContent, d);
    }
    else{
      geneContent(popoverTitle, popoverContent, d);
    }

    //To line up the popover correctly,
    // we need to use the text as the target,
    //not the whole group
    var target = d3.select(this).select('text');

    //ACTIVATE POPOVER
    $(config.popoverId).modalPopover( {
      target: $(target[0]),
      parent: $(target[0]),
      'modal-position': 'relative',
      placement: "right",
      boundingSize: config.drawing,
    });
    $(config.popoverId).modalPopover('show');

    $(config.popoverId).on('mousedown mousewheel', function(event){
      log.trace('popover click');
      event.stopPropagation();
    });

  };

  return my;
}

var GENEMAP = GENEMAP || {};


GENEMAP.GeneAnnotations = function (userConfig) {
  var defaultConfig = {
    border: false,
    labelRectangles: false,
    onAnnotationSelectFunction: $.noop(),
    onExpandClusterFunction: $.noop(),
    longestChromosome: 100,
    layout: {
      width: 10,
      height: 100,
      x: 0,
      y: 0,
    },
    chromosomeWidth: 20,
    annotationMarkerSize: 5,
    annotationLabelSize: 5,
    scale: null,
    drawing: null,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var geneAnnotationPopup = null;


  var buildYScale = function () {
    return d3.scale.linear().range([0, config.layout.height]).domain([0, config.longestChromosome]);
  };

  // adds the gene annotations to the annotations group within it, uses the data
  // bound to the annotationsGroup to generate the annotation elements
  var setupGeneAnnotations = function (annotationGroup, chromosome) {

    //Configure popup
    var popupConfig = _.pick( config, ['onAnnotationSelectFunction', 'drawing']);
    config.popoverId = '#clusterPopover';
    geneAnnotationPopup = GENEMAP.GeneAnnotationPopup( config );

    log.trace('setupGeneAnnotations');

    var y = buildYScale();

    //Data join
    // Use a key function so that the correct mapping between graphical objects
    // and data points is maintained even when clustering changes
    var geneAnnotations = annotationGroup.selectAll('g.gene-annotation').data(
      chromosome.layout.annotationNodes, function(d){return d.data.id});


    //--------------------------------------------------------------------------
    // Enter only - create graphics objects
    //--------------------------------------------------------------------------
    //path and text are created with correct position attributes already
    var geneAnnotationsEnterGroup = geneAnnotations.enter()
      .append('g').classed('gene-annotation', true);

    geneAnnotationsEnterGroup
      .append('line').classed('midpoint-line', true);

    geneAnnotationsEnterGroup
      .append('path').classed('link', true)
      .attr({ d: function (d) { return d.data.path ;} })
    ;

    if (config.labelRectangles) {
      geneAnnotationsEnterGroup
        .append('rect').classed('labella', true);
    }

    geneAnnotationsEnterGroup
      .append('text')
      .attr({
        x: function (d) { return d.x + 0.1 * config.annotationLabelSize; },
        y: function (d) { return d.y + 0.4 * config.annotationLabelSize; }
      });

    //--------------------------------------------------------------------------
    //Enter and update
    //--------------------------------------------------------------------------

    //SET UP TEXT ATTRIBUTES

    geneAnnotations.attr('id', function (d) {
      return 'feature_' + d.data.id;
    });

    geneAnnotations
      .classed('selected', function(d){ return d.data.selected; });

    geneAnnotations.select('line.midpoint-line').attr({
      x1: -(config.chromosomeWidth * 0.5),
      y1: function (d) { return y(d.data.midpoint); },
      y2: function (d) { return y(d.data.midpoint); },
      x2: 0,
    });

    geneAnnotations.select('text')
      .text(function (d) {
        if (d.data.type == "gene") {
          return d.data.label;
        }
        else if (d.data.type == "geneslist"){
          return "(" + d.data.genesList.length + ")";
        }
      });

    // draw the labella labels as rectangles, useful for debugging
    if (config.labelRectangles) {
      geneAnnotations.select('rect.labella').attr({
        fill: 'pink',
        stroke: 'none',
        x: function (d) { return d.x; },
        y: function (d) {
          return d.y - d.dy / 2;
        },
        width: function (d) { return d.dx; },
        height: function (d) { return d.dy; },
      });
    }

    //LINK AND LABEL STYLING
    //selected annotations are bold and larger

    //(visble || selected) implies manual select - so use colors
    //Otherwise, label has been displayed automatically - color gray

    //See also annotations.less for additional styling


    var strokeWidth = '0.5';
    if( !GENEMAP.vectorEffectSupport) {
      strokeWidth = 0.5 / config.scale;
    }

    geneAnnotations.select('path.link')
      .style( "opacity", function(d){
        return (d.data.visible || d.data.selected )
          ? 1
          : ( d.data.normedScore
          ? d.data.normedScore
          : d.data.importance); }
      )
      .style( "stroke-width" , function(d) {
        return strokeWidth
      } )
      .style( "stroke" , function (d){
        return (d.data.visible || d.data.selected ) ?  d.data.color : 'gray'; }
      )
    ;

    geneAnnotations.select('text')
      .style( 'font-size', function(d){
        return (d.data.selected ? 0.2 : 0 ) + d.data.fontSize + 'px'})

      .style( 'font-weight', function(d){
        return d.data.selected ? 'bold' : 'normal'} )

      .style( 'opacity', function(d){
        return (d.data.visible || d.data.selected )
          ? 1
          : ( d.data.normedScore
          ? d.data.normedScore
          : d.data.importance); }
      )

      .style( 'fill', function (d) {
        return (d.data.visible || d.data.selected) ? d.data.color : null; })
    ;


    //TRANSITIONS
    //Move links and labels into their correct positions
    //(NB new elements were created at correct position anyway)

    geneAnnotations.select('text')
      .transition().duration(300)
      .attr({
        x: function (d) { return d.x + 0.1 * config.annotationLabelSize; },
        y: function (d) { return d.y + 0.4 * config.annotationLabelSize; },
      })
    ;

    geneAnnotations.select('path.link')
      .transition().duration(300)
      .attr({
        d: function (d) { return d.data.path ;},
      })
    ;

    //EVENT HANDLING

    //Left click to select gene or expand cluster
    geneAnnotations.on('click', function (d) {
      //If user clicks on a gene, toggle gene selection
      if (d.data.type == "gene") {
        log.info('gene annotation click');
        d.data.selected = !d.data.selected;
        if (d.data.selected){
          d.data.visible = true;
       }
        config.onAnnotationSelectFunction();
      }

      //If user clicks on a cluster of genes, expand that cluster
      if (d.data.type == "geneslist") {
        log.trace('geneslist annotation click');
        config.onExpandClusterFunction(chromosome, d.data);
      }
    });


    //right click to display popover
    geneAnnotations
        .on('contextmenu', geneAnnotationPopup.geneAnnotationsPopoverFunction
      );

    var exitGroup = geneAnnotations.exit()
    exitGroup.remove();
  };

  // draw a border around the annotation target element
  var drawBorder = function (group) {

    // create the border element if it doesn't exist
    if (group.select('rect.border').empty()) {
      group.append('rect').classed('border', true);
    }

    group.select('rect.border')
      .attr({
        width: config.layout.width,
        height: config.layout.height,
      });
  };

  // An SVG representation of a chromosome with banding data. This won't create an SVG
  // element, it expects that to already have been created.
  function my(selection) {
    selection.each(function (d) {

      var annotationGroup = d3.select(this).selectAll('.gene-annotations').data([d]);

      annotationGroup.enter().append('g').attr('class', 'gene-annotations');

      annotationGroup.attr({
        transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
        id: function (d) { return 'annotation_' + d.number; },
      });

      setupGeneAnnotations(annotationGroup, d);

      if (config.border) {
        drawBorder(annotationGroup);
      }

      annotationGroup.exit().remove();
    });
  }

  my.onAnnotationSelectFunction = function (value) {
    if (!arguments.length) {
      return config.onAnnotationSelectFunction;
    }

    config.onAnnotationSelectFunction = value;
    return my;
  };

  my.onExpandClusterFunction = function (value) {
    if (!arguments.length) {
      return config.onExpandClusterFunction;
    }

    config.onExpandClusterFunction = value;
    return my;
  };

  my.layout = function (value) {
    if (!arguments.length) {
      return config.layout;
    }

    config.layout = value;
    return my;
  };

  my.drawing = function (value) {
    if (!arguments.length) {
      return config.drawing;
    }

    config.drawing = value;
    return my;
  };

  my.scale = function (value) {
    if (!arguments.length) {
      return config.scale;
    }

    config.scale = value;
    return my;
  };

  my.longestChromosome = function (value) {
    if (!arguments.length) {
      return config.longestChromosome;
    }

    config.longestChromosome = value;
    return my;
  };

  my.chromosomeWidth = function (value) {
    if (!arguments.length) {
      return config.chromosomeWidth;
    }

    config.chromosomeWidth = value;
    return my;
  };

  my.annotationLabelSize = function (value) {
    if (!arguments.length) {
      return config.annotationLabelSize;
    }

    config.annotationLabelSize = value;
    return my;  };

  my.annotationMarkerSize = function (value) {
    if (!arguments.length) {
      return config.annotationMarkerSize;
    }

    config.annotationMarkerSize = value;
    return my;
  };


  return my;
};

var GENEMAP = GENEMAP || {};

//Produce layout for gene annotations
//GENEMAP.GeneClusterer is used to cluster genes if necessary
//Labella is used to generate layout of nodes

GENEMAP.GeneBandsLayout = function (userConfig) {

  var defaultConfig = {
    longestChromosome: 100,
    layout: {
      width: 10, //not used
      height: 100,
      x: 0, //not used
      y: 0, //not used
    },
    doCluster : true,
    nClusters: 6,
    scale: 1,
    nGenesToDisplay: 1000,
  };

  var config = _.merge({}, defaultConfig, userConfig);
  var y;

  var buildYScale = function () {
    return d3.scale.linear()
      .range([0, config.layout.height])
      .domain([0, config.longestChromosome]);
  };

  var shouldRecluster = function(nodes) {
    return config.doCluster;
  }


  var createNode = function(cluster){
    if (cluster.type == "gene") {
      var gene = cluster;

      result = {
        start : gene.start,
        end : gene.end,
        midpoint : gene.midpoint,
        color : gene.color,
        data : gene
      };

      return result;
    }
    else if (cluster.type == "geneslist"){
      maxPosition = cluster.genesList.reduce( function(max,current){
        return Math.max(max, current.end);
      }, 0);
      minPosition = cluster.genesList.reduce( function(min,current){
        return Math.min(min, current.start);
      }, Infinity);

      result = {
        start : minPosition,
        end : maxPosition,
        midpoint : cluster.midpoint,
        color : "#0000FF",
        data : cluster
      };

      return result;
      }
    else{
      log.error( "unregconized cluster type");
      log.info( cluster);
    }
  }

  var generateChromosomeLayout = function(chromosome){
    y = buildYScale();

    //Start by constructing nodes directly from genes
    var nodeSource = chromosome.layout.geneBandDisplayClusters;
    var nodes = nodeSource.map( createNode );
    return nodes;

  }

//Produce list of clusters (which could be single genes)
//for a given chromosome
  var generateChromosomeClusters = function(chromosome) {

    var genes = chromosome.annotations.allGenes.filter( function(gene){
      return (gene.globalIndex < config.nGenesToDisplay )
    });

    log.trace( "nGenesToDisplay is " + config.nGenesToDisplay );
    log.trace( "Laying out " + genes.length + " genes.");
    genes.sort(function (lhs, rhs) {
        return lhs.midpoint - rhs.midpoint
      });

    if ( false && chromosome.number == "2B") {
      log.info( "GENES");
      genes.forEach(function (c) {
        log.info(c.type, c.midpoint)
      })
    }

    var geneClusters = [];

    var iGene = 0;
    while (iGene < genes.length) {
      iDiff = iGene;
      while (iDiff < genes.length &&
      (genes[iGene].midpoint == genes[iDiff].midpoint)) {
        iDiff++;
      }
      nMatching = iDiff - iGene;

      if (nMatching == 1) {
        geneClusters.push(genes[iGene]);
        iGene++;
      }
      else {
        var genesList = genes.slice(iGene, iDiff);
        var id = genesList.reduce(function (sum, current) {
          return sum + current.id.toString();
        }, "");

        var genesCollection = {
          genesList: genesList,
          midpoint: genesList[0].midpoint,
          type: "geneslist",
          id: id,
        };
        geneClusters.push(genesCollection);
        iGene = iDiff;
      }
    }

    geneClusters.sort(function (lhs, rhs) {
      return lhs.midpoint < rhs.midpoint
    });

    if ( false && chromosome.number == "2B") {
      log.info( "CLUSTERS");
      geneClusters.forEach(function (c) {
        log.info(c.type, c.midpoint)
      })
    }
    return geneClusters;
  }


  my = {};

  my.layoutChromosome = function(chromosome){
    chromosome.layout.geneBandNodes = generateChromosomeLayout(chromosome)
  }

  my.computeChromosomeClusters = function(chromosome){
    ly = chromosome.layout;
    ly.geneBandClusters = generateChromosomeClusters(chromosome);
    ly.geneBandDisplayClusters = ly.geneBandClusters.slice();
  };

  my.expandAllChromosomeClusters = function(chromosome) {
    ly = chromosome.layout;
    ly.geneBandDisplayClusters = chromosome.annotations.allGenes;
  };

  my.collapseAllChromosomeClusters = function(chromosome) {
    ly = chromosome.layout;
    ly.geneBandDisplayClusters = ly.geneBandClusters.slice();
  };

  my.expandAChromosomeCluster= function( chromosome, cluster) {
    ly = chromosome.layout;
    ly.geneBandDisplayClusters = ly.geneBandClusters.slice();

    //add each gene as it's own cluster
    cluster.genesList.forEach( function(gene){
      ly.geneBandDisplayClusters.push(gene) ;
    } );

    //delete the original cluster
    var clusterIndex = ly.geneBandDisplayClusters.indexOf(cluster);
    ly.geneBandDisplayClusters.splice(clusterIndex, 1);
  };

  return my;
}

var GENEMAP = GENEMAP || {};

//Group genes into clusters for display
//y is the yscale
GENEMAP.GeneClusterer = function (userConfig) {
  var my = {};

  var defaultConfig = {nClusters: 6};

  var config = _.merge({}, defaultConfig, userConfig);

  my.createClustersFromGenes = function (genes) {
    var result = [];

    //Return empty list if we have no genes
    if (genes.length < 1) {
      return result;
    }

    //Use precanned algorithm for clustering
    //It return list of lists of midpoints

    var nClusters = Math.min(config.nClusters, genes.length);
    var midpoints = genes.map(function(d){
      return d.midpoint;
    });

    clusterPointsList = ss.ckmeans( midpoints, nClusters);

    //Start with all the clusters empty
    var clusterList = [];
    for (var iclus = 0; iclus < clusterPointsList.length; iclus++) {
      clusterList.push([]);
    }

    //Now we append each gene to the correct cluster
    genes.map(function (gene) {

      //which cluster contains this gene's midpoint?
      iCluster = clusterPointsList.findIndex(function (clusterPoints) {
        return clusterPoints.includes(gene.midpoint)
      });

      clusterList[iCluster].push(gene);
    });

    //loop over clusters and add nodes to the result
    clusterList.map(function (genes) {

      //for small clusters, add individual genes
      if (genes.length < 2) {
        result.push.apply(result, genes);
      }

      //for large clusters, add 1 node to hold all of them
      else {
        var averageMidpoint = genes.reduce(function (sum, current) {
            return sum + current.midpoint;
          }, 0) / genes.length;

        //Generate a unique id by concatenating all the gene ids
        var id = genes.reduce(function (sum, current) {
          return sum + current.id.toString();
        }, "");

        var genesCollection = {
          genesList: genes,
          midpoint: averageMidpoint,
          type: "geneslist",
          id: id.toString()
        };

        result.push(genesCollection);
      }
    });

    return result;
  };

  my.nClusters = function (value) {
    if (!arguments.length) {
      return config.nClusters;
    }

    config.nClusters = value;
    return my;
  }

  return my;
};

var GENEMAP = GENEMAP || {};

GENEMAP.vectorEffectSupport = true;

GENEMAP.Listener = function(val){
  var value = val;
  var listeners = [];

  var my = function(val){
    if (!arguments.length) {
      return value;
    }
    if (val==value) {
      return value;
    }

    value = val;
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
	apiUrl: '/',
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
	    if (event.target !== 'undefined') {
				if (event.target.tagName.toLowerCase() === 'a') {
		    	return;
				}
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
        return /*gene.label*/decodeURIComponent(geneLink.replace(/\+/g, ' ')); }) ; }
    ) );

    var url = config.apiUrl+'/network';
    //console.log("GeneMap: Launch Network for url: "+ url);
    //console.log("selectedLabels: "+ selectedLabels);

    log.info('selected labels: ' + selectedLabels);
    generateCyJSNetwork(url, { list: selectedLabels, keyword: $('#keywords').val() });
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
    
    reader.readXMLData(basemapPath, annotationPath).then(function (data) {
	    my._draw(outerTargetId, data);
    });
  };
  
  my.drawFromRawAnnotationXML = function(outerTargetId, basemapPath, annotationXMLString) {
    var reader = GENEMAP.XmlDataReader();
    
    reader.readXMLDataFromRawAnnotationXML(basemapPath, annotationXMLString).then(function (data) {
    	my._draw(outerTargetId, data);
    });
  };
  
  my._draw = function(outerTargetId, data) {
	  var outerTarget = d3.select(outerTargetId).selectAll('div').data(['genemap-target']);

	  outerTarget.enter()
	    .append('div').attr( 'id', function(d){ return d;});

	  target = d3.select(outerTargetId).select('#genemap-target')[0][0];

	  log.info('drawing genome to target');
	  d3.select(target).datum(data).call(my);
	  my.nGenesToDisplay(config.initialMaxGenes);
	  resetMapZoom();
	  updateLegend(legendSpan, genome);
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

//This function comes from the clusterfck library
//https://github.com/harthur/clusterfck

//Copyright (c) 2011 Heather Arthur <fayearthur@gmail.com>
//
//Permission is hereby granted, free of charge, to any person obtaining
//a copy of this software and associated documentation files (the
//"Software"), to deal in the Software without restriction, including
//without limitation the rights to use, copy, modify, merge, publish,
//  distribute, sublicense, and/or sell copies of the Software, and to
//permit persons to whom the Software is furnished to do so, subject to
//the following conditions:
//
//  The above copyright notice and this permission notice shall be
//included in all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
//LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
//OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
//WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function(exports) {
  var HierarchicalClustering = function (distance, linkage, threshold) {
    this.distance = distance;
    this.linkage = linkage;
    this.threshold = threshold == undefined ? Infinity : threshold;
  }

  HierarchicalClustering.prototype = {
    cluster: function (items, snapshotPeriod, snapshotCb) {
      this.clusters = [];
      this.dists = [];  // distances between each pair of clusters
      this.mins = []; // closest cluster for each cluster
      this.index = []; // keep a hash of all clusters by key

      for (var i = 0; i < items.length; i++) {
        var cluster = {
          value: items[i],
          key: i,
          index: i,
          size: 1
        };
        this.clusters[i] = cluster;
        this.index[i] = cluster;
        this.dists[i] = [];
        this.mins[i] = 0;
      }

      for (var i = 0; i < this.clusters.length; i++) {
        for (var j = 0; j <= i; j++) {
          var dist = (i == j) ? Infinity :
            this.distance(this.clusters[i].value, this.clusters[j].value);
          this.dists[i][j] = dist;
          this.dists[j][i] = dist;

          if (dist < this.dists[i][this.mins[i]]) {
            this.mins[i] = j;
          }
        }
      }

      var merged = this.mergeClosest();
      var i = 0;
      while (merged) {
        if (snapshotCb && (i++ % snapshotPeriod) == 0) {
          snapshotCb(this.clusters);
        }
        merged = this.mergeClosest();
      }

      this.clusters.forEach(function (cluster) {
        // clean up metadata used for clustering
        delete cluster.key;
        delete cluster.index;
      });

      return this.clusters;
    },

    mergeClosest: function () {
      // find two closest clusters from cached mins
      var minKey = 0, min = Infinity;
      for (var i = 0; i < this.clusters.length; i++) {
        var key = this.clusters[i].key,
          dist = this.dists[key][this.mins[key]];
        if (dist < min) {
          minKey = key;
          min = dist;
        }
      }
      if (min >= this.threshold) {
        return false;
      }

      var c1 = this.index[minKey],
        c2 = this.index[this.mins[minKey]];

      // merge two closest clusters
      var merged = {
        left: c1,
        right: c2,
        key: c1.key,
        size: c1.size + c2.size
      };

      this.clusters[c1.index] = merged;
      this.clusters.splice(c2.index, 1);
      this.index[c1.key] = merged;

      // update distances with new merged cluster
      for (var i = 0; i < this.clusters.length; i++) {
        var ci = this.clusters[i];
        var dist;
        if (c1.key == ci.key) {
          dist = Infinity;
        }
        else if (this.linkage == "single") {
          dist = this.dists[c1.key][ci.key];
          if (this.dists[c1.key][ci.key] > this.dists[c2.key][ci.key]) {
            dist = this.dists[c2.key][ci.key];
          }
        }
        else if (this.linkage == "complete") {
          dist = this.dists[c1.key][ci.key];
          if (this.dists[c1.key][ci.key] < this.dists[c2.key][ci.key]) {
            dist = this.dists[c2.key][ci.key];
          }
        }
        else if (this.linkage == "average") {
          dist = (this.dists[c1.key][ci.key] * c1.size
            + this.dists[c2.key][ci.key] * c2.size) / (c1.size + c2.size);
        }
        else {
          dist = this.distance(ci.value, c1.value);
        }

        this.dists[c1.key][ci.key] = this.dists[ci.key][c1.key] = dist;
      }


      // update cached mins
      for (var i = 0; i < this.clusters.length; i++) {
        var key1 = this.clusters[i].key;
        if (this.mins[key1] == c1.key || this.mins[key1] == c2.key) {
          var min = key1;
          for (var j = 0; j < this.clusters.length; j++) {
            var key2 = this.clusters[j].key;
            if (this.dists[key1][key2] < this.dists[key1][min]) {
              min = key2;
            }
          }
          this.mins[key1] = min;
        }
        this.clusters[i].index = i;
      }

      // clean up metadata used for clustering
      delete c1.key;
      delete c2.key;
      delete c1.index;
      delete c2.index;

      return true;
    }
  }

  var hcluster = function (items, distance, linkage, threshold, snapshot, snapshotCallback) {
    linkage = linkage || "average";

    var clusters = (new HierarchicalClustering(distance, linkage, threshold))
      .cluster(items, snapshot, snapshotCallback);

    if (threshold === undefined) {
      return clusters[0]; // all clustered into one
    }
    return clusters;
  }

  exports.hcluster = hcluster;
})(this.hcluster = {});

var GENEMAP = GENEMAP || {};

GENEMAP.MenuBar = function (userConfig) {
  var defaultConfig = {
    onNetworkBtnClick: $.noop,
    onFitBtnClick: $.noop,
    onTagBtnClick: $.noop,
    onLabelBtnClick: $.noop,
    onQtlBtnClick: $.noop,
    onResetBtnClick: $.noop,
    onSetNumberPerRowClick : $.noop,
    onExportBtnClick : $.noop,
    onExportAllBtnClick : $.noop,
    onExpandBtnClick : $.noop,
    maxSnpPValueProperty : $.noop,
    nGenesToDisplayProperty : $.noop,
    annotationLabelSizeProperty : $.noop,
    initialMaxGenes : 200,
    initialNPerRow : 10,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  // the target element that is going to contain the menu buttons
  var target;

  // click handler for the network view button
  var myOnNetworkBtnClick = function () {
    if ($(this).hasClass('disabled')) {
      return;
    }

    config.onNetworkBtnClick();
  };

  var myOnTagBtnClick = function () {
    if ($(this).hasClass('disabled')) {
      return;
    }

    config.onTagBtnClick();
  };

  var myOnFitBtnClick = function () {
    if ($(this).hasClass('disabled')) {
      return;
    }

    config.onFitBtnClick();
  };

  var myOnResetBtnClick = function () {
    if ($(this).hasClass('disabled')) {
      return;
    }

    $('#select-label-btn').selectpicker('val','Auto labels').change();
    $('#select-qtl-btn').selectpicker('val','All QTLs').change();
    config.onResetBtnClick();
  };

  var myOnExpandBtnClick = function () {
    config.onExpandBtnClick();
  }

  var buildDropdown = function(selection, id, data, callback, initialValue){
    var name = 'select-' + id;

    var selectElement = selection.selectAll('select').data([null]);


    selectElement.enter()
      .append('select')
      .attr( {
        'id': name,
        'name':  name,
        'class' : 'menu-dropdown'
      });

    var options = selectElement.selectAll('option').data(data);

    options.enter()
      .append('option')
      .attr('data-token', function(d){
        return d[1];
      })
      .text(function(d){
        return d[0];
      });

    var mySelectPicker = $('#'+name).selectpicker({
      'width' : '130px'
    });

    mySelectPicker.selectpicker('val', initialValue);
    mySelectPicker.selectpicker('refresh');

    mySelectPicker.on('change', function(e){
      var selectedOption = mySelectPicker.find('option:selected');
      var selectedToken = selectedOption.data().token;
      callback(selectedToken);
    });

  }

  var drawMenu = function () {

    var menu = d3.select(target).selectAll('.genemap-menu').data([null]);
    menu.enter().append('div').classed('genemap-menu', true);


    var menuRows = menu.selectAll('span').data( [
        [
          'network-btn',
          'expand-btn',
          'reset-btn',
        ],[
          'label-btn',
          'ngenes-dropdown',
        ],[
          'fit-btn',
          'export-btn',
          'advanced-toggle',
          'help-btn'
        ]
      ])
      .enter()
      .append('span')
      .classed('menu-block', true)

    var menuItems = menuRows.selectAll('span')
      .data(function(d,i){ return d;})
      ;

    menuItems.enter().append('span');
    menuItems.attr({
      class: function (d) {
        return d;
      }
    });

    menu.select('.network-btn')
      .attr( 'title', 'Launch network view')
      .on('click', myOnNetworkBtnClick);

    menu.select('.tag-btn')
      .on('click', myOnTagBtnClick);

    var labelDropdown = menu.select('.label-btn');
    buildDropdown( labelDropdown, 'label-btn', [
        [ 'Auto labels', 'auto'],
        ['Checked labels', 'show'],
        ["No labels", 'hide'] ],
      config.onLabelBtnClick, 'Auto labels');


    menu.select('.fit-btn')
      .attr( 'title', 'Reset pan and zoom')
      .on('click', myOnFitBtnClick);

    menu.select('.reset-btn')
      .attr( 'title', 'Reset selections')
      .on('click', myOnResetBtnClick);

    var dropdownSpan = menu.select('.ngenes-dropdown');
    dropdownSpan.text("");
    buildDropdown( dropdownSpan, 'ngenes-dropdown',
      [
        ['50 genes', 50],
        ['100 genes', 100],
        ['200 genes', 200],
        ['500 genes', 500],
        ['1000 genes', 1000],
      ],
      config.nGenesToDisplayProperty, config.nGenesToDisplayProperty() + ' genes');

    config.nGenesToDisplayProperty.addListener( function(ngenes){
      $('#select-ngenes-dropdown')
        .selectpicker('val', [ngenes + ' genes', ngenes] )
    });

    menu.select('.export-btn')
      .attr( { 'title' : 'Export view to png'})
      .on('click', config.onExportBtnClick);

    menu.select('.expand-btn')
      .attr( 'title', 'Toggle full screen')
      .on('click', myOnExpandBtnClick);

    menu.select('.advanced-toggle')
      .attr( 'title', 'Show advanced options')
      .on('click', function(){
        $('.genemap-advanced-menu').modalPopover('toggle');
      } );

    var helpURL = 'https://github.com/francis-newson-tessella/QTLNetMiner/'
    +'tree/QTLNM-47-MVE/'
    +'common/client/src/main/webapp/html/GeneMap/docs';

    menu.select('.help-btn')
      .attr( { 'title': 'help'})
      .on('click', function(){
        window.open( helpURL, '_blank');
      } );

    var advancedMenu = d3.select(target).selectAll('.genemap-advanced-menu').data([null]);
    popoverDiv = advancedMenu.enter()
      .append('div')
      .classed('genemap-advanced-menu', true)
      .classed('popover', true)

    popoverDiv.append('div')
      .attr( {'class' : 'arrow'})

    popoverHeading = popoverDiv.append('h3')
      .attr( {'class' : 'popover-title'}).text('Advanced options');

    popoverHeading
      .append('button')
      .attr( {'class' : 'close'})
    .on('click', function() {
      $('.genemap-advanced-menu').modalPopover('toggle');
    })
    .append('span')
     .html('&times')

    popoverDiv
      .append('div')
      .classed('popover-content', true)

    var advancedMenuItems = advancedMenu.select('.popover-content').selectAll('div').data(
      [
        'qtl-btn',
        'nperrow-spinner',
        'max-snp-pvalue',
        'labelsize',
        'export-all-btn',
      ] );

    advancedMenuItems.enter()
      .append('div')
      .attr( 'class', function(d){return d;});

    // QTL DROPDOWN

    var qtlDropdown = advancedMenu.select('.qtl-btn');
    buildDropdown( qtlDropdown, 'qtl-btn', [
        [ 'All QTLs', 'all'],
        ['Checked QTLs', 'selected'],
        ["No QTLs", 'none'] ],
      config.onQtlBtnClick, 'All QTLs');

    //PVALUE INPUT

    var pvalueSpans = advancedMenu.select('.max-snp-pvalue')
      .selectAll('form').data(['']).enter();

    var pvalueForm = pvalueSpans.append('form')
      .classed('bootstrap', true)
      .attr({
        'id': 'snp-pvalue-form',
        'class': 'bootstrap form-inline'
      });

    pvalueForm
      .append('label').attr({
      'id': 'max-snp-pvalue-text',
      'for' : 'max-snp-pvalue-input',
    })
      .html('Max SNP p-value:&nbsp');

    pvalueForm
      .append('input').attr({
      'class' : 'form-control',
      'id': 'max-snp-pvalue-input',
      'type': 'text',
      'value': config.maxSnpPValueProperty(),
    });

    pvalueForm
      .append('button')
      .attr({
        'class' : 'btn btn-default',
        'type' : 'submit'})
      .text('Set');

      $('#snp-pvalue-form').submit( function(e){
        config.maxSnpPValueProperty($('#max-snp-pvalue-input').val());
        e.preventDefault();
      });

    config.maxSnpPValueProperty.addListener( function(value){
      $('#max-snp-pvalue-input').val(value);
    });

    //N PER ROW SPINNER
    var spinnerSpan = advancedMenu.select('.nperrow-spinner')
    var enterSpinner = spinnerSpan.selectAll('input').data(['nPerRowSpinner']).enter();

    enterSpinner
      .append('span')
      .append('label').classed('bootstrap', true)
      .attr( { for : function(d){return d}, })
      .html('Num per row:&nbsp;');

    enterSpinner
      .append('span')
      .append( 'input')
      .attr({
        id: function(d){return d},
        type: 'text',
        value: config.initialNPerRow,
        name: function(d){return d},
      });

    var spinner = spinnerSpan.select('input');
    var $spinner = $(spinner);

    $spinner.TouchSpin({
      min: 1,
      max: 20,
      step: 1,
    });

    d3.select('.nperrow-spinner').select('.input-group').style({
      width : '8em',
      display: 'inline-table'
    })

    $('#nPerRowSpinner').on('change', function(event){
      config.onSetNumberPerRowClick( $('#nPerRowSpinner').val());
    });

    advancedMenu.select('.export-all-btn')
      .attr( { 'title' : 'export all to png'})
      .on('click', config.onExportAllBtnClick);

    advancedMenu.select('.labelsize').selectAll('span')
      .data(['labelsize-label', 'labelsize-dropdown'])
      .enter()
      .append('span')
      .attr( {'class': function(d){return d;} });

    advancedMenu.select('.labelsize-label')
      .classed( 'bootstrap', true);

    advancedMenu.select('.labelsize-label').selectAll('label').data([''])
      .enter()
      .append('label')
      .text('Label size:');

    var labelSizeDropdown = advancedMenu.select('.labelsize-dropdown');
    labelSizeDropdown.text("");
    buildDropdown( labelSizeDropdown, 'labelsize-dropdown',
      [
        ['10', 10],
        ['15', 15],
        ['20', 20],
        ['25', 25],
      ],
      config.annotationLabelSizeProperty, config.annotationLabelSizeProperty());

    config.annotationLabelSizeProperty.addListener( function(labelSize){
      $('#select-labelsize-dropdown')
        .selectpicker('val', [labelSize, labelSize] );
    });

    //ACTIVATE POPOVER
    $('.genemap-advanced-menu').modalPopover( {
      target: $('.advanced-toggle'),
      parent: $('.advanced-toggle'),
      'modal-position': 'relative',
      placement: "bottom",
      boundingSize: config.drawing,
    });

  }

  // attach the menu bar to the target element
  function my(selection) {
    selection.each(function (d) {
      var _this = this;

      target = _this;

      // draw the map SVG
      drawMenu();
    });
  }

  my.onNetworkBtnClick = function (value) {
    if (!arguments.length) {
      return config.onNetworkBtnClick;
    }

    config.onNetworkBtnClick = value;
    return my;
  };

  my.onTagBtnClick = function (value) {
    if (!arguments.length) {
      return config.onTagBtnClick;
    }

    config.onTagBtnClick = value;
    return my;
  };

  my.onLabelBtnClick = function (value) {
    if (!arguments.length) {
      return config.onLabelBtnClick;
    }

    config.onLabelBtnClick = value;
    return my;
  };

  my.onQtlBtnClick = function (value) {
    if (!arguments.length) {
      return config.onQtlBtnClick;
    }

    config.onQtlBtnClick = value;
    return my;
  };

  my.onFitBtnClick = function (value) {
    if (!arguments.length) {
      return config.onFitBtnClick;
    }

    config.onFitBtnClick = value;
    return my;
  };

  my.onResetBtnClick = function (value) {
    if (!arguments.length) {
      return config.onResetBtnClick;
    }

    config.onResetBtnClick = value;
    return my;
  };

  my.onSetNumberPerRowClick = function (value) {
    if (!arguments.length) {
      return config.onSetNumberPerRowClick;
    }

    config.onSetNumberPerRowClick = value;
    return my;
  };

  my.initialMaxGenes = function (value) {
    if (!arguments.length) {
      return config.initialMaxGenes;
    }

    config.initialMaxGenes = value;
    return my;
  }

  my.initialNPerRow = function (value) {
    if (!arguments.length) {
      return config.initialNPerRow;
    }

    config.initialNPerRow = value;
    return my;
  }

  my.onExportBtnClick = function (value) {
    if (!arguments.length) {
      return config.onExportBtnClick;
    }

    config.onExportBtnClick = value;
    return my;
  }

  my.onExportAllBtnClick = function (value) {
    if (!arguments.length) {
      return config.onExportAllBtnClick;
    }

    config.onExportAllBtnClick = value;
    return my;
  }

  my.onExpandBtnClick = function (value) {
    if (!arguments.length) {
      return config.onExpandBtnClick;
    }

    config.onExpandBtnClick = value;
    return my;
  }


  my.maxSnpPValueProperty = function (value) {
    if (!arguments.length) {
      return config.maxSnpPValueProperty;
    }

    config.maxSnpPValueProperty = value;
    return my;
  }

  my.nGenesToDisplayProperty = function (value) {
    if (!arguments.length) {
      return config.nGenesToDisplayProperty;
    }

    config.nGenesToDisplayProperty = value;
    return my;
  }

  my.annotationLabelSizeProperty = function (value) {
    if (!arguments.length) {
      return config.annotationLabelSizeProperty;
    }

    config.annotationLabelSizeProperty = value;
    return my;
  }

  // sets the tag button state to the specified value
  // value should be 'show', 'hide', 'auto' or 'manual'
  my.setTabButtonState = function (value) {
    var btn = d3.select(target).select('.tag-btn');
    if (value === 'show') {
      btn.classed('show-label', true);
      btn.classed('hide-label', false);
      btn.classed('auto-label', false);
      btn.classed('manual-label', false);
      btn.attr('title', 'Show Labels');

    } else if (value === 'hide') {
      btn.classed('show-label', false);
      btn.classed('hide-label', true);
      btn.classed('auto-label', false);
      btn.classed('manual-label', false);
      btn.attr('title', 'Hide Labels');
    } else if (value === 'manual') {
      btn.classed('show-label', false);
      btn.classed('hide-label', false);
      btn.classed('auto-label', false);
      btn.classed('manual-label', true);
      btn.attr('title', 'Manual Labels');
    } else {
      btn.classed('show-label', false);
      btn.classed('hide-label', false);
      btn.classed('auto-label', true);
      btn.classed('manual-label', false);
      btn.attr('title', 'Automatic Labels');
    }
  };

  my.getTagButtonState = function () {
    var btn = d3.select(target).select('.tag-btn');

    if (btn.classed('show-label')) {
      return 'show';
    } else if (btn.classed('hide-label')) {
      return 'hide';
    } else if (btn.classed('auto-label')) {
      return 'auto';
    } else {
      return 'manual';
    }
  };

  // sets the enabled state of the fit button
  my.setFitButtonEnabled = function (value) {
    d3.select(target).select('.fit-btn').classed('disabled', !value);
  };

  my.setNetworkButtonEnabled = function (value) {
    d3.select(target).select('.network-btn').classed('disabled', !value);
  };


  return my;
};

var GENEMAP = GENEMAP || {};

// takes a list of qtl annotations and combines annotations with the same start and
// end points
GENEMAP.QTLAnnotationCombiner = function () {

  return {
    combineSimilarQTLAnnotations: function (qtlAnnotations) {

      var result = [];
      var hash = {};

      qtlAnnotations.forEach(function (qtl) {
        var key = qtl.start + '-' + qtl.end;

        if (!hash.hasOwnProperty(key)) {
          hash[key] = [];
        }

        hash[key].push(qtl);
      });

      _.forEach(hash, function (value, key) {

        var qtlCollection = {
          qtlList: value,
          count : value.length,
          start: value[0].start,
          midpoint: value[0].midpoint,
          end: value[0].end,
          type: "qtllist",
          id: key,
        };
        result.push(qtlCollection);
      });

      return result;
    },
  };
};

var GENEMAP = GENEMAP || {};

GENEMAP.QtlAnnotations = function (userConfig) {
  var defaultConfig = {
    border: false,
    onAnnotationSelectFunction: $.noop(),
    longestChromosome: 100,
    layout: {
      width: 10,
      height: 100,
      x: 0,
      y: 0,
    },
    bandWidthPercentage: 1 / 8,
    gapPercentage: 1 / 15,
    chromosomeWidth: 20,
    annotationMarkerSize: 5,
    annotationLabelSize: 5,
    showAnnotationLabels: true,
    maxSnpPValue: 1.0,
    drawing: null,
    scale:1,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var buildYScale = function () {
    return d3.scale.linear().range([0, config.layout.height]).domain([0, config.longestChromosome]);
  };

  var leftRoundedRect = function (start, end, x, width, radius ){
    if ( (end - start) < width){
      return "M" + x  + "," + start
        + "h" + -width
        + "v" + (end - start)
        + "h" + width
        +  "z";
    }
    else {
      return "M" + x + "," + start
        + "h" + (radius - width)
        + "a" + radius + " " + radius + " 0 0 0" + -radius + " " + radius
        + "v" + (end - start - 2 * radius)
        + "a" + radius + "," + radius + " 0 0 0" + radius + "," + radius
        + "h" + (width - radius)
        + "z";
    }
  };

  var setupSNPAnnotations = function (annotationsGroup, chromosome, snps, traits) {
    //--SNPS------------------------------

   //Generate an index for each trait
    var traitPos = {};
    traits.map( function(trait, index){
      traitPos[trait] = index;
    });

    var y = buildYScale();

    var snpsAnnotations = annotationsGroup.selectAll('rect.snp-annotation').data(snps, function(d){
      return d.id});

    var snpThickness =  4;
    var snpX = function(d) { return config.layout.width - 0.2 * config.layout.chromosomeWidth * (1 + traitPos[d.trait])};
    var snpY = function(d){ return y(d.midpoint) - 0.5 *  Math.max(snpThickness / config.scale, y(10));}
    var snpHeight = Math.max( snpThickness / config.scale, y(10));
    var snpWidth = 0.2 * config.layout.chromosomeWidth;

    snpsAnnotations
      .attr({
        x: snpX,
        y: snpY,
        width: snpWidth,
        height: snpHeight,
      });

    function rgb( r, g, b){
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    snpsAnnotations.enter()
      .append( 'rect')
      .attr( {
        fill: function(d){ return d.color; },
        opacity: function(d){return  d.importance},
        class: 'snp-annotation',
        x: snpX,
        y: snpY,
        width: snpWidth,
        height: snpHeight,
      });

    snpsAnnotations.exit().remove();

    //POPOVER HANDLING

    snpsAnnotations
      .on('contextmenu', function(d){
        log.trace('SNP Context Menu');

        var popover = d3.select( '#clusterPopover');
        popover.attr( 'class', 'popover');

        //CLEAR ALL
        var popoverTitle = popover.select('.popover-title');
        popoverTitle.selectAll('*').remove();
        popoverTitle.text("");

        var popoverContentElement = popover.select('.popover-content');
        popoverContentElement.selectAll('*').remove();
        popoverContentElement.text("");

        //POPOVER TITLE
        popoverTitle
          .append('span')
          .text( 'SNP: ')

        popoverTitle
          .append('a')
          .attr('href', d.link)
          .text(d.label)
        ;

        //POPOVER CONTENT

        var popoverContent = popoverContentElement
          .selectAll('p').data([
            ['Chromsome ' + chromosome.number , d.midpoint],
            ['p-value', Number(d.pvalue).toExponential()],
            ['Trait', d.trait],
          ]);

        var popoverContentEnter = popoverContent.enter();

        popoverContentEnter
          .append('p')
          .classed( 'popover-annotation', true)
          .text(function(d){
            return d[0]  + ': ' + d[1]
          });

        //Apply the boostrap popover function
        $clusterPopover = $('#clusterPopover');

        $clusterPopover
          .modalPopover( {
            target: $(this),
            $parent: $(this),
            'modal-position': 'body',
            placement: "left",
            boundingSize: config.drawing,
          });

        $clusterPopover
          .modalPopover('show');

        $clusterPopover
          .on('mousedown mousewheel', function(event){
            log.info('popover click');
            event.stopPropagation();
          });
      });
  }

  var setupQTLAnnotations = function (annotationsGroup, chromosome, nSnpsTraits) {

    var tranSpeed = 500;
    var y = buildYScale();
    var xEnd = config.layout.width;

    var bandWidth = 0.3 * config.layout.chromosomeWidth ;
    var gap = 0.4 * config.layout.chromosomeWidth ;

    var labelsToDisplay = chromosome.layout.qtlNodes.some( function(node){
        return node.displayLabel;
    });

    if (labelsToDisplay) {
      gap = gap * 1.5 ;
    }

    var snpsOffset = nSnpsTraits * 0.2 * config.layout.chromosomeWidth;

    var xLabel = function (d) {
      return config.layout.width - (d.labelPosition ) * (gap + bandWidth) - snpsOffset;
    };

    var xStart = function (d) {
      return config.layout.width - d.position * (gap + bandWidth) - snpsOffset;
    };



    //--BOXES-----------------------------
    //Here we handle the actual rectangles but not the labels

    // Enter + Update elements
    var qtlAnnotations = annotationsGroup.selectAll('g.qtl-annotation').data(chromosome.layout.qtlNodes, function(d){
      return d.id});

    // setup the new annotations
    var qtlAnnotationsEnterGroup = qtlAnnotations.enter()
      .append('g').classed('qtl-annotation infobox', true);

    qtlAnnotationsEnterGroup.append('rect').classed('qtl-hoverbox', true);
    var qtlSelector = qtlAnnotationsEnterGroup.append('rect').classed('qtl-selector infobox', true);

    var oldNodes = {};
    var newNodes = {};

    qtlAnnotations.exit().select('rect').each(function (d) {
      oldNodes[d.index] = _.pick(this, ['x', 'y', 'width', 'height']);
      oldNodes[d.index].midpoint = d.midpoint;
      oldNodes[d.index].position = d.position;
    });

    qtlSelector.each(function (d) {
      newNodes[d.index] = _.pick(this, ['x', 'y', 'width', 'height']);
      newNodes[d.index].midpoint = d.midpoint;
      newNodes[d.index].position = d.position;
    });

    var chooser = function(dict, index, key, fallThrough){
      if (_.has(dict, index)){
        return dict[index][key].animVal.value;
      }
      else{
        return fallThrough;
      }
    }

    qtlSelector.attr({
      x: function (d) {
        return chooser( oldNodes, d.parentIndex, 'x', xStart(d))
      },
      y: function (d) {
        return chooser( oldNodes, d.parentIndex, 'y', y(d.start))
      },
      width: bandWidth,

      height: function (d) {
        return chooser( oldNodes, d.parentIndex, 'height', y(d.end) - y(d.start))
        }
    });

    //Apply attributes to all elements

    qtlAnnotations.attr('id', function (d) {
      return 'feature_' + d.id;
    });

    qtlAnnotations.select('rect.qtl-hoverbox').attr({
      x: function(d) { return xStart(d)},
      y: function (d) { return y(d.start);},
      width: function(d) { return  d.position * (gap + bandWidth) + config.chromosomeWidth + snpsOffset; },
      height: function(d){ return y(d.end) -y (d.start)} ,
      fill: function(d){ return d.color; },
      visibility: function(d){return d.hover ? 'visible' : 'hidden' },
    })

    //qtlAnnotations.select('path.qtl-selector')
    //  .attr({
    //    d: function(d){ return leftRoundedRect(
    //      y(d.start),
    //      y(d.end),
    //      xStart(d)+bandWidth,
    //      bandWidth,
    //      0 //for rounded edges, use: 0.4 * bandWidth,
    //    ) },
    //    fill: function (d) { return d.color; },
    //  } )

    qtlAnnotations.select('rect.qtl-selector').transition().duration(tranSpeed)
      .attr({
        x: xStart,
        y: function (d) { return y(d.start); },
        width: bandWidth,
        height: function (d) { return y(d.end) - y(d.start); }
      });


    qtlAnnotations.select('rect.qtl-selector')
      .style({
        fill: function (d) { return d.color; },
      }) ;


    debugQtlLableBoxes = false;

    if( debugQtlLableBoxes) { //Rectanges to check size of labels
      qtlAnnotations.select('rect.test')
        .attr({
            x: function (d) {
              return d.displayLabel ? xLabel(d) : 0
            },
            y: function (d) {
              return d.displayLabel
                ? y(d.midpoint) - 0.6 * d.screenLabel.length * config.annotationLabelSize / 2
                : 0
            },
            width: function (d) {
              return bandWidth
            },
            height: function (d) {
              return d.displayLabel
                ? 0.6 * d.screenLabel.length * config.annotationLabelSize
                : 0
            },
            fill: function (d) {
              return 'pink'
            }
          }
        );
    }

    qtlAnnotations.exit().select('rect')
      .transition().duration(tranSpeed)
      .attr({
      x: function (d) {
        return chooser( newNodes, d.parentIndex, 'x', xStart(d))
      },
      y: function (d) {
        return chooser( newNodes, d.parentIndex, 'y', y(d.start))
      },

      width: bandWidth,

      height: function (d) {
        return chooser( newNodes, d.parentIndex, 'height', y(d.end) - y(d.start))
      }
    })
      .remove()
    ;

    qtlAnnotations.exit().remove();

    //--COUNTS--------------------
    //The little circles with the number of QTLs in a cluster

    var textYPos = function (d) {
      return y(d.midpoint);
    };

    var labelVisibility = function (d) {
      if (d.displayLabel === 'show') {
        return 'visible';
      } else if (d.displayLabel === 'hide') {
        return 'hidden';
      }
      //return config.showAnnotationLabels ? 'visible' : 'hidden';
      return true;
    };


    var qtlCountParentGroup = qtlAnnotationsEnterGroup
      .append('g').classed('qtl-count-group', true);

    var qtlCountAnnotations = qtlAnnotations.select('g.qtl-count-group')
      .selectAll('g.qtllist').data( function(d){
        //Only need to display count if we have a qtllist
        //If it's just a single qtl then don't connect any data
        var data =   (d.type == 'qtllist' ? [d] : []);
        return data;
      }, function (d){ return 'label_' + d.id });


    var qtlCountParentEnterGroup = qtlCountAnnotations.enter();
    var qtlCountGroup = qtlCountParentEnterGroup
      .append('g').classed( 'qtllist', true);
    qtlCountGroup.append('circle').classed('qtl-count', true);
    qtlCountGroup.append('text').classed('qtl-count', true);

    qtlCountParentGroup
      .each( function(d){
        if (_.has(newNodes, d.index)){

          if (_.has(oldNodes, d.parentIndex)){

            oldNode = oldNodes[d.parentIndex];

            var oldXStart = config.layout.width - oldNode.position * (gap+bandWidth);
            var oldTextYPos = y(oldNode.midpoint);

            d3.select(this).attr({
              transform:
                "translate(" + (oldXStart + 0.5*bandWidth) + "," + oldTextYPos + ")"
            });
          }
          else {
            d3.select(this).attr({
              transform: function(d) {
                if (d) {
                  return "translate(" + (xStart(d) + 0.5 * bandWidth) + "," + textYPos(d) + ")"
                } else {
                  return "translate(0,0)"
                }
              }
            });
          }
        }
      });

    //Apply transform to group containing text and circular background
    //Then we can easily center text and circle
    qtlAnnotations.select( 'g.qtl-count-group')
      .transition().duration(tranSpeed)
      .attr({
      transform: function(d){
        if (d){
          return "translate(" + (xStart(d) + 0.5*bandWidth) + "," + textYPos(d) + ")"
        } else {
          return "translate(0,0)"
        }
      }});


    qtlAnnotations.select( 'circle.qtl-count')
      .attr({
        cx: 0,
        cy: 0,
        r: bandWidth + 'px' ,
      }).style({
        visibility: 'visible',
        fill: function (d) { return d.color; },
      })
      .attr( {'id' : function(d){ return d.id} })
    ;

    var circleFontSize = Math.min( Math.max( 10 / config.scale,bandWidth ), 14 / config.scale )

    qtlAnnotations.select('text.qtl-count').attr({
      x: 0,
      y: 0,
      dy: "0.3em",
      "text-anchor": "middle"
    }).style({
        'fill': "white",
        'font-size': circleFontSize + 'px',
        'visibility': (circleFontSize < 2 * bandWidth) ? 'visible' : 'hidden',
      })
      .text(function (d) {
        return d.count;
      });


    qtlCountAnnotations.exit().remove();

    //--LABELS--------------------
    //The labels shown vertically along the qtl

     qtlAnnotationsEnterGroup.append('g').classed('qtl-label-group', true);

    var qtlLabelAnnotations = qtlAnnotations
      .select('g.qtl-label-group').selectAll('g.qtl').data( function(d){
      //Only join the data if displayLabel is true
      var data =   (d.displayLabel ? [d] : []);
      return data
    }, function (d){ return 'label_' + d.id });

    qtlLabelAnnotations
      .exit().remove();

    qtlLabelAnnotations
      .transition().duration(tranSpeed)
      .attr({
        transform: function(d){
          return "translate(" + (xLabel(d) + 0.5*bandWidth) + "," + textYPos(d) + ")";
        }});

    var qtlLabelAnnotationsEnterGroup = qtlLabelAnnotations.enter();

    var qtlLabelGroup = qtlLabelAnnotationsEnterGroup
      .append('g').classed( 'qtl', true)
      .attr({
        transform: function(d){
          return "translate(" + (xLabel(d) + 0.5*bandWidth) + "," + textYPos(d) + ")";
        }});

    qtlLabelGroup
      .append('text')
      .classed('qtl-label', true);

    qtlAnnotations.select('text.qtl-label')
      .attr({
        x: 0,
        y: 0,
        dy: "0.3em",
        "text-anchor": "middle"
      })
      .style({
        'font-size':  function(d){ return d.fontSize + 'px';}
      })
      .attr( {
        'transform' : 'rotate(270)',
        visibility: labelVisibility,
      })
      .text(function (d) {
        return d.screenLabel;
      });


    //MOUSEOVER HANDLING

    var attachMouseOver = function(selection){
      selection
        .on('mouseenter', function(d) {
          d.hover = true;
          setupQTLAnnotations(annotationsGroup, chromosome, nSnpsTraits);
        })
        .on('mouseout', function(d) {
          d.hover = false;
          setupQTLAnnotations(annotationsGroup, chromosome, nSnpsTraits);
        })
        .on('click', function(d){
          d.hover = !d.hover;
          setupQTLAnnotations(annotationsGroup, chromosome, nSnpsTraits);
        });
    };

    attachMouseOver( qtlAnnotations.select('rect.qtl-selector'));
    attachMouseOver( qtlAnnotations.select('circle.qtl-count'));
    attachMouseOver( qtlAnnotations.select('text.qtl-count'));

    //POPOVER HANDLING

    qtlAnnotations
      .on('contextmenu', function(d){
        log.trace('Gene Annotation Context Menu');


        var popover = d3.select( '#clusterPopover');
        popover.attr( 'class', 'popover');

        //POPOVER TITLE
        var popoverTitle = popover.select('.popover-title');

        //Clear existing content
        popoverTitle.selectAll('*')
          .remove();

        popoverTitle
          .text("");

        popoverTitle
          .text( 'Chromosome ' + d.chromosome + ': '
            + d.start + '-' + d.end);

        //Repaint the div so that the popover
        // code gets the correct dimensions
        $.fn.redraw = function(){
          return $(this).each(function(){
            var redraw = this.offsetHeight;
          });
        };

        //POPOVER CONTENT
        popoverContent = popover.select('.popover-content');

        //Clear existing content
        popoverContent .selectAll('*')
          .remove();

        popoverContent.text("");

        var popoverContent = popover.select('.popover-content')
          .selectAll('p').data(
            //Either bind a single qtl or a list of qtls
            (d.type == 'qtllist' ? d.qtlList :[d] )
          );

        var popoverContentEnter = popoverContent.enter();

        popoverContentEnter
          .append('p')
          .classed( 'popover-annotation', true)

        var label = popoverContent
          .append('div')
          .attr( {'class' : 'checkbox'})
          .append('label');

        //Labels in the popover can be clicked to toggle selection
        label
          .append('input')
          .attr({
            'type' : 'checkbox',
            'value' : '',
          })
          .property(
            'checked', function(d){
              return d.selected })
          .on(
            'click', function(d){
            d.selected = !d.selected;
            popoverContent.classed(
              'selected', function(d){return d.selected});
              config.onAnnotationSelectFunction();
          })
        ;

        label
          .append('a')
          .attr(
            {"href": function(d){
              return d.link;},"target": "_blank"
            })
          .text(function(d){return d.label;} );

        popoverContent
          .classed( 'selected', function(d){
            return d.selected});


        //Apply the boostrap popover function

        $clusterPopover = $('#clusterPopover');

        $clusterPopover
          .modalPopover( {
          target: $(this),
          $parent: $(this).find('rect'),
          'modal-position': 'body',
          placement: "left",
          boundingSize: config.drawing,
        });

        $clusterPopover
          .modalPopover('show');

        $clusterPopover
          .on('mousedown mousewheel', function(event){
          log.info('popover click');
          event.stopPropagation();
        });
      });

  };

  // draw a border around the annotation target element
  var drawBorder = function (group) {

    // create the border element if it doesn't exist
    if (group.select('rect.border').empty()) {
      group.append('rect').classed('border', true);
    }

    group.select('rect.border')
      .attr({
        width: config.layout.width,
        height: config.layout.height,
      });
  };

  var getSnpsTraits = function (snps){
    // Get list of unique traits
    var traitSet  = new Set();
    snps.map( function(snp){
      traitSet.add(snp.trait);
    });

    var traits = Array.from(traitSet).sort();
    return traits;
  }


  // An SVG representation of a chromosome with banding data. This won't create an SVG
  // element, it expects that to already have been created.
  function my(selection) {
    selection.each(function (d) {

      //Do some processing of the SNPs to work out how much space we need
      var snps = d.annotations.snps.filter( function(d){
        return !( d.pvalue > config.maxSnpPValue);
      });

      var snpsTraits = getSnpsTraits(snps);

      //QTLs
      var qtlAnnotationGroup = d3.select(this).selectAll('.qtl-annotations').data([d]);

      qtlAnnotationGroup.enter()
        .append('g').attr('class', 'qtl-annotations');

      qtlAnnotationGroup.attr({
        transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
      });

      setupQTLAnnotations(qtlAnnotationGroup, d, snpsTraits.length);

      if (config.border) {
        drawBorder(qtlAnnotationGroup);
      }

      //SNPs
      qtlAnnotationGroup.exit().remove();

      var snpAnnotationGroup = d3.select(this).selectAll('.snp-annotations').data([d]);

      snpAnnotationGroup.enter()
        .append('g').attr('class', 'snp-annotations');

      snpAnnotationGroup.attr({
        transform: 'translate(' + config.layout.x + ',' + config.layout.y + ')',
      });

      setupSNPAnnotations(snpAnnotationGroup, d, snps, snpsTraits);

      snpAnnotationGroup.exit().remove();
    });
  }

  my.onAnnotationSelectFunction = function (value) {
    if (!arguments.length) {
      return config.onAnnotationSelectFunction;
    }

    config.onAnnotationSelectFunction = value;
    return my;
  };

  my.layout = function (value) {
    if (!arguments.length) {
      return config.layout;
    }

    config.layout = value;
    return my;
  };

  my.drawing = function (value) {
    if (!arguments.length) {
      return config.drawing;
    }

    config.drawing = value;
    return my;
  };

  my.longestChromosome = function (value) {
    if (!arguments.length) {
      return config.longestChromosome;
    }

    config.longestChromosome = value;
    return my;
  };

  my.chromosomeWidth = function (value) {
    if (!arguments.length) {
      return config.chromosomeWidth;
    }

    config.chromosomeWidth = value;
    return my;
  };

  my.annotationLabelSize = function (value) {
    if (!arguments.length) {
      return config.annotationLabelSize;
    }

    config.annotationLabelSize = value;
    return my;
  };

  my.annotationMarkerSize = function (value) {
    if (!arguments.length) {
      return config.annotationMarkerSize;
    }

    config.annotationMarkerSize = value;
    return my;
  };

  my.showAnnotationLabels = function (value) {
    if (!arguments.length) {
      return config.showAnnotationLabels;
    }

    config.showAnnotationLabels = value;
    return my;
  };

  my.maxSnpPValue = function (value) {
    if (!arguments.length) {
      return config.maxSnpPValue;
    }

    config.maxSnpPValue = value;
    return my;
  };

  my.infoBoxManager = function (value) {
    if (!arguments.length) {
      return config.infoBoxManager;
    }

    config.infoBoxManager = value;
    return my;
  };

  my.scale = function (value) {
    if (!arguments.length) {
      return config.scale;
    }

    config.scale = value;
    return my;
  };

  return my;
};

var GENEMAP = GENEMAP || {};

GENEMAP.QTLAnnotationLayout = function (userConfig) {

  var defaultConfig = {
    scale: 1,
    longestChromosome: 1000,
    showAllQTLs: true,
    showSelectedQTLs: true,
    showAutoQTLLabels: true,
    showSelectedQTLLabels: true,
    annotationLabelSize: 5,
  };
  var config = _.merge({}, defaultConfig, userConfig);

  var positioner = GENEMAP.QtlPositioner();

  var buildYScale = function () {
    return d3.scale.linear()
      .range([0, config.layout.height])
      .domain([0, config.longestChromosome]);
  };

  var generateNodesFromClusters = function(clusters) {
    return clusters.map( function(c){
      var qtlList = flattenCluster(c);
      var start = qtlList.reduce( function(min, c){
        return Math.min( min, c.start);
      }, Infinity);

      var end = qtlList.reduce( function(max, c){
        return Math.max( max, c.end);
      },0 );

      var id = qtlList.reduce( function(id, c){
        return id + (id ?  '|' : '')  + c.start + '-' + c.end;
      }, "");

      var midpoint = (start + end ) / 2;

      if ( qtlList.length == 1){
        var result =  qtlList[0];
        result.type = 'qtl'
        result.index =  c.index;
        result.parentIndex =  c.parentIndex;
      }
      else {
        var result = {
          cluster: c,
          index: c.index,
          parentIndex: c.parentIndex,
          qtlList: qtlList,
          color: qtlList[0].color,
          count: qtlList.length,
          start: start,
          end: end,
          midpoint: midpoint,
          chromosome: qtlList[0].chromosome,
          type: "qtllist",
          id: id
        }
      }
      return result;
    });

  }

  var clusterQTLs = function(chromosome){

    var nodes = []

    if (config.showAllQTLs ) {

      chromosome.layout.qtlDisplayClusters = chromosome.layout.qtlClusters.slice();
      var clusters = chromosome.layout.qtlDisplayClusters;

      var nLevels = Math.ceil(Math.floor(config.scale - 0.1) / 2);

      while ( nLevels -- ) {
        clusters  = openClusters( clusters);
      }

      var nClusters = clusters.length;

      while (true) {
        nodes = generateNodesFromClusters( clusters);
        nodes = positioner.sortQTLAnnotations(nodes);
        var maxPosition = nodes.reduce( function(cur, node){
          return Math.max(cur, node.position);}, 0);

        if ( maxPosition < 2 ){
          clusters = openClusters(clusters);
          if ( nClusters == clusters.length){
            break;
          }
          nClusters = clusters.length;
        }
        else{
          break;
        }
      }
    }

    else if ( config.showSelectedQTLs) {
      chromosome.layout.qtlDisplayClusters = chromosome.annotations.qtls
        .filter( function(d){return d.selected});

      var clusters = chromosome.layout.qtlDisplayClusters;

      var nodes = clusters.map( function(d){
        result = d;
        result.type = 'qtl';
        return result;
      });
    }

    return nodes;
  }

  var autoDisplayLabels = function(nodes){

    log.trace('Do label layout');
    //Layout qtl labels

    //look at each line of labels separately
    var columns = _.groupBy(nodes, 'position' );
    _.forOwn( columns,  function ( column, key){

      log.trace( '-Col ', key);
      log.trace('positions ', column.map(function(node){return node.position }));

      var fontsize =  14 / config.scale;
      var yscale = buildYScale();

      //Position the QTL labels
      column = positioner.sortQTLLabels(column, yscale, fontsize);

      var maxLabelPosition = column.reduce( function(cur, node){
        return Math.max(node.labelPosition, cur);
      }, 0 );

      log.trace('labelPositions ', column.map(function(node){return node.labelPosition }));
      log.trace('maxLabelPosition', maxLabelPosition);



      //STRATEGY 1 - if there is more than one lane of labels,
      //show only the first lane
      column.forEach( function(node){
        if( node.labelPosition > 1){
          node.displayLabel = false;
       }
        else{
          node.displayLabel = true;
          node.labelPosition = node.position + 0.4;
        }
      });

      //STRATEGY 2 - if there is more than one lane of labels,
      //don't show any labels

      //if (maxLabelPosition > 1){
      //  column.forEach( function(node){
      //    node.displayLabel = false;
      //  });
      //}
      //else{
      //  column.forEach( function(node){
      //    node.labelPosition = node.position + 0.4;
      //    node.displayLabel = true;
      //  });
      //}

      log.trace('labelPositions', column.map(function(node){return node.labelPosition }));
    });

    return nodes;
  }


  var generateChromosomeLayout = function(chromosome){

    log.trace('---START---')

    //Get clustered QTLs
    var nodes = clusterQTLs(chromosome);

    nodes.forEach( function(node){
      node.displayLabel = false;
    });

    //qtllist nodes never display labels
    var qtlNodes = nodes.filter( function(node){
      return node.type == 'qtl'
    });

    if ( config.showAutoQTLLabels ){

      //Position QTL annotations ignoring labels
      nodes =  positioner.sortQTLAnnotations(nodes);

      var maxPosition = nodes.reduce( function(cur, node){
        return Math.max(cur, node.position);}, 0);

      log.trace('maxPosition', maxPosition);

      qtlNodes.forEach( function(node){
        if ( node.label.length > 15 ){
        node.screenLabel = node.label.substring(0, 12) + '...'
        }
        else{
          node.screenLabel = node.label;
        }
      });

      //If there aren't too many lanes of QTLs,
      //then try displaying some labels automatically

      var fontSize = 14 / config.scale;
      var fontTooBig = fontSize > 0.6 * config.layout.chromosomeWidth;
      var tooManyLanes = maxPosition > 3;

      if ( (!tooManyLanes) && (!fontTooBig)) {
        autoDisplayLabels(qtlNodes);
        qtlNodes.forEach( function(node){
          node.fontSize = fontSize;
        });
      }
      else {
        qtlNodes.forEach( function(node){
          node.displayLabel = false;
        })
      }

    }

    if (config.showSelectedQTLLabels && !config.showAutoQTLLabels ){
      var displayNodes = nodes.filter( function(node){
        return node.selected;
      });

      var fontSize = 14 / config.scale;
      var bandWidth =  0.3 * config.layout.chromosomeWidth ;

      displayNodes.forEach( function(node){
        node.displayLabel = true;
        node.screenLabel = node.label;
        node.fontSize = Math.min(fontSize, 2 * bandWidth) ;
      });

      displayNodes = positioner.sortQTLAnnotationsWithLabels(
        displayNodes, buildYScale(), config.annotationLabelSize);

      displayNodes.forEach( function(node){
        node.position = node.comboPosition;
        node.labelPosition = node.comboPosition + 0.4;
      })
    }

    return nodes;
  };


  var annotateCluster = function(cluster,indexObj){
    cluster.index = indexObj.index;
    indexObj.index = indexObj.index + 1;

    if (cluster.value){
      cluster.unit = true;
      cluster.start = cluster.value.start;
      cluster.end = cluster.value.end;
    }
    else {

      var l = cluster.left;
      var r = cluster.right;

      l.parentIndex = cluster.index;
      r.parentIndex = cluster.index;

      annotateCluster(l, indexObj);
      annotateCluster(r, indexObj);

      cluster.unit = (l.unit && r.unit
      && (l.start == r.start ) && ( l.end == r.end));

      cluster.start = Math.min(cluster.left.start, cluster.right.start);
      cluster.end = Math.max(cluster.left.end, cluster.right.end);
    }

  }

  var generateChromosomeClusters = function(chromosome){

    var hClusters = hcluster.hcluster(chromosome.annotations.qtls,
      function( a, b ){

        if ( (a.end == b.end) && (a.start == b.start ) ) {
          return 0;
        }

        var overlap =  Math.min(a.end, b.end) - Math.max(a.start, b.start);
        var aLength = a.end - a.start;
        var bLength = b.end - b.start;

        //var normedOverlap = overlap / ( aLength + bLength);
        //var lengthDifference = Math.max( aLength, bLength) / Math.min( aLength, bLength);
        //return lengthDifference + Math.exp( - normedOverlap ) ;

        var normedOverlap = overlap;
        var lengthDifference = Math.abs( aLength - bLength);

        return Math.max(0.1, lengthDifference - normedOverlap);

      },"single", null );

    var indexObj = {index : 0};

    hClusters.forEach(function(cluster) {
      annotateCluster(cluster,indexObj);
    });

    return hClusters
  };

  var openClusters = function(clusters){
    var result = [];

    clusters.forEach( function (cluster ){
      if (cluster.value || cluster.unit ) {
        result.push(cluster)
      }
      else {
        var l = cluster.left;
        var r = cluster.right;

        result.push(l);
        result.push(r);
      }
    });

    return result;
  };

  var flattenCluster = function(cluster){
    if (cluster.size == 1){
      return [cluster.value]
    } else {
      return flattenCluster(cluster.left).concat(flattenCluster(cluster.right))
    }
  };

  my = {};

  my.layoutChromosome = function(chromosome){
    chromosome.layout.qtlNodes = (
    generateChromosomeLayout(chromosome) || chromosome.layout.qtlNodes);
  };

  my.computeChromosomeClusters = function(chromosome){
    chromosome.layout.qtlClusters = generateChromosomeClusters(chromosome);
  };

  return my;
}
var GENEMAP = GENEMAP || {};

GENEMAP.QtlPositioner = function () {

  var regionsOverlap = function (regionA, regionB) {
    return regionA.start < regionB.end && regionB.start < regionA.end;
  };

  var my = {};

  my.positionAnnotations = function( annotations, getPosition, setPosition,
                                     startFunction, midFunction, endFunction){

    var start = startFunction;
    var end = endFunction;
    var mid = midFunction;

    var checkOverlap = function( a, b){
      return (start(a) < end(b)) && (start(b) < end(a));
    };

    var input = annotations.sort(function(a,b){
      return mid(a) - mid(b);
    });

    var stack = []

    for ( var i = 0;  i < input.length ; i++ ){

      var iAn = annotations[i];
      var remove = [];

      for ( var j = 0 ; j < stack.length; j++){

        var jAn = input[stack[j]];

        // check the current region still overlaps the regions in the stack
        if (!checkOverlap( iAn, jAn)){
          remove.push(stack[j]);
        }
      }

      var overlap = _.difference(stack, remove);
      var usedPositions = overlap.map(function(k){
        return getPosition(input[k]);
      });

      var pos = 0;
      for (pos = 1; pos < usedPositions.length + 1 ; pos ++){
        if ( usedPositions.indexOf(pos) === -1){
          break;
        }
      }

      setPosition(iAn,pos);
      stack.push(i);
    }

    return input;
 }

  my.sortQTLAnnotations =  function( annotations ){
    return my.positionAnnotations(
      annotations,
      function(node){return node.position},
      function(node, pos){ node.position = pos},
      function(node){return node.start},
      function(node){return node.midpoint},
      function(node){return node.end}
    );
  }

  my.sortQTLLabels = function (nodes, yscale, fontsize) {
    var annotations = nodes;

    var fontCorrection = 0.6;
    var fontScale = fontCorrection * fontsize;

    return my.positionAnnotations(
      annotations,
      function(node){return node.labelPosition },
      function(node, pos){node.labelPosition = pos },
      function(node){ return yscale(node.midpoint) -fontScale * node.screenLabel.length / 2},
      function(node){return node.midpoint},
      function(node){ return yscale(node.midpoint) + fontScale * node.screenLabel.length / 2}
    );
  }

  my.sortQTLAnnotationsWithLabels = function( nodes, yscale, fontsize){
    var annotations = nodes;

    return my.positionAnnotations(
      annotations,
      function(node){return node.comboPosition },
      function(node, pos){node.comboPosition = pos },
      function(node){ return Math.min(yscale(node.midpoint) - node.label.length * fontsize  / 2, node.start)},
      function(node){return node.midpoint},
      function(node){ return Math.max(yscale(node.midpoint) + node.label.length * fontsize  / 2, node.end)}
    );
  }


  return my;
};

var GENEMAP = GENEMAP || {};

// reads from the basemap and (optinally) annotation XML files
GENEMAP.XmlDataReader = function () {

  /// returns the color property of the data formatted as an HTML color (#ffffff)
  var getColor = function (d) {
    // transform 0xffffff into #ffffff
    // if any letters are missing i.e. #ffff append 0s at the start => #00ffff
    var zeros = new Array(8 - d.length + 1).join('0');
    color =  '#' + zeros + d.substring(2, d.length);

    //modify colours
    if (color == '#00FF00'){ color = '#208000';}

    return color;
  };

  var _processBasemapData = function (genome) {
    genome.chromosomes.forEach(function (chromosome) {

      // include empty lists incase there is no annotation data
      chromosome.annotations = {
        allGenes: [],
        genes: [],
        qtls: [],
        snps: []
      };

      chromosome.bands.forEach(function (band) {
        band.color = getColor(band.color);
      });
    });

    return genome;
  };

  var _processJoinedData = function (data) {
    var genome = _processBasemapData(data[0]);
    var annotations = data[1];

    annotations.features.forEach(function (annotation) {
      annotation.color = getColor(annotation.color);
    });

    //Tag each gene with its global index
    var allGenomeGenes = annotations.features
      .filter( function (e)
      { return e.type.toLowerCase() === 'gene'; })
      .forEach( function(gene, index) {
        gene.globalIndex = index;
      });

    genome.chromosomes.forEach(function (chromosome) {
      var chromosomeAnnotations = annotations.features.filter(
        function (e) { return e.chromosome === chromosome.number; });

      var allGenes = chromosomeAnnotations.filter(
        function (e) { return e.type.toLowerCase() === 'gene'; });

      var qtls = chromosomeAnnotations.filter(
        function (e) { return e.type.toLowerCase() === 'qtl'; });

      var snps = chromosomeAnnotations.filter(
        function (e) { return e.type.toLowerCase() === 'snp'; });

      //Build snps index
      var minSnpPValue = snps.reduce( function(cur, snp){
        return Math.min(cur, snp.pvalue);
      }, 1);

      snps.forEach( function(snp,index){
        snp.id = chromosome.number + '_'  + index;
        snp.importance =  Math.log(snp.pvalue) / Math.log(minSnpPValue);
      } );

      //Build qtl index
      qtls.forEach( function(qtl, index){
        qtl.id = chromosome.number + '_' + index;
        qtl.selected = false;
      })

      //Build genes scores
      var maxScore  = qtls.reduce( function(cur, qtl){
        return Math.max(cur, qtl.score);
      }, 0);


      var maxOpacity = 0.9;
      var opacityFallOff = 3.5;
      var importanceFunction = function(index){
        return maxOpacity - 0.5
          +  1 / (1 + Math.pow( index, opacityFallOff)) ;
      };

      allGenes.forEach( function(gene,index){
        gene.visible = false;
        gene.hidden = false;
        gene.displayed = false;
        gene.importance = importanceFunction(index);
      })
      var genes = allGenes.slice(0, 100);

      chromosome.annotations = {
        genes: genes,
        allGenes: allGenes,
        qtls: qtls,
        snps: snps,
      };
    });

    return genome;
  };

  return {
	  
    readXMLData: function (basemapPath, annotationPath) {

      var basemapReader = GENEMAP.BasemapXmlReader();
      var basemapPromise = basemapReader.readBasemapXML(basemapPath);

      if (annotationPath) {
        var annotationReader = GENEMAP.AnnotationXMLReader();
        var annotationPromise = annotationReader.readAnnotationXML(annotationPath);

        var promise = Promise.all([basemapPromise, annotationPromise]).then(_processJoinedData, function (error) {

          log.error('error while reading XML files: ' + error);

          // try and process the basemap file
          return basemapPromise.then(_processBasemapData);
        });

        return promise;
      }

      return basemapPromise.then(_processBasemapData);
    },
    
    readXMLDataFromRawAnnotationXML: function (basemapPath, annotationXMLString) {

        var basemapReader = GENEMAP.BasemapXmlReader();
        var basemapPromise = basemapReader.readBasemapXML(basemapPath);

        if (annotationXMLString) {
          var annotationReader = GENEMAP.AnnotationXMLReader();
          var annotationPromise = annotationReader.readAnnotationXMLFromRawXML(annotationXMLString);

          var promise = Promise.all([basemapPromise, annotationPromise]).then(_processJoinedData, function (error) {

            log.error('error while reading XML strings: ' + error);

            // try and process the basemap file
            return basemapPromise.then(_processBasemapData);
          });

          return promise;
        }

        return basemapPromise.then(_processBasemapData);
      },
  };
};
