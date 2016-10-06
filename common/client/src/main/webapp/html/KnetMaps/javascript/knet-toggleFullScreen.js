 // Full screen: Maximize/ Minimize overlay
 function OnMaximizeClick() {
     var cy_target= $('#cy').cytoscape('get');
     var currentEles_jsons= cy_target.elements().jsons();
     var currentStylesheet_json= cy_target.style().json(); //cy_target.style().json();
     if(!$('#knet-maps').hasClass('full_screen')) {
        $('#maximizeOverlay').attr('src', 'html/KnetMaps/image/minimizeOverlay.png'); // toggle image
  	// Maximize
        $('#knet-maps').addClass('full_screen');

	// reload the network
	load_reload_Network(currentEles_jsons, currentStylesheet_json/*, false*/);

	// toggle label visibility
	showHideLabels($('#changeLabelVisibility').val());
       }
       else {
        $('#maximizeOverlay').attr('src', 'html/KnetMaps/image/maximizeOverlay.png'); // toggle image
  	// Minimize
        $('#knet-maps').removeClass('full_screen');

        // reload the network
	load_reload_Network(currentEles_jsons, currentStylesheet_json/*, false*/);

	// toggle label visibility
	showHideLabels($('#changeLabelVisibility').val());
       }
  }
