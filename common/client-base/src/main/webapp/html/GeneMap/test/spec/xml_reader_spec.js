describe('XML Reader', function () {
  var simpleBasemap = './basemap/simple.xml';
  var simpleAnnotation = './annotations/simple.xml';
  var reader;

  beforeEach(function () {
    reader = GENEMAP.XmlDataReader();
  });

  afterEach(function () {
  });

  describe('async loading of simple QTL file', function () {
    var genome = null;

    beforeEach(function (done) {

      var data = reader.readXMLData(simpleBasemap, simpleAnnotation)
        .then(function (data) {
          genome = data;
          done();
        });
    });

    it('3 chromosomes are returned with the numbers A, B and C.', function () {
      expect(genome.chromosomes.length).toBe(3);

      var numbers = genome.chromosomes.map(function (f) { return f.number; });

      expect(numbers).toEqual(['A', 'B', 'C']);
    });

    it('the genome contains 4 features with the ids 1 to 4', function () {

      var ids = [];
      for (var i = 0; i < genome.chromosomes.length; i++) {
        var chromosome = genome.chromosomes[i];

        var qtlIds = chromosome.annotations.qtls.map(function (f) { return +f.id; });
        ids.push.apply(ids, qtlIds);
      }

      expect(ids).toHaveSameItems([1, 2, 3, 4], true);
    });
  });
});
