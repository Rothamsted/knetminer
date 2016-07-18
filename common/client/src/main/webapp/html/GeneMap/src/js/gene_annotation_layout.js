var GENEMAP = GENEMAP || {};

//Produce layout for gene annotations
//GENEMAP.GeneClusterer is used to cluster genes if necessary
//Labella is used to generate layout of nodes

GENEMAP.GeneAnnotationLayout = function (userConfig) {

  var defaultConfig = {
    longestChromosome: 100,
    layout: {
      width: 10, //not used
      height: 100,
      x: 0, //not used
      y: 0, //not used
    },
    autoLabels : true,
    manualLabels : true,
    annotationMarkerSize: 5,
    annotationLabelSize: 5,
    doCluster : true,
    nClusters: 6,
    maxAnnotationLayers: 3,
    scale: 1,
  };

  var config = _.merge({}, defaultConfig, userConfig);

  var buildYScale = function () {
    return d3.scale.linear()
      .range([0, config.layout.height])
      .domain([0, config.longestChromosome]);
  };

  var shouldRecluster = function(nodes) {
    if (!config.doCluster) { return false;}
    var layers = nodes.map(function (d) {  return d.getLayerIndex(); } );
    var maxLayer = Math.max.apply(null, layers);
    return ( maxLayer > config.maxAnnotationLayers );
  }

  //Use labella to generate layout nodes for each gene
  //or cluster of genes
  var generateChromosomeLayout = function(chromosome){

    //How much space do we have?
    var availableWidth = config.layout.width;
    var availableHeight = config.layout.height;
    var labelLength = 20;
    var minDisplayedFontSize = 12;
    var maxDisplayedFontSize = 14;
    var fontCoordRatio = 3.5;

    //How many rows of labels do we show?

    //Can we show 1 row?
    var par1 =  {};
    par1.layerGap = availableWidth * ( 0.1 + 0.1 / config.scale )
    par1.spaceForLabel = availableWidth - par1.layerGap;
    par1.setFontSize = par1.spaceForLabel / labelLength * fontCoordRatio;
    par1.possible = par1.setFontSize * config.scale  > minDisplayedFontSize;
    par1.nodeSpacing = par1.setFontSize;
    par1.density = 1.0;

    //Can we show 2 rows?
    var par2 = {};
    par2.spaceForLabel = availableWidth / 3;
    par2.setFontSize = par2.spaceForLabel / labelLength * fontCoordRatio;
    par2.possible = par2.setFontSize *config.scale  > minDisplayedFontSize;

    par2.setFontSize = Math.min( par2.setFontSize, maxDisplayedFontSize / config.scale  ) ;
    par2.nodeSpacing = par2.setFontSize;
    par2.spaceForLabel = 1.3 * labelLength * par2.setFontSize / fontCoordRatio;
    par2.layerGap = Math.min(5*par2.setFontSize, availableWidth / 3);
    par2.density = 0.9;

    //var nRows = par1.possible + par2.possible;
    var nRows = par1.possible + par2.possible;
    var par = (nRows == 2) ? _.clone(par2) : _.clone(par1);
    par.setFontSize = Math.min( par.setFontSize, maxDisplayedFontSize / config.scale  ) ;
    par.nodeSpacing =  Math.max( 2, par.setFontSize );
    par.lineSpacing =  1;
    par.scale = config.scale;
    par.availableHeight = availableHeight;
    if ( nRows == 0 ) {
      par.nLabels = 0;
    } else if (nRows == 1 ){
      par.nLabels = 0.4  * availableHeight / (par.nodeSpacing + par.lineSpacing);
    } else if (nRows == 2 ){
    par.nLabels =  0.6 * availableHeight / (par.nodeSpacing + par.lineSpacing);
  }

    if ( true &&  chromosome.number == "2B")
    {
      log.info( "par1",  par1);
      log.info( "par2", par2);
      log.info( "par", par);
     };

    var y = buildYScale();

    forceConfig = {
      nodeSpacing: par.nodeSpacing,
      lineSpacing: par.lineSpacing,
      algorithm: 'overlap',
      minPos: 0,
      maxPos: par.availableHeight,
      density: par.density,
    };

    var force = new labella.Force( forceConfig );

    //Decide which labels to display

    //Start with no labels displayed
    allGenes = chromosome.annotations.allGenes;
    allGenes.forEach( function(gene){ gene.displayed = false}) ;

    //Include all genes set to visible
    var nodeSource = config.manualLabels
      ? new Set(allGenes.filter( function(gene){ return gene.visible}))
      : new Set();

    //Automatically show some additional labels
    if ( config.autoLabels){
    allGenes.slice(0, par.nLabels)
      .filter( function(gene){return !gene.hidden;})
      .forEach( function(gene){ nodeSource.add(gene)});
      }

    nodeSource = Array.from(nodeSource);
    nodeSource.forEach( function(gene){
      gene.displayed = true
      gene.fontSize = par.setFontSize;
    });

    var nodes = nodeSource.map(function (d) {
      return new labella.Node(y(d.midpoint), par.setFontSize, d);
    } );

    try {
      force.nodes(nodes).compute();
    } catch (e){
      if ( e instanceof RangeError){
        log.error(e.message);
        log.info(chromosome.number);
        log.info(par);
        return null;
      }
      throw e;
    }


    //If clustering is enabled we might want to redo the layout using clusters of genes
    if( false && shouldRecluster(force.nodes()) ){
      nodeSource = chromosome.layout.displayClusters;

      nodes = nodeSource.map(function (d) {
        return new labella.Node(y(d.midpoint), setFontSize, d);
      } );
      force.nodes(nodes).compute();
    }

    //Compute paths
    renderConfig  = {
      direction: 'right',
      layerGap: par.layerGap,
      nodeHeight: par.spaceForLabel,
    };

    var renderer = new labella.Renderer(renderConfig);
    renderer.layout(nodes);

    nodes.forEach( function(node){
     node.data.path = renderer.generatePath(node);
    });


    if ( true &&  chromosome.number == "2B") {
      log.info( nodes );
    }


    return nodes;

  }

  //Produce list of clusters (which could be single genes)
  //for a given chromosome
  var generateChromosomeClusters = function(chromosome){
    var geneClusterer = GENEMAP.GeneClusterer();
    //Run clustering algorithm so we can use the clusters later when drawing
    genes = chromosome.annotations.genes;
    geneClusters = geneClusterer.createClustersFromGenes(genes);
    return geneClusters;
  }

  my = {};

  my.layoutChromosome = function(chromosome){
    chromosome.layout.nodes = (
    generateChromosomeLayout(chromosome) || chromosome.layout.nodes);
  }

  my.computeChromosomeClusters = function(chromosome){
    chromosome.layout.clusters = generateChromosomeClusters(chromosome);
    chromosome.layout.displayClusters = chromosome.layout.clusters.slice();
  };

  my.expandAllChromosomeClusters = function(chromosome) {
    chromosome.layout.displayClusters = chromosome.annotations.genes;
  };

  my.collapseAllChromosomeClusters = function(chromosome) {
    chromosome.layout.displayClusters = chromosome.layout.clusters.slice();
  };

  my.expandAChromosomeCluster= function( chromosome, cluster) {
    chromosome.layout.displayClusters = chromosome.layout.clusters.slice();

    //add each gene as it's own cluster
    cluster.genesList.forEach( function(gene){
      chromosome.layout.displayClusters.push(gene) ;
    } );

    //delete the original cluster
    var clusterIndex = chromosome.layout.displayClusters.indexOf(cluster);
    chromosome.layout.displayClusters.splice(clusterIndex, 1);
  };

  return my;
}
