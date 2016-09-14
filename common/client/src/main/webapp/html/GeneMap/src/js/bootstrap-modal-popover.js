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