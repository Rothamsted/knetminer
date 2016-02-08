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

    /// returns the color property of the data formatted as an HTML color (#ffffff)
    var getColor = function(d) {
      // transform 0xffffff into #ffffff
      // if any letters are missing i.e. #ffff append 0s at the start => #00ffff
      return "#" +
              "0".repeat(8 - d.color.length) +
              d.color.substring(2, d.color.length);
    };

    // adds the gene annotations to the annotations group within it, uses the data
    // bound to the annotationsGroup to generate the annotation elements
    var setupGeneAnnotations = function(annotationsGroup, y){
      var halfWidth = config.width / 2.0;

      var geneData = annotationsGroup.data()[0].filter(function(e){ return e.type === 'gene'; })
      // Enter + Update elements
      var geneAnnotations = annotationsGroup.selectAll("g.gene_annotation").data(geneData);

      var geneAnnotationsEnterGroup = geneAnnotations.enter().append("g").classed("gene_annotation", true);

      geneAnnotationsEnterGroup.append("line").classed("midpoint-line", true);
      geneAnnotationsEnterGroup.append("polygon");
      geneAnnotationsEnterGroup.append("text");

      geneAnnotations.selectAll("line.midpoint-line").attr({
        x1: 0,
        y1: function(d) { return y(d.midpoint);},
        y2: function(d) { return y(d.midpoint);},
        x2: halfWidth
      }).style({
        stroke: '#000',
        'stroke-width':1,
        'vector-effect': 'non-scaling-stroke'
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
      }).style({
        fill: "red",
        stroke: "black",
        'stroke-width': 0.5
      });

      geneAnnotations.selectAll("text").attr({
        x: halfWidth ,
        y: function(d) { return y(d.start) - 5; },
        'font-family': 'sans-serif',
        'font-size': config.labelHeight ,
        'text-anchor': 'middle'
      }).text( function(d) {
          return d.label;
      });

    };

    var setupQTLAnnotations = function(annotationsGroup, y) {

        var hozPosition = config.width;
        var qtlData = annotationsGroup.data()[0].filter(function(e){ return e.type === 'QTL'; })

        var qtlAnnotations = annotationsGroup.selectAll("g.qtl_annotation").data(qtlData);

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
        }).style({
          stroke: '#000',
          'stroke-width':1,
          'vector-effect': 'non-scaling-stroke'
        });

        qtlAnnotations.selectAll("line.bottom-line").attr({
          x1: 0,
          y1: function(d) { return y(d.end);},
          y2: function(d) { return y(d.end);},
          x2: hozPosition
        }).style({
          stroke: '#000',
          'stroke-width':1,
          'vector-effect': 'non-scaling-stroke'
        });

        qtlAnnotations.selectAll("rect.qtl-selector").attr({
          x: hozPosition - 10,
          y: function(d) { return y(d.start);},
          width: 10,
          height: function(d) { return y(d.end) - y(d.start);},
        }).style({
          fill: getColor,
          stroke: 'none',
          'stroke-width':1,
          'vector-effect': 'non-scaling-stroke'
        });

        qtlAnnotations.selectAll("text").attr({
          x: hozPosition ,
          y: function(d) { return y(d.midpoint) - 5; },
          'font-family': 'sans-serif',
          'font-size': config.labelHeight ,
          'text-anchor': 'middle'
        }).text( function(d) {
            return d.label;
        });
    };

    // draw a border around the annotation target element
    var drawBorder = function(target) {
      // create the border element if it doesn't exist
      if (d3.select(target).select("rect.border").node() === null){
        d3.select(target).append("rect").classed("border", true);
      }

      d3.select(target).select("rect.border")
        .attr({
          x:0,
          y:0,
          width: config.width,
          height: config.height + config.labelHeight
        })
        .style({ fill: "none", "stroke-width": "0.5", stroke: "#000"});
    };

    // An SVG representation of a chromosome with banding data. This won't create an SVG
    // element, it expects that to already have been created.
    function my(selection) {
      selection.each(function(d, i){
        var target = this;
        var targetSelection = d3.select(target);

        var y, height;
        if (config.yScale !== null){
          y = config.yScale;
          height = y(config.longestChromosome);
        }
        else {
          y = d3.scale.linear().range([0, config.height]).domain([0, config.longestChromosome]);
          height = config.height;
        };

        // create the annotationsGroup element if it doesn't exist
        // var annotationsGroup = targetSelection.select("g.annotations");
        // if (annotationsGroup.empty()){
        //   annotationsGroup = targetSelection.append("g").attr({
        //     class: 'annotations',
        //     id: 'annotation_' + d.number
        //   });
        // }

        // create the annotationsGroup element if it doesn't exist
        var annotationsGroup = targetSelection.selectAll("g.annotations").data([d]);

        annotationsGroup.enter().append("g").attr({
          class: 'annotations',
          id: 'annotation_' + d.number
        });

        setupGeneAnnotations(annotationsGroup, y);

        setupQTLAnnotations(annotationsGroup, y);


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
