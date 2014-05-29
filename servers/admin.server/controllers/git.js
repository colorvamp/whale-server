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
				_template.commits.html.list += common.template.load('git/snippets/commit.node',{'baseURL':_template.baseURL,'domainName':domain,'commitText':commit.message(),'commitAuthor':commit.author(),'commitMailSum':commitMailSum,'commitHash':commit.sha()});

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

	try{var git = require('nodegit');}
	catch(err){return common.template.render('git/error.no.module');}
	_template.PAGE = {'TITLE':'Git - '+domain+' - whale-server'};
	_template.commits = {'html':{'list':''}};

	var 	open = git.Repo.open;
	var 	crypto = require('crypto');
	var 	commitMailSum = false;


	git.Repo.open(gitPath, function(error, repo) {
  if (error) throw error;

  repo.getCommit(commit, function(error, commit) {
    if (error) throw error;

	_template.commit = {'html':{'chunks':''}}

    console.log('commit ' + commit.sha());
    console.log('Author:', commit.author().name() + ' <' + commit.author().email() + '>');
    console.log('Date:', commit.date());
    console.log('\n ' + commit.message());
//console.log(commit);

		    commit.getDiff(function(error, diffList) {
console.log(1);
		      if (error) throw error;
		      diffList.forEach(function(diff) {
			diff.patches().forEach(function(patch) {
				_template.commit.html.chunks += patch.oldFile().path()+' '+patch.newFile().path()+'\n';
			  console.log("diff", patch.oldFile().path(), patch.newFile().path());
			  patch.hunks().forEach(function(hunk) {
				_template.commit.html.chunks += hunk.header().trim()+'\n';
			    console.log(hunk.header().trim());
			    hunk.lines().forEach(function(line) {
				_template.commit.html.chunks += line.content.trim()+'\n';
				console.log(11);
			      console.log(String.fromCharCode(line.lineOrigin) + line.content.trim());
			    });
			  });
			});
		      });

			return common.template.render('git/commit');
		    });



  });
});

};

exports.controller = git;
