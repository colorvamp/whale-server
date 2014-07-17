var fs = fs = require('fs');
var url = require('url');
var qs = require('querystring');
var events = require('events');

var whale1 = function(){
	var whale = this;
	this.v = {
		host: false,
		port: false,
		method: 'GET',
		ip: false,
		url: {},
		uri: '',
		post: false,
		cookie: {},
		referer: false,
	};
	this.page = {
		p400: function(res){res.writeHead(400);return res.end('<h1>Bad Request</h1>');},
		p404: function(res){
	
		},
		err: function(res){
			return res.end('<h1>Sorry, the page you are looking for cannot be found.</h1>');
		},
		ok: function(res){
			return res.end('<h1>It Works!.</h1>');
		}
	};
	this.set = {
		uri: function(uri){return (whale.v.uri = uri);}
	};
	this.get = {
		host: function(){return whale.v.host;},
		port: function(){return whale.v.port;},
		method: function(){return whale.v.method;},
		ip: function(){return whale.v.ip;},
		url: function(){return whale.v.url;},
		uri: function(){return whale.v.uri;},
		post: function(){return whale.v.post;},
		cookie: function(){return whale.v.cookie;},
		referer: function(){return whale.v.referer;}
	};
	this.parse = {
		request: function(data){
			var i = false;
			whale.v.host = data.headers['host'];
			whale.v.port = 80;
			if( (i = whale.v.host.indexOf(':')) > -1){whale.v.port = whale.v.host.substr(i+1);whale.v.host = whale.v.host.substr(0,i);}
			whale.v.ip = data.connection.remoteAddress || data.socket.remoteAddress || data.connection.socket.remoteAddress || data.headers['x-forwarded-for'];
			if(data.url){whale.parse.url(data.url)}
			if(data.headers.cookie){whale.parse.cookie(data.headers.cookie);}
			if(data.headers.referer){whale.v.referer = data.headers.referer;}
			if(data.method){whale.v.method = data.method;}
			whale.v.post = false;
		},
		url: function(data){
			var u = url.parse(data,true);
			whale.v.uri = u.pathname;
			return whale.v.url = u;
		},
		query: function(data){
			return whale.v.post = qs.parse(data);
		},
		header: function(data){
			//FIXME: hacerlo con chucks por si es demasiado grande, el indexOf sobre cada chunk
			var l = data.indexOf('\r\n\r\n');
			if(l < 10){return false;}
			var headers = data.substr(0,l+4);
			data = data.substr(l+4);
			var lines = headers.match(/[^:]+: [^\n]+\n/g);
			var count = lines.length;
			var headers = {},tmp = [],name = '',value = '';

			for(var i = 0;i < count;i++){
				q = lines[i].indexOf(':')
				name = lines[i].substr(0,q);
				value = lines[i].substr(q+1);
				headers[name.trim().toLowerCase()] = value.trim();
			}
			return headers;
		},
		cookie: function(data){
			var cookies = {},elem = false;
			var elems = data.replace(/;[ ]?/g,';').split(';');
			if($is.empty(elems)){return (whale.v.cookie = cookies);}

			var count = elems.length;
			for(var i = 0;i < count;i++){
				elem = elems[i].match(/([^=]*)=(.*)/);
				if(!elem){continue;}
				cookies[unescape(elem[1])] = unescape(elem[2]);
			}
			return (whale.v.cookie = cookies);
		}
	}
	this.php = {
		
	};
};
whale1.prototype.__proto__ = events.EventEmitter.prototype;



	var whale = function(host){
		this.path = {
			node: fs.realpathSync('./'),
			base: fs.realpathSync('./servers/'+host+'/')+'/'
		};
		this.path.controllers = this.path.base+'controllers/';
		this.path.views = this.path.base+'views/';
		this.path.api = this.path.base+'api/';
		this.path.db = this.path.base+'db/';
		this.header = new _header(this);
		this.server = new _server(this);
	};

	/*** INI-SERVER ***/
	var _server = function(p){
		extend(this,p);
	};
	_server.prototype.end = function(data){
		var 	cookies = _owhale.cookies.get('new'),
			i = 0;

		/* INI-Header */
		var headers = this.header.get();
		var code = (headers.status) ? headers.status : 200;
		//FIXME: el codigo de estatus
		var header = 'HTTP/1.1 '+code+' OK\r\n'+
		'Content-Type: text/html\r\n';
		for(i in cookies){
			header += 'set-cookie: '+escape(cookies[i].name)+'='+escape(cookies[i].value)+';Path=/\r\n';
		}
		for(i in headers){
			if(i == 'status'){continue;}
			header += i+': '+headers[i]+'\r\n';
		}
		header += '\r\n\r\n';
		delete headers;
		/* END-Header */

		_owhale.socket.write(header);
		if(data){_owhale.socket.write(data);}
		_owhale.socket.end();
	}
	/*** END-SERVER ***/

	/*** INI-HEADERS ***/
	_header = function(p){
		extend(this,p);
		this.headers = {};
	};
	_header.prototype.set = function(loc,code){
		var 	q = loc.indexOf(':'),
			name = loc.substr(0,q),
			value = loc.substr(q+1);

		if(!code){code = 302;}
		this.headers[name.trim().toLowerCase()] = value.trim();
		this.headers['status'] = code;
	};
	_header.prototype.get = function(){
		return this.headers;
	};
	/*** END-HEADERS ***/

module.exports._whale = whale;
module.exports.whale = new whale1();
