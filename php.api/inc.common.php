<?php
	function common_findKword($kword,$pool = false){if($pool == false){$pool = &$GLOBALS;}while(!isset($pool[$kword]) && ($b = strpos($kword,'_'))){$poolName = substr($kword,0,$b);$kword = substr($kword,$b+1);if(!isset($pool[$poolName])){return false;}$pool = &$pool[$poolName];}return (isset($pool[$kword])) ? $pool[$kword] : false;}
	$GLOBALS['replaceIteration'] = 0;
	function common_replaceInTemplate($blob,$pool = false,$reps = false){
		if($reps === false){$hasElems = preg_match_all('/{%[a-zA-Z0-9_\.]+%}/',$blob,$reps);if(!$hasElems){return $blob;}$reps = array_unique($reps[0]);}
		//if(isset($GLOBALS['debug'])){print_r($reps);exit;}
		$notFound = array();
		foreach($reps as $rep){$kword = substr($rep,2,-2);
			$word = common_findKword($kword,$pool);if($word === false){$notFound[] = $kword;continue;}$blob = str_replace($rep,$word,$blob);continue;}
		/* Una vez hecho el reemplazo, comprobamos si hay nuevas palabras a ser reemplazadas */
		$hasElems = preg_match_all('/{%[a-zA-Z0-9_\.]+%}/',$blob,$reps);if(!$hasElems){return $blob;}
		$reps = array_unique($reps[0]);
		$notFound = array_fill_keys($notFound,'');
		foreach($reps as $k=>$rep){$kword = substr($rep,2,-2);if(isset($notFound[$kword])){unset($reps[$k]);continue;}}
		if($GLOBALS['replaceIteration'] > 20){print_r($notFound);print_r($reps);exit;}
		if(count($reps)){$GLOBALS['replaceIteration']++;return common_replaceInTemplate($blob,$pool);}
		return $blob;
	}

	if(!defined('T')){define('T',"\t");}
	if(!defined('N')){define('N',"\n");}
	if(!defined('J')){define('J',"\t\t\t\t");}

	$GLOBALS['COMMON']['BASE'] = false;
	$GLOBALS['COMMON']['BUBBLES'] = array();
	$GLOBALS['COMMON']['TEMPLATEPATH'] = '../views/';
	$GLOBALS['OUTPUT'] = '';
	function common_renderTemplate($t = false){
		$TEMPLATE = &$GLOBALS['TEMPLATE'];
		if(!$GLOBALS['COMMON']['BASE']){$GLOBALS['COMMON']['BASE'] = 'base';}
		ob_start();include($GLOBALS['COMMON']['TEMPLATEPATH'].$t.'.php');$GLOBALS['MAIN'] = ob_get_contents();ob_end_clean();
		ob_start();include($GLOBALS['COMMON']['TEMPLATEPATH'].$GLOBALS['COMMON']['BASE'].'.php');$GLOBALS['OUTPUT'] = ob_get_contents();ob_end_clean();
		$GLOBALS['debug'] = false;
		$GLOBALS['TEMPLATE']['MAIN'] = $GLOBALS['MAIN'];
		$GLOBALS['TEMPLATE']['HTMLBUBBLEINFO'] = implode('',$GLOBALS['COMMON']['BUBBLES']);
		/* INI-BLOG_SCRIPT_VARS */
		$u = N;if(isset($TEMPLATE['BLOG_SCRIPT_VARS']) && count($TEMPLATE['BLOG_SCRIPT_VARS'])){foreach($TEMPLATE['BLOG_SCRIPT_VARS'] as $varName=>$varVal){$u .= T.T.$varName.' = '.json_encode($varVal).';'.N;}}
		$TEMPLATE['BLOG_SCRIPT_VARS'] = $u;
		if(isset($TEMPLATE['BLOG_SCRIPTS'])){$TEMPLATE['BLOG_SCRIPTS'] = array_map(function($n){return '<script type="text/javascript" src="'.$n.'"></script>';},$TEMPLATE['BLOG_SCRIPTS']);$TEMPLATE['BLOG_SCRIPTS'] = implode(N,$TEMPLATE['BLOG_SCRIPTS']);}
		/* END-BLOG_SCRIPT_VARS */
		/* INI-META */
		if(isset($TEMPLATE['META_OG_IMAGE'])){$TEMPLATE['META_OG_IMAGE'] = '<meta property="og:image" content="'.$TEMPLATE['META_OG_IMAGE'].'"/>';}
		/* END-META */
		$GLOBALS['OUTPUT'] = common_replaceInTemplate($GLOBALS['OUTPUT'],$GLOBALS['TEMPLATE']);
		$GLOBALS['OUTPUT'] = preg_replace('/{%[a-zA-Z0-9_\.]+%}/','',$GLOBALS['OUTPUT']);
		return $GLOBALS['OUTPUT'];
	}
	$GLOBALS['COMMON']['SNIPPETCACHE'] = array();
	function common_loadSnippet($s = false,$pool = false,$sname = false){
		$file = $GLOBALS['COMMON']['TEMPLATEPATH'].$s.'.php';
		if(!$sname){$sname = $s;}
		if(!isset($GLOBALS['COMMON']['SNIPPETCACHE'][$s])){
			if(!file_exists($file)){return false;}
			ob_start();$_PARAMS = $pool;include($file);$blob = ob_get_contents();ob_end_clean();
			$GLOBALS['COMMON']['SNIPPETCACHE'][$s] = $blob;
		}
		if(!isset($blob)){$blob = $GLOBALS['COMMON']['SNIPPETCACHE'][$s];}
		if($pool){$blob = common_replaceInTemplate($blob,$pool);}
		$GLOBALS['TEMPLATE']['SNIPPETS'][$sname] = $blob;
		return $GLOBALS['TEMPLATE']['SNIPPETS'][$sname];
	}
	function common_r($hash = '',$code = false){
		if(!$code){$code = 302;}
		if(substr($hash,0,4) == 'http'){header('Location: '.$hash,true,$code);exit;}
		header('Location: http://'.$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'].$hash,true,$code);exit;
	}
	function common_init(){
		if(!isset($GLOBALS['currentPage'])){$GLOBALS['currentPage'] = 1;}
		$userIsLogged = users_isLogged();
		//FIXME: debería estar en modes en la base de datos
		if($userIsLogged){
			$isPublisher = users_checkModes('publisher');
			$isAdmin = users_checkModes('admin');
		}

		$GLOBALS['TEMPLATE']['TOPMENU'] = 
		($userIsLogged  ? T.T.'<li><a href="{%baseURL%}u/'.$GLOBALS['user']['userNick'].'">Perfil</a></li>'.N : '').
		(!$userIsLogged ? T.T.'<li><a href="{%baseURL%}u/login">Login</a></li>'.N : '').
		(!$userIsLogged ? T.T.'<li><a href="{%baseURL%}u/register">Registro</a></li>'.N : '').
		($userIsLogged && $isPublisher ? T.T.'<li><a href="{%baseURL%}r/feather/">featherCMS</a></li>'.N : '').
		($userIsLogged && $isAdmin ? T.T.'<li><a href=\'{%baseURL%}r/ASSIS\'>ASSIS</a></li>'.N : '').
		($userIsLogged  ? T.T.'<li><a href=\'{%baseURL%}u/logout\'>Logout</a></li>'.N : '').
		($userIsLogged  ? T.T.'<li><img src="{%baseURL%}u/avatar/'.$GLOBALS['user']['userNick'].'-32.jpeg"></li>'.N : '').
		'';
	}

	function common_selectMenu($text,&$menu){$menu = preg_replace('/<li>(<a[^>]*>'.$text.'<\/a><\/li>)/','<li class=\'current\'>$1',$menu);}
	function common_loadUserInfo(){
		$GLOBALS['TEMPLATE']['HTMLUSERINFO'] = '';
		if(!$GLOBALS['userLogged']){return false;}
		$GLOBALS['TEMPLATE']['userName'] = str_replace(',',' ',$GLOBALS['userLogged']['userName']);
		$template = file_get_contents('../views/header_userInfo.php');
		$template = common_replaceInTemplate($template,$GLOBALS['TEMPLATE']);
		$GLOBALS['TEMPLATE']['HTMLUSERINFO'] = $template;
	}
?>
