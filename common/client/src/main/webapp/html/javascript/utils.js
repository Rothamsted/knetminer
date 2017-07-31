/*
var genespreadsheet = new Array();
var genes;
*/

// Map View
var genemap = GENEMAP.GeneMap().width(750).height(400);

/*
Functions for show and hide structures when a button is pressed
*/

/*
 * Function to escape special characters from a string for use in jquery selector
 */
function escapeJquerySelectors(exp){
	return exp.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
}

function showSynonymTable(option,tabBoxRelated){
$('.suggestorTable:visible').fadeOut(0,function(){
		option = escapeJquerySelectors(option);
		tabBoxRelated = escapeJquerySelectors(tabBoxRelated);
		$('.synonym_right_border').attr('src','html/image/synonym_right_off.png');
		$('.synonym_left_border').attr('src','html/image/synonym_left_off.png');
		$('.buttonSynonym_on').attr('class','buttonSynonym_off');

		$('.tabBox:visible').fadeOut();
		$('#'+tabBoxRelated).fadeIn();

		//Gets the table related to the active tab
		relatedTable = $('#'+tabBoxRelated+' div.conceptTabOn').attr('rel');
		relatedTable = escapeJquerySelectors(relatedTable);
		$('#'+relatedTable).fadeIn();

		$('#'+option+'_buttonSynonym').attr('class','buttonSynonym_on');
		$('#'+option+'synonym_right_border').attr('src','html/image/synonym_right_on.png');
		$('#'+option+'synonym_left_border').attr('src','html/image/synonym_left_on.png');
	});
}

function showSynonymTab(tabFrom,tabItemFrom,tableTo){
$('.suggestorTable:visible').fadeOut(0,function(){
		tabFrom = escapeJquerySelectors(tabFrom);
		tabItemFrom = escapeJquerySelectors(tabItemFrom);
		tableTo = escapeJquerySelectors(tableTo);

		//$('#'+tabFrom+' .conceptTabOn').attr('class','conceptTabOff');
		$('#'+tabFrom+' .conceptTabOn').toggleClass('conceptTabOff conceptTabOn');
		$('#'+tableTo).fadeIn();
		//$('#'+tabItemFrom).attr('class','conceptTabOn');
		$('#'+tabItemFrom).toggleClass('conceptTabOff conceptTabOn');
	});
}

function activateButton(option){
$('.resultViewer:visible').fadeOut(0,function(){
		$('.button_off').attr('class','button_on');
		$('#'+option).fadeIn();
		$('#'+option+'_button').attr('class','button_off');

		//Collapse Suggestor view
		$('#suggestor_search').attr('src', 'html/image/expand.gif');
		$('#suggestor_search_area').slideUp(500);
	});
}
/*
Functions for Add, Remove or Replace terms from the query search box
*/
function addKeyword(keyword, from, target){
	query = $('#'+target).val();
	if(keyword.indexOf(' ') != -1 && keyword.indexOf('"') == -1)
		keyword = '"'+keyword+'"';
	newquery = query+' OR '+keyword;
	$('#'+target).val(newquery);
	//$('#'+from).parent().attr('onClick','addKeywordUndo(\''+keyword+'\',\''+from+'\',\''+target+'\')');
	//$('#'+from).attr('class','addKeywordUndo');
	$('#'+from).toggleClass('addKeywordUndo addKeyword');
	//Updates the query counter
	matchCounter();

        // Refresh the query suggester table as well by replicating its 'click' event.
        refreshQuerySuggester();
}

function addKeywordUndo(keyword, from, target){
	query = $('#'+target).val();
	if(keyword.indexOf(' ') != -1 && keyword.indexOf('"') == -1)
		keyword = '"'+keyword+'"';
	newquery = query.replace(' OR '+keyword, "");
	$('#'+target).val(newquery);
	//$('#'+from).parent().attr('onClick','addKeyword(\''+keyword+'\',\''+from+'\',\''+target+'\')');
	//$('#'+from).attr('class','addKeyword');
	$('#'+from).toggleClass('addKeywordUndo addKeyword');
	//Updates the query counter
	matchCounter();

        // Refresh the query suggester table as well by replicating its 'click' event.
        refreshQuerySuggester();
}

function excludeKeyword(keyword, from, target){
	query = $('#'+target).val();
	if(keyword.indexOf(' ') != -1 && keyword.indexOf('"') == -1)
		keyword = '"'+keyword+'"';
	newquery = query+' NOT '+keyword;
	$('#'+target).val(newquery);
	//$('#'+from).parent().attr('onClick','excludeKeywordUndo(\''+keyword+'\',\''+from+'\',\''+target+'\')');
	//$('#'+from).attr('class','excludeKeywordUndo');
	$('#'+from).toggleClass('excludeKeywordUndo excludeKeyword');
	//Updates the query counter
	matchCounter();

        // Refresh the query suggester table as well by replicating its 'click' event.
        refreshQuerySuggester();
}

function excludeKeywordUndo(keyword, from, target){
	query = $('#'+target).val();
	if(keyword.indexOf(' ') != -1 && keyword.indexOf('"') == -1)
		keyword = '"'+keyword+'"';
	newquery = query.replace(' NOT '+keyword, "");
	$('#'+target).val(newquery);
	//$('#'+from).parent().attr('onClick','excludeKeyword(\''+keyword+'\',\''+from+'\',\''+target+'\')');
	//$('#'+from).attr('class','excludeKeyword');
	$('#'+from).toggleClass('excludeKeywordUndo excludeKeyword');
	//Updates the query counter
	matchCounter();

        // Refresh the query suggester table as well by replicating its 'click' event.
        refreshQuerySuggester();
}

function replaceKeyword(oldkeyword, newkeyword, from, target){
	query = $('#'+target).val();
	newquery = query.replace(oldkeyword,newkeyword);
	$('#'+target).val(newquery);
	//$('#'+from).parent().attr('onClick','replaceKeywordUndo(\''+oldkeyword+'\',\''+newkeyword+'\',\''+from+'\',\''+target+'\')');
	//$('#'+from).attr('class','replaceKeywordUndo');
	$('#'+from).toggleClass('replaceKeywordUndo replaceKeyword');
	//Updates the query counter
	matchCounter();

        // Refresh the query suggester table as well by replicating its 'click' event.
        refreshQuerySuggester();
}

function replaceKeywordUndo(oldkeyword, newkeyword, from, target){
	query = $('#'+target).val();
	newquery = query.replace(newkeyword,oldkeyword);
	$('#'+target).val(newquery);
	//$('#'+from).parent().attr('onClick','replaceKeyword(\''+oldkeyword+'\',\''+newkeyword+'\',\''+from+'\',\''+target+'\')');
	//$('#'+from).attr('class','replaceKeyword');
	$('#'+from).toggleClass('replaceKeywordUndo replaceKeyword');
	//Updates the query counter
	matchCounter();

        // Refresh the query suggester table as well by replicating its 'click' event.
        refreshQuerySuggester();
}

/*
 * String containing the legend for all the tables and the network view.
 *
 */
var legendHtmlContainer = 	"<div id=legend_picture>" +
								"<div id=legend_container>" +
									"<table id=legend_frame cellspacing=1>" +
										"<tr>" +
											"<td align=center><img src=html/image/Gene.png></td>" +
											"<td align=center><img src=html/image/Protein.png></td>" +
											"<td align=center><img src=html/image/Pathway.png></td>" +
											"<td align=center><img src=html/image/Compound.png></td>" +
											"<td align=center><img src=html/image/Enzyme.png></td>" +
											"<td align=center><img src=html/image/Reaction.png></td>" +
											"<td align=center><img src=html/image/Publication.png></td>" +
											"<td align=center><img src=html/image/Molecular_function.png></td>" +
											/*"<td align=center><img src=html/image/Disease.png></td>" +*/
										"</tr><tr>" +
											"<td align=center><font size=1.8px>Gene</font></td>" +
											"<td align=center><font size=1.8px>Protein</font></td>" +
											"<td align=center><font size=1.8px>Pathway</font></td>" +
											"<td align=center><font size=1.8px>SNP</font></td>" +
											"<td align=center><font size=1.8px>Enzyme</font></td>" +
											"<td align=center><font size=1.8px>Reaction</font></td>" +
											"<td align=center><font size=1.8px>Publication</font></td>" +
											"<td align=center><font size=1.8px>Mol. Function</font></td>" +
											/*"<td align=center><font size=1.8px>Disease</font></td>" +*/
										"</tr><tr>" +
											"<td align=center></td>" +
										"</tr><tr>" +
											"<td align=center><img src=html/image/Phenotype.png></td>" +
											"<td align=center><img src=html/image/DGES.png></td>" +
											"<td align=center><img src=html/image/Bioogical_proccess.png></td>" +
											"<td align=center><img src=html/image/Cellular_component.png></td>" +
											"<td align=center><img src=html/image/Protein_domain.png></td>" +
											"<td align=center><img src=html/image/Trait_ontology.png></td>" +
											"<td align=center><img src=html/image/Enzyme_clasification.png></td>" +
											"<td align=center><img src=html/image/Trait.png></td>" +
											/*"<td align=center><img src=html/image/Drug.png></td>" +*/
										"</tr><tr>" +
											"<td align=center><font size=1.8px>Phenotype</font></td>" +
											"<td align=center><font size=1.8px>DGES</font></td>" +
											"<td align=center><font size=1.8px>Biol. Proccess</font></td>" +
											"<td align=center><font size=1.8px>Cell. Component</font></td>" +
											"<td align=center><font size=1.8px>Protein Domain</font></td>" +
											"<td align=center><font size=1.8px>Trait Ontology</font></td>" +
											"<td align=center><font size=1.8px>Enzyme Classification</font></td>" +
											"<td align=center><font size=1.8px>GWAS</font></td>" +
											/*"<td align=center><font size=1.8px>Drug</font></td>" +*/
										"</tr>" +
									"</table>" +
								"</div>" +
							"</div>";
/*
 * Function to check the brackets in a string are balanced
 *
 */
function bracketsAreBalanced(str) {
	var count = 0;
	for(var i=0; i< str.length; i++){
		var ch = str.charAt(i);
		if(ch == '('){
			count++;
		} else if(ch == ')'){
			count--;
			if(count < 0) return false;
		}
	}
	return true;
}

/*
 * Function to get the number of matches
 *
 */
