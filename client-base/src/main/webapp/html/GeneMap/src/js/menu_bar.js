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
