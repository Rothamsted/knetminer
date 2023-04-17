

// function collects keyword value, calls an ajax get request to generate keyword synonyms values and create synonym table
function refreshQuerySuggester() {
    $('#suggestor_terms').html('');

    // Create the Synonym table.

    var keyword = $('#keywords').val();

    var url = `${api_url}/synonyms?keyword=${keyword}`;

    $.get(url, '').done(function (data) {
        createSynonymTable(data.synonyms);
        $(".concept-selector").css("pointer-events","auto").attr('src', 'html/image/concept_active.png')
    }).fail(function (error) {
        console.log(error);
        $(".concept-selector").css("pointer-events","none").attr('src', 'html/image/concept.png')
    });
}

// function create synonym table runs if function refreshquerysuggester returns data from it's ajax get request call
function createSynonymTable(text){

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

        // function to add,exclude or totally replace keyword
        $(".addKeyword,.excludeKeyword,.replaceKeyword").click(function (e) {
            e.preventDefault();
            var currentTarget = $(e.currentTarget);
            var synonymNum = currentTarget.attr("id").replace("synonymstable_", "").replace("evidence_", "").split("_")[1];
            var keyword = evidenceTable[synonymNum].split("\t")[3];
            

            var originalTermName="";
            if(typeof $('.buttonSynonym_on').attr('id') !== "undefined") {
               originalTermName= $('.buttonSynonym_on').attr('id').replace("tablesorterSynonym", "").replace("tablesorterEvidence", "").replace("_1_buttonSynonym", "").replace(/_/g, " ");
              }

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

            var conceptKey = 'ConceptID:'+ keyword; 

            var currentClass = currentTarget.attr('class'); 
            
            if([ "addKeyword", "addKeywordUndo", "excludeKeyword" ].includes(currentClass))
              window[currentClass](conceptKey, currentTarget.attr("id"), 'keywords');
            else if ([ "excludeKeywordUndo", "replaceKeyword", "replaceKeywordUndo" ].includes(currentClass))
              window[currentClass](originalTermName,conceptKey, currentTarget.attr("id"), 'keywords');
            else
							// Shouldn't happen, but just in case.
							throw "Wrong attribute 'class' for createSynonymTable ('" + currentClass + "')";
        });


    } else {
        // table = "No suggestions found";
        // $('#suggestor_terms').html(" ");
        // $('#suggestor_tables').html(table);
        $(".concept-selector").css("pointer-events","none").attr('src', 'html/image/concept.png')
    }
}

// function create tables for synonyms on clicking the tab button 
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

// function creates synonyms tabs on clicking the concept side buttons
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

