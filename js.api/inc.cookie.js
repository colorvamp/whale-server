
var cookie = function(data){
	this.cookieOBs = {};
	this.cookieNWs = {};
	if(data){this.parse(data);}
};
cookie.prototype.parse = function(data){
	this.cookieOBs = {},elem = false;
	var elems = data.replace(/;[ ]?/g,';').split(';');if($is.empty(elems)){return this.cookieOBs;}
	for(var i = 0,l = elems.length;i < l;i++){
		elem = elems[i].match(/([^=]*)=(.*)/);
		this.cookieOBs[unescape(elem[1])] = {'value':unescape(elem[2])};
	}
	return this.cookieOBs;
};
cookie.prototype.set = function(name,value,days){
	if(!days){days = 2;}
	var exdate = new Date();
	exdate.setDate(exdate.getDate()+days);
	this.cookieOBs[name] = {'name':name,'value':escape(value),'expires':exdate.toGMTString()};
	this.cookieNWs[name] = {'name':name,'value':escape(value),'expires':exdate.toGMTString()};
};
cookie.prototype.get = function(d){
	if(!d){return this.cookieOBs;}
	if(d == 'new'){return this.cookieNWs;}
};

module.exports = cookie;
