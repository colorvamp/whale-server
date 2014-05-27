var common = module.require(_api+'inc.common.js');

function messages(){};
messages.main = function(){
	//_cookie.set('hola1','hola');
	//_cookie.set('hola2','hola');

	_template.BLOG = {TITLE:'aa'};
	common.template.render('index');
};
messages.bb = function(){
	_template.BLOG = {TITLE:'bb'};
	common.template.render('index');
};

exports.controller = messages;
