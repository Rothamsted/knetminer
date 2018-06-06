/* globals  module, require, -$ */

module.exports = function () {
  var config = {

    tmpDir: './.tmp/',

    // all the source files
    css: [ // ordering is important
    	'./css/knet-style.css',
    	'./css/jquery.qtip.min.css',
    	'./css/maskloader.css'
    	],
    js: ['./javascript/*.js','./config/url_mappings.js'],
    images: ['./image/*.png','./image_legend/*.png','./css/*.gif'],
    libs: [  // ordering is important
    	'./libs/jquery-1.11.2.min.js',
    	'./libs/jquery*.js',
    	'./libs/FileSaver.min.js',
    	'./libs/cytoscape.min.js',
    	'./libs/cytoscape-*.js',
    	],

    // the development output
  	build: './dist/',
    outputImages: './dist/img',
    outputCss: './dist/css',
    outputJs: './dist/js',

  };

  return config;
};
