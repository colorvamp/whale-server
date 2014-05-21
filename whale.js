var url = require('url');
var qs = require('querystring');
var _whale = function(){
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
		cookie: function(){return whale.v.cookie;}
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
			if(data.method){whale.v.method = data.method;}
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
			var elems = data.replace(/;[ ]?/g,';').split(';');if($is.empty(elems)){return (whale.v.cookie = cookies);}
			var count = elems.length;
			for(var i = 0;i < count;i++){
				elem = elems[i].match(/([^=]*)=(.*)/);
				cookies[unescape(elem[1])] = unescape(elem[2]);
			}
			return (whale.v.cookie = cookies);
		}
	}
	this.php = {
		
	};
};

exports.whale = new _whale();
