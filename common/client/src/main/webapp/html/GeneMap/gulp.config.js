/* globals  module, require, -$ */

module.exports = function () {
  var config = {

    // all the JavaScript files for this project
    alljs: ['./src/**/*.js', './*.js'],

    // all the source files
    less: ['./src/less/*.less', '!./src/less/variables.less'],
    html: './src/*.html',
    js: './src/js/*.js',
    data: './test/data/**/*.xml',

    // the development output
    outputDir: './dev/',
    outputCssDir: './dev/css/',
    outputCss: './dev/css/*.css',
    outputDataDir: './dev/data/',
    outputJsDir: './dev/js/',
    outputJs: './dev/js/*.js',

    // configuration
    bower: {
      json: require('./bower.json'),
      directory: './bower_components/',
      ignorePath: '../..',
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
