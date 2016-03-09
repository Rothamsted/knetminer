var GENEMAP = GENEMAP || {};

GENEMAP.InfoBox = function () {

  var my = {};

  var target = 'body';
  var redrawFunction = $.noop;

  var closeAllPopovers = function (event) {
    if ($(event.target).hasClass('btn-infobox-label')) {
      return;
    }

    console.log('closing popovers ...' + event);
    $('.infobox').popover('hide');
  };

  var generatePopoverContent = function (id, data) {
    var button = '<span class="btn-infobox-label show-label" ' +
      ' data-feature-id="' + id +
      '" title ="Show Label"></span>';

    if (data.showLabel === 'show')
    {
      button = '<span class="btn-infobox-label hide-label" data-feature-id="' + id + '" title ="Hide Label"></span>';
    }

    return '<div><a href="' + data.link + '" target="_blank">' + data.label + '</a>' +
             '<br />Chromosome ' + data.chromosome + ' :' +
              data.start + '-' + data.end + button +
              '</div>';
  };

  my.attach = function () {
    $(target).off('mousedown mousewheel DOMMouseScroll').on('mousedown mousewheel DOMMouseScroll', closeAllPopovers);

    $(target).off('click').on('click', '.btn-infobox-label', function (event) {
      console.log('infobox label click ' + event);
      var featureId = $(event.target).data().featureId;

      var feature = d3.select('#' + featureId);
      var data = feature.datum();

      if (data.data) {
        data = data.data;
      }

      var visibility;
      if (data.showLabel === 'show') {
        data.showLabel = 'hide';
        visibility = 'hidden';
      } else {
        data.showLabel = 'show';
        visibility = 'visible';
      }

      feature.select('text').style('visibility', visibility);

      var popover = $('#' + featureId).find('.infobox').data('bs.popover');
      popover.options.content = generatePopoverContent(featureId, data);
      popover.toggle();

      event.preventDefault();
      event.stopPropagation();
      return false;
    });

  };

  my.setupInfoboxOnSelection = function (selection) {

    selection.selectAll('.infobox').each(function (d) {
      var data = d;

      // check if labella is being used, in which case the data will be moved into the .data property.
      if (data.data) {
        data = data.data;
      }

      var id = $(this).closest('.gene-annotation').attr('id');
      var content = generatePopoverContent(id, data);

      // does this element already have a popover?
      var popover = $(this).data('bs.popover');
      if (popover) {
        // update the popover content
        popover.options.content = content;
      } else {
        // create a new popover
        $(this).popover({
          title: null,
          content: content,
          container: target,
          placement: 'bottom',
          animation: true,
          trigger: 'manual',
          html: true,
        });
      }

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

  my.redrawFunction = function (value) {
    if (!arguments.length) {
      return redrawFunction;
    }

    redrawFunction = value;
    return my;
  };

  return my;
};
