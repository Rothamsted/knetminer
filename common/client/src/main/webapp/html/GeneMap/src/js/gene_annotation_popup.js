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
