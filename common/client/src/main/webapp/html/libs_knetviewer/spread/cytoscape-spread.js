(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var foograph = {
  /**
   * Insert a vertex into this graph.
   *
   * @param vertex A valid Vertex instance
   */
  insertVertex: function(vertex) {
      this.vertices.push(vertex);
      this.vertexCount++;
    },

  /**
   * Insert an edge vertex1 --> vertex2.
   *
   * @param label Label for this edge
   * @param weight Weight of this edge
   * @param vertex1 Starting Vertex instance
   * @param vertex2 Ending Vertex instance
   * @return Newly created Edge instance
   */
  insertEdge: function(label, weight, vertex1, vertex2, style) {
      var e1 = new foograph.Edge(label, weight, vertex2, style);
      var e2 = new foograph.Edge(null, weight, vertex1, null);

      vertex1.edges.push(e1);
      vertex2.reverseEdges.push(e2);

      return e1;
    },

  /**
   * Delete edge.
   *
   * @param vertex Starting vertex
   * @param edge Edge to remove
   */
  removeEdge: function(vertex1, vertex2) {
      for (var i = vertex1.edges.length - 1; i >= 0; i--) {
        if (vertex1.edges[i].endVertex == vertex2) {
          vertex1.edges.splice(i,1);
          break;
        }
      }

      for (var i = vertex2.reverseEdges.length - 1; i >= 0; i--) {
        if (vertex2.reverseEdges[i].endVertex == vertex1) {
          vertex2.reverseEdges.splice(i,1);
          break;
        }
      }
    },

  /**
   * Delete vertex.
   *
   * @param vertex Vertex to remove from the graph
   */
  removeVertex: function(vertex) {
      for (var i = vertex.edges.length - 1; i >= 0; i-- ) {
        this.removeEdge(vertex, vertex.edges[i].endVertex);
      }

      for (var i = vertex.reverseEdges.length - 1; i >= 0; i-- ) {
        this.removeEdge(vertex.reverseEdges[i].endVertex, vertex);
      }

      for (var i = this.vertices.length - 1; i >= 0; i-- ) {
        if (this.vertices[i] == vertex) {
          this.vertices.splice(i,1);
          break;
        }
      }

      this.vertexCount--;
    },

  /**
   * Plots this graph to a canvas.
   *
   * @param canvas A proper canvas instance
   */
  plot: function(canvas) {
      var i = 0;
      /* Draw edges first */
      for (i = 0; i < this.vertices.length; i++) {
        var v = this.vertices[i];
        if (!v.hidden) {
          for (var j = 0; j < v.edges.length; j++) {
            var e = v.edges[j];
            /* Draw edge (if not hidden) */
            if (!e.hidden)
              e.draw(canvas, v);
          }
        }
      }

      /* Draw the vertices. */
      for (i = 0; i < this.vertices.length; i++) {
        v = this.vertices[i];

        /* Draw vertex (if not hidden) */
        if (!v.hidden)
          v.draw(canvas);
      }
    },

  /**
   * Graph object constructor.
   *
   * @param label Label of this graph
   * @param directed true or false
   */
  Graph: function (label, directed) {
      /* Fields. */
      this.label = label;
      this.vertices = new Array();
      this.directed = directed;
      this.vertexCount = 0;

      /* Graph methods. */
      this.insertVertex = foograph.insertVertex;
      this.removeVertex = foograph.removeVertex;
      this.insertEdge = foograph.insertEdge;
      this.removeEdge = foograph.removeEdge;
      this.plot = foograph.plot;
    },

  /**
   * Vertex object constructor.
   *
   * @param label Label of this vertex
   * @param next Reference to the next vertex of this graph
   * @param firstEdge First edge of a linked list of edges
   */
  Vertex: function(label, x, y, style) {
      this.label = label;
      this.edges = new Array();
      this.reverseEdges = new Array();
      this.x = x;
      this.y = y;
      this.dx = 0;
      this.dy = 0;
      this.level = -1;
      this.numberOfParents = 0;
      this.hidden = false;
      this.fixed = false;     // Fixed vertices are static (unmovable)

      if(style != null) {
          this.style = style;
      }
      else { // Default
          this.style = new foograph.VertexStyle('ellipse', 80, 40, '#ffffff', '#000000', true);
      }
    },


   /**
   * VertexStyle object type for defining vertex style options.
   *
   * @param shape Shape of the vertex ('ellipse' or 'rect')
   * @param width Width in px
   * @param height Height in px
   * @param fillColor The color with which the vertex is drawn (RGB HEX string)
   * @param borderColor The color with which the border of the vertex is drawn (RGB HEX string)
   * @param showLabel Show the vertex label or not
   */
  VertexStyle: function(shape, width, height, fillColor, borderColor, showLabel) {
      this.shape = shape;
      this.width = width;
      this.height = height;
      this.fillColor = fillColor;
      this.borderColor = borderColor;
      this.showLabel = showLabel;
    },

  /**
   * Edge object constructor.
   *
   * @param label Label of this edge
   * @param next Next edge reference
   * @param weight Edge weight
   * @param endVertex Destination Vertex instance
   */
  Edge: function (label, weight, endVertex, style) {
      this.label = label;
      this.weight = weight;
      this.endVertex = endVertex;
      this.style = null;
      this.hidden = false;

      // Curving information
      this.curved = false;
      this.controlX = -1;   // Control coordinates for Bezier curve drawing
      this.controlY = -1;
      this.original = null; // If this is a temporary edge it holds the original edge

      if(style != null) {
        this.style = style;
      }
      else {  // Set to default
        this.style = new foograph.EdgeStyle(2, '#000000', true, false);
      }
    },



  /**
   * EdgeStyle object type for defining vertex style options.
   *
   * @param width Edge line width
   * @param color The color with which the edge is drawn
   * @param showArrow Draw the edge arrow (only if directed)
   * @param showLabel Show the edge label or not
   */
  EdgeStyle: function(width, color, showArrow, showLabel) {
      this.width = width;
      this.color = color;
      this.showArrow = showArrow;
      this.showLabel = showLabel;
    },

  /**
   * This file is part of foograph Javascript graph library.
   *
   * Description: Random vertex layout manager
   */

  /**
   * Class constructor.
   *
   * @param width Layout width
   * @param height Layout height
   */
  RandomVertexLayout: function (width, height) {
      this.width = width;
      this.height = height;
    },


  /**
   * This file is part of foograph Javascript graph library.
   *
   * Description: Fruchterman-Reingold force-directed vertex
   *              layout manager
   */

  /**
   * Class constructor.
   *
   * @param width Layout width
   * @param height Layout height
   * @param iterations Number of iterations -
   * with more iterations it is more likely the layout has converged into a static equilibrium.
   */
  ForceDirectedVertexLayout: function (width, height, iterations, randomize, eps) {
      this.width = width;
      this.height = height;
      this.iterations = iterations;
      this.randomize = randomize;
      this.eps = eps;
      this.callback = function() {};
    },

  A: 1.5, // Fine tune attraction

  R: 0.5  // Fine tune repulsion
};

/**
 * toString overload for easier debugging
 */
foograph.Vertex.prototype.toString = function() {
  return "[v:" + this.label + "] ";
};

/**
 * toString overload for easier debugging
 */
foograph.Edge.prototype.toString = function() {
  return "[e:" + this.endVertex.label + "] ";
};

/**
 * Draw vertex method.
 *
 * @param canvas jsGraphics instance
 */
foograph.Vertex.prototype.draw = function(canvas) {
  var x = this.x;
  var y = this.y;
  var width = this.style.width;
  var height = this.style.height;
  var shape = this.style.shape;

  canvas.setStroke(2);
  canvas.setColor(this.style.fillColor);

  if(shape == 'rect') {
    canvas.fillRect(x, y, width, height);
    canvas.setColor(this.style.borderColor);
    canvas.drawRect(x, y, width, height);
  }
  else { // Default to ellipse
    canvas.fillEllipse(x, y, width, height);
    canvas.setColor(this.style.borderColor);
    canvas.drawEllipse(x, y, width, height);
  }

  if(this.style.showLabel) {
    canvas.drawStringRect(this.label, x, y + height/2 - 7, width, 'center');
  }
};

/**
 * Fits the graph into the bounding box
 *
 * @param width
 * @param height
 * @param preserveAspect
 */
foograph.Graph.prototype.normalize = function(width, height, preserveAspect) {
  for (var i8 in this.vertices) {
    var v = this.vertices[i8];
    v.oldX = v.x;
    v.oldY = v.y;
  }
  var mnx = width  * 0.1;
  var mxx = width  * 0.9;
  var mny = height * 0.1;
  var mxy = height * 0.9;
  if (preserveAspect == null)
    preserveAspect = true;

  var minx = Number.MAX_VALUE;
  var miny = Number.MAX_VALUE;
  var maxx = Number.MIN_VALUE;
  var maxy = Number.MIN_VALUE;

  for (var i7 in this.vertices) {
    var v = this.vertices[i7];
    if (v.x < minx) minx = v.x;
    if (v.y < miny) miny = v.y;
    if (v.x > maxx) maxx = v.x;
    if (v.y > maxy) maxy = v.y;
  }
  var kx = (mxx-mnx) / (maxx - minx);
  var ky = (mxy-mny) / (maxy - miny);

  if (preserveAspect) {
    kx = Math.min(kx, ky);
    ky = Math.min(kx, ky);
  }

  var newMaxx = Number.MIN_VALUE;
  var newMaxy = Number.MIN_VALUE;
  for (var i8 in this.vertices) {
    var v = this.vertices[i8];
    v.x = (v.x - minx) * kx;
    v.y = (v.y - miny) * ky;
    if (v.x > newMaxx) newMaxx = v.x;
    if (v.y > newMaxy) newMaxy = v.y;
  }

  var dx = ( width  - newMaxx ) / 2.0;
  var dy = ( height - newMaxy ) / 2.0;
  for (var i8 in this.vertices) {
    var v = this.vertices[i8];
    v.x += dx;
    v.y += dy;
  }
};

/**
 * Draw edge method. Draws edge "v" --> "this".
 *
 * @param canvas jsGraphics instance
 * @param v Start vertex
 */
foograph.Edge.prototype.draw = function(canvas, v) {
  var x1 = Math.round(v.x + v.style.width/2);
  var y1 = Math.round(v.y + v.style.height/2);
  var x2 = Math.round(this.endVertex.x + this.endVertex.style.width/2);
  var y2 = Math.round(this.endVertex.y + this.endVertex.style.height/2);

  // Control point (needed only for curved edges)
  var x3 = this.controlX;
  var y3 = this.controlY;

  // Arrow tip and angle
  var X_TIP, Y_TIP, ANGLE;

  /* Quadric Bezier curve definition. */
  function Bx(t) { return (1-t)*(1-t)*x1 + 2*(1-t)*t*x3 + t*t*x2; }
  function By(t) { return (1-t)*(1-t)*y1 + 2*(1-t)*t*y3 + t*t*y2; }

  canvas.setStroke(this.style.width);
  canvas.setColor(this.style.color);

  if(this.curved) { // Draw a quadric Bezier curve
    this.curved = false; // Reset
    var t = 0, dt = 1/10;
    var xs = x1, ys = y1, xn, yn;

    while (t < 1-dt) {
      t += dt;
      xn = Bx(t);
      yn = By(t);
      canvas.drawLine(xs, ys, xn, yn);
      xs = xn;
      ys = yn;
    }

    // Set the arrow tip coordinates
    X_TIP = xs;
    Y_TIP = ys;

    // Move the tip to (0,0) and calculate the angle
    // of the arrow head
    ANGLE = angularCoord(Bx(1-2*dt) - X_TIP, By(1-2*dt) - Y_TIP);

  } else {
    canvas.drawLine(x1, y1, x2, y2);

    // Set the arrow tip coordinates
    X_TIP = x2;
    Y_TIP = y2;

    // Move the tip to (0,0) and calculate the angle
    // of the arrow head
    ANGLE = angularCoord(x1 - X_TIP, y1 - Y_TIP);
  }

  if(this.style.showArrow) {
    drawArrow(ANGLE, X_TIP, Y_TIP);
  }

  // TODO
  if(this.style.showLabel) {
  }

  /**
   * Draws an edge arrow.
   * @param phi The angle (in radians) of the arrow in polar coordinates.
   * @param x X coordinate of the arrow tip.
   * @param y Y coordinate of the arrow tip.
   */
  function drawArrow(phi, x, y)
  {
    // Arrow bounding box (in px)
    var H = 50;
    var W = 10;

    // Set cartesian coordinates of the arrow
    var p11 = 0, p12 = 0;
    var p21 = H, p22 = W/2;
    var p31 = H, p32 = -W/2;

    // Convert to polar coordinates
    var r2 = radialCoord(p21, p22);
    var r3 = radialCoord(p31, p32);
    var phi2 = angularCoord(p21, p22);
    var phi3 = angularCoord(p31, p32);

    // Rotate the arrow
    phi2 += phi;
    phi3 += phi;

    // Update cartesian coordinates
    p21 = r2 * Math.cos(phi2);
    p22 = r2 * Math.sin(phi2);
    p31 = r3 * Math.cos(phi3);
    p32 = r3 * Math.sin(phi3);

    // Translate
    p11 += x;
    p12 += y;
    p21 += x;
    p22 += y;
    p31 += x;
    p32 += y;

    // Draw
    canvas.fillPolygon(new Array(p11, p21, p31), new Array(p12, p22, p32));
  }

  /**
   * Get the angular coordinate.
   * @param x X coordinate
   * @param y Y coordinate
   */
   function angularCoord(x, y)
   {
     var phi = 0.0;

     if (x > 0 && y >= 0) {
      phi = Math.atan(y/x);
     }
     if (x > 0 && y < 0) {
       phi = Math.atan(y/x) + 2*Math.PI;
     }
     if (x < 0) {
       phi = Math.atan(y/x) + Math.PI;
     }
     if (x = 0 && y > 0) {
       phi = Math.PI/2;
     }
     if (x = 0 && y < 0) {
       phi = 3*Math.PI/2;
     }

     return phi;
   }

   /**
    * Get the radian coordiante.
    * @param x1
    * @param y1
    * @param x2
    * @param y2
    */
   function radialCoord(x, y)
   {
     return Math.sqrt(x*x + y*y);
   }
};

/**
 * Calculates the coordinates based on pure chance.
 *
 * @param graph A valid graph instance
 */
foograph.RandomVertexLayout.prototype.layout = function(graph) {
  for (var i = 0; i<graph.vertices.length; i++) {
    var v = graph.vertices[i];
    v.x = Math.round(Math.random() * this.width);
    v.y = Math.round(Math.random() * this.height);
  }
};

/**
 * Identifies connected components of a graph and creates "central"
 * vertices for each component. If there is more than one component,
 * all central vertices of individual components are connected to
 * each other to prevent component drift.
 *
 * @param graph A valid graph instance
 * @return A list of component center vertices or null when there
 *         is only one component.
 */
foograph.ForceDirectedVertexLayout.prototype.__identifyComponents = function(graph) {
  var componentCenters = new Array();
  var components = new Array();

  // Depth first search
  function dfs(vertex)
  {
    var stack = new Array();
    var component = new Array();
    var centerVertex = new foograph.Vertex("component_center", -1, -1);
    centerVertex.hidden = true;
    componentCenters.push(centerVertex);
    components.push(component);

    function visitVertex(v)
    {
      component.push(v);
      v.__dfsVisited = true;

      for (var i in v.edges) {
        var e = v.edges[i];
        if (!e.hidden)
          stack.push(e.endVertex);
      }

      for (var i in v.reverseEdges) {
        if (!v.reverseEdges[i].hidden)
          stack.push(v.reverseEdges[i].endVertex);
      }
    }

    visitVertex(vertex);
    while (stack.length > 0) {
      var u = stack.pop();

      if (!u.__dfsVisited && !u.hidden) {
        visitVertex(u);
      }
    }
  }

  // Clear DFS visited flag
  for (var i in graph.vertices) {
    var v = graph.vertices[i];
    v.__dfsVisited = false;
  }

  // Iterate through all vertices starting DFS from each vertex
  // that hasn't been visited yet.
  for (var k in graph.vertices) {
    var v = graph.vertices[k];
    if (!v.__dfsVisited && !v.hidden)
      dfs(v);
  }

  // Interconnect all center vertices
  if (componentCenters.length > 1) {
    for (var i in componentCenters) {
      graph.insertVertex(componentCenters[i]);
    }
    for (var i in components) {
      for (var j in components[i]) {
        // Connect visited vertex to "central" component vertex
        edge = graph.insertEdge("", 1, components[i][j], componentCenters[i]);
        edge.hidden = true;
      }
    }

    for (var i in componentCenters) {
      for (var j in componentCenters) {
        if (i != j) {
          e = graph.insertEdge("", 3, componentCenters[i], componentCenters[j]);
          e.hidden = true;
        }
      }
    }

    return componentCenters;
  }

  return null;
};

/**
 * Calculates the coordinates based on force-directed placement
 * algorithm.
 *
 * @param graph A valid graph instance
 */
foograph.ForceDirectedVertexLayout.prototype.layout = function(graph) {
  this.graph = graph;
  var area = this.width * this.height;
  var k = Math.sqrt(area / graph.vertexCount);

  var t = this.width / 10; // Temperature.
  var dt = t / (this.iterations + 1);

  var eps = this.eps; // Minimum distance between the vertices

  // Attractive and repulsive forces
  function Fa(z) { return foograph.A*z*z/k; }
  function Fr(z) { return foograph.R*k*k/z; }
  function Fw(z) { return 1/z*z; }  // Force emited by the walls

  // Initiate component identification and virtual vertex creation
  // to prevent disconnected graph components from drifting too far apart
  centers = this.__identifyComponents(graph);

  // Assign initial random positions
  if(this.randomize) {
    randomLayout = new foograph.RandomVertexLayout(this.width, this.height);
    randomLayout.layout(graph);
  }

  // Run through some iterations
  for (var q = 0; q < this.iterations; q++) {

    /* Calculate repulsive forces. */
    for (var i1 in graph.vertices) {
      var v = graph.vertices[i1];

      v.dx = 0;
      v.dy = 0;
      // Do not move fixed vertices
      if(!v.fixed) {
        for (var i2 in graph.vertices) {
          var u = graph.vertices[i2];
          if (v != u && !u.fixed) {
            /* Difference vector between the two vertices. */
            var difx = v.x - u.x;
            var dify = v.y - u.y;

            /* Length of the dif vector. */
            var d = Math.max(eps, Math.sqrt(difx*difx + dify*dify));
            var force = Fr(d);
            v.dx = v.dx + (difx/d) * force;
            v.dy = v.dy + (dify/d) * force;
          }
        }
        /* Treat the walls as static objects emiting force Fw. */
        // Calculate the sum of "wall" forces in (v.x, v.y)
        /*
        var x = Math.max(eps, v.x);
        var y = Math.max(eps, v.y);
        var wx = Math.max(eps, this.width - v.x);
        var wy = Math.max(eps, this.height - v.y);   // Gotta love all those NaN's :)
        var Rx = Fw(x) - Fw(wx);
        var Ry = Fw(y) - Fw(wy);

        v.dx = v.dx + Rx;
        v.dy = v.dy + Ry;
        */
      }
    }

    /* Calculate attractive forces. */
    for (var i3 in graph.vertices) {
      var v = graph.vertices[i3];

      // Do not move fixed vertices
      if(!v.fixed) {
        for (var i4 in v.edges) {
          var e = v.edges[i4];
          var u = e.endVertex;
          var difx = v.x - u.x;
          var dify = v.y - u.y;
          var d = Math.max(eps, Math.sqrt(difx*difx + dify*dify));
          var force = Fa(d);

          /* Length of the dif vector. */
          var d = Math.max(eps, Math.sqrt(difx*difx + dify*dify));
          v.dx = v.dx - (difx/d) * force;
          v.dy = v.dy - (dify/d) * force;

          u.dx = u.dx + (difx/d) * force;
          u.dy = u.dy + (dify/d) * force;
        }
      }
    }

    /* Limit the maximum displacement to the temperature t
        and prevent from being displaced outside frame.     */
    for (var i5 in graph.vertices) {
      var v = graph.vertices[i5];
      if(!v.fixed) {
        /* Length of the displacement vector. */
        var d = Math.max(eps, Math.sqrt(v.dx*v.dx + v.dy*v.dy));

        /* Limit to the temperature t. */
        v.x = v.x + (v.dx/d) * Math.min(d, t);
        v.y = v.y + (v.dy/d) * Math.min(d, t);

        /* Stay inside the frame. */
        /*
        borderWidth = this.width / 50;
        if (v.x < borderWidth) {
          v.x = borderWidth;
        } else if (v.x > this.width - borderWidth) {
          v.x = this.width - borderWidth;
        }

        if (v.y < borderWidth) {
          v.y = borderWidth;
        } else if (v.y > this.height - borderWidth) {
          v.y = this.height - borderWidth;
        }
        */
        v.x = Math.round(v.x);
        v.y = Math.round(v.y);
      }
    }

    /* Cool. */
    t -= dt;

    if (q % 10 == 0) {
      this.callback();
    }
  }

  // Remove virtual center vertices
  if (centers) {
    for (var i in centers) {
      graph.removeVertex(centers[i]);
    }
  }

  graph.normalize(this.width, this.height, true);
};

module.exports = foograph;

},{}],2:[function(_dereq_,module,exports){
'use strict';

(function(){

  // registers the extension on a cytoscape lib ref
  var getLayout = _dereq_('./layout');
  var register = function( cytoscape ){
    var layout = getLayout( cytoscape );

    cytoscape('layout', 'spread', layout);
  };

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-spread', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape );
  }

})();

},{"./layout":3}],3:[function(_dereq_,module,exports){
var Thread;

var foograph = _dereq_('./foograph');
var Voronoi = _dereq_('./rhill-voronoi-core');

/*
 * This layout combines several algorithms:
 *
 * - It generates an initial position of the nodes by using the
 *   Fruchterman-Reingold algorithm (doi:10.1002/spe.4380211102)
 *
 * - Finally it eliminates overlaps by using the method described by
 *   Gansner and North (doi:10.1007/3-540-37623-2_28)
 */

var defaults = {
  animate: true, // whether to show the layout as it's running
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  fit: true, // Reset viewport to fit default simulationBounds
  minDist: 20, // Minimum distance between nodes
  padding: 20, // Padding
  expandingFactor: -1.0, // If the network does not satisfy the minDist
  // criterium then it expands the network of this amount
  // If it is set to -1.0 the amount of expansion is automatically
  // calculated based on the minDist, the aspect ratio and the
  // number of nodes
  maxFruchtermanReingoldIterations: 50, // Maximum number of initial force-directed iterations
  maxExpandIterations: 4, // Maximum number of expanding iterations
  boundingBox: undefined, // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  randomize: false // uses random initial node positions on true
};

function SpreadLayout( options ) {
  var opts = this.options = {};
  for( var i in defaults ){ opts[i] = defaults[i]; }
  for( var i in options ){ opts[i] = options[i]; }
}

SpreadLayout.prototype.run = function() {

  var layout = this;
  var options = this.options;
  var cy = options.cy;

  var bb = options.boundingBox || { x1: 0, y1: 0, w: cy.width(), h: cy.height() };
  if( bb.x2 === undefined ){ bb.x2 = bb.x1 + bb.w; }
  if( bb.w === undefined ){ bb.w = bb.x2 - bb.x1; }
  if( bb.y2 === undefined ){ bb.y2 = bb.y1 + bb.h; }
  if( bb.h === undefined ){ bb.h = bb.y2 - bb.y1; }

  var nodes = cy.nodes();
  var edges = cy.edges();
  var cWidth = cy.width();
  var cHeight = cy.height();
  var simulationBounds = bb;
  var padding = options.padding;
  var simBBFactor = Math.max( 1, Math.log(nodes.length) * 0.8 );

  if( nodes.length < 100 ){
    simBBFactor /= 2;
  }

  layout.trigger( {
    type: 'layoutstart',
    layout: layout
  } );

  var simBB = {
    x1: 0,
    y1: 0,
    x2: cWidth * simBBFactor,
    y2: cHeight * simBBFactor
  };

  if( simulationBounds ) {
    simBB.x1 = simulationBounds.x1;
    simBB.y1 = simulationBounds.y1;
    simBB.x2 = simulationBounds.x2;
    simBB.y2 = simulationBounds.y2;
  }

  simBB.x1 += padding;
  simBB.y1 += padding;
  simBB.x2 -= padding;
  simBB.y2 -= padding;

  var width = simBB.x2 - simBB.x1;
  var height = simBB.y2 - simBB.y1;

  // Get start time
  var startTime = Date.now();

  // layout doesn't work with just 1 node
  if( nodes.size() <= 1 ) {
    nodes.positions( {
      x: Math.round( ( simBB.x1 + simBB.x2 ) / 2 ),
      y: Math.round( ( simBB.y1 + simBB.y2 ) / 2 )
    } );

    if( options.fit ) {
      cy.fit( options.padding );
    }

    // Get end time
    var endTime = Date.now();
    console.info( "Layout on " + nodes.size() + " nodes took " + ( endTime - startTime ) + " ms" );

    layout.one( "layoutready", options.ready );
    layout.trigger( "layoutready" );

    layout.one( "layoutstop", options.stop );
    layout.trigger( "layoutstop" );

    return;
  }

  // First I need to create the data structure to pass to the worker
  var pData = {
    'width': width,
    'height': height,
    'minDist': options.minDist,
    'expFact': options.expandingFactor,
    'expIt': 0,
    'maxExpIt': options.maxExpandIterations,
    'vertices': [],
    'edges': [],
    'startTime': startTime,
    'maxFruchtermanReingoldIterations': options.maxFruchtermanReingoldIterations
  };

  nodes.each(
    function( i, node ) {
      var nodeId = node.id();
      var pos = node.position();

      if( options.randomize ){
        pos = {
          x: Math.round( simBB.x1 + (simBB.x2 - simBB.x1) * Math.random() ),
          y: Math.round( simBB.y1 + (simBB.y2 - simBB.y1) * Math.random() )
        };
      }

      pData[ 'vertices' ].push( {
        id: nodeId,
        x: pos.x,
        y: pos.y
      } );
    } );

  edges.each(
    function() {
      var srcNodeId = this.source().id();
      var tgtNodeId = this.target().id();
      pData[ 'edges' ].push( {
        src: srcNodeId,
        tgt: tgtNodeId
      } );
    } );

  //Decleration
  var t1 = layout.thread;

  // reuse old thread if possible
  if( !t1 || t1.stopped() ){
    t1 = layout.thread = Thread();

    // And to add the required scripts
    //EXTERNAL 1
    t1.require( foograph, 'foograph' );
    //EXTERNAL 2
    t1.require( Voronoi, 'Voronoi' );
  }

  function setPositions( pData ){ //console.log('set posns')
    // First we retrieve the important data
    // var expandIteration = pData[ 'expIt' ];
    var dataVertices = pData[ 'vertices' ];
    var vertices = [];
    for( var i = 0; i < dataVertices.length; ++i ) {
      var dv = dataVertices[ i ];
      vertices[ dv.id ] = {
        x: dv.x,
        y: dv.y
      };
    }
    /*
     * FINALLY:
     *
     * We position the nodes based on the calculation
     */
    nodes.positions(
      function( i, node ) {
        var id = node.id()
        var vertex = vertices[ id ];

        return {
          x: Math.round( simBB.x1 + vertex.x ),
          y: Math.round( simBB.y1 + vertex.y )
        };
      } );

    if( options.fit ) {
      cy.fit( options.padding );
    }

    cy.nodes().rtrigger( "position" );
  }

  var didLayoutReady = false;
  t1.on('message', function(e){
    var pData = e.message; //console.log('message', e)

    if( !options.animate ){
      return;
    }

    setPositions( pData );

    if( !didLayoutReady ){
      layout.trigger( "layoutready" );

      didLayoutReady = true;
    }
  });

  layout.one( "layoutready", options.ready );

  t1.pass( pData ).run( function( pData ) {

    function cellCentroid( cell ) {
      var hes = cell.halfedges;
      var area = 0,
        x = 0,
        y = 0;
      var p1, p2, f;

      for( var i = 0; i < hes.length; ++i ) {
        p1 = hes[ i ].getEndpoint();
        p2 = hes[ i ].getStartpoint();

        area += p1.x * p2.y;
        area -= p1.y * p2.x;

        f = p1.x * p2.y - p2.x * p1.y;
        x += ( p1.x + p2.x ) * f;
        y += ( p1.y + p2.y ) * f;
      }

      area /= 2;
      f = area * 6;
      return {
        x: x / f,
        y: y / f
      };
    }

    function sitesDistance( ls, rs ) {
      var dx = ls.x - rs.x;
      var dy = ls.y - rs.y;
      return Math.sqrt( dx * dx + dy * dy );
    }

    foograph = eval('foograph');
    Voronoi = eval('Voronoi');

    // I need to retrieve the important data
    var lWidth = pData[ 'width' ];
    var lHeight = pData[ 'height' ];
    var lMinDist = pData[ 'minDist' ];
    var lExpFact = pData[ 'expFact' ];
    var lMaxExpIt = pData[ 'maxExpIt' ];
    var lMaxFruchtermanReingoldIterations = pData[ 'maxFruchtermanReingoldIterations' ];

    // Prepare the data to output
    var savePositions = function(){
      pData[ 'width' ] = lWidth;
      pData[ 'height' ] = lHeight;
      pData[ 'expIt' ] = expandIteration;
      pData[ 'expFact' ] = lExpFact;

      pData[ 'vertices' ] = [];
      for( var i = 0; i < fv.length; ++i ) {
        pData[ 'vertices' ].push( {
          id: fv[ i ].label,
          x: fv[ i ].x,
          y: fv[ i ].y
        } );
      }
    };

    var messagePositions = function(){
      broadcast( pData );
    };

    /*
     * FIRST STEP: Application of the Fruchterman-Reingold algorithm
     *
     * We use the version implemented by the foograph library
     *
     * Ref.: https://code.google.com/p/foograph/
     */

    // We need to create an instance of a graph compatible with the library
    var frg = new foograph.Graph( "FRgraph", false );

    var frgNodes = {};

    // Then we have to add the vertices
    var dataVertices = pData[ 'vertices' ];
    for( var ni = 0; ni < dataVertices.length; ++ni ) {
      var id = dataVertices[ ni ][ 'id' ];
      var v = new foograph.Vertex( id, Math.round( Math.random() * lHeight ), Math.round( Math.random() * lHeight ) );
      frgNodes[ id ] = v;
      frg.insertVertex( v );
    }

    var dataEdges = pData[ 'edges' ];
    for( var ei = 0; ei < dataEdges.length; ++ei ) {
      var srcNodeId = dataEdges[ ei ][ 'src' ];
      var tgtNodeId = dataEdges[ ei ][ 'tgt' ];
      frg.insertEdge( "", 1, frgNodes[ srcNodeId ], frgNodes[ tgtNodeId ] );
    }

    var fv = frg.vertices;

    // Then we apply the layout
    var iterations = lMaxFruchtermanReingoldIterations;
    var frLayoutManager = new foograph.ForceDirectedVertexLayout( lWidth, lHeight, iterations, false, lMinDist );

    frLayoutManager.callback = function(){
      savePositions();
      messagePositions();
    };

    frLayoutManager.layout( frg );

    savePositions();
    messagePositions();

    /*
     * SECOND STEP: Tiding up of the graph.
     *
     * We use the method described by Gansner and North, based on Voronoi
     * diagrams.
     *
     * Ref: doi:10.1007/3-540-37623-2_28
     */

    // We calculate the Voronoi diagram dor the position of the nodes
    var voronoi = new Voronoi();
    var bbox = {
      xl: 0,
      xr: lWidth,
      yt: 0,
      yb: lHeight
    };
    var vSites = [];
    for( var i = 0; i < fv.length; ++i ) {
      vSites[ fv[ i ].label ] = fv[ i ];
    }

    function checkMinDist( ee ) {
      var infractions = 0;
      // Then we check if the minimum distance is satisfied
      for( var eei = 0; eei < ee.length; ++eei ) {
        var e = ee[ eei ];
        if( ( e.lSite != null ) && ( e.rSite != null ) && sitesDistance( e.lSite, e.rSite ) < lMinDist ) {
          ++infractions;
        }
      }
      return infractions;
    }

    var diagram = voronoi.compute( fv, bbox );

    // Then we reposition the nodes at the centroid of their Voronoi cells
    var cells = diagram.cells;
    for( var i = 0; i < cells.length; ++i ) {
      var cell = cells[ i ];
      var site = cell.site;
      var centroid = cellCentroid( cell );
      var currv = vSites[ site.label ];
      currv.x = centroid.x;
      currv.y = centroid.y;
    }

    if( lExpFact < 0.0 ) {
      // Calculates the expanding factor
      lExpFact = Math.max( 0.05, Math.min( 0.10, lMinDist / Math.sqrt( ( lWidth * lHeight ) / fv.length ) * 0.5 ) );
      //console.info("Expanding factor is " + (options.expandingFactor * 100.0) + "%");
    }

    var prevInfractions = checkMinDist( diagram.edges );
    //console.info("Initial infractions " + prevInfractions);

    var bStop = ( prevInfractions <= 0 );

    var voronoiIteration = 0;
    var expandIteration = 0;

    // var initWidth = lWidth;

    while( !bStop ) {
      ++voronoiIteration;
      for( var it = 0; it <= 4; ++it ) {
        voronoi.recycle( diagram );
        diagram = voronoi.compute( fv, bbox );

        // Then we reposition the nodes at the centroid of their Voronoi cells
        cells = diagram.cells;
        for( var i = 0; i < cells.length; ++i ) {
          var cell = cells[ i ];
          var site = cell.site;
          var centroid = cellCentroid( cell );
          var currv = vSites[ site.label ];
          currv.x = centroid.x;
          currv.y = centroid.y;
        }
      }

      var currInfractions = checkMinDist( diagram.edges );
      //console.info("Current infractions " + currInfractions);

      if( currInfractions <= 0 ) {
        bStop = true;
      } else {
        if( currInfractions >= prevInfractions || voronoiIteration >= 4 ) {
          if( expandIteration >= lMaxExpIt ) {
            bStop = true;
          } else {
            lWidth += lWidth * lExpFact;
            lHeight += lHeight * lExpFact;
            bbox = {
              xl: 0,
              xr: lWidth,
              yt: 0,
              yb: lHeight
            };
            ++expandIteration;
            voronoiIteration = 0;
            //console.info("Expanded to ("+width+","+height+")");
          }
        }
      }
      prevInfractions = currInfractions;

      savePositions();
      messagePositions();
    }

    savePositions();
    return pData;

  } ).then( function( pData ) {
    // var expandIteration = pData[ 'expIt' ];
    var dataVertices = pData[ 'vertices' ];

    setPositions( pData );

    // Get end time
    var startTime = pData[ 'startTime' ];
    var endTime = new Date();
    console.info( "Layout on " + dataVertices.length + " nodes took " + ( endTime - startTime ) + " ms" );

    layout.one( "layoutstop", options.stop );

    if( !options.animate ){
      layout.trigger( "layoutready" );
    }

    layout.trigger( "layoutstop" );

    t1.stop();
  } );


  return this;
}; // run

SpreadLayout.prototype.stop = function(){
  if( this.thread ){
    this.thread.stop();
  }

  this.trigger('layoutstop');
};

SpreadLayout.prototype.destroy = function(){
  if( this.thread ){
    this.thread.stop();
  }
};

module.exports = function get( cytoscape ){
  Thread = cytoscape.Thread;

  return SpreadLayout;
};

},{"./foograph":1,"./rhill-voronoi-core":4}],4:[function(_dereq_,module,exports){
/*!
Copyright (C) 2010-2013 Raymond Hill: https://github.com/gorhill/Javascript-Voronoi
MIT License: See https://github.com/gorhill/Javascript-Voronoi/LICENSE.md
*/
/*
Author: Raymond Hill (rhill@raymondhill.net)
Contributor: Jesse Morgan (morgajel@gmail.com)
File: rhill-voronoi-core.js
Version: 0.98
Date: January 21, 2013
Description: This is my personal Javascript implementation of
Steven Fortune's algorithm to compute Voronoi diagrams.

License: See https://github.com/gorhill/Javascript-Voronoi/LICENSE.md
Credits: See https://github.com/gorhill/Javascript-Voronoi/CREDITS.md
History: See https://github.com/gorhill/Javascript-Voronoi/CHANGELOG.md

## Usage:

  var sites = [{x:300,y:300}, {x:100,y:100}, {x:200,y:500}, {x:250,y:450}, {x:600,y:150}];
  // xl, xr means x left, x right
  // yt, yb means y top, y bottom
  var bbox = {xl:0, xr:800, yt:0, yb:600};
  var voronoi = new Voronoi();
  // pass an object which exhibits xl, xr, yt, yb properties. The bounding
  // box will be used to connect unbound edges, and to close open cells
  result = voronoi.compute(sites, bbox);
  // render, further analyze, etc.

Return value:
  An object with the following properties:

  result.vertices = an array of unordered, unique Voronoi.Vertex objects making
    up the Voronoi diagram.
  result.edges = an array of unordered, unique Voronoi.Edge objects making up
    the Voronoi diagram.
  result.cells = an array of Voronoi.Cell object making up the Voronoi diagram.
    A Cell object might have an empty array of halfedges, meaning no Voronoi
    cell could be computed for a particular cell.
  result.execTime = the time it took to compute the Voronoi diagram, in
    milliseconds.

Voronoi.Vertex object:
  x: The x position of the vertex.
  y: The y position of the vertex.

Voronoi.Edge object:
  lSite: the Voronoi site object at the left of this Voronoi.Edge object.
  rSite: the Voronoi site object at the right of this Voronoi.Edge object (can
    be null).
  va: an object with an 'x' and a 'y' property defining the start point
    (relative to the Voronoi site on the left) of this Voronoi.Edge object.
  vb: an object with an 'x' and a 'y' property defining the end point
    (relative to Voronoi site on the left) of this Voronoi.Edge object.

  For edges which are used to close open cells (using the supplied bounding
  box), the rSite property will be null.

Voronoi.Cell object:
  site: the Voronoi site object associated with the Voronoi cell.
  halfedges: an array of Voronoi.Halfedge objects, ordered counterclockwise,
    defining the polygon for this Voronoi cell.

Voronoi.Halfedge object:
  site: the Voronoi site object owning this Voronoi.Halfedge object.
  edge: a reference to the unique Voronoi.Edge object underlying this
    Voronoi.Halfedge object.
  getStartpoint(): a method returning an object with an 'x' and a 'y' property
    for the start point of this halfedge. Keep in mind halfedges are always
    countercockwise.
  getEndpoint(): a method returning an object with an 'x' and a 'y' property
    for the end point of this halfedge. Keep in mind halfedges are always
    countercockwise.

TODO: Identify opportunities for performance improvement.

TODO: Let the user close the Voronoi cells, do not do it automatically. Not only let
      him close the cells, but also allow him to close more than once using a different
      bounding box for the same Voronoi diagram.
*/

/*global Math */

// ---------------------------------------------------------------------------

function Voronoi() {
    this.vertices = null;
    this.edges = null;
    this.cells = null;
    this.toRecycle = null;
    this.beachsectionJunkyard = [];
    this.circleEventJunkyard = [];
    this.vertexJunkyard = [];
    this.edgeJunkyard = [];
    this.cellJunkyard = [];
    }

// ---------------------------------------------------------------------------

Voronoi.prototype.reset = function() {
    if (!this.beachline) {
        this.beachline = new this.RBTree();
        }
    // Move leftover beachsections to the beachsection junkyard.
    if (this.beachline.root) {
        var beachsection = this.beachline.getFirst(this.beachline.root);
        while (beachsection) {
            this.beachsectionJunkyard.push(beachsection); // mark for reuse
            beachsection = beachsection.rbNext;
            }
        }
    this.beachline.root = null;
    if (!this.circleEvents) {
        this.circleEvents = new this.RBTree();
        }
    this.circleEvents.root = this.firstCircleEvent = null;
    this.vertices = [];
    this.edges = [];
    this.cells = [];
    };

Voronoi.prototype.sqrt = function(n){ return Math.sqrt(n); };
Voronoi.prototype.abs = function(n){ return Math.abs(n); };
Voronoi.prototype.ε = Voronoi.ε = 1e-9;
Voronoi.prototype.invε = Voronoi.invε = 1.0 / Voronoi.ε;
Voronoi.prototype.equalWithEpsilon = function(a,b){return this.abs(a-b)<1e-9;};
Voronoi.prototype.greaterThanWithEpsilon = function(a,b){return a-b>1e-9;};
Voronoi.prototype.greaterThanOrEqualWithEpsilon = function(a,b){return b-a<1e-9;};
Voronoi.prototype.lessThanWithEpsilon = function(a,b){return b-a>1e-9;};
Voronoi.prototype.lessThanOrEqualWithEpsilon = function(a,b){return a-b<1e-9;};

// ---------------------------------------------------------------------------
// Red-Black tree code (based on C version of "rbtree" by Franck Bui-Huu
// https://github.com/fbuihuu/libtree/blob/master/rb.c

Voronoi.prototype.RBTree = function() {
    this.root = null;
    };

Voronoi.prototype.RBTree.prototype.rbInsertSuccessor = function(node, successor) {
    var parent;
    if (node) {
        // >>> rhill 2011-05-27: Performance: cache previous/next nodes
        successor.rbPrevious = node;
        successor.rbNext = node.rbNext;
        if (node.rbNext) {
            node.rbNext.rbPrevious = successor;
            }
        node.rbNext = successor;
        // <<<
        if (node.rbRight) {
            // in-place expansion of node.rbRight.getFirst();
            node = node.rbRight;
            while (node.rbLeft) {node = node.rbLeft;}
            node.rbLeft = successor;
            }
        else {
            node.rbRight = successor;
            }
        parent = node;
        }
    // rhill 2011-06-07: if node is null, successor must be inserted
    // to the left-most part of the tree
    else if (this.root) {
        node = this.getFirst(this.root);
        // >>> Performance: cache previous/next nodes
        successor.rbPrevious = null;
        successor.rbNext = node;
        node.rbPrevious = successor;
        // <<<
        node.rbLeft = successor;
        parent = node;
        }
    else {
        // >>> Performance: cache previous/next nodes
        successor.rbPrevious = successor.rbNext = null;
        // <<<
        this.root = successor;
        parent = null;
        }
    successor.rbLeft = successor.rbRight = null;
    successor.rbParent = parent;
    successor.rbRed = true;
    // Fixup the modified tree by recoloring nodes and performing
    // rotations (2 at most) hence the red-black tree properties are
    // preserved.
    var grandpa, uncle;
    node = successor;
    while (parent && parent.rbRed) {
        grandpa = parent.rbParent;
        if (parent === grandpa.rbLeft) {
            uncle = grandpa.rbRight;
            if (uncle && uncle.rbRed) {
                parent.rbRed = uncle.rbRed = false;
                grandpa.rbRed = true;
                node = grandpa;
                }
            else {
                if (node === parent.rbRight) {
                    this.rbRotateLeft(parent);
                    node = parent;
                    parent = node.rbParent;
                    }
                parent.rbRed = false;
                grandpa.rbRed = true;
                this.rbRotateRight(grandpa);
                }
            }
        else {
            uncle = grandpa.rbLeft;
            if (uncle && uncle.rbRed) {
                parent.rbRed = uncle.rbRed = false;
                grandpa.rbRed = true;
                node = grandpa;
                }
            else {
                if (node === parent.rbLeft) {
                    this.rbRotateRight(parent);
                    node = parent;
                    parent = node.rbParent;
                    }
                parent.rbRed = false;
                grandpa.rbRed = true;
                this.rbRotateLeft(grandpa);
                }
            }
        parent = node.rbParent;
        }
    this.root.rbRed = false;
    };

Voronoi.prototype.RBTree.prototype.rbRemoveNode = function(node) {
    // >>> rhill 2011-05-27: Performance: cache previous/next nodes
    if (node.rbNext) {
        node.rbNext.rbPrevious = node.rbPrevious;
        }
    if (node.rbPrevious) {
        node.rbPrevious.rbNext = node.rbNext;
        }
    node.rbNext = node.rbPrevious = null;
    // <<<
    var parent = node.rbParent,
        left = node.rbLeft,
        right = node.rbRight,
        next;
    if (!left) {
        next = right;
        }
    else if (!right) {
        next = left;
        }
    else {
        next = this.getFirst(right);
        }
    if (parent) {
        if (parent.rbLeft === node) {
            parent.rbLeft = next;
            }
        else {
            parent.rbRight = next;
            }
        }
    else {
        this.root = next;
        }
    // enforce red-black rules
    var isRed;
    if (left && right) {
        isRed = next.rbRed;
        next.rbRed = node.rbRed;
        next.rbLeft = left;
        left.rbParent = next;
        if (next !== right) {
            parent = next.rbParent;
            next.rbParent = node.rbParent;
            node = next.rbRight;
            parent.rbLeft = node;
            next.rbRight = right;
            right.rbParent = next;
            }
        else {
            next.rbParent = parent;
            parent = next;
            node = next.rbRight;
            }
        }
    else {
        isRed = node.rbRed;
        node = next;
        }
    // 'node' is now the sole successor's child and 'parent' its
    // new parent (since the successor can have been moved)
    if (node) {
        node.rbParent = parent;
        }
    // the 'easy' cases
    if (isRed) {return;}
    if (node && node.rbRed) {
        node.rbRed = false;
        return;
        }
    // the other cases
    var sibling;
    do {
        if (node === this.root) {
            break;
            }
        if (node === parent.rbLeft) {
            sibling = parent.rbRight;
            if (sibling.rbRed) {
                sibling.rbRed = false;
                parent.rbRed = true;
                this.rbRotateLeft(parent);
                sibling = parent.rbRight;
                }
            if ((sibling.rbLeft && sibling.rbLeft.rbRed) || (sibling.rbRight && sibling.rbRight.rbRed)) {
                if (!sibling.rbRight || !sibling.rbRight.rbRed) {
                    sibling.rbLeft.rbRed = false;
                    sibling.rbRed = true;
                    this.rbRotateRight(sibling);
                    sibling = parent.rbRight;
                    }
                sibling.rbRed = parent.rbRed;
                parent.rbRed = sibling.rbRight.rbRed = false;
                this.rbRotateLeft(parent);
                node = this.root;
                break;
                }
            }
        else {
            sibling = parent.rbLeft;
            if (sibling.rbRed) {
                sibling.rbRed = false;
                parent.rbRed = true;
                this.rbRotateRight(parent);
                sibling = parent.rbLeft;
                }
            if ((sibling.rbLeft && sibling.rbLeft.rbRed) || (sibling.rbRight && sibling.rbRight.rbRed)) {
                if (!sibling.rbLeft || !sibling.rbLeft.rbRed) {
                    sibling.rbRight.rbRed = false;
                    sibling.rbRed = true;
                    this.rbRotateLeft(sibling);
                    sibling = parent.rbLeft;
                    }
                sibling.rbRed = parent.rbRed;
                parent.rbRed = sibling.rbLeft.rbRed = false;
                this.rbRotateRight(parent);
                node = this.root;
                break;
                }
            }
        sibling.rbRed = true;
        node = parent;
        parent = parent.rbParent;
    } while (!node.rbRed);
    if (node) {node.rbRed = false;}
    };

Voronoi.prototype.RBTree.prototype.rbRotateLeft = function(node) {
    var p = node,
        q = node.rbRight, // can't be null
        parent = p.rbParent;
    if (parent) {
        if (parent.rbLeft === p) {
            parent.rbLeft = q;
            }
        else {
            parent.rbRight = q;
            }
        }
    else {
        this.root = q;
        }
    q.rbParent = parent;
    p.rbParent = q;
    p.rbRight = q.rbLeft;
    if (p.rbRight) {
        p.rbRight.rbParent = p;
        }
    q.rbLeft = p;
    };

Voronoi.prototype.RBTree.prototype.rbRotateRight = function(node) {
    var p = node,
        q = node.rbLeft, // can't be null
        parent = p.rbParent;
    if (parent) {
        if (parent.rbLeft === p) {
            parent.rbLeft = q;
            }
        else {
            parent.rbRight = q;
            }
        }
    else {
        this.root = q;
        }
    q.rbParent = parent;
    p.rbParent = q;
    p.rbLeft = q.rbRight;
    if (p.rbLeft) {
        p.rbLeft.rbParent = p;
        }
    q.rbRight = p;
    };

Voronoi.prototype.RBTree.prototype.getFirst = function(node) {
    while (node.rbLeft) {
        node = node.rbLeft;
        }
    return node;
    };

Voronoi.prototype.RBTree.prototype.getLast = function(node) {
    while (node.rbRight) {
        node = node.rbRight;
        }
    return node;
    };

// ---------------------------------------------------------------------------
// Diagram methods

Voronoi.prototype.Diagram = function(site) {
    this.site = site;
    };

// ---------------------------------------------------------------------------
// Cell methods

Voronoi.prototype.Cell = function(site) {
    this.site = site;
    this.halfedges = [];
    this.closeMe = false;
    };

Voronoi.prototype.Cell.prototype.init = function(site) {
    this.site = site;
    this.halfedges = [];
    this.closeMe = false;
    return this;
    };

Voronoi.prototype.createCell = function(site) {
    var cell = this.cellJunkyard.pop();
    if ( cell ) {
        return cell.init(site);
        }
    return new this.Cell(site);
    };

Voronoi.prototype.Cell.prototype.prepareHalfedges = function() {
    var halfedges = this.halfedges,
        iHalfedge = halfedges.length,
        edge;
    // get rid of unused halfedges
    // rhill 2011-05-27: Keep it simple, no point here in trying
    // to be fancy: dangling edges are a typically a minority.
    while (iHalfedge--) {
        edge = halfedges[iHalfedge].edge;
        if (!edge.vb || !edge.va) {
            halfedges.splice(iHalfedge,1);
            }
        }

    // rhill 2011-05-26: I tried to use a binary search at insertion
    // time to keep the array sorted on-the-fly (in Cell.addHalfedge()).
    // There was no real benefits in doing so, performance on
    // Firefox 3.6 was improved marginally, while performance on
    // Opera 11 was penalized marginally.
    halfedges.sort(function(a,b){return b.angle-a.angle;});
    return halfedges.length;
    };

// Return a list of the neighbor Ids
Voronoi.prototype.Cell.prototype.getNeighborIds = function() {
    var neighbors = [],
        iHalfedge = this.halfedges.length,
        edge;
    while (iHalfedge--){
        edge = this.halfedges[iHalfedge].edge;
        if (edge.lSite !== null && edge.lSite.voronoiId != this.site.voronoiId) {
            neighbors.push(edge.lSite.voronoiId);
            }
        else if (edge.rSite !== null && edge.rSite.voronoiId != this.site.voronoiId){
            neighbors.push(edge.rSite.voronoiId);
            }
        }
    return neighbors;
    };

// Compute bounding box
//
Voronoi.prototype.Cell.prototype.getBbox = function() {
    var halfedges = this.halfedges,
        iHalfedge = halfedges.length,
        xmin = Infinity,
        ymin = Infinity,
        xmax = -Infinity,
        ymax = -Infinity,
        v, vx, vy;
    while (iHalfedge--) {
        v = halfedges[iHalfedge].getStartpoint();
        vx = v.x;
        vy = v.y;
        if (vx < xmin) {xmin = vx;}
        if (vy < ymin) {ymin = vy;}
        if (vx > xmax) {xmax = vx;}
        if (vy > ymax) {ymax = vy;}
        // we dont need to take into account end point,
        // since each end point matches a start point
        }
    return {
        x: xmin,
        y: ymin,
        width: xmax-xmin,
        height: ymax-ymin
        };
    };

// Return whether a point is inside, on, or outside the cell:
//   -1: point is outside the perimeter of the cell
//    0: point is on the perimeter of the cell
//    1: point is inside the perimeter of the cell
//
Voronoi.prototype.Cell.prototype.pointIntersection = function(x, y) {
    // Check if point in polygon. Since all polygons of a Voronoi
    // diagram are convex, then:
    // http://paulbourke.net/geometry/polygonmesh/
    // Solution 3 (2D):
    //   "If the polygon is convex then one can consider the polygon
    //   "as a 'path' from the first vertex. A point is on the interior
    //   "of this polygons if it is always on the same side of all the
    //   "line segments making up the path. ...
    //   "(y - y0) (x1 - x0) - (x - x0) (y1 - y0)
    //   "if it is less than 0 then P is to the right of the line segment,
    //   "if greater than 0 it is to the left, if equal to 0 then it lies
    //   "on the line segment"
    var halfedges = this.halfedges,
        iHalfedge = halfedges.length,
        halfedge,
        p0, p1, r;
    while (iHalfedge--) {
        halfedge = halfedges[iHalfedge];
        p0 = halfedge.getStartpoint();
        p1 = halfedge.getEndpoint();
        r = (y-p0.y)*(p1.x-p0.x)-(x-p0.x)*(p1.y-p0.y);
        if (!r) {
            return 0;
            }
        if (r > 0) {
            return -1;
            }
        }
    return 1;
    };

// ---------------------------------------------------------------------------
// Edge methods
//

Voronoi.prototype.Vertex = function(x, y) {
    this.x = x;
    this.y = y;
    };

Voronoi.prototype.Edge = function(lSite, rSite) {
    this.lSite = lSite;
    this.rSite = rSite;
    this.va = this.vb = null;
    };

Voronoi.prototype.Halfedge = function(edge, lSite, rSite) {
    this.site = lSite;
    this.edge = edge;
    // 'angle' is a value to be used for properly sorting the
    // halfsegments counterclockwise. By convention, we will
    // use the angle of the line defined by the 'site to the left'
    // to the 'site to the right'.
    // However, border edges have no 'site to the right': thus we
    // use the angle of line perpendicular to the halfsegment (the
    // edge should have both end points defined in such case.)
    if (rSite) {
        this.angle = Math.atan2(rSite.y-lSite.y, rSite.x-lSite.x);
        }
    else {
        var va = edge.va,
            vb = edge.vb;
        // rhill 2011-05-31: used to call getStartpoint()/getEndpoint(),
        // but for performance purpose, these are expanded in place here.
        this.angle = edge.lSite === lSite ?
            Math.atan2(vb.x-va.x, va.y-vb.y) :
            Math.atan2(va.x-vb.x, vb.y-va.y);
        }
    };

Voronoi.prototype.createHalfedge = function(edge, lSite, rSite) {
    return new this.Halfedge(edge, lSite, rSite);
    };

Voronoi.prototype.Halfedge.prototype.getStartpoint = function() {
    return this.edge.lSite === this.site ? this.edge.va : this.edge.vb;
    };

Voronoi.prototype.Halfedge.prototype.getEndpoint = function() {
    return this.edge.lSite === this.site ? this.edge.vb : this.edge.va;
    };



// this create and add a vertex to the internal collection

Voronoi.prototype.createVertex = function(x, y) {
    var v = this.vertexJunkyard.pop();
    if ( !v ) {
        v = new this.Vertex(x, y);
        }
    else {
        v.x = x;
        v.y = y;
        }
    this.vertices.push(v);
    return v;
    };

// this create and add an edge to internal collection, and also create
// two halfedges which are added to each site's counterclockwise array
// of halfedges.

Voronoi.prototype.createEdge = function(lSite, rSite, va, vb) {
    var edge = this.edgeJunkyard.pop();
    if ( !edge ) {
        edge = new this.Edge(lSite, rSite);
        }
    else {
        edge.lSite = lSite;
        edge.rSite = rSite;
        edge.va = edge.vb = null;
        }

    this.edges.push(edge);
    if (va) {
        this.setEdgeStartpoint(edge, lSite, rSite, va);
        }
    if (vb) {
        this.setEdgeEndpoint(edge, lSite, rSite, vb);
        }
    this.cells[lSite.voronoiId].halfedges.push(this.createHalfedge(edge, lSite, rSite));
    this.cells[rSite.voronoiId].halfedges.push(this.createHalfedge(edge, rSite, lSite));
    return edge;
    };

Voronoi.prototype.createBorderEdge = function(lSite, va, vb) {
    var edge = this.edgeJunkyard.pop();
    if ( !edge ) {
        edge = new this.Edge(lSite, null);
        }
    else {
        edge.lSite = lSite;
        edge.rSite = null;
        }
    edge.va = va;
    edge.vb = vb;
    this.edges.push(edge);
    return edge;
    };

Voronoi.prototype.setEdgeStartpoint = function(edge, lSite, rSite, vertex) {
    if (!edge.va && !edge.vb) {
        edge.va = vertex;
        edge.lSite = lSite;
        edge.rSite = rSite;
        }
    else if (edge.lSite === rSite) {
        edge.vb = vertex;
        }
    else {
        edge.va = vertex;
        }
    };

Voronoi.prototype.setEdgeEndpoint = function(edge, lSite, rSite, vertex) {
    this.setEdgeStartpoint(edge, rSite, lSite, vertex);
    };

// ---------------------------------------------------------------------------
// Beachline methods

// rhill 2011-06-07: For some reasons, performance suffers significantly
// when instanciating a literal object instead of an empty ctor
Voronoi.prototype.Beachsection = function() {
    };

// rhill 2011-06-02: A lot of Beachsection instanciations
// occur during the computation of the Voronoi diagram,
// somewhere between the number of sites and twice the
// number of sites, while the number of Beachsections on the
// beachline at any given time is comparatively low. For this
// reason, we reuse already created Beachsections, in order
// to avoid new memory allocation. This resulted in a measurable
// performance gain.

Voronoi.prototype.createBeachsection = function(site) {
    var beachsection = this.beachsectionJunkyard.pop();
    if (!beachsection) {
        beachsection = new this.Beachsection();
        }
    beachsection.site = site;
    return beachsection;
    };

// calculate the left break point of a particular beach section,
// given a particular sweep line
Voronoi.prototype.leftBreakPoint = function(arc, directrix) {
    // http://en.wikipedia.org/wiki/Parabola
    // http://en.wikipedia.org/wiki/Quadratic_equation
    // h1 = x1,
    // k1 = (y1+directrix)/2,
    // h2 = x2,
    // k2 = (y2+directrix)/2,
    // p1 = k1-directrix,
    // a1 = 1/(4*p1),
    // b1 = -h1/(2*p1),
    // c1 = h1*h1/(4*p1)+k1,
    // p2 = k2-directrix,
    // a2 = 1/(4*p2),
    // b2 = -h2/(2*p2),
    // c2 = h2*h2/(4*p2)+k2,
    // x = (-(b2-b1) + Math.sqrt((b2-b1)*(b2-b1) - 4*(a2-a1)*(c2-c1))) / (2*(a2-a1))
    // When x1 become the x-origin:
    // h1 = 0,
    // k1 = (y1+directrix)/2,
    // h2 = x2-x1,
    // k2 = (y2+directrix)/2,
    // p1 = k1-directrix,
    // a1 = 1/(4*p1),
    // b1 = 0,
    // c1 = k1,
    // p2 = k2-directrix,
    // a2 = 1/(4*p2),
    // b2 = -h2/(2*p2),
    // c2 = h2*h2/(4*p2)+k2,
    // x = (-b2 + Math.sqrt(b2*b2 - 4*(a2-a1)*(c2-k1))) / (2*(a2-a1)) + x1

    // change code below at your own risk: care has been taken to
    // reduce errors due to computers' finite arithmetic precision.
    // Maybe can still be improved, will see if any more of this
    // kind of errors pop up again.
    var site = arc.site,
        rfocx = site.x,
        rfocy = site.y,
        pby2 = rfocy-directrix;
    // parabola in degenerate case where focus is on directrix
    if (!pby2) {
        return rfocx;
        }
    var lArc = arc.rbPrevious;
    if (!lArc) {
        return -Infinity;
        }
    site = lArc.site;
    var lfocx = site.x,
        lfocy = site.y,
        plby2 = lfocy-directrix;
    // parabola in degenerate case where focus is on directrix
    if (!plby2) {
        return lfocx;
        }
    var hl = lfocx-rfocx,
        aby2 = 1/pby2-1/plby2,
        b = hl/plby2;
    if (aby2) {
        return (-b+this.sqrt(b*b-2*aby2*(hl*hl/(-2*plby2)-lfocy+plby2/2+rfocy-pby2/2)))/aby2+rfocx;
        }
    // both parabolas have same distance to directrix, thus break point is midway
    return (rfocx+lfocx)/2;
    };

// calculate the right break point of a particular beach section,
// given a particular directrix
Voronoi.prototype.rightBreakPoint = function(arc, directrix) {
    var rArc = arc.rbNext;
    if (rArc) {
        return this.leftBreakPoint(rArc, directrix);
        }
    var site = arc.site;
    return site.y === directrix ? site.x : Infinity;
    };

Voronoi.prototype.detachBeachsection = function(beachsection) {
    this.detachCircleEvent(beachsection); // detach potentially attached circle event
    this.beachline.rbRemoveNode(beachsection); // remove from RB-tree
    this.beachsectionJunkyard.push(beachsection); // mark for reuse
    };

Voronoi.prototype.removeBeachsection = function(beachsection) {
    var circle = beachsection.circleEvent,
        x = circle.x,
        y = circle.ycenter,
        vertex = this.createVertex(x, y),
        previous = beachsection.rbPrevious,
        next = beachsection.rbNext,
        disappearingTransitions = [beachsection],
        abs_fn = Math.abs;

    // remove collapsed beachsection from beachline
    this.detachBeachsection(beachsection);

    // there could be more than one empty arc at the deletion point, this
    // happens when more than two edges are linked by the same vertex,
    // so we will collect all those edges by looking up both sides of
    // the deletion point.
    // by the way, there is *always* a predecessor/successor to any collapsed
    // beach section, it's just impossible to have a collapsing first/last
    // beach sections on the beachline, since they obviously are unconstrained
    // on their left/right side.

    // look left
    var lArc = previous;
    while (lArc.circleEvent && abs_fn(x-lArc.circleEvent.x)<1e-9 && abs_fn(y-lArc.circleEvent.ycenter)<1e-9) {
        previous = lArc.rbPrevious;
        disappearingTransitions.unshift(lArc);
        this.detachBeachsection(lArc); // mark for reuse
        lArc = previous;
        }
    // even though it is not disappearing, I will also add the beach section
    // immediately to the left of the left-most collapsed beach section, for
    // convenience, since we need to refer to it later as this beach section
    // is the 'left' site of an edge for which a start point is set.
    disappearingTransitions.unshift(lArc);
    this.detachCircleEvent(lArc);

    // look right
    var rArc = next;
    while (rArc.circleEvent && abs_fn(x-rArc.circleEvent.x)<1e-9 && abs_fn(y-rArc.circleEvent.ycenter)<1e-9) {
        next = rArc.rbNext;
        disappearingTransitions.push(rArc);
        this.detachBeachsection(rArc); // mark for reuse
        rArc = next;
        }
    // we also have to add the beach section immediately to the right of the
    // right-most collapsed beach section, since there is also a disappearing
    // transition representing an edge's start point on its left.
    disappearingTransitions.push(rArc);
    this.detachCircleEvent(rArc);

    // walk through all the disappearing transitions between beach sections and
    // set the start point of their (implied) edge.
    var nArcs = disappearingTransitions.length,
        iArc;
    for (iArc=1; iArc<nArcs; iArc++) {
        rArc = disappearingTransitions[iArc];
        lArc = disappearingTransitions[iArc-1];
        this.setEdgeStartpoint(rArc.edge, lArc.site, rArc.site, vertex);
        }

    // create a new edge as we have now a new transition between
    // two beach sections which were previously not adjacent.
    // since this edge appears as a new vertex is defined, the vertex
    // actually define an end point of the edge (relative to the site
    // on the left)
    lArc = disappearingTransitions[0];
    rArc = disappearingTransitions[nArcs-1];
    rArc.edge = this.createEdge(lArc.site, rArc.site, undefined, vertex);

    // create circle events if any for beach sections left in the beachline
    // adjacent to collapsed sections
    this.attachCircleEvent(lArc);
    this.attachCircleEvent(rArc);
    };

Voronoi.prototype.addBeachsection = function(site) {
    var x = site.x,
        directrix = site.y;

    // find the left and right beach sections which will surround the newly
    // created beach section.
    // rhill 2011-06-01: This loop is one of the most often executed,
    // hence we expand in-place the comparison-against-epsilon calls.
    var lArc, rArc,
        dxl, dxr,
        node = this.beachline.root;

    while (node) {
        dxl = this.leftBreakPoint(node,directrix)-x;
        // x lessThanWithEpsilon xl => falls somewhere before the left edge of the beachsection
        if (dxl > 1e-9) {
            // this case should never happen
            // if (!node.rbLeft) {
            //    rArc = node.rbLeft;
            //    break;
            //    }
            node = node.rbLeft;
            }
        else {
            dxr = x-this.rightBreakPoint(node,directrix);
            // x greaterThanWithEpsilon xr => falls somewhere after the right edge of the beachsection
            if (dxr > 1e-9) {
                if (!node.rbRight) {
                    lArc = node;
                    break;
                    }
                node = node.rbRight;
                }
            else {
                // x equalWithEpsilon xl => falls exactly on the left edge of the beachsection
                if (dxl > -1e-9) {
                    lArc = node.rbPrevious;
                    rArc = node;
                    }
                // x equalWithEpsilon xr => falls exactly on the right edge of the beachsection
                else if (dxr > -1e-9) {
                    lArc = node;
                    rArc = node.rbNext;
                    }
                // falls exactly somewhere in the middle of the beachsection
                else {
                    lArc = rArc = node;
                    }
                break;
                }
            }
        }
    // at this point, keep in mind that lArc and/or rArc could be
    // undefined or null.

    // create a new beach section object for the site and add it to RB-tree
    var newArc = this.createBeachsection(site);
    this.beachline.rbInsertSuccessor(lArc, newArc);

    // cases:
    //

    // [null,null]
    // least likely case: new beach section is the first beach section on the
    // beachline.
    // This case means:
    //   no new transition appears
    //   no collapsing beach section
    //   new beachsection become root of the RB-tree
    if (!lArc && !rArc) {
        return;
        }

    // [lArc,rArc] where lArc == rArc
    // most likely case: new beach section split an existing beach
    // section.
    // This case means:
    //   one new transition appears
    //   the left and right beach section might be collapsing as a result
    //   two new nodes added to the RB-tree
    if (lArc === rArc) {
        // invalidate circle event of split beach section
        this.detachCircleEvent(lArc);

        // split the beach section into two separate beach sections
        rArc = this.createBeachsection(lArc.site);
        this.beachline.rbInsertSuccessor(newArc, rArc);

        // since we have a new transition between two beach sections,
        // a new edge is born
        newArc.edge = rArc.edge = this.createEdge(lArc.site, newArc.site);

        // check whether the left and right beach sections are collapsing
        // and if so create circle events, to be notified when the point of
        // collapse is reached.
        this.attachCircleEvent(lArc);
        this.attachCircleEvent(rArc);
        return;
        }

    // [lArc,null]
    // even less likely case: new beach section is the *last* beach section
    // on the beachline -- this can happen *only* if *all* the previous beach
    // sections currently on the beachline share the same y value as
    // the new beach section.
    // This case means:
    //   one new transition appears
    //   no collapsing beach section as a result
    //   new beach section become right-most node of the RB-tree
    if (lArc && !rArc) {
        newArc.edge = this.createEdge(lArc.site,newArc.site);
        return;
        }

    // [null,rArc]
    // impossible case: because sites are strictly processed from top to bottom,
    // and left to right, which guarantees that there will always be a beach section
    // on the left -- except of course when there are no beach section at all on
    // the beach line, which case was handled above.
    // rhill 2011-06-02: No point testing in non-debug version
    //if (!lArc && rArc) {
    //    throw "Voronoi.addBeachsection(): What is this I don't even";
    //    }

    // [lArc,rArc] where lArc != rArc
    // somewhat less likely case: new beach section falls *exactly* in between two
    // existing beach sections
    // This case means:
    //   one transition disappears
    //   two new transitions appear
    //   the left and right beach section might be collapsing as a result
    //   only one new node added to the RB-tree
    if (lArc !== rArc) {
        // invalidate circle events of left and right sites
        this.detachCircleEvent(lArc);
        this.detachCircleEvent(rArc);

        // an existing transition disappears, meaning a vertex is defined at
        // the disappearance point.
        // since the disappearance is caused by the new beachsection, the
        // vertex is at the center of the circumscribed circle of the left,
        // new and right beachsections.
        // http://mathforum.org/library/drmath/view/55002.html
        // Except that I bring the origin at A to simplify
        // calculation
        var lSite = lArc.site,
            ax = lSite.x,
            ay = lSite.y,
            bx=site.x-ax,
            by=site.y-ay,
            rSite = rArc.site,
            cx=rSite.x-ax,
            cy=rSite.y-ay,
            d=2*(bx*cy-by*cx),
            hb=bx*bx+by*by,
            hc=cx*cx+cy*cy,
            vertex = this.createVertex((cy*hb-by*hc)/d+ax, (bx*hc-cx*hb)/d+ay);

        // one transition disappear
        this.setEdgeStartpoint(rArc.edge, lSite, rSite, vertex);

        // two new transitions appear at the new vertex location
        newArc.edge = this.createEdge(lSite, site, undefined, vertex);
        rArc.edge = this.createEdge(site, rSite, undefined, vertex);

        // check whether the left and right beach sections are collapsing
        // and if so create circle events, to handle the point of collapse.
        this.attachCircleEvent(lArc);
        this.attachCircleEvent(rArc);
        return;
        }
    };

// ---------------------------------------------------------------------------
// Circle event methods

// rhill 2011-06-07: For some reasons, performance suffers significantly
// when instanciating a literal object instead of an empty ctor
Voronoi.prototype.CircleEvent = function() {
    // rhill 2013-10-12: it helps to state exactly what we are at ctor time.
    this.arc = null;
    this.rbLeft = null;
    this.rbNext = null;
    this.rbParent = null;
    this.rbPrevious = null;
    this.rbRed = false;
    this.rbRight = null;
    this.site = null;
    this.x = this.y = this.ycenter = 0;
    };

Voronoi.prototype.attachCircleEvent = function(arc) {
    var lArc = arc.rbPrevious,
        rArc = arc.rbNext;
    if (!lArc || !rArc) {return;} // does that ever happen?
    var lSite = lArc.site,
        cSite = arc.site,
        rSite = rArc.site;

    // If site of left beachsection is same as site of
    // right beachsection, there can't be convergence
    if (lSite===rSite) {return;}

    // Find the circumscribed circle for the three sites associated
    // with the beachsection triplet.
    // rhill 2011-05-26: It is more efficient to calculate in-place
    // rather than getting the resulting circumscribed circle from an
    // object returned by calling Voronoi.circumcircle()
    // http://mathforum.org/library/drmath/view/55002.html
    // Except that I bring the origin at cSite to simplify calculations.
    // The bottom-most part of the circumcircle is our Fortune 'circle
    // event', and its center is a vertex potentially part of the final
    // Voronoi diagram.
    var bx = cSite.x,
        by = cSite.y,
        ax = lSite.x-bx,
        ay = lSite.y-by,
        cx = rSite.x-bx,
        cy = rSite.y-by;

    // If points l->c->r are clockwise, then center beach section does not
    // collapse, hence it can't end up as a vertex (we reuse 'd' here, which
    // sign is reverse of the orientation, hence we reverse the test.
    // http://en.wikipedia.org/wiki/Curve_orientation#Orientation_of_a_simple_polygon
    // rhill 2011-05-21: Nasty finite precision error which caused circumcircle() to
    // return infinites: 1e-12 seems to fix the problem.
    var d = 2*(ax*cy-ay*cx);
    if (d >= -2e-12){return;}

    var ha = ax*ax+ay*ay,
        hc = cx*cx+cy*cy,
        x = (cy*ha-ay*hc)/d,
        y = (ax*hc-cx*ha)/d,
        ycenter = y+by;

    // Important: ybottom should always be under or at sweep, so no need
    // to waste CPU cycles by checking

    // recycle circle event object if possible
    var circleEvent = this.circleEventJunkyard.pop();
    if (!circleEvent) {
        circleEvent = new this.CircleEvent();
        }
    circleEvent.arc = arc;
    circleEvent.site = cSite;
    circleEvent.x = x+bx;
    circleEvent.y = ycenter+this.sqrt(x*x+y*y); // y bottom
    circleEvent.ycenter = ycenter;
    arc.circleEvent = circleEvent;

    // find insertion point in RB-tree: circle events are ordered from
    // smallest to largest
    var predecessor = null,
        node = this.circleEvents.root;
    while (node) {
        if (circleEvent.y < node.y || (circleEvent.y === node.y && circleEvent.x <= node.x)) {
            if (node.rbLeft) {
                node = node.rbLeft;
                }
            else {
                predecessor = node.rbPrevious;
                break;
                }
            }
        else {
            if (node.rbRight) {
                node = node.rbRight;
                }
            else {
                predecessor = node;
                break;
                }
            }
        }
    this.circleEvents.rbInsertSuccessor(predecessor, circleEvent);
    if (!predecessor) {
        this.firstCircleEvent = circleEvent;
        }
    };

Voronoi.prototype.detachCircleEvent = function(arc) {
    var circleEvent = arc.circleEvent;
    if (circleEvent) {
        if (!circleEvent.rbPrevious) {
            this.firstCircleEvent = circleEvent.rbNext;
            }
        this.circleEvents.rbRemoveNode(circleEvent); // remove from RB-tree
        this.circleEventJunkyard.push(circleEvent);
        arc.circleEvent = null;
        }
    };

// ---------------------------------------------------------------------------
// Diagram completion methods

// connect dangling edges (not if a cursory test tells us
// it is not going to be visible.
// return value:
//   false: the dangling endpoint couldn't be connected
//   true: the dangling endpoint could be connected
Voronoi.prototype.connectEdge = function(edge, bbox) {
    // skip if end point already connected
    var vb = edge.vb;
    if (!!vb) {return true;}

    // make local copy for performance purpose
    var va = edge.va,
        xl = bbox.xl,
        xr = bbox.xr,
        yt = bbox.yt,
        yb = bbox.yb,
        lSite = edge.lSite,
        rSite = edge.rSite,
        lx = lSite.x,
        ly = lSite.y,
        rx = rSite.x,
        ry = rSite.y,
        fx = (lx+rx)/2,
        fy = (ly+ry)/2,
        fm, fb;

    // if we reach here, this means cells which use this edge will need
    // to be closed, whether because the edge was removed, or because it
    // was connected to the bounding box.
    this.cells[lSite.voronoiId].closeMe = true;
    this.cells[rSite.voronoiId].closeMe = true;

    // get the line equation of the bisector if line is not vertical
    if (ry !== ly) {
        fm = (lx-rx)/(ry-ly);
        fb = fy-fm*fx;
        }

    // remember, direction of line (relative to left site):
    // upward: left.x < right.x
    // downward: left.x > right.x
    // horizontal: left.x == right.x
    // upward: left.x < right.x
    // rightward: left.y < right.y
    // leftward: left.y > right.y
    // vertical: left.y == right.y

    // depending on the direction, find the best side of the
    // bounding box to use to determine a reasonable start point

    // rhill 2013-12-02:
    // While at it, since we have the values which define the line,
    // clip the end of va if it is outside the bbox.
    // https://github.com/gorhill/Javascript-Voronoi/issues/15
    // TODO: Do all the clipping here rather than rely on Liang-Barsky
    // which does not do well sometimes due to loss of arithmetic
    // precision. The code here doesn't degrade if one of the vertex is
    // at a huge distance.

    // special case: vertical line
    if (fm === undefined) {
        // doesn't intersect with viewport
        if (fx < xl || fx >= xr) {return false;}
        // downward
        if (lx > rx) {
            if (!va || va.y < yt) {
                va = this.createVertex(fx, yt);
                }
            else if (va.y >= yb) {
                return false;
                }
            vb = this.createVertex(fx, yb);
            }
        // upward
        else {
            if (!va || va.y > yb) {
                va = this.createVertex(fx, yb);
                }
            else if (va.y < yt) {
                return false;
                }
            vb = this.createVertex(fx, yt);
            }
        }
    // closer to vertical than horizontal, connect start point to the
    // top or bottom side of the bounding box
    else if (fm < -1 || fm > 1) {
        // downward
        if (lx > rx) {
            if (!va || va.y < yt) {
                va = this.createVertex((yt-fb)/fm, yt);
                }
            else if (va.y >= yb) {
                return false;
                }
            vb = this.createVertex((yb-fb)/fm, yb);
            }
        // upward
        else {
            if (!va || va.y > yb) {
                va = this.createVertex((yb-fb)/fm, yb);
                }
            else if (va.y < yt) {
                return false;
                }
            vb = this.createVertex((yt-fb)/fm, yt);
            }
        }
    // closer to horizontal than vertical, connect start point to the
    // left or right side of the bounding box
    else {
        // rightward
        if (ly < ry) {
            if (!va || va.x < xl) {
                va = this.createVertex(xl, fm*xl+fb);
                }
            else if (va.x >= xr) {
                return false;
                }
            vb = this.createVertex(xr, fm*xr+fb);
            }
        // leftward
        else {
            if (!va || va.x > xr) {
                va = this.createVertex(xr, fm*xr+fb);
                }
            else if (va.x < xl) {
                return false;
                }
            vb = this.createVertex(xl, fm*xl+fb);
            }
        }
    edge.va = va;
    edge.vb = vb;

    return true;
    };

// line-clipping code taken from:
//   Liang-Barsky function by Daniel White
//   http://www.skytopia.com/project/articles/compsci/clipping.html
// Thanks!
// A bit modified to minimize code paths
Voronoi.prototype.clipEdge = function(edge, bbox) {
    var ax = edge.va.x,
        ay = edge.va.y,
        bx = edge.vb.x,
        by = edge.vb.y,
        t0 = 0,
        t1 = 1,
        dx = bx-ax,
        dy = by-ay;
    // left
    var q = ax-bbox.xl;
    if (dx===0 && q<0) {return false;}
    var r = -q/dx;
    if (dx<0) {
        if (r<t0) {return false;}
        if (r<t1) {t1=r;}
        }
    else if (dx>0) {
        if (r>t1) {return false;}
        if (r>t0) {t0=r;}
        }
    // right
    q = bbox.xr-ax;
    if (dx===0 && q<0) {return false;}
    r = q/dx;
    if (dx<0) {
        if (r>t1) {return false;}
        if (r>t0) {t0=r;}
        }
    else if (dx>0) {
        if (r<t0) {return false;}
        if (r<t1) {t1=r;}
        }
    // top
    q = ay-bbox.yt;
    if (dy===0 && q<0) {return false;}
    r = -q/dy;
    if (dy<0) {
        if (r<t0) {return false;}
        if (r<t1) {t1=r;}
        }
    else if (dy>0) {
        if (r>t1) {return false;}
        if (r>t0) {t0=r;}
        }
    // bottom
    q = bbox.yb-ay;
    if (dy===0 && q<0) {return false;}
    r = q/dy;
    if (dy<0) {
        if (r>t1) {return false;}
        if (r>t0) {t0=r;}
        }
    else if (dy>0) {
        if (r<t0) {return false;}
        if (r<t1) {t1=r;}
        }

    // if we reach this point, Voronoi edge is within bbox

    // if t0 > 0, va needs to change
    // rhill 2011-06-03: we need to create a new vertex rather
    // than modifying the existing one, since the existing
    // one is likely shared with at least another edge
    if (t0 > 0) {
        edge.va = this.createVertex(ax+t0*dx, ay+t0*dy);
        }

    // if t1 < 1, vb needs to change
    // rhill 2011-06-03: we need to create a new vertex rather
    // than modifying the existing one, since the existing
    // one is likely shared with at least another edge
    if (t1 < 1) {
        edge.vb = this.createVertex(ax+t1*dx, ay+t1*dy);
        }

    // va and/or vb were clipped, thus we will need to close
    // cells which use this edge.
    if ( t0 > 0 || t1 < 1 ) {
        this.cells[edge.lSite.voronoiId].closeMe = true;
        this.cells[edge.rSite.voronoiId].closeMe = true;
    }

    return true;
    };

// Connect/cut edges at bounding box
Voronoi.prototype.clipEdges = function(bbox) {
    // connect all dangling edges to bounding box
    // or get rid of them if it can't be done
    var edges = this.edges,
        iEdge = edges.length,
        edge,
        abs_fn = Math.abs;

    // iterate backward so we can splice safely
    while (iEdge--) {
        edge = edges[iEdge];
        // edge is removed if:
        //   it is wholly outside the bounding box
        //   it is looking more like a point than a line
        if (!this.connectEdge(edge, bbox) ||
            !this.clipEdge(edge, bbox) ||
            (abs_fn(edge.va.x-edge.vb.x)<1e-9 && abs_fn(edge.va.y-edge.vb.y)<1e-9)) {
            edge.va = edge.vb = null;
            edges.splice(iEdge,1);
            }
        }
    };

// Close the cells.
// The cells are bound by the supplied bounding box.
// Each cell refers to its associated site, and a list
// of halfedges ordered counterclockwise.
Voronoi.prototype.closeCells = function(bbox) {
    var xl = bbox.xl,
        xr = bbox.xr,
        yt = bbox.yt,
        yb = bbox.yb,
        cells = this.cells,
        iCell = cells.length,
        cell,
        iLeft,
        halfedges, nHalfedges,
        edge,
        va, vb, vz,
        lastBorderSegment,
        abs_fn = Math.abs;

    while (iCell--) {
        cell = cells[iCell];
        // prune, order halfedges counterclockwise, then add missing ones
        // required to close cells
        if (!cell.prepareHalfedges()) {
            continue;
            }
        if (!cell.closeMe) {
            continue;
            }
        // find first 'unclosed' point.
        // an 'unclosed' point will be the end point of a halfedge which
        // does not match the start point of the following halfedge
        halfedges = cell.halfedges;
        nHalfedges = halfedges.length;
        // special case: only one site, in which case, the viewport is the cell
        // ...

        // all other cases
        iLeft = 0;
        while (iLeft < nHalfedges) {
            va = halfedges[iLeft].getEndpoint();
            vz = halfedges[(iLeft+1) % nHalfedges].getStartpoint();
            // if end point is not equal to start point, we need to add the missing
            // halfedge(s) up to vz
            if (abs_fn(va.x-vz.x)>=1e-9 || abs_fn(va.y-vz.y)>=1e-9) {

                // rhill 2013-12-02:
                // "Holes" in the halfedges are not necessarily always adjacent.
                // https://github.com/gorhill/Javascript-Voronoi/issues/16

                // find entry point:
                switch (true) {

                    // walk downward along left side
                    case this.equalWithEpsilon(va.x,xl) && this.lessThanWithEpsilon(va.y,yb):
                        lastBorderSegment = this.equalWithEpsilon(vz.x,xl);
                        vb = this.createVertex(xl, lastBorderSegment ? vz.y : yb);
                        edge = this.createBorderEdge(cell.site, va, vb);
                        iLeft++;
                        halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                        nHalfedges++;
                        if ( lastBorderSegment ) { break; }
                        va = vb;
                        // fall through

                    // walk rightward along bottom side
                    case this.equalWithEpsilon(va.y,yb) && this.lessThanWithEpsilon(va.x,xr):
                        lastBorderSegment = this.equalWithEpsilon(vz.y,yb);
                        vb = this.createVertex(lastBorderSegment ? vz.x : xr, yb);
                        edge = this.createBorderEdge(cell.site, va, vb);
                        iLeft++;
                        halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                        nHalfedges++;
                        if ( lastBorderSegment ) { break; }
                        va = vb;
                        // fall through

                    // walk upward along right side
                    case this.equalWithEpsilon(va.x,xr) && this.greaterThanWithEpsilon(va.y,yt):
                        lastBorderSegment = this.equalWithEpsilon(vz.x,xr);
                        vb = this.createVertex(xr, lastBorderSegment ? vz.y : yt);
                        edge = this.createBorderEdge(cell.site, va, vb);
                        iLeft++;
                        halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                        nHalfedges++;
                        if ( lastBorderSegment ) { break; }
                        va = vb;
                        // fall through

                    // walk leftward along top side
                    case this.equalWithEpsilon(va.y,yt) && this.greaterThanWithEpsilon(va.x,xl):
                        lastBorderSegment = this.equalWithEpsilon(vz.y,yt);
                        vb = this.createVertex(lastBorderSegment ? vz.x : xl, yt);
                        edge = this.createBorderEdge(cell.site, va, vb);
                        iLeft++;
                        halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                        nHalfedges++;
                        if ( lastBorderSegment ) { break; }
                        va = vb;
                        // fall through

                        // walk downward along left side
                        lastBorderSegment = this.equalWithEpsilon(vz.x,xl);
                        vb = this.createVertex(xl, lastBorderSegment ? vz.y : yb);
                        edge = this.createBorderEdge(cell.site, va, vb);
                        iLeft++;
                        halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                        nHalfedges++;
                        if ( lastBorderSegment ) { break; }
                        va = vb;
                        // fall through

                        // walk rightward along bottom side
                        lastBorderSegment = this.equalWithEpsilon(vz.y,yb);
                        vb = this.createVertex(lastBorderSegment ? vz.x : xr, yb);
                        edge = this.createBorderEdge(cell.site, va, vb);
                        iLeft++;
                        halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                        nHalfedges++;
                        if ( lastBorderSegment ) { break; }
                        va = vb;
                        // fall through

                        // walk upward along right side
                        lastBorderSegment = this.equalWithEpsilon(vz.x,xr);
                        vb = this.createVertex(xr, lastBorderSegment ? vz.y : yt);
                        edge = this.createBorderEdge(cell.site, va, vb);
                        iLeft++;
                        halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                        nHalfedges++;
                        if ( lastBorderSegment ) { break; }
                        // fall through

                    default:
                        throw "Voronoi.closeCells() > this makes no sense!";
                    }
                }
            iLeft++;
            }
        cell.closeMe = false;
        }
    };

// ---------------------------------------------------------------------------
// Debugging helper
/*
Voronoi.prototype.dumpBeachline = function(y) {
    console.log('Voronoi.dumpBeachline(%f) > Beachsections, from left to right:', y);
    if ( !this.beachline ) {
        console.log('  None');
        }
    else {
        var bs = this.beachline.getFirst(this.beachline.root);
        while ( bs ) {
            console.log('  site %d: xl: %f, xr: %f', bs.site.voronoiId, this.leftBreakPoint(bs, y), this.rightBreakPoint(bs, y));
            bs = bs.rbNext;
            }
        }
    };
*/

// ---------------------------------------------------------------------------
// Helper: Quantize sites

// rhill 2013-10-12:
// This is to solve https://github.com/gorhill/Javascript-Voronoi/issues/15
// Since not all users will end up using the kind of coord values which would
// cause the issue to arise, I chose to let the user decide whether or not
// he should sanitize his coord values through this helper. This way, for
// those users who uses coord values which are known to be fine, no overhead is
// added.

Voronoi.prototype.quantizeSites = function(sites) {
    var ε = this.ε,
        n = sites.length,
        site;
    while ( n-- ) {
        site = sites[n];
        site.x = Math.floor(site.x / ε) * ε;
        site.y = Math.floor(site.y / ε) * ε;
        }
    };

// ---------------------------------------------------------------------------
// Helper: Recycle diagram: all vertex, edge and cell objects are
// "surrendered" to the Voronoi object for reuse.
// TODO: rhill-voronoi-core v2: more performance to be gained
// when I change the semantic of what is returned.

Voronoi.prototype.recycle = function(diagram) {
    if ( diagram ) {
        if ( diagram instanceof this.Diagram ) {
            this.toRecycle = diagram;
            }
        else {
            throw 'Voronoi.recycleDiagram() > Need a Diagram object.';
            }
        }
    };

// ---------------------------------------------------------------------------
// Top-level Fortune loop

// rhill 2011-05-19:
//   Voronoi sites are kept client-side now, to allow
//   user to freely modify content. At compute time,
//   *references* to sites are copied locally.

Voronoi.prototype.compute = function(sites, bbox) {
    // to measure execution time
    var startTime = new Date();

    // init internal state
    this.reset();

    // any diagram data available for recycling?
    // I do that here so that this is included in execution time
    if ( this.toRecycle ) {
        this.vertexJunkyard = this.vertexJunkyard.concat(this.toRecycle.vertices);
        this.edgeJunkyard = this.edgeJunkyard.concat(this.toRecycle.edges);
        this.cellJunkyard = this.cellJunkyard.concat(this.toRecycle.cells);
        this.toRecycle = null;
        }

    // Initialize site event queue
    var siteEvents = sites.slice(0);
    siteEvents.sort(function(a,b){
        var r = b.y - a.y;
        if (r) {return r;}
        return b.x - a.x;
        });

    // process queue
    var site = siteEvents.pop(),
        siteid = 0,
        xsitex, // to avoid duplicate sites
        xsitey,
        cells = this.cells,
        circle;

    // main loop
    for (;;) {
        // we need to figure whether we handle a site or circle event
        // for this we find out if there is a site event and it is
        // 'earlier' than the circle event
        circle = this.firstCircleEvent;

        // add beach section
        if (site && (!circle || site.y < circle.y || (site.y === circle.y && site.x < circle.x))) {
            // only if site is not a duplicate
            if (site.x !== xsitex || site.y !== xsitey) {
                // first create cell for new site
                cells[siteid] = this.createCell(site);
                site.voronoiId = siteid++;
                // then create a beachsection for that site
                this.addBeachsection(site);
                // remember last site coords to detect duplicate
                xsitey = site.y;
                xsitex = site.x;
                }
            site = siteEvents.pop();
            }

        // remove beach section
        else if (circle) {
            this.removeBeachsection(circle.arc);
            }

        // all done, quit
        else {
            break;
            }
        }

    // wrapping-up:
    //   connect dangling edges to bounding box
    //   cut edges as per bounding box
    //   discard edges completely outside bounding box
    //   discard edges which are point-like
    this.clipEdges(bbox);

    //   add missing edges in order to close opened cells
    this.closeCells(bbox);

    // to measure execution time
    var stopTime = new Date();

    // prepare return values
    var diagram = new this.Diagram();
    diagram.cells = this.cells;
    diagram.edges = this.edges;
    diagram.vertices = this.vertices;
    diagram.execTime = stopTime.getTime()-startTime.getTime();

    // clean up
    this.reset();

    return diagram;
    };

module.exports = Voronoi;

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZm9vZ3JhcGguanMiLCJzcmMvaW5kZXguanMiLCJzcmMvbGF5b3V0LmpzIiwic3JjL3JoaWxsLXZvcm9ub2ktY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzV3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGZvb2dyYXBoID0ge1xuICAvKipcbiAgICogSW5zZXJ0IGEgdmVydGV4IGludG8gdGhpcyBncmFwaC5cbiAgICpcbiAgICogQHBhcmFtIHZlcnRleCBBIHZhbGlkIFZlcnRleCBpbnN0YW5jZVxuICAgKi9cbiAgaW5zZXJ0VmVydGV4OiBmdW5jdGlvbih2ZXJ0ZXgpIHtcbiAgICAgIHRoaXMudmVydGljZXMucHVzaCh2ZXJ0ZXgpO1xuICAgICAgdGhpcy52ZXJ0ZXhDb3VudCsrO1xuICAgIH0sXG5cbiAgLyoqXG4gICAqIEluc2VydCBhbiBlZGdlIHZlcnRleDEgLS0+IHZlcnRleDIuXG4gICAqXG4gICAqIEBwYXJhbSBsYWJlbCBMYWJlbCBmb3IgdGhpcyBlZGdlXG4gICAqIEBwYXJhbSB3ZWlnaHQgV2VpZ2h0IG9mIHRoaXMgZWRnZVxuICAgKiBAcGFyYW0gdmVydGV4MSBTdGFydGluZyBWZXJ0ZXggaW5zdGFuY2VcbiAgICogQHBhcmFtIHZlcnRleDIgRW5kaW5nIFZlcnRleCBpbnN0YW5jZVxuICAgKiBAcmV0dXJuIE5ld2x5IGNyZWF0ZWQgRWRnZSBpbnN0YW5jZVxuICAgKi9cbiAgaW5zZXJ0RWRnZTogZnVuY3Rpb24obGFiZWwsIHdlaWdodCwgdmVydGV4MSwgdmVydGV4Miwgc3R5bGUpIHtcbiAgICAgIHZhciBlMSA9IG5ldyBmb29ncmFwaC5FZGdlKGxhYmVsLCB3ZWlnaHQsIHZlcnRleDIsIHN0eWxlKTtcbiAgICAgIHZhciBlMiA9IG5ldyBmb29ncmFwaC5FZGdlKG51bGwsIHdlaWdodCwgdmVydGV4MSwgbnVsbCk7XG5cbiAgICAgIHZlcnRleDEuZWRnZXMucHVzaChlMSk7XG4gICAgICB2ZXJ0ZXgyLnJldmVyc2VFZGdlcy5wdXNoKGUyKTtcblxuICAgICAgcmV0dXJuIGUxO1xuICAgIH0sXG5cbiAgLyoqXG4gICAqIERlbGV0ZSBlZGdlLlxuICAgKlxuICAgKiBAcGFyYW0gdmVydGV4IFN0YXJ0aW5nIHZlcnRleFxuICAgKiBAcGFyYW0gZWRnZSBFZGdlIHRvIHJlbW92ZVxuICAgKi9cbiAgcmVtb3ZlRWRnZTogZnVuY3Rpb24odmVydGV4MSwgdmVydGV4Mikge1xuICAgICAgZm9yICh2YXIgaSA9IHZlcnRleDEuZWRnZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgaWYgKHZlcnRleDEuZWRnZXNbaV0uZW5kVmVydGV4ID09IHZlcnRleDIpIHtcbiAgICAgICAgICB2ZXJ0ZXgxLmVkZ2VzLnNwbGljZShpLDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB2ZXJ0ZXgyLnJldmVyc2VFZGdlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAodmVydGV4Mi5yZXZlcnNlRWRnZXNbaV0uZW5kVmVydGV4ID09IHZlcnRleDEpIHtcbiAgICAgICAgICB2ZXJ0ZXgyLnJldmVyc2VFZGdlcy5zcGxpY2UoaSwxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgLyoqXG4gICAqIERlbGV0ZSB2ZXJ0ZXguXG4gICAqXG4gICAqIEBwYXJhbSB2ZXJ0ZXggVmVydGV4IHRvIHJlbW92ZSBmcm9tIHRoZSBncmFwaFxuICAgKi9cbiAgcmVtb3ZlVmVydGV4OiBmdW5jdGlvbih2ZXJ0ZXgpIHtcbiAgICAgIGZvciAodmFyIGkgPSB2ZXJ0ZXguZWRnZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRWRnZSh2ZXJ0ZXgsIHZlcnRleC5lZGdlc1tpXS5lbmRWZXJ0ZXgpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdmVydGV4LnJldmVyc2VFZGdlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFZGdlKHZlcnRleC5yZXZlcnNlRWRnZXNbaV0uZW5kVmVydGV4LCB2ZXJ0ZXgpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy52ZXJ0aWNlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgaWYgKHRoaXMudmVydGljZXNbaV0gPT0gdmVydGV4KSB7XG4gICAgICAgICAgdGhpcy52ZXJ0aWNlcy5zcGxpY2UoaSwxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnZlcnRleENvdW50LS07XG4gICAgfSxcblxuICAvKipcbiAgICogUGxvdHMgdGhpcyBncmFwaCB0byBhIGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtIGNhbnZhcyBBIHByb3BlciBjYW52YXMgaW5zdGFuY2VcbiAgICovXG4gIHBsb3Q6IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgICAgdmFyIGkgPSAwO1xuICAgICAgLyogRHJhdyBlZGdlcyBmaXJzdCAqL1xuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHYgPSB0aGlzLnZlcnRpY2VzW2ldO1xuICAgICAgICBpZiAoIXYuaGlkZGVuKSB7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2LmVkZ2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgZSA9IHYuZWRnZXNbal07XG4gICAgICAgICAgICAvKiBEcmF3IGVkZ2UgKGlmIG5vdCBoaWRkZW4pICovXG4gICAgICAgICAgICBpZiAoIWUuaGlkZGVuKVxuICAgICAgICAgICAgICBlLmRyYXcoY2FudmFzLCB2KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyogRHJhdyB0aGUgdmVydGljZXMuICovXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy52ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2ID0gdGhpcy52ZXJ0aWNlc1tpXTtcblxuICAgICAgICAvKiBEcmF3IHZlcnRleCAoaWYgbm90IGhpZGRlbikgKi9cbiAgICAgICAgaWYgKCF2LmhpZGRlbilcbiAgICAgICAgICB2LmRyYXcoY2FudmFzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gIC8qKlxuICAgKiBHcmFwaCBvYmplY3QgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSBsYWJlbCBMYWJlbCBvZiB0aGlzIGdyYXBoXG4gICAqIEBwYXJhbSBkaXJlY3RlZCB0cnVlIG9yIGZhbHNlXG4gICAqL1xuICBHcmFwaDogZnVuY3Rpb24gKGxhYmVsLCBkaXJlY3RlZCkge1xuICAgICAgLyogRmllbGRzLiAqL1xuICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICAgICAgdGhpcy52ZXJ0aWNlcyA9IG5ldyBBcnJheSgpO1xuICAgICAgdGhpcy5kaXJlY3RlZCA9IGRpcmVjdGVkO1xuICAgICAgdGhpcy52ZXJ0ZXhDb3VudCA9IDA7XG5cbiAgICAgIC8qIEdyYXBoIG1ldGhvZHMuICovXG4gICAgICB0aGlzLmluc2VydFZlcnRleCA9IGZvb2dyYXBoLmluc2VydFZlcnRleDtcbiAgICAgIHRoaXMucmVtb3ZlVmVydGV4ID0gZm9vZ3JhcGgucmVtb3ZlVmVydGV4O1xuICAgICAgdGhpcy5pbnNlcnRFZGdlID0gZm9vZ3JhcGguaW5zZXJ0RWRnZTtcbiAgICAgIHRoaXMucmVtb3ZlRWRnZSA9IGZvb2dyYXBoLnJlbW92ZUVkZ2U7XG4gICAgICB0aGlzLnBsb3QgPSBmb29ncmFwaC5wbG90O1xuICAgIH0sXG5cbiAgLyoqXG4gICAqIFZlcnRleCBvYmplY3QgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSBsYWJlbCBMYWJlbCBvZiB0aGlzIHZlcnRleFxuICAgKiBAcGFyYW0gbmV4dCBSZWZlcmVuY2UgdG8gdGhlIG5leHQgdmVydGV4IG9mIHRoaXMgZ3JhcGhcbiAgICogQHBhcmFtIGZpcnN0RWRnZSBGaXJzdCBlZGdlIG9mIGEgbGlua2VkIGxpc3Qgb2YgZWRnZXNcbiAgICovXG4gIFZlcnRleDogZnVuY3Rpb24obGFiZWwsIHgsIHksIHN0eWxlKSB7XG4gICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XG4gICAgICB0aGlzLmVkZ2VzID0gbmV3IEFycmF5KCk7XG4gICAgICB0aGlzLnJldmVyc2VFZGdlcyA9IG5ldyBBcnJheSgpO1xuICAgICAgdGhpcy54ID0geDtcbiAgICAgIHRoaXMueSA9IHk7XG4gICAgICB0aGlzLmR4ID0gMDtcbiAgICAgIHRoaXMuZHkgPSAwO1xuICAgICAgdGhpcy5sZXZlbCA9IC0xO1xuICAgICAgdGhpcy5udW1iZXJPZlBhcmVudHMgPSAwO1xuICAgICAgdGhpcy5oaWRkZW4gPSBmYWxzZTtcbiAgICAgIHRoaXMuZml4ZWQgPSBmYWxzZTsgICAgIC8vIEZpeGVkIHZlcnRpY2VzIGFyZSBzdGF0aWMgKHVubW92YWJsZSlcblxuICAgICAgaWYoc3R5bGUgIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuc3R5bGUgPSBzdHlsZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgeyAvLyBEZWZhdWx0XG4gICAgICAgICAgdGhpcy5zdHlsZSA9IG5ldyBmb29ncmFwaC5WZXJ0ZXhTdHlsZSgnZWxsaXBzZScsIDgwLCA0MCwgJyNmZmZmZmYnLCAnIzAwMDAwMCcsIHRydWUpO1xuICAgICAgfVxuICAgIH0sXG5cblxuICAgLyoqXG4gICAqIFZlcnRleFN0eWxlIG9iamVjdCB0eXBlIGZvciBkZWZpbmluZyB2ZXJ0ZXggc3R5bGUgb3B0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIHNoYXBlIFNoYXBlIG9mIHRoZSB2ZXJ0ZXggKCdlbGxpcHNlJyBvciAncmVjdCcpXG4gICAqIEBwYXJhbSB3aWR0aCBXaWR0aCBpbiBweFxuICAgKiBAcGFyYW0gaGVpZ2h0IEhlaWdodCBpbiBweFxuICAgKiBAcGFyYW0gZmlsbENvbG9yIFRoZSBjb2xvciB3aXRoIHdoaWNoIHRoZSB2ZXJ0ZXggaXMgZHJhd24gKFJHQiBIRVggc3RyaW5nKVxuICAgKiBAcGFyYW0gYm9yZGVyQ29sb3IgVGhlIGNvbG9yIHdpdGggd2hpY2ggdGhlIGJvcmRlciBvZiB0aGUgdmVydGV4IGlzIGRyYXduIChSR0IgSEVYIHN0cmluZylcbiAgICogQHBhcmFtIHNob3dMYWJlbCBTaG93IHRoZSB2ZXJ0ZXggbGFiZWwgb3Igbm90XG4gICAqL1xuICBWZXJ0ZXhTdHlsZTogZnVuY3Rpb24oc2hhcGUsIHdpZHRoLCBoZWlnaHQsIGZpbGxDb2xvciwgYm9yZGVyQ29sb3IsIHNob3dMYWJlbCkge1xuICAgICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xuICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICB0aGlzLmZpbGxDb2xvciA9IGZpbGxDb2xvcjtcbiAgICAgIHRoaXMuYm9yZGVyQ29sb3IgPSBib3JkZXJDb2xvcjtcbiAgICAgIHRoaXMuc2hvd0xhYmVsID0gc2hvd0xhYmVsO1xuICAgIH0sXG5cbiAgLyoqXG4gICAqIEVkZ2Ugb2JqZWN0IGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0gbGFiZWwgTGFiZWwgb2YgdGhpcyBlZGdlXG4gICAqIEBwYXJhbSBuZXh0IE5leHQgZWRnZSByZWZlcmVuY2VcbiAgICogQHBhcmFtIHdlaWdodCBFZGdlIHdlaWdodFxuICAgKiBAcGFyYW0gZW5kVmVydGV4IERlc3RpbmF0aW9uIFZlcnRleCBpbnN0YW5jZVxuICAgKi9cbiAgRWRnZTogZnVuY3Rpb24gKGxhYmVsLCB3ZWlnaHQsIGVuZFZlcnRleCwgc3R5bGUpIHtcbiAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICAgIHRoaXMud2VpZ2h0ID0gd2VpZ2h0O1xuICAgICAgdGhpcy5lbmRWZXJ0ZXggPSBlbmRWZXJ0ZXg7XG4gICAgICB0aGlzLnN0eWxlID0gbnVsbDtcbiAgICAgIHRoaXMuaGlkZGVuID0gZmFsc2U7XG5cbiAgICAgIC8vIEN1cnZpbmcgaW5mb3JtYXRpb25cbiAgICAgIHRoaXMuY3VydmVkID0gZmFsc2U7XG4gICAgICB0aGlzLmNvbnRyb2xYID0gLTE7ICAgLy8gQ29udHJvbCBjb29yZGluYXRlcyBmb3IgQmV6aWVyIGN1cnZlIGRyYXdpbmdcbiAgICAgIHRoaXMuY29udHJvbFkgPSAtMTtcbiAgICAgIHRoaXMub3JpZ2luYWwgPSBudWxsOyAvLyBJZiB0aGlzIGlzIGEgdGVtcG9yYXJ5IGVkZ2UgaXQgaG9sZHMgdGhlIG9yaWdpbmFsIGVkZ2VcblxuICAgICAgaWYoc3R5bGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnN0eWxlID0gc3R5bGU7XG4gICAgICB9XG4gICAgICBlbHNlIHsgIC8vIFNldCB0byBkZWZhdWx0XG4gICAgICAgIHRoaXMuc3R5bGUgPSBuZXcgZm9vZ3JhcGguRWRnZVN0eWxlKDIsICcjMDAwMDAwJywgdHJ1ZSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG5cblxuXG4gIC8qKlxuICAgKiBFZGdlU3R5bGUgb2JqZWN0IHR5cGUgZm9yIGRlZmluaW5nIHZlcnRleCBzdHlsZSBvcHRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0gd2lkdGggRWRnZSBsaW5lIHdpZHRoXG4gICAqIEBwYXJhbSBjb2xvciBUaGUgY29sb3Igd2l0aCB3aGljaCB0aGUgZWRnZSBpcyBkcmF3blxuICAgKiBAcGFyYW0gc2hvd0Fycm93IERyYXcgdGhlIGVkZ2UgYXJyb3cgKG9ubHkgaWYgZGlyZWN0ZWQpXG4gICAqIEBwYXJhbSBzaG93TGFiZWwgU2hvdyB0aGUgZWRnZSBsYWJlbCBvciBub3RcbiAgICovXG4gIEVkZ2VTdHlsZTogZnVuY3Rpb24od2lkdGgsIGNvbG9yLCBzaG93QXJyb3csIHNob3dMYWJlbCkge1xuICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgICAgdGhpcy5zaG93QXJyb3cgPSBzaG93QXJyb3c7XG4gICAgICB0aGlzLnNob3dMYWJlbCA9IHNob3dMYWJlbDtcbiAgICB9LFxuXG4gIC8qKlxuICAgKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBmb29ncmFwaCBKYXZhc2NyaXB0IGdyYXBoIGxpYnJhcnkuXG4gICAqXG4gICAqIERlc2NyaXB0aW9uOiBSYW5kb20gdmVydGV4IGxheW91dCBtYW5hZ2VyXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHdpZHRoIExheW91dCB3aWR0aFxuICAgKiBAcGFyYW0gaGVpZ2h0IExheW91dCBoZWlnaHRcbiAgICovXG4gIFJhbmRvbVZlcnRleExheW91dDogZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIH0sXG5cblxuICAvKipcbiAgICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZm9vZ3JhcGggSmF2YXNjcmlwdCBncmFwaCBsaWJyYXJ5LlxuICAgKlxuICAgKiBEZXNjcmlwdGlvbjogRnJ1Y2h0ZXJtYW4tUmVpbmdvbGQgZm9yY2UtZGlyZWN0ZWQgdmVydGV4XG4gICAqICAgICAgICAgICAgICBsYXlvdXQgbWFuYWdlclxuICAgKi9cblxuICAvKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB3aWR0aCBMYXlvdXQgd2lkdGhcbiAgICogQHBhcmFtIGhlaWdodCBMYXlvdXQgaGVpZ2h0XG4gICAqIEBwYXJhbSBpdGVyYXRpb25zIE51bWJlciBvZiBpdGVyYXRpb25zIC1cbiAgICogd2l0aCBtb3JlIGl0ZXJhdGlvbnMgaXQgaXMgbW9yZSBsaWtlbHkgdGhlIGxheW91dCBoYXMgY29udmVyZ2VkIGludG8gYSBzdGF0aWMgZXF1aWxpYnJpdW0uXG4gICAqL1xuICBGb3JjZURpcmVjdGVkVmVydGV4TGF5b3V0OiBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgaXRlcmF0aW9ucywgcmFuZG9taXplLCBlcHMpIHtcbiAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgdGhpcy5pdGVyYXRpb25zID0gaXRlcmF0aW9ucztcbiAgICAgIHRoaXMucmFuZG9taXplID0gcmFuZG9taXplO1xuICAgICAgdGhpcy5lcHMgPSBlcHM7XG4gICAgICB0aGlzLmNhbGxiYWNrID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9LFxuXG4gIEE6IDEuNSwgLy8gRmluZSB0dW5lIGF0dHJhY3Rpb25cblxuICBSOiAwLjUgIC8vIEZpbmUgdHVuZSByZXB1bHNpb25cbn07XG5cbi8qKlxuICogdG9TdHJpbmcgb3ZlcmxvYWQgZm9yIGVhc2llciBkZWJ1Z2dpbmdcbiAqL1xuZm9vZ3JhcGguVmVydGV4LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXCJbdjpcIiArIHRoaXMubGFiZWwgKyBcIl0gXCI7XG59O1xuXG4vKipcbiAqIHRvU3RyaW5nIG92ZXJsb2FkIGZvciBlYXNpZXIgZGVidWdnaW5nXG4gKi9cbmZvb2dyYXBoLkVkZ2UucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBcIltlOlwiICsgdGhpcy5lbmRWZXJ0ZXgubGFiZWwgKyBcIl0gXCI7XG59O1xuXG4vKipcbiAqIERyYXcgdmVydGV4IG1ldGhvZC5cbiAqXG4gKiBAcGFyYW0gY2FudmFzIGpzR3JhcGhpY3MgaW5zdGFuY2VcbiAqL1xuZm9vZ3JhcGguVmVydGV4LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG4gIHZhciB4ID0gdGhpcy54O1xuICB2YXIgeSA9IHRoaXMueTtcbiAgdmFyIHdpZHRoID0gdGhpcy5zdHlsZS53aWR0aDtcbiAgdmFyIGhlaWdodCA9IHRoaXMuc3R5bGUuaGVpZ2h0O1xuICB2YXIgc2hhcGUgPSB0aGlzLnN0eWxlLnNoYXBlO1xuXG4gIGNhbnZhcy5zZXRTdHJva2UoMik7XG4gIGNhbnZhcy5zZXRDb2xvcih0aGlzLnN0eWxlLmZpbGxDb2xvcik7XG5cbiAgaWYoc2hhcGUgPT0gJ3JlY3QnKSB7XG4gICAgY2FudmFzLmZpbGxSZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgIGNhbnZhcy5zZXRDb2xvcih0aGlzLnN0eWxlLmJvcmRlckNvbG9yKTtcbiAgICBjYW52YXMuZHJhd1JlY3QoeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gIH1cbiAgZWxzZSB7IC8vIERlZmF1bHQgdG8gZWxsaXBzZVxuICAgIGNhbnZhcy5maWxsRWxsaXBzZSh4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICBjYW52YXMuc2V0Q29sb3IodGhpcy5zdHlsZS5ib3JkZXJDb2xvcik7XG4gICAgY2FudmFzLmRyYXdFbGxpcHNlKHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgaWYodGhpcy5zdHlsZS5zaG93TGFiZWwpIHtcbiAgICBjYW52YXMuZHJhd1N0cmluZ1JlY3QodGhpcy5sYWJlbCwgeCwgeSArIGhlaWdodC8yIC0gNywgd2lkdGgsICdjZW50ZXInKTtcbiAgfVxufTtcblxuLyoqXG4gKiBGaXRzIHRoZSBncmFwaCBpbnRvIHRoZSBib3VuZGluZyBib3hcbiAqXG4gKiBAcGFyYW0gd2lkdGhcbiAqIEBwYXJhbSBoZWlnaHRcbiAqIEBwYXJhbSBwcmVzZXJ2ZUFzcGVjdFxuICovXG5mb29ncmFwaC5HcmFwaC5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgcHJlc2VydmVBc3BlY3QpIHtcbiAgZm9yICh2YXIgaTggaW4gdGhpcy52ZXJ0aWNlcykge1xuICAgIHZhciB2ID0gdGhpcy52ZXJ0aWNlc1tpOF07XG4gICAgdi5vbGRYID0gdi54O1xuICAgIHYub2xkWSA9IHYueTtcbiAgfVxuICB2YXIgbW54ID0gd2lkdGggICogMC4xO1xuICB2YXIgbXh4ID0gd2lkdGggICogMC45O1xuICB2YXIgbW55ID0gaGVpZ2h0ICogMC4xO1xuICB2YXIgbXh5ID0gaGVpZ2h0ICogMC45O1xuICBpZiAocHJlc2VydmVBc3BlY3QgPT0gbnVsbClcbiAgICBwcmVzZXJ2ZUFzcGVjdCA9IHRydWU7XG5cbiAgdmFyIG1pbnggPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICB2YXIgbWlueSA9IE51bWJlci5NQVhfVkFMVUU7XG4gIHZhciBtYXh4ID0gTnVtYmVyLk1JTl9WQUxVRTtcbiAgdmFyIG1heHkgPSBOdW1iZXIuTUlOX1ZBTFVFO1xuXG4gIGZvciAodmFyIGk3IGluIHRoaXMudmVydGljZXMpIHtcbiAgICB2YXIgdiA9IHRoaXMudmVydGljZXNbaTddO1xuICAgIGlmICh2LnggPCBtaW54KSBtaW54ID0gdi54O1xuICAgIGlmICh2LnkgPCBtaW55KSBtaW55ID0gdi55O1xuICAgIGlmICh2LnggPiBtYXh4KSBtYXh4ID0gdi54O1xuICAgIGlmICh2LnkgPiBtYXh5KSBtYXh5ID0gdi55O1xuICB9XG4gIHZhciBreCA9IChteHgtbW54KSAvIChtYXh4IC0gbWlueCk7XG4gIHZhciBreSA9IChteHktbW55KSAvIChtYXh5IC0gbWlueSk7XG5cbiAgaWYgKHByZXNlcnZlQXNwZWN0KSB7XG4gICAga3ggPSBNYXRoLm1pbihreCwga3kpO1xuICAgIGt5ID0gTWF0aC5taW4oa3gsIGt5KTtcbiAgfVxuXG4gIHZhciBuZXdNYXh4ID0gTnVtYmVyLk1JTl9WQUxVRTtcbiAgdmFyIG5ld01heHkgPSBOdW1iZXIuTUlOX1ZBTFVFO1xuICBmb3IgKHZhciBpOCBpbiB0aGlzLnZlcnRpY2VzKSB7XG4gICAgdmFyIHYgPSB0aGlzLnZlcnRpY2VzW2k4XTtcbiAgICB2LnggPSAodi54IC0gbWlueCkgKiBreDtcbiAgICB2LnkgPSAodi55IC0gbWlueSkgKiBreTtcbiAgICBpZiAodi54ID4gbmV3TWF4eCkgbmV3TWF4eCA9IHYueDtcbiAgICBpZiAodi55ID4gbmV3TWF4eSkgbmV3TWF4eSA9IHYueTtcbiAgfVxuXG4gIHZhciBkeCA9ICggd2lkdGggIC0gbmV3TWF4eCApIC8gMi4wO1xuICB2YXIgZHkgPSAoIGhlaWdodCAtIG5ld01heHkgKSAvIDIuMDtcbiAgZm9yICh2YXIgaTggaW4gdGhpcy52ZXJ0aWNlcykge1xuICAgIHZhciB2ID0gdGhpcy52ZXJ0aWNlc1tpOF07XG4gICAgdi54ICs9IGR4O1xuICAgIHYueSArPSBkeTtcbiAgfVxufTtcblxuLyoqXG4gKiBEcmF3IGVkZ2UgbWV0aG9kLiBEcmF3cyBlZGdlIFwidlwiIC0tPiBcInRoaXNcIi5cbiAqXG4gKiBAcGFyYW0gY2FudmFzIGpzR3JhcGhpY3MgaW5zdGFuY2VcbiAqIEBwYXJhbSB2IFN0YXJ0IHZlcnRleFxuICovXG5mb29ncmFwaC5FZGdlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzLCB2KSB7XG4gIHZhciB4MSA9IE1hdGgucm91bmQodi54ICsgdi5zdHlsZS53aWR0aC8yKTtcbiAgdmFyIHkxID0gTWF0aC5yb3VuZCh2LnkgKyB2LnN0eWxlLmhlaWdodC8yKTtcbiAgdmFyIHgyID0gTWF0aC5yb3VuZCh0aGlzLmVuZFZlcnRleC54ICsgdGhpcy5lbmRWZXJ0ZXguc3R5bGUud2lkdGgvMik7XG4gIHZhciB5MiA9IE1hdGgucm91bmQodGhpcy5lbmRWZXJ0ZXgueSArIHRoaXMuZW5kVmVydGV4LnN0eWxlLmhlaWdodC8yKTtcblxuICAvLyBDb250cm9sIHBvaW50IChuZWVkZWQgb25seSBmb3IgY3VydmVkIGVkZ2VzKVxuICB2YXIgeDMgPSB0aGlzLmNvbnRyb2xYO1xuICB2YXIgeTMgPSB0aGlzLmNvbnRyb2xZO1xuXG4gIC8vIEFycm93IHRpcCBhbmQgYW5nbGVcbiAgdmFyIFhfVElQLCBZX1RJUCwgQU5HTEU7XG5cbiAgLyogUXVhZHJpYyBCZXppZXIgY3VydmUgZGVmaW5pdGlvbi4gKi9cbiAgZnVuY3Rpb24gQngodCkgeyByZXR1cm4gKDEtdCkqKDEtdCkqeDEgKyAyKigxLXQpKnQqeDMgKyB0KnQqeDI7IH1cbiAgZnVuY3Rpb24gQnkodCkgeyByZXR1cm4gKDEtdCkqKDEtdCkqeTEgKyAyKigxLXQpKnQqeTMgKyB0KnQqeTI7IH1cblxuICBjYW52YXMuc2V0U3Ryb2tlKHRoaXMuc3R5bGUud2lkdGgpO1xuICBjYW52YXMuc2V0Q29sb3IodGhpcy5zdHlsZS5jb2xvcik7XG5cbiAgaWYodGhpcy5jdXJ2ZWQpIHsgLy8gRHJhdyBhIHF1YWRyaWMgQmV6aWVyIGN1cnZlXG4gICAgdGhpcy5jdXJ2ZWQgPSBmYWxzZTsgLy8gUmVzZXRcbiAgICB2YXIgdCA9IDAsIGR0ID0gMS8xMDtcbiAgICB2YXIgeHMgPSB4MSwgeXMgPSB5MSwgeG4sIHluO1xuXG4gICAgd2hpbGUgKHQgPCAxLWR0KSB7XG4gICAgICB0ICs9IGR0O1xuICAgICAgeG4gPSBCeCh0KTtcbiAgICAgIHluID0gQnkodCk7XG4gICAgICBjYW52YXMuZHJhd0xpbmUoeHMsIHlzLCB4biwgeW4pO1xuICAgICAgeHMgPSB4bjtcbiAgICAgIHlzID0geW47XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBhcnJvdyB0aXAgY29vcmRpbmF0ZXNcbiAgICBYX1RJUCA9IHhzO1xuICAgIFlfVElQID0geXM7XG5cbiAgICAvLyBNb3ZlIHRoZSB0aXAgdG8gKDAsMCkgYW5kIGNhbGN1bGF0ZSB0aGUgYW5nbGVcbiAgICAvLyBvZiB0aGUgYXJyb3cgaGVhZFxuICAgIEFOR0xFID0gYW5ndWxhckNvb3JkKEJ4KDEtMipkdCkgLSBYX1RJUCwgQnkoMS0yKmR0KSAtIFlfVElQKTtcblxuICB9IGVsc2Uge1xuICAgIGNhbnZhcy5kcmF3TGluZSh4MSwgeTEsIHgyLCB5Mik7XG5cbiAgICAvLyBTZXQgdGhlIGFycm93IHRpcCBjb29yZGluYXRlc1xuICAgIFhfVElQID0geDI7XG4gICAgWV9USVAgPSB5MjtcblxuICAgIC8vIE1vdmUgdGhlIHRpcCB0byAoMCwwKSBhbmQgY2FsY3VsYXRlIHRoZSBhbmdsZVxuICAgIC8vIG9mIHRoZSBhcnJvdyBoZWFkXG4gICAgQU5HTEUgPSBhbmd1bGFyQ29vcmQoeDEgLSBYX1RJUCwgeTEgLSBZX1RJUCk7XG4gIH1cblxuICBpZih0aGlzLnN0eWxlLnNob3dBcnJvdykge1xuICAgIGRyYXdBcnJvdyhBTkdMRSwgWF9USVAsIFlfVElQKTtcbiAgfVxuXG4gIC8vIFRPRE9cbiAgaWYodGhpcy5zdHlsZS5zaG93TGFiZWwpIHtcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBhbiBlZGdlIGFycm93LlxuICAgKiBAcGFyYW0gcGhpIFRoZSBhbmdsZSAoaW4gcmFkaWFucykgb2YgdGhlIGFycm93IGluIHBvbGFyIGNvb3JkaW5hdGVzLlxuICAgKiBAcGFyYW0geCBYIGNvb3JkaW5hdGUgb2YgdGhlIGFycm93IHRpcC5cbiAgICogQHBhcmFtIHkgWSBjb29yZGluYXRlIG9mIHRoZSBhcnJvdyB0aXAuXG4gICAqL1xuICBmdW5jdGlvbiBkcmF3QXJyb3cocGhpLCB4LCB5KVxuICB7XG4gICAgLy8gQXJyb3cgYm91bmRpbmcgYm94IChpbiBweClcbiAgICB2YXIgSCA9IDUwO1xuICAgIHZhciBXID0gMTA7XG5cbiAgICAvLyBTZXQgY2FydGVzaWFuIGNvb3JkaW5hdGVzIG9mIHRoZSBhcnJvd1xuICAgIHZhciBwMTEgPSAwLCBwMTIgPSAwO1xuICAgIHZhciBwMjEgPSBILCBwMjIgPSBXLzI7XG4gICAgdmFyIHAzMSA9IEgsIHAzMiA9IC1XLzI7XG5cbiAgICAvLyBDb252ZXJ0IHRvIHBvbGFyIGNvb3JkaW5hdGVzXG4gICAgdmFyIHIyID0gcmFkaWFsQ29vcmQocDIxLCBwMjIpO1xuICAgIHZhciByMyA9IHJhZGlhbENvb3JkKHAzMSwgcDMyKTtcbiAgICB2YXIgcGhpMiA9IGFuZ3VsYXJDb29yZChwMjEsIHAyMik7XG4gICAgdmFyIHBoaTMgPSBhbmd1bGFyQ29vcmQocDMxLCBwMzIpO1xuXG4gICAgLy8gUm90YXRlIHRoZSBhcnJvd1xuICAgIHBoaTIgKz0gcGhpO1xuICAgIHBoaTMgKz0gcGhpO1xuXG4gICAgLy8gVXBkYXRlIGNhcnRlc2lhbiBjb29yZGluYXRlc1xuICAgIHAyMSA9IHIyICogTWF0aC5jb3MocGhpMik7XG4gICAgcDIyID0gcjIgKiBNYXRoLnNpbihwaGkyKTtcbiAgICBwMzEgPSByMyAqIE1hdGguY29zKHBoaTMpO1xuICAgIHAzMiA9IHIzICogTWF0aC5zaW4ocGhpMyk7XG5cbiAgICAvLyBUcmFuc2xhdGVcbiAgICBwMTEgKz0geDtcbiAgICBwMTIgKz0geTtcbiAgICBwMjEgKz0geDtcbiAgICBwMjIgKz0geTtcbiAgICBwMzEgKz0geDtcbiAgICBwMzIgKz0geTtcblxuICAgIC8vIERyYXdcbiAgICBjYW52YXMuZmlsbFBvbHlnb24obmV3IEFycmF5KHAxMSwgcDIxLCBwMzEpLCBuZXcgQXJyYXkocDEyLCBwMjIsIHAzMikpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYW5ndWxhciBjb29yZGluYXRlLlxuICAgKiBAcGFyYW0geCBYIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIHkgWSBjb29yZGluYXRlXG4gICAqL1xuICAgZnVuY3Rpb24gYW5ndWxhckNvb3JkKHgsIHkpXG4gICB7XG4gICAgIHZhciBwaGkgPSAwLjA7XG5cbiAgICAgaWYgKHggPiAwICYmIHkgPj0gMCkge1xuICAgICAgcGhpID0gTWF0aC5hdGFuKHkveCk7XG4gICAgIH1cbiAgICAgaWYgKHggPiAwICYmIHkgPCAwKSB7XG4gICAgICAgcGhpID0gTWF0aC5hdGFuKHkveCkgKyAyKk1hdGguUEk7XG4gICAgIH1cbiAgICAgaWYgKHggPCAwKSB7XG4gICAgICAgcGhpID0gTWF0aC5hdGFuKHkveCkgKyBNYXRoLlBJO1xuICAgICB9XG4gICAgIGlmICh4ID0gMCAmJiB5ID4gMCkge1xuICAgICAgIHBoaSA9IE1hdGguUEkvMjtcbiAgICAgfVxuICAgICBpZiAoeCA9IDAgJiYgeSA8IDApIHtcbiAgICAgICBwaGkgPSAzKk1hdGguUEkvMjtcbiAgICAgfVxuXG4gICAgIHJldHVybiBwaGk7XG4gICB9XG5cbiAgIC8qKlxuICAgICogR2V0IHRoZSByYWRpYW4gY29vcmRpYW50ZS5cbiAgICAqIEBwYXJhbSB4MVxuICAgICogQHBhcmFtIHkxXG4gICAgKiBAcGFyYW0geDJcbiAgICAqIEBwYXJhbSB5MlxuICAgICovXG4gICBmdW5jdGlvbiByYWRpYWxDb29yZCh4LCB5KVxuICAge1xuICAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG4gICB9XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGNvb3JkaW5hdGVzIGJhc2VkIG9uIHB1cmUgY2hhbmNlLlxuICpcbiAqIEBwYXJhbSBncmFwaCBBIHZhbGlkIGdyYXBoIGluc3RhbmNlXG4gKi9cbmZvb2dyYXBoLlJhbmRvbVZlcnRleExheW91dC5wcm90b3R5cGUubGF5b3V0ID0gZnVuY3Rpb24oZ3JhcGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGk8Z3JhcGgudmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdiA9IGdyYXBoLnZlcnRpY2VzW2ldO1xuICAgIHYueCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIHRoaXMud2lkdGgpO1xuICAgIHYueSA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIHRoaXMuaGVpZ2h0KTtcbiAgfVxufTtcblxuLyoqXG4gKiBJZGVudGlmaWVzIGNvbm5lY3RlZCBjb21wb25lbnRzIG9mIGEgZ3JhcGggYW5kIGNyZWF0ZXMgXCJjZW50cmFsXCJcbiAqIHZlcnRpY2VzIGZvciBlYWNoIGNvbXBvbmVudC4gSWYgdGhlcmUgaXMgbW9yZSB0aGFuIG9uZSBjb21wb25lbnQsXG4gKiBhbGwgY2VudHJhbCB2ZXJ0aWNlcyBvZiBpbmRpdmlkdWFsIGNvbXBvbmVudHMgYXJlIGNvbm5lY3RlZCB0b1xuICogZWFjaCBvdGhlciB0byBwcmV2ZW50IGNvbXBvbmVudCBkcmlmdC5cbiAqXG4gKiBAcGFyYW0gZ3JhcGggQSB2YWxpZCBncmFwaCBpbnN0YW5jZVxuICogQHJldHVybiBBIGxpc3Qgb2YgY29tcG9uZW50IGNlbnRlciB2ZXJ0aWNlcyBvciBudWxsIHdoZW4gdGhlcmVcbiAqICAgICAgICAgaXMgb25seSBvbmUgY29tcG9uZW50LlxuICovXG5mb29ncmFwaC5Gb3JjZURpcmVjdGVkVmVydGV4TGF5b3V0LnByb3RvdHlwZS5fX2lkZW50aWZ5Q29tcG9uZW50cyA9IGZ1bmN0aW9uKGdyYXBoKSB7XG4gIHZhciBjb21wb25lbnRDZW50ZXJzID0gbmV3IEFycmF5KCk7XG4gIHZhciBjb21wb25lbnRzID0gbmV3IEFycmF5KCk7XG5cbiAgLy8gRGVwdGggZmlyc3Qgc2VhcmNoXG4gIGZ1bmN0aW9uIGRmcyh2ZXJ0ZXgpXG4gIHtcbiAgICB2YXIgc3RhY2sgPSBuZXcgQXJyYXkoKTtcbiAgICB2YXIgY29tcG9uZW50ID0gbmV3IEFycmF5KCk7XG4gICAgdmFyIGNlbnRlclZlcnRleCA9IG5ldyBmb29ncmFwaC5WZXJ0ZXgoXCJjb21wb25lbnRfY2VudGVyXCIsIC0xLCAtMSk7XG4gICAgY2VudGVyVmVydGV4LmhpZGRlbiA9IHRydWU7XG4gICAgY29tcG9uZW50Q2VudGVycy5wdXNoKGNlbnRlclZlcnRleCk7XG4gICAgY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiB2aXNpdFZlcnRleCh2KVxuICAgIHtcbiAgICAgIGNvbXBvbmVudC5wdXNoKHYpO1xuICAgICAgdi5fX2Rmc1Zpc2l0ZWQgPSB0cnVlO1xuXG4gICAgICBmb3IgKHZhciBpIGluIHYuZWRnZXMpIHtcbiAgICAgICAgdmFyIGUgPSB2LmVkZ2VzW2ldO1xuICAgICAgICBpZiAoIWUuaGlkZGVuKVxuICAgICAgICAgIHN0YWNrLnB1c2goZS5lbmRWZXJ0ZXgpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpIGluIHYucmV2ZXJzZUVkZ2VzKSB7XG4gICAgICAgIGlmICghdi5yZXZlcnNlRWRnZXNbaV0uaGlkZGVuKVxuICAgICAgICAgIHN0YWNrLnB1c2godi5yZXZlcnNlRWRnZXNbaV0uZW5kVmVydGV4KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2aXNpdFZlcnRleCh2ZXJ0ZXgpO1xuICAgIHdoaWxlIChzdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgdSA9IHN0YWNrLnBvcCgpO1xuXG4gICAgICBpZiAoIXUuX19kZnNWaXNpdGVkICYmICF1LmhpZGRlbikge1xuICAgICAgICB2aXNpdFZlcnRleCh1KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBDbGVhciBERlMgdmlzaXRlZCBmbGFnXG4gIGZvciAodmFyIGkgaW4gZ3JhcGgudmVydGljZXMpIHtcbiAgICB2YXIgdiA9IGdyYXBoLnZlcnRpY2VzW2ldO1xuICAgIHYuX19kZnNWaXNpdGVkID0gZmFsc2U7XG4gIH1cblxuICAvLyBJdGVyYXRlIHRocm91Z2ggYWxsIHZlcnRpY2VzIHN0YXJ0aW5nIERGUyBmcm9tIGVhY2ggdmVydGV4XG4gIC8vIHRoYXQgaGFzbid0IGJlZW4gdmlzaXRlZCB5ZXQuXG4gIGZvciAodmFyIGsgaW4gZ3JhcGgudmVydGljZXMpIHtcbiAgICB2YXIgdiA9IGdyYXBoLnZlcnRpY2VzW2tdO1xuICAgIGlmICghdi5fX2Rmc1Zpc2l0ZWQgJiYgIXYuaGlkZGVuKVxuICAgICAgZGZzKHYpO1xuICB9XG5cbiAgLy8gSW50ZXJjb25uZWN0IGFsbCBjZW50ZXIgdmVydGljZXNcbiAgaWYgKGNvbXBvbmVudENlbnRlcnMubGVuZ3RoID4gMSkge1xuICAgIGZvciAodmFyIGkgaW4gY29tcG9uZW50Q2VudGVycykge1xuICAgICAgZ3JhcGguaW5zZXJ0VmVydGV4KGNvbXBvbmVudENlbnRlcnNbaV0pO1xuICAgIH1cbiAgICBmb3IgKHZhciBpIGluIGNvbXBvbmVudHMpIHtcbiAgICAgIGZvciAodmFyIGogaW4gY29tcG9uZW50c1tpXSkge1xuICAgICAgICAvLyBDb25uZWN0IHZpc2l0ZWQgdmVydGV4IHRvIFwiY2VudHJhbFwiIGNvbXBvbmVudCB2ZXJ0ZXhcbiAgICAgICAgZWRnZSA9IGdyYXBoLmluc2VydEVkZ2UoXCJcIiwgMSwgY29tcG9uZW50c1tpXVtqXSwgY29tcG9uZW50Q2VudGVyc1tpXSk7XG4gICAgICAgIGVkZ2UuaGlkZGVuID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpIGluIGNvbXBvbmVudENlbnRlcnMpIHtcbiAgICAgIGZvciAodmFyIGogaW4gY29tcG9uZW50Q2VudGVycykge1xuICAgICAgICBpZiAoaSAhPSBqKSB7XG4gICAgICAgICAgZSA9IGdyYXBoLmluc2VydEVkZ2UoXCJcIiwgMywgY29tcG9uZW50Q2VudGVyc1tpXSwgY29tcG9uZW50Q2VudGVyc1tqXSk7XG4gICAgICAgICAgZS5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBvbmVudENlbnRlcnM7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY29vcmRpbmF0ZXMgYmFzZWQgb24gZm9yY2UtZGlyZWN0ZWQgcGxhY2VtZW50XG4gKiBhbGdvcml0aG0uXG4gKlxuICogQHBhcmFtIGdyYXBoIEEgdmFsaWQgZ3JhcGggaW5zdGFuY2VcbiAqL1xuZm9vZ3JhcGguRm9yY2VEaXJlY3RlZFZlcnRleExheW91dC5wcm90b3R5cGUubGF5b3V0ID0gZnVuY3Rpb24oZ3JhcGgpIHtcbiAgdGhpcy5ncmFwaCA9IGdyYXBoO1xuICB2YXIgYXJlYSA9IHRoaXMud2lkdGggKiB0aGlzLmhlaWdodDtcbiAgdmFyIGsgPSBNYXRoLnNxcnQoYXJlYSAvIGdyYXBoLnZlcnRleENvdW50KTtcblxuICB2YXIgdCA9IHRoaXMud2lkdGggLyAxMDsgLy8gVGVtcGVyYXR1cmUuXG4gIHZhciBkdCA9IHQgLyAodGhpcy5pdGVyYXRpb25zICsgMSk7XG5cbiAgdmFyIGVwcyA9IHRoaXMuZXBzOyAvLyBNaW5pbXVtIGRpc3RhbmNlIGJldHdlZW4gdGhlIHZlcnRpY2VzXG5cbiAgLy8gQXR0cmFjdGl2ZSBhbmQgcmVwdWxzaXZlIGZvcmNlc1xuICBmdW5jdGlvbiBGYSh6KSB7IHJldHVybiBmb29ncmFwaC5BKnoqei9rOyB9XG4gIGZ1bmN0aW9uIEZyKHopIHsgcmV0dXJuIGZvb2dyYXBoLlIqayprL3o7IH1cbiAgZnVuY3Rpb24gRncoeikgeyByZXR1cm4gMS96Kno7IH0gIC8vIEZvcmNlIGVtaXRlZCBieSB0aGUgd2FsbHNcblxuICAvLyBJbml0aWF0ZSBjb21wb25lbnQgaWRlbnRpZmljYXRpb24gYW5kIHZpcnR1YWwgdmVydGV4IGNyZWF0aW9uXG4gIC8vIHRvIHByZXZlbnQgZGlzY29ubmVjdGVkIGdyYXBoIGNvbXBvbmVudHMgZnJvbSBkcmlmdGluZyB0b28gZmFyIGFwYXJ0XG4gIGNlbnRlcnMgPSB0aGlzLl9faWRlbnRpZnlDb21wb25lbnRzKGdyYXBoKTtcblxuICAvLyBBc3NpZ24gaW5pdGlhbCByYW5kb20gcG9zaXRpb25zXG4gIGlmKHRoaXMucmFuZG9taXplKSB7XG4gICAgcmFuZG9tTGF5b3V0ID0gbmV3IGZvb2dyYXBoLlJhbmRvbVZlcnRleExheW91dCh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgcmFuZG9tTGF5b3V0LmxheW91dChncmFwaCk7XG4gIH1cblxuICAvLyBSdW4gdGhyb3VnaCBzb21lIGl0ZXJhdGlvbnNcbiAgZm9yICh2YXIgcSA9IDA7IHEgPCB0aGlzLml0ZXJhdGlvbnM7IHErKykge1xuXG4gICAgLyogQ2FsY3VsYXRlIHJlcHVsc2l2ZSBmb3JjZXMuICovXG4gICAgZm9yICh2YXIgaTEgaW4gZ3JhcGgudmVydGljZXMpIHtcbiAgICAgIHZhciB2ID0gZ3JhcGgudmVydGljZXNbaTFdO1xuXG4gICAgICB2LmR4ID0gMDtcbiAgICAgIHYuZHkgPSAwO1xuICAgICAgLy8gRG8gbm90IG1vdmUgZml4ZWQgdmVydGljZXNcbiAgICAgIGlmKCF2LmZpeGVkKSB7XG4gICAgICAgIGZvciAodmFyIGkyIGluIGdyYXBoLnZlcnRpY2VzKSB7XG4gICAgICAgICAgdmFyIHUgPSBncmFwaC52ZXJ0aWNlc1tpMl07XG4gICAgICAgICAgaWYgKHYgIT0gdSAmJiAhdS5maXhlZCkge1xuICAgICAgICAgICAgLyogRGlmZmVyZW5jZSB2ZWN0b3IgYmV0d2VlbiB0aGUgdHdvIHZlcnRpY2VzLiAqL1xuICAgICAgICAgICAgdmFyIGRpZnggPSB2LnggLSB1Lng7XG4gICAgICAgICAgICB2YXIgZGlmeSA9IHYueSAtIHUueTtcblxuICAgICAgICAgICAgLyogTGVuZ3RoIG9mIHRoZSBkaWYgdmVjdG9yLiAqL1xuICAgICAgICAgICAgdmFyIGQgPSBNYXRoLm1heChlcHMsIE1hdGguc3FydChkaWZ4KmRpZnggKyBkaWZ5KmRpZnkpKTtcbiAgICAgICAgICAgIHZhciBmb3JjZSA9IEZyKGQpO1xuICAgICAgICAgICAgdi5keCA9IHYuZHggKyAoZGlmeC9kKSAqIGZvcmNlO1xuICAgICAgICAgICAgdi5keSA9IHYuZHkgKyAoZGlmeS9kKSAqIGZvcmNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKiBUcmVhdCB0aGUgd2FsbHMgYXMgc3RhdGljIG9iamVjdHMgZW1pdGluZyBmb3JjZSBGdy4gKi9cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBzdW0gb2YgXCJ3YWxsXCIgZm9yY2VzIGluICh2LngsIHYueSlcbiAgICAgICAgLypcbiAgICAgICAgdmFyIHggPSBNYXRoLm1heChlcHMsIHYueCk7XG4gICAgICAgIHZhciB5ID0gTWF0aC5tYXgoZXBzLCB2LnkpO1xuICAgICAgICB2YXIgd3ggPSBNYXRoLm1heChlcHMsIHRoaXMud2lkdGggLSB2LngpO1xuICAgICAgICB2YXIgd3kgPSBNYXRoLm1heChlcHMsIHRoaXMuaGVpZ2h0IC0gdi55KTsgICAvLyBHb3R0YSBsb3ZlIGFsbCB0aG9zZSBOYU4ncyA6KVxuICAgICAgICB2YXIgUnggPSBGdyh4KSAtIEZ3KHd4KTtcbiAgICAgICAgdmFyIFJ5ID0gRncoeSkgLSBGdyh3eSk7XG5cbiAgICAgICAgdi5keCA9IHYuZHggKyBSeDtcbiAgICAgICAgdi5keSA9IHYuZHkgKyBSeTtcbiAgICAgICAgKi9cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBDYWxjdWxhdGUgYXR0cmFjdGl2ZSBmb3JjZXMuICovXG4gICAgZm9yICh2YXIgaTMgaW4gZ3JhcGgudmVydGljZXMpIHtcbiAgICAgIHZhciB2ID0gZ3JhcGgudmVydGljZXNbaTNdO1xuXG4gICAgICAvLyBEbyBub3QgbW92ZSBmaXhlZCB2ZXJ0aWNlc1xuICAgICAgaWYoIXYuZml4ZWQpIHtcbiAgICAgICAgZm9yICh2YXIgaTQgaW4gdi5lZGdlcykge1xuICAgICAgICAgIHZhciBlID0gdi5lZGdlc1tpNF07XG4gICAgICAgICAgdmFyIHUgPSBlLmVuZFZlcnRleDtcbiAgICAgICAgICB2YXIgZGlmeCA9IHYueCAtIHUueDtcbiAgICAgICAgICB2YXIgZGlmeSA9IHYueSAtIHUueTtcbiAgICAgICAgICB2YXIgZCA9IE1hdGgubWF4KGVwcywgTWF0aC5zcXJ0KGRpZngqZGlmeCArIGRpZnkqZGlmeSkpO1xuICAgICAgICAgIHZhciBmb3JjZSA9IEZhKGQpO1xuXG4gICAgICAgICAgLyogTGVuZ3RoIG9mIHRoZSBkaWYgdmVjdG9yLiAqL1xuICAgICAgICAgIHZhciBkID0gTWF0aC5tYXgoZXBzLCBNYXRoLnNxcnQoZGlmeCpkaWZ4ICsgZGlmeSpkaWZ5KSk7XG4gICAgICAgICAgdi5keCA9IHYuZHggLSAoZGlmeC9kKSAqIGZvcmNlO1xuICAgICAgICAgIHYuZHkgPSB2LmR5IC0gKGRpZnkvZCkgKiBmb3JjZTtcblxuICAgICAgICAgIHUuZHggPSB1LmR4ICsgKGRpZngvZCkgKiBmb3JjZTtcbiAgICAgICAgICB1LmR5ID0gdS5keSArIChkaWZ5L2QpICogZm9yY2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBMaW1pdCB0aGUgbWF4aW11bSBkaXNwbGFjZW1lbnQgdG8gdGhlIHRlbXBlcmF0dXJlIHRcbiAgICAgICAgYW5kIHByZXZlbnQgZnJvbSBiZWluZyBkaXNwbGFjZWQgb3V0c2lkZSBmcmFtZS4gICAgICovXG4gICAgZm9yICh2YXIgaTUgaW4gZ3JhcGgudmVydGljZXMpIHtcbiAgICAgIHZhciB2ID0gZ3JhcGgudmVydGljZXNbaTVdO1xuICAgICAgaWYoIXYuZml4ZWQpIHtcbiAgICAgICAgLyogTGVuZ3RoIG9mIHRoZSBkaXNwbGFjZW1lbnQgdmVjdG9yLiAqL1xuICAgICAgICB2YXIgZCA9IE1hdGgubWF4KGVwcywgTWF0aC5zcXJ0KHYuZHgqdi5keCArIHYuZHkqdi5keSkpO1xuXG4gICAgICAgIC8qIExpbWl0IHRvIHRoZSB0ZW1wZXJhdHVyZSB0LiAqL1xuICAgICAgICB2LnggPSB2LnggKyAodi5keC9kKSAqIE1hdGgubWluKGQsIHQpO1xuICAgICAgICB2LnkgPSB2LnkgKyAodi5keS9kKSAqIE1hdGgubWluKGQsIHQpO1xuXG4gICAgICAgIC8qIFN0YXkgaW5zaWRlIHRoZSBmcmFtZS4gKi9cbiAgICAgICAgLypcbiAgICAgICAgYm9yZGVyV2lkdGggPSB0aGlzLndpZHRoIC8gNTA7XG4gICAgICAgIGlmICh2LnggPCBib3JkZXJXaWR0aCkge1xuICAgICAgICAgIHYueCA9IGJvcmRlcldpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKHYueCA+IHRoaXMud2lkdGggLSBib3JkZXJXaWR0aCkge1xuICAgICAgICAgIHYueCA9IHRoaXMud2lkdGggLSBib3JkZXJXaWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2LnkgPCBib3JkZXJXaWR0aCkge1xuICAgICAgICAgIHYueSA9IGJvcmRlcldpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKHYueSA+IHRoaXMuaGVpZ2h0IC0gYm9yZGVyV2lkdGgpIHtcbiAgICAgICAgICB2LnkgPSB0aGlzLmhlaWdodCAtIGJvcmRlcldpZHRoO1xuICAgICAgICB9XG4gICAgICAgICovXG4gICAgICAgIHYueCA9IE1hdGgucm91bmQodi54KTtcbiAgICAgICAgdi55ID0gTWF0aC5yb3VuZCh2LnkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qIENvb2wuICovXG4gICAgdCAtPSBkdDtcblxuICAgIGlmIChxICUgMTAgPT0gMCkge1xuICAgICAgdGhpcy5jYWxsYmFjaygpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlbW92ZSB2aXJ0dWFsIGNlbnRlciB2ZXJ0aWNlc1xuICBpZiAoY2VudGVycykge1xuICAgIGZvciAodmFyIGkgaW4gY2VudGVycykge1xuICAgICAgZ3JhcGgucmVtb3ZlVmVydGV4KGNlbnRlcnNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIGdyYXBoLm5vcm1hbGl6ZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdHJ1ZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZvb2dyYXBoO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4oZnVuY3Rpb24oKXtcblxuICAvLyByZWdpc3RlcnMgdGhlIGV4dGVuc2lvbiBvbiBhIGN5dG9zY2FwZSBsaWIgcmVmXG4gIHZhciBnZXRMYXlvdXQgPSByZXF1aXJlKCcuL2xheW91dCcpO1xuICB2YXIgcmVnaXN0ZXIgPSBmdW5jdGlvbiggY3l0b3NjYXBlICl7XG4gICAgdmFyIGxheW91dCA9IGdldExheW91dCggY3l0b3NjYXBlICk7XG5cbiAgICBjeXRvc2NhcGUoJ2xheW91dCcsICdzcHJlYWQnLCBsYXlvdXQpO1xuICB9O1xuXG4gIGlmKCB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cyApeyAvLyBleHBvc2UgYXMgYSBjb21tb25qcyBtb2R1bGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHJlZ2lzdGVyO1xuICB9XG5cbiAgaWYoIHR5cGVvZiBkZWZpbmUgIT09ICd1bmRlZmluZWQnICYmIGRlZmluZS5hbWQgKXsgLy8gZXhwb3NlIGFzIGFuIGFtZC9yZXF1aXJlanMgbW9kdWxlXG4gICAgZGVmaW5lKCdjeXRvc2NhcGUtc3ByZWFkJywgZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiByZWdpc3RlcjtcbiAgICB9KTtcbiAgfVxuXG4gIGlmKCB0eXBlb2YgY3l0b3NjYXBlICE9PSAndW5kZWZpbmVkJyApeyAvLyBleHBvc2UgdG8gZ2xvYmFsIGN5dG9zY2FwZSAoaS5lLiB3aW5kb3cuY3l0b3NjYXBlKVxuICAgIHJlZ2lzdGVyKCBjeXRvc2NhcGUgKTtcbiAgfVxuXG59KSgpO1xuIiwidmFyIFRocmVhZDtcblxudmFyIGZvb2dyYXBoID0gcmVxdWlyZSgnLi9mb29ncmFwaCcpO1xudmFyIFZvcm9ub2kgPSByZXF1aXJlKCcuL3JoaWxsLXZvcm9ub2ktY29yZScpO1xuXG4vKlxuICogVGhpcyBsYXlvdXQgY29tYmluZXMgc2V2ZXJhbCBhbGdvcml0aG1zOlxuICpcbiAqIC0gSXQgZ2VuZXJhdGVzIGFuIGluaXRpYWwgcG9zaXRpb24gb2YgdGhlIG5vZGVzIGJ5IHVzaW5nIHRoZVxuICogICBGcnVjaHRlcm1hbi1SZWluZ29sZCBhbGdvcml0aG0gKGRvaToxMC4xMDAyL3NwZS40MzgwMjExMTAyKVxuICpcbiAqIC0gRmluYWxseSBpdCBlbGltaW5hdGVzIG92ZXJsYXBzIGJ5IHVzaW5nIHRoZSBtZXRob2QgZGVzY3JpYmVkIGJ5XG4gKiAgIEdhbnNuZXIgYW5kIE5vcnRoIChkb2k6MTAuMTAwNy8zLTU0MC0zNzYyMy0yXzI4KVxuICovXG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgYW5pbWF0ZTogdHJ1ZSwgLy8gd2hldGhlciB0byBzaG93IHRoZSBsYXlvdXQgYXMgaXQncyBydW5uaW5nXG4gIHJlYWR5OiB1bmRlZmluZWQsIC8vIENhbGxiYWNrIG9uIGxheW91dHJlYWR5XG4gIHN0b3A6IHVuZGVmaW5lZCwgLy8gQ2FsbGJhY2sgb24gbGF5b3V0c3RvcFxuICBmaXQ6IHRydWUsIC8vIFJlc2V0IHZpZXdwb3J0IHRvIGZpdCBkZWZhdWx0IHNpbXVsYXRpb25Cb3VuZHNcbiAgbWluRGlzdDogMjAsIC8vIE1pbmltdW0gZGlzdGFuY2UgYmV0d2VlbiBub2Rlc1xuICBwYWRkaW5nOiAyMCwgLy8gUGFkZGluZ1xuICBleHBhbmRpbmdGYWN0b3I6IC0xLjAsIC8vIElmIHRoZSBuZXR3b3JrIGRvZXMgbm90IHNhdGlzZnkgdGhlIG1pbkRpc3RcbiAgLy8gY3JpdGVyaXVtIHRoZW4gaXQgZXhwYW5kcyB0aGUgbmV0d29yayBvZiB0aGlzIGFtb3VudFxuICAvLyBJZiBpdCBpcyBzZXQgdG8gLTEuMCB0aGUgYW1vdW50IG9mIGV4cGFuc2lvbiBpcyBhdXRvbWF0aWNhbGx5XG4gIC8vIGNhbGN1bGF0ZWQgYmFzZWQgb24gdGhlIG1pbkRpc3QsIHRoZSBhc3BlY3QgcmF0aW8gYW5kIHRoZVxuICAvLyBudW1iZXIgb2Ygbm9kZXNcbiAgbWF4RnJ1Y2h0ZXJtYW5SZWluZ29sZEl0ZXJhdGlvbnM6IDUwLCAvLyBNYXhpbXVtIG51bWJlciBvZiBpbml0aWFsIGZvcmNlLWRpcmVjdGVkIGl0ZXJhdGlvbnNcbiAgbWF4RXhwYW5kSXRlcmF0aW9uczogNCwgLy8gTWF4aW11bSBudW1iZXIgb2YgZXhwYW5kaW5nIGl0ZXJhdGlvbnNcbiAgYm91bmRpbmdCb3g6IHVuZGVmaW5lZCwgLy8gQ29uc3RyYWluIGxheW91dCBib3VuZHM7IHsgeDEsIHkxLCB4MiwgeTIgfSBvciB7IHgxLCB5MSwgdywgaCB9XG4gIHJhbmRvbWl6ZTogZmFsc2UgLy8gdXNlcyByYW5kb20gaW5pdGlhbCBub2RlIHBvc2l0aW9ucyBvbiB0cnVlXG59O1xuXG5mdW5jdGlvbiBTcHJlYWRMYXlvdXQoIG9wdGlvbnMgKSB7XG4gIHZhciBvcHRzID0gdGhpcy5vcHRpb25zID0ge307XG4gIGZvciggdmFyIGkgaW4gZGVmYXVsdHMgKXsgb3B0c1tpXSA9IGRlZmF1bHRzW2ldOyB9XG4gIGZvciggdmFyIGkgaW4gb3B0aW9ucyApeyBvcHRzW2ldID0gb3B0aW9uc1tpXTsgfVxufVxuXG5TcHJlYWRMYXlvdXQucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKCkge1xuXG4gIHZhciBsYXlvdXQgPSB0aGlzO1xuICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgdmFyIGN5ID0gb3B0aW9ucy5jeTtcblxuICB2YXIgYmIgPSBvcHRpb25zLmJvdW5kaW5nQm94IHx8IHsgeDE6IDAsIHkxOiAwLCB3OiBjeS53aWR0aCgpLCBoOiBjeS5oZWlnaHQoKSB9O1xuICBpZiggYmIueDIgPT09IHVuZGVmaW5lZCApeyBiYi54MiA9IGJiLngxICsgYmIudzsgfVxuICBpZiggYmIudyA9PT0gdW5kZWZpbmVkICl7IGJiLncgPSBiYi54MiAtIGJiLngxOyB9XG4gIGlmKCBiYi55MiA9PT0gdW5kZWZpbmVkICl7IGJiLnkyID0gYmIueTEgKyBiYi5oOyB9XG4gIGlmKCBiYi5oID09PSB1bmRlZmluZWQgKXsgYmIuaCA9IGJiLnkyIC0gYmIueTE7IH1cblxuICB2YXIgbm9kZXMgPSBjeS5ub2RlcygpO1xuICB2YXIgZWRnZXMgPSBjeS5lZGdlcygpO1xuICB2YXIgY1dpZHRoID0gY3kud2lkdGgoKTtcbiAgdmFyIGNIZWlnaHQgPSBjeS5oZWlnaHQoKTtcbiAgdmFyIHNpbXVsYXRpb25Cb3VuZHMgPSBiYjtcbiAgdmFyIHBhZGRpbmcgPSBvcHRpb25zLnBhZGRpbmc7XG4gIHZhciBzaW1CQkZhY3RvciA9IE1hdGgubWF4KCAxLCBNYXRoLmxvZyhub2Rlcy5sZW5ndGgpICogMC44ICk7XG5cbiAgaWYoIG5vZGVzLmxlbmd0aCA8IDEwMCApe1xuICAgIHNpbUJCRmFjdG9yIC89IDI7XG4gIH1cblxuICBsYXlvdXQudHJpZ2dlcigge1xuICAgIHR5cGU6ICdsYXlvdXRzdGFydCcsXG4gICAgbGF5b3V0OiBsYXlvdXRcbiAgfSApO1xuXG4gIHZhciBzaW1CQiA9IHtcbiAgICB4MTogMCxcbiAgICB5MTogMCxcbiAgICB4MjogY1dpZHRoICogc2ltQkJGYWN0b3IsXG4gICAgeTI6IGNIZWlnaHQgKiBzaW1CQkZhY3RvclxuICB9O1xuXG4gIGlmKCBzaW11bGF0aW9uQm91bmRzICkge1xuICAgIHNpbUJCLngxID0gc2ltdWxhdGlvbkJvdW5kcy54MTtcbiAgICBzaW1CQi55MSA9IHNpbXVsYXRpb25Cb3VuZHMueTE7XG4gICAgc2ltQkIueDIgPSBzaW11bGF0aW9uQm91bmRzLngyO1xuICAgIHNpbUJCLnkyID0gc2ltdWxhdGlvbkJvdW5kcy55MjtcbiAgfVxuXG4gIHNpbUJCLngxICs9IHBhZGRpbmc7XG4gIHNpbUJCLnkxICs9IHBhZGRpbmc7XG4gIHNpbUJCLngyIC09IHBhZGRpbmc7XG4gIHNpbUJCLnkyIC09IHBhZGRpbmc7XG5cbiAgdmFyIHdpZHRoID0gc2ltQkIueDIgLSBzaW1CQi54MTtcbiAgdmFyIGhlaWdodCA9IHNpbUJCLnkyIC0gc2ltQkIueTE7XG5cbiAgLy8gR2V0IHN0YXJ0IHRpbWVcbiAgdmFyIHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cbiAgLy8gbGF5b3V0IGRvZXNuJ3Qgd29yayB3aXRoIGp1c3QgMSBub2RlXG4gIGlmKCBub2Rlcy5zaXplKCkgPD0gMSApIHtcbiAgICBub2Rlcy5wb3NpdGlvbnMoIHtcbiAgICAgIHg6IE1hdGgucm91bmQoICggc2ltQkIueDEgKyBzaW1CQi54MiApIC8gMiApLFxuICAgICAgeTogTWF0aC5yb3VuZCggKCBzaW1CQi55MSArIHNpbUJCLnkyICkgLyAyIClcbiAgICB9ICk7XG5cbiAgICBpZiggb3B0aW9ucy5maXQgKSB7XG4gICAgICBjeS5maXQoIG9wdGlvbnMucGFkZGluZyApO1xuICAgIH1cblxuICAgIC8vIEdldCBlbmQgdGltZVxuICAgIHZhciBlbmRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBjb25zb2xlLmluZm8oIFwiTGF5b3V0IG9uIFwiICsgbm9kZXMuc2l6ZSgpICsgXCIgbm9kZXMgdG9vayBcIiArICggZW5kVGltZSAtIHN0YXJ0VGltZSApICsgXCIgbXNcIiApO1xuXG4gICAgbGF5b3V0Lm9uZSggXCJsYXlvdXRyZWFkeVwiLCBvcHRpb25zLnJlYWR5ICk7XG4gICAgbGF5b3V0LnRyaWdnZXIoIFwibGF5b3V0cmVhZHlcIiApO1xuXG4gICAgbGF5b3V0Lm9uZSggXCJsYXlvdXRzdG9wXCIsIG9wdGlvbnMuc3RvcCApO1xuICAgIGxheW91dC50cmlnZ2VyKCBcImxheW91dHN0b3BcIiApO1xuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRmlyc3QgSSBuZWVkIHRvIGNyZWF0ZSB0aGUgZGF0YSBzdHJ1Y3R1cmUgdG8gcGFzcyB0byB0aGUgd29ya2VyXG4gIHZhciBwRGF0YSA9IHtcbiAgICAnd2lkdGgnOiB3aWR0aCxcbiAgICAnaGVpZ2h0JzogaGVpZ2h0LFxuICAgICdtaW5EaXN0Jzogb3B0aW9ucy5taW5EaXN0LFxuICAgICdleHBGYWN0Jzogb3B0aW9ucy5leHBhbmRpbmdGYWN0b3IsXG4gICAgJ2V4cEl0JzogMCxcbiAgICAnbWF4RXhwSXQnOiBvcHRpb25zLm1heEV4cGFuZEl0ZXJhdGlvbnMsXG4gICAgJ3ZlcnRpY2VzJzogW10sXG4gICAgJ2VkZ2VzJzogW10sXG4gICAgJ3N0YXJ0VGltZSc6IHN0YXJ0VGltZSxcbiAgICAnbWF4RnJ1Y2h0ZXJtYW5SZWluZ29sZEl0ZXJhdGlvbnMnOiBvcHRpb25zLm1heEZydWNodGVybWFuUmVpbmdvbGRJdGVyYXRpb25zXG4gIH07XG5cbiAgbm9kZXMuZWFjaChcbiAgICBmdW5jdGlvbiggaSwgbm9kZSApIHtcbiAgICAgIHZhciBub2RlSWQgPSBub2RlLmlkKCk7XG4gICAgICB2YXIgcG9zID0gbm9kZS5wb3NpdGlvbigpO1xuXG4gICAgICBpZiggb3B0aW9ucy5yYW5kb21pemUgKXtcbiAgICAgICAgcG9zID0ge1xuICAgICAgICAgIHg6IE1hdGgucm91bmQoIHNpbUJCLngxICsgKHNpbUJCLngyIC0gc2ltQkIueDEpICogTWF0aC5yYW5kb20oKSApLFxuICAgICAgICAgIHk6IE1hdGgucm91bmQoIHNpbUJCLnkxICsgKHNpbUJCLnkyIC0gc2ltQkIueTEpICogTWF0aC5yYW5kb20oKSApXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHBEYXRhWyAndmVydGljZXMnIF0ucHVzaCgge1xuICAgICAgICBpZDogbm9kZUlkLFxuICAgICAgICB4OiBwb3MueCxcbiAgICAgICAgeTogcG9zLnlcbiAgICAgIH0gKTtcbiAgICB9ICk7XG5cbiAgZWRnZXMuZWFjaChcbiAgICBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzcmNOb2RlSWQgPSB0aGlzLnNvdXJjZSgpLmlkKCk7XG4gICAgICB2YXIgdGd0Tm9kZUlkID0gdGhpcy50YXJnZXQoKS5pZCgpO1xuICAgICAgcERhdGFbICdlZGdlcycgXS5wdXNoKCB7XG4gICAgICAgIHNyYzogc3JjTm9kZUlkLFxuICAgICAgICB0Z3Q6IHRndE5vZGVJZFxuICAgICAgfSApO1xuICAgIH0gKTtcblxuICAvL0RlY2xlcmF0aW9uXG4gIHZhciB0MSA9IGxheW91dC50aHJlYWQ7XG5cbiAgLy8gcmV1c2Ugb2xkIHRocmVhZCBpZiBwb3NzaWJsZVxuICBpZiggIXQxIHx8IHQxLnN0b3BwZWQoKSApe1xuICAgIHQxID0gbGF5b3V0LnRocmVhZCA9IFRocmVhZCgpO1xuXG4gICAgLy8gQW5kIHRvIGFkZCB0aGUgcmVxdWlyZWQgc2NyaXB0c1xuICAgIC8vRVhURVJOQUwgMVxuICAgIHQxLnJlcXVpcmUoIGZvb2dyYXBoLCAnZm9vZ3JhcGgnICk7XG4gICAgLy9FWFRFUk5BTCAyXG4gICAgdDEucmVxdWlyZSggVm9yb25vaSwgJ1Zvcm9ub2knICk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRQb3NpdGlvbnMoIHBEYXRhICl7IC8vY29uc29sZS5sb2coJ3NldCBwb3NucycpXG4gICAgLy8gRmlyc3Qgd2UgcmV0cmlldmUgdGhlIGltcG9ydGFudCBkYXRhXG4gICAgLy8gdmFyIGV4cGFuZEl0ZXJhdGlvbiA9IHBEYXRhWyAnZXhwSXQnIF07XG4gICAgdmFyIGRhdGFWZXJ0aWNlcyA9IHBEYXRhWyAndmVydGljZXMnIF07XG4gICAgdmFyIHZlcnRpY2VzID0gW107XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBkYXRhVmVydGljZXMubGVuZ3RoOyArK2kgKSB7XG4gICAgICB2YXIgZHYgPSBkYXRhVmVydGljZXNbIGkgXTtcbiAgICAgIHZlcnRpY2VzWyBkdi5pZCBdID0ge1xuICAgICAgICB4OiBkdi54LFxuICAgICAgICB5OiBkdi55XG4gICAgICB9O1xuICAgIH1cbiAgICAvKlxuICAgICAqIEZJTkFMTFk6XG4gICAgICpcbiAgICAgKiBXZSBwb3NpdGlvbiB0aGUgbm9kZXMgYmFzZWQgb24gdGhlIGNhbGN1bGF0aW9uXG4gICAgICovXG4gICAgbm9kZXMucG9zaXRpb25zKFxuICAgICAgZnVuY3Rpb24oIGksIG5vZGUgKSB7XG4gICAgICAgIHZhciBpZCA9IG5vZGUuaWQoKVxuICAgICAgICB2YXIgdmVydGV4ID0gdmVydGljZXNbIGlkIF07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiBNYXRoLnJvdW5kKCBzaW1CQi54MSArIHZlcnRleC54ICksXG4gICAgICAgICAgeTogTWF0aC5yb3VuZCggc2ltQkIueTEgKyB2ZXJ0ZXgueSApXG4gICAgICAgIH07XG4gICAgICB9ICk7XG5cbiAgICBpZiggb3B0aW9ucy5maXQgKSB7XG4gICAgICBjeS5maXQoIG9wdGlvbnMucGFkZGluZyApO1xuICAgIH1cblxuICAgIGN5Lm5vZGVzKCkucnRyaWdnZXIoIFwicG9zaXRpb25cIiApO1xuICB9XG5cbiAgdmFyIGRpZExheW91dFJlYWR5ID0gZmFsc2U7XG4gIHQxLm9uKCdtZXNzYWdlJywgZnVuY3Rpb24oZSl7XG4gICAgdmFyIHBEYXRhID0gZS5tZXNzYWdlOyAvL2NvbnNvbGUubG9nKCdtZXNzYWdlJywgZSlcblxuICAgIGlmKCAhb3B0aW9ucy5hbmltYXRlICl7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0UG9zaXRpb25zKCBwRGF0YSApO1xuXG4gICAgaWYoICFkaWRMYXlvdXRSZWFkeSApe1xuICAgICAgbGF5b3V0LnRyaWdnZXIoIFwibGF5b3V0cmVhZHlcIiApO1xuXG4gICAgICBkaWRMYXlvdXRSZWFkeSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICBsYXlvdXQub25lKCBcImxheW91dHJlYWR5XCIsIG9wdGlvbnMucmVhZHkgKTtcblxuICB0MS5wYXNzKCBwRGF0YSApLnJ1biggZnVuY3Rpb24oIHBEYXRhICkge1xuXG4gICAgZnVuY3Rpb24gY2VsbENlbnRyb2lkKCBjZWxsICkge1xuICAgICAgdmFyIGhlcyA9IGNlbGwuaGFsZmVkZ2VzO1xuICAgICAgdmFyIGFyZWEgPSAwLFxuICAgICAgICB4ID0gMCxcbiAgICAgICAgeSA9IDA7XG4gICAgICB2YXIgcDEsIHAyLCBmO1xuXG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGhlcy5sZW5ndGg7ICsraSApIHtcbiAgICAgICAgcDEgPSBoZXNbIGkgXS5nZXRFbmRwb2ludCgpO1xuICAgICAgICBwMiA9IGhlc1sgaSBdLmdldFN0YXJ0cG9pbnQoKTtcblxuICAgICAgICBhcmVhICs9IHAxLnggKiBwMi55O1xuICAgICAgICBhcmVhIC09IHAxLnkgKiBwMi54O1xuXG4gICAgICAgIGYgPSBwMS54ICogcDIueSAtIHAyLnggKiBwMS55O1xuICAgICAgICB4ICs9ICggcDEueCArIHAyLnggKSAqIGY7XG4gICAgICAgIHkgKz0gKCBwMS55ICsgcDIueSApICogZjtcbiAgICAgIH1cblxuICAgICAgYXJlYSAvPSAyO1xuICAgICAgZiA9IGFyZWEgKiA2O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogeCAvIGYsXG4gICAgICAgIHk6IHkgLyBmXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNpdGVzRGlzdGFuY2UoIGxzLCBycyApIHtcbiAgICAgIHZhciBkeCA9IGxzLnggLSBycy54O1xuICAgICAgdmFyIGR5ID0gbHMueSAtIHJzLnk7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSApO1xuICAgIH1cblxuICAgIGZvb2dyYXBoID0gZXZhbCgnZm9vZ3JhcGgnKTtcbiAgICBWb3Jvbm9pID0gZXZhbCgnVm9yb25vaScpO1xuXG4gICAgLy8gSSBuZWVkIHRvIHJldHJpZXZlIHRoZSBpbXBvcnRhbnQgZGF0YVxuICAgIHZhciBsV2lkdGggPSBwRGF0YVsgJ3dpZHRoJyBdO1xuICAgIHZhciBsSGVpZ2h0ID0gcERhdGFbICdoZWlnaHQnIF07XG4gICAgdmFyIGxNaW5EaXN0ID0gcERhdGFbICdtaW5EaXN0JyBdO1xuICAgIHZhciBsRXhwRmFjdCA9IHBEYXRhWyAnZXhwRmFjdCcgXTtcbiAgICB2YXIgbE1heEV4cEl0ID0gcERhdGFbICdtYXhFeHBJdCcgXTtcbiAgICB2YXIgbE1heEZydWNodGVybWFuUmVpbmdvbGRJdGVyYXRpb25zID0gcERhdGFbICdtYXhGcnVjaHRlcm1hblJlaW5nb2xkSXRlcmF0aW9ucycgXTtcblxuICAgIC8vIFByZXBhcmUgdGhlIGRhdGEgdG8gb3V0cHV0XG4gICAgdmFyIHNhdmVQb3NpdGlvbnMgPSBmdW5jdGlvbigpe1xuICAgICAgcERhdGFbICd3aWR0aCcgXSA9IGxXaWR0aDtcbiAgICAgIHBEYXRhWyAnaGVpZ2h0JyBdID0gbEhlaWdodDtcbiAgICAgIHBEYXRhWyAnZXhwSXQnIF0gPSBleHBhbmRJdGVyYXRpb247XG4gICAgICBwRGF0YVsgJ2V4cEZhY3QnIF0gPSBsRXhwRmFjdDtcblxuICAgICAgcERhdGFbICd2ZXJ0aWNlcycgXSA9IFtdO1xuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBmdi5sZW5ndGg7ICsraSApIHtcbiAgICAgICAgcERhdGFbICd2ZXJ0aWNlcycgXS5wdXNoKCB7XG4gICAgICAgICAgaWQ6IGZ2WyBpIF0ubGFiZWwsXG4gICAgICAgICAgeDogZnZbIGkgXS54LFxuICAgICAgICAgIHk6IGZ2WyBpIF0ueVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBtZXNzYWdlUG9zaXRpb25zID0gZnVuY3Rpb24oKXtcbiAgICAgIGJyb2FkY2FzdCggcERhdGEgKTtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBGSVJTVCBTVEVQOiBBcHBsaWNhdGlvbiBvZiB0aGUgRnJ1Y2h0ZXJtYW4tUmVpbmdvbGQgYWxnb3JpdGhtXG4gICAgICpcbiAgICAgKiBXZSB1c2UgdGhlIHZlcnNpb24gaW1wbGVtZW50ZWQgYnkgdGhlIGZvb2dyYXBoIGxpYnJhcnlcbiAgICAgKlxuICAgICAqIFJlZi46IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvZm9vZ3JhcGgvXG4gICAgICovXG5cbiAgICAvLyBXZSBuZWVkIHRvIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBhIGdyYXBoIGNvbXBhdGlibGUgd2l0aCB0aGUgbGlicmFyeVxuICAgIHZhciBmcmcgPSBuZXcgZm9vZ3JhcGguR3JhcGgoIFwiRlJncmFwaFwiLCBmYWxzZSApO1xuXG4gICAgdmFyIGZyZ05vZGVzID0ge307XG5cbiAgICAvLyBUaGVuIHdlIGhhdmUgdG8gYWRkIHRoZSB2ZXJ0aWNlc1xuICAgIHZhciBkYXRhVmVydGljZXMgPSBwRGF0YVsgJ3ZlcnRpY2VzJyBdO1xuICAgIGZvciggdmFyIG5pID0gMDsgbmkgPCBkYXRhVmVydGljZXMubGVuZ3RoOyArK25pICkge1xuICAgICAgdmFyIGlkID0gZGF0YVZlcnRpY2VzWyBuaSBdWyAnaWQnIF07XG4gICAgICB2YXIgdiA9IG5ldyBmb29ncmFwaC5WZXJ0ZXgoIGlkLCBNYXRoLnJvdW5kKCBNYXRoLnJhbmRvbSgpICogbEhlaWdodCApLCBNYXRoLnJvdW5kKCBNYXRoLnJhbmRvbSgpICogbEhlaWdodCApICk7XG4gICAgICBmcmdOb2Rlc1sgaWQgXSA9IHY7XG4gICAgICBmcmcuaW5zZXJ0VmVydGV4KCB2ICk7XG4gICAgfVxuXG4gICAgdmFyIGRhdGFFZGdlcyA9IHBEYXRhWyAnZWRnZXMnIF07XG4gICAgZm9yKCB2YXIgZWkgPSAwOyBlaSA8IGRhdGFFZGdlcy5sZW5ndGg7ICsrZWkgKSB7XG4gICAgICB2YXIgc3JjTm9kZUlkID0gZGF0YUVkZ2VzWyBlaSBdWyAnc3JjJyBdO1xuICAgICAgdmFyIHRndE5vZGVJZCA9IGRhdGFFZGdlc1sgZWkgXVsgJ3RndCcgXTtcbiAgICAgIGZyZy5pbnNlcnRFZGdlKCBcIlwiLCAxLCBmcmdOb2Rlc1sgc3JjTm9kZUlkIF0sIGZyZ05vZGVzWyB0Z3ROb2RlSWQgXSApO1xuICAgIH1cblxuICAgIHZhciBmdiA9IGZyZy52ZXJ0aWNlcztcblxuICAgIC8vIFRoZW4gd2UgYXBwbHkgdGhlIGxheW91dFxuICAgIHZhciBpdGVyYXRpb25zID0gbE1heEZydWNodGVybWFuUmVpbmdvbGRJdGVyYXRpb25zO1xuICAgIHZhciBmckxheW91dE1hbmFnZXIgPSBuZXcgZm9vZ3JhcGguRm9yY2VEaXJlY3RlZFZlcnRleExheW91dCggbFdpZHRoLCBsSGVpZ2h0LCBpdGVyYXRpb25zLCBmYWxzZSwgbE1pbkRpc3QgKTtcblxuICAgIGZyTGF5b3V0TWFuYWdlci5jYWxsYmFjayA9IGZ1bmN0aW9uKCl7XG4gICAgICBzYXZlUG9zaXRpb25zKCk7XG4gICAgICBtZXNzYWdlUG9zaXRpb25zKCk7XG4gICAgfTtcblxuICAgIGZyTGF5b3V0TWFuYWdlci5sYXlvdXQoIGZyZyApO1xuXG4gICAgc2F2ZVBvc2l0aW9ucygpO1xuICAgIG1lc3NhZ2VQb3NpdGlvbnMoKTtcblxuICAgIC8qXG4gICAgICogU0VDT05EIFNURVA6IFRpZGluZyB1cCBvZiB0aGUgZ3JhcGguXG4gICAgICpcbiAgICAgKiBXZSB1c2UgdGhlIG1ldGhvZCBkZXNjcmliZWQgYnkgR2Fuc25lciBhbmQgTm9ydGgsIGJhc2VkIG9uIFZvcm9ub2lcbiAgICAgKiBkaWFncmFtcy5cbiAgICAgKlxuICAgICAqIFJlZjogZG9pOjEwLjEwMDcvMy01NDAtMzc2MjMtMl8yOFxuICAgICAqL1xuXG4gICAgLy8gV2UgY2FsY3VsYXRlIHRoZSBWb3Jvbm9pIGRpYWdyYW0gZG9yIHRoZSBwb3NpdGlvbiBvZiB0aGUgbm9kZXNcbiAgICB2YXIgdm9yb25vaSA9IG5ldyBWb3Jvbm9pKCk7XG4gICAgdmFyIGJib3ggPSB7XG4gICAgICB4bDogMCxcbiAgICAgIHhyOiBsV2lkdGgsXG4gICAgICB5dDogMCxcbiAgICAgIHliOiBsSGVpZ2h0XG4gICAgfTtcbiAgICB2YXIgdlNpdGVzID0gW107XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBmdi5sZW5ndGg7ICsraSApIHtcbiAgICAgIHZTaXRlc1sgZnZbIGkgXS5sYWJlbCBdID0gZnZbIGkgXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja01pbkRpc3QoIGVlICkge1xuICAgICAgdmFyIGluZnJhY3Rpb25zID0gMDtcbiAgICAgIC8vIFRoZW4gd2UgY2hlY2sgaWYgdGhlIG1pbmltdW0gZGlzdGFuY2UgaXMgc2F0aXNmaWVkXG4gICAgICBmb3IoIHZhciBlZWkgPSAwOyBlZWkgPCBlZS5sZW5ndGg7ICsrZWVpICkge1xuICAgICAgICB2YXIgZSA9IGVlWyBlZWkgXTtcbiAgICAgICAgaWYoICggZS5sU2l0ZSAhPSBudWxsICkgJiYgKCBlLnJTaXRlICE9IG51bGwgKSAmJiBzaXRlc0Rpc3RhbmNlKCBlLmxTaXRlLCBlLnJTaXRlICkgPCBsTWluRGlzdCApIHtcbiAgICAgICAgICArK2luZnJhY3Rpb25zO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gaW5mcmFjdGlvbnM7XG4gICAgfVxuXG4gICAgdmFyIGRpYWdyYW0gPSB2b3Jvbm9pLmNvbXB1dGUoIGZ2LCBiYm94ICk7XG5cbiAgICAvLyBUaGVuIHdlIHJlcG9zaXRpb24gdGhlIG5vZGVzIGF0IHRoZSBjZW50cm9pZCBvZiB0aGVpciBWb3Jvbm9pIGNlbGxzXG4gICAgdmFyIGNlbGxzID0gZGlhZ3JhbS5jZWxscztcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNlbGxzLmxlbmd0aDsgKytpICkge1xuICAgICAgdmFyIGNlbGwgPSBjZWxsc1sgaSBdO1xuICAgICAgdmFyIHNpdGUgPSBjZWxsLnNpdGU7XG4gICAgICB2YXIgY2VudHJvaWQgPSBjZWxsQ2VudHJvaWQoIGNlbGwgKTtcbiAgICAgIHZhciBjdXJydiA9IHZTaXRlc1sgc2l0ZS5sYWJlbCBdO1xuICAgICAgY3VycnYueCA9IGNlbnRyb2lkLng7XG4gICAgICBjdXJydi55ID0gY2VudHJvaWQueTtcbiAgICB9XG5cbiAgICBpZiggbEV4cEZhY3QgPCAwLjAgKSB7XG4gICAgICAvLyBDYWxjdWxhdGVzIHRoZSBleHBhbmRpbmcgZmFjdG9yXG4gICAgICBsRXhwRmFjdCA9IE1hdGgubWF4KCAwLjA1LCBNYXRoLm1pbiggMC4xMCwgbE1pbkRpc3QgLyBNYXRoLnNxcnQoICggbFdpZHRoICogbEhlaWdodCApIC8gZnYubGVuZ3RoICkgKiAwLjUgKSApO1xuICAgICAgLy9jb25zb2xlLmluZm8oXCJFeHBhbmRpbmcgZmFjdG9yIGlzIFwiICsgKG9wdGlvbnMuZXhwYW5kaW5nRmFjdG9yICogMTAwLjApICsgXCIlXCIpO1xuICAgIH1cblxuICAgIHZhciBwcmV2SW5mcmFjdGlvbnMgPSBjaGVja01pbkRpc3QoIGRpYWdyYW0uZWRnZXMgKTtcbiAgICAvL2NvbnNvbGUuaW5mbyhcIkluaXRpYWwgaW5mcmFjdGlvbnMgXCIgKyBwcmV2SW5mcmFjdGlvbnMpO1xuXG4gICAgdmFyIGJTdG9wID0gKCBwcmV2SW5mcmFjdGlvbnMgPD0gMCApO1xuXG4gICAgdmFyIHZvcm9ub2lJdGVyYXRpb24gPSAwO1xuICAgIHZhciBleHBhbmRJdGVyYXRpb24gPSAwO1xuXG4gICAgLy8gdmFyIGluaXRXaWR0aCA9IGxXaWR0aDtcblxuICAgIHdoaWxlKCAhYlN0b3AgKSB7XG4gICAgICArK3Zvcm9ub2lJdGVyYXRpb247XG4gICAgICBmb3IoIHZhciBpdCA9IDA7IGl0IDw9IDQ7ICsraXQgKSB7XG4gICAgICAgIHZvcm9ub2kucmVjeWNsZSggZGlhZ3JhbSApO1xuICAgICAgICBkaWFncmFtID0gdm9yb25vaS5jb21wdXRlKCBmdiwgYmJveCApO1xuXG4gICAgICAgIC8vIFRoZW4gd2UgcmVwb3NpdGlvbiB0aGUgbm9kZXMgYXQgdGhlIGNlbnRyb2lkIG9mIHRoZWlyIFZvcm9ub2kgY2VsbHNcbiAgICAgICAgY2VsbHMgPSBkaWFncmFtLmNlbGxzO1xuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNlbGxzLmxlbmd0aDsgKytpICkge1xuICAgICAgICAgIHZhciBjZWxsID0gY2VsbHNbIGkgXTtcbiAgICAgICAgICB2YXIgc2l0ZSA9IGNlbGwuc2l0ZTtcbiAgICAgICAgICB2YXIgY2VudHJvaWQgPSBjZWxsQ2VudHJvaWQoIGNlbGwgKTtcbiAgICAgICAgICB2YXIgY3VycnYgPSB2U2l0ZXNbIHNpdGUubGFiZWwgXTtcbiAgICAgICAgICBjdXJydi54ID0gY2VudHJvaWQueDtcbiAgICAgICAgICBjdXJydi55ID0gY2VudHJvaWQueTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgY3VyckluZnJhY3Rpb25zID0gY2hlY2tNaW5EaXN0KCBkaWFncmFtLmVkZ2VzICk7XG4gICAgICAvL2NvbnNvbGUuaW5mbyhcIkN1cnJlbnQgaW5mcmFjdGlvbnMgXCIgKyBjdXJySW5mcmFjdGlvbnMpO1xuXG4gICAgICBpZiggY3VyckluZnJhY3Rpb25zIDw9IDAgKSB7XG4gICAgICAgIGJTdG9wID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKCBjdXJySW5mcmFjdGlvbnMgPj0gcHJldkluZnJhY3Rpb25zIHx8IHZvcm9ub2lJdGVyYXRpb24gPj0gNCApIHtcbiAgICAgICAgICBpZiggZXhwYW5kSXRlcmF0aW9uID49IGxNYXhFeHBJdCApIHtcbiAgICAgICAgICAgIGJTdG9wID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbFdpZHRoICs9IGxXaWR0aCAqIGxFeHBGYWN0O1xuICAgICAgICAgICAgbEhlaWdodCArPSBsSGVpZ2h0ICogbEV4cEZhY3Q7XG4gICAgICAgICAgICBiYm94ID0ge1xuICAgICAgICAgICAgICB4bDogMCxcbiAgICAgICAgICAgICAgeHI6IGxXaWR0aCxcbiAgICAgICAgICAgICAgeXQ6IDAsXG4gICAgICAgICAgICAgIHliOiBsSGVpZ2h0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgKytleHBhbmRJdGVyYXRpb247XG4gICAgICAgICAgICB2b3Jvbm9pSXRlcmF0aW9uID0gMDtcbiAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKFwiRXhwYW5kZWQgdG8gKFwiK3dpZHRoK1wiLFwiK2hlaWdodCtcIilcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwcmV2SW5mcmFjdGlvbnMgPSBjdXJySW5mcmFjdGlvbnM7XG5cbiAgICAgIHNhdmVQb3NpdGlvbnMoKTtcbiAgICAgIG1lc3NhZ2VQb3NpdGlvbnMoKTtcbiAgICB9XG5cbiAgICBzYXZlUG9zaXRpb25zKCk7XG4gICAgcmV0dXJuIHBEYXRhO1xuXG4gIH0gKS50aGVuKCBmdW5jdGlvbiggcERhdGEgKSB7XG4gICAgLy8gdmFyIGV4cGFuZEl0ZXJhdGlvbiA9IHBEYXRhWyAnZXhwSXQnIF07XG4gICAgdmFyIGRhdGFWZXJ0aWNlcyA9IHBEYXRhWyAndmVydGljZXMnIF07XG5cbiAgICBzZXRQb3NpdGlvbnMoIHBEYXRhICk7XG5cbiAgICAvLyBHZXQgZW5kIHRpbWVcbiAgICB2YXIgc3RhcnRUaW1lID0gcERhdGFbICdzdGFydFRpbWUnIF07XG4gICAgdmFyIGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIGNvbnNvbGUuaW5mbyggXCJMYXlvdXQgb24gXCIgKyBkYXRhVmVydGljZXMubGVuZ3RoICsgXCIgbm9kZXMgdG9vayBcIiArICggZW5kVGltZSAtIHN0YXJ0VGltZSApICsgXCIgbXNcIiApO1xuXG4gICAgbGF5b3V0Lm9uZSggXCJsYXlvdXRzdG9wXCIsIG9wdGlvbnMuc3RvcCApO1xuXG4gICAgaWYoICFvcHRpb25zLmFuaW1hdGUgKXtcbiAgICAgIGxheW91dC50cmlnZ2VyKCBcImxheW91dHJlYWR5XCIgKTtcbiAgICB9XG5cbiAgICBsYXlvdXQudHJpZ2dlciggXCJsYXlvdXRzdG9wXCIgKTtcblxuICAgIHQxLnN0b3AoKTtcbiAgfSApO1xuXG5cbiAgcmV0dXJuIHRoaXM7XG59OyAvLyBydW5cblxuU3ByZWFkTGF5b3V0LnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgaWYoIHRoaXMudGhyZWFkICl7XG4gICAgdGhpcy50aHJlYWQuc3RvcCgpO1xuICB9XG5cbiAgdGhpcy50cmlnZ2VyKCdsYXlvdXRzdG9wJyk7XG59O1xuXG5TcHJlYWRMYXlvdXQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xuICBpZiggdGhpcy50aHJlYWQgKXtcbiAgICB0aGlzLnRocmVhZC5zdG9wKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0KCBjeXRvc2NhcGUgKXtcbiAgVGhyZWFkID0gY3l0b3NjYXBlLlRocmVhZDtcblxuICByZXR1cm4gU3ByZWFkTGF5b3V0O1xufTtcbiIsIi8qIVxuQ29weXJpZ2h0IChDKSAyMDEwLTIwMTMgUmF5bW9uZCBIaWxsOiBodHRwczovL2dpdGh1Yi5jb20vZ29yaGlsbC9KYXZhc2NyaXB0LVZvcm9ub2lcbk1JVCBMaWNlbnNlOiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2dvcmhpbGwvSmF2YXNjcmlwdC1Wb3Jvbm9pL0xJQ0VOU0UubWRcbiovXG4vKlxuQXV0aG9yOiBSYXltb25kIEhpbGwgKHJoaWxsQHJheW1vbmRoaWxsLm5ldClcbkNvbnRyaWJ1dG9yOiBKZXNzZSBNb3JnYW4gKG1vcmdhamVsQGdtYWlsLmNvbSlcbkZpbGU6IHJoaWxsLXZvcm9ub2ktY29yZS5qc1xuVmVyc2lvbjogMC45OFxuRGF0ZTogSmFudWFyeSAyMSwgMjAxM1xuRGVzY3JpcHRpb246IFRoaXMgaXMgbXkgcGVyc29uYWwgSmF2YXNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZlxuU3RldmVuIEZvcnR1bmUncyBhbGdvcml0aG0gdG8gY29tcHV0ZSBWb3Jvbm9pIGRpYWdyYW1zLlxuXG5MaWNlbnNlOiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2dvcmhpbGwvSmF2YXNjcmlwdC1Wb3Jvbm9pL0xJQ0VOU0UubWRcbkNyZWRpdHM6IFNlZSBodHRwczovL2dpdGh1Yi5jb20vZ29yaGlsbC9KYXZhc2NyaXB0LVZvcm9ub2kvQ1JFRElUUy5tZFxuSGlzdG9yeTogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9nb3JoaWxsL0phdmFzY3JpcHQtVm9yb25vaS9DSEFOR0VMT0cubWRcblxuIyMgVXNhZ2U6XG5cbiAgdmFyIHNpdGVzID0gW3t4OjMwMCx5OjMwMH0sIHt4OjEwMCx5OjEwMH0sIHt4OjIwMCx5OjUwMH0sIHt4OjI1MCx5OjQ1MH0sIHt4OjYwMCx5OjE1MH1dO1xuICAvLyB4bCwgeHIgbWVhbnMgeCBsZWZ0LCB4IHJpZ2h0XG4gIC8vIHl0LCB5YiBtZWFucyB5IHRvcCwgeSBib3R0b21cbiAgdmFyIGJib3ggPSB7eGw6MCwgeHI6ODAwLCB5dDowLCB5Yjo2MDB9O1xuICB2YXIgdm9yb25vaSA9IG5ldyBWb3Jvbm9pKCk7XG4gIC8vIHBhc3MgYW4gb2JqZWN0IHdoaWNoIGV4aGliaXRzIHhsLCB4ciwgeXQsIHliIHByb3BlcnRpZXMuIFRoZSBib3VuZGluZ1xuICAvLyBib3ggd2lsbCBiZSB1c2VkIHRvIGNvbm5lY3QgdW5ib3VuZCBlZGdlcywgYW5kIHRvIGNsb3NlIG9wZW4gY2VsbHNcbiAgcmVzdWx0ID0gdm9yb25vaS5jb21wdXRlKHNpdGVzLCBiYm94KTtcbiAgLy8gcmVuZGVyLCBmdXJ0aGVyIGFuYWx5emUsIGV0Yy5cblxuUmV0dXJuIHZhbHVlOlxuICBBbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG5cbiAgcmVzdWx0LnZlcnRpY2VzID0gYW4gYXJyYXkgb2YgdW5vcmRlcmVkLCB1bmlxdWUgVm9yb25vaS5WZXJ0ZXggb2JqZWN0cyBtYWtpbmdcbiAgICB1cCB0aGUgVm9yb25vaSBkaWFncmFtLlxuICByZXN1bHQuZWRnZXMgPSBhbiBhcnJheSBvZiB1bm9yZGVyZWQsIHVuaXF1ZSBWb3Jvbm9pLkVkZ2Ugb2JqZWN0cyBtYWtpbmcgdXBcbiAgICB0aGUgVm9yb25vaSBkaWFncmFtLlxuICByZXN1bHQuY2VsbHMgPSBhbiBhcnJheSBvZiBWb3Jvbm9pLkNlbGwgb2JqZWN0IG1ha2luZyB1cCB0aGUgVm9yb25vaSBkaWFncmFtLlxuICAgIEEgQ2VsbCBvYmplY3QgbWlnaHQgaGF2ZSBhbiBlbXB0eSBhcnJheSBvZiBoYWxmZWRnZXMsIG1lYW5pbmcgbm8gVm9yb25vaVxuICAgIGNlbGwgY291bGQgYmUgY29tcHV0ZWQgZm9yIGEgcGFydGljdWxhciBjZWxsLlxuICByZXN1bHQuZXhlY1RpbWUgPSB0aGUgdGltZSBpdCB0b29rIHRvIGNvbXB1dGUgdGhlIFZvcm9ub2kgZGlhZ3JhbSwgaW5cbiAgICBtaWxsaXNlY29uZHMuXG5cblZvcm9ub2kuVmVydGV4IG9iamVjdDpcbiAgeDogVGhlIHggcG9zaXRpb24gb2YgdGhlIHZlcnRleC5cbiAgeTogVGhlIHkgcG9zaXRpb24gb2YgdGhlIHZlcnRleC5cblxuVm9yb25vaS5FZGdlIG9iamVjdDpcbiAgbFNpdGU6IHRoZSBWb3Jvbm9pIHNpdGUgb2JqZWN0IGF0IHRoZSBsZWZ0IG9mIHRoaXMgVm9yb25vaS5FZGdlIG9iamVjdC5cbiAgclNpdGU6IHRoZSBWb3Jvbm9pIHNpdGUgb2JqZWN0IGF0IHRoZSByaWdodCBvZiB0aGlzIFZvcm9ub2kuRWRnZSBvYmplY3QgKGNhblxuICAgIGJlIG51bGwpLlxuICB2YTogYW4gb2JqZWN0IHdpdGggYW4gJ3gnIGFuZCBhICd5JyBwcm9wZXJ0eSBkZWZpbmluZyB0aGUgc3RhcnQgcG9pbnRcbiAgICAocmVsYXRpdmUgdG8gdGhlIFZvcm9ub2kgc2l0ZSBvbiB0aGUgbGVmdCkgb2YgdGhpcyBWb3Jvbm9pLkVkZ2Ugb2JqZWN0LlxuICB2YjogYW4gb2JqZWN0IHdpdGggYW4gJ3gnIGFuZCBhICd5JyBwcm9wZXJ0eSBkZWZpbmluZyB0aGUgZW5kIHBvaW50XG4gICAgKHJlbGF0aXZlIHRvIFZvcm9ub2kgc2l0ZSBvbiB0aGUgbGVmdCkgb2YgdGhpcyBWb3Jvbm9pLkVkZ2Ugb2JqZWN0LlxuXG4gIEZvciBlZGdlcyB3aGljaCBhcmUgdXNlZCB0byBjbG9zZSBvcGVuIGNlbGxzICh1c2luZyB0aGUgc3VwcGxpZWQgYm91bmRpbmdcbiAgYm94KSwgdGhlIHJTaXRlIHByb3BlcnR5IHdpbGwgYmUgbnVsbC5cblxuVm9yb25vaS5DZWxsIG9iamVjdDpcbiAgc2l0ZTogdGhlIFZvcm9ub2kgc2l0ZSBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBWb3Jvbm9pIGNlbGwuXG4gIGhhbGZlZGdlczogYW4gYXJyYXkgb2YgVm9yb25vaS5IYWxmZWRnZSBvYmplY3RzLCBvcmRlcmVkIGNvdW50ZXJjbG9ja3dpc2UsXG4gICAgZGVmaW5pbmcgdGhlIHBvbHlnb24gZm9yIHRoaXMgVm9yb25vaSBjZWxsLlxuXG5Wb3Jvbm9pLkhhbGZlZGdlIG9iamVjdDpcbiAgc2l0ZTogdGhlIFZvcm9ub2kgc2l0ZSBvYmplY3Qgb3duaW5nIHRoaXMgVm9yb25vaS5IYWxmZWRnZSBvYmplY3QuXG4gIGVkZ2U6IGEgcmVmZXJlbmNlIHRvIHRoZSB1bmlxdWUgVm9yb25vaS5FZGdlIG9iamVjdCB1bmRlcmx5aW5nIHRoaXNcbiAgICBWb3Jvbm9pLkhhbGZlZGdlIG9iamVjdC5cbiAgZ2V0U3RhcnRwb2ludCgpOiBhIG1ldGhvZCByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYW4gJ3gnIGFuZCBhICd5JyBwcm9wZXJ0eVxuICAgIGZvciB0aGUgc3RhcnQgcG9pbnQgb2YgdGhpcyBoYWxmZWRnZS4gS2VlcCBpbiBtaW5kIGhhbGZlZGdlcyBhcmUgYWx3YXlzXG4gICAgY291bnRlcmNvY2t3aXNlLlxuICBnZXRFbmRwb2ludCgpOiBhIG1ldGhvZCByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYW4gJ3gnIGFuZCBhICd5JyBwcm9wZXJ0eVxuICAgIGZvciB0aGUgZW5kIHBvaW50IG9mIHRoaXMgaGFsZmVkZ2UuIEtlZXAgaW4gbWluZCBoYWxmZWRnZXMgYXJlIGFsd2F5c1xuICAgIGNvdW50ZXJjb2Nrd2lzZS5cblxuVE9ETzogSWRlbnRpZnkgb3Bwb3J0dW5pdGllcyBmb3IgcGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQuXG5cblRPRE86IExldCB0aGUgdXNlciBjbG9zZSB0aGUgVm9yb25vaSBjZWxscywgZG8gbm90IGRvIGl0IGF1dG9tYXRpY2FsbHkuIE5vdCBvbmx5IGxldFxuICAgICAgaGltIGNsb3NlIHRoZSBjZWxscywgYnV0IGFsc28gYWxsb3cgaGltIHRvIGNsb3NlIG1vcmUgdGhhbiBvbmNlIHVzaW5nIGEgZGlmZmVyZW50XG4gICAgICBib3VuZGluZyBib3ggZm9yIHRoZSBzYW1lIFZvcm9ub2kgZGlhZ3JhbS5cbiovXG5cbi8qZ2xvYmFsIE1hdGggKi9cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIFZvcm9ub2koKSB7XG4gICAgdGhpcy52ZXJ0aWNlcyA9IG51bGw7XG4gICAgdGhpcy5lZGdlcyA9IG51bGw7XG4gICAgdGhpcy5jZWxscyA9IG51bGw7XG4gICAgdGhpcy50b1JlY3ljbGUgPSBudWxsO1xuICAgIHRoaXMuYmVhY2hzZWN0aW9uSnVua3lhcmQgPSBbXTtcbiAgICB0aGlzLmNpcmNsZUV2ZW50SnVua3lhcmQgPSBbXTtcbiAgICB0aGlzLnZlcnRleEp1bmt5YXJkID0gW107XG4gICAgdGhpcy5lZGdlSnVua3lhcmQgPSBbXTtcbiAgICB0aGlzLmNlbGxKdW5reWFyZCA9IFtdO1xuICAgIH1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblZvcm9ub2kucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLmJlYWNobGluZSkge1xuICAgICAgICB0aGlzLmJlYWNobGluZSA9IG5ldyB0aGlzLlJCVHJlZSgpO1xuICAgICAgICB9XG4gICAgLy8gTW92ZSBsZWZ0b3ZlciBiZWFjaHNlY3Rpb25zIHRvIHRoZSBiZWFjaHNlY3Rpb24ganVua3lhcmQuXG4gICAgaWYgKHRoaXMuYmVhY2hsaW5lLnJvb3QpIHtcbiAgICAgICAgdmFyIGJlYWNoc2VjdGlvbiA9IHRoaXMuYmVhY2hsaW5lLmdldEZpcnN0KHRoaXMuYmVhY2hsaW5lLnJvb3QpO1xuICAgICAgICB3aGlsZSAoYmVhY2hzZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmJlYWNoc2VjdGlvbkp1bmt5YXJkLnB1c2goYmVhY2hzZWN0aW9uKTsgLy8gbWFyayBmb3IgcmV1c2VcbiAgICAgICAgICAgIGJlYWNoc2VjdGlvbiA9IGJlYWNoc2VjdGlvbi5yYk5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB0aGlzLmJlYWNobGluZS5yb290ID0gbnVsbDtcbiAgICBpZiAoIXRoaXMuY2lyY2xlRXZlbnRzKSB7XG4gICAgICAgIHRoaXMuY2lyY2xlRXZlbnRzID0gbmV3IHRoaXMuUkJUcmVlKCk7XG4gICAgICAgIH1cbiAgICB0aGlzLmNpcmNsZUV2ZW50cy5yb290ID0gdGhpcy5maXJzdENpcmNsZUV2ZW50ID0gbnVsbDtcbiAgICB0aGlzLnZlcnRpY2VzID0gW107XG4gICAgdGhpcy5lZGdlcyA9IFtdO1xuICAgIHRoaXMuY2VsbHMgPSBbXTtcbiAgICB9O1xuXG5Wb3Jvbm9pLnByb3RvdHlwZS5zcXJ0ID0gZnVuY3Rpb24obil7IHJldHVybiBNYXRoLnNxcnQobik7IH07XG5Wb3Jvbm9pLnByb3RvdHlwZS5hYnMgPSBmdW5jdGlvbihuKXsgcmV0dXJuIE1hdGguYWJzKG4pOyB9O1xuVm9yb25vaS5wcm90b3R5cGUuzrUgPSBWb3Jvbm9pLs61ID0gMWUtOTtcblZvcm9ub2kucHJvdG90eXBlLmluds61ID0gVm9yb25vaS5pbnbOtSA9IDEuMCAvIFZvcm9ub2kuzrU7XG5Wb3Jvbm9pLnByb3RvdHlwZS5lcXVhbFdpdGhFcHNpbG9uID0gZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5hYnMoYS1iKTwxZS05O307XG5Wb3Jvbm9pLnByb3RvdHlwZS5ncmVhdGVyVGhhbldpdGhFcHNpbG9uID0gZnVuY3Rpb24oYSxiKXtyZXR1cm4gYS1iPjFlLTk7fTtcblZvcm9ub2kucHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbFdpdGhFcHNpbG9uID0gZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi1hPDFlLTk7fTtcblZvcm9ub2kucHJvdG90eXBlLmxlc3NUaGFuV2l0aEVwc2lsb24gPSBmdW5jdGlvbihhLGIpe3JldHVybiBiLWE+MWUtOTt9O1xuVm9yb25vaS5wcm90b3R5cGUubGVzc1RoYW5PckVxdWFsV2l0aEVwc2lsb24gPSBmdW5jdGlvbihhLGIpe3JldHVybiBhLWI8MWUtOTt9O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJlZC1CbGFjayB0cmVlIGNvZGUgKGJhc2VkIG9uIEMgdmVyc2lvbiBvZiBcInJidHJlZVwiIGJ5IEZyYW5jayBCdWktSHV1XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmJ1aWh1dS9saWJ0cmVlL2Jsb2IvbWFzdGVyL3JiLmNcblxuVm9yb25vaS5wcm90b3R5cGUuUkJUcmVlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICB9O1xuXG5Wb3Jvbm9pLnByb3RvdHlwZS5SQlRyZWUucHJvdG90eXBlLnJiSW5zZXJ0U3VjY2Vzc29yID0gZnVuY3Rpb24obm9kZSwgc3VjY2Vzc29yKSB7XG4gICAgdmFyIHBhcmVudDtcbiAgICBpZiAobm9kZSkge1xuICAgICAgICAvLyA+Pj4gcmhpbGwgMjAxMS0wNS0yNzogUGVyZm9ybWFuY2U6IGNhY2hlIHByZXZpb3VzL25leHQgbm9kZXNcbiAgICAgICAgc3VjY2Vzc29yLnJiUHJldmlvdXMgPSBub2RlO1xuICAgICAgICBzdWNjZXNzb3IucmJOZXh0ID0gbm9kZS5yYk5leHQ7XG4gICAgICAgIGlmIChub2RlLnJiTmV4dCkge1xuICAgICAgICAgICAgbm9kZS5yYk5leHQucmJQcmV2aW91cyA9IHN1Y2Nlc3NvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgbm9kZS5yYk5leHQgPSBzdWNjZXNzb3I7XG4gICAgICAgIC8vIDw8PFxuICAgICAgICBpZiAobm9kZS5yYlJpZ2h0KSB7XG4gICAgICAgICAgICAvLyBpbi1wbGFjZSBleHBhbnNpb24gb2Ygbm9kZS5yYlJpZ2h0LmdldEZpcnN0KCk7XG4gICAgICAgICAgICBub2RlID0gbm9kZS5yYlJpZ2h0O1xuICAgICAgICAgICAgd2hpbGUgKG5vZGUucmJMZWZ0KSB7bm9kZSA9IG5vZGUucmJMZWZ0O31cbiAgICAgICAgICAgIG5vZGUucmJMZWZ0ID0gc3VjY2Vzc29yO1xuICAgICAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUucmJSaWdodCA9IHN1Y2Nlc3NvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgcGFyZW50ID0gbm9kZTtcbiAgICAgICAgfVxuICAgIC8vIHJoaWxsIDIwMTEtMDYtMDc6IGlmIG5vZGUgaXMgbnVsbCwgc3VjY2Vzc29yIG11c3QgYmUgaW5zZXJ0ZWRcbiAgICAvLyB0byB0aGUgbGVmdC1tb3N0IHBhcnQgb2YgdGhlIHRyZWVcbiAgICBlbHNlIGlmICh0aGlzLnJvb3QpIHtcbiAgICAgICAgbm9kZSA9IHRoaXMuZ2V0Rmlyc3QodGhpcy5yb290KTtcbiAgICAgICAgLy8gPj4+IFBlcmZvcm1hbmNlOiBjYWNoZSBwcmV2aW91cy9uZXh0IG5vZGVzXG4gICAgICAgIHN1Y2Nlc3Nvci5yYlByZXZpb3VzID0gbnVsbDtcbiAgICAgICAgc3VjY2Vzc29yLnJiTmV4dCA9IG5vZGU7XG4gICAgICAgIG5vZGUucmJQcmV2aW91cyA9IHN1Y2Nlc3NvcjtcbiAgICAgICAgLy8gPDw8XG4gICAgICAgIG5vZGUucmJMZWZ0ID0gc3VjY2Vzc29yO1xuICAgICAgICBwYXJlbnQgPSBub2RlO1xuICAgICAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vID4+PiBQZXJmb3JtYW5jZTogY2FjaGUgcHJldmlvdXMvbmV4dCBub2Rlc1xuICAgICAgICBzdWNjZXNzb3IucmJQcmV2aW91cyA9IHN1Y2Nlc3Nvci5yYk5leHQgPSBudWxsO1xuICAgICAgICAvLyA8PDxcbiAgICAgICAgdGhpcy5yb290ID0gc3VjY2Vzc29yO1xuICAgICAgICBwYXJlbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgc3VjY2Vzc29yLnJiTGVmdCA9IHN1Y2Nlc3Nvci5yYlJpZ2h0ID0gbnVsbDtcbiAgICBzdWNjZXNzb3IucmJQYXJlbnQgPSBwYXJlbnQ7XG4gICAgc3VjY2Vzc29yLnJiUmVkID0gdHJ1ZTtcbiAgICAvLyBGaXh1cCB0aGUgbW9kaWZpZWQgdHJlZSBieSByZWNvbG9yaW5nIG5vZGVzIGFuZCBwZXJmb3JtaW5nXG4gICAgLy8gcm90YXRpb25zICgyIGF0IG1vc3QpIGhlbmNlIHRoZSByZWQtYmxhY2sgdHJlZSBwcm9wZXJ0aWVzIGFyZVxuICAgIC8vIHByZXNlcnZlZC5cbiAgICB2YXIgZ3JhbmRwYSwgdW5jbGU7XG4gICAgbm9kZSA9IHN1Y2Nlc3NvcjtcbiAgICB3aGlsZSAocGFyZW50ICYmIHBhcmVudC5yYlJlZCkge1xuICAgICAgICBncmFuZHBhID0gcGFyZW50LnJiUGFyZW50O1xuICAgICAgICBpZiAocGFyZW50ID09PSBncmFuZHBhLnJiTGVmdCkge1xuICAgICAgICAgICAgdW5jbGUgPSBncmFuZHBhLnJiUmlnaHQ7XG4gICAgICAgICAgICBpZiAodW5jbGUgJiYgdW5jbGUucmJSZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQucmJSZWQgPSB1bmNsZS5yYlJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGdyYW5kcGEucmJSZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG5vZGUgPSBncmFuZHBhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChub2RlID09PSBwYXJlbnQucmJSaWdodCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJiUm90YXRlTGVmdChwYXJlbnQpO1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gcGFyZW50O1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBub2RlLnJiUGFyZW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGFyZW50LnJiUmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZ3JhbmRwYS5yYlJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yYlJvdGF0ZVJpZ2h0KGdyYW5kcGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB1bmNsZSA9IGdyYW5kcGEucmJMZWZ0O1xuICAgICAgICAgICAgaWYgKHVuY2xlICYmIHVuY2xlLnJiUmVkKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50LnJiUmVkID0gdW5jbGUucmJSZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBncmFuZHBhLnJiUmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBub2RlID0gZ3JhbmRwYTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZSA9PT0gcGFyZW50LnJiTGVmdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJiUm90YXRlUmlnaHQocGFyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IHBhcmVudDtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gbm9kZS5yYlBhcmVudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhcmVudC5yYlJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGdyYW5kcGEucmJSZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmJSb3RhdGVMZWZ0KGdyYW5kcGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgcGFyZW50ID0gbm9kZS5yYlBhcmVudDtcbiAgICAgICAgfVxuICAgIHRoaXMucm9vdC5yYlJlZCA9IGZhbHNlO1xuICAgIH07XG5cblZvcm9ub2kucHJvdG90eXBlLlJCVHJlZS5wcm90b3R5cGUucmJSZW1vdmVOb2RlID0gZnVuY3Rpb24obm9kZSkge1xuICAgIC8vID4+PiByaGlsbCAyMDExLTA1LTI3OiBQZXJmb3JtYW5jZTogY2FjaGUgcHJldmlvdXMvbmV4dCBub2Rlc1xuICAgIGlmIChub2RlLnJiTmV4dCkge1xuICAgICAgICBub2RlLnJiTmV4dC5yYlByZXZpb3VzID0gbm9kZS5yYlByZXZpb3VzO1xuICAgICAgICB9XG4gICAgaWYgKG5vZGUucmJQcmV2aW91cykge1xuICAgICAgICBub2RlLnJiUHJldmlvdXMucmJOZXh0ID0gbm9kZS5yYk5leHQ7XG4gICAgICAgIH1cbiAgICBub2RlLnJiTmV4dCA9IG5vZGUucmJQcmV2aW91cyA9IG51bGw7XG4gICAgLy8gPDw8XG4gICAgdmFyIHBhcmVudCA9IG5vZGUucmJQYXJlbnQsXG4gICAgICAgIGxlZnQgPSBub2RlLnJiTGVmdCxcbiAgICAgICAgcmlnaHQgPSBub2RlLnJiUmlnaHQsXG4gICAgICAgIG5leHQ7XG4gICAgaWYgKCFsZWZ0KSB7XG4gICAgICAgIG5leHQgPSByaWdodDtcbiAgICAgICAgfVxuICAgIGVsc2UgaWYgKCFyaWdodCkge1xuICAgICAgICBuZXh0ID0gbGVmdDtcbiAgICAgICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBuZXh0ID0gdGhpcy5nZXRGaXJzdChyaWdodCk7XG4gICAgICAgIH1cbiAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIGlmIChwYXJlbnQucmJMZWZ0ID09PSBub2RlKSB7XG4gICAgICAgICAgICBwYXJlbnQucmJMZWZ0ID0gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwYXJlbnQucmJSaWdodCA9IG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5yb290ID0gbmV4dDtcbiAgICAgICAgfVxuICAgIC8vIGVuZm9yY2UgcmVkLWJsYWNrIHJ1bGVzXG4gICAgdmFyIGlzUmVkO1xuICAgIGlmIChsZWZ0ICYmIHJpZ2h0KSB7XG4gICAgICAgIGlzUmVkID0gbmV4dC5yYlJlZDtcbiAgICAgICAgbmV4dC5yYlJlZCA9IG5vZGUucmJSZWQ7XG4gICAgICAgIG5leHQucmJMZWZ0ID0gbGVmdDtcbiAgICAgICAgbGVmdC5yYlBhcmVudCA9IG5leHQ7XG4gICAgICAgIGlmIChuZXh0ICE9PSByaWdodCkge1xuICAgICAgICAgICAgcGFyZW50ID0gbmV4dC5yYlBhcmVudDtcbiAgICAgICAgICAgIG5leHQucmJQYXJlbnQgPSBub2RlLnJiUGFyZW50O1xuICAgICAgICAgICAgbm9kZSA9IG5leHQucmJSaWdodDtcbiAgICAgICAgICAgIHBhcmVudC5yYkxlZnQgPSBub2RlO1xuICAgICAgICAgICAgbmV4dC5yYlJpZ2h0ID0gcmlnaHQ7XG4gICAgICAgICAgICByaWdodC5yYlBhcmVudCA9IG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbmV4dC5yYlBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgICAgIHBhcmVudCA9IG5leHQ7XG4gICAgICAgICAgICBub2RlID0gbmV4dC5yYlJpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlzUmVkID0gbm9kZS5yYlJlZDtcbiAgICAgICAgbm9kZSA9IG5leHQ7XG4gICAgICAgIH1cbiAgICAvLyAnbm9kZScgaXMgbm93IHRoZSBzb2xlIHN1Y2Nlc3NvcidzIGNoaWxkIGFuZCAncGFyZW50JyBpdHNcbiAgICAvLyBuZXcgcGFyZW50IChzaW5jZSB0aGUgc3VjY2Vzc29yIGNhbiBoYXZlIGJlZW4gbW92ZWQpXG4gICAgaWYgKG5vZGUpIHtcbiAgICAgICAgbm9kZS5yYlBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgfVxuICAgIC8vIHRoZSAnZWFzeScgY2FzZXNcbiAgICBpZiAoaXNSZWQpIHtyZXR1cm47fVxuICAgIGlmIChub2RlICYmIG5vZGUucmJSZWQpIHtcbiAgICAgICAgbm9kZS5yYlJlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAvLyB0aGUgb3RoZXIgY2FzZXNcbiAgICB2YXIgc2libGluZztcbiAgICBkbyB7XG4gICAgICAgIGlmIChub2RlID09PSB0aGlzLnJvb3QpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBpZiAobm9kZSA9PT0gcGFyZW50LnJiTGVmdCkge1xuICAgICAgICAgICAgc2libGluZyA9IHBhcmVudC5yYlJpZ2h0O1xuICAgICAgICAgICAgaWYgKHNpYmxpbmcucmJSZWQpIHtcbiAgICAgICAgICAgICAgICBzaWJsaW5nLnJiUmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcGFyZW50LnJiUmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJiUm90YXRlTGVmdChwYXJlbnQpO1xuICAgICAgICAgICAgICAgIHNpYmxpbmcgPSBwYXJlbnQucmJSaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKHNpYmxpbmcucmJMZWZ0ICYmIHNpYmxpbmcucmJMZWZ0LnJiUmVkKSB8fCAoc2libGluZy5yYlJpZ2h0ICYmIHNpYmxpbmcucmJSaWdodC5yYlJlZCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNpYmxpbmcucmJSaWdodCB8fCAhc2libGluZy5yYlJpZ2h0LnJiUmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpYmxpbmcucmJMZWZ0LnJiUmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNpYmxpbmcucmJSZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJiUm90YXRlUmlnaHQoc2libGluZyk7XG4gICAgICAgICAgICAgICAgICAgIHNpYmxpbmcgPSBwYXJlbnQucmJSaWdodDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNpYmxpbmcucmJSZWQgPSBwYXJlbnQucmJSZWQ7XG4gICAgICAgICAgICAgICAgcGFyZW50LnJiUmVkID0gc2libGluZy5yYlJpZ2h0LnJiUmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5yYlJvdGF0ZUxlZnQocGFyZW50KTtcbiAgICAgICAgICAgICAgICBub2RlID0gdGhpcy5yb290O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzaWJsaW5nID0gcGFyZW50LnJiTGVmdDtcbiAgICAgICAgICAgIGlmIChzaWJsaW5nLnJiUmVkKSB7XG4gICAgICAgICAgICAgICAgc2libGluZy5yYlJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHBhcmVudC5yYlJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yYlJvdGF0ZVJpZ2h0KHBhcmVudCk7XG4gICAgICAgICAgICAgICAgc2libGluZyA9IHBhcmVudC5yYkxlZnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKChzaWJsaW5nLnJiTGVmdCAmJiBzaWJsaW5nLnJiTGVmdC5yYlJlZCkgfHwgKHNpYmxpbmcucmJSaWdodCAmJiBzaWJsaW5nLnJiUmlnaHQucmJSZWQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzaWJsaW5nLnJiTGVmdCB8fCAhc2libGluZy5yYkxlZnQucmJSZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2libGluZy5yYlJpZ2h0LnJiUmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNpYmxpbmcucmJSZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJiUm90YXRlTGVmdChzaWJsaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgc2libGluZyA9IHBhcmVudC5yYkxlZnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzaWJsaW5nLnJiUmVkID0gcGFyZW50LnJiUmVkO1xuICAgICAgICAgICAgICAgIHBhcmVudC5yYlJlZCA9IHNpYmxpbmcucmJMZWZ0LnJiUmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5yYlJvdGF0ZVJpZ2h0KHBhcmVudCk7XG4gICAgICAgICAgICAgICAgbm9kZSA9IHRoaXMucm9vdDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIHNpYmxpbmcucmJSZWQgPSB0cnVlO1xuICAgICAgICBub2RlID0gcGFyZW50O1xuICAgICAgICBwYXJlbnQgPSBwYXJlbnQucmJQYXJlbnQ7XG4gICAgfSB3aGlsZSAoIW5vZGUucmJSZWQpO1xuICAgIGlmIChub2RlKSB7bm9kZS5yYlJlZCA9IGZhbHNlO31cbiAgICB9O1xuXG5Wb3Jvbm9pLnByb3RvdHlwZS5SQlRyZWUucHJvdG90eXBlLnJiUm90YXRlTGVmdCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB2YXIgcCA9IG5vZGUsXG4gICAgICAgIHEgPSBub2RlLnJiUmlnaHQsIC8vIGNhbid0IGJlIG51bGxcbiAgICAgICAgcGFyZW50ID0gcC5yYlBhcmVudDtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIGlmIChwYXJlbnQucmJMZWZ0ID09PSBwKSB7XG4gICAgICAgICAgICBwYXJlbnQucmJMZWZ0ID0gcTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwYXJlbnQucmJSaWdodCA9IHE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5yb290ID0gcTtcbiAgICAgICAgfVxuICAgIHEucmJQYXJlbnQgPSBwYXJlbnQ7XG4gICAgcC5yYlBhcmVudCA9IHE7XG4gICAgcC5yYlJpZ2h0ID0gcS5yYkxlZnQ7XG4gICAgaWYgKHAucmJSaWdodCkge1xuICAgICAgICBwLnJiUmlnaHQucmJQYXJlbnQgPSBwO1xuICAgICAgICB9XG4gICAgcS5yYkxlZnQgPSBwO1xuICAgIH07XG5cblZvcm9ub2kucHJvdG90eXBlLlJCVHJlZS5wcm90b3R5cGUucmJSb3RhdGVSaWdodCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB2YXIgcCA9IG5vZGUsXG4gICAgICAgIHEgPSBub2RlLnJiTGVmdCwgLy8gY2FuJ3QgYmUgbnVsbFxuICAgICAgICBwYXJlbnQgPSBwLnJiUGFyZW50O1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgaWYgKHBhcmVudC5yYkxlZnQgPT09IHApIHtcbiAgICAgICAgICAgIHBhcmVudC5yYkxlZnQgPSBxO1xuICAgICAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHBhcmVudC5yYlJpZ2h0ID0gcTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnJvb3QgPSBxO1xuICAgICAgICB9XG4gICAgcS5yYlBhcmVudCA9IHBhcmVudDtcbiAgICBwLnJiUGFyZW50ID0gcTtcbiAgICBwLnJiTGVmdCA9IHEucmJSaWdodDtcbiAgICBpZiAocC5yYkxlZnQpIHtcbiAgICAgICAgcC5yYkxlZnQucmJQYXJlbnQgPSBwO1xuICAgICAgICB9XG4gICAgcS5yYlJpZ2h0ID0gcDtcbiAgICB9O1xuXG5Wb3Jvbm9pLnByb3RvdHlwZS5SQlRyZWUucHJvdG90eXBlLmdldEZpcnN0ID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHdoaWxlIChub2RlLnJiTGVmdCkge1xuICAgICAgICBub2RlID0gbm9kZS5yYkxlZnQ7XG4gICAgICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgICB9O1xuXG5Wb3Jvbm9pLnByb3RvdHlwZS5SQlRyZWUucHJvdG90eXBlLmdldExhc3QgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgd2hpbGUgKG5vZGUucmJSaWdodCkge1xuICAgICAgICBub2RlID0gbm9kZS5yYlJpZ2h0O1xuICAgICAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gICAgfTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEaWFncmFtIG1ldGhvZHNcblxuVm9yb25vaS5wcm90b3R5cGUuRGlhZ3JhbSA9IGZ1bmN0aW9uKHNpdGUpIHtcbiAgICB0aGlzLnNpdGUgPSBzaXRlO1xuICAgIH07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ2VsbCBtZXRob2RzXG5cblZvcm9ub2kucHJvdG90eXBlLkNlbGwgPSBmdW5jdGlvbihzaXRlKSB7XG4gICAgdGhpcy5zaXRlID0gc2l0ZTtcbiAgICB0aGlzLmhhbGZlZGdlcyA9IFtdO1xuICAgIHRoaXMuY2xvc2VNZSA9IGZhbHNlO1xuICAgIH07XG5cblZvcm9ub2kucHJvdG90eXBlLkNlbGwucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihzaXRlKSB7XG4gICAgdGhpcy5zaXRlID0gc2l0ZTtcbiAgICB0aGlzLmhhbGZlZGdlcyA9IFtdO1xuICAgIHRoaXMuY2xvc2VNZSA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cblZvcm9ub2kucHJvdG90eXBlLmNyZWF0ZUNlbGwgPSBmdW5jdGlvbihzaXRlKSB7XG4gICAgdmFyIGNlbGwgPSB0aGlzLmNlbGxKdW5reWFyZC5wb3AoKTtcbiAgICBpZiAoIGNlbGwgKSB7XG4gICAgICAgIHJldHVybiBjZWxsLmluaXQoc2l0ZSk7XG4gICAgICAgIH1cbiAgICByZXR1cm4gbmV3IHRoaXMuQ2VsbChzaXRlKTtcbiAgICB9O1xuXG5Wb3Jvbm9pLnByb3RvdHlwZS5DZWxsLnByb3RvdHlwZS5wcmVwYXJlSGFsZmVkZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhhbGZlZGdlcyA9IHRoaXMuaGFsZmVkZ2VzLFxuICAgICAgICBpSGFsZmVkZ2UgPSBoYWxmZWRnZXMubGVuZ3RoLFxuICAgICAgICBlZGdlO1xuICAgIC8vIGdldCByaWQgb2YgdW51c2VkIGhhbGZlZGdlc1xuICAgIC8vIHJoaWxsIDIwMTEtMDUtMjc6IEtlZXAgaXQgc2ltcGxlLCBubyBwb2ludCBoZXJlIGluIHRyeWluZ1xuICAgIC8vIHRvIGJlIGZhbmN5OiBkYW5nbGluZyBlZGdlcyBhcmUgYSB0eXBpY2FsbHkgYSBtaW5vcml0eS5cbiAgICB3aGlsZSAoaUhhbGZlZGdlLS0pIHtcbiAgICAgICAgZWRnZSA9IGhhbGZlZGdlc1tpSGFsZmVkZ2VdLmVkZ2U7XG4gICAgICAgIGlmICghZWRnZS52YiB8fCAhZWRnZS52YSkge1xuICAgICAgICAgICAgaGFsZmVkZ2VzLnNwbGljZShpSGFsZmVkZ2UsMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIC8vIHJoaWxsIDIwMTEtMDUtMjY6IEkgdHJpZWQgdG8gdXNlIGEgYmluYXJ5IHNlYXJjaCBhdCBpbnNlcnRpb25cbiAgICAvLyB0aW1lIHRvIGtlZXAgdGhlIGFycmF5IHNvcnRlZCBvbi10aGUtZmx5IChpbiBDZWxsLmFkZEhhbGZlZGdlKCkpLlxuICAgIC8vIFRoZXJlIHdhcyBubyByZWFsIGJlbmVmaXRzIGluIGRvaW5nIHNvLCBwZXJmb3JtYW5jZSBvblxuICAgIC8vIEZpcmVmb3ggMy42IHdhcyBpbXByb3ZlZCBtYXJnaW5hbGx5LCB3aGlsZSBwZXJmb3JtYW5jZSBvblxuICAgIC8vIE9wZXJhIDExIHdhcyBwZW5hbGl6ZWQgbWFyZ2luYWxseS5cbiAgICBoYWxmZWRnZXMuc29ydChmdW5jdGlvbihhLGIpe3JldHVybiBiLmFuZ2xlLWEuYW5nbGU7fSk7XG4gICAgcmV0dXJuIGhhbGZlZGdlcy5sZW5ndGg7XG4gICAgfTtcblxuLy8gUmV0dXJuIGEgbGlzdCBvZiB0aGUgbmVpZ2hib3IgSWRzXG5Wb3Jvbm9pLnByb3RvdHlwZS5DZWxsLnByb3RvdHlwZS5nZXROZWlnaGJvcklkcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuZWlnaGJvcnMgPSBbXSxcbiAgICAgICAgaUhhbGZlZGdlID0gdGhpcy5oYWxmZWRnZXMubGVuZ3RoLFxuICAgICAgICBlZGdlO1xuICAgIHdoaWxlIChpSGFsZmVkZ2UtLSl7XG4gICAgICAgIGVkZ2UgPSB0aGlzLmhhbGZlZGdlc1tpSGFsZmVkZ2VdLmVkZ2U7XG4gICAgICAgIGlmIChlZGdlLmxTaXRlICE9PSBudWxsICYmIGVkZ2UubFNpdGUudm9yb25vaUlkICE9IHRoaXMuc2l0ZS52b3Jvbm9pSWQpIHtcbiAgICAgICAgICAgIG5laWdoYm9ycy5wdXNoKGVkZ2UubFNpdGUudm9yb25vaUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZWRnZS5yU2l0ZSAhPT0gbnVsbCAmJiBlZGdlLnJTaXRlLnZvcm9ub2lJZCAhPSB0aGlzLnNpdGUudm9yb25vaUlkKXtcbiAgICAgICAgICAgIG5laWdoYm9ycy5wdXNoKGVkZ2UuclNpdGUudm9yb25vaUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIHJldHVybiBuZWlnaGJvcnM7XG4gICAgfTtcblxuLy8gQ29tcHV0ZSBib3VuZGluZyBib3hcbi8vXG5Wb3Jvbm9pLnByb3RvdHlwZS5DZWxsLnByb3RvdHlwZS5nZXRCYm94ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhhbGZlZGdlcyA9IHRoaXMuaGFsZmVkZ2VzLFxuICAgICAgICBpSGFsZmVkZ2UgPSBoYWxmZWRnZXMubGVuZ3RoLFxuICAgICAgICB4bWluID0gSW5maW5pdHksXG4gICAgICAgIHltaW4gPSBJbmZpbml0eSxcbiAgICAgICAgeG1heCA9IC1JbmZpbml0eSxcbiAgICAgICAgeW1heCA9IC1JbmZpbml0eSxcbiAgICAgICAgdiwgdngsIHZ5O1xuICAgIHdoaWxlIChpSGFsZmVkZ2UtLSkge1xuICAgICAgICB2ID0gaGFsZmVkZ2VzW2lIYWxmZWRnZV0uZ2V0U3RhcnRwb2ludCgpO1xuICAgICAgICB2eCA9IHYueDtcbiAgICAgICAgdnkgPSB2Lnk7XG4gICAgICAgIGlmICh2eCA8IHhtaW4pIHt4bWluID0gdng7fVxuICAgICAgICBpZiAodnkgPCB5bWluKSB7eW1pbiA9IHZ5O31cbiAgICAgICAgaWYgKHZ4ID4geG1heCkge3htYXggPSB2eDt9XG4gICAgICAgIGlmICh2eSA+IHltYXgpIHt5bWF4ID0gdnk7fVxuICAgICAgICAvLyB3ZSBkb250IG5lZWQgdG8gdGFrZSBpbnRvIGFjY291bnQgZW5kIHBvaW50LFxuICAgICAgICAvLyBzaW5jZSBlYWNoIGVuZCBwb2ludCBtYXRjaGVzIGEgc3RhcnQgcG9pbnRcbiAgICAgICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHhtaW4sXG4gICAgICAgIHk6IHltaW4sXG4gICAgICAgIHdpZHRoOiB4bWF4LXhtaW4sXG4gICAgICAgIGhlaWdodDogeW1heC15bWluXG4gICAgICAgIH07XG4gICAgfTtcblxuLy8gUmV0dXJuIHdoZXRoZXIgYSBwb2ludCBpcyBpbnNpZGUsIG9uLCBvciBvdXRzaWRlIHRoZSBjZWxsOlxuLy8gICAtMTogcG9pbnQgaXMgb3V0c2lkZSB0aGUgcGVyaW1ldGVyIG9mIHRoZSBjZWxsXG4vLyAgICAwOiBwb2ludCBpcyBvbiB0aGUgcGVyaW1ldGVyIG9mIHRoZSBjZWxsXG4vLyAgICAxOiBwb2ludCBpcyBpbnNpZGUgdGhlIHBlcmltZXRlciBvZiB0aGUgY2VsbFxuLy9cblZvcm9ub2kucHJvdG90eXBlLkNlbGwucHJvdG90eXBlLnBvaW50SW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIC8vIENoZWNrIGlmIHBvaW50IGluIHBvbHlnb24uIFNpbmNlIGFsbCBwb2x5Z29ucyBvZiBhIFZvcm9ub2lcbiAgICAvLyBkaWFncmFtIGFyZSBjb252ZXgsIHRoZW46XG4gICAgLy8gaHR0cDovL3BhdWxib3Vya2UubmV0L2dlb21ldHJ5L3BvbHlnb25tZXNoL1xuICAgIC8vIFNvbHV0aW9uIDMgKDJEKTpcbiAgICAvLyAgIFwiSWYgdGhlIHBvbHlnb24gaXMgY29udmV4IHRoZW4gb25lIGNhbiBjb25zaWRlciB0aGUgcG9seWdvblxuICAgIC8vICAgXCJhcyBhICdwYXRoJyBmcm9tIHRoZSBmaXJzdCB2ZXJ0ZXguIEEgcG9pbnQgaXMgb24gdGhlIGludGVyaW9yXG4gICAgLy8gICBcIm9mIHRoaXMgcG9seWdvbnMgaWYgaXQgaXMgYWx3YXlzIG9uIHRoZSBzYW1lIHNpZGUgb2YgYWxsIHRoZVxuICAgIC8vICAgXCJsaW5lIHNlZ21lbnRzIG1ha2luZyB1cCB0aGUgcGF0aC4gLi4uXG4gICAgLy8gICBcIih5IC0geTApICh4MSAtIHgwKSAtICh4IC0geDApICh5MSAtIHkwKVxuICAgIC8vICAgXCJpZiBpdCBpcyBsZXNzIHRoYW4gMCB0aGVuIFAgaXMgdG8gdGhlIHJpZ2h0IG9mIHRoZSBsaW5lIHNlZ21lbnQsXG4gICAgLy8gICBcImlmIGdyZWF0ZXIgdGhhbiAwIGl0IGlzIHRvIHRoZSBsZWZ0LCBpZiBlcXVhbCB0byAwIHRoZW4gaXQgbGllc1xuICAgIC8vICAgXCJvbiB0aGUgbGluZSBzZWdtZW50XCJcbiAgICB2YXIgaGFsZmVkZ2VzID0gdGhpcy5oYWxmZWRnZXMsXG4gICAgICAgIGlIYWxmZWRnZSA9IGhhbGZlZGdlcy5sZW5ndGgsXG4gICAgICAgIGhhbGZlZGdlLFxuICAgICAgICBwMCwgcDEsIHI7XG4gICAgd2hpbGUgKGlIYWxmZWRnZS0tKSB7XG4gICAgICAgIGhhbGZlZGdlID0gaGFsZmVkZ2VzW2lIYWxmZWRnZV07XG4gICAgICAgIHAwID0gaGFsZmVkZ2UuZ2V0U3RhcnRwb2ludCgpO1xuICAgICAgICBwMSA9IGhhbGZlZGdlLmdldEVuZHBvaW50KCk7XG4gICAgICAgIHIgPSAoeS1wMC55KSoocDEueC1wMC54KS0oeC1wMC54KSoocDEueS1wMC55KTtcbiAgICAgICAgaWYgKCFyKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgaWYgKHIgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICByZXR1cm4gMTtcbiAgICB9O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVkZ2UgbWV0aG9kc1xuLy9cblxuVm9yb25vaS5wcm90b3R5cGUuVmVydGV4ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB9O1xuXG5Wb3Jvbm9pLnByb3RvdHlwZS5FZGdlID0gZnVuY3Rpb24obFNpdGUsIHJTaXRlKSB7XG4gICAgdGhpcy5sU2l0ZSA9IGxTaXRlO1xuICAgIHRoaXMuclNpdGUgPSByU2l0ZTtcbiAgICB0aGlzLnZhID0gdGhpcy52YiA9IG51bGw7XG4gICAgfTtcblxuVm9yb25vaS5wcm90b3R5cGUuSGFsZmVkZ2UgPSBmdW5jdGlvbihlZGdlLCBsU2l0ZSwgclNpdGUpIHtcbiAgICB0aGlzLnNpdGUgPSBsU2l0ZTtcbiAgICB0aGlzLmVkZ2UgPSBlZGdlO1xuICAgIC8vICdhbmdsZScgaXMgYSB2YWx1ZSB0byBiZSB1c2VkIGZvciBwcm9wZXJseSBzb3J0aW5nIHRoZVxuICAgIC8vIGhhbGZzZWdtZW50cyBjb3VudGVyY2xvY2t3aXNlLiBCeSBjb252ZW50aW9uLCB3ZSB3aWxsXG4gICAgLy8gdXNlIHRoZSBhbmdsZSBvZiB0aGUgbGluZSBkZWZpbmVkIGJ5IHRoZSAnc2l0ZSB0byB0aGUgbGVmdCdcbiAgICAvLyB0byB0aGUgJ3NpdGUgdG8gdGhlIHJpZ2h0Jy5cbiAgICAvLyBIb3dldmVyLCBib3JkZXIgZWRnZXMgaGF2ZSBubyAnc2l0ZSB0byB0aGUgcmlnaHQnOiB0aHVzIHdlXG4gICAgLy8gdXNlIHRoZSBhbmdsZSBvZiBsaW5lIHBlcnBlbmRpY3VsYXIgdG8gdGhlIGhhbGZzZWdtZW50ICh0aGVcbiAgICAvLyBlZGdlIHNob3VsZCBoYXZlIGJvdGggZW5kIHBvaW50cyBkZWZpbmVkIGluIHN1Y2ggY2FzZS4pXG4gICAgaWYgKHJTaXRlKSB7XG4gICAgICAgIHRoaXMuYW5nbGUgPSBNYXRoLmF0YW4yKHJTaXRlLnktbFNpdGUueSwgclNpdGUueC1sU2l0ZS54KTtcbiAgICAgICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgdmEgPSBlZGdlLnZhLFxuICAgICAgICAgICAgdmIgPSBlZGdlLnZiO1xuICAgICAgICAvLyByaGlsbCAyMDExLTA1LTMxOiB1c2VkIHRvIGNhbGwgZ2V0U3RhcnRwb2ludCgpL2dldEVuZHBvaW50KCksXG4gICAgICAgIC8vIGJ1dCBmb3IgcGVyZm9ybWFuY2UgcHVycG9zZSwgdGhlc2UgYXJlIGV4cGFuZGVkIGluIHBsYWNlIGhlcmUuXG4gICAgICAgIHRoaXMuYW5nbGUgPSBlZGdlLmxTaXRlID09PSBsU2l0ZSA/XG4gICAgICAgICAgICBNYXRoLmF0YW4yKHZiLngtdmEueCwgdmEueS12Yi55KSA6XG4gICAgICAgICAgICBNYXRoLmF0YW4yKHZhLngtdmIueCwgdmIueS12YS55KTtcbiAgICAgICAgfVxuICAgIH07XG5cblZvcm9ub2kucHJvdG90eXBlLmNyZWF0ZUhhbGZlZGdlID0gZnVuY3Rpb24oZWRnZSwgbFNpdGUsIHJTaXRlKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLkhhbGZlZGdlKGVkZ2UsIGxTaXRlLCByU2l0ZSk7XG4gICAgfTtcblxuVm9yb25vaS5wcm90b3R5cGUuSGFsZmVkZ2UucHJvdG90eXBlLmdldFN0YXJ0cG9pbnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5lZGdlLmxTaXRlID09PSB0aGlzLnNpdGUgPyB0aGlzLmVkZ2UudmEgOiB0aGlzLmVkZ2UudmI7XG4gICAgfTtcblxuVm9yb25vaS5wcm90b3R5cGUuSGFsZmVkZ2UucHJvdG90eXBlLmdldEVuZHBvaW50ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRnZS5sU2l0ZSA9PT0gdGhpcy5zaXRlID8gdGhpcy5lZGdlLnZiIDogdGhpcy5lZGdlLnZhO1xuICAgIH07XG5cblxuXG4vLyB0aGlzIGNyZWF0ZSBhbmQgYWRkIGEgdmVydGV4IHRvIHRoZSBpbnRlcm5hbCBjb2xsZWN0aW9uXG5cblZvcm9ub2kucHJvdG90eXBlLmNyZWF0ZVZlcnRleCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgdiA9IHRoaXMudmVydGV4SnVua3lhcmQucG9wKCk7XG4gICAgaWYgKCAhdiApIHtcbiAgICAgICAgdiA9IG5ldyB0aGlzLlZlcnRleCh4LCB5KTtcbiAgICAgICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2LnggPSB4O1xuICAgICAgICB2LnkgPSB5O1xuICAgICAgICB9XG4gICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHYpO1xuICAgIHJldHVybiB2O1xuICAgIH07XG5cbi8vIHRoaXMgY3JlYXRlIGFuZCBhZGQgYW4gZWRnZSB0byBpbnRlcm5hbCBjb2xsZWN0aW9uLCBhbmQgYWxzbyBjcmVhdGVcbi8vIHR3byBoYWxmZWRnZXMgd2hpY2ggYXJlIGFkZGVkIHRvIGVhY2ggc2l0ZSdzIGNvdW50ZXJjbG9ja3dpc2UgYXJyYXlcbi8vIG9mIGhhbGZlZGdlcy5cblxuVm9yb25vaS5wcm90b3R5cGUuY3JlYXRlRWRnZSA9IGZ1bmN0aW9uKGxTaXRlLCByU2l0ZSwgdmEsIHZiKSB7XG4gICAgdmFyIGVkZ2UgPSB0aGlzLmVkZ2VKdW5reWFyZC5wb3AoKTtcbiAgICBpZiAoICFlZGdlICkge1xuICAgICAgICBlZGdlID0gbmV3IHRoaXMuRWRnZShsU2l0ZSwgclNpdGUpO1xuICAgICAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGVkZ2UubFNpdGUgPSBsU2l0ZTtcbiAgICAgICAgZWRnZS5yU2l0ZSA9IHJTaXRlO1xuICAgICAgICBlZGdlLnZhID0gZWRnZS52YiA9IG51bGw7XG4gICAgICAgIH1cblxuICAgIHRoaXMuZWRnZXMucHVzaChlZGdlKTtcbiAgICBpZiAodmEpIHtcbiAgICAgICAgdGhpcy5zZXRFZGdlU3RhcnRwb2ludChlZGdlLCBsU2l0ZSwgclNpdGUsIHZhKTtcbiAgICAgICAgfVxuICAgIGlmICh2Yikge1xuICAgICAgICB0aGlzLnNldEVkZ2VFbmRwb2ludChlZGdlLCBsU2l0ZSwgclNpdGUsIHZiKTtcbiAgICAgICAgfVxuICAgIHRoaXMuY2VsbHNbbFNpdGUudm9yb25vaUlkXS5oYWxmZWRnZXMucHVzaCh0aGlzLmNyZWF0ZUhhbGZlZGdlKGVkZ2UsIGxTaXRlLCByU2l0ZSkpO1xuICAgIHRoaXMuY2VsbHNbclNpdGUudm9yb25vaUlkXS5oYWxmZWRnZXMucHVzaCh0aGlzLmNyZWF0ZUhhbGZlZGdlKGVkZ2UsIHJTaXRlLCBsU2l0ZSkpO1xuICAgIHJldHVybiBlZGdlO1xuICAgIH07XG5cblZvcm9ub2kucHJvdG90eXBlLmNyZWF0ZUJvcmRlckVkZ2UgPSBmdW5jdGlvbihsU2l0ZSwgdmEsIHZiKSB7XG4gICAgdmFyIGVkZ2UgPSB0aGlzLmVkZ2VKdW5reWFyZC5wb3AoKTtcbiAgICBpZiAoICFlZGdlICkge1xuICAgICAgICBlZGdlID0gbmV3IHRoaXMuRWRnZShsU2l0ZSwgbnVsbCk7XG4gICAgICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZWRnZS5sU2l0ZSA9IGxTaXRlO1xuICAgICAgICBlZGdlLnJTaXRlID0gbnVsbDtcbiAgICAgICAgfVxuICAgIGVkZ2UudmEgPSB2YTtcbiAgICBlZGdlLnZiID0gdmI7XG4gICAgdGhpcy5lZGdlcy5wdXNoKGVkZ2UpO1xuICAgIHJldHVybiBlZGdlO1xuICAgIH07XG5cblZvcm9ub2kucHJvdG90eXBlLnNldEVkZ2VTdGFydHBvaW50ID0gZnVuY3Rpb24oZWRnZSwgbFNpdGUsIHJTaXRlLCB2ZXJ0ZXgpIHtcbiAgICBpZiAoIWVkZ2UudmEgJiYgIWVkZ2UudmIpIHtcbiAgICAgICAgZWRnZS52YSA9IHZlcnRleDtcbiAgICAgICAgZWRnZS5sU2l0ZSA9IGxTaXRlO1xuICAgICAgICBlZGdlLnJTaXRlID0gclNpdGU7XG4gICAgICAgIH1cbiAgICBlbHNlIGlmIChlZGdlLmxTaXRlID09PSByU2l0ZSkge1xuICAgICAgICBlZGdlLnZiID0gdmVydGV4O1xuICAgICAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGVkZ2UudmEgPSB2ZXJ0ZXg7XG4gICAgICAgIH1cbiAgICB9O1xuXG5Wb3Jvbm9pLnByb3RvdHlwZS5zZXRFZGdlRW5kcG9pbnQgPSBmdW5jdGlvbihlZGdlLCBsU2l0ZSwgclNpdGUsIHZlcnRleCkge1xuICAgIHRoaXMuc2V0RWRnZVN0YXJ0cG9pbnQoZWRnZSwgclNpdGUsIGxTaXRlLCB2ZXJ0ZXgpO1xuICAgIH07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQmVhY2hsaW5lIG1ldGhvZHNcblxuLy8gcmhpbGwgMjAxMS0wNi0wNzogRm9yIHNvbWUgcmVhc29ucywgcGVyZm9ybWFuY2Ugc3VmZmVycyBzaWduaWZpY2FudGx5XG4vLyB3aGVuIGluc3RhbmNpYXRpbmcgYSBsaXRlcmFsIG9iamVjdCBpbnN0ZWFkIG9mIGFuIGVtcHR5IGN0b3JcblZvcm9ub2kucHJvdG90eXBlLkJlYWNoc2VjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIH07XG5cbi8vIHJoaWxsIDIwMTEtMDYtMDI6IEEgbG90IG9mIEJlYWNoc2VjdGlvbiBpbnN0YW5jaWF0aW9uc1xuLy8gb2NjdXIgZHVyaW5nIHRoZSBjb21wdXRhdGlvbiBvZiB0aGUgVm9yb25vaSBkaWFncmFtLFxuLy8gc29tZXdoZXJlIGJldHdlZW4gdGhlIG51bWJlciBvZiBzaXRlcyBhbmQgdHdpY2UgdGhlXG4vLyBudW1iZXIgb2Ygc2l0ZXMsIHdoaWxlIHRoZSBudW1iZXIgb2YgQmVhY2hzZWN0aW9ucyBvbiB0aGVcbi8vIGJlYWNobGluZSBhdCBhbnkgZ2l2ZW4gdGltZSBpcyBjb21wYXJhdGl2ZWx5IGxvdy4gRm9yIHRoaXNcbi8vIHJlYXNvbiwgd2UgcmV1c2UgYWxyZWFkeSBjcmVhdGVkIEJlYWNoc2VjdGlvbnMsIGluIG9yZGVyXG4vLyB0byBhdm9pZCBuZXcgbWVtb3J5IGFsbG9jYXRpb24uIFRoaXMgcmVzdWx0ZWQgaW4gYSBtZWFzdXJhYmxlXG4vLyBwZXJmb3JtYW5jZSBnYWluLlxuXG5Wb3Jvbm9pLnByb3RvdHlwZS5jcmVhdGVCZWFjaHNlY3Rpb24gPSBmdW5jdGlvbihzaXRlKSB7XG4gICAgdmFyIGJlYWNoc2VjdGlvbiA9IHRoaXMuYmVhY2hzZWN0aW9uSnVua3lhcmQucG9wKCk7XG4gICAgaWYgKCFiZWFjaHNlY3Rpb24pIHtcbiAgICAgICAgYmVhY2hzZWN0aW9uID0gbmV3IHRoaXMuQmVhY2hzZWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICBiZWFjaHNlY3Rpb24uc2l0ZSA9IHNpdGU7XG4gICAgcmV0dXJuIGJlYWNoc2VjdGlvbjtcbiAgICB9O1xuXG4vLyBjYWxjdWxhdGUgdGhlIGxlZnQgYnJlYWsgcG9pbnQgb2YgYSBwYXJ0aWN1bGFyIGJlYWNoIHNlY3Rpb24sXG4vLyBnaXZlbiBhIHBhcnRpY3VsYXIgc3dlZXAgbGluZVxuVm9yb25vaS5wcm90b3R5cGUubGVmdEJyZWFrUG9pbnQgPSBmdW5jdGlvbihhcmMsIGRpcmVjdHJpeCkge1xuICAgIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUGFyYWJvbGFcbiAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1F1YWRyYXRpY19lcXVhdGlvblxuICAgIC8vIGgxID0geDEsXG4gICAgLy8gazEgPSAoeTErZGlyZWN0cml4KS8yLFxuICAgIC8vIGgyID0geDIsXG4gICAgLy8gazIgPSAoeTIrZGlyZWN0cml4KS8yLFxuICAgIC8vIHAxID0gazEtZGlyZWN0cml4LFxuICAgIC8vIGExID0gMS8oNCpwMSksXG4gICAgLy8gYjEgPSAtaDEvKDIqcDEpLFxuICAgIC8vIGMxID0gaDEqaDEvKDQqcDEpK2sxLFxuICAgIC8vIHAyID0gazItZGlyZWN0cml4LFxuICAgIC8vIGEyID0gMS8oNCpwMiksXG4gICAgLy8gYjIgPSAtaDIvKDIqcDIpLFxuICAgIC8vIGMyID0gaDIqaDIvKDQqcDIpK2syLFxuICAgIC8vIHggPSAoLShiMi1iMSkgKyBNYXRoLnNxcnQoKGIyLWIxKSooYjItYjEpIC0gNCooYTItYTEpKihjMi1jMSkpKSAvICgyKihhMi1hMSkpXG4gICAgLy8gV2hlbiB4MSBiZWNvbWUgdGhlIHgtb3JpZ2luOlxuICAgIC8vIGgxID0gMCxcbiAgICAvLyBrMSA9ICh5MStkaXJlY3RyaXgpLzIsXG4gICAgLy8gaDIgPSB4Mi14MSxcbiAgICAvLyBrMiA9ICh5MitkaXJlY3RyaXgpLzIsXG4gICAgLy8gcDEgPSBrMS1kaXJlY3RyaXgsXG4gICAgLy8gYTEgPSAxLyg0KnAxKSxcbiAgICAvLyBiMSA9IDAsXG4gICAgLy8gYzEgPSBrMSxcbiAgICAvLyBwMiA9IGsyLWRpcmVjdHJpeCxcbiAgICAvLyBhMiA9IDEvKDQqcDIpLFxuICAgIC8vIGIyID0gLWgyLygyKnAyKSxcbiAgICAvLyBjMiA9IGgyKmgyLyg0KnAyKStrMixcbiAgICAvLyB4ID0gKC1iMiArIE1hdGguc3FydChiMipiMiAtIDQqKGEyLWExKSooYzItazEpKSkgLyAoMiooYTItYTEpKSArIHgxXG5cbiAgICAvLyBjaGFuZ2UgY29kZSBiZWxvdyBhdCB5b3VyIG93biByaXNrOiBjYXJlIGhhcyBiZWVuIHRha2VuIHRvXG4gICAgLy8gcmVkdWNlIGVycm9ycyBkdWUgdG8gY29tcHV0ZXJzJyBmaW5pdGUgYXJpdGhtZXRpYyBwcmVjaXNpb24uXG4gICAgLy8gTWF5YmUgY2FuIHN0aWxsIGJlIGltcHJvdmVkLCB3aWxsIHNlZSBpZiBhbnkgbW9yZSBvZiB0aGlzXG4gICAgLy8ga2luZCBvZiBlcnJvcnMgcG9wIHVwIGFnYWluLlxuICAgIHZhciBzaXRlID0gYXJjLnNpdGUsXG4gICAgICAgIHJmb2N4ID0gc2l0ZS54LFxuICAgICAgICByZm9jeSA9IHNpdGUueSxcbiAgICAgICAgcGJ5MiA9IHJmb2N5LWRpcmVjdHJpeDtcbiAgICAvLyBwYXJhYm9sYSBpbiBkZWdlbmVyYXRlIGNhc2Ugd2hlcmUgZm9jdXMgaXMgb24gZGlyZWN0cml4XG4gICAgaWYgKCFwYnkyKSB7XG4gICAgICAgIHJldHVybiByZm9jeDtcbiAgICAgICAgfVxuICAgIHZhciBsQXJjID0gYXJjLnJiUHJldmlvdXM7XG4gICAgaWYgKCFsQXJjKSB7XG4gICAgICAgIHJldHVybiAtSW5maW5pdHk7XG4gICAgICAgIH1cbiAgICBzaXRlID0gbEFyYy5zaXRlO1xuICAgIHZhciBsZm9jeCA9IHNpdGUueCxcbiAgICAgICAgbGZvY3kgPSBzaXRlLnksXG4gICAgICAgIHBsYnkyID0gbGZvY3ktZGlyZWN0cml4O1xuICAgIC8vIHBhcmFib2xhIGluIGRlZ2VuZXJhdGUgY2FzZSB3aGVyZSBmb2N1cyBpcyBvbiBkaXJlY3RyaXhcbiAgICBpZiAoIXBsYnkyKSB7XG4gICAgICAgIHJldHVybiBsZm9jeDtcbiAgICAgICAgfVxuICAgIHZhciBobCA9IGxmb2N4LXJmb2N4LFxuICAgICAgICBhYnkyID0gMS9wYnkyLTEvcGxieTIsXG4gICAgICAgIGIgPSBobC9wbGJ5MjtcbiAgICBpZiAoYWJ5Mikge1xuICAgICAgICByZXR1cm4gKC1iK3RoaXMuc3FydChiKmItMiphYnkyKihobCpobC8oLTIqcGxieTIpLWxmb2N5K3BsYnkyLzIrcmZvY3ktcGJ5Mi8yKSkpL2FieTIrcmZvY3g7XG4gICAgICAgIH1cbiAgICAvLyBib3RoIHBhcmFib2xhcyBoYXZlIHNhbWUgZGlzdGFuY2UgdG8gZGlyZWN0cml4LCB0aHVzIGJyZWFrIHBvaW50IGlzIG1pZHdheVxuICAgIHJldHVybiAocmZvY3grbGZvY3gpLzI7XG4gICAgfTtcblxuLy8gY2FsY3VsYXRlIHRoZSByaWdodCBicmVhayBwb2ludCBvZiBhIHBhcnRpY3VsYXIgYmVhY2ggc2VjdGlvbixcbi8vIGdpdmVuIGEgcGFydGljdWxhciBkaXJlY3RyaXhcblZvcm9ub2kucHJvdG90eXBlLnJpZ2h0QnJlYWtQb2ludCA9IGZ1bmN0aW9uKGFyYywgZGlyZWN0cml4KSB7XG4gICAgdmFyIHJBcmMgPSBhcmMucmJOZXh0O1xuICAgIGlmIChyQXJjKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxlZnRCcmVha1BvaW50KHJBcmMsIGRpcmVjdHJpeCk7XG4gICAgICAgIH1cbiAgICB2YXIgc2l0ZSA9IGFyYy5zaXRlO1xuICAgIHJldHVybiBzaXRlLnkgPT09IGRpcmVjdHJpeCA/IHNpdGUueCA6IEluZmluaXR5O1xuICAgIH07XG5cblZvcm9ub2kucHJvdG90eXBlLmRldGFjaEJlYWNoc2VjdGlvbiA9IGZ1bmN0aW9uKGJlYWNoc2VjdGlvbikge1xuICAgIHRoaXMuZGV0YWNoQ2lyY2xlRXZlbnQoYmVhY2hzZWN0aW9uKTsgLy8gZGV0YWNoIHBvdGVudGlhbGx5IGF0dGFjaGVkIGNpcmNsZSBldmVudFxuICAgIHRoaXMuYmVhY2hsaW5lLnJiUmVtb3ZlTm9kZShiZWFjaHNlY3Rpb24pOyAvLyByZW1vdmUgZnJvbSBSQi10cmVlXG4gICAgdGhpcy5iZWFjaHNlY3Rpb25KdW5reWFyZC5wdXNoKGJlYWNoc2VjdGlvbik7IC8vIG1hcmsgZm9yIHJldXNlXG4gICAgfTtcblxuVm9yb25vaS5wcm90b3R5cGUucmVtb3ZlQmVhY2hzZWN0aW9uID0gZnVuY3Rpb24oYmVhY2hzZWN0aW9uKSB7XG4gICAgdmFyIGNpcmNsZSA9IGJlYWNoc2VjdGlvbi5jaXJjbGVFdmVudCxcbiAgICAgICAgeCA9IGNpcmNsZS54LFxuICAgICAgICB5ID0gY2lyY2xlLnljZW50ZXIsXG4gICAgICAgIHZlcnRleCA9IHRoaXMuY3JlYXRlVmVydGV4KHgsIHkpLFxuICAgICAgICBwcmV2aW91cyA9IGJlYWNoc2VjdGlvbi5yYlByZXZpb3VzLFxuICAgICAgICBuZXh0ID0gYmVhY2hzZWN0aW9uLnJiTmV4dCxcbiAgICAgICAgZGlzYXBwZWFyaW5nVHJhbnNpdGlvbnMgPSBbYmVhY2hzZWN0aW9uXSxcbiAgICAgICAgYWJzX2ZuID0gTWF0aC5hYnM7XG5cbiAgICAvLyByZW1vdmUgY29sbGFwc2VkIGJlYWNoc2VjdGlvbiBmcm9tIGJlYWNobGluZVxuICAgIHRoaXMuZGV0YWNoQmVhY2hzZWN0aW9uKGJlYWNoc2VjdGlvbik7XG5cbiAgICAvLyB0aGVyZSBjb3VsZCBiZSBtb3JlIHRoYW4gb25lIGVtcHR5IGFyYyBhdCB0aGUgZGVsZXRpb24gcG9pbnQsIHRoaXNcbiAgICAvLyBoYXBwZW5zIHdoZW4gbW9yZSB0aGFuIHR3byBlZGdlcyBhcmUgbGlua2VkIGJ5IHRoZSBzYW1lIHZlcnRleCxcbiAgICAvLyBzbyB3ZSB3aWxsIGNvbGxlY3QgYWxsIHRob3NlIGVkZ2VzIGJ5IGxvb2tpbmcgdXAgYm90aCBzaWRlcyBvZlxuICAgIC8vIHRoZSBkZWxldGlvbiBwb2ludC5cbiAgICAvLyBieSB0aGUgd2F5LCB0aGVyZSBpcyAqYWx3YXlzKiBhIHByZWRlY2Vzc29yL3N1Y2Nlc3NvciB0byBhbnkgY29sbGFwc2VkXG4gICAgLy8gYmVhY2ggc2VjdGlvbiwgaXQncyBqdXN0IGltcG9zc2libGUgdG8gaGF2ZSBhIGNvbGxhcHNpbmcgZmlyc3QvbGFzdFxuICAgIC8vIGJlYWNoIHNlY3Rpb25zIG9uIHRoZSBiZWFjaGxpbmUsIHNpbmNlIHRoZXkgb2J2aW91c2x5IGFyZSB1bmNvbnN0cmFpbmVkXG4gICAgLy8gb24gdGhlaXIgbGVmdC9yaWdodCBzaWRlLlxuXG4gICAgLy8gbG9vayBsZWZ0XG4gICAgdmFyIGxBcmMgPSBwcmV2aW91cztcbiAgICB3aGlsZSAobEFyYy5jaXJjbGVFdmVudCAmJiBhYnNfZm4oeC1sQXJjLmNpcmNsZUV2ZW50LngpPDFlLTkgJiYgYWJzX2ZuKHktbEFyYy5jaXJjbGVFdmVudC55Y2VudGVyKTwxZS05KSB7XG4gICAgICAgIHByZXZpb3VzID0gbEFyYy5yYlByZXZpb3VzO1xuICAgICAgICBkaXNhcHBlYXJpbmdUcmFuc2l0aW9ucy51bnNoaWZ0KGxBcmMpO1xuICAgICAgICB0aGlzLmRldGFjaEJlYWNoc2VjdGlvbihsQXJjKTsgLy8gbWFyayBmb3IgcmV1c2VcbiAgICAgICAgbEFyYyA9IHByZXZpb3VzO1xuICAgICAgICB9XG4gICAgLy8gZXZlbiB0aG91Z2ggaXQgaXMgbm90IGRpc2FwcGVhcmluZywgSSB3aWxsIGFsc28gYWRkIHRoZSBiZWFjaCBzZWN0aW9uXG4gICAgLy8gaW1tZWRpYXRlbHkgdG8gdGhlIGxlZnQgb2YgdGhlIGxlZnQtbW9zdCBjb2xsYXBzZWQgYmVhY2ggc2VjdGlvbiwgZm9yXG4gICAgLy8gY29udmVuaWVuY2UsIHNpbmNlIHdlIG5lZWQgdG8gcmVmZXIgdG8gaXQgbGF0ZXIgYXMgdGhpcyBiZWFjaCBzZWN0aW9uXG4gICAgLy8gaXMgdGhlICdsZWZ0JyBzaXRlIG9mIGFuIGVkZ2UgZm9yIHdoaWNoIGEgc3RhcnQgcG9pbnQgaXMgc2V0LlxuICAgIGRpc2FwcGVhcmluZ1RyYW5zaXRpb25zLnVuc2hpZnQobEFyYyk7XG4gICAgdGhpcy5kZXRhY2hDaXJjbGVFdmVudChsQXJjKTtcblxuICAgIC8vIGxvb2sgcmlnaHRcbiAgICB2YXIgckFyYyA9IG5leHQ7XG4gICAgd2hpbGUgKHJBcmMuY2lyY2xlRXZlbnQgJiYgYWJzX2ZuKHgtckFyYy5jaXJjbGVFdmVudC54KTwxZS05ICYmIGFic19mbih5LXJBcmMuY2lyY2xlRXZlbnQueWNlbnRlcik8MWUtOSkge1xuICAgICAgICBuZXh0ID0gckFyYy5yYk5leHQ7XG4gICAgICAgIGRpc2FwcGVhcmluZ1RyYW5zaXRpb25zLnB1c2gockFyYyk7XG4gICAgICAgIHRoaXMuZGV0YWNoQmVhY2hzZWN0aW9uKHJBcmMpOyAvLyBtYXJrIGZvciByZXVzZVxuICAgICAgICByQXJjID0gbmV4dDtcbiAgICAgICAgfVxuICAgIC8vIHdlIGFsc28gaGF2ZSB0byBhZGQgdGhlIGJlYWNoIHNlY3Rpb24gaW1tZWRpYXRlbHkgdG8gdGhlIHJpZ2h0IG9mIHRoZVxuICAgIC8vIHJpZ2h0LW1vc3QgY29sbGFwc2VkIGJlYWNoIHNlY3Rpb24sIHNpbmNlIHRoZXJlIGlzIGFsc28gYSBkaXNhcHBlYXJpbmdcbiAgICAvLyB0cmFuc2l0aW9uIHJlcHJlc2VudGluZyBhbiBlZGdlJ3Mgc3RhcnQgcG9pbnQgb24gaXRzIGxlZnQuXG4gICAgZGlzYXBwZWFyaW5nVHJhbnNpdGlvbnMucHVzaChyQXJjKTtcbiAgICB0aGlzLmRldGFjaENpcmNsZUV2ZW50KHJBcmMpO1xuXG4gICAgLy8gd2FsayB0aHJvdWdoIGFsbCB0aGUgZGlzYXBwZWFyaW5nIHRyYW5zaXRpb25zIGJldHdlZW4gYmVhY2ggc2VjdGlvbnMgYW5kXG4gICAgLy8gc2V0IHRoZSBzdGFydCBwb2ludCBvZiB0aGVpciAoaW1wbGllZCkgZWRnZS5cbiAgICB2YXIgbkFyY3MgPSBkaXNhcHBlYXJpbmdUcmFuc2l0aW9ucy5sZW5ndGgsXG4gICAgICAgIGlBcmM7XG4gICAgZm9yIChpQXJjPTE7IGlBcmM8bkFyY3M7IGlBcmMrKykge1xuICAgICAgICByQXJjID0gZGlzYXBwZWFyaW5nVHJhbnNpdGlvbnNbaUFyY107XG4gICAgICAgIGxBcmMgPSBkaXNhcHBlYXJpbmdUcmFuc2l0aW9uc1tpQXJjLTFdO1xuICAgICAgICB0aGlzLnNldEVkZ2VTdGFydHBvaW50KHJBcmMuZWRnZSwgbEFyYy5zaXRlLCByQXJjLnNpdGUsIHZlcnRleCk7XG4gICAgICAgIH1cblxuICAgIC8vIGNyZWF0ZSBhIG5ldyBlZGdlIGFzIHdlIGhhdmUgbm93IGEgbmV3IHRyYW5zaXRpb24gYmV0d2VlblxuICAgIC8vIHR3byBiZWFjaCBzZWN0aW9ucyB3aGljaCB3ZXJlIHByZXZpb3VzbHkgbm90IGFkamFjZW50LlxuICAgIC8vIHNpbmNlIHRoaXMgZWRnZSBhcHBlYXJzIGFzIGEgbmV3IHZlcnRleCBpcyBkZWZpbmVkLCB0aGUgdmVydGV4XG4gICAgLy8gYWN0dWFsbHkgZGVmaW5lIGFuIGVuZCBwb2ludCBvZiB0aGUgZWRnZSAocmVsYXRpdmUgdG8gdGhlIHNpdGVcbiAgICAvLyBvbiB0aGUgbGVmdClcbiAgICBsQXJjID0gZGlzYXBwZWFyaW5nVHJhbnNpdGlvbnNbMF07XG4gICAgckFyYyA9IGRpc2FwcGVhcmluZ1RyYW5zaXRpb25zW25BcmNzLTFdO1xuICAgIHJBcmMuZWRnZSA9IHRoaXMuY3JlYXRlRWRnZShsQXJjLnNpdGUsIHJBcmMuc2l0ZSwgdW5kZWZpbmVkLCB2ZXJ0ZXgpO1xuXG4gICAgLy8gY3JlYXRlIGNpcmNsZSBldmVudHMgaWYgYW55IGZvciBiZWFjaCBzZWN0aW9ucyBsZWZ0IGluIHRoZSBiZWFjaGxpbmVcbiAgICAvLyBhZGphY2VudCB0byBjb2xsYXBzZWQgc2VjdGlvbnNcbiAgICB0aGlzLmF0dGFjaENpcmNsZUV2ZW50KGxBcmMpO1xuICAgIHRoaXMuYXR0YWNoQ2lyY2xlRXZlbnQockFyYyk7XG4gICAgfTtcblxuVm9yb25vaS5wcm90b3R5cGUuYWRkQmVhY2hzZWN0aW9uID0gZnVuY3Rpb24oc2l0ZSkge1xuICAgIHZhciB4ID0gc2l0ZS54LFxuICAgICAgICBkaXJlY3RyaXggPSBzaXRlLnk7XG5cbiAgICAvLyBmaW5kIHRoZSBsZWZ0IGFuZCByaWdodCBiZWFjaCBzZWN0aW9ucyB3aGljaCB3aWxsIHN1cnJvdW5kIHRoZSBuZXdseVxuICAgIC8vIGNyZWF0ZWQgYmVhY2ggc2VjdGlvbi5cbiAgICAvLyByaGlsbCAyMDExLTA2LTAxOiBUaGlzIGxvb3AgaXMgb25lIG9mIHRoZSBtb3N0IG9mdGVuIGV4ZWN1dGVkLFxuICAgIC8vIGhlbmNlIHdlIGV4cGFuZCBpbi1wbGFjZSB0aGUgY29tcGFyaXNvbi1hZ2FpbnN0LWVwc2lsb24gY2FsbHMuXG4gICAgdmFyIGxBcmMsIHJBcmMsXG4gICAgICAgIGR4bCwgZHhyLFxuICAgICAgICBub2RlID0gdGhpcy5iZWFjaGxpbmUucm9vdDtcblxuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGR4bCA9IHRoaXMubGVmdEJyZWFrUG9pbnQobm9kZSxkaXJlY3RyaXgpLXg7XG4gICAgICAgIC8vIHggbGVzc1RoYW5XaXRoRXBzaWxvbiB4bCA9PiBmYWxscyBzb21ld2hlcmUgYmVmb3JlIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIGJlYWNoc2VjdGlvblxuICAgICAgICBpZiAoZHhsID4gMWUtOSkge1xuICAgICAgICAgICAgLy8gdGhpcyBjYXNlIHNob3VsZCBuZXZlciBoYXBwZW5cbiAgICAgICAgICAgIC8vIGlmICghbm9kZS5yYkxlZnQpIHtcbiAgICAgICAgICAgIC8vICAgIHJBcmMgPSBub2RlLnJiTGVmdDtcbiAgICAgICAgICAgIC8vICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gICAgfVxuICAgICAgICAgICAgbm9kZSA9IG5vZGUucmJMZWZ0O1xuICAgICAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGR4ciA9IHgtdGhpcy5yaWdodEJyZWFrUG9pbnQobm9kZSxkaXJlY3RyaXgpO1xuICAgICAgICAgICAgLy8geCBncmVhdGVyVGhhbldpdGhFcHNpbG9uIHhyID0+IGZhbGxzIHNvbWV3aGVyZSBhZnRlciB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgYmVhY2hzZWN0aW9uXG4gICAgICAgICAgICBpZiAoZHhyID4gMWUtOSkge1xuICAgICAgICAgICAgICAgIGlmICghbm9kZS5yYlJpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxBcmMgPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLnJiUmlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8geCBlcXVhbFdpdGhFcHNpbG9uIHhsID0+IGZhbGxzIGV4YWN0bHkgb24gdGhlIGxlZnQgZWRnZSBvZiB0aGUgYmVhY2hzZWN0aW9uXG4gICAgICAgICAgICAgICAgaWYgKGR4bCA+IC0xZS05KSB7XG4gICAgICAgICAgICAgICAgICAgIGxBcmMgPSBub2RlLnJiUHJldmlvdXM7XG4gICAgICAgICAgICAgICAgICAgIHJBcmMgPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8geCBlcXVhbFdpdGhFcHNpbG9uIHhyID0+IGZhbGxzIGV4YWN0bHkgb24gdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGJlYWNoc2VjdGlvblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGR4ciA+IC0xZS05KSB7XG4gICAgICAgICAgICAgICAgICAgIGxBcmMgPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICByQXJjID0gbm9kZS5yYk5leHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBmYWxscyBleGFjdGx5IHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlIG9mIHRoZSBiZWFjaHNlY3Rpb25cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbEFyYyA9IHJBcmMgPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgLy8gYXQgdGhpcyBwb2ludCwga2VlcCBpbiBtaW5kIHRoYXQgbEFyYyBhbmQvb3IgckFyYyBjb3VsZCBiZVxuICAgIC8vIHVuZGVmaW5lZCBvciBudWxsLlxuXG4gICAgLy8gY3JlYXRlIGEgbmV3IGJlYWNoIHNlY3Rpb24gb2JqZWN0IGZvciB0aGUgc2l0ZSBhbmQgYWRkIGl0IHRvIFJCLXRyZWVcbiAgICB2YXIgbmV3QXJjID0gdGhpcy5jcmVhdGVCZWFjaHNlY3Rpb24oc2l0ZSk7XG4gICAgdGhpcy5iZWFjaGxpbmUucmJJbnNlcnRTdWNjZXNzb3IobEFyYywgbmV3QXJjKTtcblxuICAgIC8vIGNhc2VzOlxuICAgIC8vXG5cbiAgICAvLyBbbnVsbCxudWxsXVxuICAgIC8vIGxlYXN0IGxpa2VseSBjYXNlOiBuZXcgYmVhY2ggc2VjdGlvbiBpcyB0aGUgZmlyc3QgYmVhY2ggc2VjdGlvbiBvbiB0aGVcbiAgICAvLyBiZWFjaGxpbmUuXG4gICAgLy8gVGhpcyBjYXNlIG1lYW5zOlxuICAgIC8vICAgbm8gbmV3IHRyYW5zaXRpb24gYXBwZWFyc1xuICAgIC8vICAgbm8gY29sbGFwc2luZyBiZWFjaCBzZWN0aW9uXG4gICAgLy8gICBuZXcgYmVhY2hzZWN0aW9uIGJlY29tZSByb290IG9mIHRoZSBSQi10cmVlXG4gICAgaWYgKCFsQXJjICYmICFyQXJjKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgLy8gW2xBcmMsckFyY10gd2hlcmUgbEFyYyA9PSByQXJjXG4gICAgLy8gbW9zdCBsaWtlbHkgY2FzZTogbmV3IGJlYWNoIHNlY3Rpb24gc3BsaXQgYW4gZXhpc3RpbmcgYmVhY2hcbiAgICAvLyBzZWN0aW9uLlxuICAgIC8vIFRoaXMgY2FzZSBtZWFuczpcbiAgICAvLyAgIG9uZSBuZXcgdHJhbnNpdGlvbiBhcHBlYXJzXG4gICAgLy8gICB0aGUgbGVmdCBhbmQgcmlnaHQgYmVhY2ggc2VjdGlvbiBtaWdodCBiZSBjb2xsYXBzaW5nIGFzIGEgcmVzdWx0XG4gICAgLy8gICB0d28gbmV3IG5vZGVzIGFkZGVkIHRvIHRoZSBSQi10cmVlXG4gICAgaWYgKGxBcmMgPT09IHJBcmMpIHtcbiAgICAgICAgLy8gaW52YWxpZGF0ZSBjaXJjbGUgZXZlbnQgb2Ygc3BsaXQgYmVhY2ggc2VjdGlvblxuICAgICAgICB0aGlzLmRldGFjaENpcmNsZUV2ZW50KGxBcmMpO1xuXG4gICAgICAgIC8vIHNwbGl0IHRoZSBiZWFjaCBzZWN0aW9uIGludG8gdHdvIHNlcGFyYXRlIGJlYWNoIHNlY3Rpb25zXG4gICAgICAgIHJBcmMgPSB0aGlzLmNyZWF0ZUJlYWNoc2VjdGlvbihsQXJjLnNpdGUpO1xuICAgICAgICB0aGlzLmJlYWNobGluZS5yYkluc2VydFN1Y2Nlc3NvcihuZXdBcmMsIHJBcmMpO1xuXG4gICAgICAgIC8vIHNpbmNlIHdlIGhhdmUgYSBuZXcgdHJhbnNpdGlvbiBiZXR3ZWVuIHR3byBiZWFjaCBzZWN0aW9ucyxcbiAgICAgICAgLy8gYSBuZXcgZWRnZSBpcyBib3JuXG4gICAgICAgIG5ld0FyYy5lZGdlID0gckFyYy5lZGdlID0gdGhpcy5jcmVhdGVFZGdlKGxBcmMuc2l0ZSwgbmV3QXJjLnNpdGUpO1xuXG4gICAgICAgIC8vIGNoZWNrIHdoZXRoZXIgdGhlIGxlZnQgYW5kIHJpZ2h0IGJlYWNoIHNlY3Rpb25zIGFyZSBjb2xsYXBzaW5nXG4gICAgICAgIC8vIGFuZCBpZiBzbyBjcmVhdGUgY2lyY2xlIGV2ZW50cywgdG8gYmUgbm90aWZpZWQgd2hlbiB0aGUgcG9pbnQgb2ZcbiAgICAgICAgLy8gY29sbGFwc2UgaXMgcmVhY2hlZC5cbiAgICAgICAgdGhpcy5hdHRhY2hDaXJjbGVFdmVudChsQXJjKTtcbiAgICAgICAgdGhpcy5hdHRhY2hDaXJjbGVFdmVudChyQXJjKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAvLyBbbEFyYyxudWxsXVxuICAgIC8vIGV2ZW4gbGVzcyBsaWtlbHkgY2FzZTogbmV3IGJlYWNoIHNlY3Rpb24gaXMgdGhlICpsYXN0KiBiZWFjaCBzZWN0aW9uXG4gICAgLy8gb24gdGhlIGJlYWNobGluZSAtLSB0aGlzIGNhbiBoYXBwZW4gKm9ubHkqIGlmICphbGwqIHRoZSBwcmV2aW91cyBiZWFjaFxuICAgIC8vIHNlY3Rpb25zIGN1cnJlbnRseSBvbiB0aGUgYmVhY2hsaW5lIHNoYXJlIHRoZSBzYW1lIHkgdmFsdWUgYXNcbiAgICAvLyB0aGUgbmV3IGJlYWNoIHNlY3Rpb24uXG4gICAgLy8gVGhpcyBjYXNlIG1lYW5zOlxuICAgIC8vICAgb25lIG5ldyB0cmFuc2l0aW9uIGFwcGVhcnNcbiAgICAvLyAgIG5vIGNvbGxhcHNpbmcgYmVhY2ggc2VjdGlvbiBhcyBhIHJlc3VsdFxuICAgIC8vICAgbmV3IGJlYWNoIHNlY3Rpb24gYmVjb21lIHJpZ2h0LW1vc3Qgbm9kZSBvZiB0aGUgUkItdHJlZVxuICAgIGlmIChsQXJjICYmICFyQXJjKSB7XG4gICAgICAgIG5ld0FyYy5lZGdlID0gdGhpcy5jcmVhdGVFZGdlKGxBcmMuc2l0ZSxuZXdBcmMuc2l0ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgLy8gW251bGwsckFyY11cbiAgICAvLyBpbXBvc3NpYmxlIGNhc2U6IGJlY2F1c2Ugc2l0ZXMgYXJlIHN0cmljdGx5IHByb2Nlc3NlZCBmcm9tIHRvcCB0byBib3R0b20sXG4gICAgLy8gYW5kIGxlZnQgdG8gcmlnaHQsIHdoaWNoIGd1YXJhbnRlZXMgdGhhdCB0aGVyZSB3aWxsIGFsd2F5cyBiZSBhIGJlYWNoIHNlY3Rpb25cbiAgICAvLyBvbiB0aGUgbGVmdCAtLSBleGNlcHQgb2YgY291cnNlIHdoZW4gdGhlcmUgYXJlIG5vIGJlYWNoIHNlY3Rpb24gYXQgYWxsIG9uXG4gICAgLy8gdGhlIGJlYWNoIGxpbmUsIHdoaWNoIGNhc2Ugd2FzIGhhbmRsZWQgYWJvdmUuXG4gICAgLy8gcmhpbGwgMjAxMS0wNi0wMjogTm8gcG9pbnQgdGVzdGluZyBpbiBub24tZGVidWcgdmVyc2lvblxuICAgIC8vaWYgKCFsQXJjICYmIHJBcmMpIHtcbiAgICAvLyAgICB0aHJvdyBcIlZvcm9ub2kuYWRkQmVhY2hzZWN0aW9uKCk6IFdoYXQgaXMgdGhpcyBJIGRvbid0IGV2ZW5cIjtcbiAgICAvLyAgICB9XG5cbiAgICAvLyBbbEFyYyxyQXJjXSB3aGVyZSBsQXJjICE9IHJBcmNcbiAgICAvLyBzb21ld2hhdCBsZXNzIGxpa2VseSBjYXNlOiBuZXcgYmVhY2ggc2VjdGlvbiBmYWxscyAqZXhhY3RseSogaW4gYmV0d2VlbiB0d29cbiAgICAvLyBleGlzdGluZyBiZWFjaCBzZWN0aW9uc1xuICAgIC8vIFRoaXMgY2FzZSBtZWFuczpcbiAgICAvLyAgIG9uZSB0cmFuc2l0aW9uIGRpc2FwcGVhcnNcbiAgICAvLyAgIHR3byBuZXcgdHJhbnNpdGlvbnMgYXBwZWFyXG4gICAgLy8gICB0aGUgbGVmdCBhbmQgcmlnaHQgYmVhY2ggc2VjdGlvbiBtaWdodCBiZSBjb2xsYXBzaW5nIGFzIGEgcmVzdWx0XG4gICAgLy8gICBvbmx5IG9uZSBuZXcgbm9kZSBhZGRlZCB0byB0aGUgUkItdHJlZVxuICAgIGlmIChsQXJjICE9PSByQXJjKSB7XG4gICAgICAgIC8vIGludmFsaWRhdGUgY2lyY2xlIGV2ZW50cyBvZiBsZWZ0IGFuZCByaWdodCBzaXRlc1xuICAgICAgICB0aGlzLmRldGFjaENpcmNsZUV2ZW50KGxBcmMpO1xuICAgICAgICB0aGlzLmRldGFjaENpcmNsZUV2ZW50KHJBcmMpO1xuXG4gICAgICAgIC8vIGFuIGV4aXN0aW5nIHRyYW5zaXRpb24gZGlzYXBwZWFycywgbWVhbmluZyBhIHZlcnRleCBpcyBkZWZpbmVkIGF0XG4gICAgICAgIC8vIHRoZSBkaXNhcHBlYXJhbmNlIHBvaW50LlxuICAgICAgICAvLyBzaW5jZSB0aGUgZGlzYXBwZWFyYW5jZSBpcyBjYXVzZWQgYnkgdGhlIG5ldyBiZWFjaHNlY3Rpb24sIHRoZVxuICAgICAgICAvLyB2ZXJ0ZXggaXMgYXQgdGhlIGNlbnRlciBvZiB0aGUgY2lyY3Vtc2NyaWJlZCBjaXJjbGUgb2YgdGhlIGxlZnQsXG4gICAgICAgIC8vIG5ldyBhbmQgcmlnaHQgYmVhY2hzZWN0aW9ucy5cbiAgICAgICAgLy8gaHR0cDovL21hdGhmb3J1bS5vcmcvbGlicmFyeS9kcm1hdGgvdmlldy81NTAwMi5odG1sXG4gICAgICAgIC8vIEV4Y2VwdCB0aGF0IEkgYnJpbmcgdGhlIG9yaWdpbiBhdCBBIHRvIHNpbXBsaWZ5XG4gICAgICAgIC8vIGNhbGN1bGF0aW9uXG4gICAgICAgIHZhciBsU2l0ZSA9IGxBcmMuc2l0ZSxcbiAgICAgICAgICAgIGF4ID0gbFNpdGUueCxcbiAgICAgICAgICAgIGF5ID0gbFNpdGUueSxcbiAgICAgICAgICAgIGJ4PXNpdGUueC1heCxcbiAgICAgICAgICAgIGJ5PXNpdGUueS1heSxcbiAgICAgICAgICAgIHJTaXRlID0gckFyYy5zaXRlLFxuICAgICAgICAgICAgY3g9clNpdGUueC1heCxcbiAgICAgICAgICAgIGN5PXJTaXRlLnktYXksXG4gICAgICAgICAgICBkPTIqKGJ4KmN5LWJ5KmN4KSxcbiAgICAgICAgICAgIGhiPWJ4KmJ4K2J5KmJ5LFxuICAgICAgICAgICAgaGM9Y3gqY3grY3kqY3ksXG4gICAgICAgICAgICB2ZXJ0ZXggPSB0aGlzLmNyZWF0ZVZlcnRleCgoY3kqaGItYnkqaGMpL2QrYXgsIChieCpoYy1jeCpoYikvZCtheSk7XG5cbiAgICAgICAgLy8gb25lIHRyYW5zaXRpb24gZGlzYXBwZWFyXG4gICAgICAgIHRoaXMuc2V0RWRnZVN0YXJ0cG9pbnQockFyYy5lZGdlLCBsU2l0ZSwgclNpdGUsIHZlcnRleCk7XG5cbiAgICAgICAgLy8gdHdvIG5ldyB0cmFuc2l0aW9ucyBhcHBlYXIgYXQgdGhlIG5ldyB2ZXJ0ZXggbG9jYXRpb25cbiAgICAgICAgbmV3QXJjLmVkZ2UgPSB0aGlzLmNyZWF0ZUVkZ2UobFNpdGUsIHNpdGUsIHVuZGVmaW5lZCwgdmVydGV4KTtcbiAgICAgICAgckFyYy5lZGdlID0gdGhpcy5jcmVhdGVFZGdlKHNpdGUsIHJTaXRlLCB1bmRlZmluZWQsIHZlcnRleCk7XG5cbiAgICAgICAgLy8gY2hlY2sgd2hldGhlciB0aGUgbGVmdCBhbmQgcmlnaHQgYmVhY2ggc2VjdGlvbnMgYXJlIGNvbGxhcHNpbmdcbiAgICAgICAgLy8gYW5kIGlmIHNvIGNyZWF0ZSBjaXJjbGUgZXZlbnRzLCB0byBoYW5kbGUgdGhlIHBvaW50IG9mIGNvbGxhcHNlLlxuICAgICAgICB0aGlzLmF0dGFjaENpcmNsZUV2ZW50KGxBcmMpO1xuICAgICAgICB0aGlzLmF0dGFjaENpcmNsZUV2ZW50KHJBcmMpO1xuICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENpcmNsZSBldmVudCBtZXRob2RzXG5cbi8vIHJoaWxsIDIwMTEtMDYtMDc6IEZvciBzb21lIHJlYXNvbnMsIHBlcmZvcm1hbmNlIHN1ZmZlcnMgc2lnbmlmaWNhbnRseVxuLy8gd2hlbiBpbnN0YW5jaWF0aW5nIGEgbGl0ZXJhbCBvYmplY3QgaW5zdGVhZCBvZiBhbiBlbXB0eSBjdG9yXG5Wb3Jvbm9pLnByb3RvdHlwZS5DaXJjbGVFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIHJoaWxsIDIwMTMtMTAtMTI6IGl0IGhlbHBzIHRvIHN0YXRlIGV4YWN0bHkgd2hhdCB3ZSBhcmUgYXQgY3RvciB0aW1lLlxuICAgIHRoaXMuYXJjID0gbnVsbDtcbiAgICB0aGlzLnJiTGVmdCA9IG51bGw7XG4gICAgdGhpcy5yYk5leHQgPSBudWxsO1xuICAgIHRoaXMucmJQYXJlbnQgPSBudWxsO1xuICAgIHRoaXMucmJQcmV2aW91cyA9IG51bGw7XG4gICAgdGhpcy5yYlJlZCA9IGZhbHNlO1xuICAgIHRoaXMucmJSaWdodCA9IG51bGw7XG4gICAgdGhpcy5zaXRlID0gbnVsbDtcbiAgICB0aGlzLnggPSB0aGlzLnkgPSB0aGlzLnljZW50ZXIgPSAwO1xuICAgIH07XG5cblZvcm9ub2kucHJvdG90eXBlLmF0dGFjaENpcmNsZUV2ZW50ID0gZnVuY3Rpb24oYXJjKSB7XG4gICAgdmFyIGxBcmMgPSBhcmMucmJQcmV2aW91cyxcbiAgICAgICAgckFyYyA9IGFyYy5yYk5leHQ7XG4gICAgaWYgKCFsQXJjIHx8ICFyQXJjKSB7cmV0dXJuO30gLy8gZG9lcyB0aGF0IGV2ZXIgaGFwcGVuP1xuICAgIHZhciBsU2l0ZSA9IGxBcmMuc2l0ZSxcbiAgICAgICAgY1NpdGUgPSBhcmMuc2l0ZSxcbiAgICAgICAgclNpdGUgPSByQXJjLnNpdGU7XG5cbiAgICAvLyBJZiBzaXRlIG9mIGxlZnQgYmVhY2hzZWN0aW9uIGlzIHNhbWUgYXMgc2l0ZSBvZlxuICAgIC8vIHJpZ2h0IGJlYWNoc2VjdGlvbiwgdGhlcmUgY2FuJ3QgYmUgY29udmVyZ2VuY2VcbiAgICBpZiAobFNpdGU9PT1yU2l0ZSkge3JldHVybjt9XG5cbiAgICAvLyBGaW5kIHRoZSBjaXJjdW1zY3JpYmVkIGNpcmNsZSBmb3IgdGhlIHRocmVlIHNpdGVzIGFzc29jaWF0ZWRcbiAgICAvLyB3aXRoIHRoZSBiZWFjaHNlY3Rpb24gdHJpcGxldC5cbiAgICAvLyByaGlsbCAyMDExLTA1LTI2OiBJdCBpcyBtb3JlIGVmZmljaWVudCB0byBjYWxjdWxhdGUgaW4tcGxhY2VcbiAgICAvLyByYXRoZXIgdGhhbiBnZXR0aW5nIHRoZSByZXN1bHRpbmcgY2lyY3Vtc2NyaWJlZCBjaXJjbGUgZnJvbSBhblxuICAgIC8vIG9iamVjdCByZXR1cm5lZCBieSBjYWxsaW5nIFZvcm9ub2kuY2lyY3VtY2lyY2xlKClcbiAgICAvLyBodHRwOi8vbWF0aGZvcnVtLm9yZy9saWJyYXJ5L2RybWF0aC92aWV3LzU1MDAyLmh0bWxcbiAgICAvLyBFeGNlcHQgdGhhdCBJIGJyaW5nIHRoZSBvcmlnaW4gYXQgY1NpdGUgdG8gc2ltcGxpZnkgY2FsY3VsYXRpb25zLlxuICAgIC8vIFRoZSBib3R0b20tbW9zdCBwYXJ0IG9mIHRoZSBjaXJjdW1jaXJjbGUgaXMgb3VyIEZvcnR1bmUgJ2NpcmNsZVxuICAgIC8vIGV2ZW50JywgYW5kIGl0cyBjZW50ZXIgaXMgYSB2ZXJ0ZXggcG90ZW50aWFsbHkgcGFydCBvZiB0aGUgZmluYWxcbiAgICAvLyBWb3Jvbm9pIGRpYWdyYW0uXG4gICAgdmFyIGJ4ID0gY1NpdGUueCxcbiAgICAgICAgYnkgPSBjU2l0ZS55LFxuICAgICAgICBheCA9IGxTaXRlLngtYngsXG4gICAgICAgIGF5ID0gbFNpdGUueS1ieSxcbiAgICAgICAgY3ggPSByU2l0ZS54LWJ4LFxuICAgICAgICBjeSA9IHJTaXRlLnktYnk7XG5cbiAgICAvLyBJZiBwb2ludHMgbC0+Yy0+ciBhcmUgY2xvY2t3aXNlLCB0aGVuIGNlbnRlciBiZWFjaCBzZWN0aW9uIGRvZXMgbm90XG4gICAgLy8gY29sbGFwc2UsIGhlbmNlIGl0IGNhbid0IGVuZCB1cCBhcyBhIHZlcnRleCAod2UgcmV1c2UgJ2QnIGhlcmUsIHdoaWNoXG4gICAgLy8gc2lnbiBpcyByZXZlcnNlIG9mIHRoZSBvcmllbnRhdGlvbiwgaGVuY2Ugd2UgcmV2ZXJzZSB0aGUgdGVzdC5cbiAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0N1cnZlX29yaWVudGF0aW9uI09yaWVudGF0aW9uX29mX2Ffc2ltcGxlX3BvbHlnb25cbiAgICAvLyByaGlsbCAyMDExLTA1LTIxOiBOYXN0eSBmaW5pdGUgcHJlY2lzaW9uIGVycm9yIHdoaWNoIGNhdXNlZCBjaXJjdW1jaXJjbGUoKSB0b1xuICAgIC8vIHJldHVybiBpbmZpbml0ZXM6IDFlLTEyIHNlZW1zIHRvIGZpeCB0aGUgcHJvYmxlbS5cbiAgICB2YXIgZCA9IDIqKGF4KmN5LWF5KmN4KTtcbiAgICBpZiAoZCA+PSAtMmUtMTIpe3JldHVybjt9XG5cbiAgICB2YXIgaGEgPSBheCpheCtheSpheSxcbiAgICAgICAgaGMgPSBjeCpjeCtjeSpjeSxcbiAgICAgICAgeCA9IChjeSpoYS1heSpoYykvZCxcbiAgICAgICAgeSA9IChheCpoYy1jeCpoYSkvZCxcbiAgICAgICAgeWNlbnRlciA9IHkrYnk7XG5cbiAgICAvLyBJbXBvcnRhbnQ6IHlib3R0b20gc2hvdWxkIGFsd2F5cyBiZSB1bmRlciBvciBhdCBzd2VlcCwgc28gbm8gbmVlZFxuICAgIC8vIHRvIHdhc3RlIENQVSBjeWNsZXMgYnkgY2hlY2tpbmdcblxuICAgIC8vIHJlY3ljbGUgY2lyY2xlIGV2ZW50IG9iamVjdCBpZiBwb3NzaWJsZVxuICAgIHZhciBjaXJjbGVFdmVudCA9IHRoaXMuY2lyY2xlRXZlbnRKdW5reWFyZC5wb3AoKTtcbiAgICBpZiAoIWNpcmNsZUV2ZW50KSB7XG4gICAgICAgIGNpcmNsZUV2ZW50ID0gbmV3IHRoaXMuQ2lyY2xlRXZlbnQoKTtcbiAgICAgICAgfVxuICAgIGNpcmNsZUV2ZW50LmFyYyA9IGFyYztcbiAgICBjaXJjbGVFdmVudC5zaXRlID0gY1NpdGU7XG4gICAgY2lyY2xlRXZlbnQueCA9IHgrYng7XG4gICAgY2lyY2xlRXZlbnQueSA9IHljZW50ZXIrdGhpcy5zcXJ0KHgqeCt5KnkpOyAvLyB5IGJvdHRvbVxuICAgIGNpcmNsZUV2ZW50LnljZW50ZXIgPSB5Y2VudGVyO1xuICAgIGFyYy5jaXJjbGVFdmVudCA9IGNpcmNsZUV2ZW50O1xuXG4gICAgLy8gZmluZCBpbnNlcnRpb24gcG9pbnQgaW4gUkItdHJlZTogY2lyY2xlIGV2ZW50cyBhcmUgb3JkZXJlZCBmcm9tXG4gICAgLy8gc21hbGxlc3QgdG8gbGFyZ2VzdFxuICAgIHZhciBwcmVkZWNlc3NvciA9IG51bGwsXG4gICAgICAgIG5vZGUgPSB0aGlzLmNpcmNsZUV2ZW50cy5yb290O1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmIChjaXJjbGVFdmVudC55IDwgbm9kZS55IHx8IChjaXJjbGVFdmVudC55ID09PSBub2RlLnkgJiYgY2lyY2xlRXZlbnQueCA8PSBub2RlLngpKSB7XG4gICAgICAgICAgICBpZiAobm9kZS5yYkxlZnQpIHtcbiAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5yYkxlZnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJlZGVjZXNzb3IgPSBub2RlLnJiUHJldmlvdXM7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChub2RlLnJiUmlnaHQpIHtcbiAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5yYlJpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHByZWRlY2Vzc29yID0gbm9kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB0aGlzLmNpcmNsZUV2ZW50cy5yYkluc2VydFN1Y2Nlc3NvcihwcmVkZWNlc3NvciwgY2lyY2xlRXZlbnQpO1xuICAgIGlmICghcHJlZGVjZXNzb3IpIHtcbiAgICAgICAgdGhpcy5maXJzdENpcmNsZUV2ZW50ID0gY2lyY2xlRXZlbnQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG5Wb3Jvbm9pLnByb3RvdHlwZS5kZXRhY2hDaXJjbGVFdmVudCA9IGZ1bmN0aW9uKGFyYykge1xuICAgIHZhciBjaXJjbGVFdmVudCA9IGFyYy5jaXJjbGVFdmVudDtcbiAgICBpZiAoY2lyY2xlRXZlbnQpIHtcbiAgICAgICAgaWYgKCFjaXJjbGVFdmVudC5yYlByZXZpb3VzKSB7XG4gICAgICAgICAgICB0aGlzLmZpcnN0Q2lyY2xlRXZlbnQgPSBjaXJjbGVFdmVudC5yYk5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIHRoaXMuY2lyY2xlRXZlbnRzLnJiUmVtb3ZlTm9kZShjaXJjbGVFdmVudCk7IC8vIHJlbW92ZSBmcm9tIFJCLXRyZWVcbiAgICAgICAgdGhpcy5jaXJjbGVFdmVudEp1bmt5YXJkLnB1c2goY2lyY2xlRXZlbnQpO1xuICAgICAgICBhcmMuY2lyY2xlRXZlbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEaWFncmFtIGNvbXBsZXRpb24gbWV0aG9kc1xuXG4vLyBjb25uZWN0IGRhbmdsaW5nIGVkZ2VzIChub3QgaWYgYSBjdXJzb3J5IHRlc3QgdGVsbHMgdXNcbi8vIGl0IGlzIG5vdCBnb2luZyB0byBiZSB2aXNpYmxlLlxuLy8gcmV0dXJuIHZhbHVlOlxuLy8gICBmYWxzZTogdGhlIGRhbmdsaW5nIGVuZHBvaW50IGNvdWxkbid0IGJlIGNvbm5lY3RlZFxuLy8gICB0cnVlOiB0aGUgZGFuZ2xpbmcgZW5kcG9pbnQgY291bGQgYmUgY29ubmVjdGVkXG5Wb3Jvbm9pLnByb3RvdHlwZS5jb25uZWN0RWRnZSA9IGZ1bmN0aW9uKGVkZ2UsIGJib3gpIHtcbiAgICAvLyBza2lwIGlmIGVuZCBwb2ludCBhbHJlYWR5IGNvbm5lY3RlZFxuICAgIHZhciB2YiA9IGVkZ2UudmI7XG4gICAgaWYgKCEhdmIpIHtyZXR1cm4gdHJ1ZTt9XG5cbiAgICAvLyBtYWtlIGxvY2FsIGNvcHkgZm9yIHBlcmZvcm1hbmNlIHB1cnBvc2VcbiAgICB2YXIgdmEgPSBlZGdlLnZhLFxuICAgICAgICB4bCA9IGJib3gueGwsXG4gICAgICAgIHhyID0gYmJveC54cixcbiAgICAgICAgeXQgPSBiYm94Lnl0LFxuICAgICAgICB5YiA9IGJib3gueWIsXG4gICAgICAgIGxTaXRlID0gZWRnZS5sU2l0ZSxcbiAgICAgICAgclNpdGUgPSBlZGdlLnJTaXRlLFxuICAgICAgICBseCA9IGxTaXRlLngsXG4gICAgICAgIGx5ID0gbFNpdGUueSxcbiAgICAgICAgcnggPSByU2l0ZS54LFxuICAgICAgICByeSA9IHJTaXRlLnksXG4gICAgICAgIGZ4ID0gKGx4K3J4KS8yLFxuICAgICAgICBmeSA9IChseStyeSkvMixcbiAgICAgICAgZm0sIGZiO1xuXG4gICAgLy8gaWYgd2UgcmVhY2ggaGVyZSwgdGhpcyBtZWFucyBjZWxscyB3aGljaCB1c2UgdGhpcyBlZGdlIHdpbGwgbmVlZFxuICAgIC8vIHRvIGJlIGNsb3NlZCwgd2hldGhlciBiZWNhdXNlIHRoZSBlZGdlIHdhcyByZW1vdmVkLCBvciBiZWNhdXNlIGl0XG4gICAgLy8gd2FzIGNvbm5lY3RlZCB0byB0aGUgYm91bmRpbmcgYm94LlxuICAgIHRoaXMuY2VsbHNbbFNpdGUudm9yb25vaUlkXS5jbG9zZU1lID0gdHJ1ZTtcbiAgICB0aGlzLmNlbGxzW3JTaXRlLnZvcm9ub2lJZF0uY2xvc2VNZSA9IHRydWU7XG5cbiAgICAvLyBnZXQgdGhlIGxpbmUgZXF1YXRpb24gb2YgdGhlIGJpc2VjdG9yIGlmIGxpbmUgaXMgbm90IHZlcnRpY2FsXG4gICAgaWYgKHJ5ICE9PSBseSkge1xuICAgICAgICBmbSA9IChseC1yeCkvKHJ5LWx5KTtcbiAgICAgICAgZmIgPSBmeS1mbSpmeDtcbiAgICAgICAgfVxuXG4gICAgLy8gcmVtZW1iZXIsIGRpcmVjdGlvbiBvZiBsaW5lIChyZWxhdGl2ZSB0byBsZWZ0IHNpdGUpOlxuICAgIC8vIHVwd2FyZDogbGVmdC54IDwgcmlnaHQueFxuICAgIC8vIGRvd253YXJkOiBsZWZ0LnggPiByaWdodC54XG4gICAgLy8gaG9yaXpvbnRhbDogbGVmdC54ID09IHJpZ2h0LnhcbiAgICAvLyB1cHdhcmQ6IGxlZnQueCA8IHJpZ2h0LnhcbiAgICAvLyByaWdodHdhcmQ6IGxlZnQueSA8IHJpZ2h0LnlcbiAgICAvLyBsZWZ0d2FyZDogbGVmdC55ID4gcmlnaHQueVxuICAgIC8vIHZlcnRpY2FsOiBsZWZ0LnkgPT0gcmlnaHQueVxuXG4gICAgLy8gZGVwZW5kaW5nIG9uIHRoZSBkaXJlY3Rpb24sIGZpbmQgdGhlIGJlc3Qgc2lkZSBvZiB0aGVcbiAgICAvLyBib3VuZGluZyBib3ggdG8gdXNlIHRvIGRldGVybWluZSBhIHJlYXNvbmFibGUgc3RhcnQgcG9pbnRcblxuICAgIC8vIHJoaWxsIDIwMTMtMTItMDI6XG4gICAgLy8gV2hpbGUgYXQgaXQsIHNpbmNlIHdlIGhhdmUgdGhlIHZhbHVlcyB3aGljaCBkZWZpbmUgdGhlIGxpbmUsXG4gICAgLy8gY2xpcCB0aGUgZW5kIG9mIHZhIGlmIGl0IGlzIG91dHNpZGUgdGhlIGJib3guXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvcmhpbGwvSmF2YXNjcmlwdC1Wb3Jvbm9pL2lzc3Vlcy8xNVxuICAgIC8vIFRPRE86IERvIGFsbCB0aGUgY2xpcHBpbmcgaGVyZSByYXRoZXIgdGhhbiByZWx5IG9uIExpYW5nLUJhcnNreVxuICAgIC8vIHdoaWNoIGRvZXMgbm90IGRvIHdlbGwgc29tZXRpbWVzIGR1ZSB0byBsb3NzIG9mIGFyaXRobWV0aWNcbiAgICAvLyBwcmVjaXNpb24uIFRoZSBjb2RlIGhlcmUgZG9lc24ndCBkZWdyYWRlIGlmIG9uZSBvZiB0aGUgdmVydGV4IGlzXG4gICAgLy8gYXQgYSBodWdlIGRpc3RhbmNlLlxuXG4gICAgLy8gc3BlY2lhbCBjYXNlOiB2ZXJ0aWNhbCBsaW5lXG4gICAgaWYgKGZtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gZG9lc24ndCBpbnRlcnNlY3Qgd2l0aCB2aWV3cG9ydFxuICAgICAgICBpZiAoZnggPCB4bCB8fCBmeCA+PSB4cikge3JldHVybiBmYWxzZTt9XG4gICAgICAgIC8vIGRvd253YXJkXG4gICAgICAgIGlmIChseCA+IHJ4KSB7XG4gICAgICAgICAgICBpZiAoIXZhIHx8IHZhLnkgPCB5dCkge1xuICAgICAgICAgICAgICAgIHZhID0gdGhpcy5jcmVhdGVWZXJ0ZXgoZngsIHl0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YS55ID49IHliKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZiID0gdGhpcy5jcmVhdGVWZXJ0ZXgoZngsIHliKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgLy8gdXB3YXJkXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKCF2YSB8fCB2YS55ID4geWIpIHtcbiAgICAgICAgICAgICAgICB2YSA9IHRoaXMuY3JlYXRlVmVydGV4KGZ4LCB5Yik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodmEueSA8IHl0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZiID0gdGhpcy5jcmVhdGVWZXJ0ZXgoZngsIHl0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIC8vIGNsb3NlciB0byB2ZXJ0aWNhbCB0aGFuIGhvcml6b250YWwsIGNvbm5lY3Qgc3RhcnQgcG9pbnQgdG8gdGhlXG4gICAgLy8gdG9wIG9yIGJvdHRvbSBzaWRlIG9mIHRoZSBib3VuZGluZyBib3hcbiAgICBlbHNlIGlmIChmbSA8IC0xIHx8IGZtID4gMSkge1xuICAgICAgICAvLyBkb3dud2FyZFxuICAgICAgICBpZiAobHggPiByeCkge1xuICAgICAgICAgICAgaWYgKCF2YSB8fCB2YS55IDwgeXQpIHtcbiAgICAgICAgICAgICAgICB2YSA9IHRoaXMuY3JlYXRlVmVydGV4KCh5dC1mYikvZm0sIHl0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YS55ID49IHliKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZiID0gdGhpcy5jcmVhdGVWZXJ0ZXgoKHliLWZiKS9mbSwgeWIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAvLyB1cHdhcmRcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXZhIHx8IHZhLnkgPiB5Yikge1xuICAgICAgICAgICAgICAgIHZhID0gdGhpcy5jcmVhdGVWZXJ0ZXgoKHliLWZiKS9mbSwgeWIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhLnkgPCB5dCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB2YiA9IHRoaXMuY3JlYXRlVmVydGV4KCh5dC1mYikvZm0sIHl0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIC8vIGNsb3NlciB0byBob3Jpem9udGFsIHRoYW4gdmVydGljYWwsIGNvbm5lY3Qgc3RhcnQgcG9pbnQgdG8gdGhlXG4gICAgLy8gbGVmdCBvciByaWdodCBzaWRlIG9mIHRoZSBib3VuZGluZyBib3hcbiAgICBlbHNlIHtcbiAgICAgICAgLy8gcmlnaHR3YXJkXG4gICAgICAgIGlmIChseSA8IHJ5KSB7XG4gICAgICAgICAgICBpZiAoIXZhIHx8IHZhLnggPCB4bCkge1xuICAgICAgICAgICAgICAgIHZhID0gdGhpcy5jcmVhdGVWZXJ0ZXgoeGwsIGZtKnhsK2ZiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YS54ID49IHhyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZiID0gdGhpcy5jcmVhdGVWZXJ0ZXgoeHIsIGZtKnhyK2ZiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgLy8gbGVmdHdhcmRcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXZhIHx8IHZhLnggPiB4cikge1xuICAgICAgICAgICAgICAgIHZhID0gdGhpcy5jcmVhdGVWZXJ0ZXgoeHIsIGZtKnhyK2ZiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YS54IDwgeGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmIgPSB0aGlzLmNyZWF0ZVZlcnRleCh4bCwgZm0qeGwrZmIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgZWRnZS52YSA9IHZhO1xuICAgIGVkZ2UudmIgPSB2YjtcblxuICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbi8vIGxpbmUtY2xpcHBpbmcgY29kZSB0YWtlbiBmcm9tOlxuLy8gICBMaWFuZy1CYXJza3kgZnVuY3Rpb24gYnkgRGFuaWVsIFdoaXRlXG4vLyAgIGh0dHA6Ly93d3cuc2t5dG9waWEuY29tL3Byb2plY3QvYXJ0aWNsZXMvY29tcHNjaS9jbGlwcGluZy5odG1sXG4vLyBUaGFua3MhXG4vLyBBIGJpdCBtb2RpZmllZCB0byBtaW5pbWl6ZSBjb2RlIHBhdGhzXG5Wb3Jvbm9pLnByb3RvdHlwZS5jbGlwRWRnZSA9IGZ1bmN0aW9uKGVkZ2UsIGJib3gpIHtcbiAgICB2YXIgYXggPSBlZGdlLnZhLngsXG4gICAgICAgIGF5ID0gZWRnZS52YS55LFxuICAgICAgICBieCA9IGVkZ2UudmIueCxcbiAgICAgICAgYnkgPSBlZGdlLnZiLnksXG4gICAgICAgIHQwID0gMCxcbiAgICAgICAgdDEgPSAxLFxuICAgICAgICBkeCA9IGJ4LWF4LFxuICAgICAgICBkeSA9IGJ5LWF5O1xuICAgIC8vIGxlZnRcbiAgICB2YXIgcSA9IGF4LWJib3gueGw7XG4gICAgaWYgKGR4PT09MCAmJiBxPDApIHtyZXR1cm4gZmFsc2U7fVxuICAgIHZhciByID0gLXEvZHg7XG4gICAgaWYgKGR4PDApIHtcbiAgICAgICAgaWYgKHI8dDApIHtyZXR1cm4gZmFsc2U7fVxuICAgICAgICBpZiAocjx0MSkge3QxPXI7fVxuICAgICAgICB9XG4gICAgZWxzZSBpZiAoZHg+MCkge1xuICAgICAgICBpZiAocj50MSkge3JldHVybiBmYWxzZTt9XG4gICAgICAgIGlmIChyPnQwKSB7dDA9cjt9XG4gICAgICAgIH1cbiAgICAvLyByaWdodFxuICAgIHEgPSBiYm94LnhyLWF4O1xuICAgIGlmIChkeD09PTAgJiYgcTwwKSB7cmV0dXJuIGZhbHNlO31cbiAgICByID0gcS9keDtcbiAgICBpZiAoZHg8MCkge1xuICAgICAgICBpZiAocj50MSkge3JldHVybiBmYWxzZTt9XG4gICAgICAgIGlmIChyPnQwKSB7dDA9cjt9XG4gICAgICAgIH1cbiAgICBlbHNlIGlmIChkeD4wKSB7XG4gICAgICAgIGlmIChyPHQwKSB7cmV0dXJuIGZhbHNlO31cbiAgICAgICAgaWYgKHI8dDEpIHt0MT1yO31cbiAgICAgICAgfVxuICAgIC8vIHRvcFxuICAgIHEgPSBheS1iYm94Lnl0O1xuICAgIGlmIChkeT09PTAgJiYgcTwwKSB7cmV0dXJuIGZhbHNlO31cbiAgICByID0gLXEvZHk7XG4gICAgaWYgKGR5PDApIHtcbiAgICAgICAgaWYgKHI8dDApIHtyZXR1cm4gZmFsc2U7fVxuICAgICAgICBpZiAocjx0MSkge3QxPXI7fVxuICAgICAgICB9XG4gICAgZWxzZSBpZiAoZHk+MCkge1xuICAgICAgICBpZiAocj50MSkge3JldHVybiBmYWxzZTt9XG4gICAgICAgIGlmIChyPnQwKSB7dDA9cjt9XG4gICAgICAgIH1cbiAgICAvLyBib3R0b21cbiAgICBxID0gYmJveC55Yi1heTtcbiAgICBpZiAoZHk9PT0wICYmIHE8MCkge3JldHVybiBmYWxzZTt9XG4gICAgciA9IHEvZHk7XG4gICAgaWYgKGR5PDApIHtcbiAgICAgICAgaWYgKHI+dDEpIHtyZXR1cm4gZmFsc2U7fVxuICAgICAgICBpZiAocj50MCkge3QwPXI7fVxuICAgICAgICB9XG4gICAgZWxzZSBpZiAoZHk+MCkge1xuICAgICAgICBpZiAocjx0MCkge3JldHVybiBmYWxzZTt9XG4gICAgICAgIGlmIChyPHQxKSB7dDE9cjt9XG4gICAgICAgIH1cblxuICAgIC8vIGlmIHdlIHJlYWNoIHRoaXMgcG9pbnQsIFZvcm9ub2kgZWRnZSBpcyB3aXRoaW4gYmJveFxuXG4gICAgLy8gaWYgdDAgPiAwLCB2YSBuZWVkcyB0byBjaGFuZ2VcbiAgICAvLyByaGlsbCAyMDExLTA2LTAzOiB3ZSBuZWVkIHRvIGNyZWF0ZSBhIG5ldyB2ZXJ0ZXggcmF0aGVyXG4gICAgLy8gdGhhbiBtb2RpZnlpbmcgdGhlIGV4aXN0aW5nIG9uZSwgc2luY2UgdGhlIGV4aXN0aW5nXG4gICAgLy8gb25lIGlzIGxpa2VseSBzaGFyZWQgd2l0aCBhdCBsZWFzdCBhbm90aGVyIGVkZ2VcbiAgICBpZiAodDAgPiAwKSB7XG4gICAgICAgIGVkZ2UudmEgPSB0aGlzLmNyZWF0ZVZlcnRleChheCt0MCpkeCwgYXkrdDAqZHkpO1xuICAgICAgICB9XG5cbiAgICAvLyBpZiB0MSA8IDEsIHZiIG5lZWRzIHRvIGNoYW5nZVxuICAgIC8vIHJoaWxsIDIwMTEtMDYtMDM6IHdlIG5lZWQgdG8gY3JlYXRlIGEgbmV3IHZlcnRleCByYXRoZXJcbiAgICAvLyB0aGFuIG1vZGlmeWluZyB0aGUgZXhpc3Rpbmcgb25lLCBzaW5jZSB0aGUgZXhpc3RpbmdcbiAgICAvLyBvbmUgaXMgbGlrZWx5IHNoYXJlZCB3aXRoIGF0IGxlYXN0IGFub3RoZXIgZWRnZVxuICAgIGlmICh0MSA8IDEpIHtcbiAgICAgICAgZWRnZS52YiA9IHRoaXMuY3JlYXRlVmVydGV4KGF4K3QxKmR4LCBheSt0MSpkeSk7XG4gICAgICAgIH1cblxuICAgIC8vIHZhIGFuZC9vciB2YiB3ZXJlIGNsaXBwZWQsIHRodXMgd2Ugd2lsbCBuZWVkIHRvIGNsb3NlXG4gICAgLy8gY2VsbHMgd2hpY2ggdXNlIHRoaXMgZWRnZS5cbiAgICBpZiAoIHQwID4gMCB8fCB0MSA8IDEgKSB7XG4gICAgICAgIHRoaXMuY2VsbHNbZWRnZS5sU2l0ZS52b3Jvbm9pSWRdLmNsb3NlTWUgPSB0cnVlO1xuICAgICAgICB0aGlzLmNlbGxzW2VkZ2UuclNpdGUudm9yb25vaUlkXS5jbG9zZU1lID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4vLyBDb25uZWN0L2N1dCBlZGdlcyBhdCBib3VuZGluZyBib3hcblZvcm9ub2kucHJvdG90eXBlLmNsaXBFZGdlcyA9IGZ1bmN0aW9uKGJib3gpIHtcbiAgICAvLyBjb25uZWN0IGFsbCBkYW5nbGluZyBlZGdlcyB0byBib3VuZGluZyBib3hcbiAgICAvLyBvciBnZXQgcmlkIG9mIHRoZW0gaWYgaXQgY2FuJ3QgYmUgZG9uZVxuICAgIHZhciBlZGdlcyA9IHRoaXMuZWRnZXMsXG4gICAgICAgIGlFZGdlID0gZWRnZXMubGVuZ3RoLFxuICAgICAgICBlZGdlLFxuICAgICAgICBhYnNfZm4gPSBNYXRoLmFicztcblxuICAgIC8vIGl0ZXJhdGUgYmFja3dhcmQgc28gd2UgY2FuIHNwbGljZSBzYWZlbHlcbiAgICB3aGlsZSAoaUVkZ2UtLSkge1xuICAgICAgICBlZGdlID0gZWRnZXNbaUVkZ2VdO1xuICAgICAgICAvLyBlZGdlIGlzIHJlbW92ZWQgaWY6XG4gICAgICAgIC8vICAgaXQgaXMgd2hvbGx5IG91dHNpZGUgdGhlIGJvdW5kaW5nIGJveFxuICAgICAgICAvLyAgIGl0IGlzIGxvb2tpbmcgbW9yZSBsaWtlIGEgcG9pbnQgdGhhbiBhIGxpbmVcbiAgICAgICAgaWYgKCF0aGlzLmNvbm5lY3RFZGdlKGVkZ2UsIGJib3gpIHx8XG4gICAgICAgICAgICAhdGhpcy5jbGlwRWRnZShlZGdlLCBiYm94KSB8fFxuICAgICAgICAgICAgKGFic19mbihlZGdlLnZhLngtZWRnZS52Yi54KTwxZS05ICYmIGFic19mbihlZGdlLnZhLnktZWRnZS52Yi55KTwxZS05KSkge1xuICAgICAgICAgICAgZWRnZS52YSA9IGVkZ2UudmIgPSBudWxsO1xuICAgICAgICAgICAgZWRnZXMuc3BsaWNlKGlFZGdlLDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuLy8gQ2xvc2UgdGhlIGNlbGxzLlxuLy8gVGhlIGNlbGxzIGFyZSBib3VuZCBieSB0aGUgc3VwcGxpZWQgYm91bmRpbmcgYm94LlxuLy8gRWFjaCBjZWxsIHJlZmVycyB0byBpdHMgYXNzb2NpYXRlZCBzaXRlLCBhbmQgYSBsaXN0XG4vLyBvZiBoYWxmZWRnZXMgb3JkZXJlZCBjb3VudGVyY2xvY2t3aXNlLlxuVm9yb25vaS5wcm90b3R5cGUuY2xvc2VDZWxscyA9IGZ1bmN0aW9uKGJib3gpIHtcbiAgICB2YXIgeGwgPSBiYm94LnhsLFxuICAgICAgICB4ciA9IGJib3gueHIsXG4gICAgICAgIHl0ID0gYmJveC55dCxcbiAgICAgICAgeWIgPSBiYm94LnliLFxuICAgICAgICBjZWxscyA9IHRoaXMuY2VsbHMsXG4gICAgICAgIGlDZWxsID0gY2VsbHMubGVuZ3RoLFxuICAgICAgICBjZWxsLFxuICAgICAgICBpTGVmdCxcbiAgICAgICAgaGFsZmVkZ2VzLCBuSGFsZmVkZ2VzLFxuICAgICAgICBlZGdlLFxuICAgICAgICB2YSwgdmIsIHZ6LFxuICAgICAgICBsYXN0Qm9yZGVyU2VnbWVudCxcbiAgICAgICAgYWJzX2ZuID0gTWF0aC5hYnM7XG5cbiAgICB3aGlsZSAoaUNlbGwtLSkge1xuICAgICAgICBjZWxsID0gY2VsbHNbaUNlbGxdO1xuICAgICAgICAvLyBwcnVuZSwgb3JkZXIgaGFsZmVkZ2VzIGNvdW50ZXJjbG9ja3dpc2UsIHRoZW4gYWRkIG1pc3Npbmcgb25lc1xuICAgICAgICAvLyByZXF1aXJlZCB0byBjbG9zZSBjZWxsc1xuICAgICAgICBpZiAoIWNlbGwucHJlcGFyZUhhbGZlZGdlcygpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgaWYgKCFjZWxsLmNsb3NlTWUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAvLyBmaW5kIGZpcnN0ICd1bmNsb3NlZCcgcG9pbnQuXG4gICAgICAgIC8vIGFuICd1bmNsb3NlZCcgcG9pbnQgd2lsbCBiZSB0aGUgZW5kIHBvaW50IG9mIGEgaGFsZmVkZ2Ugd2hpY2hcbiAgICAgICAgLy8gZG9lcyBub3QgbWF0Y2ggdGhlIHN0YXJ0IHBvaW50IG9mIHRoZSBmb2xsb3dpbmcgaGFsZmVkZ2VcbiAgICAgICAgaGFsZmVkZ2VzID0gY2VsbC5oYWxmZWRnZXM7XG4gICAgICAgIG5IYWxmZWRnZXMgPSBoYWxmZWRnZXMubGVuZ3RoO1xuICAgICAgICAvLyBzcGVjaWFsIGNhc2U6IG9ubHkgb25lIHNpdGUsIGluIHdoaWNoIGNhc2UsIHRoZSB2aWV3cG9ydCBpcyB0aGUgY2VsbFxuICAgICAgICAvLyAuLi5cblxuICAgICAgICAvLyBhbGwgb3RoZXIgY2FzZXNcbiAgICAgICAgaUxlZnQgPSAwO1xuICAgICAgICB3aGlsZSAoaUxlZnQgPCBuSGFsZmVkZ2VzKSB7XG4gICAgICAgICAgICB2YSA9IGhhbGZlZGdlc1tpTGVmdF0uZ2V0RW5kcG9pbnQoKTtcbiAgICAgICAgICAgIHZ6ID0gaGFsZmVkZ2VzWyhpTGVmdCsxKSAlIG5IYWxmZWRnZXNdLmdldFN0YXJ0cG9pbnQoKTtcbiAgICAgICAgICAgIC8vIGlmIGVuZCBwb2ludCBpcyBub3QgZXF1YWwgdG8gc3RhcnQgcG9pbnQsIHdlIG5lZWQgdG8gYWRkIHRoZSBtaXNzaW5nXG4gICAgICAgICAgICAvLyBoYWxmZWRnZShzKSB1cCB0byB2elxuICAgICAgICAgICAgaWYgKGFic19mbih2YS54LXZ6LngpPj0xZS05IHx8IGFic19mbih2YS55LXZ6LnkpPj0xZS05KSB7XG5cbiAgICAgICAgICAgICAgICAvLyByaGlsbCAyMDEzLTEyLTAyOlxuICAgICAgICAgICAgICAgIC8vIFwiSG9sZXNcIiBpbiB0aGUgaGFsZmVkZ2VzIGFyZSBub3QgbmVjZXNzYXJpbHkgYWx3YXlzIGFkamFjZW50LlxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb3JoaWxsL0phdmFzY3JpcHQtVm9yb25vaS9pc3N1ZXMvMTZcblxuICAgICAgICAgICAgICAgIC8vIGZpbmQgZW50cnkgcG9pbnQ6XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0cnVlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gd2FsayBkb3dud2FyZCBhbG9uZyBsZWZ0IHNpZGVcbiAgICAgICAgICAgICAgICAgICAgY2FzZSB0aGlzLmVxdWFsV2l0aEVwc2lsb24odmEueCx4bCkgJiYgdGhpcy5sZXNzVGhhbldpdGhFcHNpbG9uKHZhLnkseWIpOlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEJvcmRlclNlZ21lbnQgPSB0aGlzLmVxdWFsV2l0aEVwc2lsb24odnoueCx4bCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YiA9IHRoaXMuY3JlYXRlVmVydGV4KHhsLCBsYXN0Qm9yZGVyU2VnbWVudCA/IHZ6LnkgOiB5Yik7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGdlID0gdGhpcy5jcmVhdGVCb3JkZXJFZGdlKGNlbGwuc2l0ZSwgdmEsIHZiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlMZWZ0Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWxmZWRnZXMuc3BsaWNlKGlMZWZ0LCAwLCB0aGlzLmNyZWF0ZUhhbGZlZGdlKGVkZ2UsIGNlbGwuc2l0ZSwgbnVsbCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbkhhbGZlZGdlcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBsYXN0Qm9yZGVyU2VnbWVudCApIHsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhID0gdmI7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmYWxsIHRocm91Z2hcblxuICAgICAgICAgICAgICAgICAgICAvLyB3YWxrIHJpZ2h0d2FyZCBhbG9uZyBib3R0b20gc2lkZVxuICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuZXF1YWxXaXRoRXBzaWxvbih2YS55LHliKSAmJiB0aGlzLmxlc3NUaGFuV2l0aEVwc2lsb24odmEueCx4cik6XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Qm9yZGVyU2VnbWVudCA9IHRoaXMuZXF1YWxXaXRoRXBzaWxvbih2ei55LHliKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZiID0gdGhpcy5jcmVhdGVWZXJ0ZXgobGFzdEJvcmRlclNlZ21lbnQgPyB2ei54IDogeHIsIHliKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkZ2UgPSB0aGlzLmNyZWF0ZUJvcmRlckVkZ2UoY2VsbC5zaXRlLCB2YSwgdmIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaUxlZnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbGZlZGdlcy5zcGxpY2UoaUxlZnQsIDAsIHRoaXMuY3JlYXRlSGFsZmVkZ2UoZWRnZSwgY2VsbC5zaXRlLCBudWxsKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuSGFsZmVkZ2VzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGxhc3RCb3JkZXJTZWdtZW50ICkgeyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmEgPSB2YjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHdhbGsgdXB3YXJkIGFsb25nIHJpZ2h0IHNpZGVcbiAgICAgICAgICAgICAgICAgICAgY2FzZSB0aGlzLmVxdWFsV2l0aEVwc2lsb24odmEueCx4cikgJiYgdGhpcy5ncmVhdGVyVGhhbldpdGhFcHNpbG9uKHZhLnkseXQpOlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEJvcmRlclNlZ21lbnQgPSB0aGlzLmVxdWFsV2l0aEVwc2lsb24odnoueCx4cik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YiA9IHRoaXMuY3JlYXRlVmVydGV4KHhyLCBsYXN0Qm9yZGVyU2VnbWVudCA/IHZ6LnkgOiB5dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGdlID0gdGhpcy5jcmVhdGVCb3JkZXJFZGdlKGNlbGwuc2l0ZSwgdmEsIHZiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlMZWZ0Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWxmZWRnZXMuc3BsaWNlKGlMZWZ0LCAwLCB0aGlzLmNyZWF0ZUhhbGZlZGdlKGVkZ2UsIGNlbGwuc2l0ZSwgbnVsbCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbkhhbGZlZGdlcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBsYXN0Qm9yZGVyU2VnbWVudCApIHsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhID0gdmI7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmYWxsIHRocm91Z2hcblxuICAgICAgICAgICAgICAgICAgICAvLyB3YWxrIGxlZnR3YXJkIGFsb25nIHRvcCBzaWRlXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5lcXVhbFdpdGhFcHNpbG9uKHZhLnkseXQpICYmIHRoaXMuZ3JlYXRlclRoYW5XaXRoRXBzaWxvbih2YS54LHhsKTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RCb3JkZXJTZWdtZW50ID0gdGhpcy5lcXVhbFdpdGhFcHNpbG9uKHZ6LnkseXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmIgPSB0aGlzLmNyZWF0ZVZlcnRleChsYXN0Qm9yZGVyU2VnbWVudCA/IHZ6LnggOiB4bCwgeXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWRnZSA9IHRoaXMuY3JlYXRlQm9yZGVyRWRnZShjZWxsLnNpdGUsIHZhLCB2Yik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpTGVmdCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFsZmVkZ2VzLnNwbGljZShpTGVmdCwgMCwgdGhpcy5jcmVhdGVIYWxmZWRnZShlZGdlLCBjZWxsLnNpdGUsIG51bGwpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5IYWxmZWRnZXMrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbGFzdEJvcmRlclNlZ21lbnQgKSB7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YSA9IHZiO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdhbGsgZG93bndhcmQgYWxvbmcgbGVmdCBzaWRlXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Qm9yZGVyU2VnbWVudCA9IHRoaXMuZXF1YWxXaXRoRXBzaWxvbih2ei54LHhsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZiID0gdGhpcy5jcmVhdGVWZXJ0ZXgoeGwsIGxhc3RCb3JkZXJTZWdtZW50ID8gdnoueSA6IHliKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkZ2UgPSB0aGlzLmNyZWF0ZUJvcmRlckVkZ2UoY2VsbC5zaXRlLCB2YSwgdmIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaUxlZnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbGZlZGdlcy5zcGxpY2UoaUxlZnQsIDAsIHRoaXMuY3JlYXRlSGFsZmVkZ2UoZWRnZSwgY2VsbC5zaXRlLCBudWxsKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuSGFsZmVkZ2VzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGxhc3RCb3JkZXJTZWdtZW50ICkgeyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmEgPSB2YjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3YWxrIHJpZ2h0d2FyZCBhbG9uZyBib3R0b20gc2lkZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEJvcmRlclNlZ21lbnQgPSB0aGlzLmVxdWFsV2l0aEVwc2lsb24odnoueSx5Yik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YiA9IHRoaXMuY3JlYXRlVmVydGV4KGxhc3RCb3JkZXJTZWdtZW50ID8gdnoueCA6IHhyLCB5Yik7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGdlID0gdGhpcy5jcmVhdGVCb3JkZXJFZGdlKGNlbGwuc2l0ZSwgdmEsIHZiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlMZWZ0Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWxmZWRnZXMuc3BsaWNlKGlMZWZ0LCAwLCB0aGlzLmNyZWF0ZUhhbGZlZGdlKGVkZ2UsIGNlbGwuc2l0ZSwgbnVsbCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbkhhbGZlZGdlcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBsYXN0Qm9yZGVyU2VnbWVudCApIHsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhID0gdmI7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmYWxsIHRocm91Z2hcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2FsayB1cHdhcmQgYWxvbmcgcmlnaHQgc2lkZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEJvcmRlclNlZ21lbnQgPSB0aGlzLmVxdWFsV2l0aEVwc2lsb24odnoueCx4cik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YiA9IHRoaXMuY3JlYXRlVmVydGV4KHhyLCBsYXN0Qm9yZGVyU2VnbWVudCA/IHZ6LnkgOiB5dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGdlID0gdGhpcy5jcmVhdGVCb3JkZXJFZGdlKGNlbGwuc2l0ZSwgdmEsIHZiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlMZWZ0Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWxmZWRnZXMuc3BsaWNlKGlMZWZ0LCAwLCB0aGlzLmNyZWF0ZUhhbGZlZGdlKGVkZ2UsIGNlbGwuc2l0ZSwgbnVsbCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbkhhbGZlZGdlcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBsYXN0Qm9yZGVyU2VnbWVudCApIHsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaFxuXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIlZvcm9ub2kuY2xvc2VDZWxscygpID4gdGhpcyBtYWtlcyBubyBzZW5zZSFcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlMZWZ0Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNlbGwuY2xvc2VNZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWJ1Z2dpbmcgaGVscGVyXG4vKlxuVm9yb25vaS5wcm90b3R5cGUuZHVtcEJlYWNobGluZSA9IGZ1bmN0aW9uKHkpIHtcbiAgICBjb25zb2xlLmxvZygnVm9yb25vaS5kdW1wQmVhY2hsaW5lKCVmKSA+IEJlYWNoc2VjdGlvbnMsIGZyb20gbGVmdCB0byByaWdodDonLCB5KTtcbiAgICBpZiAoICF0aGlzLmJlYWNobGluZSApIHtcbiAgICAgICAgY29uc29sZS5sb2coJyAgTm9uZScpO1xuICAgICAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBicyA9IHRoaXMuYmVhY2hsaW5lLmdldEZpcnN0KHRoaXMuYmVhY2hsaW5lLnJvb3QpO1xuICAgICAgICB3aGlsZSAoIGJzICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJyAgc2l0ZSAlZDogeGw6ICVmLCB4cjogJWYnLCBicy5zaXRlLnZvcm9ub2lJZCwgdGhpcy5sZWZ0QnJlYWtQb2ludChicywgeSksIHRoaXMucmlnaHRCcmVha1BvaW50KGJzLCB5KSk7XG4gICAgICAgICAgICBicyA9IGJzLnJiTmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4qL1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEhlbHBlcjogUXVhbnRpemUgc2l0ZXNcblxuLy8gcmhpbGwgMjAxMy0xMC0xMjpcbi8vIFRoaXMgaXMgdG8gc29sdmUgaHR0cHM6Ly9naXRodWIuY29tL2dvcmhpbGwvSmF2YXNjcmlwdC1Wb3Jvbm9pL2lzc3Vlcy8xNVxuLy8gU2luY2Ugbm90IGFsbCB1c2VycyB3aWxsIGVuZCB1cCB1c2luZyB0aGUga2luZCBvZiBjb29yZCB2YWx1ZXMgd2hpY2ggd291bGRcbi8vIGNhdXNlIHRoZSBpc3N1ZSB0byBhcmlzZSwgSSBjaG9zZSB0byBsZXQgdGhlIHVzZXIgZGVjaWRlIHdoZXRoZXIgb3Igbm90XG4vLyBoZSBzaG91bGQgc2FuaXRpemUgaGlzIGNvb3JkIHZhbHVlcyB0aHJvdWdoIHRoaXMgaGVscGVyLiBUaGlzIHdheSwgZm9yXG4vLyB0aG9zZSB1c2VycyB3aG8gdXNlcyBjb29yZCB2YWx1ZXMgd2hpY2ggYXJlIGtub3duIHRvIGJlIGZpbmUsIG5vIG92ZXJoZWFkIGlzXG4vLyBhZGRlZC5cblxuVm9yb25vaS5wcm90b3R5cGUucXVhbnRpemVTaXRlcyA9IGZ1bmN0aW9uKHNpdGVzKSB7XG4gICAgdmFyIM61ID0gdGhpcy7OtSxcbiAgICAgICAgbiA9IHNpdGVzLmxlbmd0aCxcbiAgICAgICAgc2l0ZTtcbiAgICB3aGlsZSAoIG4tLSApIHtcbiAgICAgICAgc2l0ZSA9IHNpdGVzW25dO1xuICAgICAgICBzaXRlLnggPSBNYXRoLmZsb29yKHNpdGUueCAvIM61KSAqIM61O1xuICAgICAgICBzaXRlLnkgPSBNYXRoLmZsb29yKHNpdGUueSAvIM61KSAqIM61O1xuICAgICAgICB9XG4gICAgfTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBIZWxwZXI6IFJlY3ljbGUgZGlhZ3JhbTogYWxsIHZlcnRleCwgZWRnZSBhbmQgY2VsbCBvYmplY3RzIGFyZVxuLy8gXCJzdXJyZW5kZXJlZFwiIHRvIHRoZSBWb3Jvbm9pIG9iamVjdCBmb3IgcmV1c2UuXG4vLyBUT0RPOiByaGlsbC12b3Jvbm9pLWNvcmUgdjI6IG1vcmUgcGVyZm9ybWFuY2UgdG8gYmUgZ2FpbmVkXG4vLyB3aGVuIEkgY2hhbmdlIHRoZSBzZW1hbnRpYyBvZiB3aGF0IGlzIHJldHVybmVkLlxuXG5Wb3Jvbm9pLnByb3RvdHlwZS5yZWN5Y2xlID0gZnVuY3Rpb24oZGlhZ3JhbSkge1xuICAgIGlmICggZGlhZ3JhbSApIHtcbiAgICAgICAgaWYgKCBkaWFncmFtIGluc3RhbmNlb2YgdGhpcy5EaWFncmFtICkge1xuICAgICAgICAgICAgdGhpcy50b1JlY3ljbGUgPSBkaWFncmFtO1xuICAgICAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93ICdWb3Jvbm9pLnJlY3ljbGVEaWFncmFtKCkgPiBOZWVkIGEgRGlhZ3JhbSBvYmplY3QuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVG9wLWxldmVsIEZvcnR1bmUgbG9vcFxuXG4vLyByaGlsbCAyMDExLTA1LTE5OlxuLy8gICBWb3Jvbm9pIHNpdGVzIGFyZSBrZXB0IGNsaWVudC1zaWRlIG5vdywgdG8gYWxsb3dcbi8vICAgdXNlciB0byBmcmVlbHkgbW9kaWZ5IGNvbnRlbnQuIEF0IGNvbXB1dGUgdGltZSxcbi8vICAgKnJlZmVyZW5jZXMqIHRvIHNpdGVzIGFyZSBjb3BpZWQgbG9jYWxseS5cblxuVm9yb25vaS5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKHNpdGVzLCBiYm94KSB7XG4gICAgLy8gdG8gbWVhc3VyZSBleGVjdXRpb24gdGltZVxuICAgIHZhciBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgLy8gaW5pdCBpbnRlcm5hbCBzdGF0ZVxuICAgIHRoaXMucmVzZXQoKTtcblxuICAgIC8vIGFueSBkaWFncmFtIGRhdGEgYXZhaWxhYmxlIGZvciByZWN5Y2xpbmc/XG4gICAgLy8gSSBkbyB0aGF0IGhlcmUgc28gdGhhdCB0aGlzIGlzIGluY2x1ZGVkIGluIGV4ZWN1dGlvbiB0aW1lXG4gICAgaWYgKCB0aGlzLnRvUmVjeWNsZSApIHtcbiAgICAgICAgdGhpcy52ZXJ0ZXhKdW5reWFyZCA9IHRoaXMudmVydGV4SnVua3lhcmQuY29uY2F0KHRoaXMudG9SZWN5Y2xlLnZlcnRpY2VzKTtcbiAgICAgICAgdGhpcy5lZGdlSnVua3lhcmQgPSB0aGlzLmVkZ2VKdW5reWFyZC5jb25jYXQodGhpcy50b1JlY3ljbGUuZWRnZXMpO1xuICAgICAgICB0aGlzLmNlbGxKdW5reWFyZCA9IHRoaXMuY2VsbEp1bmt5YXJkLmNvbmNhdCh0aGlzLnRvUmVjeWNsZS5jZWxscyk7XG4gICAgICAgIHRoaXMudG9SZWN5Y2xlID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZSBzaXRlIGV2ZW50IHF1ZXVlXG4gICAgdmFyIHNpdGVFdmVudHMgPSBzaXRlcy5zbGljZSgwKTtcbiAgICBzaXRlRXZlbnRzLnNvcnQoZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgdmFyIHIgPSBiLnkgLSBhLnk7XG4gICAgICAgIGlmIChyKSB7cmV0dXJuIHI7fVxuICAgICAgICByZXR1cm4gYi54IC0gYS54O1xuICAgICAgICB9KTtcblxuICAgIC8vIHByb2Nlc3MgcXVldWVcbiAgICB2YXIgc2l0ZSA9IHNpdGVFdmVudHMucG9wKCksXG4gICAgICAgIHNpdGVpZCA9IDAsXG4gICAgICAgIHhzaXRleCwgLy8gdG8gYXZvaWQgZHVwbGljYXRlIHNpdGVzXG4gICAgICAgIHhzaXRleSxcbiAgICAgICAgY2VsbHMgPSB0aGlzLmNlbGxzLFxuICAgICAgICBjaXJjbGU7XG5cbiAgICAvLyBtYWluIGxvb3BcbiAgICBmb3IgKDs7KSB7XG4gICAgICAgIC8vIHdlIG5lZWQgdG8gZmlndXJlIHdoZXRoZXIgd2UgaGFuZGxlIGEgc2l0ZSBvciBjaXJjbGUgZXZlbnRcbiAgICAgICAgLy8gZm9yIHRoaXMgd2UgZmluZCBvdXQgaWYgdGhlcmUgaXMgYSBzaXRlIGV2ZW50IGFuZCBpdCBpc1xuICAgICAgICAvLyAnZWFybGllcicgdGhhbiB0aGUgY2lyY2xlIGV2ZW50XG4gICAgICAgIGNpcmNsZSA9IHRoaXMuZmlyc3RDaXJjbGVFdmVudDtcblxuICAgICAgICAvLyBhZGQgYmVhY2ggc2VjdGlvblxuICAgICAgICBpZiAoc2l0ZSAmJiAoIWNpcmNsZSB8fCBzaXRlLnkgPCBjaXJjbGUueSB8fCAoc2l0ZS55ID09PSBjaXJjbGUueSAmJiBzaXRlLnggPCBjaXJjbGUueCkpKSB7XG4gICAgICAgICAgICAvLyBvbmx5IGlmIHNpdGUgaXMgbm90IGEgZHVwbGljYXRlXG4gICAgICAgICAgICBpZiAoc2l0ZS54ICE9PSB4c2l0ZXggfHwgc2l0ZS55ICE9PSB4c2l0ZXkpIHtcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBjcmVhdGUgY2VsbCBmb3IgbmV3IHNpdGVcbiAgICAgICAgICAgICAgICBjZWxsc1tzaXRlaWRdID0gdGhpcy5jcmVhdGVDZWxsKHNpdGUpO1xuICAgICAgICAgICAgICAgIHNpdGUudm9yb25vaUlkID0gc2l0ZWlkKys7XG4gICAgICAgICAgICAgICAgLy8gdGhlbiBjcmVhdGUgYSBiZWFjaHNlY3Rpb24gZm9yIHRoYXQgc2l0ZVxuICAgICAgICAgICAgICAgIHRoaXMuYWRkQmVhY2hzZWN0aW9uKHNpdGUpO1xuICAgICAgICAgICAgICAgIC8vIHJlbWVtYmVyIGxhc3Qgc2l0ZSBjb29yZHMgdG8gZGV0ZWN0IGR1cGxpY2F0ZVxuICAgICAgICAgICAgICAgIHhzaXRleSA9IHNpdGUueTtcbiAgICAgICAgICAgICAgICB4c2l0ZXggPSBzaXRlLng7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2l0ZSA9IHNpdGVFdmVudHMucG9wKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVtb3ZlIGJlYWNoIHNlY3Rpb25cbiAgICAgICAgZWxzZSBpZiAoY2lyY2xlKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUJlYWNoc2VjdGlvbihjaXJjbGUuYXJjKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAvLyBhbGwgZG9uZSwgcXVpdFxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAvLyB3cmFwcGluZy11cDpcbiAgICAvLyAgIGNvbm5lY3QgZGFuZ2xpbmcgZWRnZXMgdG8gYm91bmRpbmcgYm94XG4gICAgLy8gICBjdXQgZWRnZXMgYXMgcGVyIGJvdW5kaW5nIGJveFxuICAgIC8vICAgZGlzY2FyZCBlZGdlcyBjb21wbGV0ZWx5IG91dHNpZGUgYm91bmRpbmcgYm94XG4gICAgLy8gICBkaXNjYXJkIGVkZ2VzIHdoaWNoIGFyZSBwb2ludC1saWtlXG4gICAgdGhpcy5jbGlwRWRnZXMoYmJveCk7XG5cbiAgICAvLyAgIGFkZCBtaXNzaW5nIGVkZ2VzIGluIG9yZGVyIHRvIGNsb3NlIG9wZW5lZCBjZWxsc1xuICAgIHRoaXMuY2xvc2VDZWxscyhiYm94KTtcblxuICAgIC8vIHRvIG1lYXN1cmUgZXhlY3V0aW9uIHRpbWVcbiAgICB2YXIgc3RvcFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgLy8gcHJlcGFyZSByZXR1cm4gdmFsdWVzXG4gICAgdmFyIGRpYWdyYW0gPSBuZXcgdGhpcy5EaWFncmFtKCk7XG4gICAgZGlhZ3JhbS5jZWxscyA9IHRoaXMuY2VsbHM7XG4gICAgZGlhZ3JhbS5lZGdlcyA9IHRoaXMuZWRnZXM7XG4gICAgZGlhZ3JhbS52ZXJ0aWNlcyA9IHRoaXMudmVydGljZXM7XG4gICAgZGlhZ3JhbS5leGVjVGltZSA9IHN0b3BUaW1lLmdldFRpbWUoKS1zdGFydFRpbWUuZ2V0VGltZSgpO1xuXG4gICAgLy8gY2xlYW4gdXBcbiAgICB0aGlzLnJlc2V0KCk7XG5cbiAgICByZXR1cm4gZGlhZ3JhbTtcbiAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZvcm9ub2k7XG4iXX0=
