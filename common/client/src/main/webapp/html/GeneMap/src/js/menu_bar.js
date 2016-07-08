var GENEMAP = GENEMAP || {};

GENEMAP.MenuBar = function (userConfig) {
  var defaultConfig = {
    onNetworkBtnClick: $.noop,
    onFitBtnClick: $.noop,
    onTagBtnClick: $.noop,
    onClusterCollapseBtnClick: $.noop,
    onClusterExpandBtnClick: $.noop,
    onSetMaxLayers: $.noop
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

  var myOnClusterCollapseBtnClick = function () {
    if ($(this).hasClass('disabled')) {
      return;
    }

    config.onClusterCollapseBtnClick();
  };

  var myOnClusterExpandBtnClick = function () {
    if ($(this).hasClass('disabled')) {
      return;
    }

    config.onClusterExpandBtnClick();
  };

  var mySetMaxAnnotationLayers = function(value) {
    items = d3.select(target).select('.layer-dropdown').selectAll('li');
    log.info(items.size());
    items.classed('active', function(d){  return d == value; } );
    config.onSetMaxLayers(value);
  }

  var drawMenu = function () {

    var menu = d3.select(target).selectAll('.genemap-menu').data([null]);
    menu.enter().append('div').classed('genemap-menu', true);

    var menuItems = menu.selectAll('span').data(
      ['network-btn', 'tag-btn', 'fit-btn', 'expand-btn', 'collapse-btn', 'layer-dropdown']);
    menuItems.enter().append('span');
    menuItems.attr({
      class: function (d) { return d; },
    });

    menu.select('.network-btn').on('click', myOnNetworkBtnClick);

    menu.select('.tag-btn')
      .on('click', myOnTagBtnClick);

    menu.select('.fit-btn')
      .on('click', myOnFitBtnClick);

    menu.select('.collapse-btn')
      .on('click', myOnClusterCollapseBtnClick);

    menu.select('.expand-btn')
      .on('click', myOnClusterExpandBtnClick);

    var dropdownSpan = menu.select('.layer-dropdown').attr( {'class': 'layer-dropdown bootstrap'}).selectAll('.btn-group').data([null]);
    var dropdownSpanEnter = dropdownSpan.enter();

    var dropdownButtonAttr = {
      'class' : 'btn btn-default dropdown-toggle' ,
      'id' : 'label-dropdown-menu',
      'type' : "button",
      'data-toggle' : "dropdown",
      'aria-haspopup' : 'true'};

    var dropdown = dropdownSpanEnter.append('span').attr({ 'class': 'btn-group'});

    dropdown
      .append('button').attr( dropdownButtonAttr).text('Max Layers')
      .append( 'span').attr({'class':'caret'});

    dropdown
      .insert( 'ul').attr( {'class': 'dropdown-menu', 'aria-labelledby': 'label-dropdown-menu'});

    dropdownItems = dropdown.select('.dropdown-menu').selectAll('.dropdown-item').data( [1,2,3,4,5,6,7,8,9,10]);
    dropdownItems.enter()
      .append('li').on('click', function(d){ mySetMaxAnnotationLayers(d);})
      .append('a').attr({'class': 'dropdown-item', 'href' : '#'}).text(function(d){return d} );

  };

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

  my.onFitBtnClick = function (value) {
    if (!arguments.length) {
      return config.onFitBtnClick;
    }

    config.onFitBtnClick = value;
    return my;
  };

  my.onClusterCollapseBtnClick = function (value) {
    if (!arguments.length) {
      return config.onClusterCollapseBtnClick;
    }

    config.onClusterCollapseBtnClick = value;
    return my;
  };

  my.onClusterExpandBtnClick = function (value) {
    if (!arguments.length) {
      return config.onClusterExpandBtnClick;
    }

    config.onClusterExpandBtnClick = value;
    return my;
  };

  my.onSetMaxLayers = function (value) {
    if (!arguments.length) {
      return config.onSetMaxLayers;
    }

    config.onSetMaxLayers= value;
    return my;
  };

  my.SetAnnotationLayers = function (value) {
    mySetMaxAnnotationLayers(value);
  };

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
