/**
 * This file is part of foograph Javascript graph library.
 *
 * Description: Kamada-Kawai spring layout manager
 */

/**
 * Class constructor.
 *
 * @param width Layout width
 * @param height Layout height
 */
function KamadaKawaiVertexLayout(width, height)
{
  this.width = width;
  this.height = height;
  this.spring_constant = 1;
  this.tolerance = 0.001;
  this.callback = function() {}
}

/**
 * Calculates the shortest paths from vertex to any other
 * connected vertex
 *  
 * @param graph A valid graph instance
 * @param vertex A valid vertex instance
 */
KamadaKawaiVertexLayout.prototype.__djikstraFindShortestPaths = function(vertex)
{
  //TODO: implement queue as binary queue
  function sortVertex(v1, v2)
  {
    return v2.weight - v1.weight;
  }
  
  //reset all node weights to -1
  for (var i1 in this.graph.vertices) {
    this.graph.vertices[i1].weight = -1;   
  }
  
  vertex.weight = 0;
  
  var queue = new Array();
  queue.push(vertex);
  while (queue.length > 0) {
    var a = queue.pop();
    
    for (var i2 in a.edges) {
      e = a.edges[i2];
      
      var b = e.endVertex;
      var w = a.weight + e.weight;
      if (b.weight == -1) {        
        b.weight = w;
        queue.push(b);
      } else if (b.weight > w) {
        b.weight = w;
      }
    }
    
    for (var i5 in a.reverseEdges) {
      e = a.reverseEdges[i5];
      
      var b = e.endVertex;
      var w = a.weight + e.weight;
      if (b.weight == -1) {        
        b.weight = w;
        queue.push(b);
      } else if (b.weight > w) {
        b.weight = w;
      }
    }
    queue.sort(sortVertex); 
  }
  
  result = new Array();
  for (i3 in this.graph.vertices) {
    var v = this.graph.vertices[i3]
    //Workaround to plot multiple component graphs
    if (v.weight == -1)
      v.weight = 10;
    result[i3] = v.weight;
  }
  return result;
}

/**
 * Calculate the length of the edge so graph fits 
 * into the drawing area
 *  
 * @param side graph area side length
 */
KamadaKawaiVertexLayout.prototype.__computeEdgeLength = function(side)
{
  //edge length is side length divided by largest distance in graph
  var result = 0;
  for (var i1 in this.distance)
    for (var i2 in this.distance[i1])
      if (this.distance[i1][i2] > result)
        result = this.distance[i1][i2];
  
  //return side / result;
  return 100;

}

/**
 * compute contribution of vertex i to the first partial derivates
 * (dE/dx_m, de/dy_m) (for vertex m)
 *
 * @param m Vertex index
 * @param i Vertex index 
 */
KamadaKawaiVertexLayout.prototype.__computePartialDerivate = function(m, i)
{
  var result = new function(){};;
  result.first = 0;
  result.second = 0;
  
  var v1 = this.graph.vertices[m];
  var v2 = this.graph.vertices[i];  
  if (v1 != v2) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    result.first = this.spring_strength[m][i]* (dx - this.distance[m][i]*dx/dist);
    result.second = this.spring_strength[m][i]* (dy - this.distance[m][i]*dy/dist);
  }
  
  return result;  
}

/**
 * Compute partial derivatives dE/dx_m and dE/dy_m
 *
 * @param m Vertex index
 */
KamadaKawaiVertexLayout.prototype.__computePartialDerivates = function(m)
{
  var result = new function(){};
  result.first = 0;
  result.second = 0;
  
  for (var i1 in this.graph.vertices) {
    var deriv = this.__computePartialDerivate(m, i1);
    result.first += deriv.first;
    result.second += deriv.second;
  }
  return result;
}

/**
 * Determines when to terminate the layout of the graph
 *
 * @param delta_p
 * @param p Vertex index 
 * @param global 
 */
KamadaKawaiVertexLayout.prototype.__done = function(delta_p, p, global)
{
  if (global) {
    if (this.last_energy == Number.MAX_VALUE) {
      this.last_energy = delta_p;
      return false;
    }
        
    //repeat until delta is 0 or energy change falls bellow tolerance    
    var diff = this.last_energy - delta_p;
    if (diff < 0)
      diff = -diff;
    var done = (delta_p == 0) || (diff/this.last_energy < this.tolerance);
    this.last_energy = delta_p;
    
    return done;
  } else {
    if (this.last_local_energy == Number.MAX_VALUE) {
      this.last_local_energy = delta_p;

      return delta_p == 0;
    }
    
   //repeat until delta is 0 or energy change falls bellow tolerance    
    var diff = this.last_local_energy - delta_p;    
    var done = (delta_p == 0) || (diff/this.last_local_energy < this.tolerance);
    this.last_local_energy = delta_p;

    return done;
  }
}



/**
 * Calculates the coordinates based on Kamada-Kawai spring
 * layout algorithm.
 *
 * @param graph A valid graph instance
 */
