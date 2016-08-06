var GENEMAP = GENEMAP || {};

GENEMAP.MenuBar = function (userConfig) {
  var defaultConfig = {
    onNetworkBtnClick: $.noop,
    onFitBtnClick: $.noop,
    onTagBtnClick: $.noop,
    onQtlBtnClick: $.noop,
    onResetBtnClick: $.noop,
    onSetMaxGenesClick : $.noop,
    onSetNumberPerRowClick : $.noop,
    onExportBtnClick : $.noop,
    onExportAllBtnClick : $.noop,
    initialMaxGenes : 1000,
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

    config.onResetBtnClick();
  };

  var buildDropdown = function(selection, id, data, callback, initialValue){
    var dropDown = selection.attr( {'class': 'menu-dropdown bootstrap'}).selectAll('.btn-group').data([null]);

    var dropdownSpanEnter = dropDown.enter();

    var dropdown = dropdownSpanEnter
      .append('span') .attr({ 'class': 'btn-group'});

    var dropdownButtonAttr = {
      'class' : 'menu-dropdown btn btn-default dropdown-toggle' ,
      'id' : id,
      'type' : "button",
      'data-toggle' : "dropdown",
      'aria-haspopup' : 'true'};

    var maxLabelWidth = data.reduce( function(max, d){
      return Math.max(max, d[0].toString().length)
    }, 0);

    button = dropdown
      .append('button').attr( dropdownButtonAttr)
      .style( {width: (0.4*maxLabelWidth + 4) + 'em'});

    button.append('span')
      .attr( {
        class: 'title'
      }).text(initialValue);

    button.append( 'span')
      .attr( {
        'class':'caret'
      }).style({
      "position": "absolute",
      "right": "0.5em",
      "top" : "45%"});

    dropdown
      .insert('ul')
      .attr( {
        'class': 'dropdown-menu'
        , 'aria-labelledby': id
      });

    dropdownItems = dropdown
      .select('.dropdown-menu')
      .selectAll('.dropdown-item')
      .data(data);

    dropdownItems.enter()
      .append('li')
      .on('click', function(d){
        dropdown
          .select('span.title')
          .text(d[0]);
        callback(d[1]);
      })
      .append('a')
      .attr({
        'class': 'dropdown-item',
        'href' : '#'})
      .text(function(d){return d[0]} )
      .on('click', function(e){
        d3.event.preventDefault();
      });

  }

  var drawMenu = function () {

    var menu = d3.select(target).selectAll('.genemap-menu').data([null]);
    menu.enter().append('div').classed('genemap-menu', true);

    var menuRows = menu.selectAll('div').data( [
        [
          'ngenes-dropdown',
          'nperrow-spinner'
        ],
        [
          'network-btn',
          'reset-btn',
          'fit-btn',
          'tag-btn',
          'qtl-btn',
          'export-btn',
          'export-all-btn'
        ],
      ])
      .enter().append('div');

    var menuItems = menuRows.selectAll('span')
      .data(function(d,i){ return d;})
      ;

    menuItems.enter().append('span');
    menuItems.attr({
      class: function (d) {
        return d;
      },
    });

    menu.select('.network-btn')
      .attr( 'title', 'Launch network view')
      .on('click', myOnNetworkBtnClick);

    menu.select('.tag-btn')
      .on('click', myOnTagBtnClick);

    var qtlDropdown = menu.select('.qtl-btn');
    buildDropdown( qtlDropdown, 'qtl-btn', [
      [ 'Show all QTLs', 'all'],
      ['Show selected QTLs', 'selected'],
      ["Don't show QTLs", 'none'] ],
      config.onQtlBtnClick, 'Show all QTLs');

    menu.select('.fit-btn')
      .attr( 'title', 'Reset pan and zoom')
      .on('click', myOnFitBtnClick);

    menu.select('.reset-btn')
      .attr( 'title', 'Reset selections')
      .on('click', myOnResetBtnClick);

    var dropdownSpan = menu.select('.ngenes-dropdown');
    dropdownSpan.text("Max genes to display: ");
    buildDropdown( dropdownSpan, 'ngenes-dropdown',
      [['50', 50], ['100', 100], ['200',200], ['500', 500], ['1000',1000]],
      config.onSetMaxGenesClick, config.initialMaxGenes);

    menu.select('.export-btn')
      .attr( { 'title' : 'export view to png'})
      .on('click', config.onExportBtnClick);

    menu.select('.export-all-btn')
      .attr( { 'title' : 'export all to png'})
      .on('click', config.onExportAllBtnClick);

    var spinnerSpan = menu.select('.nperrow-spinner')
    var enterSpinner = spinnerSpan.selectAll('input').data(['nPerRowSpinner']).enter();

    enterSpinner .append('span')
      .attr( { for : function(d){return d}, })
      .text('Num per row: ');

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
      min: 0,
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

  my.onSetMaxGenesClick = function (value) {
    if (!arguments.length) {
      return config.onSetMaxGenesClick;
    }

    config.onSetMaxGenesClick = value;
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
