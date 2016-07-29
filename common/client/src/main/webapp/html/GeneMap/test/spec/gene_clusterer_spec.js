describe('Gene Clusterer', function () {

  beforeEach(function () {
    clusterer = GENEMAP.GeneClusterer();

    genes = [
    {id: "g1", midpoint: 1, type: "gene"},
    {id: "g2", midpoint: 2, type: "gene"},
    {id: "g3", midpoint: 3, type: "gene"},
    {id: "g4", midpoint: 7, type: "gene"},
    {id: "g5", midpoint: 8, type: "gene"},
    {id: "g6", midpoint: 20, type: "gene"},
    ]
    ;
  })

  afterEach(function () {
  });

  it('preserves all the genes', function () {

    geneClusters = clusterer.createClustersFromGenes(genes)

    preservedIDs = [];
    for (var iClus = 0; iClus < geneClusters.length; iClus++) {
      cluster = geneClusters[iClus];
      if (cluster.type == "gene") {
        preservedIDs.push(cluster.id);
      }
      if (cluster.type == "geneslist") {
        for (var iGene = 0; iGene < cluster.genesList.length; iGene++) {
          gene = cluster.genesList[iGene];
          preservedIDs.push(gene.id);
        }
      }
    }

    expect(preservedIDs).toEqual( [ "g1", "g2", "g3", "g4", "g5", "g6" ]);

  })
})