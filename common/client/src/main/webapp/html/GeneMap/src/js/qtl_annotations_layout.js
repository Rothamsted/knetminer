var GENEMAP = GENEMAP || {};

GENEMAP.QTLAnnotationLayout = function (userConfig) {

  var defaultConfig = {};
  var config = _.merge({}, defaultConfig, userConfig);

  var generateChromosomeLayout = function(chromosome){
    positioner = GENEMAP.QtlPositioner();
    return positioner.sortQTLAnnotations(chromosome.layout.qtlDisplayClusters);
  };

  var generateChromosomeClusters = function(chromosome){
    var combiner = GENEMAP.QTLAnnotationCombiner();
    return combiner.combineSimilarQTLAnnotations(chromosome.annotations.qtls);
  };

  my = {};

  my.layoutChromosome = function(chromosome){
    chromosome.layout.qtlNodes = (
    generateChromosomeLayout(chromosome) || chromosome.layout.qtlNodes);
  };

  my.computeChromosomeClusters = function(chromosome){
    chromosome.layout.qtlClusters = generateChromosomeClusters(chromosome);
    chromosome.layout.qtlDisplayClusters = chromosome.layout.qtlClusters.slice();
  };

  return my;
}