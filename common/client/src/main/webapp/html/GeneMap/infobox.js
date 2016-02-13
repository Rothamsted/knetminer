var GENEMAP = GENEMAP || {};

GENEMAP.InfoBox = function() {

  var my = {};

  var target = 'body';

  var closeAllPopovers = function(e) {
    if (typeof $(e.target).data('original-title') == 'undefined' && !$(e.target).parents().is('.popover.in')) {
      $('[data-original-title]').popover('hide');
    }
  };

  my.attach = function() {
    $(".infobox").each(function () {
        $(this).popover({
            title: this.__data__.label,
            content: "<div>Chromosome "+ this.__data__.chromosome + " "+ this.__data__.start + "-"+ this.__data__.end + "<br /> <a href='" + this.__data__.link + "'>link </a></div",
            container: target,
            placement: "right",
            animation: true,
            trigger: 'click',
            html: true
        });
    });

    $('html').off('click').on('click', closeAllPopovers);
  };

  my.target = function(value) {
    if (!arguments.length) return target;
    target = value;
    return my;
  }


  return my;
};
