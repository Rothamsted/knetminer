var GENEMAP = GENEMAP || {};

// reads from the basemap and (optinally) annotation XML files
GENEMAP.QtlPositioner = function () {

  var regionsOverlap = function (regionA, regionB) {
    return regionA.start < regionB.end && regionB.start < regionA.end;
  };

  var my = {};

  my.sortQTLAnnotations = function (annotations) {

    var qtlData = annotations.sort(function (a, b) {
      return a.midpoint - b.midpoint;
    });

    var stack = [];

    var getPosition = function (i) {
      return qtlData[i].position;
    };

    for (var i = 0; i < qtlData.length; i++) {
      var thisRegion = qtlData[i];

      var remove = [];

      // check the current region still overlaps the regions in the stack
      for (var j = 0; j < stack.length; j++) {
        if (!regionsOverlap(thisRegion, qtlData[stack[j]])) {
          remove.push(stack[j]);
        }
      }

      // remove the regions that don't overlap this one
      var overlap = _.difference(stack, remove);

      var usedPositions = overlap.map(getPosition);
      var pos = 0;
      for (pos = 1; pos < usedPositions.length + 1; pos++) {
        if (usedPositions.indexOf(pos) === -1) {
          break;
        }
      }

      qtlData[i].position = pos;
      stack.push(i);
    }

    return qtlData;
  };

  return my;
};
