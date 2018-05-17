var GENEMAP = GENEMAP || {};

GENEMAP.QtlPositioner = function () {

  var regionsOverlap = function (regionA, regionB) {
    return regionA.start < regionB.end && regionB.start < regionA.end;
  };

  var my = {};

  my.positionAnnotations = function( annotations, getPosition, setPosition,
                                     startFunction, midFunction, endFunction){

    var start = startFunction;
    var end = endFunction;
    var mid = midFunction;

    var checkOverlap = function( a, b){
      return (start(a) < end(b)) && (start(b) < end(a));
    };

    var input = annotations.sort(function(a,b){
      return mid(a) - mid(b);
    });

    var stack = []

    for ( var i = 0;  i < input.length ; i++ ){

      var iAn = annotations[i];
      var remove = [];

      for ( var j = 0 ; j < stack.length; j++){

        var jAn = input[stack[j]];

        // check the current region still overlaps the regions in the stack
        if (!checkOverlap( iAn, jAn)){
          remove.push(stack[j]);
        }
      }

      var overlap = _.difference(stack, remove);
      var usedPositions = overlap.map(function(k){
        return getPosition(input[k]);
      });

      var pos = 0;
      for (pos = 1; pos < usedPositions.length + 1 ; pos ++){
        if ( usedPositions.indexOf(pos) === -1){
          break;
        }
      }

      setPosition(iAn,pos);
      stack.push(i);
    }

    return input;
 }

  my.sortQTLAnnotations =  function( annotations ){
    return my.positionAnnotations(
      annotations,
      function(node){return node.position},
      function(node, pos){ node.position = pos},
      function(node){return node.start},
      function(node){return node.midpoint},
      function(node){return node.end}
    );
  }

  my.sortQTLLabels = function (nodes, yscale, fontsize) {
    var annotations = nodes;

    var fontCorrection = 0.6;
    var fontScale = fontCorrection * fontsize;

    return my.positionAnnotations(
      annotations,
      function(node){return node.labelPosition },
      function(node, pos){node.labelPosition = pos },
      function(node){ return yscale(node.midpoint) -fontScale * node.screenLabel.length / 2},
      function(node){return node.midpoint},
      function(node){ return yscale(node.midpoint) + fontScale * node.screenLabel.length / 2}
    );
  }

  my.sortQTLAnnotationsWithLabels = function( nodes, yscale, fontsize){
    var annotations = nodes;

    return my.positionAnnotations(
      annotations,
      function(node){return node.comboPosition },
      function(node, pos){node.comboPosition = pos },
      function(node){ return Math.min(yscale(node.midpoint) - node.label.length * fontsize  / 2, node.start)},
      function(node){return node.midpoint},
      function(node){ return Math.max(yscale(node.midpoint) + node.label.length * fontsize  / 2, node.end)}
    );
  }


  return my;
};
