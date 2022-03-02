
/*
 * Function to get the number of matches
 *
 */
function matchCounter() {
    var keyword = $('#keywords').val();

    $("#pGViewer_title").replaceWith('<div id="pGViewer_title"></div>'); // clear display msg
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
            }).fail(function (xhr,status,errorlog) {
                //$('#matchesResultDiv').html('<span class="redText">The KnetMiner server is currently offline. Please try again later.</span>');
                var server_error= JSON.parse(xhr.responseText); // full error json from server
                var errorMsg= server_error.statusReasonPhrase +" ("+ server_error.title +")";
                $('#matchesResultDiv').html('<span class="redText">'+errorMsg+'</span>');
                console.log(server_error.detail); // detailed stacktrace
            });
        } else {
            $('#matchesResultDiv').html('');
        }
    }
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
