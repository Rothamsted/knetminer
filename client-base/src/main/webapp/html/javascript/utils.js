
// Map View
var genemap = GENEMAP.GeneMap({apiUrl: api_url}).width(800).height(550); // changed from 750x400 to 800x550
var knetmaps = KNETMAPS.KnetMaps();


/*
* Document ready event executes when the HTML document is loaded
* 	- add/remove QTL regions
* 	- advanced search
* 	- tooltips
*/
$(document).ready(
    function () {
        loadOnReady();
        showReferenceGenome();
        initResetButton();
        inputHandlers();
        QtlRegionHandlers();
        searchHandlers();
        bodyHandlers();
    });
