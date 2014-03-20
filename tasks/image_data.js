/*
 * grunt-image-data
 * https://github.com/ssac/grunt-image-data
 *
 * Copyright (c) 2014 ssac
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var _     = require('lodash');
  var async = require('async');
  var path  = require('path');
  var PNG   = require('png-js');

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('image_data', 'convert image to JSON with canvas like object (property width, height and data)', function() {
    var done = this.async();
    var series = [];
    var task = this;
    var options = task.options();

    // // Merge task-specific and/or target-specific options with these defaults.
    // var options = this.options({
    //   punctuation: '.',
    //   separator: ', '
    // });

    // Iterate over all specified file groups.
    this.files.forEach( function (f) {

      // // Concat specified files.
      // var src = f.src.filter(function(filepath) {
      //   // Warn on and remove invalid source files (if nonull was set).
      //   if (!grunt.file.exists(filepath)) {
      //     grunt.log.warn('Source file "' + filepath + '" not found.');
      //     return false;
      //   } else {
      //     return true;
      //   }
      // }).map(function(filepath) {
      //   // Read file source.
      //   return grunt.file.read(filepath);
      // }).join(grunt.util.normalizelf(options.separator));

      // // Handle options.
      // src += options.punctuation;

      var srcPath = f.src[0];

      if (!grunt.file.exists(srcPath)) {
        grunt.log.warn('Source file "' + srcPath + '" not found.');
        return;
      }

      var destPath = f.dest;
      var srcExt = path.extname(srcPath).toLowerCase();

      //
      series.push( function (callback) {

        if (srcExt !== '.png') {
          return grunt.log.warn('Currently only support png format.');
        }

        var image = new PNG.load(srcPath);

        var obj = {
          width: image.width,
          height: image.height
        };

        PNG.decode(srcPath, function (pixels) {

          if (options.data) {
            obj.data = pixels;
          }

          if (options.transparencyList) {
            var list = '';

            for (var i = 3; i < pixels.length; i = i + 4) {
              if (pixels[i]) {
                list = list + '1';
              }
              else {
                list = list + '0';
              }
            }

            obj.transparencyList = list;
          }

          // Write the destination file.
          grunt.file.write(destPath, JSON.stringify(obj));

          // Print a success message.
          grunt.log.writeln('File "' + destPath + '" created.');
          callback();

        });
      });
    });

    async.series(series, done);
  });

};
