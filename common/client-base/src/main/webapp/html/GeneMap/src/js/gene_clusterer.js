var GENEMAP = GENEMAP || {};

//Group genes into clusters for display
//y is the yscale
GENEMAP.GeneClusterer = function (userConfig) {
  var my = {};

  var defaultConfig = {nClusters: 6};

  var config = _.merge({}, defaultConfig, userConfig);

  my.createClustersFromGenes = function (genes) {
    var result = [];

    //Return empty list if we have no genes
    if (genes.length < 1) {
      return result;
    }

    //Use precanned algorithm for clustering
    //It return list of lists of midpoints

    var nClusters = Math.min(config.nClusters, genes.length);
    var midpoints = genes.map(function(d){
      return d.midpoint;
    });

    clusterPointsList = ss.ckmeans( midpoints, nClusters);

    //Start with all the clusters empty
    var clusterList = [];
    for (var iclus = 0; iclus < clusterPointsList.length; iclus++) {
      clusterList.push([]);
    }

    //Now we append each gene to the correct cluster
    genes.map(function (gene) {

      //which cluster contains this gene's midpoint?
      iCluster = clusterPointsList.findIndex(function (clusterPoints) {
        return clusterPoints.includes(gene.midpoint)
      });

      clusterList[iCluster].push(gene);
    });

    //loop over clusters and add nodes to the result
    clusterList.map(function (genes) {

      //for small clusters, add individual genes
      if (genes.length < 2) {
        result.push.apply(result, genes);
      }

      //for large clusters, add 1 node to hold all of them
      else {
        var averageMidpoint = genes.reduce(function (sum, current) {
            return sum + current.midpoint;
          }, 0) / genes.length;

        //Generate a unique id by concatenating all the gene ids
        var id = genes.reduce(function (sum, current) {
          return sum + current.id.toString();
        }, "");

        var genesCollection = {
          genesList: genes,
          midpoint: averageMidpoint,
          type: "geneslist",
          id: id.toString()
        };

        result.push(genesCollection);
      }
    });

    return result;
  };

  my.nClusters = function (value) {
    if (!arguments.length) {
      return config.nClusters;
    }

    config.nClusters = value;
    return my;
  }

  return my;
};
