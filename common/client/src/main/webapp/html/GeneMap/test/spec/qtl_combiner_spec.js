describe('QTL Combiner', function () {
  var positioner;

  var makeQTL = function (id, start, end) {
    return {
      id: id,
      start: start,
      end: end,
      midpoint: (start - end) / 2 + start,
      type: 'qtl',
      color: '#FFFFFF',
      label: id + '-label',
      link: 'www.example.com/' + id,
    };
  };

  beforeEach(function () {
    combiner = GENEMAP.QTLAnnotationCombiner();
  });

  afterEach(function () {
  });

  it('combines QTL annotations with the same start and end', function () {

    var list = [
      makeQTL(1, 100, 200),
      makeQTL(2, 100, 200),
      makeQTL(3, 100, 300),
    ];

    var returned = combiner.combineSimilarQTLAnnotations(list);

    expect(returned.length).toEqual(2);
  });

  it('combined QTL regions have array properties rather than individual ones', function () {

    var list = [
      makeQTL(1, 100, 200),
      makeQTL(2, 100, 200),
      makeQTL(3, 100, 300),
    ];

    var returned = combiner.combineSimilarQTLAnnotations(list);
    returned.forEach(function (qtl) {
      expect(qtl.hasOwnProperty('color')).toBe(false);
      expect(qtl.hasOwnProperty('label')).toBe(false);
      expect(qtl.hasOwnProperty('link')).toBe(false);

      expect(qtl.hasOwnProperty('colors')).toBe(true);
      expect(qtl.hasOwnProperty('labels')).toBe(true);
      expect(qtl.hasOwnProperty('links')).toBe(true);
    });
  });

  it('combined QTL regions have properties from the individual ones', function () {

    var list = [
      makeQTL(1, 100, 200),
      makeQTL(2, 100, 200),
      makeQTL(3, 100, 300),
    ];

    var returned = combiner.combineSimilarQTLAnnotations(list);

    expect(returned[0].labels).toHaveSameItems(['1-label', '2-label'], true);
    expect(returned[1].labels).toHaveSameItems(['3-label'], true);
  });
});
