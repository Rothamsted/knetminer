/*
var genespreadsheet = new Array();
var genes;
*/



// Map View
var genemap = GENEMAP.GeneMap({apiUrl: api_url}).width(800).height(550); // changed from 750x400 to 800x550
var knetmaps = KNETMAPS.KnetMaps();

/*
Functions for show and hide structures when a button is pressed
*/

/*
 * Function to escape special characters from a string for use in jquery selector
 */
function escapeJquerySelectors(exp) {
    return exp.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
}

function showSynonymTable(option, tabBoxRelated) {
    $('.suggestorTable:visible').fadeOut(0, function () {
        option = escapeJquerySelectors(option);
        tabBoxRelated = escapeJquerySelectors(tabBoxRelated);
        $('.synonym_right_border').attr('src', 'html/image/synonym_right_off.png');
        $('.synonym_left_border').attr('src', 'html/image/synonym_left_off.png');
        $('.buttonSynonym_on').attr('class', 'buttonSynonym_off');

        $('.tabBox:visible').fadeOut();
        $('#' + tabBoxRelated).fadeIn();

        //Gets the table related to the active tab
        relatedTable = $('#' + tabBoxRelated + ' div.conceptTabOn').attr('rel');
        relatedTable = escapeJquerySelectors(relatedTable);
        $('#' + relatedTable).fadeIn();

        $('#' + option + '_buttonSynonym').attr('class', 'buttonSynonym_on');
        $('#' + option + 'synonym_right_border').attr('src', 'html/image/synonym_right_on.png');
        $('#' + option + 'synonym_left_border').attr('src', 'html/image/synonym_left_on.png');
    });
}

function showSynonymTab(tabFrom, tabItemFrom, tableTo) {
    $('.suggestorTable:visible').fadeOut(0, function () {
        tabFrom = escapeJquerySelectors(tabFrom);
        tabItemFrom = escapeJquerySelectors(tabItemFrom);
        tableTo = escapeJquerySelectors(tableTo);

        $('#' + tabFrom + ' .conceptTabOn').toggleClass('conceptTabOff conceptTabOn');
        $('#' + tableTo).fadeIn();
        $('#' + tabItemFrom).toggleClass('conceptTabOff conceptTabOn');
    });
}

