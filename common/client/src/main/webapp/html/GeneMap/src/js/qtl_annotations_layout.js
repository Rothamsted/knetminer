var GENEMAP = GENEMAP || {};

GENEMAP.QTLAnnotationLayout = function (userConfig) {

  var defaultConfig = {
    scale: 1,
    longestChromosome: 1000,
    showAllQTLs: true,
    showSelectedQTLs: true,
    showAutoQTLLabels: true,
    showSelectedQTLLabels: true,
    annotationLabelSize: 5,
  };
  var config = _.merge({}, defaultConfig, userConfig);

  var positioner = GENEMAP.QtlPositioner();

  var buildYScale = function () {
    return d3.scale.linear()
      .range([0, config.layout.height])
      .domain([0, config.longestChromosome]);
  };

  var generateNodesFromClusters = function(clusters) {
    return clusters.map( function(c){
      var qtlList = flattenCluster(c);
      var start = qtlList.reduce( function(min, c){
        return Math.min( min, c.start);
      }, Infinity);

      var end = qtlList.reduce( function(max, c){
        return Math.max( max, c.end);
      },0 );

      var id = qtlList.reduce( function(id, c){
        return id + (id ?  '|' : '')  + c.start + '-' + c.end;
      }, "");

      var midpoint = (start + end ) / 2;

      if ( qtlList.length == 1){
        var result =  qtlList[0];
        result.type = 'qtl'
      }
      else {
        var result = {
          cluster: c,
          qtlList: qtlList,
          color: qtlList[0].color,
          count: qtlList.length,
          start: start,
          end: end,
          midpoint: midpoint,
          chromosome: qtlList[0].chromosome,
          type: "qtllist",
          id: id
        }
      }
      return result;
    });

  }

  var clusterQTLs = function(chromosome){

    var nodes = []

    if (config.showAllQTLs ) {

      chromosome.layout.qtlDisplayClusters = chromosome.layout.qtlClusters.slice();
      var clusters = chromosome.layout.qtlDisplayClusters;

      var nLevels = Math.ceil(Math.floor(config.scale - 0.1) / 2);

      while ( nLevels -- ) {
        clusters  = openClusters( clusters);
      }

      nodes = generateNodesFromClusters( clusters);
    }
    else if ( config.showSelectedQTLs) {
      chromosome.layout.qtlDisplayClusters = chromosome.annotations.qtls
        .filter( function(d){return d.selected});

      var clusters = chromosome.layout.qtlDisplayClusters;

      var nodes = clusters.map( function(d){
        result = d;
        result.type = 'qtl';
        return result;
      });
    }

    return nodes;
  }

  var autoDisplayLabels = function(nodes){

    log.trace('Do label layout');
    //Layout qtl labels

    //look at each line of labels separately
    var columns = _.groupBy(nodes, 'position' );
    _.forOwn( columns,  function ( column, key){

      log.trace( '-Col ', key);
      log.trace('positions ', column.map(function(node){return node.position }));

      var fontsize = config.annotationLabelSize;
      var yscale = buildYScale();

      //Position the QTL labels
      column = positioner.sortQTLLabels(column, yscale, fontsize);

      var maxLabelPosition = column.reduce( function(cur, node){
        return Math.max(node.labelPosition, cur);
      }, 0 );

      log.trace('labelPositions ', column.map(function(node){return node.labelPosition }));
      log.trace('maxLabelPosition', maxLabelPosition);

      //If the QTL labels don't fit on one line, then don't display them
      if (maxLabelPosition > 1){
        column.forEach( function(node){
          node.displayLabel = false;
        });
      }
      else{
        column.forEach( function(node){
          node.labelPosition = node.position + 0.4;
          node.displayLabel = true;
        });
      }

      log.trace('labelPositions', column.map(function(node){return node.labelPosition }));
    });

    return nodes;
  }


  var generateChromosomeLayout = function(chromosome){

    var level = log.getLevel();
    if ( chromosome.number == '7' ){
      log.setLevel('trace');
    }

    log.trace('---START---')

    //Get clustered QTLs
    var nodes = clusterQTLs(chromosome);

    nodes.forEach( function(node){
      node.displayLabel = false;
    });

    //qtllist nodes never display labels
    var qtlNodes = nodes.filter( function(node){
      return node.type == 'qtl'
    });



    if ( config.showAutoQTLLabels ){

      //Position QTL annotations ignoring labels
      nodes =  positioner.sortQTLAnnotations(nodes);

      var maxPosition = nodes.reduce( function(cur, node){
        return Math.max(cur, node.position);}, 0);

      log.trace('maxPosition', maxPosition);

      //If there aren't too many lanes of QTLs,
      //then try displaying some labels automatically
      if (maxPosition < 3 ) {
        autoDisplayLabels(qtlNodes);
      }
      else {
        qtlNodes.forEach( function(node){
          node.displayLabel = false;
        })
      }
    }

    if (config.showSelectedQTLLabels && !config.showAutoQTLLabels ){
      var displayNodes = nodes.filter( function(node){
        return node.selected;
      });

      displayNodes.forEach( function(node){
        node.displayLabel = true;
      });

      displayNodes = positioner.sortQTLAnnotationsWithLabels(
        displayNodes, buildYScale(), config.annotationLabelSize);

      displayNodes.forEach( function(node){
        node.position = node.comboPosition;
        node.labelPosition = node.comboPosition + 0.4;
      })
    }

    log.setLevel(level);

    return nodes;
  };


  var annotateCluster = function(cluster){
    if (cluster.value){
      cluster.unit = true;
      cluster.start = cluster.value.start;
      cluster.end = cluster.value.end;
    }
    else {

      var l = cluster.left;
      var r = cluster.right;

      annotateCluster(l);
      annotateCluster(r);

      cluster.unit = (l.unit && r.unit
      && (l.start == r.start ) && ( l.end == r.end));

      cluster.start = Math.min(cluster.left.start, cluster.right.start);
      cluster.end = Math.max(cluster.left.end, cluster.right.end);
    }
  }

  var generateChromosomeClusters = function(chromosome){

    var hClusters = hcluster.hcluster(chromosome.annotations.qtls,
      function( a, b ){

        if ( (a.end == b.end) && (a.start == b.start ) ) {
          return 0;
        }

        var overlap =  Math.min(a.end, b.end) - Math.max(a.start, b.start);
        var aLength = a.end - a.start;
        var bLength = b.end - b.start;

        //var normedOverlap = overlap / ( aLength + bLength);
        //var lengthDifference = Math.max( aLength, bLength) / Math.min( aLength, bLength);
        //return lengthDifference + Math.exp( - normedOverlap ) ;

        var normedOverlap = overlap;
        var lengthDifference = Math.abs( aLength - bLength);

        return Math.max(0.1, lengthDifference - normedOverlap);

      },"single", null );

    hClusters.forEach(function(cluster) {
      annotateCluster(cluster);
    });

    return hClusters
  };

  var openClusters = function(clusters){
    var result = [];

    clusters.forEach( function (cluster ){
      if (cluster.value || cluster.unit ) {
        result.push(cluster)
      }
      else {
        var l = cluster.left;
        var r = cluster.right;

        result.push(l);
        result.push(r);
      }
    });

    return result;
  };

  var flattenCluster = function(cluster){
    if (cluster.size == 1){
      return [cluster.value]
    } else {
      return flattenCluster(cluster.left).concat(flattenCluster(cluster.right))
    }
  };

  my = {};

  my.layoutChromosome = function(chromosome){
    chromosome.layout.qtlNodes = (
    generateChromosomeLayout(chromosome) || chromosome.layout.qtlNodes);
  };

  my.computeChromosomeClusters = function(chromosome){
    chromosome.layout.qtlClusters = generateChromosomeClusters(chromosome);
  };

  return my;
}