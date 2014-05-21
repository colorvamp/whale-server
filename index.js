#!/usr/bin/env node

	function extend(destination,source){for(var property in source){destination[property] = source[property];}return destination;}
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

	var http = require('http'),
	fs = require('fs'),
	util = require('util'),
	exec = require('child_process').exec,
	whale = require('./whale.js').whale;

	global._whale = whale;
	global._api = __dirname+'/js.api/';
	global._template = {};

	/**** INI-LISTENER ****/
	http.createServer(function(req,res){
		if(!req.headers || !req.headers.host){return whale.page.p400(res);}
		whale.parse.request(req);

var i = false;

		var host = whale.get.host();
		var path = global._whale.path = {
			node: fs.realpathSync('./'),
			base: './servers/'+host+'/',
			controllers: './servers/'+host+'/controllers/',
			views: './servers/'+host+'/views/',
			api: './servers/'+host+'/api/'
		};
global._whale.res = res;

		if(!fs.existsSync(path.controllers)){return whale.page.err(res);}
		var params = whale.get.uri();
		params = params.split('/').clean('');

		/*** INI-Static resources ***/
		var resources = false;
		if(params[0] == 'r' && (resource = path.base+params.slice(1).join('/')) && fs.existsSync(resource)){
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
		}
		/*** END-Static resources ***/

		/*** INI-Dispatcher ***/
		do{
			var controllerPath = false;
			var controllerExists = false;

			var controller = params.shift();
			if(!controller){controller = 'index';}
			/* try js controllers first */
			controllerPath = path.controllers+controller+'.js';if(fs.existsSync(controllerPath)){break;}
			controllerPath = path.controllers+controller+'.php';if(fs.existsSync(controllerPath)){break;}
			/* index must exists always */
			if(controller == 'index'){return whale.page.err(res);}
			params.unshift(controller);
			controller = 'index';
			controllerPath = path.controllers+controller+'.js';if(fs.existsSync(controllerPath)){break;}
			controllerPath = path.controllers+controller+'.php';if(fs.existsSync(controllerPath)){break;}
		}while(false);
		/*** END-Dispatcher ***/
		console.log(controllerPath);


var query = whale.get.url().query;
		if(whale.get.method() == 'POST'){
			/* INI-Parse POST data */
			var data = '';
			req.on('data',function(chunk){data += chunk;});
			req.on('end',function(){
				var post = whale.parse.query(data);
				return decider();
			});
			return false;
			/* END-Parse POST data */
		}else{
			return decider();
		}


		function decider(){
			if(controllerPath.substr(-3) == '.js'){
				_template.baseURL = 'http://'+whale.get.host()+'/';

				//FIXME: implementar timeout
				/* Javascript backend */
				try{
					var c = require(controllerPath);
					var command = params.shift();
					if(!command){command = 'main';}
					if(!c.controller[command]){params.unshift(command);command = 'main';}
					if(command == 'main' && !c.controller[command]){whale.page.err(res);}
					c.controller[command].apply(params);
				}catch(err){
					console.log(err);
					whale.page.err(res);
				}
				delete require.cache[require.resolve(controllerPath)];
				delete require.cache[require.resolve(_api+'inc.common.js')];
				return;
			}else{
				return php();
			}
		}

		function php(){
			/* If is a php controller, we should use launcher */
			//FIXME pasarlo a un helper
			var adr = req.connection.address();
			var phpParams = new Buffer(params.join('/')).toString('base64');
			var phpHeaders = '{"SERVER_NAME":"'+host+'","SERVER_ADDR":"'+adr.address+'","SERVER_PORT":"'+adr.port+'","REQUEST_URI":"'+whale.get.uri()+'","REMOTE_ADDR":"'+whale.get.ip()+'"}';
			var phpPost = JSON.stringify(whale.get.post());
			var phpCookie = JSON.stringify(whale.get.cookie());
			var phpVars = ' -d "register_argc_argv=On" -d "expose_php=Off" -d "output_buffering=10000" ';
			var phpVars = ' -c "'+path.node+'/php.api/php.ini" ';
			//FIXME: faltan POST y GET
			exec('cd "'+path.base+'" && php5-cgi -C '+phpVars+' "'+path.node+'/php.php" '+controller+' \''+phpParams+'\' \''+phpHeaders+'\' \''+phpCookie+'\' \''+phpPost+'\'',{encoding:'binary',maxBuffer:5000*1024},function(error,stdout,stderr){
				if(stdout && stdout.substr(0,7) == 'Status:'){
					var headers = whale.parse.header(stdout);
					if(headers){
						var status = (headers.status) ? parseInt(headers.status) : 200;
						delete headers.status;
						if(headers.location && status == 200){status = 302;}
						res.writeHead(status,headers);
						//FIXME:
						var l = stdout.indexOf('\r\n\r\n');
						if(l > 10){stdout = stdout.substr(l+4);}
					}
				}


				if(stdout && stdout.substr(0,21) == '{"errorDescription":"' && (i = JSON.parse(stdout))){
					console.log('Error on php launcher '+i.errorDescription);
					//FIXME: mejorar
					return whale.page.err(res);
				}

				//console.log('stdout: ' + stdout);
				//console.log('stderr: ' + stderr);
				if(error !== null) {
					console.log('exec error: ' + error);
				}

				/*var magic = new Buffer(stdout.substr(0,20),'binary');
				magic = magic.toString('hex').toUpperCase();
				switch(true){
					case magic.substr(0,4) == 'FFD8':res.writeHead(200,{'Content-Type':'image/jpeg','Content-Length':stdout.length});
				}*/
				//console.log(magic);

				return res.end(new Buffer(stdout,'binary'));
			});
		}

	}).listen(1337,'127.0.0.1');
	console.log('Server running at http://127.0.0.1:1337/');
