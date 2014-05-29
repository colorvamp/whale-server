var git = require('../js.api/inc.git.bin');

var gitOB = new git('.git');
/*gitOB.branch(function(branches){
	//console.log(branches);
});
/*gitOB.log(function(data){
	console.log(data);
});*/
/*gitOB.show('4091ca3602564e3194853ac0607e4b49ffb73b82',function(data){
	console.log(data);
});*/
gitOB.tree(function(data){
	console.log(data);
});
console.log();
