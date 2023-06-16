// function add and remove QTL region
// TODO: code quality, to be addressed when there is time:
// - all these names like *region* are too generic and don't convey what they are about, we
// should make them more homogeneous and mention either of chr, chromosome, chromosomeRegion or alike
// - we also need to review the files they belong, eg, there seem to be much stuff in this init-utils
// that isn't mainly about initialisation
// 
function createChromosomeRegion(){
      var chromrosomeRegionRows = $("#region_search_area table tr"); 

      var curMaxInput = chromrosomeRegionRows.length - 1;

      // if chromosome region row limit is reached
      if(chromrosomeRegionRows.length >= 7 ) return null



      $("#region_search_area tr:nth-child(2)")
        .clone()
        .insertAfter($("#region_search_area tr:last").prev())
        .attr('data-index', curMaxInput)
        .find("td:eq(0)")
        .find("select:eq(0)")
        .attr({
          id: "chr" + curMaxInput,
          name: "chr" + curMaxInput,
          onChange:"findChromosomeGenes(event)",
        })
        .parent()
        .parent()
        .find("td:eq(1)")
        .find("input:text:eq(0)")
        .attr({
          id: "start" + curMaxInput,
          name: "start" + curMaxInput,
          onKeyup:"findChromosomeGenes(event)",
        })
        .parent()
        .parent()
        .find("td:eq(2)")
        .find("input:text:eq(0)")
        .attr({
          id: "end" + curMaxInput,
          name: "end" + curMaxInput,
          onKeyup:"findChromosomeGenes(event)",
          oninput: "toggleRegionDeleteIcon(" + curMaxInput + ")",
        })
        .parent()
        .parent()
        .find("td:eq(3)")
        .find("input:text:eq(0)")
        .attr({
          id: "label" + curMaxInput,
          name: "label" + curMaxInput,
          oninput: "toggleRegionDeleteIcon(" + curMaxInput + ")",
        })
        .parent()
        .parent()
        .find("td:eq(4)")
        .find("input:text:eq(0)")
        .attr({
          class: "gene_count",
          id: "genes" + curMaxInput,
          name: "label" + curMaxInput,
          onfocus:"findChromosomeGenes(event)",
        })
        .parent()
        .parent()
        .find("td:eq(5)")
        .find("span:eq(0)")
        .attr({
          id: "delete" + curMaxInput,
        });
      emptyRegionInputs(curMaxInput);
      activateResetButton();
  
}


// function removes and empty gene regions
async function removeRegionRow(event) {
  activateResetButton();
  var currentElement = event.currentTarget;
  var regionRow = $(currentElement).parents("tr");
  var regionNumber = getChromosomeRegionIndex(currentElement)

    if ($("#region_search_area tr").length > 3) {
      // find current row and remove from DOM
    await regionRow.remove();
      // renumber the remaining rows
      resetRegion();
    } else {
      emptyRegionInputs(regionNumber);
    }

    if ($("#rows tr").length < 7) {
      $("#addRow").removeAttr("disabled");
    }
    return false;
}

// util function extracts number from genome region inputs Ids
// TODO: see comments in findGenes()
function getChromosomeRegionIndex(currentElement){
  // retrieves index from row data-index attribute
  const chr = currentElement.closest('tr').getAttribute("data-index");
  const regionNumber = chr.replace(/\D/g, '');
  return regionNumber
}

// function renumbers genome regions inputs when a row is removed
function resetRegion(){
  var regionInputs = getGenomeRegionRows(); 

  for (var genomeRegionIndex = 0; genomeRegionIndex < regionInputs.length; genomeRegionIndex++) {
      var regionElementArray = $(regionInputs[genomeRegionIndex]).children();
      var newOrder = genomeRegionIndex+1
      var [chromosome,start,end,label,Genes, cancel] = regionElementArray
      // change region table row data-index attributes
      $(regionInputs[genomeRegionIndex]).attr('data-index', `${newOrder}`)
      
      $(chromosome).children().attr('id',`chr${newOrder}`);
      $(start).children().attr('id',`start${newOrder}`);
      $(end).children().attr('id',`end${newOrder}`);
      $(label).children().attr('id',`label${newOrder}`);
      $(Genes).children().attr('id',`genes${newOrder}`);
      $(cancel).children().attr('id',`delete${newOrder}`);
  }
}

// util function returns all genome region rows
function getGenomeRegionRows(){
  var regionInputs = $('#regions_table > tbody').children();
  regionInputs = regionInputs.slice(1,-1); 
  return regionInputs
}

// util function removes genome region input row from the DOM
function removeGeneRow() {
  var geneRegions = $("#regions_table").find("tr");
  var removeableRegions = geneRegions.splice(2, geneRegions.length - 3);
  for (var i = 0; i < removeableRegions.length; i++) {
    removeableRegions[i].remove();
  }
}

// function toggles region delete icon triggered by oninput events and accepts region position value
function toggleRegionDeleteIcon(regionID) {
  var startInput = $("#start" + regionID).val(),
    endInput = $("#end" + regionID).val(),
    labelInput = $("#label" + regionID).val();
  if (startInput || endInput || labelInput !== "") {
    $("#delete" + regionID).show();
  } else if (startInput == '' && endInput == '' && labelInput == "") {
    $("#genes" + regionID).val('');
    if (regionID == 1) {
      $("#delete" + regionID).hide();
    }
  }
}

// util function take rowNumber of gene regions and reset all input fields
function emptyRegionInputs(rowNumber) {
  $("#chr" + rowNumber).attr("selectedIndex", 0);
  $("#start" + rowNumber).val("");
  $("#end" + rowNumber).val("");
  $("#label" + rowNumber).val("");
  $("#genes" + rowNumber).val("");
  if (rowNumber == 1) {
    $("#delete1").hide();
  }else{
    resetRegion();
  }
}

/*
 * Finds genes present in a chromosome region,
 * using the corresponding API.
 *
 */
function findChromosomeGenes(event) {
  var currentRowNumber = getChromosomeRegionIndex(event.currentTarget);
  var chromosome = $('#chr' + currentRowNumber).find(':selected').val();
  var start = $('#start' + currentRowNumber).val()
  var end = $('#end' + currentRowNumber).val()
  var genes = 'genes' + currentRowNumber; 

  // Some basic validation
  var isInputValid = isParameterNumber(start)
  isInputValid &= isParameterNumber(end)
  isInputValid &= start < end 
  isInputValid &= chromosome !== ''; 

  // The API call is pointless if the checks above fail
  if(!isInputValid) {
    $("#" + genes).val(0)
    return
  }

  var taxonomyID =  $('.navbar-select').children("option:selected").val(); 
  var keyword = chromosome + "-" + start + "-" + end;
  var request = '/countLoci?keyword='+keyword+'&taxId='+taxonomyID;
  var url = api_url + request;
    $.get(url, '').done(function (data) {
      $("#" + genes).val(data.geneCount)
    })
}
