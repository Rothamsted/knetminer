
;(function ($) {

    'use strict';

    $.fn.maskLoader = function (options)
    {
        var settings = $.extend({
            'fade': true,
            'z-index': '999',
            'background': 'black',
            'opacity': '0.6',
            'position': 'absolute',
            'imgLoader': false,
            'autoCreate':true,
            'textAlert':false
        }, options);

        var el = $(this);

        var fade = settings.fade;

        var imgLoader = settings.imgLoader;

        var autoCreate = settings.autoCreate;

        delete settings.fade;
        delete settings.imgLoader;
        delete settings.autoCreate;

        var additionalClass = '';
        if (fade) {
            additionalClass = 'hide-loader';
        } else {
            additionalClass = 'show-loader';
        }


        var maskLoaderEl = $('<div class="mask-loader ' + additionalClass + '"></div>');
        var imgLoaderEl = $('<div class="mask-loader img '+ additionalClass +'"></div>');
        var textAlert = $();
        if(settings.textAlert){
            var textAlert = $('<div class="mask-loader text-alert '+ additionalClass +'"><div class="textalert">'+settings.textAlert+'</div></div>');
        }


        maskLoaderEl.css(settings);

        if (el[0].tagName == 'BODY') {
            maskLoaderEl.css({
                'position': 'fixed',
                'width': '100%',
                'height': '100%',
                'left': '0',
                'top': '0'
            });
            imgLoaderEl.css({
                'position':'fixed'
            });

            textAlert.css({
                'position':'fixed'
            });

        } else {
            maskLoaderEl.css({
                'width': el.width() - 2,
                'height': el.height() - 2
            });
            imgLoaderEl.css({
                'position':'absolute'
            });
            textAlert.css({
                'position':'absolute'
            });
        }

        imgLoaderEl.css({
            'z-index':parseInt(maskLoaderEl.css('z-index') + 5),
            'width':maskLoaderEl.css('width'),
            'height':maskLoaderEl.css('height')
        });

        textAlert.css({
            'z-index':parseInt(maskLoaderEl.css('z-index') + 5),
            'width':maskLoaderEl.css('width'),
            'height':maskLoaderEl.css('height')
        });

        if(imgLoader){
            imgLoaderEl.css({
                'background':'url('+imgLoader+') center center no-repeat'
            });
        }


        var functions = {
            create: function () {
                el.each(function () {
                    $(this).prepend(textAlert.clone());
                    $(this).prepend(imgLoaderEl.clone());
                    $(this).prepend(maskLoaderEl.clone());


                    if (fade) {
                        $(this).find('.mask-loader').fadeIn('slow');
                    }
                });


            },
            destroy: function () {
                el.each(function () {

                    if (fade) {
                        $(this).find('.mask-loader').fadeOut('slow', function () {
                            $(this).remove();
                        });

                    } else {
                        $(this).find('.mask-loader').remove();

                    }

                });
            }
        };

        if(autoCreate){
            functions.create();
        }

        return functions;

    };

    var maskLoaderObjects = {};

    /**
    * jQuery Ajax Handles
    */
    $(document).ajaxSend(function(e, jqXHR, ajaxOptions){
        if(ajaxOptions.maskLoaderSettings != null){

            if(!ajaxOptions.maskLoaderSettings.hasOwnProperty('element')){
                throw 'MaskLoader: element not defined. Ex: maskLoaderSettings:{"element":"#id .class"}';
            }

            var element = ajaxOptions.maskLoaderSettings.element;

            delete ajaxOptions.maskLoaderSettings.element;

            maskLoaderObjects.element = element;

            if($.type(element) != 'object' && $.type(element) == 'string'){
                maskLoaderObjects.element = $(element);
            }

            if(maskLoaderObjects.element.length){
                maskLoaderObjects.maskLoader = maskLoaderObjects.element.maskLoader(ajaxOptions.maskLoaderSettings);
            }else{
               throw ('MaskLoader: Element not exists.');
            }
        }
    });

    $(document).ajaxError(function(e, jqXHR, ajaxOptions, error){
        if(maskLoaderObjects.hasOwnProperty('element')){
            maskLoaderObjects.maskLoader.destroy();
        }
    });

    $(document).ajaxComplete(function(e, jqXHR, ajaxOptions){
        if(maskLoaderObjects.hasOwnProperty('element')){
            maskLoaderObjects.maskLoader.destroy();
        }
    });

    $(document).ajaxStop(function(){
        if(maskLoaderObjects.hasOwnProperty('element')){
            maskLoaderObjects.maskLoader.destroy();
        }
    });


})(jQuery);

/* qTip2 v2.2.0 tips modal viewport svg imagemap ie6 | qtip2.com | Licensed MIT, GPL | Thu Nov 21 2013 20:34:59 */
(function(t,e,i){(function(t){"use strict";"function"==typeof define&&define.amd?define(["jquery"],t):jQuery&&!jQuery.fn.qtip&&t(jQuery)})(function(s){"use strict";function o(t,e,i,o){this.id=i,this.target=t,this.tooltip=E,this.elements={target:t},this._id=X+"-"+i,this.timers={img:{}},this.options=e,this.plugins={},this.cache={event:{},target:s(),disabled:k,attr:o,onTooltip:k,lastClass:""},this.rendered=this.destroyed=this.disabled=this.waiting=this.hiddenDuringWait=this.positioning=this.triggering=k}function n(t){return t===E||"object"!==s.type(t)}function r(t){return!(s.isFunction(t)||t&&t.attr||t.length||"object"===s.type(t)&&(t.jquery||t.then))}function a(t){var e,i,o,a;return n(t)?k:(n(t.metadata)&&(t.metadata={type:t.metadata}),"content"in t&&(e=t.content,n(e)||e.jquery||e.done?e=t.content={text:i=r(e)?k:e}:i=e.text,"ajax"in e&&(o=e.ajax,a=o&&o.once!==k,delete e.ajax,e.text=function(t,e){var n=i||s(this).attr(e.options.content.attr)||"Loading...",r=s.ajax(s.extend({},o,{context:e})).then(o.success,E,o.error).then(function(t){return t&&a&&e.set("content.text",t),t},function(t,i,s){e.destroyed||0===t.status||e.set("content.text",i+": "+s)});return a?n:(e.set("content.text",n),r)}),"title"in e&&(n(e.title)||(e.button=e.title.button,e.title=e.title.text),r(e.title||k)&&(e.title=k))),"position"in t&&n(t.position)&&(t.position={my:t.position,at:t.position}),"show"in t&&n(t.show)&&(t.show=t.show.jquery?{target:t.show}:t.show===W?{ready:W}:{event:t.show}),"hide"in t&&n(t.hide)&&(t.hide=t.hide.jquery?{target:t.hide}:{event:t.hide}),"style"in t&&n(t.style)&&(t.style={classes:t.style}),s.each(R,function(){this.sanitize&&this.sanitize(t)}),t)}function h(t,e){for(var i,s=0,o=t,n=e.split(".");o=o[n[s++]];)n.length>s&&(i=o);return[i||t,n.pop()]}function l(t,e){var i,s,o;for(i in this.checks)for(s in this.checks[i])(o=RegExp(s,"i").exec(t))&&(e.push(o),("builtin"===i||this.plugins[i])&&this.checks[i][s].apply(this.plugins[i]||this,e))}function c(t){return G.concat("").join(t?"-"+t+" ":" ")}function d(i){return i&&{type:i.type,pageX:i.pageX,pageY:i.pageY,target:i.target,relatedTarget:i.relatedTarget,scrollX:i.scrollX||t.pageXOffset||e.body.scrollLeft||e.documentElement.scrollLeft,scrollY:i.scrollY||t.pageYOffset||e.body.scrollTop||e.documentElement.scrollTop}||{}}function p(t,e){return e>0?setTimeout(s.proxy(t,this),e):(t.call(this),i)}function u(t){return this.tooltip.hasClass(ee)?k:(clearTimeout(this.timers.show),clearTimeout(this.timers.hide),this.timers.show=p.call(this,function(){this.toggle(W,t)},this.options.show.delay),i)}function f(t){if(this.tooltip.hasClass(ee))return k;var e=s(t.relatedTarget),i=e.closest(U)[0]===this.tooltip[0],o=e[0]===this.options.show.target[0];if(clearTimeout(this.timers.show),clearTimeout(this.timers.hide),this!==e[0]&&"mouse"===this.options.position.target&&i||this.options.hide.fixed&&/mouse(out|leave|move)/.test(t.type)&&(i||o))try{t.preventDefault(),t.stopImmediatePropagation()}catch(n){}else this.timers.hide=p.call(this,function(){this.toggle(k,t)},this.options.hide.delay,this)}function g(t){return this.tooltip.hasClass(ee)||!this.options.hide.inactive?k:(clearTimeout(this.timers.inactive),this.timers.inactive=p.call(this,function(){this.hide(t)},this.options.hide.inactive),i)}function m(t){this.rendered&&this.tooltip[0].offsetWidth>0&&this.reposition(t)}function v(t,i,o){s(e.body).delegate(t,(i.split?i:i.join(he+" "))+he,function(){var t=T.api[s.attr(this,H)];t&&!t.disabled&&o.apply(t,arguments)})}function y(t,i,n){var r,h,l,c,d,p=s(e.body),u=t[0]===e?p:t,f=t.metadata?t.metadata(n.metadata):E,g="html5"===n.metadata.type&&f?f[n.metadata.name]:E,m=t.data(n.metadata.name||"qtipopts");try{m="string"==typeof m?s.parseJSON(m):m}catch(v){}if(c=s.extend(W,{},T.defaults,n,"object"==typeof m?a(m):E,a(g||f)),h=c.position,c.id=i,"boolean"==typeof c.content.text){if(l=t.attr(c.content.attr),c.content.attr===k||!l)return k;c.content.text=l}if(h.container.length||(h.container=p),h.target===k&&(h.target=u),c.show.target===k&&(c.show.target=u),c.show.solo===W&&(c.show.solo=h.container.closest("body")),c.hide.target===k&&(c.hide.target=u),c.position.viewport===W&&(c.position.viewport=h.container),h.container=h.container.eq(0),h.at=new z(h.at,W),h.my=new z(h.my),t.data(X))if(c.overwrite)t.qtip("destroy",!0);else if(c.overwrite===k)return k;return t.attr(Y,i),c.suppress&&(d=t.attr("title"))&&t.removeAttr("title").attr(se,d).attr("title",""),r=new o(t,c,i,!!l),t.data(X,r),t.one("remove.qtip-"+i+" removeqtip.qtip-"+i,function(){var t;(t=s(this).data(X))&&t.destroy(!0)}),r}function b(t){return t.charAt(0).toUpperCase()+t.slice(1)}function w(t,e){var s,o,n=e.charAt(0).toUpperCase()+e.slice(1),r=(e+" "+be.join(n+" ")+n).split(" "),a=0;if(ye[e])return t.css(ye[e]);for(;s=r[a++];)if((o=t.css(s))!==i)return ye[e]=s,o}function _(t,e){return Math.ceil(parseFloat(w(t,e)))}function x(t,e){this._ns="tip",this.options=e,this.offset=e.offset,this.size=[e.width,e.height],this.init(this.qtip=t)}function q(t,e){this.options=e,this._ns="-modal",this.init(this.qtip=t)}function C(t){this._ns="ie6",this.init(this.qtip=t)}var T,j,z,M,I,W=!0,k=!1,E=null,S="x",L="y",A="width",B="height",D="top",F="left",O="bottom",P="right",N="center",$="flipinvert",V="shift",R={},X="qtip",Y="data-hasqtip",H="data-qtip-id",G=["ui-widget","ui-tooltip"],U="."+X,Q="click dblclick mousedown mouseup mousemove mouseleave mouseenter".split(" "),J=X+"-fixed",K=X+"-default",Z=X+"-focus",te=X+"-hover",ee=X+"-disabled",ie="_replacedByqTip",se="oldtitle",oe={ie:function(){for(var t=3,i=e.createElement("div");(i.innerHTML="<!--[if gt IE "+ ++t+"]><i></i><![endif]-->")&&i.getElementsByTagName("i")[0];);return t>4?t:0/0}(),iOS:parseFloat((""+(/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent)||[0,""])[1]).replace("undefined","3_2").replace("_",".").replace("_",""))||k};j=o.prototype,j._when=function(t){return s.when.apply(s,t)},j.render=function(t){if(this.rendered||this.destroyed)return this;var e,i=this,o=this.options,n=this.cache,r=this.elements,a=o.content.text,h=o.content.title,l=o.content.button,c=o.position,d=("."+this._id+" ",[]);return s.attr(this.target[0],"aria-describedby",this._id),this.tooltip=r.tooltip=e=s("<div/>",{id:this._id,"class":[X,K,o.style.classes,X+"-pos-"+o.position.my.abbrev()].join(" "),width:o.style.width||"",height:o.style.height||"",tracking:"mouse"===c.target&&c.adjust.mouse,role:"alert","aria-live":"polite","aria-atomic":k,"aria-describedby":this._id+"-content","aria-hidden":W}).toggleClass(ee,this.disabled).attr(H,this.id).data(X,this).appendTo(c.container).append(r.content=s("<div />",{"class":X+"-content",id:this._id+"-content","aria-atomic":W})),this.rendered=-1,this.positioning=W,h&&(this._createTitle(),s.isFunction(h)||d.push(this._updateTitle(h,k))),l&&this._createButton(),s.isFunction(a)||d.push(this._updateContent(a,k)),this.rendered=W,this._setWidget(),s.each(R,function(t){var e;"render"===this.initialize&&(e=this(i))&&(i.plugins[t]=e)}),this._unassignEvents(),this._assignEvents(),this._when(d).then(function(){i._trigger("render"),i.positioning=k,i.hiddenDuringWait||!o.show.ready&&!t||i.toggle(W,n.event,k),i.hiddenDuringWait=k}),T.api[this.id]=this,this},j.destroy=function(t){function e(){if(!this.destroyed){this.destroyed=W;var t=this.target,e=t.attr(se);this.rendered&&this.tooltip.stop(1,0).find("*").remove().end().remove(),s.each(this.plugins,function(){this.destroy&&this.destroy()}),clearTimeout(this.timers.show),clearTimeout(this.timers.hide),this._unassignEvents(),t.removeData(X).removeAttr(H).removeAttr(Y).removeAttr("aria-describedby"),this.options.suppress&&e&&t.attr("title",e).removeAttr(se),this._unbind(t),this.options=this.elements=this.cache=this.timers=this.plugins=this.mouse=E,delete T.api[this.id]}}return this.destroyed?this.target:(t===W&&"hide"!==this.triggering||!this.rendered?e.call(this):(this.tooltip.one("tooltiphidden",s.proxy(e,this)),!this.triggering&&this.hide()),this.target)},M=j.checks={builtin:{"^id$":function(t,e,i,o){var n=i===W?T.nextid:i,r=X+"-"+n;n!==k&&n.length>0&&!s("#"+r).length?(this._id=r,this.rendered&&(this.tooltip[0].id=this._id,this.elements.content[0].id=this._id+"-content",this.elements.title[0].id=this._id+"-title")):t[e]=o},"^prerender":function(t,e,i){i&&!this.rendered&&this.render(this.options.show.ready)},"^content.text$":function(t,e,i){this._updateContent(i)},"^content.attr$":function(t,e,i,s){this.options.content.text===this.target.attr(s)&&this._updateContent(this.target.attr(i))},"^content.title$":function(t,e,s){return s?(s&&!this.elements.title&&this._createTitle(),this._updateTitle(s),i):this._removeTitle()},"^content.button$":function(t,e,i){this._updateButton(i)},"^content.title.(text|button)$":function(t,e,i){this.set("content."+e,i)},"^position.(my|at)$":function(t,e,i){"string"==typeof i&&(t[e]=new z(i,"at"===e))},"^position.container$":function(t,e,i){this.rendered&&this.tooltip.appendTo(i)},"^show.ready$":function(t,e,i){i&&(!this.rendered&&this.render(W)||this.toggle(W))},"^style.classes$":function(t,e,i,s){this.rendered&&this.tooltip.removeClass(s).addClass(i)},"^style.(width|height)":function(t,e,i){this.rendered&&this.tooltip.css(e,i)},"^style.widget|content.title":function(){this.rendered&&this._setWidget()},"^style.def":function(t,e,i){this.rendered&&this.tooltip.toggleClass(K,!!i)},"^events.(render|show|move|hide|focus|blur)$":function(t,e,i){this.rendered&&this.tooltip[(s.isFunction(i)?"":"un")+"bind"]("tooltip"+e,i)},"^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)":function(){if(this.rendered){var t=this.options.position;this.tooltip.attr("tracking","mouse"===t.target&&t.adjust.mouse),this._unassignEvents(),this._assignEvents()}}}},j.get=function(t){if(this.destroyed)return this;var e=h(this.options,t.toLowerCase()),i=e[0][e[1]];return i.precedance?i.string():i};var ne=/^position\.(my|at|adjust|target|container|viewport)|style|content|show\.ready/i,re=/^prerender|show\.ready/i;j.set=function(t,e){if(this.destroyed)return this;var o,n=this.rendered,r=k,c=this.options;return this.checks,"string"==typeof t?(o=t,t={},t[o]=e):t=s.extend({},t),s.each(t,function(e,o){if(n&&re.test(e))return delete t[e],i;var a,l=h(c,e.toLowerCase());a=l[0][l[1]],l[0][l[1]]=o&&o.nodeType?s(o):o,r=ne.test(e)||r,t[e]=[l[0],l[1],o,a]}),a(c),this.positioning=W,s.each(t,s.proxy(l,this)),this.positioning=k,this.rendered&&this.tooltip[0].offsetWidth>0&&r&&this.reposition("mouse"===c.position.target?E:this.cache.event),this},j._update=function(t,e){var i=this,o=this.cache;return this.rendered&&t?(s.isFunction(t)&&(t=t.call(this.elements.target,o.event,this)||""),s.isFunction(t.then)?(o.waiting=W,t.then(function(t){return o.waiting=k,i._update(t,e)},E,function(t){return i._update(t,e)})):t===k||!t&&""!==t?k:(t.jquery&&t.length>0?e.empty().append(t.css({display:"block",visibility:"visible"})):e.html(t),this._waitForContent(e).then(function(t){t.images&&t.images.length&&i.rendered&&i.tooltip[0].offsetWidth>0&&i.reposition(o.event,!t.length)}))):k},j._waitForContent=function(t){var e=this.cache;return e.waiting=W,(s.fn.imagesLoaded?t.imagesLoaded():s.Deferred().resolve([])).done(function(){e.waiting=k}).promise()},j._updateContent=function(t,e){this._update(t,this.elements.content,e)},j._updateTitle=function(t,e){this._update(t,this.elements.title,e)===k&&this._removeTitle(k)},j._createTitle=function(){var t=this.elements,e=this._id+"-title";t.titlebar&&this._removeTitle(),t.titlebar=s("<div />",{"class":X+"-titlebar "+(this.options.style.widget?c("header"):"")}).append(t.title=s("<div />",{id:e,"class":X+"-title","aria-atomic":W})).insertBefore(t.content).delegate(".qtip-close","mousedown keydown mouseup keyup mouseout",function(t){s(this).toggleClass("ui-state-active ui-state-focus","down"===t.type.substr(-4))}).delegate(".qtip-close","mouseover mouseout",function(t){s(this).toggleClass("ui-state-hover","mouseover"===t.type)}),this.options.content.button&&this._createButton()},j._removeTitle=function(t){var e=this.elements;e.title&&(e.titlebar.remove(),e.titlebar=e.title=e.button=E,t!==k&&this.reposition())},j.reposition=function(i,o){if(!this.rendered||this.positioning||this.destroyed)return this;this.positioning=W;var n,r,a=this.cache,h=this.tooltip,l=this.options.position,c=l.target,d=l.my,p=l.at,u=l.viewport,f=l.container,g=l.adjust,m=g.method.split(" "),v=h.outerWidth(k),y=h.outerHeight(k),b=0,w=0,_=h.css("position"),x={left:0,top:0},q=h[0].offsetWidth>0,C=i&&"scroll"===i.type,T=s(t),j=f[0].ownerDocument,z=this.mouse;if(s.isArray(c)&&2===c.length)p={x:F,y:D},x={left:c[0],top:c[1]};else if("mouse"===c)p={x:F,y:D},!z||!z.pageX||!g.mouse&&i&&i.pageX?i&&i.pageX||((!g.mouse||this.options.show.distance)&&a.origin&&a.origin.pageX?i=a.origin:(!i||i&&("resize"===i.type||"scroll"===i.type))&&(i=a.event)):i=z,"static"!==_&&(x=f.offset()),j.body.offsetWidth!==(t.innerWidth||j.documentElement.clientWidth)&&(r=s(e.body).offset()),x={left:i.pageX-x.left+(r&&r.left||0),top:i.pageY-x.top+(r&&r.top||0)},g.mouse&&C&&z&&(x.left-=(z.scrollX||0)-T.scrollLeft(),x.top-=(z.scrollY||0)-T.scrollTop());else{if("event"===c?i&&i.target&&"scroll"!==i.type&&"resize"!==i.type?a.target=s(i.target):i.target||(a.target=this.elements.target):"event"!==c&&(a.target=s(c.jquery?c:this.elements.target)),c=a.target,c=s(c).eq(0),0===c.length)return this;c[0]===e||c[0]===t?(b=oe.iOS?t.innerWidth:c.width(),w=oe.iOS?t.innerHeight:c.height(),c[0]===t&&(x={top:(u||c).scrollTop(),left:(u||c).scrollLeft()})):R.imagemap&&c.is("area")?n=R.imagemap(this,c,p,R.viewport?m:k):R.svg&&c&&c[0].ownerSVGElement?n=R.svg(this,c,p,R.viewport?m:k):(b=c.outerWidth(k),w=c.outerHeight(k),x=c.offset()),n&&(b=n.width,w=n.height,r=n.offset,x=n.position),x=this.reposition.offset(c,x,f),(oe.iOS>3.1&&4.1>oe.iOS||oe.iOS>=4.3&&4.33>oe.iOS||!oe.iOS&&"fixed"===_)&&(x.left-=T.scrollLeft(),x.top-=T.scrollTop()),(!n||n&&n.adjustable!==k)&&(x.left+=p.x===P?b:p.x===N?b/2:0,x.top+=p.y===O?w:p.y===N?w/2:0)}return x.left+=g.x+(d.x===P?-v:d.x===N?-v/2:0),x.top+=g.y+(d.y===O?-y:d.y===N?-y/2:0),R.viewport?(x.adjusted=R.viewport(this,x,l,b,w,v,y),r&&x.adjusted.left&&(x.left+=r.left),r&&x.adjusted.top&&(x.top+=r.top)):x.adjusted={left:0,top:0},this._trigger("move",[x,u.elem||u],i)?(delete x.adjusted,o===k||!q||isNaN(x.left)||isNaN(x.top)||"mouse"===c||!s.isFunction(l.effect)?h.css(x):s.isFunction(l.effect)&&(l.effect.call(h,this,s.extend({},x)),h.queue(function(t){s(this).css({opacity:"",height:""}),oe.ie&&this.style.removeAttribute("filter"),t()})),this.positioning=k,this):this},j.reposition.offset=function(t,i,o){function n(t,e){i.left+=e*t.scrollLeft(),i.top+=e*t.scrollTop()}if(!o[0])return i;var r,a,h,l,c=s(t[0].ownerDocument),d=!!oe.ie&&"CSS1Compat"!==e.compatMode,p=o[0];do"static"!==(a=s.css(p,"position"))&&("fixed"===a?(h=p.getBoundingClientRect(),n(c,-1)):(h=s(p).position(),h.left+=parseFloat(s.css(p,"borderLeftWidth"))||0,h.top+=parseFloat(s.css(p,"borderTopWidth"))||0),i.left-=h.left+(parseFloat(s.css(p,"marginLeft"))||0),i.top-=h.top+(parseFloat(s.css(p,"marginTop"))||0),r||"hidden"===(l=s.css(p,"overflow"))||"visible"===l||(r=s(p)));while(p=p.offsetParent);return r&&(r[0]!==c[0]||d)&&n(r,1),i};var ae=(z=j.reposition.Corner=function(t,e){t=(""+t).replace(/([A-Z])/," $1").replace(/middle/gi,N).toLowerCase(),this.x=(t.match(/left|right/i)||t.match(/center/)||["inherit"])[0].toLowerCase(),this.y=(t.match(/top|bottom|center/i)||["inherit"])[0].toLowerCase(),this.forceY=!!e;var i=t.charAt(0);this.precedance="t"===i||"b"===i?L:S}).prototype;ae.invert=function(t,e){this[t]=this[t]===F?P:this[t]===P?F:e||this[t]},ae.string=function(){var t=this.x,e=this.y;return t===e?t:this.precedance===L||this.forceY&&"center"!==e?e+" "+t:t+" "+e},ae.abbrev=function(){var t=this.string().split(" ");return t[0].charAt(0)+(t[1]&&t[1].charAt(0)||"")},ae.clone=function(){return new z(this.string(),this.forceY)},j.toggle=function(t,i){var o=this.cache,n=this.options,r=this.tooltip;if(i){if(/over|enter/.test(i.type)&&/out|leave/.test(o.event.type)&&n.show.target.add(i.target).length===n.show.target.length&&r.has(i.relatedTarget).length)return this;o.event=d(i)}if(this.waiting&&!t&&(this.hiddenDuringWait=W),!this.rendered)return t?this.render(1):this;if(this.destroyed||this.disabled)return this;var a,h,l,c=t?"show":"hide",p=this.options[c],u=(this.options[t?"hide":"show"],this.options.position),f=this.options.content,g=this.tooltip.css("width"),m=this.tooltip.is(":visible"),v=t||1===p.target.length,y=!i||2>p.target.length||o.target[0]===i.target;return(typeof t).search("boolean|number")&&(t=!m),a=!r.is(":animated")&&m===t&&y,h=a?E:!!this._trigger(c,[90]),this.destroyed?this:(h!==k&&t&&this.focus(i),!h||a?this:(s.attr(r[0],"aria-hidden",!t),t?(o.origin=d(this.mouse),s.isFunction(f.text)&&this._updateContent(f.text,k),s.isFunction(f.title)&&this._updateTitle(f.title,k),!I&&"mouse"===u.target&&u.adjust.mouse&&(s(e).bind("mousemove."+X,this._storeMouse),I=W),g||r.css("width",r.outerWidth(k)),this.reposition(i,arguments[2]),g||r.css("width",""),p.solo&&("string"==typeof p.solo?s(p.solo):s(U,p.solo)).not(r).not(p.target).qtip("hide",s.Event("tooltipsolo"))):(clearTimeout(this.timers.show),delete o.origin,I&&!s(U+'[tracking="true"]:visible',p.solo).not(r).length&&(s(e).unbind("mousemove."+X),I=k),this.blur(i)),l=s.proxy(function(){t?(oe.ie&&r[0].style.removeAttribute("filter"),r.css("overflow",""),"string"==typeof p.autofocus&&s(this.options.show.autofocus,r).focus(),this.options.show.target.trigger("qtip-"+this.id+"-inactive")):r.css({display:"",visibility:"",opacity:"",left:"",top:""}),this._trigger(t?"visible":"hidden")},this),p.effect===k||v===k?(r[c](),l()):s.isFunction(p.effect)?(r.stop(1,1),p.effect.call(r,this),r.queue("fx",function(t){l(),t()})):r.fadeTo(90,t?1:0,l),t&&p.target.trigger("qtip-"+this.id+"-inactive"),this))},j.show=function(t){return this.toggle(W,t)},j.hide=function(t){return this.toggle(k,t)},j.focus=function(t){if(!this.rendered||this.destroyed)return this;var e=s(U),i=this.tooltip,o=parseInt(i[0].style.zIndex,10),n=T.zindex+e.length;return i.hasClass(Z)||this._trigger("focus",[n],t)&&(o!==n&&(e.each(function(){this.style.zIndex>o&&(this.style.zIndex=this.style.zIndex-1)}),e.filter("."+Z).qtip("blur",t)),i.addClass(Z)[0].style.zIndex=n),this},j.blur=function(t){return!this.rendered||this.destroyed?this:(this.tooltip.removeClass(Z),this._trigger("blur",[this.tooltip.css("zIndex")],t),this)},j.disable=function(t){return this.destroyed?this:("toggle"===t?t=!(this.rendered?this.tooltip.hasClass(ee):this.disabled):"boolean"!=typeof t&&(t=W),this.rendered&&this.tooltip.toggleClass(ee,t).attr("aria-disabled",t),this.disabled=!!t,this)},j.enable=function(){return this.disable(k)},j._createButton=function(){var t=this,e=this.elements,i=e.tooltip,o=this.options.content.button,n="string"==typeof o,r=n?o:"Close tooltip";e.button&&e.button.remove(),e.button=o.jquery?o:s("<a />",{"class":"qtip-close "+(this.options.style.widget?"":X+"-icon"),title:r,"aria-label":r}).prepend(s("<span />",{"class":"ui-icon ui-icon-close",html:"&times;"})),e.button.appendTo(e.titlebar||i).attr("role","button").click(function(e){return i.hasClass(ee)||t.hide(e),k})},j._updateButton=function(t){if(!this.rendered)return k;var e=this.elements.button;t?this._createButton():e.remove()},j._setWidget=function(){var t=this.options.style.widget,e=this.elements,i=e.tooltip,s=i.hasClass(ee);i.removeClass(ee),ee=t?"ui-state-disabled":"qtip-disabled",i.toggleClass(ee,s),i.toggleClass("ui-helper-reset "+c(),t).toggleClass(K,this.options.style.def&&!t),e.content&&e.content.toggleClass(c("content"),t),e.titlebar&&e.titlebar.toggleClass(c("header"),t),e.button&&e.button.toggleClass(X+"-icon",!t)},j._storeMouse=function(t){(this.mouse=d(t)).type="mousemove"},j._bind=function(t,e,i,o,n){var r="."+this._id+(o?"-"+o:"");e.length&&s(t).bind((e.split?e:e.join(r+" "))+r,s.proxy(i,n||this))},j._unbind=function(t,e){s(t).unbind("."+this._id+(e?"-"+e:""))};var he="."+X;s(function(){v(U,["mouseenter","mouseleave"],function(t){var e="mouseenter"===t.type,i=s(t.currentTarget),o=s(t.relatedTarget||t.target),n=this.options;e?(this.focus(t),i.hasClass(J)&&!i.hasClass(ee)&&clearTimeout(this.timers.hide)):"mouse"===n.position.target&&n.hide.event&&n.show.target&&!o.closest(n.show.target[0]).length&&this.hide(t),i.toggleClass(te,e)}),v("["+H+"]",Q,g)}),j._trigger=function(t,e,i){var o=s.Event("tooltip"+t);return o.originalEvent=i&&s.extend({},i)||this.cache.event||E,this.triggering=t,this.tooltip.trigger(o,[this].concat(e||[])),this.triggering=k,!o.isDefaultPrevented()},j._bindEvents=function(t,e,o,n,r,a){if(n.add(o).length===n.length){var h=[];e=s.map(e,function(e){var o=s.inArray(e,t);return o>-1?(h.push(t.splice(o,1)[0]),i):e}),h.length&&this._bind(o,h,function(t){var e=this.rendered?this.tooltip[0].offsetWidth>0:!1;(e?a:r).call(this,t)})}this._bind(o,t,r),this._bind(n,e,a)},j._assignInitialEvents=function(t){function e(t){return this.disabled||this.destroyed?k:(this.cache.event=d(t),this.cache.target=t?s(t.target):[i],clearTimeout(this.timers.show),this.timers.show=p.call(this,function(){this.render("object"==typeof t||o.show.ready)},o.show.delay),i)}var o=this.options,n=o.show.target,r=o.hide.target,a=o.show.event?s.trim(""+o.show.event).split(" "):[],h=o.hide.event?s.trim(""+o.hide.event).split(" "):[];/mouse(over|enter)/i.test(o.show.event)&&!/mouse(out|leave)/i.test(o.hide.event)&&h.push("mouseleave"),this._bind(n,"mousemove",function(t){this._storeMouse(t),this.cache.onTarget=W}),this._bindEvents(a,h,n,r,e,function(){clearTimeout(this.timers.show)}),(o.show.ready||o.prerender)&&e.call(this,t)},j._assignEvents=function(){var i=this,o=this.options,n=o.position,r=this.tooltip,a=o.show.target,h=o.hide.target,l=n.container,c=n.viewport,d=s(e),p=(s(e.body),s(t)),v=o.show.event?s.trim(""+o.show.event).split(" "):[],y=o.hide.event?s.trim(""+o.hide.event).split(" "):[];s.each(o.events,function(t,e){i._bind(r,"toggle"===t?["tooltipshow","tooltiphide"]:["tooltip"+t],e,null,r)}),/mouse(out|leave)/i.test(o.hide.event)&&"window"===o.hide.leave&&this._bind(d,["mouseout","blur"],function(t){/select|option/.test(t.target.nodeName)||t.relatedTarget||this.hide(t)}),o.hide.fixed?h=h.add(r.addClass(J)):/mouse(over|enter)/i.test(o.show.event)&&this._bind(h,"mouseleave",function(){clearTimeout(this.timers.show)}),(""+o.hide.event).indexOf("unfocus")>-1&&this._bind(l.closest("html"),["mousedown","touchstart"],function(t){var e=s(t.target),i=this.rendered&&!this.tooltip.hasClass(ee)&&this.tooltip[0].offsetWidth>0,o=e.parents(U).filter(this.tooltip[0]).length>0;e[0]===this.target[0]||e[0]===this.tooltip[0]||o||this.target.has(e[0]).length||!i||this.hide(t)}),"number"==typeof o.hide.inactive&&(this._bind(a,"qtip-"+this.id+"-inactive",g),this._bind(h.add(r),T.inactiveEvents,g,"-inactive")),this._bindEvents(v,y,a,h,u,f),this._bind(a.add(r),"mousemove",function(t){if("number"==typeof o.hide.distance){var e=this.cache.origin||{},i=this.options.hide.distance,s=Math.abs;(s(t.pageX-e.pageX)>=i||s(t.pageY-e.pageY)>=i)&&this.hide(t)}this._storeMouse(t)}),"mouse"===n.target&&n.adjust.mouse&&(o.hide.event&&this._bind(a,["mouseenter","mouseleave"],function(t){this.cache.onTarget="mouseenter"===t.type}),this._bind(d,"mousemove",function(t){this.rendered&&this.cache.onTarget&&!this.tooltip.hasClass(ee)&&this.tooltip[0].offsetWidth>0&&this.reposition(t)})),(n.adjust.resize||c.length)&&this._bind(s.event.special.resize?c:p,"resize",m),n.adjust.scroll&&this._bind(p.add(n.container),"scroll",m)},j._unassignEvents=function(){var i=[this.options.show.target[0],this.options.hide.target[0],this.rendered&&this.tooltip[0],this.options.position.container[0],this.options.position.viewport[0],this.options.position.container.closest("html")[0],t,e];this._unbind(s([]).pushStack(s.grep(i,function(t){return"object"==typeof t})))},T=s.fn.qtip=function(t,e,o){var n=(""+t).toLowerCase(),r=E,h=s.makeArray(arguments).slice(1),l=h[h.length-1],c=this[0]?s.data(this[0],X):E;return!arguments.length&&c||"api"===n?c:"string"==typeof t?(this.each(function(){var t=s.data(this,X);if(!t)return W;if(l&&l.timeStamp&&(t.cache.event=l),!e||"option"!==n&&"options"!==n)t[n]&&t[n].apply(t,h);else{if(o===i&&!s.isPlainObject(e))return r=t.get(e),k;t.set(e,o)}}),r!==E?r:this):"object"!=typeof t&&arguments.length?i:(c=a(s.extend(W,{},t)),this.each(function(t){var e,o;return o=s.isArray(c.id)?c.id[t]:c.id,o=!o||o===k||1>o.length||T.api[o]?T.nextid++:o,e=y(s(this),o,c),e===k?W:(T.api[o]=e,s.each(R,function(){"initialize"===this.initialize&&this(e)}),e._assignInitialEvents(l),i)}))},s.qtip=o,T.api={},s.each({attr:function(t,e){if(this.length){var i=this[0],o="title",n=s.data(i,"qtip");if(t===o&&n&&"object"==typeof n&&n.options.suppress)return 2>arguments.length?s.attr(i,se):(n&&n.options.content.attr===o&&n.cache.attr&&n.set("content.text",e),this.attr(se,e))}return s.fn["attr"+ie].apply(this,arguments)},clone:function(t){var e=(s([]),s.fn["clone"+ie].apply(this,arguments));return t||e.filter("["+se+"]").attr("title",function(){return s.attr(this,se)}).removeAttr(se),e}},function(t,e){if(!e||s.fn[t+ie])return W;var i=s.fn[t+ie]=s.fn[t];s.fn[t]=function(){return e.apply(this,arguments)||i.apply(this,arguments)}}),s.ui||(s["cleanData"+ie]=s.cleanData,s.cleanData=function(t){for(var e,i=0;(e=s(t[i])).length;i++)if(e.attr(Y))try{e.triggerHandler("removeqtip")}catch(o){}s["cleanData"+ie].apply(this,arguments)}),T.version="2.2.0",T.nextid=0,T.inactiveEvents=Q,T.zindex=15e3,T.defaults={prerender:k,id:k,overwrite:W,suppress:W,content:{text:W,attr:"title",title:k,button:k},position:{my:"top left",at:"bottom right",target:k,container:k,viewport:k,adjust:{x:0,y:0,mouse:W,scroll:W,resize:W,method:"flipinvert flipinvert"},effect:function(t,e){s(this).animate(e,{duration:200,queue:k})}},show:{target:k,event:"mouseenter",effect:W,delay:90,solo:k,ready:k,autofocus:k},hide:{target:k,event:"mouseleave",effect:W,delay:0,fixed:k,inactive:k,leave:"window",distance:k},style:{classes:"",widget:k,width:k,height:k,def:W},events:{render:E,move:E,show:E,hide:E,toggle:E,visible:E,hidden:E,focus:E,blur:E}};var le,ce="margin",de="border",pe="color",ue="background-color",fe="transparent",ge=" !important",me=!!e.createElement("canvas").getContext,ve=/rgba?\(0, 0, 0(, 0)?\)|transparent|#123456/i,ye={},be=["Webkit","O","Moz","ms"];if(me)var we=t.devicePixelRatio||1,_e=function(){var t=e.createElement("canvas").getContext("2d");return t.backingStorePixelRatio||t.webkitBackingStorePixelRatio||t.mozBackingStorePixelRatio||t.msBackingStorePixelRatio||t.oBackingStorePixelRatio||1}(),xe=we/_e;else var qe=function(t,e,i){return"<qtipvml:"+t+' xmlns="urn:schemas-microsoft.com:vml" class="qtip-vml" '+(e||"")+' style="behavior: url(#default#VML); '+(i||"")+'" />'};s.extend(x.prototype,{init:function(t){var e,i;i=this.element=t.elements.tip=s("<div />",{"class":X+"-tip"}).prependTo(t.tooltip),me?(e=s("<canvas />").appendTo(this.element)[0].getContext("2d"),e.lineJoin="miter",e.miterLimit=1e5,e.save()):(e=qe("shape",'coordorigin="0,0"',"position:absolute;"),this.element.html(e+e),t._bind(s("*",i).add(i),["click","mousedown"],function(t){t.stopPropagation()},this._ns)),t._bind(t.tooltip,"tooltipmove",this.reposition,this._ns,this),this.create()},_swapDimensions:function(){this.size[0]=this.options.height,this.size[1]=this.options.width},_resetDimensions:function(){this.size[0]=this.options.width,this.size[1]=this.options.height},_useTitle:function(t){var e=this.qtip.elements.titlebar;return e&&(t.y===D||t.y===N&&this.element.position().top+this.size[1]/2+this.options.offset<e.outerHeight(W))},_parseCorner:function(t){var e=this.qtip.options.position.my;return t===k||e===k?t=k:t===W?t=new z(e.string()):t.string||(t=new z(t),t.fixed=W),t},_parseWidth:function(t,e,i){var s=this.qtip.elements,o=de+b(e)+"Width";return(i?_(i,o):_(s.content,o)||_(this._useTitle(t)&&s.titlebar||s.content,o)||_(s.tooltip,o))||0},_parseRadius:function(t){var e=this.qtip.elements,i=de+b(t.y)+b(t.x)+"Radius";return 9>oe.ie?0:_(this._useTitle(t)&&e.titlebar||e.content,i)||_(e.tooltip,i)||0},_invalidColour:function(t,e,i){var s=t.css(e);return!s||i&&s===t.css(i)||ve.test(s)?k:s},_parseColours:function(t){var e=this.qtip.elements,i=this.element.css("cssText",""),o=de+b(t[t.precedance])+b(pe),n=this._useTitle(t)&&e.titlebar||e.content,r=this._invalidColour,a=[];return a[0]=r(i,ue)||r(n,ue)||r(e.content,ue)||r(e.tooltip,ue)||i.css(ue),a[1]=r(i,o,pe)||r(n,o,pe)||r(e.content,o,pe)||r(e.tooltip,o,pe)||e.tooltip.css(o),s("*",i).add(i).css("cssText",ue+":"+fe+ge+";"+de+":0"+ge+";"),a},_calculateSize:function(t){var e,i,s,o=t.precedance===L,n=this.options.width,r=this.options.height,a="c"===t.abbrev(),h=(o?n:r)*(a?.5:1),l=Math.pow,c=Math.round,d=Math.sqrt(l(h,2)+l(r,2)),p=[this.border/h*d,this.border/r*d];return p[2]=Math.sqrt(l(p[0],2)-l(this.border,2)),p[3]=Math.sqrt(l(p[1],2)-l(this.border,2)),e=d+p[2]+p[3]+(a?0:p[0]),i=e/d,s=[c(i*n),c(i*r)],o?s:s.reverse()},_calculateTip:function(t,e,i){i=i||1,e=e||this.size;var s=e[0]*i,o=e[1]*i,n=Math.ceil(s/2),r=Math.ceil(o/2),a={br:[0,0,s,o,s,0],bl:[0,0,s,0,0,o],tr:[0,o,s,0,s,o],tl:[0,0,0,o,s,o],tc:[0,o,n,0,s,o],bc:[0,0,s,0,n,o],rc:[0,0,s,r,0,o],lc:[s,0,s,o,0,r]};return a.lt=a.br,a.rt=a.bl,a.lb=a.tr,a.rb=a.tl,a[t.abbrev()]},_drawCoords:function(t,e){t.beginPath(),t.moveTo(e[0],e[1]),t.lineTo(e[2],e[3]),t.lineTo(e[4],e[5]),t.closePath()},create:function(){var t=this.corner=(me||oe.ie)&&this._parseCorner(this.options.corner);return(this.enabled=!!this.corner&&"c"!==this.corner.abbrev())&&(this.qtip.cache.corner=t.clone(),this.update()),this.element.toggle(this.enabled),this.corner},update:function(e,i){if(!this.enabled)return this;var o,n,r,a,h,l,c,d,p=this.qtip.elements,u=this.element,f=u.children(),g=this.options,m=this.size,v=g.mimic,y=Math.round;e||(e=this.qtip.cache.corner||this.corner),v===k?v=e:(v=new z(v),v.precedance=e.precedance,"inherit"===v.x?v.x=e.x:"inherit"===v.y?v.y=e.y:v.x===v.y&&(v[e.precedance]=e[e.precedance])),n=v.precedance,e.precedance===S?this._swapDimensions():this._resetDimensions(),o=this.color=this._parseColours(e),o[1]!==fe?(d=this.border=this._parseWidth(e,e[e.precedance]),g.border&&1>d&&!ve.test(o[1])&&(o[0]=o[1]),this.border=d=g.border!==W?g.border:d):this.border=d=0,c=this.size=this._calculateSize(e),u.css({width:c[0],height:c[1],lineHeight:c[1]+"px"}),l=e.precedance===L?[y(v.x===F?d:v.x===P?c[0]-m[0]-d:(c[0]-m[0])/2),y(v.y===D?c[1]-m[1]:0)]:[y(v.x===F?c[0]-m[0]:0),y(v.y===D?d:v.y===O?c[1]-m[1]-d:(c[1]-m[1])/2)],me?(r=f[0].getContext("2d"),r.restore(),r.save(),r.clearRect(0,0,6e3,6e3),a=this._calculateTip(v,m,xe),h=this._calculateTip(v,this.size,xe),f.attr(A,c[0]*xe).attr(B,c[1]*xe),f.css(A,c[0]).css(B,c[1]),this._drawCoords(r,h),r.fillStyle=o[1],r.fill(),r.translate(l[0]*xe,l[1]*xe),this._drawCoords(r,a),r.fillStyle=o[0],r.fill()):(a=this._calculateTip(v),a="m"+a[0]+","+a[1]+" l"+a[2]+","+a[3]+" "+a[4]+","+a[5]+" xe",l[2]=d&&/^(r|b)/i.test(e.string())?8===oe.ie?2:1:0,f.css({coordsize:c[0]+d+" "+(c[1]+d),antialias:""+(v.string().indexOf(N)>-1),left:l[0]-l[2]*Number(n===S),top:l[1]-l[2]*Number(n===L),width:c[0]+d,height:c[1]+d}).each(function(t){var e=s(this);e[e.prop?"prop":"attr"]({coordsize:c[0]+d+" "+(c[1]+d),path:a,fillcolor:o[0],filled:!!t,stroked:!t}).toggle(!(!d&&!t)),!t&&e.html(qe("stroke",'weight="'+2*d+'px" color="'+o[1]+'" miterlimit="1000" joinstyle="miter"'))})),t.opera&&setTimeout(function(){p.tip.css({display:"inline-block",visibility:"visible"})},1),i!==k&&this.calculate(e,c)},calculate:function(t,e){if(!this.enabled)return k;var i,o,n=this,r=this.qtip.elements,a=this.element,h=this.options.offset,l=(r.tooltip.hasClass("ui-widget"),{});return t=t||this.corner,i=t.precedance,e=e||this._calculateSize(t),o=[t.x,t.y],i===S&&o.reverse(),s.each(o,function(s,o){var a,c,d;o===N?(a=i===L?F:D,l[a]="50%",l[ce+"-"+a]=-Math.round(e[i===L?0:1]/2)+h):(a=n._parseWidth(t,o,r.tooltip),c=n._parseWidth(t,o,r.content),d=n._parseRadius(t),l[o]=Math.max(-n.border,s?c:h+(d>a?d:-a)))
}),l[t[i]]-=e[i===S?0:1],a.css({margin:"",top:"",bottom:"",left:"",right:""}).css(l),l},reposition:function(t,e,s){function o(t,e,i,s,o){t===V&&l.precedance===e&&c[s]&&l[i]!==N?l.precedance=l.precedance===S?L:S:t!==V&&c[s]&&(l[e]=l[e]===N?c[s]>0?s:o:l[e]===s?o:s)}function n(t,e,o){l[t]===N?g[ce+"-"+e]=f[t]=r[ce+"-"+e]-c[e]:(a=r[o]!==i?[c[e],-r[e]]:[-c[e],r[e]],(f[t]=Math.max(a[0],a[1]))>a[0]&&(s[e]-=c[e],f[e]=k),g[r[o]!==i?o:e]=f[t])}if(this.enabled){var r,a,h=e.cache,l=this.corner.clone(),c=s.adjusted,d=e.options.position.adjust.method.split(" "),p=d[0],u=d[1]||d[0],f={left:k,top:k,x:0,y:0},g={};this.corner.fixed!==W&&(o(p,S,L,F,P),o(u,L,S,D,O),l.string()===h.corner.string()||h.cornerTop===c.top&&h.cornerLeft===c.left||this.update(l,k)),r=this.calculate(l),r.right!==i&&(r.left=-r.right),r.bottom!==i&&(r.top=-r.bottom),r.user=this.offset,(f.left=p===V&&!!c.left)&&n(S,F,P),(f.top=u===V&&!!c.top)&&n(L,D,O),this.element.css(g).toggle(!(f.x&&f.y||l.x===N&&f.y||l.y===N&&f.x)),s.left-=r.left.charAt?r.user:p!==V||f.top||!f.left&&!f.top?r.left+this.border:0,s.top-=r.top.charAt?r.user:u!==V||f.left||!f.left&&!f.top?r.top+this.border:0,h.cornerLeft=c.left,h.cornerTop=c.top,h.corner=l.clone()}},destroy:function(){this.qtip._unbind(this.qtip.tooltip,this._ns),this.qtip.elements.tip&&this.qtip.elements.tip.find("*").remove().end().remove()}}),le=R.tip=function(t){return new x(t,t.options.style.tip)},le.initialize="render",le.sanitize=function(t){if(t.style&&"tip"in t.style){var e=t.style.tip;"object"!=typeof e&&(e=t.style.tip={corner:e}),/string|boolean/i.test(typeof e.corner)||(e.corner=W)}},M.tip={"^position.my|style.tip.(corner|mimic|border)$":function(){this.create(),this.qtip.reposition()},"^style.tip.(height|width)$":function(t){this.size=[t.width,t.height],this.update(),this.qtip.reposition()},"^content.title|style.(classes|widget)$":function(){this.update()}},s.extend(W,T.defaults,{style:{tip:{corner:W,mimic:k,width:6,height:6,border:W,offset:0}}});var Ce,Te,je="qtip-modal",ze="."+je;Te=function(){function t(t){if(s.expr[":"].focusable)return s.expr[":"].focusable;var e,i,o,n=!isNaN(s.attr(t,"tabindex")),r=t.nodeName&&t.nodeName.toLowerCase();return"area"===r?(e=t.parentNode,i=e.name,t.href&&i&&"map"===e.nodeName.toLowerCase()?(o=s("img[usemap=#"+i+"]")[0],!!o&&o.is(":visible")):!1):/input|select|textarea|button|object/.test(r)?!t.disabled:"a"===r?t.href||n:n}function i(t){1>c.length&&t.length?t.not("body").blur():c.first().focus()}function o(t){if(h.is(":visible")){var e,o=s(t.target),a=n.tooltip,l=o.closest(U);e=1>l.length?k:parseInt(l[0].style.zIndex,10)>parseInt(a[0].style.zIndex,10),e||o.closest(U)[0]===a[0]||i(o),r=t.target===c[c.length-1]}}var n,r,a,h,l=this,c={};s.extend(l,{init:function(){return h=l.elem=s("<div />",{id:"qtip-overlay",html:"<div></div>",mousedown:function(){return k}}).hide(),s(e.body).bind("focusin"+ze,o),s(e).bind("keydown"+ze,function(t){n&&n.options.show.modal.escape&&27===t.keyCode&&n.hide(t)}),h.bind("click"+ze,function(t){n&&n.options.show.modal.blur&&n.hide(t)}),l},update:function(e){n=e,c=e.options.show.modal.stealfocus!==k?e.tooltip.find("*").filter(function(){return t(this)}):[]},toggle:function(t,o,r){var c=(s(e.body),t.tooltip),d=t.options.show.modal,p=d.effect,u=o?"show":"hide",f=h.is(":visible"),g=s(ze).filter(":visible:not(:animated)").not(c);return l.update(t),o&&d.stealfocus!==k&&i(s(":focus")),h.toggleClass("blurs",d.blur),o&&h.appendTo(e.body),h.is(":animated")&&f===o&&a!==k||!o&&g.length?l:(h.stop(W,k),s.isFunction(p)?p.call(h,o):p===k?h[u]():h.fadeTo(parseInt(r,10)||90,o?1:0,function(){o||h.hide()}),o||h.queue(function(t){h.css({left:"",top:""}),s(ze).length||h.detach(),t()}),a=o,n.destroyed&&(n=E),l)}}),l.init()},Te=new Te,s.extend(q.prototype,{init:function(t){var e=t.tooltip;return this.options.on?(t.elements.overlay=Te.elem,e.addClass(je).css("z-index",T.modal_zindex+s(ze).length),t._bind(e,["tooltipshow","tooltiphide"],function(t,i,o){var n=t.originalEvent;if(t.target===e[0])if(n&&"tooltiphide"===t.type&&/mouse(leave|enter)/.test(n.type)&&s(n.relatedTarget).closest(Te.elem[0]).length)try{t.preventDefault()}catch(r){}else(!n||n&&"tooltipsolo"!==n.type)&&this.toggle(t,"tooltipshow"===t.type,o)},this._ns,this),t._bind(e,"tooltipfocus",function(t,i){if(!t.isDefaultPrevented()&&t.target===e[0]){var o=s(ze),n=T.modal_zindex+o.length,r=parseInt(e[0].style.zIndex,10);Te.elem[0].style.zIndex=n-1,o.each(function(){this.style.zIndex>r&&(this.style.zIndex-=1)}),o.filter("."+Z).qtip("blur",t.originalEvent),e.addClass(Z)[0].style.zIndex=n,Te.update(i);try{t.preventDefault()}catch(a){}}},this._ns,this),t._bind(e,"tooltiphide",function(t){t.target===e[0]&&s(ze).filter(":visible").not(e).last().qtip("focus",t)},this._ns,this),i):this},toggle:function(t,e,s){return t&&t.isDefaultPrevented()?this:(Te.toggle(this.qtip,!!e,s),i)},destroy:function(){this.qtip.tooltip.removeClass(je),this.qtip._unbind(this.qtip.tooltip,this._ns),Te.toggle(this.qtip,k),delete this.qtip.elements.overlay}}),Ce=R.modal=function(t){return new q(t,t.options.show.modal)},Ce.sanitize=function(t){t.show&&("object"!=typeof t.show.modal?t.show.modal={on:!!t.show.modal}:t.show.modal.on===i&&(t.show.modal.on=W))},T.modal_zindex=T.zindex-200,Ce.initialize="render",M.modal={"^show.modal.(on|blur)$":function(){this.destroy(),this.init(),this.qtip.elems.overlay.toggle(this.qtip.tooltip[0].offsetWidth>0)}},s.extend(W,T.defaults,{show:{modal:{on:k,effect:W,blur:W,stealfocus:W,escape:W}}}),R.viewport=function(i,s,o,n,r,a,h){function l(t,e,i,o,n,r,a,h,l){var c=s[n],p=_[t],b=x[t],w=i===V,q=p===n?l:p===r?-l:-l/2,C=b===n?h:b===r?-h:-h/2,T=v[n]+y[n]-(f?0:u[n]),j=T-c,z=c+l-(a===A?g:m)-T,M=q-(_.precedance===t||p===_[e]?C:0)-(b===N?h/2:0);return w?(M=(p===n?1:-1)*q,s[n]+=j>0?j:z>0?-z:0,s[n]=Math.max(-u[n]+y[n],c-M,Math.min(Math.max(-u[n]+y[n]+(a===A?g:m),c+M),s[n],"center"===p?c-q:1e9))):(o*=i===$?2:0,j>0&&(p!==n||z>0)?(s[n]-=M+o,d.invert(t,n)):z>0&&(p!==r||j>0)&&(s[n]-=(p===N?-M:M)+o,d.invert(t,r)),v>s[n]&&-s[n]>z&&(s[n]=c,d=_.clone())),s[n]-c}var c,d,p,u,f,g,m,v,y,b=o.target,w=i.elements.tooltip,_=o.my,x=o.at,q=o.adjust,C=q.method.split(" "),T=C[0],j=C[1]||C[0],z=o.viewport,M=o.container,I=i.cache,W={left:0,top:0};return z.jquery&&b[0]!==t&&b[0]!==e.body&&"none"!==q.method?(u=M.offset()||W,f="static"===M.css("position"),c="fixed"===w.css("position"),g=z[0]===t?z.width():z.outerWidth(k),m=z[0]===t?z.height():z.outerHeight(k),v={left:c?0:z.scrollLeft(),top:c?0:z.scrollTop()},y=z.offset()||W,("shift"!==T||"shift"!==j)&&(d=_.clone()),W={left:"none"!==T?l(S,L,T,q.x,F,P,A,n,a):0,top:"none"!==j?l(L,S,j,q.y,D,O,B,r,h):0},d&&I.lastClass!==(p=X+"-pos-"+d.abbrev())&&w.removeClass(i.cache.lastClass).addClass(i.cache.lastClass=p),W):W},R.polys={polygon:function(t,e){var i,s,o,n={width:0,height:0,position:{top:1e10,right:0,bottom:0,left:1e10},adjustable:k},r=0,a=[],h=1,l=1,c=0,d=0;for(r=t.length;r--;)i=[parseInt(t[--r],10),parseInt(t[r+1],10)],i[0]>n.position.right&&(n.position.right=i[0]),i[0]<n.position.left&&(n.position.left=i[0]),i[1]>n.position.bottom&&(n.position.bottom=i[1]),i[1]<n.position.top&&(n.position.top=i[1]),a.push(i);if(s=n.width=Math.abs(n.position.right-n.position.left),o=n.height=Math.abs(n.position.bottom-n.position.top),"c"===e.abbrev())n.position={left:n.position.left+n.width/2,top:n.position.top+n.height/2};else{for(;s>0&&o>0&&h>0&&l>0;)for(s=Math.floor(s/2),o=Math.floor(o/2),e.x===F?h=s:e.x===P?h=n.width-s:h+=Math.floor(s/2),e.y===D?l=o:e.y===O?l=n.height-o:l+=Math.floor(o/2),r=a.length;r--&&!(2>a.length);)c=a[r][0]-n.position.left,d=a[r][1]-n.position.top,(e.x===F&&c>=h||e.x===P&&h>=c||e.x===N&&(h>c||c>n.width-h)||e.y===D&&d>=l||e.y===O&&l>=d||e.y===N&&(l>d||d>n.height-l))&&a.splice(r,1);n.position={left:a[0][0],top:a[0][1]}}return n},rect:function(t,e,i,s){return{width:Math.abs(i-t),height:Math.abs(s-e),position:{left:Math.min(t,i),top:Math.min(e,s)}}},_angles:{tc:1.5,tr:7/4,tl:5/4,bc:.5,br:.25,bl:.75,rc:2,lc:1,c:0},ellipse:function(t,e,i,s,o){var n=R.polys._angles[o.abbrev()],r=0===n?0:i*Math.cos(n*Math.PI),a=s*Math.sin(n*Math.PI);return{width:2*i-Math.abs(r),height:2*s-Math.abs(a),position:{left:t+r,top:e+a},adjustable:k}},circle:function(t,e,i,s){return R.polys.ellipse(t,e,i,i,s)}},R.svg=function(t,i,o){for(var n,r,a,h,l,c,d,p,u,f,g,m=s(e),v=i[0],y=s(v.ownerSVGElement),b=1,w=1,_=!0;!v.getBBox;)v=v.parentNode;if(!v.getBBox||!v.parentNode)return k;n=y.attr("width")||y.width()||parseInt(y.css("width"),10),r=y.attr("height")||y.height()||parseInt(y.css("height"),10);var x=(parseInt(i.css("stroke-width"),10)||0)/2;switch(x&&(b+=x/n,w+=x/r),v.nodeName){case"ellipse":case"circle":f=R.polys.ellipse(v.cx.baseVal.value,v.cy.baseVal.value,(v.rx||v.r).baseVal.value+x,(v.ry||v.r).baseVal.value+x,o);break;case"line":case"polygon":case"polyline":for(u=v.points||[{x:v.x1.baseVal.value,y:v.y1.baseVal.value},{x:v.x2.baseVal.value,y:v.y2.baseVal.value}],f=[],p=-1,c=u.numberOfItems||u.length;c>++p;)d=u.getItem?u.getItem(p):u[p],f.push.apply(f,[d.x,d.y]);f=R.polys.polygon(f,o);break;default:f=v.getBoundingClientRect(),f={width:f.width,height:f.height,position:{left:f.left,top:f.top}},_=!1}return g=f.position,y=y[0],_&&(y.createSVGPoint&&(a=v.getScreenCTM(),u=y.createSVGPoint(),u.x=g.left,u.y=g.top,h=u.matrixTransform(a),g.left=h.x,g.top=h.y),y.viewBox&&(l=y.viewBox.baseVal)&&l.width&&l.height&&(b*=n/l.width,w*=r/l.height)),g.left+=m.scrollLeft(),g.top+=m.scrollTop(),f},R.imagemap=function(t,e,i){e.jquery||(e=s(e));var o,n,r,a,h,l=e.attr("shape").toLowerCase().replace("poly","polygon"),c=s('img[usemap="#'+e.parent("map").attr("name")+'"]'),d=s.trim(e.attr("coords")),p=d.replace(/,$/,"").split(",");if(!c.length)return k;if("polygon"===l)a=R.polys.polygon(p,i);else{if(!R.polys[l])return k;for(r=-1,h=p.length,n=[];h>++r;)n.push(parseInt(p[r],10));a=R.polys[l].apply(this,n.concat(i))}return o=c.offset(),o.left+=Math.ceil((c.outerWidth(k)-c.width())/2),o.top+=Math.ceil((c.outerHeight(k)-c.height())/2),a.position.left+=o.left,a.position.top+=o.top,a};var Me,Ie='<iframe class="qtip-bgiframe" frameborder="0" tabindex="-1" src="javascript:\'\';"  style="display:block; position:absolute; z-index:-1; filter:alpha(opacity=0); -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";"></iframe>';s.extend(C.prototype,{_scroll:function(){var e=this.qtip.elements.overlay;e&&(e[0].style.top=s(t).scrollTop()+"px")},init:function(i){var o=i.tooltip;1>s("select, object").length&&(this.bgiframe=i.elements.bgiframe=s(Ie).appendTo(o),i._bind(o,"tooltipmove",this.adjustBGIFrame,this._ns,this)),this.redrawContainer=s("<div/>",{id:X+"-rcontainer"}).appendTo(e.body),i.elements.overlay&&i.elements.overlay.addClass("qtipmodal-ie6fix")&&(i._bind(t,["scroll","resize"],this._scroll,this._ns,this),i._bind(o,["tooltipshow"],this._scroll,this._ns,this)),this.redraw()},adjustBGIFrame:function(){var t,e,i=this.qtip.tooltip,s={height:i.outerHeight(k),width:i.outerWidth(k)},o=this.qtip.plugins.tip,n=this.qtip.elements.tip;e=parseInt(i.css("borderLeftWidth"),10)||0,e={left:-e,top:-e},o&&n&&(t="x"===o.corner.precedance?[A,F]:[B,D],e[t[1]]-=n[t[0]]()),this.bgiframe.css(e).css(s)},redraw:function(){if(1>this.qtip.rendered||this.drawing)return this;var t,e,i,s,o=this.qtip.tooltip,n=this.qtip.options.style,r=this.qtip.options.position.container;return this.qtip.drawing=1,n.height&&o.css(B,n.height),n.width?o.css(A,n.width):(o.css(A,"").appendTo(this.redrawContainer),e=o.width(),1>e%2&&(e+=1),i=o.css("maxWidth")||"",s=o.css("minWidth")||"",t=(i+s).indexOf("%")>-1?r.width()/100:0,i=(i.indexOf("%")>-1?t:1)*parseInt(i,10)||e,s=(s.indexOf("%")>-1?t:1)*parseInt(s,10)||0,e=i+s?Math.min(Math.max(e,s),i):e,o.css(A,Math.round(e)).appendTo(r)),this.drawing=0,this},destroy:function(){this.bgiframe&&this.bgiframe.remove(),this.qtip._unbind([t,this.qtip.tooltip],this._ns)}}),Me=R.ie6=function(t){return 6===oe.ie?new C(t):k},Me.initialize="render",M.ie6={"^content|style$":function(){this.redraw()}}})})(window,document);
//@ sourceMappingURL=http://cdnjs.cloudflare.com/ajax/libs/qtip2/2.2.0/jquery.qtip.min.map
/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||function(e){"use strict";if(typeof e==="undefined"||typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=t.createElementNS("http://www.w3.org/1999/xhtml","a"),o="download"in r,a=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},i=/constructor/i.test(e.HTMLElement)||e.safari,f=/CriOS\/[\d]+/.test(navigator.userAgent),u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},s="application/octet-stream",d=1e3*40,c=function(e){var t=function(){if(typeof e==="string"){n().revokeObjectURL(e)}else{e.remove()}};setTimeout(t,d)},l=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var o=e["on"+t[r]];if(typeof o==="function"){try{o.call(e,n||e)}catch(a){u(a)}}}},p=function(e){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)){return new Blob([String.fromCharCode(65279),e],{type:e.type})}return e},v=function(t,u,d){if(!d){t=p(t)}var v=this,w=t.type,m=w===s,y,h=function(){l(v,"writestart progress write writeend".split(" "))},S=function(){if((f||m&&i)&&e.FileReader){var r=new FileReader;r.onloadend=function(){var t=f?r.result:r.result.replace(/^data:[^;]*;/,"data:attachment/file;");var n=e.open(t,"_blank");if(!n)e.location.href=t;t=undefined;v.readyState=v.DONE;h()};r.readAsDataURL(t);v.readyState=v.INIT;return}if(!y){y=n().createObjectURL(t)}if(m){e.location.href=y}else{var o=e.open(y,"_blank");if(!o){e.location.href=y}}v.readyState=v.DONE;h();c(y)};v.readyState=v.INIT;if(o){y=n().createObjectURL(t);setTimeout(function(){r.href=y;r.download=u;a(r);h();c(y);v.readyState=v.DONE});return}S()},w=v.prototype,m=function(e,t,n){return new v(e,t||e.name||"download",n)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(e,t,n){t=t||e.name||"download";if(!n){e=p(e)}return navigator.msSaveOrOpenBlob(e,t)}}w.abort=function(){};w.readyState=w.INIT=0;w.WRITING=1;w.DONE=2;w.error=w.onwritestart=w.onprogress=w.onwrite=w.onabort=w.onerror=w.onwriteend=null;return m}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!==null){define("FileSaver.js",function(){return saveAs})}
/*!
 * This file is part of Cytoscape.js 2.4.7.
 *
 * Cytoscape.js is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * Cytoscape.js is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with
 * Cytoscape.js. If not, see <http://www.gnu.org/licenses/>.
 */
var cytoscape;!function(e){"use strict";var t=cytoscape=function(){return cytoscape.init.apply(cytoscape,arguments)};t.version="2.4.7",t.init=function(e){return void 0===e&&(e={}),t.is.plainObject(e)?new t.Core(e):t.is.string(e)?t.extension.apply(t.extension,arguments):void 0},t.fn={},"undefined"!=typeof module&&module.exports&&(module.exports=cytoscape),"undefined"!=typeof define&&define.amd&&define("cytoscape",function(){return cytoscape}),e&&(e.cytoscape=cytoscape)}("undefined"==typeof window?null:window),this.cytoscape=cytoscape,function(e){"use strict";var t=0,r=1,i=2,n=function(e){return this instanceof n?(this.id="Thenable/1.0.7",this.state=t,this.fulfillValue=void 0,this.rejectReason=void 0,this.onFulfilled=[],this.onRejected=[],this.proxy={then:this.then.bind(this)},void("function"==typeof e&&e.call(this,this.fulfill.bind(this),this.reject.bind(this)))):new n(e)};n.prototype={fulfill:function(e){return a(this,r,"fulfillValue",e)},reject:function(e){return a(this,i,"rejectReason",e)},then:function(e,t){var r=this,i=new n;return r.onFulfilled.push(l(e,i,"fulfill")),r.onRejected.push(l(t,i,"reject")),o(r),i.proxy}};var a=function(e,r,i,n){return e.state===t&&(e.state=r,e[i]=n,o(e)),e},o=function(e){e.state===r?s(e,"onFulfilled",e.fulfillValue):e.state===i&&s(e,"onRejected",e.rejectReason)},s=function(e,t,r){if(0!==e[t].length){var i=e[t];e[t]=[];var n=function(){for(var e=0;e<i.length;e++)i[e](r)};"object"==typeof process&&"function"==typeof process.nextTick?process.nextTick(n):"function"==typeof setImmediate?setImmediate(n):setTimeout(n,0)}},l=function(e,t,r){return function(i){if("function"!=typeof e)t[r].call(t,i);else{var n;try{n=e(i)}catch(a){return void t.reject(a)}u(t,n)}}},u=function(e,t){if(e===t||e.proxy===t)return void e.reject(new TypeError("cannot resolve promise with itself"));var r;if("object"==typeof t&&null!==t||"function"==typeof t)try{r=t.then}catch(i){return void e.reject(i)}if("function"!=typeof r)e.fulfill(t);else{var n=!1;try{r.call(t,function(r){n||(n=!0,r===t?e.reject(new TypeError("circular thenable chain")):u(e,r))},function(t){n||(n=!0,e.reject(t))})}catch(i){n||e.reject(i)}}};e.Promise="undefined"==typeof Promise?n:Promise,e.Promise.all=e.Promise.all||function(t){return new e.Promise(function(e,r){for(var i=new Array(t.length),n=0,a=function(r,a){i[r]=a,n++,n===t.length&&e(i)},o=0;o<t.length;o++)!function(e){var i=t[e],n=null!=i.then;if(n)i.then(function(t){a(e,t)},function(e){r(e)});else{var o=i;a(e,o)}}(o)})}}(cytoscape),function(e,t){"use strict";var r="string",i=typeof{},n="function";e.is={defined:function(e){return null!=e},string:function(e){return null!=e&&typeof e==r},fn:function(e){return null!=e&&typeof e===n},array:function(e){return Array.isArray?Array.isArray(e):null!=e&&e instanceof Array},plainObject:function(t){return null!=t&&typeof t===i&&!e.is.array(t)&&t.constructor===Object},object:function(e){return null!=e&&typeof e===i},number:function(e){return null!=e&&"number"==typeof e&&!isNaN(e)},integer:function(t){return e.is.number(t)&&Math.floor(t)===t},color:function(e){return null!=e&&"string"==typeof e&&""!==$.Color(e).toString()},bool:function(e){return null!=e&&typeof e==typeof!0},elementOrCollection:function(t){return e.is.element(t)||e.is.collection(t)},element:function(t){return t instanceof e.Element&&t._private.single},collection:function(t){return t instanceof e.Collection&&!t._private.single},core:function(t){return t instanceof e.Core},style:function(t){return t instanceof e.Style},stylesheet:function(t){return t instanceof e.Stylesheet},event:function(t){return t instanceof e.Event},thread:function(t){return t instanceof e.Thread},fabric:function(t){return t instanceof e.Fabric},emptyString:function(t){return t?e.is.string(t)&&(""===t||t.match(/^\s+$/))?!0:!1:!0},nonemptyString:function(t){return t&&e.is.string(t)&&""!==t&&!t.match(/^\s+$/)?!0:!1},domElement:function(e){return"undefined"==typeof HTMLElement?!1:e instanceof HTMLElement},boundingBox:function(t){return e.is.plainObject(t)&&e.is.number(t.x1)&&e.is.number(t.x2)&&e.is.number(t.y1)&&e.is.number(t.y2)},promise:function(t){return e.is.object(t)&&e.is.fn(t.then)},touch:function(){return t&&("ontouchstart"in t||t.DocumentTouch&&document instanceof DocumentTouch)},gecko:function(){return"undefined"!=typeof InstallTrigger||"MozAppearance"in document.documentElement.style},webkit:function(){return"undefined"!=typeof webkitURL||"WebkitAppearance"in document.documentElement.style},chromium:function(){return"undefined"!=typeof chrome},khtml:function(){return navigator.vendor.match(/kde/i)},khtmlEtc:function(){return e.is.khtml()||e.is.webkit()||e.is.chromium()},trident:function(){/*@cc_on!@*/
return"undefined"!=typeof ActiveXObject||!1},windows:function(){return"undefined"!=typeof navigator&&navigator.appVersion.match(/Win/i)},mac:function(){return"undefined"!=typeof navigator&&navigator.appVersion.match(/Mac/i)},linux:function(){return"undefined"!=typeof navigator&&navigator.appVersion.match(/Linux/i)},unix:function(){return"undefined"!=typeof navigator&&navigator.appVersion.match(/X11/i)}}}(cytoscape,"undefined"==typeof window?null:window),function(e,t){"use strict";e.util={extend:function(){var t,r,i,n,a,o,s=arguments[0]||{},l=1,u=arguments.length,c=!1;for("boolean"==typeof s&&(c=s,s=arguments[1]||{},l=2),"object"==typeof s||e.is.fn(s)||(s={}),u===l&&(s=this,--l);u>l;l++)if(null!=(t=arguments[l]))for(r in t)i=s[r],n=t[r],s!==n&&(c&&n&&(e.is.plainObject(n)||(a=e.is.array(n)))?(a?(a=!1,o=i&&e.is.array(i)?i:[]):o=i&&e.is.plainObject(i)?i:{},s[r]=e.util.extend(c,o,n)):void 0!==n&&(s[r]=n));return s},require:function(r,i,n){var a;n=e.util.extend({msgIfNotFound:!0},n);var o=!1,s=function(e){o=!0,i(e)},l=function(e){t&&(a=t[r]),void 0!==a&&s(a),e&&e()},u=function(){o||c(d)},c=function(e){if("undefined"!=typeof module&&module.exports&&require)try{a=require(r)}catch(t){}void 0!==a&&s(a),e&&e()},d=function(){o||h(p)},h=function(e){"undefined"!=typeof define&&define.amd&&require&&require([r],function(t){a=t,void 0!==a&&s(a),e&&e()},function(t){e&&e()})},p=function(){!o&&n.msgIfNotFound&&e.util.error("Cytoscape.js tried to pull in dependency `"+r+"` but no module (i.e. CommonJS, AMD, or window) was found")};l(u)},requires:function(t,r){for(var i=[],n=[],a=function(){for(var e=0;e<t.length;e++)if(!n[e])return;r.apply(r,i)},o=0;o<t.length;o++)!function(){var r=t[o],s=o;e.util.require(r,function(e){i[s]=e,n[s]=!0,a()})}()},throttle:function(t,r,i){var n=!0,a=!0;return i===!1?n=!1:e.is.plainObject(i)&&(n="leading"in i?i.leading:n,a="trailing"in i?i.trailing:a),i=i||{},i.leading=n,i.maxWait=r,i.trailing=a,e.util.debounce(t,r,i)},now:function(){return+new Date},debounce:function(t,r,i){var n,a,o,s,l,u,c,d=0,h=!1,p=!0;if(e.is.fn(t)){if(r=Math.max(0,r)||0,i===!0){var v=!0;p=!1}else e.is.plainObject(i)&&(v=i.leading,h="maxWait"in i&&(Math.max(r,i.maxWait)||0),p="trailing"in i?i.trailing:p);var f=function(){var i=r-(e.util.now()-s);if(0>=i){a&&clearTimeout(a);var h=c;a=u=c=void 0,h&&(d=e.util.now(),o=t.apply(l,n),u||a||(n=l=null))}else u=setTimeout(f,i)},g=function(){u&&clearTimeout(u),a=u=c=void 0,(p||h!==r)&&(d=e.util.now(),o=t.apply(l,n),u||a||(n=l=null))};return function(){if(n=arguments,s=e.util.now(),l=this,c=p&&(u||!v),h===!1)var i=v&&!u;else{a||v||(d=s);var y=h-(s-d),m=0>=y;m?(a&&(a=clearTimeout(a)),d=s,o=t.apply(l,n)):a||(a=setTimeout(g,y))}return m&&u?u=clearTimeout(u):u||r===h||(u=setTimeout(f,r)),i&&(m=!0,o=t.apply(l,n)),!m||u||a||(n=l=null),o}}},error:function(e){if(!console)throw e;if(console.error)console.error.apply(console,arguments);else{if(!console.log)throw e;console.log.apply(console,arguments)}},clone:function(e){var t={};for(var r in e)t[r]=e[r];return t},copy:function(t){return null==t?t:e.is.array(t)?t.slice():e.is.plainObject(t)?e.util.clone(t):t},makeBoundingBox:function(e){if(null!=e.x1&&null!=e.y1){if(null!=e.x2&&null!=e.y2&&e.x2>=e.x1&&e.y2>=e.y1)return{x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,w:e.x2-e.x1,h:e.y2-e.y1};if(null!=e.w&&null!=e.h&&e.w>=0&&e.h>=0)return{x1:e.x1,y1:e.y1,x2:e.x1+e.w,y2:e.y1+e.h,w:e.w,h:e.h}}},mapEmpty:function(e){var t=!0;if(null!=e)for(var r in e){t=!1;break}return t},pushMap:function(t){var r=e.util.getMap(t);null==r?e.util.setMap($.extend({},t,{value:[t.value]})):r.push(t.value)},setMap:function(t){for(var r,i=t.map,n=t.keys,a=n.length,o=0;a>o;o++){var r=n[o];e.is.plainObject(r)&&e.util.error("Tried to set map with object key"),o<n.length-1?(null==i[r]&&(i[r]={}),i=i[r]):i[r]=t.value}},getMap:function(t){for(var r=t.map,i=t.keys,n=i.length,a=0;n>a;a++){var o=i[a];if(e.is.plainObject(o)&&e.util.error("Tried to get map with object key"),r=r[o],null==r)return r}return r},deleteMap:function(t){for(var r=t.map,i=t.keys,n=i.length,a=t.keepChildren,o=0;n>o;o++){var s=i[o];e.is.plainObject(s)&&e.util.error("Tried to delete map with object key");var l=o===t.keys.length-1;if(l)if(a)for(var u in r)a[u]||(r[u]=void 0);else r[s]=void 0;else r=r[s]}},capitalize:function(t){return e.is.emptyString(t)?t:t.charAt(0).toUpperCase()+t.substring(1)},trim:function(e){var t,r;for(t=0;t<e.length&&" "===e[t];t++);for(r=e.length-1;r>t&&" "===e[r];r--);return e.substring(t,r+1)},hex2tuple:function(e){if((4===e.length||7===e.length)&&"#"===e[0]){var t,r,i,n=4===e.length,a=16;return n?(t=parseInt(e[1]+e[1],a),r=parseInt(e[2]+e[2],a),i=parseInt(e[3]+e[3],a)):(t=parseInt(e[1]+e[2],a),r=parseInt(e[3]+e[4],a),i=parseInt(e[5]+e[6],a)),[t,r,i]}},hsl2tuple:function(t){function r(e,t,r){return 0>r&&(r+=1),r>1&&(r-=1),1/6>r?e+6*(t-e)*r:.5>r?t:2/3>r?e+(t-e)*(2/3-r)*6:e}var i,n,a,o,s,l,u,c,d=new RegExp("^"+e.util.regex.hsla+"$").exec(t);if(d){if(n=parseInt(d[1]),0>n?n=(360- -1*n%360)%360:n>360&&(n%=360),n/=360,a=parseFloat(d[2]),0>a||a>100)return;if(a/=100,o=parseFloat(d[3]),0>o||o>100)return;if(o/=100,s=d[4],void 0!==s&&(s=parseFloat(s),0>s||s>1))return;if(0===a)l=u=c=Math.round(255*o);else{var h=.5>o?o*(1+a):o+a-o*a,p=2*o-h;l=Math.round(255*r(p,h,n+1/3)),u=Math.round(255*r(p,h,n)),c=Math.round(255*r(p,h,n-1/3))}i=[l,u,c,s]}return i},rgb2tuple:function(t){var r,i=new RegExp("^"+e.util.regex.rgba+"$").exec(t);if(i){r=[];for(var n=[],a=1;3>=a;a++){var o=i[a];if("%"===o[o.length-1]&&(n[a]=!0),o=parseFloat(o),n[a]&&(o=o/100*255),0>o||o>255)return;r.push(Math.floor(o))}var s=n[1]||n[2]||n[3],l=n[1]&&n[2]&&n[3];if(s&&!l)return;var u=i[4];if(void 0!==u){if(u=parseFloat(u),0>u||u>1)return;r.push(u)}}return r},colorname2tuple:function(t){return e.util.colors[t.toLowerCase()]},color2tuple:function(t){return(e.is.array(t)?t:null)||e.util.colorname2tuple(t)||e.util.hex2tuple(t)||e.util.rgb2tuple(t)||e.util.hsl2tuple(t)},tuple2hex:function(e){function t(e){var t=e.toString(16);return 1===t.length&&(t="0"+t),t}var r=e[0],i=e[1],n=e[2];return"#"+t(r)+t(i)+t(n)},colors:{transparent:[0,0,0,0],aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],grey:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]},memoize:function(e,t){var r=this,i={};return t||(t=function(){if(1===arguments.length)return arguments[0];for(var e=[],t=0;t<arguments.length;t++)e.push(arguments[t]);return e.join("$")}),function(){var n,a=arguments,o=t.apply(r,a);return(n=i[o])||(n=i[o]=e.apply(r,a)),n}}},e.util.camel2dash=e.util.memoize(function(e){for(var t=[],r=0;r<e.length;r++){var i=e[r],n=i.toLowerCase(),a=i!==n;a?(t.push("-"),t.push(n)):t.push(i)}var o=t.length===e.length;return o?e:t.join("")}),e.util.dash2camel=e.util.memoize(function(e){for(var t=[],r=!1,i=0;i<e.length;i++){var n=e[i],a="-"===n;a?r=!0:(t.push(r?n.toUpperCase():n),r=!1)}return t.join("")}),e.util.regex={},e.util.regex.number="(?:[-]?\\d*\\.\\d+|[-]?\\d+|[-]?\\d*\\.\\d+[eE]\\d+)",e.util.regex.rgba="rgb[a]?\\(("+e.util.regex.number+"[%]?)\\s*,\\s*("+e.util.regex.number+"[%]?)\\s*,\\s*("+e.util.regex.number+"[%]?)(?:\\s*,\\s*("+e.util.regex.number+"))?\\)",e.util.regex.rgbaNoBackRefs="rgb[a]?\\((?:"+e.util.regex.number+"[%]?)\\s*,\\s*(?:"+e.util.regex.number+"[%]?)\\s*,\\s*(?:"+e.util.regex.number+"[%]?)(?:\\s*,\\s*(?:"+e.util.regex.number+"))?\\)",e.util.regex.hsla="hsl[a]?\\(("+e.util.regex.number+")\\s*,\\s*("+e.util.regex.number+"[%])\\s*,\\s*("+e.util.regex.number+"[%])(?:\\s*,\\s*("+e.util.regex.number+"))?\\)",e.util.regex.hslaNoBackRefs="hsl[a]?\\((?:"+e.util.regex.number+")\\s*,\\s*(?:"+e.util.regex.number+"[%])\\s*,\\s*(?:"+e.util.regex.number+"[%])(?:\\s*,\\s*(?:"+e.util.regex.number+"))?\\)",e.util.regex.hex3="\\#[0-9a-fA-F]{3}",e.util.regex.hex6="\\#[0-9a-fA-F]{6}";var r=t?t.requestAnimationFrame||t.mozRequestAnimationFrame||t.webkitRequestAnimationFrame||t.msRequestAnimationFrame:null;r=r||function(e){e&&setTimeout(e,1e3/60)},e.util.requestAnimationFrame=function(e){r(e)}}(cytoscape,"undefined"==typeof window?null:window),function(e){"use strict";e.math={},e.math.signum=function(e){return e>0?1:0>e?-1:0},e.math.distance=function(e,t){var r=t.x-e.x,i=t.y-e.y;return Math.sqrt(r*r+i*i)},e.math.qbezierAt=function(e,t,r,i){return(1-i)*(1-i)*e+2*(1-i)*i*t+i*i*r},e.math.qbezierPtAt=function(t,r,i,n){return{x:e.math.qbezierAt(t.x,r.x,i.x,n),y:e.math.qbezierAt(t.y,r.y,i.y,n)}},e.math.boundingBoxesIntersect=function(e,t){return e.x1>t.x2?!1:t.x1>e.x2?!1:e.x2<t.x1?!1:t.x2<e.x1?!1:e.y2<t.y1?!1:t.y2<e.y1?!1:e.y1>t.y2?!1:t.y1>e.y2?!1:!0},e.math.inBoundingBox=function(e,t,r){return e.x1<=t&&t<=e.x2&&e.y1<=r&&r<=e.y2},e.math.pointInBoundingBox=function(e,t){return this.inBoundingBox(e,t.x,t.y)},e.math.roundRectangleIntersectLine=function(e,t,r,i,n,a,o){var s,l=this.getRoundRectangleRadius(n,a),u=n/2,c=a/2,d=r-u+l-o,h=i-c-o,p=r+u-l+o,v=h;if(s=this.finiteLinesIntersect(e,t,r,i,d,h,p,v,!1),s.length>0)return s;var f=r+u+o,g=i-c+l-o,y=f,m=i+c-l+o;if(s=this.finiteLinesIntersect(e,t,r,i,f,g,y,m,!1),s.length>0)return s;var x=r-u+l-o,b=i+c+o,w=r+u-l+o,_=b;if(s=this.finiteLinesIntersect(e,t,r,i,x,b,w,_,!1),s.length>0)return s;var E=r-u-o,S=i-c+l-o,D=E,k=i+c-l+o;if(s=this.finiteLinesIntersect(e,t,r,i,E,S,D,k,!1),s.length>0)return s;var T,P=r-u+l,C=i-c+l;if(T=this.intersectLineCircle(e,t,r,i,P,C,l+o),T.length>0&&T[0]<=P&&T[1]<=C)return[T[0],T[1]];var M=r+u-l,B=i-c+l;if(T=this.intersectLineCircle(e,t,r,i,M,B,l+o),T.length>0&&T[0]>=M&&T[1]<=B)return[T[0],T[1]];var N=r+u-l,I=i+c-l;if(T=this.intersectLineCircle(e,t,r,i,N,I,l+o),T.length>0&&T[0]>=N&&T[1]>=I)return[T[0],T[1]];var O=r-u+l,z=i+c-l;return T=this.intersectLineCircle(e,t,r,i,O,z,l+o),T.length>0&&T[0]<=O&&T[1]>=z?[T[0],T[1]]:[]},e.math.roundRectangleIntersectBox=function(e,t,r,i,n,a,o,s,l){var u=this.getRoundRectangleRadius(n,a),c=o-n/2-l,d=s-a/2+u-l,h=o+n/2+l,p=s+a/2-u+l,v=o-n/2+u-l,f=s-a/2-l,g=o+n/2-u+l,y=s+a/2+l,m=Math.min(e,r),x=Math.max(e,r),b=Math.min(t,i),w=Math.max(t,i);return c>x?!1:m>h?!1:f>w?!1:b>y?!1:c>=m&&x>=c&&d>=b&&w>=d?!0:h>=m&&x>=h&&d>=b&&w>=d?!0:h>=m&&x>=h&&p>=b&&w>=p?!0:c>=m&&x>=c&&p>=b&&w>=p?!0:m>=c&&h>=m&&b>=d&&p>=b?!0:x>=c&&h>=x&&b>=d&&p>=b?!0:x>=c&&h>=x&&w>=d&&p>=w?!0:m>=c&&h>=m&&w>=d&&p>=w?!0:v>=m&&x>=v&&f>=b&&w>=f?!0:g>=m&&x>=g&&f>=b&&w>=f?!0:g>=m&&x>=g&&y>=b&&w>=y?!0:v>=m&&x>=v&&y>=b&&w>=y?!0:m>=v&&g>=m&&b>=f&&y>=b?!0:x>=v&&g>=x&&b>=f&&y>=b?!0:x>=v&&g>=x&&w>=f&&y>=w?!0:m>=v&&g>=m&&w>=f&&y>=w?!0:this.boxIntersectEllipse(m,b,x,w,l,2*u,2*u,v+l,d+l)?!0:this.boxIntersectEllipse(m,b,x,w,l,2*u,2*u,g-l,d+l)?!0:this.boxIntersectEllipse(m,b,x,w,l,2*u,2*u,g-l,p-l)?!0:this.boxIntersectEllipse(m,b,x,w,l,2*u,2*u,v+l,p-l)?!0:!1},e.math.checkInBoundingCircle=function(e,t,r,i,n,a,o,s){return e=(e-o)/(n+i),t=(t-s)/(a+i),r>=e*e+t*t},e.math.boxInBezierVicinity=function(e,t,r,i,n,a,o,s,l,u,c){var d=.25*n+.5*o+.25*l,h=.25*a+.5*s+.25*u,p=Math.min(e,r)-c,v=Math.min(t,i)-c,f=Math.max(e,r)+c,g=Math.max(t,i)+c;if(n>=p&&f>=n&&a>=v&&g>=a)return 1;if(l>=p&&f>=l&&u>=v&&g>=u)return 1;if(d>=p&&f>=d&&h>=v&&g>=h)return 1;if(o>=p&&f>=o&&s>=v&&g>=s)return 1;var y=Math.min(n,d,l),m=Math.min(a,h,u),x=Math.max(n,d,l),b=Math.max(a,h,u);return y>f||p>x||m>g||v>b?0:1},e.math.checkBezierInBox=function(t,r,i,n,a,o,s,l,u,c,d){function h(d){var h=e.math.qbezierAt(a,s,u,d),p=e.math.qbezierAt(o,l,c,d);return h>=t&&i>=h&&p>=r&&n>=p}for(var p=0;1>=p;p+=.25)if(!h(p))return!1;return!0},e.math.checkStraightEdgeInBox=function(e,t,r,i,n,a,o,s,l){return n>=e&&r>=n&&o>=e&&r>=o&&a>=t&&i>=a&&s>=t&&i>=s},e.math.checkStraightEdgeCrossesBox=function(e,t,r,i,n,a,o,s,l){var u,c,d=Math.min(e,r)-l,h=Math.min(t,i)-l,p=Math.max(e,r)+l,v=Math.max(t,i)+l,f=o-n,g=n,y=s-a,m=a;if(Math.abs(f)<1e-4)return n>=d&&p>=n&&Math.min(a,s)<=h&&Math.max(a,s)>=v;var x=(d-g)/f;if(x>0&&1>=x&&(u=y*x+m,u>=h&&v>=u))return!0;var b=(p-g)/f;if(b>0&&1>=b&&(u=y*b+m,u>=h&&v>=u))return!0;var w=(h-m)/y;if(w>0&&1>=w&&(c=f*w+g,c>=d&&p>=c))return!0;var _=(v-m)/y;return _>0&&1>=_&&(c=f*_+g,c>=d&&p>=c)?!0:!1},e.math.checkBezierCrossesBox=function(e,t,r,i,n,a,o,s,l,u,c){var d=Math.min(e,r)-c,h=Math.min(t,i)-c,p=Math.max(e,r)+c,v=Math.max(t,i)+c;if(n>=d&&p>=n&&a>=h&&v>=a)return!0;if(l>=d&&p>=l&&u>=h&&v>=u)return!0;var f=n-2*o+l,g=-2*n+2*o,y=n,m=[];if(Math.abs(f)<1e-4){var x=(d-n)/g,b=(p-n)/g;m.push(x,b)}else{var w,_,E=g*g-4*f*(y-d);if(E>0){var S=Math.sqrt(E);w=(-g+S)/(2*f),_=(-g-S)/(2*f),m.push(w,_)}var D,k,T=g*g-4*f*(y-p);if(T>0){var S=Math.sqrt(T);D=(-g+S)/(2*f),k=(-g-S)/(2*f),m.push(D,k)}}m.sort(function(e,t){return e-t});var P=a-2*s+u,C=-2*a+2*s,M=a,B=[];if(Math.abs(P)<1e-4){var N=(h-a)/C,I=(v-a)/C;B.push(N,I)}else{var O,z,L=C*C-4*P*(M-h);if(L>0){var S=Math.sqrt(L);O=(-C+S)/(2*P),z=(-C-S)/(2*P),B.push(O,z)}var R,V,A=C*C-4*P*(M-v);if(A>0){var S=Math.sqrt(A);R=(-C+S)/(2*P),V=(-C-S)/(2*P),B.push(R,V)}}B.sort(function(e,t){return e-t});for(var X=0;X<m.length;X+=2)for(var F=1;F<B.length;F+=2)if(m[X]<B[F]&&B[F]>=0&&m[X]<=1&&m[X+1]>B[F-1]&&B[F-1]<=1&&m[X+1]>=0)return!0;return!1},e.math.inLineVicinity=function(e,t,r,i,n,a,o){var s=o,l=Math.min(r,n),u=Math.max(r,n),c=Math.min(i,a),d=Math.max(i,a);return e>=l-s&&u+s>=e&&t>=c-s&&d+s>=t},e.math.inBezierVicinity=function(e,t,r,i,n,a,o,s,l){var u={x1:Math.min(r,o,n),x2:Math.max(r,o,n),y1:Math.min(i,s,a),y2:Math.max(i,s,a)};return e<u.x1||e>u.x2||t<u.y1||t>u.y2?!1:!0},e.math.solveCubic=function(e,t,r,i,n){t/=e,r/=e,i/=e;var a,o,s,l,u,c,d,h;return o=(3*r-t*t)/9,s=-(27*i)+t*(9*r-2*t*t),s/=54,a=o*o*o+s*s,n[1]=0,d=t/3,a>0?(u=s+Math.sqrt(a),u=0>u?-Math.pow(-u,1/3):Math.pow(u,1/3),c=s-Math.sqrt(a),c=0>c?-Math.pow(-c,1/3):Math.pow(c,1/3),n[0]=-d+u+c,d+=(u+c)/2,n[4]=n[2]=-d,d=Math.sqrt(3)*(-c+u)/2,n[3]=d,void(n[5]=-d)):(n[5]=n[3]=0,0===a?(h=0>s?-Math.pow(-s,1/3):Math.pow(s,1/3),n[0]=-d+2*h,void(n[4]=n[2]=-(h+d))):(o=-o,l=o*o*o,l=Math.acos(s/Math.sqrt(l)),h=2*Math.sqrt(o),n[0]=-d+h*Math.cos(l/3),n[2]=-d+h*Math.cos((l+2*Math.PI)/3),void(n[4]=-d+h*Math.cos((l+4*Math.PI)/3))))},e.math.sqDistanceToQuadraticBezier=function(e,t,r,i,n,a,o,s){var l=1*r*r-4*r*n+2*r*o+4*n*n-4*n*o+o*o+i*i-4*i*a+2*i*s+4*a*a-4*a*s+s*s,u=9*r*n-3*r*r-3*r*o-6*n*n+3*n*o+9*i*a-3*i*i-3*i*s-6*a*a+3*a*s,c=3*r*r-6*r*n+r*o-r*e+2*n*n+2*n*e-o*e+3*i*i-6*i*a+i*s-i*t+2*a*a+2*a*t-s*t,d=1*r*n-r*r+r*e-n*e+i*a-i*i+i*t-a*t,h=[];this.solveCubic(l,u,c,d,h);for(var p=1e-7,v=[],f=0;6>f;f+=2)Math.abs(h[f+1])<p&&h[f]>=0&&h[f]<=1&&v.push(h[f]);v.push(1),v.push(0);for(var g,y,m,x,b=-1,w=0;w<v.length;w++)y=Math.pow(1-v[w],2)*r+2*(1-v[w])*v[w]*n+v[w]*v[w]*o,m=Math.pow(1-v[w],2)*i+2*(1-v[w])*v[w]*a+v[w]*v[w]*s,x=Math.pow(y-e,2)+Math.pow(m-t,2),b>=0?b>x&&(b=x,g=v[w]):(b=x,g=v[w]);return b},e.math.sqDistanceToFiniteLine=function(e,t,r,i,n,a){var o=[e-r,t-i],s=[n-r,a-i],l=s[0]*s[0]+s[1]*s[1],u=o[0]*o[0]+o[1]*o[1],c=o[0]*s[0]+o[1]*s[1],d=c*c/l;return 0>c?u:d>l?(e-n)*(e-n)+(t-a)*(t-a):u-d},e.math.pointInsidePolygon=function(e,t,r,i,n,a,o,s,l){var u=new Array(r.length),c=Math.asin(s[1]/Math.sqrt(s[0]*s[0]+s[1]*s[1]));s[0]<0?c+=Math.PI/2:c=-c-Math.PI/2;for(var d=Math.cos(-c),h=Math.sin(-c),p=0;p<u.length/2;p++)u[2*p]=a/2*(r[2*p]*d-r[2*p+1]*h),u[2*p+1]=o/2*(r[2*p+1]*d+r[2*p]*h),u[2*p]+=i,u[2*p+1]+=n;var v;if(l>0){var f=this.expandPolygon(u,-l);v=this.joinLines(f)}else v=u;for(var g,y,m,x,b,w=0,_=0,p=0;p<v.length/2;p++)if(g=v[2*p],y=v[2*p+1],p+1<v.length/2?(m=v[2*(p+1)],x=v[2*(p+1)+1]):(m=v[2*(p+1-v.length/2)],x=v[2*(p+1-v.length/2)+1]),g==e&&m==e);else{if(!(g>=e&&e>=m||e>=g&&m>=e))continue;b=(e-g)/(m-g)*(x-y)+y,b>t&&w++,t>b&&_++}return w%2===0?!1:!0},e.math.joinLines=function(e){for(var t,r,i,n,a,o,s,l,u=new Array(e.length/2),c=0;c<e.length/4;c++){t=e[4*c],r=e[4*c+1],i=e[4*c+2],n=e[4*c+3],c<e.length/4-1?(a=e[4*(c+1)],o=e[4*(c+1)+1],s=e[4*(c+1)+2],l=e[4*(c+1)+3]):(a=e[0],o=e[1],s=e[2],l=e[3]);var d=this.finiteLinesIntersect(t,r,i,n,a,o,s,l,!0);u[2*c]=d[0],u[2*c+1]=d[1]}return u},e.math.expandPolygon=function(e,t){for(var r,i,n,a,o=new Array(2*e.length),s=0;s<e.length/2;s++){r=e[2*s],i=e[2*s+1],s<e.length/2-1?(n=e[2*(s+1)],a=e[2*(s+1)+1]):(n=e[0],a=e[1]);var l=a-i,u=-(n-r),c=Math.sqrt(l*l+u*u),d=l/c,h=u/c;o[4*s]=r+d*t,o[4*s+1]=i+h*t,o[4*s+2]=n+d*t,o[4*s+3]=a+h*t}return o},e.math.intersectLineEllipse=function(e,t,r,i,n,a){var o=r-e,s=i-t;o/=n,s/=a;var l=Math.sqrt(o*o+s*s),u=l-1;if(0>u)return[];var c=u/l;return[(r-e)*c+e,(i-t)*c+t]},e.math.dotProduct=function(e,t){if(2!=e.length||2!=t.length)throw"dot product: arguments are not vectors";return e[0]*t[0]+e[1]*t[1]},e.math.intersectLineCircle=function(e,t,r,i,n,a,o){var s=[r-e,i-t],l=[n,a],u=[e-n,t-a],c=s[0]*s[0]+s[1]*s[1],d=2*(u[0]*s[0]+u[1]*s[1]),l=u[0]*u[0]+u[1]*u[1]-o*o,h=d*d-4*c*l;if(0>h)return[];var p=(-d+Math.sqrt(h))/(2*c),v=(-d-Math.sqrt(h))/(2*c),f=Math.min(p,v),g=Math.max(p,v),y=[];if(f>=0&&1>=f&&y.push(f),g>=0&&1>=g&&y.push(g),0===y.length)return[];var m=y[0]*s[0]+e,x=y[0]*s[1]+t;if(y.length>1){if(y[0]==y[1])return[m,x];var b=y[1]*s[0]+e,w=y[1]*s[1]+t;return[m,x,b,w]}return[m,x]},e.math.findCircleNearPoint=function(e,t,r,i,n){var a=i-e,o=n-t,s=Math.sqrt(a*a+o*o),l=a/s,u=o/s;return[e+l*r,t+u*r]},e.math.findMaxSqDistanceToOrigin=function(e){for(var t,r=1e-6,i=0;i<e.length/2;i++)t=e[2*i]*e[2*i]+e[2*i+1]*e[2*i+1],t>r&&(r=t);return r},e.math.finiteLinesIntersect=function(e,t,r,i,n,a,o,s,l){var u=(o-n)*(t-a)-(s-a)*(e-n),c=(r-e)*(t-a)-(i-t)*(e-n),d=(s-a)*(r-e)-(o-n)*(i-t);if(0!==d){var h=u/d,p=c/d;return h>=0&&1>=h&&p>=0&&1>=p?[e+h*(r-e),t+h*(i-t)]:l?[e+h*(r-e),t+h*(i-t)]:[]}return 0===u||0===c?[e,r,o].sort()[1]===o?[o,s]:[e,r,n].sort()[1]===n?[n,a]:[n,o,r].sort()[1]===r?[r,i]:[]:[]},e.math.boxIntersectEllipse=function(e,t,r,i,n,a,o,s,l){if(e>r){var u=e;e=r,r=u}if(t>i){var c=t;t=i,i=c}var d=[s-a/2-n,l],h=[s+a/2+n,l],p=[s,l-o/2-n],v=[s,l+o/2+n];return r<d[0]?!1:e>h[0]?!1:t>v[1]?!1:i<p[1]?!1:e<=h[0]&&h[0]<=r&&t<=h[1]&&h[1]<=i?!0:e<=d[0]&&d[0]<=r&&t<=d[1]&&d[1]<=i?!0:e<=p[0]&&p[0]<=r&&t<=p[1]&&p[1]<=i?!0:e<=v[0]&&v[0]<=r&&t<=v[1]&&v[1]<=i?!0:(e=(e-s)/(a/2+n),r=(r-s)/(a/2+n),t=(t-l)/(o/2+n),i=(i-l)/(o/2+n),1>=e*e+t*t?!0:1>=r*r+t*t?!0:1>=r*r+i*i?!0:1>=e*e+i*i?!0:!1)},e.math.boxIntersectPolygon=function(t,r,i,n,a,o,s,l,u,c,d){if(t>i){var h=t;t=i,i=h}if(r>n){var p=r;r=n,n=p}var v=new Array(a.length),f=Math.asin(c[1]/Math.sqrt(c[0]*c[0]+c[1]*c[1]));c[0]<0?f+=Math.PI/2:f=-f-Math.PI/2;for(var g=Math.cos(-f),y=Math.sin(-f),m=0;m<v.length/2;m++)v[2*m]=o/2*(a[2*m]*g-a[2*m+1]*y),v[2*m+1]=s/2*(a[2*m+1]*g+a[2*m]*y),v[2*m]+=l,v[2*m+1]+=u;for(var x=v[0],b=v[0],w=v[1],_=v[1],m=1;m<v.length/2;m++)v[2*m]>b&&(b=v[2*m]),v[2*m]<x&&(x=v[2*m]),v[2*m+1]>_&&(_=v[2*m+1]),v[2*m+1]<w&&(w=v[2*m+1]);if(x-d>i)return!1;if(t>b+d)return!1;if(w-d>n)return!1;if(r>_+d)return!1;var E;if(d>0){var S=e.math.expandPolygon(v,-d);E=e.math.joinLines(S)}else E=v;for(var m=0;m<v.length/2;m++)if(t<=v[2*m]&&v[2*m]<=i&&r<=v[2*m+1]&&v[2*m+1]<=n)return!0;for(var m=0;m<E.length/2;m++){var D,k,T=E[2*m],P=E[2*m+1];if(m<E.length/2-1?(D=E[2*(m+1)],k=E[2*(m+1)+1]):(D=E[0],k=E[1]),e.math.finiteLinesIntersect(T,P,D,k,t,r,i,r,!1).length>0)return!0;if(e.math.finiteLinesIntersect(T,P,D,k,t,n,i,n,!1).length>0)return!0;if(e.math.finiteLinesIntersect(T,P,D,k,t,r,t,n,!1).length>0)return!0;if(e.math.finiteLinesIntersect(T,P,D,k,i,r,i,n,!1).length>0)return!0}return!1},e.math.polygonIntersectLine=function(t,r,i,n,a,o,s,l){for(var u,c=[],d=new Array(i.length),h=0;h<d.length/2;h++)d[2*h]=i[2*h]*o+n,d[2*h+1]=i[2*h+1]*s+a;var p;if(l>0){var v=e.math.expandPolygon(d,-l);p=e.math.joinLines(v)}else p=d;for(var f,g,y,m,h=0;h<p.length/2;h++)f=p[2*h],g=p[2*h+1],h<p.length/2-1?(y=p[2*(h+1)],m=p[2*(h+1)+1]):(y=p[0],m=p[1]),u=this.finiteLinesIntersect(t,r,n,a,f,g,y,m),0!==u.length&&c.push(u[0],u[1]);return c},e.math.shortenIntersection=function(e,t,r){var i=[e[0]-t[0],e[1]-t[1]],n=Math.sqrt(i[0]*i[0]+i[1]*i[1]),a=(n-r)/n;return 0>a&&(a=1e-5),[t[0]+a*i[0],t[1]+a*i[1]]},e.math.generateUnitNgonPointsFitToSquare=function(t,r){var i=e.math.generateUnitNgonPoints(t,r);return i=e.math.fitPolygonToSquare(i)},e.math.fitPolygonToSquare=function(e){for(var t,r,i=e.length/2,n=1/0,a=1/0,o=-(1/0),s=-(1/0),l=0;i>l;l++)t=e[2*l],r=e[2*l+1],n=Math.min(n,t),o=Math.max(o,t),a=Math.min(a,r),s=Math.max(s,r);for(var u=2/(o-n),c=2/(s-a),l=0;i>l;l++)t=e[2*l]=e[2*l]*u,r=e[2*l+1]=e[2*l+1]*c,n=Math.min(n,t),o=Math.max(o,t),a=Math.min(a,r),s=Math.max(s,r);if(-1>a)for(var l=0;i>l;l++)r=e[2*l+1]=e[2*l+1]+(-1-a);return e},e.math.generateUnitNgonPoints=function(e,t){var r=1/e*2*Math.PI,i=e%2===0?Math.PI/2+r/2:Math.PI/2;i+=t;for(var n,a,o,s=new Array(2*e),l=0;e>l;l++)n=l*r+i,a=s[2*l]=Math.cos(n),o=s[2*l+1]=Math.sin(-n);return s},e.math.getRoundRectangleRadius=function(e,t){return Math.min(e/4,t/4,8)}}(cytoscape),function(e){"use strict";function t(t,r,i){var n={};switch(n[r]=i,t){case"core":case"collection":e.fn[t](n)}if("layout"===t){for(var o=i.prototype,s=[],l=0;l<s.length;l++){var u=s[l];o[u]=o[u]||function(){return this}}o.start&&!o.run?o.run=function(){return this.start(),this}:!o.start&&o.run&&(o.start=function(){return this.run(),this}),o.stop||(o.stop=function(){var e=this.options;return e&&e.animate&&e.eles.stop(),this}),o.on=e.define.on({layout:!0}),o.one=e.define.on({layout:!0,unbindSelfOnTrigger:!0}),o.once=e.define.on({layout:!0,unbindAllBindersOnTrigger:!0}),o.off=e.define.off({layout:!0}),o.trigger=e.define.trigger({layout:!0}),e.define.eventAliasesOn(o)}return e.util.setMap({map:a,keys:[t,r],value:i})}function r(t,r){return e.util.getMap({map:a,keys:[t,r]})}function i(t,r,i,n,a){return e.util.setMap({map:o,keys:[t,r,i,n],value:a})}function n(t,r,i,n){return e.util.getMap({map:o,keys:[t,r,i,n]})}var a={};e.extensions=a;var o={};e.modules=o,e.extension=function(){return 2==arguments.length?r.apply(this,arguments):3==arguments.length?t.apply(this,arguments):4==arguments.length?n.apply(this,arguments):5==arguments.length?i.apply(this,arguments):void e.util.error("Invalid extension access syntax")}}(cytoscape),function(e,t){"use strict";var r=function(e){var t=e[0]._cyreg=e[0]._cyreg||{};return t};t.registerJquery=function(e){e&&(e.fn.cytoscape||(e.fn.cytoscape=function(i){var n=e(this);if("get"===i)return r(n).cy;if(t.is.fn(i)){var a=i,o=r(n).cy;if(o&&o.isReady())o.trigger("ready",[],a);else{var s=r(n),l=s.readies=s.readies||[];l.push(a)}}else if(t.is.plainObject(i))return n.each(function(){var t=e.extend({},i,{container:e(this)[0]});cytoscape(t)})},e.cytoscape=cytoscape,null==e.fn.cy&&null==e.cy&&(e.fn.cy=e.fn.cytoscape,e.cy=e.cytoscape)))},t.registerJquery(e),t.util.require("jquery",function(e){t.registerJquery(e)})}("undefined"!=typeof jQuery?jQuery:null,cytoscape),function(e){"use strict";function t(){return!1}function r(){return!0}e.Event=function(i,n){return this instanceof e.Event?(i&&i.type?(this.originalEvent=i,this.type=i.type,this.isDefaultPrevented=i.defaultPrevented?r:t):this.type=i,n&&(this.type=void 0!==n.type?n.type:this.type,this.cy=n.cy,this.cyTarget=n.cyTarget,this.cyPosition=n.cyPosition,this.cyRenderedPosition=n.cyRenderedPosition,this.namespace=n.namespace,this.layout=n.layout,this.data=n.data,this.message=n.message),void(this.timeStamp=i&&i.timeStamp||+new Date)):new e.Event(i,n)},e.Event.prototype={preventDefault:function(){this.isDefaultPrevented=r;var e=this.originalEvent;e&&e.preventDefault&&e.preventDefault()},stopPropagation:function(){this.isPropagationStopped=r;var e=this.originalEvent;e&&e.stopPropagation&&e.stopPropagation()},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=r,this.stopPropagation()},isDefaultPrevented:t,isPropagationStopped:t,isImmediatePropagationStopped:t}}(cytoscape),function(e){"use strict";e.define={data:function(t){var r={field:"data",bindingEvent:"data",allowBinding:!1,allowSetting:!1,allowGetting:!1,settingEvent:"data",settingTriggersEvent:!1,triggerFnName:"trigger",immutableKeys:{},updateStyle:!1,onSet:function(e){},canSet:function(e){return!0}};return t=e.util.extend({},r,t),function(r,i){var n=t,a=this,o=void 0!==a.length,s=o?a:[a],l=o?a[0]:a;if(e.is.string(r)){if(n.allowGetting&&void 0===i){var u;return l&&(u=l._private[n.field][r]),u}if(n.allowSetting&&void 0!==i){var c=!n.immutableKeys[r];if(c){for(var d=0,h=s.length;h>d;d++)n.canSet(s[d])&&(s[d]._private[n.field][r]=i);n.updateStyle&&a.updateStyle(),n.onSet(a),n.settingTriggersEvent&&a[n.triggerFnName](n.settingEvent)}}}else if(n.allowSetting&&e.is.plainObject(r)){var p,v,f=r;for(p in f){v=f[p];var c=!n.immutableKeys[p];if(c)for(var d=0,h=s.length;h>d;d++)n.canSet(s[d])&&(s[d]._private[n.field][p]=v)}n.updateStyle&&a.updateStyle(),n.onSet(a),n.settingTriggersEvent&&a[n.triggerFnName](n.settingEvent)}else if(n.allowBinding&&e.is.fn(r)){var g=r;a.bind(n.bindingEvent,g)}else if(n.allowGetting&&void 0===r){var u;return l&&(u=l._private[n.field]),u}return a}},removeData:function(t){var r={field:"data",event:"data",triggerFnName:"trigger",triggerEvent:!1,immutableKeys:{}};return t=e.util.extend({},r,t),function(r){var i=t,n=this,a=void 0!==n.length,o=a?n:[n];if(e.is.string(r)){for(var s=r.split(/\s+/),l=s.length,u=0;l>u;u++){var c=s[u];if(!e.is.emptyString(c)){var d=!i.immutableKeys[c];if(d)for(var h=0,p=o.length;p>h;h++)o[h]._private[i.field][c]=void 0}}i.triggerEvent&&n[i.triggerFnName](i.event)}else if(void 0===r){for(var h=0,p=o.length;p>h;h++){var v=o[h]._private[i.field];for(var c in v){var f=!i.immutableKeys[c];f&&(v[c]=void 0)}}i.triggerEvent&&n[i.triggerFnName](i.event)}return n}},event:{regex:/(\w+)(\.\w+)?/,optionalTypeRegex:/(\w+)?(\.\w+)?/,falseCallback:function(){return!1}},on:function(t){var r={unbindSelfOnTrigger:!1,unbindAllBindersOnTrigger:!1};return t=e.util.extend({},r,t),function(r,i,n,a){var o=this,s=void 0!==o.length,l=s?o:[o],u=e.is.string(r),c=t;if(e.is.plainObject(i)?(a=n,n=i,i=void 0):(e.is.fn(i)||i===!1)&&(a=i,n=void 0,i=void 0),(e.is.fn(n)||n===!1)&&(a=n,n=void 0),!e.is.fn(a)&&a!==!1&&u)return o;if(u){var d={};d[r]=a,r=d}for(var h in r)if(a=r[h],a===!1&&(a=e.define.event.falseCallback),e.is.fn(a)){h=h.split(/\s+/);for(var p=0;p<h.length;p++){var v=h[p];if(!e.is.emptyString(v)){var f=v.match(e.define.event.regex);if(f)for(var g=f[1],y=f[2]?f[2]:void 0,m={callback:a,data:n,delegated:i?!0:!1,selector:i,selObj:new e.Selector(i),type:g,namespace:y,unbindSelfOnTrigger:c.unbindSelfOnTrigger,unbindAllBindersOnTrigger:c.unbindAllBindersOnTrigger,binders:l},x=0;x<l.length;x++){var b=l[x]._private;b.listeners=b.listeners||[],b.listeners.push(m)}}}}return o}},eventAliasesOn:function(t){var r=t;r.addListener=r.listen=r.bind=r.on,r.removeListener=r.unlisten=r.unbind=r.off,r.emit=r.trigger,r.pon=r.promiseOn=function(t,r){var i=this,n=Array.prototype.slice.call(arguments,0);return new e.Promise(function(e,t){var r=function(t){i.off.apply(i,o),e(t)},a=n.concat([r]),o=a.concat([]);i.on.apply(i,a)})}},off:function(t){var r={};return t=e.util.extend({},r,t),function(t,r,i){var n=this,a=void 0!==n.length,o=a?n:[n],s=e.is.string(t);if(0===arguments.length){for(var l=0;l<o.length;l++)o[l]._private.listeners=[];return n}if((e.is.fn(r)||r===!1)&&(i=r,r=void 0),s){var u={};u[t]=i,t=u}for(var c in t){i=t[c],i===!1&&(i=e.define.event.falseCallback),c=c.split(/\s+/);for(var d=0;d<c.length;d++){var h=c[d];if(!e.is.emptyString(h)){var p=h.match(e.define.event.optionalTypeRegex);if(p)for(var v=p[1]?p[1]:void 0,f=p[2]?p[2]:void 0,l=0;l<o.length;l++)for(var g=o[l]._private.listeners=o[l]._private.listeners||[],y=0;y<g.length;y++){var m=g[y],x=!f||f===m.namespace,b=!v||m.type===v,w=!i||i===m.callback,_=x&&b&&w;_&&(g.splice(y,1),y--)}}}}return n}},trigger:function(t){var r={};return t=e.util.extend({},r,t),function(r,i,n){var a=this,o=void 0!==a.length,s=o?a:[a],l=e.is.string(r),u=e.is.plainObject(r),c=e.is.event(r),d=this._private.cy||(e.is.core(this)?this:null),h=d?d.hasCompoundNodes():!1;if(l){var p=r.split(/\s+/);r=[];for(var v=0;v<p.length;v++){var f=p[v];if(!e.is.emptyString(f)){var g=f.match(e.define.event.regex),y=g[1],m=g[2]?g[2]:void 0;r.push({type:y,namespace:m})}}}else if(u){var x=r;r=[x]}i?e.is.array(i)||(i=[i]):i=[];for(var v=0;v<r.length;v++)for(var b=r[v],w=0;w<s.length;w++){var f,_=s[w],E=_._private.listeners=_._private.listeners||[],S=e.is.element(_),D=S||t.layout;if(c?(f=b,f.cyTarget=f.cyTarget||_,f.cy=f.cy||d):f=new e.Event(b,{cyTarget:_,cy:d,namespace:b.namespace}),b.layout&&(f.layout=b.layout),t.layout&&(f.layout=_),f.cyPosition){var k=f.cyPosition,T=d.zoom(),P=d.pan();f.cyRenderedPosition={x:k.x*T+P.x,y:k.y*T+P.y}}n&&(E=[{namespace:f.namespace,type:f.type,callback:n}]);for(var C=0;C<E.length;C++){var M=E[C],B=!M.namespace||M.namespace===f.namespace,N=M.type===f.type,I=M.delegated?_!==f.cyTarget&&e.is.element(f.cyTarget)&&M.selObj.matches(f.cyTarget):!0,O=B&&N&&I;if(O){var z=[f];if(z=z.concat(i),f.data=M.data?M.data:void 0,(M.unbindSelfOnTrigger||M.unbindAllBindersOnTrigger)&&(E.splice(C,1),C--),M.unbindAllBindersOnTrigger)for(var L=M.binders,R=0;R<L.length;R++){var V=L[R];if(V&&V!==_)for(var A=V._private.listeners,X=0;X<A.length;X++){var F=A[X];F===M&&(A.splice(X,1),
X--)}}var Y=M.delegated?f.cyTarget:_,q=M.callback.apply(Y,z);(q===!1||f.isPropagationStopped())&&(D=!1,q===!1&&(f.stopPropagation(),f.preventDefault()))}}if(D){var j=h?_._private.parent:null,$=null!=j&&0!==j.length;$?(j=j[0],j.trigger(f)):d.trigger(f)}}return a}},animated:function(t){var r={};return t=e.util.extend({},r,t),function(){var e=this,t=void 0!==e.length,r=t?e:[e],i=this._private.cy||this;if(!i.styleEnabled())return!1;var n=r[0];return n?n._private.animation.current.length>0:void 0}},clearQueue:function(t){var r={};return t=e.util.extend({},r,t),function(){var e=this,t=void 0!==e.length,r=t?e:[e],i=this._private.cy||this;if(!i.styleEnabled())return this;for(var n=0;n<r.length;n++){var a=r[n];a._private.animation.queue=[]}return this}},delay:function(t){var r={};return t=e.util.extend({},r,t),function(e,t){var r=this._private.cy||this;return r.styleEnabled()?(this.animate({delay:e},{duration:e,complete:t}),this):this}},animate:function(t){var r={};return t=e.util.extend({},r,t),function(e,t){var r=this,i=void 0!==r.length,n=i?r:[r],a=this._private.cy||this,o=!i,s=!o;if(!a.styleEnabled())return this;var l,u=+new Date,c=a.style();switch(void 0===t&&(t={}),void 0===t.duration&&(t.duration=400),t.duration){case"slow":t.duration=600;break;case"fast":t.duration=200}var d=!0;if(e)for(var h in e){d=!1;break}if(d)return this;if(s&&(e.style=c.getPropsList(e.style||e.css),e.css=void 0),e.renderedPosition&&s){var p=e.renderedPosition,v=a.pan(),f=a.zoom();e.position={x:(p.x-v.x)/f,y:(p.y-v.y)/f}}if(e.panBy&&o){var g=e.panBy,y=a.pan();e.pan={x:y.x+g.x,y:y.y+g.y}}var m=e.center||e.centre;if(m&&o){var x=a.getCenterPan(m.eles,e.zoom);x&&(e.pan=x)}if(e.fit&&o){var b=e.fit,w=a.getFitViewport(b.eles||b.boundingBox,b.padding);w&&(e.pan=w.pan,e.zoom=w.zoom)}for(var h=0;h<n.length;h++){var _=n[h];l=_.animated()&&(void 0===t.queue||t.queue)?_._private.animation.queue:_._private.animation.current,l.push({properties:e,duration:t.duration,params:t,callTime:u})}return s&&a.addToAnimationPool(this),this}},stop:function(t){var r={};return t=e.util.extend({},r,t),function(e,t){var r=this,i=void 0!==r.length,n=i?r:[r],a=this._private.cy||this;if(!a.styleEnabled())return this;for(var o=0;o<n.length;o++){for(var s=n[o],l=s._private.animation.current,u=0;u<l.length;u++){var c=l[u];t&&(c.duration=0)}e&&(s._private.animation.queue=[]),t||(s._private.animation.current=[])}return a.notify({collection:this,type:"draw"}),this}}}}(cytoscape),function(e){"use strict";e.fn.selector=function(t,r){for(var i in t){var n=t[i];e.Selector.prototype[i]=n}},e.Selector=function(t,r){if(!(this instanceof e.Selector))return new e.Selector(t,r);void 0===r&&void 0!==t&&(r=t,t=void 0);var i=this;if(i._private={selectorText:null,invalid:!0},!r||e.is.string(r)&&r.match(/^\s*$/))null==t?i.length=0:(i[0]=o(),i[0].group=t,i.length=1);else if(e.is.element(r)){var n=new e.Collection(i.cy(),[r]);i[0]=o(),i[0].collection=n,i.length=1}else if(e.is.collection(r))i[0]=o(),i[0].collection=r,i.length=1;else if(e.is.fn(r))i[0]=o(),i[0].filter=r,i.length=1;else{if(!e.is.string(r))return void e.util.error("A selector must be created from a string; found "+r);var a=null,o=function(){return{classes:[],colonSelectors:[],data:[],group:null,ids:[],meta:[],collection:null,filter:null,parent:null,ancestor:null,subject:null,child:null,descendant:null}},s={metaChar:"[\\!\\\"\\#\\$\\%\\&\\'\\(\\)\\*\\+\\,\\.\\/\\:\\;\\<\\=\\>\\?\\@\\[\\]\\^\\`\\{\\|\\}\\~]",comparatorOp:"=|\\!=|>|>=|<|<=|\\$=|\\^=|\\*=",boolOp:"\\?|\\!|\\^",string:'"(?:\\\\"|[^"])+"|'+"'(?:\\\\'|[^'])+'",number:e.util.regex.number,meta:"degree|indegree|outdegree",separator:"\\s*,\\s*",descendant:"\\s+",child:"\\s+>\\s+",subject:"\\$"};s.variable="(?:[\\w-]|(?:\\\\"+s.metaChar+"))+",s.value=s.string+"|"+s.number,s.className=s.variable,s.id=s.variable;for(var l=function(e){return e.replace(new RegExp("\\\\("+s.metaChar+")","g"),function(e,t,r,i){return t})},u=s.comparatorOp.split("|"),c=0;c<u.length;c++){var d=u[c];s.comparatorOp+="|@"+d}for(var u=s.comparatorOp.split("|"),c=0;c<u.length;c++){var d=u[c];d.indexOf("!")>=0||"="!==d&&(s.comparatorOp+="|\\!"+d)}var h={group:{query:!0,regex:"(node|edge|\\*)",populate:function(e){this.group="*"==e?e:e+"s"}},state:{query:!0,regex:"(:selected|:unselected|:locked|:unlocked|:visible|:hidden|:transparent|:grabbed|:free|:removed|:inside|:grabbable|:ungrabbable|:animated|:unanimated|:selectable|:unselectable|:orphan|:nonorphan|:parent|:child|:loop|:simple|:active|:inactive|:touch|:backgrounding|:nonbackgrounding)",populate:function(e){this.colonSelectors.push(e)}},id:{query:!0,regex:"\\#("+s.id+")",populate:function(e){this.ids.push(l(e))}},className:{query:!0,regex:"\\.("+s.className+")",populate:function(e){this.classes.push(l(e))}},dataExists:{query:!0,regex:"\\[\\s*("+s.variable+")\\s*\\]",populate:function(e){this.data.push({field:l(e)})}},dataCompare:{query:!0,regex:"\\[\\s*("+s.variable+")\\s*("+s.comparatorOp+")\\s*("+s.value+")\\s*\\]",populate:function(e,t,r){var i=null!=new RegExp("^"+s.string+"$").exec(r);r=i?r.substring(1,r.length-1):parseFloat(r),this.data.push({field:l(e),operator:t,value:r})}},dataBool:{query:!0,regex:"\\[\\s*("+s.boolOp+")\\s*("+s.variable+")\\s*\\]",populate:function(e,t){this.data.push({field:l(t),operator:e})}},metaCompare:{query:!0,regex:"\\[\\[\\s*("+s.meta+")\\s*("+s.comparatorOp+")\\s*("+s.number+")\\s*\\]\\]",populate:function(e,t,r){this.meta.push({field:l(e),operator:t,value:parseFloat(r)})}},nextQuery:{separator:!0,regex:s.separator,populate:function(){i[++c]=o(),a=null}},child:{separator:!0,regex:s.child,populate:function(){var e=o();e.parent=this,e.subject=a,i[c]=e}},descendant:{separator:!0,regex:s.descendant,populate:function(){var e=o();e.ancestor=this,e.subject=a,i[c]=e}},subject:{modifier:!0,regex:s.subject,populate:function(){return null!=a&&this.subject!=this?(e.util.error("Redefinition of subject in selector `"+r+"`"),!1):(a=this,void(this.subject=this))}}},p=0;for(var v in h)h[p]=h[v],h[p].name=v,p++;h.length=p,i._private.selectorText=r;var f=r,c=0,g=function(t){for(var r,i,n,a=0;a<h.length;a++){var o=h[a],s=o.name;if(!e.is.fn(t)||t(s,o)){var l=f.match(new RegExp("^"+o.regex));if(null!=l){i=l,r=o,n=s;var u=l[0];f=f.substring(u.length);break}}}return{expr:r,match:i,name:n}},y=function(){var e=f.match(/^\s+/);if(e){var t=e[0];f=f.substring(t.length)}};for(i[0]=o(),y();;){var m=g();if(null==m.expr)return void e.util.error("The selector `"+r+"`is invalid");for(var x=[],p=1;p<m.match.length;p++)x.push(m.match[p]);var b=m.expr.populate.apply(i[c],x);if(b===!1)return;if(f.match(/^\s*$/))break}for(i.length=c+1,p=0;p<i.length;p++){var w=i[p];if(null!=w.subject){for(;w.subject!=w;)if(null!=w.parent){var _=w.parent,E=w;E.parent=null,_.child=E,w=_}else{if(null==w.ancestor){e.util.error("When adjusting references for the selector `"+w+"`, neither parent nor ancestor was found");break}var S=w.ancestor,D=w;D.ancestor=null,S.descendant=D,w=S}i[p]=w.subject}}if(null!=t)for(var p=0;p<i.length;p++){if(null!=i[p].group&&i[p].group!=t)return void e.util.error("Group `"+i[p].group+"` conflicts with implicit group `"+t+"` in selector `"+r+"`");i[p].group=t}}i._private.invalid=!1},e.selfn=e.Selector.prototype,e.selfn.size=function(){return this.length},e.selfn.eq=function(e){return this[e]},e.selfn.find=function(){};var t=function(r,i){if(null!=r.group&&"*"!=r.group&&r.group!=i._private.group)return!1;for(var n=i.cy(),a=!0,o=0;o<r.colonSelectors.length;o++){var s=r.colonSelectors[o];switch(s){case":selected":a=i.selected();break;case":unselected":a=!i.selected();break;case":selectable":a=i.selectable();break;case":unselectable":a=!i.selectable();break;case":locked":a=i.locked();break;case":unlocked":a=!i.locked();break;case":visible":a=i.visible();break;case":hidden":a=!i.visible();break;case":transparent":a=i.transparent();break;case":grabbed":a=i.grabbed();break;case":free":a=!i.grabbed();break;case":removed":a=i.removed();break;case":inside":a=!i.removed();break;case":grabbable":a=i.grabbable();break;case":ungrabbable":a=!i.grabbable();break;case":animated":a=i.animated();break;case":unanimated":a=!i.animated();break;case":parent":a=i.isNode()&&i.children().nonempty();break;case":child":case":nonorphan":a=i.isNode()&&i.parent().nonempty();break;case":orphan":a=i.isNode()&&i.parent().empty();break;case":loop":a=i.isEdge()&&i.data("source")===i.data("target");break;case":simple":a=i.isEdge()&&i.data("source")!==i.data("target");break;case":active":a=i.active();break;case":inactive":a=!i.active();break;case":touch":a=e.is.touch();break;case":backgrounding":a=i.backgrounding();break;case":nonbackgrounding":a=!i.backgrounding()}if(!a)break}if(!a)return!1;for(var l=!0,o=0;o<r.ids.length;o++){var u=r.ids[o],c=i._private.data.id;if(l=l&&u==c,!l)break}if(!l)return!1;for(var d=!0,o=0;o<r.classes.length;o++){var h=r.classes[o];if(d=d&&i.hasClass(h),!d)break}if(!d)return!1;var p=function(t){for(var i=!0,n=0;n<r[t.name].length;n++){var a,o=r[t.name][n],s=o.operator,l=o.value,u=o.field;if(null!=s&&null!=l){var c=t.fieldValue(u),d=e.is.string(c)||e.is.number(c)?""+c:"",h=""+l,p=!1;s.indexOf("@")>=0&&(d=d.toLowerCase(),h=h.toLowerCase(),s=s.replace("@",""),p=!0);var v=!1,f=!1;switch(s.indexOf("!")>=0&&(s=s.replace("!",""),v=!0),p&&(l=h.toLowerCase(),c=d.toLowerCase()),s){case"*=":a=d.search(h)>=0;break;case"$=":a=null!=new RegExp(h+"$").exec(d);break;case"^=":a=null!=new RegExp("^"+h).exec(d);break;case"=":a=c===l;break;case"!=":a=c!==l;break;case">":a=v?l>=c:c>l,f=!0;break;case">=":a=v?l>c:c>=l,f=!0;break;case"<":a=v?c>=l:l>c,f=!0;break;case"<=":a=v?c>l:l>=c,f=!0;break;default:a=!1}}else if(null!=s)switch(s){case"?":a=t.fieldTruthy(u);break;case"!":a=!t.fieldTruthy(u);break;case"^":a=t.fieldUndefined(u)}else a=!t.fieldUndefined(u);if(v&&!f&&(a=!a,f=!0),!a){i=!1;break}}return i},v=p({name:"data",fieldValue:function(e){return i._private.data[e]},fieldRef:function(e){return"element._private.data."+e},fieldUndefined:function(e){return void 0===i._private.data[e]},fieldTruthy:function(e){return i._private.data[e]?!0:!1}});if(!v)return!1;var f=p({name:"meta",fieldValue:function(e){return i[e]()},fieldRef:function(e){return"element."+e+"()"},fieldUndefined:function(e){return null==i[e]()},fieldTruthy:function(e){return i[e]()?!0:!1}});if(!f)return!1;if(null!=r.collection){var g=null!=r.collection._private.ids[i.id()];if(!g)return!1}if(null!=r.filter&&0===i.collection().filter(r.filter).size())return!1;var y=function(e,r){if(null!=e){var i=!1;if(!n.hasCompoundNodes())return!1;r=r();for(var a=0;a<r.length;a++)if(t(e,r[a])){i=!0;break}return i}return!0};return y(r.parent,function(){return i.parent()})&&y(r.ancestor,function(){return i.parents()})&&y(r.child,function(){return i.children()})&&y(r.descendant,function(){return i.descendants()})?!0:!1};e.selfn.filter=function(r){var i=this,n=r.cy();if(i._private.invalid)return new e.Collection(n);var a=function(e,r){for(var n=0;n<i.length;n++){var a=i[n];if(t(a,r))return!0}return!1};null==i._private.selectorText&&(a=function(){return!0});var o=r.filter(a);return o},e.selfn.matches=function(e){var r=this;if(r._private.invalid)return!1;for(var i=0;i<r.length;i++){var n=r[i];if(t(n,e))return!0}return!1},e.selfn.toString=e.selfn.selector=function(){for(var t="",r=function(t,r){return e.is.string(t)?r?'"'+t+'"':t:""},i=function(e){var t="";e.subject===e&&(t+="$");var a=r(e.group);t+=a.substring(0,a.length-1);for(var o=0;o<e.data.length;o++){var s=e.data[o];t+=s.value?"["+s.field+r(s.operator)+r(s.value,!0)+"]":"["+r(s.operator)+s.field+"]"}for(var o=0;o<e.meta.length;o++){var l=e.meta[o];t+="[["+l.field+r(l.operator)+r(l.value,!0)+"]]"}for(var o=0;o<e.colonSelectors.length;o++){var u=e.colonSelectors[n];t+=u}for(var o=0;o<e.ids.length;o++){var u="#"+e.ids[n];t+=u}for(var o=0;o<e.classes.length;o++){var u="."+e.classes[n];t+=u}return null!=e.parent&&(t=i(e.parent)+" > "+t),null!=e.ancestor&&(t=i(e.ancestor)+" "+t),null!=e.child&&(t+=" > "+i(e.child)),null!=e.descendant&&(t+=" "+i(e.descendant)),t},n=0;n<this.length;n++){var a=this[n];t+=i(a),this.length>1&&n<this.length-1&&(t+=", ")}return t}}(cytoscape),function(e){"use strict";e.Style=function(t){return this instanceof e.Style?e.is.core(t)?(this._private={cy:t,coreStyle:{},newStyle:!0},this.length=0,void this.addDefaultStylesheet()):void e.util.error("A style must have a core reference"):new e.Style(t)},e.style=e.Style,e.styfn=e.Style.prototype,e.fn.style=function(t,r){for(var i in t){var n=t[i];e.Style.prototype=n}},function(){var t=e.util.regex.number,r=e.util.regex.rgbaNoBackRefs,i=e.util.regex.hslaNoBackRefs,n=e.util.regex.hex3,a=e.util.regex.hex6,o=function(e){return"^"+e+"\\s*\\(\\s*([\\w\\.]+)\\s*\\)$"},s=function(e){return"^"+e+"\\s*\\(([\\w\\.]+)\\s*\\,\\s*("+t+")\\s*\\,\\s*("+t+")\\s*,\\s*("+t+"|\\w+|"+r+"|"+i+"|"+n+"|"+a+")\\s*\\,\\s*("+t+"|\\w+|"+r+"|"+i+"|"+n+"|"+a+")\\)$"};e.style.types={time:{number:!0,min:0,units:"s|ms",implicitUnits:"ms"},percent:{number:!0,min:0,max:100,units:"%"},zeroOneNumber:{number:!0,min:0,max:1,unitless:!0},nOneOneNumber:{number:!0,min:-1,max:1,unitless:!0},nonNegativeInt:{number:!0,min:0,integer:!0,unitless:!0},position:{enums:["parent","origin"]},autoSize:{number:!0,min:0,enums:["auto"]},number:{number:!0},size:{number:!0,min:0},bgSize:{number:!0,min:0,allowPercent:!0},bgWH:{number:!0,min:0,allowPercent:!0,enums:["auto"]},bgPos:{number:!0,allowPercent:!0},bgRepeat:{enums:["repeat","repeat-x","repeat-y","no-repeat"]},bgFit:{enums:["none","contain","cover"]},bgClip:{enums:["none","node"]},color:{color:!0},lineStyle:{enums:["solid","dotted","dashed"]},borderStyle:{enums:["solid","dotted","dashed","double"]},curveStyle:{enums:["bezier","unbundled-bezier","haystack"]},fontFamily:{regex:'^([\\w- \\"]+(?:\\s*,\\s*[\\w- \\"]+)*)$'},fontVariant:{enums:["small-caps","normal"]},fontStyle:{enums:["italic","normal","oblique"]},fontWeight:{enums:["normal","bold","bolder","lighter","100","200","300","400","500","600","800","900",100,200,300,400,500,600,700,800,900]},textDecoration:{enums:["none","underline","overline","line-through"]},textTransform:{enums:["none","uppercase","lowercase"]},textWrap:{enums:["none","wrap"]},textBackgroundShape:{enums:["rectangle","roundrectangle"]},nodeShape:{enums:["rectangle","roundrectangle","ellipse","triangle","square","pentagon","hexagon","heptagon","octagon","star","diamond","vee","rhomboid"]},compoundIncludeLabels:{enums:["include","exclude"]},arrowShape:{enums:["tee","triangle","triangle-tee","triangle-backcurve","half-triangle-overshot","square","circle","diamond","none"]},arrowFill:{enums:["filled","hollow"]},display:{enums:["element","none"]},visibility:{enums:["hidden","visible"]},valign:{enums:["top","center","bottom"]},halign:{enums:["left","center","right"]},text:{string:!0},data:{mapping:!0,regex:o("data")},layoutData:{mapping:!0,regex:o("layoutData")},scratch:{mapping:!0,regex:o("scratch")},mapData:{mapping:!0,regex:s("mapData")},mapLayoutData:{mapping:!0,regex:s("mapLayoutData")},mapScratch:{mapping:!0,regex:s("mapScratch")},fn:{mapping:!0,fn:!0},url:{regex:"^url\\s*\\(\\s*([^\\s]+)\\s*\\s*\\)|none|(.+)$"},propList:{propList:!0},angle:{number:!0,units:"deg|rad"},textRotation:{enums:["none","autorotate"]}};var l=e.style.types,u=e.style.properties=[{name:"text-valign",type:l.valign},{name:"text-halign",type:l.halign},{name:"color",type:l.color},{name:"content",type:l.text},{name:"text-outline-color",type:l.color},{name:"text-outline-width",type:l.size},{name:"text-outline-opacity",type:l.zeroOneNumber},{name:"text-opacity",type:l.zeroOneNumber},{name:"text-background-color",type:l.color},{name:"text-background-opacity",type:l.zeroOneNumber},{name:"text-border-opacity",type:l.zeroOneNumber},{name:"text-border-color",type:l.color},{name:"text-border-width",type:l.size},{name:"text-border-style",type:l.borderStyle},{name:"text-background-shape",type:l.textBackgroundShape},{name:"text-transform",type:l.textTransform},{name:"text-wrap",type:l.textWrap},{name:"text-max-width",type:l.size},{name:"font-family",type:l.fontFamily},{name:"font-style",type:l.fontStyle},{name:"font-weight",type:l.fontWeight},{name:"font-size",type:l.size},{name:"min-zoomed-font-size",type:l.size},{name:"edge-text-rotation",type:l.textRotation},{name:"display",type:l.display},{name:"visibility",type:l.visibility},{name:"opacity",type:l.zeroOneNumber},{name:"z-index",type:l.nonNegativeInt},{name:"overlay-padding",type:l.size},{name:"overlay-color",type:l.color},{name:"overlay-opacity",type:l.zeroOneNumber},{name:"shadow-blur",type:l.size},{name:"shadow-color",type:l.color},{name:"shadow-opacity",type:l.zeroOneNumber},{name:"shadow-offset-x",type:l.number},{name:"shadow-offset-y",type:l.number},{name:"text-shadow-blur",type:l.size},{name:"text-shadow-color",type:l.color},{name:"text-shadow-opacity",type:l.zeroOneNumber},{name:"text-shadow-offset-x",type:l.number},{name:"text-shadow-offset-y",type:l.number},{name:"transition-property",type:l.propList},{name:"transition-duration",type:l.time},{name:"transition-delay",type:l.time},{name:"height",type:l.autoSize},{name:"width",type:l.autoSize},{name:"shape",type:l.nodeShape},{name:"background-color",type:l.color},{name:"background-opacity",type:l.zeroOneNumber},{name:"background-blacken",type:l.nOneOneNumber},{name:"border-color",type:l.color},{name:"border-opacity",type:l.zeroOneNumber},{name:"border-width",type:l.size},{name:"border-style",type:l.borderStyle},{name:"background-image",type:l.url},{name:"background-image-opacity",type:l.zeroOneNumber},{name:"background-position-x",type:l.bgPos},{name:"background-position-y",type:l.bgPos},{name:"background-repeat",type:l.bgRepeat},{name:"background-fit",type:l.bgFit},{name:"background-clip",type:l.bgClip},{name:"background-width",type:l.bgWH},{name:"background-height",type:l.bgWH},{name:"padding-left",type:l.size},{name:"padding-right",type:l.size},{name:"padding-top",type:l.size},{name:"padding-bottom",type:l.size},{name:"position",type:l.position},{name:"compound-sizing-wrt-labels",type:l.compoundIncludeLabels},{name:"line-style",type:l.lineStyle},{name:"line-color",type:l.color},{name:"control-point-step-size",type:l.size},{name:"control-point-distance",type:l.number},{name:"control-point-weight",type:l.zeroOneNumber},{name:"curve-style",type:l.curveStyle},{name:"haystack-radius",type:l.zeroOneNumber},{name:"source-arrow-shape",type:l.arrowShape},{name:"target-arrow-shape",type:l.arrowShape},{name:"mid-source-arrow-shape",type:l.arrowShape},{name:"mid-target-arrow-shape",type:l.arrowShape},{name:"source-arrow-color",type:l.color},{name:"target-arrow-color",type:l.color},{name:"mid-source-arrow-color",type:l.color},{name:"mid-target-arrow-color",type:l.color},{name:"source-arrow-fill",type:l.arrowFill},{name:"target-arrow-fill",type:l.arrowFill},{name:"mid-source-arrow-fill",type:l.arrowFill},{name:"mid-target-arrow-fill",type:l.arrowFill},{name:"selection-box-color",type:l.color},{name:"selection-box-opacity",type:l.zeroOneNumber},{name:"selection-box-border-color",type:l.color},{name:"selection-box-border-width",type:l.size},{name:"active-bg-color",type:l.color},{name:"active-bg-opacity",type:l.zeroOneNumber},{name:"active-bg-size",type:l.size},{name:"outside-texture-bg-color",type:l.color},{name:"outside-texture-bg-opacity",type:l.zeroOneNumber}];e.style.pieBackgroundN=16,u.push({name:"pie-size",type:l.bgSize});for(var c=1;c<=e.style.pieBackgroundN;c++)u.push({name:"pie-"+c+"-background-color",type:l.color}),u.push({name:"pie-"+c+"-background-size",type:l.percent}),u.push({name:"pie-"+c+"-background-opacity",type:l.zeroOneNumber});for(var c=0;c<u.length;c++){var d=u[c];u[d.name]=d}}(),e.styfn.addDefaultStylesheet=function(){var e="Helvetica",t="normal",r="normal",i="#000",n="none",a=16,o=9999;this.selector("node, edge").css({"text-valign":"top","text-halign":"center",color:i,"text-outline-color":"#000","text-outline-width":0,"text-outline-opacity":1,"text-opacity":1,"text-decoration":"none","text-transform":n,"text-wrap":"none","text-max-width":o,"text-background-color":"#000","text-background-opacity":0,"text-border-opacity":0,"text-border-width":0,"text-border-style":"solid","text-border-color":"#000","text-background-shape":"rectangle","font-family":e,"font-style":t,"font-weight":r,"font-size":a,"min-zoomed-font-size":0,"edge-text-rotation":"none",visibility:"visible",display:"element",opacity:1,"z-index":0,content:"","overlay-opacity":0,"overlay-color":"#000","overlay-padding":10,"shadow-opacity":0,"shadow-color":"#000","shadow-blur":10,"shadow-offset-x":0,"shadow-offset-y":0,"text-shadow-opacity":0,"text-shadow-color":"#000","text-shadow-blur":5,"text-shadow-offset-x":0,"text-shadow-offset-y":0,"transition-property":"none","transition-duration":0,"transition-delay":0,"background-blacken":0,"background-color":"#888","background-opacity":1,"background-image":"none","background-image-opacity":1,"background-position-x":"50%","background-position-y":"50%","background-repeat":"no-repeat","background-fit":"none","background-clip":"node","background-width":"auto","background-height":"auto","border-color":"#000","border-opacity":1,"border-width":0,"border-style":"solid",height:30,width:30,shape:"ellipse","padding-top":0,"padding-bottom":0,"padding-left":0,"padding-right":0,position:"origin","compound-sizing-wrt-labels":"include","pie-size":"100%","pie-1-background-color":"black","pie-2-background-color":"black","pie-3-background-color":"black","pie-4-background-color":"black","pie-5-background-color":"black","pie-6-background-color":"black","pie-7-background-color":"black","pie-8-background-color":"black","pie-9-background-color":"black","pie-10-background-color":"black","pie-11-background-color":"black","pie-12-background-color":"black","pie-13-background-color":"black","pie-14-background-color":"black","pie-15-background-color":"black","pie-16-background-color":"black","pie-1-background-size":"0%","pie-2-background-size":"0%","pie-3-background-size":"0%","pie-4-background-size":"0%","pie-5-background-size":"0%","pie-6-background-size":"0%","pie-7-background-size":"0%","pie-8-background-size":"0%","pie-9-background-size":"0%","pie-10-background-size":"0%","pie-11-background-size":"0%","pie-12-background-size":"0%","pie-13-background-size":"0%","pie-14-background-size":"0%","pie-15-background-size":"0%","pie-16-background-size":"0%","pie-1-background-opacity":1,"pie-2-background-opacity":1,"pie-3-background-opacity":1,"pie-4-background-opacity":1,"pie-5-background-opacity":1,"pie-6-background-opacity":1,"pie-7-background-opacity":1,"pie-8-background-opacity":1,"pie-9-background-opacity":1,"pie-10-background-opacity":1,"pie-11-background-opacity":1,"pie-12-background-opacity":1,"pie-13-background-opacity":1,"pie-14-background-opacity":1,"pie-15-background-opacity":1,"pie-16-background-opacity":1,"source-arrow-shape":"none","mid-source-arrow-shape":"none","target-arrow-shape":"none","mid-target-arrow-shape":"none","source-arrow-color":"#ddd","mid-source-arrow-color":"#ddd","target-arrow-color":"#ddd","mid-target-arrow-color":"#ddd","source-arrow-fill":"filled","mid-source-arrow-fill":"filled","target-arrow-fill":"filled","mid-target-arrow-fill":"filled","line-style":"solid","line-color":"#ddd","control-point-step-size":40,"control-point-weight":.5,"curve-style":"bezier","haystack-radius":.8}).selector("$node > node").css({width:"auto",height:"auto",shape:"rectangle","background-opacity":.5,"padding-top":10,"padding-right":10,"padding-left":10,"padding-bottom":10}).selector("edge").css({width:1}).selector(":active").css({"overlay-color":"black","overlay-padding":10,"overlay-opacity":.25}).selector("core").css({"selection-box-color":"#ddd","selection-box-opacity":.65,"selection-box-border-color":"#aaa","selection-box-border-width":1,"active-bg-color":"black","active-bg-opacity":.15,"active-bg-size":30,"outside-texture-bg-color":"#000","outside-texture-bg-opacity":.125}),this.defaultLength=this.length},e.styfn.clear=function(){for(var e=0;e<this.length;e++)this[e]=void 0;return this.length=0,this._private.newStyle=!0,this},e.styfn.resetToDefault=function(){return this.clear(),this.addDefaultStylesheet(),this},e.styfn.core=function(){return this._private.coreStyle},e.styfn.parse=function(t,r,i,n){var a,o=[t,r,i,n].join("$"),s=this.propCache=this.propCache||{};return(a=s[o])||(a=s[o]=this.parseImpl(t,r,i,n)),e.util.copy(a)},e.styfn.parseImpl=function(t,r,i,n){t=e.util.camel2dash(t);var a=e.style.properties[t],o=r,s=e.style.types;if(!a)return null;if(void 0===r||null===r)return null;var l=e.is.string(r);l&&(r=e.util.trim(r));var u=a.type;if(!u)return null;if(i&&(""===r||null===r))return{name:t,value:r,bypass:!0,deleteBypass:!0};var c=t.match(/pie-(\d+)-background-size/);if(e.is.fn(r))return{name:t,value:r,strValue:"fn",mapped:s.fn,bypass:i,hasPie:c};var d,h,p,v,f,g;if(!l||n);else{if((d=new RegExp(s.data.regex).exec(r))||(p=new RegExp(s.layoutData.regex).exec(r))||(f=new RegExp(s.scratch.regex).exec(r))){if(i)return!1;var y;return y=d?s.data:p?s.layoutData:s.scratch,d=d||p||f,{name:t,value:d,strValue:""+r,mapped:y,field:d[1],bypass:i,hasPie:c}}if((h=new RegExp(s.mapData.regex).exec(r))||(v=new RegExp(s.mapLayoutData.regex).exec(r))||(g=new RegExp(s.mapScratch.regex).exec(r))){if(i)return!1;var y;if(y=h?s.mapData:v?s.mapLayoutData:s.mapScratch,h=h||v||g,!u.color&&!u.number)return!1;var m=this.parse(t,h[4]);if(!m||m.mapped)return!1;var x=this.parse(t,h[5]);if(!x||x.mapped)return!1;if(m.value===x.value)return!1;if(u.color){var b=m.value,w=x.value,_=!(b[0]!==w[0]||b[1]!==w[1]||b[2]!==w[2]||b[3]!==w[3]&&(null!=b[3]&&1!==b[3]||null!=w[3]&&1!==w[3]));if(_)return!1}return{name:t,value:h,strValue:""+r,mapped:y,field:h[1],fieldMin:parseFloat(h[2]),fieldMax:parseFloat(h[3]),valueMin:m.value,valueMax:x.value,bypass:i,hasPie:c}}}if(u.number){var E,S="px";if(u.units&&(E=u.units),u.implicitUnits&&(S=u.implicitUnits),!u.unitless)if(l){var D="px|em"+(u.allowPercent?"|\\%":"");E&&(D=E);var k=r.match("^("+e.util.regex.number+")("+D+")?$");k&&(r=k[1],E=k[2]||S)}else(!E||u.implicitUnits)&&(E=S);if(r=parseFloat(r),isNaN(r)&&void 0===u.enums)return null;if(isNaN(r)&&void 0!==u.enums){r=o;for(var T=0;T<u.enums.length;T++){var P=u.enums[T];if(P===r)return{name:t,value:r,strValue:""+r,bypass:i}}return null}if(u.integer&&!e.is.integer(r))return null;if(void 0!==u.min&&r<u.min||void 0!==u.max&&r>u.max)return null;var C={name:t,value:r,strValue:""+r+(E?E:""),units:E,bypass:i,hasPie:c&&null!=r&&0!==r&&""!==r};return u.unitless||"px"!==E&&"em"!==E||(C.pxValue="px"!==E&&E?this.getEmSizeInPixels()*r:r),("ms"===E||"s"===E)&&(C.msValue="ms"===E?r:1e3*r),C}if(u.propList){var M=[],B=""+r;if("none"===B);else{for(var N=B.split(","),T=0;T<N.length;T++){var I=e.util.trim(N[T]);e.style.properties[I]&&M.push(I)}if(0===M.length)return null}return{name:t,value:M,strValue:0===M.length?"none":M.join(", "),bypass:i}}if(u.color){var O=e.util.color2tuple(r);return O?{name:t,value:O,strValue:""+r,bypass:i}:null}if(u.enums){for(var T=0;T<u.enums.length;T++){var P=u.enums[T];if(P===r)return{name:t,value:r,strValue:""+r,bypass:i}}return null}if(u.regex){var z=new RegExp(u.regex),L=z.exec(r);return L?{name:t,value:L,strValue:""+r,bypass:i}:null}return u.string?{name:t,value:r,strValue:""+r,bypass:i}:null},e.styfn.selector=function(t){var r="core"===t?null:new e.Selector(t),i=this.length++;return this[i]={selector:r,properties:[],mappedProperties:[],index:i},this},e.styfn.css=function(){var t=arguments;switch(t.length){case 1:for(var r=t[0],i=0;i<e.style.properties.length;i++){var n=e.style.properties[i],a=r[n.name];void 0===a&&(a=r[e.util.dash2camel(n.name)]),void 0!==a&&this.cssRule(n.name,a)}break;case 2:this.cssRule(t[0],t[1])}return this},e.styfn.style=e.styfn.css,e.styfn.cssRule=function(e,t){var r=this.parse(e,t);if(r){var i=this.length-1;this[i].properties.push(r),this[i].properties[r.name]=r,r.hasPie&&(this._private.hasPie=!0),r.mapped&&this[i].mappedProperties.push(r);var n=!this[i].selector;n&&(this._private.coreStyle[r.name]=r)}return this}}(cytoscape),function(e){"use strict";e.styfn.apply=function(e){var t=this;t._private.newStyle&&(this._private.contextStyles={},this._private.propDiffs={});for(var r=0;r<e.length;r++){var i=e[r],n=t.getContextMeta(i),a=t.getContextStyle(n),o=t.applyContextStyle(n,a,i);t.updateTransitions(i,o.diffProps),t.updateStyleHints(i)}t._private.newStyle=!1},e.styfn.getPropertiesDiff=function(e,t){var r=this,i=r._private.propDiffs=r._private.propDiffs||{},n=e+"-"+t,a=i[n];if(a)return a;for(var o=[],s={},l=0;l<r.length;l++){var u=r[l],c="t"===e[l],d="t"===t[l],h=c!==d,p=u.mappedProperties.length>0;if(h||p){var v;h&&p?v=u.properties:h?v=u.properties:p&&(v=u.mappedProperties);for(var f=0;f<v.length;f++){for(var g=v[f],y=g.name,m=!1,x=l+1;x<r.length;x++){var b=r[x],w="t"===t[x];if(w&&(m=null!=b.properties[g.name]))break}s[y]||m||(s[y]=!0,o.push(y))}}}return i[n]=o,o},e.styfn.getContextMeta=function(e){var t,r=this,i="",n=e._private.styleCxtKey||"";r._private.newStyle&&(n="");for(var a=0;a<r.length;a++){var o=r[a],s=o.selector&&o.selector.matches(e);i+=s?"t":"f"}return t=r.getPropertiesDiff(n,i),e._private.styleCxtKey=i,{key:i,diffPropNames:t}},e.styfn.getContextStyle=function(e){var t=e.key,r=this,i=this._private.contextStyles=this._private.contextStyles||{};if(i[t])return i[t];for(var n={_private:{key:t}},a=0;a<r.length;a++){var o=r[a],s="t"===t[a];if(s)for(var l=0;l<o.properties.length;l++){var u=o.properties[l],c=n[u.name]=u;c.context=o}}return i[t]=n,n},e.styfn.applyContextStyle=function(e,t,r){for(var i=this,n=e.diffPropNames,a={},o=0;o<n.length;o++){var s=n[o],l=t[s],u=r._private.style[s];if(l&&u!==l){var c=a[s]={prev:u};i.applyParsedProperty(r,l),c.next=r._private.style[s],c.next&&c.next.bypass&&(c.next=c.next.bypassed)}}return{diffProps:a}},e.styfn.updateStyleHints=function(t){var r=t._private,i=this,n=r.style,a=!1;if("nodes"===r.group&&i._private.hasPie)for(var o=1;o<=e.style.pieBackgroundN;o++){var s=r.style["pie-"+o+"-background-size"].value;if(s>0){a=!0;break}}r.hasPie=a;var l=n["text-transform"].strValue,u=n.content.strValue,c=n["font-style"].strValue,s=n["font-size"].pxValue+"px",d=n["font-family"].strValue,h=n["font-weight"].strValue,p=n["text-valign"].strValue,v=n["text-valign"].strValue,f=n["text-outline-width"].pxValue,g=n["text-wrap"].strValue,y=n["text-max-width"].pxValue;r.labelKey=c+"$"+s+"$"+d+"$"+h+"$"+u+"$"+l+"$"+p+"$"+v+"$"+f+"$"+g+"$"+y,r.fontKey=c+"$"+h+"$"+s+"$"+d;var m=n.width.pxValue,x=n.height.pxValue,b=n["border-width"].pxValue;if(r.boundingBoxKey=m+"$"+x+"$"+b,"edges"===t._private.group){var w=n["control-point-step-size"].pxValue,_=n["control-point-distance"]?n["control-point-distance"].pxValue:void 0,E=n["control-point-weight"].value,S=n["curve-style"].strValue;r.boundingBoxKey+="$"+w+"$"+_+"$"+E+"$"+S}r.styleKey=Date.now()},e.styfn.applyParsedProperty=function(t,r){var i,n,a=r,o=t._private.style,s=e.style.types,l=e.style.properties[a.name].type,u=a.bypass,c=o[a.name],d=c&&c.bypass,h=t._private;if(("height"===r.name||"width"===r.name)&&t.isNode()){if("auto"===r.value&&!t.isParent())return!1;"auto"!==r.value&&t.isParent()&&(a=r=this.parse(r.name,"auto",u))}if(u&&a.deleteBypass){var p=o[a.name];return p?p.bypass&&p.bypassed?(o[a.name]=p.bypassed,!0):!1:!0}var v=function(){e.util.error("Do not assign mappings to elements without corresponding data (e.g. ele `"+t.id()+"` for property `"+a.name+"` with data field `"+a.field+"`); try a `["+a.field+"]` selector to limit scope to elements with `"+a.field+"` defined")};switch(a.mapped){case s.mapData:case s.mapLayoutData:case s.mapScratch:var i,f=a.mapped===s.mapLayoutData,g=a.mapped===s.mapScratch,y=a.field.split(".");i=g||f?h.scratch:h.data;for(var m=0;m<y.length&&i;m++){var x=y[m];i=i[x]}var b;if(b=e.is.number(i)?(i-a.fieldMin)/(a.fieldMax-a.fieldMin):0,0>b?b=0:b>1&&(b=1),l.color){var w=a.valueMin[0],_=a.valueMax[0],E=a.valueMin[1],S=a.valueMax[1],D=a.valueMin[2],k=a.valueMax[2],T=null==a.valueMin[3]?1:a.valueMin[3],P=null==a.valueMax[3]?1:a.valueMax[3],C=[Math.round(w+(_-w)*b),Math.round(E+(S-E)*b),Math.round(D+(k-D)*b),Math.round(T+(P-T)*b)];

n={bypass:a.bypass,name:a.name,value:C,strValue:"rgb("+C[0]+", "+C[1]+", "+C[2]+")"}}else{if(!l.number)return!1;var M=a.valueMin+(a.valueMax-a.valueMin)*b;n=this.parse(a.name,M,a.bypass,!0)}n||(n=this.parse(a.name,c.strValue,a.bypass,!0)),n||v(),n.mapping=a,a=n;break;case s.data:case s.layoutData:case s.scratch:var i,f=a.mapped===s.layoutData,g=a.mapped===s.scratch,y=a.field.split(".");if(i=g||f?h.scratch:h.data)for(var m=0;m<y.length;m++){var x=y[m];i=i[x]}if(n=this.parse(a.name,i,a.bypass,!0),!n){var B=c?c.strValue:"";n=this.parse(a.name,B,a.bypass,!0)}n||v(),n.mapping=a,a=n;break;case s.fn:var N=a.value,I=N(t);n=this.parse(a.name,I,a.bypass,!0),n.mapping=a,a=n;break;case void 0:break;default:return!1}return u?(a.bypassed=d?c.bypassed:c,o[a.name]=a):d?c.bypassed=a:o[a.name]=a,!0},e.styfn.update=function(){var e=this._private.cy,t=e.elements();t.updateStyle()},e.styfn.updateMappers=function(t){for(var r=0;r<t.length;r++){for(var i=t[r],n=i._private.style,a=0;a<e.style.properties.length;a++){var o=e.style.properties[a],s=n[o.name];if(s&&s.mapping){var l=s.mapping;this.applyParsedProperty(i,l)}}this.updateStyleHints(i)}},e.styfn.updateTransitions=function(t,r,i){var n=this,a=t._private.style,o=a["transition-property"].value,s=a["transition-duration"].msValue,l=a["transition-delay"].msValue,u={};if(o.length>0&&s>0){for(var c=!1,d=0;d<o.length;d++){var h=o[d],p=a[h],v=r[h];if(v){var f,g=v.prev,y=g,m=null!=v.next?v.next:p,x=!1,b=1e-6;y&&(e.is.number(y.pxValue)&&e.is.number(m.pxValue)?(x=m.pxValue-y.pxValue,f=y.pxValue+b*x):e.is.number(y.value)&&e.is.number(m.value)?(x=m.value-y.value,f=y.value+b*x):e.is.array(y.value)&&e.is.array(m.value)&&(x=y.value[0]!==m.value[0]||y.value[1]!==m.value[1]||y.value[2]!==m.value[2],f=y.strValue),x&&(u[h]=m.strValue,this.applyBypass(t,h,f),c=!0))}}if(!c)return;t._private.transitioning=!0,t.stop(),l>0&&t.delay(l),t.animate({css:u},{duration:s,queue:!1,complete:function(){i||n.removeBypasses(t,o),t._private.transitioning=!1}})}else t._private.transitioning&&(t.stop(),this.removeBypasses(t,o),t._private.transitioning=!1)}}(cytoscape),function(e){"use strict";e.styfn.applyBypass=function(t,r,i,n){var a=[],o=!0;if("*"===r||"**"===r){if(void 0!==i)for(var s=0;s<e.style.properties.length;s++){var l=e.style.properties[s],r=l.name,u=this.parse(r,i,!0);u&&a.push(u)}}else if(e.is.string(r)){var u=this.parse(r,i,!0);u&&a.push(u)}else{if(!e.is.plainObject(r))return!1;var c=r;n=i;for(var s=0;s<e.style.properties.length;s++){var l=e.style.properties[s],r=l.name,i=c[r];if(void 0===i&&(i=c[e.util.dash2camel(r)]),void 0!==i){var u=this.parse(r,i,!0);u&&a.push(u)}}}if(0===a.length)return!1;for(var d=!1,s=0;s<t.length;s++){for(var h,p=t[s],v=p._private.style,f={},g=0;g<a.length;g++){var l=a[g];if(n){var y=v[l.name];h=f[l.name]={prev:y}}d=this.applyParsedProperty(p,l)||d,n&&(h.next=v[l.name])}n&&this.updateTransitions(p,f,o)}return d},e.styfn.overrideBypass=function(t,r,i){for(var n=0;n<t.length;n++){var a=t[n],o=a._private.style[e.util.camel2dash(r)];o.bypass?(o.value=i,o.pxValue=i):this.applyBypass(a,r,i)}},e.styfn.removeAllBypasses=function(t,r){for(var i=!0,n=0;n<t.length;n++){for(var a=t[n],o={},s=a._private.style,l=0;l<e.style.properties.length;l++){var u=e.style.properties[l],c=u.name,d="",h=this.parse(c,d,!0),p=s[u.name],v=o[u.name]={prev:p};this.applyParsedProperty(a,h),v.next=s[u.name]}r&&this.updateTransitions(a,o,i)}},e.styfn.removeBypasses=function(t,r,i){for(var n=!0,a=0;a<t.length;a++){for(var o=t[a],s={},l=o._private.style,u=0;u<r.length;u++){var c=r[u],d=e.style.properties[c],h="",p=this.parse(c,h,!0),v=l[d.name],f=s[d.name]={prev:v};this.applyParsedProperty(o,p),f.next=l[d.name]}i&&this.updateTransitions(o,s,n)}}}(cytoscape),function(e,t){"use strict";e.styfn.getEmSizeInPixels=function(){var e=this._private.cy,r=e.container();if(t&&r&&t.getComputedStyle){var i=t.getComputedStyle(r).getPropertyValue("font-size"),n=parseFloat(i);return n}return 1},e.styfn.containerCss=function(e){var r=this._private.cy,i=r.container();return t&&i&&t.getComputedStyle?t.getComputedStyle(i).getPropertyValue(e):void 0},e.styfn.containerProperty=function(e){var t=this.containerCss(e),r=this.parse(e,t);return r},e.styfn.containerPropertyAsString=function(e){var t=this.containerProperty(e);return t?t.strValue:void 0}}(cytoscape,"undefined"==typeof window?null:window),function(e){"use strict";e.styfn.getRenderedStyle=function(t){var t=t[0];if(t){for(var r={},i=t._private.style,n=this._private.cy,a=n.zoom(),o=0;o<e.style.properties.length;o++){var s=e.style.properties[o],l=i[s.name];if(l){var u=l.unitless?l.strValue:l.pxValue*a+"px";r[s.name]=u,r[e.util.dash2camel(s.name)]=u}}return r}},e.styfn.getRawStyle=function(t){var t=t[0];if(t){for(var r={},i=t._private.style,n=0;n<e.style.properties.length;n++){var a=e.style.properties[n],o=i[a.name];o&&(r[a.name]=o.strValue,r[e.util.dash2camel(a.name)]=o.strValue)}return r}},e.styfn.getValueStyle=function(t){var r,i={},n=e.is.element(t);if(r=n?t._private.style:t)for(var a=0;a<e.style.properties.length;a++){var o=e.style.properties[a],s=r[o.name]||r[e.util.dash2camel(o.name)];void 0!==s&&(s=e.is.plainObject(s)?this.parse(o.name,s.strValue):this.parse(o.name,s)),s&&(i[o.name]=s,i[e.util.dash2camel(o.name)]=s)}return i},e.styfn.getPropsList=function(t){var r=[],i=t,n=e.style.properties;if(i)for(var a in i){var o=i[a],s=n[a]||n[e.util.camel2dash(a)],l=this.parse(s.name,o);r.push(l)}return r}}(cytoscape),function(e){"use strict";e.style.applyFromJson=function(e,t){for(var r=0;r<t.length;r++){var i=t[r],n=i.selector,a=i.style||i.css;e.selector(n);for(var o in a){var s=a[o];e.css(o,s)}}return e},e.style.fromJson=function(t,r){var i=new e.Style(t);return e.style.applyFromJson(i,r),i},e.styfn.fromJson=function(t){var r=this;return r.resetToDefault(),e.style.applyFromJson(r,t),r},e.styfn.json=function(){for(var e=[],t=this.defaultLength;t<this.length;t++){for(var r=this[t],i=r.selector,n=r.properties,a={},o=0;o<n.length;o++){var s=n[o];a[s.name]=s.strValue}e.push({selector:i?i.toString():"core",style:a})}return e}}(cytoscape),function(e){"use strict";e.style.applyFromString=function(t,r){function i(){l=l.length>a.length?l.substr(a.length):""}function n(){o=o.length>s.length?o.substr(s.length):""}var a,o,s,l=""+r;for(l=l.replace(/[\/][*](\s|.)+?[*][\/]/g,"");;){var u=l.match(/^\s*$/);if(u)break;var c=l.match(/^\s*((?:.|\s)+?)\s*\{((?:.|\s)+?)\}/);if(!c){e.util.error("Halting stylesheet parsing: String stylesheet contains more to parse but no selector and block found in: "+l);break}a=c[0];var d=c[1];if("core"!==d){var h=new e.Selector(d);if(h._private.invalid){e.util.error("Skipping parsing of block: Invalid selector found in string stylesheet: "+d),i();continue}}var p=c[2],v=!1;o=p;for(var f=[];;){var u=o.match(/^\s*$/);if(u)break;var g=o.match(/^\s*(.+?)\s*:\s*(.+?)\s*;/);if(!g){e.util.error("Skipping parsing of block: Invalid formatting of style property and value definitions found in:"+p),v=!0;break}s=g[0];var y=g[1],m=g[2],x=e.style.properties[y];if(x){var b=t.parse(y,m);b?(f.push({name:y,val:m}),n()):(e.util.error("Skipping property: Invalid property definition in: "+s),n())}else e.util.error("Skipping property: Invalid property name in: "+s),n()}if(v){i();break}t.selector(d);for(var w=0;w<f.length;w++){var x=f[w];t.css(x.name,x.val)}i()}return t},e.style.fromString=function(t,r){var i=new e.Style(t);return e.style.applyFromString(i,r),i},e.styfn.fromString=function(t){var r=this;return r.resetToDefault(),e.style.applyFromString(r,t),r}}(cytoscape),function(e){"use strict";e.stylesheet=e.Stylesheet=function(){return this instanceof e.Stylesheet?void(this.length=0):new e.Stylesheet},e.sheetfn=e.Stylesheet.prototype,e.sheetfn.selector=function(e){var t=this.length++;return this[t]={selector:e,properties:[]},this},e.sheetfn.css=function(t,r){var i=this.length-1;if(e.is.string(t))this[i].properties.push({name:t,value:r});else if(e.is.plainObject(t))for(var n=t,a=0;a<e.style.properties.length;a++){var o=e.style.properties[a],s=n[o.name];if(void 0===s&&(s=n[e.util.dash2camel(o.name)]),void 0!==s){var t=o.name,r=s;this[i].properties.push({name:t,value:r})}}return this},e.sheetfn.style=e.sheetfn.css,e.sheetfn.generateStyle=function(t){for(var r=new e.Style(t),i=0;i<this.length;i++){var n=this[i],a=n.selector,o=n.properties;r.selector(a);for(var s=0;s<o.length;s++){var l=o[s];r.css(l.name,l.value)}}return r}}(cytoscape),function(e,t){"use strict";e.Thread=function(t){return this instanceof e.Thread?(this._private={requires:[],files:[],queue:null,pass:[]},void(t&&this.run(t))):new e.Thread(t)},e.thread=e.Thread,e.thdfn=e.Thread.prototype,e.fn.thread=function(t,r){for(var i in t){var n=t[i];e.Thread.prototype[i]=n}};var r=function(t){var r=e.is.fn(t)?t.toString():'JSON.parse("'+JSON.stringify(t)+'")';return r},i=function(t){var n,o;e.is.object(t)&&t.fn?(n=a(t.fn,t.name),o=t.name,t=t.fn):e.is.fn(t)?(n=t.toString(),o=t.name):e.is.string(t)?n=t:e.is.object(t)&&(n=t.proto?"":t.name+" = {};",o=t.name,t=t.obj),n+="\n";var s=function(e,t){if(e.prototype){var r=!1;for(var a in e.prototype){r=!0;break}r&&(n+=i({name:t,obj:e,proto:!0},e))}};if(t.prototype&&null!=o)for(var l in t.prototype){var u="",c=t.prototype[l],d=r(c),h=o+".prototype."+l;u+=h+" = "+d+";\n",u&&(n+=u),s(c,h)}if(!e.is.string(t))for(var l in t){var p="";if(t.hasOwnProperty(l)){var c=t[l],d=r(c),h=o+'["'+l+'"]';p+=h+" = "+d+";\n"}p&&(n+=p),s(c,h)}return n},n=function(t){return e.is.string(t)&&t.match(/\.js$/)};e.fn.thread({require:function(t,r){return n(t)?(this._private.files.push(t),this):(r&&(e.is.fn(t)?(r=r||t.name,t={name:r,fn:t}):t={name:r,obj:t}),this._private.requires.push(t),this)},pass:function(e){return this._private.pass.push(e),this},run:function(r,n){var a=this,o=this._private;if(n=n||o.pass.shift(),o.stopped)return void e.util.error("Attempted to run a stopped thread!  Start a new thread or do not stop the existing thread and reuse it.");if(o.running)return o.queue=o.queue.then(function(){return a.run(r,n)});var s=null!=t,l="undefined"!=typeof module;a.trigger("run");var u=new e.Promise(function(u,c){o.running=!0;var d=o.ran,h=e.is.string(r)?r:r.toString(),p="\n"+o.requires.map(function(e){return i(e)}).concat(o.files.map(function(e){if(s){var r=function(e){return e.match(/^\.\//)||e.match(/^\.\./)?t.location.origin+t.location.pathname+e:e.match(/^\//)?t.location.origin+"/"+e:e};return'importScripts("'+r(e)+'");'}return l?'eval( require("fs").readFileSync("'+e+'", { encoding: "utf8" }) );':void 0})).concat(["( function(){","var ret = ("+h+")("+JSON.stringify(n)+");","if( ret !== undefined ){ resolve(ret); }","} )()\n"]).join("\n");if(o.requires=[],o.files=[],s){var v,f;if(!d){var g=p+"";p=["function broadcast(m){ return message(m); };","function message(m){ postMessage(m); };","function listen(fn){",'  self.addEventListener("message", function(m){ ','    if( typeof m === "object" && (m.data.$$eval || m.data === "$$start") ){',"    } else { ","      fn( m.data );","    }","  });","};",'self.addEventListener("message", function(m){  if( m.data.$$eval ){ eval( m.data.$$eval ); }  });',"function resolve(v){ postMessage({ $$resolve: v }); };","function reject(v){ postMessage({ $$reject: v }); };"].join("\n"),p+=g,v=new Blob([p],{type:"application/javascript"}),f=t.URL.createObjectURL(v)}var y=o.webworker=o.webworker||new Worker(f);d&&y.postMessage({$$eval:p});var m;y.addEventListener("message",m=function(t){var r=e.is.object(t)&&e.is.object(t.data);r&&"$$resolve"in t.data?(y.removeEventListener("message",m),u(t.data.$$resolve)):r&&"$$reject"in t.data?(y.removeEventListener("message",m),c(t.data.$$reject)):a.trigger(new e.Event(t,{type:"message",message:t.data}))},!1),d||y.postMessage("$$start")}else if(l){var m,x=require("path"),b=require("child_process"),w=o.child=o.child||b.fork(x.join(__dirname,"thread-node-fork"));w.on("message",m=function(t){e.is.object(t)&&"$$resolve"in t?(w.removeListener("message",m),u(t.$$resolve)):e.is.object(t)&&"$$reject"in t?(w.removeListener("message",m),c(t.$$reject)):a.trigger(new e.Event({},{type:"message",message:t}))}),w.send({$$eval:p})}else e.error("Tried to create thread but no underlying tech found!")}).then(function(e){return o.running=!1,o.ran=!0,a.trigger("ran"),e});return null==o.queue&&(o.queue=u),u},message:function(e){var t=this._private;return t.webworker&&t.webworker.postMessage(e),t.child&&t.child.send(e),this},stop:function(){var e=this._private;return e.webworker&&e.webworker.terminate(),e.child&&e.child.kill(),e.stopped=!0,this.trigger("stop")},stopped:function(){return this._private.stopped}});var a=function(e,t){var r=e.toString();return r=r.replace(/function.*\(/,"function "+t+"(")},o=function(e){return e=e||{},function(t,r){var i=a(t,"_$_$_"+e.name);return this.require(i),this.run(["function( data ){","  var origResolve = resolve;","  var res = [];","  ","  resolve = function( val ){","    res.push( val );","  };","  ","  var ret = data."+e.name+"( _$_$_"+e.name+(arguments.length>1?", "+JSON.stringify(r):"")+" );","  ","  resolve = origResolve;","  resolve( res.length > 0 ? res : ret );","}"].join("\n"))}};e.fn.thread({reduce:o({name:"reduce"}),reduceRight:o({name:"reduceRight"}),map:o({name:"map"})});var s=e.thdfn;s.promise=s.run,s.terminate=s.halt=s.stop,s.include=s.require,e.worker=e.Worker=e.Thread,e.fn.thread({on:e.define.on(),one:e.define.on({unbindSelfOnTrigger:!0}),off:e.define.off(),trigger:e.define.trigger()}),e.define.eventAliasesOn(e.thdfn)}(cytoscape,"undefined"==typeof window?null:window),function(e,t){"use strict";e.Fabric=function(t){if(!(this instanceof e.Fabric))return new e.Fabric(t);this._private={pass:[]};var r=4;e.is.number(t),t="undefined"!=typeof navigator&&null!=navigator.hardwareConcurrency?navigator.hardwareConcurrency:"undefined"!=typeof module?require("os").cpus().length:r;for(var i=0;t>i;i++)this[i]=e.Thread();this.length=t},e.fabric=e.Fabric,e.fabfn=e.Fabric.prototype,e.fn.fabric=function(t,r){for(var i in t){var n=t[i];e.Fabric.prototype[i]=n}},e.fn.fabric({require:function(e,t){for(var r=0;r<this.length;r++){var i=this[r];i.require(e,t)}return this},random:function(){var e=Math.round((this.length-1)*Math.random()),t=this[e];return t},run:function(e){var t=this._private.pass.shift();return this.random().pass(t).run(e)},message:function(e){return this.random().message(e)},broadcast:function(e){for(var t=0;t<this.length;t++){var r=this[t];r.message(e)}return this},stop:function(){for(var e=0;e<this.length;e++){var t=this[e];t.stop()}return this},pass:function(t){var r=this._private.pass;return e.is.array(t)?r.push(t):e.util.error("Only arrays or collections may be used with fabric.pass()"),this},spreadSize:function(){var e=Math.ceil(this._private.pass[0].length/this.length);return e=Math.max(1,e)},spread:function(t){for(var r=this,i=r._private,n=r.spreadSize(),a=i.pass.shift().concat([]),o=[],s=0;s<this.length;s++){var l=this[s],u=a.splice(0,n),c=l.pass(u).run(t);o.push(c);var d=0===a.length;if(d)break}return e.Promise.all(o).then(function(e){for(var t=[],r=0,i=0;i<e.length;i++)for(var n=e[i],a=0;a<n.length;a++){var o=n[a];t[r++]=o}return t})},map:function(e){var t=this;return t.require(e,"_$_$_fabmap"),t.spread(function(e){var t=[],r=resolve;resolve=function(e){t.push(e)};for(var i=0;i<e.length;i++){var n=t.length,a=_$_$_fabmap(e[i]),o=n===t.length;o&&t.push(a)}return resolve=r,t})},filter:function(e){var t=this._private,r=t.pass[0];return this.map(e).then(function(e){for(var t=[],i=0;i<r.length;i++){var n=r[i],a=e[i];a&&t.push(n)}return t})},sort:function(e){var t=this,r=this._private.pass[0].length,i=this.spreadSize();return e=e||function(e,t){return t>e?-1:e>t?1:0},t.require(e,"_$_$_cmp"),t.spread(function(e){var t=e.sort(_$_$_cmp);resolve(t)}).then(function(t){for(var n=function(i,n,a){n=Math.min(n,r),a=Math.min(a,r);for(var o=i,s=n,l=[],u=o;a>u;u++){var c=t[i],d=t[n];s>i&&(n>=a||e(c,d)<=0)?(l.push(c),i++):(l.push(d),n++)}for(var u=0;u<l.length;u++){var h=o+u;t[h]=l[u]}},a=i;r>a;a*=2)for(var o=0;r>o;o+=2*a)n(o,o+a,o+2*a);return t})}});var r=function(e){return e=e||{},function(t,r){var i=this._private.pass.shift();return this.random().pass(i)[e.threadFn](t,r)}};e.fn.fabric({randomMap:r({threadFn:"map"}),reduce:r({threadFn:"reduce"}),reduceRight:r({threadFn:"reduceRight"})});var i=e.fabfn;i.promise=i.run,i.terminate=i.halt=i.stop,i.include=i.require,e.fn.fabric({on:e.define.on(),one:e.define.on({unbindSelfOnTrigger:!0}),off:e.define.off(),trigger:e.define.trigger()}),e.define.eventAliasesOn(e.fabfn)}(cytoscape,"undefined"==typeof window?null:window),function(e,t){"use strict";var r={},i=e.util.copy(r);e.defaults=function(t){r=e.util.extend({},i,t)},e.fn.core=function(t,r){for(var i in t){var n=t[i];e.Core.prototype[i]=n}},e.Core=function(i){if(!(this instanceof e.Core))return new e.Core(i);var n=this;i=e.util.extend({},r,i);var a=i.container,o=a?a._cyreg:null;if(o=o||{},o&&o.cy){if(a)for(;a.firstChild;)a.removeChild(a.firstChild);o.cy.notify({type:"destroy"}),o={}}var s=o.readies=o.readies||[];a&&(a._cyreg=o),o.cy=n;var l=void 0!==t&&void 0!==a&&!i.headless,u=i;u.layout=e.util.extend({name:l?"grid":"null"},u.layout),u.renderer=e.util.extend({name:l?"canvas":"null"},u.renderer);var c=function(e,t,r){return void 0!==t?t:void 0!==r?r:e},d=this._private={container:u.container,ready:!1,initrender:!1,options:u,elements:[],id2index:{},listeners:[],onRenders:[],aniEles:e.Collection(this),scratch:{},layout:null,renderer:null,notificationsEnabled:!0,minZoom:1e-50,maxZoom:1e50,zoomingEnabled:c(!0,u.zoomingEnabled),userZoomingEnabled:c(!0,u.userZoomingEnabled),panningEnabled:c(!0,u.panningEnabled),userPanningEnabled:c(!0,u.userPanningEnabled),boxSelectionEnabled:c(!1,u.boxSelectionEnabled),autolock:c(!1,u.autolock,u.autolockNodes),autoungrabify:c(!1,u.autoungrabify,u.autoungrabifyNodes),autounselectify:c(!1,u.autounselectify),styleEnabled:void 0===u.styleEnabled?l:u.styleEnabled,zoom:e.is.number(u.zoom)?u.zoom:1,pan:{x:e.is.plainObject(u.pan)&&e.is.number(u.pan.x)?u.pan.x:0,y:e.is.plainObject(u.pan)&&e.is.number(u.pan.y)?u.pan.y:0},animation:{current:[],queue:[]},hasCompoundNodes:!1,deferredExecQueue:[]},h=u.selectionType;d.selectionType=void 0===h||"additive"!==h&&"single"!==h?"single":h,e.is.number(u.minZoom)&&e.is.number(u.maxZoom)&&u.minZoom<u.maxZoom?(d.minZoom=u.minZoom,d.maxZoom=u.maxZoom):e.is.number(u.minZoom)&&void 0===u.maxZoom?d.minZoom=u.minZoom:e.is.number(u.maxZoom)&&void 0===u.minZoom&&(d.maxZoom=u.maxZoom);var p=function(t){for(var r=!1,i=0;i<v.length;i++){var n=v[i];if(e.is.promise(n)){r=!0;break}}return r?e.Promise.all(v).then(t):void t(v)},v=[u.style,u.elements];p(function(t){var r=t[0],i=t[1];d.styleEnabled&&n.setStyle(r),n.initRenderer(e.util.extend({hideEdgesOnViewport:u.hideEdgesOnViewport,hideLabelsOnViewport:u.hideLabelsOnViewport,textureOnViewport:u.textureOnViewport,wheelSensitivity:e.is.number(u.wheelSensitivity)&&u.wheelSensitivity>0?u.wheelSensitivity:1,motionBlur:void 0===u.motionBlur?!0:u.motionBlur,motionBlurOpacity:void 0===u.motionBlurOpacity?.05:u.motionBlurOpacity,pixelRatio:e.is.number(u.pixelRatio)&&u.pixelRatio>0?u.pixelRatio:"auto"===u.pixelRatio?void 0:1,desktopTapThreshold:void 0===u.desktopTapThreshold?4:u.desktopTapThreshold,touchTapThreshold:void 0===u.touchTapThreshold?8:u.touchTapThreshold},u.renderer)),u.initrender&&(n.on("initrender",u.initrender),n.on("initrender",function(){n._private.initrender=!0})),n.load(i,function(){n.startAnimationLoop(),n._private.ready=!0,e.is.fn(u.ready)&&n.on("ready",u.ready);for(var t=0;t<s.length;t++){var r=s[t];n.on("ready",r)}o&&(o.readies=[]),n.trigger("ready")},u.done)})},e.corefn=e.Core.prototype,e.fn.core({isReady:function(){return this._private.ready},ready:function(e){this.isReady()?this.trigger("ready",[],e):this.on("ready",e)},initrender:function(){return this._private.initrender},destroy:function(){this.notify({type:"destroy"});var e=this.container(),t=e.parentNode;if(t)try{t.removeChild(e)}catch(r){}return this},getElementById:function(t){var r=this._private.id2index[t];return void 0!==r?this._private.elements[r]:new e.Collection(this)},selectionType:function(){return this._private.selectionType},hasCompoundNodes:function(){return this._private.hasCompoundNodes},styleEnabled:function(){return this._private.styleEnabled},addToPool:function(e){for(var t=this._private.elements,r=this._private.id2index,i=0;i<e.length;i++){var n=e[i],a=n._private.data.id,o=r[a],s=void 0!==o;s||(o=t.length,t.push(n),r[a]=o,n._private.index=o)}return this},removeFromPool:function(e){for(var t=this._private.elements,r=this._private.id2index,i=0;i<e.length;i++){var n=e[i],a=n._private.data.id,o=r[a],s=void 0!==o;if(s){this._private.id2index[a]=void 0,t.splice(o,1);for(var l=o;l<t.length;l++){var u=t[l]._private.data.id;r[u]--,t[l]._private.index--}}}},container:function(){return this._private.container},options:function(){return e.util.copy(this._private.options)},json:function(e){var t={},r=this;return t.elements={},r.elements().each(function(e,r){var i=r.group();t.elements[i]||(t.elements[i]=[]),t.elements[i].push(r.json())}),this._private.styleEnabled&&(t.style=r.style().json()),t.zoomingEnabled=r._private.zoomingEnabled,t.userZoomingEnabled=r._private.userZoomingEnabled,t.zoom=r._private.zoom,t.minZoom=r._private.minZoom,t.maxZoom=r._private.maxZoom,t.panningEnabled=r._private.panningEnabled,t.userPanningEnabled=r._private.userPanningEnabled,t.pan=r._private.pan,t.boxSelectionEnabled=r._private.boxSelectionEnabled,t.layout=r._private.options.layout,t.renderer=r._private.options.renderer,t.hideEdgesOnViewport=r._private.options.hideEdgesOnViewport,t.hideLabelsOnViewport=r._private.options.hideLabelsOnViewport,t.textureOnViewport=r._private.options.textureOnViewport,t.wheelSensitivity=r._private.options.wheelSensitivity,t.motionBlur=r._private.options.motionBlur,t},defer:function(e){var t=this,r=t._private,i=r.deferredExecQueue;i.push(e),r.deferredTimeout||(r.deferredTimeout=setTimeout(function(){for(;i.length>0;)i.shift()();r.deferredTimeout=null},0))}})}(cytoscape,"undefined"==typeof window?null:window),function(e,t){"use strict";function r(e){var t=!document||"interactive"!==document.readyState&&"complete"!==document.readyState?r:e;setTimeout(t,9,e)}e.fn.core({add:function(t){var r,i=this;if(e.is.elementOrCollection(t)){var n=t;if(n._private.cy===i)r=n.restore();else{for(var a=[],o=0;o<n.length;o++){var s=n[o];a.push(s.json())}r=new e.Collection(i,a)}}else if(e.is.array(t)){var a=t;r=new e.Collection(i,a)}else if(e.is.plainObject(t)&&(e.is.array(t.nodes)||e.is.array(t.edges))){for(var l=t,a=[],u=["nodes","edges"],o=0,c=u.length;c>o;o++){var d=u[o],h=l[d];if(e.is.array(h))for(var p=0,v=h.length;v>p;p++){var f=h[p];f.group=d,a.push(f)}}r=new e.Collection(i,a)}else{var f=t;r=new e.Element(i,f).collection()}return r},remove:function(t){if(e.is.elementOrCollection(t))t=t;else if(e.is.string(t)){var r=t;t=this.$(r)}return t.remove()},load:function(i,n,a){function o(){s.one("layoutready",function(e){s.notifications(!0),s.trigger(e),s.notify({type:"load",collection:s.elements()}),s.one("load",n),s.trigger("load")}).one("layoutstop",function(){s.one("done",a),s.trigger("done")});var t=e.util.extend({},s._private.options.layout);t.eles=s.$(),s.layout(t)}var s=this;s.notifications(!1);var l=s.elements();return l.length>0&&l.remove(),null!=i&&(e.is.plainObject(i)||e.is.array(i))&&s.add(i),t?r(o):o(),this}})}(cytoscape,"undefined"==typeof window?null:window),function(e,t){"use strict";e.fn.core({animated:e.define.animated(),clearQueue:e.define.clearQueue(),delay:e.define.delay(),animate:e.define.animate(),stop:e.define.stop(),addToAnimationPool:function(e){var t=this;t.styleEnabled()&&t._private.aniEles.merge(e)},startAnimationLoop:function(){function r(){e.util.requestAnimationFrame(function(e){i(e),r()})}function i(t){function r(r,i){var l=r._private.animation.current,u=r._private.animation.queue,c=!1;if(0===l.length){var d=u.length>0?u.shift():null;d&&(d.callTime=t,l.push(d))}for(var h=[],p=l.length-1;p>=0;p--){var v=l[p];v.started||(n(r,v),s=!0),a(r,v,t,i),v.done&&(h.push(v),l.splice(p,1)),c=!0}for(var p=0;p<h.length;p++){var v=h[p],f=v.params.complete;e.is.fn(f)&&f.apply(r,[t])}return i||0!==l.length||0!==u.length||o.push(r),c}t=+new Date;for(var i=l._private.aniEles,o=[],s=!1,u=0;u<i.length;u++){var c=i[u];r(c)}var d=r(l,!0);if(i.length>0||d){var h;if(i.length>0){var p=i.updateCompoundBounds();h=p.length>0?i.add(p):i}l.notify({type:s?"style":"draw",collection:h})}i.unmerge(o)}function n(t,r){var i=e.is.core(t),n=!i,a=t,o=l._private.style;if(n)var s=a._private.position,u={x:s.x,y:s.y},c=o.getValueStyle(a);if(i)var d=l._private.pan,h={x:d.x,y:d.y},p=l._private.zoom;r.started=!0,r.startTime=Date.now(),r.startPosition=u,r.startStyle=c,r.startPan=h,r.startZoom=p}function a(t,r,i,n){var a,u=l._private.style,c=r.properties,d=r.params,h=r.startTime,p=!n;if(a=0===r.duration?1:Math.min(1,(i-h)/r.duration),0>a?a=0:a>1&&(a=1),null==c.delay){var v=r.startPosition,f=c.position,g=t._private.position;f&&p&&(o(v.x,f.x)&&(g.x=s(v.x,f.x,a)),o(v.y,f.y)&&(g.y=s(v.y,f.y,a)));var y=r.startPan,m=c.pan,x=t._private.pan,b=null!=m&&n;b&&(o(y.x,m.x)&&(x.x=s(y.x,m.x,a)),o(y.y,m.y)&&(x.y=s(y.y,m.y,a)),t.trigger("pan"));var w=r.startZoom,_=c.zoom,E=null!=_&&n;E&&(o(w,_)&&(t._private.zoom=s(w,_,a)),t.trigger("zoom")),(b||E)&&t.trigger("viewport");var S=c.style||c.css;if(S&&p)for(var D=0;D<S.length;D++){var k=S[D].name,T=S[D],P=T,C=r.startStyle[k],M=s(C,P,a);u.overrideBypass(t,k,M)}}return e.is.fn(d.step)&&d.step.apply(t,[i]),a>=1&&(r.done=!0),a}function o(t,r){return null==t||null==r?!1:e.is.number(t)&&e.is.number(r)?!0:t&&r?!0:!1}function s(t,r,i){0>i?i=0:i>1&&(i=1);var n,a;if(n=null!=t.pxValue||null!=t.value?null!=t.pxValue?t.pxValue:t.value:t,a=null!=r.pxValue||null!=r.value?null!=r.pxValue?r.pxValue:r.value:r,e.is.number(n)&&e.is.number(a))return n+(a-n)*i;if(e.is.number(n[0])&&e.is.number(a[0])){var o=n,s=a,l=function(e,t){var r=t-e,n=e;return Math.round(i*r+n)},u=l(o[0],s[0]),c=l(o[1],s[1]),d=l(o[2],s[2]);return[u,c,d]}return void 0}var l=this;l.styleEnabled()&&t&&r()}})}(cytoscape,"undefined"==typeof window?null:window),function(e){"use strict";e.fn.core({data:e.define.data({field:"data",bindingEvent:"data",allowBinding:!0,allowSetting:!0,settingEvent:"data",settingTriggersEvent:!0,triggerFnName:"trigger",allowGetting:!0}),removeData:e.define.removeData({field:"data",event:"data",triggerFnName:"trigger",triggerEvent:!0}),scratch:e.define.data({field:"scratch",allowBinding:!1,allowSetting:!0,settingTriggersEvent:!1,allowGetting:!0}),removeScratch:e.define.removeData({field:"scratch",triggerEvent:!1})})}(cytoscape),function(e){"use strict";e.fn.core({on:e.define.on(),one:e.define.on({unbindSelfOnTrigger:!0}),once:e.define.on({unbindAllBindersOnTrigger:!0}),off:e.define.off(),trigger:e.define.trigger()}),e.define.eventAliasesOn(e.corefn)}(cytoscape),function(e){"use strict";e.fn.core({png:function(e){var t=this._private.renderer;return e=e||{},t.png(e)},jpg:function(e){var t=this._private.renderer;return e=e||{},e.bg=e.bg||"#fff",t.jpg(e)}}),e.corefn.jpeg=e.corefn.jpg}(cytoscape),function(e){"use strict";e.fn.core({layout:function(t){var r;return null==t&&(t=e.util.extend({},this._private.options.layout),t.eles=this.$()),r=this.initLayout(t),r.run(),this},makeLayout:function(e){return this.initLayout(e)},initLayout:function(t){if(null==t)return void e.util.error("Layout options must be specified to make a layout");if(null==t.name)return void e.util.error("A `name` must be specified to make a layout");var r=t.name,i=e.extension("layout",r);if(null==i)return void e.util.error("Can not apply layout: No such layout `"+r+"` found; did you include its JS file?");t.eles=null!=t.eles?t.eles:this.$(),e.is.string(t.eles)&&(t.eles=this.$(t.eles));var n=new i(e.util.extend({},t,{cy:this}));return e.is.plainObject(n._private)||(n._private={}),n._private.cy=this,n._private.listeners=[],n}}),e.corefn.createLayout=e.corefn.makeLayout}(cytoscape),function(e){"use strict";e.fn.core({notify:function(e){if(this._private.batchingNotify){var t=this._private.batchNotifyEles,r=this._private.batchNotifyTypes;if(e.collection)for(var i=0;i<e.collection.length;i++){var n=e.collection[i];t.ids[n._private.id]||t.push(n)}return void(r.ids[e.type]||r.push(e.type))}if(this._private.notificationsEnabled){var a=this.renderer();a.notify(e)}},notifications:function(e){var t=this._private;return void 0===e?t.notificationsEnabled:void(t.notificationsEnabled=e?!0:!1)},noNotifications:function(e){this.notifications(!1),e(),this.notifications(!0)},startBatch:function(){var e=this._private;return e.batchingStyle=e.batchingNotify=!0,e.batchStyleEles=[],e.batchNotifyEles=[],e.batchNotifyTypes=[],e.batchStyleEles.ids={},e.batchNotifyEles.ids={},e.batchNotifyTypes.ids={},this},endBatch:function(){var t=this._private;return t.batchingStyle=!1,new e.Collection(this,t.batchStyleEles).updateStyle(),t.batchingNotify=!1,this.notify({type:t.batchNotifyTypes,collection:t.batchNotifyEles}),this},batch:function(e){return this.startBatch(),e(),this.endBatch(),this},batchData:function(e){var t=this;return this.batch(function(){for(var r in e){var i=e[r],n=t.getElementById(r);n.data(i)}})}})}(cytoscape),function(e){"use strict";e.fn.core({renderTo:function(e,t,r,i){var n=this._private.renderer;return n.renderTo(e,t,r,i),this},renderer:function(){return this._private.renderer},forceRender:function(){return this.notify({type:"draw"}),this},resize:function(){return this.notify({type:"resize"}),this.trigger("resize"),this},initRenderer:function(t){var r=this,i=e.extension("renderer",t.name);return null==i?void e.util.error("Can not initialise: No such renderer `%s` found; did you include its JS file?",t.name):void(this._private.renderer=new i(e.util.extend({},t,{cy:r,style:r._private.style})))},triggerOnRender:function(){for(var e=this._private.onRenders,t=0;t<e.length;t++){var r=e[t];r()}return this},onRender:function(e){return this._private.onRenders.push(e),this},offRender:function(e){var t=this._private.onRenders;if(null==e)return this._private.onRenders=[],this;for(var r=0;r<t.length;r++){var i=t[r];if(e===i){t.splice(r,1);break}}return this}})}(cytoscape),function(e){"use strict";e.fn.core({collection:function(t){return e.is.string(t)?this.$(t):e.is.elementOrCollection(t)?t.collection():e.is.array(t)?new e.Collection(this,t):new e.Collection(this)},nodes:function(e){var t=this.$(function(){return this.isNode()});return e?t.filter(e):t},edges:function(e){var t=this.$(function(){return this.isEdge()});return e?t.filter(e):t},$:function(t){var r=new e.Collection(this,this._private.elements);return t?r.filter(t):r}}),e.corefn.elements=e.corefn.filter=e.corefn.$}(cytoscape),function(e){"use strict";e.fn.core({style:function(e){if(e){var t=this.setStyle(e);t.update()}return this._private.style},setStyle:function(t){var r=this._private;return r.style=e.is.stylesheet(t)?t.generateStyle(this):e.is.array(t)?e.style.fromJson(this,t):e.is.string(t)?e.style.fromString(this,t):new e.Style(this),r.style}})}(cytoscape),function(e){"use strict";e.fn.core({autolock:function(e){return void 0===e?this._private.autolock:(this._private.autolock=e?!0:!1,this)},autoungrabify:function(e){return void 0===e?this._private.autoungrabify:(this._private.autoungrabify=e?!0:!1,this)},autounselectify:function(e){return void 0===e?this._private.autounselectify:(this._private.autounselectify=e?!0:!1,this)},panningEnabled:function(e){return void 0===e?this._private.panningEnabled:(this._private.panningEnabled=e?!0:!1,this)},userPanningEnabled:function(e){return void 0===e?this._private.userPanningEnabled:(this._private.userPanningEnabled=e?!0:!1,this)},zoomingEnabled:function(e){return void 0===e?this._private.zoomingEnabled:(this._private.zoomingEnabled=e?!0:!1,this)},userZoomingEnabled:function(e){return void 0===e?this._private.userZoomingEnabled:(this._private.userZoomingEnabled=e?!0:!1,this)},boxSelectionEnabled:function(e){return void 0===e?this._private.boxSelectionEnabled:(this._private.boxSelectionEnabled=e?!0:!1,
this)},pan:function(){var t,r,i,n,a,o=arguments,s=this._private.pan;switch(o.length){case 0:return s;case 1:if(e.is.string(o[0]))return t=o[0],s[t];if(e.is.plainObject(o[0])){if(!this._private.panningEnabled)return this;i=o[0],n=i.x,a=i.y,e.is.number(n)&&(s.x=n),e.is.number(a)&&(s.y=a),this.trigger("pan viewport")}break;case 2:if(!this._private.panningEnabled)return this;t=o[0],r=o[1],"x"!==t&&"y"!==t||!e.is.number(r)||(s[t]=r),this.trigger("pan viewport")}return this.notify({type:"viewport"}),this},panBy:function(t){var r,i,n,a,o,s=arguments,l=this._private.pan;if(!this._private.panningEnabled)return this;switch(s.length){case 1:e.is.plainObject(s[0])&&(n=s[0],a=n.x,o=n.y,e.is.number(a)&&(l.x+=a),e.is.number(o)&&(l.y+=o),this.trigger("pan viewport"));break;case 2:r=s[0],i=s[1],"x"!==r&&"y"!==r||!e.is.number(i)||(l[r]+=i),this.trigger("pan viewport")}return this.notify({type:"viewport"}),this},fit:function(e,t){var r=this.getFitViewport(e,t);if(r){var i=this._private;i.zoom=r.zoom,i.pan=r.pan,this.trigger("pan zoom viewport"),this.notify({type:"viewport"})}return this},getFitViewport:function(t,r){if(e.is.number(t)&&void 0===r&&(r=t,t=void 0),this._private.panningEnabled&&this._private.zoomingEnabled){var i;if(e.is.string(t)){var n=t;t=this.$(n)}else if(e.is.boundingBox(t)){var a=t;i={x1:a.x1,y1:a.y1,x2:a.x2,y2:a.y2},i.w=i.x2-i.x1,i.h=i.y2-i.y1}else e.is.elementOrCollection(t)||(t=this.elements());i=i||t.boundingBox();var o,s=this.width(),l=this.height();if(r=e.is.number(r)?r:0,!isNaN(s)&&!isNaN(l)&&s>0&&l>0&&!isNaN(i.w)&&!isNaN(i.h)&&i.w>0&&i.h>0){o=Math.min((s-2*r)/i.w,(l-2*r)/i.h),o=o>this._private.maxZoom?this._private.maxZoom:o,o=o<this._private.minZoom?this._private.minZoom:o;var u={x:(s-o*(i.x1+i.x2))/2,y:(l-o*(i.y1+i.y2))/2};return{zoom:o,pan:u}}}},minZoom:function(t){return void 0===t?this._private.minZoom:(e.is.number(t)&&(this._private.minZoom=t),this)},maxZoom:function(t){return void 0===t?this._private.maxZoom:(e.is.number(t)&&(this._private.maxZoom=t),this)},zoom:function(t){var r,i;if(void 0===t)return this._private.zoom;if(e.is.number(t))i=t;else if(e.is.plainObject(t)){if(i=t.level,t.position){var n=t.position,a=this._private.pan,o=this._private.zoom;r={x:n.x*o+a.x,y:n.y*o+a.y}}else t.renderedPosition&&(r=t.renderedPosition);if(r&&!this._private.panningEnabled)return this}if(!this._private.zoomingEnabled)return this;if(!e.is.number(i)||r&&(!e.is.number(r.x)||!e.is.number(r.y)))return this;if(i=i>this._private.maxZoom?this._private.maxZoom:i,i=i<this._private.minZoom?this._private.minZoom:i,r){var s=this._private.pan,l=this._private.zoom,u=i,c={x:-u/l*(r.x-s.x)+r.x,y:-u/l*(r.y-s.y)+r.y};this._private.zoom=i,this._private.pan=c;var d=s.x!==c.x||s.y!==c.y;this.trigger(" zoom "+(d?" pan ":"")+" viewport ")}else this._private.zoom=i,this.trigger("zoom viewport");return this.notify({type:"viewport"}),this},viewport:function(t){var r=this._private,i=!0,n=!0,a=[],o=!1,s=!1;if(!t)return this;if(e.is.number(t.zoom)||(i=!1),e.is.plainObject(t.pan)||(n=!1),!i&&!n)return this;if(i){var l=t.zoom;l<r.minZoom||l>r.maxZoom||!r.zoomingEnabled?o=!0:(r.zoom=l,a.push("zoom"))}if(n&&(!o||!t.cancelOnFailedZoom)&&r.panningEnabled){var u=t.pan;e.is.number(u.x)&&(r.pan.x=u.x,s=!1),e.is.number(u.y)&&(r.pan.y=u.y,s=!1),s||a.push("pan")}return a.length>0&&(a.push("viewport"),this.trigger(a.join(" ")),this.notify({type:"viewport"})),this},center:function(e){var t=this.getCenterPan(e);return t&&(this._private.pan=t,this.trigger("pan viewport"),this.notify({type:"viewport"})),this},getCenterPan:function(t,r){if(this._private.panningEnabled){if(e.is.string(t)){var i=t;t=this.elements(i)}else e.is.elementOrCollection(t)||(t=this.elements());var n=t.boundingBox(),a=this.width(),o=this.height();r=void 0===r?this._private.zoom:r;var s={x:(a-r*(n.x1+n.x2))/2,y:(o-r*(n.y1+n.y2))/2};return s}},reset:function(){return this._private.panningEnabled&&this._private.zoomingEnabled?(this.viewport({pan:{x:0,y:0},zoom:1}),this):this},width:function(){var e=this._private.container;return e?e.clientWidth:1},height:function(){var e=this._private.container;return e?e.clientHeight:1},extent:function(){var e=this._private.pan,t=this._private.zoom,r=this.renderedExtent(),i={x1:(r.x1-e.x)/t,x2:(r.x2-e.x)/t,y1:(r.y1-e.y)/t,y2:(r.y2-e.y)/t};return i.w=i.x2-i.x1,i.h=i.y2-i.y1,i},renderedExtent:function(){var e=this.width(),t=this.height();return{x1:0,y1:0,x2:e,y2:t,w:e,h:t}}}),e.corefn.centre=e.corefn.center,e.corefn.autolockNodes=e.corefn.autolock,e.corefn.autoungrabifyNodes=e.corefn.autoungrabify}(cytoscape),function(e){"use strict";e.fn.collection=e.fn.eles=function(t,r){for(var i in t){var n=t[i];e.Collection.prototype[i]=n}};var t={prefix:{nodes:"n",edges:"e"},id:{nodes:0,edges:0},generate:function(t,r,i){var n=e.is.element(r)?r._private:r,a=n.group,o=null!=i?i:this.prefix[a]+this.id[a];if(t.getElementById(o).empty())this.id[a]++;else for(;!t.getElementById(o).empty();)o=this.prefix[a]+ ++this.id[a];return o}};e.Element=function(t,r,i){if(!(this instanceof e.Element))return new e.Element(t,r,i);var n=this;if(i=void 0===i||i?!0:!1,void 0===t||void 0===r||!e.is.core(t))return void e.util.error("An element must have a core reference and parameters set");if("nodes"!==r.group&&"edges"!==r.group)return void e.util.error("An element must be of type `nodes` or `edges`; you specified `"+r.group+"`");if(this.length=1,this[0]=this,this._private={cy:t,single:!0,data:r.data||{},position:r.position||{},autoWidth:void 0,autoHeight:void 0,listeners:[],group:r.group,style:{},rstyle:{},styleCxts:[],removed:!0,selected:r.selected?!0:!1,selectable:void 0===r.selectable?!0:r.selectable?!0:!1,locked:r.locked?!0:!1,grabbed:!1,grabbable:void 0===r.grabbable?!0:r.grabbable?!0:!1,active:!1,classes:{},animation:{current:[],queue:[]},rscratch:{},scratch:r.scratch||{},edges:[],children:[]},r.renderedPosition){var a=r.renderedPosition,o=t.pan(),s=t.zoom();this._private.position={x:(a.x-o.x)/s,y:(a.y-o.y)/s}}if(e.is.string(r.classes))for(var l=r.classes.split(/\s+/),u=0,c=l.length;c>u;u++){var d=l[u];d&&""!==d&&(n._private.classes[d]=!0)}r.css&&t.style().applyBypass(this,r.css),(void 0===i||i)&&this.restore()},e.Collection=function(r,i,n){if(!(this instanceof e.Collection))return new e.Collection(r,i);if(void 0===r||!e.is.core(r))return void e.util.error("A collection must have a reference to the core");var a={},o={},s=!1;if(i){if(i.length>0&&e.is.plainObject(i[0])&&!e.is.element(i[0])){s=!0;for(var l=[],u={},c=0,d=i.length;d>c;c++){var h=i[c];null==h.data&&(h.data={});var p=h.data;if(null==p.id)p.id=t.generate(r,h);else if(0!==r.getElementById(p.id).length||u[p.id])continue;var v=new e.Element(r,h,!1);l.push(v),u[p.id]=!0}i=l}}else i=[];this.length=0;for(var c=0,d=i.length;d>c;c++){var f=i[c];if(f){var g=f._private.data.id;(!n||n.unique&&!a[g])&&(a[g]=f,o[g]=this.length,this[this.length]=f,this.length++)}}this._private={cy:r,ids:a,indexes:o},s&&this.restore()},e.elefn=e.elesfn=e.Element.prototype=e.Collection.prototype,e.elesfn.cy=function(){return this._private.cy},e.elesfn.element=function(){return this[0]},e.elesfn.collection=function(){return e.is.collection(this)?this:new e.Collection(this._private.cy,[this])},e.elesfn.unique=function(){return new e.Collection(this._private.cy,this,{unique:!0})},e.elesfn.getElementById=function(t){var r=this._private.cy,i=this._private.ids[t];return i?i:e.Collection(r)},e.elesfn.json=function(){var t=this.element();if(null==t)return void 0;var r=t._private,i=e.util.copy({data:r.data,position:r.position,group:r.group,bypass:r.bypass,removed:r.removed,selected:r.selected,selectable:r.selectable,locked:r.locked,grabbed:r.grabbed,grabbable:r.grabbable,classes:""}),n=[];for(var a in r.classes)r.classes[a]&&n.push(a);for(var o=0;o<n.length;o++){var a=n[o];i.classes+=a+(o<n.length-1?" ":"")}return i},e.elesfn.jsons=function(){for(var e=[],t=0;t<this.length;t++){var r=this[t],i=r.json();e.push(i)}return e},e.elesfn.clone=function(){for(var t=this.cy(),r=[],i=0;i<this.length;i++){var n=this[i],a=n.json(),o=new e.Element(t,a,!1);r.push(o)}return new e.Collection(t,r)},e.elesfn.copy=e.elesfn.clone,e.elesfn.restore=function(r){var i=this,n=[],a=i.cy();void 0===r&&(r=!0);for(var o=[],s=[],l=[],u=0,c=0,d=0,h=i.length;h>d;d++){var p=i[d];p.isNode()?(s.push(p),u++):(l.push(p),c++)}o=s.concat(l);for(var d=0,h=o.length;h>d;d++){var p=o[d];if(p.removed()){var v=p._private,f=v.data;if(void 0===f.id)f.id=t.generate(a,p);else if(e.is.number(f.id))f.id=""+f.id;else{if(e.is.emptyString(f.id)||!e.is.string(f.id)){e.util.error("Can not create element with invalid string ID `"+f.id+"`");continue}if(0!==a.getElementById(f.id).length){e.util.error("Can not create second element with ID `"+f.id+"`");continue}}var g=f.id;if(p.isEdge()){for(var y=p,m=["source","target"],x=m.length,b=!1,w=0;x>w;w++){var _=m[w],E=f[_];e.is.number(E)&&(E=f[_]=""+f[_]),null==E||""===E?(e.util.error("Can not create edge `"+g+"` with unspecified "+_),b=!0):a.getElementById(E).empty()&&(e.util.error("Can not create edge `"+g+"` with nonexistant "+_+" `"+E+"`"),b=!0)}if(b)continue;var S=a.getElementById(f.source),D=a.getElementById(f.target);S._private.edges.push(y),D._private.edges.push(y),y._private.source=S,y._private.target=D}v.ids={},v.ids[g]=p,v.removed=!1,a.addToPool(p),n.push(p)}}for(var d=0;u>d;d++){var k=o[d],f=k._private.data;e.is.number(f.parent)&&(f.parent=""+f.parent);var T=f.parent,P=null!=T;if(P){var C=a.getElementById(T);if(C.empty())f.parent=void 0;else{for(var M=!1,B=C;!B.empty();){if(k.same(B)){M=!0,f.parent=void 0;break}B=B.parent()}M||(C[0]._private.children.push(k),k._private.parent=C[0],a._private.hasCompoundNodes=!0)}}}if(n=new e.Collection(a,n),n.length>0){var N=n.add(n.connectedNodes()).add(n.parent());N.updateStyle(r),r?n.rtrigger("add"):n.trigger("add")}return i},e.elesfn.removed=function(){var e=this[0];return e&&e._private.removed},e.elesfn.inside=function(){var e=this[0];return e&&!e._private.removed},e.elesfn.remove=function(t){function r(e){for(var t=e._private.edges,r=0;r<t.length;r++)n(t[r])}function i(e){for(var t=e._private.children,r=0;r<t.length;r++)n(t[r])}function n(e){var t=c[e.id()];t||(c[e.id()]=!0,e.isNode()?(u.push(e),r(e),i(e)):u.unshift(e))}function a(e,t){for(var r=e._private.edges,i=0;i<r.length;i++){var n=r[i];if(t===n){r.splice(i,1);break}}}function o(e,t){t=t[0],e=e[0];for(var r=e._private.children,i=0;i<r.length;i++)if(r[i][0]===t[0]){r.splice(i,1);break}}var s=this,l=[],u=[],c={},d=s._private.cy;void 0===t&&(t=!0);for(var h=0,p=s.length;p>h;h++){var v=s[h];n(v)}for(var h=0;h<u.length;h++){var v=u[h];if(v._private.removed=!0,d.removeFromPool(v),l.push(v),v.isEdge()){var f=v.source()[0],g=v.target()[0];a(f,v),a(g,v)}else{var y=v.parent();0!==y.length&&o(y,v)}}var m=d._private.elements;d._private.hasCompoundNodes=!1;for(var h=0;h<m.length;h++){var v=m[h];if(v.isParent()){d._private.hasCompoundNodes=!0;break}}var x=new e.Collection(this.cy(),l);x.size()>0&&(t&&this.cy().notify({type:"remove",collection:x}),x.trigger("remove"));for(var b={},h=0;h<u.length;h++){var v=u[h],w="nodes"===v._private.group,_=v._private.data.parent;if(w&&void 0!==_&&!b[_]){b[_]=!0;var y=d.getElementById(_);y&&0!==y.length&&!y._private.removed&&0===y.children().length&&y.updateStyle()}}return this},e.elesfn.move=function(e){var t=this._private.cy;if(void 0!==e.source||void 0!==e.target){var r=e.source,i=e.target,n=t.getElementById(r).length>0,a=t.getElementById(i).length>0;if(n||a){var o=this.jsons();this.remove();for(var s=0;s<o.length;s++){var l=o[s];"edges"===l.group&&(n&&(l.data.source=r),a&&(l.data.target=i))}return t.add(o)}}else if(void 0!==e.parent){var u=e.parent,c=null===u||t.getElementById(u).length>0;if(c){var o=this.jsons(),d=this.descendants(),h=d.merge(d.add(this).connectedEdges());this.remove();for(var s=0;s<this.length;s++){var l=o[s];"nodes"===l.group&&(l.data.parent=null===u?void 0:u)}}return t.add(o).merge(h.restore())}return this}}(cytoscape),function(e){"use strict";e.fn.eles({stdBreadthFirstSearch:function(t){return t=e.util.extend({},t,{std:!0}),this.breadthFirstSearch(t)},breadthFirstSearch:function(t,r,i){var n,a,o;e.is.plainObject(t)&&!e.is.elementOrCollection(t)&&(n=t,t=n.roots,r=n.visit,i=n.directed,a=n.std,o=n.thisArg),i=2!==arguments.length||e.is.fn(r)?i:r,r=e.is.fn(r)?r:function(){};for(var s,l=this._private.cy,u=e.is.string(t)?this.filter(t):t,c=[],d=[],h={},p={},v={},f=0,g=this.nodes(),y=this.edges(),m=0;m<u.length;m++)u[m].isNode()&&(c.unshift(u[m]),v[u[m].id()]=!0,d.push(u[m]),p[u[m].id()]=0);for(;0!==c.length;){var x,u=c.shift(),b=p[u.id()],w=h[u.id()],_=null==w?void 0:w.connectedNodes().not(u)[0];if(x=a?r.call(o,u,w,_,f++,b):r.call(u,f++,b,u,w,_),x===!0){s=u;break}if(x===!1)break;for(var E=u.connectedEdges(i?function(){return this.data("source")===u.id()}:void 0).intersect(y),m=0;m<E.length;m++){var S=E[m],D=S.connectedNodes(function(){return this.id()!==u.id()}).intersect(g);0===D.length||v[D.id()]||(D=D[0],c.push(D),v[D.id()]=!0,p[D.id()]=p[u.id()]+1,d.push(D),h[D.id()]=S)}}for(var k=[],m=0;m<d.length;m++){var T=d[m],P=h[T.id()];P&&k.push(P),k.push(T)}return{path:new e.Collection(l,k,{unique:!0}),found:new e.Collection(l,s,{unique:!0})}},stdDepthFirstSearch:function(t){return t=e.util.extend({},t,{std:!0}),this.depthFirstSearch(t)},depthFirstSearch:function(t,r,i){var n,a,o;e.is.plainObject(t)&&!e.is.elementOrCollection(t)&&(n=t,t=n.roots,r=n.visit,i=n.directed,a=n.std,o=n.thisArg),i=2!==arguments.length||e.is.fn(r)?i:r,r=e.is.fn(r)?r:function(){};for(var s,l=this._private.cy,u=e.is.string(t)?this.filter(t):t,c=[],d=[],h={},p={},v={},f=0,g=this.edges(),y=this.nodes(),m=0;m<u.length;m++)u[m].isNode()&&(c.push(u[m]),d.push(u[m]),p[u[m].id()]=0);for(;0!==c.length;){var u=c.pop();if(!v[u.id()]){v[u.id()]=!0;var x,b=p[u.id()],w=h[u.id()],_=null==w?void 0:w.connectedNodes().not(u)[0];if(x=a?r.call(o,u,w,_,f++,b):r.call(u,f++,b,u,w,_),x===!0){s=u;break}if(x===!1)break;for(var E=u.connectedEdges(i?function(){return this.data("source")===u.id()}:void 0).intersect(g),m=0;m<E.length;m++){var S=E[m],D=S.connectedNodes(function(){return this.id()!==u.id()}).intersect(y);0===D.length||v[D.id()]||(D=D[0],c.push(D),p[D.id()]=p[u.id()]+1,d.push(D),h[D.id()]=S)}}}for(var k=[],m=0;m<d.length;m++){var T=d[m],P=h[T.id()];P&&k.push(P),k.push(T)}return{path:new e.Collection(l,k,{unique:!0}),found:new e.Collection(l,s,{unique:!0})}},kruskal:function(t){function r(e){for(var t=0;t<n.length;t++){var r=n[t];if(r.anySame(e))return{eles:r,index:t}}}t=e.is.fn(t)?t:function(){return 1};for(var i=new e.Collection(this._private.cy,[]),n=[],a=this.nodes(),o=0;o<a.length;o++)n.push(a[o].collection());for(var s=this.edges(),l=s.toArray().sort(function(e,r){var i=t.call(e,e),n=t.call(r,r);return i-n}),o=0;o<l.length;o++){var u=l[o],c=u.source()[0],d=u.target()[0],h=r(c),p=r(d);h.index!==p.index&&(i=i.add(u),n[h.index]=h.eles.add(p.eles),n.splice(p.index,1))}return a.add(i)},dijkstra:function(t,r,i){var n;e.is.plainObject(t)&&!e.is.elementOrCollection(t)&&(n=t,t=n.root,r=n.weight,i=n.directed);var a=this._private.cy;r=e.is.fn(r)?r:function(){return 1};for(var o=e.is.string(t)?this.filter(t)[0]:t[0],s={},l={},u={},c=this.edges().filter(function(){return!this.isLoop()}),d=this.nodes(),h=[],p=0;p<d.length;p++)s[d[p].id()]=d[p].same(o)?0:1/0,h.push(d[p]);var v=function(e){return s[e.id()]};h=new e.Collection(a,h);for(var f=e.Minheap(a,h,v),g=function(e,t){for(var n,a=(i?e.edgesTo(t):e.edgesWith(t)).intersect(c),o=1/0,s=0;s<a.length;s++){var l=a[s],u=r.apply(l,[l]);(o>u||!n)&&(o=u,n=l)}return{edge:n,dist:o}};f.size()>0;){var y=f.pop(),m=y.value,x=y.id,b=a.getElementById(x);if(u[x]=m,m===Math.Infinite)break;for(var w=b.neighborhood().intersect(d),p=0;p<w.length;p++){var _=w[p],E=_.id(),S=g(b,_),D=m+S.dist;D<f.getValueById(E)&&(f.edit(E,D),l[E]={node:b,edge:S.edge})}}return{distanceTo:function(t){var r=e.is.string(t)?d.filter(t)[0]:t[0];return u[r.id()]},pathTo:function(t){var r=e.is.string(t)?d.filter(t)[0]:t[0],i=[],n=r;if(r.length>0)for(i.unshift(r);l[n.id()];){var o=l[n.id()];i.unshift(o.edge),i.unshift(o.node),n=o.node}return new e.Collection(a,i)}}}}),e.elesfn.bfs=e.elesfn.breadthFirstSearch,e.elesfn.dfs=e.elesfn.depthFirstSearch,e.elesfn.stdBfs=e.elesfn.stdBreadthFirstSearch,e.elesfn.stdDfs=e.elesfn.stdDepthFirstSearch}(cytoscape),function(e){"use strict";e.fn.eles({aStar:function(t){t=t||{};var r=function(e,t,i,a){if(e==t)return a.push(n.getElementById(t)),a;if(t in i){var o=i[t],s=p[t];return a.push(n.getElementById(t)),a.push(n.getElementById(s)),r(e,o,i,a)}return void 0},i=function(e,t){if(0===e.length)return void 0;for(var r=0,i=t[e[0]],n=1;n<e.length;n++){var a=t[e[n]];i>a&&(i=a,r=n)}return r},n=this._private.cy;if(null==t||null==t.root)return void 0;var a=e.is.string(t.root)?this.filter(t.root)[0]:t.root[0];if(null==t.goal)return void 0;var o=e.is.string(t.goal)?this.filter(t.goal)[0]:t.goal[0];if(null!=t.heuristic&&e.is.fn(t.heuristic))var s=t.heuristic;else var s=function(){return 0};if(null!=t.weight&&e.is.fn(t.weight))var l=t.weight;else var l=function(e){return 1};if(null!=t.directed)var u=t.directed;else var u=!1;var c=[],d=[a.id()],h={},p={},v={},f={};v[a.id()]=0,f[a.id()]=s(a);for(var g=this.edges().stdFilter(function(e){return!e.isLoop()}),y=this.nodes(),m=0;d.length>0;){var x=i(d,f),b=n.getElementById(d[x]);if(m++,b.id()==o.id()){var w=r(a.id(),o.id(),h,[]);return w.reverse(),{found:!0,distance:v[b.id()],path:new e.Collection(n,w),steps:m}}c.push(b.id()),d.splice(x,1);var _=b.connectedEdges();u&&(_=_.stdFilter(function(e){return e.data("source")===b.id()})),_=_.intersect(g);for(var E=0;E<_.length;E++){var S=_[E],D=S.connectedNodes().stdFilter(function(e){return e.id()!==b.id()}).intersect(y);if(-1==c.indexOf(D.id())){var k=v[b.id()]+l.apply(S,[S]);-1!=d.indexOf(D.id())?k<v[D.id()]&&(v[D.id()]=k,f[D.id()]=k+s(D),h[D.id()]=b.id()):(v[D.id()]=k,f[D.id()]=k+s(D),d.push(D.id()),h[D.id()]=b.id(),p[D.id()]=S.id())}}}return{found:!1,distance:void 0,path:void 0,steps:m}},floydWarshall:function(t){t=t||{};var r=this._private.cy;if(null!=t.weight&&e.is.fn(t.weight))var i=t.weight;else var i=function(e){return 1};if(null!=t.directed)var n=t.directed;else var n=!1;for(var a=this.edges().stdFilter(function(e){return!e.isLoop()}),o=this.nodes(),s=o.length,l={},u=0;s>u;u++)l[o[u].id()]=u;for(var c=[],u=0;s>u;u++){for(var d=new Array(s),h=0;s>h;h++)d[h]=u==h?0:1/0;c.push(d)}var p=[],v=[],f=function(e){for(var t=0;s>t;t++){for(var r=new Array(s),i=0;s>i;i++)r[i]=void 0;e.push(r)}};f(p),f(v);for(var u=0;u<a.length;u++){var g=l[a[u].source().id()],y=l[a[u].target().id()],m=i.apply(a[u],[a[u]]);c[g][y]>m&&(c[g][y]=m,p[g][y]=y,v[g][y]=a[u])}if(!n)for(var u=0;u<a.length;u++){var g=l[a[u].target().id()],y=l[a[u].source().id()],m=i.apply(a[u],[a[u]]);c[g][y]>m&&(c[g][y]=m,p[g][y]=y,v[g][y]=a[u])}for(var x=0;s>x;x++)for(var u=0;s>u;u++)for(var h=0;s>h;h++)c[u][x]+c[x][h]<c[u][h]&&(c[u][h]=c[u][x]+c[x][h],p[u][h]=p[u][x]);for(var b=[],u=0;s>u;u++)b.push(o[u].id());var w={distance:function(t,i){if(e.is.string(t))var n=r.filter(t)[0].id();else var n=t.id();if(e.is.string(i))var a=r.filter(i)[0].id();else var a=i.id();return c[l[n]][l[a]]},path:function(t,i){var n=function(e,t,i,n,a){if(e===t)return r.getElementById(n[e]);if(void 0===i[e][t])return void 0;for(var o=[r.getElementById(n[e])],s=e;e!==t;){s=e,e=i[e][t];var l=a[s][e];o.push(l),o.push(r.getElementById(n[e]))}return o};if(e.is.string(t))var a=r.filter(t)[0].id();else var a=t.id();if(e.is.string(i))var o=r.filter(i)[0].id();else var o=i.id();var s=n(l[a],l[o],p,b,v);return new e.Collection(r,s)}};return w},bellmanFord:function(t){if(t=t||{},null!=t.weight&&e.is.fn(t.weight))var r=t.weight;else var r=function(e){return 1};if(null!=t.directed)var i=t.directed;else var i=!1;if(null==t.root)return void e.util.error("options.root required");if(e.is.string(t.root))var n=this.filter(t.root)[0];else var n=t.root[0];for(var a=this._private.cy,o=this.edges().stdFilter(function(e){return!e.isLoop()}),s=this.nodes(),l=s.length,u={},c=0;l>c;c++)u[s[c].id()]=c;for(var d=[],h=[],p=[],c=0;l>c;c++)d[c]=s[c].id()===n.id()?0:1/0,h[c]=void 0;for(var v=!1,c=1;l>c;c++){v=!1;for(var f=0;f<o.length;f++){var g=u[o[f].source().id()],y=u[o[f].target().id()],m=r.apply(o[f],[o[f]]),x=d[g]+m;if(x<d[y]&&(d[y]=x,h[y]=g,p[y]=o[f],v=!0),!i){var x=d[y]+m;x<d[g]&&(d[g]=x,h[g]=y,p[g]=o[f],v=!0)}}if(!v)break}if(v)for(var f=0;f<o.length;f++){var g=u[o[f].source().id()],y=u[o[f].target().id()],m=r.apply(o[f],[o[f]]);if(d[g]+m<d[y])return e.util.error("Error: graph contains a negative weigth cycle!"),{pathTo:void 0,distanceTo:void 0,hasNegativeWeightCycle:!0}}for(var b=[],c=0;l>c;c++)b.push(s[c].id());var w={distanceTo:function(t){if(e.is.string(t))var r=a.filter(t)[0].id();else var r=t.id();return d[u[r]]},pathTo:function(t){var r=function(e,t,r,i,n,o){for(;;){if(n.push(a.getElementById(i[r])),n.push(o[r]),t===r)return n;var s=e[r];if("undefined"==typeof s)return void 0;r=s}};if(e.is.string(t))var i=a.filter(t)[0].id();else var i=t.id();var o=[],s=r(h,u[n.id()],u[i],b,o,p);return null!=s&&s.reverse(),new e.Collection(a,s)},hasNegativeWeightCycle:!1};return w},kargerStein:function(t){t=t||{};var r=function(e,t,r){for(var i=r[e],n=i[1],a=i[2],o=t[n],s=t[a],l=r.filter(function(e){return t[e[1]]===o&&t[e[2]]===s?!1:t[e[1]]===s&&t[e[2]]===o?!1:!0}),u=0;u<l.length;u++){var c=l[u];c[1]===s?(l[u]=c.slice(0),l[u][1]=o):c[2]===s&&(l[u]=c.slice(0),l[u][2]=o)}for(var u=0;u<t.length;u++)t[u]===s&&(t[u]=o);return l},i=function(e,t,n,a){if(a>=n)return t;var o=Math.floor(Math.random()*t.length),s=r(o,e,t);return i(e,s,n-1,a)},n=this._private.cy,a=this.edges().stdFilter(function(e){return!e.isLoop()}),o=this.nodes(),s=o.length,l=a.length,u=Math.ceil(Math.pow(Math.log(s)/Math.LN2,2)),c=Math.floor(s/Math.sqrt(2));if(2>s)return void e.util.error("At least 2 nodes are required for KargerSteing algorithm!");for(var d={},h=0;s>h;h++)d[o[h].id()]=h;for(var p=[],h=0;l>h;h++){var v=a[h];p.push([h,d[v.source().id()],d[v.target().id()]])}for(var f,g=1/0,y=[],h=0;s>h;h++)y.push(h);for(var m=0;u>=m;m++){var x=y.slice(0),b=i(x,p,s,c),w=x.slice(0),_=i(x,b,c,2),E=i(w,b,c,2);_.length<=E.length&&_.length<g?(g=_.length,f=[_,x]):E.length<=_.length&&E.length<g&&(g=E.length,f=[E,w])}for(var S=f[0].map(function(e){return a[e[0]]}),D=[],k=[],T=f[1][0],h=0;h<f[1].length;h++){var P=f[1][h];P===T?D.push(o[h]):k.push(o[h])}var C={cut:new e.Collection(n,S),partition1:new e.Collection(n,D),partition2:new e.Collection(n,k)};return C},pageRank:function(t){t=t||{};var r=function(e){for(var t=e.length,r=0,i=0;t>i;i++)r+=e[i];for(var i=0;t>i;i++)e[i]=e[i]/r};if(null!=t&&null!=t.dampingfactor)var i=t.dampingFactor;else var i=.8;if(null!=t&&null!=t.precision)var n=t.precision;else var n=1e-6;if(null!=t&&null!=t.iterations)var a=t.iterations;else var a=200;if(null!=t&&null!=t.weight&&e.is.fn(t.weight))var o=t.weight;else var o=function(e){return 1};for(var s=this._private.cy,l=this.edges().stdFilter(function(e){return!e.isLoop()}),u=this.nodes(),c=u.length,d=l.length,h={},p=0;c>p;p++)h[u[p].id()]=p;for(var v=[],f=[],g=(1-i)/c,p=0;c>p;p++){for(var y=[],m=0;c>m;m++)y.push(0);v.push(y),f.push(0)}for(var p=0;d>p;p++){var x=l[p],b=h[x.source().id()],w=h[x.target().id()],_=o.apply(x,[x]);v[w][b]+=_,f[b]+=_}for(var E=1/c+g,m=0;c>m;m++)if(0===f[m])for(var p=0;c>p;p++)v[p][m]=E;else for(var p=0;c>p;p++)v[p][m]=v[p][m]/f[m]+g;for(var S,D=[],k=[],p=0;c>p;p++)D.push(1),k.push(0);for(var T=0;a>T;T++){for(var P=k.slice(0),p=0;c>p;p++)for(var m=0;c>m;m++)P[p]+=v[p][m]*D[m];r(P),S=D,D=P;for(var C=0,p=0;c>p;p++)C+=Math.pow(S[p]-D[p],2);if(n>C)break}var M={rank:function(t){if(e.is.string(t))var r=s.filter(t)[0].id();else var r=t.id();return D[h[r]]}};return M},degreeCentralityNormalized:function(t){if(t=t||{},null!=t.directed)var r=t.directed;else var r=!1;var i=this.nodes(),n=i.length;if(r){for(var a={},o={},s=0,l=0,u=0;n>u;u++){var c=i[u],d=this.degreeCentrality(e.util.extend({},t,{root:c}));s<d.indegree&&(s=d.indegree),l<d.outdegree&&(l=d.outdegree),a[c.id()]=d.indegree,o[c.id()]=d.outdegree}return{indegree:function(t){if(e.is.string(t))var t=cy.filter(t)[0].id();else var t=t.id();return a[t]/s},outdegree:function(t){if(e.is.string(t))var t=cy.filter(t)[0].id();else var t=t.id();return o[t]/l}}}for(var h={},p=0,u=0;n>u;u++){var c=i[u],d=this.degreeCentrality(e.util.extend({},t,{root:c}));p<d.degree&&(p=d.degree),h[c.id()]=d.degree}return{degree:function(t){if(e.is.string(t))var t=cy.filter(t)[0].id();else var t=t.id();return h[t]/p}}},degreeCentrality:function(t){t=t||{};var r=this;if(null==t||null==t.root)return void 0;var i=e.is.string(t.root)?this.filter(t.root)[0]:t.root[0];if(null!=t.weight&&e.is.fn(t.weight))var n=t.weight;else var n=function(e){return 1};if(null!=t.directed)var a=t.directed;else var a=!1;if(null!=t.alpha&&e.is.number(t.alpha))var o=t.alpha;else o=0;if(a){for(var s=i.connectedEdges('edge[target = "'+i.id()+'"]').intersection(r),l=i.connectedEdges('edge[source = "'+i.id()+'"]').intersection(r),u=s.length,c=l.length,d=0,h=0,p=0;p<s.length;p++){var v=s[p];d+=n.apply(v,[v])}for(var p=0;p<l.length;p++){var v=l[p];h+=n.apply(v,[v])}return{indegree:Math.pow(u,1-o)*Math.pow(d,o),outdegree:Math.pow(c,1-o)*Math.pow(h,o)}}for(var f=i.connectedEdges().intersection(r),g=f.length,y=0,p=0;p<f.length;p++){var v=f[p];y+=n.apply(v,[v])}return{degree:Math.pow(g,1-o)*Math.pow(y,o)}},closenessCentralityNormalized:function(t){t=t||{};var r=t.harmonic;void 0===r&&(r=!0);for(var i={},n=0,a=this.nodes(),o=this.floydWarshall({weight:t.weight,directed:t.directed}),s=0;s<a.length;s++){for(var l=0,u=0;u<a.length;u++)if(s!=u){var c=o.distance(a[s],a[u]);l+=r?1/c:c}r||(l=1/l),l>n&&(n=l),i[a[s].id()]=l}return{closeness:function(t){if(e.is.string(t))var t=cy.filter(t)[0].id();else var t=t.id();return i[t]/n}}},closenessCentrality:function(t){if(t=t||{},null==t.root)return void e.util.error("options.root required");if(e.is.string(t.root))var r=this.filter(t.root)[0];else var r=t.root[0];if(null!=t.weight&&e.is.fn(t.weight))var i=t.weight;else var i=function(){return 1};if(null!=t.directed&&e.is.bool(t.directed))var n=t.directed;else var n=!1;var a=t.harmonic;void 0===a&&(a=!0);for(var o=this.dijkstra({root:r,weight:i,directed:n}),s=0,l=this.nodes(),u=0;u<l.length;u++)if(l[u].id()!=r.id()){var c=o.distanceTo(l[u]);s+=a?1/c:c}return a?s:1/s},betweennessCentrality:function(t){if(t=t||{},null!=t.weight&&e.is.fn(t.weight))var r=t.weight,i=!0;else var i=!1;if(null!=t.directed&&e.is.bool(t.directed))var n=t.directed;else var n=!1;for(var a=function(e,t){e.unshift(t);for(var r=0;f[e[r]]<f[e[r+1]]&&r<e.length-1;r++){var i=e[r];e[r]=e[r+1],e[r+1]=i}},o=this._private.cy,s=this.nodes(),l={},u={},c=0;c<s.length;c++)l[s[c].id()]=n?s[c].outgoers("node"):s[c].openNeighborhood("node");for(var c=0;c<s.length;c++)u[s[c].id()]=0;for(var d=0;d<s.length;d++){for(var h=[],p={},v={},f={},g=[],c=0;c<s.length;c++)p[s[c].id()]=[],v[s[c].id()]=0,f[s[c].id()]=Number.POSITIVE_INFINITY;for(v[s[d].id()]=1,f[s[d].id()]=0,g.unshift(s[d].id());g.length>0;){var y=g.pop();h.push(y),l[y].forEach(i?function(e){if(o.$("#"+y).edgesTo(e).length>0)var t=o.$("#"+y).edgesTo(e)[0];else var t=e.edgesTo("#"+y)[0];var i=r.apply(t,[t]);f[e.id()]>f[y]+i&&(f[e.id()]=f[y]+i,g.indexOf(e.id())<0?a(g,e.id()):(g.splice(g.indexOf(e.id()),1),a(g,e.id())),v[e.id()]=0,p[e.id()]=[]),f[e.id()]==f[y]+i&&(v[e.id()]=v[e.id()]+v[y],p[e.id()].push(y))}:function(e){f[e.id()]==Number.POSITIVE_INFINITY&&(g.unshift(e.id()),f[e.id()]=f[y]+1),f[e.id()]==f[y]+1&&(v[e.id()]=v[e.id()]+v[y],p[e.id()].push(y))})}for(var m={},c=0;c<s.length;c++)m[s[c].id()]=0;for(;h.length>0;){var x=h.pop();p[x].forEach(function(e){m[e]=m[e]+v[e]/v[x]*(1+m[x]),x!=s[d].id()&&(u[x]=u[x]+m[x])})}}var b=0;for(var w in u)b<u[w]&&(b=u[w]);var _={betweenness:function(t){if(e.is.string(t))var t=o.filter(t)[0].id();else var t=t.id();return u[t]},betweennessNormalized:function(t){if(e.is.string(t))var t=o.filter(t)[0].id();else var t=t.id();return u[t]/b}};return _.betweennessNormalised=_.betweennessNormalized,_}}),e.elesfn.dc=e.elesfn.degreeCentrality,e.elesfn.dcn=e.elesfn.degreeCentralityNormalised=e.elesfn.degreeCentralityNormalized,e.elesfn.cc=e.elesfn.closenessCentrality,e.elesfn.ccn=e.elesfn.closenessCentralityNormalised=e.elesfn.closenessCentralityNormalized,e.elesfn.bc=e.elesfn.betweennessCentrality}(cytoscape),function(e){"use strict";e.fn.eles({animated:e.define.animated(),clearQueue:e.define.clearQueue(),delay:e.define.delay(),animate:e.define.animate(),stop:e.define.stop()})}(cytoscape),function(e){"use strict";e.fn.eles({addClass:function(t){t=t.split(/\s+/);for(var r=this,i=[],n=0;n<t.length;n++){var a=t[n];if(!e.is.emptyString(a))for(var o=0;o<r.length;o++){var s=r[o],l=s._private.classes[a];s._private.classes[a]=!0,l||i.push(s)}}return i.length>0&&new e.Collection(this._private.cy,i).updateStyle().trigger("class"),r},hasClass:function(e){var t=this[0];return null!=t&&t._private.classes[e]?!0:!1},toggleClass:function(t,r){for(var i=t.split(/\s+/),n=this,a=[],o=0,s=n.length;s>o;o++)for(var l=n[o],u=0;u<i.length;u++){var c=i[u];if(!e.is.emptyString(c)){var d=l._private.classes[c],h=r||void 0===r&&!d;h?(l._private.classes[c]=!0,d||a.push(l)):(l._private.classes[c]=!1,d&&a.push(l))}}return a.length>0&&new e.Collection(this._private.cy,a).updateStyle().trigger("class"),n},removeClass:function(t){t=t.split(/\s+/);for(var r=this,i=[],n=0;n<r.length;n++)for(var a=r[n],o=0;o<t.length;o++){var s=t[o];if(s&&""!==s){var l=a._private.classes[s];a._private.classes[s]=void 0,l&&i.push(a)}}return i.length>0&&new e.Collection(r._private.cy,i).updateStyle(),r.trigger("class"),r},flashClass:function(e,t){var r=this;if(null==t)t=250;else if(0===t)return r;return r.addClass(e),setTimeout(function(){r.removeClass(e)},t),r}})}(cytoscape),function(e){"use strict";e.fn.eles({allAre:function(e){return this.filter(e).length===this.length},is:function(e){return this.filter(e).length>0},some:function(e,t){for(var r=0;r<this.length;r++){var i=t?e.apply(t,[this[r],r,this]):e(this[r],r,this);if(i)return!0}return!1},every:function(e,t){for(var r=0;r<this.length;r++){var i=t?e.apply(t,[this[r],r,this]):e(this[r],r,this);if(!i)return!1}return!0},same:function(e){return e=this.cy().collection(e),this.length!==e.length?!1:this.intersect(e).length===this.length},anySame:function(e){return e=this.cy().collection(e),this.intersect(e).length>0},allAreNeighbors:function(e){return e=this.cy().collection(e),this.neighborhood().intersect(e).length===e.length}}),e.elesfn.allAreNeighbours=e.elesfn.allAreNeighbors}(cytoscape),function(e){"use strict";e.fn.eles({parent:function(t){for(var r=[],i=this._private.cy,n=0;n<this.length;n++){var a=this[n],o=i.getElementById(a._private.data.parent);o.size()>0&&r.push(o)}return new e.Collection(i,r,{unique:!0}).filter(t)},parents:function(t){for(var r=[],i=this.parent();i.nonempty();){for(var n=0;n<i.length;n++){var a=i[n];r.push(a)}i=i.parent()}return new e.Collection(this.cy(),r,{unique:!0}).filter(t)},commonAncestors:function(e){for(var t,r=0;r<this.length;r++){var i=this[r],n=i.parents();t=t||n,t=t.intersect(n)}return t.filter(e)},orphans:function(e){return this.stdFilter(function(e){return e.isNode()&&e.parent().empty()}).filter(e)},nonorphans:function(e){return this.stdFilter(function(e){return e.isNode()&&e.parent().nonempty()}).filter(e)},children:function(t){for(var r=[],i=0;i<this.length;i++){var n=this[i];r=r.concat(n._private.children)}return new e.Collection(this.cy(),r,{unique:!0}).filter(t)},siblings:function(e){return this.parent().children().not(this).filter(e)},isParent:function(){var e=this[0];return e?0!==e._private.children.length:void 0},isChild:function(){var e=this[0];return e?void 0!==e._private.data.parent&&0!==e.parent().length:void 0},descendants:function(t){function r(e){for(var t=0;t<e.length;t++){var n=e[t];i.push(n),n.children().nonempty()&&r(n.children())}}var i=[];return r(this.children()),new e.Collection(this.cy(),i,{unique:!0}).filter(t)}}),e.elesfn.ancestors=e.elesfn.parents;

}(cytoscape),function(e){"use strict";var t=1,r=0;e.fn.eles({data:e.define.data({field:"data",bindingEvent:"data",allowBinding:!0,allowSetting:!0,settingEvent:"data",settingTriggersEvent:!0,triggerFnName:"trigger",allowGetting:!0,immutableKeys:{id:!0,source:!0,target:!0,parent:!0},updateStyle:!0}),removeData:e.define.removeData({field:"data",event:"data",triggerFnName:"trigger",triggerEvent:!0,immutableKeys:{id:!0,source:!0,target:!0,parent:!0},updateStyle:!0}),scratch:e.define.data({field:"scratch",bindingEvent:"scratch",allowBinding:!0,allowSetting:!0,settingEvent:"scratch",settingTriggersEvent:!0,triggerFnName:"trigger",allowGetting:!0,updateStyle:!0}),removeScratch:e.define.removeData({field:"scratch",event:"scratch",triggerFnName:"trigger",triggerEvent:!0,updateStyle:!0}),rscratch:e.define.data({field:"rscratch",allowBinding:!1,allowSetting:!0,settingTriggersEvent:!1,allowGetting:!0}),removeRscratch:e.define.removeData({field:"rscratch",triggerEvent:!1}),id:function(){var e=this[0];return e?e._private.data.id:void 0},position:e.define.data({field:"position",bindingEvent:"position",allowBinding:!0,allowSetting:!0,settingEvent:"position",settingTriggersEvent:!0,triggerFnName:"rtrigger",allowGetting:!0,validKeys:["x","y"],onSet:function(e){var t=e.updateCompoundBounds();t.rtrigger("position")},canSet:function(e){return!e.locked()}}),silentPosition:e.define.data({field:"position",bindingEvent:"position",allowBinding:!1,allowSetting:!0,settingEvent:"position",settingTriggersEvent:!1,triggerFnName:"trigger",allowGetting:!0,validKeys:["x","y"],onSet:function(e){e.updateCompoundBounds()},canSet:function(e){return!e.locked()}}),positions:function(t,r){if(e.is.plainObject(t))this.position(t);else if(e.is.fn(t)){for(var i=t,n=0;n<this.length;n++){var a=this[n],t=i.apply(a,[n,a]);if(t&&!a.locked()){var o=a._private.position;o.x=t.x,o.y=t.y}}var s=this.updateCompoundBounds(),l=s.length>0?this.add(s):this;r?l.trigger("position"):l.rtrigger("position")}return this},silentPositions:function(e){return this.positions(e,!0)},updateCompoundBounds:function(){function t(e){var t=e.children(),r=e._private.style,n="include"===r["compound-sizing-wrt-labels"].value,a=t.boundingBox({includeLabels:n,includeEdges:!0}),o={top:r["padding-top"].pxValue,bottom:r["padding-bottom"].pxValue,left:r["padding-left"].pxValue,right:r["padding-right"].pxValue},s=e._private.position,l=!1;"auto"===r.width.value&&(e._private.autoWidth=a.w+o.left+o.right,s.x=(a.x1+a.x2-o.left+o.right)/2,l=!0),"auto"===r.height.value&&(e._private.autoHeight=a.h+o.top+o.bottom,s.y=(a.y1+a.y2-o.top+o.bottom)/2,l=!0),l&&i.push(e)}var r=this.cy();if(!r.styleEnabled()||!r.hasCompoundNodes())return r.collection();for(var i=[],n=this.parent();n.nonempty();){for(var a=0;a<n.length;a++){var o=n[a];t(o)}n=n.parent()}return new e.Collection(r,i)},renderedPosition:function(t,r){var i=this[0],n=this.cy(),a=n.zoom(),o=n.pan(),s=e.is.plainObject(t)?t:void 0,l=void 0!==s||void 0!==r&&e.is.string(t);if(i&&i.isNode()){if(!l){var u=i._private.position;return s={x:u.x*a+o.x,y:u.y*a+o.y},void 0===t?s:s[t]}for(var c=0;c<this.length;c++){var i=this[c];void 0!==r?i._private.position[t]=(r-o[t])/a:void 0!==s&&(i._private.position={x:(s.x-o.x)/a,y:(s.y-o.y)/a})}this.rtrigger("position")}else if(!l)return void 0;return this},relativePosition:function(t,r){var i=this[0],n=this.cy(),a=e.is.plainObject(t)?t:void 0,o=void 0!==a||void 0!==r&&e.is.string(t),s=n.hasCompoundNodes();if(i&&i.isNode()){if(!o){var l=i._private.position,u=s?i.parent():null,c=u&&u.length>0,d=c;c&&(u=u[0]);var h=d?u._private.position:{x:0,y:0};return a={x:l.x-h.x,y:l.y-h.y},void 0===t?a:a[t]}for(var p=0;p<this.length;p++){var i=this[p],u=s?i.parent():null,c=u&&u.length>0,d=c;c&&(u=u[0]);var h=d?u._private.position:{x:0,y:0};void 0!==r?i._private.position[t]=r+h[t]:void 0!==a&&(i._private.position={x:a.x+h.x,y:a.y+h.y})}this.rtrigger("position")}else if(!o)return void 0;return this},width:function(){var e=this[0],t=e._private.cy,r=t._private.styleEnabled;if(e){if(r){var i=e._private.style.width;return"auto"===i.strValue?e._private.autoWidth:i.pxValue}return 1}},outerWidth:function(){var e=this[0],i=e._private.cy,n=i._private.styleEnabled;if(e){if(n){var a=e._private.style,o="auto"===a.width.strValue?e._private.autoWidth:a.width.pxValue,s=a["border-width"]?a["border-width"].pxValue*t+r:0;return o+s}return 1}},renderedWidth:function(){var e=this[0];if(e){var t=e.width();return t*this.cy().zoom()}},renderedOuterWidth:function(){var e=this[0];if(e){var t=e.outerWidth();return t*this.cy().zoom()}},height:function(){var e=this[0],t=e._private.cy,r=t._private.styleEnabled;if(e&&"nodes"===e._private.group){if(r){var i=e._private.style.height;return"auto"===i.strValue?e._private.autoHeight:i.pxValue}return 1}},outerHeight:function(){var e=this[0],i=e._private.cy,n=i._private.styleEnabled;if(e&&"nodes"===e._private.group){if(!n)return 1;var a=e._private.style,o="auto"===a.height.strValue?e._private.autoHeight:a.height.pxValue,s=a["border-width"]?a["border-width"].pxValue*t+r:0;return o+s}},renderedHeight:function(){var e=this[0];if(e&&"nodes"===e._private.group){var t=e.height();return t*this.cy().zoom()}},renderedOuterHeight:function(){var e=this[0];if(e&&"nodes"===e._private.group){var t=e.outerHeight();return t*this.cy().zoom()}},renderedBoundingBox:function(e){var t=this.boundingBox(e),r=this.cy(),i=r.zoom(),n=r.pan(),a=t.x1*i+n.x,o=t.x2*i+n.x,s=t.y1*i+n.y,l=t.y2*i+n.y;return{x1:a,x2:o,y1:s,y2:l,w:o-a,h:l-s}},boundingBox:function(e){var t=this,r=t._private.cy,i=r._private,n=i.styleEnabled;e=e||{};var a=void 0===e.includeNodes?!0:e.includeNodes,o=void 0===e.includeEdges?!0:e.includeEdges,s=void 0===e.includeLabels?!0:e.includeLabels;n&&i.renderer.recalculateRenderedStyle(this);for(var l=1/0,u=-(1/0),c=1/0,d=-(1/0),h=0;h<t.length;h++){var p,v,f,g,y,m,x=t[h],b=x._private,w=b.style,_=n?b.style.display.value:"element",E="nodes"===b.group,S=!1;if("none"!==_){if(E&&a){S=!0;var D=b.position;y=D.x,m=D.y;var k=x.outerWidth(),T=k/2,P=x.outerHeight(),C=P/2;p=y-T,v=y+T,f=m-C,g=m+C,l=l>p?p:l,u=v>u?v:u,c=c>f?f:c,d=g>d?g:d}else if(x.isEdge()&&o){S=!0;var M=b.source,B=M._private,N=B.position,I=b.target,O=I._private,z=O.position,L=b.rstyle||{},k=0,R=0;if(n&&(k=w.width.pxValue,R=k/2),p=N.x,v=z.x,f=N.y,g=z.y,p>v){var V=p;p=v,v=V}if(f>g){var V=f;f=g,g=V}if(p-=R,v+=R,f-=R,g+=R,l=l>p?p:l,u=v>u?v:u,c=c>f?f:c,d=g>d?g:d,n)for(var A=L.bezierPts||[],X=0;X<A.length;X++){var F=A[X];p=F.x-R,v=F.x+R,f=F.y-R,g=F.y+R,l=l>p?p:l,u=v>u?v:u,c=c>f?f:c,d=g>d?g:d}if(n&&"haystack"===w["curve-style"].strValue){var Y=b.rscratch.haystackPts;if(p=Y[0],f=Y[1],v=Y[2],g=Y[3],p>v){var V=p;p=v,v=V}if(f>g){var V=f;f=g,g=V}l=l>p?p:l,u=v>u?v:u,c=c>f?f:c,d=g>d?g:d}}if(n){var w=x._private.style,L=x._private.rstyle,q=w.content.strValue,j=w["font-size"],$=w["text-halign"],W=w["text-valign"],H=L.labelWidth,Z=L.labelHeight,U=L.labelX,G=L.labelY;if(S&&s&&q&&j&&null!=Z&&null!=H&&null!=U&&null!=G&&$&&W){var K,J,Q,ee,te=Z,re=H;if(x.isEdge())K=U-re/2,J=U+re/2,Q=G-te/2,ee=G+te/2;else{switch($.value){case"left":K=U-re,J=U;break;case"center":K=U-re/2,J=U+re/2;break;case"right":K=U,J=U+re}switch(W.value){case"top":Q=G-te,ee=G;break;case"center":Q=G-te/2,ee=G+te/2;break;case"bottom":Q=G,ee=G+te}}l=l>K?K:l,u=J>u?J:u,c=c>Q?Q:c,d=ee>d?ee:d}}}}var ie=function(e){return e===1/0||e===-(1/0)?0:e};return l=ie(l),u=ie(u),c=ie(c),d=ie(d),{x1:l,x2:u,y1:c,y2:d,w:u-l,h:d-c}}});var i=e.elesfn;i.attr=i.data,i.removeAttr=i.removeData,i.modelPosition=i.point=i.position,i.modelPositions=i.points=i.positions,i.renderedPoint=i.renderedPosition,i.relativePoint=i.relativePosition,i.boundingbox=i.boundingBox,i.renderedBoundingbox=i.renderedBoundingBox}(cytoscape),function(e){"use strict";function t(e){return function(t){var r=this;if(void 0===t&&(t=!0),0!==r.length&&r.isNode()&&!r.removed()){for(var i=0,n=r[0],a=n._private.edges,o=0;o<a.length;o++){var s=a[o];(t||!s.isLoop())&&(i+=e(n,s))}return i}}}function r(e,t){return function(r){for(var i,n=this.nodes(),a=0;a<n.length;a++){var o=n[a],s=o[e](r);void 0===s||void 0!==i&&!t(s,i)||(i=s)}return i}}e.fn.eles({degree:t(function(e,t){return t.source().same(t.target())?2:1}),indegree:t(function(e,t){return t.target().same(e)?1:0}),outdegree:t(function(e,t){return t.source().same(e)?1:0})}),e.fn.eles({minDegree:r("degree",function(e,t){return t>e}),maxDegree:r("degree",function(e,t){return e>t}),minIndegree:r("indegree",function(e,t){return t>e}),maxIndegree:r("indegree",function(e,t){return e>t}),minOutdegree:r("outdegree",function(e,t){return t>e}),maxOutdegree:r("outdegree",function(e,t){return e>t})}),e.fn.eles({totalDegree:function(e){for(var t=0,r=this.nodes(),i=0;i<r.length;i++)t+=r[i].degree(e);return t}})}(cytoscape),function(e){"use strict";e.fn.eles({on:e.define.on(),one:e.define.on({unbindSelfOnTrigger:!0}),once:e.define.on({unbindAllBindersOnTrigger:!0}),off:e.define.off(),trigger:e.define.trigger(),rtrigger:function(e,t){return 0!==this.length?(this.cy().notify({type:e,collection:this}),this.trigger(e,t),this):void 0}}),e.define.eventAliasesOn(e.elesfn)}(cytoscape),function(e){"use strict";e.fn.eles({nodes:function(e){return this.filter(function(e,t){return t.isNode()}).filter(e)},edges:function(e){return this.filter(function(e,t){return t.isEdge()}).filter(e)},filter:function(t){var r=this._private.cy;if(e.is.fn(t)){for(var i=[],n=0;n<this.length;n++){var a=this[n];t.apply(a,[n,a])&&i.push(a)}return new e.Collection(r,i)}return e.is.string(t)||e.is.elementOrCollection(t)?new e.Selector(t).filter(this):void 0===t?this:new e.Collection(r)},not:function(t){var r=this._private.cy;if(t){e.is.string(t)&&(t=this.filter(t));for(var i=[],n=0;n<this.length;n++){var a=this[n],o=t._private.ids[a.id()];o||i.push(a)}return new e.Collection(r,i)}return this},absoluteComplement:function(){var e=this._private.cy;return e.elements().not(this)},intersect:function(t){var r=this._private.cy;if(e.is.string(t)){var i=t;return this.filter(i)}for(var n=[],a=this,o=t,s=this.length<t.length,l=s?o._private.ids:a._private.ids,u=s?a:o,c=0;c<u.length;c++){var d=u[c]._private.data.id,h=l[d];h&&n.push(h)}return new e.Collection(r,n)},xor:function(t){var r=this._private.cy;e.is.string(t)&&(t=r.$(t));var i=[],n=this,a=t,o=function(e,t){for(var r=0;r<e.length;r++){var n=e[r],a=n._private.data.id,o=t._private.ids[a];o||i.push(n)}};return o(n,a),o(a,n),new e.Collection(r,i)},diff:function(t){var r=this._private.cy;e.is.string(t)&&(t=r.$(t));var i=[],n=[],a=[],o=this,s=t,l=function(e,t,r){for(var i=0;i<e.length;i++){var n=e[i],o=n._private.data.id,s=t._private.ids[o];s?a.push(n):r.push(n)}};return l(o,s,i),l(s,o,n),{left:new e.Collection(r,i,{unique:!0}),right:new e.Collection(r,n,{unique:!0}),both:new e.Collection(r,a,{unique:!0})}},add:function(t){var r=this._private.cy;if(!t)return this;if(e.is.string(t)){var i=t;t=r.elements(i)}for(var n=[],a=0;a<this.length;a++)n.push(this[a]);for(var a=0;a<t.length;a++){var o=!this._private.ids[t[a].id()];o&&n.push(t[a])}return new e.Collection(r,n)},merge:function(t){var r=this._private,i=r.cy;if(!t)return this;if(e.is.string(t)){var n=t;t=i.elements(n)}for(var a=0;a<t.length;a++){var o=t[a],s=o.id(),l=!r.ids[s];if(l){var u=this.length++;this[u]=o,r.ids[s]=o,r.indexes[s]=u}}return this},unmergeOne:function(e){e=e[0];var t=this._private,r=e.id(),i=t.indexes[r];if(null==i)return this;this[i]=void 0,t.ids[r]=void 0,t.indexes[r]=void 0;var n=i===this.length-1;if(this.length>1&&!n){var a=this.length-1,o=this[a];this[a]=void 0,this[i]=o,t.indexes[o.id()]=i}return this.length--,this},unmerge:function(t){var r=this._private.cy;if(!t)return this;if(e.is.string(t)){var i=t;t=r.elements(i)}for(var n=0;n<t.length;n++)this.unmergeOne(t[n]);return this},map:function(e,t){for(var r=[],i=this,n=0;n<i.length;n++){var a=i[n],o=t?e.apply(t,[a,n,i]):e(a,n,i);r.push(o)}return r},stdFilter:function(t,r){for(var i=[],n=this,a=this._private.cy,o=0;o<n.length;o++){var s=n[o],l=r?t.apply(r,[s,o,n]):t(s,o,n);l&&i.push(s)}return new e.Collection(a,i)},max:function(e,t){for(var r,i=-(1/0),n=this,a=0;a<n.length;a++){var o=n[a],s=t?e.apply(t,[o,a,n]):e(o,a,n);s>i&&(i=s,r=o)}return{value:i,ele:r}},min:function(e,t){for(var r,i=1/0,n=this,a=0;a<n.length;a++){var o=n[a],s=t?e.apply(t,[o,a,n]):e(o,a,n);i>s&&(i=s,r=o)}return{value:i,ele:r}}});var t=e.elesfn;t.u=t["|"]=t["+"]=t.union=t.or=t.add,t["\\"]=t["!"]=t["-"]=t.difference=t.relativeComplement=t.not,t.n=t["&"]=t["."]=t.and=t.intersection=t.intersect,t["^"]=t["(+)"]=t["(-)"]=t.symmetricDifference=t.symdiff=t.xor,t.fnFilter=t.filterFn=t.stdFilter,t.complement=t.abscomp=t.absoluteComplement}(cytoscape),function(e){"use strict";e.fn.eles({isNode:function(){return"nodes"===this.group()},isEdge:function(){return"edges"===this.group()},isLoop:function(){return this.isEdge()&&this.source().id()===this.target().id()},isSimple:function(){return this.isEdge()&&this.source().id()!==this.target().id()},group:function(){var e=this[0];return e?e._private.group:void 0}})}(cytoscape),function(e){"use strict";e.fn.eles({each:function(t){if(e.is.fn(t))for(var r=0;r<this.length;r++){var i=this[r],n=t.apply(i,[r,i]);if(n===!1)break}return this},forEach:function(t,r){if(e.is.fn(t))for(var i=0;i<this.length;i++){var n=this[i],a=r?t.apply(r,[n,i,this]):t(n,i,this);if(a===!1)break}return this},toArray:function(){for(var e=[],t=0;t<this.length;t++)e.push(this[t]);return e},slice:function(t,r){var i=[],n=this.length;null==r&&(r=n),null==t&&(t=0),0>t&&(t=n+t),0>r&&(r=n+r);for(var a=t;a>=0&&r>a&&n>a;a++)i.push(this[a]);return new e.Collection(this.cy(),i)},size:function(){return this.length},eq:function(t){return this[t]||new e.Collection(this.cy())},first:function(){return this[0]||new e.Collection(this.cy())},last:function(){return this[this.length-1]||new e.Collection(this.cy())},empty:function(){return 0===this.length},nonempty:function(){return!this.empty()},sort:function(t){if(!e.is.fn(t))return this;var r=this.cy(),i=this.toArray().sort(t);return new e.Collection(r,i)},sortByZIndex:function(){return this.sort(e.Collection.zIndexSort)},zDepth:function(){var e=this[0];if(!e)return void 0;var t=e._private,r=t.group;if("nodes"===r){var i=t.data.parent?e.parents().size():0;return e.isParent()?i:Number.MAX_VALUE}var n=t.source,a=t.target,o=n.zDepth(),s=a.zDepth();return Math.max(o,s,0)}}),e.Collection.zIndexSort=function(e,t){var r=e.cy(),i=e._private,n=t._private,a=i.style["z-index"].value-n.style["z-index"].value,o=0,s=0,l=r.hasCompoundNodes(),u="nodes"===i.group,c="edges"===i.group,d="nodes"===n.group,h="edges"===n.group;l&&(o=e.zDepth(),s=t.zDepth());var p=o-s,v=0===p;return v?u&&h?1:c&&d?-1:0===a?i.index-n.index:a:p}}(cytoscape),function(e){"use strict";e.fn.eles({layoutPositions:function(t,r,i){var n=this.nodes(),a=this.cy();if(t.trigger({type:"layoutstart",layout:t}),r.animate){for(var o=0;o<n.length;o++){var s=n[o],l=o===n.length-1,u=i.call(s,o,s),c=s.position();e.is.number(c.x)&&e.is.number(c.y)||s.silentPosition({x:0,y:0}),s.animate({position:u},{duration:r.animationDuration,step:l?function(){r.fit&&a.fit(r.eles,r.padding)}:void 0,complete:l?function(){null!=r.zoom&&a.zoom(r.zoom),r.pan&&a.pan(r.pan),r.fit&&a.fit(r.eles,r.padding),t.one("layoutstop",r.stop),t.trigger({type:"layoutstop",layout:t})}:void 0})}t.one("layoutready",r.ready),t.trigger({type:"layoutready",layout:t})}else n.positions(i),r.fit&&a.fit(r.eles,r.padding),null!=r.zoom&&a.zoom(r.zoom),r.pan&&a.pan(r.pan),t.one("layoutready",r.ready),t.trigger({type:"layoutready",layout:t}),t.one("layoutstop",r.stop),t.trigger({type:"layoutstop",layout:t});return this},layout:function(t){var r=this.cy();return r.layout(e.util.extend({},t,{eles:this})),this},makeLayout:function(t){var r=this.cy();return r.makeLayout(e.util.extend({},t,{eles:this}))}}),e.elesfn.createLayout=e.elesfn.makeLayout}(cytoscape),function(e){"use strict";e.fn.eles({updateStyle:function(e){var t=this._private.cy;if(!t.styleEnabled())return this;if(t._private.batchingStyle){for(var r=t._private.batchStyleEles,i=0;i<this.length;i++){var n=this[i];r.ids[n._private.id]||r.push(n)}return this}var a=t.style();e=e||void 0===e?!0:!1,a.apply(this);var o=this.updateCompoundBounds(),s=o.length>0?this.add(o):this;return e?s.rtrigger("style"):s.trigger("style"),this},updateMappers:function(e){var t=this._private.cy,r=t.style();if(e=e||void 0===e?!0:!1,!t.styleEnabled())return this;r.updateMappers(this);var i=this.updateCompoundBounds(),n=i.length>0?this.add(i):this;return e?n.rtrigger("style"):n.trigger("style"),this},renderedCss:function(e){var t=this.cy();if(!t.styleEnabled())return this;var r=this[0];if(r){var i=r.cy().style().getRenderedStyle(r);return void 0===e?i:i[e]}},css:function(t,r){var i=this.cy();if(!i.styleEnabled())return this;var n=!1,a=i.style();if(e.is.plainObject(t)){var o=t;a.applyBypass(this,o,n);var s=this.updateCompoundBounds(),l=s.length>0?this.add(s):this;l.rtrigger("style")}else if(e.is.string(t)){if(void 0===r){var u=this[0];return u?u._private.style[t].strValue:void 0}a.applyBypass(this,t,r,n);var s=this.updateCompoundBounds(),l=s.length>0?this.add(s):this;l.rtrigger("style")}else if(void 0===t){var u=this[0];return u?a.getRawStyle(u):void 0}return this},removeCss:function(e){var t=this.cy();if(!t.styleEnabled())return this;var r=!1,i=t.style(),n=this;if(void 0===e)for(var a=0;a<n.length;a++){var o=n[a];i.removeAllBypasses(o,r)}else{e=e.split(/\s+/);for(var a=0;a<n.length;a++){var o=n[a];i.removeBypasses(o,e,r)}}var s=this.updateCompoundBounds(),l=s.length>0?this.add(s):this;return l.rtrigger("style"),this},show:function(){return this.css("display","element"),this},hide:function(){return this.css("display","none"),this},visible:function(){var e=this.cy();if(!e.styleEnabled())return!0;var t=this[0],r=e.hasCompoundNodes();if(t){var i=t._private.style;if("visible"!==i.visibility.value||"element"!==i.display.value)return!1;if("nodes"===t._private.group){if(!r)return!0;var n=t._private.data.parent?t.parents():null;if(n)for(var a=0;a<n.length;a++){var o=n[a],s=o._private.style,l=s.visibility.value,u=s.display.value;if("visible"!==l||"element"!==u)return!1}return!0}var c=t._private.source,d=t._private.target;return c.visible()&&d.visible()}},hidden:function(){var e=this[0];return e?!e.visible():void 0},effectiveOpacity:function(){var e=this.cy();if(!e.styleEnabled())return 1;var t=e.hasCompoundNodes(),r=this[0];if(r){var i=r._private,n=i.style.opacity.value;if(!t)return n;var a=i.data.parent?r.parents():null;if(a)for(var o=0;o<a.length;o++){var s=a[o],l=s._private.style.opacity.value;n=l*n}return n}},transparent:function(){var e=this.cy();if(!e.styleEnabled())return!1;var t=this[0],r=t.cy().hasCompoundNodes();return t?r?0===t.effectiveOpacity():0===t._private.style.opacity.value:void 0},isFullAutoParent:function(){var e=this.cy();if(!e.styleEnabled())return!1;var t=this[0];if(t){var r="auto"===t._private.style.width.value,i="auto"===t._private.style.height.value;return t.isParent()&&r&&i}},backgrounding:function(){var e=this.cy();if(!e.styleEnabled())return!1;var t=this[0];return t._private.backgrounding?!0:!1}}),e.elesfn.bypass=e.elesfn.style=e.elesfn.css,e.elesfn.renderedStyle=e.elesfn.renderedCss,e.elesfn.removeBypass=e.elesfn.removeStyle=e.elesfn.removeCss}(cytoscape),function(e){"use strict";function t(t){return function(){var r=arguments,i=[];if(2===r.length){var n=r[0],a=r[1];this.bind(t.event,n,a)}else if(1===r.length){var a=r[0];this.bind(t.event,a)}else if(0===r.length){for(var o=0;o<this.length;o++){var s=this[o],l=!t.ableField||s._private[t.ableField],u=s._private[t.field]!=t.value;if(t.overrideAble){var c=t.overrideAble(s);if(void 0!==c&&(l=c,!c))return this}l&&(s._private[t.field]=t.value,u&&i.push(s))}var d=e.Collection(this.cy(),i);d.updateStyle(),d.trigger(t.event)}return this}}function r(r){e.elesfn[r.field]=function(){var e=this[0];if(e){if(r.overrideField){var t=r.overrideField(e);if(void 0!==t)return t}return e._private[r.field]}},e.elesfn[r.on]=t({event:r.on,field:r.field,ableField:r.ableField,overrideAble:r.overrideAble,value:!0}),e.elesfn[r.off]=t({event:r.off,field:r.field,ableField:r.ableField,overrideAble:r.overrideAble,value:!1})}r({field:"locked",overrideField:function(e){return e.cy().autolock()?!0:void 0},on:"lock",off:"unlock"}),r({field:"grabbable",overrideField:function(e){return e.cy().autoungrabify()?!1:void 0},on:"grabify",off:"ungrabify"}),r({field:"selected",ableField:"selectable",overrideAble:function(e){return e.cy().autounselectify()?!1:void 0},on:"select",off:"unselect"}),r({field:"selectable",overrideField:function(e){return e.cy().autounselectify()?!1:void 0},on:"selectify",off:"unselectify"}),e.elesfn.deselect=e.elesfn.unselect,e.elesfn.grabbed=function(){var e=this[0];return e?e._private.grabbed:void 0},r({field:"active",on:"activate",off:"unactivate"}),e.elesfn.inactive=function(){var e=this[0];return e?!e._private.active:void 0}}(cytoscape),function(e){"use strict";function t(t){return function(r){for(var i=[],n=this._private.cy,a=0;a<this.length;a++){var o=this[a],s=o._private[t.attr];s&&i.push(s)}return new e.Collection(n,i,{unique:!0}).filter(r)}}function r(t){return function(r){var i=[],n=this._private.cy,a=t||{};e.is.string(r)&&(r=n.$(r));for(var o=this._private.ids,s=r._private.ids,l=0;l<r.length;l++)for(var u=r[l]._private.edges,c=0;c<u.length;c++){var d=u[c],h=d._private.data,p=o[h.source]&&s[h.target],v=s[h.source]&&o[h.target],f=p||v;if(f){if(a.thisIs){if("source"===a.thisIs&&!p)continue;if("target"===a.thisIs&&!v)continue}i.push(d)}}return new e.Collection(n,i,{unique:!0})}}function i(t){var r={codirected:!1};return t=e.util.extend({},r,t),function(r){for(var i=this._private.cy,n=[],a=this.edges(),o=t,s=0;s<a.length;s++)for(var l=a[s],u=l.source()[0],c=u.id(),d=l.target()[0],h=d.id(),p=u._private.edges,v=0;v<p.length;v++){var f=p[v],g=f._private.data,y=g.target,m=g.source,x=y===h&&m===c,b=c===y&&h===m;(o.codirected&&x||!o.codirected&&(x||b))&&n.push(f)}return new e.Collection(i,n,{unique:!0}).filter(r)}}e.fn.eles({roots:function(t){for(var r=this,i=[],n=0;n<r.length;n++){var a=r[n];if(a.isNode()){var o=a.connectedEdges(function(){return this.data("target")===a.id()&&this.data("source")!==a.id()}).length>0;o||i.push(a)}}return new e.Collection(this._private.cy,i,{unique:!0}).filter(t)},leaves:function(t){for(var r=this,i=[],n=0;n<r.length;n++){var a=r[n];if(a.isNode()){var o=a.connectedEdges(function(){return this.data("source")===a.id()&&this.data("target")!==a.id()}).length>0;o||i.push(a)}}return new e.Collection(this._private.cy,i,{unique:!0}).filter(t)},outgoers:function(t){for(var r=this,i=[],n=0;n<r.length;n++){var a=r[n],o=a.id();if(a.isNode())for(var s=a._private.edges,l=0;l<s.length;l++){var u=s[l],c=u._private.data.source,d=u._private.data.target;c===o&&d!==o&&(i.push(u),i.push(u.target()[0]))}}return new e.Collection(this._private.cy,i,{unique:!0}).filter(t)},successors:function(t){for(var r=this,i=[],n={};;){var a=r.outgoers();if(0===a.length)break;for(var o=!1,s=0;s<a.length;s++){var l=a[s],u=l.id();n[u]||(n[u]=!0,i.push(l),o=!0)}if(!o)break;r=a}return new e.Collection(this._private.cy,i,{unique:!0}).filter(t)},incomers:function(t){for(var r=this,i=[],n=0;n<r.length;n++){var a=r[n],o=a.id();if(a.isNode())for(var s=a._private.edges,l=0;l<s.length;l++){var u=s[l],c=u._private.data.source,d=u._private.data.target;d===o&&c!==o&&(i.push(u),i.push(u.source()[0]))}}return new e.Collection(this._private.cy,i,{unique:!0}).filter(t)},predecessors:function(t){for(var r=this,i=[],n={};;){var a=r.incomers();if(0===a.length)break;for(var o=!1,s=0;s<a.length;s++){var l=a[s],u=l.id();n[u]||(n[u]=!0,i.push(l),o=!0)}if(!o)break;r=a}return new e.Collection(this._private.cy,i,{unique:!0}).filter(t)}}),e.fn.eles({neighborhood:function(t){for(var r=[],i=this._private.cy,n=this.nodes(),a=0;a<n.length;a++)for(var o=n[a],s=o.connectedEdges(),l=0;l<s.length;l++){var u=s[l],c=u.connectedNodes().not(o);c.length>0&&r.push(c[0]),r.push(u[0])}return new e.Collection(i,r,{unique:!0}).filter(t)},closedNeighborhood:function(e){return this.neighborhood().add(this).filter(e)},openNeighborhood:function(e){return this.neighborhood(e)}}),e.elesfn.neighbourhood=e.elesfn.neighborhood,e.elesfn.closedNeighbourhood=e.elesfn.closedNeighborhood,e.elesfn.openNeighbourhood=e.elesfn.openNeighborhood,e.fn.eles({source:function(e){var t,r=this[0];return r&&(t=r._private.source),t&&e?t.filter(e):t},target:function(e){var t,r=this[0];return r&&(t=r._private.target),t&&e?t.filter(e):t},sources:t({attr:"source"}),targets:t({attr:"target"})}),e.fn.eles({edgesWith:r(),edgesTo:r({thisIs:"source"})}),e.fn.eles({connectedEdges:function(t){for(var r=[],i=this._private.cy,n=this,a=0;a<n.length;a++){var o=n[a];if(o.isNode())for(var s=o._private.edges,l=0;l<s.length;l++){var u=s[l];r.push(u)}}return new e.Collection(i,r,{unique:!0}).filter(t)},connectedNodes:function(t){for(var r=[],i=this._private.cy,n=this,a=0;a<n.length;a++){var o=n[a];o.isEdge()&&(r.push(o.source()[0]),r.push(o.target()[0]))}return new e.Collection(i,r,{unique:!0}).filter(t)},parallelEdges:i(),codirectedEdges:i({codirected:!0})})}(cytoscape),function(e){"use strict";e.fn.eles({fit:function(){},center:function(){}})}(cytoscape),function(e){"use strict";e.Minheap=function(t,r,i){return new e.Heap(t,r,e.Heap.minHeapComparator,i)},e.Maxheap=function(t,r,i){return new e.Heap(t,r,e.Heap.maxHeapComparator,i)},e.Heap=function(t,r,i,n){if("undefined"!=typeof i&&"undefined"!=typeof r){"undefined"==typeof n&&(n=e.Heap.idFn);var a,o,s,l=[],u={},c=[],d=0;for(r=this.getArgumentAsCollection(r,t),s=r.length,d=0;s>d;d+=1){if(l.push(n.call(t,r[d],d,r)),a=r[d].id(),u.hasOwnProperty(a))throw"ERROR: Multiple items with the same id found: "+a;u[a]=d,c.push(a)}for(this._private={cy:t,heap:l,pointers:u,elements:c,comparator:i,extractor:n,length:s},d=Math.floor(s/2);d>=0;d-=1)o=this.heapify(d);return o}},e.Heap.idFn=function(e){return e.id()},e.Heap.minHeapComparator=function(e,t){return e>=t},e.Heap.maxHeapComparator=function(e,t){return t>=e},e.fn.heap=function(t,r){for(var i in t){var n=t[i];e.Heap.prototype[i]=n}},e.heapfn=e.Heap.prototype,e.heapfn.size=function(){return this._private.length},e.heapfn.getArgumentAsCollection=function(t,r){var i;if("undefined"==typeof r&&(r=this._private.cy),e.is.elementOrCollection(t))i=t;else{for(var n=[],a=[].concat.apply([],[t]),o=0;o<a.length;o++){var s=a[o],l=r.getElementById(s);l.length>0&&n.push(l)}i=new e.Collection(r,n)}return i},e.heapfn.isHeap=function(){var e,t,r,i,n,a=this._private.heap,o=a.length,s=this._private.comparator;for(e=0;o>e;e+=1)if(t=2*e+1,r=t+1,i=o>t?s(a[t],a[e]):!0,n=o>r?s(a[r],a[e]):!0,!i||!n)return!1;return!0},e.heapfn.heapSwap=function(e,t){var r=this._private.heap,i=this._private.pointers,n=this._private.elements,a=r[e],o=n[e],s=n[e],l=n[t];r[e]=r[t],n[e]=n[t],i[s]=t,i[l]=e,r[t]=a,n[t]=o},e.heapfn.heapify=function(e,t){var r,i,n,a,o,s,l,u=0,c=!1;for("undefined"==typeof t&&(t=!0),r=this._private.heap,u=r.length,s=this._private.comparator,i=e;!c;)t?(n=2*i+1,a=n+1,o=i,u>n&&!s(r[n],r[o])&&(o=n),u>a&&!s(r[a],r[o])&&(o=a),c=o===i,c||(this.heapSwap(o,i),i=o)):(l=Math.floor((i-1)/2),o=i,c=0>l||s(r[o],r[l]),c||(this.heapSwap(o,l),i=l))},e.heapfn.insert=function(e){var t,r,i,n,a,o=this.getArgumentAsCollection(e),s=o.length;for(a=0;s>a;a+=1){if(t=o[a],r=this._private.heap.length,i=this._private.extractor(t),n=t.id(),this._private.pointers.hasOwnProperty(n))throw"ERROR: Multiple items with the same id found: "+n;this._private.heap.push(i),this._private.elements.push(n),this._private.pointers[n]=r,this.heapify(r,!1)}this._private.length=this._private.heap.length},e.heapfn.getValueById=function(e){if(this._private.pointers.hasOwnProperty(e)){var t=this._private.pointers[e];return this._private.heap[t]}},e.heapfn.contains=function(e){for(var t=this.getArgumentAsCollection(e),r=0;r<t.length;r+=1){var i=t[r].id();if(!this._private.pointers.hasOwnProperty(i))return!1}return!0},e.heapfn.top=function(){return this._private.length>0?{value:this._private.heap[0],id:this._private.elements[0]}:void 0},e.heapfn.pop=function(){if(this._private.length>0){var e,t,r,i=this.top(),n=this._private.length-1;return this.heapSwap(0,n),e=this._private.elements[n],t=this._private.heap[n],r=e,this._private.heap.pop(),this._private.elements.pop(),this._private.length=this._private.heap.length,this._private.pointers[r]=void 0,this.heapify(0),i}},e.heapfn.findDirectionHeapify=function(e){var t=Math.floor((e-1)/2),r=this._private.heap,i=0>t||this._private.comparator(r[e],r[t]);this.heapify(e,i)},e.heapfn.edit=function(t,r){for(var i=this.getArgumentAsCollection(t),n=0;n<i.length;n+=1){var a=i[n].id(),o=this._private.pointers[a],s=this._private.heap[o];e.is.number(r)?this._private.heap[o]=r:e.is.fn(r)&&(this._private.heap[o]=r.call(this._private.cy,s,o)),this.findDirectionHeapify(o)}},e.heapfn.remove=function(e){for(var t=this.getArgumentAsCollection(e),r=0;r<t.length;r+=1){var i,n,a,o=t[r].id(),s=this._private.pointers[o],l=this._private.length-1;s!==l&&this.heapSwap(s,l),i=this._private.elements[l],n=this._private.heap[l],a=i,this._private.heap.pop(),this._private.elements.pop(),this._private.length=this._private.heap.length,this._private.pointers[a]=void 0,this.findDirectionHeapify(s)}return n}}(cytoscape),function(e){"use strict";function t(e){this.options=e,this.data={select:[void 0,void 0,void 0,void 0,0],renderer:this,cy:e.cy,container:e.cy.container(),canvases:new Array(t.CANVAS_LAYERS),contexts:new Array(t.CANVAS_LAYERS),canvasNeedsRedraw:new Array(t.CANVAS_LAYERS),bufferCanvases:new Array(t.BUFFER_COUNT),bufferContexts:new Array(t.CANVAS_LAYERS)},this.hoverData={down:null,last:null,downTime:null,triggerMode:null,dragging:!1,initialPan:[null,null],capture:!1},this.timeoutData={panTimeout:null},this.dragData={possibleDragElements:[]},this.touchData={start:null,capture:!1,startPosition:[null,null,null,null,null,null],singleTouchStartTime:null,singleTouchMoved:!0,now:[null,null,null,null,null,null],earlier:[null,null,null,null,null,null]},this.zoomData={freeToZoom:!1,lastPointerX:null},this.redraws=0,this.showFps=e.showFps,this.bindings=[],this.data.canvasContainer=document.createElement("div");var r=this.data.canvasContainer.style;r.position="absolute",r.zIndex="0",r.overflow="hidden",this.data.container.appendChild(this.data.canvasContainer);for(var i=0;i<t.CANVAS_LAYERS;i++)this.data.canvases[i]=document.createElement("canvas"),this.data.contexts[i]=this.data.canvases[i].getContext("2d"),this.data.canvases[i].style.position="absolute",this.data.canvases[i].setAttribute("data-id","layer"+i),this.data.canvases[i].style.zIndex=String(t.CANVAS_LAYERS-i),this.data.canvasContainer.appendChild(this.data.canvases[i]),this.data.canvasNeedsRedraw[i]=!1;this.data.topCanvas=this.data.canvases[0],this.data.canvases[t.NODE].setAttribute("data-id","layer"+t.NODE+"-node"),this.data.canvases[t.SELECT_BOX].setAttribute("data-id","layer"+t.SELECT_BOX+"-selectbox"),this.data.canvases[t.DRAG].setAttribute("data-id","layer"+t.DRAG+"-drag");for(var i=0;i<t.BUFFER_COUNT;i++)this.data.bufferCanvases[i]=document.createElement("canvas"),this.data.bufferContexts[i]=this.data.bufferCanvases[i].getContext("2d"),this.data.bufferCanvases[i].style.position="absolute",this.data.bufferCanvases[i].setAttribute("data-id","buffer"+i),this.data.bufferCanvases[i].style.zIndex=String(-i-1),this.data.bufferCanvases[i].style.visibility="hidden";this.hideEdgesOnViewport=e.hideEdgesOnViewport,this.hideLabelsOnViewport=e.hideLabelsOnViewport,this.textureOnViewport=e.textureOnViewport,this.wheelSensitivity=e.wheelSensitivity,this.motionBlurEnabled=e.motionBlur,this.forcedPixelRatio=e.pixelRatio,this.motionBlur=!0,this.motionBlurOpacity=e.motionBlurOpacity,this.motionBlurTransparency=1-this.motionBlurOpacity,this.motionBlurPxRatio=1,this.mbPxRBlurry=1,this.minMbLowQualFrames=4,this.fullQualityMb=!1,this.clearedForMotionBlur=[],this.desktopTapThreshold=e.desktopTapThreshold,this.desktopTapThreshold2=e.desktopTapThreshold*e.desktopTapThreshold,this.touchTapThreshold=e.touchTapThreshold,
this.touchTapThreshold2=e.touchTapThreshold*e.touchTapThreshold,this.tapholdDuration=500,this.load()}t.CANVAS_LAYERS=3,t.SELECT_BOX=0,t.DRAG=1,t.NODE=2,t.BUFFER_COUNT=3,t.TEXTURE_BUFFER=0,t.MOTIONBLUR_BUFFER_NODE=1,t.MOTIONBLUR_BUFFER_DRAG=2,t.panOrBoxSelectDelay=400;var r="undefined"!=typeof Path2D;t.usePaths=function(){return r},t.prototype.notify=function(r){var i;i=e.is.array(r.type)?r.type:[r.type];for(var n=0;n<i.length;n++){var a=i[n];switch(a){case"destroy":return void this.destroy();case"add":case"remove":case"load":this.updateNodesCache(),this.updateEdgesCache();break;case"viewport":this.data.canvasNeedsRedraw[t.SELECT_BOX]=!0;break;case"style":this.updateCachedZSortedEles()}("load"===a||"resize"===a)&&(this.invalidateContainerClientCoordsCache(),this.matchCanvasSize(this.data.container))}this.data.canvasNeedsRedraw[t.NODE]=!0,this.data.canvasNeedsRedraw[t.DRAG]=!0,this.redraw()},t.prototype.destroy=function(){this.destroyed=!0;for(var e=0;e<this.bindings.length;e++){var t=this.bindings[e],r=t;r.target.removeEventListener(r.event,r.handler,r.useCapture)}if(this.removeObserver&&this.removeObserver.disconnect(),this.labelCalcDiv)try{document.body.removeChild(this.labelCalcDiv)}catch(i){}};for(var i in e.math)t.prototype[i]=e.math[i];e("renderer","canvas",t)}(cytoscape),function(e){"use strict";var t=e("renderer","canvas"),r=t.prototype,i=t.arrowShapes={};t.arrowShapeHeight=.3;var n=function(e,t,r,i,n,a,o,s){var l=r-n/2,u=r+n/2,c=i-a/2,d=i+a/2;return e>=l&&u>=e&&t>=c&&d>=t},a=function(e,t,r,i,n){i=-i;var a=e*Math.cos(i)-t*Math.sin(i),o=e*Math.sin(i)+t*Math.cos(i),s=a*r,l=o*r,u=s+n.x,c=l+n.y;return{x:u,y:c}};i.arrow={_points:[-.15,-.3,0,0,.15,-.3],collide:function(t,r,n,a,o,s,l,u){var c=i.arrow._points;return e.math.pointInsidePolygon(t,r,c,n,a,o,s,l,u)},roughCollide:n,draw:function(e,t,r,n){for(var o=i.arrow._points,s=0;s<o.length/2;s++){var l=a(o[2*s],o[2*s+1],t,r,n);e.lineTo(l.x,l.y)}},spacing:function(e){return 0},gap:function(e){return 2*e._private.style.width.pxValue}},i.triangle=i.arrow,i["triangle-backcurve"]={_ctrlPt:[0,-.15],collide:function(t,r,n,a,o,s,l,u){var c=i.triangle._points;return e.math.pointInsidePolygon(t,r,c,n,a,o,s,l,u)},roughCollide:n,draw:function(e,t,r,n){for(var o,s=i.triangle._points,l=0;l<s.length/2;l++){var u=a(s[2*l],s[2*l+1],t,r,n);0===l&&(o=u),e.lineTo(u.x,u.y)}var c=this._ctrlPt,d=a(c[0],c[1],t,r,n);e.quadraticCurveTo(d.x,d.y,o.x,o.y)},spacing:function(e){return 0},gap:function(e){return e._private.style.width.pxValue}},i["triangle-tee"]={_points:[-.15,-.3,0,0,.15,-.3,-.15,-.3],_pointsTee:[-.15,-.4,-.15,-.5,.15,-.5,.15,-.4],collide:function(t,r,n,a,o,s,l,u){var c=i["triangle-tee"]._points,d=i["triangle-tee"]._pointsTee,h=e.math.pointInsidePolygon(t,r,d,n,a,o,s,l,u)||e.math.pointInsidePolygon(t,r,c,n,a,o,s,l,u);return h},roughCollide:n,draw:function(e,t,r,n){for(var o=i["triangle-tee"]._points,s=0;s<o.length/2;s++){var l=a(o[2*s],o[2*s+1],t,r,n);e.lineTo(l.x,l.y)}var u=i["triangle-tee"]._pointsTee,c=a(u[0],u[1],t,r,n);e.moveTo(c.x,c.y);for(var s=0;s<u.length/2;s++){var l=a(u[2*s],u[2*s+1],t,r,n);e.lineTo(l.x,l.y)}},spacing:function(e){return 0},gap:function(e){return 2*e._private.style.width.pxValue}},i["half-triangle-overshot"]={_points:[0,-.25,-.5,-.25,.5,.25],leavePathOpen:!0,matchEdgeWidth:!0,collide:function(t,r,i,n,a,o,s,l){var u=this._points;return e.math.pointInsidePolygon(t,r,u,i,n,a,o,s,l)},roughCollide:n,draw:function(e,t,r,i){for(var n=this._points,o=0;o<n.length/2;o++){var s=a(n[2*o],n[2*o+1],t,r,i);e.lineTo(s.x,s.y)}},spacing:function(e){return 0},gap:function(e){return 2*e._private.style.width.pxValue}},i.none={collide:function(e,t,r,i,n,a,o,s){return!1},roughCollide:function(e,t,r,i,n,a,o,s){return!1},draw:function(e){},spacing:function(e){return 0},gap:function(e){return 0}},i.circle={_baseRadius:.15,collide:function(e,t,r,n,a,o,s,l){if(a!=o){var u=(o+l)/(a+l);return t/=u,n/=u,Math.pow(r-e,2)+Math.pow(n-t,2)<=Math.pow((a+l)*i.circle._baseRadius,2)}return Math.pow(r-e,2)+Math.pow(n-t,2)<=Math.pow((a+l)*i.circle._baseRadius,2)},roughCollide:n,draw:function(e,t,r,n){e.arc(n.x,n.y,i.circle._baseRadius*t,0,2*Math.PI,!1)},spacing:function(e){return r.getArrowWidth(e._private.style.width.pxValue)*i.circle._baseRadius},gap:function(e){return 2*e._private.style.width.pxValue}},i.inhibitor={_points:[-.25,0,-.25,-.1,.25,-.1,.25,0],collide:function(t,r,n,a,o,s,l,u){var c=i.inhibitor._points;return e.math.pointInsidePolygon(t,r,c,n,a,o,s,l,u)},roughCollide:n,draw:function(e,t,r,n){for(var o=i.inhibitor._points,s=0;s<o.length/2;s++){var l=a(o[2*s],o[2*s+1],t,r,n);e.lineTo(l.x,l.y)}},spacing:function(e){return 1},gap:function(e){return 1}},i.tee=i.inhibitor,i.square={_points:[-.15,0,.15,0,.15,-.3,-.15,-.3],collide:function(t,r,n,a,o,s,l,u){var c=i.square._points;return e.math.pointInsidePolygon(t,r,c,n,a,o,s,l,u)},roughCollide:n,draw:function(e,t,r,n){for(var o=i.square._points,s=0;s<o.length/2;s++){var l=a(o[2*s],o[2*s+1],t,r,n);e.lineTo(l.x,l.y)}},spacing:function(e){return 0},gap:function(e){return 2*e._private.style.width.pxValue}},i.diamond={_points:[-.15,-.15,0,-.3,.15,-.15,0,0],collide:function(t,r,n,a,o,s,l,u){var c=i.diamond._points;return e.math.pointInsidePolygon(t,r,c,n,a,o,s,l,u)},roughCollide:n,draw:function(e,t,r,n){for(var o=i.diamond._points,s=0;s<o.length/2;s++){var l=a(o[2*s],o[2*s+1],t,r,n);e.lineTo(l.x,l.y)}},spacing:function(e){return 0},gap:function(e){return e._private.style.width.pxValue}}}(cytoscape),function(e){"use strict";var t=e("renderer","canvas"),r=t.prototype;r.getCachedNodes=function(){var e=this.data,t=this.data.cy;return null==e.cache&&(e.cache={}),null==e.cache.cachedNodes&&(e.cache.cachedNodes=t.nodes()),e.cache.cachedNodes},r.updateNodesCache=function(){var e=this.data,t=this.data.cy;null==e.cache&&(e.cache={}),e.cache.cachedNodes=t.nodes()},r.getCachedEdges=function(){var e=this.data,t=this.data.cy;return null==e.cache&&(e.cache={}),null==e.cache.cachedEdges&&(e.cache.cachedEdges=t.edges()),e.cache.cachedEdges},r.updateEdgesCache=function(){var e=this.data,t=this.data.cy;null==e.cache&&(e.cache={}),e.cache.cachedEdges=t.edges()}}(cytoscape),function(e){"use strict";var t=e("renderer","canvas"),r=t.prototype;r.projectIntoViewport=function(e,t){var r=this.findContainerClientCoords(),i=r[0],n=r[1],a=e-i,o=t-n;return a-=this.data.cy.pan().x,o-=this.data.cy.pan().y,a/=this.data.cy.zoom(),o/=this.data.cy.zoom(),[a,o]},r.findContainerClientCoords=function(){var e=this.data.container,t=this.containerBB=this.containerBB||e.getBoundingClientRect();return[t.left,t.top,t.right-t.left,t.bottom-t.top]},r.invalidateContainerClientCoordsCache=function(){this.containerBB=null},r.findNearestElement=function(r,i,n,a){function o(e){var a=e.outerWidth()+2*v,o=e.outerHeight()+2*v,s=a/2,u=o/2,d=e._private.position;if(d.x-s<=r&&r<=d.x+s&&d.y-u<=i&&i<=d.y+u){var h=!n||e.visible()&&!e.transparent();if(n&&!h)return;{var p=t.nodeShapes[l.getNodeShape(e)];e._private.style["border-width"].pxValue/2}p.checkPoint(r,i,0,a,o,d.x,d.y)&&c.push(e)}}function s(a){var s,u,d=a._private.rscratch,v=a._private.style,f=v.width.pxValue/2+p,g=f*f,y=2*f,m=a._private.source,x=a._private.target,b=!1,w=function(){if(void 0!==u)return u;if(!n)return u=!0,!0;var e=a.visible()&&!a.transparent();return e?(u=!0,!0):(u=!1,!1)};if("self"===d.edgeType||"compound"===d.edgeType)((b=e.math.inBezierVicinity(r,i,d.startX,d.startY,d.cp2ax,d.cp2ay,d.selfEdgeMidX,d.selfEdgeMidY,g))&&w()&&g>(s=e.math.sqDistanceToQuadraticBezier(r,i,d.startX,d.startY,d.cp2ax,d.cp2ay,d.selfEdgeMidX,d.selfEdgeMidY))||(b=e.math.inBezierVicinity(r,i,d.selfEdgeMidX,d.selfEdgeMidY,d.cp2cx,d.cp2cy,d.endX,d.endY,g))&&w()&&g>(s=e.math.sqDistanceToQuadraticBezier(r,i,d.selfEdgeMidX,d.selfEdgeMidY,d.cp2cx,d.cp2cy,d.endX,d.endY)))&&c.push(a);else if("haystack"===d.edgeType){var _=v["haystack-radius"].value,E=_/2,S=x._private.position,D=x.width(),k=x.height(),T=m._private.position,P=m.width(),C=m.height(),M=T.x+d.source.x*P*E,B=T.y+d.source.y*C*E,N=S.x+d.target.x*D*E,I=S.y+d.target.y*k*E;(b=e.math.inLineVicinity(r,i,M,B,N,I,y))&&w()&&g>(s=e.math.sqDistanceToFiniteLine(r,i,M,B,N,I))&&c.push(a)}else"straight"===d.edgeType?(b=e.math.inLineVicinity(r,i,d.startX,d.startY,d.endX,d.endY,y))&&w()&&g>(s=e.math.sqDistanceToFiniteLine(r,i,d.startX,d.startY,d.endX,d.endY))&&c.push(a):"bezier"===d.edgeType&&(b=e.math.inBezierVicinity(r,i,d.startX,d.startY,d.cp2x,d.cp2y,d.endX,d.endY,g))&&w()&&g>(s=e.math.sqDistanceToQuadraticBezier(r,i,d.startX,d.startY,d.cp2x,d.cp2y,d.endX,d.endY))&&c.push(a);if(b&&w()&&0===c.length||c[c.length-1]!==a){var O=t.arrowShapes[v["source-arrow-shape"].value],z=t.arrowShapes[v["target-arrow-shape"].value],m=m||a._private.source,x=x||a._private.target,S=x._private.position,T=m._private.position,L=l.getArrowWidth(v.width.pxValue),R=l.getArrowHeight(v.width.pxValue),V=L,A=R;(O.roughCollide(r,i,d.arrowStartX,d.arrowStartY,L,R,[d.arrowStartX-T.x,d.arrowStartY-T.y],p)&&O.collide(r,i,d.arrowStartX,d.arrowStartY,L,R,[d.arrowStartX-T.x,d.arrowStartY-T.y],p)||z.roughCollide(r,i,d.arrowEndX,d.arrowEndY,V,A,[d.arrowEndX-S.x,d.arrowEndY-S.y],p)&&z.collide(r,i,d.arrowEndX,d.arrowEndY,V,A,[d.arrowEndX-S.x,d.arrowEndY-S.y],p))&&c.push(a)}h&&c.length>0&&c[c.length-1]===a&&(o(m),o(x))}for(var l=this,u=this.getCachedZSortedEles(),c=[],d=this.data.cy.zoom(),h=this.data.cy.hasCompoundNodes(),p=(a?24:8)/d,v=(a?8:2)/d,f=u.length-1;f>=0;f--){var g=u[f];if(c.length>0)break;"nodes"===g._private.group?o(u[f]):s(u[f])}return c.length>0?c[c.length-1]:null},r.getAllInBox=function(r,i,n,a){var o=this.getCachedNodes(),s=this.getCachedEdges(),l=[],u=Math.min(r,n),c=Math.max(r,n),d=Math.min(i,a),h=Math.max(i,a);r=u,n=c,i=d,a=h;for(var p,v=0;v<o.length;v++){var f=o[v]._private.position,g=this.getNodeShape(o[v]),y=this.getNodeWidth(o[v]),m=this.getNodeHeight(o[v]),x=o[v]._private.style["border-width"].pxValue/2,b=t.nodeShapes[g];b.intersectBox(r,i,n,a,y,m,f.x,f.y,x)&&l.push(o[v])}for(var v=0;v<s.length;v++){var w=s[v]._private.rscratch;if("self"==s[v]._private.rscratch.edgeType&&((p=e.math.boxInBezierVicinity(r,i,n,a,w.startX,w.startY,w.cp2ax,w.cp2ay,w.endX,w.endY,s[v]._private.style.width.pxValue))&&(2==p||1==p&&e.math.checkBezierInBox(r,i,n,a,w.startX,w.startY,w.cp2ax,w.cp2ay,w.endX,w.endY,s[v]._private.style.width.pxValue))||(p=e.math.boxInBezierVicinity(r,i,n,a,w.startX,w.startY,w.cp2cx,w.cp2cy,w.endX,w.endY,s[v]._private.style.width.pxValue))&&(2==p||1==p&&e.math.checkBezierInBox(r,i,n,a,w.startX,w.startY,w.cp2cx,w.cp2cy,w.endX,w.endY,s[v]._private.style.width.pxValue)))&&l.push(s[v]),"bezier"==w.edgeType&&(p=e.math.boxInBezierVicinity(r,i,n,a,w.startX,w.startY,w.cp2x,w.cp2y,w.endX,w.endY,s[v]._private.style.width.pxValue))&&(2==p||1==p&&e.math.checkBezierInBox(r,i,n,a,w.startX,w.startY,w.cp2x,w.cp2y,w.endX,w.endY,s[v]._private.style.width.pxValue))&&l.push(s[v]),"straight"==w.edgeType&&(p=e.math.boxInBezierVicinity(r,i,n,a,w.startX,w.startY,.5*w.startX+.5*w.endX,.5*w.startY+.5*w.endY,w.endX,w.endY,s[v]._private.style.width.pxValue))&&(2==p||1==p&&e.math.checkStraightEdgeInBox(r,i,n,a,w.startX,w.startY,w.endX,w.endY,s[v]._private.style.width.pxValue))&&l.push(s[v]),"haystack"==w.edgeType){var _=s[v].target()[0],E=_.position(),S=s[v].source()[0],D=S.position(),k=D.x+w.source.x,T=D.y+w.source.y,P=E.x+w.target.x,C=E.y+w.target.y,M=k>=r&&n>=k&&T>=i&&a>=T,B=P>=r&&n>=P&&C>=i&&a>=C;M&&B&&l.push(s[v])}}return l},r.getNodeWidth=function(e){return e.width()},r.getNodeHeight=function(e){return e.height()},r.getNodeShape=function(e){var t=e._private.style.shape.value;return e.isParent()?"rectangle"===t||"roundrectangle"===t?t:"rectangle":t},r.getNodePadding=function(e){var t=e._private.style["padding-left"].pxValue,r=e._private.style["padding-right"].pxValue,i=e._private.style["padding-top"].pxValue,n=e._private.style["padding-bottom"].pxValue;return isNaN(t)&&(t=0),isNaN(r)&&(r=0),isNaN(i)&&(i=0),isNaN(n)&&(n=0),{left:t,right:r,top:i,bottom:n}},r.zOrderSort=e.Collection.zIndexSort,r.updateCachedZSortedEles=function(){this.getCachedZSortedEles(!0)},r.getCachedZSortedEles=function(e){var t=this.lastZOrderCachedNodes,r=this.lastZOrderCachedEdges,i=this.getCachedNodes(),n=this.getCachedEdges(),a=[];if(!e&&t&&r&&t===i&&r===n)a=this.cachedZSortedEles;else{for(var o=0;o<i.length;o++){var s=i[o];(s.animated()||s.visible()&&!s.transparent())&&a.push(s)}for(var o=0;o<n.length;o++){var l=n[o];(l.animated()||l.visible()&&!l.transparent())&&a.push(l)}a.sort(this.zOrderSort),this.cachedZSortedEles=a}return this.lastZOrderCachedNodes=i,this.lastZOrderCachedEdges=n,a},r.projectBezier=function(t){function r(e){a.push({x:i(e[0],e[2],e[4],.05),y:i(e[1],e[3],e[5],.05)}),a.push({x:i(e[0],e[2],e[4],.25),y:i(e[1],e[3],e[5],.25)}),a.push({x:i(e[0],e[2],e[4],.4),y:i(e[1],e[3],e[5],.4)});var t={x:i(e[0],e[2],e[4],.5),y:i(e[1],e[3],e[5],.5)};a.push(t),"self"===n.edgeType||"compound"===n.edgeType?(n.midX=n.selfEdgeMidX,n.midY=n.selfEdgeMidY):(n.midX=t.x,n.midY=t.y),a.push({x:i(e[0],e[2],e[4],.6),y:i(e[1],e[3],e[5],.6)}),a.push({x:i(e[0],e[2],e[4],.75),y:i(e[1],e[3],e[5],.75)}),a.push({x:i(e[0],e[2],e[4],.95),y:i(e[1],e[3],e[5],.95)})}var i=e.math.qbezierAt,n=t._private.rscratch,a=t._private.rstyle.bezierPts=[];"self"===n.edgeType?(r([n.startX,n.startY,n.cp2ax,n.cp2ay,n.selfEdgeMidX,n.selfEdgeMidY]),r([n.selfEdgeMidX,n.selfEdgeMidY,n.cp2cx,n.cp2cy,n.endX,n.endY])):"bezier"===n.edgeType&&r([n.startX,n.startY,n.cp2x,n.cp2y,n.endX,n.endY])},r.recalculateNodeLabelProjection=function(e){var t=e._private.style.content.strValue;if(t&&!t.match(/^\s+$/)){var r,i,n=e.outerWidth(),a=e.outerHeight(),o=e._private.position,s=e._private.style["text-halign"].strValue,l=e._private.style["text-valign"].strValue,u=e._private.rscratch,c=e._private.rstyle;switch(s){case"left":r=o.x-n/2;break;case"right":r=o.x+n/2;break;default:r=o.x}switch(l){case"top":i=o.y-a/2;break;case"bottom":i=o.y+a/2;break;default:i=o.y}u.labelX=r,u.labelY=i,c.labelX=r,c.labelY=i,this.applyLabelDimensions(e)}},r.recalculateEdgeLabelProjection=function(t){var r=t._private.style.content.strValue;if(r&&!r.match(/^\s+$/)){var i,n,a,o,s=t._private,l=s.rscratch,u=s.rstyle;if("self"==l.edgeType)a=l.selfEdgeMidX,o=l.selfEdgeMidY;else if("straight"==l.edgeType)a=(l.startX+l.endX)/2,o=(l.startY+l.endY)/2;else if("bezier"==l.edgeType)a=e.math.qbezierAt(l.startX,l.cp2x,l.endX,.5),o=e.math.qbezierAt(l.startY,l.cp2y,l.endY,.5);else if("haystack"==l.edgeType){var c=l.haystackPts;a=(c[0]+c[2])/2,o=(c[1]+c[3])/2}i=a,n=o,l.labelX=i,l.labelY=n,u.labelX=i,u.labelY=n,this.applyLabelDimensions(t)}},r.applyLabelDimensions=function(e){var t=e._private.rscratch,r=e._private.rstyle,i=this.getLabelText(e),n=this.calculateLabelDimensions(e,i);r.labelWidth=n.width,t.labelWidth=n.width,r.labelHeight=n.height,t.labelHeight=n.height},r.getLabelText=function(e){var t=e._private.style,r=e._private.style.content.strValue,i=t["text-transform"].value,n=e._private.rscratch;if("none"==i||("uppercase"==i?r=r.toUpperCase():"lowercase"==i&&(r=r.toLowerCase())),"wrap"===t["text-wrap"].value){if(n.labelWrapKey===n.labelKey)return n.labelWrapCachedText;for(var a=r.split("\n"),o=t["text-max-width"].pxValue,s=[],l=0;l<a.length;l++){var u=a[l],c=this.calculateLabelDimensions(e,u,"line="+u),d=c.width;if(d>o){for(var h=u.split(/\s+/),p="",v=0;v<h.length;v++){var f=h[v],g=0===p.length?f:p+" "+f,y=this.calculateLabelDimensions(e,g,"testLine="+g),m=y.width;o>=m?p+=f+" ":(s.push(p),p=f+" ")}p.match(/^\s+$/)||s.push(p)}else s.push(u)}n.labelWrapCachedLines=s,n.labelWrapCachedText=r=s.join("\n"),n.labelWrapKey=n.labelKey}return r},r.calculateLabelDimensions=function(e,t,r){var i=this,n=e._private.style,a=n["font-style"].strValue,o=n["font-size"].pxValue+"px",s=n["font-family"].strValue,l=n["font-weight"].strValue,u=e._private.labelKey;r&&(u+="$@$"+r);var c=i.labelDimCache||(i.labelDimCache={});if(c[u])return c[u];var d=this.labelCalcDiv;d||(d=this.labelCalcDiv=document.createElement("div"),document.body.appendChild(d));var h=d.style;return h.fontFamily=s,h.fontStyle=a,h.fontSize=o,h.fontWeight=l,h.position="absolute",h.left="-9999px",h.top="-9999px",h.zIndex="-1",h.visibility="hidden",h.pointerEvents="none",h.padding="0",h.lineHeight="1",h.whiteSpace="wrap"===n["text-wrap"].value?"pre":"normal",d.textContent=t,c[u]={width:d.clientWidth,height:d.clientHeight},c[u]},r.recalculateRenderedStyle=function(e){for(var t=[],r=[],i={},n=0;n<e.length;n++){var a=e[n],o=a._private,s=o.style,l=o.rscratch,u=o.rstyle,c=o.data.id,d=null!=l.boundingBoxKey&&o.boundingBoxKey===l.boundingBoxKey,h=null!=l.labelKey&&o.labelKey===l.labelKey,p=d&&h;if("nodes"===a._private.group){var v=o.position,f=null!=u.nodeX&&null!=u.nodeY&&v.x===u.nodeX&&v.y===u.nodeY,g=null!=u.nodeW&&u.nodeW===s.width.pxValue,y=null!=u.nodeH&&u.nodeH===s.height.pxValue;f&&p&&g&&y||r.push(a),u.nodeX=v.x,u.nodeY=v.y,u.nodeW=s.width.pxValue,u.nodeH=s.height.pxValue}else{var m=a._private.source._private.position,x=a._private.target._private.position,b=null!=u.srcX&&null!=u.srcY&&m.x===u.srcX&&m.y===u.srcY,w=null!=u.tgtX&&null!=u.tgtY&&x.x===u.tgtX&&x.y===u.tgtY,_=b&&w;if(!_||!p){var E=o.style["curve-style"].value;if("bezier"===E){if(!i[c]){t.push(a),i[c]=!0;for(var S=a.parallelEdges(),n=0;n<S.length;n++){var D=S[n],k=D._private.data.id;i[k]||(t.push(D),i[k]=!0)}}}else t.push(a)}u.srcX=m.x,u.srcY=m.y,u.tgtX=x.x,u.tgtY=x.y}l.boundingBoxKey=o.boundingBoxKey,l.labelKey=o.labelKey}this.recalculateEdgeProjections(t),this.recalculateLabelProjections(r,t)},r.recalculateLabelProjections=function(e,t){for(var r=0;r<e.length;r++)this.recalculateNodeLabelProjection(e[r]);for(var r=0;r<t.length;r++)this.recalculateEdgeLabelProjection(t[r])},r.recalculateEdgeProjections=function(e){this.findEdgeControlPoints(e)},r.findEdgeControlPoints=function(r){if(r&&0!==r.length){for(var i,n=this.data.cy,a=n.hasCompoundNodes(),o={},s=[],l=[],u=0;u<r.length;u++){var c=r[u],d=c._private.style,h="unbundled-bezier"===d["curve-style"].value;if("none"!==d.display.value)if("haystack"!==d["curve-style"].value){var p=c._private.data.source,v=c._private.data.target;i=p>v?v+"-"+p:p+"-"+v,h&&(i="unbundled"+c._private.data.id),null==o[i]&&(o[i]=[],s.push(i)),o[i].push(c),h&&(o[i].hasUnbundled=!0)}else l.push(c)}for(var f,g,y,m,x,b,w,_,E,S,D,k,T,P,C=0;C<s.length;C++){i=s[C];var M=o[i];if(M.sort(function(e,t){return e._private.index-t._private.index}),f=M[0]._private.source,g=M[0]._private.target,f._private.data.id>g._private.data.id){var B=f;f=g,g=B}if(y=f._private.position,m=g._private.position,x=this.getNodeWidth(f),b=this.getNodeHeight(f),w=this.getNodeWidth(g),_=this.getNodeHeight(g),E=t.nodeShapes[this.getNodeShape(f)],S=t.nodeShapes[this.getNodeShape(g)],D=f._private.style["border-width"].pxValue,k=g._private.style["border-width"].pxValue,P=!1,M.length>1&&f!==g||M.hasUnbundled){var N=E.intersectLine(y.x,y.y,x,b,m.x,m.y,D/2),I=S.intersectLine(m.x,m.y,w,_,y.x,y.y,k/2),O={x1:N[0],x2:I[0],y1:N[1],y2:I[1]},z=I[1]-N[1],L=I[0]-N[0],R=Math.sqrt(L*L+z*z),V={x:L,y:z},A={x:V.x/R,y:V.y/R};T={x:-A.y,y:A.x},(S.checkPoint(N[0],N[1],k/2,w,_,m.x,m.y)||E.checkPoint(I[0],I[1],D/2,x,b,y.x,y.y))&&(T={},P=!0)}for(var c,X,u=0;u<M.length;u++){c=M[u],X=c._private.rscratch;var F=X.lastEdgeIndex,Y=u,q=X.lastNumEdges,j=M.length,$=c._private.style,W=$["control-point-step-size"].pxValue,H=void 0!==$["control-point-distance"]?$["control-point-distance"].pxValue:void 0,Z=$["control-point-weight"].value,h="unbundled-bezier"===$["curve-style"].value,U=c._private.source!==f;U&&h&&(H*=-1);var G=X.lastSrcCtlPtX,K=y.x,J=X.lastSrcCtlPtY,Q=y.y,ee=X.lastSrcCtlPtW,te=f.outerWidth(),re=X.lastSrcCtlPtH,ie=f.outerHeight(),ne=X.lastTgtCtlPtX,ae=m.x,oe=X.lastTgtCtlPtY,se=m.y,le=X.lastTgtCtlPtW,ue=g.outerWidth(),ce=X.lastTgtCtlPtH,de=g.outerHeight(),he=X.lastW,pe=$["control-point-step-size"].pxValue;if(X.badBezier=P?!0:!1,G!==K||J!==Q||ee!==te||re!==ie||ne!==ae||oe!==se||le!==ue||ce!==de||he!==pe||!(F===Y&&q===j||h)){if(X.lastSrcCtlPtX=K,X.lastSrcCtlPtY=Q,X.lastSrcCtlPtW=te,X.lastSrcCtlPtH=ie,X.lastTgtCtlPtX=ae,X.lastTgtCtlPtY=se,X.lastTgtCtlPtW=ue,X.lastTgtCtlPtH=de,X.lastEdgeIndex=Y,X.lastNumEdges=j,X.lastWidth=pe,f===g){X.edgeType="self";var ve=u,fe=W;h&&(ve=0,fe=H),X.cp2ax=y.x,X.cp2ay=y.y-(1+Math.pow(b,1.12)/100)*fe*(ve/3+1),X.cp2cx=y.x-(1+Math.pow(x,1.12)/100)*fe*(ve/3+1),X.cp2cy=y.y,X.selfEdgeMidX=(X.cp2ax+X.cp2cx)/2,X.selfEdgeMidY=(X.cp2ay+X.cp2cy)/2}else if(a&&(f.isParent()||f.isChild()||g.isParent()||g.isChild())&&(f.parents().anySame(g)||g.parents().anySame(f))){X.edgeType="compound",X.badBezier=!1;var ve=u,fe=W;h&&(ve=0,fe=H);var ge=50,ye={x:y.x-x/2,y:y.y-b/2},me={x:m.x-w/2,y:m.y-_/2},xe=1;X.cp2ax=ye.x,X.compoundStretchA=Math.max(xe,Math.log(.01*x)),X.cp2ay=ye.y-(1+Math.pow(ge,1.12)/100)*fe*(ve/3+1)*X.compoundStretchA,X.compoundStretchB=Math.max(xe,Math.log(.01*w)),X.cp2cx=me.x-(1+Math.pow(ge,1.12)/100)*fe*(ve/3+1)*X.compoundStretchB,X.cp2cy=me.y,X.selfEdgeMidX=(X.cp2ax+X.cp2cx)/2,X.selfEdgeMidY=(X.cp2ay+X.cp2cy)/2}else if(M.length%2!==1||u!==Math.floor(M.length/2)||h){var be,we=(.5-M.length/2+u)*W,_e=e.math.signum(we);be=h?H:void 0!==H?_e*H:void 0;var Ee=void 0!==be?be:we,Se=1-Z,De=Z;U&&(Se=Z,De=1-Z);var ke={x:O.x1*Se+O.x2*De,y:O.y1*Se+O.y2*De};X.edgeType="bezier",X.cp2x=ke.x+T.x*Ee,X.cp2y=ke.y+T.y*Ee}else X.edgeType="straight";this.findEndpoints(c);var Te=!e.is.number(X.startX)||!e.is.number(X.startY),Pe=!e.is.number(X.arrowStartX)||!e.is.number(X.arrowStartY),Ce=!e.is.number(X.endX)||!e.is.number(X.endY),Me=!e.is.number(X.arrowEndX)||!e.is.number(X.arrowEndY),Be=3,Ne=this.getArrowWidth(c._private.style.width.pxValue)*t.arrowShapeHeight,Ie=Be*Ne,Oe=e.math.distance({x:X.cp2x,y:X.cp2y},{x:X.startX,y:X.startY}),ze=Ie>Oe,Le=e.math.distance({x:X.cp2x,y:X.cp2y},{x:X.endX,y:X.endY}),Re=Ie>Le;if("bezier"===X.edgeType){var Ve=!1;if(Te||Pe||ze){Ve=!0;var Ae={x:X.cp2x-y.x,y:X.cp2y-y.y},Xe=Math.sqrt(Ae.x*Ae.x+Ae.y*Ae.y),Fe={x:Ae.x/Xe,y:Ae.y/Xe},Ye=Math.max(x,b),qe={x:X.cp2x+2*Fe.x*Ye,y:X.cp2y+2*Fe.y*Ye},je=E.intersectLine(y.x,y.y,x,b,qe.x,qe.y,D/2);ze?(X.cp2x=X.cp2x+Fe.x*(Ie-Oe),X.cp2y=X.cp2y+Fe.y*(Ie-Oe)):(X.cp2x=je[0]+Fe.x*Ie,X.cp2y=je[1]+Fe.y*Ie)}if(Ce||Me||Re){Ve=!0;var Ae={x:X.cp2x-m.x,y:X.cp2y-m.y},Xe=Math.sqrt(Ae.x*Ae.x+Ae.y*Ae.y),Fe={x:Ae.x/Xe,y:Ae.y/Xe},Ye=Math.max(x,b),qe={x:X.cp2x+2*Fe.x*Ye,y:X.cp2y+2*Fe.y*Ye},$e=S.intersectLine(m.x,m.y,w,_,qe.x,qe.y,k/2);Re?(X.cp2x=X.cp2x+Fe.x*(Ie-Le),X.cp2y=X.cp2y+Fe.y*(Ie-Le)):(X.cp2x=$e[0]+Fe.x*Ie,X.cp2y=$e[1]+Fe.y*Ie)}Ve&&this.findEndpoints(c)}else"straight"===X.edgeType&&(X.midX=(K+ae)/2,X.midY=(Q+se)/2);this.projectBezier(c),this.recalculateEdgeLabelProjection(c)}}}for(var u=0;u<l.length;u++){var c=l[u],We=c._private,He=We.rscratch,X=He;if(!He.haystack){var Ze=2*Math.random()*Math.PI;He.source={x:Math.cos(Ze),y:Math.sin(Ze)};var Ze=2*Math.random()*Math.PI;He.target={x:Math.cos(Ze),y:Math.sin(Ze)}}var f=We.source,g=We.target,y=f._private.position,m=g._private.position,x=f.width(),w=g.width(),b=f.height(),_=g.height(),Ye=d["haystack-radius"].value,Ue=Ye/2;X.haystackPts=[X.source.x*x*Ue+y.x,X.source.y*b*Ue+y.y,X.target.x*w*Ue+m.x,X.target.y*_*Ue+m.y],He.edgeType="haystack",He.haystack=!0,this.recalculateEdgeLabelProjection(c)}return o}},r.findEndpoints=function(r){var i,n=r.source()[0],a=r.target()[0],o=r._private.style["target-arrow-shape"].value,s=r._private.style["source-arrow-shape"].value,l=a._private.style["border-width"].pxValue,u=n._private.style["border-width"].pxValue,c=r._private.rscratch;if("self"==c.edgeType||"compound"==c.edgeType){var d=[c.cp2cx,c.cp2cy];i=t.nodeShapes[this.getNodeShape(a)].intersectLine(a._private.position.x,a._private.position.y,this.getNodeWidth(a),this.getNodeHeight(a),d[0],d[1],l/2);var h=e.math.shortenIntersection(i,d,t.arrowShapes[o].spacing(r)),p=e.math.shortenIntersection(i,d,t.arrowShapes[o].gap(r));c.endX=p[0],c.endY=p[1],c.arrowEndX=h[0],c.arrowEndY=h[1];var d=[c.cp2ax,c.cp2ay];i=t.nodeShapes[this.getNodeShape(n)].intersectLine(n._private.position.x,n._private.position.y,this.getNodeWidth(n),this.getNodeHeight(n),d[0],d[1],u/2);var v=e.math.shortenIntersection(i,d,t.arrowShapes[s].spacing(r)),f=e.math.shortenIntersection(i,d,t.arrowShapes[s].gap(r));c.startX=f[0],c.startY=f[1],c.arrowStartX=v[0],c.arrowStartY=v[1]}else if("straight"==c.edgeType){i=t.nodeShapes[this.getNodeShape(a)].intersectLine(a._private.position.x,a._private.position.y,this.getNodeWidth(a),this.getNodeHeight(a),n.position().x,n.position().y,l/2),c.noArrowPlacement=0===i.length?!0:!1;var h=e.math.shortenIntersection(i,[n.position().x,n.position().y],t.arrowShapes[o].spacing(r)),p=e.math.shortenIntersection(i,[n.position().x,n.position().y],t.arrowShapes[o].gap(r));c.endX=p[0],c.endY=p[1],c.arrowEndX=h[0],c.arrowEndY=h[1],i=t.nodeShapes[this.getNodeShape(n)].intersectLine(n._private.position.x,n._private.position.y,this.getNodeWidth(n),this.getNodeHeight(n),a.position().x,a.position().y,u/2),c.noArrowPlacement=0===i.length?!0:!1;var v=e.math.shortenIntersection(i,[a.position().x,a.position().y],t.arrowShapes[s].spacing(r)),f=e.math.shortenIntersection(i,[a.position().x,a.position().y],t.arrowShapes[s].gap(r));c.startX=f[0],c.startY=f[1],c.arrowStartX=v[0],c.arrowStartY=v[1],c.badLine=e.is.number(c.startX)&&e.is.number(c.startY)&&e.is.number(c.endX)&&e.is.number(c.endY)?!1:!0}else if("bezier"==c.edgeType){var d=[c.cp2x,c.cp2y];i=t.nodeShapes[this.getNodeShape(a)].intersectLine(a._private.position.x,a._private.position.y,this.getNodeWidth(a),this.getNodeHeight(a),d[0],d[1],l/2);var h=e.math.shortenIntersection(i,d,t.arrowShapes[o].spacing(r)),p=e.math.shortenIntersection(i,d,t.arrowShapes[o].gap(r));c.endX=p[0],c.endY=p[1],c.arrowEndX=h[0],c.arrowEndY=h[1],i=t.nodeShapes[this.getNodeShape(n)].intersectLine(n._private.position.x,n._private.position.y,this.getNodeWidth(n),this.getNodeHeight(n),d[0],d[1],u/2);var v=e.math.shortenIntersection(i,d,t.arrowShapes[s].spacing(r)),f=e.math.shortenIntersection(i,d,t.arrowShapes[s].gap(r));c.startX=f[0],c.startY=f[1],c.arrowStartX=v[0],c.arrowStartY=v[1]}else if(c.isArcEdge)return},r.findEdges=function(e){for(var t=this.getCachedEdges(),r={},i=[],n=0;n<e.length;n++)r[e[n]._private.data.id]=e[n];for(var n=0;n<t.length;n++)(r[t[n]._private.data.source]||r[t[n]._private.data.target])&&i.push(t[n]);return i},r.getArrowWidth=r.getArrowHeight=function(e){var t=this.arrowWidthCache=this.arrowWidthCache||{},r=t[e];return r?r:(r=Math.max(Math.pow(13.37*e,.9),29),t[e]=r,r)}}(cytoscape),function(e){"use strict";var t=e("renderer","canvas"),r=t.prototype;r.drawEdge=function(e,r,i){var n=r._private.rscratch,a=t.usePaths();if(!n.badBezier&&("bezier"!==n.edgeType&&"straight"!==n.edgeType||!isNaN(n.startX))){var o=r._private.style;if(!(o.width.pxValue<=0)){var s=o["overlay-padding"].pxValue,l=o["overlay-opacity"].value,u=o["overlay-color"].value;if(i){if(0===l)return;this.strokeStyle(e,u[0],u[1],u[2],l),e.lineCap="round","self"!=r._private.rscratch.edgeType||a||(e.lineCap="butt")}else{var c=o["line-color"].value;this.strokeStyle(e,c[0],c[1],c[2],o.opacity.value),e.lineCap="butt"}var d,h,p,v;p=d=r._private.source,v=h=r._private.target;var f=o.width.pxValue+(i?2*s:0),g=i?"solid":o["line-style"].value;e.lineWidth=f;var y=o["shadow-blur"].pxValue,m=o["shadow-opacity"].value,x=o["shadow-color"].value,b=o["shadow-offset-x"].pxValue,w=o["shadow-offset-y"].pxValue;if(this.shadowStyle(e,x,i?0:m,y,b,w),"haystack"===n.edgeType)this.drawStyledEdge(r,e,n.haystackPts,g,f);else if("self"===n.edgeType||"compound"===n.edgeType){var _=r._private.rscratch,E=[_.startX,_.startY,_.cp2ax,_.cp2ay,_.selfEdgeMidX,_.selfEdgeMidY,_.selfEdgeMidX,_.selfEdgeMidY,_.cp2cx,_.cp2cy,_.endX,_.endY];this.drawStyledEdge(r,e,E,g,f)}else if("straight"===n.edgeType){var S=h._private.position.x-d._private.position.x,D=h._private.position.y-d._private.position.y,k=n.endX-n.startX,T=n.endY-n.startY;if(0>S*k+D*T)n.straightEdgeTooShort=!0;else{var _=n;this.drawStyledEdge(r,e,[_.startX,_.startY,_.endX,_.endY],g,f),n.straightEdgeTooShort=!1}}else{var _=n;this.drawStyledEdge(r,e,[_.startX,_.startY,_.cp2x,_.cp2y,_.endX,_.endY],g,f)}"haystack"===n.edgeType?this.drawArrowheads(e,r,i):n.noArrowPlacement!==!0&&void 0!==n.startX&&this.drawArrowheads(e,r,i),this.shadowStyle(e,"transparent",0)}}},r.drawStyledEdge=function(e,r,i,n,a){var o,s=e._private.rscratch,l=r,u=!1,c=t.usePaths();if(c){for(var d=i,h=s.pathCacheKey&&d.length===s.pathCacheKey.length,p=h,v=0;p&&v<d.length;v++)s.pathCacheKey[v]!==d[v]&&(p=!1);p?(o=r=s.pathCache,u=!0):(o=r=new Path2D,s.pathCacheKey=d,s.pathCache=o)}if(l.setLineDash)switch(n){case"dotted":l.setLineDash([1,1]);break;case"dashed":l.setLineDash([6,3]);break;case"solid":l.setLineDash([])}u||(r.beginPath&&r.beginPath(),r.moveTo(i[0],i[1]),6!==i.length||s.badBezier?12!==i.length||s.badBezier?4!==i.length||s.badLine||r.lineTo(i[2],i[3]):(r.quadraticCurveTo(i[2],i[3],i[4],i[5]),r.quadraticCurveTo(i[8],i[9],i[10],i[11])):r.quadraticCurveTo(i[2],i[3],i[4],i[5])),r=l,c?r.stroke(o):r.stroke(),r.setLineDash&&r.setLineDash([])},r.drawArrowheads=function(e,t,r){function i(r,i,n,a,o){var s=f[r+"-arrow-shape"].value;if("none"!==s){var l=e.globalCompositeOperation,u="hollow"===f[r+"-arrow-fill"].value?"both":"filled",c=f[r+"-arrow-fill"].value;"half-triangle-overshot"===s&&(c="hollow",u="hollow"),(1!==f.opacity.value||"hollow"===c)&&(e.globalCompositeOperation="destination-out",d.fillStyle(e,255,255,255,1),d.strokeStyle(e,255,255,255,1),d.drawArrowShape(t,r,e,u,f.width.pxValue,f[r+"-arrow-shape"].value,i,n,a,o),e.globalCompositeOperation=l);var h=f[r+"-arrow-color"].value;d.fillStyle(e,h[0],h[1],h[2],f.opacity.value),d.strokeStyle(e,h[0],h[1],h[2],f.opacity.value),d.drawArrowShape(t,r,e,c,f.width.pxValue,f[r+"-arrow-shape"].value,i,n,a,o)}}if(!r){var n,a,o,s,l,u,c=t._private.rscratch,d=this,h="haystack"===c.edgeType,p=t.source().position(),v=t.target().position();h?(o=c.haystackPts[0],s=c.haystackPts[1],l=c.haystackPts[2],u=c.haystackPts[3]):(o=c.arrowStartX,s=c.arrowStartY,l=c.arrowEndX,u=c.arrowEndY);var f=t._private.style;n=o-p.x,a=s-p.y,h||isNaN(o)||isNaN(s)||isNaN(n)||isNaN(a)||i("source",o,s,n,a);var g=c.midX,y=c.midY;h&&(g=(o+l)/2,y=(s+u)/2),n=o-l,a=s-u,"self"===c.edgeType&&(n=1,a=-1),isNaN(g)||isNaN(y)||i("mid-target",g,y,n,a),n*=-1,a*=-1,isNaN(g)||isNaN(y)||i("mid-source",g,y,n,a),n=l-v.x,a=u-v.y,h||isNaN(l)||isNaN(u)||isNaN(n)||isNaN(a)||i("target",l,u,n,a)}},r.drawArrowShape=function(e,r,i,n,a,o,s,l,u,c){var d,h=t.usePaths(),p=e._private.rscratch,v=!1,f=i,g={x:s,y:l},y=Math.asin(c/Math.sqrt(u*u+c*c));0>u?y+=Math.PI/2:y=-(Math.PI/2+y);var m=this.getArrowWidth(a),x=t.arrowShapes[o];if(h){var b=m+"$"+o+"$"+y+"$"+s+"$"+l;p.arrowPathCacheKey=p.arrowPathCacheKey||{},p.arrowPathCache=p.arrowPathCache||{};var w=p.arrowPathCacheKey[r]===b;w?(d=i=p.arrowPathCache[r],v=!0):(d=i=new Path2D,p.arrowPathCacheKey[r]=b,p.arrowPathCache[r]=d)}i.beginPath&&i.beginPath(),v||x.draw(i,m,y,g),!x.leavePathOpen&&i.closePath&&i.closePath(),i=f,("filled"===n||"both"===n)&&(h?i.fill(d):i.fill()),("hollow"===n||"both"===n)&&(i.lineWidth=x.matchEdgeWidth?a:1,i.lineJoin="miter",h?i.stroke(d):i.stroke())}}(cytoscape),function(e){"use strict";var t=e("renderer","canvas"),r=t.prototype;r.getCachedImage=function(e,t){var r=this,i=r.imageCache=r.imageCache||{};if(i[e]&&i[e].image)return i[e].image;var n=i[e]=i[e]||{},a=n.image=new Image;return a.addEventListener("load",t),a.src=e,a},r.safeDrawImage=function(e,r,i,n,a,o,s,l,u,c){var d=this;try{e.drawImage(r,i,n,a,o,s,l,u,c)}catch(h){d.data.canvasNeedsRedraw[t.NODE]=!0,d.data.canvasNeedsRedraw[t.DRAG]=!0,d.drawingImage=!0,d.redraw()}},r.drawInscribedImage=function(e,r,i){var n=this,a=i._private.position.x,o=i._private.position.y,s=i._private.style,l=s["background-fit"].value,u=s["background-position-x"],c=s["background-position-y"],d=s["background-repeat"].value,h=i.width(),p=i.height(),v=i._private.rscratch,f=s["background-clip"].value,g="node"===f,y=s["background-image-opacity"].value,m=r.width,x=r.height;if(0!==m&&0!==x){var b=s["background-width"];"auto"!==b.value&&(m="%"===b.units?b.value/100*h:b.pxValue);var w=s["background-height"];

if("auto"!==w.value&&(x="%"===w.units?w.value/100*p:w.pxValue),0!==m&&0!==x){if("contain"===l){var _=Math.min(h/m,p/x);m*=_,x*=_}else if("cover"===l){var _=Math.max(h/m,p/x);m*=_,x*=_}var E=a-h/2;E+="%"===u.units?(h-m)*u.value/100:u.pxValue;var S=o-p/2;S+="%"===c.units?(p-x)*c.value/100:c.pxValue,v.pathCache&&(E-=a,S-=o,a=0,o=0);var D=e.globalAlpha;if(e.globalAlpha=y,"no-repeat"===d)g&&(e.save(),v.pathCache?e.clip(v.pathCache):(t.nodeShapes[n.getNodeShape(i)].drawPath(e,a,o,h,p),e.clip())),n.safeDrawImage(e,r,0,0,r.width,r.height,E,S,m,x),g&&e.restore();else{var k=e.createPattern(r,d);e.fillStyle=k,t.nodeShapes[n.getNodeShape(i)].drawPath(e,a,o,h,p),e.translate(E,S),e.fill(),e.translate(-E,-S)}e.globalAlpha=D}}}}(cytoscape),function(e){"use strict";function t(e,t,r,i,n,a){var a=a||5;e.beginPath(),e.moveTo(t+a,r),e.lineTo(t+i-a,r),e.quadraticCurveTo(t+i,r,t+i,r+a),e.lineTo(t+i,r+n-a),e.quadraticCurveTo(t+i,r+n,t+i-a,r+n),e.lineTo(t+a,r+n),e.quadraticCurveTo(t,r+n,t,r+n-a),e.lineTo(t,r+a),e.quadraticCurveTo(t,r,t+a,r),e.closePath(),e.fill()}var r=e("renderer","canvas"),i=r.prototype;i.drawEdgeText=function(t,r){var i=r._private.style.content.strValue;if(!(!i||i.match(/^\s+$/)||this.hideEdgesOnViewport&&(this.dragData.didDrag||this.pinching||this.hoverData.dragging||this.data.wheel||this.swipePanning))){var n=r._private.style["font-size"].pxValue*r.cy().zoom(),a=r._private.style["min-zoomed-font-size"].pxValue;if(!(a>n)){t.textAlign="center",t.textBaseline="middle";var o=r._private.rscratch;if(e.is.number(o.labelX)&&e.is.number(o.labelY)){var s,l,u,c=r._private.style,d="autorotate"===c["edge-text-rotation"].strValue;if(d){switch(o.edgeType){case"haystack":l=o.haystackPts[2]-o.haystackPts[0],u=o.haystackPts[3]-o.haystackPts[1];break;default:l=o.endX-o.startX,u=o.endY-o.startY}s=Math.atan(u/l),t.translate(o.labelX,o.labelY),t.rotate(s),this.drawText(t,r,0,0),t.rotate(-s),t.translate(-o.labelX,-o.labelY)}else this.drawText(t,r,o.labelX,o.labelY)}}}},i.drawNodeText=function(t,r){var i=r._private.style.content.strValue;if(i&&!i.match(/^\s+$/)){var n=r._private.style["font-size"].pxValue*r.cy().zoom(),a=r._private.style["min-zoomed-font-size"].pxValue;if(!(a>n)){var o=r._private.style["text-halign"].strValue,s=r._private.style["text-valign"].strValue,l=r._private.rscratch;if(e.is.number(l.labelX)&&e.is.number(l.labelY)){switch(o){case"left":t.textAlign="right";break;case"right":t.textAlign="left";break;default:t.textAlign="center"}switch(s){case"top":t.textBaseline="bottom";break;case"bottom":t.textBaseline="top";break;default:t.textBaseline="middle"}this.drawText(t,r,l.labelX,l.labelY)}}}},i.getFontCache=function(e){var t;this.fontCaches=this.fontCaches||[];for(var r=0;r<this.fontCaches.length;r++)if(t=this.fontCaches[r],t.context===e)return t;return t={context:e},this.fontCaches.push(t),t},i.setupTextStyle=function(e,t){var r=t.effectiveOpacity(),i=t._private.style,n=i["font-style"].strValue,a=i["font-size"].pxValue+"px",o=i["font-family"].strValue,s=i["font-weight"].strValue,l=i["text-opacity"].value*i.opacity.value*r,u=i["text-outline-opacity"].value*l,c=i.color.value,d=i["text-outline-color"].value,h=i["text-shadow-blur"].pxValue,p=i["text-shadow-opacity"].value,v=i["text-shadow-color"].value,f=i["text-shadow-offset-x"].pxValue,g=i["text-shadow-offset-y"].pxValue,y=t._private.fontKey,m=this.getFontCache(e);m.key!==y&&(e.font=n+" "+s+" "+a+" "+o,m.key=y);var x=this.getLabelText(t);return e.lineJoin="round",this.fillStyle(e,c[0],c[1],c[2],l),this.strokeStyle(e,d[0],d[1],d[2],u),this.shadowStyle(e,v,p,h,f,g),x},i.drawText=function(e,r,i,n){var a=r._private,o=a.style,s=a.rstyle,l=a.rscratch,u=r.effectiveOpacity();if(0!==u&&0!==o["text-opacity"].value){var c=this.setupTextStyle(e,r),d=o["text-halign"].value,h=o["text-valign"].value;if(r.isEdge()&&(d="center",h="center"),null!=c&&!isNaN(i)&&!isNaN(n)){var p=o["text-background-opacity"].value,v=o["text-border-opacity"].value,f=o["text-border-width"].pxValue;if(p>0||f>0&&v>0){var g=4+f/2;r.isNode()&&("top"===h?n-=g:"bottom"===h&&(n+=g),"left"===d?i-=g:"right"===d&&(i+=g));var y=s.labelWidth,m=s.labelHeight,x=i;d&&("center"==d?x-=y/2:"left"==d&&(x-=y));var b=n;if(r.isNode()?"top"==h?b-=m:"center"==h&&(b-=m/2):b-=m/2,"autorotate"===o["edge-text-rotation"].strValue?(n=0,y+=4,x=i-y/2,b=n-m/2):(x-=g,b-=g,m+=2*g,y+=2*g),p>0){var w=e.fillStyle,_=o["text-background-color"].value;e.fillStyle="rgba("+_[0]+","+_[1]+","+_[2]+","+p*u+")";var E=o["text-background-shape"].strValue;"roundrectangle"==E?t(e,x,b,y,m,2):e.fillRect(x,b,y,m),e.fillStyle=w}if(f>0&&v>0){var S=e.strokeStyle,D=e.lineWidth,k=o["text-border-color"].value,T=o["text-border-style"].value;if(e.strokeStyle="rgba("+k[0]+","+k[1]+","+k[2]+","+v*u+")",e.lineWidth=f,e.setLineDash)switch(T){case"dotted":e.setLineDash([1,1]);break;case"dashed":e.setLineDash([4,2]);break;case"double":e.lineWidth=f/4,e.setLineDash([]);break;case"solid":e.setLineDash([])}if(e.strokeRect(x,b,y,m),"double"===T){var P=f/2;e.strokeRect(x+P,b+P,y-2*P,m-2*P)}e.setLineDash&&e.setLineDash([]),e.lineWidth=D,e.strokeStyle=S}}var C=2*o["text-outline-width"].pxValue;if(C>0&&(e.lineWidth=C),"wrap"===o["text-wrap"].value){var M=l.labelWrapCachedLines,B=s.labelHeight/M.length;switch(h){case"top":n-=(M.length-1)*B;break;case"bottom":break;default:case"center":n-=(M.length-1)*B/2}for(var N=0;N<M.length;N++)C>0&&e.strokeText(M[N],i,n),e.fillText(M[N],i,n),n+=B}else C>0&&e.strokeText(c,i,n),e.fillText(c,i,n);this.shadowStyle(e,"transparent",0)}}}}(cytoscape),function(e){"use strict";var t=e("renderer","canvas"),r=t.prototype;r.drawNode=function(e,r,i){var n,a,o=this,s=r._private.style,l=r._private.rscratch,u=r._private,c=u.position;if(void 0!==c.x&&void 0!==c.y){var d,h=t.usePaths(),p=e,v=!1,f=s["overlay-padding"].pxValue,g=s["overlay-opacity"].value,y=s["overlay-color"].value;if(!i||0!==g){var m=r.effectiveOpacity();if(0!==m)if(n=this.getNodeWidth(r),a=this.getNodeHeight(r),e.lineWidth=s["border-width"].pxValue,void 0!==i&&i)g>0&&(this.fillStyle(e,y[0],y[1],y[2],g),t.nodeShapes.roundrectangle.drawPath(e,r._private.position.x,r._private.position.y,n+2*f,a+2*f),e.fill());else{var x,b=s["background-image"].value[2]||s["background-image"].value[1];if(void 0!==b){x=this.getCachedImage(b,function(){o.data.canvasNeedsRedraw[t.NODE]=!0,o.data.canvasNeedsRedraw[t.DRAG]=!0,o.drawingImage=!0,o.redraw()});var w=u.backgrounding;u.backgrounding=!x.complete,w!==u.backgrounding&&r.updateStyle(!1)}var _=s["background-color"].value,E=s["border-color"].value,S=s["border-style"].value;this.fillStyle(e,_[0],_[1],_[2],s["background-opacity"].value*m),this.strokeStyle(e,E[0],E[1],E[2],s["border-opacity"].value*m);var D=s["shadow-blur"].pxValue,k=s["shadow-opacity"].value,T=s["shadow-color"].value,P=s["shadow-offset-x"].pxValue,C=s["shadow-offset-y"].pxValue;if(this.shadowStyle(e,T,k,D,P,C),e.lineJoin="miter",e.setLineDash)switch(S){case"dotted":e.setLineDash([1,1]);break;case"dashed":e.setLineDash([4,2]);break;case"solid":case"double":e.setLineDash([])}var M=s.shape.strValue;if(h){var B=M+"$"+n+"$"+a;e.translate(c.x,c.y),l.pathCacheKey===B?(d=e=l.pathCache,v=!0):(d=e=new Path2D,l.pathCacheKey=B,l.pathCache=d)}if(!v){var N=c;h&&(N={x:0,y:0}),t.nodeShapes[this.getNodeShape(r)].drawPath(e,N.x,N.y,n,a)}e=p,h?e.fill(d):e.fill(),this.shadowStyle(e,"transparent",0),void 0!==b&&x.complete&&this.drawInscribedImage(e,x,r);var I=s["background-blacken"].value,O=s["border-width"].pxValue;if(this.hasPie(r)&&(this.drawPie(e,r,m),(0!==I||0!==O)&&(h||t.nodeShapes[this.getNodeShape(r)].drawPath(e,c.x,c.y,n,a))),I>0?(this.fillStyle(e,0,0,0,I),h?e.fill(d):e.fill()):0>I&&(this.fillStyle(e,255,255,255,-I),h?e.fill(d):e.fill()),O>0&&(h?e.stroke(d):e.stroke(),"double"===S)){e.lineWidth=s["border-width"].pxValue/3;var z=e.globalCompositeOperation;e.globalCompositeOperation="destination-out",h?e.stroke(d):e.stroke(),e.globalCompositeOperation=z}h&&e.translate(-c.x,-c.y),e.setLineDash&&e.setLineDash([])}}}},r.hasPie=function(e){return e=e[0],e._private.hasPie},r.drawPie=function(r,i,n){i=i[0];var a=i._private,o=a.style,s=o["pie-size"],l=this.getNodeWidth(i),u=this.getNodeHeight(i),c=a.position.x,d=a.position.y,h=Math.min(l,u)/2,p=0,v=t.usePaths();v&&(c=0,d=0),"%"===s.units?h=h*s.value/100:void 0!==s.pxValue&&(h=s.pxValue/2);for(var f=1;f<=e.style.pieBackgroundN;f++){var g=o["pie-"+f+"-background-size"].value,y=o["pie-"+f+"-background-color"].value,m=o["pie-"+f+"-background-opacity"].value*n,x=g/100;x+p>1&&(x=1-p);var b=1.5*Math.PI+2*Math.PI*p,w=2*Math.PI*x,_=b+w;0===g||p>=1||p+x>1||(r.beginPath(),r.moveTo(c,d),r.arc(c,d,h,b,_),r.closePath(),this.fillStyle(r,y[0],y[1],y[2],m),r.fill(),p+=x)}}}(cytoscape),function(e){"use strict";var t=e("renderer","canvas"),r=t,i=t.prototype;i.getPixelRatio=function(){var e=this.data.contexts[0];if(null!=this.forcedPixelRatio)return this.forcedPixelRatio;var t=e.backingStorePixelRatio||e.webkitBackingStorePixelRatio||e.mozBackingStorePixelRatio||e.msBackingStorePixelRatio||e.oBackingStorePixelRatio||e.backingStorePixelRatio||1;return(window.devicePixelRatio||1)/t},i.paintCache=function(e){for(var t,r=this.paintCaches=this.paintCaches||[],i=!0,n=0;n<r.length;n++)if(t=r[n],t.context===e){i=!1;break}return i&&(t={context:e},r.push(t)),t},i.fillStyle=function(e,t,r,i,n){e.fillStyle="rgba("+t+","+r+","+i+","+n+")"},i.strokeStyle=function(e,t,r,i,n){e.strokeStyle="rgba("+t+","+r+","+i+","+n+")"},i.shadowStyle=function(e,t,r,i,n,a){var o=this.data.cy.zoom(),s=this.paintCache(e);(0!==s.shadowOpacity||0!==r)&&(s.shadowOpacity=r,r>0?(e.shadowBlur=i*o,e.shadowColor="rgba("+t[0]+","+t[1]+","+t[2]+","+r+")",e.shadowOffsetX=n*o,e.shadowOffsetY=a*o):(e.shadowBlur=0,e.shadowColor="transparent"))},i.matchCanvasSize=function(e){var i=this.data,n=e.clientWidth,a=e.clientHeight,o=this.getPixelRatio(),s=this.motionBlurPxRatio;(e===this.data.bufferCanvases[r.MOTIONBLUR_BUFFER_NODE]||e===this.data.bufferCanvases[r.MOTIONBLUR_BUFFER_DRAG])&&(o=s);var l,u=n*o,c=a*o;if(u!==this.canvasWidth||c!==this.canvasHeight){this.fontCaches=null;var d=i.canvasContainer;d.style.width=n+"px",d.style.height=a+"px";for(var h=0;h<t.CANVAS_LAYERS;h++)l=i.canvases[h],(l.width!==u||l.height!==c)&&(l.width=u,l.height=c,l.style.width=n+"px",l.style.height=a+"px");for(var h=0;h<t.BUFFER_COUNT;h++)l=i.bufferCanvases[h],(l.width!==u||l.height!==c)&&(l.width=u,l.height=c,l.style.width=n+"px",l.style.height=a+"px");this.textureMult=1,1>=o&&(l=i.bufferCanvases[t.TEXTURE_BUFFER],this.textureMult=2,l.width=u*this.textureMult,l.height=c*this.textureMult),this.canvasWidth=u,this.canvasHeight=c}},i.renderTo=function(e,t,r,i){this.redraw({forcedContext:e,forcedZoom:t,forcedPan:r,drawAllLayers:!0,forcedPxRatio:i})},i.timeToRender=function(){return this.redrawTotalTime/this.redrawCount},t.minRedrawLimit=1e3/60,t.maxRedrawLimit=1e3,t.motionBlurDelay=100,i.redraw=function(i){function n(){function i(e,t,r,i,n){var a=e.globalCompositeOperation;e.globalCompositeOperation="destination-out",c.fillStyle(e,255,255,255,c.motionBlurTransparency),e.fillRect(t,r,i,n),e.globalCompositeOperation=a}function n(e,t){var n,s,d,h;/*!r.fullQualityMb &&*/c.clearingMotionBlur||e!==p.bufferContexts[r.MOTIONBLUR_BUFFER_NODE]&&e!==p.bufferContexts[r.MOTIONBLUR_BUFFER_DRAG]?(n=T,s=D,d=c.canvasWidth,h=c.canvasHeight):(n={x:k.x*y,y:k.y*y},s=S*y,d=c.canvasWidth*y,h=c.canvasHeight*y),e.setTransform(1,0,0,1,0,0),"motionBlur"===t?i(e,0,0,d,h):a||void 0!==t&&!t||e.clearRect(0,0,d,h),o||(e.translate(n.x,n.y),e.scale(s,s)),u&&e.translate(u.x,u.y),l&&e.scale(l,l)}function b(e,t){for(var r=e.eles,i=0;i<r.length;i++){var n=r[i];n.isNode()?(c.drawNode(t,n),F||c.drawNodeText(t,n),c.drawNode(t,n,!0)):X||(c.drawEdge(t,n),F||c.drawEdgeText(t,n),c.drawEdge(t,n,!0))}}c.textureDrawLastFrame&&!f&&(v[r.NODE]=!0,v[r.SELECT_BOX]=!0);var _=c.getCachedEdges(),E=h.style()._private.coreStyle,S=h.zoom(),D=void 0!==l?l:S,k=h.pan(),T={x:k.x,y:k.y},C={zoom:S,pan:{x:k.x,y:k.y}},M=c.prevViewport,B=void 0===M||C.zoom!==M.zoom||C.pan.x!==M.pan.x||C.pan.y!==M.pan.y;B||x&&!m||(c.motionBlurPxRatio=1),u&&(T=u),D*=d,T.x*=d,T.y*=d;var N={drag:{nodes:[],edges:[],eles:[]},nondrag:{nodes:[],edges:[],eles:[]}};if(f||(c.textureDrawLastFrame=!1),f){c.textureDrawLastFrame=!0;var I;if(!c.textureCache){c.textureCache={},I=c.textureCache.bb=h.elements().boundingBox(),c.textureCache.texture=c.data.bufferCanvases[t.TEXTURE_BUFFER];var O=c.data.bufferContexts[t.TEXTURE_BUFFER];O.setTransform(1,0,0,1,0,0),O.clearRect(0,0,c.canvasWidth*c.textureMult,c.canvasHeight*c.textureMult),c.redraw({forcedContext:O,drawOnlyNodeLayer:!0,forcedPxRatio:d*c.textureMult});var C=c.textureCache.viewport={zoom:h.zoom(),pan:h.pan(),width:c.canvasWidth,height:c.canvasHeight};C.mpan={x:(0-C.pan.x)/C.zoom,y:(0-C.pan.y)/C.zoom}}v[r.DRAG]=!1,v[r.NODE]=!1;var z=p.contexts[r.NODE],L=c.textureCache.texture,C=c.textureCache.viewport;I=c.textureCache.bb,z.setTransform(1,0,0,1,0,0),g?i(z,0,0,C.width,C.height):z.clearRect(0,0,C.width,C.height);var R=E["outside-texture-bg-color"].value,V=E["outside-texture-bg-opacity"].value;c.fillStyle(z,R[0],R[1],R[2],V),z.fillRect(0,0,C.width,C.height);var S=h.zoom();n(z,!1),z.clearRect(C.mpan.x,C.mpan.y,C.width/C.zoom/d,C.height/C.zoom/d),z.drawImage(L,C.mpan.x,C.mpan.y,C.width/C.zoom/d,C.height/C.zoom/d)}else c.textureOnViewport&&!a&&(c.textureCache=null);var A=c.pinching||c.hoverData.dragging||c.swipePanning||c.data.wheelZooming||c.hoverData.draggingEles,X=c.hideEdgesOnViewport&&A,F=c.hideLabelsOnViewport&&A;if(v[r.DRAG]||v[r.NODE]||o||s){X||c.findEdgeControlPoints(_);for(var Y=c.getCachedZSortedEles(),q=h.extent(),j=0;j<Y.length;j++){var $,W=Y[j],I=a?null:W.boundingBox(),H=a?!0:e.math.boundingBoxesIntersect(q,I);H&&($=W._private.rscratch.inDragLayer?N.drag:N.nondrag,$.eles.push(W))}}var Z=[];if(Z[r.NODE]=!v[r.NODE]&&g&&!c.clearedForMotionBlur[r.NODE]||c.clearingMotionBlur,Z[r.NODE]&&(c.clearedForMotionBlur[r.NODE]=!0),Z[r.DRAG]=!v[r.DRAG]&&g&&!c.clearedForMotionBlur[r.DRAG]||c.clearingMotionBlur,Z[r.DRAG]&&(c.clearedForMotionBlur[r.DRAG]=!0),v[r.NODE]||o||s||Z[r.NODE]){var U=g&&!Z[r.NODE]&&1!==y,z=a||(U?c.data.bufferContexts[r.MOTIONBLUR_BUFFER_NODE]:p.contexts[r.NODE]),G=g&&!U?"motionBlur":void 0;n(z,G),b(N.nondrag,z),o||g||(v[r.NODE]=!1)}if(!s&&(v[r.DRAG]||o||Z[r.DRAG])){var U=g&&!Z[r.DRAG]&&1!==y,z=a||(U?c.data.bufferContexts[r.MOTIONBLUR_BUFFER_DRAG]:p.contexts[r.DRAG]);n(z,g&&!U?"motionBlur":void 0),b(N.drag,z),o||g||(v[r.DRAG]=!1)}if(c.showFps||!s&&v[r.SELECT_BOX]&&!o){var z=a||p.contexts[r.SELECT_BOX];if(n(z),1==p.select[4]&&(c.hoverData.selecting||c.touchData.selecting)){var S=p.cy.zoom(),K=E["selection-box-border-width"].value/S;z.lineWidth=K,z.fillStyle="rgba("+E["selection-box-color"].value[0]+","+E["selection-box-color"].value[1]+","+E["selection-box-color"].value[2]+","+E["selection-box-opacity"].value+")",z.fillRect(p.select[0],p.select[1],p.select[2]-p.select[0],p.select[3]-p.select[1]),K>0&&(z.strokeStyle="rgba("+E["selection-box-border-color"].value[0]+","+E["selection-box-border-color"].value[1]+","+E["selection-box-border-color"].value[2]+","+E["selection-box-opacity"].value+")",z.strokeRect(p.select[0],p.select[1],p.select[2]-p.select[0],p.select[3]-p.select[1]))}if(p.bgActivePosistion&&!c.hoverData.selecting){var S=p.cy.zoom(),J=p.bgActivePosistion;z.fillStyle="rgba("+E["active-bg-color"].value[0]+","+E["active-bg-color"].value[1]+","+E["active-bg-color"].value[2]+","+E["active-bg-opacity"].value+")",z.beginPath(),z.arc(J.x,J.y,E["active-bg-size"].pxValue/S,0,2*Math.PI),z.fill()}var Q=c.averageRedrawTime;if(c.showFps&&Q){Q=Math.round(Q);var ee=Math.round(1e3/Q);z.setTransform(1,0,0,1,0,0),z.fillStyle="rgba(255, 0, 0, 0.75)",z.strokeStyle="rgba(255, 0, 0, 0.75)",z.lineWidth=1,z.fillText("1 frame = "+Q+" ms = "+ee+" fps",0,20);var te=60;z.strokeRect(0,30,250,20),z.fillRect(0,30,250*Math.min(ee/te,1),20)}o||(v[r.SELECT_BOX]=!1)}if(g&&1!==y){var re=p.contexts[r.NODE],ie=c.data.bufferCanvases[r.MOTIONBLUR_BUFFER_NODE],ne=p.contexts[r.DRAG],ae=c.data.bufferCanvases[r.MOTIONBLUR_BUFFER_DRAG],oe=function(e,t,r){e.setTransform(1,0,0,1,0,0),r||!w?e.clearRect(0,0,c.canvasWidth,c.canvasHeight):i(e,0,0,c.canvasWidth,c.canvasHeight);var n=y;e.drawImage(t,0,0,c.canvasWidth*n,c.canvasHeight*n,0,0,c.canvasWidth,c.canvasHeight)};(v[r.NODE]||Z[r.NODE])&&(oe(re,ie,Z[r.NODE]),v[r.NODE]=!1),(v[r.DRAG]||Z[r.DRAG])&&(oe(ne,ae,Z[r.DRAG]),v[r.DRAG]=!1)}var se=Date.now();void 0===c.averageRedrawTime&&(c.averageRedrawTime=se-P),void 0===c.redrawCount&&(c.redrawCount=0),c.redrawCount++,void 0===c.redrawTotalTime&&(c.redrawTotalTime=0),c.redrawTotalTime+=se-P,c.lastRedrawTime=se-P,c.averageRedrawTime=c.averageRedrawTime/2+(se-P)/2,c.currentlyDrawing=!1,c.prevViewport=C,c.clearingMotionBlur&&(c.clearingMotionBlur=!1,c.motionBlurCleared=!0,c.motionBlur=!0),g&&(c.motionBlurTimeout=setTimeout(function(){c.motionBlurTimeout=null,c.clearedForMotionBlur[r.NODE]=!1,c.clearedForMotionBlur[r.DRAG]=!1,c.motionBlur=!1,c.clearingMotionBlur=!f,c.mbFrames=0,v[r.NODE]=!0,v[r.DRAG]=!0,c.redraw()},t.motionBlurDelay)),c.drawingImage=!1}i=i||{};var a=i.forcedContext,o=i.drawAllLayers,s=i.drawOnlyNodeLayer,l=i.forcedZoom,u=i.forcedPan,c=this,d=void 0===i.forcedPxRatio?this.getPixelRatio():i.forcedPxRatio,h=c.data.cy,p=c.data,v=p.canvasNeedsRedraw,f=c.textureOnViewport&&!a&&(c.pinching||c.hoverData.dragging||c.swipePanning||c.data.wheelZooming),g=void 0!==i.motionBlur?i.motionBlur:c.motionBlur,y=c.motionBlurPxRatio,m=h.hasCompoundNodes(),x=c.hoverData.draggingEles,b=c.hoverData.selecting||c.touchData.selecting?!0:!1;g=g&&!a&&c.motionBlurEnabled&&!b;var w=g;!a&&c.motionBlurTimeout&&clearTimeout(c.motionBlurTimeout),!a&&this.redrawTimeout&&clearTimeout(this.redrawTimeout),this.redrawTimeout=null,void 0===this.averageRedrawTime&&(this.averageRedrawTime=0);var _=t.minRedrawLimit,E=t.maxRedrawLimit,S=this.averageRedrawTime;S=_>S?_:S,S=E>S?S:E,void 0===this.lastDrawTime&&(this.lastDrawTime=0);var D=Date.now(),k=D-this.lastDrawTime,T=k>=S;if(!a&&!c.clearingMotionBlur){if(!T||this.currentlyDrawing)return void(this.redrawTimeout=setTimeout(function(){c.redraw()},S));this.lastDrawTime=D,this.currentlyDrawing=!0}g&&(null==c.mbFrames&&(c.mbFrames=0),c.drawingImage||c.mbFrames++,c.mbFrames<3&&(w=!1),c.mbFrames>c.minMbLowQualFrames&&(c.motionBlurPxRatio=c.mbPxRBlurry)),c.clearingMotionBlur&&(c.motionBlurPxRatio=1);var P=Date.now();a?n():e.util.requestAnimationFrame(n),a||c.initrender||(c.initrender=!0,h.trigger("initrender")),a||h.triggerOnRender()}}(cytoscape),function(e){"use strict";var t=e("renderer","canvas"),r=t.prototype;r.drawPolygonPath=function(e,t,r,i,n,a){var o=i/2,s=n/2;e.beginPath&&e.beginPath(),e.moveTo(t+o*a[0],r+s*a[1]);for(var l=1;l<a.length/2;l++)e.lineTo(t+o*a[2*l],r+s*a[2*l+1]);e.closePath()},r.drawPolygon=function(e,t,r,i,n,a){this.drawPolygonPath(e,t,r,i,n,a),e.fill()},r.drawRoundRectanglePath=function(t,r,i,n,a,o){var s=n/2,l=a/2,u=e.math.getRoundRectangleRadius(n,a);t.beginPath&&t.beginPath(),t.moveTo(r,i-l),t.arcTo(r+s,i-l,r+s,i,u),t.arcTo(r+s,i+l,r,i+l,u),t.arcTo(r-s,i+l,r-s,i,u),t.arcTo(r-s,i-l,r,i-l,u),t.lineTo(r,i-l),t.closePath()},r.drawRoundRectangle=function(e,t,r,i,n,a){this.drawRoundRectanglePath(e,t,r,i,n,a),e.fill()}}(cytoscape),function(e){"use strict";var t=e("renderer","canvas"),r=t.prototype;r.createBuffer=function(e,t){var r=document.createElement("canvas");return r.width=e,r.height=t,[r,r.getContext("2d")]},r.bufferCanvasImage=function(t){var r=this.data,i=r.cy,n=i.elements().boundingBox(),a=t.full?Math.ceil(n.w):this.data.container.clientWidth,o=t.full?Math.ceil(n.h):this.data.container.clientHeight,s=1;if(void 0!==t.scale)a*=t.scale,o*=t.scale,s=t.scale;else if(e.is.number(t.maxWidth)||e.is.number(t.maxHeight)){var l=1/0,u=1/0;e.is.number(t.maxWidth)&&(l=s*t.maxWidth/a),e.is.number(t.maxHeight)&&(u=s*t.maxHeight/o),s=Math.min(l,u),a*=s,o*=s}var c=document.createElement("canvas");c.width=a,c.height=o,c.style.width=a+"px",c.style.height=o+"px";var d=c.getContext("2d");if(a>0&&o>0)if(d.clearRect(0,0,a,o),t.bg&&(d.fillStyle=t.bg,d.rect(0,0,a,o),d.fill()),d.globalCompositeOperation="source-over",t.full)this.redraw({forcedContext:d,drawAllLayers:!0,forcedZoom:s,forcedPan:{x:-n.x1*s,y:-n.y1*s},forcedPxRatio:1});else{var h=i.pan(),p={x:h.x*s,y:h.y*s},v=i.zoom()*s;this.redraw({forcedContext:d,drawAllLayers:!0,forcedZoom:v,forcedPan:p,forcedPxRatio:1})}return c},r.png=function(e){return this.bufferCanvasImage(e).toDataURL("image/png")},r.jpg=function(e){return this.bufferCanvasImage(e).toDataURL("image/jpeg")}}(cytoscape),function(e){"use strict";var t=e("renderer","canvas"),r=t,i=r.prototype;i.registerBinding=function(e,t,r,i){this.bindings.push({target:e,event:t,handler:r,useCapture:i}),e.addEventListener(t,r,i)},i.nodeIsDraggable=function(e){return 0!==e._private.style.opacity.value&&"visible"==e._private.style.visibility.value&&"element"==e._private.style.display.value&&!e.locked()&&e.grabbable()?!0:!1},i.load=function(){var t=this,i=function(e){var r;if(e.addToList&&t.data.cy.hasCompoundNodes()){if(!e.addToList.hasId){e.addToList.hasId={};for(var i=0;i<e.addToList.length;i++){var n=e.addToList[i];e.addToList.hasId[n.id()]=!0}}r=e.addToList.hasId}return r||{}},n=function(e,t){if(e._private.cy.hasCompoundNodes()&&(null!=t.inDragLayer||null!=t.addToList))for(var r=i(t),n=e.descendants(),a=0;a<n.size();a++){var o=n[a],s=o._private;t.inDragLayer&&(s.rscratch.inDragLayer=!0),t.addToList&&!r[o.id()]&&(t.addToList.push(o),r[o.id()]=!0,s.grabbed=!0);for(var l=s.edges,u=0;t.inDragLayer&&u<l.length;u++)l[u]._private.rscratch.inDragLayer=!0}},a=function(e,t){var r=e._private,a=i(t);t.inDragLayer&&(r.rscratch.inDragLayer=!0),t.addToList&&!a[e.id()]&&(t.addToList.push(e),a[e.id()]=!0,r.grabbed=!0);for(var o=r.edges,l=0;t.inDragLayer&&l<o.length;l++)o[l]._private.rscratch.inDragLayer=!0;n(e,t),s(e,{inDragLayer:t.inDragLayer})},o=function(e){if(e)for(var t=0;t<e.length;t++){var r=e[t]._private;if("nodes"===r.group){r.rscratch.inDragLayer=!1,r.grabbed=!1;for(var i=r.edges,n=0;n<i.length;n++)i[n]._private.rscratch.inDragLayer=!1;s(e[t],{inDragLayer:!1})}else"edges"===r.group&&(r.rscratch.inDragLayer=!1)}},s=function(e,t){if(null!=t.inDragLayer||null!=t.addToList){var r=e;if(e._private.cy.hasCompoundNodes()){for(;r.parent().nonempty();)r=r.parent()[0];if(r!=e){for(var n=r.descendants().merge(r).unmerge(e).unmerge(e.descendants()),a=n.connectedEdges(),o=i(t),s=0;s<n.size();s++)void 0!==t.inDragLayer&&(n[s]._private.rscratch.inDragLayer=t.inDragLayer),t.addToList&&!o[n[s].id()]&&(t.addToList.push(n[s]),o[n[s].id()]=!0,n[s]._private.grabbed=!0);for(var l=0;void 0!==t.inDragLayer&&l<a.length;l++)a[l]._private.rscratch.inDragLayer=t.inDragLayer}}}};"undefined"!=typeof MutationObserver?(t.removeObserver=new MutationObserver(function(e){for(var r=0;r<e.length;r++){var i=e[r],n=i.removedNodes;if(n)for(var a=0;a<n.length;a++){var o=n[a];if(o===t.data.container){t.destroy();break}}}}),t.removeObserver.observe(t.data.container.parentNode,{childList:!0})):t.registerBinding(t.data.container,"DOMNodeRemoved",function(e){t.destroy()}),t.registerBinding(window,"resize",e.util.debounce(function(e){t.invalidateContainerClientCoordsCache(),t.matchCanvasSize(t.data.container),t.data.canvasNeedsRedraw[r.NODE]=!0,t.redraw()},100));for(var l=function(e){t.registerBinding(e,"scroll",function(e){t.invalidateContainerClientCoordsCache()})},u=t.data.cy.container();l(u),u.parentNode;)u=u.parentNode;t.registerBinding(t.data.container,"contextmenu",function(e){e.preventDefault()});var c=function(){return 0!==t.data.select[4]};t.registerBinding(t.data.container,"mousedown",function(i){i.preventDefault(),t.hoverData.capture=!0,t.hoverData.which=i.which;var n=t.data.cy,o=t.projectIntoViewport(i.clientX,i.clientY),s=t.data.select,l=t.findNearestElement(o[0],o[1],!0,!1),u=t.dragData.possibleDragElements;t.hoverData.mdownPos=o;var c=t.data.canvasNeedsRedraw,d=function(){t.hoverData.tapholdCancelled=!1,clearTimeout(t.hoverData.tapholdTimeout),t.hoverData.tapholdTimeout=setTimeout(function(){if(!t.hoverData.tapholdCancelled){var r=t.hoverData.down;r?r.trigger(new e.Event(i,{type:"taphold",cyPosition:{x:o[0],y:o[1]}})):n.trigger(new e.Event(i,{type:"taphold",cyPosition:{x:o[0],y:o[1]}}))}},t.tapholdDuration)};if(3==i.which){t.hoverData.cxtStarted=!0;var h=new e.Event(i,{type:"cxttapstart",cyPosition:{x:o[0],y:o[1]}});l?(l.activate(),l.trigger(h),t.hoverData.down=l):n.trigger(h),t.hoverData.downTime=(new Date).getTime(),t.hoverData.cxtDragged=!1}else if(1==i.which){if(l&&l.activate(),null!=l){if(t.nodeIsDraggable(l)){var p=new e.Event(i,{type:"grab",cyPosition:{x:o[0],y:o[1]}});if(l.isNode()&&!l.selected())u=t.dragData.possibleDragElements=[],a(l,{addToList:u}),l.trigger(p);else if(l.isNode()&&l.selected()){u=t.dragData.possibleDragElements=[];for(var v=n.$(function(){return this.isNode()&&this.selected()}),f=0;f<v.length;f++)t.nodeIsDraggable(v[f])&&a(v[f],{addToList:u});l.trigger(p)}c[r.NODE]=!0,c[r.DRAG]=!0}l.trigger(new e.Event(i,{type:"mousedown",cyPosition:{x:o[0],y:o[1]}})).trigger(new e.Event(i,{type:"tapstart",cyPosition:{x:o[0],y:o[1]}})).trigger(new e.Event(i,{type:"vmousedown",cyPosition:{x:o[0],y:o[1]}}))}else null==l&&n.trigger(new e.Event(i,{type:"mousedown",cyPosition:{x:o[0],y:o[1]}})).trigger(new e.Event(i,{type:"tapstart",cyPosition:{x:o[0],y:o[1]}})).trigger(new e.Event(i,{type:"vmousedown",cyPosition:{x:o[0],y:o[1]}}));if(t.hoverData.down=l,t.hoverData.downTime=(new Date).getTime(),null==l||l.isEdge()){s[4]=1;var g=Math.max(0,r.panOrBoxSelectDelay-(+new Date-t.hoverData.downTime));clearTimeout(t.bgActiveTimeout),n.boxSelectionEnabled()||l&&l.isEdge()?t.bgActiveTimeout=setTimeout(function(){l&&l.unactivate(),t.data.bgActivePosistion={x:o[0],y:o[1]},t.hoverData.dragging=!0,c[r.SELECT_BOX]=!0,t.redraw()},g):(t.data.bgActivePosistion={x:o[0],y:o[1]},c[r.SELECT_BOX]=!0,t.redraw())}d()}s[0]=s[2]=o[0],s[1]=s[3]=o[1]},!1),t.registerBinding(window,"mousemove",e.util.throttle(function(i){var n=!1,o=t.hoverData.capture;if(!o){var s=t.findContainerClientCoords();if(!(i.clientX>s[0]&&i.clientX<s[0]+t.canvasWidth&&i.clientY>s[1]&&i.clientY<s[1]+t.canvasHeight))return;for(var l=t.data.container,u=i.target,c=u.parentNode,d=!1;c;){if(c===l){d=!0;break}c=c.parentNode}if(!d)return}var h=t.data.cy,p=h.zoom(),v=t.projectIntoViewport(i.clientX,i.clientY),f=t.data.select,g=t.data.canvasNeedsRedraw,y=null;t.hoverData.draggingEles||(y=t.findNearestElement(v[0],v[1],!0,!1));var m=t.hoverData.last,x=t.hoverData.down,b=[v[0]-f[2],v[1]-f[3]],w=t.dragData.possibleDragElements,_=f[2]-f[0],E=_*_,S=f[3]-f[1],D=S*S,k=E+D,T=k*p*p;t.hoverData.tapholdCancelled=!0;var P=function(){var e=t.hoverData.dragDelta=t.hoverData.dragDelta||[];0===e.length?(e.push(b[0]),e.push(b[1])):(e[0]+=b[0],e[1]+=b[1])};if(n=!0,null!=y?y.trigger(new e.Event(i,{type:"mousemove",cyPosition:{x:v[0],y:v[1]}})).trigger(new e.Event(i,{type:"vmousemove",cyPosition:{x:v[0],y:v[1]}})).trigger(new e.Event(i,{type:"tapdrag",cyPosition:{x:v[0],y:v[1]}})):null==y&&h.trigger(new e.Event(i,{type:"mousemove",cyPosition:{x:v[0],y:v[1]}})).trigger(new e.Event(i,{type:"vmousemove",cyPosition:{x:v[0],y:v[1]}})).trigger(new e.Event(i,{type:"tapdrag",cyPosition:{x:v[0],y:v[1]}})),3===t.hoverData.which){var C=new e.Event(i,{type:"cxtdrag",cyPosition:{x:v[0],y:v[1]}});x?x.trigger(C):h.trigger(C),t.hoverData.cxtDragged=!0,t.hoverData.cxtOver&&y===t.hoverData.cxtOver||(t.hoverData.cxtOver&&t.hoverData.cxtOver.trigger(new e.Event(i,{type:"cxtdragout",cyPosition:{x:v[0],y:v[1]}})),t.hoverData.cxtOver=y,y&&y.trigger(new e.Event(i,{type:"cxtdragover",cyPosition:{x:v[0],y:v[1]}})))}else if(t.hoverData.dragging){if(n=!0,h.panningEnabled()&&h.userPanningEnabled()){var M;if(t.hoverData.justStartedPan){var B=t.hoverData.mdownPos;M={x:(v[0]-B[0])*p,y:(v[1]-B[1])*p},t.hoverData.justStartedPan=!1}else M={x:b[0]*p,y:b[1]*p};h.panBy(M),t.hoverData.dragged=!0}v=t.projectIntoViewport(i.clientX,i.clientY)}else if(1==f[4]&&(null==x||x.isEdge())&&(!h.boxSelectionEnabled()||+new Date-t.hoverData.downTime>=r.panOrBoxSelectDelay)&&!t.hoverData.selecting&&T>=t.desktopTapThreshold2&&h.panningEnabled()&&h.userPanningEnabled())t.hoverData.dragging=!0,t.hoverData.selecting=!1,t.hoverData.justStartedPan=!0,f[4]=0;else{if(h.boxSelectionEnabled()&&!t.hoverData.dragging&&Math.pow(f[2]-f[0],2)+Math.pow(f[3]-f[1],2)>7&&f[4]&&(clearTimeout(t.bgActiveTimeout),t.data.bgActivePosistion=void 0,t.hoverData.selecting=!0,g[r.SELECT_BOX]=!0,t.redraw()),x&&x.isEdge()&&x.active()&&x.unactivate(),y!=m&&(m&&(m.trigger(new e.Event(i,{type:"mouseout",cyPosition:{x:v[0],y:v[1]}})),m.trigger(new e.Event(i,{type:"tapdragout",cyPosition:{x:v[0],y:v[1]}}))),y&&(y.trigger(new e.Event(i,{type:"mouseover",cyPosition:{x:v[0],y:v[1]}})),y.trigger(new e.Event(i,{type:"tapdragover",cyPosition:{x:v[0],y:v[1]}}))),t.hoverData.last=y),x&&x.isNode()&&t.nodeIsDraggable(x))if(T>=t.desktopTapThreshold2){var N=!t.dragData.didDrag;N&&(g[r.NODE]=!0),t.dragData.didDrag=!0;for(var I=[],O=0;O<w.length;O++){var z=w[O];if(t.hoverData.draggingEles||a(z,{inDragLayer:!0}),z.isNode()&&t.nodeIsDraggable(z)&&z.grabbed()){var L=z._private.position;if(I.push(z),e.is.number(b[0])&&e.is.number(b[1])&&(L.x+=b[0],L.y+=b[1],N)){var R=t.hoverData.dragDelta;e.is.number(R[0])&&e.is.number(R[1])&&(L.x+=R[0],L.y+=R[1])}}}t.hoverData.draggingEles=!0;var V=new e.Collection(h,I);V.updateCompoundBounds(),V.trigger("position drag"),g[r.DRAG]=!0,t.redraw()}else P();n=!0}return f[2]=v[0],f[3]=v[1],n?(i.stopPropagation&&i.stopPropagation(),i.preventDefault&&i.preventDefault(),!1):void 0},1e3/30,{trailing:!0}),!1),t.registerBinding(window,"mouseup",function(i){var n=t.hoverData.capture;if(n){t.hoverData.capture=!1;var a=t.data.cy,s=t.projectIntoViewport(i.clientX,i.clientY),l=t.data.select,u=t.findNearestElement(s[0],s[1],!0,!1),c=t.dragData.possibleDragElements,d=t.hoverData.down,h=i.shiftKey,p=t.data.canvasNeedsRedraw;if(t.data.bgActivePosistion&&(p[r.SELECT_BOX]=!0,t.redraw()),t.hoverData.tapholdCancelled=!0,t.data.bgActivePosistion=void 0,clearTimeout(t.bgActiveTimeout),d&&d.unactivate(),3===t.hoverData.which){var v=new e.Event(i,{type:"cxttapend",cyPosition:{x:s[0],y:s[1]}});if(d?d.trigger(v):a.trigger(v),!t.hoverData.cxtDragged){var f=new e.Event(i,{type:"cxttap",cyPosition:{x:s[0],y:s[1]}});d?d.trigger(f):a.trigger(f)}t.hoverData.cxtDragged=!1,t.hoverData.which=null}else{if(null!=d||t.dragData.didDrag||t.hoverData.dragged||(a.$(function(){return this.selected()}).unselect(),c.length>0&&(p[r.NODE]=!0),t.dragData.possibleDragElements=c=[]),null!=u?u.trigger(new e.Event(i,{type:"mouseup",cyPosition:{x:s[0],y:s[1]}})).trigger(new e.Event(i,{type:"tapend",cyPosition:{x:s[0],y:s[1]}})).trigger(new e.Event(i,{type:"vmouseup",cyPosition:{x:s[0],y:s[1]}})):null==u&&a.trigger(new e.Event(i,{type:"mouseup",cyPosition:{x:s[0],y:s[1]}})).trigger(new e.Event(i,{type:"tapend",cyPosition:{x:s[0],y:s[1]}})).trigger(new e.Event(i,{type:"vmouseup",cyPosition:{x:s[0],y:s[1]}})),t.dragData.didDrag||t.hoverData.dragged||(null!=u?u.trigger(new e.Event(i,{type:"click",cyPosition:{x:s[0],y:s[1]}})).trigger(new e.Event(i,{type:"tap",cyPosition:{x:s[0],y:s[1]}})).trigger(new e.Event(i,{type:"vclick",cyPosition:{x:s[0],y:s[1]}})):null==u&&a.trigger(new e.Event(i,{type:"click",cyPosition:{x:s[0],y:s[1]}})).trigger(new e.Event(i,{type:"tap",cyPosition:{x:s[0],y:s[1]}})).trigger(new e.Event(i,{type:"vclick",cyPosition:{x:s[0],y:s[1]}}))),u!=d||t.dragData.didDrag||null!=u&&u._private.selectable&&(t.hoverData.dragging||("additive"===a.selectionType()||h?u.selected()?u.unselect():u.select():h||(a.$(":selected").unmerge(u).unselect(),u.select())),p[r.NODE]=!0),t.hoverData.selecting&&a.boxSelectionEnabled()&&Math.pow(l[2]-l[0],2)+Math.pow(l[3]-l[1],2)>7&&l[4]){var g=[],y=t.getAllInBox(l[0],l[1],l[2],l[3]);p[r.SELECT_BOX]=!0,y.length>0&&(p[r.NODE]=!0);for(var m=0;m<y.length;m++)y[m]._private.selectable&&g.push(y[m]);var x=new e.Collection(a,g);"additive"===a.selectionType()?x.select():(h||a.$(":selected").unmerge(x).unselect(),x.select()),t.redraw();

}t.hoverData.dragging&&(t.hoverData.dragging=!1,p[r.SELECT_BOX]=!0,p[r.NODE]=!0,t.redraw()),l[4]||(p[r.DRAG]=!0,p[r.NODE]=!0,o(c),d&&d.trigger("free"))}l[4]=0,t.hoverData.down=null,t.hoverData.cxtStarted=!1,t.hoverData.draggingEles=!1,t.hoverData.selecting=!1,t.dragData.didDrag=!1,t.hoverData.dragged=!1,t.hoverData.dragDelta=[]}},!1);var d=function(e){if(!t.scrollingPage){var i=t.data.cy,n=t.projectIntoViewport(e.clientX,e.clientY),a=[n[0]*i.zoom()+i.pan().x,n[1]*i.zoom()+i.pan().y];if(t.hoverData.draggingEles||t.hoverData.dragging||t.hoverData.cxtStarted||c())return void e.preventDefault();if(i.panningEnabled()&&i.userPanningEnabled()&&i.zoomingEnabled()&&i.userZoomingEnabled()){e.preventDefault(),t.data.wheelZooming=!0,clearTimeout(t.data.wheelTimeout),t.data.wheelTimeout=setTimeout(function(){t.data.wheelZooming=!1,t.data.canvasNeedsRedraw[r.NODE]=!0,t.redraw()},150);var o=e.deltaY/-250||e.wheelDeltaY/1e3||e.wheelDelta/1e3;o*=t.wheelSensitivity;var s=1===e.deltaMode;s&&(o*=33),i.zoom({level:i.zoom()*Math.pow(10,o),renderedPosition:{x:a[0],y:a[1]}})}}};t.registerBinding(t.data.container,"wheel",d,!0),t.registerBinding(window,"scroll",function(e){t.scrollingPage=!0,clearTimeout(t.scrollingPageTimeout),t.scrollingPageTimeout=setTimeout(function(){t.scrollingPage=!1},250)},!0),t.registerBinding(t.data.container,"mouseout",function(r){var i=t.projectIntoViewport(r.clientX,r.clientY);t.data.cy.trigger(new e.Event(r,{type:"mouseout",cyPosition:{x:i[0],y:i[1]}}))},!1),t.registerBinding(t.data.container,"mouseover",function(r){var i=t.projectIntoViewport(r.clientX,r.clientY);t.data.cy.trigger(new e.Event(r,{type:"mouseover",cyPosition:{x:i[0],y:i[1]}}))},!1);var h,p,v,f,g,y,m,x,b,w,_,E,S,D=function(e,t,r,i){return Math.sqrt((r-e)*(r-e)+(i-t)*(i-t))},k=function(e,t,r,i){return(r-e)*(r-e)+(i-t)*(i-t)};t.registerBinding(t.data.container,"touchstart",function(i){clearTimeout(this.threeFingerSelectTimeout),i.target!==t.data.link&&i.preventDefault(),t.touchData.capture=!0,t.data.bgActivePosistion=void 0;var n=t.data.cy,o=t.getCachedNodes(),s=t.getCachedEdges(),l=t.touchData.now,u=t.touchData.earlier,c=t.data.canvasNeedsRedraw;if(i.touches[0]){var d=t.projectIntoViewport(i.touches[0].clientX,i.touches[0].clientY);l[0]=d[0],l[1]=d[1]}if(i.touches[1]){var d=t.projectIntoViewport(i.touches[1].clientX,i.touches[1].clientY);l[2]=d[0],l[3]=d[1]}if(i.touches[2]){var d=t.projectIntoViewport(i.touches[2].clientX,i.touches[2].clientY);l[4]=d[0],l[5]=d[1]}if(i.touches[1]){var T=function(e){for(var t=0;t<e.length;t++)e[t]._private.grabbed=!1,e[t]._private.rscratch.inDragLayer=!1,e[t].active()&&e[t].unactivate()};T(o),T(s);var P=t.findContainerClientCoords();b=P[0],w=P[1],_=P[2],E=P[3],h=i.touches[0].clientX-b,p=i.touches[0].clientY-w,v=i.touches[1].clientX-b,f=i.touches[1].clientY-w,S=h>=0&&_>=h&&v>=0&&_>=v&&p>=0&&E>=p&&f>=0&&E>=f;var C=n.pan(),M=n.zoom();g=D(h,p,v,f),y=k(h,p,v,f),m=[(h+v)/2,(p+f)/2],x=[(m[0]-C.x)/M,(m[1]-C.y)/M];var B=200,N=B*B;if(N>y&&!i.touches[2]){var I=t.findNearestElement(l[0],l[1],!0,!0),O=t.findNearestElement(l[2],l[3],!0,!0);return I&&I.isNode()?(I.activate().trigger(new e.Event(i,{type:"cxttapstart",cyPosition:{x:l[0],y:l[1]}})),t.touchData.start=I):O&&O.isNode()?(O.activate().trigger(new e.Event(i,{type:"cxttapstart",cyPosition:{x:l[0],y:l[1]}})),t.touchData.start=O):(n.trigger(new e.Event(i,{type:"cxttapstart",cyPosition:{x:l[0],y:l[1]}})),t.touchData.start=null),t.touchData.start&&(t.touchData.start._private.grabbed=!1),t.touchData.cxt=!0,t.touchData.cxtDragged=!1,t.data.bgActivePosistion=void 0,void t.redraw()}}if(i.touches[2]);else if(i.touches[1]);else if(i.touches[0]){var z=t.findNearestElement(l[0],l[1],!0,!0);if(null!=z){if(z.activate(),t.touchData.start=z,z.isNode()&&t.nodeIsDraggable(z)){var L=t.dragData.touchDragEles=[];if(c[r.NODE]=!0,c[r.DRAG]=!0,z.selected())for(var R=n.$(function(){return this.isNode()&&this.selected()}),V=0;V<R.length;V++){var A=R[V];t.nodeIsDraggable(A)&&a(A,{addToList:L})}else a(z,{addToList:L});z.trigger(new e.Event(i,{type:"grab",cyPosition:{x:l[0],y:l[1]}}))}z.trigger(new e.Event(i,{type:"touchstart",cyPosition:{x:l[0],y:l[1]}})).trigger(new e.Event(i,{type:"tapstart",cyPosition:{x:l[0],y:l[1]}})).trigger(new e.Event(i,{type:"vmousdown",cyPosition:{x:l[0],y:l[1]}}))}null==z&&(n.trigger(new e.Event(i,{type:"touchstart",cyPosition:{x:l[0],y:l[1]}})).trigger(new e.Event(i,{type:"tapstart",cyPosition:{x:l[0],y:l[1]}})).trigger(new e.Event(i,{type:"vmousedown",cyPosition:{x:l[0],y:l[1]}})),t.data.bgActivePosistion={x:d[0],y:d[1]},c[r.SELECT_BOX]=!0,t.redraw());for(var X=0;X<l.length;X++)u[X]=l[X],t.touchData.startPosition[X]=l[X];t.touchData.singleTouchMoved=!1,t.touchData.singleTouchStartTime=+new Date,clearTimeout(t.touchData.tapholdTimeout),t.touchData.tapholdTimeout=setTimeout(function(){t.touchData.singleTouchMoved!==!1||t.pinching||(t.touchData.start?t.touchData.start.trigger(new e.Event(i,{type:"taphold",cyPosition:{x:l[0],y:l[1]}})):(t.data.cy.trigger(new e.Event(i,{type:"taphold",cyPosition:{x:l[0],y:l[1]}})),n.$(":selected").unselect()))},t.tapholdDuration)}},!1),t.registerBinding(window,"touchmove",e.util.throttle(function(i){var n=t.data.select,o=t.touchData.capture;o&&i.preventDefault();var s=t.data.cy,l=t.touchData.now,u=t.touchData.earlier,c=s.zoom(),d=t.data.canvasNeedsRedraw;if(i.touches[0]){var m=t.projectIntoViewport(i.touches[0].clientX,i.touches[0].clientY);l[0]=m[0],l[1]=m[1]}if(i.touches[1]){var m=t.projectIntoViewport(i.touches[1].clientX,i.touches[1].clientY);l[2]=m[0],l[3]=m[1]}if(i.touches[2]){var m=t.projectIntoViewport(i.touches[2].clientX,i.touches[2].clientY);l[4]=m[0],l[5]=m[1]}for(var _=[],E=0;E<l.length;E++)_[E]=l[E]-u[E];var T=t.touchData.startPosition,P=l[0]-T[0],C=P*P,M=l[1]-T[1],B=M*M,N=C+B,I=N*c*c;if(o&&t.touchData.cxt){var O=i.touches[0].clientX-b,z=i.touches[0].clientY-w,L=i.touches[1].clientX-b,R=i.touches[1].clientY-w,V=k(O,z,L,R),A=V/y,X=150,F=X*X,Y=1.5,q=Y*Y;if(A>=q||V>=F){t.touchData.cxt=!1,t.touchData.start&&(t.touchData.start.unactivate(),t.touchData.start=null),t.data.bgActivePosistion=void 0,d[r.SELECT_BOX]=!0;var j=new e.Event(i,{type:"cxttapend",cyPosition:{x:l[0],y:l[1]}});t.touchData.start?t.touchData.start.trigger(j):s.trigger(j)}}if(o&&t.touchData.cxt){var j=new e.Event(i,{type:"cxtdrag",cyPosition:{x:l[0],y:l[1]}});t.data.bgActivePosistion=void 0,d[r.SELECT_BOX]=!0,t.touchData.start?t.touchData.start.trigger(j):s.trigger(j),t.touchData.start&&(t.touchData.start._private.grabbed=!1),t.touchData.cxtDragged=!0;var $=t.findNearestElement(l[0],l[1],!0,!0);t.touchData.cxtOver&&$===t.touchData.cxtOver||(t.touchData.cxtOver&&t.touchData.cxtOver.trigger(new e.Event(i,{type:"cxtdragout",cyPosition:{x:l[0],y:l[1]}})),t.touchData.cxtOver=$,$&&$.trigger(new e.Event(i,{type:"cxtdragover",cyPosition:{x:l[0],y:l[1]}})))}else if(o&&i.touches[2]&&s.boxSelectionEnabled())t.data.bgActivePosistion=void 0,clearTimeout(this.threeFingerSelectTimeout),this.lastThreeTouch=+new Date,t.touchData.selecting=!0,d[r.SELECT_BOX]=!0,n&&0!==n.length&&void 0!==n[0]?(n[2]=(l[0]+l[2]+l[4])/3,n[3]=(l[1]+l[3]+l[5])/3):(n[0]=(l[0]+l[2]+l[4])/3,n[1]=(l[1]+l[3]+l[5])/3,n[2]=(l[0]+l[2]+l[4])/3+1,n[3]=(l[1]+l[3]+l[5])/3+1),n[4]=1,t.touchData.selecting=!0,t.redraw();else if(o&&i.touches[1]&&s.zoomingEnabled()&&s.panningEnabled()&&s.userZoomingEnabled()&&s.userPanningEnabled()){t.data.bgActivePosistion=void 0,d[r.SELECT_BOX]=!0;var W=t.dragData.touchDragEles;if(W){d[r.DRAG]=!0;for(var H=0;H<W.length;H++)W[H]._private.grabbed=!1,W[H]._private.rscratch.inDragLayer=!1}var O=i.touches[0].clientX-b,z=i.touches[0].clientY-w,L=i.touches[1].clientX-b,R=i.touches[1].clientY-w,Z=D(O,z,L,R),U=Z/g;if(1!=U&&S){var G=O-h,K=z-p,J=L-v,Q=R-f,ee=(G+J)/2,te=(K+Q)/2,re=s.zoom(),ie=re*U,ne=s.pan(),ae=x[0]*re+ne.x,oe=x[1]*re+ne.y,se={x:-ie/re*(ae-ne.x-ee)+ae,y:-ie/re*(oe-ne.y-te)+oe};if(t.touchData.start){var W=t.dragData.touchDragEles;if(W)for(var H=0;H<W.length;H++){var le=W[H]._private;le.grabbed=!1,le.rscratch.inDragLayer=!1}var ue=t.touchData.start._private;ue.active=!1,ue.grabbed=!1,ue.rscratch.inDragLayer=!1,d[r.DRAG]=!0,t.touchData.start.trigger("free").trigger("unactivate")}s.viewport({zoom:ie,pan:se,cancelOnFailedZoom:!0}),g=Z,h=O,p=z,v=L,f=R,t.pinching=!0}if(i.touches[0]){var m=t.projectIntoViewport(i.touches[0].clientX,i.touches[0].clientY);l[0]=m[0],l[1]=m[1]}if(i.touches[1]){var m=t.projectIntoViewport(i.touches[1].clientX,i.touches[1].clientY);l[2]=m[0],l[3]=m[1]}if(i.touches[2]){var m=t.projectIntoViewport(i.touches[2].clientX,i.touches[2].clientY);l[4]=m[0],l[5]=m[1]}}else if(i.touches[0]){var ce=t.touchData.start,de=t.touchData.last,$=$||t.findNearestElement(l[0],l[1],!0,!0);if(null!=ce&&"nodes"==ce._private.group&&t.nodeIsDraggable(ce))if(I>=t.touchTapThreshold2){for(var W=t.dragData.touchDragEles,he=0;he<W.length;he++){var pe=W[he];if(t.nodeIsDraggable(pe)&&pe.isNode()&&pe.grabbed()){t.dragData.didDrag=!0;var ve=pe._private.position,fe=!t.hoverData.draggingEles;if(e.is.number(_[0])&&e.is.number(_[1])&&(ve.x+=_[0],ve.y+=_[1]),fe){a(pe,{inDragLayer:!0}),d[r.NODE]=!0;var ge=t.touchData.dragDelta;e.is.number(ge[0])&&e.is.number(ge[1])&&(ve.x+=ge[0],ve.y+=ge[1])}}}var ye=new e.Collection(s,pe);ye.updateCompoundBounds(),ye.trigger("position drag"),t.hoverData.draggingEles=!0,d[r.DRAG]=!0,t.touchData.startPosition[0]==u[0]&&t.touchData.startPosition[1]==u[1]&&(d[r.NODE]=!0),t.redraw()}else{var ge=t.touchData.dragDelta=t.touchData.dragDelta||[];0===ge.length?(ge.push(_[0]),ge.push(_[1])):(ge[0]+=_[0],ge[1]+=_[1])}null!=ce&&(ce.trigger(new e.Event(i,{type:"touchmove",cyPosition:{x:l[0],y:l[1]}})),ce.trigger(new e.Event(i,{type:"tapdrag",cyPosition:{x:l[0],y:l[1]}})),ce.trigger(new e.Event(i,{type:"vmousemove",cyPosition:{x:l[0],y:l[1]}}))),null==ce&&(null!=$&&($.trigger(new e.Event(i,{type:"touchmove",cyPosition:{x:l[0],y:l[1]}})),$.trigger(new e.Event(i,{type:"tapdrag",cyPosition:{x:l[0],y:l[1]}})),$.trigger(new e.Event(i,{type:"vmousemove",cyPosition:{x:l[0],y:l[1]}}))),null==$&&(s.trigger(new e.Event(i,{type:"touchmove",cyPosition:{x:l[0],y:l[1]}})),s.trigger(new e.Event(i,{type:"tapdrag",cyPosition:{x:l[0],y:l[1]}})),s.trigger(new e.Event(i,{type:"vmousemove",cyPosition:{x:l[0],y:l[1]}})))),$!=de&&(de&&de.trigger(new e.Event(i,{type:"tapdragout",cyPosition:{x:l[0],y:l[1]}})),$&&$.trigger(new e.Event(i,{type:"tapdragover",cyPosition:{x:l[0],y:l[1]}}))),t.touchData.last=$;for(var H=0;H<l.length;H++)l[H]&&t.touchData.startPosition[H]&&Math.abs(l[H]-t.touchData.startPosition[H])>4&&(t.touchData.singleTouchMoved=!0);if(o&&(null==ce||ce.isEdge())&&s.panningEnabled()&&s.userPanningEnabled()){t.swipePanning?s.panBy({x:_[0]*c,y:_[1]*c}):I>=t.touchTapThreshold2&&(t.swipePanning=!0,s.panBy({x:P*c,y:M*c})),ce&&(ce.unactivate(),t.data.bgActivePosistion||(t.data.bgActivePosistion={x:l[0],y:l[1]}),d[r.SELECT_BOX]=!0,t.touchData.start=null);var m=t.projectIntoViewport(i.touches[0].clientX,i.touches[0].clientY);l[0]=m[0],l[1]=m[1]}}for(var E=0;E<l.length;E++)u[E]=l[E]},1e3/30,{trailing:!0}),!1),t.registerBinding(window,"touchcancel",function(e){var r=t.touchData.start;t.touchData.capture=!1,r&&r.unactivate()}),t.registerBinding(window,"touchend",function(i){var n=t.touchData.start,a=t.touchData.capture;if(a){t.touchData.capture=!1,i.preventDefault();var s=t.data.select;t.swipePanning=!1,t.hoverData.draggingEles=!1;var l=t.data.cy,u=l.zoom(),c=t.touchData.now,d=t.touchData.earlier,h=t.data.canvasNeedsRedraw;if(i.touches[0]){var p=t.projectIntoViewport(i.touches[0].clientX,i.touches[0].clientY);c[0]=p[0],c[1]=p[1]}if(i.touches[1]){var p=t.projectIntoViewport(i.touches[1].clientX,i.touches[1].clientY);c[2]=p[0],c[3]=p[1]}if(i.touches[2]){var p=t.projectIntoViewport(i.touches[2].clientX,i.touches[2].clientY);c[4]=p[0],c[5]=p[1]}n&&n.unactivate();var v;if(t.touchData.cxt){if(v=new e.Event(i,{type:"cxttapend",cyPosition:{x:c[0],y:c[1]}}),n?n.trigger(v):l.trigger(v),!t.touchData.cxtDragged){var f=new e.Event(i,{type:"cxttap",cyPosition:{x:c[0],y:c[1]}});n?n.trigger(f):l.trigger(f)}return t.touchData.start&&(t.touchData.start._private.grabbed=!1),t.touchData.cxt=!1,t.touchData.start=null,void t.redraw()}if(!i.touches[2]&&l.boxSelectionEnabled()&&t.touchData.selecting){t.touchData.selecting=!1,clearTimeout(this.threeFingerSelectTimeout);var g=[],y=t.getAllInBox(s[0],s[1],s[2],s[3]);s[0]=void 0,s[1]=void 0,s[2]=void 0,s[3]=void 0,s[4]=0,h[r.SELECT_BOX]=!0;for(var m=0;m<y.length;m++)y[m]._private.selectable&&g.push(y[m]);var x=new e.Collection(l,g);"single"===l.selectionType()&&l.$(":selected").unmerge(x).unselect(),x.select(),x.length>0?h[r.NODE]=!0:t.redraw()}var b=!1;if(null!=n&&(n._private.active=!1,b=!0,n.unactivate()),i.touches[2])t.data.bgActivePosistion=void 0,h[r.SELECT_BOX]=!0;else if(i.touches[1]);else if(i.touches[0]);else if(!i.touches[0]){t.data.bgActivePosistion=void 0,h[r.SELECT_BOX]=!0;var w=t.dragData.touchDragEles;if(null!=n){var _=n._private.grabbed;o(w),h[r.DRAG]=!0,h[r.NODE]=!0,_&&n.trigger("free"),n.trigger(new e.Event(i,{type:"touchend",cyPosition:{x:c[0],y:c[1]}})).trigger(new e.Event(i,{type:"tapend",cyPosition:{x:c[0],y:c[1]}})).trigger(new e.Event(i,{type:"vmouseup",cyPosition:{x:c[0],y:c[1]}})),n.unactivate(),t.touchData.start=null}else{var E=t.findNearestElement(c[0],c[1],!0,!0);null!=E&&E.trigger(new e.Event(i,{type:"touchend",cyPosition:{x:c[0],y:c[1]}})).trigger(new e.Event(i,{type:"tapend",cyPosition:{x:c[0],y:c[1]}})).trigger(new e.Event(i,{type:"vmouseup",cyPosition:{x:c[0],y:c[1]}})),null==E&&l.trigger(new e.Event(i,{type:"touchend",cyPosition:{x:c[0],y:c[1]}})).trigger(new e.Event(i,{type:"tapend",cyPosition:{x:c[0],y:c[1]}})).trigger(new e.Event(i,{type:"vmouseup",cyPosition:{x:c[0],y:c[1]}}))}var S=t.touchData.startPosition[0]-c[0],D=S*S,k=t.touchData.startPosition[1]-c[1],T=k*k,P=D+T,C=P*u*u;null!=n&&!t.dragData.didDrag&&n._private.selectable&&C<t.touchTapThreshold2&&!t.pinching&&("single"===l.selectionType()?(l.$(":selected").unmerge(n).unselect(),n.select()):n.selected()?n.unselect():n.select(),b=!0,h[r.NODE]=!0),t.touchData.singleTouchMoved===!1&&(n?n.trigger(new e.Event(i,{type:"tap",cyPosition:{x:c[0],y:c[1]}})).trigger(new e.Event(i,{type:"vclick",cyPosition:{x:c[0],y:c[1]}})):l.trigger(new e.Event(i,{type:"tap",cyPosition:{x:c[0],y:c[1]}})).trigger(new e.Event(i,{type:"vclick",cyPosition:{x:c[0],y:c[1]}}))),t.touchData.singleTouchMoved=!0}for(var M=0;M<c.length;M++)d[M]=c[M];t.dragData.didDrag=!1,0===i.touches.length&&(t.touchData.dragDelta=[]),b&&n&&n.updateStyle(!1),i.touches.length<2&&(t.pinching=!1,h[r.NODE]=!0,t.redraw())}},!1)}}(cytoscape),function(e){"use strict";function t(t,r){a[t]={points:r,draw:function(e,r,n,o,s){i.drawPolygon(e,r,n,o,s,a[t].points)},drawPath:function(e,r,n,o,s){i.drawPolygonPath(e,r,n,o,s,a[t].points)},intersectLine:function(r,i,n,o,s,l,u){return e.math.polygonIntersectLine(s,l,a[t].points,r,i,n/2,o/2,u)},intersectBox:function(r,i,n,o,s,l,u,c,d){var h=a[t].points;return e.math.boxIntersectPolygon(r,i,n,o,h,s,l,u,c,[0,-1],d)},checkPoint:function(r,i,n,o,s,l,u){return e.math.pointInsidePolygon(r,i,a[t].points,l,u,o,s,[0,-1],n)}}}for(var r=e("renderer","canvas"),i=r.prototype,n=r.usePaths(),a=r.nodeShapes={},o=Math.sin(0),s=Math.cos(0),l={},u={},c=.1,d=0*Math.PI;d<2*Math.PI;d+=c)l[d]=Math.sin(d),u[d]=Math.cos(d);a.ellipse={draw:function(e,t,r,i,n){a.ellipse.drawPath(e,t,r,i,n),e.fill()},drawPath:function(e,t,r,i,a){if(n){e.beginPath&&e.beginPath();for(var d,h,p=i/2,v=a/2,f=0*Math.PI;f<2*Math.PI;f+=c)d=t-p*l[f]*o+p*u[f]*s,h=r+v*u[f]*o+v*l[f]*s,0===f?e.moveTo(d,h):e.lineTo(d,h);e.closePath()}else e.beginPath&&e.beginPath(),e.translate(t,r),e.scale(i/2,a/2),e.arc(0,0,1,0,2*Math.PI*.999,!1),e.closePath(),e.scale(2/i,2/a),e.translate(-t,-r)},intersectLine:function(t,r,i,n,a,o,s){var l=e.math.intersectLineEllipse(a,o,t,r,i/2+s,n/2+s);return l},intersectBox:function(t,r,i,n,a,o,s,l,u){return e.math.boxIntersectEllipse(t,r,i,n,u,a,o,s,l)},checkPoint:function(e,t,r,i,n,a,o){return e-=a,t-=o,e/=i/2+r,t/=n/2+r,Math.pow(e,2)+Math.pow(t,2)<=1}},t("triangle",e.math.generateUnitNgonPointsFitToSquare(3,0)),t("square",e.math.generateUnitNgonPointsFitToSquare(4,0)),a.rectangle=a.square,a.roundrectangle={points:e.math.generateUnitNgonPointsFitToSquare(4,0),draw:function(e,t,r,n,a){i.drawRoundRectangle(e,t,r,n,a,10)},drawPath:function(e,t,r,n,a){i.drawRoundRectanglePath(e,t,r,n,a,10)},intersectLine:function(t,r,i,n,a,o,s){return e.math.roundRectangleIntersectLine(a,o,t,r,i,n,s)},intersectBox:function(t,r,i,n,a,o,s,l,u){return e.math.roundRectangleIntersectBox(t,r,i,n,a,o,s,l,u)},checkPoint:function(t,r,i,n,o,s,l){var u=e.math.getRoundRectangleRadius(n,o);if(e.math.pointInsidePolygon(t,r,a.roundrectangle.points,s,l,n,o-2*u,[0,-1],i))return!0;if(e.math.pointInsidePolygon(t,r,a.roundrectangle.points,s,l,n-2*u,o,[0,-1],i))return!0;var c=function(e,t,r,i,n,a,o){return e-=r,t-=i,e/=n/2+o,t/=a/2+o,Math.pow(e,2)+Math.pow(t,2)<=1};return c(t,r,s-n/2+u,l-o/2+u,2*u,2*u,i)?!0:c(t,r,s+n/2-u,l-o/2+u,2*u,2*u,i)?!0:c(t,r,s+n/2-u,l+o/2-u,2*u,2*u,i)?!0:c(t,r,s-n/2+u,l+o/2-u,2*u,2*u,i)?!0:!1}},t("diamond",[0,1,1,0,0,-1,-1,0]),t("pentagon",e.math.generateUnitNgonPointsFitToSquare(5,0)),t("hexagon",e.math.generateUnitNgonPointsFitToSquare(6,0)),t("heptagon",e.math.generateUnitNgonPointsFitToSquare(7,0)),t("octagon",e.math.generateUnitNgonPointsFitToSquare(8,0));var h=new Array(20),p=e.math.generateUnitNgonPoints(5,0),v=e.math.generateUnitNgonPoints(5,Math.PI/5),f=.5*(3-Math.sqrt(5));f*=1.57;for(var d=0;d<v.length/2;d++)v[2*d]*=f,v[2*d+1]*=f;for(var d=0;5>d;d++)h[4*d]=p[2*d],h[4*d+1]=p[2*d+1],h[4*d+2]=v[2*d],h[4*d+3]=v[2*d+1];h=e.math.fitPolygonToSquare(h),t("star",h),t("vee",[-1,-1,0,-.333,1,-1,0,1]),t("rhomboid",[-1,-1,.333,-1,1,1,-.333,1])}(cytoscape),function(e){"use strict";function t(t){this._private={},this._private.options=e.util.extend({},r,t)}var r={animate:!0,maxSimulationTime:4e3,fit:!0,padding:30,boundingBox:void 0,ungrabifyWhileSimulating:!1,ready:void 0,stop:void 0,repulsion:void 0,stiffness:void 0,friction:void 0,gravity:!0,fps:void 0,precision:void 0,nodeMass:void 0,edgeLength:void 0,stepSize:.1,stableEnergy:function(e){var t=e;return t.max<=.5||t.mean<=.3},infinite:!1};t.prototype.run=function(){var t=this,r=this._private.options;return e.util.require("arbor",function(i){function n(e,t){return null==t?void 0:"function"==typeof t?t.apply(e,[e._private.data,{nodes:u.length,edges:c.length,element:e}]):t}function a(e){if(!e.isFullAutoParent()){var t=e._private.data.id,i=n(e,r.nodeMass),a=e._private.locked,o=e.position(),s=p.fromScreen({x:o.x,y:o.y});e.scratch().arbor=p.addNode(t,{element:e,mass:i,fixed:a,x:a&&s?s.x:void 0,y:a&&s?s.y:void 0})}}function o(e){var t=e.source().id(),i=e.target().id(),a=n(e,r.edgeLength);e.scratch().arbor=p.addEdge(t,i,{length:a})}var s=r.cy,l=r.eles,u=l.nodes().not(":parent"),c=l.edges(),d=e.util.makeBoundingBox(r.boundingBox?r.boundingBox:{x1:0,y1:0,w:s.width(),h:s.height()}),h=!1;if(t.trigger({type:"layoutstart",layout:t}),void 0!==r.liveUpdate&&(r.animate=r.liveUpdate),l.nodes().size()<=1)return r.fit&&s.reset(),l.nodes().position({x:Math.round((d.x1+d.x2)/2),y:Math.round((d.y1+d.y2)/2)}),t.one("layoutready",r.ready),t.trigger({type:"layoutready",layout:t}),t.one("layoutstop",r.stop),void t.trigger({type:"layoutstop",layout:t});var p=t._private.system=i.ParticleSystem();p.parameters({repulsion:r.repulsion,stiffness:r.stiffness,friction:r.friction,gravity:r.gravity,fps:r.fps,dt:r.dt,precision:r.precision}),r.animate&&r.fit&&s.fit(d,r.padding);var v,f=250,g=!1,y=+new Date,m={init:function(e){},redraw:function(){var e=p.energy();if(!r.infinite&&null!=r.stableEnergy&&null!=e&&e.n>0&&r.stableEnergy(e))return void t.stop();r.infinite||f==1/0||(clearTimeout(v),v=setTimeout(D,f));var i=s.collection();p.eachNode(function(e,t){var r=e.data,n=r.element;null!=n&&(n.locked()||n.grabbed()||(n.silentPosition({x:d.x1+t.x,y:d.y1+t.y}),i.merge(n)))}),r.animate&&i.length>0&&(h=!0,i.rtrigger("position"),r.fit&&s.fit(r.padding),y=+new Date,h=!1),g||(g=!0,t.one("layoutready",r.ready),t.trigger({type:"layoutready",layout:t}))}};p.renderer=m,p.screenSize(d.w,d.h),p.screenPadding(r.padding,r.padding,r.padding,r.padding),p.screenStep(r.stepSize);var x;u.on("grab free position",x=function(e){if(!h){var t=this.position(),n=p.fromScreen(t);if(n){var a=i.Point(n.x,n.y),o=r.padding;switch(d.x1+o<=t.x&&t.x<=d.x2-o&&d.y1+o<=t.y&&t.y<=d.y2-o&&(this.scratch().arbor.p=a),e.type){case"grab":this.scratch().arbor.fixed=!0;break;case"free":this.scratch().arbor.fixed=!1}}}});var b;u.on("lock unlock",b=function(e){node.scratch().arbor.fixed=node.locked()});var w;l.on("remove",w=function(e){});var _;s.on("add","*",_=function(){});var E;s.on("resize",E=function(){if(null==r.boundingBox&&null!=t._private.system){var e=s.width(),i=s.height();p.screenSize(e,i)}}),u.each(function(e,t){a(t)}),c.each(function(e,t){o(t)});var S=u.filter(":grabbable");r.ungrabifyWhileSimulating&&S.ungrabify();var D=t._private.doneHandler=function(){t._private.doneHandler=null,r.animate||(r.fit&&s.reset(),u.rtrigger("position")),u.off("grab free position",x),u.off("lock unlock",b),l.off("remove",w),s.off("add","*",_),s.off("resize",E),r.ungrabifyWhileSimulating&&S.grabify(),t.one("layoutstop",r.stop),t.trigger({type:"layoutstop",layout:t})};p.start(),!r.infinite&&null!=r.maxSimulationTime&&r.maxSimulationTime>0&&r.maxSimulationTime!==1/0&&setTimeout(function(){t.stop()},r.maxSimulationTime)}),this},t.prototype.stop=function(){return null!=this._private.system&&this._private.system.stop(),this._private.doneHandler&&this._private.doneHandler(),this},e("layout","arbor",t)}(cytoscape),function(e){"use strict";function t(t){this.options=e.util.extend({},r,t)}var r={fit:!0,directed:!1,padding:30,circle:!1,spacingFactor:1.75,boundingBox:void 0,avoidOverlap:!0,roots:void 0,maximalAdjustments:0,animate:!1,animationDuration:500,ready:void 0,stop:void 0};t.prototype.run=function(){var t,r=this.options,i=r,n=r.cy,a=i.eles,o=a.nodes().not(":parent"),s=a,l=e.util.makeBoundingBox(i.boundingBox?i.boundingBox:{x1:0,y1:0,w:n.width(),h:n.height()});if(e.is.elementOrCollection(i.roots))t=i.roots;else if(e.is.array(i.roots)){for(var u=[],c=0;c<i.roots.length;c++){var d=i.roots[c],h=n.getElementById(d);u.push(h)}t=new e.Collection(n,u)}else if(e.is.string(i.roots))t=n.$(i.roots);else if(i.directed)t=o.roots();else{for(var p=[],v=o;v.length>0;){var f=n.collection();a.bfs({roots:v[0],visit:function(e,t,r,i,n){f=f.add(r)},directed:!1}),v=v.not(f),p.push(f)}t=n.collection();for(var c=0;c<p.length;c++){var g=p[c],y=g.maxDegree(!1),m=g.filter(function(){return this.degree(!1)===y});t=t.add(m)}}var x=[],b={},w={},_={},E={},S={};s.bfs({roots:t,directed:i.directed,visit:function(e,t,r,i,n){var a=this[0],o=a.id();if(x[t]||(x[t]=[]),x[t].push(a),b[o]=!0,w[o]=t,_[o]=n,E[o]=i,n){var s=n.id(),l=S[s]=S[s]||[];l.push(r)}}});for(var D=[],c=0;c<o.length;c++){var h=o[c];b[h.id()]||D.push(h)}for(var k=3*D.length,T=0;0!==D.length&&k>T;){for(var P=D.shift(),C=P.neighborhood().nodes(),M=!1,c=0;c<C.length;c++){var B=w[C[c].id()];if(void 0!==B){x[B].push(P),M=!0;break}}M||D.push(P),T++}for(;0!==D.length;){var P=D.shift(),M=!1;M||(0===x.length&&x.push([]),x[0].push(P))}var N=function(){for(var e=0;e<x.length;e++)for(var t=x[e],r=0;r<t.length;r++){var i=t[r];i._private.scratch.breadthfirst={depth:e,index:r}}};N();for(var I=function(e){for(var t,r=e.connectedEdges(function(){return this.data("target")===e.id()}),i=e._private.scratch.breadthfirst,n=0,a=0;a<r.length;a++){var o=r[a],s=o.source()[0],l=s._private.scratch.breadthfirst;i.depth<=l.depth&&n<l.depth&&(n=l.depth,t=s)}return t},O=0;O<i.maximalAdjustments;O++){for(var z=x.length,L=[],c=0;z>c;c++)for(var B=x[c],R=B.length,V=0;R>V;V++){var h=B[V],A=h._private.scratch.breadthfirst,X=I(h);X&&(A.intEle=X,L.push(h))}for(var c=0;c<L.length;c++){var h=L[c],A=h._private.scratch.breadthfirst,X=A.intEle,F=X._private.scratch.breadthfirst;x[A.depth].splice(A.index,1);for(var Y=F.depth+1;Y>x.length-1;)x.push([]);x[Y].push(h),A.depth=Y,A.index=x[Y].length-1}N()}var q=0;if(i.avoidOverlap){for(var c=0;c<o.length;c++){var j=o[c].outerWidth(),$=o[c].outerHeight();q=Math.max(q,j,$)}q*=i.spacingFactor}for(var W={},H=function(e){if(W[e.id()])return W[e.id()];for(var t=e._private.scratch.breadthfirst.depth,r=e.neighborhood().nodes().not(":parent"),i=0,n=0,a=0;a<r.length;a++){var o=r[a],s=o._private.scratch.breadthfirst,l=s.index,u=s.depth,c=x[u].length;(t>u||0===t)&&(i+=l/c,n++)}return n=Math.max(1,n),i/=n,0===n&&(i=void 0),W[e.id()]=i,i},Z=function(e,t){var r=H(e),i=H(t);return r-i},U=0;3>U;U++){for(var c=0;c<x.length;c++)x[c]=x[c].sort(Z);N()}for(var G=0,c=0;c<x.length;c++)G=Math.max(x[c].length,G);for(var K={x:l.x1+l.w/2,y:l.x1+l.h/2},J=function(e,t){var r=e._private.scratch.breadthfirst,n=r.depth,a=r.index,o=x[n].length,s=Math.max(l.w/(o+1),q),u=Math.max(l.h/(x.length+1),q),c=Math.min(l.w/2/x.length,l.h/2/x.length);if(c=Math.max(c,q),i.circle){if(i.circle){var d=c*n+c-(x.length>0&&x[0].length<=3?c/2:0),h=2*Math.PI/x[n].length*a;return 0===n&&1===x[0].length&&(d=1),{x:K.x+d*Math.cos(h),y:K.y+d*Math.sin(h)}}return{x:K.x+(a+1-(o+1)/2)*s,y:(n+1)*u}}var p={x:K.x+(a+1-(o+1)/2)*s,y:(n+1)*u};return t?p:p},Q={},c=x.length-1;c>=0;c--)for(var B=x[c],V=0;V<B.length;V++){var P=B[V];Q[P.id()]=J(P,c===x.length-1)}return o.layoutPositions(this,i,function(){return Q[this.id()]}),this},e("layout","breadthfirst",t)}(cytoscape),function(e){"use strict";function t(t){this.options=e.util.extend({},r,t)}var r={fit:!0,padding:30,boundingBox:void 0,avoidOverlap:!0,radius:void 0,startAngle:1.5*Math.PI,counterclockwise:!1,sort:void 0,animate:!1,animationDuration:500,ready:void 0,stop:void 0};t.prototype.run=function(){var t=this.options,r=t,i=t.cy,n=r.eles,a=n.nodes().not(":parent");r.sort&&(a=a.sort(r.sort));for(var o,s=e.util.makeBoundingBox(r.boundingBox?r.boundingBox:{x1:0,y1:0,w:i.width(),h:i.height()}),l={x:s.x1+s.w/2,y:s.y1+s.h/2},u=r.startAngle,c=2*Math.PI/a.length,d=0,h=0;h<a.length;h++){var p=a[h].outerWidth(),v=a[h].outerHeight();d=Math.max(d,p,v)}if(o=e.is.number(r.radius)?r.radius:a.length<=1?0:Math.min(s.h,s.w)/2-d,a.length>1&&r.avoidOverlap){d*=1.75;var c=2*Math.PI/a.length,f=Math.cos(c)-Math.cos(0),g=Math.sin(c)-Math.sin(0),y=Math.sqrt(d*d/(f*f+g*g));o=Math.max(y,o)}var m=function(e,t){var i=o*Math.cos(u),n=o*Math.sin(u),a={x:l.x+i,y:l.y+n};return u=r.counterclockwise?u-c:u+c,a};return a.layoutPositions(this,r,m),this},e("layout","circle",t)}(cytoscape),function(e){"use strict";function t(t){this.options=e.util.extend(!0,{},r,t)}var r={animate:!0,refresh:1,maxSimulationTime:4e3,ungrabifyWhileSimulating:!1,fit:!0,padding:30,boundingBox:void 0,ready:function(){},stop:function(){},randomize:!1,avoidOverlap:!0,handleDisconnected:!0,nodeSpacing:function(e){return 10},flow:void 0,alignment:void 0,edgeLength:void 0,edgeSymDiffLength:void 0,edgeJaccardLength:void 0,unconstrIter:void 0,userConstIter:void 0,allConstIter:void 0,infinite:!1};t.prototype.run=function(){var t=this,r=this.options;return t.manuallyStopped=!1,e.util.require("cola",function(i){var n=r.cy,a=r.eles,o=a.nodes(),s=a.edges(),l=!1,u=e.util.makeBoundingBox(r.boundingBox?r.boundingBox:{x1:0,y1:0,w:n.width(),h:n.height()}),c=function(t,r){if(e.is.fn(t)){var i=t;return i.apply(r,[r])}return t},d=function(){for(var t={min:1/0,max:-(1/0)},i={min:1/0,max:-(1/0)},a=0;a<o.length;a++){var s=o[a],d=s._private.scratch.cola;if(t.min=Math.min(t.min,d.x||0),t.max=Math.max(t.max,d.x||0),i.min=Math.min(i.min,d.y||0),i.max=Math.max(i.max,d.y||0),!d.updatedDims){var h=s.boundingBox(),v=c(r.nodeSpacing,s);d.width=h.w+2*v,d.height=h.h+2*v}}o.positions(function(r,n){var a,o=n._private.scratch.cola;return n.grabbed()||n.isParent()||(a={x:u.x1+o.x-t.min,y:u.y1+o.y-i.min},e.is.number(a.x)&&e.is.number(a.y)||(a=void 0)),a}),o.updateCompoundBounds(),l||(p(),l=!0),r.fit&&n.fit(r.padding)},h=function(){r.ungrabifyWhileSimulating&&y.grabify(),o.off("grab free position",m),o.off("lock unlock",x),t.one("layoutstop",r.stop),t.trigger({type:"layoutstop",layout:t})},p=function(){t.one("layoutready",r.ready),t.trigger({type:"layoutready",layout:t})},v=r.refresh,f=1;r.refresh<0?(f=Math.abs(r.refresh),v=1):v=Math.max(1,v);var g=t.adaptor=i.adaptor({trigger:function(e){var t=i.EventType?i.EventType.tick:null,n=i.EventType?i.EventType.end:null;switch(e.type){case"tick":case t:r.animate&&d();break;case"end":case n:d(),r.infinite||h()}},kick:function(){var i=function(){if(t.manuallyStopped)return h(),!0;var e=g.tick();return e&&r.infinite&&g.resume(),e},n=function(){for(var e,t=0;v>t&&!e;t++)e=e||i();return e};if(r.animate){var a=function(){n()||e.util.requestAnimationFrame(a)};e.util.requestAnimationFrame(a)}else for(;!i(););},on:function(e,t){},drag:function(){}});t.adaptor=g;var y=o.filter(":grabbable");r.ungrabifyWhileSimulating&&y.ungrabify();var m;o.on("grab free position",m=function(e){var t=this,r=t._private.scratch.cola,i=t._private.position;switch(r.x=i.x-u.x1,r.y=i.y-u.y1,e.type){case"grab":g.dragstart(r),g.resume();break;case"free":g.dragend(r)}});var x;o.on("lock unlock",x=function(e){var t=this,r=t._private.scratch.cola;t.locked()?g.dragstart(r):g.dragend(r)});var b=o.stdFilter(function(e){return!e.isParent()});if(g.nodes(b.map(function(e,t){var i=c(r.nodeSpacing,e),n=e.position(),a=e.boundingBox(),o=e._private.scratch.cola={x:r.randomize||void 0===n.x?Math.round(Math.random()*u.w):n.x,y:r.randomize||void 0===n.y?Math.round(Math.random()*u.h):n.y,width:a.w+2*i,height:a.h+2*i,index:t};return o})),r.alignment){var w=[],_=[];b.forEach(function(e){var t=c(r.alignment,e),i=e._private.scratch.cola,n=i.index;t&&(null!=t.x&&w.push({node:n,offset:t.x}),null!=t.y&&_.push({node:n,offset:t.y}))});var E=[];w.length>0&&E.push({type:"alignment",axis:"x",offsets:w}),_.length>0&&E.push({type:"alignment",axis:"y",offsets:_}),g.constraints(E)}g.groups(o.stdFilter(function(e){return e.isParent()}).map(function(e,t){var i=e._private.style,n=c(r.nodeSpacing,e),a=i["padding-left"].pxValue+n,o=i["padding-right"].pxValue+n,s=i["padding-top"].pxValue+n,l=i["padding-bottom"].pxValue+n;return e._private.scratch.cola={index:t,padding:Math.max(a,o,s,l),leaves:e.descendants().stdFilter(function(e){return!e.isParent()}).map(function(e){return e[0]._private.scratch.cola.index})},e}).map(function(e){return e._private.scratch.cola.groups=e.descendants().stdFilter(function(e){return e.isParent()}).map(function(e){return e._private.scratch.cola.index}),e._private.scratch.cola}));var S,D;null!=r.edgeLength?(S=r.edgeLength,D="linkDistance"):null!=r.edgeSymDiffLength?(S=r.edgeSymDiffLength,D="symmetricDiffLinkLengths"):null!=r.edgeJaccardLength?(S=r.edgeJaccardLength,D="jaccardLinkLengths"):(S=100,D="linkDistance");var k=function(e){return e.calcLength};if(g.links(s.stdFilter(function(e){return!e.source().isParent()&&!e.target().isParent()}).map(function(e,t){var r=e._private.scratch.cola={source:e.source()[0]._private.scratch.cola.index,target:e.target()[0]._private.scratch.cola.index};return null!=S&&(r.calcLength=c(S,e)),r})),g.size([u.w,u.h]),null!=S&&g[D](k),r.flow){var T,P="y",C=50;e.is.string(r.flow)?T={axis:r.flow,minSeparation:C}:e.is.number(r.flow)?T={axis:P,minSeparation:r.flow}:e.is.plainObject(r.flow)?(T=r.flow,T.axis=T.axis||P,T.minSeparation=null!=T.minSeparation?T.minSeparation:C):T={axis:P,minSeparation:C},g.flowLayout(T.axis,T.minSeparation)}t.trigger({type:"layoutstart",layout:t}),g.avoidOverlaps(r.avoidOverlap).handleDisconnected(r.handleDisconnected).start(r.unconstrIter,r.userConstIter,r.allConstIter),r.infinite||setTimeout(function(){t.manuallyStopped||g.stop()},r.maxSimulationTime)}),this},t.prototype.stop=function(){return this.adaptor&&(this.manuallyStopped=!0,this.adaptor.stop()),this},e("layout","cola",t)}(cytoscape),function(e){"use strict";function t(t){this.options=e.util.extend({},r,t)}var r={fit:!0,padding:30,startAngle:1.5*Math.PI,counterclockwise:!1,minNodeSpacing:10,boundingBox:void 0,avoidOverlap:!0,height:void 0,width:void 0,concentric:function(e){return e.degree();

},levelWidth:function(e){return e.maxDegree()/4},animate:!1,animationDuration:500,ready:void 0,stop:void 0};t.prototype.run=function(){for(var t=this.options,r=t,i=t.cy,n=r.eles,a=n.nodes().not(":parent"),o=e.util.makeBoundingBox(r.boundingBox?r.boundingBox:{x1:0,y1:0,w:i.width(),h:i.height()}),s={x:o.x1+o.w/2,y:o.y1+o.h/2},l=[],u=r.startAngle,c=0,d=0;d<a.length;d++){var h,p=a[d];h=r.concentric.apply(p,[p]),l.push({value:h,node:p}),p._private.scratch.concentric=h}a.updateStyle();for(var d=0;d<a.length;d++){var p=a[d];c=Math.max(c,p.outerWidth(),p.outerHeight())}l.sort(function(e,t){return t.value-e.value});for(var v=r.levelWidth(a),f=[[]],g=f[0],d=0;d<l.length;d++){var y=l[d];if(g.length>0){var m=Math.abs(g[0].value-y.value);m>=v&&(g=[],f.push(g))}g.push(y)}var x={},b=0,w=c+r.minNodeSpacing;if(!r.avoidOverlap){var _=f.length>0&&f[0].length>1,E=Math.min(o.w,o.h)/2-w,S=E/(f.length+_?1:0);w=Math.min(w,S)}for(var d=0;d<f.length;d++){var D=f[d],k=2*Math.PI/D.length;if(D.length>1&&r.avoidOverlap){var T=Math.cos(k)-Math.cos(0),P=Math.sin(k)-Math.sin(0),C=Math.sqrt(w*w/(T*T+P*P));b=Math.max(C,b)}for(var M=0;M<D.length;M++){var y=D[M],u=r.startAngle+(r.counterclockwise?-1:1)*k*M,B={x:s.x+b*Math.cos(u),y:s.y+b*Math.sin(u)};x[y.node.id()]=B}b+=w}return a.layoutPositions(this,r,function(){var e=this.id();return x[e]}),this},e("layout","concentric",t)}(cytoscape),function(e){"use strict";function t(t){this.options=e.util.extend({},i,t)}var r,i={ready:function(){},stop:function(){},animate:!0,refresh:4,fit:!0,padding:30,boundingBox:void 0,randomize:!0,debug:!1,nodeRepulsion:4e5,nodeOverlap:10,idealEdgeLength:10,edgeElasticity:100,nestingFactor:5,gravity:250,numIter:100,initialTemp:200,coolingFactor:.95,minTemp:1};t.prototype.run=function(){var t=this.options,i=t.cy,a=this;a.stopped=!1,a.trigger({type:"layoutstart",layout:a}),r=!0===t.debug?!0:!1;var o=new Date,d=n(i,a,t);r&&s(d),!0===t.randomize&&l(d,i),m(d,i,t);var h=function(e){return a.stopped?!1:(c(d,i,t,e),d.temperature=d.temperature*t.coolingFactor,d.temperature<t.minTemp?!1:!0)},p=function(){u(d,i,t),!0===t.fit&&i.fit(t.padding);var e=new Date;console.info("Layout took "+(e-o)+" ms"),a.one("layoutstop",t.stop),a.trigger({type:"layoutstop",layout:a})};if(t.animate){var v=0,f=function(){for(var r,n=0;n<t.refresh&&v<t.numIter;){var r=h(v);if(r===!1)break;n++,v++}u(d,i,t),t.fit&&i.fit(t.padding),r!==!1&&v+1<t.numIter?e.util.requestAnimationFrame(f):p()};e.util.requestAnimationFrame(f)}else{for(var v=0;v<t.numIter&&h(v)!==!1;v++);p()}return this},t.prototype.stop=function(){return this.stopped=!0,this};var n=function(t,r,i){for(var n=i.eles.edges(),o=i.eles.nodes(),s={layout:r,layoutNodes:[],idToIndex:{},nodeSize:o.size(),graphSet:[],indexToGraph:[],layoutEdges:[],edgeSize:n.size(),temperature:i.initialTemp,clientWidth:t.width(),clientHeight:t.width(),boundingBox:e.util.makeBoundingBox(i.boundingBox?i.boundingBox:{x1:0,y1:0,w:t.width(),h:t.height()})},l=0;l<s.nodeSize;l++){var u={};u.id=o[l].data("id"),u.parentId=o[l].data("parent"),u.children=[],u.positionX=o[l].position("x"),u.positionY=o[l].position("y"),u.offsetX=0,u.offsetY=0,u.height=o[l].height(),u.width=o[l].width(),u.maxX=u.positionX+u.width/2,u.minX=u.positionX-u.width/2,u.maxY=u.positionY+u.height/2,u.minY=u.positionY-u.height/2,u.padLeft=o[l]._private.style["padding-left"].pxValue,u.padRight=o[l]._private.style["padding-right"].pxValue,u.padTop=o[l]._private.style["padding-top"].pxValue,u.padBottom=o[l]._private.style["padding-bottom"].pxValue,s.layoutNodes.push(u),s.idToIndex[u.id]=l}for(var c=[],d=0,h=-1,p=[],l=0;l<s.nodeSize;l++){var v=s.layoutNodes[l],f=v.parentId;null!=f?s.layoutNodes[s.idToIndex[f]].children.push(v.id):(c[++h]=v.id,p.push(v.id))}for(s.graphSet.push(p);h>=d;){var g=c[d++],y=s.idToIndex[g],m=s.layoutNodes[y],x=m.children;if(x.length>0){s.graphSet.push(x);for(var l=0;l<x.length;l++)c[++h]=x[l]}}for(var l=0;l<s.graphSet.length;l++)for(var b=s.graphSet[l],w=0;w<b.length;w++){var _=s.idToIndex[b[w]];s.indexToGraph[_]=l}for(var l=0;l<s.edgeSize;l++){var E=n[l],S={};S.id=E.data("id"),S.sourceId=E.data("source"),S.targetId=E.data("target");var D=i.idealEdgeLength,k=s.idToIndex[S.sourceId],T=s.idToIndex[S.targetId],P=s.indexToGraph[k],C=s.indexToGraph[T];if(P!=C){for(var M=a(S.sourceId,S.targetId,s),B=s.graphSet[M],N=0,u=s.layoutNodes[k];-1===$.inArray(u.id,B);)u=s.layoutNodes[s.idToIndex[u.parentId]],N++;for(u=s.layoutNodes[T];-1===$.inArray(u.id,B);)u=s.layoutNodes[s.idToIndex[u.parentId]],N++;D*=N*i.nestingFactor}S.idealLength=D,s.layoutEdges.push(S)}return s},a=function(e,t,r){var i=o(e,t,0,r);return 2>i.count?0:i.graph},o=function(e,t,r,i){var n=i.graphSet[r];if(-1<$.inArray(e,n)&&-1<$.inArray(t,n))return{count:2,graph:r};for(var a=0,s=0;s<n.length;s++){var l=n[s],u=i.idToIndex[l],c=i.layoutNodes[u].children;if(0!==c.length){var d=i.indexToGraph[i.idToIndex[c[0]]],h=o(e,t,d,i);if(0!==h.count){if(1!==h.count)return h;if(a++,2===a)break}}}return{count:a,graph:r}},s=function(e){if(r){console.debug("layoutNodes:");for(var t=0;t<e.nodeSize;t++){var i=e.layoutNodes[t],n="\nindex: "+t+"\nId: "+i.id+"\nChildren: "+i.children.toString()+"\nparentId: "+i.parentId+"\npositionX: "+i.positionX+"\npositionY: "+i.positionY+"\nOffsetX: "+i.offsetX+"\nOffsetY: "+i.offsetY+"\npadLeft: "+i.padLeft+"\npadRight: "+i.padRight+"\npadTop: "+i.padTop+"\npadBottom: "+i.padBottom;console.debug(n)}console.debug("idToIndex");for(var t in e.idToIndex)console.debug("Id: "+t+"\nIndex: "+e.idToIndex[t]);console.debug("Graph Set");for(var a=e.graphSet,t=0;t<a.length;t++)console.debug("Set : "+t+": "+a[t].toString());for(var n="IndexToGraph",t=0;t<e.indexToGraph.length;t++)n+="\nIndex : "+t+" Graph: "+e.indexToGraph[t];console.debug(n),n="Layout Edges";for(var t=0;t<e.layoutEdges.length;t++){var o=e.layoutEdges[t];n+="\nEdge Index: "+t+" ID: "+o.id+" SouceID: "+o.sourceId+" TargetId: "+o.targetId+" Ideal Length: "+o.idealLength}console.debug(n),n="nodeSize: "+e.nodeSize,n+="\nedgeSize: "+e.edgeSize,n+="\ntemperature: "+e.temperature,console.debug(n)}},l=function(e,t){for(var r=e.clientWidth,i=e.clientHeight,n=0;n<e.nodeSize;n++){var a=e.layoutNodes[n];a.positionX=Math.random()*r,a.positionY=Math.random()*i}},u=function(e,t,r){var i=e.layout,n=r.eles.nodes(),a=e.boundingBox,o={x1:1/0,x2:-(1/0),y1:1/0,y2:-(1/0)};r.boundingBox&&(n.forEach(function(t){var r=e.layoutNodes[e.idToIndex[t.data("id")]];o.x1=Math.min(o.x1,r.positionX),o.x2=Math.max(o.x2,r.positionX),o.y1=Math.min(o.y1,r.positionY),o.y2=Math.max(o.y2,r.positionY)}),o.w=o.x2-o.x1,o.h=o.y2-o.y1),n.positions(function(t,i){var n=e.layoutNodes[e.idToIndex[i.data("id")]];if(r.boundingBox){var s=(n.positionX-o.x1)/o.w,l=(n.positionY-o.y1)/o.h;return{x:a.x1+s*a.w,y:a.y1+l*a.h}}return{x:n.positionX,y:n.positionY}}),!0!==e.ready&&(e.ready=!0,i.one("layoutready",r.ready),i.trigger({type:"layoutready",layout:this}))},c=function(e,t,r,i){d(e,t,r),f(e,t,r),g(e,t,r),y(e,t,r),m(e,t,r)},d=function(e,t,r){for(var i=0;i<e.graphSet.length;i++)for(var n=e.graphSet[i],a=n.length,o=0;a>o;o++)for(var s=e.layoutNodes[e.idToIndex[n[o]]],l=o+1;a>l;l++){var u=e.layoutNodes[e.idToIndex[n[l]]];h(s,u,e,t,r)}},h=function(e,t,r,i,n){var a=t.positionX-e.positionX,o=t.positionY-e.positionY;if(0!==a||0!==o){var s=v(e,t,a,o);if(s>0)var l=n.nodeOverlap*s,u=Math.sqrt(a*a+o*o),c=l*a/u,d=l*o/u;else var h=p(e,a,o),f=p(t,-1*a,-1*o),g=f.x-h.x,y=f.y-h.y,m=g*g+y*y,u=Math.sqrt(m),l=n.nodeRepulsion/m,c=l*g/u,d=l*y/u;e.offsetX-=c,e.offsetY-=d,t.offsetX+=c,t.offsetY+=d}},p=function(e,t,r){var i=e.positionX,n=e.positionY,a=e.height,o=e.width,s=r/t,l=a/o,u={};do{if(0===t&&r>0){u.x=i,u.y=n+a/2;break}if(0===t&&0>r){u.x=i,u.y=n+a/2;break}if(t>0&&s>=-1*l&&l>=s){u.x=i+o/2,u.y=n+o*r/2/t;break}if(0>t&&s>=-1*l&&l>=s){u.x=i-o/2,u.y=n-o*r/2/t;break}if(r>0&&(-1*l>=s||s>=l)){u.x=i+a*t/2/r,u.y=n+a/2;break}if(0>r&&(-1*l>=s||s>=l)){u.x=i-a*t/2/r,u.y=n-a/2;break}}while(!1);return u},v=function(e,t,r,i){if(r>0)var n=e.maxX-t.minX;else var n=t.maxX-e.minX;if(i>0)var a=e.maxY-t.minY;else var a=t.maxY-e.minY;return n>=0&&a>=0?Math.sqrt(n*n+a*a):0},f=function(e,t,r){for(var i=0;i<e.edgeSize;i++){var n=e.layoutEdges[i],a=e.idToIndex[n.sourceId],o=e.layoutNodes[a],s=e.idToIndex[n.targetId],l=e.layoutNodes[s],u=l.positionX-o.positionX,c=l.positionY-o.positionY;if(0===u&&0===c)return;var d=p(o,u,c),h=p(l,-1*u,-1*c),v=h.x-d.x,f=h.y-d.y,g=Math.sqrt(v*v+f*f),y=Math.pow(n.idealLength-g,2)/r.edgeElasticity;if(0!==g)var m=y*v/g,x=y*f/g;else var m=0,x=0;o.offsetX+=m,o.offsetY+=x,l.offsetX-=m,l.offsetY-=x}},g=function(e,t,r){for(var i=0;i<e.graphSet.length;i++){var n=e.graphSet[i],a=n.length;if(0===i)var o=e.clientHeight/2,s=e.clientWidth/2;else var l=e.layoutNodes[e.idToIndex[n[0]]],u=e.layoutNodes[e.idToIndex[l.parentId]],o=u.positionX,s=u.positionY;for(var c=0;a>c;c++){var d=e.layoutNodes[e.idToIndex[n[c]]],h=o-d.positionX,p=s-d.positionY,v=Math.sqrt(h*h+p*p);if(v>1){var f=r.gravity*h/v,g=r.gravity*p/v;d.offsetX+=f,d.offsetY+=g}}}},y=function(e,t,r){var i=[],n=0,a=-1;for(i.push.apply(i,e.graphSet[0]),a+=e.graphSet[0].length;a>=n;){var o=i[n++],s=e.idToIndex[o],l=e.layoutNodes[s],u=l.children;if(0<u.length){for(var c=l.offsetX,d=l.offsetY,h=0;h<u.length;h++){var p=e.layoutNodes[e.idToIndex[u[h]]];p.offsetX+=c,p.offsetY+=d,i[++a]=u[h]}l.offsetX=0,l.offsetY=0}}},m=function(e,t,r){for(var i=0;i<e.nodeSize;i++){var n=e.layoutNodes[i];0<n.children.length&&(n.maxX=void 0,n.minX=void 0,n.maxY=void 0,n.minY=void 0)}for(var i=0;i<e.nodeSize;i++){var n=e.layoutNodes[i];if(!(0<n.children.length)){var a=x(n.offsetX,n.offsetY,e.temperature);n.positionX+=a.x,n.positionY+=a.y,n.offsetX=0,n.offsetY=0,n.minX=n.positionX-n.width,n.maxX=n.positionX+n.width,n.minY=n.positionY-n.height,n.maxY=n.positionY+n.height,b(n,e)}}for(var i=0;i<e.nodeSize;i++){var n=e.layoutNodes[i];0<n.children.length&&(n.positionX=(n.maxX+n.minX)/2,n.positionY=(n.maxY+n.minY)/2,n.width=n.maxX-n.minX,n.height=n.maxY-n.minY)}},x=function(e,t,r){var i=Math.sqrt(e*e+t*t);if(i>r)var n={x:r*e/i,y:r*t/i};else var n={x:e,y:t};return n},b=function(e,t){var r=e.parentId;if(null!=r){var i=t.layoutNodes[t.idToIndex[r]],n=!1;return(null==i.maxX||e.maxX+i.padRight>i.maxX)&&(i.maxX=e.maxX+i.padRight,n=!0),(null==i.minX||e.minX-i.padLeft<i.minX)&&(i.minX=e.minX-i.padLeft,n=!0),(null==i.maxY||e.maxY+i.padBottom>i.maxY)&&(i.maxY=e.maxY+i.padBottom,n=!0),(null==i.minY||e.minY-i.padTop<i.minY)&&(i.minY=e.minY-i.padTop,n=!0),n?b(i,t):void 0}};e("layout","cose",t)}(cytoscape),function(e){"use strict";function t(t){this.options=e.util.extend(!0,{},r,t)}var r={nodeSep:void 0,edgeSep:void 0,rankSep:void 0,rankDir:void 0,minLen:function(e){return 1},edgeWeight:function(e){return 1},fit:!0,padding:30,animate:!1,animationDuration:500,boundingBox:void 0,ready:function(){},stop:function(){}};t.prototype.run=function(){var t=this.options,r=this;return e.util.require("dagre",function(i){var n=t.cy,a=t.eles,o=function(t,r){return e.is.fn(r)?r.apply(t,[t]):r},s=e.util.makeBoundingBox(t.boundingBox?t.boundingBox:{x1:0,y1:0,w:n.width(),h:n.height()}),l=new i.graphlib.Graph({multigraph:!0,compound:!0}),u={},c=function(e,t){null!=t&&(u[e]=t)};c("nodesep",t.nodeSep),c("edgesep",t.edgeSep),c("ranksep",t.rankSep),c("rankdir",t.rankDir),l.setGraph(u),l.setDefaultEdgeLabel(function(){return{}}),l.setDefaultNodeLabel(function(){return{}});for(var d=a.nodes(),h=0;h<d.length;h++){var p=d[h];l.setNode(p.id(),{width:p.width(),height:p.height(),name:p.id()})}for(var h=0;h<d.length;h++){var p=d[h];p.isChild()&&l.setParent(p.id(),p.parent().id())}for(var v=a.edges().stdFilter(function(e){return!e.source().isParent()&&!e.target().isParent()}),h=0;h<v.length;h++){var f=v[h];l.setEdge(f.source().id(),f.target().id(),{minlen:o(f,t.minLen),weight:o(f,t.edgeWeight),name:f.id()},f.id())}i.layout(l);for(var g=l.nodes(),h=0;h<g.length;h++){var y=g[h],m=l.node(y);n.getElementById(y).scratch().dagre=m}var x;t.boundingBox?(x={x1:1/0,x2:-(1/0),y1:1/0,y2:-(1/0)},d.forEach(function(e){var t=e.scratch().dagre;x.x1=Math.min(x.x1,t.x),x.x2=Math.max(x.x2,t.x),x.y1=Math.min(x.y1,t.y),x.y2=Math.max(x.y2,t.y)}),x.w=x.x2-x.x1,x.h=x.y2-x.y1):x=s;var b=function(e){if(t.boundingBox){var r=(e.x-x.x1)/x.w,i=(e.y-x.y1)/x.h;return{x:s.x1+r*s.w,y:s.y1+i*s.h}}return e};d.layoutPositions(r,t,function(){var e=this.scratch().dagre;return b({x:e.x,y:e.y})})}),this},e("layout","dagre",t)}(cytoscape),function(e){"use strict";function t(t){this.options=e.util.extend({},r,t)}var r={fit:!0,padding:30,boundingBox:void 0,avoidOverlap:!0,rows:void 0,columns:void 0,position:function(e){},sort:void 0,animate:!1,animationDuration:500,ready:void 0,stop:void 0};t.prototype.run=function(){var t=this.options,r=t,i=t.cy,n=r.eles,a=n.nodes().not(":parent");r.sort&&(a=a.sort(r.sort));var o=e.util.makeBoundingBox(r.boundingBox?r.boundingBox:{x1:0,y1:0,w:i.width(),h:i.height()});if(0===o.h||0===o.w)a.layoutPositions(this,r,function(){return{x:o.x1,y:o.y1}});else{var s=a.size(),l=Math.sqrt(s*o.h/o.w),u=Math.round(l),c=Math.round(o.w/o.h*l),d=function(e){if(null==e)return Math.min(u,c);var t=Math.min(u,c);t==u?u=e:c=e},h=function(e){if(null==e)return Math.max(u,c);var t=Math.max(u,c);t==u?u=e:c=e};if(null!=r.rows&&null!=r.columns)u=r.rows,c=r.columns;else if(null!=r.rows&&null==r.columns)u=r.rows,c=Math.ceil(s/u);else if(null==r.rows&&null!=r.columns)c=r.columns,u=Math.ceil(s/c);else if(c*u>s){var p=d(),v=h();(p-1)*v>=s?d(p-1):(v-1)*p>=s&&h(v-1)}else for(;s>c*u;){var p=d(),v=h();(v+1)*p>=s?h(v+1):d(p+1)}var f=o.w/c,g=o.h/u;if(r.avoidOverlap)for(var y=0;y<a.length;y++){var m=a[y],x=m.outerWidth(),b=m.outerHeight();f=Math.max(f,x),g=Math.max(g,b)}for(var w={},_=function(e,t){return w["c-"+e+"-"+t]?!0:!1},E=function(e,t){w["c-"+e+"-"+t]=!0},S=0,D=0,k=function(){D++,D>=c&&(D=0,S++)},T={},y=0;y<a.length;y++){var m=a[y],P=r.position(m);if(P&&(void 0!==P.row||void 0!==P.col)){var C={row:P.row,col:P.col};if(void 0===C.col)for(C.col=0;_(C.row,C.col);)C.col++;else if(void 0===C.row)for(C.row=0;_(C.row,C.col);)C.row++;T[m.id()]=C,E(C.row,C.col)}}var M=function(e,t){var r,i;if(t.locked()||t.isFullAutoParent())return!1;var n=T[t.id()];if(n)r=n.col*f+f/2+o.x1,i=n.row*g+g/2+o.y1;else{for(;_(S,D);)k();r=D*f+f/2+o.x1,i=S*g+g/2+o.y1,E(S,D),k()}return{x:r,y:i}};a.layoutPositions(this,r,M)}return this},e("layout","grid",t)}(cytoscape),function(e){"use strict";function t(t){this.options=e.util.extend(!0,{},r,t)}var r={ready:function(){},stop:function(){}};t.prototype.run=function(){{var e=this.options,t=e.eles,r=this;e.cy}return r.trigger("layoutstart"),t.nodes().positions(function(){return{x:0,y:0}}),r.one("layoutready",e.ready),r.trigger("layoutready"),r.one("layoutstop",e.stop),r.trigger("layoutstop"),this},t.prototype.stop=function(){return this},e("layout","null",t)}(cytoscape),function(e){"use strict";function t(t){this.options=e.util.extend(!0,{},r,t)}var r={positions:void 0,zoom:void 0,pan:void 0,fit:!0,padding:30,animate:!1,animationDuration:500,ready:void 0,stop:void 0};t.prototype.run=function(){function t(e){if(null==r.positions)return null;if(a)return r.positions.apply(e,[e]);var t=r.positions[e._private.data.id];return null==t?null:t}var r=this.options,i=r.eles,n=i.nodes(),a=e.is.fn(r.positions);return n.layoutPositions(this,r,function(e,r){var i=t(r);return r.locked()||null==i?!1:i}),this},e("layout","preset",t)}(cytoscape),function(e){"use strict";function t(t){this.options=e.util.extend(!0,{},r,t)}var r={fit:!0,padding:30,boundingBox:void 0,animate:!1,animationDuration:500,ready:void 0,stop:void 0};t.prototype.run=function(){var t=this.options,r=t.cy,i=t.eles,n=i.nodes().not(":parent"),a=e.util.makeBoundingBox(t.boundingBox?t.boundingBox:{x1:0,y1:0,w:r.width(),h:r.height()}),o=function(e,t){return{x:a.x1+Math.round(Math.random()*a.w),y:a.y1+Math.round(Math.random()*a.h)}};return n.layoutPositions(this,t,o),this},e("layout","random",t)}(cytoscape),function($$){"use strict";function SpreadLayout(e){this.options=$$.util.extend({},defaults,e)}function cellCentroid(e){for(var t,r,i,n=e.halfedges,a=0,o=0,s=0,l=0;l<n.length;++l)t=n[l].getEndpoint(),r=n[l].getStartpoint(),a+=t.x*r.y,a-=t.y*r.x,i=t.x*r.y-r.x*t.y,o+=(t.x+r.x)*i,s+=(t.y+r.y)*i;return a/=2,i=6*a,{x:o/i,y:s/i}}function sitesDistance(e,t){var r=e.x-t.x,i=e.y-t.y;return Math.sqrt(r*r+i*i)}var defaults={animate:!0,ready:void 0,stop:void 0,fit:!0,minDist:20,padding:20,expandingFactor:-1,maxFruchtermanReingoldIterations:50,maxExpandIterations:4,boundingBox:void 0};SpreadLayout.prototype.run=function(){var layout=this,options=this.options;return $$.util.requires(["foograph","Voronoi"],function(foograph,Voronoi){function setPositions(e){for(var t=e.vertices,r=[],i=0;i<t.length;++i){var n=t[i];r[n.id]={x:n.x,y:n.y}}nodes.positions(function(e,t){var i=t._private.data.id,n=r[i];return{x:Math.round(simBB.x1+n.x),y:Math.round(simBB.y1+n.y)}}),options.fit&&cy.fit(options.padding),cy.nodes().rtrigger("position")}var cy=options.cy,nodes=cy.nodes(),edges=cy.edges(),cWidth=cy.width(),cHeight=cy.height(),simulationBounds=options.boundingBox?$$.util.makeBoundingBox(options.boundingBox):null,padding=options.padding,simBBFactor=Math.max(1,.8*Math.log(nodes.length));nodes.length<100&&(simBBFactor/=2),layout.trigger({type:"layoutstart",layout:layout});var simBB={x1:0,y1:0,x2:cWidth*simBBFactor,y2:cHeight*simBBFactor};simulationBounds&&(simBB.x1=simulationBounds.x1,simBB.y1=simulationBounds.y1,simBB.x2=simulationBounds.x2,simBB.y2=simulationBounds.y2),simBB.x1+=padding,simBB.y1+=padding,simBB.x2-=padding,simBB.y2-=padding;var width=simBB.x2-simBB.x1,height=simBB.y2-simBB.y1,startTime=Date.now();if(nodes.size()<=1){nodes.positions({x:Math.round((simBB.x1+simBB.x2)/2),y:Math.round((simBB.y1+simBB.y2)/2)}),options.fit&&cy.fit(options.padding);var endTime=Date.now();return console.info("Layout on "+nodes.size()+" nodes took "+(endTime-startTime)+" ms"),layout.one("layoutready",options.ready),layout.trigger("layoutready"),layout.one("layoutstop",options.stop),void layout.trigger("layoutstop")}var pData={width:width,height:height,minDist:options.minDist,expFact:options.expandingFactor,expIt:0,maxExpIt:options.maxExpandIterations,vertices:[],edges:[],startTime:startTime,maxFruchtermanReingoldIterations:options.maxFruchtermanReingoldIterations};nodes.each(function(e,t){var r=this._private.data.id;pData.vertices.push({id:r,x:0,y:0})}),edges.each(function(){var e=this.source().id(),t=this.target().id();pData.edges.push({src:e,tgt:t})});var t1=$$.Thread();t1.require(foograph,"foograph"),t1.require(Voronoi),t1.require(sitesDistance),t1.require(cellCentroid);var didLayoutReady=!1;t1.on("message",function(e){var t=e.message;options.animate&&(setPositions(t),didLayoutReady||(layout.trigger("layoutready"),didLayoutReady=!0))}),layout.one("layoutready",options.ready),t1.pass(pData).run(function(pData){function checkMinDist(e){for(var t=0,r=0;r<e.length;++r){var i=e[r];null!=i.lSite&&null!=i.rSite&&sitesDistance(i.lSite,i.rSite)<lMinDist&&++t}return t}foograph=eval("foograph"),Voronoi=eval("Voronoi");for(var lWidth=pData.width,lHeight=pData.height,lMinDist=pData.minDist,lExpFact=pData.expFact,lMaxExpIt=pData.maxExpIt,lMaxFruchtermanReingoldIterations=pData.maxFruchtermanReingoldIterations,savePositions=function(){pData.width=lWidth,pData.height=lHeight,pData.expIt=expandIteration,pData.expFact=lExpFact,pData.vertices=[];for(var e=0;e<fv.length;++e)pData.vertices.push({id:fv[e].label,x:fv[e].x,y:fv[e].y})},messagePositions=function(){broadcast(pData)},frg=new foograph.Graph("FRgraph",!1),frgNodes={},dataVertices=pData.vertices,ni=0;ni<dataVertices.length;++ni){var id=dataVertices[ni].id,v=new foograph.Vertex(id,Math.round(Math.random()*lHeight),Math.round(Math.random()*lHeight));frgNodes[id]=v,frg.insertVertex(v)}for(var dataEdges=pData.edges,ei=0;ei<dataEdges.length;++ei){var srcNodeId=dataEdges[ei].src,tgtNodeId=dataEdges[ei].tgt;frg.insertEdge("",1,frgNodes[srcNodeId],frgNodes[tgtNodeId])}var fv=frg.vertices,iterations=lMaxFruchtermanReingoldIterations,frLayoutManager=new foograph.ForceDirectedVertexLayout(lWidth,lHeight,iterations,!1,lMinDist);frLayoutManager.callback=function(){savePositions(),messagePositions()},frLayoutManager.layout(frg),savePositions(),messagePositions();for(var voronoi=new Voronoi,bbox={xl:0,xr:lWidth,yt:0,yb:lHeight},vSites=[],i=0;i<fv.length;++i)vSites[fv[i].label]=fv[i];for(var diagram=voronoi.compute(fv,bbox),cells=diagram.cells,i=0;i<cells.length;++i){var cell=cells[i],site=cell.site,centroid=cellCentroid(cell),currv=vSites[site.label];currv.x=centroid.x,currv.y=centroid.y}0>lExpFact&&(lExpFact=Math.max(.05,Math.min(.1,lMinDist/Math.sqrt(lWidth*lHeight/fv.length)*.5)));for(var prevInfractions=checkMinDist(diagram.edges),bStop=0>=prevInfractions,voronoiIteration=0,expandIteration=0;!bStop;){++voronoiIteration;for(var it=0;4>=it;++it){voronoi.recycle(diagram),diagram=voronoi.compute(fv,bbox),cells=diagram.cells;for(var i=0;i<cells.length;++i){var cell=cells[i],site=cell.site,centroid=cellCentroid(cell),currv=vSites[site.label];currv.x=centroid.x,currv.y=centroid.y}}var currInfractions=checkMinDist(diagram.edges);0>=currInfractions?bStop=!0:(currInfractions>=prevInfractions||voronoiIteration>=4)&&(expandIteration>=lMaxExpIt?bStop=!0:(lWidth+=lWidth*lExpFact,lHeight+=lHeight*lExpFact,bbox={xl:0,xr:lWidth,yt:0,yb:lHeight},++expandIteration,voronoiIteration=0)),prevInfractions=currInfractions,savePositions(),messagePositions()}return savePositions(),pData}).then(function(e){var t=e.vertices;setPositions(e);var r=e.startTime,i=new Date;console.info("Layout on "+t.length+" nodes took "+(i-r)+" ms"),layout.one("layoutstop",options.stop),options.animate||layout.trigger("layoutready"),layout.trigger("layoutstop"),t1.stop()})}),this},SpreadLayout.prototype.stop=function(){},$$("layout","spread",SpreadLayout)}(cytoscape),function(e){"use strict";function t(t){this.options=e.util.extend(!0,{},r,t)}var r={animate:!0,maxSimulationTime:4e3,ungrabifyWhileSimulating:!1,fit:!0,padding:30,boundingBox:void 0,random:!1,infinite:!1,ready:void 0,stop:void 0,stiffness:400,repulsion:400,damping:.5};t.prototype.run=function(){var t=this,r=this,i=this.options;return e.util.require("Springy",function(n){function a(e){var t=e.scratch("springy").model.id,r=w.layout.nodePoints[t].p,i=e.position(),n=null!=i.x&&null!=i.y?y(e.position()):{x:4*Math.random()-2,y:4*Math.random()-2};r.x=n.x,r.y=n.y}function o(){r.stopped=!1,i.ungrabifyWhileSimulating&&E.ungrabify(),w.start()}var s=!1,l=i.cy;t.trigger({type:"layoutstart",layout:t});var u=i.eles,c=u.nodes().not(":parent"),d=u.edges(),h=e.util.makeBoundingBox(i.boundingBox?i.boundingBox:{x1:0,y1:0,w:l.width(),h:l.height()}),p=new n.Graph;c.each(function(e,t){t.scratch("springy",{model:p.newNode({element:t})})}),d.each(function(e,t){var r=t.source().scratch("springy").model,i=t.target().scratch("springy").model;t.scratch("springy",{model:p.newEdge(r,i,{element:t})})});var v=window.sim=new n.Layout.ForceDirected(p,i.stiffness,i.repulsion,i.damping);i.infinite&&(v.minEnergyThreshold=-(1/0));var f=v.getBoundingBox(),g=function(e){f=v.getBoundingBox();var t=f.topright.subtract(f.bottomleft),r=e.subtract(f.bottomleft).divide(t.x).x*h.w+h.x1,i=e.subtract(f.bottomleft).divide(t.y).y*h.h+h.x1;return new n.Vector(r,i)},y=function(e){f=v.getBoundingBox();var t=f.topright.subtract(f.bottomleft),r=(e.x-h.x1)/h.w*t.x+f.bottomleft.x,i=(e.y-h.y1)/h.h*t.y+f.bottomleft.y;return new n.Vector(r,i)},m=l.collection(),x=l.nodes().size(),b=1,w=new n.Renderer(v,function(){r.stopped||m.length>0&&i.animate&&(s=!0,m.rtrigger("position"),i.fit&&l.fit(i.padding),m=l.collection(),s=!1)},function(e,t,r){},function(e,n){if(!r.stopped){var a=g(n),o=e.data.element;o.locked()||o.grabbed()||(o._private.position={x:a.x,y:a.y},m.merge(o)),b==x&&(t.one("layoutready",i.ready),t.trigger({type:"layoutready",layout:t})),b++}});c.each(function(e,t){i.random||a(t)});var _;c.on("position",_=function(){s||a(this)});var E=c.filter(":grabbable");r.stopSystem=function(){r.stopped=!0,p.filterNodes(function(){return!1}),i.ungrabifyWhileSimulating&&E.grabify(),i.fit&&l.fit(i.padding),c.off("drag position",_),t.one("layoutstop",i.stop),t.trigger({type:"layoutstop",layout:t}),r.stopSystem=null},o(),i.infinite||setTimeout(function(){r.stop()},i.maxSimulationTime)}),this},t.prototype.stop=function(){return null!=this.stopSystem&&this.stopSystem(),this},e("layout","springy",t)}(cytoscape),function(e){"use strict";function t(e){this.options=e}t.prototype.recalculateRenderedStyle=function(){},t.prototype.notify=function(){},e("renderer","null",t)}(cytoscape);
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var FDLayoutConstants = _dereq_('./FDLayoutConstants');

function CoSEConstants() {
}

//CoSEConstants inherits static props in FDLayoutConstants
for (var prop in FDLayoutConstants) {
  CoSEConstants[prop] = FDLayoutConstants[prop];
}

CoSEConstants.DEFAULT_USE_MULTI_LEVEL_SCALING = false;
CoSEConstants.DEFAULT_RADIAL_SEPARATION = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
CoSEConstants.DEFAULT_COMPONENT_SEPERATION = 60;

module.exports = CoSEConstants;

},{"./FDLayoutConstants":9}],2:[function(_dereq_,module,exports){
var FDLayoutEdge = _dereq_('./FDLayoutEdge');

function CoSEEdge(source, target, vEdge) {
  FDLayoutEdge.call(this, source, target, vEdge);
}

CoSEEdge.prototype = Object.create(FDLayoutEdge.prototype);
for (var prop in FDLayoutEdge) {
  CoSEEdge[prop] = FDLayoutEdge[prop];
}

module.exports = CoSEEdge

},{"./FDLayoutEdge":10}],3:[function(_dereq_,module,exports){
var LGraph = _dereq_('./LGraph');

function CoSEGraph(parent, graphMgr, vGraph) {
  LGraph.call(this, parent, graphMgr, vGraph);
}

CoSEGraph.prototype = Object.create(LGraph.prototype);
for (var prop in LGraph) {
  CoSEGraph[prop] = LGraph[prop];
}

module.exports = CoSEGraph;

},{"./LGraph":18}],4:[function(_dereq_,module,exports){
var LGraphManager = _dereq_('./LGraphManager');

function CoSEGraphManager(layout) {
  LGraphManager.call(this, layout);
}

CoSEGraphManager.prototype = Object.create(LGraphManager.prototype);
for (var prop in LGraphManager) {
  CoSEGraphManager[prop] = LGraphManager[prop];
}

module.exports = CoSEGraphManager;

},{"./LGraphManager":19}],5:[function(_dereq_,module,exports){
var FDLayout = _dereq_('./FDLayout');
var CoSEGraphManager = _dereq_('./CoSEGraphManager');
var CoSEGraph = _dereq_('./CoSEGraph');
var CoSENode = _dereq_('./CoSENode');
var CoSEEdge = _dereq_('./CoSEEdge');

function CoSELayout() {
  FDLayout.call(this);
}

CoSELayout.prototype = Object.create(FDLayout.prototype);

for (var prop in FDLayout) {
  CoSELayout[prop] = FDLayout[prop];
}

CoSELayout.prototype.newGraphManager = function () {
  var gm = new CoSEGraphManager(this);
  this.graphManager = gm;
  return gm;
};

CoSELayout.prototype.newGraph = function (vGraph) {
  return new CoSEGraph(null, this.graphManager, vGraph);
};

CoSELayout.prototype.newNode = function (vNode) {
  return new CoSENode(this.graphManager, vNode);
};

CoSELayout.prototype.newEdge = function (vEdge) {
  return new CoSEEdge(null, null, vEdge);
};

CoSELayout.prototype.initParameters = function () {
  FDLayout.prototype.initParameters.call(this, arguments);
  if (!this.isSubLayout) {
    if (layoutOptionsPack.idealEdgeLength < 10)
    {
      this.idealEdgeLength = 10;
    }
    else
    {
      this.idealEdgeLength = layoutOptionsPack.idealEdgeLength;
    }

    this.useSmartIdealEdgeLengthCalculation =
            layoutOptionsPack.smartEdgeLengthCalc;
    this.springConstant =
            Layout.transform(layoutOptionsPack.springStrength,
                    FDLayoutConstants.DEFAULT_SPRING_STRENGTH, 5.0, 5.0);
    this.repulsionConstant =
            Layout.transform(layoutOptionsPack.repulsionStrength,
                    FDLayoutConstants.DEFAULT_REPULSION_STRENGTH, 5.0, 5.0);
    this.gravityConstant =
            Layout.transform(layoutOptionsPack.gravityStrength,
                    FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH);
    this.compoundGravityConstant =
            Layout.transform(layoutOptionsPack.compoundGravityStrength,
                    FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH);
    this.gravityRangeFactor =
            Layout.transform(layoutOptionsPack.gravityRange,
                    FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR);
    this.compoundGravityRangeFactor =
            Layout.transform(layoutOptionsPack.compoundGravityRange,
                    FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR);
  }
};

CoSELayout.prototype.layout = function () {
  var createBendsAsNeeded = layoutOptionsPack.createBendsAsNeeded;
  if (createBendsAsNeeded)
  {
    this.createBendpoints();
    this.graphManager.resetAllEdges();
  }

  this.level = 0;
  return this.classicLayout();
};

CoSELayout.prototype.classicLayout = function () {
  this.calculateNodesToApplyGravitationTo();
  this.graphManager.calcLowestCommonAncestors();
  this.graphManager.calcInclusionTreeDepths();
  this.graphManager.getRoot().calcEstimatedSize();
  this.calcIdealEdgeLengths();
  if (!this.incremental)
  {
    var forest = this.getFlatForest();

    // The graph associated with this layout is flat and a forest
    if (forest.length > 0)

    {
      this.positionNodesRadially(forest);
    }
    // The graph associated with this layout is not flat or a forest
    else
    {
      this.positionNodesRandomly();
    }
  }

  this.initSpringEmbedder();
  this.runSpringEmbedder();

  console.log("Classic CoSE layout finished after " +
          this.totalIterations + " iterations");

  return true;
};

CoSELayout.prototype.runSpringEmbedder = function () {
  var lastFrame = new Date().getTime();
  var initialAnimationPeriod = 25;
  var animationPeriod = initialAnimationPeriod;
  do
  {
    this.totalIterations++;

    if (this.totalIterations % FDLayoutConstants.CONVERGENCE_CHECK_PERIOD == 0)
    {
      if (this.isConverged())
      {
        break;
      }

      this.coolingFactor = this.initialCoolingFactor *
              ((this.maxIterations - this.totalIterations) / this.maxIterations);
      animationPeriod = Math.ceil(initialAnimationPeriod * Math.sqrt(this.coolingFactor));

    }
    this.totalDisplacement = 0;
    this.graphManager.updateBounds();
    this.calcSpringForces();
    this.calcRepulsionForces();
    this.calcGravitationalForces();
    this.moveNodes();
    this.animate();
    if (layoutOptionsPack.animate && this.totalIterations % animationPeriod == 0) {
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - lastFrame) > 25) {
          break;
        }
      }
      lastFrame = new Date().getTime();
      var allNodes = this.graphManager.getAllNodes();
      var pData = {};
      for (var i = 0; i < allNodes.length; i++) {
        var rect = allNodes[i].rect;
        var id = allNodes[i].id;
        pData[id] = {
          id: id,
          x: rect.getCenterX(),
          y: rect.getCenterY(),
          w: rect.width,
          h: rect.height
        };
      }
      broadcast({pData: pData});
    }
  }
  while (this.totalIterations < this.maxIterations);

  this.graphManager.updateBounds();
};

CoSELayout.prototype.calculateNodesToApplyGravitationTo = function () {
  var nodeList = [];
  var graph;

  var graphs = this.graphManager.getGraphs();
  var size = graphs.length;
  var i;
  for (i = 0; i < size; i++)
  {
    graph = graphs[i];

    graph.updateConnected();

    if (!graph.isConnected)
    {
      nodeList = nodeList.concat(graph.getNodes());
    }
  }

  this.graphManager.setAllNodesToApplyGravitation(nodeList);
};

CoSELayout.prototype.createBendpoints = function () {
  var edges = [];
  edges = edges.concat(this.graphManager.getAllEdges());
  var visited = new HashSet();
  var i;
  for (i = 0; i < edges.length; i++)
  {
    var edge = edges[i];

    if (!visited.contains(edge))
    {
      var source = edge.getSource();
      var target = edge.getTarget();

      if (source == target)
      {
        edge.getBendpoints().push(new PointD());
        edge.getBendpoints().push(new PointD());
        this.createDummyNodesForBendpoints(edge);
        visited.add(edge);
      }
      else
      {
        var edgeList = [];

        edgeList = edgeList.concat(source.getEdgeListToNode(target));
        edgeList = edgeList.concat(target.getEdgeListToNode(source));

        if (!visited.contains(edgeList[0]))
        {
          if (edgeList.length > 1)
          {
            var k;
            for (k = 0; k < edgeList.length; k++)
            {
              var multiEdge = edgeList[k];
              multiEdge.getBendpoints().push(new PointD());
              this.createDummyNodesForBendpoints(multiEdge);
            }
          }
          visited.addAll(list);
        }
      }
    }

    if (visited.size() == edges.length)
    {
      break;
    }
  }
};

CoSELayout.prototype.positionNodesRadially = function (forest) {
  // We tile the trees to a grid row by row; first tree starts at (0,0)
  var currentStartingPoint = new Point(0, 0);
  var numberOfColumns = Math.ceil(Math.sqrt(forest.length));
  var height = 0;
  var currentY = 0;
  var currentX = 0;
  var point = new PointD(0, 0);

  for (var i = 0; i < forest.length; i++)
  {
    if (i % numberOfColumns == 0)
    {
      // Start of a new row, make the x coordinate 0, increment the
      // y coordinate with the max height of the previous row
      currentX = 0;
      currentY = height;

      if (i != 0)
      {
        currentY += CoSEConstants.DEFAULT_COMPONENT_SEPERATION;
      }

      height = 0;
    }

    var tree = forest[i];

    // Find the center of the tree
    var centerNode = Layout.findCenterOfTree(tree);

    // Set the staring point of the next tree
    currentStartingPoint.x = currentX;
    currentStartingPoint.y = currentY;

    // Do a radial layout starting with the center
    point =
            CoSELayout.radialLayout(tree, centerNode, currentStartingPoint);

    if (point.y > height)
    {
      height = Math.floor(point.y);
    }

    currentX = Math.floor(point.x + CoSEConstants.DEFAULT_COMPONENT_SEPERATION);
  }

  this.transform(
          new PointD(LayoutConstants.WORLD_CENTER_X - point.x / 2,
                  LayoutConstants.WORLD_CENTER_Y - point.y / 2));
};

CoSELayout.radialLayout = function (tree, centerNode, startingPoint) {
  var radialSep = Math.max(this.maxDiagonalInTree(tree),
          CoSEConstants.DEFAULT_RADIAL_SEPARATION);
  CoSELayout.branchRadialLayout(centerNode, null, 0, 359, 0, radialSep);
  var bounds = LGraph.calculateBounds(tree);

  var transform = new Transform();
  transform.setDeviceOrgX(bounds.getMinX());
  transform.setDeviceOrgY(bounds.getMinY());
  transform.setWorldOrgX(startingPoint.x);
  transform.setWorldOrgY(startingPoint.y);

  for (var i = 0; i < tree.length; i++)
  {
    var node = tree[i];
    node.transform(transform);
  }

  var bottomRight =
          new PointD(bounds.getMaxX(), bounds.getMaxY());

  return transform.inverseTransformPoint(bottomRight);
};

CoSELayout.branchRadialLayout = function (node, parentOfNode, startAngle, endAngle, distance, radialSeparation) {
  // First, position this node by finding its angle.
  var halfInterval = ((endAngle - startAngle) + 1) / 2;

  if (halfInterval < 0)
  {
    halfInterval += 180;
  }

  var nodeAngle = (halfInterval + startAngle) % 360;
  var teta = (nodeAngle * IGeometry.TWO_PI) / 360;

  // Make polar to java cordinate conversion.
  var cos_teta = Math.cos(teta);
  var x_ = distance * Math.cos(teta);
  var y_ = distance * Math.sin(teta);

  node.setCenter(x_, y_);

  // Traverse all neighbors of this node and recursively call this
  // function.
  var neighborEdges = [];
  neighborEdges = neighborEdges.concat(node.getEdges());
  var childCount = neighborEdges.length;

  if (parentOfNode != null)
  {
    childCount--;
  }

  var branchCount = 0;

  var incEdgesCount = neighborEdges.length;
  var startIndex;

  var edges = node.getEdgesBetween(parentOfNode);

  // If there are multiple edges, prune them until there remains only one
  // edge.
  while (edges.length > 1)
  {
    //neighborEdges.remove(edges.remove(0));
    var temp = edges[0];
    edges.splice(0, 1);
    var index = neighborEdges.indexOf(temp);
    if (index >= 0) {
      neighborEdges.splice(index, 1);
    }
    incEdgesCount--;
    childCount--;
  }

  if (parentOfNode != null)
  {
    //assert edges.length == 1;
    startIndex = (neighborEdges.indexOf(edges[0]) + 1) % incEdgesCount;
  }
  else
  {
    startIndex = 0;
  }

  var stepAngle = Math.abs(endAngle - startAngle) / childCount;

  for (var i = startIndex;
          branchCount != childCount;
          i = (++i) % incEdgesCount)
  {
    var currentNeighbor =
            neighborEdges[i].getOtherEnd(node);

    // Don't back traverse to root node in current tree.
    if (currentNeighbor == parentOfNode)
    {
      continue;
    }

    var childStartAngle =
            (startAngle + branchCount * stepAngle) % 360;
    var childEndAngle = (childStartAngle + stepAngle) % 360;

    CoSELayout.branchRadialLayout(currentNeighbor,
            node,
            childStartAngle, childEndAngle,
            distance + radialSeparation, radialSeparation);

    branchCount++;
  }
};

CoSELayout.maxDiagonalInTree = function (tree) {
  var maxDiagonal = Integer.MIN_VALUE;

  for (var i = 0; i < tree.length; i++)
  {
    var node = tree[i];
    var diagonal = node.getDiagonal();

    if (diagonal > maxDiagonal)
    {
      maxDiagonal = diagonal;
    }
  }

  return maxDiagonal;
};

CoSELayout.prototype.calcRepulsionRange = function () {
  // formula is 2 x (level + 1) x idealEdgeLength
  return (2 * (this.level + 1) * this.idealEdgeLength);
};

module.exports = CoSELayout;

},{"./CoSEEdge":2,"./CoSEGraph":3,"./CoSEGraphManager":4,"./CoSENode":6,"./FDLayout":8}],6:[function(_dereq_,module,exports){
var FDLayoutNode = _dereq_('./FDLayoutNode');

function CoSENode(gm, loc, size, vNode) {
  FDLayoutNode.call(this, gm, loc, size, vNode);
}


CoSENode.prototype = Object.create(FDLayoutNode.prototype);
for (var prop in FDLayoutNode) {
  CoSENode[prop] = FDLayoutNode[prop];
}

CoSENode.prototype.move = function ()
{
  var layout = this.graphManager.getLayout();
  this.displacementX = layout.coolingFactor *
          (this.springForceX + this.repulsionForceX + this.gravitationForceX);
  this.displacementY = layout.coolingFactor *
          (this.springForceY + this.repulsionForceY + this.gravitationForceY);


  if (Math.abs(this.displacementX) > layout.coolingFactor * layout.maxNodeDisplacement)
  {
    this.displacementX = layout.coolingFactor * layout.maxNodeDisplacement *
            IMath.sign(this.displacementX);
  }

  if (Math.abs(this.displacementY) > layout.coolingFactor * layout.maxNodeDisplacement)
  {
    this.displacementY = layout.coolingFactor * layout.maxNodeDisplacement *
            IMath.sign(this.displacementY);
  }

  // a simple node, just move it
  if (this.child == null)
  {
    this.moveBy(this.displacementX, this.displacementY);
  }
  // an empty compound node, again just move it
  else if (this.child.getNodes().length == 0)
  {
    this.moveBy(this.displacementX, this.displacementY);
  }
  // non-empty compound node, propogate movement to children as well
  else
  {
    this.propogateDisplacementToChildren(this.displacementX,
            this.displacementY);
  }

  layout.totalDisplacement +=
          Math.abs(this.displacementX) + Math.abs(this.displacementY);

  this.springForceX = 0;
  this.springForceY = 0;
  this.repulsionForceX = 0;
  this.repulsionForceY = 0;
  this.gravitationForceX = 0;
  this.gravitationForceY = 0;
  this.displacementX = 0;
  this.displacementY = 0;
};

CoSENode.prototype.propogateDisplacementToChildren = function (dX, dY)
{
  var nodes = this.getChild().getNodes();
  var node;
  for (var i = 0; i < nodes.length; i++)
  {
    node = nodes[i];
    if (node.getChild() == null)
    {
      node.moveBy(dX, dY);
      node.displacementX += dX;
      node.displacementY += dY;
    }
    else
    {
      node.propogateDisplacementToChildren(dX, dY);
    }
  }
};

CoSENode.prototype.setPred1 = function (pred1)
{
  this.pred1 = pred1;
};

CoSENode.prototype.getPred1 = function ()
{
  return pred1;
};

CoSENode.prototype.getPred2 = function ()
{
  return pred2;
};

CoSENode.prototype.setNext = function (next)
{
  this.next = next;
};

CoSENode.prototype.getNext = function ()
{
  return next;
};

CoSENode.prototype.setProcessed = function (processed)
{
  this.processed = processed;
};

CoSENode.prototype.isProcessed = function ()
{
  return processed;
};

module.exports = CoSENode;

},{"./FDLayoutNode":11}],7:[function(_dereq_,module,exports){
function DimensionD(width, height) {
  this.width = 0;
  this.height = 0;
  if (width !== null && height !== null) {
    this.height = height;
    this.width = width;
  }
}

DimensionD.prototype.getWidth = function ()
{
  return this.width;
};

DimensionD.prototype.setWidth = function (width)
{
  this.width = width;
};

DimensionD.prototype.getHeight = function ()
{
  return this.height;
};

DimensionD.prototype.setHeight = function (height)
{
  this.height = height;
};

module.exports = DimensionD;

},{}],8:[function(_dereq_,module,exports){
var Layout = _dereq_('./Layout');
var FDLayoutConstants = _dereq_('./FDLayoutConstants');

function FDLayout() {
  Layout.call(this);

  this.useSmartIdealEdgeLengthCalculation = FDLayoutConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
  this.idealEdgeLength = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
  this.springConstant = FDLayoutConstants.DEFAULT_SPRING_STRENGTH;
  this.repulsionConstant = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH;
  this.gravityConstant = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH;
  this.compoundGravityConstant = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
  this.gravityRangeFactor = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR;
  this.compoundGravityRangeFactor = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
  this.displacementThresholdPerNode = (3.0 * FDLayoutConstants.DEFAULT_EDGE_LENGTH) / 100;
  this.coolingFactor = 1.0;
  this.initialCoolingFactor = 1.0;
  this.totalDisplacement = 0.0;
  this.oldTotalDisplacement = 0.0;
  this.maxIterations = FDLayoutConstants.MAX_ITERATIONS;
}

FDLayout.prototype = Object.create(Layout.prototype);

for (var prop in Layout) {
  FDLayout[prop] = Layout[prop];
}

FDLayout.prototype.initParameters = function () {
  Layout.prototype.initParameters.call(this, arguments);

  if (this.layoutQuality == LayoutConstants.DRAFT_QUALITY)
  {
    this.displacementThresholdPerNode += 0.30;
    this.maxIterations *= 0.8;
  }
  else if (this.layoutQuality == LayoutConstants.PROOF_QUALITY)
  {
    this.displacementThresholdPerNode -= 0.30;
    this.maxIterations *= 1.2;
  }

  this.totalIterations = 0;
  this.notAnimatedIterations = 0;

//    this.useFRGridVariant = layoutOptionsPack.smartRepulsionRangeCalc;
};

FDLayout.prototype.calcIdealEdgeLengths = function () {
  var edge;
  var lcaDepth;
  var source;
  var target;
  var sizeOfSourceInLca;
  var sizeOfTargetInLca;

  var allEdges = this.getGraphManager().getAllEdges();
  for (var i = 0; i < allEdges.length; i++)
  {
    edge = allEdges[i];

    edge.idealLength = this.idealEdgeLength;

    if (edge.isInterGraph)
    {
      source = edge.getSource();
      target = edge.getTarget();

      sizeOfSourceInLca = edge.getSourceInLca().getEstimatedSize();
      sizeOfTargetInLca = edge.getTargetInLca().getEstimatedSize();

      if (this.useSmartIdealEdgeLengthCalculation)
      {
        edge.idealLength += sizeOfSourceInLca + sizeOfTargetInLca -
                2 * LayoutConstants.SIMPLE_NODE_SIZE;
      }

      lcaDepth = edge.getLca().getInclusionTreeDepth();

      edge.idealLength += FDLayoutConstants.DEFAULT_EDGE_LENGTH *
              FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR *
              (source.getInclusionTreeDepth() +
                      target.getInclusionTreeDepth() - 2 * lcaDepth);
    }
  }
};

FDLayout.prototype.initSpringEmbedder = function () {

  if (this.incremental)
  {
    this.coolingFactor = 0.8;
    this.initialCoolingFactor = 0.8;
    this.maxNodeDisplacement =
            FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL;
  }
  else
  {
    this.coolingFactor = 1.0;
    this.initialCoolingFactor = 1.0;
    this.maxNodeDisplacement =
            FDLayoutConstants.MAX_NODE_DISPLACEMENT;
  }

  this.maxIterations =
          Math.max(this.getAllNodes().length * 5, this.maxIterations);

  this.totalDisplacementThreshold =
          this.displacementThresholdPerNode * this.getAllNodes().length;

  this.repulsionRange = this.calcRepulsionRange();
};

FDLayout.prototype.calcSpringForces = function () {
  var lEdges = this.getAllEdges();
  var edge;

  for (var i = 0; i < lEdges.length; i++)
  {
    edge = lEdges[i];

    this.calcSpringForce(edge, edge.idealLength);
  }
};

FDLayout.prototype.calcRepulsionForces = function () {
  var i, j;
  var nodeA, nodeB;
  var lNodes = this.getAllNodes();

  for (i = 0; i < lNodes.length; i++)
  {
    nodeA = lNodes[i];

    for (j = i + 1; j < lNodes.length; j++)
    {
      nodeB = lNodes[j];

      // If both nodes are not members of the same graph, skip.
      if (nodeA.getOwner() != nodeB.getOwner())
      {
        continue;
      }

      this.calcRepulsionForce(nodeA, nodeB);
    }
  }
};

FDLayout.prototype.calcGravitationalForces = function () {
  var node;
  var lNodes = this.getAllNodesToApplyGravitation();

  for (var i = 0; i < lNodes.length; i++)
  {
    node = lNodes[i];
    this.calcGravitationalForce(node);
  }
};

FDLayout.prototype.moveNodes = function () {
  var lNodes = this.getAllNodes();
  var node;

  for (var i = 0; i < lNodes.length; i++)
  {
    node = lNodes[i];
    node.move();
  }
}

FDLayout.prototype.calcSpringForce = function (edge, idealLength) {
  var sourceNode = edge.getSource();
  var targetNode = edge.getTarget();

  var length;
  var springForce;
  var springForceX;
  var springForceY;

  // Update edge length
  if (this.uniformLeafNodeSizes &&
          sourceNode.getChild() == null && targetNode.getChild() == null)
  {
    edge.updateLengthSimple();
  }
  else
  {
    edge.updateLength();

    if (edge.isOverlapingSourceAndTarget)
    {
      return;
    }
  }

  length = edge.getLength();

  // Calculate spring forces
  springForce = this.springConstant * (length - idealLength);

  // Project force onto x and y axes
  springForceX = springForce * (edge.lengthX / length);
  springForceY = springForce * (edge.lengthY / length);

  // Apply forces on the end nodes
  sourceNode.springForceX += springForceX;
  sourceNode.springForceY += springForceY;
  targetNode.springForceX -= springForceX;
  targetNode.springForceY -= springForceY;
};

FDLayout.prototype.calcRepulsionForce = function (nodeA, nodeB) {
  var rectA = nodeA.getRect();
  var rectB = nodeB.getRect();
  var overlapAmount = new Array(2);
  var clipPoints = new Array(4);
  var distanceX;
  var distanceY;
  var distanceSquared;
  var distance;
  var repulsionForce;
  var repulsionForceX;
  var repulsionForceY;

  if (rectA.intersects(rectB))// two nodes overlap
  {
    // calculate separation amount in x and y directions
    IGeometry.calcSeparationAmount(rectA,
            rectB,
            overlapAmount,
            FDLayoutConstants.DEFAULT_EDGE_LENGTH / 2.0);

    repulsionForceX = overlapAmount[0];
    repulsionForceY = overlapAmount[1];
  }
  else// no overlap
  {
    // calculate distance

    if (this.uniformLeafNodeSizes &&
            nodeA.getChild() == null && nodeB.getChild() == null)// simply base repulsion on distance of node centers
    {
      distanceX = rectB.getCenterX() - rectA.getCenterX();
      distanceY = rectB.getCenterY() - rectA.getCenterY();
    }
    else// use clipping points
    {
      IGeometry.getIntersection(rectA, rectB, clipPoints);

      distanceX = clipPoints[2] - clipPoints[0];
      distanceY = clipPoints[3] - clipPoints[1];
    }

    // No repulsion range. FR grid variant should take care of this.
    if (Math.abs(distanceX) < FDLayoutConstants.MIN_REPULSION_DIST)
    {
      distanceX = IMath.sign(distanceX) *
              FDLayoutConstants.MIN_REPULSION_DIST;
    }

    if (Math.abs(distanceY) < FDLayoutConstants.MIN_REPULSION_DIST)
    {
      distanceY = IMath.sign(distanceY) *
              FDLayoutConstants.MIN_REPULSION_DIST;
    }

    distanceSquared = distanceX * distanceX + distanceY * distanceY;
    distance = Math.sqrt(distanceSquared);

    repulsionForce = this.repulsionConstant / distanceSquared;

    // Project force onto x and y axes
    repulsionForceX = repulsionForce * distanceX / distance;
    repulsionForceY = repulsionForce * distanceY / distance;
  }

  // Apply forces on the two nodes
  nodeA.repulsionForceX -= repulsionForceX;
  nodeA.repulsionForceY -= repulsionForceY;
  nodeB.repulsionForceX += repulsionForceX;
  nodeB.repulsionForceY += repulsionForceY;
};

FDLayout.prototype.calcGravitationalForce = function (node) {
  var ownerGraph;
  var ownerCenterX;
  var ownerCenterY;
  var distanceX;
  var distanceY;
  var absDistanceX;
  var absDistanceY;
  var estimatedSize;
  ownerGraph = node.getOwner();

  ownerCenterX = (ownerGraph.getRight() + ownerGraph.getLeft()) / 2;
  ownerCenterY = (ownerGraph.getTop() + ownerGraph.getBottom()) / 2;
  distanceX = node.getCenterX() - ownerCenterX;
  distanceY = node.getCenterY() - ownerCenterY;
  absDistanceX = Math.abs(distanceX);
  absDistanceY = Math.abs(distanceY);

  if (node.getOwner() == this.graphManager.getRoot())// in the root graph
  {
    Math.floor(80);
    estimatedSize = Math.floor(ownerGraph.getEstimatedSize() *
            this.gravityRangeFactor);

    if (absDistanceX > estimatedSize || absDistanceY > estimatedSize)
    {
      node.gravitationForceX = -this.gravityConstant * distanceX;
      node.gravitationForceY = -this.gravityConstant * distanceY;
    }
  }
  else// inside a compound
  {
    estimatedSize = Math.floor((ownerGraph.getEstimatedSize() *
            this.compoundGravityRangeFactor));

    if (absDistanceX > estimatedSize || absDistanceY > estimatedSize)
    {
      node.gravitationForceX = -this.gravityConstant * distanceX *
              this.compoundGravityConstant;
      node.gravitationForceY = -this.gravityConstant * distanceY *
              this.compoundGravityConstant;
    }
  }
};

FDLayout.prototype.isConverged = function () {
  var converged;
  var oscilating = false;

  if (this.totalIterations > this.maxIterations / 3)
  {
    oscilating =
            Math.abs(this.totalDisplacement - this.oldTotalDisplacement) < 2;
  }

  converged = this.totalDisplacement < this.totalDisplacementThreshold;

  this.oldTotalDisplacement = this.totalDisplacement;

  return converged || oscilating;
};

FDLayout.prototype.animate = function () {
  if (this.animationDuringLayout && !this.isSubLayout)
  {
    if (this.notAnimatedIterations == this.animationPeriod)
    {
      this.update();
      this.notAnimatedIterations = 0;
    }
    else
    {
      this.notAnimatedIterations++;
    }
  }
};

FDLayout.prototype.calcRepulsionRange = function () {
  return 0.0;
};

module.exports = FDLayout;

},{"./FDLayoutConstants":9,"./Layout":22}],9:[function(_dereq_,module,exports){
var layoutOptionsPack = _dereq_('./layoutOptionsPack');

function FDLayoutConstants() {
}

FDLayoutConstants.getUserOptions = function (options) {
  if (options.nodeRepulsion != null)
    FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = options.nodeRepulsion;
  if (options.idealEdgeLength != null) {
    FDLayoutConstants.DEFAULT_EDGE_LENGTH = options.idealEdgeLength;
  }
  if (options.edgeElasticity != null)
    FDLayoutConstants.DEFAULT_SPRING_STRENGTH = options.edgeElasticity;
  if (options.nestingFactor != null)
    FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = options.nestingFactor;
  if (options.gravity != null)
    FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = options.gravity;
  if (options.numIter != null)
    FDLayoutConstants.MAX_ITERATIONS = options.numIter;
  
  layoutOptionsPack.incremental = !(options.randomize);
  layoutOptionsPack.animate = options.animate;
}

FDLayoutConstants.MAX_ITERATIONS = 2500;

FDLayoutConstants.DEFAULT_EDGE_LENGTH = 50;
FDLayoutConstants.DEFAULT_SPRING_STRENGTH = 0.45;
FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = 4500.0;
FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = 0.4;
FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = 1.0;
FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR = 2.0;
FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = 1.5;
FDLayoutConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION = true;
FDLayoutConstants.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION = true;
FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL = 100.0;
FDLayoutConstants.MAX_NODE_DISPLACEMENT = FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL * 3;
FDLayoutConstants.MIN_REPULSION_DIST = FDLayoutConstants.DEFAULT_EDGE_LENGTH / 10.0;
FDLayoutConstants.CONVERGENCE_CHECK_PERIOD = 100;
FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = 0.1;
FDLayoutConstants.MIN_EDGE_LENGTH = 1;
FDLayoutConstants.GRID_CALCULATION_CHECK_PERIOD = 10;

module.exports = FDLayoutConstants;

},{"./layoutOptionsPack":31}],10:[function(_dereq_,module,exports){
var LEdge = _dereq_('./LEdge');
var FDLayoutConstants = _dereq_('./FDLayoutConstants');

function FDLayoutEdge(source, target, vEdge) {
  LEdge.call(this, source, target, vEdge);
  this.idealLength = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
}

FDLayoutEdge.prototype = Object.create(LEdge.prototype);

for (var prop in LEdge) {
  FDLayoutEdge[prop] = LEdge[prop];
}

module.exports = FDLayoutEdge;

},{"./FDLayoutConstants":9,"./LEdge":17}],11:[function(_dereq_,module,exports){
var LNode = _dereq_('./LNode');

function FDLayoutNode(gm, loc, size, vNode) {
  // alternative constructor is handled inside LNode
  LNode.call(this, gm, loc, size, vNode);
  //Spring, repulsion and gravitational forces acting on this node
  this.springForceX = 0;
  this.springForceY = 0;
  this.repulsionForceX = 0;
  this.repulsionForceY = 0;
  this.gravitationForceX = 0;
  this.gravitationForceY = 0;
  //Amount by which this node is to be moved in this iteration
  this.displacementX = 0;
  this.displacementY = 0;

  //Start and finish grid coordinates that this node is fallen into
  this.startX = 0;
  this.finishX = 0;
  this.startY = 0;
  this.finishY = 0;

  //Geometric neighbors of this node
  this.surrounding = [];
}

FDLayoutNode.prototype = Object.create(LNode.prototype);

for (var prop in LNode) {
  FDLayoutNode[prop] = LNode[prop];
}

FDLayoutNode.prototype.setGridCoordinates = function (_startX, _finishX, _startY, _finishY)
{
  this.startX = _startX;
  this.finishX = _finishX;
  this.startY = _startY;
  this.finishY = _finishY;

};

module.exports = FDLayoutNode;

},{"./LNode":21}],12:[function(_dereq_,module,exports){
var UniqueIDGeneretor = _dereq_('./UniqueIDGeneretor');

function HashMap() {
  this.map = {};
  this.keys = [];
}

HashMap.prototype.put = function (key, value) {
  var theId = UniqueIDGeneretor.createID(key);
  if (!this.contains(theId)) {
    this.map[theId] = value;
    this.keys.push(key);
  }
};

HashMap.prototype.contains = function (key) {
  var theId = UniqueIDGeneretor.createID(key);
  return this.map[key] != null;
};

HashMap.prototype.get = function (key) {
  var theId = UniqueIDGeneretor.createID(key);
  return this.map[theId];
};

HashMap.prototype.keySet = function () {
  return this.keys;
};

module.exports = HashMap;

},{"./UniqueIDGeneretor":29}],13:[function(_dereq_,module,exports){
var UniqueIDGeneretor = _dereq_('./UniqueIDGeneretor');

function HashSet() {
  this.set = {};
}
;

HashSet.prototype.add = function (obj) {
  var theId = UniqueIDGeneretor.createID(obj);
  if (!this.contains(theId))
    this.set[theId] = obj;
};

HashSet.prototype.remove = function (obj) {
  delete this.set[UniqueIDGeneretor.createID(obj)];
};

HashSet.prototype.clear = function () {
  this.set = {};
};

HashSet.prototype.contains = function (obj) {
  return this.set[UniqueIDGeneretor.createID(obj)] == obj;
};

HashSet.prototype.isEmpty = function () {
  return this.size() === 0;
};

HashSet.prototype.size = function () {
  return Object.keys(this.set).length;
};

//concats this.set to the given list
HashSet.prototype.addAllTo = function (list) {
  var keys = Object.keys(this.set);
  var length = keys.length;
  for (var i = 0; i < length; i++) {
    list.push(this.set[keys[i]]);
  }
};

HashSet.prototype.size = function () {
  return Object.keys(this.set).length;
};

HashSet.prototype.addAll = function (list) {
  var s = list.length;
  for (var i = 0; i < s; i++) {
    var v = list[i];
    this.add(v);
  }
};

module.exports = HashSet;

},{"./UniqueIDGeneretor":29}],14:[function(_dereq_,module,exports){
function IGeometry() {
}

IGeometry.calcSeparationAmount = function (rectA, rectB, overlapAmount, separationBuffer)
{
  if (!rectA.intersects(rectB)) {
    throw "assert failed";
  }
  var directions = new Array(2);
  IGeometry.decideDirectionsForOverlappingNodes(rectA, rectB, directions);
  overlapAmount[0] = Math.min(rectA.getRight(), rectB.getRight()) -
          Math.max(rectA.x, rectB.x);
  overlapAmount[1] = Math.min(rectA.getBottom(), rectB.getBottom()) -
          Math.max(rectA.y, rectB.y);
  // update the overlapping amounts for the following cases:
  if ((rectA.getX() <= rectB.getX()) && (rectA.getRight() >= rectB.getRight()))
  {
    overlapAmount[0] += Math.min((rectB.getX() - rectA.getX()),
            (rectA.getRight() - rectB.getRight()));
  }
  else if ((rectB.getX() <= rectA.getX()) && (rectB.getRight() >= rectA.getRight()))
  {
    overlapAmount[0] += Math.min((rectA.getX() - rectB.getX()),
            (rectB.getRight() - rectA.getRight()));
  }
  if ((rectA.getY() <= rectB.getY()) && (rectA.getBottom() >= rectB.getBottom()))
  {
    overlapAmount[1] += Math.min((rectB.getY() - rectA.getY()),
            (rectA.getBottom() - rectB.getBottom()));
  }
  else if ((rectB.getY() <= rectA.getY()) && (rectB.getBottom() >= rectA.getBottom()))
  {
    overlapAmount[1] += Math.min((rectA.getY() - rectB.getY()),
            (rectB.getBottom() - rectA.getBottom()));
  }

  // find slope of the line passes two centers
  var slope = Math.abs((rectB.getCenterY() - rectA.getCenterY()) /
          (rectB.getCenterX() - rectA.getCenterX()));
  // if centers are overlapped
  if ((rectB.getCenterY() == rectA.getCenterY()) &&
          (rectB.getCenterX() == rectA.getCenterX()))
  {
    // assume the slope is 1 (45 degree)
    slope = 1.0;
  }

  var moveByY = slope * overlapAmount[0];
  var moveByX = overlapAmount[1] / slope;
  if (overlapAmount[0] < moveByX)
  {
    moveByX = overlapAmount[0];
  }
  else
  {
    moveByY = overlapAmount[1];
  }
  // return half the amount so that if each rectangle is moved by these
  // amounts in opposite directions, overlap will be resolved
  overlapAmount[0] = -1 * directions[0] * ((moveByX / 2) + separationBuffer);
  overlapAmount[1] = -1 * directions[1] * ((moveByY / 2) + separationBuffer);
}

IGeometry.decideDirectionsForOverlappingNodes = function (rectA, rectB, directions)
{
  if (rectA.getCenterX() < rectB.getCenterX())
  {
    directions[0] = -1;
  }
  else
  {
    directions[0] = 1;
  }

  if (rectA.getCenterY() < rectB.getCenterY())
  {
    directions[1] = -1;
  }
  else
  {
    directions[1] = 1;
  }
}

IGeometry.getIntersection2 = function (rectA, rectB, result)
{
  //result[0-1] will contain clipPoint of rectA, result[2-3] will contain clipPoint of rectB
  var p1x = rectA.getCenterX();
  var p1y = rectA.getCenterY();
  var p2x = rectB.getCenterX();
  var p2y = rectB.getCenterY();

  //if two rectangles intersect, then clipping points are centers
  if (rectA.intersects(rectB))
  {
    result[0] = p1x;
    result[1] = p1y;
    result[2] = p2x;
    result[3] = p2y;
    return true;
  }
  //variables for rectA
  var topLeftAx = rectA.getX();
  var topLeftAy = rectA.getY();
  var topRightAx = rectA.getRight();
  var bottomLeftAx = rectA.getX();
  var bottomLeftAy = rectA.getBottom();
  var bottomRightAx = rectA.getRight();
  var halfWidthA = rectA.getWidthHalf();
  var halfHeightA = rectA.getHeightHalf();
  //variables for rectB
  var topLeftBx = rectB.getX();
  var topLeftBy = rectB.getY();
  var topRightBx = rectB.getRight();
  var bottomLeftBx = rectB.getX();
  var bottomLeftBy = rectB.getBottom();
  var bottomRightBx = rectB.getRight();
  var halfWidthB = rectB.getWidthHalf();
  var halfHeightB = rectB.getHeightHalf();
  //flag whether clipping points are found
  var clipPointAFound = false;
  var clipPointBFound = false;

  // line is vertical
  if (p1x == p2x)
  {
    if (p1y > p2y)
    {
      result[0] = p1x;
      result[1] = topLeftAy;
      result[2] = p2x;
      result[3] = bottomLeftBy;
      return false;
    }
    else if (p1y < p2y)
    {
      result[0] = p1x;
      result[1] = bottomLeftAy;
      result[2] = p2x;
      result[3] = topLeftBy;
      return false;
    }
    else
    {
      //not line, return null;
    }
  }
  // line is horizontal
  else if (p1y == p2y)
  {
    if (p1x > p2x)
    {
      result[0] = topLeftAx;
      result[1] = p1y;
      result[2] = topRightBx;
      result[3] = p2y;
      return false;
    }
    else if (p1x < p2x)
    {
      result[0] = topRightAx;
      result[1] = p1y;
      result[2] = topLeftBx;
      result[3] = p2y;
      return false;
    }
    else
    {
      //not valid line, return null;
    }
  }
  else
  {
    //slopes of rectA's and rectB's diagonals
    var slopeA = rectA.height / rectA.width;
    var slopeB = rectB.height / rectB.width;

    //slope of line between center of rectA and center of rectB
    var slopePrime = (p2y - p1y) / (p2x - p1x);
    var cardinalDirectionA;
    var cardinalDirectionB;
    var tempPointAx;
    var tempPointAy;
    var tempPointBx;
    var tempPointBy;

    //determine whether clipping point is the corner of nodeA
    if ((-slopeA) == slopePrime)
    {
      if (p1x > p2x)
      {
        result[0] = bottomLeftAx;
        result[1] = bottomLeftAy;
        clipPointAFound = true;
      }
      else
      {
        result[0] = topRightAx;
        result[1] = topLeftAy;
        clipPointAFound = true;
      }
    }
    else if (slopeA == slopePrime)
    {
      if (p1x > p2x)
      {
        result[0] = topLeftAx;
        result[1] = topLeftAy;
        clipPointAFound = true;
      }
      else
      {
        result[0] = bottomRightAx;
        result[1] = bottomLeftAy;
        clipPointAFound = true;
      }
    }

    //determine whether clipping point is the corner of nodeB
    if ((-slopeB) == slopePrime)
    {
      if (p2x > p1x)
      {
        result[2] = bottomLeftBx;
        result[3] = bottomLeftBy;
        clipPointBFound = true;
      }
      else
      {
        result[2] = topRightBx;
        result[3] = topLeftBy;
        clipPointBFound = true;
      }
    }
    else if (slopeB == slopePrime)
    {
      if (p2x > p1x)
      {
        result[2] = topLeftBx;
        result[3] = topLeftBy;
        clipPointBFound = true;
      }
      else
      {
        result[2] = bottomRightBx;
        result[3] = bottomLeftBy;
        clipPointBFound = true;
      }
    }

    //if both clipping points are corners
    if (clipPointAFound && clipPointBFound)
    {
      return false;
    }

    //determine Cardinal Direction of rectangles
    if (p1x > p2x)
    {
      if (p1y > p2y)
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(slopeA, slopePrime, 4);
        cardinalDirectionB = IGeometry.getCardinalDirection(slopeB, slopePrime, 2);
      }
      else
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(-slopeA, slopePrime, 3);
        cardinalDirectionB = IGeometry.getCardinalDirection(-slopeB, slopePrime, 1);
      }
    }
    else
    {
      if (p1y > p2y)
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(-slopeA, slopePrime, 1);
        cardinalDirectionB = IGeometry.getCardinalDirection(-slopeB, slopePrime, 3);
      }
      else
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(slopeA, slopePrime, 2);
        cardinalDirectionB = IGeometry.getCardinalDirection(slopeB, slopePrime, 4);
      }
    }
    //calculate clipping Point if it is not found before
    if (!clipPointAFound)
    {
      switch (cardinalDirectionA)
      {
        case 1:
          tempPointAy = topLeftAy;
          tempPointAx = p1x + (-halfHeightA) / slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
        case 2:
          tempPointAx = bottomRightAx;
          tempPointAy = p1y + halfWidthA * slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
        case 3:
          tempPointAy = bottomLeftAy;
          tempPointAx = p1x + halfHeightA / slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
        case 4:
          tempPointAx = bottomLeftAx;
          tempPointAy = p1y + (-halfWidthA) * slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
      }
    }
    if (!clipPointBFound)
    {
      switch (cardinalDirectionB)
      {
        case 1:
          tempPointBy = topLeftBy;
          tempPointBx = p2x + (-halfHeightB) / slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
        case 2:
          tempPointBx = bottomRightBx;
          tempPointBy = p2y + halfWidthB * slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
        case 3:
          tempPointBy = bottomLeftBy;
          tempPointBx = p2x + halfHeightB / slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
        case 4:
          tempPointBx = bottomLeftBx;
          tempPointBy = p2y + (-halfWidthB) * slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
      }
    }
  }
  return false;
}

IGeometry.getCardinalDirection = function (slope, slopePrime, line)
{
  if (slope > slopePrime)
  {
    return line;
  }
  else
  {
    return 1 + line % 4;
  }
}

IGeometry.getIntersection = function (s1, s2, f1, f2)
{
  if (f2 == null) {
    return IGeometry.getIntersection2(s1, s2, f1);
  }
  var x1 = s1.x;
  var y1 = s1.y;
  var x2 = s2.x;
  var y2 = s2.y;
  var x3 = f1.x;
  var y3 = f1.y;
  var x4 = f2.x;
  var y4 = f2.y;
  var x, y; // intersection point
  var a1, a2, b1, b2, c1, c2; // coefficients of line eqns.
  var denom;

  a1 = y2 - y1;
  b1 = x1 - x2;
  c1 = x2 * y1 - x1 * y2;  // { a1*x + b1*y + c1 = 0 is line 1 }

  a2 = y4 - y3;
  b2 = x3 - x4;
  c2 = x4 * y3 - x3 * y4;  // { a2*x + b2*y + c2 = 0 is line 2 }

  denom = a1 * b2 - a2 * b1;

  if (denom == 0)
  {
    return null;
  }

  x = (b1 * c2 - b2 * c1) / denom;
  y = (a2 * c1 - a1 * c2) / denom;

  return new Point(x, y);
}

// -----------------------------------------------------------------------------
// Section: Class Constants
// -----------------------------------------------------------------------------
/**
 * Some useful pre-calculated constants
 */
IGeometry.HALF_PI = 0.5 * Math.PI;
IGeometry.ONE_AND_HALF_PI = 1.5 * Math.PI;
IGeometry.TWO_PI = 2.0 * Math.PI;
IGeometry.THREE_PI = 3.0 * Math.PI;

module.exports = IGeometry;

},{}],15:[function(_dereq_,module,exports){
function IMath() {
}

/**
 * This method returns the sign of the input value.
 */
IMath.sign = function (value) {
  if (value > 0)
  {
    return 1;
  }
  else if (value < 0)
  {
    return -1;
  }
  else
  {
    return 0;
  }
}

IMath.floor = function (value) {
  return value < 0 ? Math.ceil(value) : Math.floor(value);
}

IMath.ceil = function (value) {
  return value < 0 ? Math.floor(value) : Math.ceil(value);
}

module.exports = IMath;

},{}],16:[function(_dereq_,module,exports){
function Integer() {
}

Integer.MAX_VALUE = 2147483647;
Integer.MIN_VALUE = -2147483648;

module.exports = Integer;

},{}],17:[function(_dereq_,module,exports){
var LGraphObject = _dereq_('./LGraphObject');

function LEdge(source, target, vEdge) {
  LGraphObject.call(this, vEdge);

  this.isOverlapingSourceAndTarget = false;
  this.vGraphObject = vEdge;
  this.bendpoints = [];
  this.source = source;
  this.target = target;
}

LEdge.prototype = Object.create(LGraphObject.prototype);

for (var prop in LGraphObject) {
  LEdge[prop] = LGraphObject[prop];
}

LEdge.prototype.getSource = function ()
{
  return this.source;
};

LEdge.prototype.getTarget = function ()
{
  return this.target;
};

LEdge.prototype.isInterGraph = function ()
{
  return this.isInterGraph;
};

LEdge.prototype.getLength = function ()
{
  return this.length;
};

LEdge.prototype.isOverlapingSourceAndTarget = function ()
{
  return this.isOverlapingSourceAndTarget;
};

LEdge.prototype.getBendpoints = function ()
{
  return this.bendpoints;
};

LEdge.prototype.getLca = function ()
{
  return this.lca;
};

LEdge.prototype.getSourceInLca = function ()
{
  return this.sourceInLca;
};

LEdge.prototype.getTargetInLca = function ()
{
  return this.targetInLca;
};

LEdge.prototype.getOtherEnd = function (node)
{
  if (this.source === node)
  {
    return this.target;
  }
  else if (this.target === node)
  {
    return this.source;
  }
  else
  {
    throw "Node is not incident with this edge";
  }
}

LEdge.prototype.getOtherEndInGraph = function (node, graph)
{
  var otherEnd = this.getOtherEnd(node);
  var root = graph.getGraphManager().getRoot();

  while (true)
  {
    if (otherEnd.getOwner() == graph)
    {
      return otherEnd;
    }

    if (otherEnd.getOwner() == root)
    {
      break;
    }

    otherEnd = otherEnd.getOwner().getParent();
  }

  return null;
};

LEdge.prototype.updateLength = function ()
{
  var clipPointCoordinates = new Array(4);

  this.isOverlapingSourceAndTarget =
          IGeometry.getIntersection(this.target.getRect(),
                  this.source.getRect(),
                  clipPointCoordinates);

  if (!this.isOverlapingSourceAndTarget)
  {
    this.lengthX = clipPointCoordinates[0] - clipPointCoordinates[2];
    this.lengthY = clipPointCoordinates[1] - clipPointCoordinates[3];

    if (Math.abs(this.lengthX) < 1.0)
    {
      this.lengthX = IMath.sign(this.lengthX);
    }

    if (Math.abs(this.lengthY) < 1.0)
    {
      this.lengthY = IMath.sign(this.lengthY);
    }

    this.length = Math.sqrt(
            this.lengthX * this.lengthX + this.lengthY * this.lengthY);
  }
};

LEdge.prototype.updateLengthSimple = function ()
{
  this.lengthX = this.target.getCenterX() - this.source.getCenterX();
  this.lengthY = this.target.getCenterY() - this.source.getCenterY();

  if (Math.abs(this.lengthX) < 1.0)
  {
    this.lengthX = IMath.sign(this.lengthX);
  }

  if (Math.abs(this.lengthY) < 1.0)
  {
    this.lengthY = IMath.sign(this.lengthY);
  }

  this.length = Math.sqrt(
          this.lengthX * this.lengthX + this.lengthY * this.lengthY);
}

module.exports = LEdge;

},{"./LGraphObject":20}],18:[function(_dereq_,module,exports){
var LGraphObject = _dereq_('./LGraphObject');
var Integer = _dereq_('./Integer');
var LayoutConstants = _dereq_('./LayoutConstants');
var LGraphManager = _dereq_('./LGraphManager');
var LNode = _dereq_('./LNode');

function LGraph(parent, obj2, vGraph) {
  LGraphObject.call(this, vGraph);
  this.estimatedSize = Integer.MIN_VALUE;
  this.margin = LayoutConstants.DEFAULT_GRAPH_MARGIN;
  this.edges = [];
  this.nodes = [];
  this.isConnected = false;
  this.parent = parent;

  if (obj2 != null && obj2 instanceof LGraphManager) {
    this.graphManager = obj2;
  }
  else if (obj2 != null && obj2 instanceof Layout) {
    this.graphManager = obj2.graphManager;
  }
}

LGraph.prototype = Object.create(LGraphObject.prototype);
for (var prop in LGraphObject) {
  LGraph[prop] = LGraphObject[prop];
}

LGraph.prototype.getNodes = function () {
  return this.nodes;
};

LGraph.prototype.getEdges = function () {
  return this.edges;
};

LGraph.prototype.getGraphManager = function ()
{
  return this.graphManager;
};

LGraph.prototype.getParent = function ()
{
  return this.parent;
};

LGraph.prototype.getLeft = function ()
{
  return this.left;
};

LGraph.prototype.getRight = function ()
{
  return this.right;
};

LGraph.prototype.getTop = function ()
{
  return this.top;
};

LGraph.prototype.getBottom = function ()
{
  return this.bottom;
};

LGraph.prototype.isConnected = function ()
{
  return this.isConnected;
};

LGraph.prototype.add = function (obj1, sourceNode, targetNode) {
  if (sourceNode == null && targetNode == null) {
    var newNode = obj1;
    if (this.graphManager == null) {
      throw "Graph has no graph mgr!";
    }
    if (this.getNodes().indexOf(newNode) > -1) {
      throw "Node already in graph!";
    }
    newNode.owner = this;
    this.getNodes().push(newNode);

    return newNode;
  }
  else {
    var newEdge = obj1;
    if (!(this.getNodes().indexOf(sourceNode) > -1 && (this.getNodes().indexOf(targetNode)) > -1)) {
      throw "Source or target not in graph!";
    }

    if (!(sourceNode.owner == targetNode.owner && sourceNode.owner == this)) {
      throw "Both owners must be this graph!";
    }

    if (sourceNode.owner != targetNode.owner)
    {
      return null;
    }

    // set source and target
    newEdge.source = sourceNode;
    newEdge.target = targetNode;

    // set as intra-graph edge
    newEdge.isInterGraph = false;

    // add to graph edge list
    this.getEdges().push(newEdge);

    // add to incidency lists
    sourceNode.edges.push(newEdge);

    if (targetNode != sourceNode)
    {
      targetNode.edges.push(newEdge);
    }

    return newEdge;
  }
};

LGraph.prototype.remove = function (obj) {
  var node = obj;
  if (obj instanceof LNode) {
    if (node == null) {
      throw "Node is null!";
    }
    if (!(node.owner != null && node.owner == this)) {
      throw "Owner graph is invalid!";
    }
    if (this.graphManager == null) {
      throw "Owner graph manager is invalid!";
    }
    // remove incident edges first (make a copy to do it safely)
    var edgesToBeRemoved = node.edges.slice();
    var edge;
    var s = edgesToBeRemoved.length;
    for (var i = 0; i < s; i++)
    {
      edge = edgesToBeRemoved[i];

      if (edge.isInterGraph)
      {
        this.graphManager.remove(edge);
      }
      else
      {
        edge.source.owner.remove(edge);
      }
    }

    // now the node itself
    var index = this.nodes.indexOf(node);
    if (index == -1) {
      throw "Node not in owner node list!";
    }

    this.nodes.splice(index, 1);
  }
  else if (obj instanceof LEdge) {
    var edge = obj;
    if (edge == null) {
      throw "Edge is null!";
    }
    if (!(edge.source != null && edge.target != null)) {
      throw "Source and/or target is null!";
    }
    if (!(edge.source.owner != null && edge.target.owner != null &&
            edge.source.owner == this && edge.target.owner == this)) {
      throw "Source and/or target owner is invalid!";
    }

    var sourceIndex = edge.source.edges.indexOf(edge);
    var targetIndex = edge.target.edges.indexOf(edge);
    if (!(sourceIndex > -1 && targetIndex > -1)) {
      throw "Source and/or target doesn't know this edge!";
    }

    edge.source.edges.splice(sourceIndex, 1);

    if (edge.target != edge.source)
    {
      edge.target.edges.splice(targetIndex, 1);
    }

    var index = edge.source.owner.getEdges().indexOf(edge);
    if (index == -1) {
      throw "Not in owner's edge list!";
    }

    edge.source.owner.getEdges().splice(index, 1);
  }
};

LGraph.prototype.updateLeftTop = function ()
{
  var top = Integer.MAX_VALUE;
  var left = Integer.MAX_VALUE;
  var nodeTop;
  var nodeLeft;

  var nodes = this.getNodes();
  var s = nodes.length;

  for (var i = 0; i < s; i++)
  {
    var lNode = nodes[i];
    nodeTop = Math.floor(lNode.getTop());
    nodeLeft = Math.floor(lNode.getLeft());

    if (top > nodeTop)
    {
      top = nodeTop;
    }

    if (left > nodeLeft)
    {
      left = nodeLeft;
    }
  }

  // Do we have any nodes in this graph?
  if (top == Integer.MAX_VALUE)
  {
    return null;
  }

  this.left = left - this.margin;
  this.top = top - this.margin;

  // Apply the margins and return the result
  return new Point(this.left, this.top);
};

LGraph.prototype.updateBounds = function (recursive)
{
  // calculate bounds
  var left = Integer.MAX_VALUE;
  var right = -Integer.MAX_VALUE;
  var top = Integer.MAX_VALUE;
  var bottom = -Integer.MAX_VALUE;
  var nodeLeft;
  var nodeRight;
  var nodeTop;
  var nodeBottom;

  var nodes = this.nodes;
  var s = nodes.length;
  for (var i = 0; i < s; i++)
  {
    var lNode = nodes[i];

    if (recursive && lNode.child != null)
    {
      lNode.updateBounds();
    }
    nodeLeft = Math.floor(lNode.getLeft());
    nodeRight = Math.floor(lNode.getRight());
    nodeTop = Math.floor(lNode.getTop());
    nodeBottom = Math.floor(lNode.getBottom());

    if (left > nodeLeft)
    {
      left = nodeLeft;
    }

    if (right < nodeRight)
    {
      right = nodeRight;
    }

    if (top > nodeTop)
    {
      top = nodeTop;
    }

    if (bottom < nodeBottom)
    {
      bottom = nodeBottom;
    }
  }

  var boundingRect = new RectangleD(left, top, right - left, bottom - top);
  if (left == Integer.MAX_VALUE)
  {
    this.left = Math.floor(this.parent.getLeft());
    this.right = Math.floor(this.parent.getRight());
    this.top = Math.floor(this.parent.getTop());
    this.bottom = Math.floor(this.parent.getBottom());
  }

  this.left = boundingRect.x - this.margin;
  this.right = boundingRect.x + boundingRect.width + this.margin;
  this.top = boundingRect.y - this.margin;
  this.bottom = boundingRect.y + boundingRect.height + this.margin;
};

LGraph.calculateBounds = function (nodes)
{
  var left = Integer.MAX_VALUE;
  var right = -Integer.MAX_VALUE;
  var top = Integer.MAX_VALUE;
  var bottom = -Integer.MAX_VALUE;
  var nodeLeft;
  var nodeRight;
  var nodeTop;
  var nodeBottom;

  var s = nodes.length;

  for (var i = 0; i < s; i++)
  {
    var lNode = nodes[i];
    nodeLeft = Math.floor(lNode.getLeft());
    nodeRight = Math.floor(lNode.getRight());
    nodeTop = Math.floor(lNode.getTop());
    nodeBottom = Math.floor(lNode.getBottom());

    if (left > nodeLeft)
    {
      left = nodeLeft;
    }

    if (right < nodeRight)
    {
      right = nodeRight;
    }

    if (top > nodeTop)
    {
      top = nodeTop;
    }

    if (bottom < nodeBottom)
    {
      bottom = nodeBottom;
    }
  }

  var boundingRect = new RectangleD(left, top, right - left, bottom - top);

  return boundingRect;
};

LGraph.prototype.getInclusionTreeDepth = function ()
{
  if (this == this.graphManager.getRoot())
  {
    return 1;
  }
  else
  {
    return this.parent.getInclusionTreeDepth();
  }
};

LGraph.prototype.getEstimatedSize = function ()
{
  if (this.estimatedSize == Integer.MIN_VALUE) {
    throw "assert failed";
  }
  return this.estimatedSize;
};

LGraph.prototype.calcEstimatedSize = function ()
{
  var size = 0;
  var nodes = this.nodes;
  var s = nodes.length;

  for (var i = 0; i < s; i++)
  {
    var lNode = nodes[i];
    size += lNode.calcEstimatedSize();
  }

  if (size == 0)
  {
    this.estimatedSize = LayoutConstants.EMPTY_COMPOUND_NODE_SIZE;
  }
  else
  {
    this.estimatedSize = Math.floor(size / Math.sqrt(this.nodes.length));
  }

  return Math.floor(this.estimatedSize);
};

LGraph.prototype.updateConnected = function ()
{
  if (this.nodes.length == 0)
  {
    this.isConnected = true;
    return;
  }

  var toBeVisited = [];
  var visited = new HashSet();
  var currentNode = this.nodes[0];
  var neighborEdges;
  var currentNeighbor;
  toBeVisited = toBeVisited.concat(currentNode.withChildren());

  while (toBeVisited.length > 0)
  {
    currentNode = toBeVisited.shift();
    visited.add(currentNode);

    // Traverse all neighbors of this node
    neighborEdges = currentNode.getEdges();
    var s = neighborEdges.length;
    for (var i = 0; i < s; i++)
    {
      var neighborEdge = neighborEdges[i];
      currentNeighbor =
              neighborEdge.getOtherEndInGraph(currentNode, this);

      // Add unvisited neighbors to the list to visit
      if (currentNeighbor != null &&
              !visited.contains(currentNeighbor))
      {
        toBeVisited = toBeVisited.concat(currentNeighbor.withChildren());
      }
    }
  }

  this.isConnected = false;

  if (visited.size() >= this.nodes.length)
  {
    var noOfVisitedInThisGraph = 0;

    var s = visited.size();
    for (var visitedId in visited.set)
    {
      var visitedNode = visited.set[visitedId];
      if (visitedNode.owner == this)
      {
        noOfVisitedInThisGraph++;
      }
    }

    if (noOfVisitedInThisGraph == this.nodes.length)
    {
      this.isConnected = true;
    }
  }
};

module.exports = LGraph;

},{"./Integer":16,"./LGraphManager":19,"./LGraphObject":20,"./LNode":21,"./LayoutConstants":23}],19:[function(_dereq_,module,exports){
function LGraphManager(layout) {
  this.layout = layout;

  this.graphs = [];
  this.edges = [];
}

LGraphManager.prototype.addRoot = function ()
{
  var ngraph = this.layout.newGraph();
  var nnode = this.layout.newNode(null);
  var root = this.add(ngraph, nnode);
  this.setRootGraph(root);
  return this.rootGraph;
};

LGraphManager.prototype.add = function (newGraph, parentNode, newEdge, sourceNode, targetNode)
{
  //there are just 2 parameters are passed then it adds an LGraph else it adds an LEdge
  if (newEdge == null && sourceNode == null && targetNode == null) {
    if (newGraph == null) {
      throw "Graph is null!";
    }
    if (parentNode == null) {
      throw "Parent node is null!";
    }
    if (this.graphs.indexOf(newGraph) > -1) {
      throw "Graph already in this graph mgr!";
    }

    this.graphs.push(newGraph);

    if (newGraph.parent != null) {
      throw "Already has a parent!";
    }
    if (parentNode.child != null) {
      throw  "Already has a child!";
    }

    newGraph.parent = parentNode;
    parentNode.child = newGraph;

    return newGraph;
  }
  else {
    //change the order of the parameters
    targetNode = newEdge;
    sourceNode = parentNode;
    newEdge = newGraph;
    var sourceGraph = sourceNode.getOwner();
    var targetGraph = targetNode.getOwner();

    if (!(sourceGraph != null && sourceGraph.getGraphManager() == this)) {
      throw "Source not in this graph mgr!";
    }
    if (!(targetGraph != null && targetGraph.getGraphManager() == this)) {
      throw "Target not in this graph mgr!";
    }

    if (sourceGraph == targetGraph)
    {
      newEdge.isInterGraph = false;
      return sourceGraph.add(newEdge, sourceNode, targetNode);
    }
    else
    {
      newEdge.isInterGraph = true;

      // set source and target
      newEdge.source = sourceNode;
      newEdge.target = targetNode;

      // add edge to inter-graph edge list
      if (this.edges.indexOf(newEdge) > -1) {
        throw "Edge already in inter-graph edge list!";
      }

      this.edges.push(newEdge);

      // add edge to source and target incidency lists
      if (!(newEdge.source != null && newEdge.target != null)) {
        throw "Edge source and/or target is null!";
      }

      if (!(newEdge.source.edges.indexOf(newEdge) == -1 && newEdge.target.edges.indexOf(newEdge) == -1)) {
        throw "Edge already in source and/or target incidency list!";
      }

      newEdge.source.edges.push(newEdge);
      newEdge.target.edges.push(newEdge);

      return newEdge;
    }
  }
};

LGraphManager.prototype.remove = function (lObj) {
  if (lObj instanceof LGraph) {
    var graph = lObj;
    if (graph.getGraphManager() != this) {
      throw "Graph not in this graph mgr";
    }
    if (!(graph == this.rootGraph || (graph.parent != null && graph.parent.graphManager == this))) {
      throw "Invalid parent node!";
    }

    // first the edges (make a copy to do it safely)
    var edgesToBeRemoved = [];

    edgesToBeRemoved = edgesToBeRemoved.concat(graph.getEdges());

    var edge;
    var s = edgesToBeRemoved.length;
    for (var i = 0; i < s; i++)
    {
      edge = edgesToBeRemoved[i];
      graph.remove(edge);
    }

    // then the nodes (make a copy to do it safely)
    var nodesToBeRemoved = [];

    nodesToBeRemoved = nodesToBeRemoved.concat(graph.getNodes());

    var node;
    s = nodesToBeRemoved.length;
    for (var i = 0; i < s; i++)
    {
      node = nodesToBeRemoved[i];
      graph.remove(node);
    }

    // check if graph is the root
    if (graph == this.rootGraph)
    {
      this.setRootGraph(null);
    }

    // now remove the graph itself
    var index = this.graphs.indexOf(graph);
    this.graphs.splice(index, 1);

    // also reset the parent of the graph
    graph.parent = null;
  }
  else if (lObj instanceof LEdge) {
    edge = lObj;
    if (edge == null) {
      throw "Edge is null!";
    }
    if (!edge.isInterGraph) {
      throw "Not an inter-graph edge!";
    }
    if (!(edge.source != null && edge.target != null)) {
      throw "Source and/or target is null!";
    }

    // remove edge from source and target nodes' incidency lists

    if (!(edge.source.edges.indexOf(edge) != -1 && edge.target.edges.indexOf(edge) != -1)) {
      throw "Source and/or target doesn't know this edge!";
    }

    var index = edge.source.edges.indexOf(edge);
    edge.source.edges.splice(index, 1);
    index = edge.target.edges.indexOf(edge);
    edge.target.edges.splice(index, 1);

    // remove edge from owner graph manager's inter-graph edge list

    if (!(edge.source.owner != null && edge.source.owner.getGraphManager() != null)) {
      throw "Edge owner graph or owner graph manager is null!";
    }
    if (edge.source.owner.getGraphManager().edges.indexOf(edge) == -1) {
      throw "Not in owner graph manager's edge list!";
    }

    var index = edge.source.owner.getGraphManager().edges.indexOf(edge);
    edge.source.owner.getGraphManager().edges.splice(index, 1);
  }
};

LGraphManager.prototype.updateBounds = function ()
{
  this.rootGraph.updateBounds(true);
};

LGraphManager.prototype.getGraphs = function ()
{
  return this.graphs;
};

LGraphManager.prototype.getAllNodes = function ()
{
  if (this.allNodes == null)
  {
    var nodeList = [];
    var graphs = this.getGraphs();
    var s = graphs.length;
    for (var i = 0; i < s; i++)
    {
      nodeList = nodeList.concat(graphs[i].getNodes());
    }
    this.allNodes = nodeList;
  }
  return this.allNodes;
};

LGraphManager.prototype.resetAllNodes = function ()
{
  this.allNodes = null;
};

LGraphManager.prototype.resetAllEdges = function ()
{
  this.allEdges = null;
};

LGraphManager.prototype.resetAllNodesToApplyGravitation = function ()
{
  this.allNodesToApplyGravitation = null;
};

LGraphManager.prototype.getAllEdges = function ()
{
  if (this.allEdges == null)
  {
    var edgeList = [];
    var graphs = this.getGraphs();
    var s = graphs.length;
    for (var i = 0; i < graphs.length; i++)
    {
      edgeList = edgeList.concat(graphs[i].getEdges());
    }

    edgeList = edgeList.concat(this.edges);

    this.allEdges = edgeList;
  }
  return this.allEdges;
};

LGraphManager.prototype.getAllNodesToApplyGravitation = function ()
{
  return this.allNodesToApplyGravitation;
};

LGraphManager.prototype.setAllNodesToApplyGravitation = function (nodeList)
{
  if (this.allNodesToApplyGravitation != null) {
    throw "assert failed";
  }

  this.allNodesToApplyGravitation = nodeList;
};

LGraphManager.prototype.getRoot = function ()
{
  return this.rootGraph;
};

LGraphManager.prototype.setRootGraph = function (graph)
{
  if (graph.getGraphManager() != this) {
    throw "Root not in this graph mgr!";
  }

  this.rootGraph = graph;
  // root graph must have a root node associated with it for convenience
  if (graph.parent == null)
  {
    graph.parent = this.layout.newNode("Root node");
  }
};

LGraphManager.prototype.getLayout = function ()
{
  return this.layout;
};

LGraphManager.prototype.isOneAncestorOfOther = function (firstNode, secondNode)
{
  if (!(firstNode != null && secondNode != null)) {
    throw "assert failed";
  }

  if (firstNode == secondNode)
  {
    return true;
  }
  // Is second node an ancestor of the first one?
  var ownerGraph = firstNode.getOwner();
  var parentNode;

  do
  {
    parentNode = ownerGraph.getParent();

    if (parentNode == null)
    {
      break;
    }

    if (parentNode == secondNode)
    {
      return true;
    }

    ownerGraph = parentNode.getOwner();
    if (ownerGraph == null)
    {
      break;
    }
  } while (true);
  // Is first node an ancestor of the second one?
  ownerGraph = secondNode.getOwner();

  do
  {
    parentNode = ownerGraph.getParent();

    if (parentNode == null)
    {
      break;
    }

    if (parentNode == firstNode)
    {
      return true;
    }

    ownerGraph = parentNode.getOwner();
    if (ownerGraph == null)
    {
      break;
    }
  } while (true);

  return false;
};

LGraphManager.prototype.calcLowestCommonAncestors = function ()
{
  var edge;
  var sourceNode;
  var targetNode;
  var sourceAncestorGraph;
  var targetAncestorGraph;

  var edges = this.getAllEdges();
  var s = edges.length;
  for (var i = 0; i < s; i++)
  {
    edge = edges[i];

    sourceNode = edge.source;
    targetNode = edge.target;
    edge.lca = null;
    edge.sourceInLca = sourceNode;
    edge.targetInLca = targetNode;

    if (sourceNode == targetNode)
    {
      edge.lca = sourceNode.getOwner();
      continue;
    }

    sourceAncestorGraph = sourceNode.getOwner();

    while (edge.lca == null)
    {
      targetAncestorGraph = targetNode.getOwner();

      while (edge.lca == null)
      {
        if (targetAncestorGraph == sourceAncestorGraph)
        {
          edge.lca = targetAncestorGraph;
          break;
        }

        if (targetAncestorGraph == this.rootGraph)
        {
          break;
        }

        if (edge.lca != null) {
          throw "assert failed";
        }
        edge.targetInLca = targetAncestorGraph.getParent();
        targetAncestorGraph = edge.targetInLca.getOwner();
      }

      if (sourceAncestorGraph == this.rootGraph)
      {
        break;
      }

      if (edge.lca == null)
      {
        edge.sourceInLca = sourceAncestorGraph.getParent();
        sourceAncestorGraph = edge.sourceInLca.getOwner();
      }
    }

    if (edge.lca == null) {
      throw "assert failed";
    }
  }
};

LGraphManager.prototype.calcLowestCommonAncestor = function (firstNode, secondNode)
{
  if (firstNode == secondNode)
  {
    return firstNode.getOwner();
  }
  var firstOwnerGraph = firstNode.getOwner();

  do
  {
    if (firstOwnerGraph == null)
    {
      break;
    }
    var secondOwnerGraph = secondNode.getOwner();

    do
    {
      if (secondOwnerGraph == null)
      {
        break;
      }

      if (secondOwnerGraph == firstOwnerGraph)
      {
        return secondOwnerGraph;
      }
      secondOwnerGraph = secondOwnerGraph.getParent().getOwner();
    } while (true);

    firstOwnerGraph = firstOwnerGraph.getParent().getOwner();
  } while (true);

  return firstOwnerGraph;
};

LGraphManager.prototype.calcInclusionTreeDepths = function (graph, depth) {
  if (graph == null && depth == null) {
    graph = this.rootGraph;
    depth = 1;
  }
  var node;

  var nodes = graph.getNodes();
  var s = nodes.length;
  for (var i = 0; i < s; i++)
  {
    node = nodes[i];
    node.inclusionTreeDepth = depth;

    if (node.child != null)
    {
      this.calcInclusionTreeDepths(node.child, depth + 1);
    }
  }
};

LGraphManager.prototype.includesInvalidEdge = function ()
{
  var edge;

  var s = this.edges.length;
  for (var i = 0; i < s; i++)
  {
    edge = this.edges[i];

    if (this.isOneAncestorOfOther(edge.source, edge.target))
    {
      return true;
    }
  }
  return false;
};

module.exports = LGraphManager;

},{}],20:[function(_dereq_,module,exports){
function LGraphObject(vGraphObject) {
  this.vGraphObject = vGraphObject;
}

module.exports = LGraphObject;

},{}],21:[function(_dereq_,module,exports){
var LGraphObject = _dereq_('./LGraphObject');
var Integer = _dereq_('./Integer');
var RectangleD = _dereq_('./RectangleD');

function LNode(gm, loc, size, vNode) {
  //Alternative constructor 1 : LNode(LGraphManager gm, Point loc, Dimension size, Object vNode)
  if (size == null && vNode == null) {
    vNode = loc;
  }

  LGraphObject.call(this, vNode);

  //Alternative constructor 2 : LNode(Layout layout, Object vNode)
  if (gm.graphManager != null)
    gm = gm.graphManager;

  this.estimatedSize = Integer.MIN_VALUE;
  this.inclusionTreeDepth = Integer.MAX_VALUE;
  this.vGraphObject = vNode;
  this.edges = [];
  this.graphManager = gm;

  if (size != null && loc != null)
    this.rect = new RectangleD(loc.x, loc.y, size.width, size.height);
  else
    this.rect = new RectangleD();
}

LNode.prototype = Object.create(LGraphObject.prototype);
for (var prop in LGraphObject) {
  LNode[prop] = LGraphObject[prop];
}

LNode.prototype.getEdges = function ()
{
  return this.edges;
};

LNode.prototype.getChild = function ()
{
  return this.child;
};

LNode.prototype.getOwner = function ()
{
  if (this.owner != null) {
    if (!(this.owner == null || this.owner.getNodes().indexOf(this) > -1)) {
      throw "assert failed";
    }
  }

  return this.owner;
};

LNode.prototype.getWidth = function ()
{
  return this.rect.width;
};

LNode.prototype.setWidth = function (width)
{
  this.rect.width = width;
};

LNode.prototype.getHeight = function ()
{
  return this.rect.height;
};

LNode.prototype.setHeight = function (height)
{
  this.rect.height = height;
};

LNode.prototype.getCenterX = function ()
{
  return this.rect.x + this.rect.width / 2;
};

LNode.prototype.getCenterY = function ()
{
  return this.rect.y + this.rect.height / 2;
};

LNode.prototype.getCenter = function ()
{
  return new PointD(this.rect.x + this.rect.width / 2,
          this.rect.y + this.rect.height / 2);
};

LNode.prototype.getLocation = function ()
{
  return new PointD(this.rect.x, this.rect.y);
};

LNode.prototype.getRect = function ()
{
  return this.rect;
};

LNode.prototype.getDiagonal = function ()
{
  return Math.sqrt(this.rect.width * this.rect.width +
          this.rect.height * this.rect.height);
};

LNode.prototype.setRect = function (upperLeft, dimension)
{
  this.rect.x = upperLeft.x;
  this.rect.y = upperLeft.y;
  this.rect.width = dimension.width;
  this.rect.height = dimension.height;
};

LNode.prototype.setCenter = function (cx, cy)
{
  this.rect.x = cx - this.rect.width / 2;
  this.rect.y = cy - this.rect.height / 2;
};

LNode.prototype.setLocation = function (x, y)
{
  this.rect.x = x;
  this.rect.y = y;
};

LNode.prototype.moveBy = function (dx, dy)
{
  this.rect.x += dx;
  this.rect.y += dy;
};

LNode.prototype.getEdgeListToNode = function (to)
{
  var edgeList = [];
  var edge;

  for (var obj in this.edges)
  {
    edge = obj;

    if (edge.target == to)
    {
      if (edge.source != this)
        throw "Incorrect edge source!";

      edgeList.push(edge);
    }
  }

  return edgeList;
};

LNode.prototype.getEdgesBetween = function (other)
{
  var edgeList = [];
  var edge;

  for (var obj in this.edges)
  {
    edge = this.edges[obj];

    if (!(edge.source == this || edge.target == this))
      throw "Incorrect edge source and/or target";

    if ((edge.target == other) || (edge.source == other))
    {
      edgeList.push(edge);
    }
  }

  return edgeList;
};

LNode.prototype.getNeighborsList = function ()
{
  var neighbors = new HashSet();
  var edge;

  for (var obj in this.edges)
  {
    edge = this.edges[obj];

    if (edge.source == this)
    {
      neighbors.add(edge.target);
    }
    else
    {
      if (!edge.target == this)
        throw "Incorrect incidency!";
      neighbors.add(edge.source);
    }
  }

  return neighbors;
};

LNode.prototype.withChildren = function ()
{
  var withNeighborsList = [];
  var childNode;

  withNeighborsList.push(this);

  if (this.child != null)
  {
    var nodes = this.child.getNodes();
    for (var i = 0; i < nodes.length; i++)
    {
      childNode = nodes[i];

      withNeighborsList = withNeighborsList.concat(childNode.withChildren());
    }
  }

  return withNeighborsList;
};

LNode.prototype.getEstimatedSize = function () {
  if (this.estimatedSize == Integer.MIN_VALUE) {
    throw "assert failed";
  }
  return this.estimatedSize;
};

LNode.prototype.calcEstimatedSize = function () {
  if (this.child == null)
  {
    return this.estimatedSize = Math.floor((this.rect.width + this.rect.height) / 2);
  }
  else
  {
    this.estimatedSize = this.child.calcEstimatedSize();
    this.rect.width = this.estimatedSize;
    this.rect.height = this.estimatedSize;

    return this.estimatedSize;
  }
};

LNode.prototype.scatter = function () {
  var randomCenterX;
  var randomCenterY;

  var minX = -LayoutConstants.INITIAL_WORLD_BOUNDARY;
  var maxX = LayoutConstants.INITIAL_WORLD_BOUNDARY;
  randomCenterX = LayoutConstants.WORLD_CENTER_X +
          (RandomSeed.nextDouble() * (maxX - minX)) + minX;

  var minY = -LayoutConstants.INITIAL_WORLD_BOUNDARY;
  var maxY = LayoutConstants.INITIAL_WORLD_BOUNDARY;
  randomCenterY = LayoutConstants.WORLD_CENTER_Y +
          (RandomSeed.nextDouble() * (maxY - minY)) + minY;

  this.rect.x = randomCenterX;
  this.rect.y = randomCenterY
};

LNode.prototype.updateBounds = function () {
  if (this.getChild() == null) {
    throw "assert failed";
  }
  if (this.getChild().getNodes().length != 0)
  {
    // wrap the children nodes by re-arranging the boundaries
    var childGraph = this.getChild();
    childGraph.updateBounds(true);

    this.rect.x = childGraph.getLeft();
    this.rect.y = childGraph.getTop();

    this.setWidth(childGraph.getRight() - childGraph.getLeft() +
            2 * LayoutConstants.COMPOUND_NODE_MARGIN);
    this.setHeight(childGraph.getBottom() - childGraph.getTop() +
            2 * LayoutConstants.COMPOUND_NODE_MARGIN +
            LayoutConstants.LABEL_HEIGHT);
  }
};

LNode.prototype.getInclusionTreeDepth = function ()
{
  if (this.inclusionTreeDepth == Integer.MAX_VALUE) {
    throw "assert failed";
  }
  return this.inclusionTreeDepth;
};

LNode.prototype.transform = function (trans)
{
  var left = this.rect.x;

  if (left > LayoutConstants.WORLD_BOUNDARY)
  {
    left = LayoutConstants.WORLD_BOUNDARY;
  }
  else if (left < -LayoutConstants.WORLD_BOUNDARY)
  {
    left = -LayoutConstants.WORLD_BOUNDARY;
  }

  var top = this.rect.y;

  if (top > LayoutConstants.WORLD_BOUNDARY)
  {
    top = LayoutConstants.WORLD_BOUNDARY;
  }
  else if (top < -LayoutConstants.WORLD_BOUNDARY)
  {
    top = -LayoutConstants.WORLD_BOUNDARY;
  }

  var leftTop = new PointD(left, top);
  var vLeftTop = trans.inverseTransformPoint(leftTop);

  this.setLocation(vLeftTop.x, vLeftTop.y);
};

LNode.prototype.getLeft = function ()
{
  return this.rect.x;
};

LNode.prototype.getRight = function ()
{
  return this.rect.x + this.rect.width;
};

LNode.prototype.getTop = function ()
{
  return this.rect.y;
};

LNode.prototype.getBottom = function ()
{
  return this.rect.y + this.rect.height;
};

LNode.prototype.getParent = function ()
{
  if (this.owner == null)
  {
    return null;
  }

  return this.owner.getParent();
};

module.exports = LNode;

},{"./Integer":16,"./LGraphObject":20,"./RectangleD":27}],22:[function(_dereq_,module,exports){
var LayoutConstants = _dereq_('./LayoutConstants');
var HashMap = _dereq_('./HashMap');
var LGraphManager = _dereq_('./LGraphManager');

function Layout(isRemoteUse) {
  //Layout Quality: 0:proof, 1:default, 2:draft
  this.layoutQuality = LayoutConstants.DEFAULT_QUALITY;
  //Whether layout should create bendpoints as needed or not
  this.createBendsAsNeeded =
          LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
  //Whether layout should be incremental or not
  this.incremental = LayoutConstants.DEFAULT_INCREMENTAL;
  //Whether we animate from before to after layout node positions
  this.animationOnLayout =
          LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT;
  //Whether we animate the layout process or not
  this.animationDuringLayout = LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT;
  //Number iterations that should be done between two successive animations
  this.animationPeriod = LayoutConstants.DEFAULT_ANIMATION_PERIOD;
  /**
   * Whether or not leaf nodes (non-compound nodes) are of uniform sizes. When
   * they are, both spring and repulsion forces between two leaf nodes can be
   * calculated without the expensive clipping point calculations, resulting
   * in major speed-up.
   */
  this.uniformLeafNodeSizes =
          LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES;
  /**
   * This is used for creation of bendpoints by using dummy nodes and edges.
   * Maps an LEdge to its dummy bendpoint path.
   */
  this.edgeToDummyNodes = new HashMap();
  this.graphManager = new LGraphManager(this);
  this.isLayoutFinished = false;
  this.isSubLayout = false;
  this.isRemoteUse = false;

  if (isRemoteUse != null) {
    this.isRemoteUse = isRemoteUse;
  }
}

Layout.RANDOM_SEED = 1;

Layout.prototype.getGraphManager = function () {
  return this.graphManager;
};

Layout.prototype.getAllNodes = function () {
  return this.graphManager.getAllNodes();
};

Layout.prototype.getAllEdges = function () {
  return this.graphManager.getAllEdges();
};

Layout.prototype.getAllNodesToApplyGravitation = function () {
  return this.graphManager.getAllNodesToApplyGravitation();
};

Layout.prototype.newGraphManager = function () {
  var gm = new LGraphManager(this);
  this.graphManager = gm;
  return gm;
};

Layout.prototype.newGraph = function (vGraph)
{
  return new LGraph(null, this.graphManager, vGraph);
};

Layout.prototype.newNode = function (vNode)
{
  return new LNode(this.graphManager, vNode);
};

Layout.prototype.newEdge = function (vEdge)
{
  return new LEdge(null, null, vEdge);
};

Layout.prototype.runLayout = function ()
{
  this.isLayoutFinished = false;

  this.initParameters();
  var isLayoutSuccessfull;

  if ((this.graphManager.getRoot() == null)
          || this.graphManager.getRoot().getNodes().length == 0
          || this.graphManager.includesInvalidEdge())
  {
    isLayoutSuccessfull = false;
  }
  else
  {
    // calculate execution time
    var startTime = 0;

    if (!this.isSubLayout)
    {
      startTime = new Date().getTime()
    }

    isLayoutSuccessfull = this.layout();

    if (!this.isSubLayout)
    {
      var endTime = new Date().getTime();
      var excTime = endTime - startTime;

      console.log("Total execution time: " + excTime + " miliseconds.");
    }
  }

  if (isLayoutSuccessfull)
  {
    if (!this.isSubLayout)
    {
      this.doPostLayout();
    }
  }

  this.isLayoutFinished = true;

  return isLayoutSuccessfull;
};

/**
 * This method performs the operations required after layout.
 */
Layout.prototype.doPostLayout = function ()
{
  //assert !isSubLayout : "Should not be called on sub-layout!";
  // Propagate geometric changes to v-level objects
  this.transform();
  this.update();
};

/**
 * This method updates the geometry of the target graph according to
 * calculated layout.
 */
Layout.prototype.update2 = function () {
  // update bend points
  if (this.createBendsAsNeeded)
  {
    this.createBendpointsFromDummyNodes();

    // reset all edges, since the topology has changed
    this.graphManager.resetAllEdges();
  }

  // perform edge, node and root updates if layout is not called
  // remotely
  if (!this.isRemoteUse)
  {
    // update all edges
    var edge;
    var allEdges = this.graphManager.getAllEdges();
    for (var i = 0; i < allEdges.length; i++)
    {
      edge = allEdges[i];
//      this.update(edge);
    }

    // recursively update nodes
    var node;
    var nodes = this.graphManager.getRoot().getNodes();
    for (var i = 0; i < nodes.length; i++)
    {
      node = nodes[i];
//      this.update(node);
    }

    // update root graph
    this.update(this.graphManager.getRoot());
  }
};

Layout.prototype.update = function (obj) {
  if (obj == null) {
    this.update2();
  }
  else if (obj instanceof LNode) {
    var node = obj;
    if (node.getChild() != null)
    {
      // since node is compound, recursively update child nodes
      var nodes = node.getChild().getNodes();
      for (var i = 0; i < nodes.length; i++)
      {
        update(nodes[i]);
      }
    }

    // if the l-level node is associated with a v-level graph object,
    // then it is assumed that the v-level node implements the
    // interface Updatable.
    if (node.vGraphObject != null)
    {
      // cast to Updatable without any type check
      var vNode = node.vGraphObject;

      // call the update method of the interface
      vNode.update(node);
    }
  }
  else if (obj instanceof LEdge) {
    var edge = obj;
    // if the l-level edge is associated with a v-level graph object,
    // then it is assumed that the v-level edge implements the
    // interface Updatable.

    if (edge.vGraphObject != null)
    {
      // cast to Updatable without any type check
      var vEdge = edge.vGraphObject;

      // call the update method of the interface
      vEdge.update(edge);
    }
  }
  else if (obj instanceof LGraph) {
    var graph = obj;
    // if the l-level graph is associated with a v-level graph object,
    // then it is assumed that the v-level object implements the
    // interface Updatable.

    if (graph.vGraphObject != null)
    {
      // cast to Updatable without any type check
      var vGraph = graph.vGraphObject;

      // call the update method of the interface
      vGraph.update(graph);
    }
  }
};

/**
 * This method is used to set all layout parameters to default values
 * determined at compile time.
 */
Layout.prototype.initParameters = function () {
  if (!this.isSubLayout)
  {
    this.layoutQuality = layoutOptionsPack.layoutQuality;
    this.animationDuringLayout = layoutOptionsPack.animationDuringLayout;
    this.animationPeriod = Math.floor(Layout.transform(layoutOptionsPack.animationPeriod,
            LayoutConstants.DEFAULT_ANIMATION_PERIOD));
    this.animationOnLayout = layoutOptionsPack.animationOnLayout;
    this.incremental = layoutOptionsPack.incremental;
    this.createBendsAsNeeded = layoutOptionsPack.createBendsAsNeeded;
    this.uniformLeafNodeSizes = layoutOptionsPack.uniformLeafNodeSizes;
  }

  if (this.animationDuringLayout)
  {
    animationOnLayout = false;
  }
};

Layout.prototype.transform = function (newLeftTop) {
  if (newLeftTop == undefined) {
    this.transform(new PointD(0, 0));
  }
  else {
    // create a transformation object (from Eclipse to layout). When an
    // inverse transform is applied, we get upper-left coordinate of the
    // drawing or the root graph at given input coordinate (some margins
    // already included in calculation of left-top).

    var trans = new Transform();
    var leftTop = this.graphManager.getRoot().updateLeftTop();

    if (leftTop != null)
    {
      trans.setWorldOrgX(newLeftTop.x);
      trans.setWorldOrgY(newLeftTop.y);

      trans.setDeviceOrgX(leftTop.x);
      trans.setDeviceOrgY(leftTop.y);

      var nodes = this.getAllNodes();
      var node;

      for (var i = 0; i < nodes.length; i++)
      {
        node = nodes[i];
        node.transform(trans);
      }
    }
  }
};

Layout.prototype.positionNodesRandomly = function (graph) {

  if (graph == undefined) {
    //assert !this.incremental;
    this.positionNodesRandomly(this.getGraphManager().getRoot());
    this.getGraphManager().getRoot().updateBounds(true);
  }
  else {
    var lNode;
    var childGraph;

    var nodes = graph.getNodes();
    for (var i = 0; i < nodes.length; i++)
    {
      lNode = nodes[i];
      childGraph = lNode.getChild();

      if (childGraph == null)
      {
        lNode.scatter();
      }
      else if (childGraph.getNodes().length == 0)
      {
        lNode.scatter();
      }
      else
      {
        this.positionNodesRandomly(childGraph);
        lNode.updateBounds();
      }
    }
  }
};

/**
 * This method returns a list of trees where each tree is represented as a
 * list of l-nodes. The method returns a list of size 0 when:
 * - The graph is not flat or
 * - One of the component(s) of the graph is not a tree.
 */
Layout.prototype.getFlatForest = function ()
{
  var flatForest = [];
  var isForest = true;

  // Quick reference for all nodes in the graph manager associated with
  // this layout. The list should not be changed.
  var allNodes = this.graphManager.getRoot().getNodes();

  // First be sure that the graph is flat
  var isFlat = true;

  for (var i = 0; i < allNodes.length; i++)
  {
    if (allNodes[i].getChild() != null)
    {
      isFlat = false;
    }
  }

  // Return empty forest if the graph is not flat.
  if (!isFlat)
  {
    return flatForest;
  }

  // Run BFS for each component of the graph.

  var visited = new HashSet();
  var toBeVisited = [];
  var parents = new HashMap();
  var unProcessedNodes = [];

  unProcessedNodes = unProcessedNodes.concat(allNodes);

  // Each iteration of this loop finds a component of the graph and
  // decides whether it is a tree or not. If it is a tree, adds it to the
  // forest and continued with the next component.

  while (unProcessedNodes.length > 0 && isForest)
  {
    toBeVisited.push(unProcessedNodes[0]);

    // Start the BFS. Each iteration of this loop visits a node in a
    // BFS manner.
    while (toBeVisited.length > 0 && isForest)
    {
      //pool operation
      var currentNode = toBeVisited[0];
      toBeVisited.splice(0, 1);
      visited.add(currentNode);

      // Traverse all neighbors of this node
      var neighborEdges = currentNode.getEdges();

      for (var i = 0; i < neighborEdges.length; i++)
      {
        var currentNeighbor =
                neighborEdges[i].getOtherEnd(currentNode);

        // If BFS is not growing from this neighbor.
        if (parents.get(currentNode) != currentNeighbor)
        {
          // We haven't previously visited this neighbor.
          if (!visited.contains(currentNeighbor))
          {
            toBeVisited.push(currentNeighbor);
            parents.put(currentNeighbor, currentNode);
          }
          // Since we have previously visited this neighbor and
          // this neighbor is not parent of currentNode, given
          // graph contains a component that is not tree, hence
          // it is not a forest.
          else
          {
            isForest = false;
            break;
          }
        }
      }
    }

    // The graph contains a component that is not a tree. Empty
    // previously found trees. The method will end.
    if (!isForest)
    {
      flatForest = [];
    }
    // Save currently visited nodes as a tree in our forest. Reset
    // visited and parents lists. Continue with the next component of
    // the graph, if any.
    else
    {
      var temp = [];
      visited.addAllTo(temp);
      flatForest.push(temp);
      //flatForest = flatForest.concat(temp);
      //unProcessedNodes.removeAll(visited);
      for (var i = 0; i < temp.length; i++) {
        var value = temp[i];
        var index = unProcessedNodes.indexOf(value);
        if (index > -1) {
          unProcessedNodes.splice(index, 1);
        }
      }
      visited = new HashSet();
      parents = new HashMap();
    }
  }

  return flatForest;
};

/**
 * This method creates dummy nodes (an l-level node with minimal dimensions)
 * for the given edge (one per bendpoint). The existing l-level structure
 * is updated accordingly.
 */
Layout.prototype.createDummyNodesForBendpoints = function (edge)
{
  var dummyNodes = [];
  var prev = edge.source;

  var graph = this.graphManager.calcLowestCommonAncestor(edge.source, edge.target);

  for (var i = 0; i < edge.bendpoints.length; i++)
  {
    // create new dummy node
    var dummyNode = this.newNode(null);
    dummyNode.setRect(new Point(0, 0), new Dimension(1, 1));

    graph.add(dummyNode);

    // create new dummy edge between prev and dummy node
    var dummyEdge = this.newEdge(null);
    this.graphManager.add(dummyEdge, prev, dummyNode);

    dummyNodes.add(dummyNode);
    prev = dummyNode;
  }

  var dummyEdge = this.newEdge(null);
  this.graphManager.add(dummyEdge, prev, edge.target);

  this.edgeToDummyNodes.put(edge, dummyNodes);

  // remove real edge from graph manager if it is inter-graph
  if (edge.isInterGraph())
  {
    this.graphManager.remove(edge);
  }
  // else, remove the edge from the current graph
  else
  {
    graph.remove(edge);
  }

  return dummyNodes;
};

/**
 * This method creates bendpoints for edges from the dummy nodes
 * at l-level.
 */
Layout.prototype.createBendpointsFromDummyNodes = function ()
{
  var edges = [];
  edges = edges.concat(this.graphManager.getAllEdges());
  edges = this.edgeToDummyNodes.keySet().concat(edges);

  for (var k = 0; k < edges.length; k++)
  {
    var lEdge = edges[k];

    if (lEdge.bendpoints.length > 0)
    {
      var path = this.edgeToDummyNodes.get(lEdge);

      for (var i = 0; i < path.length; i++)
      {
        var dummyNode = path[i];
        var p = new PointD(dummyNode.getCenterX(),
                dummyNode.getCenterY());

        // update bendpoint's location according to dummy node
        var ebp = lEdge.bendpoints.get(i);
        ebp.x = p.x;
        ebp.y = p.y;

        // remove the dummy node, dummy edges incident with this
        // dummy node is also removed (within the remove method)
        dummyNode.getOwner().remove(dummyNode);
      }

      // add the real edge to graph
      this.graphManager.add(lEdge, lEdge.source, lEdge.target);
    }
  }
};

Layout.transform = function (sliderValue, defaultValue, minDiv, maxMul) {
  if (minDiv != undefined && maxMul != undefined) {
    var value = defaultValue;

    if (sliderValue <= 50)
    {
      var minValue = defaultValue / minDiv;
      value -= ((defaultValue - minValue) / 50) * (50 - sliderValue);
    }
    else
    {
      var maxValue = defaultValue * maxMul;
      value += ((maxValue - defaultValue) / 50) * (sliderValue - 50);
    }

    return value;
  }
  else {
    var a, b;

    if (sliderValue <= 50)
    {
      a = 9.0 * defaultValue / 500.0;
      b = defaultValue / 10.0;
    }
    else
    {
      a = 9.0 * defaultValue / 50.0;
      b = -8 * defaultValue;
    }

    return (a * sliderValue + b);
  }
};

/**
 * This method finds and returns the center of the given nodes, assuming
 * that the given nodes form a tree in themselves.
 */
Layout.findCenterOfTree = function (nodes)
{
  var list = [];
  list = list.concat(nodes);

  var removedNodes = [];
  var remainingDegrees = new HashMap();
  var foundCenter = false;
  var centerNode = null;

  if (list.length == 1 || list.length == 2)
  {
    foundCenter = true;
    centerNode = list[0];
  }

  for (var i = 0; i < list.length; i++)
  {
    var node = list[i];
    var degree = node.getNeighborsList().size();
    remainingDegrees.put(node, node.getNeighborsList().size());

    if (degree == 1)
    {
      removedNodes.push(node);
    }
  }

  var tempList = [];
  tempList = tempList.concat(removedNodes);

  while (!foundCenter)
  {
    var tempList2 = [];
    tempList2 = tempList2.concat(tempList);
    tempList = [];

    for (var i = 0; i < list.length; i++)
    {
      var node = list[i];

      var index = list.indexOf(node);
      if (index >= 0) {
        list.splice(index, 1);
      }

      var neighbours = node.getNeighborsList();

      for (var j in neighbours.set)
      {
        var neighbour = neighbours.set[j];
        if (removedNodes.indexOf(neighbour) < 0)
        {
          var otherDegree = remainingDegrees.get(neighbour);
          var newDegree = otherDegree - 1;

          if (newDegree == 1)
          {
            tempList.push(neighbour);
          }

          remainingDegrees.put(neighbour, newDegree);
        }
      }
    }

    removedNodes = removedNodes.concat(tempList);

    if (list.length == 1 || list.length == 2)
    {
      foundCenter = true;
      centerNode = list[0];
    }
  }

  return centerNode;
};

/**
 * During the coarsening process, this layout may be referenced by two graph managers
 * this setter function grants access to change the currently being used graph manager
 */
Layout.prototype.setGraphManager = function (gm)
{
  this.graphManager = gm;
};

module.exports = Layout;

},{"./HashMap":12,"./LGraphManager":19,"./LayoutConstants":23}],23:[function(_dereq_,module,exports){
function LayoutConstants() {
}

/**
 * Layout Quality
 */
LayoutConstants.PROOF_QUALITY = 0;
LayoutConstants.DEFAULT_QUALITY = 1;
LayoutConstants.DRAFT_QUALITY = 2;

/**
 * Default parameters
 */
LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED = false;
//LayoutConstants.DEFAULT_INCREMENTAL = true;
LayoutConstants.DEFAULT_INCREMENTAL = false;
LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT = true;
LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT = false;
LayoutConstants.DEFAULT_ANIMATION_PERIOD = 50;
LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES = false;

// -----------------------------------------------------------------------------
// Section: General other constants
// -----------------------------------------------------------------------------
/*
 * Margins of a graph to be applied on bouding rectangle of its contents. We
 * assume margins on all four sides to be uniform.
 */
LayoutConstants.DEFAULT_GRAPH_MARGIN = 10;

/*
 * The height of the label of a compound. We assume the label of a compound
 * node is placed at the bottom with a dynamic width same as the compound
 * itself.
 */
LayoutConstants.LABEL_HEIGHT = 20;

/*
 * Additional margins that we maintain as safety buffer for node-node
 * overlaps. Compound node labels as well as graph margins are handled
 * separately!
 */
LayoutConstants.COMPOUND_NODE_MARGIN = 5;

/*
 * Default dimension of a non-compound node.
 */
LayoutConstants.SIMPLE_NODE_SIZE = 40;

/*
 * Default dimension of a non-compound node.
 */
LayoutConstants.SIMPLE_NODE_HALF_SIZE = LayoutConstants.SIMPLE_NODE_SIZE / 2;

/*
 * Empty compound node size. When a compound node is empty, its both
 * dimensions should be of this value.
 */
LayoutConstants.EMPTY_COMPOUND_NODE_SIZE = 40;

/*
 * Minimum length that an edge should take during layout
 */
LayoutConstants.MIN_EDGE_LENGTH = 1;

/*
 * World boundaries that layout operates on
 */
LayoutConstants.WORLD_BOUNDARY = 1000000;

/*
 * World boundaries that random positioning can be performed with
 */
LayoutConstants.INITIAL_WORLD_BOUNDARY = LayoutConstants.WORLD_BOUNDARY / 1000;

/*
 * Coordinates of the world center
 */
LayoutConstants.WORLD_CENTER_X = 1200;
LayoutConstants.WORLD_CENTER_Y = 900;

module.exports = LayoutConstants;

},{}],24:[function(_dereq_,module,exports){
/*
 *This class is the javascript implementation of the Point.java class in jdk
 */
function Point(x, y, p) {
  this.x = null;
  this.y = null;
  if (x == null && y == null && p == null) {
    this.x = 0;
    this.y = 0;
  }
  else if (typeof x == 'number' && typeof y == 'number' && p == null) {
    this.x = x;
    this.y = y;
  }
  else if (x.constructor.name == 'Point' && y == null && p == null) {
    p = x;
    this.x = p.x;
    this.y = p.y;
  }
}

Point.prototype.getX = function () {
  return this.x;
}

Point.prototype.getY = function () {
  return this.y;
}

Point.prototype.getLocation = function () {
  return new Point(this.x, this.y);
}

Point.prototype.setLocation = function (x, y, p) {
  if (x.constructor.name == 'Point' && y == null && p == null) {
    p = x;
    this.setLocation(p.x, p.y);
  }
  else if (typeof x == 'number' && typeof y == 'number' && p == null) {
    //if both parameters are integer just move (x,y) location
    if (parseInt(x) == x && parseInt(y) == y) {
      this.move(x, y);
    }
    else {
      this.x = Math.floor(x + 0.5);
      this.y = Math.floor(y + 0.5);
    }
  }
}

Point.prototype.move = function (x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.translate = function (dx, dy) {
  this.x += dx;
  this.y += dy;
}

Point.prototype.equals = function (obj) {
  if (obj.constructor.name == "Point") {
    var pt = obj;
    return (this.x == pt.x) && (this.y == pt.y);
  }
  return this == obj;
}

Point.prototype.toString = function () {
  return new Point().constructor.name + "[x=" + this.x + ",y=" + this.y + "]";
}

module.exports = Point;

},{}],25:[function(_dereq_,module,exports){
function PointD(x, y) {
  if (x == null && y == null) {
    this.x = 0;
    this.y = 0;
  } else {
    this.x = x;
    this.y = y;
  }
}

PointD.prototype.getX = function ()
{
  return this.x;
};

PointD.prototype.getY = function ()
{
  return this.y;
};

PointD.prototype.setX = function (x)
{
  this.x = x;
};

PointD.prototype.setY = function (y)
{
  this.y = y;
};

PointD.prototype.getDifference = function (pt)
{
  return new DimensionD(this.x - pt.x, this.y - pt.y);
};

PointD.prototype.getCopy = function ()
{
  return new PointD(this.x, this.y);
};

PointD.prototype.translate = function (dim)
{
  this.x += dim.width;
  this.y += dim.height;
  return this;
};

module.exports = PointD;

},{}],26:[function(_dereq_,module,exports){
function RandomSeed() {
}
RandomSeed.seed = 1;
RandomSeed.x = 0;

RandomSeed.nextDouble = function () {
  RandomSeed.x = Math.sin(RandomSeed.seed++) * 10000;
  return RandomSeed.x - Math.floor(RandomSeed.x);
};

module.exports = RandomSeed;

},{}],27:[function(_dereq_,module,exports){
function RectangleD(x, y, width, height) {
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;

  if (x != null && y != null && width != null && height != null) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

RectangleD.prototype.getX = function ()
{
  return this.x;
};

RectangleD.prototype.setX = function (x)
{
  this.x = x;
};

RectangleD.prototype.getY = function ()
{
  return this.y;
};

RectangleD.prototype.setY = function (y)
{
  this.y = y;
};

RectangleD.prototype.getWidth = function ()
{
  return this.width;
};

RectangleD.prototype.setWidth = function (width)
{
  this.width = width;
};

RectangleD.prototype.getHeight = function ()
{
  return this.height;
};

RectangleD.prototype.setHeight = function (height)
{
  this.height = height;
};

RectangleD.prototype.getRight = function ()
{
  return this.x + this.width;
};

RectangleD.prototype.getBottom = function ()
{
  return this.y + this.height;
};

RectangleD.prototype.intersects = function (a)
{
  if (this.getRight() < a.x)
  {
    return false;
  }

  if (this.getBottom() < a.y)
  {
    return false;
  }

  if (a.getRight() < this.x)
  {
    return false;
  }

  if (a.getBottom() < this.y)
  {
    return false;
  }

  return true;
};

RectangleD.prototype.getCenterX = function ()
{
  return this.x + this.width / 2;
};

RectangleD.prototype.getMinX = function ()
{
  return this.getX();
};

RectangleD.prototype.getMaxX = function ()
{
  return this.getX() + this.width;
};

RectangleD.prototype.getCenterY = function ()
{
  return this.y + this.height / 2;
};

RectangleD.prototype.getMinY = function ()
{
  return this.getY();
};

RectangleD.prototype.getMaxY = function ()
{
  return this.getY() + this.height;
};

RectangleD.prototype.getWidthHalf = function ()
{
  return this.width / 2;
};

RectangleD.prototype.getHeightHalf = function ()
{
  return this.height / 2;
};

module.exports = RectangleD;

},{}],28:[function(_dereq_,module,exports){
function Transform(x, y) {
  this.lworldOrgX = 0.0;
  this.lworldOrgY = 0.0;
  this.ldeviceOrgX = 0.0;
  this.ldeviceOrgY = 0.0;
  this.lworldExtX = 1.0;
  this.lworldExtY = 1.0;
  this.ldeviceExtX = 1.0;
  this.ldeviceExtY = 1.0;
}

Transform.prototype.getWorldOrgX = function ()
{
  return this.lworldOrgX;
}

Transform.prototype.setWorldOrgX = function (wox)
{
  this.lworldOrgX = wox;
}

Transform.prototype.getWorldOrgY = function ()
{
  return this.lworldOrgY;
}

Transform.prototype.setWorldOrgY = function (woy)
{
  this.lworldOrgY = woy;
}

Transform.prototype.getWorldExtX = function ()
{
  return this.lworldExtX;
}

Transform.prototype.setWorldExtX = function (wex)
{
  this.lworldExtX = wex;
}

Transform.prototype.getWorldExtY = function ()
{
  return this.lworldExtY;
}

Transform.prototype.setWorldExtY = function (wey)
{
  this.lworldExtY = wey;
}

/* Device related */

Transform.prototype.getDeviceOrgX = function ()
{
  return this.ldeviceOrgX;
}

Transform.prototype.setDeviceOrgX = function (dox)
{
  this.ldeviceOrgX = dox;
}

Transform.prototype.getDeviceOrgY = function ()
{
  return this.ldeviceOrgY;
}

Transform.prototype.setDeviceOrgY = function (doy)
{
  this.ldeviceOrgY = doy;
}

Transform.prototype.getDeviceExtX = function ()
{
  return this.ldeviceExtX;
}

Transform.prototype.setDeviceExtX = function (dex)
{
  this.ldeviceExtX = dex;
}

Transform.prototype.getDeviceExtY = function ()
{
  return this.ldeviceExtY;
}

Transform.prototype.setDeviceExtY = function (dey)
{
  this.ldeviceExtY = dey;
}

Transform.prototype.transformX = function (x)
{
  var xDevice = 0.0;
  var worldExtX = this.lworldExtX;
  if (worldExtX != 0.0)
  {
    xDevice = this.ldeviceOrgX +
            ((x - this.lworldOrgX) * this.ldeviceExtX / worldExtX);
  }

  return xDevice;
}

Transform.prototype.transformY = function (y)
{
  var yDevice = 0.0;
  var worldExtY = this.lworldExtY;
  if (worldExtY != 0.0)
  {
    yDevice = this.ldeviceOrgY +
            ((y - this.lworldOrgY) * this.ldeviceExtY / worldExtY);
  }


  return yDevice;
}

Transform.prototype.inverseTransformX = function (x)
{
  var xWorld = 0.0;
  var deviceExtX = this.ldeviceExtX;
  if (deviceExtX != 0.0)
  {
    xWorld = this.lworldOrgX +
            ((x - this.ldeviceOrgX) * this.lworldExtX / deviceExtX);
  }


  return xWorld;
}

Transform.prototype.inverseTransformY = function (y)
{
  var yWorld = 0.0;
  var deviceExtY = this.ldeviceExtY;
  if (deviceExtY != 0.0)
  {
    yWorld = this.lworldOrgY +
            ((y - this.ldeviceOrgY) * this.lworldExtY / deviceExtY);
  }
  return yWorld;
}

Transform.prototype.inverseTransformPoint = function (inPoint)
{
  var outPoint =
          new PointD(this.inverseTransformX(inPoint.x),
                  this.inverseTransformY(inPoint.y));
  return outPoint;
}

module.exports = Transform;

},{}],29:[function(_dereq_,module,exports){
function UniqueIDGeneretor() {
}

UniqueIDGeneretor.lastID = 0;

UniqueIDGeneretor.createID = function (obj) {
  if (UniqueIDGeneretor.isPrimitive(obj)) {
    return obj;
  }
  if (obj.uniqueID != null) {
    return obj.uniqueID;
  }
  obj.uniqueID = UniqueIDGeneretor.getString();
  UniqueIDGeneretor.lastID++;
  return obj.uniqueID;
}

UniqueIDGeneretor.getString = function (id) {
  if (id == null)
    id = UniqueIDGeneretor.lastID;
  return "Object#" + id + "";
}

UniqueIDGeneretor.isPrimitive = function (arg) {
  var type = typeof arg;
  return arg == null || (type != "object" && type != "function");
}

module.exports = UniqueIDGeneretor;

},{}],30:[function(_dereq_,module,exports){
'use strict';

var Thread;

var DimensionD = _dereq_('./DimensionD');
var HashMap = _dereq_('./HashMap');
var HashSet = _dereq_('./HashSet');
var IGeometry = _dereq_('./IGeometry');
var IMath = _dereq_('./IMath');
var Integer = _dereq_('./Integer');
var Point = _dereq_('./Point');
var PointD = _dereq_('./PointD');
var RandomSeed = _dereq_('./RandomSeed');
var RectangleD = _dereq_('./RectangleD');
var Transform = _dereq_('./Transform');
var UniqueIDGeneretor = _dereq_('./UniqueIDGeneretor');
var LGraphObject = _dereq_('./LGraphObject');
var LGraph = _dereq_('./LGraph');
var LEdge = _dereq_('./LEdge');
var LGraphManager = _dereq_('./LGraphManager');
var LNode = _dereq_('./LNode');
var Layout = _dereq_('./Layout');
var LayoutConstants = _dereq_('./LayoutConstants');
var FDLayout = _dereq_('./FDLayout');
var FDLayoutConstants = _dereq_('./FDLayoutConstants');
var FDLayoutEdge = _dereq_('./FDLayoutEdge');
var FDLayoutNode = _dereq_('./FDLayoutNode');
var CoSEConstants = _dereq_('./CoSEConstants');
var CoSEEdge = _dereq_('./CoSEEdge');
var CoSEGraph = _dereq_('./CoSEGraph');
var CoSEGraphManager = _dereq_('./CoSEGraphManager');
var CoSELayout = _dereq_('./CoSELayout');
var CoSENode = _dereq_('./CoSENode');
var layoutOptionsPack = _dereq_('./layoutOptionsPack');

layoutOptionsPack.layoutQuality; // proof, default, draft
layoutOptionsPack.animationDuringLayout; // T-F
layoutOptionsPack.animationOnLayout; // T-F
layoutOptionsPack.animationPeriod; // 0-100
layoutOptionsPack.incremental; // T-F
layoutOptionsPack.createBendsAsNeeded; // T-F
layoutOptionsPack.uniformLeafNodeSizes; // T-F

layoutOptionsPack.defaultLayoutQuality = LayoutConstants.DEFAULT_QUALITY;
layoutOptionsPack.defaultAnimationDuringLayout = LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT;
layoutOptionsPack.defaultAnimationOnLayout = LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT;
layoutOptionsPack.defaultAnimationPeriod = 50;
layoutOptionsPack.defaultIncremental = LayoutConstants.DEFAULT_INCREMENTAL;
layoutOptionsPack.defaultCreateBendsAsNeeded = LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
layoutOptionsPack.defaultUniformLeafNodeSizes = LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES;

function setDefaultLayoutProperties() {
  layoutOptionsPack.layoutQuality = layoutOptionsPack.defaultLayoutQuality;
  layoutOptionsPack.animationDuringLayout = layoutOptionsPack.defaultAnimationDuringLayout;
  layoutOptionsPack.animationOnLayout = layoutOptionsPack.defaultAnimationOnLayout;
  layoutOptionsPack.animationPeriod = layoutOptionsPack.defaultAnimationPeriod;
  layoutOptionsPack.incremental = layoutOptionsPack.defaultIncremental;
  layoutOptionsPack.createBendsAsNeeded = layoutOptionsPack.defaultCreateBendsAsNeeded;
  layoutOptionsPack.uniformLeafNodeSizes = layoutOptionsPack.defaultUniformLeafNodeSizes;
}

setDefaultLayoutProperties();

function fillCoseLayoutOptionsPack() {
  layoutOptionsPack.defaultIdealEdgeLength = CoSEConstants.DEFAULT_EDGE_LENGTH;
  layoutOptionsPack.defaultSpringStrength = 50;
  layoutOptionsPack.defaultRepulsionStrength = 50;
  layoutOptionsPack.defaultSmartRepulsionRangeCalc = CoSEConstants.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION;
  layoutOptionsPack.defaultGravityStrength = 50;
  layoutOptionsPack.defaultGravityRange = 50;
  layoutOptionsPack.defaultCompoundGravityStrength = 50;
  layoutOptionsPack.defaultCompoundGravityRange = 50;
  layoutOptionsPack.defaultSmartEdgeLengthCalc = CoSEConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
  layoutOptionsPack.defaultMultiLevelScaling = CoSEConstants.DEFAULT_USE_MULTI_LEVEL_SCALING;

  layoutOptionsPack.idealEdgeLength = layoutOptionsPack.defaultIdealEdgeLength;
  layoutOptionsPack.springStrength = layoutOptionsPack.defaultSpringStrength;
  layoutOptionsPack.repulsionStrength = layoutOptionsPack.defaultRepulsionStrength;
  layoutOptionsPack.smartRepulsionRangeCalc = layoutOptionsPack.defaultSmartRepulsionRangeCalc;
  layoutOptionsPack.gravityStrength = layoutOptionsPack.defaultGravityStrength;
  layoutOptionsPack.gravityRange = layoutOptionsPack.defaultGravityRange;
  layoutOptionsPack.compoundGravityStrength = layoutOptionsPack.defaultCompoundGravityStrength;
  layoutOptionsPack.compoundGravityRange = layoutOptionsPack.defaultCompoundGravityRange;
  layoutOptionsPack.smartEdgeLengthCalc = layoutOptionsPack.defaultSmartEdgeLengthCalc;
  layoutOptionsPack.multiLevelScaling = layoutOptionsPack.defaultMultiLevelScaling;
}

_CoSELayout.idToLNode = {};
_CoSELayout.toBeTiled = {};

var defaults = {
  // Called on `layoutready`
  ready: function () {
  },
  // Called on `layoutstop`
  stop: function () {
  },
  // Whether to fit the network view after when done
  fit: true,
  // Padding on fit
  padding: 10,
  // Whether to enable incremental mode
  randomize: false,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: 50,
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Gravity force (constant)
  gravity: 0.4,
  // Maximum number of iterations to perform
  numIter: 2500,
  // For enabling tiling
  tile: true,
  //whether to make animation while performing the layout
  animate: true
};

function extend(defaults, options) {
  var obj = {};

  for (var i in defaults) {
    obj[i] = defaults[i];
  }

  for (var i in options) {
    obj[i] = options[i];
  }

  return obj;
}
;

_CoSELayout.layout = new CoSELayout();
function _CoSELayout(options) {

  this.options = extend(defaults, options);
  FDLayoutConstants.getUserOptions(this.options);
  fillCoseLayoutOptionsPack();
}

_CoSELayout.prototype.run = function () {
  var layout = this;

  _CoSELayout.idToLNode = {};
  _CoSELayout.toBeTiled = {};
  _CoSELayout.layout = new CoSELayout();
  this.cy = this.options.cy;
  var after = this;

  this.cy.trigger('layoutstart');

  var gm = _CoSELayout.layout.newGraphManager();
  this.gm = gm;

  var nodes = this.options.eles.nodes();
  var edges = this.options.eles.edges();

  this.root = gm.addRoot();

  if (!this.options.tile) {
    this.processChildrenList(this.root, nodes.orphans());
  }
  else {
    // Find zero degree nodes and create a compound for each level
    var memberGroups = this.groupZeroDegreeMembers();
    // Tile and clear children of each compound
    var tiledMemberPack = this.clearCompounds(this.options);
    // Separately tile and clear zero degree nodes for each level
    var tiledZeroDegreeNodes = this.clearZeroDegreeMembers(memberGroups);
  }


  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    var sourceNode = _CoSELayout.idToLNode[edge.data("source")];
    var targetNode = _CoSELayout.idToLNode[edge.data("target")];
    var e1 = gm.add(_CoSELayout.layout.newEdge(), sourceNode, targetNode);
    e1.id = edge.id();
  }


  var t1 = layout.thread;

  if (!t1 || t1.stopped()) { // try to reuse threads
    t1 = layout.thread = Thread();

    t1.require(DimensionD, 'DimensionD');
    t1.require(HashMap, 'HashMap');
    t1.require(HashSet, 'HashSet');
    t1.require(IGeometry, 'IGeometry');
    t1.require(IMath, 'IMath');
    t1.require(Integer, 'Integer');
    t1.require(Point, 'Point');
    t1.require(PointD, 'PointD');
    t1.require(RandomSeed, 'RandomSeed');
    t1.require(RectangleD, 'RectangleD');
    t1.require(Transform, 'Transform');
    t1.require(UniqueIDGeneretor, 'UniqueIDGeneretor');
    t1.require(LGraphObject, 'LGraphObject');
    t1.require(LGraph, 'LGraph');
    t1.require(LEdge, 'LEdge');
    t1.require(LGraphManager, 'LGraphManager');
    t1.require(LNode, 'LNode');
    t1.require(Layout, 'Layout');
    t1.require(LayoutConstants, 'LayoutConstants');
    t1.require(layoutOptionsPack, 'layoutOptionsPack');
    t1.require(FDLayout, 'FDLayout');
    t1.require(FDLayoutConstants, 'FDLayoutConstants');
    t1.require(FDLayoutEdge, 'FDLayoutEdge');
    t1.require(FDLayoutNode, 'FDLayoutNode');
    t1.require(CoSEConstants, 'CoSEConstants');
    t1.require(CoSEEdge, 'CoSEEdge');
    t1.require(CoSEGraph, 'CoSEGraph');
    t1.require(CoSEGraphManager, 'CoSEGraphManager');
    t1.require(CoSELayout, 'CoSELayout');
    t1.require(CoSENode, 'CoSENode');
  }

  var nodes = this.options.eles.nodes();
  var edges = this.options.eles.edges();

  // First I need to create the data structure to pass to the worker
  var pData = {
    'nodes': [],
    'edges': []
  };

  var lnodes = gm.getAllNodes();
  for (var i = 0; i < lnodes.length; i++) {
    var lnode = lnodes[i];
    var nodeId = lnode.id;
    var cyNode = this.options.cy.getElementById(nodeId);
    var parentId = cyNode.data('parent');
    var w = lnode.rect.width;
    var posX = lnode.rect.x;
    var posY = lnode.rect.y;
    var h = lnode.rect.height;
    var dummy_parent_id = cyNode.data('dummy_parent_id');

    pData[ 'nodes' ].push({
      id: nodeId,
      pid: parentId,
      x: posX,
      y: posY,
      width: w,
      height: h,
      dummy_parent_id: dummy_parent_id
    });

  }

  var ledges = gm.getAllEdges();
  for (var i = 0; i < ledges.length; i++) {
    var ledge = ledges[i];
    var edgeId = ledge.id;
    var cyEdge = this.options.cy.getElementById(edgeId);
    var srcNodeId = cyEdge.source().id();
    var tgtNodeId = cyEdge.target().id();
    pData[ 'edges' ].push({
      id: edgeId,
      source: srcNodeId,
      target: tgtNodeId
    });
  }

  var ready = false;

  t1.pass(pData).run(function (pData) {
    var log = function (msg) {
      broadcast({log: msg});
    };

    log("start thread");

    //the layout will be run in the thread and the results are to be passed
    //to the main thread with the result map
    var layout_t = new CoSELayout();
    var gm_t = layout_t.newGraphManager();
    var ngraph = gm_t.layout.newGraph();
    var nnode = gm_t.layout.newNode(null);
    var root = gm_t.add(ngraph, nnode);
    root.graphManager = gm_t;
    gm_t.setRootGraph(root);
    var root_t = gm_t.rootGraph;

    //maps for inner usage of the thread
    var orphans_t = [];
    var idToLNode_t = {};
    var childrenMap = {};

    //A map of node id to corresponding node position and sizes
    //it is to be returned at the end of the thread function
    var result = {};

    //this function is similar to processChildrenList function in the main thread
    //it is to process the nodes in correct order recursively
    var processNodes = function (parent, children) {
      var size = children.length;
      for (var i = 0; i < size; i++) {
        var theChild = children[i];
        var children_of_children = childrenMap[theChild.id];
        var theNode;

        if (theChild.width != null
                && theChild.height != null) {
          theNode = parent.add(new CoSENode(gm_t,
                  new PointD(theChild.x, theChild.y),
                  new DimensionD(parseFloat(theChild.width),
                          parseFloat(theChild.height))));
        }
        else {
          theNode = parent.add(new CoSENode(gm_t));
        }
        theNode.id = theChild.id;
        idToLNode_t[theChild.id] = theNode;

        if (isNaN(theNode.rect.x)) {
          theNode.rect.x = 0;
        }

        if (isNaN(theNode.rect.y)) {
          theNode.rect.y = 0;
        }

        if (children_of_children != null && children_of_children.length > 0) {
          var theNewGraph;
          theNewGraph = layout_t.getGraphManager().add(layout_t.newGraph(), theNode);
          theNewGraph.graphManager = gm_t;
          processNodes(theNewGraph, children_of_children);
        }
      }
    }

    //fill the chidrenMap and orphans_t maps to process the nodes in the correct order
    var nodes = pData.nodes;
    for (var i = 0; i < nodes.length; i++) {
      var theNode = nodes[i];
      var p_id = theNode.pid;
      if (p_id != null) {
        if (childrenMap[p_id] == null) {
          childrenMap[p_id] = [];
        }
        childrenMap[p_id].push(theNode);
      }
      else {
        orphans_t.push(theNode);
      }
    }

    processNodes(root_t, orphans_t);

    //handle the edges
    var edges = pData.edges;
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      var sourceNode = idToLNode_t[edge.source];
      var targetNode = idToLNode_t[edge.target];
      var e1 = gm_t.add(layout_t.newEdge(), sourceNode, targetNode);
    }

    //run the layout crated in this thread
    layout_t.runLayout();

    //fill the result map
    for (var id in idToLNode_t) {
      var lNode = idToLNode_t[id];
      var rect = lNode.rect;
      result[id] = {
        id: id,
        x: rect.x,
        y: rect.y,
        w: rect.width,
        h: rect.height
      };
    }
    var seeds = {};
    seeds.rsSeed = RandomSeed.seed;
    seeds.rsX = RandomSeed.x;
    var pass = {
      result: result,
      seeds: seeds
    }
    //return the result map to pass it to the then function as parameter
    return pass;
  }).then(function (pass) {
    var result = pass.result;
    var seeds = pass.seeds;
    RandomSeed.seed = seeds.rsSeed;
    RandomSeed.x = seeds.rsX;
    //refresh the lnode positions and sizes by using result map
    for (var id in result) {
      var lNode = _CoSELayout.idToLNode[id];
      var node = result[id];
      lNode.rect.x = node.x;
      lNode.rect.y = node.y;
      lNode.rect.width = node.w;
      lNode.rect.height = node.h;
    }
    if (after.options.tile) {
      // Repopulate members
      after.repopulateZeroDegreeMembers(tiledZeroDegreeNodes);
      after.repopulateCompounds(tiledMemberPack);
      after.options.eles.nodes().updateCompoundBounds();
    }

    after.options.eles.nodes().positions(function (i, ele) {
      var theId = ele.data('id');
      var lNode = _CoSELayout.idToLNode[theId];

      return {
        x: lNode.getRect().getCenterX(),
        y: lNode.getRect().getCenterY()
      };
    });

    if (after.options.fit)
      after.options.cy.fit(after.options.eles.nodes(), after.options.padding);

    //trigger layoutready when each node has had its position set at least once
    if (!ready) {
      after.cy.one('layoutready', after.options.ready);
      after.cy.trigger('layoutready');
    }

    // trigger layoutstop when the layout stops (e.g. finishes)
    after.cy.one('layoutstop', after.options.stop);
    after.cy.trigger('layoutstop');
    t1.stop();

    after.options.eles.nodes().removeData('dummy_parent_id');
  });

  t1.on('message', function (e) {
    var logMsg = e.message.log;
    if (logMsg != null) {
      console.log('Thread log: ' + logMsg);
      return;
    }
    var pData = e.message.pData;
    if (pData != null) {
      after.options.eles.nodes().positions(function (i, ele) {
        if (ele.data('dummy_parent_id')) {
          return {
            x: pData[ele.data('dummy_parent_id')].x,
            y: pData[ele.data('dummy_parent_id')].y
          };
        }
        var theId = ele.data('id');
        var pNode = pData[theId];
        var temp = this;
        while (pNode == null) {
          temp = temp.parent()[0];
          pNode = pData[temp.id()];
          pData[theId] = pNode;
        }
        return {
          x: pNode.x,
          y: pNode.y
        };
      });

      if (after.options.fit)
        after.options.cy.fit(after.options.eles.nodes(), after.options.padding);

      if (!ready) {
        ready = true;
        after.one('layoutready', after.options.ready);
        after.trigger({type: 'layoutready', layout: after});
      }
      return;
    }
  });

  return this; // chaining
};

_CoSELayout.prototype.getToBeTiled = function (node) {
  var id = node.data("id");
  //firstly check the previous results
  if (_CoSELayout.toBeTiled[id] != null) {
    return _CoSELayout.toBeTiled[id];
  }

  //only compound nodes are to be tiled
  var children = node.children();
  if (children == null || children.length == 0) {
    _CoSELayout.toBeTiled[id] = false;
    return false;
  }

  //a compound node is not to be tiled if all of its compound children are not to be tiled
  for (var i = 0; i < children.length; i++) {
    var theChild = children[i];

    if (this.getNodeDegree(theChild) > 0) {
      _CoSELayout.toBeTiled[id] = false;
      return false;
    }

    //pass the children not having the compound structure
    if (theChild.children() == null || theChild.children().length == 0) {
      _CoSELayout.toBeTiled[theChild.data("id")] = false;
      continue;
    }

    if (!this.getToBeTiled(theChild)) {
      _CoSELayout.toBeTiled[id] = false;
      return false;
    }
  }
  _CoSELayout.toBeTiled[id] = true;
  return true;
};

_CoSELayout.prototype.getNodeDegree = function (node) {
  var id = node.id();
  var edges = this.options.eles.edges().filter(function (i, ele) {
    var source = ele.data('source');
    var target = ele.data('target');
    if (source != target && (source == id || target == id)) {
      return true;
    }
  });
  return edges.length;
};

_CoSELayout.prototype.getNodeDegreeWithChildren = function (node) {
  var degree = this.getNodeDegree(node);
  var children = node.children();
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    degree += this.getNodeDegreeWithChildren(child);
  }
  return degree;
};

_CoSELayout.prototype.groupZeroDegreeMembers = function () {
  // array of [parent_id x oneDegreeNode_id] 
  var tempMemberGroups = [];
  var memberGroups = [];
  var self = this;
  // Find all zero degree nodes which aren't covered by a compound
  var zeroDegree = this.options.eles.nodes().filter(function (i, ele) {
    if (self.getNodeDegreeWithChildren(ele) == 0 && (ele.parent().length == 0 || (ele.parent().length > 0 && !self.getToBeTiled(ele.parent()[0]))))
      return true;
    else
      return false;
  });

  // Create a map of parent node and its zero degree members
  for (var i = 0; i < zeroDegree.length; i++)
  {
    var node = zeroDegree[i];
    var p_id = node.parent().id();

    if (typeof tempMemberGroups[p_id] === "undefined")
      tempMemberGroups[p_id] = [];

    tempMemberGroups[p_id] = tempMemberGroups[p_id].concat(node);
  }

  // If there are at least two nodes at a level, create a dummy compound for them
  for (var p_id in tempMemberGroups) {
    if (tempMemberGroups[p_id].length > 1) {
      var dummyCompoundId = "DummyCompound_" + p_id;
      memberGroups[dummyCompoundId] = tempMemberGroups[p_id];

      // Create a dummy compound
      if (this.options.cy.getElementById(dummyCompoundId).empty()) {
        this.options.cy.add({
          group: "nodes",
          data: {id: dummyCompoundId, parent: p_id
          }
        });

        var dummy = this.options.cy.nodes()[this.options.cy.nodes().length - 1];
        this.options.eles = this.options.eles.union(dummy);
        dummy.hide();

        for (var i = 0; i < tempMemberGroups[p_id].length; i++) {
          if (i == 0) {
            dummy.data('tempchildren', []);
          }
          var node = tempMemberGroups[p_id][i];
          node.data('dummy_parent_id', dummyCompoundId);
          this.options.cy.add({
            group: "nodes",
            data: {parent: dummyCompoundId, width: node.width(), height: node.height()
            }
          });
          var tempchild = this.options.cy.nodes()[this.options.cy.nodes().length - 1];
          tempchild.hide();
          tempchild.css('width', tempchild.data('width'));
          tempchild.css('height', tempchild.data('height'));
          tempchild.width();
          dummy.data('tempchildren').push(tempchild);
        }
      }
    }
  }

  return memberGroups;
};

_CoSELayout.prototype.performDFSOnCompounds = function (options) {
  var compoundOrder = [];

  var roots = this.options.eles.nodes().orphans();
  this.fillCompexOrderByDFS(compoundOrder, roots);

  return compoundOrder;
};

_CoSELayout.prototype.fillCompexOrderByDFS = function (compoundOrder, children) {
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    this.fillCompexOrderByDFS(compoundOrder, child.children());
    if (this.getToBeTiled(child)) {
      compoundOrder.push(child);
    }
  }
};

_CoSELayout.prototype.clearCompounds = function (options) {
  var childGraphMap = [];

  // Get compound ordering by finding the inner one first
  var compoundOrder = this.performDFSOnCompounds(options);
  _CoSELayout.compoundOrder = compoundOrder;
  this.processChildrenList(this.root, this.options.eles.nodes().orphans());

  for (var i = 0; i < compoundOrder.length; i++) {
    // find the corresponding layout node
    var lCompoundNode = _CoSELayout.idToLNode[compoundOrder[i].id()];

    childGraphMap[compoundOrder[i].id()] = compoundOrder[i].children();

    // Remove children of compounds 
    lCompoundNode.child = null;
  }

  // Tile the removed children
  var tiledMemberPack = this.tileCompoundMembers(childGraphMap);

  return tiledMemberPack;
};

_CoSELayout.prototype.clearZeroDegreeMembers = function (memberGroups) {
  var tiledZeroDegreePack = [];

  for (var id in memberGroups) {
    var compoundNode = _CoSELayout.idToLNode[id];

    tiledZeroDegreePack[id] = this.tileNodes(memberGroups[id]);

    // Set the width and height of the dummy compound as calculated
    compoundNode.rect.width = tiledZeroDegreePack[id].width;
    compoundNode.rect.height = tiledZeroDegreePack[id].height;
  }
  return tiledZeroDegreePack;
};

_CoSELayout.prototype.repopulateCompounds = function (tiledMemberPack) {
  for (var i = _CoSELayout.compoundOrder.length - 1; i >= 0; i--) {
    var id = _CoSELayout.compoundOrder[i].id();
    var lCompoundNode = _CoSELayout.idToLNode[id];

    this.adjustLocations(tiledMemberPack[id], lCompoundNode.rect.x, lCompoundNode.rect.y);
  }
};

_CoSELayout.prototype.repopulateZeroDegreeMembers = function (tiledPack) {
  for (var i in tiledPack) {
    var compound = this.cy.getElementById(i);
    var compoundNode = _CoSELayout.idToLNode[i];

    // Adjust the positions of nodes wrt its compound
    this.adjustLocations(tiledPack[i], compoundNode.rect.x, compoundNode.rect.y);

    var tempchildren = compound.data('tempchildren');
    for (var i = 0; i < tempchildren.length; i++) {
      tempchildren[i].remove();
    }

    // Remove the dummy compound
    compound.remove();
  }
};

/**
 * This method places each zero degree member wrt given (x,y) coordinates (top left). 
 */
_CoSELayout.prototype.adjustLocations = function (organization, x, y) {
  x += organization.compoundMargin;
  y += organization.compoundMargin;

  var left = x;

  for (var i = 0; i < organization.rows.length; i++) {
    var row = organization.rows[i];
    x = left;
    var maxHeight = 0;

    for (var j = 0; j < row.length; j++) {
      var lnode = row[j];

      var node = this.cy.getElementById(lnode.id);
      node.position({
        x: x + lnode.rect.width / 2,
        y: y + lnode.rect.height / 2
      });

      lnode.rect.x = x;// + lnode.rect.width / 2;
      lnode.rect.y = y;// + lnode.rect.height / 2;

      x += lnode.rect.width + organization.horizontalPadding;

      if (lnode.rect.height > maxHeight)
        maxHeight = lnode.rect.height;
    }

    y += maxHeight + organization.verticalPadding;
  }
};

_CoSELayout.prototype.tileCompoundMembers = function (childGraphMap) {
  var tiledMemberPack = [];

  for (var id in childGraphMap) {
    // Access layoutInfo nodes to set the width and height of compounds
    var compoundNode = _CoSELayout.idToLNode[id];

    tiledMemberPack[id] = this.tileNodes(childGraphMap[id]);

    compoundNode.rect.width = tiledMemberPack[id].width + 20;
    compoundNode.rect.height = tiledMemberPack[id].height + 20;
  }

  return tiledMemberPack;
};

_CoSELayout.prototype.tileNodes = function (nodes) {
  var organization = {
    rows: [],
    rowWidth: [],
    rowHeight: [],
    compoundMargin: 10,
    width: 20,
    height: 20,
    verticalPadding: 10,
    horizontalPadding: 10
  };

  var layoutNodes = [];

  // Get layout nodes
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var lNode = _CoSELayout.idToLNode[node.id()];

    if (!node.data('dummy_parent_id')) {
      var owner = lNode.owner;
      owner.remove(lNode);

      this.gm.resetAllNodes();
      this.gm.getAllNodes();
    }

    layoutNodes.push(lNode);
  }

  // Sort the nodes in ascending order of their areas
  layoutNodes.sort(function (n1, n2) {
    if (n1.rect.width * n1.rect.height > n2.rect.width * n2.rect.height)
      return -1;
    if (n1.rect.width * n1.rect.height < n2.rect.width * n2.rect.height)
      return 1;
    return 0;
  });

  // Create the organization -> tile members
  for (var i = 0; i < layoutNodes.length; i++) {
    var lNode = layoutNodes[i];

    if (organization.rows.length == 0) {
      this.insertNodeToRow(organization, lNode, 0);
    }
    else if (this.canAddHorizontal(organization, lNode.rect.width, lNode.rect.height)) {
      this.insertNodeToRow(organization, lNode, this.getShortestRowIndex(organization));
    }
    else {
      this.insertNodeToRow(organization, lNode, organization.rows.length);
    }

    this.shiftToLastRow(organization);
  }

  return organization;
};

_CoSELayout.prototype.insertNodeToRow = function (organization, node, rowIndex) {
  var minCompoundSize = organization.compoundMargin * 2;

  // Add new row if needed
  if (rowIndex == organization.rows.length) {
    var secondDimension = [];

    organization.rows.push(secondDimension);
    organization.rowWidth.push(minCompoundSize);
    organization.rowHeight.push(0);
  }

  // Update row width
  var w = organization.rowWidth[rowIndex] + node.rect.width;

  if (organization.rows[rowIndex].length > 0) {
    w += organization.horizontalPadding;
  }

  organization.rowWidth[rowIndex] = w;
  // Update compound width
  if (organization.width < w) {
    organization.width = w;
  }

  // Update height
  var h = node.rect.height;
  if (rowIndex > 0)
    h += organization.verticalPadding;

  var extraHeight = 0;
  if (h > organization.rowHeight[rowIndex]) {
    extraHeight = organization.rowHeight[rowIndex];
    organization.rowHeight[rowIndex] = h;
    extraHeight = organization.rowHeight[rowIndex] - extraHeight;
  }

  organization.height += extraHeight;

  // Insert node
  organization.rows[rowIndex].push(node);
};

//Scans the rows of an organization and returns the one with the min width
_CoSELayout.prototype.getShortestRowIndex = function (organization) {
  var r = -1;
  var min = Number.MAX_VALUE;

  for (var i = 0; i < organization.rows.length; i++) {
    if (organization.rowWidth[i] < min) {
      r = i;
      min = organization.rowWidth[i];
    }
  }
  return r;
};

//Scans the rows of an organization and returns the one with the max width
_CoSELayout.prototype.getLongestRowIndex = function (organization) {
  var r = -1;
  var max = Number.MIN_VALUE;

  for (var i = 0; i < organization.rows.length; i++) {

    if (organization.rowWidth[i] > max) {
      r = i;
      max = organization.rowWidth[i];
    }
  }

  return r;
};

/**
 * This method checks whether adding extra width to the organization violates
 * the aspect ratio(1) or not.
 */
_CoSELayout.prototype.canAddHorizontal = function (organization, extraWidth, extraHeight) {

  var sri = this.getShortestRowIndex(organization);

  if (sri < 0) {
    return true;
  }

  var min = organization.rowWidth[sri];

  if (min + organization.horizontalPadding + extraWidth <= organization.width)
    return true;

  var hDiff = 0;

  // Adding to an existing row
  if (organization.rowHeight[sri] < extraHeight) {
    if (sri > 0)
      hDiff = extraHeight + organization.verticalPadding - organization.rowHeight[sri];
  }

  var add_to_row_ratio;
  if (organization.width - min >= extraWidth + organization.horizontalPadding) {
    add_to_row_ratio = (organization.height + hDiff) / (min + extraWidth + organization.horizontalPadding);
  } else {
    add_to_row_ratio = (organization.height + hDiff) / organization.width;
  }

  // Adding a new row for this node
  hDiff = extraHeight + organization.verticalPadding;
  var add_new_row_ratio;
  if (organization.width < extraWidth) {
    add_new_row_ratio = (organization.height + hDiff) / extraWidth;
  } else {
    add_new_row_ratio = (organization.height + hDiff) / organization.width;
  }

  if (add_new_row_ratio < 1)
    add_new_row_ratio = 1 / add_new_row_ratio;

  if (add_to_row_ratio < 1)
    add_to_row_ratio = 1 / add_to_row_ratio;

  return add_to_row_ratio < add_new_row_ratio;
};


//If moving the last node from the longest row and adding it to the last
//row makes the bounding box smaller, do it.
_CoSELayout.prototype.shiftToLastRow = function (organization) {
  var longest = this.getLongestRowIndex(organization);
  var last = organization.rowWidth.length - 1;
  var row = organization.rows[longest];
  var node = row[row.length - 1];

  var diff = node.width + organization.horizontalPadding;

  // Check if there is enough space on the last row
  if (organization.width - organization.rowWidth[last] > diff && longest != last) {
    // Remove the last element of the longest row
    row.splice(-1, 1);

    // Push it to the last row
    organization.rows[last].push(node);

    organization.rowWidth[longest] = organization.rowWidth[longest] - diff;
    organization.rowWidth[last] = organization.rowWidth[last] + diff;
    organization.width = organization.rowWidth[this.getLongestRowIndex(organization)];

    // Update heights of the organization
    var maxHeight = Number.MIN_VALUE;
    for (var i = 0; i < row.length; i++) {
      if (row[i].height > maxHeight)
        maxHeight = row[i].height;
    }
    if (longest > 0)
      maxHeight += organization.verticalPadding;

    var prevTotal = organization.rowHeight[longest] + organization.rowHeight[last];

    organization.rowHeight[longest] = maxHeight;
    if (organization.rowHeight[last] < node.height + organization.verticalPadding)
      organization.rowHeight[last] = node.height + organization.verticalPadding;

    var finalTotal = organization.rowHeight[longest] + organization.rowHeight[last];
    organization.height += (finalTotal - prevTotal);

    this.shiftToLastRow(organization);
  }
};

/**
 * @brief : called on continuous layouts to stop them before they finish
 */
_CoSELayout.prototype.stop = function () {
  this.stopped = true;

  return this; // chaining
};

_CoSELayout.prototype.processChildrenList = function (parent, children) {
  var size = children.length;
  for (var i = 0; i < size; i++) {
    var theChild = children[i];
    this.options.eles.nodes().length;
    var children_of_children = theChild.children();
    var theNode;

    if (theChild.width() != null
            && theChild.height() != null) {
      theNode = parent.add(new CoSENode(_CoSELayout.layout.graphManager,
              new PointD(theChild.position('x'), theChild.position('y')),
              new DimensionD(parseFloat(theChild.width()),
                      parseFloat(theChild.height()))));
    }
    else {
      theNode = parent.add(new CoSENode(this.graphManager));
    }
    theNode.id = theChild.data("id");
    _CoSELayout.idToLNode[theChild.data("id")] = theNode;

    if (isNaN(theNode.rect.x)) {
      theNode.rect.x = 0;
    }

    if (isNaN(theNode.rect.y)) {
      theNode.rect.y = 0;
    }

    if (children_of_children != null && children_of_children.length > 0) {
      var theNewGraph;
      theNewGraph = _CoSELayout.layout.getGraphManager().add(_CoSELayout.layout.newGraph(), theNode);
      this.processChildrenList(theNewGraph, children_of_children);
    }
  }
};

module.exports = function get(cytoscape) {
  Thread = cytoscape.Thread;

  return _CoSELayout;
};
},{"./CoSEConstants":1,"./CoSEEdge":2,"./CoSEGraph":3,"./CoSEGraphManager":4,"./CoSELayout":5,"./CoSENode":6,"./DimensionD":7,"./FDLayout":8,"./FDLayoutConstants":9,"./FDLayoutEdge":10,"./FDLayoutNode":11,"./HashMap":12,"./HashSet":13,"./IGeometry":14,"./IMath":15,"./Integer":16,"./LEdge":17,"./LGraph":18,"./LGraphManager":19,"./LGraphObject":20,"./LNode":21,"./Layout":22,"./LayoutConstants":23,"./Point":24,"./PointD":25,"./RandomSeed":26,"./RectangleD":27,"./Transform":28,"./UniqueIDGeneretor":29,"./layoutOptionsPack":31}],31:[function(_dereq_,module,exports){
function layoutOptionsPack() {
}

module.exports = layoutOptionsPack;
},{}],32:[function(_dereq_,module,exports){
'use strict';

(function(){

  // registers the extension on a cytoscape lib ref
  var getLayout = _dereq_('./Layout');
  var register = function( cytoscape ){
    var Layout = getLayout( cytoscape );

    cytoscape('layout', 'cose-bilkent', Layout);
  };

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-cose-bilkent', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape );
  }

})();

},{"./Layout":30}]},{},[32])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTGF5b3V0L0NvU0VDb25zdGFudHMuanMiLCJzcmMvTGF5b3V0L0NvU0VFZGdlLmpzIiwic3JjL0xheW91dC9Db1NFR3JhcGguanMiLCJzcmMvTGF5b3V0L0NvU0VHcmFwaE1hbmFnZXIuanMiLCJzcmMvTGF5b3V0L0NvU0VMYXlvdXQuanMiLCJzcmMvTGF5b3V0L0NvU0VOb2RlLmpzIiwic3JjL0xheW91dC9EaW1lbnNpb25ELmpzIiwic3JjL0xheW91dC9GRExheW91dC5qcyIsInNyYy9MYXlvdXQvRkRMYXlvdXRDb25zdGFudHMuanMiLCJzcmMvTGF5b3V0L0ZETGF5b3V0RWRnZS5qcyIsInNyYy9MYXlvdXQvRkRMYXlvdXROb2RlLmpzIiwic3JjL0xheW91dC9IYXNoTWFwLmpzIiwic3JjL0xheW91dC9IYXNoU2V0LmpzIiwic3JjL0xheW91dC9JR2VvbWV0cnkuanMiLCJzcmMvTGF5b3V0L0lNYXRoLmpzIiwic3JjL0xheW91dC9JbnRlZ2VyLmpzIiwic3JjL0xheW91dC9MRWRnZS5qcyIsInNyYy9MYXlvdXQvTEdyYXBoLmpzIiwic3JjL0xheW91dC9MR3JhcGhNYW5hZ2VyLmpzIiwic3JjL0xheW91dC9MR3JhcGhPYmplY3QuanMiLCJzcmMvTGF5b3V0L0xOb2RlLmpzIiwic3JjL0xheW91dC9MYXlvdXQuanMiLCJzcmMvTGF5b3V0L0xheW91dENvbnN0YW50cy5qcyIsInNyYy9MYXlvdXQvUG9pbnQuanMiLCJzcmMvTGF5b3V0L1BvaW50RC5qcyIsInNyYy9MYXlvdXQvUmFuZG9tU2VlZC5qcyIsInNyYy9MYXlvdXQvUmVjdGFuZ2xlRC5qcyIsInNyYy9MYXlvdXQvVHJhbnNmb3JtLmpzIiwic3JjL0xheW91dC9VbmlxdWVJREdlbmVyZXRvci5qcyIsInNyYy9MYXlvdXQvaW5kZXguanMiLCJzcmMvTGF5b3V0L2xheW91dE9wdGlvbnNQYWNrLmpzIiwic3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9hQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5L0JBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBGRExheW91dENvbnN0YW50cyA9IHJlcXVpcmUoJy4vRkRMYXlvdXRDb25zdGFudHMnKTtcblxuZnVuY3Rpb24gQ29TRUNvbnN0YW50cygpIHtcbn1cblxuLy9Db1NFQ29uc3RhbnRzIGluaGVyaXRzIHN0YXRpYyBwcm9wcyBpbiBGRExheW91dENvbnN0YW50c1xuZm9yICh2YXIgcHJvcCBpbiBGRExheW91dENvbnN0YW50cykge1xuICBDb1NFQ29uc3RhbnRzW3Byb3BdID0gRkRMYXlvdXRDb25zdGFudHNbcHJvcF07XG59XG5cbkNvU0VDb25zdGFudHMuREVGQVVMVF9VU0VfTVVMVElfTEVWRUxfU0NBTElORyA9IGZhbHNlO1xuQ29TRUNvbnN0YW50cy5ERUZBVUxUX1JBRElBTF9TRVBBUkFUSU9OID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9FREdFX0xFTkdUSDtcbkNvU0VDb25zdGFudHMuREVGQVVMVF9DT01QT05FTlRfU0VQRVJBVElPTiA9IDYwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvU0VDb25zdGFudHM7XG4iLCJ2YXIgRkRMYXlvdXRFZGdlID0gcmVxdWlyZSgnLi9GRExheW91dEVkZ2UnKTtcblxuZnVuY3Rpb24gQ29TRUVkZ2Uoc291cmNlLCB0YXJnZXQsIHZFZGdlKSB7XG4gIEZETGF5b3V0RWRnZS5jYWxsKHRoaXMsIHNvdXJjZSwgdGFyZ2V0LCB2RWRnZSk7XG59XG5cbkNvU0VFZGdlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRkRMYXlvdXRFZGdlLnByb3RvdHlwZSk7XG5mb3IgKHZhciBwcm9wIGluIEZETGF5b3V0RWRnZSkge1xuICBDb1NFRWRnZVtwcm9wXSA9IEZETGF5b3V0RWRnZVtwcm9wXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb1NFRWRnZVxuIiwidmFyIExHcmFwaCA9IHJlcXVpcmUoJy4vTEdyYXBoJyk7XG5cbmZ1bmN0aW9uIENvU0VHcmFwaChwYXJlbnQsIGdyYXBoTWdyLCB2R3JhcGgpIHtcbiAgTEdyYXBoLmNhbGwodGhpcywgcGFyZW50LCBncmFwaE1nciwgdkdyYXBoKTtcbn1cblxuQ29TRUdyYXBoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTEdyYXBoLnByb3RvdHlwZSk7XG5mb3IgKHZhciBwcm9wIGluIExHcmFwaCkge1xuICBDb1NFR3JhcGhbcHJvcF0gPSBMR3JhcGhbcHJvcF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29TRUdyYXBoO1xuIiwidmFyIExHcmFwaE1hbmFnZXIgPSByZXF1aXJlKCcuL0xHcmFwaE1hbmFnZXInKTtcblxuZnVuY3Rpb24gQ29TRUdyYXBoTWFuYWdlcihsYXlvdXQpIHtcbiAgTEdyYXBoTWFuYWdlci5jYWxsKHRoaXMsIGxheW91dCk7XG59XG5cbkNvU0VHcmFwaE1hbmFnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShMR3JhcGhNYW5hZ2VyLnByb3RvdHlwZSk7XG5mb3IgKHZhciBwcm9wIGluIExHcmFwaE1hbmFnZXIpIHtcbiAgQ29TRUdyYXBoTWFuYWdlcltwcm9wXSA9IExHcmFwaE1hbmFnZXJbcHJvcF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29TRUdyYXBoTWFuYWdlcjtcbiIsInZhciBGRExheW91dCA9IHJlcXVpcmUoJy4vRkRMYXlvdXQnKTtcbnZhciBDb1NFR3JhcGhNYW5hZ2VyID0gcmVxdWlyZSgnLi9Db1NFR3JhcGhNYW5hZ2VyJyk7XG52YXIgQ29TRUdyYXBoID0gcmVxdWlyZSgnLi9Db1NFR3JhcGgnKTtcbnZhciBDb1NFTm9kZSA9IHJlcXVpcmUoJy4vQ29TRU5vZGUnKTtcbnZhciBDb1NFRWRnZSA9IHJlcXVpcmUoJy4vQ29TRUVkZ2UnKTtcblxuZnVuY3Rpb24gQ29TRUxheW91dCgpIHtcbiAgRkRMYXlvdXQuY2FsbCh0aGlzKTtcbn1cblxuQ29TRUxheW91dC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZETGF5b3V0LnByb3RvdHlwZSk7XG5cbmZvciAodmFyIHByb3AgaW4gRkRMYXlvdXQpIHtcbiAgQ29TRUxheW91dFtwcm9wXSA9IEZETGF5b3V0W3Byb3BdO1xufVxuXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5uZXdHcmFwaE1hbmFnZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBnbSA9IG5ldyBDb1NFR3JhcGhNYW5hZ2VyKHRoaXMpO1xuICB0aGlzLmdyYXBoTWFuYWdlciA9IGdtO1xuICByZXR1cm4gZ207XG59O1xuXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5uZXdHcmFwaCA9IGZ1bmN0aW9uICh2R3JhcGgpIHtcbiAgcmV0dXJuIG5ldyBDb1NFR3JhcGgobnVsbCwgdGhpcy5ncmFwaE1hbmFnZXIsIHZHcmFwaCk7XG59O1xuXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5uZXdOb2RlID0gZnVuY3Rpb24gKHZOb2RlKSB7XG4gIHJldHVybiBuZXcgQ29TRU5vZGUodGhpcy5ncmFwaE1hbmFnZXIsIHZOb2RlKTtcbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLm5ld0VkZ2UgPSBmdW5jdGlvbiAodkVkZ2UpIHtcbiAgcmV0dXJuIG5ldyBDb1NFRWRnZShudWxsLCBudWxsLCB2RWRnZSk7XG59O1xuXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5pbml0UGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgRkRMYXlvdXQucHJvdG90eXBlLmluaXRQYXJhbWV0ZXJzLmNhbGwodGhpcywgYXJndW1lbnRzKTtcbiAgaWYgKCF0aGlzLmlzU3ViTGF5b3V0KSB7XG4gICAgaWYgKGxheW91dE9wdGlvbnNQYWNrLmlkZWFsRWRnZUxlbmd0aCA8IDEwKVxuICAgIHtcbiAgICAgIHRoaXMuaWRlYWxFZGdlTGVuZ3RoID0gMTA7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICB0aGlzLmlkZWFsRWRnZUxlbmd0aCA9IGxheW91dE9wdGlvbnNQYWNrLmlkZWFsRWRnZUxlbmd0aDtcbiAgICB9XG5cbiAgICB0aGlzLnVzZVNtYXJ0SWRlYWxFZGdlTGVuZ3RoQ2FsY3VsYXRpb24gPVxuICAgICAgICAgICAgbGF5b3V0T3B0aW9uc1BhY2suc21hcnRFZGdlTGVuZ3RoQ2FsYztcbiAgICB0aGlzLnNwcmluZ0NvbnN0YW50ID1cbiAgICAgICAgICAgIExheW91dC50cmFuc2Zvcm0obGF5b3V0T3B0aW9uc1BhY2suc3ByaW5nU3RyZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfU1BSSU5HX1NUUkVOR1RILCA1LjAsIDUuMCk7XG4gICAgdGhpcy5yZXB1bHNpb25Db25zdGFudCA9XG4gICAgICAgICAgICBMYXlvdXQudHJhbnNmb3JtKGxheW91dE9wdGlvbnNQYWNrLnJlcHVsc2lvblN0cmVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX1JFUFVMU0lPTl9TVFJFTkdUSCwgNS4wLCA1LjApO1xuICAgIHRoaXMuZ3Jhdml0eUNvbnN0YW50ID1cbiAgICAgICAgICAgIExheW91dC50cmFuc2Zvcm0obGF5b3V0T3B0aW9uc1BhY2suZ3Jhdml0eVN0cmVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0dSQVZJVFlfU1RSRU5HVEgpO1xuICAgIHRoaXMuY29tcG91bmRHcmF2aXR5Q29uc3RhbnQgPVxuICAgICAgICAgICAgTGF5b3V0LnRyYW5zZm9ybShsYXlvdXRPcHRpb25zUGFjay5jb21wb3VuZEdyYXZpdHlTdHJlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9DT01QT1VORF9HUkFWSVRZX1NUUkVOR1RIKTtcbiAgICB0aGlzLmdyYXZpdHlSYW5nZUZhY3RvciA9XG4gICAgICAgICAgICBMYXlvdXQudHJhbnNmb3JtKGxheW91dE9wdGlvbnNQYWNrLmdyYXZpdHlSYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9HUkFWSVRZX1JBTkdFX0ZBQ1RPUik7XG4gICAgdGhpcy5jb21wb3VuZEdyYXZpdHlSYW5nZUZhY3RvciA9XG4gICAgICAgICAgICBMYXlvdXQudHJhbnNmb3JtKGxheW91dE9wdGlvbnNQYWNrLmNvbXBvdW5kR3Jhdml0eVJhbmdlLFxuICAgICAgICAgICAgICAgICAgICBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0NPTVBPVU5EX0dSQVZJVFlfUkFOR0VfRkFDVE9SKTtcbiAgfVxufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUubGF5b3V0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3JlYXRlQmVuZHNBc05lZWRlZCA9IGxheW91dE9wdGlvbnNQYWNrLmNyZWF0ZUJlbmRzQXNOZWVkZWQ7XG4gIGlmIChjcmVhdGVCZW5kc0FzTmVlZGVkKVxuICB7XG4gICAgdGhpcy5jcmVhdGVCZW5kcG9pbnRzKCk7XG4gICAgdGhpcy5ncmFwaE1hbmFnZXIucmVzZXRBbGxFZGdlcygpO1xuICB9XG5cbiAgdGhpcy5sZXZlbCA9IDA7XG4gIHJldHVybiB0aGlzLmNsYXNzaWNMYXlvdXQoKTtcbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLmNsYXNzaWNMYXlvdXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY2FsY3VsYXRlTm9kZXNUb0FwcGx5R3Jhdml0YXRpb25UbygpO1xuICB0aGlzLmdyYXBoTWFuYWdlci5jYWxjTG93ZXN0Q29tbW9uQW5jZXN0b3JzKCk7XG4gIHRoaXMuZ3JhcGhNYW5hZ2VyLmNhbGNJbmNsdXNpb25UcmVlRGVwdGhzKCk7XG4gIHRoaXMuZ3JhcGhNYW5hZ2VyLmdldFJvb3QoKS5jYWxjRXN0aW1hdGVkU2l6ZSgpO1xuICB0aGlzLmNhbGNJZGVhbEVkZ2VMZW5ndGhzKCk7XG4gIGlmICghdGhpcy5pbmNyZW1lbnRhbClcbiAge1xuICAgIHZhciBmb3Jlc3QgPSB0aGlzLmdldEZsYXRGb3Jlc3QoKTtcblxuICAgIC8vIFRoZSBncmFwaCBhc3NvY2lhdGVkIHdpdGggdGhpcyBsYXlvdXQgaXMgZmxhdCBhbmQgYSBmb3Jlc3RcbiAgICBpZiAoZm9yZXN0Lmxlbmd0aCA+IDApXG5cbiAgICB7XG4gICAgICB0aGlzLnBvc2l0aW9uTm9kZXNSYWRpYWxseShmb3Jlc3QpO1xuICAgIH1cbiAgICAvLyBUaGUgZ3JhcGggYXNzb2NpYXRlZCB3aXRoIHRoaXMgbGF5b3V0IGlzIG5vdCBmbGF0IG9yIGEgZm9yZXN0XG4gICAgZWxzZVxuICAgIHtcbiAgICAgIHRoaXMucG9zaXRpb25Ob2Rlc1JhbmRvbWx5KCk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5pbml0U3ByaW5nRW1iZWRkZXIoKTtcbiAgdGhpcy5ydW5TcHJpbmdFbWJlZGRlcigpO1xuXG4gIGNvbnNvbGUubG9nKFwiQ2xhc3NpYyBDb1NFIGxheW91dCBmaW5pc2hlZCBhZnRlciBcIiArXG4gICAgICAgICAgdGhpcy50b3RhbEl0ZXJhdGlvbnMgKyBcIiBpdGVyYXRpb25zXCIpO1xuXG4gIHJldHVybiB0cnVlO1xufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUucnVuU3ByaW5nRW1iZWRkZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsYXN0RnJhbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgdmFyIGluaXRpYWxBbmltYXRpb25QZXJpb2QgPSAyNTtcbiAgdmFyIGFuaW1hdGlvblBlcmlvZCA9IGluaXRpYWxBbmltYXRpb25QZXJpb2Q7XG4gIGRvXG4gIHtcbiAgICB0aGlzLnRvdGFsSXRlcmF0aW9ucysrO1xuXG4gICAgaWYgKHRoaXMudG90YWxJdGVyYXRpb25zICUgRkRMYXlvdXRDb25zdGFudHMuQ09OVkVSR0VOQ0VfQ0hFQ0tfUEVSSU9EID09IDApXG4gICAge1xuICAgICAgaWYgKHRoaXMuaXNDb252ZXJnZWQoKSlcbiAgICAgIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY29vbGluZ0ZhY3RvciA9IHRoaXMuaW5pdGlhbENvb2xpbmdGYWN0b3IgKlxuICAgICAgICAgICAgICAoKHRoaXMubWF4SXRlcmF0aW9ucyAtIHRoaXMudG90YWxJdGVyYXRpb25zKSAvIHRoaXMubWF4SXRlcmF0aW9ucyk7XG4gICAgICBhbmltYXRpb25QZXJpb2QgPSBNYXRoLmNlaWwoaW5pdGlhbEFuaW1hdGlvblBlcmlvZCAqIE1hdGguc3FydCh0aGlzLmNvb2xpbmdGYWN0b3IpKTtcblxuICAgIH1cbiAgICB0aGlzLnRvdGFsRGlzcGxhY2VtZW50ID0gMDtcbiAgICB0aGlzLmdyYXBoTWFuYWdlci51cGRhdGVCb3VuZHMoKTtcbiAgICB0aGlzLmNhbGNTcHJpbmdGb3JjZXMoKTtcbiAgICB0aGlzLmNhbGNSZXB1bHNpb25Gb3JjZXMoKTtcbiAgICB0aGlzLmNhbGNHcmF2aXRhdGlvbmFsRm9yY2VzKCk7XG4gICAgdGhpcy5tb3ZlTm9kZXMoKTtcbiAgICB0aGlzLmFuaW1hdGUoKTtcbiAgICBpZiAobGF5b3V0T3B0aW9uc1BhY2suYW5pbWF0ZSAmJiB0aGlzLnRvdGFsSXRlcmF0aW9ucyAlIGFuaW1hdGlvblBlcmlvZCA9PSAwKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDFlNzsgaSsrKSB7XG4gICAgICAgIGlmICgobmV3IERhdGUoKS5nZXRUaW1lKCkgLSBsYXN0RnJhbWUpID4gMjUpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGFzdEZyYW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB2YXIgYWxsTm9kZXMgPSB0aGlzLmdyYXBoTWFuYWdlci5nZXRBbGxOb2RlcygpO1xuICAgICAgdmFyIHBEYXRhID0ge307XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByZWN0ID0gYWxsTm9kZXNbaV0ucmVjdDtcbiAgICAgICAgdmFyIGlkID0gYWxsTm9kZXNbaV0uaWQ7XG4gICAgICAgIHBEYXRhW2lkXSA9IHtcbiAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgeDogcmVjdC5nZXRDZW50ZXJYKCksXG4gICAgICAgICAgeTogcmVjdC5nZXRDZW50ZXJZKCksXG4gICAgICAgICAgdzogcmVjdC53aWR0aCxcbiAgICAgICAgICBoOiByZWN0LmhlaWdodFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgYnJvYWRjYXN0KHtwRGF0YTogcERhdGF9KTtcbiAgICB9XG4gIH1cbiAgd2hpbGUgKHRoaXMudG90YWxJdGVyYXRpb25zIDwgdGhpcy5tYXhJdGVyYXRpb25zKTtcblxuICB0aGlzLmdyYXBoTWFuYWdlci51cGRhdGVCb3VuZHMoKTtcbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLmNhbGN1bGF0ZU5vZGVzVG9BcHBseUdyYXZpdGF0aW9uVG8gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBub2RlTGlzdCA9IFtdO1xuICB2YXIgZ3JhcGg7XG5cbiAgdmFyIGdyYXBocyA9IHRoaXMuZ3JhcGhNYW5hZ2VyLmdldEdyYXBocygpO1xuICB2YXIgc2l6ZSA9IGdyYXBocy5sZW5ndGg7XG4gIHZhciBpO1xuICBmb3IgKGkgPSAwOyBpIDwgc2l6ZTsgaSsrKVxuICB7XG4gICAgZ3JhcGggPSBncmFwaHNbaV07XG5cbiAgICBncmFwaC51cGRhdGVDb25uZWN0ZWQoKTtcblxuICAgIGlmICghZ3JhcGguaXNDb25uZWN0ZWQpXG4gICAge1xuICAgICAgbm9kZUxpc3QgPSBub2RlTGlzdC5jb25jYXQoZ3JhcGguZ2V0Tm9kZXMoKSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5ncmFwaE1hbmFnZXIuc2V0QWxsTm9kZXNUb0FwcGx5R3Jhdml0YXRpb24obm9kZUxpc3QpO1xufTtcblxuQ29TRUxheW91dC5wcm90b3R5cGUuY3JlYXRlQmVuZHBvaW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVkZ2VzID0gW107XG4gIGVkZ2VzID0gZWRnZXMuY29uY2F0KHRoaXMuZ3JhcGhNYW5hZ2VyLmdldEFsbEVkZ2VzKCkpO1xuICB2YXIgdmlzaXRlZCA9IG5ldyBIYXNoU2V0KCk7XG4gIHZhciBpO1xuICBmb3IgKGkgPSAwOyBpIDwgZWRnZXMubGVuZ3RoOyBpKyspXG4gIHtcbiAgICB2YXIgZWRnZSA9IGVkZ2VzW2ldO1xuXG4gICAgaWYgKCF2aXNpdGVkLmNvbnRhaW5zKGVkZ2UpKVxuICAgIHtcbiAgICAgIHZhciBzb3VyY2UgPSBlZGdlLmdldFNvdXJjZSgpO1xuICAgICAgdmFyIHRhcmdldCA9IGVkZ2UuZ2V0VGFyZ2V0KCk7XG5cbiAgICAgIGlmIChzb3VyY2UgPT0gdGFyZ2V0KVxuICAgICAge1xuICAgICAgICBlZGdlLmdldEJlbmRwb2ludHMoKS5wdXNoKG5ldyBQb2ludEQoKSk7XG4gICAgICAgIGVkZ2UuZ2V0QmVuZHBvaW50cygpLnB1c2gobmV3IFBvaW50RCgpKTtcbiAgICAgICAgdGhpcy5jcmVhdGVEdW1teU5vZGVzRm9yQmVuZHBvaW50cyhlZGdlKTtcbiAgICAgICAgdmlzaXRlZC5hZGQoZWRnZSk7XG4gICAgICB9XG4gICAgICBlbHNlXG4gICAgICB7XG4gICAgICAgIHZhciBlZGdlTGlzdCA9IFtdO1xuXG4gICAgICAgIGVkZ2VMaXN0ID0gZWRnZUxpc3QuY29uY2F0KHNvdXJjZS5nZXRFZGdlTGlzdFRvTm9kZSh0YXJnZXQpKTtcbiAgICAgICAgZWRnZUxpc3QgPSBlZGdlTGlzdC5jb25jYXQodGFyZ2V0LmdldEVkZ2VMaXN0VG9Ob2RlKHNvdXJjZSkpO1xuXG4gICAgICAgIGlmICghdmlzaXRlZC5jb250YWlucyhlZGdlTGlzdFswXSkpXG4gICAgICAgIHtcbiAgICAgICAgICBpZiAoZWRnZUxpc3QubGVuZ3RoID4gMSlcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YXIgaztcbiAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCBlZGdlTGlzdC5sZW5ndGg7IGsrKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdmFyIG11bHRpRWRnZSA9IGVkZ2VMaXN0W2tdO1xuICAgICAgICAgICAgICBtdWx0aUVkZ2UuZ2V0QmVuZHBvaW50cygpLnB1c2gobmV3IFBvaW50RCgpKTtcbiAgICAgICAgICAgICAgdGhpcy5jcmVhdGVEdW1teU5vZGVzRm9yQmVuZHBvaW50cyhtdWx0aUVkZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB2aXNpdGVkLmFkZEFsbChsaXN0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh2aXNpdGVkLnNpemUoKSA9PSBlZGdlcy5sZW5ndGgpXG4gICAge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59O1xuXG5Db1NFTGF5b3V0LnByb3RvdHlwZS5wb3NpdGlvbk5vZGVzUmFkaWFsbHkgPSBmdW5jdGlvbiAoZm9yZXN0KSB7XG4gIC8vIFdlIHRpbGUgdGhlIHRyZWVzIHRvIGEgZ3JpZCByb3cgYnkgcm93OyBmaXJzdCB0cmVlIHN0YXJ0cyBhdCAoMCwwKVxuICB2YXIgY3VycmVudFN0YXJ0aW5nUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIHZhciBudW1iZXJPZkNvbHVtbnMgPSBNYXRoLmNlaWwoTWF0aC5zcXJ0KGZvcmVzdC5sZW5ndGgpKTtcbiAgdmFyIGhlaWdodCA9IDA7XG4gIHZhciBjdXJyZW50WSA9IDA7XG4gIHZhciBjdXJyZW50WCA9IDA7XG4gIHZhciBwb2ludCA9IG5ldyBQb2ludEQoMCwgMCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBmb3Jlc3QubGVuZ3RoOyBpKyspXG4gIHtcbiAgICBpZiAoaSAlIG51bWJlck9mQ29sdW1ucyA9PSAwKVxuICAgIHtcbiAgICAgIC8vIFN0YXJ0IG9mIGEgbmV3IHJvdywgbWFrZSB0aGUgeCBjb29yZGluYXRlIDAsIGluY3JlbWVudCB0aGVcbiAgICAgIC8vIHkgY29vcmRpbmF0ZSB3aXRoIHRoZSBtYXggaGVpZ2h0IG9mIHRoZSBwcmV2aW91cyByb3dcbiAgICAgIGN1cnJlbnRYID0gMDtcbiAgICAgIGN1cnJlbnRZID0gaGVpZ2h0O1xuXG4gICAgICBpZiAoaSAhPSAwKVxuICAgICAge1xuICAgICAgICBjdXJyZW50WSArPSBDb1NFQ29uc3RhbnRzLkRFRkFVTFRfQ09NUE9ORU5UX1NFUEVSQVRJT047XG4gICAgICB9XG5cbiAgICAgIGhlaWdodCA9IDA7XG4gICAgfVxuXG4gICAgdmFyIHRyZWUgPSBmb3Jlc3RbaV07XG5cbiAgICAvLyBGaW5kIHRoZSBjZW50ZXIgb2YgdGhlIHRyZWVcbiAgICB2YXIgY2VudGVyTm9kZSA9IExheW91dC5maW5kQ2VudGVyT2ZUcmVlKHRyZWUpO1xuXG4gICAgLy8gU2V0IHRoZSBzdGFyaW5nIHBvaW50IG9mIHRoZSBuZXh0IHRyZWVcbiAgICBjdXJyZW50U3RhcnRpbmdQb2ludC54ID0gY3VycmVudFg7XG4gICAgY3VycmVudFN0YXJ0aW5nUG9pbnQueSA9IGN1cnJlbnRZO1xuXG4gICAgLy8gRG8gYSByYWRpYWwgbGF5b3V0IHN0YXJ0aW5nIHdpdGggdGhlIGNlbnRlclxuICAgIHBvaW50ID1cbiAgICAgICAgICAgIENvU0VMYXlvdXQucmFkaWFsTGF5b3V0KHRyZWUsIGNlbnRlck5vZGUsIGN1cnJlbnRTdGFydGluZ1BvaW50KTtcblxuICAgIGlmIChwb2ludC55ID4gaGVpZ2h0KVxuICAgIHtcbiAgICAgIGhlaWdodCA9IE1hdGguZmxvb3IocG9pbnQueSk7XG4gICAgfVxuXG4gICAgY3VycmVudFggPSBNYXRoLmZsb29yKHBvaW50LnggKyBDb1NFQ29uc3RhbnRzLkRFRkFVTFRfQ09NUE9ORU5UX1NFUEVSQVRJT04pO1xuICB9XG5cbiAgdGhpcy50cmFuc2Zvcm0oXG4gICAgICAgICAgbmV3IFBvaW50RChMYXlvdXRDb25zdGFudHMuV09STERfQ0VOVEVSX1ggLSBwb2ludC54IC8gMixcbiAgICAgICAgICAgICAgICAgIExheW91dENvbnN0YW50cy5XT1JMRF9DRU5URVJfWSAtIHBvaW50LnkgLyAyKSk7XG59O1xuXG5Db1NFTGF5b3V0LnJhZGlhbExheW91dCA9IGZ1bmN0aW9uICh0cmVlLCBjZW50ZXJOb2RlLCBzdGFydGluZ1BvaW50KSB7XG4gIHZhciByYWRpYWxTZXAgPSBNYXRoLm1heCh0aGlzLm1heERpYWdvbmFsSW5UcmVlKHRyZWUpLFxuICAgICAgICAgIENvU0VDb25zdGFudHMuREVGQVVMVF9SQURJQUxfU0VQQVJBVElPTik7XG4gIENvU0VMYXlvdXQuYnJhbmNoUmFkaWFsTGF5b3V0KGNlbnRlck5vZGUsIG51bGwsIDAsIDM1OSwgMCwgcmFkaWFsU2VwKTtcbiAgdmFyIGJvdW5kcyA9IExHcmFwaC5jYWxjdWxhdGVCb3VuZHModHJlZSk7XG5cbiAgdmFyIHRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0oKTtcbiAgdHJhbnNmb3JtLnNldERldmljZU9yZ1goYm91bmRzLmdldE1pblgoKSk7XG4gIHRyYW5zZm9ybS5zZXREZXZpY2VPcmdZKGJvdW5kcy5nZXRNaW5ZKCkpO1xuICB0cmFuc2Zvcm0uc2V0V29ybGRPcmdYKHN0YXJ0aW5nUG9pbnQueCk7XG4gIHRyYW5zZm9ybS5zZXRXb3JsZE9yZ1koc3RhcnRpbmdQb2ludC55KTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRyZWUubGVuZ3RoOyBpKyspXG4gIHtcbiAgICB2YXIgbm9kZSA9IHRyZWVbaV07XG4gICAgbm9kZS50cmFuc2Zvcm0odHJhbnNmb3JtKTtcbiAgfVxuXG4gIHZhciBib3R0b21SaWdodCA9XG4gICAgICAgICAgbmV3IFBvaW50RChib3VuZHMuZ2V0TWF4WCgpLCBib3VuZHMuZ2V0TWF4WSgpKTtcblxuICByZXR1cm4gdHJhbnNmb3JtLmludmVyc2VUcmFuc2Zvcm1Qb2ludChib3R0b21SaWdodCk7XG59O1xuXG5Db1NFTGF5b3V0LmJyYW5jaFJhZGlhbExheW91dCA9IGZ1bmN0aW9uIChub2RlLCBwYXJlbnRPZk5vZGUsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBkaXN0YW5jZSwgcmFkaWFsU2VwYXJhdGlvbikge1xuICAvLyBGaXJzdCwgcG9zaXRpb24gdGhpcyBub2RlIGJ5IGZpbmRpbmcgaXRzIGFuZ2xlLlxuICB2YXIgaGFsZkludGVydmFsID0gKChlbmRBbmdsZSAtIHN0YXJ0QW5nbGUpICsgMSkgLyAyO1xuXG4gIGlmIChoYWxmSW50ZXJ2YWwgPCAwKVxuICB7XG4gICAgaGFsZkludGVydmFsICs9IDE4MDtcbiAgfVxuXG4gIHZhciBub2RlQW5nbGUgPSAoaGFsZkludGVydmFsICsgc3RhcnRBbmdsZSkgJSAzNjA7XG4gIHZhciB0ZXRhID0gKG5vZGVBbmdsZSAqIElHZW9tZXRyeS5UV09fUEkpIC8gMzYwO1xuXG4gIC8vIE1ha2UgcG9sYXIgdG8gamF2YSBjb3JkaW5hdGUgY29udmVyc2lvbi5cbiAgdmFyIGNvc190ZXRhID0gTWF0aC5jb3ModGV0YSk7XG4gIHZhciB4XyA9IGRpc3RhbmNlICogTWF0aC5jb3ModGV0YSk7XG4gIHZhciB5XyA9IGRpc3RhbmNlICogTWF0aC5zaW4odGV0YSk7XG5cbiAgbm9kZS5zZXRDZW50ZXIoeF8sIHlfKTtcblxuICAvLyBUcmF2ZXJzZSBhbGwgbmVpZ2hib3JzIG9mIHRoaXMgbm9kZSBhbmQgcmVjdXJzaXZlbHkgY2FsbCB0aGlzXG4gIC8vIGZ1bmN0aW9uLlxuICB2YXIgbmVpZ2hib3JFZGdlcyA9IFtdO1xuICBuZWlnaGJvckVkZ2VzID0gbmVpZ2hib3JFZGdlcy5jb25jYXQobm9kZS5nZXRFZGdlcygpKTtcbiAgdmFyIGNoaWxkQ291bnQgPSBuZWlnaGJvckVkZ2VzLmxlbmd0aDtcblxuICBpZiAocGFyZW50T2ZOb2RlICE9IG51bGwpXG4gIHtcbiAgICBjaGlsZENvdW50LS07XG4gIH1cblxuICB2YXIgYnJhbmNoQ291bnQgPSAwO1xuXG4gIHZhciBpbmNFZGdlc0NvdW50ID0gbmVpZ2hib3JFZGdlcy5sZW5ndGg7XG4gIHZhciBzdGFydEluZGV4O1xuXG4gIHZhciBlZGdlcyA9IG5vZGUuZ2V0RWRnZXNCZXR3ZWVuKHBhcmVudE9mTm9kZSk7XG5cbiAgLy8gSWYgdGhlcmUgYXJlIG11bHRpcGxlIGVkZ2VzLCBwcnVuZSB0aGVtIHVudGlsIHRoZXJlIHJlbWFpbnMgb25seSBvbmVcbiAgLy8gZWRnZS5cbiAgd2hpbGUgKGVkZ2VzLmxlbmd0aCA+IDEpXG4gIHtcbiAgICAvL25laWdoYm9yRWRnZXMucmVtb3ZlKGVkZ2VzLnJlbW92ZSgwKSk7XG4gICAgdmFyIHRlbXAgPSBlZGdlc1swXTtcbiAgICBlZGdlcy5zcGxpY2UoMCwgMSk7XG4gICAgdmFyIGluZGV4ID0gbmVpZ2hib3JFZGdlcy5pbmRleE9mKHRlbXApO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBuZWlnaGJvckVkZ2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIGluY0VkZ2VzQ291bnQtLTtcbiAgICBjaGlsZENvdW50LS07XG4gIH1cblxuICBpZiAocGFyZW50T2ZOb2RlICE9IG51bGwpXG4gIHtcbiAgICAvL2Fzc2VydCBlZGdlcy5sZW5ndGggPT0gMTtcbiAgICBzdGFydEluZGV4ID0gKG5laWdoYm9yRWRnZXMuaW5kZXhPZihlZGdlc1swXSkgKyAxKSAlIGluY0VkZ2VzQ291bnQ7XG4gIH1cbiAgZWxzZVxuICB7XG4gICAgc3RhcnRJbmRleCA9IDA7XG4gIH1cblxuICB2YXIgc3RlcEFuZ2xlID0gTWF0aC5hYnMoZW5kQW5nbGUgLSBzdGFydEFuZ2xlKSAvIGNoaWxkQ291bnQ7XG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXg7XG4gICAgICAgICAgYnJhbmNoQ291bnQgIT0gY2hpbGRDb3VudDtcbiAgICAgICAgICBpID0gKCsraSkgJSBpbmNFZGdlc0NvdW50KVxuICB7XG4gICAgdmFyIGN1cnJlbnROZWlnaGJvciA9XG4gICAgICAgICAgICBuZWlnaGJvckVkZ2VzW2ldLmdldE90aGVyRW5kKG5vZGUpO1xuXG4gICAgLy8gRG9uJ3QgYmFjayB0cmF2ZXJzZSB0byByb290IG5vZGUgaW4gY3VycmVudCB0cmVlLlxuICAgIGlmIChjdXJyZW50TmVpZ2hib3IgPT0gcGFyZW50T2ZOb2RlKVxuICAgIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHZhciBjaGlsZFN0YXJ0QW5nbGUgPVxuICAgICAgICAgICAgKHN0YXJ0QW5nbGUgKyBicmFuY2hDb3VudCAqIHN0ZXBBbmdsZSkgJSAzNjA7XG4gICAgdmFyIGNoaWxkRW5kQW5nbGUgPSAoY2hpbGRTdGFydEFuZ2xlICsgc3RlcEFuZ2xlKSAlIDM2MDtcblxuICAgIENvU0VMYXlvdXQuYnJhbmNoUmFkaWFsTGF5b3V0KGN1cnJlbnROZWlnaGJvcixcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICBjaGlsZFN0YXJ0QW5nbGUsIGNoaWxkRW5kQW5nbGUsXG4gICAgICAgICAgICBkaXN0YW5jZSArIHJhZGlhbFNlcGFyYXRpb24sIHJhZGlhbFNlcGFyYXRpb24pO1xuXG4gICAgYnJhbmNoQ291bnQrKztcbiAgfVxufTtcblxuQ29TRUxheW91dC5tYXhEaWFnb25hbEluVHJlZSA9IGZ1bmN0aW9uICh0cmVlKSB7XG4gIHZhciBtYXhEaWFnb25hbCA9IEludGVnZXIuTUlOX1ZBTFVFO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJlZS5sZW5ndGg7IGkrKylcbiAge1xuICAgIHZhciBub2RlID0gdHJlZVtpXTtcbiAgICB2YXIgZGlhZ29uYWwgPSBub2RlLmdldERpYWdvbmFsKCk7XG5cbiAgICBpZiAoZGlhZ29uYWwgPiBtYXhEaWFnb25hbClcbiAgICB7XG4gICAgICBtYXhEaWFnb25hbCA9IGRpYWdvbmFsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXhEaWFnb25hbDtcbn07XG5cbkNvU0VMYXlvdXQucHJvdG90eXBlLmNhbGNSZXB1bHNpb25SYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gZm9ybXVsYSBpcyAyIHggKGxldmVsICsgMSkgeCBpZGVhbEVkZ2VMZW5ndGhcbiAgcmV0dXJuICgyICogKHRoaXMubGV2ZWwgKyAxKSAqIHRoaXMuaWRlYWxFZGdlTGVuZ3RoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29TRUxheW91dDtcbiIsInZhciBGRExheW91dE5vZGUgPSByZXF1aXJlKCcuL0ZETGF5b3V0Tm9kZScpO1xuXG5mdW5jdGlvbiBDb1NFTm9kZShnbSwgbG9jLCBzaXplLCB2Tm9kZSkge1xuICBGRExheW91dE5vZGUuY2FsbCh0aGlzLCBnbSwgbG9jLCBzaXplLCB2Tm9kZSk7XG59XG5cblxuQ29TRU5vZGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGRExheW91dE5vZGUucHJvdG90eXBlKTtcbmZvciAodmFyIHByb3AgaW4gRkRMYXlvdXROb2RlKSB7XG4gIENvU0VOb2RlW3Byb3BdID0gRkRMYXlvdXROb2RlW3Byb3BdO1xufVxuXG5Db1NFTm9kZS5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uICgpXG57XG4gIHZhciBsYXlvdXQgPSB0aGlzLmdyYXBoTWFuYWdlci5nZXRMYXlvdXQoKTtcbiAgdGhpcy5kaXNwbGFjZW1lbnRYID0gbGF5b3V0LmNvb2xpbmdGYWN0b3IgKlxuICAgICAgICAgICh0aGlzLnNwcmluZ0ZvcmNlWCArIHRoaXMucmVwdWxzaW9uRm9yY2VYICsgdGhpcy5ncmF2aXRhdGlvbkZvcmNlWCk7XG4gIHRoaXMuZGlzcGxhY2VtZW50WSA9IGxheW91dC5jb29saW5nRmFjdG9yICpcbiAgICAgICAgICAodGhpcy5zcHJpbmdGb3JjZVkgKyB0aGlzLnJlcHVsc2lvbkZvcmNlWSArIHRoaXMuZ3Jhdml0YXRpb25Gb3JjZVkpO1xuXG5cbiAgaWYgKE1hdGguYWJzKHRoaXMuZGlzcGxhY2VtZW50WCkgPiBsYXlvdXQuY29vbGluZ0ZhY3RvciAqIGxheW91dC5tYXhOb2RlRGlzcGxhY2VtZW50KVxuICB7XG4gICAgdGhpcy5kaXNwbGFjZW1lbnRYID0gbGF5b3V0LmNvb2xpbmdGYWN0b3IgKiBsYXlvdXQubWF4Tm9kZURpc3BsYWNlbWVudCAqXG4gICAgICAgICAgICBJTWF0aC5zaWduKHRoaXMuZGlzcGxhY2VtZW50WCk7XG4gIH1cblxuICBpZiAoTWF0aC5hYnModGhpcy5kaXNwbGFjZW1lbnRZKSA+IGxheW91dC5jb29saW5nRmFjdG9yICogbGF5b3V0Lm1heE5vZGVEaXNwbGFjZW1lbnQpXG4gIHtcbiAgICB0aGlzLmRpc3BsYWNlbWVudFkgPSBsYXlvdXQuY29vbGluZ0ZhY3RvciAqIGxheW91dC5tYXhOb2RlRGlzcGxhY2VtZW50ICpcbiAgICAgICAgICAgIElNYXRoLnNpZ24odGhpcy5kaXNwbGFjZW1lbnRZKTtcbiAgfVxuXG4gIC8vIGEgc2ltcGxlIG5vZGUsIGp1c3QgbW92ZSBpdFxuICBpZiAodGhpcy5jaGlsZCA9PSBudWxsKVxuICB7XG4gICAgdGhpcy5tb3ZlQnkodGhpcy5kaXNwbGFjZW1lbnRYLCB0aGlzLmRpc3BsYWNlbWVudFkpO1xuICB9XG4gIC8vIGFuIGVtcHR5IGNvbXBvdW5kIG5vZGUsIGFnYWluIGp1c3QgbW92ZSBpdFxuICBlbHNlIGlmICh0aGlzLmNoaWxkLmdldE5vZGVzKCkubGVuZ3RoID09IDApXG4gIHtcbiAgICB0aGlzLm1vdmVCeSh0aGlzLmRpc3BsYWNlbWVudFgsIHRoaXMuZGlzcGxhY2VtZW50WSk7XG4gIH1cbiAgLy8gbm9uLWVtcHR5IGNvbXBvdW5kIG5vZGUsIHByb3BvZ2F0ZSBtb3ZlbWVudCB0byBjaGlsZHJlbiBhcyB3ZWxsXG4gIGVsc2VcbiAge1xuICAgIHRoaXMucHJvcG9nYXRlRGlzcGxhY2VtZW50VG9DaGlsZHJlbih0aGlzLmRpc3BsYWNlbWVudFgsXG4gICAgICAgICAgICB0aGlzLmRpc3BsYWNlbWVudFkpO1xuICB9XG5cbiAgbGF5b3V0LnRvdGFsRGlzcGxhY2VtZW50ICs9XG4gICAgICAgICAgTWF0aC5hYnModGhpcy5kaXNwbGFjZW1lbnRYKSArIE1hdGguYWJzKHRoaXMuZGlzcGxhY2VtZW50WSk7XG5cbiAgdGhpcy5zcHJpbmdGb3JjZVggPSAwO1xuICB0aGlzLnNwcmluZ0ZvcmNlWSA9IDA7XG4gIHRoaXMucmVwdWxzaW9uRm9yY2VYID0gMDtcbiAgdGhpcy5yZXB1bHNpb25Gb3JjZVkgPSAwO1xuICB0aGlzLmdyYXZpdGF0aW9uRm9yY2VYID0gMDtcbiAgdGhpcy5ncmF2aXRhdGlvbkZvcmNlWSA9IDA7XG4gIHRoaXMuZGlzcGxhY2VtZW50WCA9IDA7XG4gIHRoaXMuZGlzcGxhY2VtZW50WSA9IDA7XG59O1xuXG5Db1NFTm9kZS5wcm90b3R5cGUucHJvcG9nYXRlRGlzcGxhY2VtZW50VG9DaGlsZHJlbiA9IGZ1bmN0aW9uIChkWCwgZFkpXG57XG4gIHZhciBub2RlcyA9IHRoaXMuZ2V0Q2hpbGQoKS5nZXROb2RlcygpO1xuICB2YXIgbm9kZTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKylcbiAge1xuICAgIG5vZGUgPSBub2Rlc1tpXTtcbiAgICBpZiAobm9kZS5nZXRDaGlsZCgpID09IG51bGwpXG4gICAge1xuICAgICAgbm9kZS5tb3ZlQnkoZFgsIGRZKTtcbiAgICAgIG5vZGUuZGlzcGxhY2VtZW50WCArPSBkWDtcbiAgICAgIG5vZGUuZGlzcGxhY2VtZW50WSArPSBkWTtcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgIG5vZGUucHJvcG9nYXRlRGlzcGxhY2VtZW50VG9DaGlsZHJlbihkWCwgZFkpO1xuICAgIH1cbiAgfVxufTtcblxuQ29TRU5vZGUucHJvdG90eXBlLnNldFByZWQxID0gZnVuY3Rpb24gKHByZWQxKVxue1xuICB0aGlzLnByZWQxID0gcHJlZDE7XG59O1xuXG5Db1NFTm9kZS5wcm90b3R5cGUuZ2V0UHJlZDEgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gcHJlZDE7XG59O1xuXG5Db1NFTm9kZS5wcm90b3R5cGUuZ2V0UHJlZDIgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gcHJlZDI7XG59O1xuXG5Db1NFTm9kZS5wcm90b3R5cGUuc2V0TmV4dCA9IGZ1bmN0aW9uIChuZXh0KVxue1xuICB0aGlzLm5leHQgPSBuZXh0O1xufTtcblxuQ29TRU5vZGUucHJvdG90eXBlLmdldE5leHQgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gbmV4dDtcbn07XG5cbkNvU0VOb2RlLnByb3RvdHlwZS5zZXRQcm9jZXNzZWQgPSBmdW5jdGlvbiAocHJvY2Vzc2VkKVxue1xuICB0aGlzLnByb2Nlc3NlZCA9IHByb2Nlc3NlZDtcbn07XG5cbkNvU0VOb2RlLnByb3RvdHlwZS5pc1Byb2Nlc3NlZCA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiBwcm9jZXNzZWQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvU0VOb2RlO1xuIiwiZnVuY3Rpb24gRGltZW5zaW9uRCh3aWR0aCwgaGVpZ2h0KSB7XG4gIHRoaXMud2lkdGggPSAwO1xuICB0aGlzLmhlaWdodCA9IDA7XG4gIGlmICh3aWR0aCAhPT0gbnVsbCAmJiBoZWlnaHQgIT09IG51bGwpIHtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gIH1cbn1cblxuRGltZW5zaW9uRC5wcm90b3R5cGUuZ2V0V2lkdGggPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy53aWR0aDtcbn07XG5cbkRpbWVuc2lvbkQucHJvdG90eXBlLnNldFdpZHRoID0gZnVuY3Rpb24gKHdpZHRoKVxue1xuICB0aGlzLndpZHRoID0gd2lkdGg7XG59O1xuXG5EaW1lbnNpb25ELnByb3RvdHlwZS5nZXRIZWlnaHQgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy5oZWlnaHQ7XG59O1xuXG5EaW1lbnNpb25ELnByb3RvdHlwZS5zZXRIZWlnaHQgPSBmdW5jdGlvbiAoaGVpZ2h0KVxue1xuICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGltZW5zaW9uRDtcbiIsInZhciBMYXlvdXQgPSByZXF1aXJlKCcuL0xheW91dCcpO1xudmFyIEZETGF5b3V0Q29uc3RhbnRzID0gcmVxdWlyZSgnLi9GRExheW91dENvbnN0YW50cycpO1xuXG5mdW5jdGlvbiBGRExheW91dCgpIHtcbiAgTGF5b3V0LmNhbGwodGhpcyk7XG5cbiAgdGhpcy51c2VTbWFydElkZWFsRWRnZUxlbmd0aENhbGN1bGF0aW9uID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9VU0VfU01BUlRfSURFQUxfRURHRV9MRU5HVEhfQ0FMQ1VMQVRJT047XG4gIHRoaXMuaWRlYWxFZGdlTGVuZ3RoID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9FREdFX0xFTkdUSDtcbiAgdGhpcy5zcHJpbmdDb25zdGFudCA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfU1BSSU5HX1NUUkVOR1RIO1xuICB0aGlzLnJlcHVsc2lvbkNvbnN0YW50ID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9SRVBVTFNJT05fU1RSRU5HVEg7XG4gIHRoaXMuZ3Jhdml0eUNvbnN0YW50ID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9HUkFWSVRZX1NUUkVOR1RIO1xuICB0aGlzLmNvbXBvdW5kR3Jhdml0eUNvbnN0YW50ID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9DT01QT1VORF9HUkFWSVRZX1NUUkVOR1RIO1xuICB0aGlzLmdyYXZpdHlSYW5nZUZhY3RvciA9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfR1JBVklUWV9SQU5HRV9GQUNUT1I7XG4gIHRoaXMuY29tcG91bmRHcmF2aXR5UmFuZ2VGYWN0b3IgPSBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0NPTVBPVU5EX0dSQVZJVFlfUkFOR0VfRkFDVE9SO1xuICB0aGlzLmRpc3BsYWNlbWVudFRocmVzaG9sZFBlck5vZGUgPSAoMy4wICogRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9FREdFX0xFTkdUSCkgLyAxMDA7XG4gIHRoaXMuY29vbGluZ0ZhY3RvciA9IDEuMDtcbiAgdGhpcy5pbml0aWFsQ29vbGluZ0ZhY3RvciA9IDEuMDtcbiAgdGhpcy50b3RhbERpc3BsYWNlbWVudCA9IDAuMDtcbiAgdGhpcy5vbGRUb3RhbERpc3BsYWNlbWVudCA9IDAuMDtcbiAgdGhpcy5tYXhJdGVyYXRpb25zID0gRkRMYXlvdXRDb25zdGFudHMuTUFYX0lURVJBVElPTlM7XG59XG5cbkZETGF5b3V0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTGF5b3V0LnByb3RvdHlwZSk7XG5cbmZvciAodmFyIHByb3AgaW4gTGF5b3V0KSB7XG4gIEZETGF5b3V0W3Byb3BdID0gTGF5b3V0W3Byb3BdO1xufVxuXG5GRExheW91dC5wcm90b3R5cGUuaW5pdFBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gIExheW91dC5wcm90b3R5cGUuaW5pdFBhcmFtZXRlcnMuY2FsbCh0aGlzLCBhcmd1bWVudHMpO1xuXG4gIGlmICh0aGlzLmxheW91dFF1YWxpdHkgPT0gTGF5b3V0Q29uc3RhbnRzLkRSQUZUX1FVQUxJVFkpXG4gIHtcbiAgICB0aGlzLmRpc3BsYWNlbWVudFRocmVzaG9sZFBlck5vZGUgKz0gMC4zMDtcbiAgICB0aGlzLm1heEl0ZXJhdGlvbnMgKj0gMC44O1xuICB9XG4gIGVsc2UgaWYgKHRoaXMubGF5b3V0UXVhbGl0eSA9PSBMYXlvdXRDb25zdGFudHMuUFJPT0ZfUVVBTElUWSlcbiAge1xuICAgIHRoaXMuZGlzcGxhY2VtZW50VGhyZXNob2xkUGVyTm9kZSAtPSAwLjMwO1xuICAgIHRoaXMubWF4SXRlcmF0aW9ucyAqPSAxLjI7XG4gIH1cblxuICB0aGlzLnRvdGFsSXRlcmF0aW9ucyA9IDA7XG4gIHRoaXMubm90QW5pbWF0ZWRJdGVyYXRpb25zID0gMDtcblxuLy8gICAgdGhpcy51c2VGUkdyaWRWYXJpYW50ID0gbGF5b3V0T3B0aW9uc1BhY2suc21hcnRSZXB1bHNpb25SYW5nZUNhbGM7XG59O1xuXG5GRExheW91dC5wcm90b3R5cGUuY2FsY0lkZWFsRWRnZUxlbmd0aHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlZGdlO1xuICB2YXIgbGNhRGVwdGg7XG4gIHZhciBzb3VyY2U7XG4gIHZhciB0YXJnZXQ7XG4gIHZhciBzaXplT2ZTb3VyY2VJbkxjYTtcbiAgdmFyIHNpemVPZlRhcmdldEluTGNhO1xuXG4gIHZhciBhbGxFZGdlcyA9IHRoaXMuZ2V0R3JhcGhNYW5hZ2VyKCkuZ2V0QWxsRWRnZXMoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGxFZGdlcy5sZW5ndGg7IGkrKylcbiAge1xuICAgIGVkZ2UgPSBhbGxFZGdlc1tpXTtcblxuICAgIGVkZ2UuaWRlYWxMZW5ndGggPSB0aGlzLmlkZWFsRWRnZUxlbmd0aDtcblxuICAgIGlmIChlZGdlLmlzSW50ZXJHcmFwaClcbiAgICB7XG4gICAgICBzb3VyY2UgPSBlZGdlLmdldFNvdXJjZSgpO1xuICAgICAgdGFyZ2V0ID0gZWRnZS5nZXRUYXJnZXQoKTtcblxuICAgICAgc2l6ZU9mU291cmNlSW5MY2EgPSBlZGdlLmdldFNvdXJjZUluTGNhKCkuZ2V0RXN0aW1hdGVkU2l6ZSgpO1xuICAgICAgc2l6ZU9mVGFyZ2V0SW5MY2EgPSBlZGdlLmdldFRhcmdldEluTGNhKCkuZ2V0RXN0aW1hdGVkU2l6ZSgpO1xuXG4gICAgICBpZiAodGhpcy51c2VTbWFydElkZWFsRWRnZUxlbmd0aENhbGN1bGF0aW9uKVxuICAgICAge1xuICAgICAgICBlZGdlLmlkZWFsTGVuZ3RoICs9IHNpemVPZlNvdXJjZUluTGNhICsgc2l6ZU9mVGFyZ2V0SW5MY2EgLVxuICAgICAgICAgICAgICAgIDIgKiBMYXlvdXRDb25zdGFudHMuU0lNUExFX05PREVfU0laRTtcbiAgICAgIH1cblxuICAgICAgbGNhRGVwdGggPSBlZGdlLmdldExjYSgpLmdldEluY2x1c2lvblRyZWVEZXB0aCgpO1xuXG4gICAgICBlZGdlLmlkZWFsTGVuZ3RoICs9IEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfRURHRV9MRU5HVEggKlxuICAgICAgICAgICAgICBGRExheW91dENvbnN0YW50cy5QRVJfTEVWRUxfSURFQUxfRURHRV9MRU5HVEhfRkFDVE9SICpcbiAgICAgICAgICAgICAgKHNvdXJjZS5nZXRJbmNsdXNpb25UcmVlRGVwdGgoKSArXG4gICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmdldEluY2x1c2lvblRyZWVEZXB0aCgpIC0gMiAqIGxjYURlcHRoKTtcbiAgICB9XG4gIH1cbn07XG5cbkZETGF5b3V0LnByb3RvdHlwZS5pbml0U3ByaW5nRW1iZWRkZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgaWYgKHRoaXMuaW5jcmVtZW50YWwpXG4gIHtcbiAgICB0aGlzLmNvb2xpbmdGYWN0b3IgPSAwLjg7XG4gICAgdGhpcy5pbml0aWFsQ29vbGluZ0ZhY3RvciA9IDAuODtcbiAgICB0aGlzLm1heE5vZGVEaXNwbGFjZW1lbnQgPVxuICAgICAgICAgICAgRkRMYXlvdXRDb25zdGFudHMuTUFYX05PREVfRElTUExBQ0VNRU5UX0lOQ1JFTUVOVEFMO1xuICB9XG4gIGVsc2VcbiAge1xuICAgIHRoaXMuY29vbGluZ0ZhY3RvciA9IDEuMDtcbiAgICB0aGlzLmluaXRpYWxDb29saW5nRmFjdG9yID0gMS4wO1xuICAgIHRoaXMubWF4Tm9kZURpc3BsYWNlbWVudCA9XG4gICAgICAgICAgICBGRExheW91dENvbnN0YW50cy5NQVhfTk9ERV9ESVNQTEFDRU1FTlQ7XG4gIH1cblxuICB0aGlzLm1heEl0ZXJhdGlvbnMgPVxuICAgICAgICAgIE1hdGgubWF4KHRoaXMuZ2V0QWxsTm9kZXMoKS5sZW5ndGggKiA1LCB0aGlzLm1heEl0ZXJhdGlvbnMpO1xuXG4gIHRoaXMudG90YWxEaXNwbGFjZW1lbnRUaHJlc2hvbGQgPVxuICAgICAgICAgIHRoaXMuZGlzcGxhY2VtZW50VGhyZXNob2xkUGVyTm9kZSAqIHRoaXMuZ2V0QWxsTm9kZXMoKS5sZW5ndGg7XG5cbiAgdGhpcy5yZXB1bHNpb25SYW5nZSA9IHRoaXMuY2FsY1JlcHVsc2lvblJhbmdlKCk7XG59O1xuXG5GRExheW91dC5wcm90b3R5cGUuY2FsY1NwcmluZ0ZvcmNlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGxFZGdlcyA9IHRoaXMuZ2V0QWxsRWRnZXMoKTtcbiAgdmFyIGVkZ2U7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsRWRnZXMubGVuZ3RoOyBpKyspXG4gIHtcbiAgICBlZGdlID0gbEVkZ2VzW2ldO1xuXG4gICAgdGhpcy5jYWxjU3ByaW5nRm9yY2UoZWRnZSwgZWRnZS5pZGVhbExlbmd0aCk7XG4gIH1cbn07XG5cbkZETGF5b3V0LnByb3RvdHlwZS5jYWxjUmVwdWxzaW9uRm9yY2VzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgaSwgajtcbiAgdmFyIG5vZGVBLCBub2RlQjtcbiAgdmFyIGxOb2RlcyA9IHRoaXMuZ2V0QWxsTm9kZXMoKTtcblxuICBmb3IgKGkgPSAwOyBpIDwgbE5vZGVzLmxlbmd0aDsgaSsrKVxuICB7XG4gICAgbm9kZUEgPSBsTm9kZXNbaV07XG5cbiAgICBmb3IgKGogPSBpICsgMTsgaiA8IGxOb2Rlcy5sZW5ndGg7IGorKylcbiAgICB7XG4gICAgICBub2RlQiA9IGxOb2Rlc1tqXTtcblxuICAgICAgLy8gSWYgYm90aCBub2RlcyBhcmUgbm90IG1lbWJlcnMgb2YgdGhlIHNhbWUgZ3JhcGgsIHNraXAuXG4gICAgICBpZiAobm9kZUEuZ2V0T3duZXIoKSAhPSBub2RlQi5nZXRPd25lcigpKVxuICAgICAge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jYWxjUmVwdWxzaW9uRm9yY2Uobm9kZUEsIG5vZGVCKTtcbiAgICB9XG4gIH1cbn07XG5cbkZETGF5b3V0LnByb3RvdHlwZS5jYWxjR3Jhdml0YXRpb25hbEZvcmNlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5vZGU7XG4gIHZhciBsTm9kZXMgPSB0aGlzLmdldEFsbE5vZGVzVG9BcHBseUdyYXZpdGF0aW9uKCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsTm9kZXMubGVuZ3RoOyBpKyspXG4gIHtcbiAgICBub2RlID0gbE5vZGVzW2ldO1xuICAgIHRoaXMuY2FsY0dyYXZpdGF0aW9uYWxGb3JjZShub2RlKTtcbiAgfVxufTtcblxuRkRMYXlvdXQucHJvdG90eXBlLm1vdmVOb2RlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGxOb2RlcyA9IHRoaXMuZ2V0QWxsTm9kZXMoKTtcbiAgdmFyIG5vZGU7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsTm9kZXMubGVuZ3RoOyBpKyspXG4gIHtcbiAgICBub2RlID0gbE5vZGVzW2ldO1xuICAgIG5vZGUubW92ZSgpO1xuICB9XG59XG5cbkZETGF5b3V0LnByb3RvdHlwZS5jYWxjU3ByaW5nRm9yY2UgPSBmdW5jdGlvbiAoZWRnZSwgaWRlYWxMZW5ndGgpIHtcbiAgdmFyIHNvdXJjZU5vZGUgPSBlZGdlLmdldFNvdXJjZSgpO1xuICB2YXIgdGFyZ2V0Tm9kZSA9IGVkZ2UuZ2V0VGFyZ2V0KCk7XG5cbiAgdmFyIGxlbmd0aDtcbiAgdmFyIHNwcmluZ0ZvcmNlO1xuICB2YXIgc3ByaW5nRm9yY2VYO1xuICB2YXIgc3ByaW5nRm9yY2VZO1xuXG4gIC8vIFVwZGF0ZSBlZGdlIGxlbmd0aFxuICBpZiAodGhpcy51bmlmb3JtTGVhZk5vZGVTaXplcyAmJlxuICAgICAgICAgIHNvdXJjZU5vZGUuZ2V0Q2hpbGQoKSA9PSBudWxsICYmIHRhcmdldE5vZGUuZ2V0Q2hpbGQoKSA9PSBudWxsKVxuICB7XG4gICAgZWRnZS51cGRhdGVMZW5ndGhTaW1wbGUoKTtcbiAgfVxuICBlbHNlXG4gIHtcbiAgICBlZGdlLnVwZGF0ZUxlbmd0aCgpO1xuXG4gICAgaWYgKGVkZ2UuaXNPdmVybGFwaW5nU291cmNlQW5kVGFyZ2V0KVxuICAgIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBsZW5ndGggPSBlZGdlLmdldExlbmd0aCgpO1xuXG4gIC8vIENhbGN1bGF0ZSBzcHJpbmcgZm9yY2VzXG4gIHNwcmluZ0ZvcmNlID0gdGhpcy5zcHJpbmdDb25zdGFudCAqIChsZW5ndGggLSBpZGVhbExlbmd0aCk7XG5cbiAgLy8gUHJvamVjdCBmb3JjZSBvbnRvIHggYW5kIHkgYXhlc1xuICBzcHJpbmdGb3JjZVggPSBzcHJpbmdGb3JjZSAqIChlZGdlLmxlbmd0aFggLyBsZW5ndGgpO1xuICBzcHJpbmdGb3JjZVkgPSBzcHJpbmdGb3JjZSAqIChlZGdlLmxlbmd0aFkgLyBsZW5ndGgpO1xuXG4gIC8vIEFwcGx5IGZvcmNlcyBvbiB0aGUgZW5kIG5vZGVzXG4gIHNvdXJjZU5vZGUuc3ByaW5nRm9yY2VYICs9IHNwcmluZ0ZvcmNlWDtcbiAgc291cmNlTm9kZS5zcHJpbmdGb3JjZVkgKz0gc3ByaW5nRm9yY2VZO1xuICB0YXJnZXROb2RlLnNwcmluZ0ZvcmNlWCAtPSBzcHJpbmdGb3JjZVg7XG4gIHRhcmdldE5vZGUuc3ByaW5nRm9yY2VZIC09IHNwcmluZ0ZvcmNlWTtcbn07XG5cbkZETGF5b3V0LnByb3RvdHlwZS5jYWxjUmVwdWxzaW9uRm9yY2UgPSBmdW5jdGlvbiAobm9kZUEsIG5vZGVCKSB7XG4gIHZhciByZWN0QSA9IG5vZGVBLmdldFJlY3QoKTtcbiAgdmFyIHJlY3RCID0gbm9kZUIuZ2V0UmVjdCgpO1xuICB2YXIgb3ZlcmxhcEFtb3VudCA9IG5ldyBBcnJheSgyKTtcbiAgdmFyIGNsaXBQb2ludHMgPSBuZXcgQXJyYXkoNCk7XG4gIHZhciBkaXN0YW5jZVg7XG4gIHZhciBkaXN0YW5jZVk7XG4gIHZhciBkaXN0YW5jZVNxdWFyZWQ7XG4gIHZhciBkaXN0YW5jZTtcbiAgdmFyIHJlcHVsc2lvbkZvcmNlO1xuICB2YXIgcmVwdWxzaW9uRm9yY2VYO1xuICB2YXIgcmVwdWxzaW9uRm9yY2VZO1xuXG4gIGlmIChyZWN0QS5pbnRlcnNlY3RzKHJlY3RCKSkvLyB0d28gbm9kZXMgb3ZlcmxhcFxuICB7XG4gICAgLy8gY2FsY3VsYXRlIHNlcGFyYXRpb24gYW1vdW50IGluIHggYW5kIHkgZGlyZWN0aW9uc1xuICAgIElHZW9tZXRyeS5jYWxjU2VwYXJhdGlvbkFtb3VudChyZWN0QSxcbiAgICAgICAgICAgIHJlY3RCLFxuICAgICAgICAgICAgb3ZlcmxhcEFtb3VudCxcbiAgICAgICAgICAgIEZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfRURHRV9MRU5HVEggLyAyLjApO1xuXG4gICAgcmVwdWxzaW9uRm9yY2VYID0gb3ZlcmxhcEFtb3VudFswXTtcbiAgICByZXB1bHNpb25Gb3JjZVkgPSBvdmVybGFwQW1vdW50WzFdO1xuICB9XG4gIGVsc2UvLyBubyBvdmVybGFwXG4gIHtcbiAgICAvLyBjYWxjdWxhdGUgZGlzdGFuY2VcblxuICAgIGlmICh0aGlzLnVuaWZvcm1MZWFmTm9kZVNpemVzICYmXG4gICAgICAgICAgICBub2RlQS5nZXRDaGlsZCgpID09IG51bGwgJiYgbm9kZUIuZ2V0Q2hpbGQoKSA9PSBudWxsKS8vIHNpbXBseSBiYXNlIHJlcHVsc2lvbiBvbiBkaXN0YW5jZSBvZiBub2RlIGNlbnRlcnNcbiAgICB7XG4gICAgICBkaXN0YW5jZVggPSByZWN0Qi5nZXRDZW50ZXJYKCkgLSByZWN0QS5nZXRDZW50ZXJYKCk7XG4gICAgICBkaXN0YW5jZVkgPSByZWN0Qi5nZXRDZW50ZXJZKCkgLSByZWN0QS5nZXRDZW50ZXJZKCk7XG4gICAgfVxuICAgIGVsc2UvLyB1c2UgY2xpcHBpbmcgcG9pbnRzXG4gICAge1xuICAgICAgSUdlb21ldHJ5LmdldEludGVyc2VjdGlvbihyZWN0QSwgcmVjdEIsIGNsaXBQb2ludHMpO1xuXG4gICAgICBkaXN0YW5jZVggPSBjbGlwUG9pbnRzWzJdIC0gY2xpcFBvaW50c1swXTtcbiAgICAgIGRpc3RhbmNlWSA9IGNsaXBQb2ludHNbM10gLSBjbGlwUG9pbnRzWzFdO1xuICAgIH1cblxuICAgIC8vIE5vIHJlcHVsc2lvbiByYW5nZS4gRlIgZ3JpZCB2YXJpYW50IHNob3VsZCB0YWtlIGNhcmUgb2YgdGhpcy5cbiAgICBpZiAoTWF0aC5hYnMoZGlzdGFuY2VYKSA8IEZETGF5b3V0Q29uc3RhbnRzLk1JTl9SRVBVTFNJT05fRElTVClcbiAgICB7XG4gICAgICBkaXN0YW5jZVggPSBJTWF0aC5zaWduKGRpc3RhbmNlWCkgKlxuICAgICAgICAgICAgICBGRExheW91dENvbnN0YW50cy5NSU5fUkVQVUxTSU9OX0RJU1Q7XG4gICAgfVxuXG4gICAgaWYgKE1hdGguYWJzKGRpc3RhbmNlWSkgPCBGRExheW91dENvbnN0YW50cy5NSU5fUkVQVUxTSU9OX0RJU1QpXG4gICAge1xuICAgICAgZGlzdGFuY2VZID0gSU1hdGguc2lnbihkaXN0YW5jZVkpICpcbiAgICAgICAgICAgICAgRkRMYXlvdXRDb25zdGFudHMuTUlOX1JFUFVMU0lPTl9ESVNUO1xuICAgIH1cblxuICAgIGRpc3RhbmNlU3F1YXJlZCA9IGRpc3RhbmNlWCAqIGRpc3RhbmNlWCArIGRpc3RhbmNlWSAqIGRpc3RhbmNlWTtcbiAgICBkaXN0YW5jZSA9IE1hdGguc3FydChkaXN0YW5jZVNxdWFyZWQpO1xuXG4gICAgcmVwdWxzaW9uRm9yY2UgPSB0aGlzLnJlcHVsc2lvbkNvbnN0YW50IC8gZGlzdGFuY2VTcXVhcmVkO1xuXG4gICAgLy8gUHJvamVjdCBmb3JjZSBvbnRvIHggYW5kIHkgYXhlc1xuICAgIHJlcHVsc2lvbkZvcmNlWCA9IHJlcHVsc2lvbkZvcmNlICogZGlzdGFuY2VYIC8gZGlzdGFuY2U7XG4gICAgcmVwdWxzaW9uRm9yY2VZID0gcmVwdWxzaW9uRm9yY2UgKiBkaXN0YW5jZVkgLyBkaXN0YW5jZTtcbiAgfVxuXG4gIC8vIEFwcGx5IGZvcmNlcyBvbiB0aGUgdHdvIG5vZGVzXG4gIG5vZGVBLnJlcHVsc2lvbkZvcmNlWCAtPSByZXB1bHNpb25Gb3JjZVg7XG4gIG5vZGVBLnJlcHVsc2lvbkZvcmNlWSAtPSByZXB1bHNpb25Gb3JjZVk7XG4gIG5vZGVCLnJlcHVsc2lvbkZvcmNlWCArPSByZXB1bHNpb25Gb3JjZVg7XG4gIG5vZGVCLnJlcHVsc2lvbkZvcmNlWSArPSByZXB1bHNpb25Gb3JjZVk7XG59O1xuXG5GRExheW91dC5wcm90b3R5cGUuY2FsY0dyYXZpdGF0aW9uYWxGb3JjZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gIHZhciBvd25lckdyYXBoO1xuICB2YXIgb3duZXJDZW50ZXJYO1xuICB2YXIgb3duZXJDZW50ZXJZO1xuICB2YXIgZGlzdGFuY2VYO1xuICB2YXIgZGlzdGFuY2VZO1xuICB2YXIgYWJzRGlzdGFuY2VYO1xuICB2YXIgYWJzRGlzdGFuY2VZO1xuICB2YXIgZXN0aW1hdGVkU2l6ZTtcbiAgb3duZXJHcmFwaCA9IG5vZGUuZ2V0T3duZXIoKTtcblxuICBvd25lckNlbnRlclggPSAob3duZXJHcmFwaC5nZXRSaWdodCgpICsgb3duZXJHcmFwaC5nZXRMZWZ0KCkpIC8gMjtcbiAgb3duZXJDZW50ZXJZID0gKG93bmVyR3JhcGguZ2V0VG9wKCkgKyBvd25lckdyYXBoLmdldEJvdHRvbSgpKSAvIDI7XG4gIGRpc3RhbmNlWCA9IG5vZGUuZ2V0Q2VudGVyWCgpIC0gb3duZXJDZW50ZXJYO1xuICBkaXN0YW5jZVkgPSBub2RlLmdldENlbnRlclkoKSAtIG93bmVyQ2VudGVyWTtcbiAgYWJzRGlzdGFuY2VYID0gTWF0aC5hYnMoZGlzdGFuY2VYKTtcbiAgYWJzRGlzdGFuY2VZID0gTWF0aC5hYnMoZGlzdGFuY2VZKTtcblxuICBpZiAobm9kZS5nZXRPd25lcigpID09IHRoaXMuZ3JhcGhNYW5hZ2VyLmdldFJvb3QoKSkvLyBpbiB0aGUgcm9vdCBncmFwaFxuICB7XG4gICAgTWF0aC5mbG9vcig4MCk7XG4gICAgZXN0aW1hdGVkU2l6ZSA9IE1hdGguZmxvb3Iob3duZXJHcmFwaC5nZXRFc3RpbWF0ZWRTaXplKCkgKlxuICAgICAgICAgICAgdGhpcy5ncmF2aXR5UmFuZ2VGYWN0b3IpO1xuXG4gICAgaWYgKGFic0Rpc3RhbmNlWCA+IGVzdGltYXRlZFNpemUgfHwgYWJzRGlzdGFuY2VZID4gZXN0aW1hdGVkU2l6ZSlcbiAgICB7XG4gICAgICBub2RlLmdyYXZpdGF0aW9uRm9yY2VYID0gLXRoaXMuZ3Jhdml0eUNvbnN0YW50ICogZGlzdGFuY2VYO1xuICAgICAgbm9kZS5ncmF2aXRhdGlvbkZvcmNlWSA9IC10aGlzLmdyYXZpdHlDb25zdGFudCAqIGRpc3RhbmNlWTtcbiAgICB9XG4gIH1cbiAgZWxzZS8vIGluc2lkZSBhIGNvbXBvdW5kXG4gIHtcbiAgICBlc3RpbWF0ZWRTaXplID0gTWF0aC5mbG9vcigob3duZXJHcmFwaC5nZXRFc3RpbWF0ZWRTaXplKCkgKlxuICAgICAgICAgICAgdGhpcy5jb21wb3VuZEdyYXZpdHlSYW5nZUZhY3RvcikpO1xuXG4gICAgaWYgKGFic0Rpc3RhbmNlWCA+IGVzdGltYXRlZFNpemUgfHwgYWJzRGlzdGFuY2VZID4gZXN0aW1hdGVkU2l6ZSlcbiAgICB7XG4gICAgICBub2RlLmdyYXZpdGF0aW9uRm9yY2VYID0gLXRoaXMuZ3Jhdml0eUNvbnN0YW50ICogZGlzdGFuY2VYICpcbiAgICAgICAgICAgICAgdGhpcy5jb21wb3VuZEdyYXZpdHlDb25zdGFudDtcbiAgICAgIG5vZGUuZ3Jhdml0YXRpb25Gb3JjZVkgPSAtdGhpcy5ncmF2aXR5Q29uc3RhbnQgKiBkaXN0YW5jZVkgKlxuICAgICAgICAgICAgICB0aGlzLmNvbXBvdW5kR3Jhdml0eUNvbnN0YW50O1xuICAgIH1cbiAgfVxufTtcblxuRkRMYXlvdXQucHJvdG90eXBlLmlzQ29udmVyZ2VkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY29udmVyZ2VkO1xuICB2YXIgb3NjaWxhdGluZyA9IGZhbHNlO1xuXG4gIGlmICh0aGlzLnRvdGFsSXRlcmF0aW9ucyA+IHRoaXMubWF4SXRlcmF0aW9ucyAvIDMpXG4gIHtcbiAgICBvc2NpbGF0aW5nID1cbiAgICAgICAgICAgIE1hdGguYWJzKHRoaXMudG90YWxEaXNwbGFjZW1lbnQgLSB0aGlzLm9sZFRvdGFsRGlzcGxhY2VtZW50KSA8IDI7XG4gIH1cblxuICBjb252ZXJnZWQgPSB0aGlzLnRvdGFsRGlzcGxhY2VtZW50IDwgdGhpcy50b3RhbERpc3BsYWNlbWVudFRocmVzaG9sZDtcblxuICB0aGlzLm9sZFRvdGFsRGlzcGxhY2VtZW50ID0gdGhpcy50b3RhbERpc3BsYWNlbWVudDtcblxuICByZXR1cm4gY29udmVyZ2VkIHx8IG9zY2lsYXRpbmc7XG59O1xuXG5GRExheW91dC5wcm90b3R5cGUuYW5pbWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYW5pbWF0aW9uRHVyaW5nTGF5b3V0ICYmICF0aGlzLmlzU3ViTGF5b3V0KVxuICB7XG4gICAgaWYgKHRoaXMubm90QW5pbWF0ZWRJdGVyYXRpb25zID09IHRoaXMuYW5pbWF0aW9uUGVyaW9kKVxuICAgIHtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB0aGlzLm5vdEFuaW1hdGVkSXRlcmF0aW9ucyA9IDA7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICB0aGlzLm5vdEFuaW1hdGVkSXRlcmF0aW9ucysrO1xuICAgIH1cbiAgfVxufTtcblxuRkRMYXlvdXQucHJvdG90eXBlLmNhbGNSZXB1bHNpb25SYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIDAuMDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRkRMYXlvdXQ7XG4iLCJ2YXIgbGF5b3V0T3B0aW9uc1BhY2sgPSByZXF1aXJlKCcuL2xheW91dE9wdGlvbnNQYWNrJyk7XG5cbmZ1bmN0aW9uIEZETGF5b3V0Q29uc3RhbnRzKCkge1xufVxuXG5GRExheW91dENvbnN0YW50cy5nZXRVc2VyT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLm5vZGVSZXB1bHNpb24gIT0gbnVsbClcbiAgICBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX1JFUFVMU0lPTl9TVFJFTkdUSCA9IG9wdGlvbnMubm9kZVJlcHVsc2lvbjtcbiAgaWYgKG9wdGlvbnMuaWRlYWxFZGdlTGVuZ3RoICE9IG51bGwpIHtcbiAgICBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX0VER0VfTEVOR1RIID0gb3B0aW9ucy5pZGVhbEVkZ2VMZW5ndGg7XG4gIH1cbiAgaWYgKG9wdGlvbnMuZWRnZUVsYXN0aWNpdHkgIT0gbnVsbClcbiAgICBGRExheW91dENvbnN0YW50cy5ERUZBVUxUX1NQUklOR19TVFJFTkdUSCA9IG9wdGlvbnMuZWRnZUVsYXN0aWNpdHk7XG4gIGlmIChvcHRpb25zLm5lc3RpbmdGYWN0b3IgIT0gbnVsbClcbiAgICBGRExheW91dENvbnN0YW50cy5QRVJfTEVWRUxfSURFQUxfRURHRV9MRU5HVEhfRkFDVE9SID0gb3B0aW9ucy5uZXN0aW5nRmFjdG9yO1xuICBpZiAob3B0aW9ucy5ncmF2aXR5ICE9IG51bGwpXG4gICAgRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9HUkFWSVRZX1NUUkVOR1RIID0gb3B0aW9ucy5ncmF2aXR5O1xuICBpZiAob3B0aW9ucy5udW1JdGVyICE9IG51bGwpXG4gICAgRkRMYXlvdXRDb25zdGFudHMuTUFYX0lURVJBVElPTlMgPSBvcHRpb25zLm51bUl0ZXI7XG4gIFxuICBsYXlvdXRPcHRpb25zUGFjay5pbmNyZW1lbnRhbCA9ICEob3B0aW9ucy5yYW5kb21pemUpO1xuICBsYXlvdXRPcHRpb25zUGFjay5hbmltYXRlID0gb3B0aW9ucy5hbmltYXRlO1xufVxuXG5GRExheW91dENvbnN0YW50cy5NQVhfSVRFUkFUSU9OUyA9IDI1MDA7XG5cbkZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfRURHRV9MRU5HVEggPSA1MDtcbkZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfU1BSSU5HX1NUUkVOR1RIID0gMC40NTtcbkZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfUkVQVUxTSU9OX1NUUkVOR1RIID0gNDUwMC4wO1xuRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9HUkFWSVRZX1NUUkVOR1RIID0gMC40O1xuRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9DT01QT1VORF9HUkFWSVRZX1NUUkVOR1RIID0gMS4wO1xuRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9HUkFWSVRZX1JBTkdFX0ZBQ1RPUiA9IDIuMDtcbkZETGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfQ09NUE9VTkRfR1JBVklUWV9SQU5HRV9GQUNUT1IgPSAxLjU7XG5GRExheW91dENvbnN0YW50cy5ERUZBVUxUX1VTRV9TTUFSVF9JREVBTF9FREdFX0xFTkdUSF9DQUxDVUxBVElPTiA9IHRydWU7XG5GRExheW91dENvbnN0YW50cy5ERUZBVUxUX1VTRV9TTUFSVF9SRVBVTFNJT05fUkFOR0VfQ0FMQ1VMQVRJT04gPSB0cnVlO1xuRkRMYXlvdXRDb25zdGFudHMuTUFYX05PREVfRElTUExBQ0VNRU5UX0lOQ1JFTUVOVEFMID0gMTAwLjA7XG5GRExheW91dENvbnN0YW50cy5NQVhfTk9ERV9ESVNQTEFDRU1FTlQgPSBGRExheW91dENvbnN0YW50cy5NQVhfTk9ERV9ESVNQTEFDRU1FTlRfSU5DUkVNRU5UQUwgKiAzO1xuRkRMYXlvdXRDb25zdGFudHMuTUlOX1JFUFVMU0lPTl9ESVNUID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9FREdFX0xFTkdUSCAvIDEwLjA7XG5GRExheW91dENvbnN0YW50cy5DT05WRVJHRU5DRV9DSEVDS19QRVJJT0QgPSAxMDA7XG5GRExheW91dENvbnN0YW50cy5QRVJfTEVWRUxfSURFQUxfRURHRV9MRU5HVEhfRkFDVE9SID0gMC4xO1xuRkRMYXlvdXRDb25zdGFudHMuTUlOX0VER0VfTEVOR1RIID0gMTtcbkZETGF5b3V0Q29uc3RhbnRzLkdSSURfQ0FMQ1VMQVRJT05fQ0hFQ0tfUEVSSU9EID0gMTA7XG5cbm1vZHVsZS5leHBvcnRzID0gRkRMYXlvdXRDb25zdGFudHM7XG4iLCJ2YXIgTEVkZ2UgPSByZXF1aXJlKCcuL0xFZGdlJyk7XG52YXIgRkRMYXlvdXRDb25zdGFudHMgPSByZXF1aXJlKCcuL0ZETGF5b3V0Q29uc3RhbnRzJyk7XG5cbmZ1bmN0aW9uIEZETGF5b3V0RWRnZShzb3VyY2UsIHRhcmdldCwgdkVkZ2UpIHtcbiAgTEVkZ2UuY2FsbCh0aGlzLCBzb3VyY2UsIHRhcmdldCwgdkVkZ2UpO1xuICB0aGlzLmlkZWFsTGVuZ3RoID0gRkRMYXlvdXRDb25zdGFudHMuREVGQVVMVF9FREdFX0xFTkdUSDtcbn1cblxuRkRMYXlvdXRFZGdlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTEVkZ2UucHJvdG90eXBlKTtcblxuZm9yICh2YXIgcHJvcCBpbiBMRWRnZSkge1xuICBGRExheW91dEVkZ2VbcHJvcF0gPSBMRWRnZVtwcm9wXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGRExheW91dEVkZ2U7XG4iLCJ2YXIgTE5vZGUgPSByZXF1aXJlKCcuL0xOb2RlJyk7XG5cbmZ1bmN0aW9uIEZETGF5b3V0Tm9kZShnbSwgbG9jLCBzaXplLCB2Tm9kZSkge1xuICAvLyBhbHRlcm5hdGl2ZSBjb25zdHJ1Y3RvciBpcyBoYW5kbGVkIGluc2lkZSBMTm9kZVxuICBMTm9kZS5jYWxsKHRoaXMsIGdtLCBsb2MsIHNpemUsIHZOb2RlKTtcbiAgLy9TcHJpbmcsIHJlcHVsc2lvbiBhbmQgZ3Jhdml0YXRpb25hbCBmb3JjZXMgYWN0aW5nIG9uIHRoaXMgbm9kZVxuICB0aGlzLnNwcmluZ0ZvcmNlWCA9IDA7XG4gIHRoaXMuc3ByaW5nRm9yY2VZID0gMDtcbiAgdGhpcy5yZXB1bHNpb25Gb3JjZVggPSAwO1xuICB0aGlzLnJlcHVsc2lvbkZvcmNlWSA9IDA7XG4gIHRoaXMuZ3Jhdml0YXRpb25Gb3JjZVggPSAwO1xuICB0aGlzLmdyYXZpdGF0aW9uRm9yY2VZID0gMDtcbiAgLy9BbW91bnQgYnkgd2hpY2ggdGhpcyBub2RlIGlzIHRvIGJlIG1vdmVkIGluIHRoaXMgaXRlcmF0aW9uXG4gIHRoaXMuZGlzcGxhY2VtZW50WCA9IDA7XG4gIHRoaXMuZGlzcGxhY2VtZW50WSA9IDA7XG5cbiAgLy9TdGFydCBhbmQgZmluaXNoIGdyaWQgY29vcmRpbmF0ZXMgdGhhdCB0aGlzIG5vZGUgaXMgZmFsbGVuIGludG9cbiAgdGhpcy5zdGFydFggPSAwO1xuICB0aGlzLmZpbmlzaFggPSAwO1xuICB0aGlzLnN0YXJ0WSA9IDA7XG4gIHRoaXMuZmluaXNoWSA9IDA7XG5cbiAgLy9HZW9tZXRyaWMgbmVpZ2hib3JzIG9mIHRoaXMgbm9kZVxuICB0aGlzLnN1cnJvdW5kaW5nID0gW107XG59XG5cbkZETGF5b3V0Tm9kZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKExOb2RlLnByb3RvdHlwZSk7XG5cbmZvciAodmFyIHByb3AgaW4gTE5vZGUpIHtcbiAgRkRMYXlvdXROb2RlW3Byb3BdID0gTE5vZGVbcHJvcF07XG59XG5cbkZETGF5b3V0Tm9kZS5wcm90b3R5cGUuc2V0R3JpZENvb3JkaW5hdGVzID0gZnVuY3Rpb24gKF9zdGFydFgsIF9maW5pc2hYLCBfc3RhcnRZLCBfZmluaXNoWSlcbntcbiAgdGhpcy5zdGFydFggPSBfc3RhcnRYO1xuICB0aGlzLmZpbmlzaFggPSBfZmluaXNoWDtcbiAgdGhpcy5zdGFydFkgPSBfc3RhcnRZO1xuICB0aGlzLmZpbmlzaFkgPSBfZmluaXNoWTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGRExheW91dE5vZGU7XG4iLCJ2YXIgVW5pcXVlSURHZW5lcmV0b3IgPSByZXF1aXJlKCcuL1VuaXF1ZUlER2VuZXJldG9yJyk7XG5cbmZ1bmN0aW9uIEhhc2hNYXAoKSB7XG4gIHRoaXMubWFwID0ge307XG4gIHRoaXMua2V5cyA9IFtdO1xufVxuXG5IYXNoTWFwLnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICB2YXIgdGhlSWQgPSBVbmlxdWVJREdlbmVyZXRvci5jcmVhdGVJRChrZXkpO1xuICBpZiAoIXRoaXMuY29udGFpbnModGhlSWQpKSB7XG4gICAgdGhpcy5tYXBbdGhlSWRdID0gdmFsdWU7XG4gICAgdGhpcy5rZXlzLnB1c2goa2V5KTtcbiAgfVxufTtcblxuSGFzaE1hcC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHZhciB0aGVJZCA9IFVuaXF1ZUlER2VuZXJldG9yLmNyZWF0ZUlEKGtleSk7XG4gIHJldHVybiB0aGlzLm1hcFtrZXldICE9IG51bGw7XG59O1xuXG5IYXNoTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHZhciB0aGVJZCA9IFVuaXF1ZUlER2VuZXJldG9yLmNyZWF0ZUlEKGtleSk7XG4gIHJldHVybiB0aGlzLm1hcFt0aGVJZF07XG59O1xuXG5IYXNoTWFwLnByb3RvdHlwZS5rZXlTZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmtleXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2hNYXA7XG4iLCJ2YXIgVW5pcXVlSURHZW5lcmV0b3IgPSByZXF1aXJlKCcuL1VuaXF1ZUlER2VuZXJldG9yJyk7XG5cbmZ1bmN0aW9uIEhhc2hTZXQoKSB7XG4gIHRoaXMuc2V0ID0ge307XG59XG47XG5cbkhhc2hTZXQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHRoZUlkID0gVW5pcXVlSURHZW5lcmV0b3IuY3JlYXRlSUQob2JqKTtcbiAgaWYgKCF0aGlzLmNvbnRhaW5zKHRoZUlkKSlcbiAgICB0aGlzLnNldFt0aGVJZF0gPSBvYmo7XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAob2JqKSB7XG4gIGRlbGV0ZSB0aGlzLnNldFtVbmlxdWVJREdlbmVyZXRvci5jcmVhdGVJRChvYmopXTtcbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnNldCA9IHt9O1xufTtcblxuSGFzaFNldC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiB0aGlzLnNldFtVbmlxdWVJREdlbmVyZXRvci5jcmVhdGVJRChvYmopXSA9PSBvYmo7XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5zaXplKCkgPT09IDA7XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5zZXQpLmxlbmd0aDtcbn07XG5cbi8vY29uY2F0cyB0aGlzLnNldCB0byB0aGUgZ2l2ZW4gbGlzdFxuSGFzaFNldC5wcm90b3R5cGUuYWRkQWxsVG8gPSBmdW5jdGlvbiAobGlzdCkge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuc2V0KTtcbiAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgbGlzdC5wdXNoKHRoaXMuc2V0W2tleXNbaV1dKTtcbiAgfVxufTtcblxuSGFzaFNldC5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuc2V0KS5sZW5ndGg7XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5hZGRBbGwgPSBmdW5jdGlvbiAobGlzdCkge1xuICB2YXIgcyA9IGxpc3QubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKykge1xuICAgIHZhciB2ID0gbGlzdFtpXTtcbiAgICB0aGlzLmFkZCh2KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBIYXNoU2V0O1xuIiwiZnVuY3Rpb24gSUdlb21ldHJ5KCkge1xufVxuXG5JR2VvbWV0cnkuY2FsY1NlcGFyYXRpb25BbW91bnQgPSBmdW5jdGlvbiAocmVjdEEsIHJlY3RCLCBvdmVybGFwQW1vdW50LCBzZXBhcmF0aW9uQnVmZmVyKVxue1xuICBpZiAoIXJlY3RBLmludGVyc2VjdHMocmVjdEIpKSB7XG4gICAgdGhyb3cgXCJhc3NlcnQgZmFpbGVkXCI7XG4gIH1cbiAgdmFyIGRpcmVjdGlvbnMgPSBuZXcgQXJyYXkoMik7XG4gIElHZW9tZXRyeS5kZWNpZGVEaXJlY3Rpb25zRm9yT3ZlcmxhcHBpbmdOb2RlcyhyZWN0QSwgcmVjdEIsIGRpcmVjdGlvbnMpO1xuICBvdmVybGFwQW1vdW50WzBdID0gTWF0aC5taW4ocmVjdEEuZ2V0UmlnaHQoKSwgcmVjdEIuZ2V0UmlnaHQoKSkgLVxuICAgICAgICAgIE1hdGgubWF4KHJlY3RBLngsIHJlY3RCLngpO1xuICBvdmVybGFwQW1vdW50WzFdID0gTWF0aC5taW4ocmVjdEEuZ2V0Qm90dG9tKCksIHJlY3RCLmdldEJvdHRvbSgpKSAtXG4gICAgICAgICAgTWF0aC5tYXgocmVjdEEueSwgcmVjdEIueSk7XG4gIC8vIHVwZGF0ZSB0aGUgb3ZlcmxhcHBpbmcgYW1vdW50cyBmb3IgdGhlIGZvbGxvd2luZyBjYXNlczpcbiAgaWYgKChyZWN0QS5nZXRYKCkgPD0gcmVjdEIuZ2V0WCgpKSAmJiAocmVjdEEuZ2V0UmlnaHQoKSA+PSByZWN0Qi5nZXRSaWdodCgpKSlcbiAge1xuICAgIG92ZXJsYXBBbW91bnRbMF0gKz0gTWF0aC5taW4oKHJlY3RCLmdldFgoKSAtIHJlY3RBLmdldFgoKSksXG4gICAgICAgICAgICAocmVjdEEuZ2V0UmlnaHQoKSAtIHJlY3RCLmdldFJpZ2h0KCkpKTtcbiAgfVxuICBlbHNlIGlmICgocmVjdEIuZ2V0WCgpIDw9IHJlY3RBLmdldFgoKSkgJiYgKHJlY3RCLmdldFJpZ2h0KCkgPj0gcmVjdEEuZ2V0UmlnaHQoKSkpXG4gIHtcbiAgICBvdmVybGFwQW1vdW50WzBdICs9IE1hdGgubWluKChyZWN0QS5nZXRYKCkgLSByZWN0Qi5nZXRYKCkpLFxuICAgICAgICAgICAgKHJlY3RCLmdldFJpZ2h0KCkgLSByZWN0QS5nZXRSaWdodCgpKSk7XG4gIH1cbiAgaWYgKChyZWN0QS5nZXRZKCkgPD0gcmVjdEIuZ2V0WSgpKSAmJiAocmVjdEEuZ2V0Qm90dG9tKCkgPj0gcmVjdEIuZ2V0Qm90dG9tKCkpKVxuICB7XG4gICAgb3ZlcmxhcEFtb3VudFsxXSArPSBNYXRoLm1pbigocmVjdEIuZ2V0WSgpIC0gcmVjdEEuZ2V0WSgpKSxcbiAgICAgICAgICAgIChyZWN0QS5nZXRCb3R0b20oKSAtIHJlY3RCLmdldEJvdHRvbSgpKSk7XG4gIH1cbiAgZWxzZSBpZiAoKHJlY3RCLmdldFkoKSA8PSByZWN0QS5nZXRZKCkpICYmIChyZWN0Qi5nZXRCb3R0b20oKSA+PSByZWN0QS5nZXRCb3R0b20oKSkpXG4gIHtcbiAgICBvdmVybGFwQW1vdW50WzFdICs9IE1hdGgubWluKChyZWN0QS5nZXRZKCkgLSByZWN0Qi5nZXRZKCkpLFxuICAgICAgICAgICAgKHJlY3RCLmdldEJvdHRvbSgpIC0gcmVjdEEuZ2V0Qm90dG9tKCkpKTtcbiAgfVxuXG4gIC8vIGZpbmQgc2xvcGUgb2YgdGhlIGxpbmUgcGFzc2VzIHR3byBjZW50ZXJzXG4gIHZhciBzbG9wZSA9IE1hdGguYWJzKChyZWN0Qi5nZXRDZW50ZXJZKCkgLSByZWN0QS5nZXRDZW50ZXJZKCkpIC9cbiAgICAgICAgICAocmVjdEIuZ2V0Q2VudGVyWCgpIC0gcmVjdEEuZ2V0Q2VudGVyWCgpKSk7XG4gIC8vIGlmIGNlbnRlcnMgYXJlIG92ZXJsYXBwZWRcbiAgaWYgKChyZWN0Qi5nZXRDZW50ZXJZKCkgPT0gcmVjdEEuZ2V0Q2VudGVyWSgpKSAmJlxuICAgICAgICAgIChyZWN0Qi5nZXRDZW50ZXJYKCkgPT0gcmVjdEEuZ2V0Q2VudGVyWCgpKSlcbiAge1xuICAgIC8vIGFzc3VtZSB0aGUgc2xvcGUgaXMgMSAoNDUgZGVncmVlKVxuICAgIHNsb3BlID0gMS4wO1xuICB9XG5cbiAgdmFyIG1vdmVCeVkgPSBzbG9wZSAqIG92ZXJsYXBBbW91bnRbMF07XG4gIHZhciBtb3ZlQnlYID0gb3ZlcmxhcEFtb3VudFsxXSAvIHNsb3BlO1xuICBpZiAob3ZlcmxhcEFtb3VudFswXSA8IG1vdmVCeVgpXG4gIHtcbiAgICBtb3ZlQnlYID0gb3ZlcmxhcEFtb3VudFswXTtcbiAgfVxuICBlbHNlXG4gIHtcbiAgICBtb3ZlQnlZID0gb3ZlcmxhcEFtb3VudFsxXTtcbiAgfVxuICAvLyByZXR1cm4gaGFsZiB0aGUgYW1vdW50IHNvIHRoYXQgaWYgZWFjaCByZWN0YW5nbGUgaXMgbW92ZWQgYnkgdGhlc2VcbiAgLy8gYW1vdW50cyBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25zLCBvdmVybGFwIHdpbGwgYmUgcmVzb2x2ZWRcbiAgb3ZlcmxhcEFtb3VudFswXSA9IC0xICogZGlyZWN0aW9uc1swXSAqICgobW92ZUJ5WCAvIDIpICsgc2VwYXJhdGlvbkJ1ZmZlcik7XG4gIG92ZXJsYXBBbW91bnRbMV0gPSAtMSAqIGRpcmVjdGlvbnNbMV0gKiAoKG1vdmVCeVkgLyAyKSArIHNlcGFyYXRpb25CdWZmZXIpO1xufVxuXG5JR2VvbWV0cnkuZGVjaWRlRGlyZWN0aW9uc0Zvck92ZXJsYXBwaW5nTm9kZXMgPSBmdW5jdGlvbiAocmVjdEEsIHJlY3RCLCBkaXJlY3Rpb25zKVxue1xuICBpZiAocmVjdEEuZ2V0Q2VudGVyWCgpIDwgcmVjdEIuZ2V0Q2VudGVyWCgpKVxuICB7XG4gICAgZGlyZWN0aW9uc1swXSA9IC0xO1xuICB9XG4gIGVsc2VcbiAge1xuICAgIGRpcmVjdGlvbnNbMF0gPSAxO1xuICB9XG5cbiAgaWYgKHJlY3RBLmdldENlbnRlclkoKSA8IHJlY3RCLmdldENlbnRlclkoKSlcbiAge1xuICAgIGRpcmVjdGlvbnNbMV0gPSAtMTtcbiAgfVxuICBlbHNlXG4gIHtcbiAgICBkaXJlY3Rpb25zWzFdID0gMTtcbiAgfVxufVxuXG5JR2VvbWV0cnkuZ2V0SW50ZXJzZWN0aW9uMiA9IGZ1bmN0aW9uIChyZWN0QSwgcmVjdEIsIHJlc3VsdClcbntcbiAgLy9yZXN1bHRbMC0xXSB3aWxsIGNvbnRhaW4gY2xpcFBvaW50IG9mIHJlY3RBLCByZXN1bHRbMi0zXSB3aWxsIGNvbnRhaW4gY2xpcFBvaW50IG9mIHJlY3RCXG4gIHZhciBwMXggPSByZWN0QS5nZXRDZW50ZXJYKCk7XG4gIHZhciBwMXkgPSByZWN0QS5nZXRDZW50ZXJZKCk7XG4gIHZhciBwMnggPSByZWN0Qi5nZXRDZW50ZXJYKCk7XG4gIHZhciBwMnkgPSByZWN0Qi5nZXRDZW50ZXJZKCk7XG5cbiAgLy9pZiB0d28gcmVjdGFuZ2xlcyBpbnRlcnNlY3QsIHRoZW4gY2xpcHBpbmcgcG9pbnRzIGFyZSBjZW50ZXJzXG4gIGlmIChyZWN0QS5pbnRlcnNlY3RzKHJlY3RCKSlcbiAge1xuICAgIHJlc3VsdFswXSA9IHAxeDtcbiAgICByZXN1bHRbMV0gPSBwMXk7XG4gICAgcmVzdWx0WzJdID0gcDJ4O1xuICAgIHJlc3VsdFszXSA9IHAyeTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICAvL3ZhcmlhYmxlcyBmb3IgcmVjdEFcbiAgdmFyIHRvcExlZnRBeCA9IHJlY3RBLmdldFgoKTtcbiAgdmFyIHRvcExlZnRBeSA9IHJlY3RBLmdldFkoKTtcbiAgdmFyIHRvcFJpZ2h0QXggPSByZWN0QS5nZXRSaWdodCgpO1xuICB2YXIgYm90dG9tTGVmdEF4ID0gcmVjdEEuZ2V0WCgpO1xuICB2YXIgYm90dG9tTGVmdEF5ID0gcmVjdEEuZ2V0Qm90dG9tKCk7XG4gIHZhciBib3R0b21SaWdodEF4ID0gcmVjdEEuZ2V0UmlnaHQoKTtcbiAgdmFyIGhhbGZXaWR0aEEgPSByZWN0QS5nZXRXaWR0aEhhbGYoKTtcbiAgdmFyIGhhbGZIZWlnaHRBID0gcmVjdEEuZ2V0SGVpZ2h0SGFsZigpO1xuICAvL3ZhcmlhYmxlcyBmb3IgcmVjdEJcbiAgdmFyIHRvcExlZnRCeCA9IHJlY3RCLmdldFgoKTtcbiAgdmFyIHRvcExlZnRCeSA9IHJlY3RCLmdldFkoKTtcbiAgdmFyIHRvcFJpZ2h0QnggPSByZWN0Qi5nZXRSaWdodCgpO1xuICB2YXIgYm90dG9tTGVmdEJ4ID0gcmVjdEIuZ2V0WCgpO1xuICB2YXIgYm90dG9tTGVmdEJ5ID0gcmVjdEIuZ2V0Qm90dG9tKCk7XG4gIHZhciBib3R0b21SaWdodEJ4ID0gcmVjdEIuZ2V0UmlnaHQoKTtcbiAgdmFyIGhhbGZXaWR0aEIgPSByZWN0Qi5nZXRXaWR0aEhhbGYoKTtcbiAgdmFyIGhhbGZIZWlnaHRCID0gcmVjdEIuZ2V0SGVpZ2h0SGFsZigpO1xuICAvL2ZsYWcgd2hldGhlciBjbGlwcGluZyBwb2ludHMgYXJlIGZvdW5kXG4gIHZhciBjbGlwUG9pbnRBRm91bmQgPSBmYWxzZTtcbiAgdmFyIGNsaXBQb2ludEJGb3VuZCA9IGZhbHNlO1xuXG4gIC8vIGxpbmUgaXMgdmVydGljYWxcbiAgaWYgKHAxeCA9PSBwMngpXG4gIHtcbiAgICBpZiAocDF5ID4gcDJ5KVxuICAgIHtcbiAgICAgIHJlc3VsdFswXSA9IHAxeDtcbiAgICAgIHJlc3VsdFsxXSA9IHRvcExlZnRBeTtcbiAgICAgIHJlc3VsdFsyXSA9IHAyeDtcbiAgICAgIHJlc3VsdFszXSA9IGJvdHRvbUxlZnRCeTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSBpZiAocDF5IDwgcDJ5KVxuICAgIHtcbiAgICAgIHJlc3VsdFswXSA9IHAxeDtcbiAgICAgIHJlc3VsdFsxXSA9IGJvdHRvbUxlZnRBeTtcbiAgICAgIHJlc3VsdFsyXSA9IHAyeDtcbiAgICAgIHJlc3VsdFszXSA9IHRvcExlZnRCeTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgIC8vbm90IGxpbmUsIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICAvLyBsaW5lIGlzIGhvcml6b250YWxcbiAgZWxzZSBpZiAocDF5ID09IHAyeSlcbiAge1xuICAgIGlmIChwMXggPiBwMngpXG4gICAge1xuICAgICAgcmVzdWx0WzBdID0gdG9wTGVmdEF4O1xuICAgICAgcmVzdWx0WzFdID0gcDF5O1xuICAgICAgcmVzdWx0WzJdID0gdG9wUmlnaHRCeDtcbiAgICAgIHJlc3VsdFszXSA9IHAyeTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSBpZiAocDF4IDwgcDJ4KVxuICAgIHtcbiAgICAgIHJlc3VsdFswXSA9IHRvcFJpZ2h0QXg7XG4gICAgICByZXN1bHRbMV0gPSBwMXk7XG4gICAgICByZXN1bHRbMl0gPSB0b3BMZWZ0Qng7XG4gICAgICByZXN1bHRbM10gPSBwMnk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAvL25vdCB2YWxpZCBsaW5lLCByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgZWxzZVxuICB7XG4gICAgLy9zbG9wZXMgb2YgcmVjdEEncyBhbmQgcmVjdEIncyBkaWFnb25hbHNcbiAgICB2YXIgc2xvcGVBID0gcmVjdEEuaGVpZ2h0IC8gcmVjdEEud2lkdGg7XG4gICAgdmFyIHNsb3BlQiA9IHJlY3RCLmhlaWdodCAvIHJlY3RCLndpZHRoO1xuXG4gICAgLy9zbG9wZSBvZiBsaW5lIGJldHdlZW4gY2VudGVyIG9mIHJlY3RBIGFuZCBjZW50ZXIgb2YgcmVjdEJcbiAgICB2YXIgc2xvcGVQcmltZSA9IChwMnkgLSBwMXkpIC8gKHAyeCAtIHAxeCk7XG4gICAgdmFyIGNhcmRpbmFsRGlyZWN0aW9uQTtcbiAgICB2YXIgY2FyZGluYWxEaXJlY3Rpb25CO1xuICAgIHZhciB0ZW1wUG9pbnRBeDtcbiAgICB2YXIgdGVtcFBvaW50QXk7XG4gICAgdmFyIHRlbXBQb2ludEJ4O1xuICAgIHZhciB0ZW1wUG9pbnRCeTtcblxuICAgIC8vZGV0ZXJtaW5lIHdoZXRoZXIgY2xpcHBpbmcgcG9pbnQgaXMgdGhlIGNvcm5lciBvZiBub2RlQVxuICAgIGlmICgoLXNsb3BlQSkgPT0gc2xvcGVQcmltZSlcbiAgICB7XG4gICAgICBpZiAocDF4ID4gcDJ4KVxuICAgICAge1xuICAgICAgICByZXN1bHRbMF0gPSBib3R0b21MZWZ0QXg7XG4gICAgICAgIHJlc3VsdFsxXSA9IGJvdHRvbUxlZnRBeTtcbiAgICAgICAgY2xpcFBvaW50QUZvdW5kID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2VcbiAgICAgIHtcbiAgICAgICAgcmVzdWx0WzBdID0gdG9wUmlnaHRBeDtcbiAgICAgICAgcmVzdWx0WzFdID0gdG9wTGVmdEF5O1xuICAgICAgICBjbGlwUG9pbnRBRm91bmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChzbG9wZUEgPT0gc2xvcGVQcmltZSlcbiAgICB7XG4gICAgICBpZiAocDF4ID4gcDJ4KVxuICAgICAge1xuICAgICAgICByZXN1bHRbMF0gPSB0b3BMZWZ0QXg7XG4gICAgICAgIHJlc3VsdFsxXSA9IHRvcExlZnRBeTtcbiAgICAgICAgY2xpcFBvaW50QUZvdW5kID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2VcbiAgICAgIHtcbiAgICAgICAgcmVzdWx0WzBdID0gYm90dG9tUmlnaHRBeDtcbiAgICAgICAgcmVzdWx0WzFdID0gYm90dG9tTGVmdEF5O1xuICAgICAgICBjbGlwUG9pbnRBRm91bmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vZGV0ZXJtaW5lIHdoZXRoZXIgY2xpcHBpbmcgcG9pbnQgaXMgdGhlIGNvcm5lciBvZiBub2RlQlxuICAgIGlmICgoLXNsb3BlQikgPT0gc2xvcGVQcmltZSlcbiAgICB7XG4gICAgICBpZiAocDJ4ID4gcDF4KVxuICAgICAge1xuICAgICAgICByZXN1bHRbMl0gPSBib3R0b21MZWZ0Qng7XG4gICAgICAgIHJlc3VsdFszXSA9IGJvdHRvbUxlZnRCeTtcbiAgICAgICAgY2xpcFBvaW50QkZvdW5kID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2VcbiAgICAgIHtcbiAgICAgICAgcmVzdWx0WzJdID0gdG9wUmlnaHRCeDtcbiAgICAgICAgcmVzdWx0WzNdID0gdG9wTGVmdEJ5O1xuICAgICAgICBjbGlwUG9pbnRCRm91bmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChzbG9wZUIgPT0gc2xvcGVQcmltZSlcbiAgICB7XG4gICAgICBpZiAocDJ4ID4gcDF4KVxuICAgICAge1xuICAgICAgICByZXN1bHRbMl0gPSB0b3BMZWZ0Qng7XG4gICAgICAgIHJlc3VsdFszXSA9IHRvcExlZnRCeTtcbiAgICAgICAgY2xpcFBvaW50QkZvdW5kID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2VcbiAgICAgIHtcbiAgICAgICAgcmVzdWx0WzJdID0gYm90dG9tUmlnaHRCeDtcbiAgICAgICAgcmVzdWx0WzNdID0gYm90dG9tTGVmdEJ5O1xuICAgICAgICBjbGlwUG9pbnRCRm91bmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vaWYgYm90aCBjbGlwcGluZyBwb2ludHMgYXJlIGNvcm5lcnNcbiAgICBpZiAoY2xpcFBvaW50QUZvdW5kICYmIGNsaXBQb2ludEJGb3VuZClcbiAgICB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy9kZXRlcm1pbmUgQ2FyZGluYWwgRGlyZWN0aW9uIG9mIHJlY3RhbmdsZXNcbiAgICBpZiAocDF4ID4gcDJ4KVxuICAgIHtcbiAgICAgIGlmIChwMXkgPiBwMnkpXG4gICAgICB7XG4gICAgICAgIGNhcmRpbmFsRGlyZWN0aW9uQSA9IElHZW9tZXRyeS5nZXRDYXJkaW5hbERpcmVjdGlvbihzbG9wZUEsIHNsb3BlUHJpbWUsIDQpO1xuICAgICAgICBjYXJkaW5hbERpcmVjdGlvbkIgPSBJR2VvbWV0cnkuZ2V0Q2FyZGluYWxEaXJlY3Rpb24oc2xvcGVCLCBzbG9wZVByaW1lLCAyKTtcbiAgICAgIH1cbiAgICAgIGVsc2VcbiAgICAgIHtcbiAgICAgICAgY2FyZGluYWxEaXJlY3Rpb25BID0gSUdlb21ldHJ5LmdldENhcmRpbmFsRGlyZWN0aW9uKC1zbG9wZUEsIHNsb3BlUHJpbWUsIDMpO1xuICAgICAgICBjYXJkaW5hbERpcmVjdGlvbkIgPSBJR2VvbWV0cnkuZ2V0Q2FyZGluYWxEaXJlY3Rpb24oLXNsb3BlQiwgc2xvcGVQcmltZSwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICBpZiAocDF5ID4gcDJ5KVxuICAgICAge1xuICAgICAgICBjYXJkaW5hbERpcmVjdGlvbkEgPSBJR2VvbWV0cnkuZ2V0Q2FyZGluYWxEaXJlY3Rpb24oLXNsb3BlQSwgc2xvcGVQcmltZSwgMSk7XG4gICAgICAgIGNhcmRpbmFsRGlyZWN0aW9uQiA9IElHZW9tZXRyeS5nZXRDYXJkaW5hbERpcmVjdGlvbigtc2xvcGVCLCBzbG9wZVByaW1lLCAzKTtcbiAgICAgIH1cbiAgICAgIGVsc2VcbiAgICAgIHtcbiAgICAgICAgY2FyZGluYWxEaXJlY3Rpb25BID0gSUdlb21ldHJ5LmdldENhcmRpbmFsRGlyZWN0aW9uKHNsb3BlQSwgc2xvcGVQcmltZSwgMik7XG4gICAgICAgIGNhcmRpbmFsRGlyZWN0aW9uQiA9IElHZW9tZXRyeS5nZXRDYXJkaW5hbERpcmVjdGlvbihzbG9wZUIsIHNsb3BlUHJpbWUsIDQpO1xuICAgICAgfVxuICAgIH1cbiAgICAvL2NhbGN1bGF0ZSBjbGlwcGluZyBQb2ludCBpZiBpdCBpcyBub3QgZm91bmQgYmVmb3JlXG4gICAgaWYgKCFjbGlwUG9pbnRBRm91bmQpXG4gICAge1xuICAgICAgc3dpdGNoIChjYXJkaW5hbERpcmVjdGlvbkEpXG4gICAgICB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICB0ZW1wUG9pbnRBeSA9IHRvcExlZnRBeTtcbiAgICAgICAgICB0ZW1wUG9pbnRBeCA9IHAxeCArICgtaGFsZkhlaWdodEEpIC8gc2xvcGVQcmltZTtcbiAgICAgICAgICByZXN1bHRbMF0gPSB0ZW1wUG9pbnRBeDtcbiAgICAgICAgICByZXN1bHRbMV0gPSB0ZW1wUG9pbnRBeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHRlbXBQb2ludEF4ID0gYm90dG9tUmlnaHRBeDtcbiAgICAgICAgICB0ZW1wUG9pbnRBeSA9IHAxeSArIGhhbGZXaWR0aEEgKiBzbG9wZVByaW1lO1xuICAgICAgICAgIHJlc3VsdFswXSA9IHRlbXBQb2ludEF4O1xuICAgICAgICAgIHJlc3VsdFsxXSA9IHRlbXBQb2ludEF5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgdGVtcFBvaW50QXkgPSBib3R0b21MZWZ0QXk7XG4gICAgICAgICAgdGVtcFBvaW50QXggPSBwMXggKyBoYWxmSGVpZ2h0QSAvIHNsb3BlUHJpbWU7XG4gICAgICAgICAgcmVzdWx0WzBdID0gdGVtcFBvaW50QXg7XG4gICAgICAgICAgcmVzdWx0WzFdID0gdGVtcFBvaW50QXk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICB0ZW1wUG9pbnRBeCA9IGJvdHRvbUxlZnRBeDtcbiAgICAgICAgICB0ZW1wUG9pbnRBeSA9IHAxeSArICgtaGFsZldpZHRoQSkgKiBzbG9wZVByaW1lO1xuICAgICAgICAgIHJlc3VsdFswXSA9IHRlbXBQb2ludEF4O1xuICAgICAgICAgIHJlc3VsdFsxXSA9IHRlbXBQb2ludEF5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWNsaXBQb2ludEJGb3VuZClcbiAgICB7XG4gICAgICBzd2l0Y2ggKGNhcmRpbmFsRGlyZWN0aW9uQilcbiAgICAgIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIHRlbXBQb2ludEJ5ID0gdG9wTGVmdEJ5O1xuICAgICAgICAgIHRlbXBQb2ludEJ4ID0gcDJ4ICsgKC1oYWxmSGVpZ2h0QikgLyBzbG9wZVByaW1lO1xuICAgICAgICAgIHJlc3VsdFsyXSA9IHRlbXBQb2ludEJ4O1xuICAgICAgICAgIHJlc3VsdFszXSA9IHRlbXBQb2ludEJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgdGVtcFBvaW50QnggPSBib3R0b21SaWdodEJ4O1xuICAgICAgICAgIHRlbXBQb2ludEJ5ID0gcDJ5ICsgaGFsZldpZHRoQiAqIHNsb3BlUHJpbWU7XG4gICAgICAgICAgcmVzdWx0WzJdID0gdGVtcFBvaW50Qng7XG4gICAgICAgICAgcmVzdWx0WzNdID0gdGVtcFBvaW50Qnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICB0ZW1wUG9pbnRCeSA9IGJvdHRvbUxlZnRCeTtcbiAgICAgICAgICB0ZW1wUG9pbnRCeCA9IHAyeCArIGhhbGZIZWlnaHRCIC8gc2xvcGVQcmltZTtcbiAgICAgICAgICByZXN1bHRbMl0gPSB0ZW1wUG9pbnRCeDtcbiAgICAgICAgICByZXN1bHRbM10gPSB0ZW1wUG9pbnRCeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHRlbXBQb2ludEJ4ID0gYm90dG9tTGVmdEJ4O1xuICAgICAgICAgIHRlbXBQb2ludEJ5ID0gcDJ5ICsgKC1oYWxmV2lkdGhCKSAqIHNsb3BlUHJpbWU7XG4gICAgICAgICAgcmVzdWx0WzJdID0gdGVtcFBvaW50Qng7XG4gICAgICAgICAgcmVzdWx0WzNdID0gdGVtcFBvaW50Qnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuSUdlb21ldHJ5LmdldENhcmRpbmFsRGlyZWN0aW9uID0gZnVuY3Rpb24gKHNsb3BlLCBzbG9wZVByaW1lLCBsaW5lKVxue1xuICBpZiAoc2xvcGUgPiBzbG9wZVByaW1lKVxuICB7XG4gICAgcmV0dXJuIGxpbmU7XG4gIH1cbiAgZWxzZVxuICB7XG4gICAgcmV0dXJuIDEgKyBsaW5lICUgNDtcbiAgfVxufVxuXG5JR2VvbWV0cnkuZ2V0SW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHMxLCBzMiwgZjEsIGYyKVxue1xuICBpZiAoZjIgPT0gbnVsbCkge1xuICAgIHJldHVybiBJR2VvbWV0cnkuZ2V0SW50ZXJzZWN0aW9uMihzMSwgczIsIGYxKTtcbiAgfVxuICB2YXIgeDEgPSBzMS54O1xuICB2YXIgeTEgPSBzMS55O1xuICB2YXIgeDIgPSBzMi54O1xuICB2YXIgeTIgPSBzMi55O1xuICB2YXIgeDMgPSBmMS54O1xuICB2YXIgeTMgPSBmMS55O1xuICB2YXIgeDQgPSBmMi54O1xuICB2YXIgeTQgPSBmMi55O1xuICB2YXIgeCwgeTsgLy8gaW50ZXJzZWN0aW9uIHBvaW50XG4gIHZhciBhMSwgYTIsIGIxLCBiMiwgYzEsIGMyOyAvLyBjb2VmZmljaWVudHMgb2YgbGluZSBlcW5zLlxuICB2YXIgZGVub207XG5cbiAgYTEgPSB5MiAtIHkxO1xuICBiMSA9IHgxIC0geDI7XG4gIGMxID0geDIgKiB5MSAtIHgxICogeTI7ICAvLyB7IGExKnggKyBiMSp5ICsgYzEgPSAwIGlzIGxpbmUgMSB9XG5cbiAgYTIgPSB5NCAtIHkzO1xuICBiMiA9IHgzIC0geDQ7XG4gIGMyID0geDQgKiB5MyAtIHgzICogeTQ7ICAvLyB7IGEyKnggKyBiMip5ICsgYzIgPSAwIGlzIGxpbmUgMiB9XG5cbiAgZGVub20gPSBhMSAqIGIyIC0gYTIgKiBiMTtcblxuICBpZiAoZGVub20gPT0gMClcbiAge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgeCA9IChiMSAqIGMyIC0gYjIgKiBjMSkgLyBkZW5vbTtcbiAgeSA9IChhMiAqIGMxIC0gYTEgKiBjMikgLyBkZW5vbTtcblxuICByZXR1cm4gbmV3IFBvaW50KHgsIHkpO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2VjdGlvbjogQ2xhc3MgQ29uc3RhbnRzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLyoqXG4gKiBTb21lIHVzZWZ1bCBwcmUtY2FsY3VsYXRlZCBjb25zdGFudHNcbiAqL1xuSUdlb21ldHJ5LkhBTEZfUEkgPSAwLjUgKiBNYXRoLlBJO1xuSUdlb21ldHJ5Lk9ORV9BTkRfSEFMRl9QSSA9IDEuNSAqIE1hdGguUEk7XG5JR2VvbWV0cnkuVFdPX1BJID0gMi4wICogTWF0aC5QSTtcbklHZW9tZXRyeS5USFJFRV9QSSA9IDMuMCAqIE1hdGguUEk7XG5cbm1vZHVsZS5leHBvcnRzID0gSUdlb21ldHJ5O1xuIiwiZnVuY3Rpb24gSU1hdGgoKSB7XG59XG5cbi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgc2lnbiBvZiB0aGUgaW5wdXQgdmFsdWUuXG4gKi9cbklNYXRoLnNpZ24gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKHZhbHVlID4gMClcbiAge1xuICAgIHJldHVybiAxO1xuICB9XG4gIGVsc2UgaWYgKHZhbHVlIDwgMClcbiAge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBlbHNlXG4gIHtcbiAgICByZXR1cm4gMDtcbiAgfVxufVxuXG5JTWF0aC5mbG9vciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPCAwID8gTWF0aC5jZWlsKHZhbHVlKSA6IE1hdGguZmxvb3IodmFsdWUpO1xufVxuXG5JTWF0aC5jZWlsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA8IDAgPyBNYXRoLmZsb29yKHZhbHVlKSA6IE1hdGguY2VpbCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSU1hdGg7XG4iLCJmdW5jdGlvbiBJbnRlZ2VyKCkge1xufVxuXG5JbnRlZ2VyLk1BWF9WQUxVRSA9IDIxNDc0ODM2NDc7XG5JbnRlZ2VyLk1JTl9WQUxVRSA9IC0yMTQ3NDgzNjQ4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVnZXI7XG4iLCJ2YXIgTEdyYXBoT2JqZWN0ID0gcmVxdWlyZSgnLi9MR3JhcGhPYmplY3QnKTtcblxuZnVuY3Rpb24gTEVkZ2Uoc291cmNlLCB0YXJnZXQsIHZFZGdlKSB7XG4gIExHcmFwaE9iamVjdC5jYWxsKHRoaXMsIHZFZGdlKTtcblxuICB0aGlzLmlzT3ZlcmxhcGluZ1NvdXJjZUFuZFRhcmdldCA9IGZhbHNlO1xuICB0aGlzLnZHcmFwaE9iamVjdCA9IHZFZGdlO1xuICB0aGlzLmJlbmRwb2ludHMgPSBbXTtcbiAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xufVxuXG5MRWRnZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKExHcmFwaE9iamVjdC5wcm90b3R5cGUpO1xuXG5mb3IgKHZhciBwcm9wIGluIExHcmFwaE9iamVjdCkge1xuICBMRWRnZVtwcm9wXSA9IExHcmFwaE9iamVjdFtwcm9wXTtcbn1cblxuTEVkZ2UucHJvdG90eXBlLmdldFNvdXJjZSA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLnNvdXJjZTtcbn07XG5cbkxFZGdlLnByb3RvdHlwZS5nZXRUYXJnZXQgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy50YXJnZXQ7XG59O1xuXG5MRWRnZS5wcm90b3R5cGUuaXNJbnRlckdyYXBoID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMuaXNJbnRlckdyYXBoO1xufTtcblxuTEVkZ2UucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLmxlbmd0aDtcbn07XG5cbkxFZGdlLnByb3RvdHlwZS5pc092ZXJsYXBpbmdTb3VyY2VBbmRUYXJnZXQgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy5pc092ZXJsYXBpbmdTb3VyY2VBbmRUYXJnZXQ7XG59O1xuXG5MRWRnZS5wcm90b3R5cGUuZ2V0QmVuZHBvaW50cyA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLmJlbmRwb2ludHM7XG59O1xuXG5MRWRnZS5wcm90b3R5cGUuZ2V0TGNhID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMubGNhO1xufTtcblxuTEVkZ2UucHJvdG90eXBlLmdldFNvdXJjZUluTGNhID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMuc291cmNlSW5MY2E7XG59O1xuXG5MRWRnZS5wcm90b3R5cGUuZ2V0VGFyZ2V0SW5MY2EgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy50YXJnZXRJbkxjYTtcbn07XG5cbkxFZGdlLnByb3RvdHlwZS5nZXRPdGhlckVuZCA9IGZ1bmN0aW9uIChub2RlKVxue1xuICBpZiAodGhpcy5zb3VyY2UgPT09IG5vZGUpXG4gIHtcbiAgICByZXR1cm4gdGhpcy50YXJnZXQ7XG4gIH1cbiAgZWxzZSBpZiAodGhpcy50YXJnZXQgPT09IG5vZGUpXG4gIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG4gIH1cbiAgZWxzZVxuICB7XG4gICAgdGhyb3cgXCJOb2RlIGlzIG5vdCBpbmNpZGVudCB3aXRoIHRoaXMgZWRnZVwiO1xuICB9XG59XG5cbkxFZGdlLnByb3RvdHlwZS5nZXRPdGhlckVuZEluR3JhcGggPSBmdW5jdGlvbiAobm9kZSwgZ3JhcGgpXG57XG4gIHZhciBvdGhlckVuZCA9IHRoaXMuZ2V0T3RoZXJFbmQobm9kZSk7XG4gIHZhciByb290ID0gZ3JhcGguZ2V0R3JhcGhNYW5hZ2VyKCkuZ2V0Um9vdCgpO1xuXG4gIHdoaWxlICh0cnVlKVxuICB7XG4gICAgaWYgKG90aGVyRW5kLmdldE93bmVyKCkgPT0gZ3JhcGgpXG4gICAge1xuICAgICAgcmV0dXJuIG90aGVyRW5kO1xuICAgIH1cblxuICAgIGlmIChvdGhlckVuZC5nZXRPd25lcigpID09IHJvb3QpXG4gICAge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgb3RoZXJFbmQgPSBvdGhlckVuZC5nZXRPd25lcigpLmdldFBhcmVudCgpO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5MRWRnZS5wcm90b3R5cGUudXBkYXRlTGVuZ3RoID0gZnVuY3Rpb24gKClcbntcbiAgdmFyIGNsaXBQb2ludENvb3JkaW5hdGVzID0gbmV3IEFycmF5KDQpO1xuXG4gIHRoaXMuaXNPdmVybGFwaW5nU291cmNlQW5kVGFyZ2V0ID1cbiAgICAgICAgICBJR2VvbWV0cnkuZ2V0SW50ZXJzZWN0aW9uKHRoaXMudGFyZ2V0LmdldFJlY3QoKSxcbiAgICAgICAgICAgICAgICAgIHRoaXMuc291cmNlLmdldFJlY3QoKSxcbiAgICAgICAgICAgICAgICAgIGNsaXBQb2ludENvb3JkaW5hdGVzKTtcblxuICBpZiAoIXRoaXMuaXNPdmVybGFwaW5nU291cmNlQW5kVGFyZ2V0KVxuICB7XG4gICAgdGhpcy5sZW5ndGhYID0gY2xpcFBvaW50Q29vcmRpbmF0ZXNbMF0gLSBjbGlwUG9pbnRDb29yZGluYXRlc1syXTtcbiAgICB0aGlzLmxlbmd0aFkgPSBjbGlwUG9pbnRDb29yZGluYXRlc1sxXSAtIGNsaXBQb2ludENvb3JkaW5hdGVzWzNdO1xuXG4gICAgaWYgKE1hdGguYWJzKHRoaXMubGVuZ3RoWCkgPCAxLjApXG4gICAge1xuICAgICAgdGhpcy5sZW5ndGhYID0gSU1hdGguc2lnbih0aGlzLmxlbmd0aFgpO1xuICAgIH1cblxuICAgIGlmIChNYXRoLmFicyh0aGlzLmxlbmd0aFkpIDwgMS4wKVxuICAgIHtcbiAgICAgIHRoaXMubGVuZ3RoWSA9IElNYXRoLnNpZ24odGhpcy5sZW5ndGhZKTtcbiAgICB9XG5cbiAgICB0aGlzLmxlbmd0aCA9IE1hdGguc3FydChcbiAgICAgICAgICAgIHRoaXMubGVuZ3RoWCAqIHRoaXMubGVuZ3RoWCArIHRoaXMubGVuZ3RoWSAqIHRoaXMubGVuZ3RoWSk7XG4gIH1cbn07XG5cbkxFZGdlLnByb3RvdHlwZS51cGRhdGVMZW5ndGhTaW1wbGUgPSBmdW5jdGlvbiAoKVxue1xuICB0aGlzLmxlbmd0aFggPSB0aGlzLnRhcmdldC5nZXRDZW50ZXJYKCkgLSB0aGlzLnNvdXJjZS5nZXRDZW50ZXJYKCk7XG4gIHRoaXMubGVuZ3RoWSA9IHRoaXMudGFyZ2V0LmdldENlbnRlclkoKSAtIHRoaXMuc291cmNlLmdldENlbnRlclkoKTtcblxuICBpZiAoTWF0aC5hYnModGhpcy5sZW5ndGhYKSA8IDEuMClcbiAge1xuICAgIHRoaXMubGVuZ3RoWCA9IElNYXRoLnNpZ24odGhpcy5sZW5ndGhYKTtcbiAgfVxuXG4gIGlmIChNYXRoLmFicyh0aGlzLmxlbmd0aFkpIDwgMS4wKVxuICB7XG4gICAgdGhpcy5sZW5ndGhZID0gSU1hdGguc2lnbih0aGlzLmxlbmd0aFkpO1xuICB9XG5cbiAgdGhpcy5sZW5ndGggPSBNYXRoLnNxcnQoXG4gICAgICAgICAgdGhpcy5sZW5ndGhYICogdGhpcy5sZW5ndGhYICsgdGhpcy5sZW5ndGhZICogdGhpcy5sZW5ndGhZKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMRWRnZTtcbiIsInZhciBMR3JhcGhPYmplY3QgPSByZXF1aXJlKCcuL0xHcmFwaE9iamVjdCcpO1xudmFyIEludGVnZXIgPSByZXF1aXJlKCcuL0ludGVnZXInKTtcbnZhciBMYXlvdXRDb25zdGFudHMgPSByZXF1aXJlKCcuL0xheW91dENvbnN0YW50cycpO1xudmFyIExHcmFwaE1hbmFnZXIgPSByZXF1aXJlKCcuL0xHcmFwaE1hbmFnZXInKTtcbnZhciBMTm9kZSA9IHJlcXVpcmUoJy4vTE5vZGUnKTtcblxuZnVuY3Rpb24gTEdyYXBoKHBhcmVudCwgb2JqMiwgdkdyYXBoKSB7XG4gIExHcmFwaE9iamVjdC5jYWxsKHRoaXMsIHZHcmFwaCk7XG4gIHRoaXMuZXN0aW1hdGVkU2l6ZSA9IEludGVnZXIuTUlOX1ZBTFVFO1xuICB0aGlzLm1hcmdpbiA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0dSQVBIX01BUkdJTjtcbiAgdGhpcy5lZGdlcyA9IFtdO1xuICB0aGlzLm5vZGVzID0gW107XG4gIHRoaXMuaXNDb25uZWN0ZWQgPSBmYWxzZTtcbiAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cbiAgaWYgKG9iajIgIT0gbnVsbCAmJiBvYmoyIGluc3RhbmNlb2YgTEdyYXBoTWFuYWdlcikge1xuICAgIHRoaXMuZ3JhcGhNYW5hZ2VyID0gb2JqMjtcbiAgfVxuICBlbHNlIGlmIChvYmoyICE9IG51bGwgJiYgb2JqMiBpbnN0YW5jZW9mIExheW91dCkge1xuICAgIHRoaXMuZ3JhcGhNYW5hZ2VyID0gb2JqMi5ncmFwaE1hbmFnZXI7XG4gIH1cbn1cblxuTEdyYXBoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTEdyYXBoT2JqZWN0LnByb3RvdHlwZSk7XG5mb3IgKHZhciBwcm9wIGluIExHcmFwaE9iamVjdCkge1xuICBMR3JhcGhbcHJvcF0gPSBMR3JhcGhPYmplY3RbcHJvcF07XG59XG5cbkxHcmFwaC5wcm90b3R5cGUuZ2V0Tm9kZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLm5vZGVzO1xufTtcblxuTEdyYXBoLnByb3RvdHlwZS5nZXRFZGdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZWRnZXM7XG59O1xuXG5MR3JhcGgucHJvdG90eXBlLmdldEdyYXBoTWFuYWdlciA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLmdyYXBoTWFuYWdlcjtcbn07XG5cbkxHcmFwaC5wcm90b3R5cGUuZ2V0UGFyZW50ID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMucGFyZW50O1xufTtcblxuTEdyYXBoLnByb3RvdHlwZS5nZXRMZWZ0ID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMubGVmdDtcbn07XG5cbkxHcmFwaC5wcm90b3R5cGUuZ2V0UmlnaHQgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy5yaWdodDtcbn07XG5cbkxHcmFwaC5wcm90b3R5cGUuZ2V0VG9wID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMudG9wO1xufTtcblxuTEdyYXBoLnByb3RvdHlwZS5nZXRCb3R0b20gPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy5ib3R0b207XG59O1xuXG5MR3JhcGgucHJvdG90eXBlLmlzQ29ubmVjdGVkID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMuaXNDb25uZWN0ZWQ7XG59O1xuXG5MR3JhcGgucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChvYmoxLCBzb3VyY2VOb2RlLCB0YXJnZXROb2RlKSB7XG4gIGlmIChzb3VyY2VOb2RlID09IG51bGwgJiYgdGFyZ2V0Tm9kZSA9PSBudWxsKSB7XG4gICAgdmFyIG5ld05vZGUgPSBvYmoxO1xuICAgIGlmICh0aGlzLmdyYXBoTWFuYWdlciA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBcIkdyYXBoIGhhcyBubyBncmFwaCBtZ3IhXCI7XG4gICAgfVxuICAgIGlmICh0aGlzLmdldE5vZGVzKCkuaW5kZXhPZihuZXdOb2RlKSA+IC0xKSB7XG4gICAgICB0aHJvdyBcIk5vZGUgYWxyZWFkeSBpbiBncmFwaCFcIjtcbiAgICB9XG4gICAgbmV3Tm9kZS5vd25lciA9IHRoaXM7XG4gICAgdGhpcy5nZXROb2RlcygpLnB1c2gobmV3Tm9kZSk7XG5cbiAgICByZXR1cm4gbmV3Tm9kZTtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgbmV3RWRnZSA9IG9iajE7XG4gICAgaWYgKCEodGhpcy5nZXROb2RlcygpLmluZGV4T2Yoc291cmNlTm9kZSkgPiAtMSAmJiAodGhpcy5nZXROb2RlcygpLmluZGV4T2YodGFyZ2V0Tm9kZSkpID4gLTEpKSB7XG4gICAgICB0aHJvdyBcIlNvdXJjZSBvciB0YXJnZXQgbm90IGluIGdyYXBoIVwiO1xuICAgIH1cblxuICAgIGlmICghKHNvdXJjZU5vZGUub3duZXIgPT0gdGFyZ2V0Tm9kZS5vd25lciAmJiBzb3VyY2VOb2RlLm93bmVyID09IHRoaXMpKSB7XG4gICAgICB0aHJvdyBcIkJvdGggb3duZXJzIG11c3QgYmUgdGhpcyBncmFwaCFcIjtcbiAgICB9XG5cbiAgICBpZiAoc291cmNlTm9kZS5vd25lciAhPSB0YXJnZXROb2RlLm93bmVyKVxuICAgIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIHNldCBzb3VyY2UgYW5kIHRhcmdldFxuICAgIG5ld0VkZ2Uuc291cmNlID0gc291cmNlTm9kZTtcbiAgICBuZXdFZGdlLnRhcmdldCA9IHRhcmdldE5vZGU7XG5cbiAgICAvLyBzZXQgYXMgaW50cmEtZ3JhcGggZWRnZVxuICAgIG5ld0VkZ2UuaXNJbnRlckdyYXBoID0gZmFsc2U7XG5cbiAgICAvLyBhZGQgdG8gZ3JhcGggZWRnZSBsaXN0XG4gICAgdGhpcy5nZXRFZGdlcygpLnB1c2gobmV3RWRnZSk7XG5cbiAgICAvLyBhZGQgdG8gaW5jaWRlbmN5IGxpc3RzXG4gICAgc291cmNlTm9kZS5lZGdlcy5wdXNoKG5ld0VkZ2UpO1xuXG4gICAgaWYgKHRhcmdldE5vZGUgIT0gc291cmNlTm9kZSlcbiAgICB7XG4gICAgICB0YXJnZXROb2RlLmVkZ2VzLnB1c2gobmV3RWRnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld0VkZ2U7XG4gIH1cbn07XG5cbkxHcmFwaC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIgbm9kZSA9IG9iajtcbiAgaWYgKG9iaiBpbnN0YW5jZW9mIExOb2RlKSB7XG4gICAgaWYgKG5vZGUgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgXCJOb2RlIGlzIG51bGwhXCI7XG4gICAgfVxuICAgIGlmICghKG5vZGUub3duZXIgIT0gbnVsbCAmJiBub2RlLm93bmVyID09IHRoaXMpKSB7XG4gICAgICB0aHJvdyBcIk93bmVyIGdyYXBoIGlzIGludmFsaWQhXCI7XG4gICAgfVxuICAgIGlmICh0aGlzLmdyYXBoTWFuYWdlciA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBcIk93bmVyIGdyYXBoIG1hbmFnZXIgaXMgaW52YWxpZCFcIjtcbiAgICB9XG4gICAgLy8gcmVtb3ZlIGluY2lkZW50IGVkZ2VzIGZpcnN0IChtYWtlIGEgY29weSB0byBkbyBpdCBzYWZlbHkpXG4gICAgdmFyIGVkZ2VzVG9CZVJlbW92ZWQgPSBub2RlLmVkZ2VzLnNsaWNlKCk7XG4gICAgdmFyIGVkZ2U7XG4gICAgdmFyIHMgPSBlZGdlc1RvQmVSZW1vdmVkLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKylcbiAgICB7XG4gICAgICBlZGdlID0gZWRnZXNUb0JlUmVtb3ZlZFtpXTtcblxuICAgICAgaWYgKGVkZ2UuaXNJbnRlckdyYXBoKVxuICAgICAge1xuICAgICAgICB0aGlzLmdyYXBoTWFuYWdlci5yZW1vdmUoZWRnZSk7XG4gICAgICB9XG4gICAgICBlbHNlXG4gICAgICB7XG4gICAgICAgIGVkZ2Uuc291cmNlLm93bmVyLnJlbW92ZShlZGdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBub3cgdGhlIG5vZGUgaXRzZWxmXG4gICAgdmFyIGluZGV4ID0gdGhpcy5ub2Rlcy5pbmRleE9mKG5vZGUpO1xuICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgdGhyb3cgXCJOb2RlIG5vdCBpbiBvd25lciBub2RlIGxpc3QhXCI7XG4gICAgfVxuXG4gICAgdGhpcy5ub2Rlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG4gIGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIExFZGdlKSB7XG4gICAgdmFyIGVkZ2UgPSBvYmo7XG4gICAgaWYgKGVkZ2UgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgXCJFZGdlIGlzIG51bGwhXCI7XG4gICAgfVxuICAgIGlmICghKGVkZ2Uuc291cmNlICE9IG51bGwgJiYgZWRnZS50YXJnZXQgIT0gbnVsbCkpIHtcbiAgICAgIHRocm93IFwiU291cmNlIGFuZC9vciB0YXJnZXQgaXMgbnVsbCFcIjtcbiAgICB9XG4gICAgaWYgKCEoZWRnZS5zb3VyY2Uub3duZXIgIT0gbnVsbCAmJiBlZGdlLnRhcmdldC5vd25lciAhPSBudWxsICYmXG4gICAgICAgICAgICBlZGdlLnNvdXJjZS5vd25lciA9PSB0aGlzICYmIGVkZ2UudGFyZ2V0Lm93bmVyID09IHRoaXMpKSB7XG4gICAgICB0aHJvdyBcIlNvdXJjZSBhbmQvb3IgdGFyZ2V0IG93bmVyIGlzIGludmFsaWQhXCI7XG4gICAgfVxuXG4gICAgdmFyIHNvdXJjZUluZGV4ID0gZWRnZS5zb3VyY2UuZWRnZXMuaW5kZXhPZihlZGdlKTtcbiAgICB2YXIgdGFyZ2V0SW5kZXggPSBlZGdlLnRhcmdldC5lZGdlcy5pbmRleE9mKGVkZ2UpO1xuICAgIGlmICghKHNvdXJjZUluZGV4ID4gLTEgJiYgdGFyZ2V0SW5kZXggPiAtMSkpIHtcbiAgICAgIHRocm93IFwiU291cmNlIGFuZC9vciB0YXJnZXQgZG9lc24ndCBrbm93IHRoaXMgZWRnZSFcIjtcbiAgICB9XG5cbiAgICBlZGdlLnNvdXJjZS5lZGdlcy5zcGxpY2Uoc291cmNlSW5kZXgsIDEpO1xuXG4gICAgaWYgKGVkZ2UudGFyZ2V0ICE9IGVkZ2Uuc291cmNlKVxuICAgIHtcbiAgICAgIGVkZ2UudGFyZ2V0LmVkZ2VzLnNwbGljZSh0YXJnZXRJbmRleCwgMSk7XG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0gZWRnZS5zb3VyY2Uub3duZXIuZ2V0RWRnZXMoKS5pbmRleE9mKGVkZ2UpO1xuICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgdGhyb3cgXCJOb3QgaW4gb3duZXIncyBlZGdlIGxpc3QhXCI7XG4gICAgfVxuXG4gICAgZWRnZS5zb3VyY2Uub3duZXIuZ2V0RWRnZXMoKS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59O1xuXG5MR3JhcGgucHJvdG90eXBlLnVwZGF0ZUxlZnRUb3AgPSBmdW5jdGlvbiAoKVxue1xuICB2YXIgdG9wID0gSW50ZWdlci5NQVhfVkFMVUU7XG4gIHZhciBsZWZ0ID0gSW50ZWdlci5NQVhfVkFMVUU7XG4gIHZhciBub2RlVG9wO1xuICB2YXIgbm9kZUxlZnQ7XG5cbiAgdmFyIG5vZGVzID0gdGhpcy5nZXROb2RlcygpO1xuICB2YXIgcyA9IG5vZGVzLmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKylcbiAge1xuICAgIHZhciBsTm9kZSA9IG5vZGVzW2ldO1xuICAgIG5vZGVUb3AgPSBNYXRoLmZsb29yKGxOb2RlLmdldFRvcCgpKTtcbiAgICBub2RlTGVmdCA9IE1hdGguZmxvb3IobE5vZGUuZ2V0TGVmdCgpKTtcblxuICAgIGlmICh0b3AgPiBub2RlVG9wKVxuICAgIHtcbiAgICAgIHRvcCA9IG5vZGVUb3A7XG4gICAgfVxuXG4gICAgaWYgKGxlZnQgPiBub2RlTGVmdClcbiAgICB7XG4gICAgICBsZWZ0ID0gbm9kZUxlZnQ7XG4gICAgfVxuICB9XG5cbiAgLy8gRG8gd2UgaGF2ZSBhbnkgbm9kZXMgaW4gdGhpcyBncmFwaD9cbiAgaWYgKHRvcCA9PSBJbnRlZ2VyLk1BWF9WQUxVRSlcbiAge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdGhpcy5sZWZ0ID0gbGVmdCAtIHRoaXMubWFyZ2luO1xuICB0aGlzLnRvcCA9IHRvcCAtIHRoaXMubWFyZ2luO1xuXG4gIC8vIEFwcGx5IHRoZSBtYXJnaW5zIGFuZCByZXR1cm4gdGhlIHJlc3VsdFxuICByZXR1cm4gbmV3IFBvaW50KHRoaXMubGVmdCwgdGhpcy50b3ApO1xufTtcblxuTEdyYXBoLnByb3RvdHlwZS51cGRhdGVCb3VuZHMgPSBmdW5jdGlvbiAocmVjdXJzaXZlKVxue1xuICAvLyBjYWxjdWxhdGUgYm91bmRzXG4gIHZhciBsZWZ0ID0gSW50ZWdlci5NQVhfVkFMVUU7XG4gIHZhciByaWdodCA9IC1JbnRlZ2VyLk1BWF9WQUxVRTtcbiAgdmFyIHRvcCA9IEludGVnZXIuTUFYX1ZBTFVFO1xuICB2YXIgYm90dG9tID0gLUludGVnZXIuTUFYX1ZBTFVFO1xuICB2YXIgbm9kZUxlZnQ7XG4gIHZhciBub2RlUmlnaHQ7XG4gIHZhciBub2RlVG9wO1xuICB2YXIgbm9kZUJvdHRvbTtcblxuICB2YXIgbm9kZXMgPSB0aGlzLm5vZGVzO1xuICB2YXIgcyA9IG5vZGVzLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzOyBpKyspXG4gIHtcbiAgICB2YXIgbE5vZGUgPSBub2Rlc1tpXTtcblxuICAgIGlmIChyZWN1cnNpdmUgJiYgbE5vZGUuY2hpbGQgIT0gbnVsbClcbiAgICB7XG4gICAgICBsTm9kZS51cGRhdGVCb3VuZHMoKTtcbiAgICB9XG4gICAgbm9kZUxlZnQgPSBNYXRoLmZsb29yKGxOb2RlLmdldExlZnQoKSk7XG4gICAgbm9kZVJpZ2h0ID0gTWF0aC5mbG9vcihsTm9kZS5nZXRSaWdodCgpKTtcbiAgICBub2RlVG9wID0gTWF0aC5mbG9vcihsTm9kZS5nZXRUb3AoKSk7XG4gICAgbm9kZUJvdHRvbSA9IE1hdGguZmxvb3IobE5vZGUuZ2V0Qm90dG9tKCkpO1xuXG4gICAgaWYgKGxlZnQgPiBub2RlTGVmdClcbiAgICB7XG4gICAgICBsZWZ0ID0gbm9kZUxlZnQ7XG4gICAgfVxuXG4gICAgaWYgKHJpZ2h0IDwgbm9kZVJpZ2h0KVxuICAgIHtcbiAgICAgIHJpZ2h0ID0gbm9kZVJpZ2h0O1xuICAgIH1cblxuICAgIGlmICh0b3AgPiBub2RlVG9wKVxuICAgIHtcbiAgICAgIHRvcCA9IG5vZGVUb3A7XG4gICAgfVxuXG4gICAgaWYgKGJvdHRvbSA8IG5vZGVCb3R0b20pXG4gICAge1xuICAgICAgYm90dG9tID0gbm9kZUJvdHRvbTtcbiAgICB9XG4gIH1cblxuICB2YXIgYm91bmRpbmdSZWN0ID0gbmV3IFJlY3RhbmdsZUQobGVmdCwgdG9wLCByaWdodCAtIGxlZnQsIGJvdHRvbSAtIHRvcCk7XG4gIGlmIChsZWZ0ID09IEludGVnZXIuTUFYX1ZBTFVFKVxuICB7XG4gICAgdGhpcy5sZWZ0ID0gTWF0aC5mbG9vcih0aGlzLnBhcmVudC5nZXRMZWZ0KCkpO1xuICAgIHRoaXMucmlnaHQgPSBNYXRoLmZsb29yKHRoaXMucGFyZW50LmdldFJpZ2h0KCkpO1xuICAgIHRoaXMudG9wID0gTWF0aC5mbG9vcih0aGlzLnBhcmVudC5nZXRUb3AoKSk7XG4gICAgdGhpcy5ib3R0b20gPSBNYXRoLmZsb29yKHRoaXMucGFyZW50LmdldEJvdHRvbSgpKTtcbiAgfVxuXG4gIHRoaXMubGVmdCA9IGJvdW5kaW5nUmVjdC54IC0gdGhpcy5tYXJnaW47XG4gIHRoaXMucmlnaHQgPSBib3VuZGluZ1JlY3QueCArIGJvdW5kaW5nUmVjdC53aWR0aCArIHRoaXMubWFyZ2luO1xuICB0aGlzLnRvcCA9IGJvdW5kaW5nUmVjdC55IC0gdGhpcy5tYXJnaW47XG4gIHRoaXMuYm90dG9tID0gYm91bmRpbmdSZWN0LnkgKyBib3VuZGluZ1JlY3QuaGVpZ2h0ICsgdGhpcy5tYXJnaW47XG59O1xuXG5MR3JhcGguY2FsY3VsYXRlQm91bmRzID0gZnVuY3Rpb24gKG5vZGVzKVxue1xuICB2YXIgbGVmdCA9IEludGVnZXIuTUFYX1ZBTFVFO1xuICB2YXIgcmlnaHQgPSAtSW50ZWdlci5NQVhfVkFMVUU7XG4gIHZhciB0b3AgPSBJbnRlZ2VyLk1BWF9WQUxVRTtcbiAgdmFyIGJvdHRvbSA9IC1JbnRlZ2VyLk1BWF9WQUxVRTtcbiAgdmFyIG5vZGVMZWZ0O1xuICB2YXIgbm9kZVJpZ2h0O1xuICB2YXIgbm9kZVRvcDtcbiAgdmFyIG5vZGVCb3R0b207XG5cbiAgdmFyIHMgPSBub2Rlcy5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzOyBpKyspXG4gIHtcbiAgICB2YXIgbE5vZGUgPSBub2Rlc1tpXTtcbiAgICBub2RlTGVmdCA9IE1hdGguZmxvb3IobE5vZGUuZ2V0TGVmdCgpKTtcbiAgICBub2RlUmlnaHQgPSBNYXRoLmZsb29yKGxOb2RlLmdldFJpZ2h0KCkpO1xuICAgIG5vZGVUb3AgPSBNYXRoLmZsb29yKGxOb2RlLmdldFRvcCgpKTtcbiAgICBub2RlQm90dG9tID0gTWF0aC5mbG9vcihsTm9kZS5nZXRCb3R0b20oKSk7XG5cbiAgICBpZiAobGVmdCA+IG5vZGVMZWZ0KVxuICAgIHtcbiAgICAgIGxlZnQgPSBub2RlTGVmdDtcbiAgICB9XG5cbiAgICBpZiAocmlnaHQgPCBub2RlUmlnaHQpXG4gICAge1xuICAgICAgcmlnaHQgPSBub2RlUmlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKHRvcCA+IG5vZGVUb3ApXG4gICAge1xuICAgICAgdG9wID0gbm9kZVRvcDtcbiAgICB9XG5cbiAgICBpZiAoYm90dG9tIDwgbm9kZUJvdHRvbSlcbiAgICB7XG4gICAgICBib3R0b20gPSBub2RlQm90dG9tO1xuICAgIH1cbiAgfVxuXG4gIHZhciBib3VuZGluZ1JlY3QgPSBuZXcgUmVjdGFuZ2xlRChsZWZ0LCB0b3AsIHJpZ2h0IC0gbGVmdCwgYm90dG9tIC0gdG9wKTtcblxuICByZXR1cm4gYm91bmRpbmdSZWN0O1xufTtcblxuTEdyYXBoLnByb3RvdHlwZS5nZXRJbmNsdXNpb25UcmVlRGVwdGggPSBmdW5jdGlvbiAoKVxue1xuICBpZiAodGhpcyA9PSB0aGlzLmdyYXBoTWFuYWdlci5nZXRSb290KCkpXG4gIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuICBlbHNlXG4gIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQuZ2V0SW5jbHVzaW9uVHJlZURlcHRoKCk7XG4gIH1cbn07XG5cbkxHcmFwaC5wcm90b3R5cGUuZ2V0RXN0aW1hdGVkU2l6ZSA9IGZ1bmN0aW9uICgpXG57XG4gIGlmICh0aGlzLmVzdGltYXRlZFNpemUgPT0gSW50ZWdlci5NSU5fVkFMVUUpIHtcbiAgICB0aHJvdyBcImFzc2VydCBmYWlsZWRcIjtcbiAgfVxuICByZXR1cm4gdGhpcy5lc3RpbWF0ZWRTaXplO1xufTtcblxuTEdyYXBoLnByb3RvdHlwZS5jYWxjRXN0aW1hdGVkU2l6ZSA9IGZ1bmN0aW9uICgpXG57XG4gIHZhciBzaXplID0gMDtcbiAgdmFyIG5vZGVzID0gdGhpcy5ub2RlcztcbiAgdmFyIHMgPSBub2Rlcy5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzOyBpKyspXG4gIHtcbiAgICB2YXIgbE5vZGUgPSBub2Rlc1tpXTtcbiAgICBzaXplICs9IGxOb2RlLmNhbGNFc3RpbWF0ZWRTaXplKCk7XG4gIH1cblxuICBpZiAoc2l6ZSA9PSAwKVxuICB7XG4gICAgdGhpcy5lc3RpbWF0ZWRTaXplID0gTGF5b3V0Q29uc3RhbnRzLkVNUFRZX0NPTVBPVU5EX05PREVfU0laRTtcbiAgfVxuICBlbHNlXG4gIHtcbiAgICB0aGlzLmVzdGltYXRlZFNpemUgPSBNYXRoLmZsb29yKHNpemUgLyBNYXRoLnNxcnQodGhpcy5ub2Rlcy5sZW5ndGgpKTtcbiAgfVxuXG4gIHJldHVybiBNYXRoLmZsb29yKHRoaXMuZXN0aW1hdGVkU2l6ZSk7XG59O1xuXG5MR3JhcGgucHJvdG90eXBlLnVwZGF0ZUNvbm5lY3RlZCA9IGZ1bmN0aW9uICgpXG57XG4gIGlmICh0aGlzLm5vZGVzLmxlbmd0aCA9PSAwKVxuICB7XG4gICAgdGhpcy5pc0Nvbm5lY3RlZCA9IHRydWU7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHRvQmVWaXNpdGVkID0gW107XG4gIHZhciB2aXNpdGVkID0gbmV3IEhhc2hTZXQoKTtcbiAgdmFyIGN1cnJlbnROb2RlID0gdGhpcy5ub2Rlc1swXTtcbiAgdmFyIG5laWdoYm9yRWRnZXM7XG4gIHZhciBjdXJyZW50TmVpZ2hib3I7XG4gIHRvQmVWaXNpdGVkID0gdG9CZVZpc2l0ZWQuY29uY2F0KGN1cnJlbnROb2RlLndpdGhDaGlsZHJlbigpKTtcblxuICB3aGlsZSAodG9CZVZpc2l0ZWQubGVuZ3RoID4gMClcbiAge1xuICAgIGN1cnJlbnROb2RlID0gdG9CZVZpc2l0ZWQuc2hpZnQoKTtcbiAgICB2aXNpdGVkLmFkZChjdXJyZW50Tm9kZSk7XG5cbiAgICAvLyBUcmF2ZXJzZSBhbGwgbmVpZ2hib3JzIG9mIHRoaXMgbm9kZVxuICAgIG5laWdoYm9yRWRnZXMgPSBjdXJyZW50Tm9kZS5nZXRFZGdlcygpO1xuICAgIHZhciBzID0gbmVpZ2hib3JFZGdlcy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzOyBpKyspXG4gICAge1xuICAgICAgdmFyIG5laWdoYm9yRWRnZSA9IG5laWdoYm9yRWRnZXNbaV07XG4gICAgICBjdXJyZW50TmVpZ2hib3IgPVxuICAgICAgICAgICAgICBuZWlnaGJvckVkZ2UuZ2V0T3RoZXJFbmRJbkdyYXBoKGN1cnJlbnROb2RlLCB0aGlzKTtcblxuICAgICAgLy8gQWRkIHVudmlzaXRlZCBuZWlnaGJvcnMgdG8gdGhlIGxpc3QgdG8gdmlzaXRcbiAgICAgIGlmIChjdXJyZW50TmVpZ2hib3IgIT0gbnVsbCAmJlxuICAgICAgICAgICAgICAhdmlzaXRlZC5jb250YWlucyhjdXJyZW50TmVpZ2hib3IpKVxuICAgICAge1xuICAgICAgICB0b0JlVmlzaXRlZCA9IHRvQmVWaXNpdGVkLmNvbmNhdChjdXJyZW50TmVpZ2hib3Iud2l0aENoaWxkcmVuKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuaXNDb25uZWN0ZWQgPSBmYWxzZTtcblxuICBpZiAodmlzaXRlZC5zaXplKCkgPj0gdGhpcy5ub2Rlcy5sZW5ndGgpXG4gIHtcbiAgICB2YXIgbm9PZlZpc2l0ZWRJblRoaXNHcmFwaCA9IDA7XG5cbiAgICB2YXIgcyA9IHZpc2l0ZWQuc2l6ZSgpO1xuICAgIGZvciAodmFyIHZpc2l0ZWRJZCBpbiB2aXNpdGVkLnNldClcbiAgICB7XG4gICAgICB2YXIgdmlzaXRlZE5vZGUgPSB2aXNpdGVkLnNldFt2aXNpdGVkSWRdO1xuICAgICAgaWYgKHZpc2l0ZWROb2RlLm93bmVyID09IHRoaXMpXG4gICAgICB7XG4gICAgICAgIG5vT2ZWaXNpdGVkSW5UaGlzR3JhcGgrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobm9PZlZpc2l0ZWRJblRoaXNHcmFwaCA9PSB0aGlzLm5vZGVzLmxlbmd0aClcbiAgICB7XG4gICAgICB0aGlzLmlzQ29ubmVjdGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTEdyYXBoO1xuIiwiZnVuY3Rpb24gTEdyYXBoTWFuYWdlcihsYXlvdXQpIHtcbiAgdGhpcy5sYXlvdXQgPSBsYXlvdXQ7XG5cbiAgdGhpcy5ncmFwaHMgPSBbXTtcbiAgdGhpcy5lZGdlcyA9IFtdO1xufVxuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5hZGRSb290ID0gZnVuY3Rpb24gKClcbntcbiAgdmFyIG5ncmFwaCA9IHRoaXMubGF5b3V0Lm5ld0dyYXBoKCk7XG4gIHZhciBubm9kZSA9IHRoaXMubGF5b3V0Lm5ld05vZGUobnVsbCk7XG4gIHZhciByb290ID0gdGhpcy5hZGQobmdyYXBoLCBubm9kZSk7XG4gIHRoaXMuc2V0Um9vdEdyYXBoKHJvb3QpO1xuICByZXR1cm4gdGhpcy5yb290R3JhcGg7XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAobmV3R3JhcGgsIHBhcmVudE5vZGUsIG5ld0VkZ2UsIHNvdXJjZU5vZGUsIHRhcmdldE5vZGUpXG57XG4gIC8vdGhlcmUgYXJlIGp1c3QgMiBwYXJhbWV0ZXJzIGFyZSBwYXNzZWQgdGhlbiBpdCBhZGRzIGFuIExHcmFwaCBlbHNlIGl0IGFkZHMgYW4gTEVkZ2VcbiAgaWYgKG5ld0VkZ2UgPT0gbnVsbCAmJiBzb3VyY2VOb2RlID09IG51bGwgJiYgdGFyZ2V0Tm9kZSA9PSBudWxsKSB7XG4gICAgaWYgKG5ld0dyYXBoID09IG51bGwpIHtcbiAgICAgIHRocm93IFwiR3JhcGggaXMgbnVsbCFcIjtcbiAgICB9XG4gICAgaWYgKHBhcmVudE5vZGUgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgXCJQYXJlbnQgbm9kZSBpcyBudWxsIVwiO1xuICAgIH1cbiAgICBpZiAodGhpcy5ncmFwaHMuaW5kZXhPZihuZXdHcmFwaCkgPiAtMSkge1xuICAgICAgdGhyb3cgXCJHcmFwaCBhbHJlYWR5IGluIHRoaXMgZ3JhcGggbWdyIVwiO1xuICAgIH1cblxuICAgIHRoaXMuZ3JhcGhzLnB1c2gobmV3R3JhcGgpO1xuXG4gICAgaWYgKG5ld0dyYXBoLnBhcmVudCAhPSBudWxsKSB7XG4gICAgICB0aHJvdyBcIkFscmVhZHkgaGFzIGEgcGFyZW50IVwiO1xuICAgIH1cbiAgICBpZiAocGFyZW50Tm9kZS5jaGlsZCAhPSBudWxsKSB7XG4gICAgICB0aHJvdyAgXCJBbHJlYWR5IGhhcyBhIGNoaWxkIVwiO1xuICAgIH1cblxuICAgIG5ld0dyYXBoLnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgcGFyZW50Tm9kZS5jaGlsZCA9IG5ld0dyYXBoO1xuXG4gICAgcmV0dXJuIG5ld0dyYXBoO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vY2hhbmdlIHRoZSBvcmRlciBvZiB0aGUgcGFyYW1ldGVyc1xuICAgIHRhcmdldE5vZGUgPSBuZXdFZGdlO1xuICAgIHNvdXJjZU5vZGUgPSBwYXJlbnROb2RlO1xuICAgIG5ld0VkZ2UgPSBuZXdHcmFwaDtcbiAgICB2YXIgc291cmNlR3JhcGggPSBzb3VyY2VOb2RlLmdldE93bmVyKCk7XG4gICAgdmFyIHRhcmdldEdyYXBoID0gdGFyZ2V0Tm9kZS5nZXRPd25lcigpO1xuXG4gICAgaWYgKCEoc291cmNlR3JhcGggIT0gbnVsbCAmJiBzb3VyY2VHcmFwaC5nZXRHcmFwaE1hbmFnZXIoKSA9PSB0aGlzKSkge1xuICAgICAgdGhyb3cgXCJTb3VyY2Ugbm90IGluIHRoaXMgZ3JhcGggbWdyIVwiO1xuICAgIH1cbiAgICBpZiAoISh0YXJnZXRHcmFwaCAhPSBudWxsICYmIHRhcmdldEdyYXBoLmdldEdyYXBoTWFuYWdlcigpID09IHRoaXMpKSB7XG4gICAgICB0aHJvdyBcIlRhcmdldCBub3QgaW4gdGhpcyBncmFwaCBtZ3IhXCI7XG4gICAgfVxuXG4gICAgaWYgKHNvdXJjZUdyYXBoID09IHRhcmdldEdyYXBoKVxuICAgIHtcbiAgICAgIG5ld0VkZ2UuaXNJbnRlckdyYXBoID0gZmFsc2U7XG4gICAgICByZXR1cm4gc291cmNlR3JhcGguYWRkKG5ld0VkZ2UsIHNvdXJjZU5vZGUsIHRhcmdldE5vZGUpO1xuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgbmV3RWRnZS5pc0ludGVyR3JhcGggPSB0cnVlO1xuXG4gICAgICAvLyBzZXQgc291cmNlIGFuZCB0YXJnZXRcbiAgICAgIG5ld0VkZ2Uuc291cmNlID0gc291cmNlTm9kZTtcbiAgICAgIG5ld0VkZ2UudGFyZ2V0ID0gdGFyZ2V0Tm9kZTtcblxuICAgICAgLy8gYWRkIGVkZ2UgdG8gaW50ZXItZ3JhcGggZWRnZSBsaXN0XG4gICAgICBpZiAodGhpcy5lZGdlcy5pbmRleE9mKG5ld0VkZ2UpID4gLTEpIHtcbiAgICAgICAgdGhyb3cgXCJFZGdlIGFscmVhZHkgaW4gaW50ZXItZ3JhcGggZWRnZSBsaXN0IVwiO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVkZ2VzLnB1c2gobmV3RWRnZSk7XG5cbiAgICAgIC8vIGFkZCBlZGdlIHRvIHNvdXJjZSBhbmQgdGFyZ2V0IGluY2lkZW5jeSBsaXN0c1xuICAgICAgaWYgKCEobmV3RWRnZS5zb3VyY2UgIT0gbnVsbCAmJiBuZXdFZGdlLnRhcmdldCAhPSBudWxsKSkge1xuICAgICAgICB0aHJvdyBcIkVkZ2Ugc291cmNlIGFuZC9vciB0YXJnZXQgaXMgbnVsbCFcIjtcbiAgICAgIH1cblxuICAgICAgaWYgKCEobmV3RWRnZS5zb3VyY2UuZWRnZXMuaW5kZXhPZihuZXdFZGdlKSA9PSAtMSAmJiBuZXdFZGdlLnRhcmdldC5lZGdlcy5pbmRleE9mKG5ld0VkZ2UpID09IC0xKSkge1xuICAgICAgICB0aHJvdyBcIkVkZ2UgYWxyZWFkeSBpbiBzb3VyY2UgYW5kL29yIHRhcmdldCBpbmNpZGVuY3kgbGlzdCFcIjtcbiAgICAgIH1cblxuICAgICAgbmV3RWRnZS5zb3VyY2UuZWRnZXMucHVzaChuZXdFZGdlKTtcbiAgICAgIG5ld0VkZ2UudGFyZ2V0LmVkZ2VzLnB1c2gobmV3RWRnZSk7XG5cbiAgICAgIHJldHVybiBuZXdFZGdlO1xuICAgIH1cbiAgfVxufTtcblxuTEdyYXBoTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGxPYmopIHtcbiAgaWYgKGxPYmogaW5zdGFuY2VvZiBMR3JhcGgpIHtcbiAgICB2YXIgZ3JhcGggPSBsT2JqO1xuICAgIGlmIChncmFwaC5nZXRHcmFwaE1hbmFnZXIoKSAhPSB0aGlzKSB7XG4gICAgICB0aHJvdyBcIkdyYXBoIG5vdCBpbiB0aGlzIGdyYXBoIG1nclwiO1xuICAgIH1cbiAgICBpZiAoIShncmFwaCA9PSB0aGlzLnJvb3RHcmFwaCB8fCAoZ3JhcGgucGFyZW50ICE9IG51bGwgJiYgZ3JhcGgucGFyZW50LmdyYXBoTWFuYWdlciA9PSB0aGlzKSkpIHtcbiAgICAgIHRocm93IFwiSW52YWxpZCBwYXJlbnQgbm9kZSFcIjtcbiAgICB9XG5cbiAgICAvLyBmaXJzdCB0aGUgZWRnZXMgKG1ha2UgYSBjb3B5IHRvIGRvIGl0IHNhZmVseSlcbiAgICB2YXIgZWRnZXNUb0JlUmVtb3ZlZCA9IFtdO1xuXG4gICAgZWRnZXNUb0JlUmVtb3ZlZCA9IGVkZ2VzVG9CZVJlbW92ZWQuY29uY2F0KGdyYXBoLmdldEVkZ2VzKCkpO1xuXG4gICAgdmFyIGVkZ2U7XG4gICAgdmFyIHMgPSBlZGdlc1RvQmVSZW1vdmVkLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKylcbiAgICB7XG4gICAgICBlZGdlID0gZWRnZXNUb0JlUmVtb3ZlZFtpXTtcbiAgICAgIGdyYXBoLnJlbW92ZShlZGdlKTtcbiAgICB9XG5cbiAgICAvLyB0aGVuIHRoZSBub2RlcyAobWFrZSBhIGNvcHkgdG8gZG8gaXQgc2FmZWx5KVxuICAgIHZhciBub2Rlc1RvQmVSZW1vdmVkID0gW107XG5cbiAgICBub2Rlc1RvQmVSZW1vdmVkID0gbm9kZXNUb0JlUmVtb3ZlZC5jb25jYXQoZ3JhcGguZ2V0Tm9kZXMoKSk7XG5cbiAgICB2YXIgbm9kZTtcbiAgICBzID0gbm9kZXNUb0JlUmVtb3ZlZC5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzOyBpKyspXG4gICAge1xuICAgICAgbm9kZSA9IG5vZGVzVG9CZVJlbW92ZWRbaV07XG4gICAgICBncmFwaC5yZW1vdmUobm9kZSk7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgaWYgZ3JhcGggaXMgdGhlIHJvb3RcbiAgICBpZiAoZ3JhcGggPT0gdGhpcy5yb290R3JhcGgpXG4gICAge1xuICAgICAgdGhpcy5zZXRSb290R3JhcGgobnVsbCk7XG4gICAgfVxuXG4gICAgLy8gbm93IHJlbW92ZSB0aGUgZ3JhcGggaXRzZWxmXG4gICAgdmFyIGluZGV4ID0gdGhpcy5ncmFwaHMuaW5kZXhPZihncmFwaCk7XG4gICAgdGhpcy5ncmFwaHMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIC8vIGFsc28gcmVzZXQgdGhlIHBhcmVudCBvZiB0aGUgZ3JhcGhcbiAgICBncmFwaC5wYXJlbnQgPSBudWxsO1xuICB9XG4gIGVsc2UgaWYgKGxPYmogaW5zdGFuY2VvZiBMRWRnZSkge1xuICAgIGVkZ2UgPSBsT2JqO1xuICAgIGlmIChlZGdlID09IG51bGwpIHtcbiAgICAgIHRocm93IFwiRWRnZSBpcyBudWxsIVwiO1xuICAgIH1cbiAgICBpZiAoIWVkZ2UuaXNJbnRlckdyYXBoKSB7XG4gICAgICB0aHJvdyBcIk5vdCBhbiBpbnRlci1ncmFwaCBlZGdlIVwiO1xuICAgIH1cbiAgICBpZiAoIShlZGdlLnNvdXJjZSAhPSBudWxsICYmIGVkZ2UudGFyZ2V0ICE9IG51bGwpKSB7XG4gICAgICB0aHJvdyBcIlNvdXJjZSBhbmQvb3IgdGFyZ2V0IGlzIG51bGwhXCI7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGVkZ2UgZnJvbSBzb3VyY2UgYW5kIHRhcmdldCBub2RlcycgaW5jaWRlbmN5IGxpc3RzXG5cbiAgICBpZiAoIShlZGdlLnNvdXJjZS5lZGdlcy5pbmRleE9mKGVkZ2UpICE9IC0xICYmIGVkZ2UudGFyZ2V0LmVkZ2VzLmluZGV4T2YoZWRnZSkgIT0gLTEpKSB7XG4gICAgICB0aHJvdyBcIlNvdXJjZSBhbmQvb3IgdGFyZ2V0IGRvZXNuJ3Qga25vdyB0aGlzIGVkZ2UhXCI7XG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0gZWRnZS5zb3VyY2UuZWRnZXMuaW5kZXhPZihlZGdlKTtcbiAgICBlZGdlLnNvdXJjZS5lZGdlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGluZGV4ID0gZWRnZS50YXJnZXQuZWRnZXMuaW5kZXhPZihlZGdlKTtcbiAgICBlZGdlLnRhcmdldC5lZGdlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgLy8gcmVtb3ZlIGVkZ2UgZnJvbSBvd25lciBncmFwaCBtYW5hZ2VyJ3MgaW50ZXItZ3JhcGggZWRnZSBsaXN0XG5cbiAgICBpZiAoIShlZGdlLnNvdXJjZS5vd25lciAhPSBudWxsICYmIGVkZ2Uuc291cmNlLm93bmVyLmdldEdyYXBoTWFuYWdlcigpICE9IG51bGwpKSB7XG4gICAgICB0aHJvdyBcIkVkZ2Ugb3duZXIgZ3JhcGggb3Igb3duZXIgZ3JhcGggbWFuYWdlciBpcyBudWxsIVwiO1xuICAgIH1cbiAgICBpZiAoZWRnZS5zb3VyY2Uub3duZXIuZ2V0R3JhcGhNYW5hZ2VyKCkuZWRnZXMuaW5kZXhPZihlZGdlKSA9PSAtMSkge1xuICAgICAgdGhyb3cgXCJOb3QgaW4gb3duZXIgZ3JhcGggbWFuYWdlcidzIGVkZ2UgbGlzdCFcIjtcbiAgICB9XG5cbiAgICB2YXIgaW5kZXggPSBlZGdlLnNvdXJjZS5vd25lci5nZXRHcmFwaE1hbmFnZXIoKS5lZGdlcy5pbmRleE9mKGVkZ2UpO1xuICAgIGVkZ2Uuc291cmNlLm93bmVyLmdldEdyYXBoTWFuYWdlcigpLmVkZ2VzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZUJvdW5kcyA9IGZ1bmN0aW9uICgpXG57XG4gIHRoaXMucm9vdEdyYXBoLnVwZGF0ZUJvdW5kcyh0cnVlKTtcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLmdldEdyYXBocyA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLmdyYXBocztcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLmdldEFsbE5vZGVzID0gZnVuY3Rpb24gKClcbntcbiAgaWYgKHRoaXMuYWxsTm9kZXMgPT0gbnVsbClcbiAge1xuICAgIHZhciBub2RlTGlzdCA9IFtdO1xuICAgIHZhciBncmFwaHMgPSB0aGlzLmdldEdyYXBocygpO1xuICAgIHZhciBzID0gZ3JhcGhzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKylcbiAgICB7XG4gICAgICBub2RlTGlzdCA9IG5vZGVMaXN0LmNvbmNhdChncmFwaHNbaV0uZ2V0Tm9kZXMoKSk7XG4gICAgfVxuICAgIHRoaXMuYWxsTm9kZXMgPSBub2RlTGlzdDtcbiAgfVxuICByZXR1cm4gdGhpcy5hbGxOb2Rlcztcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLnJlc2V0QWxsTm9kZXMgPSBmdW5jdGlvbiAoKVxue1xuICB0aGlzLmFsbE5vZGVzID0gbnVsbDtcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLnJlc2V0QWxsRWRnZXMgPSBmdW5jdGlvbiAoKVxue1xuICB0aGlzLmFsbEVkZ2VzID0gbnVsbDtcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLnJlc2V0QWxsTm9kZXNUb0FwcGx5R3Jhdml0YXRpb24gPSBmdW5jdGlvbiAoKVxue1xuICB0aGlzLmFsbE5vZGVzVG9BcHBseUdyYXZpdGF0aW9uID0gbnVsbDtcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLmdldEFsbEVkZ2VzID0gZnVuY3Rpb24gKClcbntcbiAgaWYgKHRoaXMuYWxsRWRnZXMgPT0gbnVsbClcbiAge1xuICAgIHZhciBlZGdlTGlzdCA9IFtdO1xuICAgIHZhciBncmFwaHMgPSB0aGlzLmdldEdyYXBocygpO1xuICAgIHZhciBzID0gZ3JhcGhzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyYXBocy5sZW5ndGg7IGkrKylcbiAgICB7XG4gICAgICBlZGdlTGlzdCA9IGVkZ2VMaXN0LmNvbmNhdChncmFwaHNbaV0uZ2V0RWRnZXMoKSk7XG4gICAgfVxuXG4gICAgZWRnZUxpc3QgPSBlZGdlTGlzdC5jb25jYXQodGhpcy5lZGdlcyk7XG5cbiAgICB0aGlzLmFsbEVkZ2VzID0gZWRnZUxpc3Q7XG4gIH1cbiAgcmV0dXJuIHRoaXMuYWxsRWRnZXM7XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5nZXRBbGxOb2Rlc1RvQXBwbHlHcmF2aXRhdGlvbiA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLmFsbE5vZGVzVG9BcHBseUdyYXZpdGF0aW9uO1xufTtcblxuTEdyYXBoTWFuYWdlci5wcm90b3R5cGUuc2V0QWxsTm9kZXNUb0FwcGx5R3Jhdml0YXRpb24gPSBmdW5jdGlvbiAobm9kZUxpc3QpXG57XG4gIGlmICh0aGlzLmFsbE5vZGVzVG9BcHBseUdyYXZpdGF0aW9uICE9IG51bGwpIHtcbiAgICB0aHJvdyBcImFzc2VydCBmYWlsZWRcIjtcbiAgfVxuXG4gIHRoaXMuYWxsTm9kZXNUb0FwcGx5R3Jhdml0YXRpb24gPSBub2RlTGlzdDtcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLmdldFJvb3QgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy5yb290R3JhcGg7XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5zZXRSb290R3JhcGggPSBmdW5jdGlvbiAoZ3JhcGgpXG57XG4gIGlmIChncmFwaC5nZXRHcmFwaE1hbmFnZXIoKSAhPSB0aGlzKSB7XG4gICAgdGhyb3cgXCJSb290IG5vdCBpbiB0aGlzIGdyYXBoIG1nciFcIjtcbiAgfVxuXG4gIHRoaXMucm9vdEdyYXBoID0gZ3JhcGg7XG4gIC8vIHJvb3QgZ3JhcGggbXVzdCBoYXZlIGEgcm9vdCBub2RlIGFzc29jaWF0ZWQgd2l0aCBpdCBmb3IgY29udmVuaWVuY2VcbiAgaWYgKGdyYXBoLnBhcmVudCA9PSBudWxsKVxuICB7XG4gICAgZ3JhcGgucGFyZW50ID0gdGhpcy5sYXlvdXQubmV3Tm9kZShcIlJvb3Qgbm9kZVwiKTtcbiAgfVxufTtcblxuTEdyYXBoTWFuYWdlci5wcm90b3R5cGUuZ2V0TGF5b3V0ID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMubGF5b3V0O1xufTtcblxuTEdyYXBoTWFuYWdlci5wcm90b3R5cGUuaXNPbmVBbmNlc3Rvck9mT3RoZXIgPSBmdW5jdGlvbiAoZmlyc3ROb2RlLCBzZWNvbmROb2RlKVxue1xuICBpZiAoIShmaXJzdE5vZGUgIT0gbnVsbCAmJiBzZWNvbmROb2RlICE9IG51bGwpKSB7XG4gICAgdGhyb3cgXCJhc3NlcnQgZmFpbGVkXCI7XG4gIH1cblxuICBpZiAoZmlyc3ROb2RlID09IHNlY29uZE5vZGUpXG4gIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICAvLyBJcyBzZWNvbmQgbm9kZSBhbiBhbmNlc3RvciBvZiB0aGUgZmlyc3Qgb25lP1xuICB2YXIgb3duZXJHcmFwaCA9IGZpcnN0Tm9kZS5nZXRPd25lcigpO1xuICB2YXIgcGFyZW50Tm9kZTtcblxuICBkb1xuICB7XG4gICAgcGFyZW50Tm9kZSA9IG93bmVyR3JhcGguZ2V0UGFyZW50KCk7XG5cbiAgICBpZiAocGFyZW50Tm9kZSA9PSBudWxsKVxuICAgIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChwYXJlbnROb2RlID09IHNlY29uZE5vZGUpXG4gICAge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgb3duZXJHcmFwaCA9IHBhcmVudE5vZGUuZ2V0T3duZXIoKTtcbiAgICBpZiAob3duZXJHcmFwaCA9PSBudWxsKVxuICAgIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSB3aGlsZSAodHJ1ZSk7XG4gIC8vIElzIGZpcnN0IG5vZGUgYW4gYW5jZXN0b3Igb2YgdGhlIHNlY29uZCBvbmU/XG4gIG93bmVyR3JhcGggPSBzZWNvbmROb2RlLmdldE93bmVyKCk7XG5cbiAgZG9cbiAge1xuICAgIHBhcmVudE5vZGUgPSBvd25lckdyYXBoLmdldFBhcmVudCgpO1xuXG4gICAgaWYgKHBhcmVudE5vZGUgPT0gbnVsbClcbiAgICB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAocGFyZW50Tm9kZSA9PSBmaXJzdE5vZGUpXG4gICAge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgb3duZXJHcmFwaCA9IHBhcmVudE5vZGUuZ2V0T3duZXIoKTtcbiAgICBpZiAob3duZXJHcmFwaCA9PSBudWxsKVxuICAgIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSB3aGlsZSAodHJ1ZSk7XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuTEdyYXBoTWFuYWdlci5wcm90b3R5cGUuY2FsY0xvd2VzdENvbW1vbkFuY2VzdG9ycyA9IGZ1bmN0aW9uICgpXG57XG4gIHZhciBlZGdlO1xuICB2YXIgc291cmNlTm9kZTtcbiAgdmFyIHRhcmdldE5vZGU7XG4gIHZhciBzb3VyY2VBbmNlc3RvckdyYXBoO1xuICB2YXIgdGFyZ2V0QW5jZXN0b3JHcmFwaDtcblxuICB2YXIgZWRnZXMgPSB0aGlzLmdldEFsbEVkZ2VzKCk7XG4gIHZhciBzID0gZWRnZXMubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKylcbiAge1xuICAgIGVkZ2UgPSBlZGdlc1tpXTtcblxuICAgIHNvdXJjZU5vZGUgPSBlZGdlLnNvdXJjZTtcbiAgICB0YXJnZXROb2RlID0gZWRnZS50YXJnZXQ7XG4gICAgZWRnZS5sY2EgPSBudWxsO1xuICAgIGVkZ2Uuc291cmNlSW5MY2EgPSBzb3VyY2VOb2RlO1xuICAgIGVkZ2UudGFyZ2V0SW5MY2EgPSB0YXJnZXROb2RlO1xuXG4gICAgaWYgKHNvdXJjZU5vZGUgPT0gdGFyZ2V0Tm9kZSlcbiAgICB7XG4gICAgICBlZGdlLmxjYSA9IHNvdXJjZU5vZGUuZ2V0T3duZXIoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHNvdXJjZUFuY2VzdG9yR3JhcGggPSBzb3VyY2VOb2RlLmdldE93bmVyKCk7XG5cbiAgICB3aGlsZSAoZWRnZS5sY2EgPT0gbnVsbClcbiAgICB7XG4gICAgICB0YXJnZXRBbmNlc3RvckdyYXBoID0gdGFyZ2V0Tm9kZS5nZXRPd25lcigpO1xuXG4gICAgICB3aGlsZSAoZWRnZS5sY2EgPT0gbnVsbClcbiAgICAgIHtcbiAgICAgICAgaWYgKHRhcmdldEFuY2VzdG9yR3JhcGggPT0gc291cmNlQW5jZXN0b3JHcmFwaClcbiAgICAgICAge1xuICAgICAgICAgIGVkZ2UubGNhID0gdGFyZ2V0QW5jZXN0b3JHcmFwaDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXJnZXRBbmNlc3RvckdyYXBoID09IHRoaXMucm9vdEdyYXBoKVxuICAgICAgICB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWRnZS5sY2EgIT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IFwiYXNzZXJ0IGZhaWxlZFwiO1xuICAgICAgICB9XG4gICAgICAgIGVkZ2UudGFyZ2V0SW5MY2EgPSB0YXJnZXRBbmNlc3RvckdyYXBoLmdldFBhcmVudCgpO1xuICAgICAgICB0YXJnZXRBbmNlc3RvckdyYXBoID0gZWRnZS50YXJnZXRJbkxjYS5nZXRPd25lcigpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc291cmNlQW5jZXN0b3JHcmFwaCA9PSB0aGlzLnJvb3RHcmFwaClcbiAgICAgIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmIChlZGdlLmxjYSA9PSBudWxsKVxuICAgICAge1xuICAgICAgICBlZGdlLnNvdXJjZUluTGNhID0gc291cmNlQW5jZXN0b3JHcmFwaC5nZXRQYXJlbnQoKTtcbiAgICAgICAgc291cmNlQW5jZXN0b3JHcmFwaCA9IGVkZ2Uuc291cmNlSW5MY2EuZ2V0T3duZXIoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZWRnZS5sY2EgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgXCJhc3NlcnQgZmFpbGVkXCI7XG4gICAgfVxuICB9XG59O1xuXG5MR3JhcGhNYW5hZ2VyLnByb3RvdHlwZS5jYWxjTG93ZXN0Q29tbW9uQW5jZXN0b3IgPSBmdW5jdGlvbiAoZmlyc3ROb2RlLCBzZWNvbmROb2RlKVxue1xuICBpZiAoZmlyc3ROb2RlID09IHNlY29uZE5vZGUpXG4gIHtcbiAgICByZXR1cm4gZmlyc3ROb2RlLmdldE93bmVyKCk7XG4gIH1cbiAgdmFyIGZpcnN0T3duZXJHcmFwaCA9IGZpcnN0Tm9kZS5nZXRPd25lcigpO1xuXG4gIGRvXG4gIHtcbiAgICBpZiAoZmlyc3RPd25lckdyYXBoID09IG51bGwpXG4gICAge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHZhciBzZWNvbmRPd25lckdyYXBoID0gc2Vjb25kTm9kZS5nZXRPd25lcigpO1xuXG4gICAgZG9cbiAgICB7XG4gICAgICBpZiAoc2Vjb25kT3duZXJHcmFwaCA9PSBudWxsKVxuICAgICAge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKHNlY29uZE93bmVyR3JhcGggPT0gZmlyc3RPd25lckdyYXBoKVxuICAgICAge1xuICAgICAgICByZXR1cm4gc2Vjb25kT3duZXJHcmFwaDtcbiAgICAgIH1cbiAgICAgIHNlY29uZE93bmVyR3JhcGggPSBzZWNvbmRPd25lckdyYXBoLmdldFBhcmVudCgpLmdldE93bmVyKCk7XG4gICAgfSB3aGlsZSAodHJ1ZSk7XG5cbiAgICBmaXJzdE93bmVyR3JhcGggPSBmaXJzdE93bmVyR3JhcGguZ2V0UGFyZW50KCkuZ2V0T3duZXIoKTtcbiAgfSB3aGlsZSAodHJ1ZSk7XG5cbiAgcmV0dXJuIGZpcnN0T3duZXJHcmFwaDtcbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLmNhbGNJbmNsdXNpb25UcmVlRGVwdGhzID0gZnVuY3Rpb24gKGdyYXBoLCBkZXB0aCkge1xuICBpZiAoZ3JhcGggPT0gbnVsbCAmJiBkZXB0aCA9PSBudWxsKSB7XG4gICAgZ3JhcGggPSB0aGlzLnJvb3RHcmFwaDtcbiAgICBkZXB0aCA9IDE7XG4gIH1cbiAgdmFyIG5vZGU7XG5cbiAgdmFyIG5vZGVzID0gZ3JhcGguZ2V0Tm9kZXMoKTtcbiAgdmFyIHMgPSBub2Rlcy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKVxuICB7XG4gICAgbm9kZSA9IG5vZGVzW2ldO1xuICAgIG5vZGUuaW5jbHVzaW9uVHJlZURlcHRoID0gZGVwdGg7XG5cbiAgICBpZiAobm9kZS5jaGlsZCAhPSBudWxsKVxuICAgIHtcbiAgICAgIHRoaXMuY2FsY0luY2x1c2lvblRyZWVEZXB0aHMobm9kZS5jaGlsZCwgZGVwdGggKyAxKTtcbiAgICB9XG4gIH1cbn07XG5cbkxHcmFwaE1hbmFnZXIucHJvdG90eXBlLmluY2x1ZGVzSW52YWxpZEVkZ2UgPSBmdW5jdGlvbiAoKVxue1xuICB2YXIgZWRnZTtcblxuICB2YXIgcyA9IHRoaXMuZWRnZXMubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKylcbiAge1xuICAgIGVkZ2UgPSB0aGlzLmVkZ2VzW2ldO1xuXG4gICAgaWYgKHRoaXMuaXNPbmVBbmNlc3Rvck9mT3RoZXIoZWRnZS5zb3VyY2UsIGVkZ2UudGFyZ2V0KSlcbiAgICB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMR3JhcGhNYW5hZ2VyO1xuIiwiZnVuY3Rpb24gTEdyYXBoT2JqZWN0KHZHcmFwaE9iamVjdCkge1xuICB0aGlzLnZHcmFwaE9iamVjdCA9IHZHcmFwaE9iamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMR3JhcGhPYmplY3Q7XG4iLCJ2YXIgTEdyYXBoT2JqZWN0ID0gcmVxdWlyZSgnLi9MR3JhcGhPYmplY3QnKTtcbnZhciBJbnRlZ2VyID0gcmVxdWlyZSgnLi9JbnRlZ2VyJyk7XG52YXIgUmVjdGFuZ2xlRCA9IHJlcXVpcmUoJy4vUmVjdGFuZ2xlRCcpO1xuXG5mdW5jdGlvbiBMTm9kZShnbSwgbG9jLCBzaXplLCB2Tm9kZSkge1xuICAvL0FsdGVybmF0aXZlIGNvbnN0cnVjdG9yIDEgOiBMTm9kZShMR3JhcGhNYW5hZ2VyIGdtLCBQb2ludCBsb2MsIERpbWVuc2lvbiBzaXplLCBPYmplY3Qgdk5vZGUpXG4gIGlmIChzaXplID09IG51bGwgJiYgdk5vZGUgPT0gbnVsbCkge1xuICAgIHZOb2RlID0gbG9jO1xuICB9XG5cbiAgTEdyYXBoT2JqZWN0LmNhbGwodGhpcywgdk5vZGUpO1xuXG4gIC8vQWx0ZXJuYXRpdmUgY29uc3RydWN0b3IgMiA6IExOb2RlKExheW91dCBsYXlvdXQsIE9iamVjdCB2Tm9kZSlcbiAgaWYgKGdtLmdyYXBoTWFuYWdlciAhPSBudWxsKVxuICAgIGdtID0gZ20uZ3JhcGhNYW5hZ2VyO1xuXG4gIHRoaXMuZXN0aW1hdGVkU2l6ZSA9IEludGVnZXIuTUlOX1ZBTFVFO1xuICB0aGlzLmluY2x1c2lvblRyZWVEZXB0aCA9IEludGVnZXIuTUFYX1ZBTFVFO1xuICB0aGlzLnZHcmFwaE9iamVjdCA9IHZOb2RlO1xuICB0aGlzLmVkZ2VzID0gW107XG4gIHRoaXMuZ3JhcGhNYW5hZ2VyID0gZ207XG5cbiAgaWYgKHNpemUgIT0gbnVsbCAmJiBsb2MgIT0gbnVsbClcbiAgICB0aGlzLnJlY3QgPSBuZXcgUmVjdGFuZ2xlRChsb2MueCwgbG9jLnksIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcbiAgZWxzZVxuICAgIHRoaXMucmVjdCA9IG5ldyBSZWN0YW5nbGVEKCk7XG59XG5cbkxOb2RlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTEdyYXBoT2JqZWN0LnByb3RvdHlwZSk7XG5mb3IgKHZhciBwcm9wIGluIExHcmFwaE9iamVjdCkge1xuICBMTm9kZVtwcm9wXSA9IExHcmFwaE9iamVjdFtwcm9wXTtcbn1cblxuTE5vZGUucHJvdG90eXBlLmdldEVkZ2VzID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMuZWRnZXM7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0Q2hpbGQgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy5jaGlsZDtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRPd25lciA9IGZ1bmN0aW9uICgpXG57XG4gIGlmICh0aGlzLm93bmVyICE9IG51bGwpIHtcbiAgICBpZiAoISh0aGlzLm93bmVyID09IG51bGwgfHwgdGhpcy5vd25lci5nZXROb2RlcygpLmluZGV4T2YodGhpcykgPiAtMSkpIHtcbiAgICAgIHRocm93IFwiYXNzZXJ0IGZhaWxlZFwiO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzLm93bmVyO1xufTtcblxuTE5vZGUucHJvdG90eXBlLmdldFdpZHRoID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMucmVjdC53aWR0aDtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5zZXRXaWR0aCA9IGZ1bmN0aW9uICh3aWR0aClcbntcbiAgdGhpcy5yZWN0LndpZHRoID0gd2lkdGg7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMucmVjdC5oZWlnaHQ7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24gKGhlaWdodClcbntcbiAgdGhpcy5yZWN0LmhlaWdodCA9IGhlaWdodDtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRDZW50ZXJYID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMucmVjdC54ICsgdGhpcy5yZWN0LndpZHRoIC8gMjtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRDZW50ZXJZID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMucmVjdC55ICsgdGhpcy5yZWN0LmhlaWdodCAvIDI7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0Q2VudGVyID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIG5ldyBQb2ludEQodGhpcy5yZWN0LnggKyB0aGlzLnJlY3Qud2lkdGggLyAyLFxuICAgICAgICAgIHRoaXMucmVjdC55ICsgdGhpcy5yZWN0LmhlaWdodCAvIDIpO1xufTtcblxuTE5vZGUucHJvdG90eXBlLmdldExvY2F0aW9uID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIG5ldyBQb2ludEQodGhpcy5yZWN0LngsIHRoaXMucmVjdC55KTtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRSZWN0ID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMucmVjdDtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXREaWFnb25hbCA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiBNYXRoLnNxcnQodGhpcy5yZWN0LndpZHRoICogdGhpcy5yZWN0LndpZHRoICtcbiAgICAgICAgICB0aGlzLnJlY3QuaGVpZ2h0ICogdGhpcy5yZWN0LmhlaWdodCk7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuc2V0UmVjdCA9IGZ1bmN0aW9uICh1cHBlckxlZnQsIGRpbWVuc2lvbilcbntcbiAgdGhpcy5yZWN0LnggPSB1cHBlckxlZnQueDtcbiAgdGhpcy5yZWN0LnkgPSB1cHBlckxlZnQueTtcbiAgdGhpcy5yZWN0LndpZHRoID0gZGltZW5zaW9uLndpZHRoO1xuICB0aGlzLnJlY3QuaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodDtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbiAoY3gsIGN5KVxue1xuICB0aGlzLnJlY3QueCA9IGN4IC0gdGhpcy5yZWN0LndpZHRoIC8gMjtcbiAgdGhpcy5yZWN0LnkgPSBjeSAtIHRoaXMucmVjdC5oZWlnaHQgLyAyO1xufTtcblxuTE5vZGUucHJvdG90eXBlLnNldExvY2F0aW9uID0gZnVuY3Rpb24gKHgsIHkpXG57XG4gIHRoaXMucmVjdC54ID0geDtcbiAgdGhpcy5yZWN0LnkgPSB5O1xufTtcblxuTE5vZGUucHJvdG90eXBlLm1vdmVCeSA9IGZ1bmN0aW9uIChkeCwgZHkpXG57XG4gIHRoaXMucmVjdC54ICs9IGR4O1xuICB0aGlzLnJlY3QueSArPSBkeTtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRFZGdlTGlzdFRvTm9kZSA9IGZ1bmN0aW9uICh0bylcbntcbiAgdmFyIGVkZ2VMaXN0ID0gW107XG4gIHZhciBlZGdlO1xuXG4gIGZvciAodmFyIG9iaiBpbiB0aGlzLmVkZ2VzKVxuICB7XG4gICAgZWRnZSA9IG9iajtcblxuICAgIGlmIChlZGdlLnRhcmdldCA9PSB0bylcbiAgICB7XG4gICAgICBpZiAoZWRnZS5zb3VyY2UgIT0gdGhpcylcbiAgICAgICAgdGhyb3cgXCJJbmNvcnJlY3QgZWRnZSBzb3VyY2UhXCI7XG5cbiAgICAgIGVkZ2VMaXN0LnB1c2goZWRnZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVkZ2VMaXN0O1xufTtcblxuTE5vZGUucHJvdG90eXBlLmdldEVkZ2VzQmV0d2VlbiA9IGZ1bmN0aW9uIChvdGhlcilcbntcbiAgdmFyIGVkZ2VMaXN0ID0gW107XG4gIHZhciBlZGdlO1xuXG4gIGZvciAodmFyIG9iaiBpbiB0aGlzLmVkZ2VzKVxuICB7XG4gICAgZWRnZSA9IHRoaXMuZWRnZXNbb2JqXTtcblxuICAgIGlmICghKGVkZ2Uuc291cmNlID09IHRoaXMgfHwgZWRnZS50YXJnZXQgPT0gdGhpcykpXG4gICAgICB0aHJvdyBcIkluY29ycmVjdCBlZGdlIHNvdXJjZSBhbmQvb3IgdGFyZ2V0XCI7XG5cbiAgICBpZiAoKGVkZ2UudGFyZ2V0ID09IG90aGVyKSB8fCAoZWRnZS5zb3VyY2UgPT0gb3RoZXIpKVxuICAgIHtcbiAgICAgIGVkZ2VMaXN0LnB1c2goZWRnZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVkZ2VMaXN0O1xufTtcblxuTE5vZGUucHJvdG90eXBlLmdldE5laWdoYm9yc0xpc3QgPSBmdW5jdGlvbiAoKVxue1xuICB2YXIgbmVpZ2hib3JzID0gbmV3IEhhc2hTZXQoKTtcbiAgdmFyIGVkZ2U7XG5cbiAgZm9yICh2YXIgb2JqIGluIHRoaXMuZWRnZXMpXG4gIHtcbiAgICBlZGdlID0gdGhpcy5lZGdlc1tvYmpdO1xuXG4gICAgaWYgKGVkZ2Uuc291cmNlID09IHRoaXMpXG4gICAge1xuICAgICAgbmVpZ2hib3JzLmFkZChlZGdlLnRhcmdldCk7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICBpZiAoIWVkZ2UudGFyZ2V0ID09IHRoaXMpXG4gICAgICAgIHRocm93IFwiSW5jb3JyZWN0IGluY2lkZW5jeSFcIjtcbiAgICAgIG5laWdoYm9ycy5hZGQoZWRnZS5zb3VyY2UpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZWlnaGJvcnM7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUud2l0aENoaWxkcmVuID0gZnVuY3Rpb24gKClcbntcbiAgdmFyIHdpdGhOZWlnaGJvcnNMaXN0ID0gW107XG4gIHZhciBjaGlsZE5vZGU7XG5cbiAgd2l0aE5laWdoYm9yc0xpc3QucHVzaCh0aGlzKTtcblxuICBpZiAodGhpcy5jaGlsZCAhPSBudWxsKVxuICB7XG4gICAgdmFyIG5vZGVzID0gdGhpcy5jaGlsZC5nZXROb2RlcygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspXG4gICAge1xuICAgICAgY2hpbGROb2RlID0gbm9kZXNbaV07XG5cbiAgICAgIHdpdGhOZWlnaGJvcnNMaXN0ID0gd2l0aE5laWdoYm9yc0xpc3QuY29uY2F0KGNoaWxkTm9kZS53aXRoQ2hpbGRyZW4oKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHdpdGhOZWlnaGJvcnNMaXN0O1xufTtcblxuTE5vZGUucHJvdG90eXBlLmdldEVzdGltYXRlZFNpemUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmVzdGltYXRlZFNpemUgPT0gSW50ZWdlci5NSU5fVkFMVUUpIHtcbiAgICB0aHJvdyBcImFzc2VydCBmYWlsZWRcIjtcbiAgfVxuICByZXR1cm4gdGhpcy5lc3RpbWF0ZWRTaXplO1xufTtcblxuTE5vZGUucHJvdG90eXBlLmNhbGNFc3RpbWF0ZWRTaXplID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5jaGlsZCA9PSBudWxsKVxuICB7XG4gICAgcmV0dXJuIHRoaXMuZXN0aW1hdGVkU2l6ZSA9IE1hdGguZmxvb3IoKHRoaXMucmVjdC53aWR0aCArIHRoaXMucmVjdC5oZWlnaHQpIC8gMik7XG4gIH1cbiAgZWxzZVxuICB7XG4gICAgdGhpcy5lc3RpbWF0ZWRTaXplID0gdGhpcy5jaGlsZC5jYWxjRXN0aW1hdGVkU2l6ZSgpO1xuICAgIHRoaXMucmVjdC53aWR0aCA9IHRoaXMuZXN0aW1hdGVkU2l6ZTtcbiAgICB0aGlzLnJlY3QuaGVpZ2h0ID0gdGhpcy5lc3RpbWF0ZWRTaXplO1xuXG4gICAgcmV0dXJuIHRoaXMuZXN0aW1hdGVkU2l6ZTtcbiAgfVxufTtcblxuTE5vZGUucHJvdG90eXBlLnNjYXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciByYW5kb21DZW50ZXJYO1xuICB2YXIgcmFuZG9tQ2VudGVyWTtcblxuICB2YXIgbWluWCA9IC1MYXlvdXRDb25zdGFudHMuSU5JVElBTF9XT1JMRF9CT1VOREFSWTtcbiAgdmFyIG1heFggPSBMYXlvdXRDb25zdGFudHMuSU5JVElBTF9XT1JMRF9CT1VOREFSWTtcbiAgcmFuZG9tQ2VudGVyWCA9IExheW91dENvbnN0YW50cy5XT1JMRF9DRU5URVJfWCArXG4gICAgICAgICAgKFJhbmRvbVNlZWQubmV4dERvdWJsZSgpICogKG1heFggLSBtaW5YKSkgKyBtaW5YO1xuXG4gIHZhciBtaW5ZID0gLUxheW91dENvbnN0YW50cy5JTklUSUFMX1dPUkxEX0JPVU5EQVJZO1xuICB2YXIgbWF4WSA9IExheW91dENvbnN0YW50cy5JTklUSUFMX1dPUkxEX0JPVU5EQVJZO1xuICByYW5kb21DZW50ZXJZID0gTGF5b3V0Q29uc3RhbnRzLldPUkxEX0NFTlRFUl9ZICtcbiAgICAgICAgICAoUmFuZG9tU2VlZC5uZXh0RG91YmxlKCkgKiAobWF4WSAtIG1pblkpKSArIG1pblk7XG5cbiAgdGhpcy5yZWN0LnggPSByYW5kb21DZW50ZXJYO1xuICB0aGlzLnJlY3QueSA9IHJhbmRvbUNlbnRlcllcbn07XG5cbkxOb2RlLnByb3RvdHlwZS51cGRhdGVCb3VuZHMgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmdldENoaWxkKCkgPT0gbnVsbCkge1xuICAgIHRocm93IFwiYXNzZXJ0IGZhaWxlZFwiO1xuICB9XG4gIGlmICh0aGlzLmdldENoaWxkKCkuZ2V0Tm9kZXMoKS5sZW5ndGggIT0gMClcbiAge1xuICAgIC8vIHdyYXAgdGhlIGNoaWxkcmVuIG5vZGVzIGJ5IHJlLWFycmFuZ2luZyB0aGUgYm91bmRhcmllc1xuICAgIHZhciBjaGlsZEdyYXBoID0gdGhpcy5nZXRDaGlsZCgpO1xuICAgIGNoaWxkR3JhcGgudXBkYXRlQm91bmRzKHRydWUpO1xuXG4gICAgdGhpcy5yZWN0LnggPSBjaGlsZEdyYXBoLmdldExlZnQoKTtcbiAgICB0aGlzLnJlY3QueSA9IGNoaWxkR3JhcGguZ2V0VG9wKCk7XG5cbiAgICB0aGlzLnNldFdpZHRoKGNoaWxkR3JhcGguZ2V0UmlnaHQoKSAtIGNoaWxkR3JhcGguZ2V0TGVmdCgpICtcbiAgICAgICAgICAgIDIgKiBMYXlvdXRDb25zdGFudHMuQ09NUE9VTkRfTk9ERV9NQVJHSU4pO1xuICAgIHRoaXMuc2V0SGVpZ2h0KGNoaWxkR3JhcGguZ2V0Qm90dG9tKCkgLSBjaGlsZEdyYXBoLmdldFRvcCgpICtcbiAgICAgICAgICAgIDIgKiBMYXlvdXRDb25zdGFudHMuQ09NUE9VTkRfTk9ERV9NQVJHSU4gK1xuICAgICAgICAgICAgTGF5b3V0Q29uc3RhbnRzLkxBQkVMX0hFSUdIVCk7XG4gIH1cbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRJbmNsdXNpb25UcmVlRGVwdGggPSBmdW5jdGlvbiAoKVxue1xuICBpZiAodGhpcy5pbmNsdXNpb25UcmVlRGVwdGggPT0gSW50ZWdlci5NQVhfVkFMVUUpIHtcbiAgICB0aHJvdyBcImFzc2VydCBmYWlsZWRcIjtcbiAgfVxuICByZXR1cm4gdGhpcy5pbmNsdXNpb25UcmVlRGVwdGg7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUudHJhbnNmb3JtID0gZnVuY3Rpb24gKHRyYW5zKVxue1xuICB2YXIgbGVmdCA9IHRoaXMucmVjdC54O1xuXG4gIGlmIChsZWZ0ID4gTGF5b3V0Q29uc3RhbnRzLldPUkxEX0JPVU5EQVJZKVxuICB7XG4gICAgbGVmdCA9IExheW91dENvbnN0YW50cy5XT1JMRF9CT1VOREFSWTtcbiAgfVxuICBlbHNlIGlmIChsZWZ0IDwgLUxheW91dENvbnN0YW50cy5XT1JMRF9CT1VOREFSWSlcbiAge1xuICAgIGxlZnQgPSAtTGF5b3V0Q29uc3RhbnRzLldPUkxEX0JPVU5EQVJZO1xuICB9XG5cbiAgdmFyIHRvcCA9IHRoaXMucmVjdC55O1xuXG4gIGlmICh0b3AgPiBMYXlvdXRDb25zdGFudHMuV09STERfQk9VTkRBUlkpXG4gIHtcbiAgICB0b3AgPSBMYXlvdXRDb25zdGFudHMuV09STERfQk9VTkRBUlk7XG4gIH1cbiAgZWxzZSBpZiAodG9wIDwgLUxheW91dENvbnN0YW50cy5XT1JMRF9CT1VOREFSWSlcbiAge1xuICAgIHRvcCA9IC1MYXlvdXRDb25zdGFudHMuV09STERfQk9VTkRBUlk7XG4gIH1cblxuICB2YXIgbGVmdFRvcCA9IG5ldyBQb2ludEQobGVmdCwgdG9wKTtcbiAgdmFyIHZMZWZ0VG9wID0gdHJhbnMuaW52ZXJzZVRyYW5zZm9ybVBvaW50KGxlZnRUb3ApO1xuXG4gIHRoaXMuc2V0TG9jYXRpb24odkxlZnRUb3AueCwgdkxlZnRUb3AueSk7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0TGVmdCA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLnJlY3QueDtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRSaWdodCA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLnJlY3QueCArIHRoaXMucmVjdC53aWR0aDtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRUb3AgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy5yZWN0Lnk7XG59O1xuXG5MTm9kZS5wcm90b3R5cGUuZ2V0Qm90dG9tID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMucmVjdC55ICsgdGhpcy5yZWN0LmhlaWdodDtcbn07XG5cbkxOb2RlLnByb3RvdHlwZS5nZXRQYXJlbnQgPSBmdW5jdGlvbiAoKVxue1xuICBpZiAodGhpcy5vd25lciA9PSBudWxsKVxuICB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gdGhpcy5vd25lci5nZXRQYXJlbnQoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTE5vZGU7XG4iLCJ2YXIgTGF5b3V0Q29uc3RhbnRzID0gcmVxdWlyZSgnLi9MYXlvdXRDb25zdGFudHMnKTtcbnZhciBIYXNoTWFwID0gcmVxdWlyZSgnLi9IYXNoTWFwJyk7XG52YXIgTEdyYXBoTWFuYWdlciA9IHJlcXVpcmUoJy4vTEdyYXBoTWFuYWdlcicpO1xuXG5mdW5jdGlvbiBMYXlvdXQoaXNSZW1vdGVVc2UpIHtcbiAgLy9MYXlvdXQgUXVhbGl0eTogMDpwcm9vZiwgMTpkZWZhdWx0LCAyOmRyYWZ0XG4gIHRoaXMubGF5b3V0UXVhbGl0eSA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX1FVQUxJVFk7XG4gIC8vV2hldGhlciBsYXlvdXQgc2hvdWxkIGNyZWF0ZSBiZW5kcG9pbnRzIGFzIG5lZWRlZCBvciBub3RcbiAgdGhpcy5jcmVhdGVCZW5kc0FzTmVlZGVkID1cbiAgICAgICAgICBMYXlvdXRDb25zdGFudHMuREVGQVVMVF9DUkVBVEVfQkVORFNfQVNfTkVFREVEO1xuICAvL1doZXRoZXIgbGF5b3V0IHNob3VsZCBiZSBpbmNyZW1lbnRhbCBvciBub3RcbiAgdGhpcy5pbmNyZW1lbnRhbCA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0lOQ1JFTUVOVEFMO1xuICAvL1doZXRoZXIgd2UgYW5pbWF0ZSBmcm9tIGJlZm9yZSB0byBhZnRlciBsYXlvdXQgbm9kZSBwb3NpdGlvbnNcbiAgdGhpcy5hbmltYXRpb25PbkxheW91dCA9XG4gICAgICAgICAgTGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfQU5JTUFUSU9OX09OX0xBWU9VVDtcbiAgLy9XaGV0aGVyIHdlIGFuaW1hdGUgdGhlIGxheW91dCBwcm9jZXNzIG9yIG5vdFxuICB0aGlzLmFuaW1hdGlvbkR1cmluZ0xheW91dCA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0FOSU1BVElPTl9EVVJJTkdfTEFZT1VUO1xuICAvL051bWJlciBpdGVyYXRpb25zIHRoYXQgc2hvdWxkIGJlIGRvbmUgYmV0d2VlbiB0d28gc3VjY2Vzc2l2ZSBhbmltYXRpb25zXG4gIHRoaXMuYW5pbWF0aW9uUGVyaW9kID0gTGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfQU5JTUFUSU9OX1BFUklPRDtcbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IGxlYWYgbm9kZXMgKG5vbi1jb21wb3VuZCBub2RlcykgYXJlIG9mIHVuaWZvcm0gc2l6ZXMuIFdoZW5cbiAgICogdGhleSBhcmUsIGJvdGggc3ByaW5nIGFuZCByZXB1bHNpb24gZm9yY2VzIGJldHdlZW4gdHdvIGxlYWYgbm9kZXMgY2FuIGJlXG4gICAqIGNhbGN1bGF0ZWQgd2l0aG91dCB0aGUgZXhwZW5zaXZlIGNsaXBwaW5nIHBvaW50IGNhbGN1bGF0aW9ucywgcmVzdWx0aW5nXG4gICAqIGluIG1ham9yIHNwZWVkLXVwLlxuICAgKi9cbiAgdGhpcy51bmlmb3JtTGVhZk5vZGVTaXplcyA9XG4gICAgICAgICAgTGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfVU5JRk9STV9MRUFGX05PREVfU0laRVM7XG4gIC8qKlxuICAgKiBUaGlzIGlzIHVzZWQgZm9yIGNyZWF0aW9uIG9mIGJlbmRwb2ludHMgYnkgdXNpbmcgZHVtbXkgbm9kZXMgYW5kIGVkZ2VzLlxuICAgKiBNYXBzIGFuIExFZGdlIHRvIGl0cyBkdW1teSBiZW5kcG9pbnQgcGF0aC5cbiAgICovXG4gIHRoaXMuZWRnZVRvRHVtbXlOb2RlcyA9IG5ldyBIYXNoTWFwKCk7XG4gIHRoaXMuZ3JhcGhNYW5hZ2VyID0gbmV3IExHcmFwaE1hbmFnZXIodGhpcyk7XG4gIHRoaXMuaXNMYXlvdXRGaW5pc2hlZCA9IGZhbHNlO1xuICB0aGlzLmlzU3ViTGF5b3V0ID0gZmFsc2U7XG4gIHRoaXMuaXNSZW1vdGVVc2UgPSBmYWxzZTtcblxuICBpZiAoaXNSZW1vdGVVc2UgIT0gbnVsbCkge1xuICAgIHRoaXMuaXNSZW1vdGVVc2UgPSBpc1JlbW90ZVVzZTtcbiAgfVxufVxuXG5MYXlvdXQuUkFORE9NX1NFRUQgPSAxO1xuXG5MYXlvdXQucHJvdG90eXBlLmdldEdyYXBoTWFuYWdlciA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ3JhcGhNYW5hZ2VyO1xufTtcblxuTGF5b3V0LnByb3RvdHlwZS5nZXRBbGxOb2RlcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ3JhcGhNYW5hZ2VyLmdldEFsbE5vZGVzKCk7XG59O1xuXG5MYXlvdXQucHJvdG90eXBlLmdldEFsbEVkZ2VzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5ncmFwaE1hbmFnZXIuZ2V0QWxsRWRnZXMoKTtcbn07XG5cbkxheW91dC5wcm90b3R5cGUuZ2V0QWxsTm9kZXNUb0FwcGx5R3Jhdml0YXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmdyYXBoTWFuYWdlci5nZXRBbGxOb2Rlc1RvQXBwbHlHcmF2aXRhdGlvbigpO1xufTtcblxuTGF5b3V0LnByb3RvdHlwZS5uZXdHcmFwaE1hbmFnZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBnbSA9IG5ldyBMR3JhcGhNYW5hZ2VyKHRoaXMpO1xuICB0aGlzLmdyYXBoTWFuYWdlciA9IGdtO1xuICByZXR1cm4gZ207XG59O1xuXG5MYXlvdXQucHJvdG90eXBlLm5ld0dyYXBoID0gZnVuY3Rpb24gKHZHcmFwaClcbntcbiAgcmV0dXJuIG5ldyBMR3JhcGgobnVsbCwgdGhpcy5ncmFwaE1hbmFnZXIsIHZHcmFwaCk7XG59O1xuXG5MYXlvdXQucHJvdG90eXBlLm5ld05vZGUgPSBmdW5jdGlvbiAodk5vZGUpXG57XG4gIHJldHVybiBuZXcgTE5vZGUodGhpcy5ncmFwaE1hbmFnZXIsIHZOb2RlKTtcbn07XG5cbkxheW91dC5wcm90b3R5cGUubmV3RWRnZSA9IGZ1bmN0aW9uICh2RWRnZSlcbntcbiAgcmV0dXJuIG5ldyBMRWRnZShudWxsLCBudWxsLCB2RWRnZSk7XG59O1xuXG5MYXlvdXQucHJvdG90eXBlLnJ1bkxheW91dCA9IGZ1bmN0aW9uICgpXG57XG4gIHRoaXMuaXNMYXlvdXRGaW5pc2hlZCA9IGZhbHNlO1xuXG4gIHRoaXMuaW5pdFBhcmFtZXRlcnMoKTtcbiAgdmFyIGlzTGF5b3V0U3VjY2Vzc2Z1bGw7XG5cbiAgaWYgKCh0aGlzLmdyYXBoTWFuYWdlci5nZXRSb290KCkgPT0gbnVsbClcbiAgICAgICAgICB8fCB0aGlzLmdyYXBoTWFuYWdlci5nZXRSb290KCkuZ2V0Tm9kZXMoKS5sZW5ndGggPT0gMFxuICAgICAgICAgIHx8IHRoaXMuZ3JhcGhNYW5hZ2VyLmluY2x1ZGVzSW52YWxpZEVkZ2UoKSlcbiAge1xuICAgIGlzTGF5b3V0U3VjY2Vzc2Z1bGwgPSBmYWxzZTtcbiAgfVxuICBlbHNlXG4gIHtcbiAgICAvLyBjYWxjdWxhdGUgZXhlY3V0aW9uIHRpbWVcbiAgICB2YXIgc3RhcnRUaW1lID0gMDtcblxuICAgIGlmICghdGhpcy5pc1N1YkxheW91dClcbiAgICB7XG4gICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIH1cblxuICAgIGlzTGF5b3V0U3VjY2Vzc2Z1bGwgPSB0aGlzLmxheW91dCgpO1xuXG4gICAgaWYgKCF0aGlzLmlzU3ViTGF5b3V0KVxuICAgIHtcbiAgICAgIHZhciBlbmRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB2YXIgZXhjVGltZSA9IGVuZFRpbWUgLSBzdGFydFRpbWU7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiVG90YWwgZXhlY3V0aW9uIHRpbWU6IFwiICsgZXhjVGltZSArIFwiIG1pbGlzZWNvbmRzLlwiKTtcbiAgICB9XG4gIH1cblxuICBpZiAoaXNMYXlvdXRTdWNjZXNzZnVsbClcbiAge1xuICAgIGlmICghdGhpcy5pc1N1YkxheW91dClcbiAgICB7XG4gICAgICB0aGlzLmRvUG9zdExheW91dCgpO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuaXNMYXlvdXRGaW5pc2hlZCA9IHRydWU7XG5cbiAgcmV0dXJuIGlzTGF5b3V0U3VjY2Vzc2Z1bGw7XG59O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIHBlcmZvcm1zIHRoZSBvcGVyYXRpb25zIHJlcXVpcmVkIGFmdGVyIGxheW91dC5cbiAqL1xuTGF5b3V0LnByb3RvdHlwZS5kb1Bvc3RMYXlvdXQgPSBmdW5jdGlvbiAoKVxue1xuICAvL2Fzc2VydCAhaXNTdWJMYXlvdXQgOiBcIlNob3VsZCBub3QgYmUgY2FsbGVkIG9uIHN1Yi1sYXlvdXQhXCI7XG4gIC8vIFByb3BhZ2F0ZSBnZW9tZXRyaWMgY2hhbmdlcyB0byB2LWxldmVsIG9iamVjdHNcbiAgdGhpcy50cmFuc2Zvcm0oKTtcbiAgdGhpcy51cGRhdGUoKTtcbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgdXBkYXRlcyB0aGUgZ2VvbWV0cnkgb2YgdGhlIHRhcmdldCBncmFwaCBhY2NvcmRpbmcgdG9cbiAqIGNhbGN1bGF0ZWQgbGF5b3V0LlxuICovXG5MYXlvdXQucHJvdG90eXBlLnVwZGF0ZTIgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHVwZGF0ZSBiZW5kIHBvaW50c1xuICBpZiAodGhpcy5jcmVhdGVCZW5kc0FzTmVlZGVkKVxuICB7XG4gICAgdGhpcy5jcmVhdGVCZW5kcG9pbnRzRnJvbUR1bW15Tm9kZXMoKTtcblxuICAgIC8vIHJlc2V0IGFsbCBlZGdlcywgc2luY2UgdGhlIHRvcG9sb2d5IGhhcyBjaGFuZ2VkXG4gICAgdGhpcy5ncmFwaE1hbmFnZXIucmVzZXRBbGxFZGdlcygpO1xuICB9XG5cbiAgLy8gcGVyZm9ybSBlZGdlLCBub2RlIGFuZCByb290IHVwZGF0ZXMgaWYgbGF5b3V0IGlzIG5vdCBjYWxsZWRcbiAgLy8gcmVtb3RlbHlcbiAgaWYgKCF0aGlzLmlzUmVtb3RlVXNlKVxuICB7XG4gICAgLy8gdXBkYXRlIGFsbCBlZGdlc1xuICAgIHZhciBlZGdlO1xuICAgIHZhciBhbGxFZGdlcyA9IHRoaXMuZ3JhcGhNYW5hZ2VyLmdldEFsbEVkZ2VzKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGxFZGdlcy5sZW5ndGg7IGkrKylcbiAgICB7XG4gICAgICBlZGdlID0gYWxsRWRnZXNbaV07XG4vLyAgICAgIHRoaXMudXBkYXRlKGVkZ2UpO1xuICAgIH1cblxuICAgIC8vIHJlY3Vyc2l2ZWx5IHVwZGF0ZSBub2Rlc1xuICAgIHZhciBub2RlO1xuICAgIHZhciBub2RlcyA9IHRoaXMuZ3JhcGhNYW5hZ2VyLmdldFJvb3QoKS5nZXROb2RlcygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspXG4gICAge1xuICAgICAgbm9kZSA9IG5vZGVzW2ldO1xuLy8gICAgICB0aGlzLnVwZGF0ZShub2RlKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgcm9vdCBncmFwaFxuICAgIHRoaXMudXBkYXRlKHRoaXMuZ3JhcGhNYW5hZ2VyLmdldFJvb3QoKSk7XG4gIH1cbn07XG5cbkxheW91dC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKG9iaikge1xuICBpZiAob2JqID09IG51bGwpIHtcbiAgICB0aGlzLnVwZGF0ZTIoKTtcbiAgfVxuICBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBMTm9kZSkge1xuICAgIHZhciBub2RlID0gb2JqO1xuICAgIGlmIChub2RlLmdldENoaWxkKCkgIT0gbnVsbClcbiAgICB7XG4gICAgICAvLyBzaW5jZSBub2RlIGlzIGNvbXBvdW5kLCByZWN1cnNpdmVseSB1cGRhdGUgY2hpbGQgbm9kZXNcbiAgICAgIHZhciBub2RlcyA9IG5vZGUuZ2V0Q2hpbGQoKS5nZXROb2RlcygpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKylcbiAgICAgIHtcbiAgICAgICAgdXBkYXRlKG5vZGVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB0aGUgbC1sZXZlbCBub2RlIGlzIGFzc29jaWF0ZWQgd2l0aCBhIHYtbGV2ZWwgZ3JhcGggb2JqZWN0LFxuICAgIC8vIHRoZW4gaXQgaXMgYXNzdW1lZCB0aGF0IHRoZSB2LWxldmVsIG5vZGUgaW1wbGVtZW50cyB0aGVcbiAgICAvLyBpbnRlcmZhY2UgVXBkYXRhYmxlLlxuICAgIGlmIChub2RlLnZHcmFwaE9iamVjdCAhPSBudWxsKVxuICAgIHtcbiAgICAgIC8vIGNhc3QgdG8gVXBkYXRhYmxlIHdpdGhvdXQgYW55IHR5cGUgY2hlY2tcbiAgICAgIHZhciB2Tm9kZSA9IG5vZGUudkdyYXBoT2JqZWN0O1xuXG4gICAgICAvLyBjYWxsIHRoZSB1cGRhdGUgbWV0aG9kIG9mIHRoZSBpbnRlcmZhY2VcbiAgICAgIHZOb2RlLnVwZGF0ZShub2RlKTtcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgTEVkZ2UpIHtcbiAgICB2YXIgZWRnZSA9IG9iajtcbiAgICAvLyBpZiB0aGUgbC1sZXZlbCBlZGdlIGlzIGFzc29jaWF0ZWQgd2l0aCBhIHYtbGV2ZWwgZ3JhcGggb2JqZWN0LFxuICAgIC8vIHRoZW4gaXQgaXMgYXNzdW1lZCB0aGF0IHRoZSB2LWxldmVsIGVkZ2UgaW1wbGVtZW50cyB0aGVcbiAgICAvLyBpbnRlcmZhY2UgVXBkYXRhYmxlLlxuXG4gICAgaWYgKGVkZ2UudkdyYXBoT2JqZWN0ICE9IG51bGwpXG4gICAge1xuICAgICAgLy8gY2FzdCB0byBVcGRhdGFibGUgd2l0aG91dCBhbnkgdHlwZSBjaGVja1xuICAgICAgdmFyIHZFZGdlID0gZWRnZS52R3JhcGhPYmplY3Q7XG5cbiAgICAgIC8vIGNhbGwgdGhlIHVwZGF0ZSBtZXRob2Qgb2YgdGhlIGludGVyZmFjZVxuICAgICAgdkVkZ2UudXBkYXRlKGVkZ2UpO1xuICAgIH1cbiAgfVxuICBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBMR3JhcGgpIHtcbiAgICB2YXIgZ3JhcGggPSBvYmo7XG4gICAgLy8gaWYgdGhlIGwtbGV2ZWwgZ3JhcGggaXMgYXNzb2NpYXRlZCB3aXRoIGEgdi1sZXZlbCBncmFwaCBvYmplY3QsXG4gICAgLy8gdGhlbiBpdCBpcyBhc3N1bWVkIHRoYXQgdGhlIHYtbGV2ZWwgb2JqZWN0IGltcGxlbWVudHMgdGhlXG4gICAgLy8gaW50ZXJmYWNlIFVwZGF0YWJsZS5cblxuICAgIGlmIChncmFwaC52R3JhcGhPYmplY3QgIT0gbnVsbClcbiAgICB7XG4gICAgICAvLyBjYXN0IHRvIFVwZGF0YWJsZSB3aXRob3V0IGFueSB0eXBlIGNoZWNrXG4gICAgICB2YXIgdkdyYXBoID0gZ3JhcGgudkdyYXBoT2JqZWN0O1xuXG4gICAgICAvLyBjYWxsIHRoZSB1cGRhdGUgbWV0aG9kIG9mIHRoZSBpbnRlcmZhY2VcbiAgICAgIHZHcmFwaC51cGRhdGUoZ3JhcGgpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHNldCBhbGwgbGF5b3V0IHBhcmFtZXRlcnMgdG8gZGVmYXVsdCB2YWx1ZXNcbiAqIGRldGVybWluZWQgYXQgY29tcGlsZSB0aW1lLlxuICovXG5MYXlvdXQucHJvdG90eXBlLmluaXRQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuaXNTdWJMYXlvdXQpXG4gIHtcbiAgICB0aGlzLmxheW91dFF1YWxpdHkgPSBsYXlvdXRPcHRpb25zUGFjay5sYXlvdXRRdWFsaXR5O1xuICAgIHRoaXMuYW5pbWF0aW9uRHVyaW5nTGF5b3V0ID0gbGF5b3V0T3B0aW9uc1BhY2suYW5pbWF0aW9uRHVyaW5nTGF5b3V0O1xuICAgIHRoaXMuYW5pbWF0aW9uUGVyaW9kID0gTWF0aC5mbG9vcihMYXlvdXQudHJhbnNmb3JtKGxheW91dE9wdGlvbnNQYWNrLmFuaW1hdGlvblBlcmlvZCxcbiAgICAgICAgICAgIExheW91dENvbnN0YW50cy5ERUZBVUxUX0FOSU1BVElPTl9QRVJJT0QpKTtcbiAgICB0aGlzLmFuaW1hdGlvbk9uTGF5b3V0ID0gbGF5b3V0T3B0aW9uc1BhY2suYW5pbWF0aW9uT25MYXlvdXQ7XG4gICAgdGhpcy5pbmNyZW1lbnRhbCA9IGxheW91dE9wdGlvbnNQYWNrLmluY3JlbWVudGFsO1xuICAgIHRoaXMuY3JlYXRlQmVuZHNBc05lZWRlZCA9IGxheW91dE9wdGlvbnNQYWNrLmNyZWF0ZUJlbmRzQXNOZWVkZWQ7XG4gICAgdGhpcy51bmlmb3JtTGVhZk5vZGVTaXplcyA9IGxheW91dE9wdGlvbnNQYWNrLnVuaWZvcm1MZWFmTm9kZVNpemVzO1xuICB9XG5cbiAgaWYgKHRoaXMuYW5pbWF0aW9uRHVyaW5nTGF5b3V0KVxuICB7XG4gICAgYW5pbWF0aW9uT25MYXlvdXQgPSBmYWxzZTtcbiAgfVxufTtcblxuTGF5b3V0LnByb3RvdHlwZS50cmFuc2Zvcm0gPSBmdW5jdGlvbiAobmV3TGVmdFRvcCkge1xuICBpZiAobmV3TGVmdFRvcCA9PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzLnRyYW5zZm9ybShuZXcgUG9pbnREKDAsIDApKTtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBjcmVhdGUgYSB0cmFuc2Zvcm1hdGlvbiBvYmplY3QgKGZyb20gRWNsaXBzZSB0byBsYXlvdXQpLiBXaGVuIGFuXG4gICAgLy8gaW52ZXJzZSB0cmFuc2Zvcm0gaXMgYXBwbGllZCwgd2UgZ2V0IHVwcGVyLWxlZnQgY29vcmRpbmF0ZSBvZiB0aGVcbiAgICAvLyBkcmF3aW5nIG9yIHRoZSByb290IGdyYXBoIGF0IGdpdmVuIGlucHV0IGNvb3JkaW5hdGUgKHNvbWUgbWFyZ2luc1xuICAgIC8vIGFscmVhZHkgaW5jbHVkZWQgaW4gY2FsY3VsYXRpb24gb2YgbGVmdC10b3ApLlxuXG4gICAgdmFyIHRyYW5zID0gbmV3IFRyYW5zZm9ybSgpO1xuICAgIHZhciBsZWZ0VG9wID0gdGhpcy5ncmFwaE1hbmFnZXIuZ2V0Um9vdCgpLnVwZGF0ZUxlZnRUb3AoKTtcblxuICAgIGlmIChsZWZ0VG9wICE9IG51bGwpXG4gICAge1xuICAgICAgdHJhbnMuc2V0V29ybGRPcmdYKG5ld0xlZnRUb3AueCk7XG4gICAgICB0cmFucy5zZXRXb3JsZE9yZ1kobmV3TGVmdFRvcC55KTtcblxuICAgICAgdHJhbnMuc2V0RGV2aWNlT3JnWChsZWZ0VG9wLngpO1xuICAgICAgdHJhbnMuc2V0RGV2aWNlT3JnWShsZWZ0VG9wLnkpO1xuXG4gICAgICB2YXIgbm9kZXMgPSB0aGlzLmdldEFsbE5vZGVzKCk7XG4gICAgICB2YXIgbm9kZTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKylcbiAgICAgIHtcbiAgICAgICAgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBub2RlLnRyYW5zZm9ybSh0cmFucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5MYXlvdXQucHJvdG90eXBlLnBvc2l0aW9uTm9kZXNSYW5kb21seSA9IGZ1bmN0aW9uIChncmFwaCkge1xuXG4gIGlmIChncmFwaCA9PSB1bmRlZmluZWQpIHtcbiAgICAvL2Fzc2VydCAhdGhpcy5pbmNyZW1lbnRhbDtcbiAgICB0aGlzLnBvc2l0aW9uTm9kZXNSYW5kb21seSh0aGlzLmdldEdyYXBoTWFuYWdlcigpLmdldFJvb3QoKSk7XG4gICAgdGhpcy5nZXRHcmFwaE1hbmFnZXIoKS5nZXRSb290KCkudXBkYXRlQm91bmRzKHRydWUpO1xuICB9XG4gIGVsc2Uge1xuICAgIHZhciBsTm9kZTtcbiAgICB2YXIgY2hpbGRHcmFwaDtcblxuICAgIHZhciBub2RlcyA9IGdyYXBoLmdldE5vZGVzKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKylcbiAgICB7XG4gICAgICBsTm9kZSA9IG5vZGVzW2ldO1xuICAgICAgY2hpbGRHcmFwaCA9IGxOb2RlLmdldENoaWxkKCk7XG5cbiAgICAgIGlmIChjaGlsZEdyYXBoID09IG51bGwpXG4gICAgICB7XG4gICAgICAgIGxOb2RlLnNjYXR0ZXIoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGNoaWxkR3JhcGguZ2V0Tm9kZXMoKS5sZW5ndGggPT0gMClcbiAgICAgIHtcbiAgICAgICAgbE5vZGUuc2NhdHRlcigpO1xuICAgICAgfVxuICAgICAgZWxzZVxuICAgICAge1xuICAgICAgICB0aGlzLnBvc2l0aW9uTm9kZXNSYW5kb21seShjaGlsZEdyYXBoKTtcbiAgICAgICAgbE5vZGUudXBkYXRlQm91bmRzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYSBsaXN0IG9mIHRyZWVzIHdoZXJlIGVhY2ggdHJlZSBpcyByZXByZXNlbnRlZCBhcyBhXG4gKiBsaXN0IG9mIGwtbm9kZXMuIFRoZSBtZXRob2QgcmV0dXJucyBhIGxpc3Qgb2Ygc2l6ZSAwIHdoZW46XG4gKiAtIFRoZSBncmFwaCBpcyBub3QgZmxhdCBvclxuICogLSBPbmUgb2YgdGhlIGNvbXBvbmVudChzKSBvZiB0aGUgZ3JhcGggaXMgbm90IGEgdHJlZS5cbiAqL1xuTGF5b3V0LnByb3RvdHlwZS5nZXRGbGF0Rm9yZXN0ID0gZnVuY3Rpb24gKClcbntcbiAgdmFyIGZsYXRGb3Jlc3QgPSBbXTtcbiAgdmFyIGlzRm9yZXN0ID0gdHJ1ZTtcblxuICAvLyBRdWljayByZWZlcmVuY2UgZm9yIGFsbCBub2RlcyBpbiB0aGUgZ3JhcGggbWFuYWdlciBhc3NvY2lhdGVkIHdpdGhcbiAgLy8gdGhpcyBsYXlvdXQuIFRoZSBsaXN0IHNob3VsZCBub3QgYmUgY2hhbmdlZC5cbiAgdmFyIGFsbE5vZGVzID0gdGhpcy5ncmFwaE1hbmFnZXIuZ2V0Um9vdCgpLmdldE5vZGVzKCk7XG5cbiAgLy8gRmlyc3QgYmUgc3VyZSB0aGF0IHRoZSBncmFwaCBpcyBmbGF0XG4gIHZhciBpc0ZsYXQgPSB0cnVlO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsTm9kZXMubGVuZ3RoOyBpKyspXG4gIHtcbiAgICBpZiAoYWxsTm9kZXNbaV0uZ2V0Q2hpbGQoKSAhPSBudWxsKVxuICAgIHtcbiAgICAgIGlzRmxhdCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybiBlbXB0eSBmb3Jlc3QgaWYgdGhlIGdyYXBoIGlzIG5vdCBmbGF0LlxuICBpZiAoIWlzRmxhdClcbiAge1xuICAgIHJldHVybiBmbGF0Rm9yZXN0O1xuICB9XG5cbiAgLy8gUnVuIEJGUyBmb3IgZWFjaCBjb21wb25lbnQgb2YgdGhlIGdyYXBoLlxuXG4gIHZhciB2aXNpdGVkID0gbmV3IEhhc2hTZXQoKTtcbiAgdmFyIHRvQmVWaXNpdGVkID0gW107XG4gIHZhciBwYXJlbnRzID0gbmV3IEhhc2hNYXAoKTtcbiAgdmFyIHVuUHJvY2Vzc2VkTm9kZXMgPSBbXTtcblxuICB1blByb2Nlc3NlZE5vZGVzID0gdW5Qcm9jZXNzZWROb2Rlcy5jb25jYXQoYWxsTm9kZXMpO1xuXG4gIC8vIEVhY2ggaXRlcmF0aW9uIG9mIHRoaXMgbG9vcCBmaW5kcyBhIGNvbXBvbmVudCBvZiB0aGUgZ3JhcGggYW5kXG4gIC8vIGRlY2lkZXMgd2hldGhlciBpdCBpcyBhIHRyZWUgb3Igbm90LiBJZiBpdCBpcyBhIHRyZWUsIGFkZHMgaXQgdG8gdGhlXG4gIC8vIGZvcmVzdCBhbmQgY29udGludWVkIHdpdGggdGhlIG5leHQgY29tcG9uZW50LlxuXG4gIHdoaWxlICh1blByb2Nlc3NlZE5vZGVzLmxlbmd0aCA+IDAgJiYgaXNGb3Jlc3QpXG4gIHtcbiAgICB0b0JlVmlzaXRlZC5wdXNoKHVuUHJvY2Vzc2VkTm9kZXNbMF0pO1xuXG4gICAgLy8gU3RhcnQgdGhlIEJGUy4gRWFjaCBpdGVyYXRpb24gb2YgdGhpcyBsb29wIHZpc2l0cyBhIG5vZGUgaW4gYVxuICAgIC8vIEJGUyBtYW5uZXIuXG4gICAgd2hpbGUgKHRvQmVWaXNpdGVkLmxlbmd0aCA+IDAgJiYgaXNGb3Jlc3QpXG4gICAge1xuICAgICAgLy9wb29sIG9wZXJhdGlvblxuICAgICAgdmFyIGN1cnJlbnROb2RlID0gdG9CZVZpc2l0ZWRbMF07XG4gICAgICB0b0JlVmlzaXRlZC5zcGxpY2UoMCwgMSk7XG4gICAgICB2aXNpdGVkLmFkZChjdXJyZW50Tm9kZSk7XG5cbiAgICAgIC8vIFRyYXZlcnNlIGFsbCBuZWlnaGJvcnMgb2YgdGhpcyBub2RlXG4gICAgICB2YXIgbmVpZ2hib3JFZGdlcyA9IGN1cnJlbnROb2RlLmdldEVkZ2VzKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmVpZ2hib3JFZGdlcy5sZW5ndGg7IGkrKylcbiAgICAgIHtcbiAgICAgICAgdmFyIGN1cnJlbnROZWlnaGJvciA9XG4gICAgICAgICAgICAgICAgbmVpZ2hib3JFZGdlc1tpXS5nZXRPdGhlckVuZChjdXJyZW50Tm9kZSk7XG5cbiAgICAgICAgLy8gSWYgQkZTIGlzIG5vdCBncm93aW5nIGZyb20gdGhpcyBuZWlnaGJvci5cbiAgICAgICAgaWYgKHBhcmVudHMuZ2V0KGN1cnJlbnROb2RlKSAhPSBjdXJyZW50TmVpZ2hib3IpXG4gICAgICAgIHtcbiAgICAgICAgICAvLyBXZSBoYXZlbid0IHByZXZpb3VzbHkgdmlzaXRlZCB0aGlzIG5laWdoYm9yLlxuICAgICAgICAgIGlmICghdmlzaXRlZC5jb250YWlucyhjdXJyZW50TmVpZ2hib3IpKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRvQmVWaXNpdGVkLnB1c2goY3VycmVudE5laWdoYm9yKTtcbiAgICAgICAgICAgIHBhcmVudHMucHV0KGN1cnJlbnROZWlnaGJvciwgY3VycmVudE5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBTaW5jZSB3ZSBoYXZlIHByZXZpb3VzbHkgdmlzaXRlZCB0aGlzIG5laWdoYm9yIGFuZFxuICAgICAgICAgIC8vIHRoaXMgbmVpZ2hib3IgaXMgbm90IHBhcmVudCBvZiBjdXJyZW50Tm9kZSwgZ2l2ZW5cbiAgICAgICAgICAvLyBncmFwaCBjb250YWlucyBhIGNvbXBvbmVudCB0aGF0IGlzIG5vdCB0cmVlLCBoZW5jZVxuICAgICAgICAgIC8vIGl0IGlzIG5vdCBhIGZvcmVzdC5cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAge1xuICAgICAgICAgICAgaXNGb3Jlc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoZSBncmFwaCBjb250YWlucyBhIGNvbXBvbmVudCB0aGF0IGlzIG5vdCBhIHRyZWUuIEVtcHR5XG4gICAgLy8gcHJldmlvdXNseSBmb3VuZCB0cmVlcy4gVGhlIG1ldGhvZCB3aWxsIGVuZC5cbiAgICBpZiAoIWlzRm9yZXN0KVxuICAgIHtcbiAgICAgIGZsYXRGb3Jlc3QgPSBbXTtcbiAgICB9XG4gICAgLy8gU2F2ZSBjdXJyZW50bHkgdmlzaXRlZCBub2RlcyBhcyBhIHRyZWUgaW4gb3VyIGZvcmVzdC4gUmVzZXRcbiAgICAvLyB2aXNpdGVkIGFuZCBwYXJlbnRzIGxpc3RzLiBDb250aW51ZSB3aXRoIHRoZSBuZXh0IGNvbXBvbmVudCBvZlxuICAgIC8vIHRoZSBncmFwaCwgaWYgYW55LlxuICAgIGVsc2VcbiAgICB7XG4gICAgICB2YXIgdGVtcCA9IFtdO1xuICAgICAgdmlzaXRlZC5hZGRBbGxUbyh0ZW1wKTtcbiAgICAgIGZsYXRGb3Jlc3QucHVzaCh0ZW1wKTtcbiAgICAgIC8vZmxhdEZvcmVzdCA9IGZsYXRGb3Jlc3QuY29uY2F0KHRlbXApO1xuICAgICAgLy91blByb2Nlc3NlZE5vZGVzLnJlbW92ZUFsbCh2aXNpdGVkKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGVtcC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdmFsdWUgPSB0ZW1wW2ldO1xuICAgICAgICB2YXIgaW5kZXggPSB1blByb2Nlc3NlZE5vZGVzLmluZGV4T2YodmFsdWUpO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIHVuUHJvY2Vzc2VkTm9kZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmlzaXRlZCA9IG5ldyBIYXNoU2V0KCk7XG4gICAgICBwYXJlbnRzID0gbmV3IEhhc2hNYXAoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmxhdEZvcmVzdDtcbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgY3JlYXRlcyBkdW1teSBub2RlcyAoYW4gbC1sZXZlbCBub2RlIHdpdGggbWluaW1hbCBkaW1lbnNpb25zKVxuICogZm9yIHRoZSBnaXZlbiBlZGdlIChvbmUgcGVyIGJlbmRwb2ludCkuIFRoZSBleGlzdGluZyBsLWxldmVsIHN0cnVjdHVyZVxuICogaXMgdXBkYXRlZCBhY2NvcmRpbmdseS5cbiAqL1xuTGF5b3V0LnByb3RvdHlwZS5jcmVhdGVEdW1teU5vZGVzRm9yQmVuZHBvaW50cyA9IGZ1bmN0aW9uIChlZGdlKVxue1xuICB2YXIgZHVtbXlOb2RlcyA9IFtdO1xuICB2YXIgcHJldiA9IGVkZ2Uuc291cmNlO1xuXG4gIHZhciBncmFwaCA9IHRoaXMuZ3JhcGhNYW5hZ2VyLmNhbGNMb3dlc3RDb21tb25BbmNlc3RvcihlZGdlLnNvdXJjZSwgZWRnZS50YXJnZXQpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWRnZS5iZW5kcG9pbnRzLmxlbmd0aDsgaSsrKVxuICB7XG4gICAgLy8gY3JlYXRlIG5ldyBkdW1teSBub2RlXG4gICAgdmFyIGR1bW15Tm9kZSA9IHRoaXMubmV3Tm9kZShudWxsKTtcbiAgICBkdW1teU5vZGUuc2V0UmVjdChuZXcgUG9pbnQoMCwgMCksIG5ldyBEaW1lbnNpb24oMSwgMSkpO1xuXG4gICAgZ3JhcGguYWRkKGR1bW15Tm9kZSk7XG5cbiAgICAvLyBjcmVhdGUgbmV3IGR1bW15IGVkZ2UgYmV0d2VlbiBwcmV2IGFuZCBkdW1teSBub2RlXG4gICAgdmFyIGR1bW15RWRnZSA9IHRoaXMubmV3RWRnZShudWxsKTtcbiAgICB0aGlzLmdyYXBoTWFuYWdlci5hZGQoZHVtbXlFZGdlLCBwcmV2LCBkdW1teU5vZGUpO1xuXG4gICAgZHVtbXlOb2Rlcy5hZGQoZHVtbXlOb2RlKTtcbiAgICBwcmV2ID0gZHVtbXlOb2RlO1xuICB9XG5cbiAgdmFyIGR1bW15RWRnZSA9IHRoaXMubmV3RWRnZShudWxsKTtcbiAgdGhpcy5ncmFwaE1hbmFnZXIuYWRkKGR1bW15RWRnZSwgcHJldiwgZWRnZS50YXJnZXQpO1xuXG4gIHRoaXMuZWRnZVRvRHVtbXlOb2Rlcy5wdXQoZWRnZSwgZHVtbXlOb2Rlcyk7XG5cbiAgLy8gcmVtb3ZlIHJlYWwgZWRnZSBmcm9tIGdyYXBoIG1hbmFnZXIgaWYgaXQgaXMgaW50ZXItZ3JhcGhcbiAgaWYgKGVkZ2UuaXNJbnRlckdyYXBoKCkpXG4gIHtcbiAgICB0aGlzLmdyYXBoTWFuYWdlci5yZW1vdmUoZWRnZSk7XG4gIH1cbiAgLy8gZWxzZSwgcmVtb3ZlIHRoZSBlZGdlIGZyb20gdGhlIGN1cnJlbnQgZ3JhcGhcbiAgZWxzZVxuICB7XG4gICAgZ3JhcGgucmVtb3ZlKGVkZ2UpO1xuICB9XG5cbiAgcmV0dXJuIGR1bW15Tm9kZXM7XG59O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYmVuZHBvaW50cyBmb3IgZWRnZXMgZnJvbSB0aGUgZHVtbXkgbm9kZXNcbiAqIGF0IGwtbGV2ZWwuXG4gKi9cbkxheW91dC5wcm90b3R5cGUuY3JlYXRlQmVuZHBvaW50c0Zyb21EdW1teU5vZGVzID0gZnVuY3Rpb24gKClcbntcbiAgdmFyIGVkZ2VzID0gW107XG4gIGVkZ2VzID0gZWRnZXMuY29uY2F0KHRoaXMuZ3JhcGhNYW5hZ2VyLmdldEFsbEVkZ2VzKCkpO1xuICBlZGdlcyA9IHRoaXMuZWRnZVRvRHVtbXlOb2Rlcy5rZXlTZXQoKS5jb25jYXQoZWRnZXMpO1xuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgZWRnZXMubGVuZ3RoOyBrKyspXG4gIHtcbiAgICB2YXIgbEVkZ2UgPSBlZGdlc1trXTtcblxuICAgIGlmIChsRWRnZS5iZW5kcG9pbnRzLmxlbmd0aCA+IDApXG4gICAge1xuICAgICAgdmFyIHBhdGggPSB0aGlzLmVkZ2VUb0R1bW15Tm9kZXMuZ2V0KGxFZGdlKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKVxuICAgICAge1xuICAgICAgICB2YXIgZHVtbXlOb2RlID0gcGF0aFtpXTtcbiAgICAgICAgdmFyIHAgPSBuZXcgUG9pbnREKGR1bW15Tm9kZS5nZXRDZW50ZXJYKCksXG4gICAgICAgICAgICAgICAgZHVtbXlOb2RlLmdldENlbnRlclkoKSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIGJlbmRwb2ludCdzIGxvY2F0aW9uIGFjY29yZGluZyB0byBkdW1teSBub2RlXG4gICAgICAgIHZhciBlYnAgPSBsRWRnZS5iZW5kcG9pbnRzLmdldChpKTtcbiAgICAgICAgZWJwLnggPSBwLng7XG4gICAgICAgIGVicC55ID0gcC55O1xuXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgZHVtbXkgbm9kZSwgZHVtbXkgZWRnZXMgaW5jaWRlbnQgd2l0aCB0aGlzXG4gICAgICAgIC8vIGR1bW15IG5vZGUgaXMgYWxzbyByZW1vdmVkICh3aXRoaW4gdGhlIHJlbW92ZSBtZXRob2QpXG4gICAgICAgIGR1bW15Tm9kZS5nZXRPd25lcigpLnJlbW92ZShkdW1teU5vZGUpO1xuICAgICAgfVxuXG4gICAgICAvLyBhZGQgdGhlIHJlYWwgZWRnZSB0byBncmFwaFxuICAgICAgdGhpcy5ncmFwaE1hbmFnZXIuYWRkKGxFZGdlLCBsRWRnZS5zb3VyY2UsIGxFZGdlLnRhcmdldCk7XG4gICAgfVxuICB9XG59O1xuXG5MYXlvdXQudHJhbnNmb3JtID0gZnVuY3Rpb24gKHNsaWRlclZhbHVlLCBkZWZhdWx0VmFsdWUsIG1pbkRpdiwgbWF4TXVsKSB7XG4gIGlmIChtaW5EaXYgIT0gdW5kZWZpbmVkICYmIG1heE11bCAhPSB1bmRlZmluZWQpIHtcbiAgICB2YXIgdmFsdWUgPSBkZWZhdWx0VmFsdWU7XG5cbiAgICBpZiAoc2xpZGVyVmFsdWUgPD0gNTApXG4gICAge1xuICAgICAgdmFyIG1pblZhbHVlID0gZGVmYXVsdFZhbHVlIC8gbWluRGl2O1xuICAgICAgdmFsdWUgLT0gKChkZWZhdWx0VmFsdWUgLSBtaW5WYWx1ZSkgLyA1MCkgKiAoNTAgLSBzbGlkZXJWYWx1ZSk7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICB2YXIgbWF4VmFsdWUgPSBkZWZhdWx0VmFsdWUgKiBtYXhNdWw7XG4gICAgICB2YWx1ZSArPSAoKG1heFZhbHVlIC0gZGVmYXVsdFZhbHVlKSAvIDUwKSAqIChzbGlkZXJWYWx1ZSAtIDUwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIGEsIGI7XG5cbiAgICBpZiAoc2xpZGVyVmFsdWUgPD0gNTApXG4gICAge1xuICAgICAgYSA9IDkuMCAqIGRlZmF1bHRWYWx1ZSAvIDUwMC4wO1xuICAgICAgYiA9IGRlZmF1bHRWYWx1ZSAvIDEwLjA7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICBhID0gOS4wICogZGVmYXVsdFZhbHVlIC8gNTAuMDtcbiAgICAgIGIgPSAtOCAqIGRlZmF1bHRWYWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gKGEgKiBzbGlkZXJWYWx1ZSArIGIpO1xuICB9XG59O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGZpbmRzIGFuZCByZXR1cm5zIHRoZSBjZW50ZXIgb2YgdGhlIGdpdmVuIG5vZGVzLCBhc3N1bWluZ1xuICogdGhhdCB0aGUgZ2l2ZW4gbm9kZXMgZm9ybSBhIHRyZWUgaW4gdGhlbXNlbHZlcy5cbiAqL1xuTGF5b3V0LmZpbmRDZW50ZXJPZlRyZWUgPSBmdW5jdGlvbiAobm9kZXMpXG57XG4gIHZhciBsaXN0ID0gW107XG4gIGxpc3QgPSBsaXN0LmNvbmNhdChub2Rlcyk7XG5cbiAgdmFyIHJlbW92ZWROb2RlcyA9IFtdO1xuICB2YXIgcmVtYWluaW5nRGVncmVlcyA9IG5ldyBIYXNoTWFwKCk7XG4gIHZhciBmb3VuZENlbnRlciA9IGZhbHNlO1xuICB2YXIgY2VudGVyTm9kZSA9IG51bGw7XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09IDEgfHwgbGlzdC5sZW5ndGggPT0gMilcbiAge1xuICAgIGZvdW5kQ2VudGVyID0gdHJ1ZTtcbiAgICBjZW50ZXJOb2RlID0gbGlzdFswXTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKylcbiAge1xuICAgIHZhciBub2RlID0gbGlzdFtpXTtcbiAgICB2YXIgZGVncmVlID0gbm9kZS5nZXROZWlnaGJvcnNMaXN0KCkuc2l6ZSgpO1xuICAgIHJlbWFpbmluZ0RlZ3JlZXMucHV0KG5vZGUsIG5vZGUuZ2V0TmVpZ2hib3JzTGlzdCgpLnNpemUoKSk7XG5cbiAgICBpZiAoZGVncmVlID09IDEpXG4gICAge1xuICAgICAgcmVtb3ZlZE5vZGVzLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIHRlbXBMaXN0ID0gW107XG4gIHRlbXBMaXN0ID0gdGVtcExpc3QuY29uY2F0KHJlbW92ZWROb2Rlcyk7XG5cbiAgd2hpbGUgKCFmb3VuZENlbnRlcilcbiAge1xuICAgIHZhciB0ZW1wTGlzdDIgPSBbXTtcbiAgICB0ZW1wTGlzdDIgPSB0ZW1wTGlzdDIuY29uY2F0KHRlbXBMaXN0KTtcbiAgICB0ZW1wTGlzdCA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKVxuICAgIHtcbiAgICAgIHZhciBub2RlID0gbGlzdFtpXTtcblxuICAgICAgdmFyIGluZGV4ID0gbGlzdC5pbmRleE9mKG5vZGUpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgbGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuXG4gICAgICB2YXIgbmVpZ2hib3VycyA9IG5vZGUuZ2V0TmVpZ2hib3JzTGlzdCgpO1xuXG4gICAgICBmb3IgKHZhciBqIGluIG5laWdoYm91cnMuc2V0KVxuICAgICAge1xuICAgICAgICB2YXIgbmVpZ2hib3VyID0gbmVpZ2hib3Vycy5zZXRbal07XG4gICAgICAgIGlmIChyZW1vdmVkTm9kZXMuaW5kZXhPZihuZWlnaGJvdXIpIDwgMClcbiAgICAgICAge1xuICAgICAgICAgIHZhciBvdGhlckRlZ3JlZSA9IHJlbWFpbmluZ0RlZ3JlZXMuZ2V0KG5laWdoYm91cik7XG4gICAgICAgICAgdmFyIG5ld0RlZ3JlZSA9IG90aGVyRGVncmVlIC0gMTtcblxuICAgICAgICAgIGlmIChuZXdEZWdyZWUgPT0gMSlcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZW1wTGlzdC5wdXNoKG5laWdoYm91cik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVtYWluaW5nRGVncmVlcy5wdXQobmVpZ2hib3VyLCBuZXdEZWdyZWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlZE5vZGVzID0gcmVtb3ZlZE5vZGVzLmNvbmNhdCh0ZW1wTGlzdCk7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT0gMSB8fCBsaXN0Lmxlbmd0aCA9PSAyKVxuICAgIHtcbiAgICAgIGZvdW5kQ2VudGVyID0gdHJ1ZTtcbiAgICAgIGNlbnRlck5vZGUgPSBsaXN0WzBdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjZW50ZXJOb2RlO1xufTtcblxuLyoqXG4gKiBEdXJpbmcgdGhlIGNvYXJzZW5pbmcgcHJvY2VzcywgdGhpcyBsYXlvdXQgbWF5IGJlIHJlZmVyZW5jZWQgYnkgdHdvIGdyYXBoIG1hbmFnZXJzXG4gKiB0aGlzIHNldHRlciBmdW5jdGlvbiBncmFudHMgYWNjZXNzIHRvIGNoYW5nZSB0aGUgY3VycmVudGx5IGJlaW5nIHVzZWQgZ3JhcGggbWFuYWdlclxuICovXG5MYXlvdXQucHJvdG90eXBlLnNldEdyYXBoTWFuYWdlciA9IGZ1bmN0aW9uIChnbSlcbntcbiAgdGhpcy5ncmFwaE1hbmFnZXIgPSBnbTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0O1xuIiwiZnVuY3Rpb24gTGF5b3V0Q29uc3RhbnRzKCkge1xufVxuXG4vKipcbiAqIExheW91dCBRdWFsaXR5XG4gKi9cbkxheW91dENvbnN0YW50cy5QUk9PRl9RVUFMSVRZID0gMDtcbkxheW91dENvbnN0YW50cy5ERUZBVUxUX1FVQUxJVFkgPSAxO1xuTGF5b3V0Q29uc3RhbnRzLkRSQUZUX1FVQUxJVFkgPSAyO1xuXG4vKipcbiAqIERlZmF1bHQgcGFyYW1ldGVyc1xuICovXG5MYXlvdXRDb25zdGFudHMuREVGQVVMVF9DUkVBVEVfQkVORFNfQVNfTkVFREVEID0gZmFsc2U7XG4vL0xheW91dENvbnN0YW50cy5ERUZBVUxUX0lOQ1JFTUVOVEFMID0gdHJ1ZTtcbkxheW91dENvbnN0YW50cy5ERUZBVUxUX0lOQ1JFTUVOVEFMID0gZmFsc2U7XG5MYXlvdXRDb25zdGFudHMuREVGQVVMVF9BTklNQVRJT05fT05fTEFZT1VUID0gdHJ1ZTtcbkxheW91dENvbnN0YW50cy5ERUZBVUxUX0FOSU1BVElPTl9EVVJJTkdfTEFZT1VUID0gZmFsc2U7XG5MYXlvdXRDb25zdGFudHMuREVGQVVMVF9BTklNQVRJT05fUEVSSU9EID0gNTA7XG5MYXlvdXRDb25zdGFudHMuREVGQVVMVF9VTklGT1JNX0xFQUZfTk9ERV9TSVpFUyA9IGZhbHNlO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2VjdGlvbjogR2VuZXJhbCBvdGhlciBjb25zdGFudHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vKlxuICogTWFyZ2lucyBvZiBhIGdyYXBoIHRvIGJlIGFwcGxpZWQgb24gYm91ZGluZyByZWN0YW5nbGUgb2YgaXRzIGNvbnRlbnRzLiBXZVxuICogYXNzdW1lIG1hcmdpbnMgb24gYWxsIGZvdXIgc2lkZXMgdG8gYmUgdW5pZm9ybS5cbiAqL1xuTGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfR1JBUEhfTUFSR0lOID0gMTA7XG5cbi8qXG4gKiBUaGUgaGVpZ2h0IG9mIHRoZSBsYWJlbCBvZiBhIGNvbXBvdW5kLiBXZSBhc3N1bWUgdGhlIGxhYmVsIG9mIGEgY29tcG91bmRcbiAqIG5vZGUgaXMgcGxhY2VkIGF0IHRoZSBib3R0b20gd2l0aCBhIGR5bmFtaWMgd2lkdGggc2FtZSBhcyB0aGUgY29tcG91bmRcbiAqIGl0c2VsZi5cbiAqL1xuTGF5b3V0Q29uc3RhbnRzLkxBQkVMX0hFSUdIVCA9IDIwO1xuXG4vKlxuICogQWRkaXRpb25hbCBtYXJnaW5zIHRoYXQgd2UgbWFpbnRhaW4gYXMgc2FmZXR5IGJ1ZmZlciBmb3Igbm9kZS1ub2RlXG4gKiBvdmVybGFwcy4gQ29tcG91bmQgbm9kZSBsYWJlbHMgYXMgd2VsbCBhcyBncmFwaCBtYXJnaW5zIGFyZSBoYW5kbGVkXG4gKiBzZXBhcmF0ZWx5IVxuICovXG5MYXlvdXRDb25zdGFudHMuQ09NUE9VTkRfTk9ERV9NQVJHSU4gPSA1O1xuXG4vKlxuICogRGVmYXVsdCBkaW1lbnNpb24gb2YgYSBub24tY29tcG91bmQgbm9kZS5cbiAqL1xuTGF5b3V0Q29uc3RhbnRzLlNJTVBMRV9OT0RFX1NJWkUgPSA0MDtcblxuLypcbiAqIERlZmF1bHQgZGltZW5zaW9uIG9mIGEgbm9uLWNvbXBvdW5kIG5vZGUuXG4gKi9cbkxheW91dENvbnN0YW50cy5TSU1QTEVfTk9ERV9IQUxGX1NJWkUgPSBMYXlvdXRDb25zdGFudHMuU0lNUExFX05PREVfU0laRSAvIDI7XG5cbi8qXG4gKiBFbXB0eSBjb21wb3VuZCBub2RlIHNpemUuIFdoZW4gYSBjb21wb3VuZCBub2RlIGlzIGVtcHR5LCBpdHMgYm90aFxuICogZGltZW5zaW9ucyBzaG91bGQgYmUgb2YgdGhpcyB2YWx1ZS5cbiAqL1xuTGF5b3V0Q29uc3RhbnRzLkVNUFRZX0NPTVBPVU5EX05PREVfU0laRSA9IDQwO1xuXG4vKlxuICogTWluaW11bSBsZW5ndGggdGhhdCBhbiBlZGdlIHNob3VsZCB0YWtlIGR1cmluZyBsYXlvdXRcbiAqL1xuTGF5b3V0Q29uc3RhbnRzLk1JTl9FREdFX0xFTkdUSCA9IDE7XG5cbi8qXG4gKiBXb3JsZCBib3VuZGFyaWVzIHRoYXQgbGF5b3V0IG9wZXJhdGVzIG9uXG4gKi9cbkxheW91dENvbnN0YW50cy5XT1JMRF9CT1VOREFSWSA9IDEwMDAwMDA7XG5cbi8qXG4gKiBXb3JsZCBib3VuZGFyaWVzIHRoYXQgcmFuZG9tIHBvc2l0aW9uaW5nIGNhbiBiZSBwZXJmb3JtZWQgd2l0aFxuICovXG5MYXlvdXRDb25zdGFudHMuSU5JVElBTF9XT1JMRF9CT1VOREFSWSA9IExheW91dENvbnN0YW50cy5XT1JMRF9CT1VOREFSWSAvIDEwMDA7XG5cbi8qXG4gKiBDb29yZGluYXRlcyBvZiB0aGUgd29ybGQgY2VudGVyXG4gKi9cbkxheW91dENvbnN0YW50cy5XT1JMRF9DRU5URVJfWCA9IDEyMDA7XG5MYXlvdXRDb25zdGFudHMuV09STERfQ0VOVEVSX1kgPSA5MDA7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0Q29uc3RhbnRzO1xuIiwiLypcbiAqVGhpcyBjbGFzcyBpcyB0aGUgamF2YXNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgUG9pbnQuamF2YSBjbGFzcyBpbiBqZGtcbiAqL1xuZnVuY3Rpb24gUG9pbnQoeCwgeSwgcCkge1xuICB0aGlzLnggPSBudWxsO1xuICB0aGlzLnkgPSBudWxsO1xuICBpZiAoeCA9PSBudWxsICYmIHkgPT0gbnVsbCAmJiBwID09IG51bGwpIHtcbiAgICB0aGlzLnggPSAwO1xuICAgIHRoaXMueSA9IDA7XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIHggPT0gJ251bWJlcicgJiYgdHlwZW9mIHkgPT0gJ251bWJlcicgJiYgcCA9PSBudWxsKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICB9XG4gIGVsc2UgaWYgKHguY29uc3RydWN0b3IubmFtZSA9PSAnUG9pbnQnICYmIHkgPT0gbnVsbCAmJiBwID09IG51bGwpIHtcbiAgICBwID0geDtcbiAgICB0aGlzLnggPSBwLng7XG4gICAgdGhpcy55ID0gcC55O1xuICB9XG59XG5cblBvaW50LnByb3RvdHlwZS5nZXRYID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy54O1xufVxuXG5Qb2ludC5wcm90b3R5cGUuZ2V0WSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMueTtcbn1cblxuUG9pbnQucHJvdG90eXBlLmdldExvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KTtcbn1cblxuUG9pbnQucHJvdG90eXBlLnNldExvY2F0aW9uID0gZnVuY3Rpb24gKHgsIHksIHApIHtcbiAgaWYgKHguY29uc3RydWN0b3IubmFtZSA9PSAnUG9pbnQnICYmIHkgPT0gbnVsbCAmJiBwID09IG51bGwpIHtcbiAgICBwID0geDtcbiAgICB0aGlzLnNldExvY2F0aW9uKHAueCwgcC55KTtcbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgeCA9PSAnbnVtYmVyJyAmJiB0eXBlb2YgeSA9PSAnbnVtYmVyJyAmJiBwID09IG51bGwpIHtcbiAgICAvL2lmIGJvdGggcGFyYW1ldGVycyBhcmUgaW50ZWdlciBqdXN0IG1vdmUgKHgseSkgbG9jYXRpb25cbiAgICBpZiAocGFyc2VJbnQoeCkgPT0geCAmJiBwYXJzZUludCh5KSA9PSB5KSB7XG4gICAgICB0aGlzLm1vdmUoeCwgeSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy54ID0gTWF0aC5mbG9vcih4ICsgMC41KTtcbiAgICAgIHRoaXMueSA9IE1hdGguZmxvb3IoeSArIDAuNSk7XG4gICAgfVxuICB9XG59XG5cblBvaW50LnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdGhpcy54ID0geDtcbiAgdGhpcy55ID0geTtcbn1cblxuUG9pbnQucHJvdG90eXBlLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uIChkeCwgZHkpIHtcbiAgdGhpcy54ICs9IGR4O1xuICB0aGlzLnkgKz0gZHk7XG59XG5cblBvaW50LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIGlmIChvYmouY29uc3RydWN0b3IubmFtZSA9PSBcIlBvaW50XCIpIHtcbiAgICB2YXIgcHQgPSBvYmo7XG4gICAgcmV0dXJuICh0aGlzLnggPT0gcHQueCkgJiYgKHRoaXMueSA9PSBwdC55KTtcbiAgfVxuICByZXR1cm4gdGhpcyA9PSBvYmo7XG59XG5cblBvaW50LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBQb2ludCgpLmNvbnN0cnVjdG9yLm5hbWUgKyBcIlt4PVwiICsgdGhpcy54ICsgXCIseT1cIiArIHRoaXMueSArIFwiXVwiO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50O1xuIiwiZnVuY3Rpb24gUG9pbnREKHgsIHkpIHtcbiAgaWYgKHggPT0gbnVsbCAmJiB5ID09IG51bGwpIHtcbiAgICB0aGlzLnggPSAwO1xuICAgIHRoaXMueSA9IDA7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICB9XG59XG5cblBvaW50RC5wcm90b3R5cGUuZ2V0WCA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLng7XG59O1xuXG5Qb2ludEQucHJvdG90eXBlLmdldFkgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy55O1xufTtcblxuUG9pbnRELnByb3RvdHlwZS5zZXRYID0gZnVuY3Rpb24gKHgpXG57XG4gIHRoaXMueCA9IHg7XG59O1xuXG5Qb2ludEQucHJvdG90eXBlLnNldFkgPSBmdW5jdGlvbiAoeSlcbntcbiAgdGhpcy55ID0geTtcbn07XG5cblBvaW50RC5wcm90b3R5cGUuZ2V0RGlmZmVyZW5jZSA9IGZ1bmN0aW9uIChwdClcbntcbiAgcmV0dXJuIG5ldyBEaW1lbnNpb25EKHRoaXMueCAtIHB0LngsIHRoaXMueSAtIHB0LnkpO1xufTtcblxuUG9pbnRELnByb3RvdHlwZS5nZXRDb3B5ID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIG5ldyBQb2ludEQodGhpcy54LCB0aGlzLnkpO1xufTtcblxuUG9pbnRELnByb3RvdHlwZS50cmFuc2xhdGUgPSBmdW5jdGlvbiAoZGltKVxue1xuICB0aGlzLnggKz0gZGltLndpZHRoO1xuICB0aGlzLnkgKz0gZGltLmhlaWdodDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50RDtcbiIsImZ1bmN0aW9uIFJhbmRvbVNlZWQoKSB7XG59XG5SYW5kb21TZWVkLnNlZWQgPSAxO1xuUmFuZG9tU2VlZC54ID0gMDtcblxuUmFuZG9tU2VlZC5uZXh0RG91YmxlID0gZnVuY3Rpb24gKCkge1xuICBSYW5kb21TZWVkLnggPSBNYXRoLnNpbihSYW5kb21TZWVkLnNlZWQrKykgKiAxMDAwMDtcbiAgcmV0dXJuIFJhbmRvbVNlZWQueCAtIE1hdGguZmxvb3IoUmFuZG9tU2VlZC54KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmFuZG9tU2VlZDtcbiIsImZ1bmN0aW9uIFJlY3RhbmdsZUQoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICB0aGlzLnggPSAwO1xuICB0aGlzLnkgPSAwO1xuICB0aGlzLndpZHRoID0gMDtcbiAgdGhpcy5oZWlnaHQgPSAwO1xuXG4gIGlmICh4ICE9IG51bGwgJiYgeSAhPSBudWxsICYmIHdpZHRoICE9IG51bGwgJiYgaGVpZ2h0ICE9IG51bGwpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICB9XG59XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldFggPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy54O1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuc2V0WCA9IGZ1bmN0aW9uICh4KVxue1xuICB0aGlzLnggPSB4O1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuZ2V0WSA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLnk7XG59O1xuXG5SZWN0YW5nbGVELnByb3RvdHlwZS5zZXRZID0gZnVuY3Rpb24gKHkpXG57XG4gIHRoaXMueSA9IHk7XG59O1xuXG5SZWN0YW5nbGVELnByb3RvdHlwZS5nZXRXaWR0aCA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLndpZHRoO1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuc2V0V2lkdGggPSBmdW5jdGlvbiAod2lkdGgpXG57XG4gIHRoaXMud2lkdGggPSB3aWR0aDtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldEhlaWdodCA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLmhlaWdodDtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLnNldEhlaWdodCA9IGZ1bmN0aW9uIChoZWlnaHQpXG57XG4gIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuZ2V0UmlnaHQgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy54ICsgdGhpcy53aWR0aDtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldEJvdHRvbSA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLnkgKyB0aGlzLmhlaWdodDtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbiAoYSlcbntcbiAgaWYgKHRoaXMuZ2V0UmlnaHQoKSA8IGEueClcbiAge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLmdldEJvdHRvbSgpIDwgYS55KVxuICB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGEuZ2V0UmlnaHQoKSA8IHRoaXMueClcbiAge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChhLmdldEJvdHRvbSgpIDwgdGhpcy55KVxuICB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5SZWN0YW5nbGVELnByb3RvdHlwZS5nZXRDZW50ZXJYID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMueCArIHRoaXMud2lkdGggLyAyO1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuZ2V0TWluWCA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLmdldFgoKTtcbn07XG5cblJlY3RhbmdsZUQucHJvdG90eXBlLmdldE1heFggPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy5nZXRYKCkgKyB0aGlzLndpZHRoO1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuZ2V0Q2VudGVyWSA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLnkgKyB0aGlzLmhlaWdodCAvIDI7XG59O1xuXG5SZWN0YW5nbGVELnByb3RvdHlwZS5nZXRNaW5ZID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMuZ2V0WSgpO1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuZ2V0TWF4WSA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLmdldFkoKSArIHRoaXMuaGVpZ2h0O1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuZ2V0V2lkdGhIYWxmID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMud2lkdGggLyAyO1xufTtcblxuUmVjdGFuZ2xlRC5wcm90b3R5cGUuZ2V0SGVpZ2h0SGFsZiA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLmhlaWdodCAvIDI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlY3RhbmdsZUQ7XG4iLCJmdW5jdGlvbiBUcmFuc2Zvcm0oeCwgeSkge1xuICB0aGlzLmx3b3JsZE9yZ1ggPSAwLjA7XG4gIHRoaXMubHdvcmxkT3JnWSA9IDAuMDtcbiAgdGhpcy5sZGV2aWNlT3JnWCA9IDAuMDtcbiAgdGhpcy5sZGV2aWNlT3JnWSA9IDAuMDtcbiAgdGhpcy5sd29ybGRFeHRYID0gMS4wO1xuICB0aGlzLmx3b3JsZEV4dFkgPSAxLjA7XG4gIHRoaXMubGRldmljZUV4dFggPSAxLjA7XG4gIHRoaXMubGRldmljZUV4dFkgPSAxLjA7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuZ2V0V29ybGRPcmdYID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMubHdvcmxkT3JnWDtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZS5zZXRXb3JsZE9yZ1ggPSBmdW5jdGlvbiAod294KVxue1xuICB0aGlzLmx3b3JsZE9yZ1ggPSB3b3g7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuZ2V0V29ybGRPcmdZID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMubHdvcmxkT3JnWTtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZS5zZXRXb3JsZE9yZ1kgPSBmdW5jdGlvbiAod295KVxue1xuICB0aGlzLmx3b3JsZE9yZ1kgPSB3b3k7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuZ2V0V29ybGRFeHRYID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMubHdvcmxkRXh0WDtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZS5zZXRXb3JsZEV4dFggPSBmdW5jdGlvbiAod2V4KVxue1xuICB0aGlzLmx3b3JsZEV4dFggPSB3ZXg7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuZ2V0V29ybGRFeHRZID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMubHdvcmxkRXh0WTtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZS5zZXRXb3JsZEV4dFkgPSBmdW5jdGlvbiAod2V5KVxue1xuICB0aGlzLmx3b3JsZEV4dFkgPSB3ZXk7XG59XG5cbi8qIERldmljZSByZWxhdGVkICovXG5cblRyYW5zZm9ybS5wcm90b3R5cGUuZ2V0RGV2aWNlT3JnWCA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLmxkZXZpY2VPcmdYO1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnNldERldmljZU9yZ1ggPSBmdW5jdGlvbiAoZG94KVxue1xuICB0aGlzLmxkZXZpY2VPcmdYID0gZG94O1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLmdldERldmljZU9yZ1kgPSBmdW5jdGlvbiAoKVxue1xuICByZXR1cm4gdGhpcy5sZGV2aWNlT3JnWTtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZS5zZXREZXZpY2VPcmdZID0gZnVuY3Rpb24gKGRveSlcbntcbiAgdGhpcy5sZGV2aWNlT3JnWSA9IGRveTtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZS5nZXREZXZpY2VFeHRYID0gZnVuY3Rpb24gKClcbntcbiAgcmV0dXJuIHRoaXMubGRldmljZUV4dFg7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuc2V0RGV2aWNlRXh0WCA9IGZ1bmN0aW9uIChkZXgpXG57XG4gIHRoaXMubGRldmljZUV4dFggPSBkZXg7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuZ2V0RGV2aWNlRXh0WSA9IGZ1bmN0aW9uICgpXG57XG4gIHJldHVybiB0aGlzLmxkZXZpY2VFeHRZO1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnNldERldmljZUV4dFkgPSBmdW5jdGlvbiAoZGV5KVxue1xuICB0aGlzLmxkZXZpY2VFeHRZID0gZGV5O1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnRyYW5zZm9ybVggPSBmdW5jdGlvbiAoeClcbntcbiAgdmFyIHhEZXZpY2UgPSAwLjA7XG4gIHZhciB3b3JsZEV4dFggPSB0aGlzLmx3b3JsZEV4dFg7XG4gIGlmICh3b3JsZEV4dFggIT0gMC4wKVxuICB7XG4gICAgeERldmljZSA9IHRoaXMubGRldmljZU9yZ1ggK1xuICAgICAgICAgICAgKCh4IC0gdGhpcy5sd29ybGRPcmdYKSAqIHRoaXMubGRldmljZUV4dFggLyB3b3JsZEV4dFgpO1xuICB9XG5cbiAgcmV0dXJuIHhEZXZpY2U7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUudHJhbnNmb3JtWSA9IGZ1bmN0aW9uICh5KVxue1xuICB2YXIgeURldmljZSA9IDAuMDtcbiAgdmFyIHdvcmxkRXh0WSA9IHRoaXMubHdvcmxkRXh0WTtcbiAgaWYgKHdvcmxkRXh0WSAhPSAwLjApXG4gIHtcbiAgICB5RGV2aWNlID0gdGhpcy5sZGV2aWNlT3JnWSArXG4gICAgICAgICAgICAoKHkgLSB0aGlzLmx3b3JsZE9yZ1kpICogdGhpcy5sZGV2aWNlRXh0WSAvIHdvcmxkRXh0WSk7XG4gIH1cblxuXG4gIHJldHVybiB5RGV2aWNlO1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLmludmVyc2VUcmFuc2Zvcm1YID0gZnVuY3Rpb24gKHgpXG57XG4gIHZhciB4V29ybGQgPSAwLjA7XG4gIHZhciBkZXZpY2VFeHRYID0gdGhpcy5sZGV2aWNlRXh0WDtcbiAgaWYgKGRldmljZUV4dFggIT0gMC4wKVxuICB7XG4gICAgeFdvcmxkID0gdGhpcy5sd29ybGRPcmdYICtcbiAgICAgICAgICAgICgoeCAtIHRoaXMubGRldmljZU9yZ1gpICogdGhpcy5sd29ybGRFeHRYIC8gZGV2aWNlRXh0WCk7XG4gIH1cblxuXG4gIHJldHVybiB4V29ybGQ7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuaW52ZXJzZVRyYW5zZm9ybVkgPSBmdW5jdGlvbiAoeSlcbntcbiAgdmFyIHlXb3JsZCA9IDAuMDtcbiAgdmFyIGRldmljZUV4dFkgPSB0aGlzLmxkZXZpY2VFeHRZO1xuICBpZiAoZGV2aWNlRXh0WSAhPSAwLjApXG4gIHtcbiAgICB5V29ybGQgPSB0aGlzLmx3b3JsZE9yZ1kgK1xuICAgICAgICAgICAgKCh5IC0gdGhpcy5sZGV2aWNlT3JnWSkgKiB0aGlzLmx3b3JsZEV4dFkgLyBkZXZpY2VFeHRZKTtcbiAgfVxuICByZXR1cm4geVdvcmxkO1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLmludmVyc2VUcmFuc2Zvcm1Qb2ludCA9IGZ1bmN0aW9uIChpblBvaW50KVxue1xuICB2YXIgb3V0UG9pbnQgPVxuICAgICAgICAgIG5ldyBQb2ludEQodGhpcy5pbnZlcnNlVHJhbnNmb3JtWChpblBvaW50LngpLFxuICAgICAgICAgICAgICAgICAgdGhpcy5pbnZlcnNlVHJhbnNmb3JtWShpblBvaW50LnkpKTtcbiAgcmV0dXJuIG91dFBvaW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybTtcbiIsImZ1bmN0aW9uIFVuaXF1ZUlER2VuZXJldG9yKCkge1xufVxuXG5VbmlxdWVJREdlbmVyZXRvci5sYXN0SUQgPSAwO1xuXG5VbmlxdWVJREdlbmVyZXRvci5jcmVhdGVJRCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKFVuaXF1ZUlER2VuZXJldG9yLmlzUHJpbWl0aXZlKG9iaikpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG4gIGlmIChvYmoudW5pcXVlSUQgIT0gbnVsbCkge1xuICAgIHJldHVybiBvYmoudW5pcXVlSUQ7XG4gIH1cbiAgb2JqLnVuaXF1ZUlEID0gVW5pcXVlSURHZW5lcmV0b3IuZ2V0U3RyaW5nKCk7XG4gIFVuaXF1ZUlER2VuZXJldG9yLmxhc3RJRCsrO1xuICByZXR1cm4gb2JqLnVuaXF1ZUlEO1xufVxuXG5VbmlxdWVJREdlbmVyZXRvci5nZXRTdHJpbmcgPSBmdW5jdGlvbiAoaWQpIHtcbiAgaWYgKGlkID09IG51bGwpXG4gICAgaWQgPSBVbmlxdWVJREdlbmVyZXRvci5sYXN0SUQ7XG4gIHJldHVybiBcIk9iamVjdCNcIiArIGlkICsgXCJcIjtcbn1cblxuVW5pcXVlSURHZW5lcmV0b3IuaXNQcmltaXRpdmUgPSBmdW5jdGlvbiAoYXJnKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIGFyZztcbiAgcmV0dXJuIGFyZyA9PSBudWxsIHx8ICh0eXBlICE9IFwib2JqZWN0XCIgJiYgdHlwZSAhPSBcImZ1bmN0aW9uXCIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVuaXF1ZUlER2VuZXJldG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGhyZWFkO1xuXG52YXIgRGltZW5zaW9uRCA9IHJlcXVpcmUoJy4vRGltZW5zaW9uRCcpO1xudmFyIEhhc2hNYXAgPSByZXF1aXJlKCcuL0hhc2hNYXAnKTtcbnZhciBIYXNoU2V0ID0gcmVxdWlyZSgnLi9IYXNoU2V0Jyk7XG52YXIgSUdlb21ldHJ5ID0gcmVxdWlyZSgnLi9JR2VvbWV0cnknKTtcbnZhciBJTWF0aCA9IHJlcXVpcmUoJy4vSU1hdGgnKTtcbnZhciBJbnRlZ2VyID0gcmVxdWlyZSgnLi9JbnRlZ2VyJyk7XG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL1BvaW50Jyk7XG52YXIgUG9pbnREID0gcmVxdWlyZSgnLi9Qb2ludEQnKTtcbnZhciBSYW5kb21TZWVkID0gcmVxdWlyZSgnLi9SYW5kb21TZWVkJyk7XG52YXIgUmVjdGFuZ2xlRCA9IHJlcXVpcmUoJy4vUmVjdGFuZ2xlRCcpO1xudmFyIFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vVHJhbnNmb3JtJyk7XG52YXIgVW5pcXVlSURHZW5lcmV0b3IgPSByZXF1aXJlKCcuL1VuaXF1ZUlER2VuZXJldG9yJyk7XG52YXIgTEdyYXBoT2JqZWN0ID0gcmVxdWlyZSgnLi9MR3JhcGhPYmplY3QnKTtcbnZhciBMR3JhcGggPSByZXF1aXJlKCcuL0xHcmFwaCcpO1xudmFyIExFZGdlID0gcmVxdWlyZSgnLi9MRWRnZScpO1xudmFyIExHcmFwaE1hbmFnZXIgPSByZXF1aXJlKCcuL0xHcmFwaE1hbmFnZXInKTtcbnZhciBMTm9kZSA9IHJlcXVpcmUoJy4vTE5vZGUnKTtcbnZhciBMYXlvdXQgPSByZXF1aXJlKCcuL0xheW91dCcpO1xudmFyIExheW91dENvbnN0YW50cyA9IHJlcXVpcmUoJy4vTGF5b3V0Q29uc3RhbnRzJyk7XG52YXIgRkRMYXlvdXQgPSByZXF1aXJlKCcuL0ZETGF5b3V0Jyk7XG52YXIgRkRMYXlvdXRDb25zdGFudHMgPSByZXF1aXJlKCcuL0ZETGF5b3V0Q29uc3RhbnRzJyk7XG52YXIgRkRMYXlvdXRFZGdlID0gcmVxdWlyZSgnLi9GRExheW91dEVkZ2UnKTtcbnZhciBGRExheW91dE5vZGUgPSByZXF1aXJlKCcuL0ZETGF5b3V0Tm9kZScpO1xudmFyIENvU0VDb25zdGFudHMgPSByZXF1aXJlKCcuL0NvU0VDb25zdGFudHMnKTtcbnZhciBDb1NFRWRnZSA9IHJlcXVpcmUoJy4vQ29TRUVkZ2UnKTtcbnZhciBDb1NFR3JhcGggPSByZXF1aXJlKCcuL0NvU0VHcmFwaCcpO1xudmFyIENvU0VHcmFwaE1hbmFnZXIgPSByZXF1aXJlKCcuL0NvU0VHcmFwaE1hbmFnZXInKTtcbnZhciBDb1NFTGF5b3V0ID0gcmVxdWlyZSgnLi9Db1NFTGF5b3V0Jyk7XG52YXIgQ29TRU5vZGUgPSByZXF1aXJlKCcuL0NvU0VOb2RlJyk7XG52YXIgbGF5b3V0T3B0aW9uc1BhY2sgPSByZXF1aXJlKCcuL2xheW91dE9wdGlvbnNQYWNrJyk7XG5cbmxheW91dE9wdGlvbnNQYWNrLmxheW91dFF1YWxpdHk7IC8vIHByb29mLCBkZWZhdWx0LCBkcmFmdFxubGF5b3V0T3B0aW9uc1BhY2suYW5pbWF0aW9uRHVyaW5nTGF5b3V0OyAvLyBULUZcbmxheW91dE9wdGlvbnNQYWNrLmFuaW1hdGlvbk9uTGF5b3V0OyAvLyBULUZcbmxheW91dE9wdGlvbnNQYWNrLmFuaW1hdGlvblBlcmlvZDsgLy8gMC0xMDBcbmxheW91dE9wdGlvbnNQYWNrLmluY3JlbWVudGFsOyAvLyBULUZcbmxheW91dE9wdGlvbnNQYWNrLmNyZWF0ZUJlbmRzQXNOZWVkZWQ7IC8vIFQtRlxubGF5b3V0T3B0aW9uc1BhY2sudW5pZm9ybUxlYWZOb2RlU2l6ZXM7IC8vIFQtRlxuXG5sYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0TGF5b3V0UXVhbGl0eSA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX1FVQUxJVFk7XG5sYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0QW5pbWF0aW9uRHVyaW5nTGF5b3V0ID0gTGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfQU5JTUFUSU9OX0RVUklOR19MQVlPVVQ7XG5sYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0QW5pbWF0aW9uT25MYXlvdXQgPSBMYXlvdXRDb25zdGFudHMuREVGQVVMVF9BTklNQVRJT05fT05fTEFZT1VUO1xubGF5b3V0T3B0aW9uc1BhY2suZGVmYXVsdEFuaW1hdGlvblBlcmlvZCA9IDUwO1xubGF5b3V0T3B0aW9uc1BhY2suZGVmYXVsdEluY3JlbWVudGFsID0gTGF5b3V0Q29uc3RhbnRzLkRFRkFVTFRfSU5DUkVNRU5UQUw7XG5sYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0Q3JlYXRlQmVuZHNBc05lZWRlZCA9IExheW91dENvbnN0YW50cy5ERUZBVUxUX0NSRUFURV9CRU5EU19BU19ORUVERUQ7XG5sYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0VW5pZm9ybUxlYWZOb2RlU2l6ZXMgPSBMYXlvdXRDb25zdGFudHMuREVGQVVMVF9VTklGT1JNX0xFQUZfTk9ERV9TSVpFUztcblxuZnVuY3Rpb24gc2V0RGVmYXVsdExheW91dFByb3BlcnRpZXMoKSB7XG4gIGxheW91dE9wdGlvbnNQYWNrLmxheW91dFF1YWxpdHkgPSBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0TGF5b3V0UXVhbGl0eTtcbiAgbGF5b3V0T3B0aW9uc1BhY2suYW5pbWF0aW9uRHVyaW5nTGF5b3V0ID0gbGF5b3V0T3B0aW9uc1BhY2suZGVmYXVsdEFuaW1hdGlvbkR1cmluZ0xheW91dDtcbiAgbGF5b3V0T3B0aW9uc1BhY2suYW5pbWF0aW9uT25MYXlvdXQgPSBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0QW5pbWF0aW9uT25MYXlvdXQ7XG4gIGxheW91dE9wdGlvbnNQYWNrLmFuaW1hdGlvblBlcmlvZCA9IGxheW91dE9wdGlvbnNQYWNrLmRlZmF1bHRBbmltYXRpb25QZXJpb2Q7XG4gIGxheW91dE9wdGlvbnNQYWNrLmluY3JlbWVudGFsID0gbGF5b3V0T3B0aW9uc1BhY2suZGVmYXVsdEluY3JlbWVudGFsO1xuICBsYXlvdXRPcHRpb25zUGFjay5jcmVhdGVCZW5kc0FzTmVlZGVkID0gbGF5b3V0T3B0aW9uc1BhY2suZGVmYXVsdENyZWF0ZUJlbmRzQXNOZWVkZWQ7XG4gIGxheW91dE9wdGlvbnNQYWNrLnVuaWZvcm1MZWFmTm9kZVNpemVzID0gbGF5b3V0T3B0aW9uc1BhY2suZGVmYXVsdFVuaWZvcm1MZWFmTm9kZVNpemVzO1xufVxuXG5zZXREZWZhdWx0TGF5b3V0UHJvcGVydGllcygpO1xuXG5mdW5jdGlvbiBmaWxsQ29zZUxheW91dE9wdGlvbnNQYWNrKCkge1xuICBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0SWRlYWxFZGdlTGVuZ3RoID0gQ29TRUNvbnN0YW50cy5ERUZBVUxUX0VER0VfTEVOR1RIO1xuICBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0U3ByaW5nU3RyZW5ndGggPSA1MDtcbiAgbGF5b3V0T3B0aW9uc1BhY2suZGVmYXVsdFJlcHVsc2lvblN0cmVuZ3RoID0gNTA7XG4gIGxheW91dE9wdGlvbnNQYWNrLmRlZmF1bHRTbWFydFJlcHVsc2lvblJhbmdlQ2FsYyA9IENvU0VDb25zdGFudHMuREVGQVVMVF9VU0VfU01BUlRfUkVQVUxTSU9OX1JBTkdFX0NBTENVTEFUSU9OO1xuICBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0R3Jhdml0eVN0cmVuZ3RoID0gNTA7XG4gIGxheW91dE9wdGlvbnNQYWNrLmRlZmF1bHRHcmF2aXR5UmFuZ2UgPSA1MDtcbiAgbGF5b3V0T3B0aW9uc1BhY2suZGVmYXVsdENvbXBvdW5kR3Jhdml0eVN0cmVuZ3RoID0gNTA7XG4gIGxheW91dE9wdGlvbnNQYWNrLmRlZmF1bHRDb21wb3VuZEdyYXZpdHlSYW5nZSA9IDUwO1xuICBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0U21hcnRFZGdlTGVuZ3RoQ2FsYyA9IENvU0VDb25zdGFudHMuREVGQVVMVF9VU0VfU01BUlRfSURFQUxfRURHRV9MRU5HVEhfQ0FMQ1VMQVRJT047XG4gIGxheW91dE9wdGlvbnNQYWNrLmRlZmF1bHRNdWx0aUxldmVsU2NhbGluZyA9IENvU0VDb25zdGFudHMuREVGQVVMVF9VU0VfTVVMVElfTEVWRUxfU0NBTElORztcblxuICBsYXlvdXRPcHRpb25zUGFjay5pZGVhbEVkZ2VMZW5ndGggPSBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0SWRlYWxFZGdlTGVuZ3RoO1xuICBsYXlvdXRPcHRpb25zUGFjay5zcHJpbmdTdHJlbmd0aCA9IGxheW91dE9wdGlvbnNQYWNrLmRlZmF1bHRTcHJpbmdTdHJlbmd0aDtcbiAgbGF5b3V0T3B0aW9uc1BhY2sucmVwdWxzaW9uU3RyZW5ndGggPSBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0UmVwdWxzaW9uU3RyZW5ndGg7XG4gIGxheW91dE9wdGlvbnNQYWNrLnNtYXJ0UmVwdWxzaW9uUmFuZ2VDYWxjID0gbGF5b3V0T3B0aW9uc1BhY2suZGVmYXVsdFNtYXJ0UmVwdWxzaW9uUmFuZ2VDYWxjO1xuICBsYXlvdXRPcHRpb25zUGFjay5ncmF2aXR5U3RyZW5ndGggPSBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0R3Jhdml0eVN0cmVuZ3RoO1xuICBsYXlvdXRPcHRpb25zUGFjay5ncmF2aXR5UmFuZ2UgPSBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0R3Jhdml0eVJhbmdlO1xuICBsYXlvdXRPcHRpb25zUGFjay5jb21wb3VuZEdyYXZpdHlTdHJlbmd0aCA9IGxheW91dE9wdGlvbnNQYWNrLmRlZmF1bHRDb21wb3VuZEdyYXZpdHlTdHJlbmd0aDtcbiAgbGF5b3V0T3B0aW9uc1BhY2suY29tcG91bmRHcmF2aXR5UmFuZ2UgPSBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0Q29tcG91bmRHcmF2aXR5UmFuZ2U7XG4gIGxheW91dE9wdGlvbnNQYWNrLnNtYXJ0RWRnZUxlbmd0aENhbGMgPSBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0U21hcnRFZGdlTGVuZ3RoQ2FsYztcbiAgbGF5b3V0T3B0aW9uc1BhY2subXVsdGlMZXZlbFNjYWxpbmcgPSBsYXlvdXRPcHRpb25zUGFjay5kZWZhdWx0TXVsdGlMZXZlbFNjYWxpbmc7XG59XG5cbl9Db1NFTGF5b3V0LmlkVG9MTm9kZSA9IHt9O1xuX0NvU0VMYXlvdXQudG9CZVRpbGVkID0ge307XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgLy8gQ2FsbGVkIG9uIGBsYXlvdXRyZWFkeWBcbiAgcmVhZHk6IGZ1bmN0aW9uICgpIHtcbiAgfSxcbiAgLy8gQ2FsbGVkIG9uIGBsYXlvdXRzdG9wYFxuICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gIH0sXG4gIC8vIFdoZXRoZXIgdG8gZml0IHRoZSBuZXR3b3JrIHZpZXcgYWZ0ZXIgd2hlbiBkb25lXG4gIGZpdDogdHJ1ZSxcbiAgLy8gUGFkZGluZyBvbiBmaXRcbiAgcGFkZGluZzogMTAsXG4gIC8vIFdoZXRoZXIgdG8gZW5hYmxlIGluY3JlbWVudGFsIG1vZGVcbiAgcmFuZG9taXplOiBmYWxzZSxcbiAgLy8gTm9kZSByZXB1bHNpb24gKG5vbiBvdmVybGFwcGluZykgbXVsdGlwbGllclxuICBub2RlUmVwdWxzaW9uOiA0NTAwLFxuICAvLyBJZGVhbCBlZGdlIChub24gbmVzdGVkKSBsZW5ndGhcbiAgaWRlYWxFZGdlTGVuZ3RoOiA1MCxcbiAgLy8gRGl2aXNvciB0byBjb21wdXRlIGVkZ2UgZm9yY2VzXG4gIGVkZ2VFbGFzdGljaXR5OiAwLjQ1LFxuICAvLyBOZXN0aW5nIGZhY3RvciAobXVsdGlwbGllcikgdG8gY29tcHV0ZSBpZGVhbCBlZGdlIGxlbmd0aCBmb3IgbmVzdGVkIGVkZ2VzXG4gIG5lc3RpbmdGYWN0b3I6IDAuMSxcbiAgLy8gR3Jhdml0eSBmb3JjZSAoY29uc3RhbnQpXG4gIGdyYXZpdHk6IDAuNCxcbiAgLy8gTWF4aW11bSBudW1iZXIgb2YgaXRlcmF0aW9ucyB0byBwZXJmb3JtXG4gIG51bUl0ZXI6IDI1MDAsXG4gIC8vIEZvciBlbmFibGluZyB0aWxpbmdcbiAgdGlsZTogdHJ1ZSxcbiAgLy93aGV0aGVyIHRvIG1ha2UgYW5pbWF0aW9uIHdoaWxlIHBlcmZvcm1pbmcgdGhlIGxheW91dFxuICBhbmltYXRlOiB0cnVlXG59O1xuXG5mdW5jdGlvbiBleHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMpIHtcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGZvciAodmFyIGkgaW4gZGVmYXVsdHMpIHtcbiAgICBvYmpbaV0gPSBkZWZhdWx0c1tpXTtcbiAgfVxuXG4gIGZvciAodmFyIGkgaW4gb3B0aW9ucykge1xuICAgIG9ialtpXSA9IG9wdGlvbnNbaV07XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuO1xuXG5fQ29TRUxheW91dC5sYXlvdXQgPSBuZXcgQ29TRUxheW91dCgpO1xuZnVuY3Rpb24gX0NvU0VMYXlvdXQob3B0aW9ucykge1xuXG4gIHRoaXMub3B0aW9ucyA9IGV4dGVuZChkZWZhdWx0cywgb3B0aW9ucyk7XG4gIEZETGF5b3V0Q29uc3RhbnRzLmdldFVzZXJPcHRpb25zKHRoaXMub3B0aW9ucyk7XG4gIGZpbGxDb3NlTGF5b3V0T3B0aW9uc1BhY2soKTtcbn1cblxuX0NvU0VMYXlvdXQucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGxheW91dCA9IHRoaXM7XG5cbiAgX0NvU0VMYXlvdXQuaWRUb0xOb2RlID0ge307XG4gIF9Db1NFTGF5b3V0LnRvQmVUaWxlZCA9IHt9O1xuICBfQ29TRUxheW91dC5sYXlvdXQgPSBuZXcgQ29TRUxheW91dCgpO1xuICB0aGlzLmN5ID0gdGhpcy5vcHRpb25zLmN5O1xuICB2YXIgYWZ0ZXIgPSB0aGlzO1xuXG4gIHRoaXMuY3kudHJpZ2dlcignbGF5b3V0c3RhcnQnKTtcblxuICB2YXIgZ20gPSBfQ29TRUxheW91dC5sYXlvdXQubmV3R3JhcGhNYW5hZ2VyKCk7XG4gIHRoaXMuZ20gPSBnbTtcblxuICB2YXIgbm9kZXMgPSB0aGlzLm9wdGlvbnMuZWxlcy5ub2RlcygpO1xuICB2YXIgZWRnZXMgPSB0aGlzLm9wdGlvbnMuZWxlcy5lZGdlcygpO1xuXG4gIHRoaXMucm9vdCA9IGdtLmFkZFJvb3QoKTtcblxuICBpZiAoIXRoaXMub3B0aW9ucy50aWxlKSB7XG4gICAgdGhpcy5wcm9jZXNzQ2hpbGRyZW5MaXN0KHRoaXMucm9vdCwgbm9kZXMub3JwaGFucygpKTtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBGaW5kIHplcm8gZGVncmVlIG5vZGVzIGFuZCBjcmVhdGUgYSBjb21wb3VuZCBmb3IgZWFjaCBsZXZlbFxuICAgIHZhciBtZW1iZXJHcm91cHMgPSB0aGlzLmdyb3VwWmVyb0RlZ3JlZU1lbWJlcnMoKTtcbiAgICAvLyBUaWxlIGFuZCBjbGVhciBjaGlsZHJlbiBvZiBlYWNoIGNvbXBvdW5kXG4gICAgdmFyIHRpbGVkTWVtYmVyUGFjayA9IHRoaXMuY2xlYXJDb21wb3VuZHModGhpcy5vcHRpb25zKTtcbiAgICAvLyBTZXBhcmF0ZWx5IHRpbGUgYW5kIGNsZWFyIHplcm8gZGVncmVlIG5vZGVzIGZvciBlYWNoIGxldmVsXG4gICAgdmFyIHRpbGVkWmVyb0RlZ3JlZU5vZGVzID0gdGhpcy5jbGVhclplcm9EZWdyZWVNZW1iZXJzKG1lbWJlckdyb3Vwcyk7XG4gIH1cblxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZWRnZSA9IGVkZ2VzW2ldO1xuICAgIHZhciBzb3VyY2VOb2RlID0gX0NvU0VMYXlvdXQuaWRUb0xOb2RlW2VkZ2UuZGF0YShcInNvdXJjZVwiKV07XG4gICAgdmFyIHRhcmdldE5vZGUgPSBfQ29TRUxheW91dC5pZFRvTE5vZGVbZWRnZS5kYXRhKFwidGFyZ2V0XCIpXTtcbiAgICB2YXIgZTEgPSBnbS5hZGQoX0NvU0VMYXlvdXQubGF5b3V0Lm5ld0VkZ2UoKSwgc291cmNlTm9kZSwgdGFyZ2V0Tm9kZSk7XG4gICAgZTEuaWQgPSBlZGdlLmlkKCk7XG4gIH1cblxuXG4gIHZhciB0MSA9IGxheW91dC50aHJlYWQ7XG5cbiAgaWYgKCF0MSB8fCB0MS5zdG9wcGVkKCkpIHsgLy8gdHJ5IHRvIHJldXNlIHRocmVhZHNcbiAgICB0MSA9IGxheW91dC50aHJlYWQgPSBUaHJlYWQoKTtcblxuICAgIHQxLnJlcXVpcmUoRGltZW5zaW9uRCwgJ0RpbWVuc2lvbkQnKTtcbiAgICB0MS5yZXF1aXJlKEhhc2hNYXAsICdIYXNoTWFwJyk7XG4gICAgdDEucmVxdWlyZShIYXNoU2V0LCAnSGFzaFNldCcpO1xuICAgIHQxLnJlcXVpcmUoSUdlb21ldHJ5LCAnSUdlb21ldHJ5Jyk7XG4gICAgdDEucmVxdWlyZShJTWF0aCwgJ0lNYXRoJyk7XG4gICAgdDEucmVxdWlyZShJbnRlZ2VyLCAnSW50ZWdlcicpO1xuICAgIHQxLnJlcXVpcmUoUG9pbnQsICdQb2ludCcpO1xuICAgIHQxLnJlcXVpcmUoUG9pbnRELCAnUG9pbnREJyk7XG4gICAgdDEucmVxdWlyZShSYW5kb21TZWVkLCAnUmFuZG9tU2VlZCcpO1xuICAgIHQxLnJlcXVpcmUoUmVjdGFuZ2xlRCwgJ1JlY3RhbmdsZUQnKTtcbiAgICB0MS5yZXF1aXJlKFRyYW5zZm9ybSwgJ1RyYW5zZm9ybScpO1xuICAgIHQxLnJlcXVpcmUoVW5pcXVlSURHZW5lcmV0b3IsICdVbmlxdWVJREdlbmVyZXRvcicpO1xuICAgIHQxLnJlcXVpcmUoTEdyYXBoT2JqZWN0LCAnTEdyYXBoT2JqZWN0Jyk7XG4gICAgdDEucmVxdWlyZShMR3JhcGgsICdMR3JhcGgnKTtcbiAgICB0MS5yZXF1aXJlKExFZGdlLCAnTEVkZ2UnKTtcbiAgICB0MS5yZXF1aXJlKExHcmFwaE1hbmFnZXIsICdMR3JhcGhNYW5hZ2VyJyk7XG4gICAgdDEucmVxdWlyZShMTm9kZSwgJ0xOb2RlJyk7XG4gICAgdDEucmVxdWlyZShMYXlvdXQsICdMYXlvdXQnKTtcbiAgICB0MS5yZXF1aXJlKExheW91dENvbnN0YW50cywgJ0xheW91dENvbnN0YW50cycpO1xuICAgIHQxLnJlcXVpcmUobGF5b3V0T3B0aW9uc1BhY2ssICdsYXlvdXRPcHRpb25zUGFjaycpO1xuICAgIHQxLnJlcXVpcmUoRkRMYXlvdXQsICdGRExheW91dCcpO1xuICAgIHQxLnJlcXVpcmUoRkRMYXlvdXRDb25zdGFudHMsICdGRExheW91dENvbnN0YW50cycpO1xuICAgIHQxLnJlcXVpcmUoRkRMYXlvdXRFZGdlLCAnRkRMYXlvdXRFZGdlJyk7XG4gICAgdDEucmVxdWlyZShGRExheW91dE5vZGUsICdGRExheW91dE5vZGUnKTtcbiAgICB0MS5yZXF1aXJlKENvU0VDb25zdGFudHMsICdDb1NFQ29uc3RhbnRzJyk7XG4gICAgdDEucmVxdWlyZShDb1NFRWRnZSwgJ0NvU0VFZGdlJyk7XG4gICAgdDEucmVxdWlyZShDb1NFR3JhcGgsICdDb1NFR3JhcGgnKTtcbiAgICB0MS5yZXF1aXJlKENvU0VHcmFwaE1hbmFnZXIsICdDb1NFR3JhcGhNYW5hZ2VyJyk7XG4gICAgdDEucmVxdWlyZShDb1NFTGF5b3V0LCAnQ29TRUxheW91dCcpO1xuICAgIHQxLnJlcXVpcmUoQ29TRU5vZGUsICdDb1NFTm9kZScpO1xuICB9XG5cbiAgdmFyIG5vZGVzID0gdGhpcy5vcHRpb25zLmVsZXMubm9kZXMoKTtcbiAgdmFyIGVkZ2VzID0gdGhpcy5vcHRpb25zLmVsZXMuZWRnZXMoKTtcblxuICAvLyBGaXJzdCBJIG5lZWQgdG8gY3JlYXRlIHRoZSBkYXRhIHN0cnVjdHVyZSB0byBwYXNzIHRvIHRoZSB3b3JrZXJcbiAgdmFyIHBEYXRhID0ge1xuICAgICdub2Rlcyc6IFtdLFxuICAgICdlZGdlcyc6IFtdXG4gIH07XG5cbiAgdmFyIGxub2RlcyA9IGdtLmdldEFsbE5vZGVzKCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGxub2RlID0gbG5vZGVzW2ldO1xuICAgIHZhciBub2RlSWQgPSBsbm9kZS5pZDtcbiAgICB2YXIgY3lOb2RlID0gdGhpcy5vcHRpb25zLmN5LmdldEVsZW1lbnRCeUlkKG5vZGVJZCk7XG4gICAgdmFyIHBhcmVudElkID0gY3lOb2RlLmRhdGEoJ3BhcmVudCcpO1xuICAgIHZhciB3ID0gbG5vZGUucmVjdC53aWR0aDtcbiAgICB2YXIgcG9zWCA9IGxub2RlLnJlY3QueDtcbiAgICB2YXIgcG9zWSA9IGxub2RlLnJlY3QueTtcbiAgICB2YXIgaCA9IGxub2RlLnJlY3QuaGVpZ2h0O1xuICAgIHZhciBkdW1teV9wYXJlbnRfaWQgPSBjeU5vZGUuZGF0YSgnZHVtbXlfcGFyZW50X2lkJyk7XG5cbiAgICBwRGF0YVsgJ25vZGVzJyBdLnB1c2goe1xuICAgICAgaWQ6IG5vZGVJZCxcbiAgICAgIHBpZDogcGFyZW50SWQsXG4gICAgICB4OiBwb3NYLFxuICAgICAgeTogcG9zWSxcbiAgICAgIHdpZHRoOiB3LFxuICAgICAgaGVpZ2h0OiBoLFxuICAgICAgZHVtbXlfcGFyZW50X2lkOiBkdW1teV9wYXJlbnRfaWRcbiAgICB9KTtcblxuICB9XG5cbiAgdmFyIGxlZGdlcyA9IGdtLmdldEFsbEVkZ2VzKCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGxlZGdlID0gbGVkZ2VzW2ldO1xuICAgIHZhciBlZGdlSWQgPSBsZWRnZS5pZDtcbiAgICB2YXIgY3lFZGdlID0gdGhpcy5vcHRpb25zLmN5LmdldEVsZW1lbnRCeUlkKGVkZ2VJZCk7XG4gICAgdmFyIHNyY05vZGVJZCA9IGN5RWRnZS5zb3VyY2UoKS5pZCgpO1xuICAgIHZhciB0Z3ROb2RlSWQgPSBjeUVkZ2UudGFyZ2V0KCkuaWQoKTtcbiAgICBwRGF0YVsgJ2VkZ2VzJyBdLnB1c2goe1xuICAgICAgaWQ6IGVkZ2VJZCxcbiAgICAgIHNvdXJjZTogc3JjTm9kZUlkLFxuICAgICAgdGFyZ2V0OiB0Z3ROb2RlSWRcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZWFkeSA9IGZhbHNlO1xuXG4gIHQxLnBhc3MocERhdGEpLnJ1bihmdW5jdGlvbiAocERhdGEpIHtcbiAgICB2YXIgbG9nID0gZnVuY3Rpb24gKG1zZykge1xuICAgICAgYnJvYWRjYXN0KHtsb2c6IG1zZ30pO1xuICAgIH07XG5cbiAgICBsb2coXCJzdGFydCB0aHJlYWRcIik7XG5cbiAgICAvL3RoZSBsYXlvdXQgd2lsbCBiZSBydW4gaW4gdGhlIHRocmVhZCBhbmQgdGhlIHJlc3VsdHMgYXJlIHRvIGJlIHBhc3NlZFxuICAgIC8vdG8gdGhlIG1haW4gdGhyZWFkIHdpdGggdGhlIHJlc3VsdCBtYXBcbiAgICB2YXIgbGF5b3V0X3QgPSBuZXcgQ29TRUxheW91dCgpO1xuICAgIHZhciBnbV90ID0gbGF5b3V0X3QubmV3R3JhcGhNYW5hZ2VyKCk7XG4gICAgdmFyIG5ncmFwaCA9IGdtX3QubGF5b3V0Lm5ld0dyYXBoKCk7XG4gICAgdmFyIG5ub2RlID0gZ21fdC5sYXlvdXQubmV3Tm9kZShudWxsKTtcbiAgICB2YXIgcm9vdCA9IGdtX3QuYWRkKG5ncmFwaCwgbm5vZGUpO1xuICAgIHJvb3QuZ3JhcGhNYW5hZ2VyID0gZ21fdDtcbiAgICBnbV90LnNldFJvb3RHcmFwaChyb290KTtcbiAgICB2YXIgcm9vdF90ID0gZ21fdC5yb290R3JhcGg7XG5cbiAgICAvL21hcHMgZm9yIGlubmVyIHVzYWdlIG9mIHRoZSB0aHJlYWRcbiAgICB2YXIgb3JwaGFuc190ID0gW107XG4gICAgdmFyIGlkVG9MTm9kZV90ID0ge307XG4gICAgdmFyIGNoaWxkcmVuTWFwID0ge307XG5cbiAgICAvL0EgbWFwIG9mIG5vZGUgaWQgdG8gY29ycmVzcG9uZGluZyBub2RlIHBvc2l0aW9uIGFuZCBzaXplc1xuICAgIC8vaXQgaXMgdG8gYmUgcmV0dXJuZWQgYXQgdGhlIGVuZCBvZiB0aGUgdGhyZWFkIGZ1bmN0aW9uXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gICAgLy90aGlzIGZ1bmN0aW9uIGlzIHNpbWlsYXIgdG8gcHJvY2Vzc0NoaWxkcmVuTGlzdCBmdW5jdGlvbiBpbiB0aGUgbWFpbiB0aHJlYWRcbiAgICAvL2l0IGlzIHRvIHByb2Nlc3MgdGhlIG5vZGVzIGluIGNvcnJlY3Qgb3JkZXIgcmVjdXJzaXZlbHlcbiAgICB2YXIgcHJvY2Vzc05vZGVzID0gZnVuY3Rpb24gKHBhcmVudCwgY2hpbGRyZW4pIHtcbiAgICAgIHZhciBzaXplID0gY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgdmFyIHRoZUNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICAgIHZhciBjaGlsZHJlbl9vZl9jaGlsZHJlbiA9IGNoaWxkcmVuTWFwW3RoZUNoaWxkLmlkXTtcbiAgICAgICAgdmFyIHRoZU5vZGU7XG5cbiAgICAgICAgaWYgKHRoZUNoaWxkLndpZHRoICE9IG51bGxcbiAgICAgICAgICAgICAgICAmJiB0aGVDaGlsZC5oZWlnaHQgIT0gbnVsbCkge1xuICAgICAgICAgIHRoZU5vZGUgPSBwYXJlbnQuYWRkKG5ldyBDb1NFTm9kZShnbV90LFxuICAgICAgICAgICAgICAgICAgbmV3IFBvaW50RCh0aGVDaGlsZC54LCB0aGVDaGlsZC55KSxcbiAgICAgICAgICAgICAgICAgIG5ldyBEaW1lbnNpb25EKHBhcnNlRmxvYXQodGhlQ2hpbGQud2lkdGgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KHRoZUNoaWxkLmhlaWdodCkpKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhlTm9kZSA9IHBhcmVudC5hZGQobmV3IENvU0VOb2RlKGdtX3QpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGVOb2RlLmlkID0gdGhlQ2hpbGQuaWQ7XG4gICAgICAgIGlkVG9MTm9kZV90W3RoZUNoaWxkLmlkXSA9IHRoZU5vZGU7XG5cbiAgICAgICAgaWYgKGlzTmFOKHRoZU5vZGUucmVjdC54KSkge1xuICAgICAgICAgIHRoZU5vZGUucmVjdC54ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc05hTih0aGVOb2RlLnJlY3QueSkpIHtcbiAgICAgICAgICB0aGVOb2RlLnJlY3QueSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hpbGRyZW5fb2ZfY2hpbGRyZW4gIT0gbnVsbCAmJiBjaGlsZHJlbl9vZl9jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHRoZU5ld0dyYXBoO1xuICAgICAgICAgIHRoZU5ld0dyYXBoID0gbGF5b3V0X3QuZ2V0R3JhcGhNYW5hZ2VyKCkuYWRkKGxheW91dF90Lm5ld0dyYXBoKCksIHRoZU5vZGUpO1xuICAgICAgICAgIHRoZU5ld0dyYXBoLmdyYXBoTWFuYWdlciA9IGdtX3Q7XG4gICAgICAgICAgcHJvY2Vzc05vZGVzKHRoZU5ld0dyYXBoLCBjaGlsZHJlbl9vZl9jaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL2ZpbGwgdGhlIGNoaWRyZW5NYXAgYW5kIG9ycGhhbnNfdCBtYXBzIHRvIHByb2Nlc3MgdGhlIG5vZGVzIGluIHRoZSBjb3JyZWN0IG9yZGVyXG4gICAgdmFyIG5vZGVzID0gcERhdGEubm9kZXM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHRoZU5vZGUgPSBub2Rlc1tpXTtcbiAgICAgIHZhciBwX2lkID0gdGhlTm9kZS5waWQ7XG4gICAgICBpZiAocF9pZCAhPSBudWxsKSB7XG4gICAgICAgIGlmIChjaGlsZHJlbk1hcFtwX2lkXSA9PSBudWxsKSB7XG4gICAgICAgICAgY2hpbGRyZW5NYXBbcF9pZF0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZHJlbk1hcFtwX2lkXS5wdXNoKHRoZU5vZGUpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG9ycGhhbnNfdC5wdXNoKHRoZU5vZGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHByb2Nlc3NOb2Rlcyhyb290X3QsIG9ycGhhbnNfdCk7XG5cbiAgICAvL2hhbmRsZSB0aGUgZWRnZXNcbiAgICB2YXIgZWRnZXMgPSBwRGF0YS5lZGdlcztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZWRnZSA9IGVkZ2VzW2ldO1xuICAgICAgdmFyIHNvdXJjZU5vZGUgPSBpZFRvTE5vZGVfdFtlZGdlLnNvdXJjZV07XG4gICAgICB2YXIgdGFyZ2V0Tm9kZSA9IGlkVG9MTm9kZV90W2VkZ2UudGFyZ2V0XTtcbiAgICAgIHZhciBlMSA9IGdtX3QuYWRkKGxheW91dF90Lm5ld0VkZ2UoKSwgc291cmNlTm9kZSwgdGFyZ2V0Tm9kZSk7XG4gICAgfVxuXG4gICAgLy9ydW4gdGhlIGxheW91dCBjcmF0ZWQgaW4gdGhpcyB0aHJlYWRcbiAgICBsYXlvdXRfdC5ydW5MYXlvdXQoKTtcblxuICAgIC8vZmlsbCB0aGUgcmVzdWx0IG1hcFxuICAgIGZvciAodmFyIGlkIGluIGlkVG9MTm9kZV90KSB7XG4gICAgICB2YXIgbE5vZGUgPSBpZFRvTE5vZGVfdFtpZF07XG4gICAgICB2YXIgcmVjdCA9IGxOb2RlLnJlY3Q7XG4gICAgICByZXN1bHRbaWRdID0ge1xuICAgICAgICBpZDogaWQsXG4gICAgICAgIHg6IHJlY3QueCxcbiAgICAgICAgeTogcmVjdC55LFxuICAgICAgICB3OiByZWN0LndpZHRoLFxuICAgICAgICBoOiByZWN0LmhlaWdodFxuICAgICAgfTtcbiAgICB9XG4gICAgdmFyIHNlZWRzID0ge307XG4gICAgc2VlZHMucnNTZWVkID0gUmFuZG9tU2VlZC5zZWVkO1xuICAgIHNlZWRzLnJzWCA9IFJhbmRvbVNlZWQueDtcbiAgICB2YXIgcGFzcyA9IHtcbiAgICAgIHJlc3VsdDogcmVzdWx0LFxuICAgICAgc2VlZHM6IHNlZWRzXG4gICAgfVxuICAgIC8vcmV0dXJuIHRoZSByZXN1bHQgbWFwIHRvIHBhc3MgaXQgdG8gdGhlIHRoZW4gZnVuY3Rpb24gYXMgcGFyYW1ldGVyXG4gICAgcmV0dXJuIHBhc3M7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKHBhc3MpIHtcbiAgICB2YXIgcmVzdWx0ID0gcGFzcy5yZXN1bHQ7XG4gICAgdmFyIHNlZWRzID0gcGFzcy5zZWVkcztcbiAgICBSYW5kb21TZWVkLnNlZWQgPSBzZWVkcy5yc1NlZWQ7XG4gICAgUmFuZG9tU2VlZC54ID0gc2VlZHMucnNYO1xuICAgIC8vcmVmcmVzaCB0aGUgbG5vZGUgcG9zaXRpb25zIGFuZCBzaXplcyBieSB1c2luZyByZXN1bHQgbWFwXG4gICAgZm9yICh2YXIgaWQgaW4gcmVzdWx0KSB7XG4gICAgICB2YXIgbE5vZGUgPSBfQ29TRUxheW91dC5pZFRvTE5vZGVbaWRdO1xuICAgICAgdmFyIG5vZGUgPSByZXN1bHRbaWRdO1xuICAgICAgbE5vZGUucmVjdC54ID0gbm9kZS54O1xuICAgICAgbE5vZGUucmVjdC55ID0gbm9kZS55O1xuICAgICAgbE5vZGUucmVjdC53aWR0aCA9IG5vZGUudztcbiAgICAgIGxOb2RlLnJlY3QuaGVpZ2h0ID0gbm9kZS5oO1xuICAgIH1cbiAgICBpZiAoYWZ0ZXIub3B0aW9ucy50aWxlKSB7XG4gICAgICAvLyBSZXBvcHVsYXRlIG1lbWJlcnNcbiAgICAgIGFmdGVyLnJlcG9wdWxhdGVaZXJvRGVncmVlTWVtYmVycyh0aWxlZFplcm9EZWdyZWVOb2Rlcyk7XG4gICAgICBhZnRlci5yZXBvcHVsYXRlQ29tcG91bmRzKHRpbGVkTWVtYmVyUGFjayk7XG4gICAgICBhZnRlci5vcHRpb25zLmVsZXMubm9kZXMoKS51cGRhdGVDb21wb3VuZEJvdW5kcygpO1xuICAgIH1cblxuICAgIGFmdGVyLm9wdGlvbnMuZWxlcy5ub2RlcygpLnBvc2l0aW9ucyhmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICB2YXIgdGhlSWQgPSBlbGUuZGF0YSgnaWQnKTtcbiAgICAgIHZhciBsTm9kZSA9IF9Db1NFTGF5b3V0LmlkVG9MTm9kZVt0aGVJZF07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IGxOb2RlLmdldFJlY3QoKS5nZXRDZW50ZXJYKCksXG4gICAgICAgIHk6IGxOb2RlLmdldFJlY3QoKS5nZXRDZW50ZXJZKClcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBpZiAoYWZ0ZXIub3B0aW9ucy5maXQpXG4gICAgICBhZnRlci5vcHRpb25zLmN5LmZpdChhZnRlci5vcHRpb25zLmVsZXMubm9kZXMoKSwgYWZ0ZXIub3B0aW9ucy5wYWRkaW5nKTtcblxuICAgIC8vdHJpZ2dlciBsYXlvdXRyZWFkeSB3aGVuIGVhY2ggbm9kZSBoYXMgaGFkIGl0cyBwb3NpdGlvbiBzZXQgYXQgbGVhc3Qgb25jZVxuICAgIGlmICghcmVhZHkpIHtcbiAgICAgIGFmdGVyLmN5Lm9uZSgnbGF5b3V0cmVhZHknLCBhZnRlci5vcHRpb25zLnJlYWR5KTtcbiAgICAgIGFmdGVyLmN5LnRyaWdnZXIoJ2xheW91dHJlYWR5Jyk7XG4gICAgfVxuXG4gICAgLy8gdHJpZ2dlciBsYXlvdXRzdG9wIHdoZW4gdGhlIGxheW91dCBzdG9wcyAoZS5nLiBmaW5pc2hlcylcbiAgICBhZnRlci5jeS5vbmUoJ2xheW91dHN0b3AnLCBhZnRlci5vcHRpb25zLnN0b3ApO1xuICAgIGFmdGVyLmN5LnRyaWdnZXIoJ2xheW91dHN0b3AnKTtcbiAgICB0MS5zdG9wKCk7XG5cbiAgICBhZnRlci5vcHRpb25zLmVsZXMubm9kZXMoKS5yZW1vdmVEYXRhKCdkdW1teV9wYXJlbnRfaWQnKTtcbiAgfSk7XG5cbiAgdDEub24oJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBsb2dNc2cgPSBlLm1lc3NhZ2UubG9nO1xuICAgIGlmIChsb2dNc2cgIT0gbnVsbCkge1xuICAgICAgY29uc29sZS5sb2coJ1RocmVhZCBsb2c6ICcgKyBsb2dNc2cpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcERhdGEgPSBlLm1lc3NhZ2UucERhdGE7XG4gICAgaWYgKHBEYXRhICE9IG51bGwpIHtcbiAgICAgIGFmdGVyLm9wdGlvbnMuZWxlcy5ub2RlcygpLnBvc2l0aW9ucyhmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIGlmIChlbGUuZGF0YSgnZHVtbXlfcGFyZW50X2lkJykpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogcERhdGFbZWxlLmRhdGEoJ2R1bW15X3BhcmVudF9pZCcpXS54LFxuICAgICAgICAgICAgeTogcERhdGFbZWxlLmRhdGEoJ2R1bW15X3BhcmVudF9pZCcpXS55XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGhlSWQgPSBlbGUuZGF0YSgnaWQnKTtcbiAgICAgICAgdmFyIHBOb2RlID0gcERhdGFbdGhlSWRdO1xuICAgICAgICB2YXIgdGVtcCA9IHRoaXM7XG4gICAgICAgIHdoaWxlIChwTm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgdGVtcCA9IHRlbXAucGFyZW50KClbMF07XG4gICAgICAgICAgcE5vZGUgPSBwRGF0YVt0ZW1wLmlkKCldO1xuICAgICAgICAgIHBEYXRhW3RoZUlkXSA9IHBOb2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogcE5vZGUueCxcbiAgICAgICAgICB5OiBwTm9kZS55XG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgaWYgKGFmdGVyLm9wdGlvbnMuZml0KVxuICAgICAgICBhZnRlci5vcHRpb25zLmN5LmZpdChhZnRlci5vcHRpb25zLmVsZXMubm9kZXMoKSwgYWZ0ZXIub3B0aW9ucy5wYWRkaW5nKTtcblxuICAgICAgaWYgKCFyZWFkeSkge1xuICAgICAgICByZWFkeSA9IHRydWU7XG4gICAgICAgIGFmdGVyLm9uZSgnbGF5b3V0cmVhZHknLCBhZnRlci5vcHRpb25zLnJlYWR5KTtcbiAgICAgICAgYWZ0ZXIudHJpZ2dlcih7dHlwZTogJ2xheW91dHJlYWR5JywgbGF5b3V0OiBhZnRlcn0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7IC8vIGNoYWluaW5nXG59O1xuXG5fQ29TRUxheW91dC5wcm90b3R5cGUuZ2V0VG9CZVRpbGVkID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgdmFyIGlkID0gbm9kZS5kYXRhKFwiaWRcIik7XG4gIC8vZmlyc3RseSBjaGVjayB0aGUgcHJldmlvdXMgcmVzdWx0c1xuICBpZiAoX0NvU0VMYXlvdXQudG9CZVRpbGVkW2lkXSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIF9Db1NFTGF5b3V0LnRvQmVUaWxlZFtpZF07XG4gIH1cblxuICAvL29ubHkgY29tcG91bmQgbm9kZXMgYXJlIHRvIGJlIHRpbGVkXG4gIHZhciBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4oKTtcbiAgaWYgKGNoaWxkcmVuID09IG51bGwgfHwgY2hpbGRyZW4ubGVuZ3RoID09IDApIHtcbiAgICBfQ29TRUxheW91dC50b0JlVGlsZWRbaWRdID0gZmFsc2U7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy9hIGNvbXBvdW5kIG5vZGUgaXMgbm90IHRvIGJlIHRpbGVkIGlmIGFsbCBvZiBpdHMgY29tcG91bmQgY2hpbGRyZW4gYXJlIG5vdCB0byBiZSB0aWxlZFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHRoZUNoaWxkID0gY2hpbGRyZW5baV07XG5cbiAgICBpZiAodGhpcy5nZXROb2RlRGVncmVlKHRoZUNoaWxkKSA+IDApIHtcbiAgICAgIF9Db1NFTGF5b3V0LnRvQmVUaWxlZFtpZF0gPSBmYWxzZTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvL3Bhc3MgdGhlIGNoaWxkcmVuIG5vdCBoYXZpbmcgdGhlIGNvbXBvdW5kIHN0cnVjdHVyZVxuICAgIGlmICh0aGVDaGlsZC5jaGlsZHJlbigpID09IG51bGwgfHwgdGhlQ2hpbGQuY2hpbGRyZW4oKS5sZW5ndGggPT0gMCkge1xuICAgICAgX0NvU0VMYXlvdXQudG9CZVRpbGVkW3RoZUNoaWxkLmRhdGEoXCJpZFwiKV0gPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5nZXRUb0JlVGlsZWQodGhlQ2hpbGQpKSB7XG4gICAgICBfQ29TRUxheW91dC50b0JlVGlsZWRbaWRdID0gZmFsc2U7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIF9Db1NFTGF5b3V0LnRvQmVUaWxlZFtpZF0gPSB0cnVlO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbl9Db1NFTGF5b3V0LnByb3RvdHlwZS5nZXROb2RlRGVncmVlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgdmFyIGlkID0gbm9kZS5pZCgpO1xuICB2YXIgZWRnZXMgPSB0aGlzLm9wdGlvbnMuZWxlcy5lZGdlcygpLmZpbHRlcihmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgdmFyIHNvdXJjZSA9IGVsZS5kYXRhKCdzb3VyY2UnKTtcbiAgICB2YXIgdGFyZ2V0ID0gZWxlLmRhdGEoJ3RhcmdldCcpO1xuICAgIGlmIChzb3VyY2UgIT0gdGFyZ2V0ICYmIChzb3VyY2UgPT0gaWQgfHwgdGFyZ2V0ID09IGlkKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGVkZ2VzLmxlbmd0aDtcbn07XG5cbl9Db1NFTGF5b3V0LnByb3RvdHlwZS5nZXROb2RlRGVncmVlV2l0aENoaWxkcmVuID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgdmFyIGRlZ3JlZSA9IHRoaXMuZ2V0Tm9kZURlZ3JlZShub2RlKTtcbiAgdmFyIGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbigpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgZGVncmVlICs9IHRoaXMuZ2V0Tm9kZURlZ3JlZVdpdGhDaGlsZHJlbihjaGlsZCk7XG4gIH1cbiAgcmV0dXJuIGRlZ3JlZTtcbn07XG5cbl9Db1NFTGF5b3V0LnByb3RvdHlwZS5ncm91cFplcm9EZWdyZWVNZW1iZXJzID0gZnVuY3Rpb24gKCkge1xuICAvLyBhcnJheSBvZiBbcGFyZW50X2lkIHggb25lRGVncmVlTm9kZV9pZF0gXG4gIHZhciB0ZW1wTWVtYmVyR3JvdXBzID0gW107XG4gIHZhciBtZW1iZXJHcm91cHMgPSBbXTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICAvLyBGaW5kIGFsbCB6ZXJvIGRlZ3JlZSBub2RlcyB3aGljaCBhcmVuJ3QgY292ZXJlZCBieSBhIGNvbXBvdW5kXG4gIHZhciB6ZXJvRGVncmVlID0gdGhpcy5vcHRpb25zLmVsZXMubm9kZXMoKS5maWx0ZXIoZnVuY3Rpb24gKGksIGVsZSkge1xuICAgIGlmIChzZWxmLmdldE5vZGVEZWdyZWVXaXRoQ2hpbGRyZW4oZWxlKSA9PSAwICYmIChlbGUucGFyZW50KCkubGVuZ3RoID09IDAgfHwgKGVsZS5wYXJlbnQoKS5sZW5ndGggPiAwICYmICFzZWxmLmdldFRvQmVUaWxlZChlbGUucGFyZW50KClbMF0pKSkpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gIC8vIENyZWF0ZSBhIG1hcCBvZiBwYXJlbnQgbm9kZSBhbmQgaXRzIHplcm8gZGVncmVlIG1lbWJlcnNcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB6ZXJvRGVncmVlLmxlbmd0aDsgaSsrKVxuICB7XG4gICAgdmFyIG5vZGUgPSB6ZXJvRGVncmVlW2ldO1xuICAgIHZhciBwX2lkID0gbm9kZS5wYXJlbnQoKS5pZCgpO1xuXG4gICAgaWYgKHR5cGVvZiB0ZW1wTWVtYmVyR3JvdXBzW3BfaWRdID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgdGVtcE1lbWJlckdyb3Vwc1twX2lkXSA9IFtdO1xuXG4gICAgdGVtcE1lbWJlckdyb3Vwc1twX2lkXSA9IHRlbXBNZW1iZXJHcm91cHNbcF9pZF0uY29uY2F0KG5vZGUpO1xuICB9XG5cbiAgLy8gSWYgdGhlcmUgYXJlIGF0IGxlYXN0IHR3byBub2RlcyBhdCBhIGxldmVsLCBjcmVhdGUgYSBkdW1teSBjb21wb3VuZCBmb3IgdGhlbVxuICBmb3IgKHZhciBwX2lkIGluIHRlbXBNZW1iZXJHcm91cHMpIHtcbiAgICBpZiAodGVtcE1lbWJlckdyb3Vwc1twX2lkXS5sZW5ndGggPiAxKSB7XG4gICAgICB2YXIgZHVtbXlDb21wb3VuZElkID0gXCJEdW1teUNvbXBvdW5kX1wiICsgcF9pZDtcbiAgICAgIG1lbWJlckdyb3Vwc1tkdW1teUNvbXBvdW5kSWRdID0gdGVtcE1lbWJlckdyb3Vwc1twX2lkXTtcblxuICAgICAgLy8gQ3JlYXRlIGEgZHVtbXkgY29tcG91bmRcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3kuZ2V0RWxlbWVudEJ5SWQoZHVtbXlDb21wb3VuZElkKS5lbXB0eSgpKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5jeS5hZGQoe1xuICAgICAgICAgIGdyb3VwOiBcIm5vZGVzXCIsXG4gICAgICAgICAgZGF0YToge2lkOiBkdW1teUNvbXBvdW5kSWQsIHBhcmVudDogcF9pZFxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGR1bW15ID0gdGhpcy5vcHRpb25zLmN5Lm5vZGVzKClbdGhpcy5vcHRpb25zLmN5Lm5vZGVzKCkubGVuZ3RoIC0gMV07XG4gICAgICAgIHRoaXMub3B0aW9ucy5lbGVzID0gdGhpcy5vcHRpb25zLmVsZXMudW5pb24oZHVtbXkpO1xuICAgICAgICBkdW1teS5oaWRlKCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZW1wTWVtYmVyR3JvdXBzW3BfaWRdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGkgPT0gMCkge1xuICAgICAgICAgICAgZHVtbXkuZGF0YSgndGVtcGNoaWxkcmVuJywgW10pO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgbm9kZSA9IHRlbXBNZW1iZXJHcm91cHNbcF9pZF1baV07XG4gICAgICAgICAgbm9kZS5kYXRhKCdkdW1teV9wYXJlbnRfaWQnLCBkdW1teUNvbXBvdW5kSWQpO1xuICAgICAgICAgIHRoaXMub3B0aW9ucy5jeS5hZGQoe1xuICAgICAgICAgICAgZ3JvdXA6IFwibm9kZXNcIixcbiAgICAgICAgICAgIGRhdGE6IHtwYXJlbnQ6IGR1bW15Q29tcG91bmRJZCwgd2lkdGg6IG5vZGUud2lkdGgoKSwgaGVpZ2h0OiBub2RlLmhlaWdodCgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdmFyIHRlbXBjaGlsZCA9IHRoaXMub3B0aW9ucy5jeS5ub2RlcygpW3RoaXMub3B0aW9ucy5jeS5ub2RlcygpLmxlbmd0aCAtIDFdO1xuICAgICAgICAgIHRlbXBjaGlsZC5oaWRlKCk7XG4gICAgICAgICAgdGVtcGNoaWxkLmNzcygnd2lkdGgnLCB0ZW1wY2hpbGQuZGF0YSgnd2lkdGgnKSk7XG4gICAgICAgICAgdGVtcGNoaWxkLmNzcygnaGVpZ2h0JywgdGVtcGNoaWxkLmRhdGEoJ2hlaWdodCcpKTtcbiAgICAgICAgICB0ZW1wY2hpbGQud2lkdGgoKTtcbiAgICAgICAgICBkdW1teS5kYXRhKCd0ZW1wY2hpbGRyZW4nKS5wdXNoKHRlbXBjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWVtYmVyR3JvdXBzO1xufTtcblxuX0NvU0VMYXlvdXQucHJvdG90eXBlLnBlcmZvcm1ERlNPbkNvbXBvdW5kcyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHZhciBjb21wb3VuZE9yZGVyID0gW107XG5cbiAgdmFyIHJvb3RzID0gdGhpcy5vcHRpb25zLmVsZXMubm9kZXMoKS5vcnBoYW5zKCk7XG4gIHRoaXMuZmlsbENvbXBleE9yZGVyQnlERlMoY29tcG91bmRPcmRlciwgcm9vdHMpO1xuXG4gIHJldHVybiBjb21wb3VuZE9yZGVyO1xufTtcblxuX0NvU0VMYXlvdXQucHJvdG90eXBlLmZpbGxDb21wZXhPcmRlckJ5REZTID0gZnVuY3Rpb24gKGNvbXBvdW5kT3JkZXIsIGNoaWxkcmVuKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICB0aGlzLmZpbGxDb21wZXhPcmRlckJ5REZTKGNvbXBvdW5kT3JkZXIsIGNoaWxkLmNoaWxkcmVuKCkpO1xuICAgIGlmICh0aGlzLmdldFRvQmVUaWxlZChjaGlsZCkpIHtcbiAgICAgIGNvbXBvdW5kT3JkZXIucHVzaChjaGlsZCk7XG4gICAgfVxuICB9XG59O1xuXG5fQ29TRUxheW91dC5wcm90b3R5cGUuY2xlYXJDb21wb3VuZHMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICB2YXIgY2hpbGRHcmFwaE1hcCA9IFtdO1xuXG4gIC8vIEdldCBjb21wb3VuZCBvcmRlcmluZyBieSBmaW5kaW5nIHRoZSBpbm5lciBvbmUgZmlyc3RcbiAgdmFyIGNvbXBvdW5kT3JkZXIgPSB0aGlzLnBlcmZvcm1ERlNPbkNvbXBvdW5kcyhvcHRpb25zKTtcbiAgX0NvU0VMYXlvdXQuY29tcG91bmRPcmRlciA9IGNvbXBvdW5kT3JkZXI7XG4gIHRoaXMucHJvY2Vzc0NoaWxkcmVuTGlzdCh0aGlzLnJvb3QsIHRoaXMub3B0aW9ucy5lbGVzLm5vZGVzKCkub3JwaGFucygpKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvdW5kT3JkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBmaW5kIHRoZSBjb3JyZXNwb25kaW5nIGxheW91dCBub2RlXG4gICAgdmFyIGxDb21wb3VuZE5vZGUgPSBfQ29TRUxheW91dC5pZFRvTE5vZGVbY29tcG91bmRPcmRlcltpXS5pZCgpXTtcblxuICAgIGNoaWxkR3JhcGhNYXBbY29tcG91bmRPcmRlcltpXS5pZCgpXSA9IGNvbXBvdW5kT3JkZXJbaV0uY2hpbGRyZW4oKTtcblxuICAgIC8vIFJlbW92ZSBjaGlsZHJlbiBvZiBjb21wb3VuZHMgXG4gICAgbENvbXBvdW5kTm9kZS5jaGlsZCA9IG51bGw7XG4gIH1cblxuICAvLyBUaWxlIHRoZSByZW1vdmVkIGNoaWxkcmVuXG4gIHZhciB0aWxlZE1lbWJlclBhY2sgPSB0aGlzLnRpbGVDb21wb3VuZE1lbWJlcnMoY2hpbGRHcmFwaE1hcCk7XG5cbiAgcmV0dXJuIHRpbGVkTWVtYmVyUGFjaztcbn07XG5cbl9Db1NFTGF5b3V0LnByb3RvdHlwZS5jbGVhclplcm9EZWdyZWVNZW1iZXJzID0gZnVuY3Rpb24gKG1lbWJlckdyb3Vwcykge1xuICB2YXIgdGlsZWRaZXJvRGVncmVlUGFjayA9IFtdO1xuXG4gIGZvciAodmFyIGlkIGluIG1lbWJlckdyb3Vwcykge1xuICAgIHZhciBjb21wb3VuZE5vZGUgPSBfQ29TRUxheW91dC5pZFRvTE5vZGVbaWRdO1xuXG4gICAgdGlsZWRaZXJvRGVncmVlUGFja1tpZF0gPSB0aGlzLnRpbGVOb2RlcyhtZW1iZXJHcm91cHNbaWRdKTtcblxuICAgIC8vIFNldCB0aGUgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgZHVtbXkgY29tcG91bmQgYXMgY2FsY3VsYXRlZFxuICAgIGNvbXBvdW5kTm9kZS5yZWN0LndpZHRoID0gdGlsZWRaZXJvRGVncmVlUGFja1tpZF0ud2lkdGg7XG4gICAgY29tcG91bmROb2RlLnJlY3QuaGVpZ2h0ID0gdGlsZWRaZXJvRGVncmVlUGFja1tpZF0uaGVpZ2h0O1xuICB9XG4gIHJldHVybiB0aWxlZFplcm9EZWdyZWVQYWNrO1xufTtcblxuX0NvU0VMYXlvdXQucHJvdG90eXBlLnJlcG9wdWxhdGVDb21wb3VuZHMgPSBmdW5jdGlvbiAodGlsZWRNZW1iZXJQYWNrKSB7XG4gIGZvciAodmFyIGkgPSBfQ29TRUxheW91dC5jb21wb3VuZE9yZGVyLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGlkID0gX0NvU0VMYXlvdXQuY29tcG91bmRPcmRlcltpXS5pZCgpO1xuICAgIHZhciBsQ29tcG91bmROb2RlID0gX0NvU0VMYXlvdXQuaWRUb0xOb2RlW2lkXTtcblxuICAgIHRoaXMuYWRqdXN0TG9jYXRpb25zKHRpbGVkTWVtYmVyUGFja1tpZF0sIGxDb21wb3VuZE5vZGUucmVjdC54LCBsQ29tcG91bmROb2RlLnJlY3QueSk7XG4gIH1cbn07XG5cbl9Db1NFTGF5b3V0LnByb3RvdHlwZS5yZXBvcHVsYXRlWmVyb0RlZ3JlZU1lbWJlcnMgPSBmdW5jdGlvbiAodGlsZWRQYWNrKSB7XG4gIGZvciAodmFyIGkgaW4gdGlsZWRQYWNrKSB7XG4gICAgdmFyIGNvbXBvdW5kID0gdGhpcy5jeS5nZXRFbGVtZW50QnlJZChpKTtcbiAgICB2YXIgY29tcG91bmROb2RlID0gX0NvU0VMYXlvdXQuaWRUb0xOb2RlW2ldO1xuXG4gICAgLy8gQWRqdXN0IHRoZSBwb3NpdGlvbnMgb2Ygbm9kZXMgd3J0IGl0cyBjb21wb3VuZFxuICAgIHRoaXMuYWRqdXN0TG9jYXRpb25zKHRpbGVkUGFja1tpXSwgY29tcG91bmROb2RlLnJlY3QueCwgY29tcG91bmROb2RlLnJlY3QueSk7XG5cbiAgICB2YXIgdGVtcGNoaWxkcmVuID0gY29tcG91bmQuZGF0YSgndGVtcGNoaWxkcmVuJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZW1wY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRlbXBjaGlsZHJlbltpXS5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgdGhlIGR1bW15IGNvbXBvdW5kXG4gICAgY29tcG91bmQucmVtb3ZlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgcGxhY2VzIGVhY2ggemVybyBkZWdyZWUgbWVtYmVyIHdydCBnaXZlbiAoeCx5KSBjb29yZGluYXRlcyAodG9wIGxlZnQpLiBcbiAqL1xuX0NvU0VMYXlvdXQucHJvdG90eXBlLmFkanVzdExvY2F0aW9ucyA9IGZ1bmN0aW9uIChvcmdhbml6YXRpb24sIHgsIHkpIHtcbiAgeCArPSBvcmdhbml6YXRpb24uY29tcG91bmRNYXJnaW47XG4gIHkgKz0gb3JnYW5pemF0aW9uLmNvbXBvdW5kTWFyZ2luO1xuXG4gIHZhciBsZWZ0ID0geDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG9yZ2FuaXphdGlvbi5yb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHJvdyA9IG9yZ2FuaXphdGlvbi5yb3dzW2ldO1xuICAgIHggPSBsZWZ0O1xuICAgIHZhciBtYXhIZWlnaHQgPSAwO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICAgIHZhciBsbm9kZSA9IHJvd1tqXTtcblxuICAgICAgdmFyIG5vZGUgPSB0aGlzLmN5LmdldEVsZW1lbnRCeUlkKGxub2RlLmlkKTtcbiAgICAgIG5vZGUucG9zaXRpb24oe1xuICAgICAgICB4OiB4ICsgbG5vZGUucmVjdC53aWR0aCAvIDIsXG4gICAgICAgIHk6IHkgKyBsbm9kZS5yZWN0LmhlaWdodCAvIDJcbiAgICAgIH0pO1xuXG4gICAgICBsbm9kZS5yZWN0LnggPSB4Oy8vICsgbG5vZGUucmVjdC53aWR0aCAvIDI7XG4gICAgICBsbm9kZS5yZWN0LnkgPSB5Oy8vICsgbG5vZGUucmVjdC5oZWlnaHQgLyAyO1xuXG4gICAgICB4ICs9IGxub2RlLnJlY3Qud2lkdGggKyBvcmdhbml6YXRpb24uaG9yaXpvbnRhbFBhZGRpbmc7XG5cbiAgICAgIGlmIChsbm9kZS5yZWN0LmhlaWdodCA+IG1heEhlaWdodClcbiAgICAgICAgbWF4SGVpZ2h0ID0gbG5vZGUucmVjdC5oZWlnaHQ7XG4gICAgfVxuXG4gICAgeSArPSBtYXhIZWlnaHQgKyBvcmdhbml6YXRpb24udmVydGljYWxQYWRkaW5nO1xuICB9XG59O1xuXG5fQ29TRUxheW91dC5wcm90b3R5cGUudGlsZUNvbXBvdW5kTWVtYmVycyA9IGZ1bmN0aW9uIChjaGlsZEdyYXBoTWFwKSB7XG4gIHZhciB0aWxlZE1lbWJlclBhY2sgPSBbXTtcblxuICBmb3IgKHZhciBpZCBpbiBjaGlsZEdyYXBoTWFwKSB7XG4gICAgLy8gQWNjZXNzIGxheW91dEluZm8gbm9kZXMgdG8gc2V0IHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIGNvbXBvdW5kc1xuICAgIHZhciBjb21wb3VuZE5vZGUgPSBfQ29TRUxheW91dC5pZFRvTE5vZGVbaWRdO1xuXG4gICAgdGlsZWRNZW1iZXJQYWNrW2lkXSA9IHRoaXMudGlsZU5vZGVzKGNoaWxkR3JhcGhNYXBbaWRdKTtcblxuICAgIGNvbXBvdW5kTm9kZS5yZWN0LndpZHRoID0gdGlsZWRNZW1iZXJQYWNrW2lkXS53aWR0aCArIDIwO1xuICAgIGNvbXBvdW5kTm9kZS5yZWN0LmhlaWdodCA9IHRpbGVkTWVtYmVyUGFja1tpZF0uaGVpZ2h0ICsgMjA7XG4gIH1cblxuICByZXR1cm4gdGlsZWRNZW1iZXJQYWNrO1xufTtcblxuX0NvU0VMYXlvdXQucHJvdG90eXBlLnRpbGVOb2RlcyA9IGZ1bmN0aW9uIChub2Rlcykge1xuICB2YXIgb3JnYW5pemF0aW9uID0ge1xuICAgIHJvd3M6IFtdLFxuICAgIHJvd1dpZHRoOiBbXSxcbiAgICByb3dIZWlnaHQ6IFtdLFxuICAgIGNvbXBvdW5kTWFyZ2luOiAxMCxcbiAgICB3aWR0aDogMjAsXG4gICAgaGVpZ2h0OiAyMCxcbiAgICB2ZXJ0aWNhbFBhZGRpbmc6IDEwLFxuICAgIGhvcml6b250YWxQYWRkaW5nOiAxMFxuICB9O1xuXG4gIHZhciBsYXlvdXROb2RlcyA9IFtdO1xuXG4gIC8vIEdldCBsYXlvdXQgbm9kZXNcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBub2RlID0gbm9kZXNbaV07XG4gICAgdmFyIGxOb2RlID0gX0NvU0VMYXlvdXQuaWRUb0xOb2RlW25vZGUuaWQoKV07XG5cbiAgICBpZiAoIW5vZGUuZGF0YSgnZHVtbXlfcGFyZW50X2lkJykpIHtcbiAgICAgIHZhciBvd25lciA9IGxOb2RlLm93bmVyO1xuICAgICAgb3duZXIucmVtb3ZlKGxOb2RlKTtcblxuICAgICAgdGhpcy5nbS5yZXNldEFsbE5vZGVzKCk7XG4gICAgICB0aGlzLmdtLmdldEFsbE5vZGVzKCk7XG4gICAgfVxuXG4gICAgbGF5b3V0Tm9kZXMucHVzaChsTm9kZSk7XG4gIH1cblxuICAvLyBTb3J0IHRoZSBub2RlcyBpbiBhc2NlbmRpbmcgb3JkZXIgb2YgdGhlaXIgYXJlYXNcbiAgbGF5b3V0Tm9kZXMuc29ydChmdW5jdGlvbiAobjEsIG4yKSB7XG4gICAgaWYgKG4xLnJlY3Qud2lkdGggKiBuMS5yZWN0LmhlaWdodCA+IG4yLnJlY3Qud2lkdGggKiBuMi5yZWN0LmhlaWdodClcbiAgICAgIHJldHVybiAtMTtcbiAgICBpZiAobjEucmVjdC53aWR0aCAqIG4xLnJlY3QuaGVpZ2h0IDwgbjIucmVjdC53aWR0aCAqIG4yLnJlY3QuaGVpZ2h0KVxuICAgICAgcmV0dXJuIDE7XG4gICAgcmV0dXJuIDA7XG4gIH0pO1xuXG4gIC8vIENyZWF0ZSB0aGUgb3JnYW5pemF0aW9uIC0+IHRpbGUgbWVtYmVyc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxheW91dE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGxOb2RlID0gbGF5b3V0Tm9kZXNbaV07XG5cbiAgICBpZiAob3JnYW5pemF0aW9uLnJvd3MubGVuZ3RoID09IDApIHtcbiAgICAgIHRoaXMuaW5zZXJ0Tm9kZVRvUm93KG9yZ2FuaXphdGlvbiwgbE5vZGUsIDApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmNhbkFkZEhvcml6b250YWwob3JnYW5pemF0aW9uLCBsTm9kZS5yZWN0LndpZHRoLCBsTm9kZS5yZWN0LmhlaWdodCkpIHtcbiAgICAgIHRoaXMuaW5zZXJ0Tm9kZVRvUm93KG9yZ2FuaXphdGlvbiwgbE5vZGUsIHRoaXMuZ2V0U2hvcnRlc3RSb3dJbmRleChvcmdhbml6YXRpb24pKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmluc2VydE5vZGVUb1Jvdyhvcmdhbml6YXRpb24sIGxOb2RlLCBvcmdhbml6YXRpb24ucm93cy5sZW5ndGgpO1xuICAgIH1cblxuICAgIHRoaXMuc2hpZnRUb0xhc3RSb3cob3JnYW5pemF0aW9uKTtcbiAgfVxuXG4gIHJldHVybiBvcmdhbml6YXRpb247XG59O1xuXG5fQ29TRUxheW91dC5wcm90b3R5cGUuaW5zZXJ0Tm9kZVRvUm93ID0gZnVuY3Rpb24gKG9yZ2FuaXphdGlvbiwgbm9kZSwgcm93SW5kZXgpIHtcbiAgdmFyIG1pbkNvbXBvdW5kU2l6ZSA9IG9yZ2FuaXphdGlvbi5jb21wb3VuZE1hcmdpbiAqIDI7XG5cbiAgLy8gQWRkIG5ldyByb3cgaWYgbmVlZGVkXG4gIGlmIChyb3dJbmRleCA9PSBvcmdhbml6YXRpb24ucm93cy5sZW5ndGgpIHtcbiAgICB2YXIgc2Vjb25kRGltZW5zaW9uID0gW107XG5cbiAgICBvcmdhbml6YXRpb24ucm93cy5wdXNoKHNlY29uZERpbWVuc2lvbik7XG4gICAgb3JnYW5pemF0aW9uLnJvd1dpZHRoLnB1c2gobWluQ29tcG91bmRTaXplKTtcbiAgICBvcmdhbml6YXRpb24ucm93SGVpZ2h0LnB1c2goMCk7XG4gIH1cblxuICAvLyBVcGRhdGUgcm93IHdpZHRoXG4gIHZhciB3ID0gb3JnYW5pemF0aW9uLnJvd1dpZHRoW3Jvd0luZGV4XSArIG5vZGUucmVjdC53aWR0aDtcblxuICBpZiAob3JnYW5pemF0aW9uLnJvd3Nbcm93SW5kZXhdLmxlbmd0aCA+IDApIHtcbiAgICB3ICs9IG9yZ2FuaXphdGlvbi5ob3Jpem9udGFsUGFkZGluZztcbiAgfVxuXG4gIG9yZ2FuaXphdGlvbi5yb3dXaWR0aFtyb3dJbmRleF0gPSB3O1xuICAvLyBVcGRhdGUgY29tcG91bmQgd2lkdGhcbiAgaWYgKG9yZ2FuaXphdGlvbi53aWR0aCA8IHcpIHtcbiAgICBvcmdhbml6YXRpb24ud2lkdGggPSB3O1xuICB9XG5cbiAgLy8gVXBkYXRlIGhlaWdodFxuICB2YXIgaCA9IG5vZGUucmVjdC5oZWlnaHQ7XG4gIGlmIChyb3dJbmRleCA+IDApXG4gICAgaCArPSBvcmdhbml6YXRpb24udmVydGljYWxQYWRkaW5nO1xuXG4gIHZhciBleHRyYUhlaWdodCA9IDA7XG4gIGlmIChoID4gb3JnYW5pemF0aW9uLnJvd0hlaWdodFtyb3dJbmRleF0pIHtcbiAgICBleHRyYUhlaWdodCA9IG9yZ2FuaXphdGlvbi5yb3dIZWlnaHRbcm93SW5kZXhdO1xuICAgIG9yZ2FuaXphdGlvbi5yb3dIZWlnaHRbcm93SW5kZXhdID0gaDtcbiAgICBleHRyYUhlaWdodCA9IG9yZ2FuaXphdGlvbi5yb3dIZWlnaHRbcm93SW5kZXhdIC0gZXh0cmFIZWlnaHQ7XG4gIH1cblxuICBvcmdhbml6YXRpb24uaGVpZ2h0ICs9IGV4dHJhSGVpZ2h0O1xuXG4gIC8vIEluc2VydCBub2RlXG4gIG9yZ2FuaXphdGlvbi5yb3dzW3Jvd0luZGV4XS5wdXNoKG5vZGUpO1xufTtcblxuLy9TY2FucyB0aGUgcm93cyBvZiBhbiBvcmdhbml6YXRpb24gYW5kIHJldHVybnMgdGhlIG9uZSB3aXRoIHRoZSBtaW4gd2lkdGhcbl9Db1NFTGF5b3V0LnByb3RvdHlwZS5nZXRTaG9ydGVzdFJvd0luZGV4ID0gZnVuY3Rpb24gKG9yZ2FuaXphdGlvbikge1xuICB2YXIgciA9IC0xO1xuICB2YXIgbWluID0gTnVtYmVyLk1BWF9WQUxVRTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG9yZ2FuaXphdGlvbi5yb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG9yZ2FuaXphdGlvbi5yb3dXaWR0aFtpXSA8IG1pbikge1xuICAgICAgciA9IGk7XG4gICAgICBtaW4gPSBvcmdhbml6YXRpb24ucm93V2lkdGhbaV07XG4gICAgfVxuICB9XG4gIHJldHVybiByO1xufTtcblxuLy9TY2FucyB0aGUgcm93cyBvZiBhbiBvcmdhbml6YXRpb24gYW5kIHJldHVybnMgdGhlIG9uZSB3aXRoIHRoZSBtYXggd2lkdGhcbl9Db1NFTGF5b3V0LnByb3RvdHlwZS5nZXRMb25nZXN0Um93SW5kZXggPSBmdW5jdGlvbiAob3JnYW5pemF0aW9uKSB7XG4gIHZhciByID0gLTE7XG4gIHZhciBtYXggPSBOdW1iZXIuTUlOX1ZBTFVFO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb3JnYW5pemF0aW9uLnJvd3MubGVuZ3RoOyBpKyspIHtcblxuICAgIGlmIChvcmdhbml6YXRpb24ucm93V2lkdGhbaV0gPiBtYXgpIHtcbiAgICAgIHIgPSBpO1xuICAgICAgbWF4ID0gb3JnYW5pemF0aW9uLnJvd1dpZHRoW2ldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByO1xufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBjaGVja3Mgd2hldGhlciBhZGRpbmcgZXh0cmEgd2lkdGggdG8gdGhlIG9yZ2FuaXphdGlvbiB2aW9sYXRlc1xuICogdGhlIGFzcGVjdCByYXRpbygxKSBvciBub3QuXG4gKi9cbl9Db1NFTGF5b3V0LnByb3RvdHlwZS5jYW5BZGRIb3Jpem9udGFsID0gZnVuY3Rpb24gKG9yZ2FuaXphdGlvbiwgZXh0cmFXaWR0aCwgZXh0cmFIZWlnaHQpIHtcblxuICB2YXIgc3JpID0gdGhpcy5nZXRTaG9ydGVzdFJvd0luZGV4KG9yZ2FuaXphdGlvbik7XG5cbiAgaWYgKHNyaSA8IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhciBtaW4gPSBvcmdhbml6YXRpb24ucm93V2lkdGhbc3JpXTtcblxuICBpZiAobWluICsgb3JnYW5pemF0aW9uLmhvcml6b250YWxQYWRkaW5nICsgZXh0cmFXaWR0aCA8PSBvcmdhbml6YXRpb24ud2lkdGgpXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgdmFyIGhEaWZmID0gMDtcblxuICAvLyBBZGRpbmcgdG8gYW4gZXhpc3Rpbmcgcm93XG4gIGlmIChvcmdhbml6YXRpb24ucm93SGVpZ2h0W3NyaV0gPCBleHRyYUhlaWdodCkge1xuICAgIGlmIChzcmkgPiAwKVxuICAgICAgaERpZmYgPSBleHRyYUhlaWdodCArIG9yZ2FuaXphdGlvbi52ZXJ0aWNhbFBhZGRpbmcgLSBvcmdhbml6YXRpb24ucm93SGVpZ2h0W3NyaV07XG4gIH1cblxuICB2YXIgYWRkX3RvX3Jvd19yYXRpbztcbiAgaWYgKG9yZ2FuaXphdGlvbi53aWR0aCAtIG1pbiA+PSBleHRyYVdpZHRoICsgb3JnYW5pemF0aW9uLmhvcml6b250YWxQYWRkaW5nKSB7XG4gICAgYWRkX3RvX3Jvd19yYXRpbyA9IChvcmdhbml6YXRpb24uaGVpZ2h0ICsgaERpZmYpIC8gKG1pbiArIGV4dHJhV2lkdGggKyBvcmdhbml6YXRpb24uaG9yaXpvbnRhbFBhZGRpbmcpO1xuICB9IGVsc2Uge1xuICAgIGFkZF90b19yb3dfcmF0aW8gPSAob3JnYW5pemF0aW9uLmhlaWdodCArIGhEaWZmKSAvIG9yZ2FuaXphdGlvbi53aWR0aDtcbiAgfVxuXG4gIC8vIEFkZGluZyBhIG5ldyByb3cgZm9yIHRoaXMgbm9kZVxuICBoRGlmZiA9IGV4dHJhSGVpZ2h0ICsgb3JnYW5pemF0aW9uLnZlcnRpY2FsUGFkZGluZztcbiAgdmFyIGFkZF9uZXdfcm93X3JhdGlvO1xuICBpZiAob3JnYW5pemF0aW9uLndpZHRoIDwgZXh0cmFXaWR0aCkge1xuICAgIGFkZF9uZXdfcm93X3JhdGlvID0gKG9yZ2FuaXphdGlvbi5oZWlnaHQgKyBoRGlmZikgLyBleHRyYVdpZHRoO1xuICB9IGVsc2Uge1xuICAgIGFkZF9uZXdfcm93X3JhdGlvID0gKG9yZ2FuaXphdGlvbi5oZWlnaHQgKyBoRGlmZikgLyBvcmdhbml6YXRpb24ud2lkdGg7XG4gIH1cblxuICBpZiAoYWRkX25ld19yb3dfcmF0aW8gPCAxKVxuICAgIGFkZF9uZXdfcm93X3JhdGlvID0gMSAvIGFkZF9uZXdfcm93X3JhdGlvO1xuXG4gIGlmIChhZGRfdG9fcm93X3JhdGlvIDwgMSlcbiAgICBhZGRfdG9fcm93X3JhdGlvID0gMSAvIGFkZF90b19yb3dfcmF0aW87XG5cbiAgcmV0dXJuIGFkZF90b19yb3dfcmF0aW8gPCBhZGRfbmV3X3Jvd19yYXRpbztcbn07XG5cblxuLy9JZiBtb3ZpbmcgdGhlIGxhc3Qgbm9kZSBmcm9tIHRoZSBsb25nZXN0IHJvdyBhbmQgYWRkaW5nIGl0IHRvIHRoZSBsYXN0XG4vL3JvdyBtYWtlcyB0aGUgYm91bmRpbmcgYm94IHNtYWxsZXIsIGRvIGl0LlxuX0NvU0VMYXlvdXQucHJvdG90eXBlLnNoaWZ0VG9MYXN0Um93ID0gZnVuY3Rpb24gKG9yZ2FuaXphdGlvbikge1xuICB2YXIgbG9uZ2VzdCA9IHRoaXMuZ2V0TG9uZ2VzdFJvd0luZGV4KG9yZ2FuaXphdGlvbik7XG4gIHZhciBsYXN0ID0gb3JnYW5pemF0aW9uLnJvd1dpZHRoLmxlbmd0aCAtIDE7XG4gIHZhciByb3cgPSBvcmdhbml6YXRpb24ucm93c1tsb25nZXN0XTtcbiAgdmFyIG5vZGUgPSByb3dbcm93Lmxlbmd0aCAtIDFdO1xuXG4gIHZhciBkaWZmID0gbm9kZS53aWR0aCArIG9yZ2FuaXphdGlvbi5ob3Jpem9udGFsUGFkZGluZztcblxuICAvLyBDaGVjayBpZiB0aGVyZSBpcyBlbm91Z2ggc3BhY2Ugb24gdGhlIGxhc3Qgcm93XG4gIGlmIChvcmdhbml6YXRpb24ud2lkdGggLSBvcmdhbml6YXRpb24ucm93V2lkdGhbbGFzdF0gPiBkaWZmICYmIGxvbmdlc3QgIT0gbGFzdCkge1xuICAgIC8vIFJlbW92ZSB0aGUgbGFzdCBlbGVtZW50IG9mIHRoZSBsb25nZXN0IHJvd1xuICAgIHJvdy5zcGxpY2UoLTEsIDEpO1xuXG4gICAgLy8gUHVzaCBpdCB0byB0aGUgbGFzdCByb3dcbiAgICBvcmdhbml6YXRpb24ucm93c1tsYXN0XS5wdXNoKG5vZGUpO1xuXG4gICAgb3JnYW5pemF0aW9uLnJvd1dpZHRoW2xvbmdlc3RdID0gb3JnYW5pemF0aW9uLnJvd1dpZHRoW2xvbmdlc3RdIC0gZGlmZjtcbiAgICBvcmdhbml6YXRpb24ucm93V2lkdGhbbGFzdF0gPSBvcmdhbml6YXRpb24ucm93V2lkdGhbbGFzdF0gKyBkaWZmO1xuICAgIG9yZ2FuaXphdGlvbi53aWR0aCA9IG9yZ2FuaXphdGlvbi5yb3dXaWR0aFt0aGlzLmdldExvbmdlc3RSb3dJbmRleChvcmdhbml6YXRpb24pXTtcblxuICAgIC8vIFVwZGF0ZSBoZWlnaHRzIG9mIHRoZSBvcmdhbml6YXRpb25cbiAgICB2YXIgbWF4SGVpZ2h0ID0gTnVtYmVyLk1JTl9WQUxVRTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvdy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJvd1tpXS5oZWlnaHQgPiBtYXhIZWlnaHQpXG4gICAgICAgIG1heEhlaWdodCA9IHJvd1tpXS5oZWlnaHQ7XG4gICAgfVxuICAgIGlmIChsb25nZXN0ID4gMClcbiAgICAgIG1heEhlaWdodCArPSBvcmdhbml6YXRpb24udmVydGljYWxQYWRkaW5nO1xuXG4gICAgdmFyIHByZXZUb3RhbCA9IG9yZ2FuaXphdGlvbi5yb3dIZWlnaHRbbG9uZ2VzdF0gKyBvcmdhbml6YXRpb24ucm93SGVpZ2h0W2xhc3RdO1xuXG4gICAgb3JnYW5pemF0aW9uLnJvd0hlaWdodFtsb25nZXN0XSA9IG1heEhlaWdodDtcbiAgICBpZiAob3JnYW5pemF0aW9uLnJvd0hlaWdodFtsYXN0XSA8IG5vZGUuaGVpZ2h0ICsgb3JnYW5pemF0aW9uLnZlcnRpY2FsUGFkZGluZylcbiAgICAgIG9yZ2FuaXphdGlvbi5yb3dIZWlnaHRbbGFzdF0gPSBub2RlLmhlaWdodCArIG9yZ2FuaXphdGlvbi52ZXJ0aWNhbFBhZGRpbmc7XG5cbiAgICB2YXIgZmluYWxUb3RhbCA9IG9yZ2FuaXphdGlvbi5yb3dIZWlnaHRbbG9uZ2VzdF0gKyBvcmdhbml6YXRpb24ucm93SGVpZ2h0W2xhc3RdO1xuICAgIG9yZ2FuaXphdGlvbi5oZWlnaHQgKz0gKGZpbmFsVG90YWwgLSBwcmV2VG90YWwpO1xuXG4gICAgdGhpcy5zaGlmdFRvTGFzdFJvdyhvcmdhbml6YXRpb24pO1xuICB9XG59O1xuXG4vKipcbiAqIEBicmllZiA6IGNhbGxlZCBvbiBjb250aW51b3VzIGxheW91dHMgdG8gc3RvcCB0aGVtIGJlZm9yZSB0aGV5IGZpbmlzaFxuICovXG5fQ29TRUxheW91dC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcblxuICByZXR1cm4gdGhpczsgLy8gY2hhaW5pbmdcbn07XG5cbl9Db1NFTGF5b3V0LnByb3RvdHlwZS5wcm9jZXNzQ2hpbGRyZW5MaXN0ID0gZnVuY3Rpb24gKHBhcmVudCwgY2hpbGRyZW4pIHtcbiAgdmFyIHNpemUgPSBjaGlsZHJlbi5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgdmFyIHRoZUNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgdGhpcy5vcHRpb25zLmVsZXMubm9kZXMoKS5sZW5ndGg7XG4gICAgdmFyIGNoaWxkcmVuX29mX2NoaWxkcmVuID0gdGhlQ2hpbGQuY2hpbGRyZW4oKTtcbiAgICB2YXIgdGhlTm9kZTtcblxuICAgIGlmICh0aGVDaGlsZC53aWR0aCgpICE9IG51bGxcbiAgICAgICAgICAgICYmIHRoZUNoaWxkLmhlaWdodCgpICE9IG51bGwpIHtcbiAgICAgIHRoZU5vZGUgPSBwYXJlbnQuYWRkKG5ldyBDb1NFTm9kZShfQ29TRUxheW91dC5sYXlvdXQuZ3JhcGhNYW5hZ2VyLFxuICAgICAgICAgICAgICBuZXcgUG9pbnREKHRoZUNoaWxkLnBvc2l0aW9uKCd4JyksIHRoZUNoaWxkLnBvc2l0aW9uKCd5JykpLFxuICAgICAgICAgICAgICBuZXcgRGltZW5zaW9uRChwYXJzZUZsb2F0KHRoZUNoaWxkLndpZHRoKCkpLFxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQodGhlQ2hpbGQuaGVpZ2h0KCkpKSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoZU5vZGUgPSBwYXJlbnQuYWRkKG5ldyBDb1NFTm9kZSh0aGlzLmdyYXBoTWFuYWdlcikpO1xuICAgIH1cbiAgICB0aGVOb2RlLmlkID0gdGhlQ2hpbGQuZGF0YShcImlkXCIpO1xuICAgIF9Db1NFTGF5b3V0LmlkVG9MTm9kZVt0aGVDaGlsZC5kYXRhKFwiaWRcIildID0gdGhlTm9kZTtcblxuICAgIGlmIChpc05hTih0aGVOb2RlLnJlY3QueCkpIHtcbiAgICAgIHRoZU5vZGUucmVjdC54ID0gMDtcbiAgICB9XG5cbiAgICBpZiAoaXNOYU4odGhlTm9kZS5yZWN0LnkpKSB7XG4gICAgICB0aGVOb2RlLnJlY3QueSA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGNoaWxkcmVuX29mX2NoaWxkcmVuICE9IG51bGwgJiYgY2hpbGRyZW5fb2ZfY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHRoZU5ld0dyYXBoO1xuICAgICAgdGhlTmV3R3JhcGggPSBfQ29TRUxheW91dC5sYXlvdXQuZ2V0R3JhcGhNYW5hZ2VyKCkuYWRkKF9Db1NFTGF5b3V0LmxheW91dC5uZXdHcmFwaCgpLCB0aGVOb2RlKTtcbiAgICAgIHRoaXMucHJvY2Vzc0NoaWxkcmVuTGlzdCh0aGVOZXdHcmFwaCwgY2hpbGRyZW5fb2ZfY2hpbGRyZW4pO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXQoY3l0b3NjYXBlKSB7XG4gIFRocmVhZCA9IGN5dG9zY2FwZS5UaHJlYWQ7XG5cbiAgcmV0dXJuIF9Db1NFTGF5b3V0O1xufTsiLCJmdW5jdGlvbiBsYXlvdXRPcHRpb25zUGFjaygpIHtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsYXlvdXRPcHRpb25zUGFjazsiLCIndXNlIHN0cmljdCc7XG5cbihmdW5jdGlvbigpe1xuXG4gIC8vIHJlZ2lzdGVycyB0aGUgZXh0ZW5zaW9uIG9uIGEgY3l0b3NjYXBlIGxpYiByZWZcbiAgdmFyIGdldExheW91dCA9IHJlcXVpcmUoJy4vTGF5b3V0Jyk7XG4gIHZhciByZWdpc3RlciA9IGZ1bmN0aW9uKCBjeXRvc2NhcGUgKXtcbiAgICB2YXIgTGF5b3V0ID0gZ2V0TGF5b3V0KCBjeXRvc2NhcGUgKTtcblxuICAgIGN5dG9zY2FwZSgnbGF5b3V0JywgJ2Nvc2UtYmlsa2VudCcsIExheW91dCk7XG4gIH07XG5cbiAgaWYoIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzICl7IC8vIGV4cG9zZSBhcyBhIGNvbW1vbmpzIG1vZHVsZVxuICAgIG1vZHVsZS5leHBvcnRzID0gcmVnaXN0ZXI7XG4gIH1cblxuICBpZiggdHlwZW9mIGRlZmluZSAhPT0gJ3VuZGVmaW5lZCcgJiYgZGVmaW5lLmFtZCApeyAvLyBleHBvc2UgYXMgYW4gYW1kL3JlcXVpcmVqcyBtb2R1bGVcbiAgICBkZWZpbmUoJ2N5dG9zY2FwZS1jb3NlLWJpbGtlbnQnLCBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHJlZ2lzdGVyO1xuICAgIH0pO1xuICB9XG5cbiAgaWYoIHR5cGVvZiBjeXRvc2NhcGUgIT09ICd1bmRlZmluZWQnICl7IC8vIGV4cG9zZSB0byBnbG9iYWwgY3l0b3NjYXBlIChpLmUuIHdpbmRvdy5jeXRvc2NhcGUpXG4gICAgcmVnaXN0ZXIoIGN5dG9zY2FwZSApO1xuICB9XG5cbn0pKCk7XG4iXX0=

;(function( $ ){ 'use strict';

  var defaults = {
    menuRadius: 100, // the radius of the circular menu in pixels
    selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
    commands: [ // an array of commands to list in the menu
      /*
      { // example command
        content: 'a command name' // html/text content to be displayed in the menu
        select: function(){ // a function to execute when the command is selected
          console.log( this.id() ) // `this` holds the reference to the active element
        }
      }
      */
    ], 
    fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
    activeFillColor: 'rgba(92, 194, 237, 0.75)', // the colour used to indicate the selected command
    activePadding: 20, // additional size in pixels for the active command
    indicatorSize: 24, // the size in pixels of the pointer to the active command
    separatorWidth: 3, // the empty spacing in pixels between successive commands
    spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
    minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
    maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
    itemColor: 'white', // the colour of text in the command's content
    itemTextShadowColor: 'black', // the text shadow colour of the command's content
    zIndex: 9999 // the z-index of the ui div
  };

  // registers the extension on a cytoscape lib ref
  var register = function( cytoscape, $ ){
    if( !cytoscape ){ return; } // can't register if cytoscape unspecified

    cytoscape('core', 'cxtmenu', function(params){
      var options = $.extend(true, {}, defaults, params);
      var fn = params;
      var cy = this;
      var $container = $( cy.container() );
      var target;
      
      function getOffset( $ele ){
        var offset = $ele.offset();

        offset.left += parseFloat( $ele.css('padding-left') );
        offset.left += parseFloat( $ele.css('border-left-width') );

        offset.top += parseFloat( $ele.css('padding-top') );
        offset.top += parseFloat( $ele.css('border-top-width') );

        return offset;
      }
      
      var data = {
        options: options,
        handlers: []
      };
      var $wrapper = $('<div class="cxtmenu"></div>'); data.$container = $wrapper;
      var $parent = $('<div></div>');
      var $canvas = $('<canvas></canvas>');
      var c2d = $canvas[0].getContext('2d');
      var r = options.menuRadius;
      var containerSize = (r + options.activePadding)*2;
      var activeCommandI = undefined;
      var offset;

      $container.append( $wrapper );
      $wrapper.append( $parent );
      $parent.append( $canvas );

      $wrapper.css({
        position: 'absolute',
        zIndex: options.zIndex
      });

      $parent.css({
        width: containerSize + 'px',
        height: containerSize + 'px',
        position: 'absolute',
        zIndex: 1,
        marginLeft: - options.activePadding + 'px',
        marginTop: - options.activePadding + 'px'
      }).hide();

      $canvas[0].width = containerSize;
      $canvas[0].height = containerSize;

      var commands = options.commands;
      var dtheta = 2*Math.PI/(commands.length);
      var theta1 = commands.length % 2 !== 0 ? Math.PI/2 : 0;
      var theta2 = theta1 + dtheta;
      var $items = [];

      for( var i = 0; i < commands.length; i++ ){
        var command = commands[i];

        var midtheta = (theta1 + theta2)/2;
        var rx1 = 0.66 * r * Math.cos( midtheta );
        var ry1 = 0.66 * r * Math.sin( midtheta );

        // console.log(rx1, ry1, theta1, theta2)

        var $item = $('<div class="cxtmenu-item"></div>');
        $item.css({
          color: options.itemColor,
          cursor: 'default',
          display: 'table',
          'text-align': 'center',
          //background: 'red',
          position: 'absolute',
          'text-shadow': '-1px -1px ' + options.itemTextShadowColor + ', 1px -1px ' + options.itemTextShadowColor + ', -1px 1px ' + options.itemTextShadowColor + ', 1px 1px ' + options.itemTextShadowColor,
          left: '50%',
          top: '50%',
          'min-height': r * 0.66,
          width: r * 0.66,
          height: r * 0.66,
          marginLeft: rx1 - r * 0.33,
          marginTop: -ry1 -r * 0.33
        });
        
        var $content = $('<div class="cxtmenu-content">' + command.content + '</div>');
        $content.css({
          'width': r * 0.66,
          'height': r * 0.66,
          'vertical-align': 'middle',
          'display': 'table-cell'
        });
        
        $parent.append( $item );
        $item.append( $content );


        theta1 += dtheta;
        theta2 += dtheta;
      }

      var hideParentOnClick, selectOnClickWrapper;

      function addDomListeners(){
        // Left click hides menu and triggers command
        $(document).on('click', hideParentOnClick = function() {
          $parent.hide();
        });

        $wrapper.on('click', selectOnClickWrapper = function() {
          if (activeCommandI !== undefined && !!target) {
            var select = options.commands[activeCommandI].select;

            if (select) {
              select.apply(target);
              activeCommandI = undefined;
            }
          }
        });
      }

      function removeDomListeners(){
        $(document).off('click', hideParentOnClick);
        $wrapper.off('click', selectOnClickWrapper);
      }


      function drawBg( rspotlight ){
        rspotlight = rspotlight !== undefined ? rspotlight : rs;

        c2d.globalCompositeOperation = 'source-over';

        c2d.clearRect(0, 0, containerSize, containerSize);

        c2d.fillStyle = options.fillColor;
        c2d.beginPath();
        c2d.arc(r + options.activePadding, r + options.activePadding, r, 0, Math.PI*2, true); 
        c2d.closePath();
        c2d.fill();

        c2d.globalCompositeOperation = 'destination-out';
        c2d.strokeStyle = 'white';
        c2d.lineWidth = options.separatorWidth;
        var commands = options.commands;
        var dtheta = 2*Math.PI/(commands.length);
        var theta1 = commands.length % 2 !== 0 ? Math.PI/2 : 0;
        var theta2 = theta1 + dtheta;

        for( var i = 0; i < commands.length; i++ ){
          var command = commands[i];

          var rx1 = r * Math.cos(theta1);
          var ry1 = r * Math.sin(theta1);
          c2d.beginPath();
          c2d.moveTo(r + options.activePadding, r + options.activePadding);
          c2d.lineTo(r + options.activePadding + rx1, r + options.activePadding - ry1);
          c2d.closePath();
          c2d.stroke();

          // var rx2 = r * Math.cos(theta2);
          // var ry2 = r * Math.sin(theta2);
          // c2d.moveTo(r, r);
          // c2d.lineTo(r + rx2, r + ry2);
          // c2d.stroke();

          theta1 += dtheta;
          theta2 += dtheta;
        }
        

        c2d.fillStyle = 'white';
        c2d.globalCompositeOperation = 'destination-out';
        c2d.beginPath();
        c2d.arc(r + options.activePadding, r + options.activePadding, rspotlight + options.spotlightPadding, 0, Math.PI*2, true); 
        c2d.closePath();
        c2d.fill();

        c2d.globalCompositeOperation = 'source-over';
      }
      
      var lastCallTime = 0;
      var minCallDelta = 1000/30;
      var endCallTimeout;
      var firstCall = true;
      function rateLimitedCall( fn ){
        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        var now = +new Date;

        clearTimeout( endCallTimeout );

        if( firstCall || now >= lastCallTime + minCallDelta ){
          requestAnimationFrame(fn);
          lastCallTime = now;
          firstCall = false;
        } else {
          endCallTimeout = setTimeout(function(){
            requestAnimationFrame(fn);
            lastCallTime = now;
          }, minCallDelta * 2);
        }
      }

      var ctrx, ctry, rs;
      var tapendHandler;

      var bindings = {
        on: function(events, selector, fn){
          data.handlers.push({
            events: events,
            selector: selector,
            fn: fn
          });

          if( selector === 'core' ){
            cy.on(events, function( e ){
              if( e.cyTarget === cy ){ // only if event target is directly core
                return fn.apply( this, [ e ] );
              }
            });
          } else {
            cy.on(events, selector, fn);
          }

          return this;
        }
      };

      function addEventListeners(){
        var grabbable;
        var inGesture = false;
        var dragHandler;

        bindings
          .on('cxttapstart taphold', options.selector, function(e){
            target = this; // Remember which node the context menu is for
            var ele = this;
            var isCy = this === cy;

            grabbable = target.grabbable &&  target.grabbable();
            if( grabbable ){
              target.ungrabify();
            }

            var rp, rw, rh;
            if( !isCy && ele.isNode() ){
              rp = ele.renderedPosition();
              rw = ele.renderedWidth();
              rh = ele.renderedHeight();
            } else {
              rp = e.cyRenderedPosition;
              rw = 1;
              rh = 1;
            }

            var scrollLeft = $(window).scrollLeft();
            var scrollTop = $(window).scrollTop();
            offset = getOffset( $container );

            ctrx = rp.x;
            ctry = rp.y;

            $parent.show().css({
              'left': rp.x - r + 'px',
              'top': rp.y - r + 'px'
            });

            rs = Math.max(rw, rh)/2;
            rs = Math.max(rs, options.minSpotlightRadius);
            rs = Math.min(rs, options.maxSpotlightRadius);

            drawBg();

            activeCommandI = undefined;

            inGesture = true;
          })

          .on('cxtdrag tapdrag', options.selector, dragHandler = function(e){ rateLimitedCall(function(){

            if( !inGesture ){ return; }

            var origE = e.originalEvent;
            var isTouch = origE.touches && origE.touches.length > 0;

            var pageX = isTouch ? origE.touches[0].pageX : origE.pageX;
            var pageY = isTouch ? origE.touches[0].pageY : origE.pageY;

            var dx = pageX - offset.left - ctrx;
            var dy = pageY - offset.top - ctry;

            if( dx === 0 ){ dx = 0.01; }

            var d = Math.sqrt( dx*dx + dy*dy );
            var cosTheta = (dy*dy - d*d - dx*dx)/(-2 * d * dx);
            var theta = Math.acos( cosTheta );

            activeCommandI = undefined;

            if( d < rs + options.spotlightPadding ){
              drawBg();
              return;
            }

            drawBg();

            var rx = dx*r / d;
            var ry = dy*r / d;
            
            if( dy > 0 ){
              theta = Math.PI + Math.abs(theta - Math.PI);
            }

            var commands = options.commands;
            var dtheta = 2*Math.PI/(commands.length);
            var theta1 = commands.length % 2 !== 0 ? Math.PI/2 : 0;
            var theta2 = theta1 + dtheta;

            for( var i = 0; i < commands.length; i++ ){
              var command = commands[i];


              // console.log(i, theta1, theta, theta2);

              var inThisCommand = theta1 <= theta && theta <= theta2
                || theta1 <= theta + 2*Math.PI && theta + 2*Math.PI <= theta2;

              if( inThisCommand ){
                // console.log('in command ' + i)
                
                c2d.fillStyle = options.activeFillColor;
                c2d.strokeStyle = 'black';
                c2d.lineWidth = 1;
                c2d.beginPath();
                c2d.moveTo(r + options.activePadding, r + options.activePadding);
                c2d.arc(r + options.activePadding, r + options.activePadding, r + options.activePadding, 2*Math.PI - theta1, 2*Math.PI - theta2, true);
                c2d.closePath();
                c2d.fill();
                //c2d.stroke();

                activeCommandI = i;

                break;
              }

              theta1 += dtheta;
              theta2 += dtheta;
            }

            c2d.fillStyle = 'white';
            c2d.globalCompositeOperation = 'destination-out';

            // clear the indicator
            c2d.beginPath();
            //c2d.arc(r + rx/r*(rs + options.spotlightPadding), r + ry/r*(rs + options.spotlightPadding), options.indicatorSize, 0, 2*Math.PI, true);
          
            c2d.translate( r + options.activePadding + rx/r*(rs + options.spotlightPadding - options.indicatorSize/4), r + options.activePadding + ry/r*(rs + options.spotlightPadding - options.indicatorSize/4) );
            c2d.rotate( Math.PI/4 - theta );
            c2d.fillRect(-options.indicatorSize/2, -options.indicatorSize/2, options.indicatorSize, options.indicatorSize);
            c2d.closePath();
            c2d.fill();

            c2d.setTransform(1, 0, 0, 1, 0, 0);

            // clear the spotlight
            c2d.beginPath();
            c2d.arc(r + options.activePadding, r + options.activePadding, rs + options.spotlightPadding, 0, Math.PI*2, true); 
            c2d.closePath();
            c2d.fill();

            c2d.globalCompositeOperation = 'source-over';
          }) })

          .on('tapdrag', dragHandler)

          .on('cxttapend tapend', options.selector, function(e){
            var ele = this;
            $parent.hide();

            if( activeCommandI !== undefined ){
              var select = options.commands[ activeCommandI ].select;

              if( select ){
                select.apply( ele );
                activeCommandI = undefined;
              }
            }

            inGesture = false;

            if( grabbable ){
              target.grabify();
            }
          })

          .on('cxttapend tapend', function(e){
            $parent.hide();

            inGesture = false;

            if( grabbable ){
              target.grabify();
            }
          })
        ;
      }

      function removeEventListeners(){
        var handlers = data.handlers;

        for( var i = 0; i < handlers.length; i++ ){
          var h = handlers[i];

          if( h.selector === 'core' ){
            cy.off(h.events, h.fn);
          } else {
            cy.off(h.events, h.selector, h.fn);
          }
        }
      }

      function destroyInstance(){
        removeEventListeners();

        removeDomListeners();
        $wrapper.remove();
      }
        
      addEventListeners();

      return {
        destroy: function(){
          destroyInstance();
        }
      };

    });

  }; // reg

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-cxtmenu', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape, $ );
  }

})( jQuery );

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.cytoscapeNgraph || (g.cytoscapeNgraph = {})).forcelayout = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var work = _dereq_('webworkify');
var tojson = _dereq_('ngraph.tojson');
var eventify = _dereq_('ngraph.events');

var createLayout = _dereq_('./lib/createLayout.js');
var validateOptions = _dereq_('./options.js');
var messageKind = _dereq_('./lib/messages.js');

module.exports = createAsyncLayout;

function createAsyncLayout(graph, options) {
  options = validateOptions(options);

  var assignPosition = options.is3d ? assignPosition3d : assignPosition2d;

  var pendingInitialization = false;
  var initRequestSent = false;
  var systemStable = false;
  var graphRect;
  var pinStatus = Object.create(null);
  var linkPositions;

  // Since this is fairly common message, there is no need to recreate it every time:
  var stepMessage = { kind: messageKind.step };

  var positions = Object.create(null);

  var layoutWorker = work(_dereq_('./lib/layoutWorker.js'));
  layoutWorker.addEventListener('message', handleMessageFromWorker);

  initWorker();
  initPositions();

  var api = {
    /**
     * Request to perform one iteration of force layout. The request is
     * forwarded to web worker
     *
     * @returns {boolean} true if system is considered stable; false otherwise.
     */
    step: asyncStep,

    /**
     * Gets the last known position of a given node by its identifier.
     *
     * @param {string} nodeId identifier of a node in question.
     * @returns {object} {x: number, y: number, z: number} coordinates of a node.
     */
    getNodePosition: getNodePosition,

    /**
     * Gets the last known position of a given link by its identifier.
     *
     * @param {string} linkId identifier of a link in question.
     * @returns {Object} Link position by link id
     * @returns {Object.from} {x, y} coordinates of link start
     * @returns {Object.to} {x, y} coordinates of link end
     */
    getLinkPosition: getLinkPosition,

    /**
     * Requests layout algorithm to pin/unpin node to its current position
     * Pinned nodes should not be affected by layout algorithm and always
     * remain at their position
     *
     * @param {object} node graph node that needs to be pinned
     * @param {boolean} isPinned status of the node.
     */
    pinNode: asyncPinNode,

    /**
     * Sets position of a node to a given coordinates
     * @param {string} nodeId node identifier
     * @param {number} x position of a node
     * @param {number} y position of a node
     * @param {number=} z position of node (only if 3d layout)
     */
    setNodePosition: asyncNodePosition,

    /**
     * Gets rectangle (or a box) that bounds the graph
     */
    getGraphRect: getGraphRect,

    /**
     * Returns true if node is currently pinned (i.e. not moved by layout);
     * False otherwise.
     */
    isNodePinned: isNodePinned
  };

  eventify(api);

  return api;

  function asyncStep() {
    // we cannot do anything until we receive 'initDone' message from worker
    // to confirm that it's ready to process layout requests.
    if (pendingInitialization) return;

    layoutWorker.postMessage(stepMessage);

    // TODO: I need to rewrite ngraph.forcelayout to be even-driven,
    // so that it can notify caller about stable/unstable change asynchronously
    return systemStable;
  }

  function asyncNodePosition(nodeId, x, y, z) {
    // let layout know that we changed the position
    layoutWorker.postMessage({
      kind: messageKind.setNodePosition,
      payload: {
        nodeId: nodeId,
        x: x,
        y: y,
        z: z
      }
    });
    // also update synchronously our last remember position:
    assignPosition(positions[nodeId], { x: x, y: y, z: z });
  }

  function getGraphRect() {
    return graphRect;
  }

  function asyncPinNode(node, isPinned) {
    layoutWorker.postMessage({
      kind: messageKind.pinNode,
      payload: {
        nodeId: node.id,
        isPinned: isPinned
      }
    });

    // we need to have sync way of answering to isNodePinned request.
    // This is not perfect, since original graph configuration may
    // include pinned nodes. We currently do not take that into account.
    pinStatus[node.id] = isPinned;
  }

  function isNodePinned(node) {
    return pinStatus[node.id];
  }

  function initWorker() {
    if (initRequestSent) {
      throw new Error('Init request is already sent to the worker');
    }

    layoutWorker.postMessage({
      kind: messageKind.init,
      payload: {
        graph: tojson(graph),
        options: JSON.stringify(options)
      }
    });

    initRequestSent = true;
  }

  function initPositions() {
    // we need to initialize positions just once
    var layout = createLayout(graph, options);
    graph.forEachNode(initPosition);
    graphRect = layout.getGraphRect();

    function initPosition(node) {
      positions[node.id] = layout.getNodePosition(node.id);
    }
  }

  function getNodePosition(nodeId) {
    return positions[nodeId];
  }

  function getLinkPosition(linkId) {
    if (!linkPositions) {
      initializeLinkPositions();
    }
    return linkPositions[linkId];
  }

  function initializeLinkPositions() {
    linkPositions = Object.create(null);
    graph.forEachLink(function(link) {
      linkPositions[link.id] = {
        from: getNodePosition(link.fromId),
        to: getNodePosition(link.toId)
      };
    });
  }

  function handleMessageFromWorker(message) {
    var kind = message.data.kind;
    var payload = message.data.payload

    if (kind === messageKind.cycleComplete) {
      setPositions(payload.positions, payload.systemStable);
      graphRect = payload.bbox;
      api.fire('cycle', payload.iterations, payload.systemStable);
    } if (kind === messageKind.initDone) {
      pendingInitialization = false;
      asyncStep();
    }
  }

  function setPositions(newPositions, newSystemStable) {
    systemStable = newSystemStable;
    Object.keys(newPositions).forEach(updatePosition);
    return;

    function updatePosition(nodeId) {
      var newPosition = newPositions[nodeId];
      var oldPosition = positions[nodeId];
      if (!oldPosition) {
        positions[nodeId] = newPosition;
      } else {
        assignPosition(oldPosition, newPosition);
      }
    }
  }
}

function assignPosition3d(oldPos, newPos) {
  oldPos.x = newPos.x;
  oldPos.y = newPos.y;
  oldPos.z = newPos.z;
}

function assignPosition2d(oldPos, newPos) {
  oldPos.x = newPos.x;
  oldPos.y = newPos.y;
}

},{"./lib/createLayout.js":2,"./lib/layoutWorker.js":3,"./lib/messages.js":4,"./options.js":5,"ngraph.events":6,"ngraph.tojson":35,"webworkify":39}],2:[function(_dereq_,module,exports){
var layout3d = _dereq_('ngraph.forcelayout3d');
var layout2d = layout3d.get2dLayout;

module.exports = createLayout;

function createLayout(graph, options) {
  options = options || {};

  return options.is3d ?
    layout3d(graph, options.physics) :
    layout2d(graph, options.physics);
}

},{"ngraph.forcelayout3d":16}],3:[function(_dereq_,module,exports){
var createLayout = _dereq_('./createLayout.js');
var fromjson = _dereq_('ngraph.fromjson');
var validateOptions = _dereq_('../options.js');
var messageKind = _dereq_('./messages.js');

module.exports = layoutWorker;

/**
 * This method is executed as a webworker thread. It expects 'init' signal
 * from the main thread to start layout.
 */
function layoutWorker(self) {
  var layout; // main thread will send a message to initialize this
  var asyncOptions;
  var completedIterations = 0;
  var stepCalled = false;
  var timeoutId = 0;
  var systemStable = false;
  var graph;

  var positions = Object.create(null);
  self.addEventListener('message', handleMessageFromMainThread);

  return; // public API is over. Below are private methods only.

  function handleMessageFromMainThread(message) {
    var kind = message.data.kind;
    var payload = message.data.payload;

    if (kind === messageKind.init) {
      graph = fromjson(payload.graph);
      var options = JSON.parse(payload.options);

      init(graph, options);
    } else if (kind === messageKind.step) {
      step();
    } else if (kind === messageKind.pinNode) {
      pinNode(payload.nodeId, payload.isPinned);
    } else if (kind === messageKind.setNodePosition) {
      setNodePosition(payload.nodeId, payload.x, payload.y, payload.z);
    }
    // TODO: listen for graph changes from main thread and update layout here.
  }

  function setNodePosition(nodeId, x, y, z) {
    assertInitialized();

    layout.setNodePosition.apply(layout, arguments);
    systemStable = false;
    step();
  }

  function pinNode(nodeId, isPinned) {
    assertInitialized();

    var node = graph.getNode(nodeId);
    if (!node) return; // ignoring right now. should it throw?

    layout.pinNode(node, isPinned);
  }

  function assertInitialized() {
    if (!graph) throw new Error('Pin node requested without initialied graph');
    if (!layout) throw new Error('Layout was not created. Something is really wrong here');
  }

  function init(graph, options) {
    // unfortunately we need to revalidate here, since POSITIVE_INFINITY could
    // be lost during threads transition
    options = validateOptions(options);
    asyncOptions = options.async;

    layout = createLayout(graph, options);
    graph.forEachNode(initPosition);

    // let main thread know that we can process layout
    self.postMessage({ kind: messageKind.initDone });
  }

  function initPosition(node) {
    positions[node.id] = layout.getNodePosition(node.id);
  }

  function step() {
    assertInitialized();

    stepCalled = true;

    if (!timeoutId) {
      runLayoutCycleAsync();
    }
  }

  function runLayoutCycleAsync() {
    if (systemStable) {
      timeoutId = 0;
      return;
    }

    // we have to unblock this thread to receive messages from the main thread.
    timeoutId = setTimeout(function() {
      runLayoutCycle();

      // We either wait until next `step` event from RAF, or run now if asked to
      // not wait for `step`.
      if (stepCalled || !asyncOptions.waitForStep) {
        stepCalled = false;
        runLayoutCycleAsync();
      } else {
        // wait for the next event from the main thread to continue;
        timeoutId = 0;
      }
    }, 0);
  }

  function runLayoutCycle() {
    var wasStable = systemStable;
    for (var i = 0; i < asyncOptions.stepsPerCycle; ++i) {
      systemStable = layout.step();
      completedIterations += 1;
    }

    if (completedIterations >= asyncOptions.maxIterations) {
      systemStable = true;
    }

    self.postMessage({
      kind: messageKind.cycleComplete,
      payload: {
        positions: positions,
        systemStable: systemStable,
        bbox: layout.getGraphRect(),
        iterations: completedIterations
      }
    });
  }
};

},{"../options.js":5,"./createLayout.js":2,"./messages.js":4,"ngraph.fromjson":22}],4:[function(_dereq_,module,exports){
/**
 * This file defines all possible messages between main thread and
 * web worker. The key is human readable message type, and the value is a
 * numeric attribute for quick matching
 */
module.exports = {
  /**
   * Sent from main thread to web worker to initialize force layout
   *
   * payload:
   *  {string} graph - result of ngraph.tojson(graph) operation.
   *  {string} options - stringified optinons received by ngraph.asyncforce().
   */
  init: 10,

  /**
   * Sent from web worker to main thread to confirm that worker has done
   * initializatino and can process incoming layout requests
   *
   * payload: undefined.
   */
  initDone: 11,

  /**
   * Sent from main thread to web worker to notify that rendering loop is currently
   * active and worker should perform layout (if required). Worker can decide
   * to ignore this request if, for example, layout is already computed, or
   * worker has performed more than options.async.maxIterations iterations.
   *
   * payload: undefined.
   */
  step: 12,

  /**
   * Sent from webworker to main thread to indicate that worker has finished
   * one cycle of layout iterations. Each cycle can perform up to
   * options.asnc.stepsPerCycle iterations of layout.
   *
   * payload:
   *  {object} positions - keys are node ids, values are {x, y, z} coordinates
   *  {boolean} systemStable - indicates that system is stable. NOTE: this will
   *  be removed from future version.
   */
  cycleComplete: 13,

  /**
   * Sent from main thread to web worker to pin node
   *
   * payload:
   *   {string} nodeId - identifier of the node that needs to be pinned
   *   {boolean} isPinned status of the node
   */
  pinNode: 41,

  /**
   * Sent from main thread to web worker to set position of the node
   *
   * payload:
   *  {string} nodeId - identifier of the node that needs position update.
   *  {number} x - x coordinate
   *  {number} y - y coordinate
   *  {number+} z - z coordinate - only applicable for 3d layout
   */
  setNodePosition: 43
};

},{}],5:[function(_dereq_,module,exports){
/**
 * This file defines configuration options for the asyncforce module. Every
 * configuration is optional. You can find its description and default value below.
 */
module.exports = validateOptions;

function validateOptions(options) {
  options = options || {};

  /**
   * Do we need to run 3D layout or 2D?
   */
  options.is3d = typeof options.is3d === 'boolean' ? options.is3d : false;

  // These options are in separate object since they configure web worker behavior
  // not layout.
  var async = (options.async = options.async || {});

  /**
   * Web worker computes layout in cycles. After each cycle is done web worker
   * notifies the main thread with updated positions. This options defines
   * how many layout steps should web worker complete within one cycle.
   */
  async.stepsPerCycle = typeof async.stepsPerCycle === 'number' ? async.stepsPerCycle : 5;

  /**
   * By default layout will be computed as long as each iteration brings too
   * much movement to the system. However if you'd like to compute only N iterations
   * of layout, you can set this option to N. Once layout reaches N it will consider
   * system stable and will not compute more iterations.
   */
  async.maxIterations = typeof async.maxIterations === 'number' ? async.maxIterations : Number.POSITIVE_INFINITY;

  /**
   * Unlike requestAnimationFrame() web workers are executed even when page is
   * not active (e.g. user switched to a different browser tab). This can result
   * in unnecessary CPU consumption and battery drain.
   *
   * By default asyncforce will calculate layout as long as you call
   * `asncforce.step()`. Normally you will call this method from
   * requestAnimationFrame() handler to manage CPU resources.
   *
   * However, if you prefer to keep computing layout in background set this
   * options to true. Layout will be computed until system is considered stable
   * (see `maxIterations` above).
   */
  async.waitForStep = typeof async.waitForStep === 'boolean' ? async.waitForStep : true;
  return options;
}

},{}],6:[function(_dereq_,module,exports){
module.exports = function(subject) {
  validateSubject(subject);

  var eventsStorage = createEventsStorage(subject);
  subject.on = eventsStorage.on;
  subject.off = eventsStorage.off;
  subject.fire = eventsStorage.fire;
  return subject;
};

function createEventsStorage(subject) {
  // Store all event listeners to this hash. Key is event name, value is array
  // of callback records.
  //
  // A callback record consists of callback function and its optional context:
  // { 'eventName' => [{callback: function, ctx: object}] }
  var registeredEvents = Object.create(null);

  return {
    on: function (eventName, callback, ctx) {
      if (typeof callback !== 'function') {
        throw new Error('callback is expected to be a function');
      }
      var handlers = registeredEvents[eventName];
      if (!handlers) {
        handlers = registeredEvents[eventName] = [];
      }
      handlers.push({callback: callback, ctx: ctx});

      return subject;
    },

    off: function (eventName, callback) {
      var wantToRemoveAll = (typeof eventName === 'undefined');
      if (wantToRemoveAll) {
        // Killing old events storage should be enough in this case:
        registeredEvents = Object.create(null);
        return subject;
      }

      if (registeredEvents[eventName]) {
        var deleteAllCallbacksForEvent = (typeof callback !== 'function');
        if (deleteAllCallbacksForEvent) {
          delete registeredEvents[eventName];
        } else {
          var callbacks = registeredEvents[eventName];
          for (var i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].callback === callback) {
              callbacks.splice(i, 1);
            }
          }
        }
      }

      return subject;
    },

    fire: function (eventName) {
      var callbacks = registeredEvents[eventName];
      if (!callbacks) {
        return subject;
      }

      var fireArguments;
      if (arguments.length > 1) {
        fireArguments = Array.prototype.splice.call(arguments, 1);
      }
      for(var i = 0; i < callbacks.length; ++i) {
        var callbackInfo = callbacks[i];
        callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
      }

      return subject;
    }
  };
}

function validateSubject(subject) {
  if (!subject) {
    throw new Error('Eventify cannot use falsy object as events subject');
  }
  var reservedWords = ['on', 'fire', 'off'];
  for (var i = 0; i < reservedWords.length; ++i) {
    if (subject.hasOwnProperty(reservedWords[i])) {
      throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
    }
  }
}

},{}],7:[function(_dereq_,module,exports){
module.exports = exposeProperties;

/**
 * Augments `target` object with getter/setter functions, which modify settings
 *
 * @example
 *  var target = {};
 *  exposeProperties({ age: 42}, target);
 *  target.age(); // returns 42
 *  target.age(24); // make age 24;
 *
 *  var filteredTarget = {};
 *  exposeProperties({ age: 42, name: 'John'}, filteredTarget, ['name']);
 *  filteredTarget.name(); // returns 'John'
 *  filteredTarget.age === undefined; // true
 */
function exposeProperties(settings, target, filter) {
  var needsFilter = Object.prototype.toString.call(filter) === '[object Array]';
  if (needsFilter) {
    for (var i = 0; i < filter.length; ++i) {
      augment(settings, target, filter[i]);
    }
  } else {
    for (var key in settings) {
      augment(settings, target, key);
    }
  }
}

function augment(source, target, key) {
  if (source.hasOwnProperty(key)) {
    if (typeof target[key] === 'function') {
      // this accessor is already defined. Ignore it
      return;
    }
    target[key] = function (value) {
      if (value !== undefined) {
        source[key] = value;
        return target;
      }
      return source[key];
    }
  }
}

},{}],8:[function(_dereq_,module,exports){
module.exports = createLayout;
module.exports.simulator = _dereq_('ngraph.physics.simulator');

/**
 * Creates force based layout for a given graph.
 * @param {ngraph.graph} graph which needs to be laid out
 * @param {object} physicsSettings if you need custom settings
 * for physics simulator you can pass your own settings here. If it's not passed
 * a default one will be created.
 */
function createLayout(graph, physicsSettings) {
  if (!graph) {
    throw new Error('Graph structure cannot be undefined');
  }

  var createSimulator = _dereq_('ngraph.physics.simulator');
  var physicsSimulator = createSimulator(physicsSettings);

  var nodeBodies = typeof Object.create === 'function' ? Object.create(null) : {};
  var springs = {};

  var springTransform = physicsSimulator.settings.springTransform || noop;

  // Initialize physical objects according to what we have in the graph:
  initPhysics();
  listenToGraphEvents();

  var api = {
    /**
     * Performs one step of iterative layout algorithm
     */
    step: function() {
      return physicsSimulator.step();
    },

    /**
     * For a given `nodeId` returns position
     */
    getNodePosition: function (nodeId) {
      return getInitializedBody(nodeId).pos;
    },

    /**
     * Sets position of a node to a given coordinates
     * @param {string} nodeId node identifier
     * @param {number} x position of a node
     * @param {number} y position of a node
     * @param {number=} z position of node (only if applicable to body)
     */
    setNodePosition: function (nodeId) {
      var body = getInitializedBody(nodeId);
      body.setPosition.apply(body, Array.prototype.slice.call(arguments, 1));
    },

    /**
     * @returns {Object} Link position by link id
     * @returns {Object.from} {x, y} coordinates of link start
     * @returns {Object.to} {x, y} coordinates of link end
     */
    getLinkPosition: function (linkId) {
      var spring = springs[linkId];
      if (spring) {
        return {
          from: spring.from.pos,
          to: spring.to.pos
        };
      }
    },

    /**
     * @returns {Object} area required to fit in the graph. Object contains
     * `x1`, `y1` - top left coordinates
     * `x2`, `y2` - bottom right coordinates
     */
    getGraphRect: function () {
      return physicsSimulator.getBBox();
    },

    /*
     * Requests layout algorithm to pin/unpin node to its current position
     * Pinned nodes should not be affected by layout algorithm and always
     * remain at their position
     */
    pinNode: function (node, isPinned) {
      var body = getInitializedBody(node.id);
       body.isPinned = !!isPinned;
    },

    /**
     * Checks whether given graph's node is currently pinned
     */
    isNodePinned: function (node) {
      return getInitializedBody(node.id).isPinned;
    },

    /**
     * Request to release all resources
     */
    dispose: function() {
      graph.off('changed', onGraphChanged);
    },

    /**
     * Gets physical body for a given node id. If node is not found undefined
     * value is returned.
     */
    getBody: getBody,

    /**
     * Gets spring for a given edge.
     *
     * @param {string} linkId link identifer. If two arguments are passed then
     * this argument is treated as formNodeId
     * @param {string=} toId when defined this parameter denotes head of the link
     * and first argument is trated as tail of the link (fromId)
     */
    getSpring: getSpring,

    /**
     * [Read only] Gets current physics simulator
     */
    simulator: physicsSimulator
  };

  return api;

  function getSpring(fromId, toId) {
    var linkId;
    if (toId === undefined) {
      if (typeof fromId === 'string') {
        // assume fromId as a linkId:
        linkId = fromId;
      } else {
        // assume fromId to be a link object:
        linkId = fromId.id;
      }
    } else {
      // toId is defined, should grab link:
      var link = graph.hasLink(fromId, toId);
      if (!link) return;
      linkId = link.id;
    }

    return springs[linkId];
  }

  function getBody(nodeId) {
    return nodeBodies[nodeId];
  }

  function listenToGraphEvents() {
    graph.on('changed', onGraphChanged);
  }

  function onGraphChanged(changes) {
    for (var i = 0; i < changes.length; ++i) {
      var change = changes[i];
      if (change.changeType === 'add') {
        if (change.node) {
          initBody(change.node.id);
        }
        if (change.link) {
          initLink(change.link);
        }
      } else if (change.changeType === 'remove') {
        if (change.node) {
          releaseNode(change.node);
        }
        if (change.link) {
          releaseLink(change.link);
        }
      }
    }
  }

  function initPhysics() {
    graph.forEachNode(function (node) {
      initBody(node.id);
    });
    graph.forEachLink(initLink);
  }

  function initBody(nodeId) {
    var body = nodeBodies[nodeId];
    if (!body) {
      var node = graph.getNode(nodeId);
      if (!node) {
        throw new Error('initBody() was called with unknown node id');
      }

      var pos = node.position;
      if (!pos) {
        var neighbors = getNeighborBodies(node);
        pos = physicsSimulator.getBestNewBodyPosition(neighbors);
      }

      body = physicsSimulator.addBodyAt(pos);

      nodeBodies[nodeId] = body;
      updateBodyMass(nodeId);

      if (isNodeOriginallyPinned(node)) {
        body.isPinned = true;
      }
    }
  }

  function releaseNode(node) {
    var nodeId = node.id;
    var body = nodeBodies[nodeId];
    if (body) {
      nodeBodies[nodeId] = null;
      delete nodeBodies[nodeId];

      physicsSimulator.removeBody(body);
    }
  }

  function initLink(link) {
    updateBodyMass(link.fromId);
    updateBodyMass(link.toId);

    var fromBody = nodeBodies[link.fromId],
        toBody  = nodeBodies[link.toId],
        spring = physicsSimulator.addSpring(fromBody, toBody, link.length);

    springTransform(link, spring);

    springs[link.id] = spring;
  }

  function releaseLink(link) {
    var spring = springs[link.id];
    if (spring) {
      var from = graph.getNode(link.fromId),
          to = graph.getNode(link.toId);

      if (from) updateBodyMass(from.id);
      if (to) updateBodyMass(to.id);

      delete springs[link.id];

      physicsSimulator.removeSpring(spring);
    }
  }

  function getNeighborBodies(node) {
    // TODO: Could probably be done better on memory
    var neighbors = [];
    if (!node.links) {
      return neighbors;
    }
    var maxNeighbors = Math.min(node.links.length, 2);
    for (var i = 0; i < maxNeighbors; ++i) {
      var link = node.links[i];
      var otherBody = link.fromId !== node.id ? nodeBodies[link.fromId] : nodeBodies[link.toId];
      if (otherBody && otherBody.pos) {
        neighbors.push(otherBody);
      }
    }

    return neighbors;
  }

  function updateBodyMass(nodeId) {
    var body = nodeBodies[nodeId];
    body.mass = nodeMass(nodeId);
  }

  /**
   * Checks whether graph node has in its settings pinned attribute,
   * which means layout algorithm cannot move it. Node can be preconfigured
   * as pinned, if it has "isPinned" attribute, or when node.data has it.
   *
   * @param {Object} node a graph node to check
   * @return {Boolean} true if node should be treated as pinned; false otherwise.
   */
  function isNodeOriginallyPinned(node) {
    return (node && (node.isPinned || (node.data && node.data.isPinned)));
  }

  function getInitializedBody(nodeId) {
    var body = nodeBodies[nodeId];
    if (!body) {
      initBody(nodeId);
      body = nodeBodies[nodeId];
    }
    return body;
  }

  /**
   * Calculates mass of a body, which corresponds to node with given id.
   *
   * @param {String|Number} nodeId identifier of a node, for which body mass needs to be calculated
   * @returns {Number} recommended mass of the body;
   */
  function nodeMass(nodeId) {
    return 1 + graph.getLinks(nodeId).length / 3.0;
  }
}

function noop() { }

},{"ngraph.physics.simulator":9}],9:[function(_dereq_,module,exports){
/**
 * Manages a simulation of physical forces acting on bodies and springs.
 */
module.exports = physicsSimulator;

function physicsSimulator(settings) {
  var Spring = _dereq_('./lib/spring');
  var expose = _dereq_('ngraph.expose');
  var merge = _dereq_('ngraph.merge');

  settings = merge(settings, {
      /**
       * Ideal length for links (springs in physical model).
       */
      springLength: 30,

      /**
       * Hook's law coefficient. 1 - solid spring.
       */
      springCoeff: 0.0008,

      /**
       * Coulomb's law coefficient. It's used to repel nodes thus should be negative
       * if you make it positive nodes start attract each other :).
       */
      gravity: -1.2,

      /**
       * Theta coefficient from Barnes Hut simulation. Ranged between (0, 1).
       * The closer it's to 1 the more nodes algorithm will have to go through.
       * Setting it to one makes Barnes Hut simulation no different from
       * brute-force forces calculation (each node is considered).
       */
      theta: 0.8,

      /**
       * Drag force coefficient. Used to slow down system, thus should be less than 1.
       * The closer it is to 0 the less tight system will be.
       */
      dragCoeff: 0.02,

      /**
       * Default time step (dt) for forces integration
       */
      timeStep : 20,

      /**
        * Maximum movement of the system which can be considered as stabilized
        */
      stableThreshold: 0.009
  });

  // We allow clients to override basic factory methods:
  var createQuadTree = settings.createQuadTree || _dereq_('ngraph.quadtreebh');
  var createBounds = settings.createBounds || _dereq_('./lib/bounds');
  var createDragForce = settings.createDragForce || _dereq_('./lib/dragForce');
  var createSpringForce = settings.createSpringForce || _dereq_('./lib/springForce');
  var integrate = settings.integrator || _dereq_('./lib/eulerIntegrator');
  var createBody = settings.createBody || _dereq_('./lib/createBody');

  var bodies = [], // Bodies in this simulation.
      springs = [], // Springs in this simulation.
      quadTree =  createQuadTree(settings),
      bounds = createBounds(bodies, settings),
      springForce = createSpringForce(settings),
      dragForce = createDragForce(settings);

  var publicApi = {
    /**
     * Array of bodies, registered with current simulator
     *
     * Note: To add new body, use addBody() method. This property is only
     * exposed for testing/performance purposes.
     */
    bodies: bodies,

    /**
     * Array of springs, registered with current simulator
     *
     * Note: To add new spring, use addSpring() method. This property is only
     * exposed for testing/performance purposes.
     */
    springs: springs,

    /**
     * Returns settings with which current simulator was initialized
     */
    settings: settings,

    /**
     * Performs one step of force simulation.
     *
     * @returns {boolean} true if system is considered stable; False otherwise.
     */
    step: function () {
      accumulateForces();
      var totalMovement = integrate(bodies, settings.timeStep);

      bounds.update();

      return totalMovement < settings.stableThreshold;
    },

    /**
     * Adds body to the system
     *
     * @param {ngraph.physics.primitives.Body} body physical body
     *
     * @returns {ngraph.physics.primitives.Body} added body
     */
    addBody: function (body) {
      if (!body) {
        throw new Error('Body is required');
      }
      bodies.push(body);

      return body;
    },

    /**
     * Adds body to the system at given position
     *
     * @param {Object} pos position of a body
     *
     * @returns {ngraph.physics.primitives.Body} added body
     */
    addBodyAt: function (pos) {
      if (!pos) {
        throw new Error('Body position is required');
      }
      var body = createBody(pos);
      bodies.push(body);

      return body;
    },

    /**
     * Removes body from the system
     *
     * @param {ngraph.physics.primitives.Body} body to remove
     *
     * @returns {Boolean} true if body found and removed. falsy otherwise;
     */
    removeBody: function (body) {
      if (!body) { return; }

      var idx = bodies.indexOf(body);
      if (idx < 0) { return; }

      bodies.splice(idx, 1);
      if (bodies.length === 0) {
        bounds.reset();
      }
      return true;
    },

    /**
     * Adds a spring to this simulation.
     *
     * @returns {Object} - a handle for a spring. If you want to later remove
     * spring pass it to removeSpring() method.
     */
    addSpring: function (body1, body2, springLength, springWeight, springCoefficient) {
      if (!body1 || !body2) {
        throw new Error('Cannot add null spring to force simulator');
      }

      if (typeof springLength !== 'number') {
        springLength = -1; // assume global configuration
      }

      var spring = new Spring(body1, body2, springLength, springCoefficient >= 0 ? springCoefficient : -1, springWeight);
      springs.push(spring);

      // TODO: could mark simulator as dirty.
      return spring;
    },

    /**
     * Removes spring from the system
     *
     * @param {Object} spring to remove. Spring is an object returned by addSpring
     *
     * @returns {Boolean} true if spring found and removed. falsy otherwise;
     */
    removeSpring: function (spring) {
      if (!spring) { return; }
      var idx = springs.indexOf(spring);
      if (idx > -1) {
        springs.splice(idx, 1);
        return true;
      }
    },

    getBestNewBodyPosition: function (neighbors) {
      return bounds.getBestNewPosition(neighbors);
    },

    /**
     * Returns bounding box which covers all bodies
     */
    getBBox: function () {
      return bounds.box;
    },

    gravity: function (value) {
      if (value !== undefined) {
        settings.gravity = value;
        quadTree.options({gravity: value});
        return this;
      } else {
        return settings.gravity;
      }
    },

    theta: function (value) {
      if (value !== undefined) {
        settings.theta = value;
        quadTree.options({theta: value});
        return this;
      } else {
        return settings.theta;
      }
    }
  };

  // allow settings modification via public API:
  expose(settings, publicApi);

  return publicApi;

  function accumulateForces() {
    // Accumulate forces acting on bodies.
    var body,
        i = bodies.length;

    if (i) {
      // only add bodies if there the array is not empty:
      quadTree.insertBodies(bodies); // performance: O(n * log n)
      while (i--) {
        body = bodies[i];
        // If body is pinned there is no point updating its forces - it should
        // never move:
        if (!body.isPinned) {
          body.force.reset();

          quadTree.updateBodyForce(body);
          dragForce.update(body);
        }
      }
    }

    i = springs.length;
    while(i--) {
      springForce.update(springs[i]);
    }
  }
};

},{"./lib/bounds":10,"./lib/createBody":11,"./lib/dragForce":12,"./lib/eulerIntegrator":13,"./lib/spring":14,"./lib/springForce":15,"ngraph.expose":7,"ngraph.merge":24,"ngraph.quadtreebh":26}],10:[function(_dereq_,module,exports){
module.exports = function (bodies, settings) {
  var random = _dereq_('ngraph.random').random(42);
  var boundingBox =  { x1: 0, y1: 0, x2: 0, y2: 0 };

  return {
    box: boundingBox,

    update: updateBoundingBox,

    reset : function () {
      boundingBox.x1 = boundingBox.y1 = 0;
      boundingBox.x2 = boundingBox.y2 = 0;
    },

    getBestNewPosition: function (neighbors) {
      var graphRect = boundingBox;

      var baseX = 0, baseY = 0;

      if (neighbors.length) {
        for (var i = 0; i < neighbors.length; ++i) {
          baseX += neighbors[i].pos.x;
          baseY += neighbors[i].pos.y;
        }

        baseX /= neighbors.length;
        baseY /= neighbors.length;
      } else {
        baseX = (graphRect.x1 + graphRect.x2) / 2;
        baseY = (graphRect.y1 + graphRect.y2) / 2;
      }

      var springLength = settings.springLength;
      return {
        x: baseX + random.next(springLength) - springLength / 2,
        y: baseY + random.next(springLength) - springLength / 2
      };
    }
  };

  function updateBoundingBox() {
    var i = bodies.length;
    if (i === 0) { return; } // don't have to wory here.

    var x1 = Number.MAX_VALUE,
        y1 = Number.MAX_VALUE,
        x2 = Number.MIN_VALUE,
        y2 = Number.MIN_VALUE;

    while(i--) {
      // this is O(n), could it be done faster with quadtree?
      // how about pinned nodes?
      var body = bodies[i];
      if (body.isPinned) {
        body.pos.x = body.prevPos.x;
        body.pos.y = body.prevPos.y;
      } else {
        body.prevPos.x = body.pos.x;
        body.prevPos.y = body.pos.y;
      }
      if (body.pos.x < x1) {
        x1 = body.pos.x;
      }
      if (body.pos.x > x2) {
        x2 = body.pos.x;
      }
      if (body.pos.y < y1) {
        y1 = body.pos.y;
      }
      if (body.pos.y > y2) {
        y2 = body.pos.y;
      }
    }

    boundingBox.x1 = x1;
    boundingBox.x2 = x2;
    boundingBox.y1 = y1;
    boundingBox.y2 = y2;
  }
}

},{"ngraph.random":34}],11:[function(_dereq_,module,exports){
var physics = _dereq_('ngraph.physics.primitives');

module.exports = function(pos) {
  return new physics.Body(pos);
}

},{"ngraph.physics.primitives":25}],12:[function(_dereq_,module,exports){
/**
 * Represents drag force, which reduces force value on each step by given
 * coefficient.
 *
 * @param {Object} options for the drag force
 * @param {Number=} options.dragCoeff drag force coefficient. 0.1 by default
 */
module.exports = function (options) {
  var merge = _dereq_('ngraph.merge'),
      expose = _dereq_('ngraph.expose');

  options = merge(options, {
    dragCoeff: 0.02
  });

  var api = {
    update : function (body) {
      body.force.x -= options.dragCoeff * body.velocity.x;
      body.force.y -= options.dragCoeff * body.velocity.y;
    }
  };

  // let easy access to dragCoeff:
  expose(options, api, ['dragCoeff']);

  return api;
};

},{"ngraph.expose":7,"ngraph.merge":24}],13:[function(_dereq_,module,exports){
/**
 * Performs forces integration, using given timestep. Uses Euler method to solve
 * differential equation (http://en.wikipedia.org/wiki/Euler_method ).
 *
 * @returns {Number} squared distance of total position updates.
 */

module.exports = integrate;

function integrate(bodies, timeStep) {
  var dx = 0, tx = 0,
      dy = 0, ty = 0,
      i,
      max = bodies.length;

  for (i = 0; i < max; ++i) {
    var body = bodies[i],
        coeff = timeStep / body.mass;

    body.velocity.x += coeff * body.force.x;
    body.velocity.y += coeff * body.force.y;
    var vx = body.velocity.x,
        vy = body.velocity.y,
        v = Math.sqrt(vx * vx + vy * vy);

    if (v > 1) {
      body.velocity.x = vx / v;
      body.velocity.y = vy / v;
    }

    dx = timeStep * body.velocity.x;
    dy = timeStep * body.velocity.y;

    body.pos.x += dx;
    body.pos.y += dy;

    tx += Math.abs(dx); ty += Math.abs(dy);
  }

  return (tx * tx + ty * ty)/bodies.length;
}

},{}],14:[function(_dereq_,module,exports){
module.exports = Spring;

/**
 * Represents a physical spring. Spring connects two bodies, has rest length
 * stiffness coefficient and optional weight
 */
function Spring(fromBody, toBody, length, coeff, weight) {
    this.from = fromBody;
    this.to = toBody;
    this.length = length;
    this.coeff = coeff;

    this.weight = typeof weight === 'number' ? weight : 1;
};

},{}],15:[function(_dereq_,module,exports){
/**
 * Represents spring force, which updates forces acting on two bodies, conntected
 * by a spring.
 *
 * @param {Object} options for the spring force
 * @param {Number=} options.springCoeff spring force coefficient.
 * @param {Number=} options.springLength desired length of a spring at rest.
 */
module.exports = function (options) {
  var merge = _dereq_('ngraph.merge');
  var random = _dereq_('ngraph.random').random(42);
  var expose = _dereq_('ngraph.expose');

  options = merge(options, {
    springCoeff: 0.0002,
    springLength: 80
  });

  var api = {
    /**
     * Upsates forces acting on a spring
     */
    update : function (spring) {
      var body1 = spring.from,
          body2 = spring.to,
          length = spring.length < 0 ? options.springLength : spring.length,
          dx = body2.pos.x - body1.pos.x,
          dy = body2.pos.y - body1.pos.y,
          r = Math.sqrt(dx * dx + dy * dy);

      if (r === 0) {
          dx = (random.nextDouble() - 0.5) / 50;
          dy = (random.nextDouble() - 0.5) / 50;
          r = Math.sqrt(dx * dx + dy * dy);
      }

      var d = r - length;
      var coeff = ((!spring.coeff || spring.coeff < 0) ? options.springCoeff : spring.coeff) * d / r * spring.weight;

      body1.force.x += coeff * dx;
      body1.force.y += coeff * dy;

      body2.force.x -= coeff * dx;
      body2.force.y -= coeff * dy;
    }
  };

  expose(options, api, ['springCoeff', 'springLength']);
  return api;
}

},{"ngraph.expose":7,"ngraph.merge":24,"ngraph.random":34}],16:[function(_dereq_,module,exports){
/**
 * This module provides all required forces to regular ngraph.physics.simulator
 * to make it 3D simulator. Ideally ngraph.physics.simulator should operate
 * with vectors, but on practices that showed performance decrease... Maybe
 * I was doing it wrong, will see if I can refactor/throw away this module.
 */
module.exports = createLayout;
createLayout.get2dLayout = _dereq_('ngraph.forcelayout');

function createLayout(graph, physicsSettings) {
  var merge = _dereq_('ngraph.merge');
  physicsSettings = merge(physicsSettings, {
        createQuadTree: _dereq_('ngraph.quadtreebh3d'),
        createBounds: _dereq_('./lib/bounds'),
        createDragForce: _dereq_('./lib/dragForce'),
        createSpringForce: _dereq_('./lib/springForce'),
        integrator: _dereq_('./lib/eulerIntegrator'),
        createBody: _dereq_('./lib/createBody')
      });

  return createLayout.get2dLayout(graph, physicsSettings);
}

},{"./lib/bounds":17,"./lib/createBody":18,"./lib/dragForce":19,"./lib/eulerIntegrator":20,"./lib/springForce":21,"ngraph.forcelayout":8,"ngraph.merge":24,"ngraph.quadtreebh3d":30}],17:[function(_dereq_,module,exports){
module.exports = function (bodies, settings) {
  var random = _dereq_('ngraph.random').random(42);
  var boundingBox =  { x1: 0, y1: 0, z1: 0, x2: 0, y2: 0, z2: 0 };

  return {
    box: boundingBox,

    update: updateBoundingBox,

    reset : function () {
      boundingBox.x1 = boundingBox.y1 = 0;
      boundingBox.x2 = boundingBox.y2 = 0;
      boundingBox.z1 = boundingBox.z2 = 0;
    },

    getBestNewPosition: function (neighbors) {
      var graphRect = boundingBox;

      var baseX = 0, baseY = 0, baseZ = 0;

      if (neighbors.length) {
        for (var i = 0; i < neighbors.length; ++i) {
          baseX += neighbors[i].pos.x;
          baseY += neighbors[i].pos.y;
          baseZ += neighbors[i].pos.z;
        }

        baseX /= neighbors.length;
        baseY /= neighbors.length;
        baseZ /= neighbors.length;
      } else {
        baseX = (graphRect.x1 + graphRect.x2) / 2;
        baseY = (graphRect.y1 + graphRect.y2) / 2;
        baseZ = (graphRect.z1 + graphRect.z2) / 2;
      }

      var springLength = settings.springLength;
      return {
        x: baseX + random.next(springLength) - springLength / 2,
        y: baseY + random.next(springLength) - springLength / 2,
        z: baseZ + random.next(springLength) - springLength / 2
      };
    }
  };

  function updateBoundingBox() {
    var i = bodies.length;
    if (i === 0) { return; } // don't have to wory here.

    var x1 = Number.MAX_VALUE,
        y1 = Number.MAX_VALUE,
        z1 = Number.MAX_VALUE,
        x2 = Number.MIN_VALUE,
        y2 = Number.MIN_VALUE,
        z2 = Number.MIN_VALUE;

    while(i--) {
      // this is O(n), could it be done faster with quadtree?
      // how about pinned nodes?
      var body = bodies[i];
      if (body.isPinned) {
        body.pos.x = body.prevPos.x;
        body.pos.y = body.prevPos.y;
        body.pos.z = body.prevPos.z;
      } else {
        body.prevPos.x = body.pos.x;
        body.prevPos.y = body.pos.y;
        body.prevPos.z = body.pos.z;
      }
      if (body.pos.x < x1) {
        x1 = body.pos.x;
      }
      if (body.pos.x > x2) {
        x2 = body.pos.x;
      }
      if (body.pos.y < y1) {
        y1 = body.pos.y;
      }
      if (body.pos.y > y2) {
        y2 = body.pos.y;
      }
      if (body.pos.z < z1) {
        z1 = body.pos.z;
      }
      if (body.pos.z > z2) {
        z2 = body.pos.z;
      }
    }

    boundingBox.x1 = x1;
    boundingBox.x2 = x2;
    boundingBox.y1 = y1;
    boundingBox.y2 = y2;
    boundingBox.z1 = z1;
    boundingBox.z2 = z2;
  }
};

},{"ngraph.random":34}],18:[function(_dereq_,module,exports){
var physics = _dereq_('ngraph.physics.primitives');

module.exports = function(pos) {
  return new physics.Body3d(pos);
}

},{"ngraph.physics.primitives":25}],19:[function(_dereq_,module,exports){
/**
 * Represents 3d drag force, which reduces force value on each step by given
 * coefficient.
 *
 * @param {Object} options for the drag force
 * @param {Number=} options.dragCoeff drag force coefficient. 0.1 by default
 */
module.exports = function (options) {
  var merge = _dereq_('ngraph.merge'),
      expose = _dereq_('ngraph.expose');

  options = merge(options, {
    dragCoeff: 0.02
  });

  var api = {
    update : function (body) {
      body.force.x -= options.dragCoeff * body.velocity.x;
      body.force.y -= options.dragCoeff * body.velocity.y;
      body.force.z -= options.dragCoeff * body.velocity.z;
    }
  };

  // let easy access to dragCoeff:
  expose(options, api, ['dragCoeff']);

  return api;
};

},{"ngraph.expose":7,"ngraph.merge":24}],20:[function(_dereq_,module,exports){
/**
 * Performs 3d forces integration, using given timestep. Uses Euler method to solve
 * differential equation (http://en.wikipedia.org/wiki/Euler_method ).
 *
 * @returns {Number} squared distance of total position updates.
 */

module.exports = integrate;

function integrate(bodies, timeStep) {
  var dx = 0, tx = 0,
      dy = 0, ty = 0,
      dz = 0, tz = 0,
      i,
      max = bodies.length;

  for (i = 0; i < max; ++i) {
    var body = bodies[i],
        coeff = timeStep / body.mass;

    body.velocity.x += coeff * body.force.x;
    body.velocity.y += coeff * body.force.y;
    body.velocity.z += coeff * body.force.z;

    var vx = body.velocity.x,
        vy = body.velocity.y,
        vz = body.velocity.z,
        v = Math.sqrt(vx * vx + vy * vy + vz * vz);

    if (v > 1) {
      body.velocity.x = vx / v;
      body.velocity.y = vy / v;
      body.velocity.z = vz / v;
    }

    dx = timeStep * body.velocity.x;
    dy = timeStep * body.velocity.y;
    dz = timeStep * body.velocity.z;

    body.pos.x += dx;
    body.pos.y += dy;
    body.pos.z += dz;

    tx += Math.abs(dx); ty += Math.abs(dy); tz += Math.abs(dz);
  }

  return (tx * tx + ty * ty + tz * tz)/bodies.length;
}

},{}],21:[function(_dereq_,module,exports){
/**
 * Represents 3d spring force, which updates forces acting on two bodies, conntected
 * by a spring.
 *
 * @param {Object} options for the spring force
 * @param {Number=} options.springCoeff spring force coefficient.
 * @param {Number=} options.springLength desired length of a spring at rest.
 */
module.exports = function (options) {
  var merge = _dereq_('ngraph.merge');
  var random = _dereq_('ngraph.random').random(42);
  var expose = _dereq_('ngraph.expose');

  options = merge(options, {
    springCoeff: 0.0002,
    springLength: 80
  });

  var api = {
    /**
     * Upsates forces acting on a spring
     */
    update : function (spring) {
      var body1 = spring.from,
          body2 = spring.to,
          length = spring.length < 0 ? options.springLength : spring.length,
          dx = body2.pos.x - body1.pos.x,
          dy = body2.pos.y - body1.pos.y,
          dz = body2.pos.z - body1.pos.z,
          r = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (r === 0) {
          dx = (random.nextDouble() - 0.5) / 50;
          dy = (random.nextDouble() - 0.5) / 50;
          dz = (random.nextDouble() - 0.5) / 50;
          r = Math.sqrt(dx * dx + dy * dy + dz * dz);
      }

      var d = r - length;
      var coeff = ((!spring.coeff || spring.coeff < 0) ? options.springCoeff : spring.coeff) * d / r * spring.weight;

      body1.force.x += coeff * dx;
      body1.force.y += coeff * dy;
      body1.force.z += coeff * dz;

      body2.force.x -= coeff * dx;
      body2.force.y -= coeff * dy;
      body2.force.z -= coeff * dz;
    }
  };

  expose(options, api, ['springCoeff', 'springLength']);
  return api;
}

},{"ngraph.expose":7,"ngraph.merge":24,"ngraph.random":34}],22:[function(_dereq_,module,exports){
module.exports = load;

var createGraph = _dereq_('ngraph.graph');

function load(jsonGraph, nodeTransform, linkTransform) {
  var stored;
  nodeTransform = nodeTransform || id;
  linkTransform = linkTransform || id;
  if (typeof jsonGraph === 'string') {
    stored = JSON.parse(jsonGraph);
  } else {
    stored = jsonGraph;
  }

  var graph = createGraph(),
      i;

  if (stored.links === undefined || stored.nodes === undefined) {
    throw new Error('Cannot load graph without links and nodes');
  }

  for (i = 0; i < stored.nodes.length; ++i) {
    var parsedNode = nodeTransform(stored.nodes[i]);
    if (!parsedNode.hasOwnProperty('id')) {
      throw new Error('Graph node format is invalid: Node id is missing');
    }

    graph.addNode(parsedNode.id, parsedNode.data);
  }

  for (i = 0; i < stored.links.length; ++i) {
    var link = linkTransform(stored.links[i]);
    if (!link.hasOwnProperty('fromId') || !link.hasOwnProperty('toId')) {
      throw new Error('Graph link format is invalid. Both fromId and toId are required');
    }

    graph.addLink(link.fromId, link.toId, link.data);
  }

  return graph;
}

function id(x) { return x; }

},{"ngraph.graph":23}],23:[function(_dereq_,module,exports){
/**
 * @fileOverview Contains definition of the core graph object.
 */

/**
 * @example
 *  var graph = require('ngraph.graph')();
 *  graph.addNode(1);     // graph has one node.
 *  graph.addLink(2, 3);  // now graph contains three nodes and one link.
 *
 */
module.exports = createGraph;

var eventify = _dereq_('ngraph.events');

/**
 * Creates a new graph
 */
function createGraph(options) {
  // Graph structure is maintained as dictionary of nodes
  // and array of links. Each node has 'links' property which
  // hold all links related to that node. And general links
  // array is used to speed up all links enumeration. This is inefficient
  // in terms of memory, but simplifies coding.
  options = options || {};
  if (options.uniqueLinkId === undefined) {
    // Request each link id to be unique between same nodes. This negatively
    // impacts `addLink()` performance (O(n), where n - number of edges of each
    // vertex), but makes operations with multigraphs more accessible.
    options.uniqueLinkId = true;
  }

  var nodes = typeof Object.create === 'function' ? Object.create(null) : {},
    links = [],
    // Hash of multi-edges. Used to track ids of edges between same nodes
    multiEdges = {},
    nodesCount = 0,
    suspendEvents = 0,

    forEachNode = createNodeIterator(),
    createLink = options.uniqueLinkId ? createUniqueLink : createSingleLink,

    // Our graph API provides means to listen to graph changes. Users can subscribe
    // to be notified about changes in the graph by using `on` method. However
    // in some cases they don't use it. To avoid unnecessary memory consumption
    // we will not record graph changes until we have at least one subscriber.
    // Code below supports this optimization.
    //
    // Accumulates all changes made during graph updates.
    // Each change element contains:
    //  changeType - one of the strings: 'add', 'remove' or 'update';
    //  node - if change is related to node this property is set to changed graph's node;
    //  link - if change is related to link this property is set to changed graph's link;
    changes = [],
    recordLinkChange = noop,
    recordNodeChange = noop,
    enterModification = noop,
    exitModification = noop;

  // this is our public API:
  var graphPart = {
    /**
     * Adds node to the graph. If node with given id already exists in the graph
     * its data is extended with whatever comes in 'data' argument.
     *
     * @param nodeId the node's identifier. A string or number is preferred.
     * @param [data] additional data for the node being added. If node already
     *   exists its data object is augmented with the new one.
     *
     * @return {node} The newly added node or node with given id if it already exists.
     */
    addNode: addNode,

    /**
     * Adds a link to the graph. The function always create a new
     * link between two nodes. If one of the nodes does not exists
     * a new node is created.
     *
     * @param fromId link start node id;
     * @param toId link end node id;
     * @param [data] additional data to be set on the new link;
     *
     * @return {link} The newly created link
     */
    addLink: addLink,

    /**
     * Removes link from the graph. If link does not exist does nothing.
     *
     * @param link - object returned by addLink() or getLinks() methods.
     *
     * @returns true if link was removed; false otherwise.
     */
    removeLink: removeLink,

    /**
     * Removes node with given id from the graph. If node does not exist in the graph
     * does nothing.
     *
     * @param nodeId node's identifier passed to addNode() function.
     *
     * @returns true if node was removed; false otherwise.
     */
    removeNode: removeNode,

    /**
     * Gets node with given identifier. If node does not exist undefined value is returned.
     *
     * @param nodeId requested node identifier;
     *
     * @return {node} in with requested identifier or undefined if no such node exists.
     */
    getNode: getNode,

    /**
     * Gets number of nodes in this graph.
     *
     * @return number of nodes in the graph.
     */
    getNodesCount: function() {
      return nodesCount;
    },

    /**
     * Gets total number of links in the graph.
     */
    getLinksCount: function() {
      return links.length;
    },

    /**
     * Gets all links (inbound and outbound) from the node with given id.
     * If node with given id is not found null is returned.
     *
     * @param nodeId requested node identifier.
     *
     * @return Array of links from and to requested node if such node exists;
     *   otherwise null is returned.
     */
    getLinks: getLinks,

    /**
     * Invokes callback on each node of the graph.
     *
     * @param {Function(node)} callback Function to be invoked. The function
     *   is passed one argument: visited node.
     */
    forEachNode: forEachNode,

    /**
     * Invokes callback on every linked (adjacent) node to the given one.
     *
     * @param nodeId Identifier of the requested node.
     * @param {Function(node, link)} callback Function to be called on all linked nodes.
     *   The function is passed two parameters: adjacent node and link object itself.
     * @param oriented if true graph treated as oriented.
     */
    forEachLinkedNode: forEachLinkedNode,

    /**
     * Enumerates all links in the graph
     *
     * @param {Function(link)} callback Function to be called on all links in the graph.
     *   The function is passed one parameter: graph's link object.
     *
     * Link object contains at least the following fields:
     *  fromId - node id where link starts;
     *  toId - node id where link ends,
     *  data - additional data passed to graph.addLink() method.
     */
    forEachLink: forEachLink,

    /**
     * Suspend all notifications about graph changes until
     * endUpdate is called.
     */
    beginUpdate: enterModification,

    /**
     * Resumes all notifications about graph changes and fires
     * graph 'changed' event in case there are any pending changes.
     */
    endUpdate: exitModification,

    /**
     * Removes all nodes and links from the graph.
     */
    clear: clear,

    /**
     * Detects whether there is a link between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     * NOTE: this function is synonim for getLink()
     *
     * @returns link if there is one. null otherwise.
     */
    hasLink: getLink,

    /**
     * Gets an edge between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     *
     * @param {string} fromId link start identifier
     * @param {string} toId link end identifier
     *
     * @returns link if there is one. null otherwise.
     */
    getLink: getLink
  };

  // this will add `on()` and `fire()` methods.
  eventify(graphPart);

  monitorSubscribers();

  return graphPart;

  function monitorSubscribers() {
    var realOn = graphPart.on;

    // replace real `on` with our temporary on, which will trigger change
    // modification monitoring:
    graphPart.on = on;

    function on() {
      // now it's time to start tracking stuff:
      graphPart.beginUpdate = enterModification = enterModificationReal;
      graphPart.endUpdate = exitModification = exitModificationReal;
      recordLinkChange = recordLinkChangeReal;
      recordNodeChange = recordNodeChangeReal;

      // this will replace current `on` method with real pub/sub from `eventify`.
      graphPart.on = realOn;
      // delegate to real `on` handler:
      return realOn.apply(graphPart, arguments);
    }
  }

  function recordLinkChangeReal(link, changeType) {
    changes.push({
      link: link,
      changeType: changeType
    });
  }

  function recordNodeChangeReal(node, changeType) {
    changes.push({
      node: node,
      changeType: changeType
    });
  }

  function addNode(nodeId, data) {
    if (nodeId === undefined) {
      throw new Error('Invalid node identifier');
    }

    enterModification();

    var node = getNode(nodeId);
    if (!node) {
      node = new Node(nodeId);
      nodesCount++;
      recordNodeChange(node, 'add');
    } else {
      recordNodeChange(node, 'update');
    }

    node.data = data;

    nodes[nodeId] = node;

    exitModification();
    return node;
  }

  function getNode(nodeId) {
    return nodes[nodeId];
  }

  function removeNode(nodeId) {
    var node = getNode(nodeId);
    if (!node) {
      return false;
    }

    enterModification();

    if (node.links) {
      while (node.links.length) {
        var link = node.links[0];
        removeLink(link);
      }
    }

    delete nodes[nodeId];
    nodesCount--;

    recordNodeChange(node, 'remove');

    exitModification();

    return true;
  }


  function addLink(fromId, toId, data) {
    enterModification();

    var fromNode = getNode(fromId) || addNode(fromId);
    var toNode = getNode(toId) || addNode(toId);

    var link = createLink(fromId, toId, data);

    links.push(link);

    // TODO: this is not cool. On large graphs potentially would consume more memory.
    addLinkToNode(fromNode, link);
    if (fromId !== toId) {
      // make sure we are not duplicating links for self-loops
      addLinkToNode(toNode, link);
    }

    recordLinkChange(link, 'add');

    exitModification();

    return link;
  }

  function createSingleLink(fromId, toId, data) {
    var linkId = makeLinkId(fromId, toId);
    return new Link(fromId, toId, data, linkId);
  }

  function createUniqueLink(fromId, toId, data) {
    // TODO: Get rid of this method.
    var linkId = makeLinkId(fromId, toId);
    var isMultiEdge = multiEdges.hasOwnProperty(linkId);
    if (isMultiEdge || getLink(fromId, toId)) {
      if (!isMultiEdge) {
        multiEdges[linkId] = 0;
      }
      var suffix = '@' + (++multiEdges[linkId]);
      linkId = makeLinkId(fromId + suffix, toId + suffix);
    }

    return new Link(fromId, toId, data, linkId);
  }

  function getLinks(nodeId) {
    var node = getNode(nodeId);
    return node ? node.links : null;
  }

  function removeLink(link) {
    if (!link) {
      return false;
    }
    var idx = indexOfElementInArray(link, links);
    if (idx < 0) {
      return false;
    }

    enterModification();

    links.splice(idx, 1);

    var fromNode = getNode(link.fromId);
    var toNode = getNode(link.toId);

    if (fromNode) {
      idx = indexOfElementInArray(link, fromNode.links);
      if (idx >= 0) {
        fromNode.links.splice(idx, 1);
      }
    }

    if (toNode) {
      idx = indexOfElementInArray(link, toNode.links);
      if (idx >= 0) {
        toNode.links.splice(idx, 1);
      }
    }

    recordLinkChange(link, 'remove');

    exitModification();

    return true;
  }

  function getLink(fromNodeId, toNodeId) {
    // TODO: Use sorted links to speed this up
    var node = getNode(fromNodeId),
      i;
    if (!node || !node.links) {
      return null;
    }

    for (i = 0; i < node.links.length; ++i) {
      var link = node.links[i];
      if (link.fromId === fromNodeId && link.toId === toNodeId) {
        return link;
      }
    }

    return null; // no link.
  }

  function clear() {
    enterModification();
    forEachNode(function(node) {
      removeNode(node.id);
    });
    exitModification();
  }

  function forEachLink(callback) {
    var i, length;
    if (typeof callback === 'function') {
      for (i = 0, length = links.length; i < length; ++i) {
        callback(links[i]);
      }
    }
  }

  function forEachLinkedNode(nodeId, callback, oriented) {
    var node = getNode(nodeId);

    if (node && node.links && typeof callback === 'function') {
      if (oriented) {
        return forEachOrientedLink(node.links, nodeId, callback);
      } else {
        return forEachNonOrientedLink(node.links, nodeId, callback);
      }
    }
  }

  function forEachNonOrientedLink(links, nodeId, callback) {
    var quitFast;
    for (var i = 0; i < links.length; ++i) {
      var link = links[i];
      var linkedNodeId = link.fromId === nodeId ? link.toId : link.fromId;

      quitFast = callback(nodes[linkedNodeId], link);
      if (quitFast) {
        return true; // Client does not need more iterations. Break now.
      }
    }
  }

  function forEachOrientedLink(links, nodeId, callback) {
    var quitFast;
    for (var i = 0; i < links.length; ++i) {
      var link = links[i];
      if (link.fromId === nodeId) {
        quitFast = callback(nodes[link.toId], link);
        if (quitFast) {
          return true; // Client does not need more iterations. Break now.
        }
      }
    }
  }

  // we will not fire anything until users of this library explicitly call `on()`
  // method.
  function noop() {}

  // Enter, Exit modification allows bulk graph updates without firing events.
  function enterModificationReal() {
    suspendEvents += 1;
  }

  function exitModificationReal() {
    suspendEvents -= 1;
    if (suspendEvents === 0 && changes.length > 0) {
      graphPart.fire('changed', changes);
      changes.length = 0;
    }
  }

  function createNodeIterator() {
    // Object.keys iterator is 1.3x faster than `for in` loop.
    // See `https://github.com/anvaka/ngraph.graph/tree/bench-for-in-vs-obj-keys`
    // branch for perf test
    return Object.keys ? objectKeysIterator : forInIterator;
  }

  function objectKeysIterator(callback) {
    if (typeof callback !== 'function') {
      return;
    }

    var keys = Object.keys(nodes);
    for (var i = 0; i < keys.length; ++i) {
      if (callback(nodes[keys[i]])) {
        return true; // client doesn't want to proceed. Return.
      }
    }
  }

  function forInIterator(callback) {
    if (typeof callback !== 'function') {
      return;
    }
    var node;

    for (node in nodes) {
      if (callback(nodes[node])) {
        return true; // client doesn't want to proceed. Return.
      }
    }
  }
}

// need this for old browsers. Should this be a separate module?
function indexOfElementInArray(element, array) {
  if (!array) return -1;

  if (array.indexOf) {
    return array.indexOf(element);
  }

  var len = array.length,
    i;

  for (i = 0; i < len; i += 1) {
    if (array[i] === element) {
      return i;
    }
  }

  return -1;
}

/**
 * Internal structure to represent node;
 */
function Node(id) {
  this.id = id;
  this.links = null;
  this.data = null;
}

function addLinkToNode(node, link) {
  if (node.links) {
    node.links.push(link);
  } else {
    node.links = [link];
  }
}

/**
 * Internal structure to represent links;
 */
function Link(fromId, toId, data, id) {
  this.fromId = fromId;
  this.toId = toId;
  this.data = data;
  this.id = id;
}

function hashCode(str) {
  var hash = 0, i, chr, len;
  if (str.length == 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function makeLinkId(fromId, toId) {
  return hashCode(fromId.toString() + '?? ' + toId.toString());
}

},{"ngraph.events":6}],24:[function(_dereq_,module,exports){
module.exports = merge;

/**
 * Augments `target` with properties in `options`. Does not override
 * target's properties if they are defined and matches expected type in 
 * options
 *
 * @returns {Object} merged object
 */
function merge(target, options) {
  var key;
  if (!target) { target = {}; }
  if (options) {
    for (key in options) {
      if (options.hasOwnProperty(key)) {
        var targetHasIt = target.hasOwnProperty(key),
            optionsValueType = typeof options[key],
            shouldReplace = !targetHasIt || (typeof target[key] !== optionsValueType);

        if (shouldReplace) {
          target[key] = options[key];
        } else if (optionsValueType === 'object') {
          // go deep, don't care about loops here, we are simple API!:
          target[key] = merge(target[key], options[key]);
        }
      }
    }
  }

  return target;
}

},{}],25:[function(_dereq_,module,exports){
module.exports = {
  Body: Body,
  Vector2d: Vector2d,
  Body3d: Body3d,
  Vector3d: Vector3d
};

function Body(x, y) {
  this.pos = new Vector2d(x, y);
  this.prevPos = new Vector2d(x, y);
  this.force = new Vector2d();
  this.velocity = new Vector2d();
  this.mass = 1;
}

Body.prototype.setPosition = function (x, y) {
  this.prevPos.x = this.pos.x = x;
  this.prevPos.y = this.pos.y = y;
};

function Vector2d(x, y) {
  if (x && typeof x !== 'number') {
    // could be another vector
    this.x = typeof x.x === 'number' ? x.x : 0;
    this.y = typeof x.y === 'number' ? x.y : 0;
  } else {
    this.x = typeof x === 'number' ? x : 0;
    this.y = typeof y === 'number' ? y : 0;
  }
}

Vector2d.prototype.reset = function () {
  this.x = this.y = 0;
};

function Body3d(x, y, z) {
  this.pos = new Vector3d(x, y, z);
  this.prevPos = new Vector3d(x, y, z);
  this.force = new Vector3d();
  this.velocity = new Vector3d();
  this.mass = 1;
}

Body3d.prototype.setPosition = function (x, y, z) {
  this.prevPos.x = this.pos.x = x;
  this.prevPos.y = this.pos.y = y;
  this.prevPos.z = this.pos.z = z;
};

function Vector3d(x, y, z) {
  if (x && typeof x !== 'number') {
    // could be another vector
    this.x = typeof x.x === 'number' ? x.x : 0;
    this.y = typeof x.y === 'number' ? x.y : 0;
    this.z = typeof x.z === 'number' ? x.z : 0;
  } else {
    this.x = typeof x === 'number' ? x : 0;
    this.y = typeof y === 'number' ? y : 0;
    this.z = typeof z === 'number' ? z : 0;
  }
};

Vector3d.prototype.reset = function () {
  this.x = this.y = this.z = 0;
};

},{}],26:[function(_dereq_,module,exports){
/**
 * This is Barnes Hut simulation algorithm for 2d case. Implementation
 * is highly optimized (avoids recusion and gc pressure)
 *
 * http://www.cs.princeton.edu/courses/archive/fall03/cs126/assignments/barnes-hut.html
 */

module.exports = function(options) {
  options = options || {};
  options.gravity = typeof options.gravity === 'number' ? options.gravity : -1;
  options.theta = typeof options.theta === 'number' ? options.theta : 0.8;

  // we require deterministic randomness here
  var random = _dereq_('ngraph.random').random(1984),
    Node = _dereq_('./node'),
    InsertStack = _dereq_('./insertStack'),
    isSamePosition = _dereq_('./isSamePosition');

  var gravity = options.gravity,
    updateQueue = [],
    insertStack = new InsertStack(),
    theta = options.theta,

    nodesCache = [],
    currentInCache = 0,
    newNode = function() {
      // To avoid pressure on GC we reuse nodes.
      var node = nodesCache[currentInCache];
      if (node) {
        node.quad0 = null;
        node.quad1 = null;
        node.quad2 = null;
        node.quad3 = null;
        node.body = null;
        node.mass = node.massX = node.massY = 0;
        node.left = node.right = node.top = node.bottom = 0;
      } else {
        node = new Node();
        nodesCache[currentInCache] = node;
      }

      ++currentInCache;
      return node;
    },

    root = newNode(),

    // Inserts body to the tree
    insert = function(newBody) {
      insertStack.reset();
      insertStack.push(root, newBody);

      while (!insertStack.isEmpty()) {
        var stackItem = insertStack.pop(),
          node = stackItem.node,
          body = stackItem.body;

        if (!node.body) {
          // This is internal node. Update the total mass of the node and center-of-mass.
          var x = body.pos.x;
          var y = body.pos.y;
          node.mass = node.mass + body.mass;
          node.massX = node.massX + body.mass * x;
          node.massY = node.massY + body.mass * y;

          // Recursively insert the body in the appropriate quadrant.
          // But first find the appropriate quadrant.
          var quadIdx = 0, // Assume we are in the 0's quad.
            left = node.left,
            right = (node.right + left) / 2,
            top = node.top,
            bottom = (node.bottom + top) / 2;

          if (x > right) { // somewhere in the eastern part.
            quadIdx = quadIdx + 1;
            var oldLeft = left;
            left = right;
            right = right + (right - oldLeft);
          }
          if (y > bottom) { // and in south.
            quadIdx = quadIdx + 2;
            var oldTop = top;
            top = bottom;
            bottom = bottom + (bottom - oldTop);
          }

          var child = getChild(node, quadIdx);
          if (!child) {
            // The node is internal but this quadrant is not taken. Add
            // subnode to it.
            child = newNode();
            child.left = left;
            child.top = top;
            child.right = right;
            child.bottom = bottom;
            child.body = body;

            setChild(node, quadIdx, child);
          } else {
            // continue searching in this quadrant.
            insertStack.push(child, body);
          }
        } else {
          // We are trying to add to the leaf node.
          // We have to convert current leaf into internal node
          // and continue adding two nodes.
          var oldBody = node.body;
          node.body = null; // internal nodes do not cary bodies

          if (isSamePosition(oldBody.pos, body.pos)) {
            // Prevent infinite subdivision by bumping one node
            // anywhere in this quadrant
            var retriesCount = 3;
            do {
              var offset = random.nextDouble();
              var dx = (node.right - node.left) * offset;
              var dy = (node.bottom - node.top) * offset;

              oldBody.pos.x = node.left + dx;
              oldBody.pos.y = node.top + dy;
              retriesCount -= 1;
              // Make sure we don't bump it out of the box. If we do, next iteration should fix it
            } while (retriesCount > 0 && isSamePosition(oldBody.pos, body.pos));

            if (retriesCount === 0 && isSamePosition(oldBody.pos, body.pos)) {
              // This is very bad, we ran out of precision.
              // if we do not return from the method we'll get into
              // infinite loop here. So we sacrifice correctness of layout, and keep the app running
              // Next layout iteration should get larger bounding box in the first step and fix this
              return;
            }
          }
          // Next iteration should subdivide node further.
          insertStack.push(node, oldBody);
          insertStack.push(node, body);
        }
      }
    },

    update = function(sourceBody) {
      var queue = updateQueue,
        v,
        dx,
        dy,
        r, fx = 0,
        fy = 0,
        queueLength = 1,
        shiftIdx = 0,
        pushIdx = 1;

      queue[0] = root;

      while (queueLength) {
        var node = queue[shiftIdx],
          body = node.body;

        queueLength -= 1;
        shiftIdx += 1;
        var differentBody = (body !== sourceBody);
        if (body && differentBody) {
          // If the current node is a leaf node (and it is not source body),
          // calculate the force exerted by the current node on body, and add this
          // amount to body's net force.
          dx = body.pos.x - sourceBody.pos.x;
          dy = body.pos.y - sourceBody.pos.y;
          r = Math.sqrt(dx * dx + dy * dy);

          if (r === 0) {
            // Poor man's protection against zero distance.
            dx = (random.nextDouble() - 0.5) / 50;
            dy = (random.nextDouble() - 0.5) / 50;
            r = Math.sqrt(dx * dx + dy * dy);
          }

          // This is standard gravition force calculation but we divide
          // by r^3 to save two operations when normalizing force vector.
          v = gravity * body.mass * sourceBody.mass / (r * r * r);
          fx += v * dx;
          fy += v * dy;
        } else if (differentBody) {
          // Otherwise, calculate the ratio s / r,  where s is the width of the region
          // represented by the internal node, and r is the distance between the body
          // and the node's center-of-mass
          dx = node.massX / node.mass - sourceBody.pos.x;
          dy = node.massY / node.mass - sourceBody.pos.y;
          r = Math.sqrt(dx * dx + dy * dy);

          if (r === 0) {
            // Sorry about code duplucation. I don't want to create many functions
            // right away. Just want to see performance first.
            dx = (random.nextDouble() - 0.5) / 50;
            dy = (random.nextDouble() - 0.5) / 50;
            r = Math.sqrt(dx * dx + dy * dy);
          }
          // If s / r < ?, treat this internal node as a single body, and calculate the
          // force it exerts on sourceBody, and add this amount to sourceBody's net force.
          if ((node.right - node.left) / r < theta) {
            // in the if statement above we consider node's width only
            // because the region was squarified during tree creation.
            // Thus there is no difference between using width or height.
            v = gravity * node.mass * sourceBody.mass / (r * r * r);
            fx += v * dx;
            fy += v * dy;
          } else {
            // Otherwise, run the procedure recursively on each of the current node's children.

            // I intentionally unfolded this loop, to save several CPU cycles.
            if (node.quad0) {
              queue[pushIdx] = node.quad0;
              queueLength += 1;
              pushIdx += 1;
            }
            if (node.quad1) {
              queue[pushIdx] = node.quad1;
              queueLength += 1;
              pushIdx += 1;
            }
            if (node.quad2) {
              queue[pushIdx] = node.quad2;
              queueLength += 1;
              pushIdx += 1;
            }
            if (node.quad3) {
              queue[pushIdx] = node.quad3;
              queueLength += 1;
              pushIdx += 1;
            }
          }
        }
      }

      sourceBody.force.x += fx;
      sourceBody.force.y += fy;
    },

    insertBodies = function(bodies) {
      var x1 = Number.MAX_VALUE,
        y1 = Number.MAX_VALUE,
        x2 = Number.MIN_VALUE,
        y2 = Number.MIN_VALUE,
        i,
        max = bodies.length;

      // To reduce quad tree depth we are looking for exact bounding box of all particles.
      i = max;
      while (i--) {
        var x = bodies[i].pos.x;
        var y = bodies[i].pos.y;
        if (x < x1) {
          x1 = x;
        }
        if (x > x2) {
          x2 = x;
        }
        if (y < y1) {
          y1 = y;
        }
        if (y > y2) {
          y2 = y;
        }
      }

      // Squarify the bounds.
      var dx = x2 - x1,
        dy = y2 - y1;
      if (dx > dy) {
        y2 = y1 + dx;
      } else {
        x2 = x1 + dy;
      }

      currentInCache = 0;
      root = newNode();
      root.left = x1;
      root.right = x2;
      root.top = y1;
      root.bottom = y2;

      i = max - 1;
      if (i > 0) {
        root.body = bodies[i];
      }
      while (i--) {
        insert(bodies[i], root);
      }
    };

  return {
    insertBodies: insertBodies,
    updateBodyForce: update,
    options: function(newOptions) {
      if (newOptions) {
        if (typeof newOptions.gravity === 'number') {
          gravity = newOptions.gravity;
        }
        if (typeof newOptions.theta === 'number') {
          theta = newOptions.theta;
        }

        return this;
      }

      return {
        gravity: gravity,
        theta: theta
      };
    }
  };
};

function getChild(node, idx) {
  if (idx === 0) return node.quad0;
  if (idx === 1) return node.quad1;
  if (idx === 2) return node.quad2;
  if (idx === 3) return node.quad3;
  return null;
}

function setChild(node, idx, child) {
  if (idx === 0) node.quad0 = child;
  else if (idx === 1) node.quad1 = child;
  else if (idx === 2) node.quad2 = child;
  else if (idx === 3) node.quad3 = child;
}

},{"./insertStack":27,"./isSamePosition":28,"./node":29,"ngraph.random":34}],27:[function(_dereq_,module,exports){
module.exports = InsertStack;

/**
 * Our implmentation of QuadTree is non-recursive to avoid GC hit
 * This data structure represent stack of elements
 * which we are trying to insert into quad tree.
 */
function InsertStack () {
    this.stack = [];
    this.popIdx = 0;
}

InsertStack.prototype = {
    isEmpty: function() {
        return this.popIdx === 0;
    },
    push: function (node, body) {
        var item = this.stack[this.popIdx];
        if (!item) {
            // we are trying to avoid memory pressue: create new element
            // only when absolutely necessary
            this.stack[this.popIdx] = new InsertStackElement(node, body);
        } else {
            item.node = node;
            item.body = body;
        }
        ++this.popIdx;
    },
    pop: function () {
        if (this.popIdx > 0) {
            return this.stack[--this.popIdx];
        }
    },
    reset: function () {
        this.popIdx = 0;
    }
};

function InsertStackElement(node, body) {
    this.node = node; // QuadTree node
    this.body = body; // physical body which needs to be inserted to node
}

},{}],28:[function(_dereq_,module,exports){
module.exports = function isSamePosition(point1, point2) {
    var dx = Math.abs(point1.x - point2.x);
    var dy = Math.abs(point1.y - point2.y);

    return (dx < 1e-8 && dy < 1e-8);
};

},{}],29:[function(_dereq_,module,exports){
/**
 * Internal data structure to represent 2D QuadTree node
 */
module.exports = function Node() {
  // body stored inside this node. In quad tree only leaf nodes (by construction)
  // contain boides:
  this.body = null;

  // Child nodes are stored in quads. Each quad is presented by number:
  // 0 | 1
  // -----
  // 2 | 3
  this.quad0 = null;
  this.quad1 = null;
  this.quad2 = null;
  this.quad3 = null;

  // Total mass of current node
  this.mass = 0;

  // Center of mass coordinates
  this.massX = 0;
  this.massY = 0;

  // bounding box coordinates
  this.left = 0;
  this.top = 0;
  this.bottom = 0;
  this.right = 0;
};

},{}],30:[function(_dereq_,module,exports){
/**
 * This is Barnes Hut simulation algorithm for 3d case. Implementation
 * is highly optimized (avoids recusion and gc pressure)
 *
 * http://www.cs.princeton.edu/courses/archive/fall03/cs126/assignments/barnes-hut.html
 *
 * NOTE: This module duplicates a lot of code from 2d case. Primary reason for
 * this is performance. Every time I tried to abstract away vector operations
 * I had negative impact on performance. So in this case I'm scarifying code
 * reuse in favor of speed
 */

module.exports = function(options) {
  options = options || {};
  options.gravity = typeof options.gravity === 'number' ? options.gravity : -1;
  options.theta = typeof options.theta === 'number' ? options.theta : 0.8;

  // we require deterministic randomness here
  var random = _dereq_('ngraph.random').random(1984),
    Node = _dereq_('./node'),
    InsertStack = _dereq_('./insertStack'),
    isSamePosition = _dereq_('./isSamePosition');

  var gravity = options.gravity,
    updateQueue = [],
    insertStack = new InsertStack(),
    theta = options.theta,

    nodesCache = [],
    currentInCache = 0,
    newNode = function() {
      // To avoid pressure on GC we reuse nodes.
      var node = nodesCache[currentInCache];
      if (node) {
        node.quad0 = null;
        node.quad4 = null;
        node.quad1 = null;
        node.quad5 = null;
        node.quad2 = null;
        node.quad6 = null;
        node.quad3 = null;
        node.quad7 = null;
        node.body = null;
        node.mass = node.massX = node.massY = node.massZ = 0;
        node.left = node.right = node.top = node.bottom = node.front = node.back = 0;
      } else {
        node = new Node();
        nodesCache[currentInCache] = node;
      }

      ++currentInCache;
      return node;
    },

    root = newNode(),

    // Inserts body to the tree
    insert = function(newBody) {
      insertStack.reset();
      insertStack.push(root, newBody);

      while (!insertStack.isEmpty()) {
        var stackItem = insertStack.pop(),
          node = stackItem.node,
          body = stackItem.body;

        if (!node.body) {
          // This is internal node. Update the total mass of the node and center-of-mass.
          var x = body.pos.x;
          var y = body.pos.y;
          var z = body.pos.z;
          node.mass += body.mass;
          node.massX += body.mass * x;
          node.massY += body.mass * y;
          node.massZ += body.mass * z;

          // Recursively insert the body in the appropriate quadrant.
          // But first find the appropriate quadrant.
          var quadIdx = 0, // Assume we are in the 0's quad.
            left = node.left,
            right = (node.right + left) / 2,
            top = node.top,
            bottom = (node.bottom + top) / 2,
            back = node.back,
            front = (node.front + back) / 2;

          if (x > right) { // somewhere in the eastern part.
            quadIdx += 1;
            var oldLeft = left;
            left = right;
            right = right + (right - oldLeft);
          }
          if (y > bottom) { // and in south.
            quadIdx += 2;
            var oldTop = top;
            top = bottom;
            bottom = bottom + (bottom - oldTop);
          }
          if (z > front) { // and in frontal part
            quadIdx += 4;
            var oldBack = back;
            back = front;
            front = back + (back - oldBack);
          }

          var child = getChild(node, quadIdx);
          if (!child) {
            // The node is internal but this quadrant is not taken. Add subnode to it.
            child = newNode();
            child.left = left;
            child.top = top;
            child.right = right;
            child.bottom = bottom;
            child.back = back;
            child.front = front;
            child.body = body;

            setChild(node, quadIdx, child);
          } else {
            // continue searching in this quadrant.
            insertStack.push(child, body);
          }
        } else {
          // We are trying to add to the leaf node.
          // We have to convert current leaf into internal node
          // and continue adding two nodes.
          var oldBody = node.body;
          node.body = null; // internal nodes do not carry bodies

          if (isSamePosition(oldBody.pos, body.pos)) {
            // Prevent infinite subdivision by bumping one node
            // anywhere in this quadrant
            var retriesCount = 3;
            do {
              var offset = random.nextDouble();
              var dx = (node.right - node.left) * offset;
              var dy = (node.bottom - node.top) * offset;
              var dz = (node.front - node.back) * offset;

              oldBody.pos.x = node.left + dx;
              oldBody.pos.y = node.top + dy;
              oldBody.pos.z = node.back + dz;
              retriesCount -= 1;
              // Make sure we don't bump it out of the box. If we do, next iteration should fix it
            } while (retriesCount > 0 && isSamePosition(oldBody.pos, body.pos));

            if (retriesCount === 0 && isSamePosition(oldBody.pos, body.pos)) {
              // This is very bad, we ran out of precision.
              // if we do not return from the method we'll get into
              // infinite loop here. So we sacrifice correctness of layout, and keep the app running
              // Next layout iteration should get larger bounding box in the first step and fix this
              return;
            }
          }
          // Next iteration should subdivide node further.
          insertStack.push(node, oldBody);
          insertStack.push(node, body);
        }
      }
    },

    update = function(sourceBody) {
      var queue = updateQueue,
        v,
        dx, dy, dz,
        r, fx = 0,
        fy = 0,
        fz = 0,
        queueLength = 1,
        shiftIdx = 0,
        pushIdx = 1;

      queue[0] = root;

      while (queueLength) {
        var node = queue[shiftIdx],
          body = node.body;

        queueLength -= 1;
        shiftIdx += 1;
        var differentBody = (body !== sourceBody);
        if (body && differentBody) {
          // If the current node is a leaf node (and it is not source body),
          // calculate the force exerted by the current node on body, and add this
          // amount to body's net force.
          dx = body.pos.x - sourceBody.pos.x;
          dy = body.pos.y - sourceBody.pos.y;
          dz = body.pos.z - sourceBody.pos.z;
          r = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (r === 0) {
            // Poor man's protection against zero distance.
            dx = (random.nextDouble() - 0.5) / 50;
            dy = (random.nextDouble() - 0.5) / 50;
            dz = (random.nextDouble() - 0.5) / 50;
            r = Math.sqrt(dx * dx + dy * dy + dz * dz);
          }

          // This is standard gravitation force calculation but we divide
          // by r^3 to save two operations when normalizing force vector.
          v = gravity * body.mass * sourceBody.mass / (r * r * r);
          fx += v * dx;
          fy += v * dy;
          fz += v * dz;
        } else if (differentBody) {
          // Otherwise, calculate the ratio s / r,  where s is the width of the region
          // represented by the internal node, and r is the distance between the body
          // and the node's center-of-mass
          dx = node.massX / node.mass - sourceBody.pos.x;
          dy = node.massY / node.mass - sourceBody.pos.y;
          dz = node.massZ / node.mass - sourceBody.pos.z;

          r = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (r === 0) {
            // Sorry about code duplication. I don't want to create many functions
            // right away. Just want to see performance first.
            dx = (random.nextDouble() - 0.5) / 50;
            dy = (random.nextDouble() - 0.5) / 50;
            dz = (random.nextDouble() - 0.5) / 50;
            r = Math.sqrt(dx * dx + dy * dy + dz * dz);
          }

          // If s / r < ?, treat this internal node as a single body, and calculate the
          // force it exerts on sourceBody, and add this amount to sourceBody's net force.
          if ((node.right - node.left) / r < theta) {
            // in the if statement above we consider node's width only
            // because the region was squarified during tree creation.
            // Thus there is no difference between using width or height.
            v = gravity * node.mass * sourceBody.mass / (r * r * r);
            fx += v * dx;
            fy += v * dy;
            fz += v * dz;
          } else {
            // Otherwise, run the procedure recursively on each of the current node's children.

            // I intentionally unfolded this loop, to save several CPU cycles.
            if (node.quad0) {
              queue[pushIdx] = node.quad0;
              queueLength += 1;
              pushIdx += 1;
            }
            if (node.quad1) {
              queue[pushIdx] = node.quad1;
              queueLength += 1;
              pushIdx += 1;
            }
            if (node.quad2) {
              queue[pushIdx] = node.quad2;
              queueLength += 1;
              pushIdx += 1;
            }
            if (node.quad3) {
              queue[pushIdx] = node.quad3;
              queueLength += 1;
              pushIdx += 1;
            }
            if (node.quad4) {
              queue[pushIdx] = node.quad4;
              queueLength += 1;
              pushIdx += 1;
            }
            if (node.quad5) {
              queue[pushIdx] = node.quad5;
              queueLength += 1;
              pushIdx += 1;
            }
            if (node.quad6) {
              queue[pushIdx] = node.quad6;
              queueLength += 1;
              pushIdx += 1;
            }
            if (node.quad7) {
              queue[pushIdx] = node.quad7;
              queueLength += 1;
              pushIdx += 1;
            }
          }
        }
      }

      sourceBody.force.x += fx;
      sourceBody.force.y += fy;
      sourceBody.force.z += fz;
    },

    insertBodies = function(bodies) {
      var x1 = Number.MAX_VALUE,
        y1 = Number.MAX_VALUE,
        z1 = Number.MAX_VALUE,
        x2 = Number.MIN_VALUE,
        y2 = Number.MIN_VALUE,
        z2 = Number.MIN_VALUE,
        i,
        max = bodies.length;

      // To reduce quad tree depth we are looking for exact bounding box of all particles.
      i = max;
      while (i--) {
        var pos = bodies[i].pos;
        var x = pos.x;
        var y = pos.y;
        var z = pos.z;
        if (x < x1) {
          x1 = x;
        }
        if (x > x2) {
          x2 = x;
        }
        if (y < y1) {
          y1 = y;
        }
        if (y > y2) {
          y2 = y;
        }
        if (z < z1) {
          z1 = z;
        }
        if (z > z2) {
          z2 = z;
        }
      }

      // Squarify the bounds.
      var maxSide = Math.max(x2 - x1, Math.max(y2 - y1, z2 - z1));

      x2 = x1 + maxSide;
      y2 = y1 + maxSide;
      z2 = z1 + maxSide;

      currentInCache = 0;
      root = newNode();
      root.left = x1;
      root.right = x2;
      root.top = y1;
      root.bottom = y2;
      root.back = z1;
      root.front = z2;

      i = max - 1;
      if (i > 0) {
        root.body = bodies[i];
      }
      while (i--) {
        insert(bodies[i], root);
      }
    };

  return {
    insertBodies: insertBodies,
    updateBodyForce: update,
    options: function(newOptions) {
      if (newOptions) {
        if (typeof newOptions.gravity === 'number') {
          gravity = newOptions.gravity;
        }
        if (typeof newOptions.theta === 'number') {
          theta = newOptions.theta;
        }

        return this;
      }

      return {
        gravity: gravity,
        theta: theta
      };
    }
  };
};

function getChild(node, idx) {
  if (idx === 0) return node.quad0;
  if (idx === 1) return node.quad1;
  if (idx === 2) return node.quad2;
  if (idx === 3) return node.quad3;
  if (idx === 4) return node.quad4;
  if (idx === 5) return node.quad5;
  if (idx === 6) return node.quad6;
  if (idx === 7) return node.quad7;
  return null;
}

function setChild(node, idx, child) {
  if (idx === 0) node.quad0 = child;
  else if (idx === 1) node.quad1 = child;
  else if (idx === 2) node.quad2 = child;
  else if (idx === 3) node.quad3 = child;
  else if (idx === 4) node.quad4 = child;
  else if (idx === 5) node.quad5 = child;
  else if (idx === 6) node.quad6 = child;
  else if (idx === 7) node.quad7 = child;
}

},{"./insertStack":31,"./isSamePosition":32,"./node":33,"ngraph.random":34}],31:[function(_dereq_,module,exports){
module.exports = InsertStack;

/**
 * Our implementation of QuadTree is non-recursive to avoid GC hit
 * This data structure represent stack of elements
 * which we are trying to insert into quad tree.
 */
function InsertStack () {
    this.stack = [];
    this.popIdx = 0;
}

InsertStack.prototype = {
    isEmpty: function() {
        return this.popIdx === 0;
    },
    push: function (node, body) {
        var item = this.stack[this.popIdx];
        if (!item) {
            // we are trying to avoid memory pressure: create new element
            // only when absolutely necessary
            this.stack[this.popIdx] = new InsertStackElement(node, body);
        } else {
            item.node = node;
            item.body = body;
        }
        ++this.popIdx;
    },
    pop: function () {
        if (this.popIdx > 0) {
            return this.stack[--this.popIdx];
        }
    },
    reset: function () {
        this.popIdx = 0;
    }
};

function InsertStackElement(node, body) {
    this.node = node; // QuadTree node
    this.body = body; // physical body which needs to be inserted to node
}

},{}],32:[function(_dereq_,module,exports){
module.exports = function isSamePosition(point1, point2) {
    var dx = Math.abs(point1.x - point2.x);
    var dy = Math.abs(point1.y - point2.y);
    var dz = Math.abs(point1.z - point2.z);

    return (dx < 1e-8 && dy < 1e-8 && dz < 1e-8);
};

},{}],33:[function(_dereq_,module,exports){
/**
 * Internal data structure to represent 3D QuadTree node
 */
module.exports = function Node() {
  // body stored inside this node. In quad tree only leaf nodes (by construction)
  // contain boides:
  this.body = null;

  // Child nodes are stored in quads. Each quad is presented by number:
  // Behind Z median:
  // 0 | 1
  // -----
  // 2 | 3
  // In front of Z median:
  // 4 | 5
  // -----
  // 6 | 7
  this.quad0 = null;
  this.quad1 = null;
  this.quad2 = null;
  this.quad3 = null;
  this.quad4 = null;
  this.quad5 = null;
  this.quad6 = null;
  this.quad7 = null;

  // Total mass of current node
  this.mass = 0;

  // Center of mass coordinates
  this.massX = 0;
  this.massY = 0;
  this.massZ = 0;

  // bounding box coordinates
  this.left = 0;
  this.top = 0;
  this.bottom = 0;
  this.right = 0;
  this.front = 0;
  this.back = 0;
};

},{}],34:[function(_dereq_,module,exports){
module.exports = {
  random: random,
  randomIterator: randomIterator
};

/**
 * Creates seeded PRNG with two methods:
 *   next() and nextDouble()
 */
function random(inputSeed) {
  var seed = typeof inputSeed === 'number' ? inputSeed : (+ new Date());
  var randomFunc = function() {
      // Robert Jenkins' 32 bit integer hash function.
      seed = ((seed + 0x7ed55d16) + (seed << 12))  & 0xffffffff;
      seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
      seed = ((seed + 0x165667b1) + (seed << 5))   & 0xffffffff;
      seed = ((seed + 0xd3a2646c) ^ (seed << 9))   & 0xffffffff;
      seed = ((seed + 0xfd7046c5) + (seed << 3))   & 0xffffffff;
      seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
      return (seed & 0xfffffff) / 0x10000000;
  };

  return {
      /**
       * Generates random integer number in the range from 0 (inclusive) to maxValue (exclusive)
       *
       * @param maxValue Number REQUIRED. Ommitting this number will result in NaN values from PRNG.
       */
      next : function (maxValue) {
          return Math.floor(randomFunc() * maxValue);
      },

      /**
       * Generates random double number in the range from 0 (inclusive) to 1 (exclusive)
       * This function is the same as Math.random() (except that it could be seeded)
       */
      nextDouble : function () {
          return randomFunc();
      }
  };
}

/*
 * Creates iterator over array, which returns items of array in random order
 * Time complexity is guaranteed to be O(n);
 */
function randomIterator(array, customRandom) {
    var localRandom = customRandom || random();
    if (typeof localRandom.next !== 'function') {
      throw new Error('customRandom does not match expected API: next() function is missing');
    }

    return {
        forEach : function (callback) {
            var i, j, t;
            for (i = array.length - 1; i > 0; --i) {
                j = localRandom.next(i + 1); // i inclusive
                t = array[j];
                array[j] = array[i];
                array[i] = t;

                callback(t);
            }

            if (array.length) {
                callback(array[0]);
            }
        },

        /**
         * Shuffles array randomly, in place.
         */
        shuffle : function () {
            var i, j, t;
            for (i = array.length - 1; i > 0; --i) {
                j = localRandom.next(i + 1); // i inclusive
                t = array[j];
                array[j] = array[i];
                array[i] = t;
            }

            return array;
        }
    };
}

},{}],35:[function(_dereq_,module,exports){
module.exports = save;

function save(graph, customNodeTransform, customLinkTransform) {
  // Object contains `nodes` and `links` arrays.
  var result = {
    nodes: [],
    links: []
  };

  var nodeTransform = customNodeTransform || defaultTransformForNode;
  var linkTransform = customLinkTransform || defaultTransformForLink;

  graph.forEachNode(saveNode);
  graph.forEachLink(saveLink);

  return JSON.stringify(result);

  function saveNode(node) {
    // Each node of the graph is processed to take only required fields
    // `id` and `data`
    result.nodes.push(nodeTransform(node));
  }

  function saveLink(link) {
    // Each link of the graph is also processed to take `fromId`, `toId` and
    // `data`
    result.links.push(linkTransform(link));
  }

  function defaultTransformForNode(node) {
    var result = {
      id: node.id
    };
    // We don't want to store undefined fields when it's not necessary:
    if (node.data !== undefined) {
      result.data = node.data;
    }

    return result;
  }

  function defaultTransformForLink(link) {
    var result = {
      fromId: link.fromId,
      toId: link.toId,
    };

    if (link.data !== undefined) {
      result.data = link.data;
    }

    return result;
  }
}

},{}],36:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],37:[function(_dereq_,module,exports){
(function (process){
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    "use strict";

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
        // Prefer window over self for add-on scripts. Use self for
        // non-windowed contexts.
        var global = typeof window !== "undefined" ? window : self;

        // Get the `window` object, save the previous Q global
        // and initialize Q as a global.
        var previousQ = global.Q;
        global.Q = definition();

        // Add a noConflict function so Q can be removed from the
        // global namespace.
        global.Q.noConflict = function () {
            global.Q = previousQ;
            return this;
        };

    } else {
        throw new Error("This environment was not anticipated by Q. Please file a bug.");
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;
    // queue for late tasks, used by unhandled rejection tracking
    var laterQueue = [];

    function flush() {
        /* jshint loopfunc: true */
        var task, domain;

        while (head.next) {
            head = head.next;
            task = head.task;
            head.task = void 0;
            domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }
            runSingle(task, domain);

        }
        while (laterQueue.length) {
            task = laterQueue.pop();
            runSingle(task);
        }
        flushing = false;
    }
    // runs a single function in the async queue
    function runSingle(task, domain) {
        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process === "object" &&
        process.toString() === "[object process]" && process.nextTick) {
        // Ensure Q is in a real Node environment, with a `process.nextTick`.
        // To see through fake Node environments:
        // * Mocha test runner - exposes a `process` global without a `nextTick`
        // * Browserify - exposes a `process.nexTick` function that uses
        //   `setTimeout`. In this case `setImmediate` is preferred because
        //    it is faster. Browserify's `process.toString()` yields
        //   "[object Object]", while in a real Node environment
        //   `process.nextTick()` yields "[object process]".
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }
    // runs a task after all other tasks have been run
    // this is useful for unhandled rejection tracking that needs to happen
    // after all `then`d tasks have been run.
    nextTick.runAfter = function (task) {
        laterQueue.push(task);
        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };
    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don�t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller�s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (value instanceof Promise) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

// enable long stacks if Q_DEBUG is set
if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
    Q.longStackSupport = true;
}

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            Q.nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            Q.nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            Q.nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
Q.race = race;
function race(answerPs) {
    return promise(function (resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function (answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    Q.nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

Q.tap = function (promise, callback) {
    return Q(promise).tap(callback);
};

/**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
Promise.prototype.tap = function (callback) {
    callback = Q(callback);

    return this.then(function (value) {
        return callback.fcall(value).thenResolve(value);
    });
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it�s a fulfilled promise, the fulfillment value is nearer.
 * If it�s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return object instanceof Promise;
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var reportedUnhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }
    if (typeof process === "object" && typeof process.emit === "function") {
        Q.nextTick.runAfter(function () {
            if (array_indexOf(unhandledRejections, promise) !== -1) {
                process.emit("unhandledRejection", reason, promise);
                reportedUnhandledRejections.push(promise);
            }
        });
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        if (typeof process === "object" && typeof process.emit === "function") {
            Q.nextTick.runAfter(function () {
                var atReport = array_indexOf(reportedUnhandledRejections, promise);
                if (atReport !== -1) {
                    process.emit("rejectionHandled", unhandledReasons[at], promise);
                    reportedUnhandledRejections.splice(atReport, 1);
                }
            });
        }
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    Q.nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return Q(result.value);
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return Q(exception.value);
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    Q.nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var pendingCount = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++pendingCount;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--pendingCount === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (pendingCount === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Returns the first resolved promise of an array. Prior rejected promises are
 * ignored.  Rejects only if all promises are rejected.
 * @param {Array*} an array containing values or promises for values
 * @returns a promise fulfilled with the value of the first resolved promise,
 * or a rejected promise if all promises are rejected.
 */
Q.any = any;

function any(promises) {
    if (promises.length === 0) {
        return Q.resolve();
    }

    var deferred = Q.defer();
    var pendingCount = 0;
    array_reduce(promises, function (prev, current, index) {
        var promise = promises[index];

        pendingCount++;

        when(promise, onFulfilled, onRejected, onProgress);
        function onFulfilled(result) {
            deferred.resolve(result);
        }
        function onRejected() {
            pendingCount--;
            if (pendingCount === 0) {
                deferred.reject(new Error(
                    "Can't get fulfillment value from any promise, all " +
                    "promises were rejected."
                ));
            }
        }
        function onProgress(progress) {
            deferred.notify({
                index: index,
                value: progress
            });
        }
    }, undefined);

    return deferred.promise;
}

Promise.prototype.any = function () {
    return any(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        Q.nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, error) {
    return Q(object).timeout(ms, error);
};

Promise.prototype.timeout = function (ms, error) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        if (!error || "string" === typeof error) {
            error = new Error(error || "Timed out after " + ms + " ms");
            error.code = "ETIMEDOUT";
        }
        deferred.reject(error);
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            Q.nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            Q.nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

Q.noConflict = function() {
    throw new Error("Q.noConflict only works when Q is used as a global");
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

}).call(this,_dereq_('_process'))

},{"_process":36}],38:[function(_dereq_,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result � either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher�Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],39:[function(_dereq_,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn, options) {
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp && exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);

    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'], (
            // try to call default if defined to also support babel esmodule
            // exports
            'var f = require(' + stringify(wkey) + ');' +
            '(f.default ? f.default : f)(self);'
        )),
        scache
    ];

    var src = '(' + bundleFn + ')({'
        + Object.keys(sources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    var blob = new Blob([src], { type: 'text/javascript' });
    if (options && options.bare) { return blob; }
    var workerUrl = URL.createObjectURL(blob);
    var worker = new Worker(workerUrl);
    worker.objectURL = workerUrl;
    return worker;
};

},{}],40:[function(_dereq_,module,exports){
'use strict';

var Graph = _dereq_('ngraph.graph');
var _ = _dereq_('underscore');
var Q = _dereq_('Q');
var Nlayout = _dereq_('ngraph.asyncforce');
// registers the extension on a cytoscape lib ref

var ngraph = function (cytoscape) {

        if (!cytoscape) {
            return;
        } // can't register if cytoscape unspecified

        var defaults = {
            async: {
                // tell layout that we want to compute all at once:
                maxIterations: 1000,
                stepsPerCycle: 30,

                // Run it till the end:
                waitForStep: false
            },
            physics: {
                /**
                 * Ideal length for links (springs in physical model).
                 */
                springLength: 100,

                /**
                 * Hook's law coefficient. 1 - solid spring.
                 */
                springCoeff: 0.0008,

                /**
                 * Coulomb's law coefficient. It's used to repel nodes thus should be negative
                 * if you make it positive nodes start attract each other :).
                 */
                gravity: -1.2,

                /**
                 * Theta coefficient from Barnes Hut simulation. Ranged between (0, 1).
                 * The closer it's to 1 the more nodes algorithm will have to go through.
                 * Setting it to one makes Barnes Hut simulation no different from
                 * brute-force forces calculation (each node is considered).
                 */
                theta: 0.8,

                /**
                 * Drag force coefficient. Used to slow down system, thus should be less than 1.
                 * The closer it is to 0 the less tight system will be.
                 */
                dragCoeff: 0.02,

                /**
                 * Default time step (dt) for forces integration
                 */
                timeStep: 20,
                iterations: 10000,
                fit: true,

                /**
                 * Maximum movement of the system which can be considered as stabilized
                 */
                stableThreshold: 0.000009
            },
            iterations: 10000,
            refreshInterval: 16, // in ms
            refreshIterations: 10, // iterations until thread sends an update
            stableThreshold: 2,
            animate: true,
            fit: true
        };

        var extend = Object.assign || function (tgt) {
                for (var i = 1; i < arguments.length; i++) {
                    var obj = arguments[i];

                    for (var k in obj) {
                        tgt[k] = obj[k];
                    }
                }
                return tgt;
            };

        function Layout(options) {
            this.options = extend({}, defaults, options);
            this.layoutOptions = extend({}, defaults, options);
            delete  this.layoutOptions.cy;
            delete  this.layoutOptions.eles;
        }

        Layout.prototype.l = Nlayout;
        Layout.prototype.g = Graph;

        Layout.prototype.run = function () {
            var layout = this;
            layout.trigger({type: 'layoutstart', layout: layout});
            var options = this.options;
            var layoutOptions = this.layoutOptions;
            var that = this;
            var graph = that.g();
            var cy = options.cy;
            var eles = options.eles;
            var nodes = eles.nodes();
            var parents = nodes.parents();

            // FILTER

            nodes = nodes.difference(parents);

            nodes = nodes.filterFn(function (ele) {
                return ele.connectedEdges().length > 0
            });

            var edges = eles.edges();
            var edgesHash = {};
            var L;


            var firstUpdate = true;

            /*        if (eles.length > 3000) {
             options.iterations = options.iterations - Math.abs(options.iterations / 3); // reduce iterations for big graph
             }*/

            var update = function (nodesJson) {
                /* cy.batch(function () {
                 nodesJson.forEach(function(e,k){
                 nodes.$('#'+ e.data.id).position(e.position);
                 })

                 });*/
                nodes.positions(function (i, node) {
                    if (!node.data('dragging'))
                        return L.getNodePosition(node.id())
                });

                if (layoutOptions.async) {
                    setTimeout(function () {
                        layout.trigger({type: 'layoutstop', layout: layout});
                        layout.trigger({type: 'layoutready', layout: layout});
                    }, 500);
                }

                /* nodes.forEach(function (node) {
                 L.getNodePosition(node.id())
                 });*/

                // maybe we fit each iteration
                if (layoutOptions.fit) {
                    cy.fit(layoutOptions.padding);
                }

                if (firstUpdate) {
                    // indicate the initial positions have been set
                    layout.trigger('layoutready');
                    firstUpdate = false;
                }

            };

            graph.on('changed', function (e) {
                //  console.dir(e);
            });

            _.each(nodes, function (e, k) {
                e.on('tapstart', function (e) {
                    e.cyTarget.data('dragging', true)
                });
                e.on('tapend', function (e) {
                    e.cyTarget.removeData('dragging');
                });
                e.on('position', 'node[dragging]', function (e) {
                    if (L.setNodePosition && e.cyTarget.data('dragging')) {
                        L.setNodePosition(e.cyTarget.data().id);
                    }
                });
                graph.addNode(e.data().id);
            });

            _.each(edges, function (e, k) {
                if (!edgesHash[e.data().source + ':' + e.data().target] && !edgesHash[e.data().target + ':' + e.data().source]) {
                    edgesHash[e.data().source + ':' + e.data().target] = e;
                    graph.addLink(e.data().source, e.data().target);
                }
            });

            L = that.l(graph, layoutOptions);

            _.each(nodes, function (e, k) {
                var data = e.data();
                //var pos = e.position();
                if (data.pin) {
                    L.pinNode(data.id, true);
                    e.removeData('pin');
                    e.data('unpin', true);
                } else if (data.unpin) {
                    L.pinNode(data.id, false);
                    e.removeData('unpin');
                }
                //if (pos.x && pos.y) {
                //  L.setNodePosition(data.id, pos);
                //}
            });

            var left = layoutOptions.iterations;

            this.on('layoutstop', function () {
                layoutOptions.iterations = 0;
            });

            L.on('stable', function () {
                console.log('got Stable event');
                left = 0;
            });

            if (!layoutOptions.animate) {
                layoutOptions.refreshInterval = 0;
            }
            var updateTimeout;
            L.on('cycle', function () {
                update();
            });

            if (layoutOptions.async) {
                return this;
            }

            var step = function () {
                if (layoutOptions.animate) {
                    if (left != 0  /*condition for stopping layout*/) {
                        if (!updateTimeout || left == 0) {
                            updateTimeout = setTimeout(function () {
                                left--;
                                //update();
                                updateTimeout = null;
                                L.step() ? left = 0 : false;
                                // update();
                                step();
                                //step();
                            }, layoutOptions.refreshInterval);
                        }
                    } else {
                        layout.trigger({type: 'layoutstop', layout: layout});
                        layout.trigger({type: 'layoutready', layout: layout});
                    }
                } else {

                    for (var i = 0; i < layoutOptions.iterations; i++) {
                        L.step()
                    }
                    layout.trigger({type: 'layoutstop', layout: layout});
                    layout.trigger({type: 'layoutready', layout: layout});
                    //update();
                }

            };
            step();
            return this;
        };

        Layout.prototype.stop = function () {
            // TODO: thread actions
            // continuous/asynchronous layout may want to set a flag etc to let
            // run() know to stop


            if (this.thread) {
                this.thread.stop();
            }

            this.trigger('layoutstop');

            return this; // chaining
        };

        Layout.prototype.destroy = function () {
            // clean up here if you create threads etc
            // TODO: thread actions

            if (this.thread) {
                this.thread.stop();
            }

            return this; // chaining
        };

        return Layout;

    };

module.exports = function get(cytoscape) {
    return ngraph(cytoscape);
};

},{"Q":37,"ngraph.asyncforce":1,"ngraph.graph":23,"underscore":38}],41:[function(_dereq_,module,exports){
'use strict';

(function(){

    // registers the extension on a cytoscape lib ref
    var getLayout = _dereq_('./impl.js');
    var register = function( cytoscape ){
        var Layout = getLayout( cytoscape );
        cytoscape('layout', 'cytoscape-ngraph.forcelayout', Layout);
    };

    if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
        module.exports = register;
    }

    if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
        define('cytoscape-ngraph.forcelayout', function(){
            return register;
        });
    }

    if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
        register( cytoscape );
    }

})();
},{"./impl.js":40}]},{},[41])(41)
});
;(function( $, $$ ){ 'use strict';

  var isObject = function(o){
    return o != null && typeof o === 'object';
  };

  var isFunction = function(o){
    return o != null && typeof o === 'function';
  };

  var isNumber = function(o){
    return o != null && typeof o === 'number';
  };

  var throttle = function(func, wait, options) {
    var leading = true,
        trailing = true;

    if (options === false) {
      leading = false;
    } else if (isObject(options)) {
      leading = 'leading' in options ? options.leading : leading;
      trailing = 'trailing' in options ? options.trailing : trailing;
    }
    options = options || {};
    options.leading = leading;
    options.maxWait = wait;
    options.trailing = trailing;

    return debounce(func, wait, options);
  };

  var debounce = function(func, wait, options) { // ported lodash debounce function
    var args,
        maxTimeoutId,
        result,
        stamp,
        thisArg,
        timeoutId,
        trailingCall,
        lastCalled = 0,
        maxWait = false,
        trailing = true;

    if (!isFunction(func)) {
      return;
    }
    wait = Math.max(0, wait) || 0;
    if (options === true) {
      var leading = true;
      trailing = false;
    } else if (isObject(options)) {
      leading = options.leading;
      maxWait = 'maxWait' in options && (Math.max(wait, options.maxWait) || 0);
      trailing = 'trailing' in options ? options.trailing : trailing;
    }
    var delayed = function() {
      var remaining = wait - (Date.now() - stamp);
      if (remaining <= 0) {
        if (maxTimeoutId) {
          clearTimeout(maxTimeoutId);
        }
        var isCalled = trailingCall;
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (isCalled) {
          lastCalled = Date.now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      } else {
        timeoutId = setTimeout(delayed, remaining);
      }
    };

    var maxDelayed = function() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (trailing || (maxWait !== wait)) {
        lastCalled = Date.now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
      }
    };

    return function() {
      args = arguments;
      stamp = Date.now();
      thisArg = this;
      trailingCall = trailing && (timeoutId || !leading);

      if (maxWait === false) {
        var leadingCall = leading && !timeoutId;
      } else {
        if (!maxTimeoutId && !leading) {
          lastCalled = stamp;
        }
        var remaining = maxWait - (stamp - lastCalled),
            isCalled = remaining <= 0;

        if (isCalled) {
          if (maxTimeoutId) {
            maxTimeoutId = clearTimeout(maxTimeoutId);
          }
          lastCalled = stamp;
          result = func.apply(thisArg, args);
        }
        else if (!maxTimeoutId) {
          maxTimeoutId = setTimeout(maxDelayed, remaining);
        }
      }
      if (isCalled && timeoutId) {
        timeoutId = clearTimeout(timeoutId);
      }
      else if (!timeoutId && wait !== maxWait) {
        timeoutId = setTimeout(delayed, wait);
      }
      if (leadingCall) {
        isCalled = true;
        result = func.apply(thisArg, args);
      }
      if (isCalled && !timeoutId && !maxTimeoutId) {
        args = thisArg = null;
      }
      return result;
    };
  };

  function register( $$, $ ){

    // use a single dummy dom ele as target for every qtip
    var $qtipContainer = $('<div></div>');
    var viewportDebounceRate = 250;

    function generateOpts( target, passedOpts ){
      var qtip = target.scratch().qtip;
      var opts = $.extend( {}, passedOpts );

      if( !opts.id ){
        opts.id = 'cy-qtip-target-' + ( Date.now() + Math.round( Math.random() * 10000) );
      }

      if( !qtip.$domEle ){
        qtip.$domEle = $qtipContainer;
      }

      // qtip should be positioned relative to cy dom container
      opts.position = opts.position || {};
      opts.position.container = opts.position.container || $( document.body );
      opts.position.viewport = opts.position.viewport || $( document.body );
      opts.position.target = [0, 0];
      opts.position.my = opts.position.my || 'top center';
      opts.position.at = opts.position.at || 'bottom center';

      // adjust
      var adjust = opts.position.adjust = opts.position.adjust || {};
      adjust.method = adjust.method || 'flip';
      adjust.mouse = false;

      if( adjust.cyAdjustToEleBB === undefined ){
        adjust.cyAdjustToEleBB = true;
      }

      // default show event
      opts.show = opts.show || {};

      if( !opts.show.event ){
        opts.show.event = 'tap';
      }

      // default hide event
      opts.hide = opts.hide || {};
      opts.hide.cyViewport = opts.hide.cyViewport === undefined ? true : opts.hide.cyViewport;

      if( !opts.hide.event ){
        opts.hide.event = 'unfocus';
      }

      // so multiple qtips can exist at once (only works on recent qtip2 versions)
      opts.overwrite = false;

      var content;
      if( opts.content ){
        if( isFunction(opts.content) ){
          content = opts.content;
        } else if( opts.content.text && isFunction(opts.content.text) ){
          content = opts.content.text;
        }

        if( content ){
          opts.content = function(event, api){
            return content.apply( target, [event, api] );
          };
        }
      }

      return opts;
    }

    $$('collection', 'qtip', function( passedOpts ){
      var eles = this;
      var cy = this.cy();
      var container = cy.container();

      if( passedOpts === 'api' ){
        return this.scratch().qtip.api;
      }

      eles.each(function(i, ele){
        var scratch = ele.scratch();
        var qtip = scratch.qtip = scratch.qtip || {};
        var opts = generateOpts( ele, passedOpts );
        var adjNums = opts.position.adjust;


        qtip.$domEle.qtip( opts );
        var qtipApi = qtip.api = qtip.$domEle.qtip('api'); // save api ref
        qtip.$domEle.removeData('qtip'); // remove qtip dom/api ref to be safe

        var updatePosition = function(e){
          var cOff = container.getBoundingClientRect();
          var pos = ele.renderedPosition() || ( e ? e.cyRenderedPosition : undefined );
          if( !pos || pos.x == null || isNaN(pos.x) ){ return; }

          if( opts.position.adjust.cyAdjustToEleBB && ele.isNode() ){
            var my = opts.position.my.toLowerCase();
            var at = opts.position.at.toLowerCase();
            var z = cy.zoom();
            var w = ele.outerWidth() * z;
            var h = ele.outerHeight() * z;

            if( at.match('top') ){
              pos.y -= h/2;
            } else if( at.match('bottom') ){
              pos.y += h/2;
            }

            if( at.match('left') ){
              pos.x -= w/2;
            } else if( at.match('right') ){
              pos.x += w/2;
            }

            if( isNumber(adjNums.x) ){
              pos.x += adjNums.x;
            }

            if( isNumber(adjNums.y) ){
              pos.y += adjNums.y;
            }
          }

          qtipApi.set('position.adjust.x', cOff.left + pos.x + window.pageXOffset);
          qtipApi.set('position.adjust.y', cOff.top + pos.y + window.pageYOffset);
        };
        updatePosition();

        ele.on( opts.show.event, function(e){
          updatePosition(e);

          qtipApi.show();
        } );

        ele.on( opts.hide.event, function(e){
          qtipApi.hide();
        } );

        if( opts.hide.cyViewport ){
          cy.on('viewport', debounce(function(){
            qtipApi.hide();
          }, viewportDebounceRate, { leading: true }) );
        }

        if( opts.position.adjust.cyViewport ){
          cy.on('pan zoom', debounce(function(e){
            updatePosition(e);

            qtipApi.reposition();
          }, viewportDebounceRate, { trailing: true }) );
        }

      });

      return this; // chainability

    });

    $$('core', 'qtip', function( passedOpts ){
      var cy = this;
      var container = cy.container();

      if( passedOpts === 'api' ){
        return this.scratch().qtip.api;
      }

      var scratch = cy.scratch();
      var qtip = scratch.qtip = scratch.qtip || {};
      var opts = generateOpts( cy, passedOpts );


      qtip.$domEle.qtip( opts );
      var qtipApi = qtip.api = qtip.$domEle.qtip('api'); // save api ref
      qtip.$domEle.removeData('qtip'); // remove qtip dom/api ref to be safe

      var updatePosition = function(e){
        var cOff = container.getBoundingClientRect();
        var pos = e.cyRenderedPosition;
        if( !pos || pos.x == null || isNaN(pos.x) ){ return; }

        qtipApi.set('position.adjust.x', cOff.left + pos.x + window.pageXOffset);
        qtipApi.set('position.adjust.y', cOff.top + pos.y + window.pageYOffset);
      };

      cy.on( opts.show.event, function(e){
        if( !opts.show.cyBgOnly || (opts.show.cyBgOnly && e.cyTarget === cy) ){
          updatePosition(e);

          qtipApi.show();
        }
      } );

      cy.on( opts.hide.event, function(e){
        if( !opts.hide.cyBgOnly || (opts.hide.cyBgOnly && e.cyTarget === cy) ){
          qtipApi.hide();
        }
      } );

      if( opts.hide.cyViewport ){
        cy.on('viewport', debounce(function(){
          qtipApi.hide();
        }, viewportDebounceRate, { leading: true }) );
      }

      return this; // chainability

    });

  }

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-qtip', function(){
      return register;
    });
  }

  if( $ && $$ ){
    register( $$, $ );
  }

})(
  typeof jQuery !== 'undefined' ? jQuery : null,
  typeof cytoscape !== 'undefined' ? cytoscape : null
);