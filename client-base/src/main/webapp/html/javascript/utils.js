// Map View
var genemap = GENEMAP.GeneMap({apiUrl: api_url}).width(800).height(550); // changed from 750x400 to 800x550
var knetmaps = KNETMAPS.KnetMaps();

/*
 * Function to escape special characters from a string for use in jquery selector
 */
function escapeJquerySelectors(exp) {
    return exp.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
}


function activateButton(option){
    
    $('.resultViewer:visible').fadeOut(0, function () {
        $('.button_off').attr('class', 'button_on');
        $('#' + option).fadeIn();
        $('#' + option + '_button').attr('class', 'button_off');

        //Collapse Suggestor view
        $('#suggestor_search').attr('src', 'html/image/qs_expand.png');
        $('#suggestor_search_area').slideUp(500);
		//$('#suggestor_search').dialog('close');
    });
}

/*
Functions for Add, Remove or Replace terms from the query search box
*/
function addKeyword(keyword, from, target) {
    query = $('#' + target).val();
    newquery = query + ' OR ' + keyword;
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('addKeywordUndo addKeyword');

    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function addKeywordUndo(keyword, from, target) {
    query = $('#' + target).val();
    newquery = query.replace(' OR ' + keyword, "");
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('addKeywordUndo addKeyword');

    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function excludeKeyword(keyword, from, target) {
    query = $('#' + target).val();
    newquery = query + ' NOT ' + keyword;
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('excludeKeywordUndo excludeKeyword');
    
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function excludeKeywordUndo(keyword, from, target) {
    query = $('#' + target).val();
    newquery = query.replace(' NOT ' + keyword, "");
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('excludeKeywordUndo excludeKeyword');
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function replaceKeyword(oldkeyword, newkeyword, from, target) {
    query = $('#' + target).val();
    newquery = query.replace(oldkeyword, newkeyword);
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('replaceKeywordUndo replaceKeyword');
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

function replaceKeywordUndo(oldkeyword, newkeyword, from, target) {
    query = $('#' + target).val();
    newquery = query.replace(newkeyword, oldkeyword);
    $('#' + target).val(newquery);
    $('#' + from).toggleClass('replaceKeywordUndo replaceKeyword');
    //Updates the query counter
    matchCounter();

    // Refresh the query suggester table as well by replicating its 'click' event.
    refreshQuerySuggester();
}

/*
 * Function to get the number of genes user inputs
 *
 */
function geneCounter(){
    var geneListValue = $("#list_of_genes").val().split('\n');
    var geneInput = $('#geneResultDiv');
    var notemptygenes = []; 

    if(geneListValue[0] === ''){
        geneInput.hide()
    }else{
        for(var i =0; i < geneListValue.length; i++ ){
            if(geneListValue[i] !==  ''){
                notemptygenes.push(geneListValue[i]); 
                geneInput.show()
                geneInput.html('<span>  <b>'+ notemptygenes.length +'</b>  inputed genes </span>')
            }
        }
       
    }

}

/*
* Document ready event executes when the HTML document is loaded
* 	- add/remove QTL regions
* 	- advanced search
* 	- tooltips
*/

$(document).ready(
    function () {

        // add species name to header
        $('#species_header').text(species_name); //update species name from utils_config.js
        //console.log("enableGoogleAnalytics: "+ enableGA + ", UI ga_id= "+ ga_id); // testing
		
        //shows the genome or qtl search box and chromosome viewer if there is a reference genome
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

        $("#keywords").focus();
        $('#tabviewer').hide(); // hide by default


        // Calculates the amount of documents to be displayed with the current query
				// TODO: WTH are these numbers?! Needs replacement and proper coding (https://stackoverflow.com/questions/3050984)
				//
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

		
        // Add QTL region
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

                $('#removeRow').removeAttr('disabled');
                if ($('#region_search_area tr').length >= 7) {
                    $('#addRow').attr('disabled', true);
                }

                return false;
            });

        // Remove QTL region
        $('#removeRow').click(
            function () {
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
        

        // Suggestor search
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


        // Region search
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


        // on keyup events it runs function genecounter
        $('#list_of_genes').keyup(function(){
            geneCounter()
        }); 


        // Tooltip
        getQueryExamples(); 

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
                message = 'This opens KnetMaps and displays a subset of the knowledge network that only contains the selected genes (light blue triangles) and the relevant evidence network.';
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

        genemap.draw('#genemap', 'html/data/basemap.xml', null);
});


/*
 * Function
 *
 */
function findGenes(id, chr_name, start, end) {
    if (chr_name != "" && start != "" && end != "") {
        var searchMode = "countLoci";
        var keyword = chr_name + "-" + start + "-" + end;
        var request = "/" + searchMode + "?keyword=" + keyword;
        var url = api_url + request;
        $.get(url, '').done(function (data) {
            $("#" + id).val(data.geneCount);
        });
    }
}

/*
 * Function
 *
 */
function contactWindow() {
    window.open("html/contact.html", "KnetMiner-Contact", "status=0, toolbar=0, location=0, menubar=0, height=200, width=400, resizable=0");
}

/*
 * Function
 * TODO: what does it do? Is it still in use?!
 */
function getRadioValue(radio) {
    var radioValue;
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked) {
            radioValue = radio[i].value;
        }
    }
    return radioValue;
}

/*
 * TODO: Why doesn't it use String.trim() ?! 
 */
function trim(text) {
    return text.replace(/^\s+|\s+$/g, "");
}

/*
 * general page analytics, not the tracking ga_id one
 */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-26111300-1']);
_gaq.push(['_trackPageview']);

(function () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();