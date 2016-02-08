var GENEMAP = GENEMAP || {};

GENEMAP.Annotations = function(userConfig) {
    var defaultConfig = {
      width: 400,
      height: 400, // only used if no scale is provided
      yScale: null,
      labelHeight: 20,
      border: false,
      longestChromosome: 1000,
      triangleSize: 10
    };

    var config = _.merge({}, defaultConfig, userConfig);

    // adds the gene annotations to the annotations group within it, uses the data
    // bound to the annotationsGroup to generate the annotation elements
    var setupGeneAnnotations = function(annotationsGroup, y){
      var halfWidth = config.width / 2.0;

      var chromosome = annotationsGroup.data()[0];
      // Enter + Update elements
      var geneAnnotations = annotationsGroup.selectAll("g.gene_annotation").data(chromosome.annotations.genes);

      var geneAnnotationsEnterGroup = geneAnnotations.enter().append("g").classed("gene_annotation", true);

      geneAnnotationsEnterGroup.append("line").classed("midpoint-line", true);
      geneAnnotationsEnterGroup.append("polygon");
      geneAnnotationsEnterGroup.append("text");

      geneAnnotations.selectAll("line.midpoint-line").attr({
        x1: 0,
        y1: function(d) { return y(d.midpoint);},
        y2: function(d) { return y(d.midpoint);},
        x2: halfWidth
      });

      // generate a little triange based on the data
      var pointsFn = function(d) {
        var points = []
        var midpoint = d.start + (d.end - d.start) / 2;
        var a = config.triangleSize;

        // start at the top right and move down to the bottom left
        points.push([halfWidth, y(midpoint) - a/2]);
        points.push([halfWidth, y(midpoint) + a/2]);

        // add the final point at 1/2 height to make an equelateral triangle
        var h = Math.sqrt( Math.pow(a, 2) - Math.pow((a/2), 2));
        points.push([halfWidth - h, y(midpoint)])
        return points.join(" ");
      }

      geneAnnotations.selectAll("polygon").attr({
        points: pointsFn
      });

      geneAnnotations.selectAll("text").attr({
        x: halfWidth ,
        y: function(d) { return y(d.start) - 5; }
      }).style({
        'font-size': config.labelHeight
      }).text( function(d) {
          return d.label;
      });

    };

    var setupQTLAnnotations = function(annotationsGroup, y) {

      var hozPosition = config.width;
      var chromosome = annotationsGroup.data()[0];

      // Enter + Update elements
      var qtlAnnotations = annotationsGroup.selectAll("g.qtl_annotation").data(chromosome.annotations.qtls);

      // setup the new annotations
      var qtlAnnotationsEnterGroup = qtlAnnotations.enter().append("g").classed("qtl_annotation", true);
      qtlAnnotationsEnterGroup.append("line").classed("top-line", true);
      qtlAnnotationsEnterGroup.append("line").classed("bottom-line", true);
      qtlAnnotationsEnterGroup.append("rect").classed("qtl-selector", true);
      qtlAnnotationsEnterGroup.append("text");

      // update
      qtlAnnotations.selectAll("line.top-line").attr({
        x1: 0,
        y1: function(d) { return y(d.start);},
        y2: function(d) { return y(d.start);},
        x2: hozPosition
      });

      qtlAnnotations.selectAll("line.bottom-line").attr({
        x1: 0,
        y1: function(d) { return y(d.end);},
        y2: function(d) { return y(d.end);},
        x2: hozPosition
      });

      qtlAnnotations.selectAll("rect.qtl-selector").attr({
        x: hozPosition - 10,
        y: function(d) { return y(d.start);},
        width: 10,
        height: function(d) { return y(d.end) - y(d.start);},
      }).style({
        fill: function(d) { return d.color; }
      });

      qtlAnnotations.selectAll("text").attr({
        x: hozPosition ,
        y: function(d) { return y(d.midpoint) - 5; }
      })
      .style('font-size', config.labelHeight)
      .text( function(d) {
          return d.label;
      });
    };

    // draw a border around the annotation target element
    var drawBorder = function(target) {
      // create the border element if it doesn't exist
      if (d3.select(target).select("rect.border").empty()){
        d3.select(target).append("rect").classed("border", true);
      }

      d3.select(target).select("rect.border")
        .attr({
          x:0,
          y:0,
          width: config.width,
          height: config.height + config.labelHeight
        });
    };

    var buildYScale = function(d) {
      return d3.scale.linear().range([0, d.height]).domain([0, d.longestChromosome]);
    }

    // An SVG representation of a chromosome with banding data. This won't create an SVG
    // element, it expects that to already have been created.
    function my(selection) {

      selection.enter().append("g").attr('class', 'annotations');

      selection.each(function(d, i){
        var target = this;
        var targetSelection = d3.select(target);

        var y = buildYScale(d);
        var height = y(d.length);

        targetSelection.attr({
          id: function(d) { return 'annotation_' + d.number},
          transform: function(d){
            return "translate(" + (d.x + d.width) + ","+ d.y +")";
          }
        })

        setupGeneAnnotations(targetSelection, y);

        setupQTLAnnotations(targetSelection, y);

        if (config.border) {
          drawBorder(this);
        }

      });
    }

    my.width = function(value) {
      if (!arguments.length) return config.width;
      config.width = value;
      return my;
    }

    my.height = function(value) {
      if (!arguments.length) return config.height;
      config.height = value;
      return my;
    }

    my.yScale = function(value) {
      if (!arguments.length) return config.yScale;
      config.yScale = value;
      return my;
    }

    return my;
};
