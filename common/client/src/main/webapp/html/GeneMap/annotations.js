var GENEMAP = GENEMAP || {};

GENEMAP.Annotations = function(userConfig) {
    var defaultConfig = {
      border: false,
      labelHeight: 8
    };

    var config = _.merge({}, defaultConfig, userConfig);

    // adds the gene annotations to the annotations group within it, uses the data
    // bound to the annotationsGroup to generate the annotation elements
    var setupGeneAnnotations = function(annotationsGroup, y){

      var chromosome = annotationsGroup.data()[0];
      var hozPosition = chromosome.annotationWidth / 2.0;

      // Enter + Update elements
      var geneAnnotations = annotationsGroup.selectAll("g.gene_annotation").data(chromosome.annotations.genes);

      var geneAnnotationsEnterGroup = geneAnnotations.enter().append("g").classed("gene_annotation", true);

      geneAnnotationsEnterGroup.append("line").classed("midpoint-line", true);
      geneAnnotationsEnterGroup.append("polygon").attr('class', 'infobox');
      geneAnnotationsEnterGroup.append("text");

      geneAnnotations.selectAll("line.midpoint-line").attr({
        x1: -chromosome.width/2,
        y1: function(d) { return y(d.midpoint);},
        y2: function(d) { return y(d.midpoint);},
        x2: hozPosition
      });

      // generate a little triange based on the data
      var pointsFn = function(d) {
        var points = []
        var midpoint = d.start + (d.end - d.start) / 2;
        var a = chromosome.annotationMarkerSize;

        // start at the top right and move down to the bottom left
        points.push([hozPosition, y(midpoint) - a/2]);
        points.push([hozPosition, y(midpoint) + a/2]);

        // add the final point at 1/2 height to make an equelateral triangle
        var h = Math.sqrt( Math.pow(a, 2) - Math.pow((a/2), 2));
        points.push([hozPosition - h, y(midpoint)])
        return points.join(" ");
      }

      geneAnnotations.selectAll("polygon").attr({
        points: pointsFn
      });


      geneAnnotations.selectAll("text").attr({
        x: hozPosition  + chromosome.annotationLabelHeight * 0.5,
        y: function(d) { return y(d.midpoint) + (0.4 * chromosome.annotationLabelHeight) ; }
      }).style({
        'font-size': chromosome.annotationLabelHeight,
        'visibility': chromosome.showAnnotationLabels ? 'visible' : 'hidden'
      }).text( function(d) {
          return d.label;
      });

      geneAnnotations.exit().remove();
    };

    var setupQTLAnnotations = function(annotationsGroup, y) {

      var chromosome = annotationsGroup.data()[0];
      var hozPosition = chromosome.annotationWidth;
      var yOffset = chromosome.labelHeight;

      // Enter + Update elements
      var qtlAnnotations = annotationsGroup.selectAll("g.qtl_annotation").data(chromosome.annotations.qtls);

      // setup the new annotations
      var qtlAnnotationsEnterGroup = qtlAnnotations.enter().append("g").classed("qtl_annotation", true);
      qtlAnnotationsEnterGroup.append("line").classed("top-line", true);
      qtlAnnotationsEnterGroup.append("line").classed("bottom-line", true);
      qtlAnnotationsEnterGroup.append("rect").classed("qtl-selector infobox", true);
      qtlAnnotationsEnterGroup.append("text");

      // update
      qtlAnnotations.selectAll("line.top-line").attr({
        x1: -chromosome.width/2,
        y1: function(d) { return y(d.start);},
        y2: function(d) { return y(d.start);},
        x2: hozPosition
      });

      qtlAnnotations.selectAll("line.bottom-line").attr({
        x1: -chromosome.width/2,
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
        x: hozPosition / 2 ,
        y: function(d) { return y(d.start) + chromosome.annotationLabelHeight; }
      })
      .style({
        'font-size': chromosome.annotationLabelHeight ,
        'visibility': chromosome.showAnnotationLabels ? 'visible' : 'hidden'
      })
      .text( function(d) {
          return d.label;
      });

      qtlAnnotations.exit().remove();
    };

    // draw a border around the annotation target element
    var drawBorder = function(group, chromosome, y) {

      // create the border element if it doesn't exist
      if (group.select("rect.border").empty()){
        group.append("rect").classed("border", true);
      }

      group.select("rect.border")
        .attr({
          x:0,
          y:0,
          width: chromosome.annotationWidth,
          height: y(chromosome.length)
        });
    };

    var buildYScale = function(d) {
      return d3.scale.linear().range([0, d.height]).domain([0, d.longestChromosome]);
    }

    // An SVG representation of a chromosome with banding data. This won't create an SVG
    // element, it expects that to already have been created.
    function my(selection) {
      selection.each(function(d, i){

        var groups = d3.select(this).selectAll(".annotation-group").data(d);

        groups.enter().append("g").attr('class', 'annotation-group');

        groups.each(function(d, i) {
          var y = buildYScale(d);


          var group = d3.select(this).attr({
            id: function(d) { return 'annotation_' + d.number},
            transform: function(d){
              return "translate(" + (d.x + d.width) + ","+ (d.y + d.labelHeight) +")";
            }
          })

          setupGeneAnnotations(group, y);

          setupQTLAnnotations(group, y);

          if (config.border) {
            drawBorder(group, d, y);
          }
        });

        groups.exit().remove();
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
