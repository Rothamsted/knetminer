describe('AutoLayoutSpec', function () {
  var auto;

  beforeEach(function () {
    auto = GENEMAP.AutoLayoutDecorator();
  });

  afterEach(function () {
  });

  describe('Fluent API, can get/set', function () {
    it('width', function () {
      auto.width(1000);
      expect(auto.width()).toBe(1000);
    });

    it('height', function () {
      auto.height(500);
      expect(auto.height()).toBe(500);
    });
  });
});
