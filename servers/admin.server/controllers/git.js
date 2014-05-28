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
	var gitPath = domainPath+'.git/';
	/* Validate domain */
	if(!domain || !fs.existsSync(domainPath) || !fs.existsSync(gitPath)){
		//FIXME: error 404 o lo que sea
		return common.template.render('git');
	}

	try{var git = require('nodegit');}
	catch(err){return common.template.render('git/error.no.module');}
	_template.PAGE = {'TITLE':'Git - '+domain+' - whale-server'};
	_template.commits = {'html':{'list':''}};

	var 	open = git.Repo.open;
	var 	crypto = require('crypto');
	var 	commitMailSum = false;

	// Open the repository directory.
	open(gitPath,function(err,repo){
		if(err){
			//FIXME: error 404 o lo que sea
			return common.template.render('git');
		}

		var count = 0;
		var onCommit = function(commit){
				// Disregard commits past 9.
				if(++count >= 9){
					return;
				}

				var author = commit.author();

				commitMailSum = crypto.createHash('md5').update(author.email()).digest('hex');
				_template.commits.html.list += common.template.load('git/snippets/commit.node',{'commitText':commit.message(),'commitAuthor':commit.author(),'commitMailSum':commitMailSum});

				// Show the commit sha.
				//console.log("commit " + commit.sha());

				// Display author information.
				//console.log("Author:\t" + author.name() + " <", author.email() + ">");

				// Show the commit date.
				//console.log("Date:\t" + commit.date());

				// Give some space and show the message.
				//console.log("\n    " + commit.message());
			};

		// Open the master branch.
		repo.getMaster(function(err,branch){
			if(err){
				//FIXME: error 404 o lo que sea
				return common.template.render('git');
			}

			// Create a new history event emitter.
			var history = branch.history();
			// Create a counter to only show up to 9 entries.
			// Listen for commit events from the history.
			history.on('commit',onCommit);
			history.on('end',function(err){
				return common.template.render('git');
			});

			// Start emitting events.
			history.start();
		});
	});
}

exports.controller = git;
