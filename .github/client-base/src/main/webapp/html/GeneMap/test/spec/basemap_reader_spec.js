describe('Basemap Reader', function () {
  var simpleQtl = './basemap/simple.xml';
  var reader;

  beforeEach(function () {
    reader = GENEMAP.BasemapXmlReader();
  });

  afterEach(function () {
  });

  describe('async loading of simple QTL file', function () {
    var genome = null;

    beforeEach(function (done) {

      var data = reader.readBasemapXML(simpleQtl)
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
  });
});
