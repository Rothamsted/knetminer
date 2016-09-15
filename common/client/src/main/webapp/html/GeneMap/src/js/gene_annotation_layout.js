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
    nGenesToDisplay: 1000,
    maxAnnotationLayers: 3,
    displayedFontSize: 13,
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

  var calculatePossibleRows = function(scale, availableWidth, labelLength, minDisplayedFontSize ){

    var fontCoordRatio = 4.0;

    //Try 2 rows:
    var spaceForLabel = availableWidth / 3;
    var setFontSize =spaceForLabel / labelLength * fontCoordRatio;
    var possible = setFontSize * scale  > minDisplayedFontSize;

    if (possible){
      return 2;
    }

    //Otherwise, try 1 row

    var layerGap = availableWidth * ( 0.1 + 0.1 / scale )
    spaceForLabel = availableWidth -layerGap;
    setFontSize = spaceForLabel / labelLength * fontCoordRatio;
    possible = setFontSize * scale  > minDisplayedFontSize;

    if ( possible){
      return 1;
    }
    return 0;
  }

  var compute1RowLayout = function(scale, availableWidth, labelLength,
                                   maxDisplayedFontSize, availableHeight){
    var fontCoordRatio = 3.5;

    par = {};

    par.scale = scale;
    par.availableHeight = availableHeight;
    par.lineSpacing =  1;

    par.layerGap = availableWidth * ( 0.1 + 0.1 / scale )
    par.spaceForLabel = availableWidth - par.layerGap;

    par.setFontSize = Math.min(
      par.spaceForLabel / labelLength * fontCoordRatio ,
      maxDisplayedFontSize / config.scale
    ) ;

    //par.nodeSpacing =  Math.max( 2, par.setFontSize );
    par.nodeSpacing =   par.setFontSize ;

    par.nLabels = 0.4  * availableHeight / (par.nodeSpacing + par.lineSpacing);
    par.density = 1.0;

    return par;
  };

  var compute2RowLayout  = function(scale, availableWidth, labelLength,
                                    maxDisplayedFontSize, availableHeight){
    var fontCoordRatio = 3.5;

    var par = {};

    par.scale = scale;
    par.availableHeight = availableHeight;
    par.lineSpacing =  1;

    par.setFontSize = Math.min(
      availableWidth / 3 / labelLength * fontCoordRatio,
      maxDisplayedFontSize / config.scale  ) ;

    //par.nodeSpacing = Math.max(2, par.setFontSize);
    par.nodeSpacing =   par.setFontSize ;
    par.spaceForLabel = 1.3 * labelLength * par.setFontSize / fontCoordRatio;
    par.layerGap = Math.min(5*par.setFontSize, availableWidth / 3);
    par.density = 0.9;
    par.nLabels =  0.6 * availableHeight / (par.nodeSpacing + par.lineSpacing);

    return par;
  };

  var generateNodes = function(force, y, par, nodeSource){

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
        return null;
      }
      throw e;
    }
    return nodes;
  }


