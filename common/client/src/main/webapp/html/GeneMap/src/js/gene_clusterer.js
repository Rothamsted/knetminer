var GENEMAP = GENEMAP || {};

//Group genes into clusters for display
//y is the yscale
GENEMAP.GeneClusterer = function (userConfig){
    var my = {};

    var defaultConfig = { nClusters : 6 };

    var config = _.merge({}, defaultConfig, userConfig);

    my.createClustersFromGenes = function(genes) {
        var result = [];

        //Return empty list if we have no genes
        if (genes.length < 1 )
        {
            return result;
        }

        //Use precanned algorithm for clustering
        //It return list of lists of midpoints
        clusterPoints = ss.ckmeans( genes.map( function(d){ return d.midpoint;} ),
            Math.min(config.nClusters, genes.length) );

        //Now we have to retrieve the genes at each midpoint, populating clusterList
        var clusterList = []
        for (var iclus= 0 ; iclus < clusterPoints.length ; iclus++ )
        {
            clusterList.push([]);
        }

        var in_cluster = function( gene, cluster ) {
            for ( var iGene= 0 ; iGene < cluster.length ; iGene++ ){
                if ( cluster[iGene] == gene.midpoint )
                { return true;}
            }
            return false;
        }

        for ( var iGene = 0 ; iGene < genes.length ; iGene++ ) {

            iCluster = clusterPoints.findIndex( function(d){
                return in_cluster(genes[iGene], d )});

            clusterList[iCluster].push( genes[iGene]);
        }


        //loop over clusters and add nodes to the result
        for ( var iclus= 0 ; iclus < clusterList.length ; iclus++ ) {
            var genes = clusterList[iclus];

            //for small clusters, add individual genes
            if (genes.length < 2) {
                for ( var iGene = 0 ; iGene < genes.length ; iGene ++){
                    result.push( genes[iGene]);
                }
            }
            //for large clusters, add 1 node to hold all of them
            else {
                var averageMidpoint = genes.reduce( function(sum, current){
                        return sum + current.midpoint;
                    }, 0 ) / genes.length;

                var genesCollection = {
                    genesList : genes,
                    midpoint : averageMidpoint,
                    type : "geneslist"
                };

                result.push( genesCollection);
            }
        }

        return result;
    };

    my.nClusters = function(value) {
        if (!arguments.length) {
            return config.nClusters;
        }

        config.nClusters = value;
        return my;
    }

    return my;
};
