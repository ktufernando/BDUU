'use strict';

module.exports = {
	db: 'mongodb://localhost/dbuu-dev',
    neo4j: {
        server: 'http://localhost:7474',
        endpoint: '/dbuu-dev'
    },
	app: {
		title: 'BDUU - Development Environment'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || '704618102959783',
		clientSecret: process.env.FACEBOOK_SECRET || '05ec9b0770eb287260e3076a4c5c69f8',
		callbackURL: 'https://dbuu-dev.provincianet.com.ar:3000/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'Glp4qKH8Lstwg7qXr04scf3Z3',
		clientSecret: process.env.TWITTER_SECRET || 'mQzxxzoG6dctTUaUXME7uSFf11NtOCR0UnykgARTdPenuQcbxD',
		callbackURL: 'http://dbuu-dev.provincianet.com.ar:3000/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '1016983519189-svippfprjqtl11j7q1dje99b6j8k1n2a.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'tm5VHdbL4eAJGe3PCIykpfPs',
		callbackURL: 'http://dbuu-dev.provincianet.com.ar:3000/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || '75fuvs6ezlixdb',
		clientSecret: process.env.LINKEDIN_SECRET || 'ZN7yKmlFvuxGa0eQ',
		callbackURL: 'http://dbuu-dev.provincianet.com.ar:3000/auth/linkedin/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'no-reply@provincianet.com.ar',
		options: {
			host: 'smtp.provincianet.com.ar',
            port: 25
		}
	}
};
