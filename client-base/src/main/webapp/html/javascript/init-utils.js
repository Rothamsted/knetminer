
//functions shows the genome or qtl search box and chromosome viewer if there is a reference genome
function showReferenceGenome(){

    if (reference_genome == true) {
       $('#genomeorqtlsearchbox').show();
       if (typeof gviewer != "undefined" && gviewer == false) {
           activateButton('resultsTable');
           $('#genemap-tab_button').hide();
           $('#genemap-tab').hide();
       }
   }
   else {
       activateButton('resultsTable');
       $('#genomeorqtlsearchbox').hide(); // hide QTL search
       $('#genemap-tab_button').hide(); // hide Map View option
       $('#genemap-tab').hide();
   }

}

// function runs on page jquery document ready
function loadOnReady(){

     // add species name to header
     $('#species_header').text(species_name); //update species name from utils_config.js

    activateResetButton(); 

    queryToggle();

    // hide reset btn on page load
    $("#resetknet").hide(); 
    $("#keywords").focus();
    $('#tabviewer').hide(); // hide by default
    // Tooltip
    getQueryExamples();
    showReferenceGenome();  

    createAnalyticsTag(); 
    generalPageAnalytics(); 

    genemap.draw('#genemap', 'html/data/basemap.xml', null);

}

 // function reset all form input including the genenome icon and the suggestor text values
function initResetButton(){
    
    $("#resetknet").click(function(event){
        event.preventDefault();
        $('form')[0].reset();
        $("#pGViewer_title").empty();
        $('#matchesResultDiv').html('Please, start typing your query');
        $('#suggestor_search').hide();
        $('#tabviewer').hide(); 
        $("#resetknet").hide();
        $('#geneResultDiv').hide();
        $('#suggestor_search_div').hide();
        $('#region_search_area').hide(); 
        $('#region_search').attr('src','html/image/expand.gif')
    });

}

// function Calculates the amount of documents to be displayed with the current query
function inputHandlers(){

    $('#keywords').keyup(function (e) {
        // this stops matchCounter being called when the enter or arrow keys are used.
        if (e.which !== 13 && e.which !== 37 && e.which !== 38 && e.which !== 39 && e.which !== 40) {
            matchCounter();
        }
        // this stops refreshQuerySuggester being called when the enter or arrow keys are used.
        if (e.which !== 13 && e.which !== 37 && e.which !== 38 && e.which !== 39 && e.which !== 40) {
            // Refresh the query suggester table as well, if it's already open.
            if ($('#suggestor_search').attr('src') === "html/image/qs_collapse.png") {
            //if($('#suggestor_search').dialog('isOpen')) {
                refreshQuerySuggester();
            }
        }
    });


    $('#list_of_genes').keyup(function(){
        geneCounter()
    }); 

}

// function add and remove QTL region
function QtlRegionHandlers(){
    
     $('#addRow').click(
        function () {
            var curMaxInput = $('#region_search_area table tr').length - 1;
            $('#region_search_area tr:nth-child(2)')
                .clone()
                .insertAfter($('#region_search_area tr:last').prev())
                .find('td:eq(0)')
                .find('select:eq(0)')
                .attr({
                    'id': 'chr' + (curMaxInput),
                    'name': 'chr' + (curMaxInput),
                    'onChange': 'findGenes(\'genes' + (curMaxInput) + '\', $(\'#chr' + (curMaxInput) + ' option:selected\').val(), $(\'#start' + (curMaxInput) + '\').val(), $(\'#end' + (curMaxInput) + '\').val())',
                    'value': ''
                })
                .parent().parent()
                .find('td:eq(1)')
                .find('input:text:eq(0)')
                .attr({
                    'id': 'start' + (curMaxInput),
                    'name': 'start' + (curMaxInput),
                    'onKeyup': 'findGenes(\'genes' + (curMaxInput) + '\', $(\'#chr' + (curMaxInput) + ' option:selected\').val(), $(\'#start' + (curMaxInput) + '\').val(), $(\'#end' + (curMaxInput) + '\').val())',
                    'value': ''
                })
                .parent().parent()
                .find('td:eq(2)')
                .find('input:text:eq(0)')
                .attr({
                    'id': 'end' + (curMaxInput),
                    'name': 'end' + (curMaxInput),
                    'onKeyup': 'findGenes(\'genes' + (curMaxInput) + '\', $(\'#chr' + (curMaxInput) + ' option:selected\').val(), $(\'#start' + (curMaxInput) + '\').val(), $(\'#end' + (curMaxInput) + '\').val())',
                    'value': ''
                })
                .parent().parent()
                .find('td:eq(3)')
                .find('input:text:eq(0)')
                .attr({
                    'id': 'label' + (curMaxInput),
                    'name': 'label' + (curMaxInput),
                    'value': ''
                })
                .parent().parent()
                .find('td:eq(4)')
                .find('input:text:eq(0)')
                .attr({
                    'id': 'genes' + (curMaxInput),
                    'name': 'label' + (curMaxInput),
                    'onFocus': 'findGenes(this.id, $(\'#chr' + (curMaxInput) + ' option:selected\').val(), $(\'#start' + (curMaxInput) + '\').val(), $(\'#end' + (curMaxInput) + '\').val())',
                    'value': ''
                });

                activateResetButton(); 

            $('#removeRow').removeAttr('disabled');
            if ($('#region_search_area tr').length >= 7) {
                $('#addRow').attr('disabled', true);
            }

            return false;
    });
    
    $('#removeRow').click(
            function () {
                activateResetButton(); 
                if ($('#region_search_area tr').length > 3) {
                    $('#region_search_area tr:last').prev().remove();
                }
                if ($('#region_search_area tr').length <= 3) {
                    $("#chr1").attr('selectedIndex', 0);
                    $("#start1").val('');
                    $("#end1").val('');
                    $("#label1" ).val('');
                }
                else if ($('#rows tr').length < 7) {
                    $('#addRow').removeAttr('disabled');
                }
                return false;
                
     });
}


 // functions handle click events for click events on knetminer search form
