var GENEMAP = GENEMAP || {};

GENEMAP.QTLAnnotationLayout = function (userConfig) {

  var defaultConfig = {};
  var config = _.merge({}, defaultConfig, userConfig);

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

      return {
        cluster: c,
        qtlList : qtlList,
        count : qtlList.length,
        start : start,
        end : end,
        midpoint : midpoint,
        chromosome : qtlList[0].chromosome,
        type: "qtllist",
        id: id
      }
    });

    var combiner = GENEMAP.QTLAnnotationCombiner();
    var identicalResult = combiner.combineSimilarQTLAnnotations(chromosome.annotations.qtls);
  }

  var generateChromosomeLayout = function(chromosome){
    chromosome.layout.qtlDisplayClusters = openClusters(
      chromosome.layout.qtlClusters);

    var nodes = generateNodesFromClusters( chromosome.layout.qtlDisplayClusters);

    positioner = GENEMAP.QtlPositioner();
    return positioner.sortQTLAnnotations(nodes);
  };

  var generateChromosomeClusters = function(chromosome){

    var hClusters = hcluster.hcluster(chromosome.annotations.qtls,
      function( a, b ){
        var overlap =  Math.min(a.end, b.end) - Math.max(a.start, b.start);
        var normedOverlap = overlap / ( a.end - a.start + b.end - b.start);
        return Math.exp( - normedOverlap );
      },"single", 1 );

    return hClusters

  };

  var openClusters = function(clusters){
      var result = [];
      clusters.forEach( function (cluster ){
        if (cluster.value) {
          result.push(cluster)
        }
        else {
          result.push(cluster.left);
          result.push(cluster.right);
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