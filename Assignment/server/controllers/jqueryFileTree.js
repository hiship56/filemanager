/**
*	jQuery File Tree Node.js Connector
*	Version 1.0
*	wangpeng_hit@live.cn
*	21 May 2014
*/
var config = require('../helper/_config.js');
var log_helper = require('../helper/log_helper.js');
var util_helper = require('../helper/util_helper.js');
var file_helper = require('../helper/file_helper.js');
var async = require('async');
var fs = require('fs');

module.exports.getDirList = function(request, response) {
	var dir = request.body.dir;
	var r = '<ul class="jqueryFileTree" style="display: none;">';
   	try {
       	r = '<ul class="jqueryFileTree" style="display: none;">';
		var files = fs.readdirSync(dir);
		files.forEach(function(f){
			var ff = dir + f;
			var stats = fs.statSync(ff);
            if (stats.isDirectory()) { 
                r += '<li class="directory collapsed"><a href="#" rel="' + ff  + '/">' + f + '</a></li>';
            } else {
            	var e = f.split('.')[1];
             	r += '<li class="file ext_' + e + '"><a href="#" rel='+ ff + '>' + f + '</a></li>';
            }
		});
		r += '</ul>';
	} catch(e) {
		r += 'Could not load directory: ' + dir;
		r += '</ul>';
	}
	response.send(r);
};