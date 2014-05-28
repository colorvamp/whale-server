var common = require(_api+'inc.common.js');
var fs = require('fs');

function index(){};
index.main = function(){
	_template.PAGE = {TITLE:'Home - whale-server'};
	_template.servers = {html:{list:''}};
	//console.log(__dirname);

	/* Obtain all installed domains inside the server */
	var files = fs.readdirSync(__dirname+'/../../');
	for(var i = 0,l = files.length; i < l; i++){
		if(files[i] == 'admin.server'){continue;}
		_template.servers.html.list += common.template.load('servers/snippets/server.node',{domainName:files[i]});
	}

	common.template.render('index');
};

exports.controller = index;