function matchCounter(){
	var keyword = $('#keywords').val();
	if(keyword.length == 0){
		$('#matchesResultDiv').html('Please, start typing your query');
	} else {
		if((keyword.length > 2) && ((keyword.split('"').length - 1)%2 == 0) && bracketsAreBalanced(keyword) && (keyword.indexOf("()") < 0) && ((keyword.split('(').length) == (keyword.split(')').length)) && (keyword.charAt(keyword.length-1) != ' ') && (keyword.charAt(keyword.length-1) != '(') && (keyword.substr(keyword.length - 3) != 'AND') && (keyword.substr(keyword.length - 3) != 'NOT') && (keyword.substr(keyword.length - 2) != 'OR') && (keyword.substr(keyword.length - 2) != ' A') && (keyword.substr(keyword.length - 3) != ' AN') && (keyword.substr(keyword.length - 2) != ' O') && (keyword.substr(keyword.length - 2) != ' N') && (keyword.substr(keyword.length - 2) != ' NO')  ){
			var searchMode = "counthits";
			var request = "mode="+searchMode+"&keyword="+keyword;
			var url = 'OndexServlet?'+request;
			$.post(url, '', function(response, textStatus){
				if(textStatus == "success"){
					if(response.split('|')[1] == null ){
						$('#matchesResultDiv').html('<span class="redText">The KnetMiner server is currently offline. Please try again later.</span>');
					}
					else if (response.split('|')[1] != "0"){
						$('#matchesResultDiv').html('<b>'+response.split('|')[1]+' documents</b>  and <b>'+response.split('|')[2]+' genes</b> will be found with this query');
						$('#keywordsSubmit').removeAttr("disabled");
					}
					else
						$('#matchesResultDiv').html('No documents or genes will be found with this query');
				}
			})
		}else{
			$('#matchesResultDiv').html('');
		}
	}
}

/*
 * Function to get the network of all genes related to a given evidence
 * 
 */		