function searchHandlers(){

    $('#advanced_search').click(
        function () {
            var src = ($(this).attr('src') === 'html/image/expand.gif')
                ? 'html/image/collapse.gif'
                : 'html/image/expand.gif';
            $(this).attr('src', src);
            $('#advanced_search_area').animate({
                    height: 'toggle'
                }, 500
            );
    });

    // 
    $('#suggestor_search').click(
            function () {
                var src = ($(this).attr('src') === 'html/image/qs_expand.png')
                    ? 'html/image/qs_collapse.png'
                    : 'html/image/qs_expand.png';
                $(this).attr('src', src);
                $('#suggestor_search_area').animate({
                        height: 'toggle'
                    }, 500
                );
                if ($('#suggestor_search').attr('src') == "html/image/qs_collapse.png") {
                    refreshQuerySuggester();
                }
    
    });

     // Keyword search
     $('#kwd_search').click(
        function () {
            var old_src= $(this).attr('src');
            var src = (old_src === 'html/image/expand.gif')
                ? 'html/image/collapse.gif'
                : 'html/image/expand.gif';
            $(this).attr('src', src);
            $('#keywords').animate({
                    height: 'toggle'
                }, 500
            ).css('display', 'inline-block');
            $('#matchesResultDiv').animate({
                    height: 'toggle'
                }, 500
            );

            if(old_src === 'html/image/collapse.gif') {
               // hide suggestor_search img icon and suggestor_search_area div
               $('#suggestor_search').css('display', 'none');
               $('#suggestor_search_area').css('display', 'none');
              }
        });

    $('#region_search').click(
            function () {
                var src = ($(this).attr('src') === 'html/image/expand.gif')
                    ? 'html/image/collapse.gif'
                    : 'html/image/expand.gif';
                $(this).attr('src', src);
                $('#region_search_area').animate({
                        height: 'toggle'
                    }, 500
                );
        });
}

// function handles body events 
function bodyHandlers(){

    $('body').on('mouseenter', 'span.hint', function (event) {
        target = $(this)[0].id;
        var message = "";
        addClass = "";
        if (target == 'hintSearchQtlGenome') {
            message = 'Select the "whole-genome" option to search the whole genome for potential candidate genes or select the "within QTL" option to search for candidate genes within the QTL coordinates.';
        }
        else if (target == 'hintEnterGenes') {
            message = 'Input a list of target genes using reference gene ID\'s.';
        }
        else if (target == 'hintQuerySuggestor') {
            message = 'Add, remove or replace terms from your query using the list of suggested terms based on your search criteria';
        }
        else if (target == 'hintEgKeywords') {
            message = sampleQueryButtons;
            addClass = "tooltip-static";
        }
        else if (target == 'hintSortableTable') {
            message = 'On clicking the <b>Create Network</b> button: it opens KnetMaps, displays a subset of the knowledge network containing only the selected genes and the relevant evidence network.';
            addClass = 'networkhint'
        }

        $('div.tooltip').remove();

        $('<div class="tooltip ' + addClass + '">' + message + '</div>').appendTo('body');

        tooltipY = $(this).offset()['top'] - 12;
        tooltipX = $(this).offset()['left'] - 4;
        winWidth = $(window).width();
        if (tooltipX + 300 > winWidth) {
            tooltipX = winWidth - 300;
        }
        $('div.tooltip.tooltip-static').css({top: tooltipY, left: tooltipX}); //for sample queries tooltip
    });



    $('body').on('mousemove', 'span.hint:not(#hintEgKeywords)', function (event) {
        var tooltipX = event.pageX - 8;
        var tooltipY = event.pageY + 8;

        winWidth = $(window).width();
        if (tooltipX + 300 > winWidth) {
            tooltipX = winWidth - 300;
        }

        $('div.tooltip').css({top: tooltipY, left: tooltipX});
    });


    $('body').on('mouseleave', 'span.hint', function (event) {
        if ($(event.relatedTarget).hasClass("tooltip-static") || $(event.relatedTarget).parent().hasClass("tooltip-static")) {
            return;
        }
        $('div.tooltip').remove();
    });

    $('body').on('mouseleave', 'div.tooltip-static', function (event) {
        $('div.tooltip').remove();
    });
}






