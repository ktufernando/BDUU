'use strict';

module.exports = {
	app: {
		title: 'BDUU',
		description: 'Base de Datos Unica de Usuarios de Provincia Net',
		keywords: 'Provincia Net'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'BDUU',
	tokenSecret: 'kTy6Copwqxj0wHCP5Ykt',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css'
			],
			js: [
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/angular-base64/angular-base64.js',
				'public/lib/angular-cookies/angular-cookies.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
