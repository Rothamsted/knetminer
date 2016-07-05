var GENEMAP = GENEMAP || {};

//Group genes into clusters for display
//y is the yscale
GENEMAP.GeneClusterer = function (userConfig){
    var my = {};

    var defaultConfig = {};

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
        cluster_points = ss.ckmeans( genes.map( function(d){ return d.midpoint;} ), Math.min(6, genes.length) );

        //Now we have to retrieve the genes at each midpoint, populating cluster_dict
        var cluster_dict = []
        for ( var iclus= 0 ; iclus < cluster_points.length ; iclus++ )
        {
            cluster_dict.push([]);
        }

        var in_cluster = function( gene, cluster ) {
            for ( var iGene= 0 ; iGene < cluster.length ; iGene++ ){
                if ( cluster[iGene] == gene.midpoint )
                { return true;}
            }
            return false;
        }

        for ( var iGene = 0 ; iGene < genes.length ; iGene++ ) {

            iCluster = cluster_points.findIndex( function(d){
                return in_cluster(genes[iGene], d )});

            cluster_dict[iCluster].push( genes[iGene]);
        }


        //loop over clusters and add nodes to the result
        for ( var iclus= 0 ; iclus < cluster_dict.length ; iclus++ ) {
            var genes = cluster_dict[iclus];

            //for small clusters, add individual genes
            if (genes.length < 2) {
                for ( var iGene = 0 ; iGene < genes.length ; iGene ++){
                    result.push( genes[iGene]);
                }
            }
            //for large clusters, add 1 node to hold all of them
            else {
                var average_midpoint = genes.reduce( function(sum, current){
                        return sum + current.midpoint;
                    }, 0 ) / genes.length;

                var genes_collection = {
                    genes_list : genes,
                    midpoint : average_midpoint,
                    type : "geneslist"
                };

                result.push( genes_collection);
            }
        }

        return result;
    };

    return my;
};
