#!/usr/bin/env node

	var users = require('../js.api/api.users.js');

	/* Create user */
	//users.save({'userName':'marcos','userPass':'hola','userMail':'sombra2eternity@gmail.com',});

	users.login({'id':1,'userPass':'hola','cb':function(ret){
		console.log(ret);
	}});//*/
