<?php
	header('Status: 200 OK');
	$_POST = $_GET = $_COOKIE = $_SESSION = $_SERVER = array();
	$p = realpath(dirname(__FILE__)).'/';
	$controller = realpath('controllers/'.$argv[1].'.php');
	if(!file_exists($controller)){echo json_encode(array('errorDescription'=>'CONTROLLER_NOT_FOUND'));return false;}

	if(isset($argv[3]) && $argv[3] != 'false'){$_SERVER = json_decode($argv[3],1);}
	if(isset($argv[4]) && $argv[4] != 'false'){$_COOKIE = json_decode($argv[4],1);}
	if(isset($argv[5]) && $argv[5] != 'false'){$_POST = json_decode($argv[5],1);}
	if(isset($_COOKIE[session_name()])){
		//FIXME: no se yo la seguridad, comprobar ip supongo
		session_id($_COOKIE[session_name()]);
	}

	if(file_exists('whale.init.php')){include('whale.init.php');}
	include_once($controller);
	$params = isset($argv[2]) ? base64_decode($argv[2]) : 'main';
	$params = explode('/',$params);
	$controller = basename($controller,'.php');

	do{
//FIXME: hacer esto con node
		$command = $unshift = array_shift($params);
		if($command == NULL){$command = $controller.'_main';break;}

		$command = $controller.'_'.$command;if(function_exists($command)){break;}
		if(isset($unshift)){array_unshift($params,$unshift);}
		$command = $controller.'_main';if(function_exists($command)){break;}
		echo json_encode(array('errorDescription'=>'FUNCTION_NOT_FOUND'));return false;
	}while(false);

	register_shutdown_function(function(){
		$p = realpath(dirname(__FILE__)).'/';
		//var_dump($_SESSION);
		//print_r(headers_list());
	});

//FIXME: get
	$r = call_user_func_array($command,$params);
	//$headers = apache_request_headers();
//print_r($headers);
//exit;
//FIXME: get_headers
	if(isset($GLOBALS['OUTPUT']) && strlen($GLOBALS['OUTPUT'])){echo $GLOBALS['OUTPUT'];}
	exit;

