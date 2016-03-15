describe("Chromosome", function() {
  var c;
  var svg;

  beforeEach(function() {
    c = GENEMAP.Chromosome();
    svg = d3.select("body").append("svg").attr({
      width: 900,
      height: 500
    }).style({
      'margin-top':'40px'
    });
  });

  afterEach(function() {
    d3.selectAll('svg').remove();
  });

  describe("A simple Chromosme", function() {
    beforeEach(function() {
      d3.select("svg").datum({
        bands: [
          {
            start: 0,
            end: 100,
            color: '0xff0000'
          },
          {
            start: 150,
            end: 200,
            color: '0x00ff00'
          },
          {
            start: 200,
            end: 300,
            color: '0x0000ff'
          }
        ],
        index: 1,
        length: 400,
        number: 'One'
      }).call(c);
    });

    it("has the correct number of bands", function() {
      expect(svg.selectAll(".band")[0].length).toBe(3);
    });

    it("includes an outline", function() {
      expect(svg.selectAll('.outline')[0].length).toBe(1);
    });

    it('includes a mask', function() {
      var maskSelection = svg.select("mask");
      expect(maskSelection[0].length).toBe(1);
      expect(maskSelection.node().id).toBe("chromosome_mask_One");
    });
  });


});
