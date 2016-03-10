describe('QTL Positioner', function () {
  var positioner;

  var makeQTL = function (id, start, end) {
    return { id: id, start: start, end: end, midpoint: (end - start) / 2 + start };
  };

  beforeEach(function () {
    positioner = GENEMAP.QtlPositioner();
  });

  afterEach(function () {
  });

  it('returned list is sorted by descending midpoints', function () {

    var list = [
      makeQTL(1, 100, 200),
      makeQTL(2, 300, 400),
      makeQTL(3, 500, 600),
    ];

    var returned = positioner.sortQTLAnnotations(list);
    var returnedIds = returned.map(function (e) { return e.id; });

    expect(returnedIds).toEqual([1, 2, 3]);
  });

  it('if two regions overlap (not just touch) the second gets an increased position', function () {

    var list = [
      makeQTL(1, 450, 600),
      makeQTL(2, 400, 451),
    ];

    var returned = positioner.sortQTLAnnotations(list);
    var returnedPositions = returned.map(function (e) { return e.position; });

    expect(returnedPositions).toEqual([1, 2]);
  });

  it('if three regions overlap (not just touch) the second and thrid get incresed position', function () {

    var list = [
      makeQTL(1, 450, 600),
      makeQTL(2, 400, 600),
      makeQTL(3, 300, 500),
    ];

    var returned = positioner.sortQTLAnnotations(list);
    var returnedPositions = returned.map(function (e) { return e.position; });

    expect(returnedPositions).toEqual([1, 2, 3]);
  });

  it('regions go back to position 1 after overlapping reigons', function () {

    var list = [
      makeQTL(1, 450, 600),
      makeQTL(2, 400, 600),
      makeQTL(3, 300, 500),
      makeQTL(3, 600, 700),
    ];

    var returned = positioner.sortQTLAnnotations(list);
    var returnedPositions = returned.map(function (e) { return e.position; });

    expect(returnedPositions).toEqual([1, 2, 3, 1]);
  });

  it('region positions will be re-used if one becomes available', function () {

    var list = [
      makeQTL(1, 450, 600), // 1
      makeQTL(2, 400, 600), // 2
      makeQTL(3, 300, 600), // 3
      makeQTL(3, 200, 425), // 1 (instead of 4)
    ];

    var returned = positioner.sortQTLAnnotations(list);
    var returnedPositions = returned.map(function (e) { return e.position; });

    expect(returnedPositions).toEqual([1, 2, 3, 1]);
  });

  it('can cope with thin regions followed by large regions', function () {

    var list = [
      makeQTL(1, 100, 200), // 1
      makeQTL(2, 150, 300), // 2
      makeQTL(3, 220, 250), // 1
      makeQTL(3, 175, 10000), // 3
    ];

    var returned = positioner.sortQTLAnnotations(list);
    var returnedPositions = returned.map(function (e) { return e.position; });

    expect(returnedPositions).toEqual([1, 2, 1, 3]);
  });

  it('position 1 given to non overlapping regions', function () {

    var list = [
      makeQTL(1, 500, 600),
      makeQTL(2, 400, 500),
      makeQTL(3, 300, 400),
    ];

    var returned = positioner.sortQTLAnnotations(list);
    var returnedPositions = returned.map(function (e) { return e.position; });

    expect(returnedPositions).toEqual([1, 1, 1]);
  });
});
