

//this is a mock data section that will be replaced by the species API
// data will be generated as a variable through a function that calls the species api 
// for example var species = getSpecieList()
var getSpeciesList = [
    {
        "name":"arabidopsis",
        "background": "./datasets/arabidopsis/client/background.jpg",
        "taxId": 3702
    }, 
    {
        "name":"wheat",
        "background": "./datasets/arabidopsis/client/background.jpg",
        "taxId": 4565
    }, 
    { 
        "name":"maize",
        "background": "./datasets/arabidopsis/client/background.jpg",
        "taxId": 4577
    }
]

/*
 * Function Generates Species information through Ensembl get request API
 */
function getEnsemblList(){
    // Ensembl REST API to fetch scientific and common name

    var speciesNames = []; 
    for(var i=0; i < getSpeciesList.length; i++){
         var EnsemblIdkey = getSpeciesList[i].taxId;

        $.get(taxnomyUrl+EnsemblIdkey+'?content-type=application/json','').done( function(data){
            speciesNames.push(data)
            // check if speciesNames length equals the specie mock data length 
            if(speciesNames.length === getSpeciesList.length ){
                specieInfo(speciesNames);
            }
        }).fail(function (xhr,status,errorlog){
            errorComponent('.nav',xhr,status,errorlog);
        });
    }
}

/*
 * Function takes data from getEnsemblList function, sends data to createDropdown function and create the specie information block
 */
function specieInfo(speciesNames){

    // variable returns a true to confirm if dropdown options have been created 
    var createdDropDown = createDropdown(speciesNames); 
    if(createdDropDown){
        // selecting the first occuring option element and setting global taxonomy ID
        // it's possible to make an element the default, as first child position is randomised because of the loop
        currentTaxId =  $('.navbar-select:first-child').val();
        var currentSpecieInfo = speciesNames.filter(specieInfo => specieInfo.id === currentTaxId)[0]; 
        $('<div class="specie_container"><h4 class="specie_title">Taxonomy Id:</h4><span id="specie_title">'+currentSpecieInfo.id+'</span></div>').appendTo('#speciename_container');
    
        $('<div class="specie_container"><h4 class="specie_title">Latin name:</h4><span id="specie_name">'+currentSpecieInfo.scientific_name+'</span></div>').appendTo('#speciename_container');
        var commonNames = currentSpecieInfo.tags.common_name.toString().replaceAll(',',', ')
        $('<div class="specie_container"><h4 class="specie_title">Common name:</h4><span id="specie_commonname">'+commonNames+'</span></div>').appendTo('#speciename_container');
    }
}

/*
 * Function inserts select element options to DOM 
 */
function createDropdown(speciesNames){
    var expectedOptions = speciesNames.length; 
    for(var speciesName in speciesNames){
        var singleSpecie = speciesNames[speciesName]; 
        var optionElement = '<option value='+ singleSpecie.id+'>'+singleSpecie.name +'</option>'
        $('.navbar-select').append(optionElement);
        if($('.navbar-select option').length === expectedOptions){
            return true
        }
    }
}







