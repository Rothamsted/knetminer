var KNETMAPS = KNETMAPS || {};

KNETMAPS.MaskLoader = function() {

	var my = function() {};
	
	// Network loader (maskloader animation)
  my.showNetworkLoader = function(target) {
  // Show loader while the Network loads.
	  $(target).maskLoader({
      // fade effect
      'fade': true,
      'z-index': '999',
      'background': 'white',
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

 my.removeNetworkLoader = function(target) {
  // Remove Network loader.
  var maskloader = $(target).maskLoader();
  maskloader.destroy();
 }

 return my;
};
