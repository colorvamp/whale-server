var common = require(_api+'inc.common.js');
var fs = require('fs');

	var git = exports.controller = function(){};
	git.main = function(domain,commit){
		if(domain && commit){return this._controller.commit.apply(this,[domain,commit]);}
		if(domain){return this._controller.domain.apply(this,[domain]);}

		_template.PAGE = {TITLE:'Git - whale-server'};
		return common.template.render('git');
	};
	git.domain = function(domain){
		var	gitPath = false;
		if(!(gitPath = this._controller.helpers.getGitPath(domain))){
			return common.template.render('git');
		}

		try{var gitOB = require(_api+'inc.git.bin');}
		catch(err){return common.template.render('git/error.no.module');}

		if(global._post.hasOwnProperty('subcommand')){switch(global._post.subcommand){
			case 'git.init':
				var	git = new gitOB(gitPath);
				git.init(function(data){
					return common.r('http://google.es');
				});
				break;
		};return false;}

		_template.PAGE = {'TITLE':'Git - '+domain};
		if(!fs.existsSync(gitPath)){
			//FIXME: error 404 o lo que sea
			return common.template.render('git/init');
		}

		_template.commits = {'html':{'list':''}};

		var	git = new gitOB(gitPath),
			crypto = require('crypto'),
			i = 0;
		var 	commitMailSum = false,
			commitMail = false;

		git.log(function(commits){
			//console.log(commits);
			commits.forEach(function(commit,index){
				commitMail = (commit.commitAuthorMail) ? commit.commitAuthorMail : '';
				commitMailSum = crypto.createHash('md5').update(commitMail).digest('hex');
				_template.commits.html.list += common.template.load('git/snippets/commit.node',{'baseURL':_template.baseURL,'domainName':domain,'commitMessage':commit.commitMessage,'commitAuthor':commit.commitAuthorName,'commitMailSum':commitMailSum,'commitHash':commit.commitHash,'commitDateString':commit.commitDateString});
			});

			return common.template.render('domain');
		});

		return false;
	};
	git.commit = function(domain,commit){
		var	gitPath = false;
		if(!(gitPath = this._controller.helpers.getGitPath(domain))){
			return common.template.render('git');
		}

		_template.PAGE = {'TITLE':'Git - '+domain};
		if(!fs.existsSync(gitPath)){
			//FIXME: error 404 o lo que sea
			return common.template.render('git/init');
		}

		try{var gitOB = require(_api+'inc.git.bin');}
		catch(err){return common.template.render('git/error.no.module');}
		_template.PAGE = {'TITLE':'Git - '+domain+' - whale-server'};
		_template.commit = {'html':{'chunks':''}}

		var	git = new gitOB(gitPath);

		git.show(commit,function(commit){
			//console.log(commit);
			_template.commit.html.chunks = commit.commitDiff;
			return common.template.render('git/commit');
		});

		return false;
	};
	git.helpers = {
		getGitPath: function(domain){
			domain = domain.toString();
			var domainPath = __dirname+'/../../'+domain+'/';
			var gitPath = domainPath+'.git/';
			/* Validate domain */
			if(!domain || !fs.existsSync(domainPath)){return false;}
			return gitPath;
		}
	};
