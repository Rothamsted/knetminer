

//this is a mock data section that will be replaced by the species API
// data will be generated as a variable through a function that calls the species api 
function getSpecieList(){
    $.get(multiSpecieUrl,'').done( function(data){
        var speciesInfos = data.species
        var createdDropDown = createDropdown(speciesInfos); 
        if(createdDropDown){
            multiSpeciesEvents(speciesInfos)
        }
    })
}

/*
 * Function inserts select element options to DOM 
 */

function createDropdown(speciesNames){
    var expectedOptions = speciesNames.length;
    for(var speciesName in speciesNames){
        var singleSpecie = speciesNames[speciesName]; 
        var optionElement = '<option value='+ singleSpecie.taxId+'>'+singleSpecie.scientificName+'</option>'
        $('.navbar-select').append(optionElement);
        if($('.navbar-select option').length === expectedOptions){
            var firstSpecies = $('.navbar-select').first();
            setApiUrl(firstSpecies.val()); 
            return true
        }
    }
}







