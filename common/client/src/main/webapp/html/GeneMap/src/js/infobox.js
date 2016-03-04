var GENEMAP = GENEMAP || {};

GENEMAP.InfoBox = function () {

  var my = {};

  var target = 'body';

  var closeAllPopovers = function () {
    $('.infobox').popover('hide');
  };

  my.attach = function () {
    $(target).off('mousedown mousewheel DOMMouseScroll').on('mousedown mousewheel DOMMouseScroll', closeAllPopovers);
  };

  my.setupInfoboxOnSelection = function (selection) {

    selection.selectAll('.infobox').each(function (d) {
      var data = d;

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
        placement: 'bottom',
        animation: true,
        trigger: 'manual',
        html: true,
      });
    });

    selection.on('mousedown', function () {

      console.log('infobox mousedown ');
      d3.event.preventDefault();
      d3.event.stopPropagation();
      return false;

    }).on('contextmenu', function () {

      $('.infobox').not($(this).children()).popover('hide');
      $(this).children().popover('toggle');
      console.log('infobox contextmenu ');
      d3.event.preventDefault();
      d3.event.stopPropagation();
      return false;

    }).on('dblclick', function () {
      console.log('infobox dblclick ');
      d3.event.preventDefault();
      d3.event.stopPropagation();
      return false;
    });
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
