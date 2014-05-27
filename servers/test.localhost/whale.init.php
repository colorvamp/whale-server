<?php
	ini_set('display_errors',1);
	error_reporting(E_STRICT | E_ALL);
	chdir('PHP');
	$HERE_localhost = $GLOBALS['HERE.localhost'] = $_SERVER['SERVER_NAME'] == 'localhost';
	if(substr($_SERVER['SERVER_NAME'],0,7) == '192.168'){$HERE_localhost = $GLOBALS['HERE.localhost'] = true;}
	if($_SERVER['SERVER_ADDR'] == '127.0.0.1'){$HERE_localhost = $GLOBALS['HERE.localhost'] = true;}

