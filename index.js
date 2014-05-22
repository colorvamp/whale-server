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
	spawn = require('child_process').spawn,
	whale = require('./whale.js').whale;

	global._whale = whale;
	global._api = __dirname+'/js.api/';
	global._template = {};

	/**** INI-LISTENER ****/
	var server = http.createServer(function(req,res){
		if(!req.headers || !req.headers.host){return whale.page.p400(res);}
		whale.parse.request(req);
req.on('connect',function(rew,socket,head){
		console.log(1);
	});

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
/*req.socket.write('HTTP/1.1 200 Connection Established\r\n' +
                    'Proxy-agent: Node-Proxy\r\n' +
                    '\r\n6655hola');
return req.socket.end();
//*/


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
				return false;
			}else{
				var php = {
					params: (new Buffer(params.join('/')).toString('base64')),
					headers: '{"SERVER_NAME":"'+host+'","SERVER_ADDR":"'+whale.get.ip()+'","SERVER_PORT":"'+whale.get.port()+'","REQUEST_URI":"'+whale.get.uri()+'","REMOTE_ADDR":"'+whale.get.ip()+'"}',
					post: JSON.stringify(whale.get.post()),
					get: JSON.stringify(whale.get.url().query),
					cookie: JSON.stringify(whale.get.cookie()),
					//vars: ' -d "register_argc_argv=On" -d "expose_php=Off" -d "output_buffering=10000" '
					vars: ' -c "'+path.node+'/php.api/php.ini" '
				}
				var cgi = exec('cd "'+whale.path.base+'" && php5-cgi -C '+php.vars+' "'+whale.path.node+'/php.php" '+controller+' \''+php.params+'\' \''+php.headers+'\' \''+php.cookie+'\' \''+php.post+'\' \''+php.get+'\'',{maxBuffer:5000*1024});
				req.socket.write('HTTP/1.1');
				cgi.stdout.pipe(req.socket);
				cgi.on('exit',function(){req.socket.end();});
				return false;
			}
		}

	});
	server.listen(1337,'127.0.0.1');
	console.log('Server running at http://127.0.0.1:1337/');