function activateButton(option) {
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
 * Function to check the brackets in a string are balanced
 *
 */
function bracketsAreBalanced(str) {
    var count = 0;
    for (var i = 0; i < str.length; i++) {
        var ch = str.charAt(i);
        if (ch == '(') {
            count++;
        } else if (ch == ')') {
            count--;
            if (count < 0) return false;
        }
    }
    return true;
}

/*
 * Function to get the number of matches
 *
 */
function matchCounter() {
    var keyword = $('#keywords').val();
    if (keyword.length == 0) {
        $('#matchesResultDiv').html('Please, start typing your query');
		// hide query suggestor icon
		$('#suggestor_search').css('display', 'none');
    } else {
        if ((keyword.length > 2) && ((keyword.split('"').length - 1) % 2 == 0) && bracketsAreBalanced(keyword) && (keyword.indexOf("()") < 0) && ((keyword.split('(').length) == (keyword.split(')').length)) && (keyword.charAt(keyword.length - 1) != ' ') && (keyword.charAt(keyword.length - 1) != '(') && (keyword.substr(keyword.length - 3) != 'AND') && (keyword.substr(keyword.length - 3) != 'NOT') && (keyword.substr(keyword.length - 2) != 'OR') && (keyword.substr(keyword.length - 2) != ' A') && (keyword.substr(keyword.length - 3) != ' AN') && (keyword.substr(keyword.length - 2) != ' O') && (keyword.substr(keyword.length - 2) != ' N') && (keyword.substr(keyword.length - 2) != ' NO')) {
            var searchMode = "countHits";
            var request = "/" + searchMode + "?keyword=" + keyword;
            var url = api_url + request;
            $.get(url, '').done(function (data) {
                if (data.luceneLinkedCount != 0) {
                    $('#matchesResultDiv').html('<b>' + data.luceneLinkedCount + ' documents</b>  and <b>' + data.geneCount + ' genes</b> will be found with this query');
                    $('.keywordsSubmit').removeAttr("disabled");
					// show query suggestor icon
					$('#suggestor_search').css('display', 'inline-block');
                }
                else {
				  $('#matchesResultDiv').html('No documents or genes will be found with this query');
				  // hide query suggestor icon
				  $('#suggestor_search').css('display', 'none');
				}
            }).fail(function () {
                $('#matchesResultDiv').html('<span class="redText">The KnetMiner server is currently offline. Please try again later.</span>');
            });
        } else {
            $('#matchesResultDiv').html('');
        }
    }
}

/*
 * Function to get the network of all "genes" related to a given evidence
 * 
 */
function evidencePath(id, genes) {
	
    var params = {keyword: id};
    if (genes.length > 0) {
        params.list = genes;
    }
	
    // Generate the Network in KnetMaps.
    generateCyJSNetwork(api_url + '/evidencePath', params);
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
        // with and without keyword search modes (old)
      /*  $('#without').click(function () {
            $('.with_keyword_search').hide();
            $('.without_keyword_search').show();
        //    if ($('#region_search').attr('src') === 'html/image/expand.gif') {
        //        $('#region_search').trigger('click');
        //    }
            if ($('#advanced_search').attr('src') === 'html/image/expand.gif') {
                $('#advanced_search').trigger('click');
            }
            $('.keywordsSubmit').removeAttr("disabled");
            $("#keywords").val('');
            $('.loadingDiv').html('');
        });
        $('#with').click(function () {
            $('.with_keyword_search').show();
            $('.without_keyword_search').hide();
            $('.keywordsSubmit').attr("disabled");
            $("#keywords").val('');
            $('.loadingDiv').html('');
        }); */
		
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
		/*  $("#suggestor_search").dialog({
			  autoOpen: false,
			  show: {
				  effect: "blind",
				  duration: 1000
				 },
			  hide: {
				  effect: "explode",
				  duration: 1000
				 }
			});

		  $("#qs_opener").click(function() {
			  $("#suggestor_search").dialog( "open" );
			});*/
			
        // Advanced search (gene list)
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
        //Match counter
        //$("#keywords").keyup(matchCounter());
		
		// display keyword search box, by default
		//if ($('#kwd_search').attr('src') === 'html/image/expand.gif') {
	//		$('#kwd_search').trigger('click');
         //  }
		 // hide query suggestor icon
		// $('#suggestor_search').css('display', 'none');
		// display gene list search, by default
		//if ($('#advanced_search').attr('src') === 'html/image/expand.gif') {
		//	$('#advanced_search').trigger('click');
         //  }
		
		// to make the Query suggestor draggable via interactJS; DISABLED
	/*	var element= document.getElementById('suggestor_search_div'), 
		x = 0, y = 0;
		interact(element)
		.draggable({
			snap: {
				targets: [ interact.createSnapGrid({ x: 30, y: 30 }) ],
				range: Infinity,
				relativePoints: [ { x: 0, y: 0 } ]
			},
			inertia: true,
			restrict: {
				restriction: document.getElementById('content'), //element.parentNode
				elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
				endOnly: true
			}
		})
		.on('dragmove', function (event) {
			x += event.dx;
			y += event.dy;
			
			event.target.style.webkitTransform =
			event.target.style.transform =
			'translate(' + x + 'px, ' + y + 'px)';
		}); */

        // Tooltip
        var sampleQueryButtons = "";//"<strong>Example queries</strong>";

        $.ajax({
            type: 'GET',
            url: "html/data/sampleQuery.xml",
            dataType: "xml",
            cache: false, //force cache off
            success: function (sampleQuery) {

                // Parse the values from the recieved sampleQueries.xml file into an object.
                var sampleQueries = new Array();	//object to hold parsed xml data
                $("query", sampleQuery).each(function () {	//for each different Query
                    var tempXML = new Array();
                    tempXML["name"] = $("name", this).text();
                    tempXML["desciption"] = $("description", this).text();
                    tempXML["term"] = $("term", this).text();
                    tempXML["withinRegion"] = $("withinRegion", this).text();
                    var regions = Array();
                    $("region", this).each(function () {
                        regions.push({
                            chromosome: $("chromosome", this).text(),
                            start: $("start", this).text(),
                            end: $("end", this).text(),
                            label: $("label", this).text()
                        });
                    });
                    tempXML["regions"] = regions;

                    tempXML["mapGLWithoutRestriction"] = $("mapGLWithoutRestriction", this).text();

                    var genes = Array();
                    $("gene", this).each(function () {
                        genes.push($(this).text());
                    });
                    tempXML["genes"] = genes;
                    sampleQueries.push(tempXML);
                });

                /*
                 * Object structure for parsed XML data
                 *
                 * sampleQueries[] 			= array of all queries parsed from sampleQuery.xml
                 * 		> name				= STRING - Name of the example query
                 * 		> description		= STRING - short description of the example query
                 * 		> term 				= STRING - Query Search Terms -
                 * 		> withinRegion 		= BOOLEAN - TRUE = Search within QTL region / FALSE = search whole genome -
                 * 		> region[] 			= ARRAY - qtl regions
                 * 			> chromosome 	= STRING ( chromosome name )
                 * 			> start		 	= NUMBER - region start
                 * 			> end		 	= NUMBER - region end
                 * 			> label		 	= STRING - region label
                 * 		> mapGLWithoutRestriction 	= BOOLEAN - TRUE = map gene list to results / FALSE = map gene list without restrictions
                 * 		> genes[]			= ARRAY of STRINGS - each string is an individual gene.
                 *
                 */

                // Create a string of html with a button for each of the example queries.
                for (i = 0; i < sampleQueries.length; i++) {
                    desc = "";
                    if (sampleQueries[i].desciption) {
                        desc = " - " + sampleQueries[i].desciption;
                    }
                    sampleQueryButtons += "</br><a href:'javascript;' class='exampleQuery' id='exampleQuery" + i + "'>" + sampleQueries[i].name + "</button></a>" + desc;
                }
                // add example queries to page
                $('#eg_queries').html(sampleQueryButtons);

                // set an event handler to populate the search fields when one of the example queries is clicked
                $('body').on('click', '.exampleQuery', function () {
                    //$('#with').trigger('click');
                    sampleNum = $(this)[0].id.replace('exampleQuery', '');
                    // display keyword search box
		            if($('#kwd_search').attr('src') === 'html/image/expand.gif') {
		               $('#kwd_search').trigger('click');
		              }
                    $("#keywords").val(sampleQueries[sampleNum].term);
                    var numRegions = sampleQueries[sampleNum].regions.length;


                    if (trim(sampleQueries[sampleNum].withinRegion) == 'true') {
                        $("input:radio[name=search_mode]").val(['qtl']);
                    } else {
                        $("input:radio[name=search_mode]").val(['genome']);
                    }

                    if (numRegions > 0) {
                        while (!$("#chr" + numRegions).length) { //while if the last row for which we have data, doesn't exist add one
                            $("#addRow").click();
                        }
                        while ($("#chr" + (numRegions + 1)).length) {	//while the row after the last one for which we have data exists remove one.
                            $("#removeRow").click();
                        }

                        if ($("#region_search_area").is(":hidden")) {
                            $("#region_search").click();
                        }

                        //loop through all regions and fill in the QTL region rows
                        for (i = 0; i < numRegions; i++) {
                            var num = i + 1;
                            $("#chr" + num).val(sampleQueries[sampleNum].regions[i].chromosome);
                            $("#start" + num).val(sampleQueries[sampleNum].regions[i].start);
                            $("#end" + num).val(sampleQueries[sampleNum].regions[i].end);
                            $("#label" + num).val(sampleQueries[sampleNum].regions[i].label);
                            $("#genes" + num).focus();	//forces Genes counter column to update
                        }
                    } else {
                        while ($("#chr2").length) {	//while there is more than 1 row remove one.
                            $("#removeRow").click();
                        }

                        $("#chr1").attr('selectedIndex', 0);
                        $("#start1").val("");
                        $("#end1").val("");
                        $("#label1").val("");
                        $("#genes1").focus();

                        if ($("#region_search_area").is(":visible")) {
                            $("#region_search").click();
                        }
                    }

                    if (trim(sampleQueries[sampleNum].mapGLWithoutRestriction) == 'true') {
                        $("input:radio[name=list_mode]").val(['GL']);
                    } else {
                        $("input:radio[name=list_mode]").val(['GLrestrict']);
                    }

                    //console.log("sampleQueries[sampleNum].genes.length= "+ sampleQueries[sampleNum].genes.length);
                    if (sampleQueries[sampleNum].genes.length > 0) {
                        if ($("#advanced_search_area").is(":hidden")) {
                            $("#advanced_search").click();
                        }
                        var genesText = "";
                        for (gene = 0; gene < sampleQueries[sampleNum].genes.length; gene++) {
                            genesText += sampleQueries[sampleNum].genes[gene] + "\n";
                        }
                        $("#list_of_genes").val(genesText);
                    } else {
                        $("#list_of_genes").val("");
                        if ($("#advanced_search_area").is(":visible")) {
                            $("#advanced_search").click();
                        }
                    }

                    matchCounter(); // updates number of matched documents and genes counter

                    // Refresh the Query Suggester, if it's already open.
                    if ($('#suggestor_search').attr('src') == "html/image/qs_collapse.png") {
                        refreshQuerySuggester();
                    }
                });
            }
        });

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


function refreshQuerySuggester() {
    $('#suggestor_terms').html('');
    // Create the Synonym table.
    var searchMode = "synonyms";
    var keyword = $('#keywords').val();
    var request = "/" + searchMode + "?keyword=" + keyword;
    var url = api_url + request;
    $.get(url, '').done(function (data) {
        createSynonymTable(data.synonyms);
    }).fail(function () {
        var table = "No suggestions found";
        $('#suggestor_terms').html(" ");
        $('#suggestor_tables').html(table);
    });
}

/*
 * Function to search KnetMiner & update Map View, Gene View and Evidence View
 */
function searchKeyword() {
    //var searchMode = getRadioValue(document.gviewerForm.search_mode);
    var searchMode="genome"; // default

    /*var withoutKeywordMode = $('#without').prop('checked');
    if (withoutKeywordMode) {
        $('#keywords').val('');  // to make sure we don't accidentally include any
    }*/

    var listMode = 'GL'; // getRadioValue(document.gviewerForm.list_mode);
    // search keyword provided
    var keyword = trim($("#keywords").val());
    // gene list provided
    var list = $("#list_of_genes").val().split('\n');
    for (var i = 0; i < list.length; i++) { // remove empty lines
        if (!list[i].trim()) {
            list.splice(i, 1);
            i--;
        }
    }
    // remove spaces in each geneList entry
    list= list.map(s => s.trim());
    
	var geneList_size= list.length;
	//console.log("geneList_size= "+ geneList_size);

    // requestParams
    var requestParams = {};
    requestParams['keyword'] = keyword;
    if (list.length > 0) {
        requestParams['list'] = list;
        requestParams['listMode'] = listMode;
    }

    // qtl regions provided
    var regions = document.getElementById('regions_table').rows.length - 2;
    var counter = 1;
    requestParams['qtl'] = [];
    for (i = 1; i <= regions; i++) {
        var chr = $("#chr" + i + " option:selected").val();
        var start = trim($("#start" + i).val());
        var end = trim($("#end" + i).val());
        var label = trim($("#label" + i).val());

        if (chr.length > 0 && start.length > 0 && end.length > 0 && parseInt(start) < parseInt(end)) {
            requestParams['qtl'].push("&qtl" + counter + "=" + chr + ":" + start + ":" + end + ":" + label);
            counter++;
        }
    }
    // if a region is provided, set searchMode to "qtl" (to focus only on that region)
    if(counter > 1) { searchMode="qtl"; }
    // if a gene list is provided, use "genome" searchMode
    if(geneList_size > 0) { searchMode="genome"; }
    
	// api request
    var request = "/" + searchMode;
	//console.log("api_url/request= "+ api_url + request);
	
  /*  if (keyword.length < 2 && list.length == 0) {
        $(".loadingDiv").replaceWith('<div class="loadingDiv"><b>Please provide a search keyword or gene list.</b></div>');
    }*/
   /* else*/ if (list.length > 100) {
        $(".loadingDiv").replaceWith('<div class="loadingDiv"><b>The free version of KnetMiner is limited to 100 genes.</b></div>');
    }
    else {
        $('#tabviewer').show(); // show Tab buttons and viewer
		
        //$(".loadingDiv").replaceWith('<div class="loadingDiv"><img src="html/image/spinner.gif" alt="Loading, please wait..." /></div>');
		// Show loading spinner on 'search' div
		activateSpinner("#search");
		//console.log("search>> start spinner...");
		
		//console.log("requestParams:");
		//console.dir(requestParams);
        $.post({
            url: api_url + request,
            timeout: 1000000,
            headers: {
                "Accept": "application/json; charset=utf-8",
                "Content-Type": "application/json; charset=utf-8"
            },
            datatype: "json",
            data: JSON.stringify(requestParams)
        })
            .fail(function (errorlog) {
                alert("An error has ocurred " + errorlog);
				// Remove loading spinner from 'search' div
				deactivateSpinner("#search");
				//console.log("search>> error >> remove spinner...");
            })
            .success(function (data) {
                $(".loadingDiv").replaceWith('<div class="loadingDiv"></div>');
                if (data.geneCount == 0) {
                    var genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">Sorry, no results were found.</span><br /><span class="pGViewer_title_line">Make sure that all words are spelled correctly. Otherwise try a different or more general query.</span></div>'

                    if (typeof gviewer != "undefined" && gviewer != false) {

                        var longestChromosomeLength = "";
                        if (typeof longest_chr != "undefined") {
                            if (longest_chr != null) {
                                longestChromosomeLength = "&longestChromosomeLength=" + longest_chr;
                            }
                        }

                        //Collapse Suggestor view
                        $('#suggestor_search').attr('src', 'html/image/qs_expand.png');
                        $('#suggestor_search_area').slideUp(500);
						//$('#suggestor_search').dialog('close');
                    }

                    $("#pGViewer_title").replaceWith(genomicViewTitle);


                    activateButton('resultsTable');
                    document.getElementById('resultsTable').innerHTML = "";
                    document.getElementById('evidenceTable').innerHTML = "";
                    document.getElementById('NetworkCanvas').innerHTML = "";

                }
                else {
                    // For a valid response
                    var candidateGenes = data.geneCount;
                    var docSize = data.docSize;
                    var totalDocSize = data.totalDocSize;
                    var results = data.geneCount;

                    var longestChromosomeLength = "";
                    if (typeof longest_chr != "undefined") {
                        if (longest_chr != null) {
                            longestChromosomeLength = "&longestChromosomeLength=" + longest_chr;
                        }
                    }

                    var genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + results + ' genes</b> were found.</span><br /><span class="pGViewer_title_line">Query was found in <b>' + docSize + ' documents</b> related with genes (' + totalDocSize + ' documents in total)</span></div>'
                    if (candidateGenes > 1000) {
                        candidateGenes = 1000;
                        genomicViewTitle = '<div id="pGViewer_title"><span class="pGViewer_title_line">In total <b>' + results + ' genes</b> were found. Top 1000 genes are displayed in Map view.</span><br /><span class="pGViewer_title_line">Query was found in <b>' + docSize + ' documents</b> related with genes (' + totalDocSize + ' documents in total)</span></div>';
                    }

                    $("#pGViewer_title").replaceWith(genomicViewTitle);
                    // Setup the mapview component
                    var annotationsMap = data.gviewer;

                    // create new basemap with bands for genes and pass it as well to the Map Viewer.
                    genemap.drawFromRawAnnotationXML('#genemap', 'html/data/basemap.xml', annotationsMap);

                    //Collapse Suggestor view
                    $('#suggestor_search').attr('src', 'html/image/qs_expand.png');
                    $('#suggestor_search_area').slideUp(500);
					//$('#suggestor_search').dialog('close');


                    activateButton('resultsTable');
                    createGenesTable(data.geneTable, keyword, candidateGenes);
                    createEvidenceTable(data.evidenceTable, keyword);
					// show linked/unlinked genes checkboxes only if a gene list was provided by the user
                    if(geneList_size > 0) {
                       $('#selectUser').show();
                      }
                      else { $('#selectUser').hide(); }
                }
			 // Remove loading spinner from 'search' div
			 deactivateSpinner("#search");
			 //console.log("search: success; remove spinner...");
            });
    }
}

/*
 * Function
 * Generates the network using KnetMaps
 * @author: Ajit Singh.
 */
function generateCyJSNetwork(url, requestParams) {
    // Preloader for KnetMaps
    $("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>Loading Network, please wait...</b></div>');
    $("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div"><b>Loading Network, please wait...</b></div>');
    
    // Show loading spinner on 'tabviewer' div
    activateSpinner("#tabviewer");
    //console.log("network: start spinner...");
        
    $.post({
        url: url,
        timeout: 1000000,
        headers: {
            "Accept": "application/json; charset=utf-8",
            "Content-Type": "application/json; charset=utf-8"
        },
        datatype: "json",
        data: JSON.stringify(requestParams),
        beforeSend: deactivateSpinner("#tabviewer")
    }).fail(function (errorlog) {
			alert("An error has ocurred..." + errorlog);
		//	deactivateSpinner("#tabviewer");
        }).success(function (data) {
			// Remove loading spinner from 'tabviewer' div
		//	deactivateSpinner("#tabviewer");
			/* $.when(deactivateSpinner("#tabviewer")).done(function() { activateButton('NetworkCanvas'); }); */
				// Network graph: JSON file.
				try {
					activateButton('NetworkCanvas');
                                        
                                        // new Save button in Network View - intialise a click-to-save button with networkId (null when inside knetminer)
                                        var networkId= null;
                                        $('#knetSaveButton').html("<button id='saveJSON' class='btn knet_button' style='float:right;width:115px;' onclick='exportAsJson("+networkId+","+JSON.stringify(requestParams)+");' title='Save the knetwork to knetspace'>Save Knetwork</button>");
                                        
                                        if(data.graph.includes("var graphJSON=")) { // for old/current json that contains 2 JS vars
                                           knetmaps.drawRaw('#knet-maps', data.graph/*, networkId*/);
                                          }
                                        else { // response contents (pure JSON).
                                          var eles_jsons= data.graph.graphJSON.elements;
                                          var eles_styles= data.graph.graphJSON.style;
                                          var metadata_json= data.graph.allGraphData;
                                          knetmaps.draw('#knet-maps', eles_jsons, metadata_json, eles_styles/*, networkId*/);
                                        }
					// Remove the preloader message in Gene View, for the Network Viewer
					$("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"></div>');
					$("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div"></div>');
				   }
				catch (err) {
					var errorMsg = err.stack + ":::" + err.name + ":::" + err.message;
					console.log(errorMsg);
					//$("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div">' + "Error: <br/>" + "Details: " + errorMsg + '</div>');
				   }
        });
}

/*
 * Function
 * Generates multi gene network in KnetMaps
 * @author: Ajit Singh.
 */
function generateMultiGeneNetwork_forNewNetworkViewer(keyword) {
    var candidatelist = [];
    //var cb_list = document.checkbox_form.candidates;
    var cb_list = $("input[name=candidates");
    var cb_list_len = cb_list.length;
    for (var i = 0; i < cb_list_len; i++) {
        if (cb_list[i].checked) {
            candidatelist.push(cb_list[i].value);
        }
    }
    //console.log(candidatelist.length +" gene(s) selected.");
    if (candidatelist == "") {
        $("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>Please select candidate genes.</b></div>');
    }
    else if (candidatelist.length > 20) {
        $("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>The free version of KnetMiner is limited to 20 genes.</b></div>');
    }
    else {
        generateCyJSNetwork(api_url + '/network', {keyword: keyword, list: candidatelist});
    }
}

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
 *
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
 * Function
 *
 */
function createGenesTable(text, keyword, rows) {
    var table = "";
    var candidate_genes = text.split("\n");
    var results = candidate_genes.length - 2;

    if (candidate_genes.length > 2) {
        table = '';
        // Gene View: interactive summary legend for evidence types.
        var interactive_summary_Legend = getInteractiveSummaryLegend(text);
        var utf8Bytes = "";
        utf8Bytes = encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
          });

        table = table + '<p class="margin_left"><a download="genes.tsv" href="data:application/octet-stream;base64,' + btoa(utf8Bytes) + '" target="_blank">Download as TAB delimited file</a><br />';
        table = table + 'Select gene(s) and click "View Network" button to see the network.<span id="hintSortableTable" class="hint hint-small" ></span></p>';
        table = table + '<form name="checkbox_form">';
        table = table + '<u>Max</u> number of genes to show: ';
        table = table + '<select value="' + /*rows*/results + '" id="numGenes">';
        table = table + '<option value="1000"' + (rows == 1000 ? 'selected' : '') + '>1000</option>';
        table = table + '<option value="500"' + (rows == 500 ? 'selected' : '') + '>500</option>';
        table = table + '<option value="200"' + (rows == 200 ? 'selected' : '') + '>200</option>';
        table = table + '<option value="100"' + (rows == 100 ? 'selected' : '') + '>100</option>';
        table = table + '<option value="50"' + (rows == 50 ? 'selected' : '') + '>50</option>';
        table = table + '<option value="' + results + '"' + (rows == results ? 'selected' : '') + '>All (' + results + ')</option>';
        table = table + '<select>';
        table = table + '<div id="selectUser">Linked genes:<input type="checkbox" name="checkbox_Targets" value="checkbox_Known" title="Click to select genes with existing evidence." /> Unlinked genes:<input type="checkbox" name="checkbox_Targets" value="checkbox_Novel" title="Click to select genes without existing evidence." />' +
            '<div id="selectedGenesCount"><span style="color:#51CE7B; font-size: 14px;">No gene(s) selected</span></div>' + '</div>';
        table = table + '<br>';
        // dynamic Evidence Summary to be displayed above Gene View table
        table = table + '<div id="evidence_Summary_Legend" class="evidenceSummary">' + interactive_summary_Legend + '</div>';

        table = table + '<div id= "geneViewTable" class = "scrollTable">';
        table = table + '<table id = "tablesorter" class="tablesorter">';
        table = table + '<thead>';
        table = table + '<tr>';
        var values = candidate_genes[0].split("\t");
        table = table + '<th width="100">' + values[1] + '</th>';
        table = table + '<th width="100" title="Show ' + values[2] + ', if not same as ' + values[1] + '">' + values[2] + '</th>'; // added Gene Name to Gene View table
        if (multiorganisms == true) {
            table = table + '<th width="60">' + values[5] + '</th>';
        }
        if (reference_genome == true) {
            table = table + '<th width="60">' + values[3] + '</th>';
            table = table + '<th width="70">' + values[4] + '</th>';
        }
        table = table + '<th width="220">' + values[9] + '</th>';
        table = table + '<th width="70">Select</th>';
        table = table + '</tr>';
        table = table + '</thead>';
        table = table + '<tbody class="scrollTable">';
        //console.log("GeneView: display " + rows + " (from " + results + ") results.");

        //this loop iterates over the full table and prints the
        //first n rows + the user provided genes
        //can be slow for large number of genes, alternatively server
        //can filter and provide smaller file for display
        for (var i = 1; i <= results; i++) {
            var values = candidate_genes[i].split("\t");

            if (i > rows /*&& values[7]=="no"*/) {
                continue;
            }
            table = table + '<tr>';
            var gene_Acc = values[1];
            gene_Acc = gene_Acc.toUpperCase(); // always display gene ACCESSION in uppercase
            var gene_Name = values[2]; // display both accession & gene name.
            // Fetch preferred concept (gene) name and use the shorter name out of the two.
            var gene = '<td><a href = "javascript:;" class="viewGeneNetwork" title="Display network in KnetMaps" id="viewGeneNetwork_' + i + '">' + gene_Acc + '</a></td>';
            var geneName = '<td>' + gene_Name + '</td>'; // geneName
            if (gene_Name.toLowerCase() === gene_Acc.toLowerCase()) {
                geneName = '<td></td>'; // don't display geneName, if identical to Accession
            }

            if (multiorganisms == true) {
                var taxid = '<td><a href="http://www.uniprot.org/taxonomy/' + values[5] + '" target="_blank">' + values[5] + '</a></td>';
            } else {
                var taxid = '';
            }
            if (reference_genome == true) {
                var chr = '<td>' + values[3] + '</td>';
                var start = '<td>' + values[4] + '</td>';
            } else {
                var chr = '';
                var start = '';
            }
            var score = '<td>' + values[6] + '</td>'; // score

            // QTL column with information box
            if (reference_genome == true) {
                var withinQTL = '<td>';
                if (values[8].length > 1) {
                    var withinQTLs = values[8].split("||");
                    //Shows the icons
                    withinQTL = '<td><div class="qtl_item qtl_item_' + withinQTLs.length + '" title="' + withinQTLs.length + ' QTLs"><a href"javascript:;" class="dropdown_box_open" id="qtl_box_open_' + values[1].replace(".", "_") + withinQTLs.length + '">' + withinQTLs.length + '</a>';

                    //Builds the evidence box
                    withinQTL = withinQTL + '<div id="qtl_box_' + values[1].replace(".", "_") + withinQTLs.length + '" class="qtl_box"><span class="dropdown_box_close" id="qtl_box_close_' + values[1].replace(".", "_") + withinQTLs.length + '"></span>';
                    withinQTL = withinQTL + '<p><span>' + "QTLs" + '</span></p>';

                    var uniqueQTLs = new Object();
                    var uniqueTraits = new Object();

                    for (var count_i = 0; count_i < withinQTLs.length; count_i++) {
                        var withinQTL_elements = withinQTLs[count_i].split("//");
                        if (withinQTL_elements[1].length > 0) {
                            if (uniqueTraits[withinQTL_elements[1]] == null)
                                uniqueTraits[withinQTL_elements[1]] = 1;
                            else
                                uniqueTraits[withinQTL_elements[1]] = uniqueTraits[withinQTL_elements[1]] + 1;
                        }
                        else {
                            if (uniqueQTLs[withinQTL_elements[0]] == null)
                                uniqueQTLs[withinQTL_elements[0]] = 1;
                            else
                                uniqueQTLs[withinQTL_elements[0]] = uniqueQTLs[withinQTL_elements[0]] + 1;
                        }
                    }

                    var unique = "";
                    for (var count_i = 0; count_i < withinQTLs.length; count_i++) {
                        var withinQTL_elements = withinQTLs[count_i].split("//");
                        if (withinQTL_elements[1].length > 0) {
                            if (unique.indexOf(withinQTL_elements[1] + ";") == -1) {
                                unique = unique + withinQTL_elements[1] + ";";
                                withinQTL = withinQTL + '<p>' + uniqueTraits[withinQTL_elements[1]] + ' ' + withinQTL_elements[1] + '</p>';
                            }
                        }
                        else {
                            if (unique.indexOf(withinQTL_elements[0] + ";") == -1) {
                                unique = unique + withinQTL_elements[0] + ";";
                                withinQTL = withinQTL + '<p>' + uniqueQTLs[withinQTL_elements[0]] + ' ' + withinQTL_elements[0] + '</p>';
                            }
                        }
                    }
                }
                else {
                    withinQTL = withinQTL + '0';
                }
                withinQTL = withinQTL + '</td>';
            }
            else {
                var withinQTL = '';
            }

            // For each evidence show the images - start
            var evidence = '<td>';
            var values_evidence = values[9];
            if (values_evidence.length > 0) {
				var evidences = values_evidence.split("||");
                for (var count_i = 0; count_i < evidences.length; count_i++) {
                    //Shows the icons
                    //var evidence_elements = evidences[count_i].split("//");
                    var evidence_elements = evidences[count_i].split("__");
					var evidence_cc= evidence_elements[0];
					var evidence_size= evidence_elements[1];
					var evidences_nodes= evidence_elements[2].split("//");
					//console.log("evidence_cc: "+ evidence_cc);
                    evidence = evidence + '<div class="evidence_item evidence_item_' + evidence_cc + '" title="' + evidence_cc + '" ><span class="dropdown_box_open" id="evidence_box_open_' + values[1].replace(".", "_") + evidence_cc + '">' + evidence_size + '</span>';
                    //Builds the evidence box
                    evidence = evidence + '<div id="evidence_box_' + values[1].replace(".", "_") + evidence_cc + '" class="evidence_box"><span class="dropdown_box_close" id=evidence_box_close_' + values[1].replace(".", "_") + evidence_cc + '></span>';
                    evidence = evidence + '<p><div class="evidence_item evidence_item_' + evidence_cc + '"></div> <span>' + evidence_cc + '</span></p>';
                    for (var count_eb = 0; count_eb < evidences_nodes.length; count_eb++) {
                        //link publications with pubmed
                        pubmedurl = 'http://www.ncbi.nlm.nih.gov/pubmed/?term=';
                        if (evidence_cc == 'Publication')
                            evidenceValue = '<a href="' + pubmedurl + evidences_nodes[count_eb].substring(5) + '" target="_blank">' + evidences_nodes[count_eb] + '</a>';
                        else
                            evidenceValue = evidences_nodes[count_eb];

                        evidence = evidence + '<p>' + evidenceValue + '</p>';
                    }
                    evidence = evidence + '</div>';
                    evidence = evidence + '</div>';
                }
            }
            evidence = evidence + '</td>';
            // Foreach evidence show the images - end

            var select = '<td><input id="checkboxGene_' + i + '" type="checkbox" name= "candidates" value="' + values[1] + '"></td>';
            table = table + gene + geneName + taxid + chr + start + /*score + /*usersList +*/ /*withinQTL +*/ evidence + select; // hide score & QTL for now (18/07/18)
            table = table + '</tr>';
        }
        table = table + '</tbody>';
        table = table + '</table></div>';
        table = table + '</form>';
    }

    //table = table + '<div id="networkButton"><input id="new_generateMultiGeneNetworkButton" class="knet_button button" type="button" value="View Network" title="Display the network in KnetMaps">';
    table = table + '<div id="networkButton"><button id="new_generateMultiGeneNetworkButton" class="btn knet_button" title="Display the network in KnetMaps">View Network</button>';
    table = table + '</insert><div id="loadingNetworkDiv"></div></div>';

    document.getElementById('resultsTable').innerHTML = table;
	// scroll down to geneTable, but show tabviewer_buttons above
	document.getElementById('pGViewer_title').scrollIntoView();

    /*
     * click Handler for viewing a network.
     */
    $(".viewGeneNetwork").bind("click", {x: candidate_genes}, function (e) {
        e.preventDefault();
        var geneNum = $(e.target).attr("id").replace("viewGeneNetwork_", "");
        var values = e.data.x[geneNum].split("\t");
		
        // Generate Network in KnetMaps.
        generateCyJSNetwork(api_url + '/network', {list: [values[1]], keyword: keyword});
    });

    /*
     * click handlers for opening and closing the qtl and evidence column drop down boxes.
     */
    $(".dropdown_box_open").click(function (e) {
        e.preventDefault();
        var targetname = $(e.target).attr("id").replace("open_", "");
        $("#" + targetname).slideDown(300);
    });

    $(".dropdown_box_close").click(function (e) {
        e.preventDefault();
        var targetname = $(e.target).attr("id").replace("close_", "");
        $("#" + targetname).slideUp(100);
    });

    $("#new_generateMultiGeneNetworkButton").click(function (e) {
        generateMultiGeneNetwork_forNewNetworkViewer(keyword);
    });

    $("#tablesorter").tablesorter({
        headers: {
            // do not sort "select" column
            /*  5: {sorter:"digit"},*/
            4: {sorter: "digit"}, /* sort by SCORE column by default */
            8: {sorter: false}
        }
    });

    $("#numGenes").change(function (e) {
        createGenesTable(text, keyword, $("#numGenes").val());	//if number of genes to show changes, redraw table.
    });

    /*
     * Revert Evidence Filtering changes on Gene View table
     */
    $("#revertGeneView").click(function (e) {
        createGenesTable(text, keyword, $("#numGenes").val()); // redraw table
    });

    $("#revertGeneView").mouseenter(function (e) {
        $("#revertGeneView").removeClass('unhover').addClass('hover');
    });

    $("#revertGeneView").mouseout(function (e) {
        $("#revertGeneView").removeClass('hover').addClass('unhover');
    });

    /*
     * Select all KNOWN targets: find all targets with existing Evidence & check them.
     * Select all NOVEL targets: find all targets with no Evidence & check them.
     */
    $('input:checkbox[name="checkbox_Targets"]').bind("click", {x: candidate_genes}, function (e) {
        var numResults = candidate_genes.length - 2;
        for (var i = 1; i <= numResults; i++) {
            var values = e.data.x[i].split("\t");
            if (values[7] === "yes") {
                // Check which checkbox button option was selected.
                if ($(this).val() === "checkbox_Known") { // Select Known Targets.
                    if (values[9].length > 0) {
                        $("#checkboxGene_" + i).prop('checked', $(this).prop('checked'));
                    }
                }
                else if ($(this).val() === "checkbox_Novel") { // Select Novel Targets.
                    if (values[9].length === 0) {
                        $("#checkboxGene_" + i).prop('checked', $(this).prop('checked'));
                    }
                }
            }
        }
        // update selected genes count
        updateSelectedGenesCount();
    });

    // bind click event on all candidate_genes checkboxes in Gene View table.
    $('input:checkbox[name="candidates"]').click(function (e) {
        updateSelectedGenesCount(); // update selected genes count
    });
}

/*
 * Function
 *
 */
function containsKey(keyToTest, array) {
    result = false;
    for (key in array) {
        if (key == keyToTest) {
            result = true;
        }
    }
    return result;
}

// update selected genes count whenever a Gene View table entry is clicked or Known/ Novel targets options are selected.
function updateSelectedGenesCount() {
    var count = $('input:checkbox[name="candidates"]:checked').length;
    $('#selectedGenesCount span').text(count + ' gene(s) selected'); // update
}

/*
 * Function
 *
 */
function createEvidenceTable(text, keyword) {
    var table = "";
    var summaryArr = new Array();
    var summaryText = '';
    $('#evidenceTable').html("<p>No evidence found.</p>");
    var evidenceTable = text.split("\n");
    if (evidenceTable.length > 2) {
        // Evidence View: interactive legend for evidences.
        var evi_legend= getEvidencesLegend(text);
        
        table = '';
        table = table + '<p></p>';
        //table = table + '<div id="evidenceSummary1" class="evidenceSummary" title="Click to filter by type"></div>';
        // display dynamic Evidence Summary legend above Evidence View.
        table = table + '<div id="evidences_Legend" class="evidenceSummary">' + evi_legend + '</div>';
        table = table + '<div id= "evidenceViewTable" class = "scrollTable">';
        table = table + '<table id="tablesorterEvidence" class="tablesorter">';
        table = table + '<thead>';
        table = table + '<tr>';
        var header = evidenceTable[0].split("\t");
        table = table + '<th width="60">Exclude</th>';
        table = table + '<th width="50">' + header[0] + '</th>';
        table = table + '<th width="212">DESCRIPTION</th>';
        table = table + '<th width="78">LUCENE ' + header[2] + '</th>';
        table = table + '<th width="78">' + header[3] + '</th>';
        table = table + '<th width="70">TOTAL ' + header[4] + '</th>';
        table = table + '<th width="103">' + header[5] + '</th>';
        table = table + '</tr>';
        table = table + '</thead>';
        table = table + '<tbody class="scrollTable">';
        for (var ev_i = 1; ev_i < (evidenceTable.length - 1); ev_i++) {
            values = evidenceTable[ev_i].split("\t");
            table = table + '<tr>';
            table = table + '<td><div id="evidence_exclude_' + ev_i + '" class="excludeKeyword evidenceTableExcludeKeyword" title="Exclude term"></div></td>';

            //link publications with pubmed
            pubmedurl = 'http://www.ncbi.nlm.nih.gov/pubmed/?term=';
            if (values[0] == 'Publication')
                evidenceValue = '<a href="' + pubmedurl + values[1].substring(5) + '" target="_blank">' + values[1] + '</a>';
            else
                evidenceValue = values[1];

            table = table + '<td type-sort-value="' + values[0] + '"><div class="evidence_item evidence_item_' + values[0] + '" title="' + values[0] + '"></div></td>';
            table = table + '<td>' + evidenceValue + '</td>';
            table = table + '<td>' + values[2] + '</td>';
            table = table + '<td>' + values[3] + '</td>';

            // all genes
            if(values[4] < 500) {
                table = table + '<td><a href="javascript:;" class="generateEvidencePath" title="Display in KnetMaps" id="generateEvidencePath_' + ev_i + '">' + values[4] + '</a></td>'; // all genes
               }
            else {
                table = table + '<td>' + values[4] + '</td>';
            }


            // For user genes, add option to visualize their Networks in KnetMaps via web services (api_url)
            var userGenes = 0;
            if (values[5].length > 0) {
                userGenes = 1; // i.e., min. 1 user gene found
                values[5] = values[5].trim();
                if (values[5].includes(",")) { // for multiple user genes
                    userGenes = values[5].split(",").length; // total user genes found
                }
                // launch evidence network using 'userGenes'.
                if(userGenes < 500) {
                    table = table + '<td><a href="javascript:;" class="userGenes_evidenceNetwork" title="Display in KnetMaps" id="userGenes_evidenceNetwork_' + ev_i + '">' + userGenes + '</a></td>';
                  }
                else {
                    table = table + '<td>' + userGenes + '</td>'; // user genes
                }
            }
            else {
                userGenes = 0;
                table = table + '<td>' + userGenes + '</td>'; // zero user genes
            }

            table = table + '</tr>';
            //Calculates the summary box; OLD
          /*  if (containsKey(values[0], summaryArr)) {
                summaryArr[values[0]] = summaryArr[values[0]] + 1;
            } else {
                summaryArr[values[0]] = 1;
            }*/
        }
        table = table + '</tbody>';
        table = table + '</table>';
        table = table + '</div>';
        // Insert a preloader to be used for KnetMaps
        table = table + '<div id="loadingNetwork_Div"></div>';

        $('#evidenceTable').html(table);

        $(".evidenceTableExcludeKeyword").bind("click", {x: evidenceTable}, function (e) {
            e.preventDefault();
            var targetID = $(e.target).attr("id");
            var evidenceNum = targetID.replace("evidence_exclude_", "");
            var values = e.data.x[evidenceNum].split("\t");

            if ($(e.target).hasClass("excludeKeyword")) {
                excludeKeyword('ConceptID:' + values[7], targetID, 'keywords');
            } else {
                excludeKeywordUndo('ConceptID:' + values[7], targetID, 'keywords');
            }
        });

        /*
         * click handler for generating the evidence path network
         */
        $(".generateEvidencePath").bind("click", {x: evidenceTable}, function (e) {
            e.preventDefault();
            var evidenceNum = $(e.target).attr("id").replace("generateEvidencePath_", "");
            var values = e.data.x[evidenceNum].split("\t");
            evidencePath(values[7], []);
        });

        /*
         * click handler for generating the evidence path network for user genes (using user_genes and search keywords, passed to api_url
                * @author: Ajit Singh (19/07/2018)
         */
        $(".userGenes_evidenceNetwork").bind("click", {x: evidenceTable}, function (e) {
            e.preventDefault();
            var evidenceNum = $(e.target).attr("id").replace("userGenes_evidenceNetwork_", "");
            var values = e.data.x[evidenceNum].split("\t");
            var evi_userGenes = values[5].trim(); // user gene(s) provided
            evidencePath(values[7], evi_userGenes.split(","));
        });
        
        $("#tablesorterEvidence").tablesorter({
            // sort by score in descending order if with keywords, or p-value ascending if without keywords
            sortList: [[$('#keywords').val()!=='' ? 3:4, $('#keywords').val()!=='' ? 1:0]],
            textExtraction: function (node) { // Sort TYPE column
                var attr = $(node).attr('type-sort-value');
                if (typeof attr !== 'undefined' && attr !== false) {
                    return attr;
                }
                return $(node).text();
            }
        });

        /*
         * Revert filtering changes on Evidence View table
         */
        $("#revertEvidenceView").click(function (e) {
            createEvidenceTable(text, keyword); // redraw table
        });
        
        $("#revertEvidenceView").mouseenter(function (e) {
            $("#revertEvidenceView").removeClass('unhover').addClass('hover');
        });
        
        $("#revertEvidenceView").mouseout(function (e) {
            $("#revertEvidenceView").removeClass('hover').addClass('unhover');
        });

    /*    //Shows the evidence summary box
        for (key in summaryArr) {
            var contype = key.trim();
            summaryText = summaryText + '<div class="evidenceSummaryItem"><div class="evidence_item evidence_item_' + key + '" onclick=filterEvidenceTableByType("'+contype+'"); title="' + key + '"></div>' + summaryArr[key] + '</div>';
        }
        summaryText = summaryText + '<input id="revertEvidenceView" type="button" value="" class="unhover" title= "Revert all filtering changes">'+'</div>';

        // display dynamic Evidence Summary legend above Evidence View.
        $("#evidenceSummary1").html(summaryText); */
    }
}

/*
 * Function
 *
 */
function createSynonymTable(text) {
    var table = "";
    var summaryArr = new Array();
    var summaryText = '';
    var evidenceTable = text.split("\n");
    var countSynonyms = 0;
    var aSynonyms = new Array();
    var countTerms = 0;
    var termName = "";
    var minRowsInTable = 20/*14*/;
    var nullTerm = false;
    if (evidenceTable.length > 3) {
        terms = '';
        table = '';
        for (var ev_i = 0; ev_i < (evidenceTable.length - 1); ev_i++) {
            if (nullTerm) {
                nullTerm = false;
                continue;
            }
            //End of Term
            if (evidenceTable[ev_i].substr(0, 2) == '</') {
                //Includes the tab box
                table = table + tabsBox + '</div>';
                //Includes the tables
                for (var i = 0; i < aTable.length; i++) {

                    if (aTableLenght[i] < minRowsInTable) {
                        for (var rows = aTableLenght[i]; rows < minRowsInTable; rows++) {
                            aTable[i] = aTable[i] + '<tr><td>&nbsp;</td><td>&nbsp;</td></tr>'
                        }
                    }

                    table = table + aTable[i].replace(/"/g, '') + '</table>';
                }
                //New Term
            } else if (evidenceTable[ev_i][0] == '<') {
                if (evidenceTable[ev_i + 1].substr(0, 2) == '</') {
                    nullTerm = true;
                    continue;
                }
                var aNewConcepts = new Array();
                var aTable = new Array();
                var aTableLenght = new Array();
                var countConcepts = 0;
                countTerms++;

                if (ev_i == 0) {
                    divstyle = "buttonSynonym_on";
                    imgstatus = 'on';
                    tabBoxvisibility = '';
                } else {
                    divstyle = "buttonSynonym_off";
                    imgstatus = 'off';
                    tabBoxvisibility = 'style="display:none;"';
                }
                termName = evidenceTable[ev_i].replace("<", "");
                var originalTermName = termName.replace(">", "");
                termName = originalTermName.replace(/ /g, '_');
                termName = termName.replace(/"/g, '');
                terms = terms + '<div class="' + divstyle + ' synonymTabButton" id="tablesorterSynonym' + termName + '_' + (countConcepts + 1) + '_buttonSynonym"><img src="html/image/synonym_left_' + imgstatus + '.png" class="synonym_left_border" id="tablesorterSynonym' + termName + '_' + (countConcepts + 1) + 'synonym_left_border"/>' + termName.replace(/_/g, " ") + '<img src="html/image/synonym_right_' + imgstatus + '.png" class="synonym_right_border"  id="tablesorterSynonym' + termName + '_' + (countConcepts + 1) + 'synonym_right_border"/></div>';
                tabsBox = '<div class="tabBox" id="tabBox_' + termName + '" ' + tabBoxvisibility + '>';
                //Foreach of Document that belongs to a Term
            } else {
                values = evidenceTable[ev_i].split("\t");
                //Check for duplicated values
                if (aSynonyms.indexOf(values[0]) == -1) {
                    aSynonyms.push(values[0]);
                    countSynonyms++;
                    //If is a new document type for the term a new table is created
                    if (aNewConcepts.indexOf(values[1]) == -1) {
                        aNewConcepts.push(values[1]);
                        conceptIndex = aNewConcepts.indexOf(values[1]);
                        countConcepts++;

                        if ((countTerms == 1) && (countConcepts == 1))
                            tablevisibility = '';
                        else
                            tablevisibility = 'style="display:none;"';

                        tableHeader = '<table id="tablesorterSynonym' + termName + '_' + countConcepts + '" class="suggestorTable" ' + tablevisibility + '>';

                        aTable.push(tableHeader);
                        aTableLenght.push(0);

                        if (countConcepts == 1)
                            conceptTabStyles = 'conceptTabOn';
                        else
                            conceptTabStyles = 'conceptTabOff';

                        if (values[1] == "QTL")
                            tabsBox = tabsBox + '<div class="' + conceptTabStyles + ' showConceptTab" id="tabBoxItem_' + termName + '_' + countConcepts + '" rel="tablesorterSynonym' + termName + '_' + countConcepts + '"><div class="evidence_item evidence_item_Phenotype" title="' + values[1] + '"></div></div>';
                        else if (values[1] == "Trait")
                            tabsBox = tabsBox + '<div class="' + conceptTabStyles + ' showConceptTab" id="tabBoxItem_' + termName + '_' + countConcepts + '" rel="tablesorterSynonym' + termName + '_' + countConcepts + '"><div class="evidence_item evidence_item_TO" title="' + values[1] + '"></div></div>';
                        else
                            tabsBox = tabsBox + '<div class="' + conceptTabStyles + ' showConceptTab" id="tabBoxItem_' + termName + '_' + countConcepts + '" rel="tablesorterSynonym' + termName + '_' + countConcepts + '"><div class="evidence_item evidence_item_' + values[1] + '" title="' + values[1] + '"></div></div>';

                    }
                    //If is not a new document type a new row is added to the existing table
                    conceptIndex = aNewConcepts.indexOf(values[1]);
                    row = '<tr>';
                    row = row + '<td width="390">' + values[0] + '</td>'
                    row = row + '<td width="80">';
                    row = row + '<div id="synonymstable_add_' + ev_i + '_' + countConcepts + '" class="addKeyword synonymTableEvent" title="Add term"></div>';
                    row = row + '<div id="synonymstable_exclude_' + ev_i + '_' + countConcepts + '" class="excludeKeyword synonymTableEvent" title="Exclude term"></div>';
                    row = row + '<div id="synonymstable_replace_' + ev_i + '_' + countConcepts + '" class="replaceKeyword synonymTableEvent" title="Replace term"></div></td>';

                    row = row + '</tr>';
                    aTable[conceptIndex] = aTable[conceptIndex] + row;
                    aTableLenght[conceptIndex] = aTableLenght[conceptIndex] + 1;
                }
            }
        }
        //$('#suggestor_invite').html(countSynonyms+' synonyms found');
        $('#suggestor_terms').html(terms);
        $('#suggestor_tables').html(table);

        // Ensure that the sizes of all the Tables for all the tabs per keyword are adequately set.
        var suggestorTabHeight;
        $('#suggestor_tables').children().each(function () {
            var elementID = $(this).attr('id');
            var elementHeight = $(this).height();
            if (elementID.indexOf("tabBox_") > -1) {
                // Retain the height of tabBox elements (to be used as the minimum Table height).
                suggestorTabHeight = elementHeight;
            }
            else if (elementID.indexOf("tablesorterSynonym") > -1) {
                if (elementHeight < suggestorTabHeight) {
                    // Increase this table's height.
                    $(this).height(suggestorTabHeight + 50);
                }
            }
        });

        $(".synonymTabButton").click(function (e) {
            var buttonID = $(e.currentTarget).attr("id").replace("_buttonSynonym", "");
            var termName = buttonID.replace("tablesorterSynonym", "").split("_");
            termName.pop(); //remove conceptNumber element from array
            showSynonymTable(buttonID, "tabBox_" + termName.join("_"));
        });

        $(".showConceptTab").click(function (e) {
            var buttonID = $(e.currentTarget).attr("id");
            var termName = buttonID.replace("tabBoxItem_", "").split("_");
            var conceptNum = termName.pop(); //remove conceptNumber element from array
            termName = termName.join("_"); // recombine array
            showSynonymTab('tabBox_' + termName, buttonID, 'tablesorterSynonym' + termName + '_' + conceptNum);
        });

        $(".addKeyword,.excludeKeyword,.replaceKeyword").click(function (e) {
            e.preventDefault();
            var currentTarget = $(e.currentTarget);
            var synonymNum = currentTarget.attr("id").replace("synonymstable_", "").split("_")[1];
            var keyword = evidenceTable[synonymNum].split("\t")[0];
            var originalTermName = $('.buttonSynonym_on').attr('id').replace("tablesorterSynonym", "").replace("_1_buttonSynonym", "").replace(/_/g, " ");

            if (originalTermName.indexOf(' ') >= 0) {
                if (!originalTermName.startsWith('"')) {
                    originalTermName = '"' + originalTermName;
                }
                if (!originalTermName.endsWith('"')) {
                    originalTermName = originalTermName + '"';
                }
            }

            if (keyword.indexOf(' ') >= 0) {
                if (!keyword.startsWith('"')) {
                    keyword = '"' + keyword;
                }
                if (!keyword.endsWith('"')) {
                    keyword = keyword + '"';
                }
            }

            if (currentTarget.hasClass("addKeyword")) {
                addKeyword(keyword, currentTarget.attr("id"), 'keywords');
            }
            else if (currentTarget.hasClass("addKeywordUndo")) {
                addKeywordUndo(keyword, currentTarget.attr("id"), 'keywords');
            }
            else if (currentTarget.hasClass("excludeKeyword")) {
                excludeKeyword(keyword, currentTarget.attr("id"), 'keywords');
            }
            else if (currentTarget.hasClass("excludeKeywordUndo")) {
                excludeKeywordUndo(keyword, currentTarget.attr("id"), 'keywords');
            }
            else if (currentTarget.hasClass("replaceKeyword")) {
                replaceKeyword(originalTermName, keyword, currentTarget.attr("id"), 'keywords');
            }
            else if (currentTarget.hasClass("replaceKeywordUndo")) {
                replaceKeywordUndo(originalTermName, keyword, currentTarget.attr("id"), 'keywords');
            }

        });


    } else {
        table = "No suggestions found";
        $('#suggestor_terms').html(" ");
        $('#suggestor_tables').html(table);
    }
}

/*
 * Function
 *
 */
function trim(text) {
    return text.replace(/^\s+|\s+$/g, "");
}

/*
 * Google Analytics
 *
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