function evidencePath(id){	
	// Preloader for the new Network Viewer (KNETviewer).
	$("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div"><b>Loading Network, please wait...</b></div>');

	var searchMode = "evidencepath";
	var keyword = id;
	var request = "mode="+searchMode+"&keyword="+keyword;
	var url = 'OndexServlet?'+request;
//	generateNetwork(url,'');
        // Generate the Network Graph using the new Network Viewer.
        generateCyJSNetwork(url,'');
}

/*
* Document ready event executes when the HTML document is loaded
* 	- add/remove QTL regions
* 	- advanced search
* 	- tooltips
*/

$(document).ready(
		function(){
			// add species name to header
			$('#species_header').text(species_name); // set/ update species name from utils_config.js
                        
			//shows the genome or qtl search box and chromosome viewer if there is a reference genome
			if(reference_genome == true){
				$('#genomeorqtlsearchbox').show();
				if (typeof gviewer != "undefined" && gviewer == false) {
					activateButton('resultsTable');
//					$('#pGViewer_button').hide();
					$('#genemap-tab_button').hide();
//					$('#pGViewer').hide();
					$('#genemap-tab').hide();
				}
			}
			else{
				activateButton('resultsTable');
//					$('#pGViewer_button').hide();
					$('#genemap-tab_button').hide();
//					$('#pGViewer').hide();
					$('#genemap-tab').hide();
			}
			$("#keywords").focus();
			$('#tabviewer').hide(); // hide by default
			// Calculates the amount of documents to be displayed with the current query
			$('#keywords').keyup(function(e) {
                            // this stops matchCounter being called when the enter or arrow keys are used.
                            if(e.which !== 13 && e.which !== 37 && e.which !== 38 && e.which !== 39 && e.which !== 40){
                               matchCounter();
      			      }
                            // update matchCounter and QuerySuggestor only when a Enter key is pressed, i.e., do a Search, and not for other keyup events.
/*                            if(e.which === 13) {
                               matchCounter();
                            //   searchKeyword(); // Search
      			      }*/
                              
                            // this stops refreshQuerySuggester being called when the enter or arrow keys are used.
                            if(e.which !== 13 && e.which !== 37 && e.which !== 38 && e.which !== 39 && e.which !== 40){
                        //    if(e.which === 13) { // only refresh QuerySuggester when Enter key is pressed
                               // Refresh the query suggester table as well, if it's already open.
			       if($('#suggestor_search').attr('src') === "html/image/collapse.gif") {
                                  refreshQuerySuggester();
                                 }
      			      }
			});
			// Add QTL region
			$('#addRow').click(
					function() {
						var curMaxInput = $('#region_search_area table tr').length -1;
						$('#region_search_area tr:nth-child(2)')
							.clone()
							.insertAfter($('#region_search_area tr:last').prev())
							.find('td:eq(0)')
							.find('select:eq(0)')
							.attr({'id': 'chr' + (curMaxInput),
								   'name': 'chr' + (curMaxInput),
								   'onChange': 'findGenes(\'genes'+(curMaxInput)+'\', $(\'#chr'+(curMaxInput)+' option:selected\').val(), $(\'#start'+(curMaxInput)+'\').val(), $(\'#end'+(curMaxInput)+'\').val())',
								   'value': ''
								  })
							.parent().parent()
							.find('td:eq(1)')
							.find('input:text:eq(0)')
							.attr({'id': 'start' + (curMaxInput),
								   'name': 'start' + (curMaxInput),
								   'onKeyup': 'findGenes(\'genes'+(curMaxInput)+'\', $(\'#chr'+(curMaxInput)+' option:selected\').val(), $(\'#start'+(curMaxInput)+'\').val(), $(\'#end'+(curMaxInput)+'\').val())',
								   'value': ''
								  })
							.parent().parent()
							.find('td:eq(2)')
							.find('input:text:eq(0)')
							.attr({'id': 'end' + (curMaxInput),
									'name': 'end' + (curMaxInput),
									'onKeyup': 'findGenes(\'genes'+(curMaxInput)+'\', $(\'#chr'+(curMaxInput)+' option:selected\').val(), $(\'#start'+(curMaxInput)+'\').val(), $(\'#end'+(curMaxInput)+'\').val())',
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
								'onFocus': 'findGenes(this.id, $(\'#chr'+(curMaxInput)+' option:selected\').val(), $(\'#start'+(curMaxInput)+'\').val(), $(\'#end'+(curMaxInput)+'\').val())',
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
					function() {
						if ($('#region_search_area tr').length > 3) {
							$('#region_search_area tr:last').prev().remove();
						}
						if ($('#region_search_area tr').length <= 3) {
							$('#removeRow').attr('disabled', true);
						}
						else if ($('#rows tr').length < 7) {
							$('#addRow').removeAttr('disabled');
						}
						return false;
					});
			// Region search
		     $('#region_search').click(
		    		 function() {
		    			 var src = ($(this).attr('src') === 'html/image/expand.gif')
		    	            ? 'html/image/collapse.gif'
		    	            : 'html/image/expand.gif';
		    	         $(this).attr('src', src);
		    	         $('#region_search_area').animate({
				               height: 'toggle'
				               }, 500
				          );
		    		 });
			// Advanced search
		     $('#advanced_search').click(
		    		 function() {
		    			 var src = ($(this).attr('src') === 'html/image/expand.gif')
		    	            ? 'html/image/collapse.gif'
		    	            : 'html/image/expand.gif';
		    	         $(this).attr('src', src);
		    	         $('#advanced_search_area').animate({
				               height: 'toggle'
				               }, 500
				          );
		    		 });
		     // Suggestor search
		     $('#suggestor_search').click(
                             function() {				         
		    			 var src = ($(this).attr('src') === 'html/image/expand.gif')
		    	            ? 'html/image/collapse.gif'
		    	            : 'html/image/expand.gif';
		    	         $(this).attr('src', src);
		    	         $('#suggestor_search_area').animate({
				               height: 'toggle'
				               }, 500
				          );	
						  if($('#suggestor_search').attr('src') == "html/image/collapse.gif") {
                                                     refreshQuerySuggester();
						    }																	  
		    		 });
		    //Match counter
			//$("#keywords").keyup(matchCounter());
		 	// Tooltip
		     var sampleQueryButtons = "";//"<strong>Example queries</strong>";

		    	$.ajax({
		    		type: 'GET',
		    		url: "html/data/sampleQuery.xml",
		    		dataType: "xml",
		    		cache: false, //force cache off
		    		success: function(sampleQuery) {

		    			// Parse the values from the recieved sampleQueries.xml file into an object.
		    			var sampleQueries = new Array();	//object to hold parsed xml data
		    			$("query", sampleQuery).each(function() {	//for each different Query
		    				var tempXML = new Array();
		    				tempXML["name"] = $("name", this).text();
		    				tempXML["desciption"] = $("description", this).text();
		    				tempXML["term"] = $("term", this).text();
		    				tempXML["withinRegion"] = $("withinRegion", this).text();
		    				var regions = Array();
		    				$("region", this).each(function(){
		    					regions.push({
		    						chromosome : $("chromosome", this).text(),
		    						start: $("start", this).text(),
		    						end: $("end", this).text(),
		    						label: $("label", this).text()
		    					});
		    				});
		    				tempXML["regions"] = regions;

		    				tempXML["mapGLWithoutRestriction"] = $("mapGLWithoutRestriction", this).text();

		    				var genes = Array();
		    				$("gene", this).each(function(){
		    					genes.push($(this).text());
                                                    //console.log("push to genes: $(this).text()= "+ $(this).text());
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
		    			for(i=0; i<sampleQueries.length; i++) {
		    				desc = "";
		    				if(sampleQueries[i].desciption){
		    					desc = " - " + sampleQueries[i].desciption;
		    				}
		    				sampleQueryButtons += "</br><a href:'javascript;' class='exampleQuery' id='exampleQuery"+i+"'>"+sampleQueries[i].name+"</button></a>"+desc;
		    	 			//$("#exampleSelect").append("<option value="+i+">"+sampleQueries[i].term+"</option>");
		    	 		}
                                        // add example queries to page
                                        $('#eg_queries').html(sampleQueryButtons);

		    			// set an event handler to populate the search fields when one of the example queries is clicked
							$('body').on('click', '.exampleQuery', function() {
		    	 			sampleNum = $(this)[0].id.replace('exampleQuery','');
		    	 			$("#keywords").val(sampleQueries[sampleNum].term);
		    	 			var numRegions = sampleQueries[sampleNum].regions.length;


		    	 			if(trim(sampleQueries[sampleNum].withinRegion) == 'true'){
		     					$("input:radio[name=search_mode]").val(['qtl']);
		     				} else {
		     					$("input:radio[name=search_mode]").val(['genome']);
		     				}

		    	 			if(numRegions > 0){
		    	 				while(!$("#chr" + numRegions).length){ //while if the last row for which we have data, doesn't exist add one
		    	 					$("#addRow").click();
		    	 				}
		    	 				while($("#chr" + (numRegions + 1)).length){	//while the row after the last one for which we have data exists remove one.
		    	 					$("#removeRow").click();
		    	 				}

		    	 				if($("#region_search_area").is(":hidden")){
		    	 					$("#region_search").click();
		    	 				}

		    	 				//loop through all regions and fill in the QTL region rows
		    	 				for(i=0; i<numRegions; i++){
		    	 					var num = i+1;
		    	 					$("#chr" + num).val(sampleQueries[sampleNum].regions[i].chromosome);
		    	 					$("#start" + num).val(sampleQueries[sampleNum].regions[i].start);
		    	 					$("#end" + num).val(sampleQueries[sampleNum].regions[i].end);
		    	 					$("#label" + num).val(sampleQueries[sampleNum].regions[i].label);
		    	 					$("#genes" + num).focus();	//forces Genes counter column to update
		    	 				}
		    	 			} else {
		    	 				while($("#chr2").length){	//while there is more than 1 row remove one.
		    	 					$("#removeRow").click();
		    	 				}

		    	 				$("#chr1").attr('selectedIndex',0);
		     					$("#start1").val("");
		     					$("#end1").val("");
		     					$("#label1").val("");
		     					$("#genes1").focus();

		    	 				if($("#region_search_area").is(":visible")){
		    		 				$("#region_search").click();
		    		 			}
		    	 			}

		    	 			if(trim(sampleQueries[sampleNum].mapGLWithoutRestriction) == 'true'){
		     					$("input:radio[name=list_mode]").val(['GL']);
		     				} else {
		     					$("input:radio[name=list_mode]").val(['GLrestrict']);
		     				}

		    	 			//console.log("sampleQueries[sampleNum].genes.length= "+ sampleQueries[sampleNum].genes.length);
                                                if(sampleQueries[sampleNum].genes.length > 0){
		    	 				if($("#advanced_search_area").is(":hidden")){
		    	 					$("#advanced_search").click();
		    	 				}
		    	 				var genesText = "";
		    	 				for(gene=0; gene <sampleQueries[sampleNum].genes.length; gene++){
		    	 					genesText+= sampleQueries[sampleNum].genes[gene] + "\n";
                                                                //console.log("sampleQueries["+sampleNum+"].genes["+ gene +"]= "+ sampleQueries[sampleNum].genes[gene] +"\n \t genesText now: "+ genesText);
		    	 				}
		    	 				$("#list_of_genes").val(genesText);
		    	 			}else {
		    	 				$("#list_of_genes").val("");
		    	 				if($("#advanced_search_area").is(":visible")){
		    		 				$("#advanced_search").click();
		    		 			}
		    	 			}
							
		    	 			matchCounter(); // updates number of matched documents and genes counter
                                                // Refresh the Query Suggester, if it's already open.
	 		                        if($('#suggestor_search').attr('src') == "html/image/collapse.gif") {
                                                   refreshQuerySuggester();
                                                  }
		    	 		});
		    		}
		    	});

					$('body').on('mouseenter', 'span.hint', function(event){
		 			target = $(this)[0].id;
	 				var message = "";
	 				addClass = "";
	 				if(target == 'hintSearchQtlGenome'){
	 					message = 'Select the "whole-genome" option to search the whole genome for potential candidate genes or select the "within QTL" option to search for candidate genes within the QTL coordinates.';
	 				}
	 				else if(target == 'hintEnterGenes'){
	 					message = 'Input a list of target genes using reference gene ID\'s.';
	 				}
					else if(target == 'hintQuerySuggestor'){
	 					message = 'Add, remove or replace terms from your query using the list of suggested terms based on your search criteria';
	 				}
					else if(target == 'hintEgKeywords'){
	 					//message = $('#eg_keywords_hidden').html();
	 					message = sampleQueryButtons;
	 					addClass="tooltip-static";
	 				}
	 				else if(target == 'hintSortableTable'){
	 					message = 'This opens KNETviewer and displays a subset of the knowledge network that only contains the selected genes (light blue triangles) and the relevant evidence network.';
	 					//message = 'Sort multiple columns simultaneously by holding down the shift key and clicking column headers! ';
	 				}

					$('div.tooltip').remove();
					$('<div class="tooltip '+addClass+'">'+message+'</div>').appendTo('body');

					tooltipY = $(this).offset()['top'] - 12;
					tooltipX = $(this).offset()['left'] - 4;
					winWidth = $(window).width();
					if(tooltipX + 300 > winWidth){
						tooltipX = winWidth - 300;
					}
					$('div.tooltip.tooltip-static').css({top: tooltipY, left: tooltipX}); //for sample queries tooltip
		 		});



				$('body').on('mousemove', 'span.hint:not(#hintEgKeywords)', function(event){
		 			var tooltipX = event.pageX - 8;
		     		var tooltipY = event.pageY + 8;

		     		winWidth = $(window).width();
					if(tooltipX + 300 > winWidth){
						tooltipX = winWidth - 300;
					}

		     		$('div.tooltip').css({top: tooltipY, left: tooltipX});
		 		});


				$('body').on('mouseleave', 'span.hint', function(event){
		 			if($(event.relatedTarget).hasClass("tooltip-static") || $(event.relatedTarget).parent().hasClass("tooltip-static")){
						return;
					}
		 			$('div.tooltip').remove();
		 		});

				$('body').on('mouseleave', 'div.tooltip-static', function(event){
		 			$('div.tooltip').remove();
		 		});

				genemap.draw('#genemap', 'html/data/basemap.xml', null);
			});


		
function refreshQuerySuggester() {
  $('#suggestor_terms').html('');
  // Add "..." preloader bar (gif image) for suggestor tables.
//  $('#suggestor_tables').html('<div class="preloader_wrapper"><img src="html/image/preloader_bar.gif" alt="Loading, please wait..." class="preloader_bar" /></div>');
  // Create the Synonym table.
  var searchMode = "synonyms";
  var keyword = $('#keywords').val();
  var request = "mode="+searchMode+"&keyword="+keyword;
  var url = 'OndexServlet?'+request;
  $.post(url, '', function(response, textStatus){
    if(textStatus == "success"){
       synonymFile = response.split(":")[1];
       createSynonymTable(data_url+synonymFile);
      }
  });
}

/*
 * Function to refresh GViewer
 *
 */
function searchKeyword(){
	var searchMode = getRadioValue(document.gviewerForm.search_mode);
	var listMode = 'GL'; // getRadioValue(document.gviewerForm.list_mode);
	var keyword = escape(trim($("#keywords").val()));
	var list = $("#list_of_genes").val();
/*console.log("searchKeyword(): gene_list: "+ list);
	if(list !== null) {
	 if(list.length>1) {
	  listMode='GLrestrict';
	 }
	}*/
	var regions = document.getElementById('regions_table').rows.length -2;
	var request = "keyword="+keyword+"&mode="+searchMode;
	if(list.length > 0){
		request = request+"&listMode="+listMode;
	}
	var counter = 1;

	for(i=1; i<=regions; i++){
		var chr = $("#chr"+i+" option:selected").val();
		var start = trim($("#start"+i).val());
		var end = trim($("#end"+i).val());
		var label = trim($("#label"+i).val());

		if(chr.length>0 && start.length>0 && end.length>0 && parseInt(start)<parseInt(end)){
				request = request+"&qtl"+counter+"="+chr+":"+start+":"+end+":"+label;
				counter++;
		}
	}
//console.log("keyword: "+ $("#keywords").val() +", after Trimming: "+ keyword +", \n request: "+ request);
//console.log("Search request: "+ request);
	if(keyword.length < 2) {
		$("#loadingDiv").replaceWith('<div id="loadingDiv"><b>Please provide a keyword</b><br />e.g. '+warning+'</div>');
	}
//	else if(($("#genes1").val() == 0) && (searchMode == "qtl")) {
//		$("#loadingDiv").replaceWith('<div id="loadingDiv"><b>Please define at least one QTL region.</b></div>');
//	}
	else if(list.length > 500000) {
		$("#loadingDiv").replaceWith('<div id="loadingDiv"><b>Please provide a valid list of genes.</b></div>');
	}
	else{
		$('#tabviewer').show(); // show Tab buttons and viewer
		$("#loadingDiv").replaceWith('<div id="loadingDiv"><img src="html/image/spinner.gif" alt="Loading, please wait..." /></div>');
/*                // update matchCounter
                matchCounter();
                // refresh Query Suggestor, if already open.
                if($('#suggestor_search').attr('src') === "html/image/collapse.gif") { refreshQuerySuggester(); }
*/
		$.ajax({
	        url:"OndexServlet?"+request,
	        type:'POST',
	        dataType:'text',
	        async: true,
	        timeout: 1000000,
	        data:{list : list},
	        error: function(errorlog){
				alert("An error has ocurred "+errorlog);
	        },
	        success: function(response, textStatus){
				$("#loadingDiv").replaceWith('<div id="loadingDiv"></div>');
//console.log("response: "+ response);
				if((response == null) || (response == "")){
						var genomicViewTitle = '<div id="pGViewer_title">Sorry, the server is being updated. Please, re-enter your job later<br /></div>';
						$("#pGViewer_title").replaceWith(genomicViewTitle);
				} else
				if(response.indexOf("NoFile:noGenesFound") !=-1 ||  !response.split(":")[4] > 0){
					var genomicViewTitle = '<div id="pGViewer_title">Sorry, no results were found.<br />Make sure that all words are spelled correctly. Otherwise try a different or more general query.<br /></div>'

					if (typeof gviewer != "undefined" && gviewer != false) {

						var longestChromosomeLength="";
						if (typeof longest_chr != "undefined") {
							if (longest_chr != null) {
								longestChromosomeLength="&longestChromosomeLength="+longest_chr;
							}
						}

					/*	var genomicView = '<div id="pGViewer" class="resultViewer">';
						var gviewer_html = '<center><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0" width="600" height="600" id="GViewer2" align="middle"><param name="wmode" value="transparent"><param name="allowScriptAccess" value="sameDomain" /><param name="movie" value="html/GViewer/GViewer2.swf" /><param name="quality" value="high" /><param name="bgcolor" value="#FFFFFF" /><param name="FlashVars" value="'+longestChromosomeLength+'&lcId=1234567890&baseMapURL=html/data/basemap.xml&annotationURL=&dimmedChromosomeAlpha=40&bandDisplayColor=0x0099FF&wedgeDisplayColor=0xCC0000&browserURL=OndexServlet?position=Chr&" /><embed style="width:700px; height:550px;" id="embed" src="html/GViewer/GViewer2.swf" quality="high" bgcolor="#FFFFFF" width="600" height="600" name="GViewer2" align="middle" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" FlashVars="'+longestChromosomeLength+'&lcId=1234567890&baseMapURL=html/data/basemap.xml&annotationURL=&dimmedChromosomeAlpha=40&bandDisplayColor=0x0099FF&wedgeDisplayColor=0xCC0000&titleBarText=&browserURL=OndexServlet?position=Chr&" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object></center></div>';
						genomicView = genomicView + gviewer_html;
						$("#pGViewer").replaceWith(genomicView); */

						//Collapse Suggestor view
						$('#suggestor_search').attr('src', 'html/image/expand.gif');
				 		$('#suggestor_search_area').slideUp(500);
					}

					$("#pGViewer_title").replaceWith(genomicViewTitle);


					activateButton('resultsTable');
					document.getElementById('resultsTable').innerHTML = "";
					document.getElementById('evidenceTable').innerHTML = "";
					document.getElementById('NetworkCanvas').innerHTML = "";

	        	}
				else {
                                    // For a valid response
					var splitedResponse = response.split(":");
					var results = splitedResponse[4];
					var docSize = splitedResponse[5];
					var totalDocSize = splitedResponse[6];
					var candidateGenes = parseInt(results);

					var longestChromosomeLength="";
					if (typeof longest_chr != "undefined") {
						if (longest_chr != null) {
							longestChromosomeLength="&longestChromosomeLength="+longest_chr;
						}
					}

					var genomicViewTitle = '<div id="pGViewer_title">In total <b>'+results+' genes</b> were found.<br />Query was found in <b>'+docSize+' documents</b> related with genes ('+totalDocSize+' documents in total)<br /></div>'
				//	var genomicView = '<div id="pGViewer" class="resultViewer">';
					if(candidateGenes > 100){
						candidateGenes = 100;
						var genomicViewTitle = '<div id="pGViewer_title">In total <b>'+results+' genes</b> were found. Top 1000 genes are displayed in Map view.<br />Query was found in <b>'+docSize+' documents</b> related with genes ('+totalDocSize+' documents in total)<br /></div>';
					}

				//	gviewer_html = '<center><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0" width="600" height="600" id="GViewer2" align="middle"><param name="wmode" value="transparent"><param name="allowScriptAccess" value="sameDomain" /><param name="movie" value="html/GViewer/GViewer2.swf" /><param name="quality" value="high" /><param name="bgcolor" value="#FFFFFF" /><param name="FlashVars" value="'+longestChromosomeLength+'&lcId=1234567890&baseMapURL=html/data/basemap.xml&annotationURL='+data_url+splitedResponse[1]+'&dimmedChromosomeAlpha=40&bandDisplayColor=0x0099FF&wedgeDisplayColor=0xCC0000&browserURL=OndexServlet?position=Chr&" /><embed style="width:700px; height:550px;" id="embed" src="html/GViewer/GViewer2.swf" quality="high" bgcolor="#FFFFFF" width="600" height="600" name="GViewer2" align="middle" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" FlashVars="'+longestChromosomeLength+'&lcId=1234567890&baseMapURL=html/data/basemap.xml&annotationURL='+data_url+splitedResponse[1] +'&dimmedChromosomeAlpha=40&bandDisplayColor=0x0099FF&wedgeDisplayColor=0xCC0000&titleBarText=&browserURL=OndexServlet?position=Chr&"  pluginspage="http://www.macromedia.com/go/getflashplayer" /></object></center></div>';
				//	genomicView = genomicView + gviewer_html;
					$("#pGViewer_title").replaceWith(genomicViewTitle);
				//	$("#pGViewer").replaceWith(genomicView);

					// Setup the mapview component
					var basemap = "html/data/basemap.xml";
					var annotations = data_url + splitedResponse[1];
                                        console.log("annotations file: "+ annotations);

                                        // create new basemap with bands for genes and pass it as well to the Map Viewer.
					genemap.draw('#genemap', basemap, annotations);

					//Collapse Suggestor view
					$('#suggestor_search').attr('src', 'html/image/expand.gif');
                                        $('#suggestor_search_area').slideUp(500);

					activateButton('resultsTable');
					createGenesTable(data_url+splitedResponse[2], keyword, candidateGenes);
					createEvidenceTable(data_url+splitedResponse[3]);
				}
	        }
		});
	}
}

/*
 * Function
 *
 */
function generateNetwork(url,list){
	//OndexServlet?mode=network&list=POPTR_0003s06140&keyword=acyltransferase
	$.post(url, list, function(response, textStatus){
	var oxl = response.split(":")[1];

	var output ="<div id='buttonBox'>" +
        			"<a title='Maximise' href='javascript:;' id='maximiseNetwork' class='networkButtons' type='button'></a>" +
        			"<a title='Download network' href="+data_url + oxl +" target=_blank id='downloadNetworkTab' class='networkButtons' type='button'></a>" +
	        		"<a title='Open in new window' href='javascript:;' id='newNetworkWindow' class='networkButtons' type='button'></a>" +
	        		"<span id='networkViewerHelp' class='networkButtons hint-big' title='Network Viewer Help'></span>" +
	        	"</div>" +

        		"<div id='modalShadow'></div>" +
        		"<div class='modalBox'>" +	//placeholder to stop page length changing when modalBox is opened.
	        		"<div id='modalBox' class='modalBox'>" +	//modal box is moved to center of window and resizes with it
	        			"<a title='Restore' href='javascript:;' id='restoreNetwork' class='networkButtons'></a>" +
		        		"<div id='OndexWebContainer'>" +
			        		"<div id='OndexWebApplet'></div>" +
		        		"</div>" +
		        		legendHtmlContainer +
	        		"</div>" +
				"</div>" +
				"<div id='networkHelpBox'>" +
				"<h2>Network Viewer Help</h2>" +
				"<ul>" +
				"<li>The Ondex knowledge network has been generated and is displayed in the Ondex Web applet. Alternatively it can be downloaded and opened in the Ondex desktop application</li>" +
 				"<li>If you see an error and the network is not loading make sure <a href=http://www.java.com/en/download target=_blank>Java7 Update55+</a> is installed and <a href=http://ondex.rothamsted.ac.uk target=_blank>http://ondex.rothamsted.ac.uk</a> is added to the Exception Site List in the java control panel.</li>" +
 				"</div>";



    //output += legendHtmlContainer;

	$('#NetworkCanvas').html(output);


	var appletSettings = {
		id: 'OndexWeb',
		url: applet_url+'OndexWeb.jnlp',
		width : '100%',
		height : '100%',
		placeholder:'OndexWebApplet',
		params:
		{
			loadappearance : true,
			filename : data_url+oxl
		}
	};

	dtjava.embed(appletSettings, { jvm: "1.6+" }, {});

	$('#networkViewerHelp').click(function() {
		$('#networkHelpBox').slideToggle(300);
	});

	$('#networkHelpBox').click(function() {
		$('#networkHelpBox').slideToggle(300);
	})

	$("#newNetworkWindow").click(function(){
		var w = window.open('html/networkViewer.html?oxl='+oxl,'NetworkWindow','resizable=yes,dependent=yes,status=no,toolbar=no,menubar=no,scrollbars=no,menubar=no');
	});

	$('#maximiseNetwork').click(function() {
		$('#modalBox').addClass("modalBoxVisible");
		//$('#restoreNetwork').show();
		$('#modalShadow').show();
	});

	function closeModalBox(){
		$('#modalBox').removeClass("modalBoxVisible");
		//$('#restoreNetwork').hide();
		$('#modalShadow').hide();
	}

	$('#restoreNetwork, #modalShadow, #legend_picture').click(function(){
			closeModalBox();
	}).find('#legend_frame').click(function (e) {
		  e.stopPropagation();
	});

	$('#modalShadow').click(function(){
			closeModalBox();
	});


	$(document).keyup(function(e) {
        if (e.keyCode == 27){
        	closeModalBox();
        }
	});


	activateButton('NetworkCanvas');


	});
}

/*
 * Function
 * Generates the new lightweight Network graph, using cytoscapeJS.
 * @author: Ajit Singh.
 */
function generateCyJSNetwork(url,list){
    populateKnetMenu(); // initialize the KnetMaps menubar, if needed.
    
    //OndexServlet?mode=network&list=POPTR_0003s06140&keyword=acyltransferase
    $.post(url, list, function(response, textStatus) {
    var oxl = response.split(":")[1];
    // Network Graph: JSON file.
    var network_json= oxl.replace(".oxl", ".json"); // JSON file path
    var jsonFile= data_url + network_json; // the JSON file generated on the server.
    try {
         $("#knet-maps").css("display","block"); // show the KNETviewer menubar.
         activateButton('NetworkCanvas');

         // Show KnetMaps maskloader.
         showNetworkLoader();

         // Generate the Network after the page load event.
         generateNetworkGraph(jsonFile);
        
         // Remove KnetMaps maskloader.
         removeNetworkLoader();
         // Remove the preloader message in Gene View, for the Network Viewer
         $("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"></div>');
	 $("#loadingNetwork_Div").replaceWith('<div id="loadingNetwork_Div"></div>');
        }
    catch(err) {
          var errorMsg= err.stack;
          console.log("Error: <br/>"+"Details: "+ errorMsg);
         }
   });
  }

// Add KnetMaps menu bar
function populateKnetMenu() {
 var knet_menu= "<input type='image' id='maximizeOverlay' src='html/KnetMaps/image/maximizeOverlay.png' title='Toggle full screen' onclick='OnMaximizeClick();' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='showAll' src='html/KnetMaps/image/showAll.png' onclick='showAll();' title='Show all the concept & relations in the Network' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='relayoutNetwork' src='html/KnetMaps/image/relayoutNetwork.png' onclick='rerunLayout();' title='Re-run the Layout' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='openItemInfoBtn' src='html/KnetMaps/image/openItemInfoBtn.png' onclick='popupItemInfo();' title='Show Info box' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<span class='knet-dropdowns'>"+
                        "<select id='layouts_dropdown' class='knet-dropdowns' onChange='rerunLayout();' title='Select network layout'>"+
                            "<option value='Cose_layout' selected='selected' title='using CoSE layout algorithm (useful for larger networks with clustering)'>CoSE layout</option>"+
                            "<option value='ngraph_force_layout' title='using ngraph_force layout (works well on planar graphs)'>Force layout</option>"+
                            "<option value='Circle_layout'>Circular layout</option>"+
                            "<option value='Concentric_layout'>Concentric layout</option>"+
                            "<option value='Cose_Bilkent_layout' title='using CoSE-Bilkent layout (with node clustering, but performance-intensive for larger networks)'>CoSE-Bilkent layout</option>"+
                        "</select>"+
                        "<select id='changeLabelVisibility' class='knet-dropdowns' onChange='showHideLabels(this.value);' title='Select label visibility'>"+
                            "<option value='None' selected='selected'>Labels: None</option>"+
                            "<option value='Concepts'>Labels: Concepts</option>"+
                            "<option value='Relations'>Labels: Relations</option>"+
                            "<option value='Both'>Labels: Both</option>"+
                        "</select>"+
                        "<select id='changeLabelFont' class='knet-dropdowns' onChange='changeLabelFontSize(this.value);' title='Select label font size'>"+
                            "<option value='8'>Label size: 8px</option>"+
                            "<option value='12'>Label size: 12px</option>"+
                            "<option value='16' selected='selected'>Label size: 16px</option>"+
                            "<option value='20'>Label size: 20px</option>"+
                            "<option value='24'>Label size: 24px</option>"+
                            "<option value='28'>Label size: 28px</option>"+
                            "<option value='32'>Label size: 32px</option>"+
                            "<option value='36'>Label size: 36px</option>"+
                            "<option value='40'>Label size: 40px</option>"+
                        "</select>"+
			        "</span>"+
                    "<input type='image' id='resetNetwork' src='html/KnetMaps/image/resetNetwork.png' onclick='resetGraph();' title='Reposition (reset and re-fit) the graph' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='savePNG' src='html/KnetMaps/image/savePNG.png' onclick='exportAsImage();' title='Export the network as a .png image' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='saveJSON' src='html/KnetMaps/image/saveJSON.png' onclick='exportAsJson();' title='Export the network in JSON format' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>"+
                    "<input type='image' id='helpURL' src='html/KnetMaps/image/help.png' onclick='openKnetHelpPage();' title='Go to help documentation' onmouseover='onHover($(this));' onmouseout='offHover($(this));'>";

 $('#knetmaps-menu').html(knet_menu);
}

/*
 * Function
 *
 */
function generateMultiGeneNetwork(keyword) {
	var candidatelist = "";
	var cb_list = document.checkbox_form.candidates;
	for (var i=0; i < cb_list.length; i++) {
		if(cb_list[i].checked) {
			candidatelist += cb_list[i].value + "\n";
		}
	}
	if(candidatelist == "") {
		$("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>Please select candidate genes.</b></div>');
	} else {
			generateNetwork('OndexServlet?mode=network&keyword='+keyword, {list : candidatelist});
	}
}

/*
 * Function
 * Generates multi gene network used in the new lightweight, cytoscapeJS Network Viewer.
 * @author: Ajit Singh.
 */
function generateMultiGeneNetwork_forNewNetworkViewer(keyword) {
	var candidatelist = "";
	var cb_list = document.checkbox_form.candidates;
	for (var i=0; i < cb_list.length; i++) {
		if(cb_list[i].checked) {
			candidatelist += cb_list[i].value + "\n";
		}
	}
	if(candidatelist == "") {
		$("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>Please select candidate genes.</b></div>');
	}
        else {
 	  // Preloader for the new Network Viewer (KNETviewer).
	  $("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>Loading Network, please wait...</b></div>');

         // console.log("GeneView: Launch Network for url: OndexServlet?mode=network&keyword="+ keyword);
          generateCyJSNetwork('OndexServlet?mode=network&keyword='+keyword, {list : candidatelist});
	 }
}

/*
 * Function
 *
 */
function findGenes(id, chr_name, start, end) {
	if(chr_name != "" && start != "" && end != ""){
		var searchMode = "countloci";
		var keyword = chr_name+"-"+start+"-"+end;
		var request = "mode="+searchMode+"&keyword="+keyword;
		var url = 'OndexServlet?'+request;
		$.post(url, '', function(response, textStatus){
			if(textStatus == "success"){
				$("#"+id).val(response);
			}
		})
	}
}

/*
 * Function
 *
 */
function contactWindow() {
	window.open( "html/contact.html", "KnetMiner-Contact", "status=0, toolbar=0, location=0, menubar=0, height=200, width=400, resizable=0" );
}

/*
 * Function
 *
 */
function getRadioValue(radio) {
	var radioValue;
	for (var i=0; i < radio.length; i++) {
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
function createGenesTable(tableUrl, keyword, rows){
	var table = "";
	$.ajax({
        url:tableUrl,
        type:'GET',
        dataType:'text',
        async: true,
        timeout: 1000000,
        error: function(){
        },
        success: function printGenesTable(text){
        	if($("#numGenes").length){
        		rows = $("#numGenes").val();
        	}

    		var candidate_genes = text.split("\n");
    		var results = candidate_genes.length-2;

    		if(candidate_genes.length > 2) {
		        table =  '';
				table = table + '<p class="margin_left"><a href="'+tableUrl+'" target="_blank">Download as TAB delimited file</a><br />';
				table = table + 'Select gene(s) and click "View Network" button to see the network.<span id="hintSortableTable" class="hint hint-small" ></span></p>';
				table = table + '<form name="checkbox_form">';
				table = table + 'Max number of genes to show: ';
				table = table + '<select value="'+rows+'" id="numGenes">';
				table = table + '<option value="50">50</option>';
				table = table + '<option value="100">100</option>';
				table = table + '<option value="200">200</option>';
				table = table + '<option value="500">500</option>';
				table = table + '<option value="1000">1000</option>';
				table = table + '<select>';
//				table = table + '<div id="selectUser"><input type="checkbox" name="chkusr" />Select All Targets</div>';
				table = table + '<div id="selectUser">Known targets:<input type="checkbox" name="checkbox_Targets" value="checkbox_Known" title="Click to select Targets with existing evidence." /> Novel targets:<input type="checkbox" name="checkbox_Targets" value="checkbox_Novel" title="Click to select Targets without existing evidence." />'+
                                        '<div id="selectedGenesCount"><span style="color:darkOrange; font-size: 14px;">No gene(s) selected</span></div>'+'</div>';
				table = table + '<div class = "scrollTable">';
				table = table + '<table id = "tablesorter" class="tablesorter">';
				table = table + '<thead>';
				table = table + '<tr>';
				var values = candidate_genes[0].split("\t");
				table = table + '<th width="100">'+values[1]+'</th>';
				table = table + '<th width="100" title="Show '+ values[2] +', if not same as '+ values[1]+'">'+values[2]+'</th>'; // added Gene Name to Gene View table
				if(multiorganisms == true){
					table = table + '<th width="60">'+values[5]+'</th>';
				}
				if(reference_genome == true){
					table = table + '<th width="60">'+values[3]+'</th>';
					table = table + '<th width="70">'+values[4]+'</th>';
				}
				//table = table + '<th width="70">'+values[5]+'</th>';
				table = table + '<th width="70">'+values[6]+'</th>';
				table = table + '<th width="85">'+values[7]+'</th>';
				if(reference_genome == true){ //QTL
				table = table + '<th width="70">'+values[8]+'</th>';
                                }
				table = table + '<th width="220">'+values[9]+'</th>';
				table = table + '<th width="70">Select</th>';
				table = table + '</tr>';
				table = table + '</thead>';
				table = table + '<tbody class="scrollTable">';

				//this loop iterates over the full table and prints the
				//first n rows + the user provided genes
				//can be slow for large number of genes, alternatively server
				//can filter and provide smaller file for display
				for(var i=1; i<=results; i++) {
					var values = candidate_genes[i].split("\t");

					if(i>rows && values[7]=="no"){
						continue;
					}
		        	table = table + '<tr>';

				    //var appletQuery = 'OndexServlet?mode=network&list='+values[1]+'&keyword='+keyword;
				    //var gene = '<td><a href = "javascript:;" onClick="generateNetwork(\''+appletQuery+'\',null);">'+values[1]+'</a></td>';

//				    var gene = '<td><a href = "javascript:;" class="viewGeneNetwork" id="viewGeneNetwork_'+i+'">'+values[1]+'</a></td>';
				    var gene_Acc= values[1];
                                    var gene_Name= values[2]; // display both accession & gene name.
                                    // Fetch preferred concept (gene) name and use the shorter name out of the two.
                                /*    if(gene_Acc.length > gene_Name.length) {
                                       gene_Acc= gene_Name;
                                      }*/
                                    // gene_Name to display in Gene View table (under Accession).
                                    var gene = '<td><a href = "javascript:;" class="viewGeneNetwork" title="Display in the new KNETviewer" id="viewGeneNetwork_'+i+'">'+gene_Acc+'</a></td>';
				    var geneName = '<td>'+gene_Name+'</td>'; // geneName
                                    if(gene_Name.toLowerCase() === gene_Acc.toLowerCase()) {
                                       geneName = '<td></td>'; // don't display geneName, if identical to Accession
                                      }

				    if(multiorganisms == true){
						var taxid = '<td><a href="http://www.uniprot.org/taxonomy/'+values[5]+'" target="_blank">'+values[5]+'</a></td>';
					}else{
						var taxid = '';
					}
					if(reference_genome == true){
						var chr = '<td>'+values[3]+'</td>';
						var start = '<td>'+values[4]+'</td>';
					}else{
						var chr = '';
						var start = '';
					}
				    var score = '<td>'+values[6]+'</td>'; // score
				    var usersList = '<td>'+values[7]+'</td>'; // is it in user's list

				// QTL column with information box
				if(reference_genome == true) {
                                    var withinQTL = '<td>';
				    if(values[8].length > 1){
				    	var withinQTLs = values[8].split("||");
				    	//Shows the icons
				    	//a replace from dot to underline is necessary for html syntax
				    	//withinQTL = '<td><div class="qtl_item qtl_item_'+withinQTLs.length+'" title="'+withinQTLs.length+' QTLs"><span onclick="$(\'#qtl_box_'+values[1].replace(".","_")+withinQTLs.length+'\').slideDown(300);" style="cursor:pointer;">'+withinQTLs.length+'</span>';
				    	withinQTL = '<td><div class="qtl_item qtl_item_'+withinQTLs.length+'" title="'+withinQTLs.length+' QTLs"><a href"javascript:;" class="dropdown_box_open" id="qtl_box_open_'+values[1].replace(".","_")+withinQTLs.length+'">'+withinQTLs.length+'</a>';

				    	//Builds the evidence box
				    	//withinQTL = withinQTL+'<div id="qtl_box_'+values[1].replace(".","_")+withinQTLs.length+'" class="qtl_box" style="display:none"><a class="qtl_box_close" href="javascript:;" onclick="$(\'#qtl_box_'+values[1].replace(".","_")+withinQTLs.length+'\').slideUp(100);"></a>';
				    	withinQTL = withinQTL+'<div id="qtl_box_'+values[1].replace(".","_")+withinQTLs.length+'" class="qtl_box"><span class="dropdown_box_close" id="qtl_box_close_'+values[1].replace(".","_")+withinQTLs.length+'"></span>';


				    	withinQTL = withinQTL+'<p><span>'+"QTLs"+'</span></p>';

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
					    			withinQTL = withinQTL+'<p>'+ uniqueTraits[withinQTL_elements[1]] + ' ' + withinQTL_elements[1]+'</p>';
					    		}
				    		}
				    		else {
				    			if (unique.indexOf(withinQTL_elements[0] + ";") == -1) {
				    				unique = unique + withinQTL_elements[0] + ";";
					    			withinQTL = withinQTL+'<p>'+ uniqueQTLs[withinQTL_elements[0]] + ' ' + withinQTL_elements[0]+'</p>';
					    		}
				    		}
				    	}
				    }
				    else {
				    	withinQTL = withinQTL+'0';
				    }
				    withinQTL = withinQTL + '</td>';
                                  }
                                  else{
				       var withinQTL='';
                                      }

					// For each evidence show the images - start
					var evidence = '<td>';
					var values_evidence = values[9];
					var evidences = values_evidence.split("||");
					if(evidences.length >0){
						for (var count_i = 0; count_i < (evidences.length); count_i++) {
							//Shows the icons
							var evidence_elements = evidences[count_i].split("//");
							//evidence = evidence+'<div class="evidence_item evidence_item_'+evidence_elements[0]+'" title="'+evidence_elements[0]+'" ><span onclick="$(\'#evidence_box_'+values[1].replace(".","_")+evidence_elements[0]+'\').slideDown(300);" style="cursor:pointer;">'+((evidence_elements.length)-1)+'</span>';
                                                        if(evidence_elements[0] !== "Trait") {
							   evidence = evidence+'<div class="evidence_item evidence_item_'+evidence_elements[0]+'" title="'+evidence_elements[0]+'" ><span class="dropdown_box_open" id="evidence_box_open_'+values[1].replace(".","_")+evidence_elements[0]+'">'+((evidence_elements.length)-1)+'</span>';
                                                          }
                                                        else { // For Trait, display tooltip text as GWAS instead.
							   evidence = evidence+'<div class="evidence_item evidence_item_'+evidence_elements[0]+'" title="GWAS" ><span class="dropdown_box_open" id="evidence_box_open_'+values[1].replace(".","_")+evidence_elements[0]+'">'+((evidence_elements.length)-1)+'</span>';
                                                          }
							//Builds the evidence box
							//evidence = evidence+'<div id="evidence_box_'+values[1].replace(".","_")+evidence_elements[0]+'" class="evidence_box" style="display:none"><a class="evidence_box_close" href="javascript:;" onclick="$(\'#evidence_box_'+values[1].replace(".","_")+evidence_elements[0]+'\').slideUp(100);"></a>';
							evidence = evidence+'<div id="evidence_box_'+values[1].replace(".","_")+evidence_elements[0]+'" class="evidence_box"><span class="dropdown_box_close" id=evidence_box_close_'+values[1].replace(".","_")+evidence_elements[0]+'></span>';

                                                        if(evidence_elements[0] !== "Trait") {
							   evidence = evidence+'<p><div class="evidence_item evidence_item_'+evidence_elements[0]+'"></div> <span>'+evidence_elements[0]+'</span></p>';
                                                          }
                                                        else { // For Trait, display evidence box heading as GWAS instead.
							   evidence = evidence+'<p><div class="evidence_item evidence_item_'+evidence_elements[0]+'"></div> <span>GWAS</span></p>';
                                                          }
							for (var count_eb = 1; count_eb < (evidence_elements.length); count_eb++) {
								//link publications with pubmed
								pubmedurl = 'http://www.ncbi.nlm.nih.gov/pubmed/?term=';
								if(evidence_elements[0] == 'Publication')
									evidenceValue = '<a href="'+pubmedurl+evidence_elements[count_eb].substring(5)+'" target="_blank">'+evidence_elements[count_eb]+'</a>';
								else
									evidenceValue = evidence_elements[count_eb];

								evidence = evidence+'<p>'+evidenceValue+'</p>';
							}
							evidence = evidence+'</div>';
							evidence = evidence+'</div>';
						}
					}
					evidence = evidence+'</td>';
					// Foreach evidence show the images - end

				    var select = '<td><input id="checkboxGene_'+i+'" type="checkbox" name= "candidates" value="'+values[1]+'"></td>';
				    //table = table + gene + chr + start + end + score + withinQTL + usersList + evidence + select;
					table = table + gene + geneName + taxid + chr + start + score + usersList + withinQTL + evidence + select;
				    table = table + '</tr>';
				}
				table = table+'</tbody>';
		        table = table+'</table></div>';
		        table = table + '</form>';
    		}

    		//'<div id="networkButton"><input id="generateMultiGeneNetworkButton" class = "button" type = "button" value = "Show Network" onClick="generateMultiGeneNetwork(\''+keyword+'\');"></insert><div id="loadingNetworkDiv"></div></div>'+
    		table = table + '<div id="networkButton"><input id="new_generateMultiGeneNetworkButton" class = "button" type = "button" value = "View Network" title = "Display the network graph in the new KNETviewer">';
//    		table = table + '<input id="generateMultiGeneNetworkButton" class = "button" type = "button" value = "View in Ondex Web (requires Java)" title = "Display the network graph using the Ondex Web Java application"></insert><div id="loadingNetworkDiv"></div></div>';
    		// DISABLED below: Old Network View (via Ondex Web Java applet)
            //    table = table + '<a href="javascript:;" id="generateMultiGeneNetworkButton">View in Ondex Web<br>(requires Java)</a></insert><div id="loadingNetworkDiv"></div></div>';
                table = table + '</insert><div id="loadingNetworkDiv"></div></div>';

    		table = table + legendHtmlContainer; // add legend

    		document.getElementById('resultsTable').innerHTML = table;

    		// Reset no. of rows
            //    $("#numGenes").val(rows); // DISABLED on 03/03/2017 as was breaking GeneView table.

    		/*
    		 * click Handler for viewing a network.
    		 */
    		$(".viewGeneNetwork").bind("click", {x: candidate_genes}, function(e) {
    			e.preventDefault();
 	                // Preloader for the new Network Viewer (KNETviewer).
	                $("#loadingNetworkDiv").replaceWith('<div id="loadingNetworkDiv"><b>Loading Network, please wait...</b></div>');

    			var geneNum = $(e.target).attr("id").replace("viewGeneNetwork_","");
    			var values = e.data.x[geneNum].split("\t");
//    			generateNetwork('\OndexServlet?mode=network&list='+values[1]+'&keyword='+keyword, null);
                        // Generate Network using the new Network Viewer.
                        generateCyJSNetwork('\OndexServlet?mode=network&list='+values[1]+'&keyword='+keyword, null);
    		});

    		/*
    		 * click handlers for opening and closing the qtl and evidence column drop down boxes.
    		 */
    		$(".dropdown_box_open").click(function(e) {
    			e.preventDefault();
    			var targetname = $(e.target).attr("id").replace("open_","");
    			$("#"+targetname).slideDown(300);
        	});

        	$(".dropdown_box_close").click(function(e) {
    			e.preventDefault();
    			var targetname = $(e.target).attr("id").replace("close_","");
    			$("#"+targetname).slideUp(100);
        	});

        	$("#generateMultiGeneNetworkButton").click(function(e) {
        		generateMultiGeneNetwork(keyword);
        	});

                $("#new_generateMultiGeneNetworkButton").click(function(e) {
        		generateMultiGeneNetwork_forNewNetworkViewer(keyword);
        	});

    		$("#tablesorter").tablesorter({
    	        headers: {
    	            // do not sort "select" column
    	        	5: {sorter:"digit"},
    	            8: {sorter: false}
    	        }
    	    });

    		$("#numGenes").change(function(e){
    			printGenesTable(text);	//if number of genes to show changes redraw table.
    		});

    		/*
    		 * if select all targets is checked find all targets and check them.
    		 */
              /*$('input[name="chkusr"]').bind("click", {x: candidate_genes}, function(e) {
    			var numResults = candidate_genes.length-2;
    			for(var i=1; i<=numResults; i++){
	    			var values = e.data.x[i].split("\t");
	    			if(values[7] == "yes"){
	    				$("#checkboxGene_"+i).attr('checked', $(this).attr('checked'));
	    			}
    			}
    		});*/

    		/*
    		 * Select all KNOWN targets: find all targets with existing Evidence & check them.
    		 * Select all NOVEL targets: find all targets with no Evidence & check them.
    		 */
    		$('input:checkbox[name="checkbox_Targets"]').bind("click", {x: candidate_genes}, function(e) {
    			var numResults = candidate_genes.length-2;
    			for(var i=1; i<=numResults; i++){
	    			var values = e.data.x[i].split("\t");
	    			if(values[7] === "yes") {
                                  // console.log("Known/ Novel Targets chosen: "+ $(this).val());
//                                   console.log("Evidences: "+ values[9] +"; checked: "+ $(this).prop('checked'));
                                   // Check which checkbox button option was selected.
                                   if($(this).val() === "checkbox_Known") { // Select Known Targets.
				      if(values[9].length > 0) {
	    			         $("#checkboxGene_"+i).prop('checked', $(this).prop('checked'));
                                        }
                                     }
                                   else if($(this).val() === "checkbox_Novel") { // Select Novel Targets.
				           if(values[9].length === 0) {
	    			              $("#checkboxGene_"+i).prop('checked', $(this).prop('checked'));
                                             }
                                          }
	    			}
    			}
                        // update selected genes count
                        updateSelectedGenesCount();
    		});
                
                // bind click event on all candidate_genes checkboxes in Gene View table.
    		$('input:checkbox[name="candidates"]').click(function(e) {
                    updateSelectedGenesCount(); // update selected genes count
    		});
        }
	});
}

/*
 * Function
 *
 */
function containsKey(keyToTest, array){
	result = false;
	for(key in array) {
		if(key == keyToTest){
			result = true;
		}
	}
	return result;
}

 // update selected genes count whenever a Gene View table entry is clicked or Known/ Novel targets options are selected.
 function updateSelectedGenesCount() {
//     console.log("updateSelectedGenesCount check...");
  var count= $('input:checkbox[name="candidates"]:checked').length;
  $('#selectedGenesCount span').text(count +' gene(s) selected'); // update
 }

/*
 * Function
 *
 */
function createEvidenceTable(tableUrl){
	var table = "";
	$.ajax({
        url:tableUrl,
        type:'GET',
        dataType:'text',
        async: true,
        timeout: 1000000,
        error: function(){
        },
        success: function(text){
			var summaryArr = new Array();
			var summaryText = '';
    		var evidenceTable = text.split("\n");
			if(evidenceTable.length > 2) {
				table = '';
				table = table + '<p></p>';
//				table = table + '<p class="margin_left"><a href="'+tableUrl+'" target="_blank">Download as TAB delimited file</a></p><br />';
				table = table + '<div id="evidenceSummary"></div>';
				table = table + '<div class = "scrollTable">';
				table = table + '<table id="tablesorterEvidence" class="tablesorter">';
				table = table + '<thead>';
				table = table + '<tr>';
				var header = evidenceTable[0].split("\t");
//				table = table + '<th width="60">Actions</th>';
				table = table + '<th width="60">Exclude</th>';
				table = table + '<th width="50">'+header[0]+'</th>';
				table = table + '<th width="212">'+header[1]+'</th>'
				table = table + '<th width="78">'+header[2]+'</th>';
				table = table + '<th width="60">'+header[3]+'</th>';
				table = table + '<th width="103">'+header[4]+'</th>';
				table = table + '<th width="50">'+header[5]+'</th>';
				table = table + '</tr>';
				table = table + '</thead>';
				table = table + '<tbody class="scrollTable">';
				for(var ev_i=1; ev_i < (evidenceTable.length-1); ev_i++) {
					values = evidenceTable[ev_i].split("\t");
					table = table + '<tr>';
					//table = table + '<td><a href="javascript:;" onclick="excludeKeyword(\'ConceptID:'+values[6]+'\', \'evidence_exclude_'+ev_i+'\', \'keywords\')"><div id="evidence_exclude_'+ev_i+'" class="excludeKeyword" title="Exclude term"></div></a></td>';
					table = table + '<td><div id="evidence_exclude_'+ev_i+'" class="excludeKeyword evidenceTableExcludeKeyword" title="Exclude term"></div></td>';

					//link publications with pubmed
					pubmedurl = 'http://www.ncbi.nlm.nih.gov/pubmed/?term=';
					if(values[0] == 'Publication')
						evidenceValue = '<a href="'+pubmedurl+values[1].substring(5)+'" target="_blank">'+values[1]+'</a>';
					else
						evidenceValue = values[1];
                                        
					if(values[0] !== "Trait") {
                                          table = table + '<td type-sort-value="' + values[0] + '"><div class="evidence_item evidence_item_'+values[0]+'" title="'+values[0]+'"></div></td>';
                                          }
                                        else { // For Trait, display tooltip text as GWAS instead & also sort as GWAS.
					  table = table + '<td type-sort-value=GWAS"' + '"><div class="evidence_item evidence_item_'+values[0]+'" title="GWAS"></div></td>';
                                         }
					table = table + '<td>'+evidenceValue+'</td>';
					table = table + '<td>'+values[2]+'</td>';
					//table = table + '<td><a href="javascript:;" onclick="evidencePath('+values[6]+');">'+values[3]+'</a></td>';
					table = table + '<td><a href="javascript:;" class="generateEvidencePath" title="Display in the new KNETviewer" id="generateEvidencePath_'+ev_i+'">'+values[3]+'</a></td>';
					table = table + '<td>'+values[4]+'</td>'; // user genes
					table = table + '<td>'+values[5]+'</td>';
					table = table + '</tr>';
					//Calculates the summary box
					if (containsKey(values[0],summaryArr)){
						summaryArr[values[0]] = summaryArr[values[0]]+1;
					} else {
						summaryArr[values[0]] = 1;
					}
				}
				table = table + '</tbody>';
				table = table + '</table>';
				table = table + '</div>';
                                // Insert a preloader to be used for the new Network Viewer (KNETviewer).
				table = table + '<div id="loadingNetwork_Div"></div>';
				table = table + legendHtmlContainer;
//				'<div id="legend_picture"><div id="legend_container"><img src="html/image/evidence_legend.png" /></div></div>';

				$('#evidenceTable').html(table);

				$(".evidenceTableExcludeKeyword").bind("click", {x: evidenceTable}, function(e) {
					e.preventDefault();
					var targetID = $(e.target).attr("id");
					var evidenceNum = targetID.replace("evidence_exclude_","");
	    			var values = e.data.x[evidenceNum].split("\t");

					if($(e.target).hasClass("excludeKeyword")){
						excludeKeyword('ConceptID:'+values[6] , targetID, 'keywords');
					} else {
						excludeKeywordUndo('ConceptID:'+values[6] , targetID, 'keywords');
					}
				});

				/*
				 * click handler for generating the evidence path network
				 */
				$(".generateEvidencePath").bind("click", {x: evidenceTable}, function(e) {
	    			e.preventDefault();
	    			var evidenceNum = $(e.target).attr("id").replace("generateEvidencePath_","");
	    			var values = e.data.x[evidenceNum].split("\t");
	    			evidencePath(values[6]);
	    		});

				$("#tablesorterEvidence").tablesorter({
                    sortList: [[3,1]],  //sort by score in decending order
                    textExtraction: function(node) { // Sort TYPE column
                        var attr = $(node).attr('type-sort-value');
                        if (typeof attr !== 'undefined' && attr !== false) {
                            return attr;
                        }
                        return $(node).text();
                    }
                });
				//Shows the evidence summary box
				for(key in summaryArr){
					if (key !== "Trait") {
                                            summaryText = summaryText+'<div class="evidenceSummaryItem"><div class="evidence_item evidence_item_'+key+'" title="'+key+'"></div>'+summaryArr[key]+'</div>';
                                           }
                                         else { // For Trait, display tooltip text as GWAS instead.
                                            summaryText = summaryText+'<div class="evidenceSummaryItem"><div class="evidence_item evidence_item_'+key+'" title="GWAS"></div>'+summaryArr[key]+'</div>';
                                           }

				}

				$('#evidenceSummary').html(summaryText);
			}
		}
	})
}

/*
 * Function
 *
 */
function createSynonymTable(tableUrl){
	var table = "";
	$.ajax({
        url:tableUrl,
        type:'GET',
        dataType:'text',
        async: true,
        timeout: 1000000,
        error: function() {
	    table = "No suggestions found";	
	    $('#suggestor_terms').html(" ");
	    $('#suggestor_tables').html(table);
        },
        success: function(text){
			var summaryArr = new Array();
			var summaryText = '';
    		var evidenceTable = text.split("\n");
			var countSynonyms = 0;
			var aSynonyms = new Array();
			var countTerms = 0;
			var termName = "";
			var minRowsInTable = 20/*14*/;
			var nullTerm = false;
			if(evidenceTable.length > 3) {
				terms = '';
				table = '';
				for(var ev_i=0; ev_i < (evidenceTable.length-1); ev_i++) {
					if(nullTerm){
						nullTerm = false;
						continue;
					}
					//End of Term
					if(evidenceTable[ev_i].substr(0,2) == '</'){
						//Includes the tab box
						table =  table +tabsBox+'</div>';
						//Includes the tables
						for (var i = 0; i < aTable.length; i++) {

							if(aTableLenght[i] < minRowsInTable){
								for(var rows = aTableLenght[i]; rows < minRowsInTable ; rows++){
									aTable[i] = aTable[i] +'<tr><td>&nbsp;</td><td>&nbsp;</td></tr>'
								}
							}

						  table =  table + aTable[i]+'</table>';
						}
					//New Term
					}else if(evidenceTable[ev_i][0] == '<'){
						if(evidenceTable[ev_i+1].substr(0,2) == '</'){
							nullTerm = true;
							continue;
						}
						var aNewConcepts = new Array();
						var aTable = new Array();
						var aTableLenght = new Array();
						var countConcepts = 0;
						countTerms++;

						if(ev_i == 0){
							divstyle = "buttonSynonym_on";
							imgstatus = 'on';
							tabBoxvisibility = '';
						}else{
							divstyle = "buttonSynonym_off";
							imgstatus = 'off';
							tabBoxvisibility = 'style="display:none;"';
						}
						termName = evidenceTable[ev_i].replace("<","");
						var originalTermName = termName.replace(">","");
						termName = originalTermName.replace(/ /g, '_');
						termName = termName.replace(/"/g, '');
						//terms = terms + '<a href="javascript:;" onclick="showSynonymTable(\'tablesorterSynonym'+termName+(countConcepts+1)+'\',\'tabBox_'+termName+'\')"><div class="'+divstyle+'" id="tablesorterSynonym'+termName+(countConcepts+1)+'_buttonSynonym"><img src="html/image/synonym_left_'+imgstatus+'.png" class="synonym_left_border" id="tablesorterSynonym'+termName+(countConcepts+1)+'synonym_left_border"/>'+termName+'<img src="html/image/synonym_right_'+imgstatus+'.png" class="synonym_right_border"  id="tablesorterSynonym'+termName+(countConcepts+1)+'synonym_right_border"/></div></a>';	
						terms = terms + '<div class="'+divstyle+' synonymTabButton" id="tablesorterSynonym'+termName+'_'+(countConcepts+1)+'_buttonSynonym"><img src="html/image/synonym_left_'+imgstatus+'.png" class="synonym_left_border" id="tablesorterSynonym'+termName+'_'+(countConcepts+1)+'synonym_left_border"/>'+termName.replace(/_/g, " ")+'<img src="html/image/synonym_right_'+imgstatus+'.png" class="synonym_right_border"  id="tablesorterSynonym'+termName+'_'+(countConcepts+1)+'synonym_right_border"/></div>';	
//                                                console.log("synonymTable[] length= "+ evidenceTable.length +", \t ev_i= "+ ev_i +", termName: "+ termName);
						tabsBox = '<div class="tabBox" id="tabBox_'+termName+'" '+tabBoxvisibility+'>';
					//Foreach of Document that belongs to a Term
					}else {
						values = evidenceTable[ev_i].split("\t");
						//Check for duplicated values
						if(aSynonyms.indexOf(values[0]) == -1){
							aSynonyms.push(values[0]);
							countSynonyms++;
							//If is a new document type for the term a new table is created
							if(aNewConcepts.indexOf(values[1]) == -1){
								aNewConcepts.push(values[1]);
								conceptIndex = aNewConcepts.indexOf(values[1]);
								countConcepts++;

								if((countTerms == 1) && (countConcepts == 1))
									tablevisibility = '';
								else
									tablevisibility = 'style="display:none;"';

								//tableHeader = '<table id="tablesorterSynonym'+termName+countConcepts+'" class="suggestorTable" '+tablevisibility+'>';
								tableHeader = '<table id="tablesorterSynonym'+termName+'_'+countConcepts+'" class="suggestorTable" '+tablevisibility+'>';

								aTable.push(tableHeader);
								aTableLenght.push(0);

								if(countConcepts == 1)
									conceptTabStyles = 'conceptTabOn';
								else
									conceptTabStyles = 'conceptTabOff';

								if (values[1] == "QTL")
									//tabsBox = tabsBox + '<a href="javascript:;" onclick="showSynonymTab(\'tabBox_'+termName+'\',\'tabBoxItem_'+termName+countConcepts+'\',\'tablesorterSynonym'+termName+countConcepts+'\')"><div class="'+conceptTabStyles+'" id="tabBoxItem_'+termName+countConcepts+'" rel="tablesorterSynonym'+termName+countConcepts+'"><div class="evidence_item evidence_item_Phenotype" title="'+values[1]+'"></div></div></a>';
									tabsBox = tabsBox + '<div class="'+conceptTabStyles+' showConceptTab" id="tabBoxItem_'+termName+'_'+countConcepts+'" rel="tablesorterSynonym'+termName+'_'+countConcepts+'"><div class="evidence_item evidence_item_Phenotype" title="'+values[1]+'"></div></div>';
								else if (values[1] == "Trait")
									//tabsBox = tabsBox + '<a href="javascript:;" onclick="showSynonymTab(\'tabBox_'+termName+'\',\'tabBoxItem_'+termName+countConcepts+'\',\'tablesorterSynonym'+termName+countConcepts+'\')"><div class="'+conceptTabStyles+'" id="tabBoxItem_'+termName+countConcepts+'" rel="tablesorterSynonym'+termName+countConcepts+'"><div class="evidence_item evidence_item_TO" title="'+values[1]+'"></div></div></a>';
									tabsBox = tabsBox + '<div class="'+conceptTabStyles+' showConceptTab" id="tabBoxItem_'+termName+'_'+countConcepts+'" rel="tablesorterSynonym'+termName+'_'+countConcepts+'"><div class="evidence_item evidence_item_TO" title="'+values[1]+'"></div></div>';
								else
									//tabsBox = tabsBox + '<a href="javascript:;" onclick="showSynonymTab(\'tabBox_'+termName+'\',\'tabBoxItem_'+termName+countConcepts+'\',\'tablesorterSynonym'+termName+countConcepts+'\')"><div class="'+conceptTabStyles+'" id="tabBoxItem_'+termName+countConcepts+'" rel="tablesorterSynonym'+termName+countConcepts+'"><div class="evidence_item evidence_item_'+values[1]+'" title="'+values[1]+'"></div></div></a>';
									tabsBox = tabsBox + '<div class="'+conceptTabStyles+' showConceptTab" id="tabBoxItem_'+termName+'_'+countConcepts+'" rel="tablesorterSynonym'+termName+'_'+countConcepts+'"><div class="evidence_item evidence_item_'+values[1]+'" title="'+values[1]+'"></div></div>';

							}
							//If is not a new document type a new row is added to the existing table
							conceptIndex = aNewConcepts.indexOf(values[1]);
							row = '<tr>';
							row = row + '<td width="390">'+values[0]+'</td>'
							//row = row + '<td width="80"><a  href="javascript:;" onclick="addKeyword(\''+values[0]+'\', \'synonymstable_add_'+ev_i+'_'+countConcepts+'\', \'keywords\')"><div id="synonymstable_add_'+ev_i+'_'+countConcepts+'" class="addKeyword" title="Add term"></div></a> <a href="javascript:;" onclick="excludeKeyword(\''+values[0]+'\', \'synonymstable_exclude_'+ev_i+'_'+countConcepts+'\', \'keywords\')"><div id="synonymstable_exclude_'+ev_i+'_'+countConcepts+'" class="excludeKeyword" title="Exclude term"></div></a> <a href="javascript:;" onclick="replaceKeyword(\''+originalTermName+'\',\''+values[0]+'\', \'synonymstable_replace_'+ev_i+'_'+countConcepts+'\', \'keywords\')"><div id="synonymstable_replace_'+ev_i+'_'+countConcepts+'" class="replaceKeyword" title="Replace term"></div></a></td>';
							row = row + '<td width="80">';
							row = row + '<div id="synonymstable_add_'+ev_i+'_'+countConcepts+'" class="addKeyword synonymTableEvent" title="Add term"></div>';
							row = row + '<div id="synonymstable_exclude_'+ev_i+'_'+countConcepts+'" class="excludeKeyword synonymTableEvent" title="Exclude term"></div>';
							row = row + '<div id="synonymstable_replace_'+ev_i+'_'+countConcepts+'" class="replaceKeyword synonymTableEvent" title="Replace term"></div></td>';

							//row = row + '<th width="78"><div class="evidence_item evidence_item_'+values[1]+'" title="'+values[1]+'"></div></th>';
							//row = row + '<th width="60">'+values[2]+'</th>';
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
//                                console.log("suggestor_tables contents: ");
                                $('#suggestor_tables').children().each(function () {
                                  var elementID= $(this).attr('id');
                                  var elementHeight= $(this).height();
//                                  console.log(elementID +" height= "+ elementHeight);
                                  if(elementID.indexOf("tabBox_")>-1) {
                                     // Retain the height of tabBox elements (to be used as the minimum Table height).
                                     suggestorTabHeight= elementHeight;
                                    }
                                  else if(elementID.indexOf("tablesorterSynonym")>-1) {
                                          if(elementHeight < suggestorTabHeight) {
                                             // Increase this table's height.
                                             $(this).height(suggestorTabHeight+50);
//                                             console.log(elementID +" height was= "+ elementHeight +" , now= "+ $(this).height());
                                            }
                                         }
                                });

				$(".synonymTabButton").click(function(e) {
					var buttonID = $(e.currentTarget).attr("id").replace("_buttonSynonym", "");
					var termName = buttonID.replace("tablesorterSynonym","").split("_");
					termName.pop(); //remove conceptNumber element from array
					showSynonymTable(buttonID , "tabBox_"+termName.join("_"));
				});

				$(".showConceptTab").click(function(e){
					var buttonID = $(e.currentTarget).attr("id");
					var termName = buttonID.replace("tabBoxItem_","").split("_");
					var conceptNum = termName.pop(); //remove conceptNumber element from array
					termName = termName.join("_"); // recombine array
					showSynonymTab('tabBox_'+termName,buttonID, 'tablesorterSynonym'+termName+'_'+conceptNum);
				});

				$(".synonymTableEvent").bind("click", {x: evidenceTable}, function(e) {
					e.preventDefault();
					var currentTarget = $(e.currentTarget);
					var synonymNum = currentTarget.attr("id").replace("synonymstable_","").split("_")[1];
					var keyword = e.data.x[synonymNum].split("\t")[0];
//					var originalTermName = e.data.x[0].replace("<","").replace(">","");
                                        var originalTermName= $('.buttonSynonym_on').attr('id').replace("tablesorterSynonym","").replace("_1_buttonSynonym","").replace(/_/g," ");
//                                        console.log("original term: "+ originalTermName +", replace with keyword: "+ keyword);
					
					if(currentTarget.hasClass("addKeyword")){
						addKeyword(keyword, currentTarget.attr("id"), 'keywords');
					}
					else if(currentTarget.hasClass("addKeywordUndo")){
						addKeywordUndo(keyword, currentTarget.attr("id"), 'keywords');
					}
					else if(currentTarget.hasClass("excludeKeyword")){
						excludeKeyword(keyword, currentTarget.attr("id"), 'keywords');
					}
					else if(currentTarget.hasClass("excludeKeywordUndo")){
						excludeKeywordUndo(keyword, currentTarget.attr("id"), 'keywords');
					}
					else if(currentTarget.hasClass("replaceKeyword")){
						replaceKeyword(originalTermName, keyword, currentTarget.attr("id"), 'keywords');
					}
					else if(currentTarget.hasClass("replaceKeywordUndo")){
						replaceKeywordUndo(originalTermName, keyword, currentTarget.attr("id"), 'keywords');
					}

				});


			}else{
				table = "No suggestions found";	
				$('#suggestor_terms').html(" ");
				$('#suggestor_tables').html(table);
			}
		}
	})
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

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
