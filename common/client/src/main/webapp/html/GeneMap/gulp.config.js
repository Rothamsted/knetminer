/* globals  module, require, -$ */

module.exports = function () {
  var config = {

    // all the JavaScript files for this project
    alljs: ['./src/**/*.js', './*.js'],

    // all the source files
    less: ['./src/less/*.less', '!./src/less/variables.less'],
    html: './src/*.html',
    js: './src/js/*.js',

    // the development output
    srcDir: './src/',
    outputCssDir: './.tmp/css/',
    outputCss: './.tmp/css/*.css',

    // configuration
    bower: {
      json: require('./bower.json'),
      directory: './bower_components/',
      ignorePath: '../bower_components/',
    },
  };

  config.getWiredepDefaultOptions = function () {
    var options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath,
    };

    return options;
  };

  return config;
};
