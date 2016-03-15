describe('Annotation Reader', function () {
  var simpleQtl = './annotations/simple.xml';
  var reader;

  beforeEach(function () {
    reader = GENEMAP.AnnotationXMLReader();
  });

  afterEach(function () {
  });

  describe('async loading of simple QTL file', function () {
    var returned = null;

    beforeEach(function (done) {

      var data = reader.readAnnotationXML(simpleQtl)
        .then(function (data) {
          returned = data;
          done();
        });
    });

    it('4 features are returned with the ids 1 to 4', function () {
      expect(returned.features.length).toBe(4);

      var ids = returned.features.map(function (f) { return +f.id; });

      expect(ids).toEqual([1, 2, 3, 4]);
    });
  });
});
