var common = require(_api+'inc.common.js');
var fs = require('fs');

function git(){};
git.main = function(domain){
	if(domain){return git.domain(domain);}
	_template.PAGE = {TITLE:'Git - whale-server'};

	return common.template.render('git');


	_template.servers = {html:{list:''}};
	//console.log(__dirname);

	/* Obtain all installed domains inside the server */
	var files = fs.readdirSync(__dirname+'/../../');
	for(var i = 0,l = files.length; i < l; i++){
		if(files[i] == 'admin.server'){continue;}
		_template.servers.html.list += common.template.load('servers/snippets/server.node',{domainName:files[i]});
	}

	common.template.render('git');
};
git.domain = function(domain){
	domain = domain.toString();
	var domainPath = __dirname+'/../../'+domain+'/';
	/* Validate domain */
	if(!domain || !fs.existsSync(domainPath)){
		//FIXME: error 404 o lo que sea
		return common.template.render('git');
	}

	try{var git = require('nodegit');}
	catch(err){return common.template.render('git/error.no.module');}

	_template.PAGE = {TITLE:'Git - '+domain+' - whale-server'};

	return common.template.render('git');
}

exports.controller = git;
