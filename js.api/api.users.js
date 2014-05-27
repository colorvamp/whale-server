#!/usr/bin/env node

	var sqlite = require('../js.api/inc.sqlite3.bin.js');
	var table = {'_id_':'INTEGER AUTOINCREMENT','userMail':'TEXT NOT NULL UNIQUE','userPass':'TEXT NOT NULL','userWord':'TEXT NOT NULL',
	'userName':'TEXT NOT NULL','userRegistered':'TEXT NOT NULL','userIP':'TEXT','userLastLogin':'TEXT',
	'userBirthday':'TEXT','userGender':'TEXT','userNick':'TEXT UNIQUE','userWeb':'TEXT','userBio':'TEXT','userPhrase':'TEXT','userModes':'TEXT',
	'userStatus':'TEXT','userTags':'TEXT','userCode':'TEXT'};

var users = {
	save: function(data,params,cb){
		var 	passA = ['?','$','¿','!','¡','{','}'],
	    		passB = ['a','e','i','o','u','b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','y','z'],
			userWord = '';

		for(var a = 0; a < 4; a++){
			userWord += passA[Math.floor((Math.random() * passA.length))]+passB[Math.floor((Math.random() * passB.length))];
		}

		if(!data.id){
			var date = new Date();
			data.userWord = userWord;
			//FIXME: fecha de un solo digito
			data.userRegistered = date.getUTCFullYear()+'-'+date.getUTCMonth()+'-'+date.getUTCDate();
			data.userModes = ',regular,';
		}
		if(data.userPass){
			var shasum = require('crypto').createHash('sha1');
			shasum.update(data.userWord+data.userPass);
			data.userPass = shasum.digest('hex');
		}

		//FIXME: seguro que hay mejores nombres para esto
		sqlite.v.tables.users = table;
		sqlite.open('api.users.db',function(db){
			sqlite.exec(db,'BEGIN;',function(){
				sqlite.insertInto(db,'users',[data],function(ret){
					if(ret.errno){
						sqlite.close(db);
						console.log(ret);
						return false;
					}
					sqlite.exec(db,'COMMIT;',function(){
						sqlite.close(db);
					});
				});
			});
		});
	},
	getSingle: function(whereClause,params){
		if(!params){params = {};}
		params.dbfile = 'api.users.db';
		sqlite.getWhere('users',whereClause,params);
	},
	login: function(params){
		var whereClause = '';
		if(params.id){whereClause = '(id = '+params.id+')';}
		if(params.userMail){whereClause = '(userMail = \''+params.userMail+'\')';}
		if(!params.userPass){return params.cb(false);}
		if(!whereClause){return params.cb(false);}

		sqlite.getWhere('users',whereClause,{'dbfile':'api.users.db','limit':1,'cb':function(ret){
			if(!ret.length){return params.cb(false);}
			var user = ret.shift();
			user.userWord = new Buffer(user.userWord.replace(/\\[0-9]{3}/g,function(c){return String.fromCharCode(parseInt(c.substr(1),8));}),'ascii').toString('utf8');

			var shasum = require('crypto').createHash('sha1');
			shasum.update(user.userWord+params.userPass);
			var userPass = shasum.digest('hex');
			if(userPass != user.userPass){return params.cb(false);}

			//FIXME: api para leer cookies
			return params.cb(user);
		}});
	}
};

module.exports = users;
