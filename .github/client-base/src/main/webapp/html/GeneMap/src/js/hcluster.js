//This function comes from the clusterfck library
//https://github.com/harthur/clusterfck

//Copyright (c) 2011 Heather Arthur <fayearthur@gmail.com>
//
//Permission is hereby granted, free of charge, to any person obtaining
//a copy of this software and associated documentation files (the
//"Software"), to deal in the Software without restriction, including
//without limitation the rights to use, copy, modify, merge, publish,
//  distribute, sublicense, and/or sell copies of the Software, and to
//permit persons to whom the Software is furnished to do so, subject to
//the following conditions:
//
//  The above copyright notice and this permission notice shall be
//included in all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
//LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
//OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
//WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function(exports) {
  var HierarchicalClustering = function (distance, linkage, threshold) {
    this.distance = distance;
    this.linkage = linkage;
    this.threshold = threshold == undefined ? Infinity : threshold;
  }

  HierarchicalClustering.prototype = {
    cluster: function (items, snapshotPeriod, snapshotCb) {
      this.clusters = [];
      this.dists = [];  // distances between each pair of clusters
      this.mins = []; // closest cluster for each cluster
      this.index = []; // keep a hash of all clusters by key

      for (var i = 0; i < items.length; i++) {
        var cluster = {
          value: items[i],
          key: i,
          index: i,
          size: 1
        };
        this.clusters[i] = cluster;
        this.index[i] = cluster;
        this.dists[i] = [];
        this.mins[i] = 0;
      }

      for (var i = 0; i < this.clusters.length; i++) {
        for (var j = 0; j <= i; j++) {
          var dist = (i == j) ? Infinity :
            this.distance(this.clusters[i].value, this.clusters[j].value);
          this.dists[i][j] = dist;
          this.dists[j][i] = dist;

          if (dist < this.dists[i][this.mins[i]]) {
            this.mins[i] = j;
          }
        }
      }

      var merged = this.mergeClosest();
      var i = 0;
      while (merged) {
        if (snapshotCb && (i++ % snapshotPeriod) == 0) {
          snapshotCb(this.clusters);
        }
        merged = this.mergeClosest();
      }

      this.clusters.forEach(function (cluster) {
        // clean up metadata used for clustering
        delete cluster.key;
        delete cluster.index;
      });

      return this.clusters;
    },

    mergeClosest: function () {
      // find two closest clusters from cached mins
      var minKey = 0, min = Infinity;
      for (var i = 0; i < this.clusters.length; i++) {
        var key = this.clusters[i].key,
          dist = this.dists[key][this.mins[key]];
        if (dist < min) {
          minKey = key;
          min = dist;
        }
      }
      if (min >= this.threshold) {
        return false;
      }

      var c1 = this.index[minKey],
        c2 = this.index[this.mins[minKey]];

      // merge two closest clusters
      var merged = {
        left: c1,
        right: c2,
        key: c1.key,
        size: c1.size + c2.size
      };

      this.clusters[c1.index] = merged;
      this.clusters.splice(c2.index, 1);
      this.index[c1.key] = merged;

      // update distances with new merged cluster
      for (var i = 0; i < this.clusters.length; i++) {
        var ci = this.clusters[i];
        var dist;
        if (c1.key == ci.key) {
          dist = Infinity;
        }
        else if (this.linkage == "single") {
          dist = this.dists[c1.key][ci.key];
          if (this.dists[c1.key][ci.key] > this.dists[c2.key][ci.key]) {
            dist = this.dists[c2.key][ci.key];
          }
        }
        else if (this.linkage == "complete") {
          dist = this.dists[c1.key][ci.key];
          if (this.dists[c1.key][ci.key] < this.dists[c2.key][ci.key]) {
            dist = this.dists[c2.key][ci.key];
          }
        }
        else if (this.linkage == "average") {
          dist = (this.dists[c1.key][ci.key] * c1.size
            + this.dists[c2.key][ci.key] * c2.size) / (c1.size + c2.size);
        }
        else {
          dist = this.distance(ci.value, c1.value);
        }

        this.dists[c1.key][ci.key] = this.dists[ci.key][c1.key] = dist;
      }


      // update cached mins
      for (var i = 0; i < this.clusters.length; i++) {
        var key1 = this.clusters[i].key;
        if (this.mins[key1] == c1.key || this.mins[key1] == c2.key) {
          var min = key1;
          for (var j = 0; j < this.clusters.length; j++) {
            var key2 = this.clusters[j].key;
            if (this.dists[key1][key2] < this.dists[key1][min]) {
              min = key2;
            }
          }
          this.mins[key1] = min;
        }
        this.clusters[i].index = i;
      }

      // clean up metadata used for clustering
      delete c1.key;
      delete c2.key;
      delete c1.index;
      delete c2.index;

      return true;
    }
  }

  var hcluster = function (items, distance, linkage, threshold, snapshot, snapshotCallback) {
    linkage = linkage || "average";

    var clusters = (new HierarchicalClustering(distance, linkage, threshold))
      .cluster(items, snapshot, snapshotCallback);

    if (threshold === undefined) {
      return clusters[0]; // all clustered into one
    }
    return clusters;
  }

  exports.hcluster = hcluster;
})(this.hcluster = {});
