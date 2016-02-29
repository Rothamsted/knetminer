describe("AutoLayoutSpec", function() {
  var auto;

  beforeEach(function() {
    auto = GENEMAP.AutoLayoutDecorator();
  });

  afterEach(function() {
  });

  it("returns a drawing the same size as the view portal", function() {
    auto
      .width(1000)
      .height(500);

    var layout = auto.generateLayout(20);

    expect(_.pick(layout.drawing, ['width', 'height'])).toEqual({width: 1000, height:500});
  });

  describe("Fluent API, can get/set", function() {
    it("width", function() {
      auto.width(1000);
      expect(auto.width()).toBe(1000);
    });

    it("height", function() {
      auto.height(500);
      expect(auto.height()).toBe(500);
    });
  });
});
