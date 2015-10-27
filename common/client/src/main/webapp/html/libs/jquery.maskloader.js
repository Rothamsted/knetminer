
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
