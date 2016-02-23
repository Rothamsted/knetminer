var GENEMAP = GENEMAP || {};

GENEMAP.InfoBox = function () {

  var my = {};

  var target = 'body';

  var closeAllPopovers = function (e) {
    if (typeof $(e.target).data('original-title') === 'undefined' && !$(e.target).parents().is('.popover.in')) {
      $('[data-original-title]').popover('hide');
    }
  };

  my.attach = function () {
    $('.infobox').each(function () {
      var data = this.__data__;

      // check if labella is being used, in which case the data will be moved into the .data property.
      if (data.data) {
        data = data.data;
      }

      $(this).popover({
        title: data.label,
        content: '<div>Chromosome ' + data.chromosome + ' ' +
          data.start + '-' + data.end +
          '<br /> <a href="' + data.link + '">link </a></div',
        container: target,
        placement: 'right',
        animation: true,
        trigger: 'click',
        html: true,
      });
    });

    $('html').off('click').on('click', closeAllPopovers);
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
