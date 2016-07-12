var GENEMAP = GENEMAP || {};

GENEMAP.GeneAnnotationLayout = function (userConfig) {

  var defaultConfig = {
    longestChromosome: 100,
    layout: {
      width: 10,
      height: 100,
      x: 0,
      y: 0,
    },
    annotationMarkerSize: 5,
    annotationLabelSize: 5,
    doCluster : true,
    nClusters: 6,
    maxAnnotationLayers: 3,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var buildYScale = function () {
    return d3.scale.linear()
      .range([0, config.layout.height])
      .domain([0, config.longestChromosome]);
  };

  var shouldRecluster = function(nodes) {
    if (!config.doCluster) { return false;}
    var maxLayer = Math.max.apply(null, layers);
    return ( maxLayer > config.maxAnnotationLayers );
  }

  var generateChromosomeLayout = function(chromosome){

    var y = buildYScale();

    var force = new labella.Force({
      nodeSpacing: 3,
      algorithm: 'overlap',
      lineSpacing: 2,
      minPos: 0,
      maxPos: config.layout.height,
    });

    //Start by constructing nodes directly from genes
    var nodeSource = chromosome.annotations.genes;

    var nodes = nodeSource.map(function (d) {
      return new labella.Node(y(d.midpoint), config.annotationMarkerSize, d);
    } );
    force.nodes(nodes).compute();

    //If clustering is enabled we might want to redo the layout using clusters of genes
    if( shouldRecluster(force.nodes()) ){
      nodeSource = chromosome.annotations.geneDisplayClusters;

      nodes = nodeSource.map(function (d) {
        return new labella.Node(y(d.midpoint), config.annotationMarkerSize, d);
      } );
      force.nodes(nodes).compute();
    }

    var renderer = new labella.Renderer({
      direction: 'right',
      layerGap: config.layout.width / 3.0,
      nodeHeight: config.annotationMarkerSize * 1.5 + config.annotationLabelSize * 5.0  ,
    });

    renderer.layout(force.nodes());
    return force.nodes();

  }

  var generateChromsomeLayout = function(chromosome){
    var geneClusterer = GENEMAP.GeneClusterer();
    //Run clustering algorithm so we can use the clusters later when drawing
    genes = chromosome.annotation.genes;
    geneClusters = geneClusterer.createClustersFromGenes(genes);
    return geneClusters;
  }

  my.layoutChromosome = function(chromosome){
    chromosome.layout.nodes = generateChromosomeLayout(chromosome)
  }

  my.computeChromosomeClusters = function(chromosome){
    chromosome.layout.clusters = generateChromosomeClusters(chromosome);
    chromosome.layout.displayClusters = chromosome.layout.clusters.slice();
  };

  my.expandAllChromsomeClusters = function(chromosome) {
    chromsome.layout.displayClusters = chromosome.annotation.genes;
  };

  my.collapseAllChromsomeClusters = function(chromosome) {
    chromsome.layout.displayClusters = chromosome.layout.clusters.slice();
  };

  my.expandAChromsomeCluster= function( chromosome, cluster) {
    chromosome.layout.displayClusters = chromosome.layout.clusters.slice();

    //add each gene as it's own cluster
    cluster.forEach( function(gene){
      chromosome.layout.displayClusters.push(gene) ;
    } );

    //delete the original cluster
    var clusterIndex = chromsome.layout.displayClusters.indexOf(cluster);
    chromosome.layout.displayClusters.splice(clusterIndex, 1);
  };

  return my;
}
