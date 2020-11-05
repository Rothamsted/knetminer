
function activateSpinner(target) {
	// maskloader animation
	  $(target).maskLoader({
      // fade effect
      'fade': true,
      'z-index': '999',
      'background': '#F4F5F7',
      'opacity': '0.6',
      // position property
      'position': 'absolute',
      // custom loading spinner
      'imgLoader': false,
      // If false, you will have to run the "create" function.
      //  Ex: $('body').maskLoader().create(); 
      'autoCreate':true,
      // displayes text alert
      'textAlert':false
	  });
}

function deactivateSpinner(target) {
  $(target).maskLoader().destroy();
 }
