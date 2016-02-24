var GENEMAP = GENEMAP || {};

GENEMAP.InfoBox = function () {

  var my = {};

  var target = 'body';

  var closeAllPopovers = function () {
    $('.infobox').not(this).popover('hide');

    // if (typeof $(e.target).data('original-title') === 'undefined' && !$(e.target).parents().is('.popover.in')) {
    //   $('[data-original-title]').popover('hide');
    // }
  };

  my.attach = function () {
    $('.infobox').each(function () {
      var data = this.__data__;

      // check if labella is being used, in which case the data will be moved into the .data property.
      if (data.data) {
        data = data.data;
      }

      $(this).popover({
        title: null,
        content: '<div><a href="' + data.link + '">' + data.label + '</a>' +
                 '<br />Chromosome ' + data.chromosome + ' :' +
                  data.start + '-' + data.end +
                  '</div>',
        container: target,
        placement: 'right',
        animation: true,
        trigger: 'click',
        html: true,
      });
    });

    $('html').off('mousedown mousewheel DOMMouseScroll').on('mousedown mousewheel DOMMouseScroll', closeAllPopovers);
  };

  my.target = function (value) {
    if (!arguments.length) {
      return target;
    }

    target = value;
    return my;
  };

  return my;
};
