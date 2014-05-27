<?php
	function u_main(){
		echo 'No encontrado';exit;
	}

	function u_login(){
		include_once('inc.common.php');

		if($_POST){
			$ruta = '../db/'.$_POST['usuario'];
			if(!file_exists($ruta)){echo 'el usuario no existe';exit;}
			$pass = file_get_contents($ruta);
			if($_POST['pass'] !== $pass){echo 'la contraseña no es correcta';exit;}
			echo 'todo ha ido correctamente';exit;
		}

		common_renderTemplate('login');
	}

	function u_register(){
		include_once('inc.common.php');

		if($_POST){
			$ruta = '../db/'.$_POST['usuario'];
			$r = file_put_contents($ruta,$_POST['pass']);
			echo 'todo ha ido correctamente';exit;
		}

		common_renderTemplate('registro');
	}
