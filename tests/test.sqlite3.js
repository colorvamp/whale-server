#!/usr/bin/env node

	var sqlite = require('../js.api/inc.sqlite3.bin.js');
	var table = {'_id_':'INTEGER AUTOINCREMENT','articleName':'TEXT NOT NULL'};
	var test = {'_id_':'INTEGER AUTOINCREMENT','data':'INTEGER NOT NULL'};
	sqlite.v.tables.aa = table;
	sqlite.v.tables.test = test;

	function insert(db,i){
		if(i > 10000){
			sqlite.exec(db,'COMMIT;',function(){
				sqlite.close(db);
				var diff = (new Date).getTime() - start;
				console.log(diff/1000);
			});
			return false;
		}
		sqlite.insertInto(db,'test',[{'data':i}],function(ret){
			insert(db,i+1);
		});
	};
	var start = (new Date).getTime();
	sqlite.open('benchmark.node.db',function(db){
		sqlite.exec(db,'PRAGMA synchronous = 0;BEGIN;',function(){
			insert(db,1);
		});
	});


	/*sqlite.getWhere('aa',1,{'dbfile':'prueba1.db','cb':function(ret){
		console.log(ret);
	}});//*/

/*	sqlite.open('prueba1.db',function(db){
		sqlite.getWhere('aa',1,{'db':db,'cb':function(ret){
			console.log(ret);
			sqlite.close(db);
		}});
	});//*/

/*	sqlite.open('prueba1.db',function(db){
		sqlite.insertInto(db,'aa',[{'articleName':'bbbb'}],function(ret){
			console.log(ret);
			sqlite.close(db);
		});
	});//*/

	/*sqlite.open('prueba1.db',function(db){
		sqlite.insertInto(db,'aa',[{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'},{'articleName':'bbbb'}],function(ret){
			console.log(ret);
			sqlite.close(db);
		});
	});//*/

/*	sqlite.open('prueba1.db',function(db){
		sqlite.createTable(db,'aa',table,function(ret){
			console.log(ret);
			sqlite.close(db);
		});
	});


/*	sqlite.open('prueba.db',function(db){
		sqlite.query(db,'SELECT * FROM inventory;',function(rows){
			console.log(rows);
			//sqlite.test(db);
			sqlite.close(db);
		});
	});
//*/

