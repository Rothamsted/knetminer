var knetmaps;
var genemaps;

$(document).ready(function () {


    setupApiUrls('/html/genepage.jsp')
        .then(function () {

            var urlParams = (new URL(window.location.href)).searchParams;

            var keywords = urlParams.get("keyword")
            keywords = keywords.replace("\"", "###");

            var list = urlParams.get('list').split(',');
            list = cleanGeneList ( list );
        
    
            $('.logo-top').attr('src', 'image/logo.svg');
            $('#exportBtns img').attr('src', 'image/Knetdownload.png');
            $('#search-gene').html(`${list.join(', ')}`)

            // conditionals address the case where keyword value is empty
            if (keywords !== '') {
                $('#search-keyword').html(keywords)
            } else {
                $('#keyword-section').hide();
            }
            getSpeciesInformation();
            generateCyJSNetwork(api_url + '/network', { keyword: keywords, list: list, exportPlainJSON: false }, true);
            loginUtilsInit();
            knetmaps = KNETMAPS.KnetMaps();
            $('#NetworkCanvas').show();
        }).catch(
            err => showApiInitResult(err)
        );

})

// function calls {api-url + /dataset-info} to get instance id
function getSpeciesInformation() {
    $.get(api_url + '/dataset-info', '').done(function (data) {
        console.log(data);
        var speciesInfo = data.id
        $('#search-taxid').html(speciesInfo);
    })
}