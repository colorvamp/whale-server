<?php
	$GLOBALS['tables']['test'] = array('_id_'=>'INTEGER AUTOINCREMENT','data'=>'INTEGER NOT NULL');
	
	$d = microtime(1);
	include_once('../php.api/inc.sqlite3.php');
	$db = sqlite3_open('benchmark.php.db');
	sqlite3_exec('BEGIN;',$db);
	$i = 1;while($i < 10001){
		sqlite3_insertIntoTable('test',array('data'=>$i),$db);
		$i++;
	}
	sqlite3_close($db,true);
	echo round(microtime(1)-$d,2).PHP_EOL;