KamadaKawaiVertexLayout.prototype.layout = function(graph)
{
  this.graph = graph;
  this.spring_strength = new Array();
  this.distance = new Array();
  this.last_energy = Number.MAX_VALUE;
  this.last_local_energy = Number.MAX_VALUE;
  
  /*
  var master = new Vertex("master", -1, -1);
  this.graph.insertVertex(master)
  
  for (var i1 in graph.vertices)
    if (graph.vertices[i1] != master)
      this.graph.insertEdge("", 1, master, graph.vertices[i1]);
  */
  
  
  randomLayout = new RandomVertexLayout(this.width, this.height);
  randomLayout.layout(graph);
    
  //http://www.boost.org/doc/libs/1_38_0/boost/graph/kamada_kawai_spring_layout.hpp
  //Create distance matrix
  //Johnson's algorithm to find shortest paths between all vertices should be implemented
  //http://en.wikipedia.org/wiki/Johnson's_algorithm
  for (var i4 in graph.vertices) {
    var v = graph.vertices[i4];
    this.distance[i4] = this.__djikstraFindShortestPaths(v);
  }
  
  var edge_length = this.__computeEdgeLength(width);

  var K = this.spring_constant;
  
  //Calculate optimal distances and spring strenghts
  for (var i1 in graph.vertices) {
    this.spring_strength[i1] = new Array();
    for (var i2 in graph.vertices) {
      var dij = this.distance[i1][i2];
      this.distance[i1][i2] = edge_length * dij;
      this.spring_strength[i1][i2] = K/(dij*dij)
    }
  } 
  
  var delta_p = 0;
  var p = 0;
  var partial_derivates = new Array();
  //Compute partial derivates and find max
  for (var i3 in this.graph.vertices) {
    var deriv = this.__computePartialDerivates(i3);
    partial_derivates[i3] = deriv;
    
    delta = Math.sqrt(deriv.first*deriv.first + deriv.second*deriv.second);
    if (delta > delta_p) {
      p = i3;
      delta_p = delta;
    }    
  }
  while (!this.__done(delta_p, p, true)) {
    // The contribution p makes to the partial derivatives of
    // each vertex. Computing this (at O(n) cost) allows us to
    // update the delta_i values in O(n) time instead of O(n^2)
    // time.    
    var p_partials = new Array();
    for (i4 in graph.vertices) {
      p_partials[i4] = this.__computePartialDerivate(i4, p);
    }
    
    this.last_local_energy = Number.MAX_VALUE;
    do {
      //Compute Jacobian
      var dE_dx_dx = 0, dE_dx_dy = 0, dE_dy_dx = 0, dE_dy_dy = 0;
      for (i5 in graph.vertices) {
        if (i5 != p) {
          var dx = graph.vertices[p].x - graph.vertices[i5].x;
          var dy = graph.vertices[p].y - graph.vertices[i5].y;
          var dist = Math.sqrt(dx*dx+dy*dy);
          var dist_cubed = dist*dist*dist;
          var k_mi = this.spring_strength[p][i5];
          var l_mi = this.distance[p][i5];
          dE_dx_dx += k_mi * (1 - (l_mi * dy * dy) / dist_cubed);
          dE_dx_dy += k_mi * l_mi * dy * dx / dist_cubed;
          dE_dy_dx += k_mi * l_mi * dy * dx / dist_cubed;
          dE_dy_dy += k_mi * (1 - (l_mi * dx * dx) / dist_cubed);          
        }
      }
    
      //Calculate dx and dy
      var dE_dx = partial_derivates[p].first;
      var dE_dy = partial_derivates[p].second;
      
      var dx = (dE_dx_dy * dE_dy - dE_dy_dy * dE_dx)
                / (dE_dx_dx * dE_dy_dy - dE_dx_dy * dE_dy_dx);
      var dy = (dE_dx_dx * dE_dy - dE_dy_dx * dE_dx)
                / (dE_dy_dx * dE_dx_dy - dE_dx_dx * dE_dy_dy);

      //Move vertex
      graph.vertices[p].x += dx;
      graph.vertices[p].y += dy;
      
      //Recompute partial derivates and delta_p
      deriv = this.__computePartialDerivates(p);
      partial_derivates[p] = deriv;
      delta_p = Math.sqrt(deriv.first*deriv.first + deriv.second*deriv.second);  
    } while(!this.__done(delta_p, p, false));
    
    //Update partial derivates and select new p
    var old_p = p;
    for (var i6 in graph.vertices) {
      var old_deriv_p = p_partials[i6];
      var old_p_partial = this.__computePartialDerivate(i6, old_p);
      var deriv = partial_derivates[i6];
      
      deriv.first += old_p_partial.first - old_deriv_p.first;
      deriv.second += old_p_partial.second - old_deriv_p.second;
      
      partial_derivates[i6] = deriv;
      delta = Math.sqrt(deriv.first*deriv.first + deriv.second*deriv.second);
      if (delta > delta_p) {
        p = i6;
        delta_p = delta;
      }
    }
    
    this.callback();
  }
  //this.graph.removeVertex(master);
  
  //Move and resize graph to fit into the drawing area;
  graph.normalize(this.width, this.height);
  
  return true;
}