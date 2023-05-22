var knetmaps;
var genemaps;

$(document).ready(function () {


    setupApiUrls('/html/genepage.jsp')
        .then(function () {

            showApiInitResult ();

            var urlParams = (new URL(window.location.href)).searchParams;

            var keywords = urlParams.get("keyword")

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
            generateCyJSNetwork(api_url + '/network', { keyword: keywords, list: list, isExportPlainJSON: false }, true);
            loginUtilsInit();
            knetmaps = KNETMAPS.KnetMaps();
            $('#NetworkCanvas').show();
        }).catch(
            err => showApiInitResult(err)
        );

})

