 // Network loader (maskloader animation)
 function showNetworkLoader() {
  // Show loader while the Network loads.
//  $('body').maskLoader({
//  $('#cy').maskLoader({
  $('#knet-maps').maskLoader({
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

 function removeNetworkLoader() {
  // Remove Network loader.
//  var maskloader = $('body').maskLoader();
//  var maskloader = $('#cy').maskLoader();
  var maskloader = $('#knet-maps').maskLoader();
  maskloader.destroy();
 }