//Use labella to generate layout nodes for each gene
//or cluster of genes
  var generateChromosomeLayout = function(chromosome){

    allGenes = chromosome.annotations.allGenes.filter( function(gene){
      return (gene.globalIndex < config.nGenesToDisplay);
    });

    //How much space do we have?
    var availableWidth = config.layout.width;

    //For short chromosomes, allow labels to use up to 20% past the end of the chromosome
    var availableHeight = config.layout.height * ( Math.min(
        1,
        0.2 + chromosome.length / config.longestChromosome
      ) ) ;

    //The longest label determines when we can start displaying them without overlaps
    var labelLength = allGenes.reduce( function(cur, gene){
      return Math.max(cur, gene.label.length)
    }, 0);

    var minDisplayedFontSize = 1.1 * config.displayedFontSize;
    var maxDisplayedFontSize = 0.9 * config.displayedFontSize;

    //How many rows of labels do we show?
    var nrows = calculatePossibleRows(config.scale, availableWidth, labelLength, minDisplayedFontSize);

    var par;
    if ( nrows ==2 ){
      par = compute2RowLayout(config.scale, availableWidth,labelLength,maxDisplayedFontSize, availableHeight);
    }
    else if ( nrows == 1) {
      par = compute1RowLayout(config.scale, availableWidth,labelLength,maxDisplayedFontSize, availableHeight);
    }
    else if ( nrows == 0 ){
      par = compute1RowLayout(config.scale, availableWidth,labelLength,maxDisplayedFontSize, availableHeight);
      par.nLabels = 0;
    }

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
    allGenes.forEach( function(gene){ gene.displayed = false}) ;

    //Include all genes set to visible
    var nodeSet = config.manualLabels
      ? new Set(allGenes.filter( function(gene){ return gene.visible}))
      : new Set();

    //Automatically show some additional labels
    if ( config.autoLabels){
      allGenes.slice(0, par.nLabels)
        .filter( function(gene){return !gene.hidden;})
        .forEach( function(gene){ nodeSet.add(gene)});
    }

    var nodeSource = Array.from(nodeSet);
    var nodes = generateNodes(force, y, par, nodeSource);

    //If the layout algorithm fails (stack limit exceeded),
    //try again using the 'simple' algorithm.
    if ( !nodes){
      force.options( { algorithm: 'simple'});
      nodes = generateNodes( force, y, par, nodeSource);
    }

    //How many layers did we end up with?
    var maxLayer;
    if ( nodes){
    var layers = nodes.map(function (d) {  return d.getLayerIndex(); } );
    maxLayer =  Math.max.apply(null, layers);
    }


    //If the algorithm sill fails or there are too many layers,
    //we need to reduce the number of nodes by clustering
    if (!nodes || maxLayer > 3  ) {
      log.trace( 'Too many lables to display - clustering instead')

      var geneClusterer = GENEMAP.GeneClusterer()
        .nClusters(Math.max(par.nLabels,1));

      try {
        var clusterSource = geneClusterer.createClustersFromGenes(nodeSource);
      }
      catch(e){
        log.info(nodeSource);
        clusterSource = [];
      }
      nodes = generateNodes(force, y, par, clusterSource)
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

    if ( false &&  chromosome.number == "2B") {
      log.info( nodes );
    }

    return nodes;
  }

//Produce list of clusters (which could be single genes)
//for a given chromosome
  var generateChromosomeClusters = function(chromosome){
    var geneClusterer = GENEMAP.GeneClusterer();
    //Run clustering algorithm so we can use the clusters later when drawing
    var genes = chromosome.annotations.genes;
    var geneClusters = geneClusterer.createClustersFromGenes(genes);
    return geneClusters;
  }

  my = {};

  my.layoutChromosome = function(chromosome){
    chromosome.layout.annotationNodes = (
    generateChromosomeLayout(chromosome) || chromosome.layout.annotationNodes);
  }

  my.computeChromosomeClusters = function(chromosome){
    chromosome.layout.annotationClusters = generateChromosomeClusters(chromosome);
    chromosome.layout.annotationDisplayClusters = chromosome.layout.annotationClusters.slice();
  };

  my.expandAllChromosomeClusters = function(chromosome) {
    chromosome.layout.annotationDisplayClusters = chromosome.annotations.genes;
  };

  my.collapseAllChromosomeClusters = function(chromosome) {
    chromosome.layout.annotationDisplayClusters = chromosome.layout.annotationClusters.slice();
  };

  my.expandAChromosomeCluster= function( chromosome, cluster) {
    chromosome.layout.annotationDisplayClusters = chromosome.layout.annotationClusters.slice();

    //add each gene as it's own cluster
    cluster.genesList.forEach( function(gene){
      chromosome.layout.annotationDisplayClusters.push(gene) ;
    } );

    //delete the original cluster
    var clusterIndex = chromosome.layout.annotationDisplayClusters.indexOf(cluster);
    chromosome.layout.annotationDisplayClusters.splice(clusterIndex, 1);
  };

  my.computeNormalisedGeneScores = function ( chromosomes ){

    var allVisible = chromosomes.reduce( function( total, cur){
      return total.concat(cur.annotations.genes.filter( function(gene){
        return gene.displayed;
      }));
    },[]);

    var allScored = allVisible.every( function(gene){
      return gene.score;
    })

    if ( allScored ){

      var maxScore = allVisible.reduce( function(max, cur){
        return Math.max(max , cur.score);
      }, 0);

      var minScore = allVisible.reduce( function(min, cur){
        return Math.min(min , cur.score);
      }, 0);

      allVisible.forEach( function(gene){
          gene.normedScore = 0.5 * (gene.score - minScore) / (maxScore - minScore)  + 0.5;
        }
      );
    }
    else{
      allVisible.forEach( function(gene){
        gene.normedScore = null;
      });
    }
  }

  return my;
}
