var exec = require('child_process').exec;

var git = function(dir){
	//FIXME: validar que es un repositorio git
	this.dir = dir;
};
git.prototype.branch = function(cb){
	function puts(error,stdout,stderr){
		var branches = [];
		stdout.replace(/[\* ] ([^\n]+)/g,function(p0,p1){branches.push(p1);});
		cb(branches);
	}
	exec('git --git-dir "'+this.dir+'" branch',puts);
};
git.prototype.log = function(cb,params){
	//FIXME: seguramente habría que hacerlo con spawn y un buffer mutable
	function puts(error,stdout,stderr){
		var 	commits = [],
			commit = {},
			author = {};

		stdout.replace(/commit ([^\n ]+)\n(Merge: ([^\n ]+) ([^\n ]+)\n|)Author: ([^\n]+)\nDate:[ ]+([^\n]+)\n\n[ ]+([^\n]*)\n/g,function(p0,pHash,p2,p3,p4,pAuthorString,p6,p7){
			commit = {'commitHash':pHash,'commitAuthorString':pAuthorString,'commitDateString':p6,'commitMessage':p7};
			author = pAuthorString.match(/([^<]+) <([^>]+)>/);
			if(author){commit.commitAuthorName = author[1];commit.commitAuthorMail = author[2];}
			if(p2){commit['commitMerge'] = [p3,p4];}
			commits.push(commit);
			//console.log(commit);
		});

		cb(commits);
	}
	exec('git --git-dir "'+this.dir+'" log -3',puts);
};
git.prototype.show = function(hash,cb,params){
	//FIXME: seguramente habría que hacerlo con spawn y un buffer mutable
	function puts(error,stdout,stderr){
		var 	commit = {},
			author = {};

		//stdout = stdout.replace(/commit ([^\n ]+)\ntree ([^\n ]+)\nparent ([^\n ]+)\nauthor: ([^\n]+) ([0-9]+ \+[0-9]+)\ncommiter: ([^\n]+) ([0-9]+ \+[0-9]+)\n.*?\n\n[ ]+([^\n]*)\n/g,function(p0,pHash,pTree,pParent,p2,p3,p4,pAuthorString,p6,p7){
		stdout = stdout.replace(/commit ([^\n ]+)\ntree ([^\n ]+)\nparent ([^\n ]+)\nauthor ([^\n]+) ([0-9]+ \+[0-9]+)\ncommitter ([^\n]+) ([0-9]+ \+[0-9]+)\n\n[ ]+([^\n]*)\n\n/g,function(p0,pHash,pTree,pParent,pAuthor,p1,pCommiter,p2,pMessage){
			commit = {'commitHash':pHash,'commitTree':pTree,'commitParent':pParent,'commitAuthorString':pAuthor,'commitCommiterString':pCommiter,'commitMessage':pMessage};
			author = pAuthor.match(/([^<]+) <([^>]+)>/);
			if(author){commit.commitAuthorName = author[1];commit.commitAuthorMail = author[2];}
			return '';
		});
		commit.commitDiff = stdout;
		cb(commit);
	}
	exec('git --git-dir "'+this.dir+'" show --pretty=raw '+hash,puts);
};

module.exports = git;
