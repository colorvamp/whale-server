var common = require(_api+'inc.common.js');
var fs = require('fs');

function git(){};
git.main = function(domain,commit){
	if(domain && commit){return git.commit(domain,commit);}
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
	var gitPath = domainPath+'.git/';
	/* Validate domain */
	if(!domain || !fs.existsSync(domainPath) || !fs.existsSync(gitPath)){
		//FIXME: error 404 o lo que sea
		return common.template.render('git');
	}


	try{var gitOB = require(_api+'inc.git.bin');}
	catch(err){return common.template.render('git/error.no.module');}
	_template.PAGE = {'TITLE':'Git - '+domain+' - whale-server'};
	_template.commits = {'html':{'list':''}};

	var	git = new gitOB(gitPath),
		crypto = require('crypto'),
		i = 0;
	var 	commitMailSum = false,
		commitMail = false;

	git.log(function(commits){
		console.log(commits);
		commits.forEach(function(commit,index){
			commitMail = (commit.commitAuthorMail) ? commit.commitAuthorMail : '';
			commitMailSum = crypto.createHash('md5').update(commitMail).digest('hex');
			_template.commits.html.list += common.template.load('git/snippets/commit.node',{'baseURL':_template.baseURL,'domainName':domain,'commitMessage':commit.commitMessage,'commitAuthor':commit.commitAuthorName,'commitMailSum':commitMailSum,'commitHash':commit.commitHash});
		});

		return common.template.render('git');
	});

	return false;
};
git.commit = function(domain,commit){
	domain = domain.toString();
	var domainPath = __dirname+'/../../'+domain+'/';
	var gitPath = domainPath+'.git/';
	/* Validate domain */
	if(!domain || !fs.existsSync(domainPath) || !fs.existsSync(gitPath)){
		//FIXME: error 404 o lo que sea
		return common.template.render('git');
	}

	try{var gitOB = require(_api+'inc.git.bin');}
	catch(err){return common.template.render('git/error.no.module');}
	_template.PAGE = {'TITLE':'Git - '+domain+' - whale-server'};
	_template.commit = {'html':{'chunks':''}}

	var	git = new gitOB(gitPath);

	git.show(commit,function(commit){
console.log(commit);
		_template.commit.html.chunks = commit.commitDiff;
		return common.template.render('git/commit');
	});

	return false;
};

exports.controller = git;
