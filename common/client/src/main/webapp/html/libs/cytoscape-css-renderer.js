;(function(){ 'use strict';

  // registers the extension on a cytoscape lib ref
  var register = function( $$ ){

    if( !$$ ){ 
      return; // can't register if cytoscape unspecified
    } 

    var CanvasRenderer = $$.extension('renderer', 'canvas');
    function CssRenderer(options){
      CanvasRenderer.call(this, options);
      this.data.cssContainer = document.createElement('div');
      this.data.cssContainer.className = "cssContainer";
      this.data.cssContainer.style = $$.util.extend(this.data.cssContainer.style, {
        postion: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      });
      this.data.container.appendChild( this.data.cssContainer );
    }
    CssRenderer.prototype = Object.create(CanvasRenderer.prototype);
    CssRenderer.prototype.constructor = CssRenderer;
    $$.util.extend(CssRenderer, CanvasRenderer);
    CssRenderer.prototype.drawNodeText = function(context, node) {
      var position = node._private.position;
      var zoom = node.cy().zoom();
      var pan = node.cy().pan();
      var style = node._private.style;
      var label_object = node._private.labelObject;
      if(!label_object) {
        var parentOpacity = node.effectiveOpacity();
        var opacity = style['text-opacity'].value * style.opacity.value * parentOpacity;
        //var outlineColor = style['text-outline-color'].value;
        //var outlineOpacity = style['text-outline-opacity'].value * opacity;
        var container_style = {
          position: "absolute",
          fontStyle: style['font-style'].strValue,
          fontSize: style['font-size'].pxValue + 'px',
          fontFamily: style['font-family'].strValue,
          fontWeight: style['font-weight'].strValue,
          opacity: opacity,
          color: "rgb(" + style.color.value[0] + "," + style.color.value[1] + "," + style.color.value[2] + ")",
          width: 200,
          height: 200,
          marginLeft: -100,
          marginTop: -100,
          textAlign: "center"
        };
        var text_style = {
          position: "absolute"
        };
        if(style['text-valign'].value === 'center') {
          text_style.top = 100 - style['font-size'].pxValue / 2 - 1;
        } else if(style['text-valign'].value === 'top') {
          text_style.bottom = 100 + style.height.pxValue / 2;
        } else if(style['text-valign'].value === 'bottom') {
          text_style.top = 100 + style.height.pxValue / 2;
        } 
        if(style['text-halign'].value === 'center') { 
          text_style.width = "200px";
          text_style.textAlign = "center";
        } else if(style['text-halign'].value === 'left') { 
          text_style.right = 100 + style.width.pxValue / 2;
        } else if(style['text-halign'].value === 'right') { 
          text_style.left = 100 + style.width.pxValue / 2;
        }
        var text_object = document.createElement('div');
        text_object.style = $$.util.extend(text_object.style, text_style);
        text_object.innerHTML = node._private.style.content.strValue || "";
        label_object = node._private.labelObject = document.createElement('div');
        label_object.appendChild(text_object);
        label_object.style = $$.util.extend(label_object.style, container_style);
        this.data.cssContainer.appendChild(label_object);
      } 
      var transform = "translate(" + (zoom * position.x + pan.x) + "px," + (zoom * position.y + pan.y) + "px) scale(" + zoom + ", " + zoom + ")";
      label_object.style.marginBottom = Math.random();
      label_object.style.transform = transform;
      label_object.style.msTransform = transform;
      label_object.style.WebkitTransform = transform;
    };
    $$('renderer', 'css', CssRenderer);
  };

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-css', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register(cytoscape);
  }

})();