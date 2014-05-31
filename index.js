#!/usr/bin/env node

	global.extend = function(destination,source){for(var property in source){destination[property] = source[property];}return destination;}
	global.Array.prototype.clean = function(deleteValue){for(var i = 0;i<this.length;i++){if(this[i] == deleteValue){this.splice(i,1);i--;}}return this;};
	global.Array.prototype.unique = function(){var u = {},a = [];for(var i = 0,l = this.length;i < l;++i){if(u.hasOwnProperty(this[i])){continue;}a.push(this[i]);u[this[i]] = 1;}return a;}
	global.$is = {
		empty: function(o){if(!o || ($is.string(o) && o == '') || ($is.array(o) && !o.length)){return true;}return false;},
		array: function(o){return (Array.isArray(o) || $type(o.length) === 'number');},
		string: function(o){return (typeof o == 'string' || o instanceof String);},
		object: function(o){return (o.constructor.toString().indexOf('function Object()') == 0);},
		element: function(o){return ('nodeType' in o && o.nodeType === 1 && 'cloneNode' in o);},
		function: function(o){return (o.constructor.toString().indexOf('function Function()') == 0);},
		formData: function(o){return (o.constructor.toString().indexOf('function FormData()') == 0);}
	};
	global.$type = function(obj){return typeof(obj);}
	global._api = __dirname+'/js.api/';

	global._post = {};
	global._template = {};

	var http = require('http'),
	fs = require('fs'),
	//path = require('path'),
	util = require('util'),
	exec = require('child_process').exec,
	spawn = require('child_process').spawn,
	cookie = require(_api+'inc.cookie'),
	whale = require('./whale.js').whale;

	global.owhale = require('./whale.js')._whale;

/*process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err+o);
});//*/

	/**** INI-LISTENER ****/
	var server = http.createServer(function(req,res){
		if(!req.headers || !req.headers.host){return whale.page.p400(res);}
		whale.parse.request(req);


var i = false;

		var host = whale.get.host();
		var _whale = new owhale(host);
		if(!fs.existsSync(_whale.path.controllers)){return whale.page.err(res);}
		var _headers = _whale.headers;
global._owhale = _whale;
_whale.res = res;
_whale.socket = req.socket;

		var _cookies = new cookie(req.headers.cookie);
_whale.cookies = _cookies;

		//console.log(_cookie.get());
		//console.log('URI: '+whale.get.uri());
		//console.log('REF: '+whale.get.referer());

		var _params = whale.get.uri();
		_params = _params.split('/').clean('');

		/*** INI-Static resources ***/
		var resources = false;
		if(_params[0] == 'r' && (resource = fs.realpathSync(_whale.path.base+_params.slice(1).join('/'))) && fs.existsSync(resource)){do{
			/* A domain can only access its own resources */
			if(resource.indexOf(_whale.path.base) < 0){break;}
			/* INI-Protected directories */
			if(resource.indexOf(_whale.path.controllers) > -1 || 
				resource.indexOf(_whale.path.views) > -1 ||
				resource.indexOf(_whale.path.api) > -1 || 
				resource.indexOf(_whale.path.db) > -1){break;}
			/* END-Protected directories */
			
			//console.log(resource);
			//console.log(_whale.path.base);

			i = resource.lastIndexOf('.');
			var ext = resource.substr(i+1);
			var mimetype = 'text/html';
			switch(ext){
				case 'js':mimetype = 'text/javascript';break;
				case 'css':mimetype = 'text/css';break;
				case 'png':mimetype = 'image/png';break;
				case 'gif':mimetype = 'image/gif';break;
				case 'ttf':case 'woff':case 'otf':case 'eot':mimetype = 'application/x-unknown-content-type';break;
			}
			var s = fs.createReadStream(resource);
			s.on('error',function(){whale.page.err(res);});
			s.once('fd',function(){res.writeHead(200,{'Content-Type':mimetype});});
			s.pipe(res);
			return false;
		}while(false);}
		/*** END-Static resources ***/

		/*** INI-Dispatcher ***/
		do{
			var controllerPath = false;
			var controllerExists = false;

			var controller = _params.shift();
			if(!controller){controller = 'index';}
			/* try js controllers first */
			controllerPath = _whale.path.controllers+controller+'.js';if(fs.existsSync(controllerPath)){break;}
			controllerPath = _whale.path.controllers+controller+'.php';if(fs.existsSync(controllerPath)){break;}
			/* index must exists always */
			if(controller == 'index'){return whale.page.err(res);}
			_params.unshift(controller);
			controller = 'index';
			controllerPath = _whale.path.controllers+controller+'.js';if(fs.existsSync(controllerPath)){break;}
			controllerPath = _whale.path.controllers+controller+'.php';if(fs.existsSync(controllerPath)){break;}
		}while(false);
		/*** END-Dispatcher ***/
		console.log(controllerPath);
		console.log(whale.get.uri());


		if(whale.get.method() == 'POST'){
			/* INI-Parse POST data */
			var data = '';
			req.on('data',function(chunk){data += chunk;});
			req.on('end',function(){
				var post = whale.parse.query(data);
				global._post = post;
				return decider();
			});
			return false;
			/* END-Parse POST data */
		}else{
			return decider();
		}


		function decider(){
			if(controllerPath.substr(-3) == '.js'){
				//FIXME: no siempre
				_template.baseURL = 'http://'+whale.get.host()+':'+whale.get.port()+'/';

				//FIXME: implementar timeout
				/* Javascript backend */
				try{
					var c = require(controllerPath);
					var command = _params.shift();
					if(!command){command = 'main';}
					if(!c.controller[command]){_params.unshift(command);command = 'main';}
					if(command == 'main' && !c.controller[command]){whale.page.err(res);}
					c.controller[command].apply({'_controller':c.controller},_params);
				}catch(err){
					console.log(err);
					whale.page.err(res);
				}
				delete require.cache[require.resolve(controllerPath)];
				delete require.cache[require.resolve(_api+'inc.common.js')];
				delete require.cache[require.resolve(_api+'inc.git.bin.js')];
				return false;//*/
				
			}else{
				var php = {
					params: (new Buffer(_params.join('/')).toString('base64')),
					headers: '{"SERVER_NAME":"'+host+'","SERVER_ADDR":"'+whale.get.ip()+'","SERVER_PORT":"'+whale.get.port()+'","REQUEST_URI":"'+whale.get.uri()+'","REMOTE_ADDR":"'+whale.get.ip()+'"}',
					post: JSON.stringify(whale.get.post()),
					get: JSON.stringify(whale.get.url().query),
					cookie: JSON.stringify(whale.get.cookie()),
					//vars: ' -d "register_argc_argv=On" -d "expose_php=Off" -d "output_buffering=10000" '
					vars: ' -c "'+_whale.path.node+'/php.api/php.ini" '
				}
				req.socket.write('HTTP/1.1');
				var cgi = spawn('php5-cgi',[
					'-C',
					'-c '+whale.path.node+'/php.api/php.ini',
					whale.path.node+'/php.php',
					controller,
					php.params,
					php.headers,
					php.cookie,
					php.post,
					php.get
				],{cwd:whale.path.base,encoding:'binary'});
				cgi.stdout.on('data',function(data){req.socket.write(Buffer(data,'binary'));});
				cgi.on('close',function(){req.socket.end();});
				return false;
			}
		}

	});
	server.listen(1337,'127.0.0.1');
	console.log('Server running at http://127.0.0.1:1337/');
