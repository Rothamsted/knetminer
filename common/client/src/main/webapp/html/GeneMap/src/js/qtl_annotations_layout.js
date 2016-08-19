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
        result.index =  c.index;
        result.parentIndex =  c.parentIndex;
      }
      else {
        var result = {
          cluster: c,
          index: c.index,
          parentIndex: c.parentIndex,
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

      var nClusters = clusters.length;

      while (true) {
        nodes = generateNodesFromClusters( clusters);
        nodes = positioner.sortQTLAnnotations(nodes);
        var maxPosition = nodes.reduce( function(cur, node){
          return Math.max(cur, node.position);}, 0);

        if ( maxPosition < 2 ){
          clusters = openClusters(clusters);
          if ( nClusters == clusters.length){
            break;
          }
          nClusters = clusters.length;
        }
        else{
          break;
        }
      }
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

      var fontsize =  14 / config.scale;
      var yscale = buildYScale();

      //Position the QTL labels
      column = positioner.sortQTLLabels(column, yscale, fontsize);

      var maxLabelPosition = column.reduce( function(cur, node){
        return Math.max(node.labelPosition, cur);
      }, 0 );

      log.trace('labelPositions ', column.map(function(node){return node.labelPosition }));
      log.trace('maxLabelPosition', maxLabelPosition);



      //STRATEGY 1 - if there is more than one lane of labels,
      //show only the first lane
      column.forEach( function(node){
        if( node.labelPosition > 1){
          node.displayLabel = false;
       }
        else{
          node.displayLabel = true;
          node.labelPosition = node.position + 0.4;
        }
      });

      //STRATEGY 2 - if there is more than one lane of labels,
      //don't show any labels

      //if (maxLabelPosition > 1){
      //  column.forEach( function(node){
      //    node.displayLabel = false;
      //  });
      //}
      //else{
      //  column.forEach( function(node){
      //    node.labelPosition = node.position + 0.4;
      //    node.displayLabel = true;
      //  });
      //}

      log.trace('labelPositions', column.map(function(node){return node.labelPosition }));
    });

    return nodes;
  }


  var generateChromosomeLayout = function(chromosome){

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

      qtlNodes.forEach( function(node){
        if ( node.label.length > 15 ){
        node.screenLabel = node.label.substring(0, 12) + '...'
        }
        else{
          node.screenLabel = node.label;
        }
      });

      //If there aren't too many lanes of QTLs,
      //then try displaying some labels automatically

      var fontSize = 14 / config.scale;
      var fontTooBig = fontSize > 0.6 * config.layout.chromosomeWidth;
      var tooManyLanes = maxPosition > 3;

      if ( (!tooManyLanes) && (!fontTooBig)) {
        autoDisplayLabels(qtlNodes);
        qtlNodes.forEach( function(node){
          node.fontSize = fontSize;
        });
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

      var fontSize = 14 / config.scale;
      var bandWidth =  0.3 * config.layout.chromosomeWidth ;

      displayNodes.forEach( function(node){
        node.displayLabel = true;
        node.screenLabel = node.label;
        node.fontSize = Math.min(fontSize, 2 * bandWidth) ;
      });

      displayNodes = positioner.sortQTLAnnotationsWithLabels(
        displayNodes, buildYScale(), config.annotationLabelSize);

      displayNodes.forEach( function(node){
        node.position = node.comboPosition;
        node.labelPosition = node.comboPosition + 0.4;
      })
    }

    return nodes;
  };


  var annotateCluster = function(cluster,indexObj){
    cluster.index = indexObj.index;
    indexObj.index = indexObj.index + 1;

    if (cluster.value){
      cluster.unit = true;
      cluster.start = cluster.value.start;
      cluster.end = cluster.value.end;
    }
    else {

      var l = cluster.left;
      var r = cluster.right;

      l.parentIndex = cluster.index;
      r.parentIndex = cluster.index;

      annotateCluster(l, indexObj);
      annotateCluster(r, indexObj);

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

    var indexObj = {index : 0};

    hClusters.forEach(function(cluster) {
      annotateCluster(cluster,indexObj);
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