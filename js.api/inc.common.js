var fs = require('fs');
var common = {
	template: {
		iteration: 0,
		word: function(word,pool){
			if(!pool){pool = {};}
			var p = pool,s = false,b = -1;

			while(!p.hasOwnProperty(word) && (b = word.indexOf('.')) > -1){
				s = word.substr(0,b);
				word = word.substr(b+1);
				if(!p[s]){return false;}
				p = p[s];
			}
			return p.hasOwnProperty(word) ? p[word] : false;
		},
		replace: function(blob,pool,reps){
			if(!reps && !(reps = blob.match(/{%[a-zA-Z0-9_\.:]+%}/g))){return blob;}
			reps = reps.unique();

			var notFound = {};
			var word = false;
			var w = false;
			var re = false;
			for(var i = 0;i < reps.length;i++){
				word = reps[i].substr(2,reps[i].length-4);
				w = common.template.word(word,pool);
				if(w === false){pool[word] = '';continue;}
				re = new RegExp(reps[i],'g');
				blob = blob.replace(re,w);
			}

			/* Once replaced, check for new words to be replaced */
			reps = blob.match(/{%[a-zA-Z0-9_\.:]+%}/g);
			if(!reps){return blob;}
			reps = reps.unique();

			/* For security */
			if(common.template.iteration > 20){return blob;}
			common.template.iteration++;
			return common.template.replace(blob,pool,reps);
		},
		load: function(t,data){
			//FIXME: de momento .php
			if(t.substr(-3)){t += '.php';}
			var pool = (data) ? data : {};
			var file = _whale.path.views+t;
			if(!fs.existsSync(file)){return '';}
			var blob = fs.readFileSync(file);
			return common.template.replace(blob.toString(),pool);
		},
		render: function(t,callback){
			if(t.substr(-3)){t += '.php';}
			if(!callback){callback = function(blob){owhale.server.end(blob);};}
			var pool = (global._template) ? global._template : {};
			if(!pool.MAIN){pool.MAIN = false;}

			var b = 'base.php';
			var base = false;
			data = fs.readFile(_whale.path.views+t,'utf-8',function(err,data){
				pool.MAIN = data;
				if(base === false){return;}
				callback(common.template.replace(base,pool));
			});
			data = fs.readFile(_whale.path.views+b,'utf-8',function(err,data){
				base = data;
				if(err && err.errno == 34){base = true;return callback(common.template.replace('',pool));}
				if(pool.MAIN === false){return;}
				callback(common.template.replace(base,pool));
			});
			return true;
		}
	}
};

module.exports = common;
