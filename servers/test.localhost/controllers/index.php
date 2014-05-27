<?php
	function index_main(){
		include_once('inc.common.php');
		common_renderTemplate('index');
	}

	function index_aa($usuario = false){
		include_once('inc.common.php');
		if($usuario){
			$GLOBALS['TEMPLATE']['mensaje'] = 'Hola '.$usuario.'!';
		}
		common_renderTemplate('aa');
	}
