/* globals  module, -$ */

module.exports = function () {
  var config = {
    temp: './.tmp/',

    // all the JavaScript files for this project
    alljs: ['./src/**/*.js', './*.js'],

    // all the less files for this project
    less: ['./src/less/*.less', '!./src/less/variables.less'],
  };

  return config;
};
